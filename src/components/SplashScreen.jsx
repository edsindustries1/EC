/**
 * Uber-style animated splash screen — 3.0s cinematic sequence with 3D extruded ET.
 *
 * Coordinated with the native splash so there's no white flash during
 * the hand-off: capacitor.config.json sets backgroundColor=#000 and
 * ios/App/App/Assets.xcassets/Splash.imageset is a black image with
 * a centred white "ET" — visually identical to this React splash, so
 * the user sees one continuous black screen even though two splashes
 * are involved (native → React).
 *
 * Visual: white "ET" rendered as a sculpted 3D object, not flat text.
 *   - 18-layer text-shadow extrude (right + down) creates real depth
 *   - Subtle perspective tilt during entrance (rotateY 12° → 0°)
 *   - Radial glow halo behind the letters adds atmosphere
 *   - Crisp anti-aliasing — no blur, no shimmer
 *
 * Timing (3.0s total):
 *   0.00 – 1.10s   ET tilts in 3D space + fades in
 *   0.55 – 1.30s   "EVERYWHERE TRANSFERS" wordmark slides in
 *   0.85 – 1.55s   "Premium chauffeur service" tagline slides in
 *   1.10 – 2.50s   hold (no breathing/shimmer — solid 3D object)
 *   2.50 – 3.00s   crossfade out, content fades in
 */
import React, { useEffect, useState } from 'react'
import { isNative } from '../native'

const HOLD_MS = 2500
const FADE_MS = 500
const SESSION_KEY = 'et:splash:seen-v3'

// Build a 14-layer extruded text-shadow string. Each layer is offset
// progressively right + down, with a darkening blend from #333 to #000.
// Final two layers add a soft drop shadow under the whole sculpt.
function build3DShadow() {
  const layers = []
  for (let i = 1; i <= 14; i++) {
    // Interpolate brightness from #333 (dark gray) to #000 (black)
    const v = Math.max(0, Math.round(51 - i * 3.5))
    const color = `rgb(${v},${v},${v})`
    layers.push(`${i}px ${i}px 0 ${color}`)
  }
  // Soft drop shadow under everything for atmospheric depth
  layers.push('16px 18px 24px rgba(0,0,0,0.55)')
  layers.push('22px 30px 50px rgba(0,0,0,0.35)')
  return layers.join(', ')
}
const ET_SHADOW = build3DShadow()

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
        background: 'radial-gradient(ellipse at center, #1a1a1a 0%, #000 70%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fading ? 0 : 1,
        transition: `opacity ${FADE_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif",
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        // 3D perspective for the ET tilt
        perspective: '1000px',
        perspectiveOrigin: 'center center',
      }}
    >
      {/* Soft radial glow halo under the letters for atmospheric depth */}
      <div
        style={{
          position: 'absolute',
          top: '50%', left: '50%',
          width: 480, height: 480,
          marginLeft: -240, marginTop: -260,
          background: 'radial-gradient(circle, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0) 65%)',
          pointerEvents: 'none',
          animation: 'et-glow-in 1200ms 200ms ease-out both',
        }}
      />

      {/* ET monogram — 3D extruded sculpt */}
      <div
        style={{
          color: '#fff',
          fontSize: 'clamp(108px, 30vw, 200px)',
          fontWeight: 900,
          letterSpacing: '-0.04em',
          lineHeight: 1,
          // Sharp, crisp rendering — no blur, no antialiasing softness
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          textShadow: ET_SHADOW,
          transformStyle: 'preserve-3d',
          willChange: 'transform, opacity',
          animation: 'et-mono-3d-in 1100ms cubic-bezier(0.16, 1, 0.3, 1) both',
        }}
      >
        ET
      </div>

      <div
        style={{
          marginTop: 38,
          color: 'rgba(255,255,255,0.95)',
          fontSize: 'clamp(15px, 3.5vw, 19px)',
          fontWeight: 700,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          textShadow: '0 2px 8px rgba(0,0,0,0.5)',
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

      {/* Bottom shimmer line — sense of forward motion */}
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
        @keyframes et-mono-3d-in {
          0% {
            opacity: 0;
            transform: perspective(800px) rotateY(15deg) rotateX(-4deg) translateZ(-80px) scale(0.92);
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 1;
            transform: perspective(800px) rotateY(0deg) rotateX(0deg) translateZ(0) scale(1);
          }
        }
        @keyframes et-glow-in {
          0%   { opacity: 0; transform: scale(0.6); }
          100% { opacity: 1; transform: scale(1); }
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
