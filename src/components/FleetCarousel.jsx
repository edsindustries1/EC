import React, { useEffect, useRef, useState } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

const SLIDES = [
  { img: '/images/fleet-sedan.png',     label: 'Luxury Sedan',  sub: 'Lincoln · Mercedes · Cadillac' },
  { img: '/images/fleet-suv.png',       label: 'Premium SUV',    sub: 'Escalade · Suburban · Navigator' },
  { img: '/images/fleet-sprinter.png',  label: 'Sprinter Van',   sub: 'Up to 14 passengers' },
  { img: '/images/fleet-minibus.png',   label: 'Shuttle',        sub: 'Up to 24 passengers' },
  { img: '/images/fleet-coach.png',     label: 'Coach Bus',      sub: 'Up to 55 passengers' },
  { img: '/images/fleet-limo.png',      label: 'Stretch Limo',   sub: 'Special occasions' },
  { img: '/images/fleet-suv2.png',      label: 'Executive SUV',  sub: 'Black-on-black trim' },
  { img: '/images/fleet-sedan2.png',    label: 'Business Sedan', sub: 'Daily executive travel' },
]

const AUTOPLAY_MS = 4000

export default function FleetCarousel() {
  const [index, setIndex] = useState(0)
  const [hover, setHover] = useState(false)
  const timerRef = useRef(null)
  const trackRef = useRef(null)

  // Autoplay
  useEffect(() => {
    if (hover) return
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length)
    }, AUTOPLAY_MS)
    return () => clearInterval(timerRef.current)
  }, [hover])

  // Sync scroll position to index
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const slideEl = track.children[index]
    if (slideEl) {
      track.scrollTo({ left: slideEl.offsetLeft, behavior: 'smooth' })
    }
  }, [index])

  // Update index when user manually scrolls
  const onScroll = () => {
    const track = trackRef.current
    if (!track) return
    const slideWidth = track.clientWidth
    const newIndex = Math.round(track.scrollLeft / slideWidth)
    if (newIndex !== index) setIndex(newIndex)
  }

  const goPrev = () => setIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length)
  const goNext = () => setIndex((i) => (i + 1) % SLIDES.length)

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        borderRadius: 8,
        overflow: 'hidden',
        background: '#F6F6F6',
        aspectRatio: '4/3',
        userSelect: 'none',
      }}
    >
      {/* Slides track */}
      <div
        ref={trackRef}
        onScroll={onScroll}
        style={{
          width: '100%', height: '100%',
          display: 'flex',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
        }}
        className="hide-scrollbar"
      >
        {SLIDES.map((slide, i) => (
          <div
            key={slide.img}
            style={{
              flex: '0 0 100%',
              width: '100%', height: '100%',
              scrollSnapAlign: 'center',
              position: 'relative',
              background: '#F6F6F6',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <img
              src={slide.img}
              alt={slide.label}
              onError={(e) => { e.currentTarget.style.display = 'none' }}
              style={{
                width: '88%', height: '78%', objectFit: 'contain',
                transition: 'transform 800ms cubic-bezier(0.16, 1, 0.3, 1)',
                transform: i === index ? 'scale(1)' : 'scale(0.96)',
              }}
              draggable={false}
            />
            {/* Bottom gradient + label */}
            <div style={{
              position: 'absolute', left: 0, right: 0, bottom: 0,
              padding: '40px 28px 22px',
              background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 100%)',
            }}>
              <div style={{
                fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em',
                color: 'rgba(255,255,255,0.78)', marginBottom: 4,
              }}>
                Our Fleet · {String(i + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>{slide.label}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>{slide.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Prev / Next arrows */}
      <button
        aria-label="Previous"
        onClick={goPrev}
        style={arrowStyle('left')}
      >
        <FiChevronLeft size={20} />
      </button>
      <button
        aria-label="Next"
        onClick={goNext}
        style={arrowStyle('right')}
      >
        <FiChevronRight size={20} />
      </button>

      {/* Dot indicators */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 8,
        display: 'flex', justifyContent: 'center', gap: 6,
        zIndex: 2,
      }}>
        {SLIDES.map((_, i) => (
          <button
            key={i}
            aria-label={`Slide ${i + 1}`}
            onClick={() => setIndex(i)}
            style={{
              width: i === index ? 22 : 7,
              height: 7,
              borderRadius: 999,
              background: i === index ? '#fff' : 'rgba(255,255,255,0.5)',
              border: 0,
              padding: 0,
              cursor: 'pointer',
              transition: 'width 220ms ease, background 220ms ease',
            }}
          />
        ))}
      </div>
    </div>
  )
}

function arrowStyle(side) {
  return {
    position: 'absolute',
    top: '50%', transform: 'translateY(-50%)',
    [side]: 12,
    width: 40, height: 40, borderRadius: '50%',
    background: 'rgba(255,255,255,0.92)',
    color: '#000',
    border: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', zIndex: 2,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    transition: 'transform 180ms ease, background 180ms ease',
  }
}
