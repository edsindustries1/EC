// usage: node audit.js <outDir> [label]
const { chromium } = require('playwright')
const fs = require('fs'); const path = require('path')
const OUT = process.argv[2]; const LABEL = process.argv[3] || 'run'
const BASE = 'http://localhost:4173'
const API = 'https://app-server-production-cb90.up.railway.app/api'
const DEVICES = [
  { name: 'se', w: 375, h: 667, top: 20, bottom: 0 },
  { name: 'iphone15', w: 393, h: 852, top: 59, bottom: 34 },
  { name: 'promax', w: 430, h: 932, top: 59, bottom: 34 },
  { name: 'android360', w: 360, h: 800, top: 24, bottom: 0, android: true },
]
const q = 'from=JFK%20Terminal%204&to=350%20Fifth%20Avenue%2C%20New%20York%2C%20NY%2010118&date=2026-12-01&time=10:00&pax=2&trip=oneway'
const PAGES = [
  ['home', '/'], ['verify', '/verify'], ['login', '/login'], ['signup', '/signup'],
  ['search', '/search?' + q], ['booktrip', '/book-trip/sedan?' + q],
  ['reservation', '/reservation/EC-GMR8263', true], ['myrides', '/my-rides', true],
  ['profile', '/profile', true], ['postride', '/post-ride', true], ['quote', '/quote'],
  ['fleet', '/fleet'], ['services', '/services'], ['privacy', '/privacy'], ['howitworks', '/how-it-works'],
  ['airport', '/services/airport-transfers'], ['route', '/transfers/jfk-to-manhattan'],
]
;(async () => {
  fs.mkdirSync(OUT, { recursive: true })
  const login = await (await fetch(API + '/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'customer@test.com', password: 'customer123' }) })).json()
  const browser = await chromium.launch()
  const report = []
  for (const d of DEVICES) {
    const ctx = await browser.newContext({ viewport: { width: d.w, height: d.h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
      userAgent: d.android ? 'Mozilla/5.0 (Linux; Android 14; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Mobile Safari/537.36'
                           : 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148' })
    await ctx.addInitScript(({ android, token, user }) => {
      if (android) window.androidBridge = { postMessage() {} }
      else window.webkit = { messageHandlers: { bridge: { postMessage() {} } } }
      try { sessionStorage.setItem('et:splash:seen-v3', '1') } catch {}
      try { if (!localStorage.getItem('__init')) { localStorage.setItem('__init', '1') } } catch {}
      window.__setAuth = (on) => { if (on) { localStorage.setItem('token', token); localStorage.setItem('user', JSON.stringify(user)) } else { localStorage.removeItem('token'); localStorage.removeItem('user') } }
      const want = new URL(location.href).searchParams.get('__auth')
      window.__setAuth(true)
    }, { android: !!d.android, token: login.token, user: login.user })
    for (const [name, url, auth] of PAGES) {
      const page = await ctx.newPage()
      const cdp = await ctx.newCDPSession(page)
      try { await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: { top: d.top, bottom: d.bottom, left: 0, right: 0 } }) } catch (e) { if (name === 'home') console.log('safe-area override unsupported', e.message) }
      await page.goto(BASE + url, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {})
      await page.waitForTimeout(900)
      const m = await page.evaluate(() => {
        const vw = window.innerWidth
        const root = document.getElementById('root')
        const off = []
        for (const el of document.querySelectorAll('body *')) {
          const r = el.getBoundingClientRect()
          if (r.width === 0 || r.height === 0) continue
          if (r.right > vw + 1 || r.left < -1) {
            // skip if clipped by an overflow ancestor within viewport
            let p = el.parentElement, clipped = false
            while (p && p !== document.body) { const s = getComputedStyle(p); if (/(hidden|auto|scroll|clip)/.test(s.overflowX) && p.id !== 'root') { const pr = p.getBoundingClientRect(); if (pr.right <= vw + 1 && pr.left >= -1) { clipped = true; break } } p = p.parentElement }
            if (!clipped) off.push(`${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}.${(el.className && el.className.baseVal === undefined ? String(el.className) : '').split(' ').slice(0,2).join('.')} [${Math.round(r.left)}..${Math.round(r.right)}] "${(el.innerText||'').slice(0,30).replace(/\n/g,' ')}"`)
          }
        }
        const smallInputs = [...document.querySelectorAll('input,select,textarea')].filter(e => e.type !== 'hidden' && e.offsetParent).map(e => [e.tagName.toLowerCase() + (e.type ? ':' + e.type : '') + (e.name ? '[' + e.name + ']' : '') + (e.placeholder ? '{' + e.placeholder.slice(0, 20) + '}' : ''), parseFloat(getComputedStyle(e).fontSize)]).filter(x => x[1] < 16)
        const fixedInTransform = [...document.querySelectorAll('body *')].filter(e => getComputedStyle(e).position === 'fixed').filter(e => { let p = e.parentElement; while (p && p !== document.body) { const s = getComputedStyle(p); if (s.transform !== 'none' || /transform/.test(s.willChange) || s.filter !== 'none') return true; p = p.parentElement } return false }).map(e => e.tagName + '.' + String(e.className).slice(0, 30))
        const st = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sat') || 0)
        return { vw, docW: document.documentElement.scrollWidth, rootW: root ? root.scrollWidth : 0, rootClientW: root ? root.clientWidth : 0, native: document.body.className, off: off.slice(0, 12), offCount: off.length, smallInputs, fixedInTransform }
      })
      const file = `${LABEL}-${d.name}-${name}.png`
      await page.screenshot({ path: path.join(OUT, file) })
      report.push({ device: d.name, page: name, ...m })
      await page.close()
    }
    await ctx.close()
  }
  await browser.close()
  fs.writeFileSync(path.join(OUT, `${LABEL}-report.json`), JSON.stringify(report, null, 1))
  for (const r of report) {
    const issues = []
    if (r.rootW > r.rootClientW + 1 || r.docW > r.vw + 1) issues.push(`HOVERFLOW root=${r.rootW}/${r.rootClientW} doc=${r.docW}/${r.vw}`)
    if (r.offCount) issues.push(`offscreen(${r.offCount}): ${r.off.slice(0, 4).join(' | ')}`)
    if (r.smallInputs.length) issues.push(`small inputs: ${JSON.stringify(r.smallInputs)}`)
    if (r.fixedInTransform.length) issues.push(`fixed-in-transform: ${r.fixedInTransform.join(',')}`)
    console.log(`${r.device.padEnd(10)} ${r.page.padEnd(12)} ${r.native.includes('capacitor-native') ? 'N' : 'W'} ${issues.join(' ; ') || 'ok'}`)
  }
})()
