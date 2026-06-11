import React from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiNavigation, FiClock, FiUsers, FiBriefcase, FiPhone } from 'react-icons/fi'
import { FadeIn } from '../../hooks/useFadeIn'

const BLACK = '#000', WHITE = '#fff'
const GRAY_50 = '#F6F6F6', GRAY_100 = '#EEEEEE', GRAY_500 = '#6B6B6B'
const FONT = "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif"

const SERVICES = [
  {
    title: 'Airport Transfers',
    desc: 'JFK, LaGuardia, Newark, Teterboro. Flight tracking and meet-and-greet included on every reservation.',
    img: '/images/service-airport.png',
    href: '/services/airport-transfers',
    icon: FiNavigation,
    bullets: ['Free flight tracking', 'Meet & greet at baggage claim', 'No surge pricing', 'Flat rates by zone'],
  },
  {
    title: 'By the Hour',
    desc: 'As-directed chauffeur service. Perfect for multi-stop days, shopping trips, business meetings, and dinners.',
    img: '/images/service-hourly.png',
    href: '/services/hourly',
    icon: FiClock,
    bullets: ['3-hour minimum', 'Multi-stop included', 'Wait time included', 'Hourly rate, no surprises'],
  },
  {
    title: 'Group & Events',
    desc: 'Sprinters, shuttles, and coaches for weddings, conferences, sports teams, school trips, and corporate offsites.',
    img: '/images/service-events.png',
    href: '/services/events',
    icon: FiUsers,
    bullets: ['Up to 55 passengers', 'Multi-vehicle coordination', 'Event-day dispatch', 'Custom routing'],
  },
  {
    title: 'Corporate Travel',
    desc: 'Managed accounts for businesses. Centralised billing, priority dispatch, dedicated account management.',
    img: '/images/service-corporate.png',
    href: '/corporate',
    icon: FiBriefcase,
    bullets: ['One consolidated invoice', 'Concur & Expensify export', 'Dedicated rep', '24/7 priority dispatch'],
  },
]

export default function Services() {
  return (
    <div style={{ background: WHITE, color: BLACK, fontFamily: FONT, letterSpacing: '-0.01em' }}>

      <Section bg={WHITE}>
        <FadeIn>
          <h1 style={H1}>Services.</h1>
          <p style={LEAD}>From a single airport pickup to multi-vehicle corporate offsites — one operator, one bill, one standard of service.</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/" style={btnPrimary}>Book a ride <FiArrowRight size={15}/></Link>
            <a href="tel:+17186586000" style={btnSecondary}><FiPhone size={14}/> (718) 658-6000</a>
          </div>
        </FadeIn>
      </Section>

      <Section bg={GRAY_50}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {SERVICES.map((s, i) => (
            <FadeIn key={s.title} delay={i * 70}>
              <article className="service-row" style={{
                background: WHITE, borderRadius: 12,
                border: `1px solid ${GRAY_100}`,
                overflow: 'hidden',
                display: 'grid',
                gridTemplateColumns: '1fr',
              }}>
                <div style={{ background: GRAY_50, minHeight: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    src={s.img}
                    alt={s.title}
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ padding: '32px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: BLACK, color: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <s.icon size={18}/>
                    </div>
                    <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>{s.title}</h2>
                  </div>
                  <p style={{ fontSize: 16, lineHeight: 1.5, color: GRAY_500, marginBottom: 18 }}>{s.desc}</p>

                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px 16px', marginBottom: 20 }}>
                    {s.bullets.map(b => (
                      <li key={b} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: BLACK }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: BLACK, flexShrink: 0 }}/>
                        {b}
                      </li>
                    ))}
                  </ul>

                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <Link to={s.href} style={btnPrimary}>Learn more <FiArrowRight size={14}/></Link>
                    <Link to="/" style={btnSecondary}>Book this service</Link>
                  </div>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
        <style>{`
          @media (min-width: 1024px) {
            .service-row { grid-template-columns: 1fr 1.1fr !important; }
          }
        `}</style>
      </Section>

      <Section bg={BLACK} text={WHITE}>
        <FadeIn>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <h2 style={{ ...H2, color: WHITE, marginBottom: 0 }}>Ready when you are.</h2>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/" style={{ ...btnPrimary, background: WHITE, color: BLACK }}>Book now <FiArrowRight size={15}/></Link>
              <a href="tel:+17186586000" style={{ ...btnSecondary, color: WHITE, border: `1px solid ${WHITE}`, background: 'transparent' }}>
                <FiPhone size={14}/> Call dispatch
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
const btnPrimary = { background: BLACK, color: WHITE, padding: '14px 26px', borderRadius: 999, border: 0, fontWeight: 600, fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', cursor: 'pointer' }
const btnSecondary = { background: 'transparent', color: BLACK, padding: '12px 22px', borderRadius: 999, border: `1px solid ${BLACK}`, fontWeight: 600, fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', cursor: 'pointer' }
