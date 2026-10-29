/**
 * Route-level page transition. Wraps the active <Routes/> so every
 * navigation crossfades + slides in subtly instead of a jarring cut.
 *
 * Cheap implementation — no framer-motion, no react-transition-group,
 * just keyed CSS transitions tied to location.pathname.
 */
import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

const ENTER_MS = 280

export default function PageTransition({ children }) {
  const location = useLocation()
  const [displayLocation, setDisplayLocation] = useState(location)
  const [stage, setStage] = useState('idle') // idle | leaving | entering

  useEffect(() => {
    if (location.pathname === displayLocation.pathname) return
    setStage('leaving')
    const t = setTimeout(() => {
      setDisplayLocation(location)
      setStage('entering')
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setStage('idle'))
      })
    }, 120)
    return () => clearTimeout(t)
  }, [location, displayLocation])

  // Reduce motion → no transition, just swap
  const reduced = typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  if (reduced) return <>{children}</>

  const opacity = stage === 'leaving' ? 0 : 1
  // IMPORTANT: when idle the wrapper must have NO transform and NO
  // will-change: transform. Either one turns this div into the containing
  // block for every position:fixed descendant, so overlays, sheets and
  // bottom bars inside a page get pinned to the (tall, scrolling) page
  // instead of the screen — they drift off-screen or cover the wrong area.
  const animating = stage !== 'idle'
  const translate = stage === 'leaving' ? 'translateY(6px)' : (animating ? 'translateY(0)' : 'none')

  return (
    <div
      key={displayLocation.pathname}
      style={{
        opacity,
        transform: translate,
        transition: `opacity ${ENTER_MS}ms cubic-bezier(0.4, 0, 0.2, 1), transform ${ENTER_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        willChange: animating ? 'opacity, transform' : 'auto',
        minHeight: 'inherit',
      }}
    >
      {children}
    </div>
  )
}
