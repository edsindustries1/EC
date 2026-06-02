import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiPhone, FiShield, FiClock, FiCheck } from 'react-icons/fi'
import QuoteForm from '../components/QuoteForm'
import { BLACK, WHITE, GRAY_50, GRAY_100, GRAY_500, FONT, btnPrimary } from '../styles/uber'

const TRUST = [
  { icon: FiShield, label: 'Flight tracking' },
  { icon: FiClock,  label: '24/7 dispatch' },
  { icon: FiCheck,  label: 'Fixed pricing' },
]

export default function Quote() {
  useEffect(() => {
    document.title = 'Get a free quote · Everywhere Transfers'
    let meta = document.querySelector('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'description'
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', 'Get an instant quote for NYC airport transfers, car service to JFK, LGA, EWR, and more. No registration required. Fixed prices, professional chauffeurs.')
  }, [])

  return (
    <div style={{ background: WHITE, color: BLACK, fontFamily: FONT, letterSpacing: '-0.01em', minHeight: '100vh' }}>

      {/* HERO */}
      <section style={{ background: BLACK, color: WHITE }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-12" style={{ padding: '80px 0', textAlign: 'center' }}>
          <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.7)', marginBottom: 12 }}>
            No registration required
          </p>
          <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: 14 }}>
            Get a free quote
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5, maxWidth: 520, margin: '0 auto 28px' }}>
            Premium chauffeur service across the Northeast. Fixed prices, vetted drivers, instant confirmation.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 20, fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
            {TRUST.map(t => (
              <span key={t.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <t.icon size={14}/> {t.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FORM */}
      <section style={{ background: GRAY_50 }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-12" style={{ padding: '56px 0' }}>
          <div style={{ background: WHITE, borderRadius: 12, border: `1px solid ${GRAY_100}`, overflow: 'hidden' }}>
            <QuoteForm/>
          </div>

          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <p style={{ fontSize: 14, color: GRAY_500, marginBottom: 6 }}>Prefer to call?</p>
            <a href="tel:+17186586000" style={{ color: BLACK, fontWeight: 700, fontSize: 22, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <FiPhone size={18}/> (718) 658-6000
            </a>
          </div>

          <div style={{ textAlign: 'center', marginTop: 36, padding: '20px 16px', background: WHITE, border: `1px dashed ${GRAY_100}`, borderRadius: 8 }}>
            <p style={{ fontSize: 14, color: GRAY_500, marginBottom: 8 }}>Need an instant booking instead?</p>
            <Link to="/" style={{ ...btnPrimary, padding: '10px 18px' }}>
              Use instant booking <FiArrowRight size={13}/>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
