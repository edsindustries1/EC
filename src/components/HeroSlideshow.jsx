import React, { useState, useEffect, useRef, useCallback } from 'react'

const DEFAULT_SLIDES = [
  { src: '/hero/slide1.jpg', alt: 'Luxury black sedan at hotel entrance' },
  { src: '/hero/slide2.jpg', alt: 'Cadillac Escalade at JFK airport' },
  { src: '/hero/slide3.jpg', alt: 'Executive van in New York City' },
  { src: '/hero/slide4.jpg', alt: 'Luxury coach for corporate travel' },
  { src: '/hero/slide5.jpg', alt: 'Premium limousine interior' },
]

const DEFAULT_SLIDE_MS = 5500

export default function HeroSlideshow({ images, slideMs, onSlideChange }) {
  const SLIDES = images && images.length > 0 ? images : DEFAULT_SLIDES
  const SLIDE_MS = slideMs || DEFAULT_SLIDE_MS
  const [active, setActive] = useState(0)
  const [loaded, setLoaded] = useState({})
  const intervalRef = useRef(null)
  const [tick, setTick] = useState(0)

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const startTimer = useCallback(() => {
    clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setActive(a => {
        const next = (a + 1) % SLIDES.length
        if (onSlideChange) onSlideChange(next)
        return next
      })
      setTick(t => t + 1)
    }, SLIDE_MS)
  }, [onSlideChange, SLIDE_MS, SLIDES.length])

  useEffect(() => {
    startTimer()
    return () => clearInterval(intervalRef.current)
  }, [startTimer])

  const goTo = (i) => {
    setActive(i)
    setTick(t => t + 1)
    if (onSlideChange) onSlideChange(i)
    startTimer()
  }

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {SLIDES.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0"
          style={{
            opacity: i === active ? 1 : 0,
            transition: prefersReduced ? 'none' : 'opacity 1000ms ease-in-out',
            zIndex: i === active ? 2 : 1,
          }}
        >
          <img
            src={slide.src}
            alt={slide.alt}
            onLoad={() => setLoaded(l => ({ ...l, [i]: true }))}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              willChange: 'transform',
              animation: !prefersReduced && i === active && loaded[i]
                ? `heroKenBurns ${SLIDE_MS * 1.6}ms ease-out forwards`
                : 'none',
            }}
          />
        </div>
      ))}

      <div
        className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-2 pb-5"
        style={{ zIndex: 10 }}
      >
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            style={{
              height: 3,
              width: i === active ? 44 : 20,
              borderRadius: 9999,
              background: 'rgba(255,255,255,0.30)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'width 300ms ease',
              padding: 0,
              border: 'none',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            {i === active && (
              <span
                key={tick}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: '#F6C90E',
                  transformOrigin: 'left center',
                  animation: prefersReduced
                    ? 'none'
                    : `heroProgress ${SLIDE_MS}ms linear forwards`,
                  borderRadius: 9999,
                }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
