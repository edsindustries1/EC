import React from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiClock, FiUsers, FiCalendar, FiPhone } from 'react-icons/fi'
import { FadeIn } from '../hooks/useFadeIn'

const BLACK = '#000', WHITE = '#fff'
const GRAY_50 = '#F6F6F6', GRAY_100 = '#EEEEEE', GRAY_500 = '#6B6B6B'
const FONT = "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif"

const STEPS = [
  { num: '01', title: 'Tell us where',         desc: 'Enter pickup, drop-off, date and time. Get an instant flat-rate quote — no surge pricing, ever.' },
  { num: '02', title: 'Pick your ride',        desc: 'Choose a sedan, SUV, Sprinter, shuttle or coach. Each comes with a vetted professional chauffeur.' },
  { num: '03', title: 'Sit back, ride in style', desc: 'We track your flight, watch traffic, and notify your driver. SMS with driver details arrives 24h before pickup.' },
]

const TRIP_TYPES = [
  { title: 'Airport transfers', desc: 'JFK, LGA, EWR, TEB. We track your flight free of charge.',           icon: FiClock },
  { title: 'Corporate travel',  desc: 'Centralised billing, expense automation, priority dispatch.',         icon: FiUsers },
  { title: 'Group & events',    desc: 'Weddings, galas, conferences. Coaches and shuttles available.',       icon: FiCalendar },
  { title: 'By the hour',       desc: 'As-directed service — meetings, shopping, multi-stop days.',          icon: FiClock },
]

const FAQ = [
  { q: 'How far in advance should I book?',     a: 'For airport transfers we recommend 12+ hours. Same-day requests are usually fulfilled within an hour.' },
  { q: 'Are gratuities included?',              a: 'Yes — gratuity is included in your flat rate. Tipping is appreciated but never expected.' },
  { q: 'What if my flight is delayed?',         a: 'We monitor your flight in real time. Your driver waits without extra charge.' },
  { q: 'Can I cancel or modify my reservation?', a: 'Free cancellation up to 4 hours before your pickup. Reach out anytime via the reservation lookup.' },
]

export default function HowItWorks() {
  return (
    <div style={{ background: WHITE, color: BLACK, fontFamily: FONT, letterSpacing: '-0.01em' }}>

      <Section bg={WHITE}>
        <FadeIn>
          <h1 style={H1}>Premium chauffeur,<br/>three simple steps.</h1>
          <p style={LEAD}>From quote to confirmation in under sixty seconds. Then we take it from there.</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/" style={btnPrimary}>Book now <FiArrowRight size={15}/></Link>
            <a href="tel:+17186586000" style={btnSecondary}><FiPhone size={14}/> (718) 658-6000</a>
          </div>
        </FadeIn>
      </Section>

      <Section bg={GRAY_50}>
        <FadeIn><h2 style={H2}>How it works</h2></FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {STEPS.map((s, i) => (
            <FadeIn key={s.num} delay={i * 80}>
              <div style={card}>
                <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.04em', marginBottom: 18 }}>{s.num}</div>
                <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.01em' }}>{s.title}</h3>
                <p style={{ fontSize: 15, lineHeight: 1.55, color: GRAY_500 }}>{s.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </Section>

      <Section bg={WHITE}>
        <FadeIn><h2 style={H2}>Built for every type of trip</h2></FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TRIP_TYPES.map((f, i) => (
            <FadeIn key={f.title} delay={i * 70}>
              <div style={{ ...card, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ width: 44, height: 44, borderRadius: 8, background: BLACK, color: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <f.icon size={20}/>
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, letterSpacing: '-0.01em' }}>{f.title}</h3>
                  <p style={{ fontSize: 14, lineHeight: 1.5, color: GRAY_500 }}>{f.desc}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </Section>

      <Section bg={GRAY_50}>
        <FadeIn><h2 style={H2}>Frequently asked</h2></FadeIn>
        <div style={{ maxWidth: 760 }}>
          {FAQ.map((item, i) => (
            <FadeIn key={item.q} delay={i * 60}>
              <details style={{ borderBottom: `1px solid ${GRAY_100}`, padding: '20px 0' }}>
                <summary style={{ fontSize: 18, fontWeight: 600, cursor: 'pointer', listStyle: 'none' }}>{item.q}</summary>
                <p style={{ fontSize: 15, color: GRAY_500, lineHeight: 1.6, marginTop: 10 }}>{item.a}</p>
              </details>
            </FadeIn>
          ))}
        </div>
      </Section>

      <Section bg={BLACK} text={WHITE}>
        <FadeIn>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'flex-start' }}>
            <h2 style={{ ...H2, color: WHITE, marginBottom: 0 }}>Ready when you are.</h2>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/" style={{ ...btnPrimary, background: WHITE, color: BLACK }}>Book a ride <FiArrowRight size={15}/></Link>
              <Link to="/corporate" style={{ ...btnSecondary, color: WHITE, border: `1px solid ${WHITE}`, background: 'transparent' }}>For business</Link>
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
const LEAD = { fontSize: 18, lineHeight: 1.5, color: GRAY_500, maxWidth: 580, marginBottom: '1.75rem' }
const card = { background: WHITE, padding: 28, borderRadius: 8, border: `1px solid ${GRAY_100}`, height: '100%' }
const btnPrimary = { background: BLACK, color: WHITE, padding: '14px 24px', borderRadius: 4, border: 0, fontWeight: 600, fontSize: 15, display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }
const btnSecondary = { background: 'transparent', color: BLACK, padding: '14px 22px', borderRadius: 4, border: `1px solid ${BLACK}`, fontWeight: 600, fontSize: 15, display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }
