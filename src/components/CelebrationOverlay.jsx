/**
 * Celebration overlay — full-screen success animation for big moments.
 *
 * Used after:
 *   - Booking confirmed
 *   - Payment succeeded
 *   - Account created
 *
 * The animation sequence (1.6s):
 *   0.00 – 0.45s   curtain fades in
 *   0.10 – 0.70s   checkmark scales up + ring expands
 *   0.30 – 1.20s   18 confetti pieces fall + rotate
 *   0.50 – 0.80s   headline text fades in
 *   0.80 – 1.10s   sub line fades in
 *   1.40 – 1.60s   curtain fades out, calls onDone()
 *
 * Fires haptic('success') on mount for the tactile thump.
 */
import React, { useEffect, useState } from 'react'
import { useHaptics } from '../native-ui'

const COLORS = ['#000000', '#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#06b6d4']

export default function CelebrationOverlay({
  show,
  onDone,
  title = 'Confirmed',
  subtitle = 'Your ride is on the way',
  icon = 'check',          // 'check' | 'car'
  hold = 1400,             // ms before fading out
  fadeOut = 200,
}) {
  const haptic = useHaptics()
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    if (!show) return
    haptic('success')

    const fadeT = setTimeout(() => setExiting(true), hold)
    const doneT = setTimeout(() => {
      setExiting(false)
      onDone?.()
    }, hold + fadeOut)

    return () => { clearTimeout(fadeT); clearTimeout(doneT) }
  }, [show, hold, fadeOut, onDone, haptic])

  if (!show) return null

  return (
    <div
      role="status"
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(255, 255, 255, 0.94)',
        WebkitBackdropFilter: 'blur(28px) saturate(160%)',
        backdropFilter: 'blur(28px) saturate(160%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: exiting ? 0 : 1,
        transition: `opacity ${fadeOut}ms ease`,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif",
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        overflow: 'hidden',
      }}
    >
      {/* Confetti */}
      <Confetti />

      {/* Icon ring + glyph */}
      <div style={{ position: 'relative', width: 124, height: 124, marginBottom: 26 }}>
        {/* Pulse ring */}
        <div style={{
          position: 'absolute', inset: 0,
          borderRadius: '50%',
          background: 'rgba(0, 0, 0, 0.06)',
          animation: 'ec-ring 1100ms 100ms cubic-bezier(0.16, 1, 0.3, 1) both',
        }}/>
        {/* Solid disk */}
        <div style={{
          position: 'absolute', inset: 12,
          borderRadius: '50%',
          background: '#000',
          color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'ec-disk-in 600ms 50ms cubic-bezier(0.16, 1, 0.3, 1) both',
          boxShadow: '0 12px 30px -8px rgba(0,0,0,0.35)',
        }}>
          {icon === 'car' ? <CarGlyph/> : <CheckGlyph/>}
        </div>
      </div>

      {/* Headline */}
      <div style={{
        fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em',
        color: '#000',
        animation: 'ec-text-in 500ms 500ms cubic-bezier(0.16, 1, 0.3, 1) both',
      }}>
        {title}
      </div>

      <div style={{
        fontSize: 15, color: 'rgba(0,0,0,0.55)',
        marginTop: 8,
        animation: 'ec-text-in 500ms 800ms cubic-bezier(0.16, 1, 0.3, 1) both',
      }}>
        {subtitle}
      </div>

      <style>{`
        @keyframes ec-disk-in {
          0%   { transform: scale(0.4); opacity: 0; }
          60%  { transform: scale(1.06); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes ec-ring {
          0%   { transform: scale(0.6); opacity: 0; }
          50%  { transform: scale(1.0); opacity: 1; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        @keyframes ec-text-in {
          0%   { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes ec-check-draw {
          0%   { stroke-dashoffset: 32; }
          100% { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  )
}

function CheckGlyph() {
  return (
    <svg width="46" height="46" viewBox="0 0 46 46" fill="none">
      <path
        d="M 11 23 L 19 31 L 35 14"
        stroke="white" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray="32"
        style={{ animation: 'ec-check-draw 380ms 360ms cubic-bezier(0.65, 0, 0.35, 1) both' }}
      />
    </svg>
  )
}

function CarGlyph() {
  // Mini car silhouette (matches the splash car)
  return (
    <svg width="50" height="32" viewBox="0 0 50 32" fill="none">
      <path d="M 4 22 L 4 19 C 4 17 5 16 7 15 L 13 13.5 C 17 11 22 9.5 28 9 L 36 9 C 39 9.5 41 11 43 13 L 46 17 C 47 18 48 19 48 20 L 48 22 L 38 22 C 38 18 35 16 32 16 C 29 16 26 18 26 22 L 18 22 C 18 18 15 16 12 16 C 9 16 6 18 6 22 L 4 22 Z"
            fill="white"/>
      <circle cx="12" cy="22" r="4.5" fill="white"/>
      <circle cx="12" cy="22" r="1.8" fill="#000"/>
      <circle cx="32" cy="22" r="4.5" fill="white"/>
      <circle cx="32" cy="22" r="1.8" fill="#000"/>
    </svg>
  )
}

function Confetti() {
  // 18 pieces, scattered random positions/rotations/delays
  const pieces = Array.from({ length: 18 }, (_, i) => {
    const left = (i * 73 + 7) % 100         // deterministic spread
    const delay = (i * 53) % 600
    const rot = (i * 47) % 360
    const color = COLORS[i % COLORS.length]
    const duration = 1100 + (i * 91) % 400
    const size = 6 + (i % 3) * 3
    return { left, delay, rot, color, duration, size, key: i }
  })
  return (
    <>
      {pieces.map(p => (
        <div
          key={p.key}
          style={{
            position: 'absolute',
            left: `${p.left}%`, top: '-12%',
            width: p.size, height: p.size * 1.6,
            background: p.color,
            borderRadius: 1.5,
            opacity: 0,
            transform: `rotate(${p.rot}deg)`,
            animation: `ec-confetti ${p.duration}ms ${p.delay}ms cubic-bezier(0.32, 0.72, 0.5, 1) both`,
          }}
        />
      ))}
      <style>{`
        @keyframes ec-confetti {
          0%   { opacity: 0; transform: translateY(0) rotate(0deg); }
          15%  { opacity: 1; }
          100% { opacity: 0.6; transform: translateY(120vh) rotate(720deg); }
        }
      `}</style>
    </>
  )
}
