/**
 * Mobile-only home screen — uber-style minimal booking entry.
 * Rendered by Home.jsx when running inside Capacitor.
 */
import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  FiSearch, FiArrowRight, FiClock, FiNavigation,
  FiRefreshCw, FiChevronRight, FiHome, FiBriefcase,
} from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { BLACK, WHITE, GRAY_50, GRAY_100, GRAY_500, FONT } from '../../styles/uber'

const QUICK_TYPES = [
  { id: 'oneway',    label: 'One way',     icon: FiArrowRight },
  { id: 'roundtrip', label: 'Round trip',  icon: FiRefreshCw },
  { id: 'hourly',    label: 'By the hour', icon: FiClock },
]

const SUGGESTIONS = [
  { from: 'JFK Airport',          to: 'Manhattan',    fromPlace: 'JFK Airport, Queens, NY',    toPlace: 'Manhattan, NY',          price: 75 },
  { from: 'LaGuardia Airport',    to: 'Manhattan',    fromPlace: 'LaGuardia Airport, Queens, NY', toPlace: 'Manhattan, NY',        price: 65 },
  { from: 'Newark Airport',       to: 'Manhattan',    fromPlace: 'Newark Liberty Airport, NJ', toPlace: 'Manhattan, NY',          price: 85 },
  { from: 'Manhattan',            to: 'The Hamptons', fromPlace: 'Manhattan, NY',              toPlace: 'The Hamptons, NY',       price: 380 },
]

function greetingForNow() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

function defaultDateISO() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

export default function MobileHome() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth() || {}
  const [tripType, setTripType] = useState('oneway')

  const greeting = isAuthenticated && user?.name
    ? `${greetingForNow()}, ${user.name.split(' ')[0]}`
    : greetingForNow()

  // Tap "Where to?" → jump straight into the existing search flow
  // with focus on the destination field.
  const goToSearch = (prefill = {}) => {
    const q = new URLSearchParams({
      from: prefill.from || '',
      to: prefill.to || '',
      date: defaultDateISO(),
      time: '14:00',
      pax: '2',
      trip: tripType,
    })
    navigate(`/search?${q.toString()}`)
  }

  return (
    <div style={{
      background: WHITE, color: BLACK,
      fontFamily: FONT, letterSpacing: '-0.01em',
      minHeight: '100%',
      padding: '12px 16px 96px',  // bottom padding leaves room for the tab bar
    }}>

      {/* ── Greeting ─────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 18 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: GRAY_500, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {greeting}
        </p>
        <h1 style={{
          fontSize: 28, lineHeight: 1.1, fontWeight: 700,
          letterSpacing: '-0.02em', marginTop: 6,
        }}>
          Where are you<br/>headed?
        </h1>
      </div>

      {/* ── Trip type pills ──────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
        {QUICK_TYPES.map(t => (
          <button
            key={t.id}
            onClick={() => setTripType(t.id)}
            style={{
              flexShrink: 0,
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '10px 16px', borderRadius: 999,
              fontWeight: 600, fontSize: 13,
              border: 0, cursor: 'pointer',
              background: tripType === t.id ? BLACK : GRAY_50,
              color:      tripType === t.id ? WHITE : BLACK,
              transition: 'all 150ms ease',
            }}
          >
            <t.icon size={14}/> {t.label}
          </button>
        ))}
      </div>

      {/* ── The big "Where to?" CTA ──────────────────────────────────── */}
      <button
        onClick={() => goToSearch()}
        style={{
          display: 'flex', alignItems: 'center', gap: 14,
          width: '100%', padding: '20px 18px',
          background: BLACK, color: WHITE,
          border: 0, borderRadius: 12,
          cursor: 'pointer', textAlign: 'left',
          marginBottom: 22,
          boxShadow: '0 10px 30px -10px rgba(0,0,0,0.35)',
        }}
      >
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: 'rgba(255,255,255,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <FiSearch size={20}/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Plan your ride
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, marginTop: 3 }}>
            Where to?
          </div>
        </div>
        <FiArrowRight size={18}/>
      </button>

      {/* ── Saved places (placeholder until we ship saved addresses) ──── */}
      <div style={{ marginBottom: 22 }}>
        <h2 style={sectionTitle}>Quick book</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <SavedPlace
            icon={FiHome}
            label="Home"
            hint="Set up"
            onClick={() => goToSearch()}
          />
          <SavedPlace
            icon={FiBriefcase}
            label="Work"
            hint="Set up"
            onClick={() => goToSearch()}
          />
        </div>
      </div>

      {/* ── Suggestions ──────────────────────────────────────────────── */}
      <div style={{ marginBottom: 22 }}>
        <h2 style={sectionTitle}>Popular routes</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {SUGGESTIONS.map(s => (
            <button
              key={`${s.from}-${s.to}`}
              onClick={() => goToSearch({ from: s.fromPlace, to: s.toPlace })}
              style={{
                width: '100%', textAlign: 'left',
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 14px',
                background: WHITE, border: `1px solid ${GRAY_100}`,
                borderRadius: 10, cursor: 'pointer',
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: GRAY_50, color: BLACK,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <FiNavigation size={15}/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: BLACK, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {s.from} → {s.to}
                </div>
                <div style={{ fontSize: 12, color: GRAY_500, marginTop: 1 }}>
                  From ${s.price}
                </div>
              </div>
              <FiChevronRight size={16} style={{ color: GRAY_500 }}/>
            </button>
          ))}
        </div>
      </div>

      {/* ── Bottom info ──────────────────────────────────────────────── */}
      <a
        href="tel:+17186586000"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px', borderRadius: 10,
          background: GRAY_50, color: BLACK,
          textDecoration: 'none', marginBottom: 16,
        }}
      >
        <div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>Need to talk to dispatch?</div>
          <div style={{ fontSize: 12, color: GRAY_500, marginTop: 2 }}>24/7 · (718) 658-6000</div>
        </div>
        <FiChevronRight size={16} style={{ color: GRAY_500 }}/>
      </a>
    </div>
  )
}

function SavedPlace({ icon: Icon, label, hint, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6,
        padding: '14px',
        background: GRAY_50, border: 0, borderRadius: 10,
        cursor: 'pointer', textAlign: 'left',
      }}
    >
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: WHITE, color: BLACK,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `1px solid ${GRAY_100}`,
      }}>
        <Icon size={14}/>
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700 }}>{label}</div>
        <div style={{ fontSize: 11, color: GRAY_500, marginTop: 2 }}>{hint}</div>
      </div>
    </button>
  )
}

const sectionTitle = {
  fontSize: 11, fontWeight: 700, color: GRAY_500,
  textTransform: 'uppercase', letterSpacing: '0.1em',
  marginBottom: 10,
}
