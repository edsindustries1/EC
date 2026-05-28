import React from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiPhone, FiClock, FiUsers, FiNavigation, FiShield, FiCheck } from 'react-icons/fi'
import { FadeIn } from '../../hooks/useFadeIn'
import { BLACK, WHITE, GRAY_50, GRAY_100, GRAY_500, FONT, btnPrimary, btnSecondary } from '../../styles/uber'

const FEATURES = [
  { icon: FiClock,      title: 'Real-time flight tracking', desc: 'We monitor your flight from the moment you land. Your driver adjusts automatically for early arrivals or delays — at no extra charge.' },
  { icon: FiUsers,      title: 'Meet & greet',              desc: 'Your professionally dressed chauffeur waits in arrivals with a name sign, ready to assist with luggage.' },
  { icon: FiNavigation, title: 'Private aviation & FBO',    desc: 'We serve all FBO terminals including Teterboro, Westchester, and private suites at JFK and EWR.' },
  { icon: FiShield,     title: 'Coordinated group shuttles', desc: 'Multi-vehicle shuttle runs from any NYC airport to hotels, venues, or corporate campuses with precision timing.' },
]

const AIRPORTS = [
  { code: 'JFK', name: 'John F. Kennedy International', location: 'Queens, NY' },
  { code: 'LGA', name: 'LaGuardia Airport',             location: 'Queens, NY' },
  { code: 'EWR', name: 'Newark Liberty International',  location: 'Newark, NJ' },
  { code: 'FBO', name: 'Private FBO terminals',         location: 'Teterboro · Westchester · JFK' },
]

const VEHICLES = [
  { type: 'Luxury sedan',     pax: '2–3',   ideal: 'Solo & couple airport runs',  img: '/images/fleet-sedan.png' },
  { type: 'Premium SUV',      pax: '3–5',   ideal: 'Families & executive groups', img: '/images/fleet-suv.png' },
  { type: 'Mercedes Sprinter', pax: '11–14', ideal: 'Corporate delegations',       img: '/images/fleet-sprinter.png' },
  { type: 'Coach bus',        pax: '55',    ideal: 'Large group arrivals',        img: '/images/fleet-coach.png' },
]

export default function AirportTransfers() {
  return <ServiceDetail
    eyebrow="Service · Airport transfers"
    title="Airport transfers,"
    titleAccent="done right."
    lead="JFK · LaGuardia · Newark · Teterboro. We meet you in arrivals, track your flight, and get you in and out of New York stress-free."
    features={FEATURES}
    extra={
      <>
        <FadeIn>
          <h2 style={H2}>Every airport, every terminal</h2>
        </FadeIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {AIRPORTS.map((a, i) => (
            <FadeIn key={a.code} delay={i * 60}>
              <div style={{ background: WHITE, border: `1px solid ${GRAY_100}`, borderRadius: 8, padding: 18 }}>
                <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>{a.code}</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{a.name}</div>
                <div style={{ fontSize: 12, color: GRAY_500, marginTop: 2 }}>{a.location}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </>
    }
    vehicles={VEHICLES}
  />
}

// ── Reusable service detail layout ──────────────────────────────────────────
export function ServiceDetail({ eyebrow, title, titleAccent, lead, heroImage, features, extra, vehicles }) {
  return (
    <div style={{ background: WHITE, color: BLACK, fontFamily: FONT, letterSpacing: '-0.01em' }}>

      {/* HERO */}
      <section style={{ background: BLACK, color: WHITE }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12" style={{ padding: '80px 0' }}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <FadeIn className="lg:col-span-7">
              <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.7)', marginBottom: 14 }}>{eyebrow}</p>
              <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: 18, color: WHITE }}>
                {title}<br/>
                <span style={{ color: 'rgba(255,255,255,0.7)' }}>{titleAccent}</span>
              </h1>
              <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.78)', lineHeight: 1.5, maxWidth: 580, marginBottom: 28 }}>{lead}</p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link to="/" style={{ ...btnPrimary, background: WHITE, color: BLACK }}>Get instant quote <FiArrowRight size={15}/></Link>
                <a href="tel:+17186586000" style={{ ...btnSecondary, color: WHITE, border: `1px solid ${WHITE}`, background: 'transparent' }}>
                  <FiPhone size={14}/> (718) 658-6000
                </a>
              </div>
            </FadeIn>
            <FadeIn delay={120} className="lg:col-span-5">
              <div style={{ aspectRatio: '4/3', borderRadius: 12, overflow: 'hidden', background: 'rgba(255,255,255,0.04)' }}>
                <img
                  src={heroImage || '/images/service-airport.png'}
                  alt=""
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ background: GRAY_50 }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12" style={{ padding: '72px 0' }}>
          <FadeIn>
            <h2 style={H2}>What's included</h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((f, i) => (
              <FadeIn key={f.title} delay={i * 70}>
                <div style={{ background: WHITE, border: `1px solid ${GRAY_100}`, borderRadius: 8, padding: '22px 24px', display: 'flex', gap: 16, alignItems: 'flex-start', height: '100%' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 8, background: BLACK, color: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <f.icon size={20}/>
                  </div>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6, letterSpacing: '-0.01em' }}>{f.title}</h3>
                    <p style={{ fontSize: 14, color: GRAY_500, lineHeight: 1.55 }}>{f.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* EXTRA (airports / hours / etc.) */}
      {extra && (
        <section style={{ background: WHITE }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12" style={{ padding: '72px 0' }}>
            {extra}
          </div>
        </section>
      )}

      {/* VEHICLES */}
      {vehicles && (
        <section style={{ background: GRAY_50 }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12" style={{ padding: '72px 0' }}>
            <FadeIn>
              <h2 style={H2}>Recommended vehicles</h2>
            </FadeIn>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {vehicles.map((v, i) => (
                <FadeIn key={v.type} delay={i * 60}>
                  <div style={{ background: WHITE, border: `1px solid ${GRAY_100}`, borderRadius: 8, overflow: 'hidden' }}>
                    <div style={{ height: 120, background: GRAY_50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img
                        src={v.img}
                        alt={v.type}
                        onError={(e) => { e.currentTarget.style.display = 'none' }}
                        style={{ maxWidth: '85%', maxHeight: 100, objectFit: 'contain' }}
                      />
                    </div>
                    <div style={{ padding: '14px 16px' }}>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>{v.type}</div>
                      <div style={{ fontSize: 12, color: GRAY_500, marginTop: 2 }}>{v.pax} passengers</div>
                      <div style={{ fontSize: 12, color: GRAY_500, marginTop: 4, fontStyle: 'italic' }}>{v.ideal}</div>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section style={{ background: BLACK, color: WHITE }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-12" style={{ padding: '64px 0' }}>
          <FadeIn>
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 700, letterSpacing: '-0.02em', color: WHITE, marginBottom: 0 }}>
                Ready when you are.
              </h2>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link to="/" style={{ ...btnPrimary, background: WHITE, color: BLACK }}>Book now <FiArrowRight size={15}/></Link>
                <a href="tel:+17186586000" style={{ ...btnSecondary, color: WHITE, border: `1px solid ${WHITE}`, background: 'transparent' }}>
                  <FiPhone size={14}/> Call dispatch
                </a>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  )
}

const H2 = { fontSize: 'clamp(1.75rem, 3.4vw, 2.6rem)', lineHeight: 1.1, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '2rem' }
