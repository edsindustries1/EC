import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiBell, FiVolume2, FiVolumeX, FiExternalLink } from 'react-icons/fi'
import api from '../utils/api'

const BLACK = '#000', WHITE = '#fff'
const GRAY_50 = '#F6F6F6', GRAY_100 = '#EEEEEE', GRAY_500 = '#6B6B6B'
const POLL_MS = 15000
const LAST_SEEN_KEY = 'ec:notifications:last_seen'
const SOUND_KEY = 'ec:notifications:sound'

function timeAgo(iso) {
  if (!iso) return ''
  const d = new Date(iso).getTime()
  const s = Math.max(1, Math.floor((Date.now() - d) / 1000))
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const days = Math.floor(h / 24)
  return `${days}d ago`
}

// Tiny built-in "ding" using Web Audio API — no asset to load
function ding() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.connect(g); g.connect(ctx.destination)
    o.type = 'sine'
    o.frequency.setValueAtTime(880, ctx.currentTime)
    o.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.18)
    g.gain.setValueAtTime(0.0, ctx.currentTime)
    g.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.32)
    o.start()
    o.stop(ctx.currentTime + 0.34)
  } catch {}
}

export default function NotificationBell() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [open, setOpen] = useState(false)
  const [lastSeen, setLastSeen] = useState(() => {
    try { return localStorage.getItem(LAST_SEEN_KEY) || '' } catch { return '' }
  })
  const [soundOn, setSoundOn] = useState(() => {
    try { return localStorage.getItem(SOUND_KEY) !== 'off' } catch { return true }
  })
  const wrapRef = useRef(null)
  const newestSeenRef = useRef(lastSeen)
  const firstLoadRef = useRef(true)
  const notifPermRequestedRef = useRef(false)

  // Close on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  // Ask for browser notification permission once
  const ensureNotifPermission = () => {
    if (notifPermRequestedRef.current) return
    notifPermRequestedRef.current = true
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {})
    }
  }

  const fireDesktopNotifications = (newOnes) => {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
    newOnes.slice(0, 3).forEach((it) => {
      try {
        const n = new Notification(it.title, {
          body: `${it.subtitle}\n${it.meta}`,
          tag: it.id,
          silent: !soundOn,
        })
        n.onclick = () => { window.focus(); navigate(it.link); n.close() }
      } catch {}
    })
  }

  // Poll loop
  useEffect(() => {
    let cancelled = false
    let timer = null

    const tick = async () => {
      try {
        const { data } = await api.get('/notifications/recent?limit=20')
        if (cancelled) return
        const fetched = data?.data?.items || []
        setItems(fetched)

        // detect new since lastSeen
        const lastSeenTs = newestSeenRef.current ? new Date(newestSeenRef.current).getTime() : 0
        const newOnes = fetched.filter(it => new Date(it.created_at).getTime() > lastSeenTs)

        // On first load, do not fire desktop notifications for old items.
        if (!firstLoadRef.current && newOnes.length > 0) {
          if (soundOn) ding()
          fireDesktopNotifications(newOnes)
        }
        firstLoadRef.current = false
      } catch {
        // silently ignore — could be 401 (logged out) or network blip
      } finally {
        if (!cancelled) timer = setTimeout(tick, POLL_MS)
      }
    }
    tick()
    return () => { cancelled = true; if (timer) clearTimeout(timer) }
  }, [soundOn])

  const unreadCount = items.filter(it => {
    if (!lastSeen) return true
    return new Date(it.created_at).getTime() > new Date(lastSeen).getTime()
  }).length

  const openMenu = () => {
    ensureNotifPermission()
    setOpen(true)
    if (items[0]?.created_at) {
      const newest = items[0].created_at
      setLastSeen(newest)
      newestSeenRef.current = newest
      try { localStorage.setItem(LAST_SEEN_KEY, newest) } catch {}
    }
  }

  const toggleSound = (e) => {
    e.stopPropagation()
    setSoundOn(v => {
      const next = !v
      try { localStorage.setItem(SOUND_KEY, next ? 'on' : 'off') } catch {}
      return next
    })
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <button
        onClick={() => (open ? setOpen(false) : openMenu())}
        aria-label="Notifications"
        style={{
          position: 'relative',
          background: 'transparent',
          border: 0,
          padding: 8,
          borderRadius: 999,
          color: BLACK,
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 150ms ease',
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = GRAY_50}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <FiBell size={20} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 4, right: 4,
            minWidth: 16, height: 16, padding: '0 4px',
            background: '#ef4444', color: WHITE,
            borderRadius: 999,
            fontSize: 10, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `2px solid ${WHITE}`,
            lineHeight: 1,
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 8px)',
          width: 360, maxHeight: 480, overflow: 'auto',
          background: WHITE,
          borderRadius: 8,
          boxShadow: '0 10px 30px -10px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.06)',
          zIndex: 70,
        }}>
          <div style={{
            padding: '14px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderBottom: `1px solid ${GRAY_100}`,
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: BLACK }}>Activity</div>
            <button
              onClick={toggleSound}
              aria-label={soundOn ? 'Mute sound' : 'Unmute sound'}
              style={{
                background: GRAY_50, border: 0,
                padding: 6, borderRadius: 6,
                color: BLACK, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 11, fontWeight: 600,
              }}
              title={soundOn ? 'Sound on' : 'Sound off'}
            >
              {soundOn ? <FiVolume2 size={12}/> : <FiVolumeX size={12}/>}
              {soundOn ? 'Sound on' : 'Muted'}
            </button>
          </div>

          {items.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: GRAY_500, fontSize: 13 }}>
              No activity yet. New bookings and quote requests will appear here.
            </div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {items.map((it) => {
                const isUnread = !lastSeen || new Date(it.created_at).getTime() > new Date(lastSeen).getTime()
                return (
                  <li key={it.id}>
                    <button
                      onClick={() => { navigate(it.link); setOpen(false) }}
                      style={{
                        width: '100%', textAlign: 'left',
                        padding: '12px 16px',
                        background: isUnread ? '#fafafa' : WHITE,
                        border: 0,
                        borderBottom: `1px solid ${GRAY_100}`,
                        cursor: 'pointer',
                        display: 'flex', gap: 10, alignItems: 'flex-start',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = GRAY_50}
                      onMouseLeave={(e) => e.currentTarget.style.background = isUnread ? '#fafafa' : WHITE}
                    >
                      <span style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: isUnread ? '#ef4444' : 'transparent',
                        marginTop: 6, flexShrink: 0,
                      }}/>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6, alignItems: 'center' }}>
                          <span style={{
                            fontSize: 10, fontWeight: 700,
                            textTransform: 'uppercase', letterSpacing: '0.08em',
                            padding: '2px 6px', borderRadius: 4,
                            background: it.kind === 'booking' ? '#000' : '#EEEEEE',
                            color: it.kind === 'booking' ? '#fff' : '#000',
                          }}>
                            {it.kind === 'booking' ? 'Booking' : 'Quote'}
                          </span>
                          <span style={{ fontSize: 11, color: GRAY_500 }}>{timeAgo(it.created_at)}</span>
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: BLACK, marginTop: 4 }}>{it.title}</div>
                        <div style={{ fontSize: 13, color: GRAY_500, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.subtitle}</div>
                        <div style={{ fontSize: 12, color: GRAY_500, marginTop: 2 }}>{it.meta}</div>
                      </div>
                      <FiExternalLink size={13} style={{ color: GRAY_500, flexShrink: 0, marginTop: 4 }}/>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}

          <div style={{ padding: '10px 16px', textAlign: 'center', borderTop: `1px solid ${GRAY_100}` }}>
            <button
              onClick={() => { navigate('/operator/activity'); setOpen(false) }}
              style={{ background: 'transparent', border: 0, color: BLACK, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              View all activity →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
