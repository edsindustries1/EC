import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  FiArrowRight, FiCalendar, FiClock, FiUsers, FiMapPin,
  FiSearch, FiChevronRight, FiShield, FiHeadphones, FiCheck,
} from 'react-icons/fi'
import PlaceAutocomplete from '../components/PlaceAutocomplete'
import FleetCarousel from '../components/FleetCarousel'
import { FadeIn } from '../hooks/useFadeIn'
import MobileHome from './mobile/MobileHome'
import { isNative } from '../native'

// ── Design tokens ────────────────────────────────────────────────────────────
const BLACK = '#000000'
const WHITE = '#FFFFFF'
const GRAY_50  = '#F6F6F6'
const GRAY_100 = '#EEEEEE'
const GRAY_300 = '#CFCFCF'
const GRAY_500 = '#6B6B6B'
const GRAY_700 = '#3D3D3D'

const TRIP_TYPES = [
  { id: 'oneway',    label: 'One way' },
  { id: 'hourly',    label: 'By the hour' },
  { id: 'roundtrip', label: 'Round trip' },
]

const VEHICLES = [
  { id: 'sedan',        label: 'Sedan',    desc: 'Up to 3 passengers',   eta: '5 min',  img: '/images/fleet-sedan.png' },
  { id: 'suv',          label: 'SUV',      desc: 'Up to 5 passengers',   eta: '7 min',  img: '/images/fleet-suv.png' },
  { id: 'sprinter_van', label: 'Sprinter', desc: 'Up to 14 passengers',  eta: '12 min', img: '/images/fleet-sprinter.png' },
  { id: 'mini_bus',     label: 'Shuttle',  desc: 'Up to 24 passengers',  eta: '20 min', img: '/images/fleet-minibus.png' },
  { id: 'coach',        label: 'Coach',    desc: 'Up to 55 passengers',  eta: '30 min', img: '/images/fleet-coach.png' },
]

const POPULAR_ROUTES = [
  { from: 'JFK Airport',          to: 'Manhattan' },
  { from: 'LaGuardia Airport',    to: 'Manhattan' },
  { from: 'Newark Airport',       to: 'Manhattan' },
  { from: 'Manhattan',            to: 'The Hamptons' },
  { from: 'New York',             to: 'Boston' },
  { from: 'New York',             to: 'Philadelphia' },
]

function defaultDate() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  // Native (iOS / Android) gets a focused booking-first home — no marketing
  if (isNative()) return <MobileHome />

  const navigate = useNavigate()

  const [tripType, setTripType]     = useState('oneway')
  const [pickup, setPickup]         = useState('')
  const [dropoff, setDropoff]       = useState('')
  const [date, setDate]             = useState(defaultDate())
  const [time, setTime]             = useState('14:00')
  const [passengers, setPassengers] = useState(2)

  const [lookupRef, setLookupRef]     = useState('')
  const [lookupEmail, setLookupEmail] = useState('')

  const handleSearch = (e) => {
    e?.preventDefault?.()
    if (!pickup.trim() || !dropoff.trim()) return
    const q = new URLSearchParams({ from: pickup, to: dropoff, date, time, pax: String(passengers), trip: tripType })
    navigate(`/search?${q.toString()}`)
  }

  const handleLookup = (e) => {
    e?.preventDefault?.()
    if (!lookupRef.trim()) return
    const q = lookupEmail ? `?email=${encodeURIComponent(lookupEmail)}` : ''
    navigate(`/reservation/${encodeURIComponent(lookupRef.trim())}${q}`)
  }

  const useRoute = (r) => {
    setPickup(r.from); setDropoff(r.to)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div style={{ background: WHITE, color: BLACK, fontFamily: "'UberMove', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif", letterSpacing: '-0.01em' }}>

      {/* ─── HERO ───────────────────────────────────────────────────────── */}
      <section style={{ background: WHITE, paddingTop: '4.5rem', paddingBottom: '4.5rem' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

          <FadeIn className="lg:col-span-6">
            <h1 style={{
              fontSize: 'clamp(2.4rem, 6vw, 4.4rem)',
              lineHeight: 1.05,
              fontWeight: 700,
              letterSpacing: '-0.03em',
              marginBottom: '1.75rem',
            }}>
              Go anywhere with<br/>Everywhere Transfers
            </h1>

            <form onSubmit={handleSearch} className="space-y-3" style={{ maxWidth: 540 }}>
              <TripTabs value={tripType} onChange={setTripType} />

              <Field>
                <FieldIcon><Dot /></FieldIcon>
                <PlaceAutocomplete
                  value={pickup}
                  onChange={setPickup}
                  inputProps={{
                    placeholder: 'Pickup location',
                    className: 'w-full bg-transparent border-0 outline-none text-base',
                    style: { background: 'transparent', color: BLACK, padding: 0, height: '100%' },
                  }}
                />
              </Field>

              <Field>
                <FieldIcon><Square /></FieldIcon>
                <PlaceAutocomplete
                  value={dropoff}
                  onChange={setDropoff}
                  inputProps={{
                    placeholder: tripType === 'hourly' ? 'As-directed (optional)' : 'Dropoff location',
                    className: 'w-full bg-transparent border-0 outline-none text-base',
                    style: { background: 'transparent', color: BLACK, padding: 0, height: '100%' },
                  }}
                />
              </Field>

              <div className="grid grid-cols-3 gap-3">
                <FieldCompact>
                  <FieldIconSm><FiCalendar size={16} /></FieldIconSm>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-transparent border-0 outline-none text-sm"
                    style={{ color: BLACK }}
                  />
                </FieldCompact>
                <FieldCompact>
                  <FieldIconSm><FiClock size={16} /></FieldIconSm>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-transparent border-0 outline-none text-sm"
                    style={{ color: BLACK }}
                  />
                </FieldCompact>
                <FieldCompact>
                  <FieldIconSm><FiUsers size={16} /></FieldIconSm>
                  <select
                    value={passengers}
                    onChange={(e) => setPassengers(Number(e.target.value))}
                    className="w-full bg-transparent border-0 outline-none text-sm appearance-none"
                    style={{ color: BLACK }}
                  >
                    {[1,2,3,4,5,6,8,10,14,20,30,55].map(n => <option key={n} value={n}>{n} pax</option>)}
                  </select>
                </FieldCompact>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <PrimaryButton type="submit">
                  See prices <FiArrowRight size={16} />
                </PrimaryButton>
                <Link to="/post-ride" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '14px 22px', borderRadius: 4,
                  background: 'transparent', color: BLACK,
                  border: `1.5px solid ${BLACK}`,
                  fontWeight: 600, fontSize: 14, textDecoration: 'none',
                }}>
                  Or post your ride for offers
                </Link>
              </div>
              <p style={{ fontSize: 12, color: GRAY_500, marginTop: 6 }}>
                Instant booking with fixed price, or post your ride and let our operators bid for the best price.
              </p>
            </form>
          </FadeIn>

          <FadeIn delay={120} className="lg:col-span-6">
            <FleetCarousel />
          </FadeIn>
        </div>
      </section>

      {/* ─── CHOOSE YOUR RIDE ───────────────────────────────────────────── */}
      <Section bg={WHITE}>
        <FadeIn>
          <h2 style={h2Style}>Choose how you ride</h2>
        </FadeIn>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {VEHICLES.map((v, i) => (
            <FadeIn key={v.id} delay={i * 60}>
              <button
                onClick={() => {
                  if (!pickup || !dropoff) {
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                    return
                  }
                  const q = new URLSearchParams({ from: pickup, to: dropoff, date, time, pax: String(passengers), trip: tripType })
                  navigate(`/search?${q.toString()}#${v.id}`)
                }}
                className="w-full text-left group"
                style={{
                  background: GRAY_50,
                  padding: '1.25rem',
                  borderRadius: 8,
                  border: `1px solid ${GRAY_100}`,
                  cursor: 'pointer',
                  transition: 'transform 200ms ease, background 200ms ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = GRAY_100; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = GRAY_50;  e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <div style={{ aspectRatio: '4/3', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                  <img
                    src={v.img}
                    alt={v.label}
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                </div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{v.label}</div>
                <div style={{ color: GRAY_500, fontSize: 13, marginTop: 2 }}>{v.desc}</div>
                <div className="flex items-center justify-between mt-3 text-xs" style={{ color: BLACK }}>
                  <span style={{ fontWeight: 500 }}>{v.eta} away</span>
                  <FiChevronRight size={14} />
                </div>
              </button>
            </FadeIn>
          ))}
        </div>
      </Section>

      {/* ─── DOWNLOAD THE APP ───────────────────────────────────────────── */}
      <Section bg={BLACK} text={WHITE}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <FadeIn className="lg:col-span-7">
            <p style={eyebrowStyle(WHITE)}>The app</p>
            <h2 style={{ ...h2Style, color: WHITE }}>Premium rides in the palm of your hand</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 18, lineHeight: 1.5, maxWidth: 540, marginBottom: '1.75rem' }}>
              Book in seconds. Track your chauffeur in real time. Save trips, manage receipts, and unlock priority access. Available on iOS and Android.
            </p>

            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem' }}>
              {[
                'Real-time chauffeur tracking on a live map',
                'Flight tracking — your driver waits, free of charge',
                'One-tap rebook for your favourite trips',
                'Apple Pay & Google Pay built in',
              ].map(t => (
                <li key={t} className="flex items-center gap-3 mb-2.5" style={{ color: 'rgba(255,255,255,0.92)' }}>
                  <FiCheck size={16} />
                  <span style={{ fontSize: 15 }}>{t}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-3">
              <AppStoreButton store="apple" />
              <AppStoreButton store="google" />
            </div>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, marginTop: 14 }}>
              Coming soon — join the waitlist to be first.
            </p>
          </FadeIn>

          <FadeIn delay={120} className="lg:col-span-5">
            <PhoneMockup />
          </FadeIn>
        </div>
      </Section>

      {/* ─── FEATURES ────────────────────────────────────────────────────── */}
      <Section bg={WHITE}>
        <FadeIn>
          <h2 style={h2Style}>What you get</h2>
        </FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Book ahead or right now', desc: 'Schedule trips weeks in advance or get a ride in minutes.', img: '/images/service-airport.png' },
            { title: 'Vetted, professional chauffeurs',         desc: 'Every driver licensed, insured, and background-checked.', img: '/images/service-corporate.png' },
            { title: 'Flat rates. No surprises.',               desc: 'Quoted price is your price. No surge, no hidden fees.',   img: '/images/service-hourly.png' },
          ].map((f, i) => (
            <FadeIn key={f.title} delay={i * 80}>
              <div style={{
                background: GRAY_50,
                borderRadius: 8,
                overflow: 'hidden',
                border: `1px solid ${GRAY_100}`,
              }}>
                <div style={{ aspectRatio: '16/10', background: GRAY_100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    src={f.img}
                    alt={f.title}
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ padding: '1.25rem' }}>
                  <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 6 }}>{f.title}</h3>
                  <p style={{ color: GRAY_500, fontSize: 15, lineHeight: 1.5 }}>{f.desc}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </Section>

      {/* ─── FOR BUSINESS ────────────────────────────────────────────────── */}
      <Section bg={GRAY_50}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <FadeIn>
            <p style={eyebrowStyle(BLACK)}>Everywhere Transfers for Business</p>
            <h2 style={h2Style}>Built for businesses of any size</h2>
            <p style={{ color: GRAY_500, fontSize: 18, lineHeight: 1.5, maxWidth: 520, marginBottom: '1.75rem' }}>
              Centralised billing, traveller management, expense automation, and white-glove support for your entire team.
            </p>
            <div className="flex gap-3">
              <Link to="/corporate"><PrimaryButton>Get started</PrimaryButton></Link>
              <Link to="/corporate"><SecondaryButton>Learn more</SecondaryButton></Link>
            </div>
          </FadeIn>
          <FadeIn delay={120}>
            <div style={{ aspectRatio: '4/3', borderRadius: 4, overflow: 'hidden', background: GRAY_100 }}>
              <img
                src="/images/service-corporate.png"
                alt="Corporate transportation"
                onError={(e) => { e.currentTarget.style.display = 'none' }}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </FadeIn>
        </div>
      </Section>

      {/* ─── POPULAR ROUTES ──────────────────────────────────────────────── */}
      <Section bg={WHITE}>
        <FadeIn>
          <div className="flex items-end justify-between flex-wrap gap-3 mb-8">
            <h2 style={{ ...h2Style, marginBottom: 0 }}>Popular routes</h2>
            <Link to="/services" style={textLinkStyle}>View all services <FiArrowRight size={14} className="inline ml-1" /></Link>
          </div>
        </FadeIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {POPULAR_ROUTES.map((r, i) => (
            <FadeIn key={`${r.from}-${r.to}`} delay={i * 40}>
              <button
                onClick={() => useRoute(r)}
                className="w-full text-left"
                style={{
                  background: WHITE,
                  border: `1px solid ${GRAY_100}`,
                  borderRadius: 8,
                  padding: '1.1rem 1.25rem',
                  cursor: 'pointer',
                  transition: 'border-color 180ms ease, transform 180ms ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = BLACK; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = GRAY_100; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{r.from} <span style={{ color: GRAY_300 }}>→</span> {r.to}</div>
                    <div style={{ color: GRAY_500, fontSize: 13, marginTop: 2 }}>Tap to set as search</div>
                  </div>
                  <FiArrowRight size={16} />
                </div>
              </button>
            </FadeIn>
          ))}
        </div>
      </Section>

      {/* ─── MANAGE TRIP ─────────────────────────────────────────────────── */}
      <Section bg={GRAY_50}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <FadeIn>
            <p style={eyebrowStyle(BLACK)}>Already booked</p>
            <h2 style={h2Style}>Manage your reservation</h2>
            <p style={{ color: GRAY_500, fontSize: 16, lineHeight: 1.5, maxWidth: 460 }}>
              Enter your reservation reference (e.g. EC-ABC2345) to view, modify, or cancel your trip.
            </p>
          </FadeIn>
          <FadeIn delay={120}>
            <form onSubmit={handleLookup} className="space-y-3">
              <Field>
                <input
                  value={lookupRef}
                  onChange={(e) => setLookupRef(e.target.value.toUpperCase())}
                  placeholder="EC-XXXXXXX"
                  className="w-full bg-transparent border-0 outline-none text-base font-mono tracking-wider"
                  style={{ color: BLACK }}
                />
              </Field>
              <Field>
                <input
                  value={lookupEmail}
                  onChange={(e) => setLookupEmail(e.target.value)}
                  placeholder="Email on reservation"
                  type="email"
                  className="w-full bg-transparent border-0 outline-none text-base"
                  style={{ color: BLACK }}
                />
              </Field>
              <PrimaryButton type="submit">Find trip <FiArrowRight size={16} /></PrimaryButton>
            </form>
          </FadeIn>
        </div>
      </Section>

      {/* ─── BIG CTA STRIP ───────────────────────────────────────────────── */}
      <Section bg={BLACK} text={WHITE}>
        <FadeIn>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <h2 style={{ ...h2Style, color: WHITE, marginBottom: 0 }}>
              Ready when you are.
            </h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                style={{
                  background: WHITE, color: BLACK,
                  padding: '14px 28px', borderRadius: 4, border: 0,
                  fontWeight: 700, fontSize: 16, cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                }}
              >
                Book now <FiArrowRight size={16} />
              </button>
              <a
                href="tel:+17186586000"
                style={{
                  background: 'transparent', color: WHITE,
                  padding: '14px 28px', borderRadius: 4,
                  border: `1px solid ${WHITE}`,
                  fontWeight: 700, fontSize: 16,
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  textDecoration: 'none',
                }}
              >
                Call (718) 658-6000
              </a>
            </div>
          </div>
        </FadeIn>
      </Section>
    </div>
  )
}

// ── Subcomponents ───────────────────────────────────────────────────────────

function Section({ children, bg = WHITE, text = BLACK }) {
  return (
    <section style={{ background: bg, color: text }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
        {children}
      </div>
    </section>
  )
}

function TripTabs({ value, onChange }) {
  return (
    <div className="flex gap-1" style={{ background: GRAY_50, padding: 4, borderRadius: 999, width: 'fit-content' }}>
      {TRIP_TYPES.map(t => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          style={{
            padding: '8px 16px',
            borderRadius: 999,
            fontWeight: 600,
            fontSize: 13,
            border: 0,
            cursor: 'pointer',
            background: value === t.id ? BLACK : 'transparent',
            color: value === t.id ? WHITE : BLACK,
            transition: 'all 180ms ease',
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

function Field({ children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      background: GRAY_50, borderRadius: 4,
      padding: '14px 16px',
      border: '1px solid transparent',
      transition: 'border-color 150ms ease',
    }}
    onMouseEnter={(e) => e.currentTarget.style.borderColor = GRAY_300}
    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
    >
      {children}
    </div>
  )
}
function FieldCompact({ children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      background: GRAY_50, borderRadius: 4,
      padding: '10px 12px',
    }}>
      {children}
    </div>
  )
}
function FieldIcon({ children }) {
  return <div style={{ display: 'flex', alignItems: 'center', marginRight: 12, color: BLACK }}>{children}</div>
}
function FieldIconSm({ children }) {
  return <div style={{ display: 'flex', alignItems: 'center', marginRight: 8, color: GRAY_500 }}>{children}</div>
}
function Dot() {
  return <span style={{ width: 10, height: 10, borderRadius: '50%', background: BLACK, display: 'inline-block' }} />
}
function Square() {
  return <span style={{ width: 10, height: 10, background: BLACK, display: 'inline-block' }} />
}

function PrimaryButton({ children, ...props }) {
  return (
    <button
      {...props}
      style={{
        background: BLACK, color: WHITE,
        padding: '14px 24px', borderRadius: 4, border: 0,
        fontWeight: 600, fontSize: 15, cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', gap: 8,
        transition: 'background 180ms ease, transform 120ms ease',
        ...(props.style || {}),
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = GRAY_700 }}
      onMouseLeave={(e) => { e.currentTarget.style.background = BLACK }}
    >
      {children}
    </button>
  )
}
function SecondaryButton({ children, ...props }) {
  return (
    <button
      {...props}
      style={{
        background: 'transparent', color: BLACK,
        padding: '14px 24px', borderRadius: 4,
        border: `1px solid ${BLACK}`,
        fontWeight: 600, fontSize: 15, cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', gap: 8,
        transition: 'background 180ms ease',
        ...(props.style || {}),
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = GRAY_50 }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
    >
      {children}
    </button>
  )
}

function AppStoreButton({ store }) {
  const isApple = store === 'apple'
  return (
    <a
      href="#waitlist"
      onClick={(e) => e.preventDefault()}
      style={{
        background: WHITE, color: BLACK,
        padding: '10px 18px', borderRadius: 6,
        border: `1px solid ${WHITE}`,
        display: 'inline-flex', alignItems: 'center', gap: 10,
        textDecoration: 'none',
        transition: 'transform 180ms ease',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      {isApple ? <AppleLogo /> : <GoogleLogo />}
      <div style={{ textAlign: 'left', lineHeight: 1.1 }}>
        <div style={{ fontSize: 10, fontWeight: 500, color: GRAY_500 }}>{isApple ? 'Download on the' : 'Get it on'}</div>
        <div style={{ fontSize: 16, fontWeight: 700 }}>{isApple ? 'App Store' : 'Google Play'}</div>
      </div>
    </a>
  )
}
function AppleLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
    </svg>
  )
}
function GoogleLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24">
      <path fill="#34A853" d="M12.5 14.5l-9.4 9.4c.4.4 1 .4 1.5.1l11.4-6.5L12.5 14.5z"/>
      <path fill="#FBBC04" d="M21.6 11l-4.6-2.7-5 4.4 5 4.4 4.6-2.7c1-.6 1-2.1 0-2.4z"/>
      <path fill="#4285F4" d="M3.1.1C3 .3 3 .6 3 .9v22.2c0 .3 0 .6.1.8l9.5-9.5L3.1.1z"/>
      <path fill="#EA4335" d="M12.6 12l3.4-3.4L4.6.1C4.1-.2 3.6-.1 3.1.1l9.5 11.9z"/>
    </svg>
  )
}

function PhoneMockup() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{
        width: 280,
        height: 560,
        background: '#1a1a1a',
        borderRadius: 38,
        padding: 12,
        boxShadow: '0 40px 80px -20px rgba(255,255,255,0.15)',
        border: '2px solid #2a2a2a',
      }}>
        <div style={{
          width: '100%', height: '100%',
          background: WHITE,
          borderRadius: 28,
          overflow: 'hidden',
          position: 'relative',
        }}>
          {/* notch */}
          <div style={{
            position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
            width: 90, height: 22, background: '#1a1a1a', borderRadius: 12, zIndex: 2,
          }} />
          {/* fake map */}
          <div style={{
            position: 'absolute', inset: 0,
            background: `
              linear-gradient(180deg, ${GRAY_50} 0%, ${WHITE} 60%, ${GRAY_50} 100%),
              repeating-linear-gradient(45deg, ${GRAY_100} 0 1px, transparent 1px 28px),
              repeating-linear-gradient(-45deg, ${GRAY_100} 0 1px, transparent 1px 28px)
            `,
          }} />
          {/* route line */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 280 560" preserveAspectRatio="none">
            <path d="M 60 380 Q 140 280 200 200" stroke={BLACK} strokeWidth="3" fill="none" strokeDasharray="6,4"/>
            <circle cx="60" cy="380" r="6" fill={BLACK} />
            <rect x="194" y="194" width="12" height="12" fill={BLACK} />
          </svg>
          {/* bottom card */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: WHITE, borderTopLeftRadius: 20, borderTopRightRadius: 20,
            padding: 18, boxShadow: '0 -8px 24px rgba(0,0,0,0.08)',
          }}>
            <div style={{ fontSize: 12, color: GRAY_500, fontWeight: 600, marginBottom: 4 }}>YOUR CHAUFFEUR</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>James · Lincoln Town Car</div>
            <div style={{ height: 4, background: GRAY_100, borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: '65%', height: '100%', background: BLACK }} />
            </div>
            <div style={{ fontSize: 12, color: GRAY_500, marginTop: 8 }}>Arriving in 3 min</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Inline style helpers ────────────────────────────────────────────────────
const h2Style = {
  fontSize: 'clamp(1.75rem, 3.4vw, 2.6rem)',
  lineHeight: 1.1,
  fontWeight: 700,
  letterSpacing: '-0.02em',
  marginBottom: '2rem',
}
const eyebrowStyle = (c) => ({
  fontSize: 13,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: c === WHITE ? 'rgba(255,255,255,0.7)' : GRAY_500,
  marginBottom: 10,
})
const textLinkStyle = {
  color: BLACK,
  fontWeight: 600,
  fontSize: 14,
  textDecoration: 'underline',
  textUnderlineOffset: 4,
  display: 'inline-flex',
  alignItems: 'center',
}
