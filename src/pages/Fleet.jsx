import React from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiUsers, FiBriefcase, FiCheck, FiPhone } from 'react-icons/fi'
import { FadeIn } from '../hooks/useFadeIn'

const BLACK = '#000', WHITE = '#fff'
const GRAY_50 = '#F6F6F6', GRAY_100 = '#EEEEEE', GRAY_500 = '#6B6B6B'
const FONT = "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif"

const FLEET = [
  {
    id: 'sedan',
    label: 'Luxury Sedan',
    img: '/images/fleet-sedan.png',
    examples: 'Lincoln Town Car · Mercedes E-Class · Cadillac XTS',
    passengers: 3, bags: 2,
    features: ['Bottled water & mints', 'Phone chargers', 'Climate control', 'Reading lights'],
    fromPrice: 75,
    blurb: 'The classic executive ride. Quiet, smooth, and perfectly suited for solo travellers and small groups.',
  },
  {
    id: 'suv',
    label: 'Premium SUV',
    img: '/images/fleet-suv.png',
    examples: 'Cadillac Escalade · Chevrolet Suburban · Lincoln Navigator',
    passengers: 5, bags: 5,
    features: ['Tinted privacy windows', 'Extended cargo space', 'Bottled water', 'Captain seats'],
    fromPrice: 95,
    blurb: 'Maximum space and presence. Ideal for families, couples with luggage, or groups arriving in style.',
  },
  {
    id: 'sprinter_van',
    label: 'Sprinter Van',
    img: '/images/fleet-sprinter.png',
    examples: 'Mercedes-Benz Sprinter Executive',
    passengers: 14, bags: 14,
    features: ['Reclining captain seats', 'USB & power outlets', 'Wi-Fi available', 'Privacy partition'],
    fromPrice: 175,
    blurb: 'The road-ready conference room. Perfect for corporate groups, sports teams, and large parties.',
  },
  {
    id: 'mini_bus',
    label: 'Shuttle',
    img: '/images/fleet-minibus.png',
    examples: 'Ford E-Series Shuttle · Krystal F550',
    passengers: 24, bags: 24,
    features: ['Overhead storage', 'PA system', 'Climate control', 'Step entry'],
    fromPrice: 300,
    blurb: 'Mid-size group transit. Common for conference shuttles, day tours, and wedding transport.',
  },
  {
    id: 'coach',
    label: 'Luxury Coach Bus',
    img: '/images/fleet-coach.png',
    examples: 'Van Hool · MCI J4500 · Prevost H3-45',
    passengers: 55, bags: 55,
    features: ['Reclining seats', 'On-board restroom', 'Wi-Fi & power', 'Wide-screen TVs'],
    fromPrice: 600,
    blurb: 'The full coach experience. For schools, corporate offsites, festivals, and long-distance group travel.',
  },
  {
    id: 'limo',
    label: 'Stretch Limousine',
    img: '/images/fleet-limo.png',
    examples: 'Lincoln MKT Stretch · Cadillac DTS Stretch',
    passengers: 8, bags: 6,
    features: ['LED mood lighting', 'Premium sound', 'Bar service', 'Privacy divider'],
    fromPrice: 150,
    blurb: 'Special occasions only. Proms, weddings, anniversaries, and unforgettable nights out.',
  },
]

export default function Fleet() {
  return (
    <div style={{ background: WHITE, color: BLACK, fontFamily: FONT, letterSpacing: '-0.01em' }}>

      <Section bg={WHITE}>
        <FadeIn>
          <h1 style={H1}>A vehicle for every journey.</h1>
          <p style={LEAD}>250+ vehicles across the Northeast. Sedans, SUVs, Sprinters, shuttles and coaches — all chauffeured by vetted professionals.</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/" style={btnPrimary}>See prices <FiArrowRight size={15}/></Link>
            <a href="tel:+17186586000" style={btnSecondary}><FiPhone size={14}/> (718) 658-6000</a>
          </div>
        </FadeIn>
      </Section>

      <Section bg={GRAY_50}>
        <FadeIn><h2 style={H2}>The fleet</h2></FadeIn>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {FLEET.map((v, i) => (
            <FadeIn key={v.id} delay={Math.min(i * 60, 240)}>
              <article className="fleet-row" style={{
                background: WHITE, borderRadius: 12,
                border: `1px solid ${GRAY_100}`,
                overflow: 'hidden',
                display: 'grid',
                gridTemplateColumns: '1fr',
              }}>
                <div style={{ background: GRAY_50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, minHeight: 240 }}>
                  <img
                    src={v.img}
                    alt={v.label}
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                    style={{ maxWidth: '92%', maxHeight: 220, objectFit: 'contain' }}
                  />
                </div>
                <div style={{ padding: '28px 30px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div className="flex items-start justify-between gap-3 flex-wrap" style={{ marginBottom: 8 }}>
                    <div>
                      <h3 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 2 }}>{v.label}</h3>
                      <p style={{ fontSize: 13, color: GRAY_500 }}>{v.examples}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: GRAY_500, textTransform: 'uppercase', letterSpacing: '0.1em' }}>From</div>
                      <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1 }}>${v.fromPrice}</div>
                    </div>
                  </div>

                  <p style={{ fontSize: 15, lineHeight: 1.5, color: GRAY_500, marginTop: 10, marginBottom: 14 }}>{v.blurb}</p>

                  <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginBottom: 14, fontSize: 13, color: BLACK }}>
                    <span style={spec}><FiUsers size={14}/> Up to {v.passengers}</span>
                    <span style={spec}><FiBriefcase size={14}/> {v.bags} bag{v.bags !== 1 ? 's' : ''}</span>
                  </div>

                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '6px 16px', marginBottom: 18 }}>
                    {v.features.map(f => (
                      <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: GRAY_500 }}>
                        <FiCheck size={12} style={{ color: BLACK, flexShrink: 0 }}/> {f}
                      </li>
                    ))}
                  </ul>

                  <Link to="/" style={{ ...btnPrimary, alignSelf: 'flex-start' }}>Reserve {v.label} <FiArrowRight size={15}/></Link>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
        <style>{`
          @media (min-width: 1024px) {
            .fleet-row { grid-template-columns: 1.1fr 1fr !important; }
          }
        `}</style>
      </Section>

      <Section bg={BLACK} text={WHITE}>
        <FadeIn>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <h2 style={{ ...H2, color: WHITE, marginBottom: 0 }}>Not sure which to pick?</h2>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/" style={{ ...btnPrimary, background: WHITE, color: BLACK }}>Get instant quote <FiArrowRight size={15}/></Link>
              <a href="tel:+17186586000" style={{ ...btnSecondary, color: WHITE, border: `1px solid ${WHITE}`, background: 'transparent' }}>
                <FiPhone size={14}/> Talk to dispatch
              </a>
            </div>
          </div>
        </FadeIn>
      </Section>
    </div>
  )
}

function Section({ children, bg = WHITE, text = BLACK }) {
  return (
    <section style={{ background: bg, color: text }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12" style={{ padding: '80px 0' }}>{children}</div>
    </section>
  )
}
const H1 = { fontSize: 'clamp(2.4rem, 5vw, 4rem)', lineHeight: 1.05, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '1.25rem' }
const H2 = { fontSize: 'clamp(1.75rem, 3.4vw, 2.6rem)', lineHeight: 1.1, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '2rem' }
const LEAD = { fontSize: 18, lineHeight: 1.5, color: GRAY_500, maxWidth: 620, marginBottom: '1.75rem' }
const spec = { display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }
const btnPrimary = { background: BLACK, color: WHITE, padding: '14px 26px', borderRadius: 999, border: 0, fontWeight: 600, fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', cursor: 'pointer' }
const btnSecondary = { background: 'transparent', color: BLACK, padding: '12px 22px', borderRadius: 999, border: `1px solid ${BLACK}`, fontWeight: 600, fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', cursor: 'pointer' }
