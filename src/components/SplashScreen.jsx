/**
 * Uber-style animated splash screen — 3.0s cinematic sequence.
 *
 * Coordinated with the native splash so there's no white flash during
 * the hand-off: capacitor.config.json sets backgroundColor=#000 and
 * ios/App/App/Assets.xcassets/Splash.imageset is a black image with
 * a centred white "ET" — visually identical to this React splash, so
 * the user sees one continuous black screen even though two splashes
 * are involved (native → React).
 *
 * Timing (3.0s total):
 *   0.00 – 0.95s   "ET" monogram fades in + scales 0.86 → 1.0 + lifts
 *   0.55 – 1.30s   "EVERYWHERE TRANSFERS" wordmark slides in
 *   0.85 – 1.55s   "Premium chauffeur service" tagline slides in
 *   1.55 – 2.50s   gentle hold (subtle breathing scale on the ET)
 *   2.50 – 3.00s   crossfade out, content fades in
 *
 * Native cold launches always replay it (sessionStorage clears per
 * app launch on iOS). Same-session navigation does NOT re-trigger.
 * Honors prefers-reduced-motion.
 */
import React, { useEffect, useState } from 'react'
import { isNative } from '../native'

const HOLD_MS = 2500       // splash visible duration before fade-out
const FADE_MS = 500        // crossfade into the app
const SESSION_KEY = 'et:splash:seen-v2'

const SplashScreenGate = ({ children }) => {
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window === 'undefined') return false
    if (sessionStorage.getItem(SESSION_KEY) === '1') return false
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduced) return false
    return true
  })
  const [fading, setFading] = useState(false)

  useEffect(() => {
    if (!showSplash) return

    // Hide the native splash immediately so the React splash owns the
    // timing. Native + React use the same black/white assets, so the
    // user perceives one continuous splash.
    if (isNative()) {
      import('@capacitor/splash-screen').then(({ SplashScreen }) => {
        SplashScreen.hide({ fadeOutDuration: 0 }).catch(() => {})
      }).catch(() => {})
    }

    const fadeT = setTimeout(() => setFading(true), HOLD_MS)
    const doneT = setTimeout(() => {
      setShowSplash(false)
      try { sessionStorage.setItem(SESSION_KEY, '1') } catch {}
    }, HOLD_MS + FADE_MS)

    return () => { clearTimeout(fadeT); clearTimeout(doneT) }
  }, [showSplash])

  return (
    <>
      {showSplash && <Splash fading={fading} />}
      <div style={{
        opacity: showSplash && !fading ? 0 : 1,
        transition: `opacity ${FADE_MS}ms cubic-bezier(0.16, 1, 0.3, 1)`,
      }}>
        {children}
      </div>
    </>
  )
}

function Splash({ fading }) {
  return (
    <div
      role="status"
      aria-label="Loading Everywhere Transfers"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: '#000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fading ? 0 : 1,
        transition: `opacity ${FADE_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif",
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* ET monogram. Fades in + scales + lifts during entrance.
          During the hold, a gentle breathing animation (1.5% scale) keeps
          it from feeling frozen. */}
      <div
        style={{
          color: '#fff',
          fontSize: 'clamp(108px, 30vw, 200px)',
          fontWeight: 800,
          letterSpacing: '-0.04em',
          lineHeight: 1,
          animation:
            'et-mono-in 950ms cubic-bezier(0.16, 1, 0.3, 1) both, ' +
            'et-breath 3200ms 950ms ease-in-out infinite',
        }}
      >
        ET
      </div>

      <div
        style={{
          marginTop: 28,
          color: 'rgba(255,255,255,0.95)',
          fontSize: 'clamp(15px, 3.5vw, 19px)',
          fontWeight: 700,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          animation: 'et-wordmark-in 750ms 550ms cubic-bezier(0.16, 1, 0.3, 1) both',
        }}
      >
        Everywhere Transfers
      </div>

      <div
        style={{
          marginTop: 10,
          color: 'rgba(255,255,255,0.55)',
          fontSize: 'clamp(12px, 2.8vw, 14px)',
          fontWeight: 500,
          letterSpacing: '0.04em',
          animation: 'et-wordmark-in 750ms 850ms cubic-bezier(0.16, 1, 0.3, 1) both',
        }}
      >
        Premium chauffeur service
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 'calc(56px + env(safe-area-inset-bottom))',
          width: 64,
          height: 2,
          borderRadius: 2,
          background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.65) 50%, rgba(255,255,255,0) 100%)',
          backgroundSize: '200% 100%',
          animation: 'et-shimmer 1.6s 1100ms linear infinite both',
          opacity: 0,
        }}
      />

      <style>{`
        @keyframes et-mono-in {
          0%   { opacity: 0; transform: translateY(14px) scale(0.86); filter: blur(2px); }
          55%  { opacity: 1; filter: blur(0); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes et-breath {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.015); }
        }
        @keyframes et-wordmark-in {
          0%   { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes et-shimmer {
          0%   { opacity: 0; background-position: -100% 0; }
          15%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { opacity: 1; background-position: 200% 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          [aria-label="Loading Everywhere Transfers"] * { animation: none !important; }
        }
      `}</style>
    </div>
  )
}

export default SplashScreenGate
