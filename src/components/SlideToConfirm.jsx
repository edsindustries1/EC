/**
 * iOS-style "Slide to confirm" pill button.
 *
 * Long pill with a label in the center. A black circular thumb sits at
 * the left edge. User drags it right; when it crosses the 88% threshold
 * the onConfirm callback fires. Otherwise it springs back to the left.
 *
 * Wired with both touch (mobile) and pointer (desktop) events so it
 * works in the iOS WebView, mobile Safari, and a laptop browser.
 *
 * Visual sequence:
 *   - Idle:        gray pill, thumb at left, label in center
 *   - Dragging:    label fades + a black fill expands from the left as
 *                  the thumb moves right
 *   - Threshold:   haptic 'success' fires the moment we cross it
 *   - Released past threshold:  thumb snaps right + label flips to confirm,
 *                  then onConfirm() runs
 *   - Released early:           thumb springs back with ease-out
 */
import React, { useEffect, useRef, useState } from 'react'
import { FiArrowRight, FiCheck } from 'react-icons/fi'
import { useHaptics } from '../native-ui'

const TRACK_HEIGHT = 60
const THUMB_SIZE = 52

export default function SlideToConfirm({
  label = 'Slide to confirm',
  doneLabel = 'Confirmed',
  onConfirm,
  disabled = false,
  busy = false,
}) {
  const trackRef = useRef(null)
  const haptic = useHaptics()
  const [x, setX] = useState(0)             // current thumb offset in px
  const [dragging, setDragging] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const startXRef = useRef(0)
  const maxXRef = useRef(0)
  const crossedRef = useRef(false)

  // Recompute max thumb travel whenever the track resizes
  useEffect(() => {
    const update = () => {
      const w = trackRef.current?.offsetWidth || 0
      maxXRef.current = Math.max(0, w - THUMB_SIZE - 4)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const getClientX = (e) => {
    if (e.touches?.[0]) return e.touches[0].clientX
    if (e.changedTouches?.[0]) return e.changedTouches[0].clientX
    return e.clientX
  }

  const startDrag = (e) => {
    if (disabled || busy || confirmed) return
    setDragging(true)
    crossedRef.current = false
    startXRef.current = getClientX(e) - x
  }

  const onDrag = (e) => {
    if (!dragging) return
    const clientX = getClientX(e)
    const next = Math.max(0, Math.min(maxXRef.current, clientX - startXRef.current))
    setX(next)
    // Tactile success haptic ONCE when we cross the threshold
    const progress = maxXRef.current > 0 ? next / maxXRef.current : 0
    if (progress >= 0.88 && !crossedRef.current) {
      crossedRef.current = true
      haptic('success')
    } else if (progress < 0.7 && crossedRef.current) {
      // re-arm if user slid back
      crossedRef.current = false
    }
  }

  const endDrag = async () => {
    if (!dragging) return
    setDragging(false)
    const progress = maxXRef.current > 0 ? x / maxXRef.current : 0
    if (progress >= 0.88) {
      // Snap to right edge while we await the parent's validation
      setX(maxXRef.current)
      try {
        // Parent's onConfirm can return false (sync) or reject
        // (async) to signal validation failure → we spring back
        // and the "Posted!" overlay never appears.
        const result = await onConfirm?.()
        if (result === false) {
          setX(0)
          crossedRef.current = false
          return
        }
        setConfirmed(true)
      } catch {
        setX(0)
        crossedRef.current = false
      }
    } else {
      setX(0)        // released early — spring back
    }
  }

  // Touch + pointer listeners — pointer covers mouse + stylus
  useEffect(() => {
    if (!dragging) return
    const move = (e) => onDrag(e)
    const up   = () => endDrag()
    window.addEventListener('touchmove', move, { passive: true })
    window.addEventListener('touchend',  up)
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup',   up)
    return () => {
      window.removeEventListener('touchmove', move)
      window.removeEventListener('touchend',  up)
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup',   up)
    }
  }, [dragging, x])

  const progress = maxXRef.current > 0 ? x / maxXRef.current : 0
  const labelOpacity = Math.max(0, 1 - progress * 1.6)
  const showDone = confirmed || busy

  return (
    <div
      ref={trackRef}
      style={{
        position: 'relative',
        width: '100%',
        height: TRACK_HEIGHT,
        borderRadius: 999,
        background: disabled ? '#e5e5e5' : '#F0F0F0',
        overflow: 'hidden',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'pan-y',
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? 'not-allowed' : 'grab',
      }}
    >
      {/* Black fill that expands from the left as the user drags */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: '#000',
        clipPath: `inset(0 ${100 - progress * 100}% 0 0 round 999px)`,
        transition: dragging ? 'none' : 'clip-path 280ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}/>

      {/* Label */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif",
        fontSize: 15, fontWeight: 700,
        letterSpacing: '0.04em', textTransform: 'uppercase',
        color: '#000',
        opacity: showDone ? 0 : labelOpacity,
        transition: dragging ? 'none' : 'opacity 220ms ease',
        pointerEvents: 'none',
      }}>
        {label}
        <FiArrowRight size={16} style={{ marginLeft: 6, opacity: 0.65 }} />
      </div>

      {/* Done state label (after confirm or while busy) */}
      {showDone && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff',
          fontSize: 15, fontWeight: 700,
          letterSpacing: '0.04em', textTransform: 'uppercase',
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif",
          pointerEvents: 'none',
        }}>
          {busy && !confirmed ? 'Posting…' : doneLabel}
        </div>
      )}

      {/* Draggable thumb */}
      <button
        type="button"
        onTouchStart={startDrag}
        onMouseDown={startDrag}
        aria-label={label}
        disabled={disabled || busy || confirmed}
        style={{
          position: 'absolute',
          top: 4, left: 4,
          width: THUMB_SIZE, height: THUMB_SIZE,
          borderRadius: '50%',
          background: '#000',
          color: '#fff',
          border: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 6px 16px -4px rgba(0,0,0,0.35)',
          transform: `translateX(${x}px)`,
          transition: dragging ? 'none' : 'transform 320ms cubic-bezier(0.16, 1, 0.3, 1)',
          cursor: disabled || busy || confirmed ? 'default' : 'grab',
          touchAction: 'none',
        }}
      >
        {showDone ? <FiCheck size={22} strokeWidth={3}/> : <FiArrowRight size={20} strokeWidth={2.5}/>}
      </button>
    </div>
  )
}
