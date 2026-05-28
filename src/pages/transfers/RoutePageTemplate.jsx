import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiCheck, FiArrowRight, FiPhone, FiClock, FiDollarSign, FiTruck } from 'react-icons/fi'
import QuoteForm from '../../components/QuoteForm'
import { FadeIn } from '../../hooks/useFadeIn'
import { BLACK, WHITE, GRAY_50, GRAY_100, GRAY_500, FONT, btnPrimary, btnSecondary } from '../../styles/uber'

const TRUST_BULLETS = [
  { title: 'Flight tracking',  desc: 'We monitor your flight in real time and adjust for delays — at no extra charge.' },
  { title: 'Meet & greet',     desc: 'Your chauffeur waits in arrivals with a name sign, ready to help with luggage.' },
  { title: 'Fixed pricing',    desc: 'No surge pricing. The price you see is the price you pay. Gratuity included.' },
]

const PERKS = [
  'Licensed & insured',
  'Professional chauffeurs',
  '24/7 availability',
  'All major airports covered',
  'Child seats available',
]

export default function RoutePageTemplate({
  slug, h1, metaTitle, metaDescription,
  priceRange, travelTime, vehicleRecommendation,
  description, fleetImage, faqs,
  prefillPickup, prefillDropoff,
}) {
  useEffect(() => {
    document.title = metaTitle
    let meta = document.querySelector('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'description'
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', metaDescription)
  }, [metaTitle, metaDescription])

  return (
    <div style={{ background: WHITE, color: BLACK, fontFamily: FONT, letterSpacing: '-0.01em', minHeight: '100vh' }}>

      {/* HERO */}
      <section style={{ background: BLACK, color: WHITE }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-12" style={{ padding: '80px 0', textAlign: 'center' }}>
          <FadeIn>
            <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.7)', marginBottom: 14 }}>
              NYC car service
            </p>
            <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: 18 }}>
              {h1}
            </h1>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5, maxWidth: 640, margin: '0 auto 32px' }}>
              {description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" style={{ maxWidth: 680, margin: '0 auto' }}>
              <Pill icon={FiDollarSign} value={priceRange}            label="Estimated price"/>
              <Pill icon={FiClock}      value={travelTime}             label="Typical time"/>
              <Pill icon={FiTruck}      value={vehicleRecommendation}  label="Recommended"/>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section style={{ background: WHITE, borderBottom: `1px solid ${GRAY_100}` }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-12" style={{ padding: '50px 0' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TRUST_BULLETS.map((b, i) => (
              <FadeIn key={b.title} delay={i * 70}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <FiCheck size={18} style={{ color: BLACK, marginTop: 2, flexShrink: 0 }}/>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{b.title}</div>
                    <p style={{ fontSize: 14, color: GRAY_500, lineHeight: 1.5 }}>{b.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* MAIN: image + form */}
      <section style={{ background: GRAY_50 }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12" style={{ padding: '64px 0' }}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            <FadeIn className="lg:col-span-2">
              <div style={{ background: WHITE, borderRadius: 12, border: `1px solid ${GRAY_100}`, overflow: 'hidden', marginBottom: 16 }}>
                <div style={{ height: 220, background: GRAY_100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    src={fleetImage || '/images/fleet-sedan.png'}
                    alt={`${h1} — Everywhere Cars fleet`}
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                    style={{ maxWidth: '88%', maxHeight: 180, objectFit: 'contain' }}
                  />
                </div>
                <div style={{ padding: '20px 22px' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Why book with us</h3>
                  <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {PERKS.map(p => (
                      <li key={p} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: GRAY_500 }}>
                        <FiCheck size={12} style={{ color: BLACK, flexShrink: 0 }}/> {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div style={{ background: BLACK, color: WHITE, borderRadius: 12, padding: '20px 22px', textAlign: 'center' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                  Need help? Call us
                </div>
                <a href="tel:+17186586000" style={{ color: WHITE, fontSize: 22, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <FiPhone size={16}/> (718) 658-6000
                </a>
              </div>
            </FadeIn>

            <FadeIn delay={100} className="lg:col-span-3">
              <h2 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.8rem)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 16 }}>
                Book your transfer
              </h2>
              <div style={{ background: WHITE, borderRadius: 12, border: `1px solid ${GRAY_100}`, overflow: 'hidden' }}>
                <QuoteForm prefillPickup={prefillPickup} prefillDropoff={prefillDropoff}/>
              </div>
              <p style={{ marginTop: 16, fontSize: 13, color: GRAY_500, textAlign: 'center' }}>
                Want instant booking instead?{' '}
                <Link to="/" style={{ color: BLACK, fontWeight: 600, textDecoration: 'underline' }}>Use the homepage search</Link>.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: WHITE }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-12" style={{ padding: '72px 0' }}>
          <FadeIn>
            <h2 style={{ fontSize: 'clamp(1.75rem, 3.4vw, 2.6rem)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 28, textAlign: 'center' }}>
              Frequently asked
            </h2>
          </FadeIn>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {faqs.map((f, i) => (
              <FadeIn key={i} delay={i * 50}>
                <details style={{ borderBottom: `1px solid ${GRAY_100}`, padding: '20px 0' }}>
                  <summary style={{ fontSize: 17, fontWeight: 600, cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                    {f.q}
                    <FiArrowRight size={14} style={{ color: GRAY_500, flexShrink: 0, transition: 'transform 180ms ease' }}/>
                  </summary>
                  <p style={{ marginTop: 12, fontSize: 15, color: GRAY_500, lineHeight: 1.6 }}>{f.a}</p>
                </details>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: BLACK, color: WHITE }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-12" style={{ padding: '64px 0' }}>
          <FadeIn>
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 700, letterSpacing: '-0.02em', color: WHITE, marginBottom: 0 }}>
                Ready when you are.
              </h2>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link to="/" style={{ ...btnPrimary, background: WHITE, color: BLACK }}>
                  Book now <FiArrowRight size={15}/>
                </Link>
                <a href="tel:+17186586000" style={{ ...btnSecondary, color: WHITE, border: `1px solid ${WHITE}`, background: 'transparent' }}>
                  <FiPhone size={14}/> (718) 658-6000
                </a>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  )
}

function Pill({ icon: Icon, value, label }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.08)',
      border: '1px solid rgba(255,255,255,0.14)',
      borderRadius: 12, padding: '14px 18px',
      textAlign: 'left',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <Icon size={18} style={{ flexShrink: 0 }}/>
      <div>
        <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>{label}</div>
      </div>
    </div>
  )
}
