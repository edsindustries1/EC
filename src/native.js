/**
 * Native-only bootstrap. Imported from main.jsx; no-ops on the web.
 * Wires:
 *   - status bar style + colour
 *   - splash screen hide after React mounts
 *   - Android hardware back button → React Router history
 *   - tap haptics on primary CTAs (optional, opt-in via .haptic-tap)
 */
import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'
import { SplashScreen } from '@capacitor/splash-screen'
import { App as CapApp } from '@capacitor/app'

export function isNative() {
  return Capacitor?.isNativePlatform?.() ?? false
}

export function getPlatform() {
  return Capacitor?.getPlatform?.() ?? 'web'
}

export async function initNative() {
  if (!isNative()) return

  // Tag <body> so native-only CSS rules activate (see index.css .capacitor-native)
  document.body.classList.add('capacitor-native')
  document.body.classList.add(`capacitor-${getPlatform()}`)

  // ── Status bar — Edge-to-edge fullscreen ──────────────────────────────
  // WebView extends BEHIND the status bar (overlay: true). The React app
  // pushes content below the notch via env(safe-area-inset-top) so the
  // status bar icons stay legible. Same pattern Instagram + native iOS apps
  // use. Per-page pages with a dark hero override style via
  // useStatusBarStyle('dark') in src/native-ui.js.
  try {
    await StatusBar.setStyle({ style: Style.Dark })   // dark icons on light bg
    await StatusBar.setOverlaysWebView({ overlay: true })
    if (getPlatform() === 'android') {
      // On Android, transparent bg so the WebView's color shows through
      await StatusBar.setBackgroundColor({ color: '#00000000' })
    }
  } catch (err) {
    console.warn('[native] status bar setup failed:', err)
  }

  // ── Splash ────────────────────────────────────────────────────────────
  // Give the React tree one frame to mount, then fade the splash out.
  requestAnimationFrame(async () => {
    try {
      await SplashScreen.hide({ fadeOutDuration: 250 })
    } catch (err) {
      console.warn('[native] splash hide failed:', err)
    }
  })

  // ── Android hardware back button ──────────────────────────────────────
  if (getPlatform() === 'android') {
    CapApp.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack && window.history.length > 1) {
        window.history.back()
      } else {
        // At root — exit app
        CapApp.exitApp()
      }
    })
  }

  // ── App URL handling (deep links, future use) ─────────────────────────
  CapApp.addListener('appUrlOpen', (event) => {
    // Example: everywheretransfers://reservation/EC-ABC1234
    // For now, just log — implement deep link routing when we publish a
    // universal links / app links config.
    console.log('[native] app opened with URL:', event.url)
  })
}
