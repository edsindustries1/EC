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

  // ── Status bar ────────────────────────────────────────────────────────
  // Capacitor API: Style.Dark = DARK icons (for LIGHT backgrounds).
  // The previous setup used Style.Light here, which produced WHITE icons
  // on a white background — invisible. Pages with a dark hero (Home)
  // override this via useStatusBarStyle('dark') in src/native-ui.js.
  try {
    await StatusBar.setStyle({ style: Style.Dark })
    if (getPlatform() === 'android') {
      await StatusBar.setBackgroundColor({ color: '#FFFFFF' })
      await StatusBar.setOverlaysWebView({ overlay: false })
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
