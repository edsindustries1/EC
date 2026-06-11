/**
 * Mobile-only home screen — uber-style minimal booking entry.
 * Two visible inputs (pickup + dropoff) with Google Places autocomplete
 * (auto-falls back to Photon if no API key configured).
 */
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiArrowRight, FiClock, FiRefreshCw,
  FiChevronRight, FiHome, FiBriefcase, FiPhone,
  FiCalendar, FiUsers,
} from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import PlaceAutocomplete from '../../components/PlaceAutocomplete'
import { BLACK, WHITE, GRAY_50, GRAY_100, GRAY_500, FONT } from '../../styles/uber'

const QUICK_TYPES = [
  { id: 'oneway',    label: 'One way',     icon: FiArrowRight },
  { id: 'roundtrip', label: 'Round trip',  icon: FiRefreshCw },
  { id: 'hourly',    label: 'By the hour', icon: FiClock },
]

const SUGGESTIONS = [
  { from: 'JFK Airport',       to: 'Manhattan',    fromPlace: 'JFK Airport, Queens, NY',          toPlace: 'Manhattan, NY',    price: 75 },
  { from: 'LaGuardia Airport', to: 'Manhattan',    fromPlace: 'LaGuardia Airport, Queens, NY',    toPlace: 'Manhattan, NY',    price: 65 },
  { from: 'Newark Airport',    to: 'Manhattan',    fromPlace: 'Newark Liberty Airport, NJ',       toPlace: 'Manhattan, NY',    price: 85 },
  { from: 'Manhattan',         to: 'The Hamptons', fromPlace: 'Manhattan, NY',                    toPlace: 'The Hamptons, NY', price: 380 },
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
  const [pickup, setPickup] = useState('')
  const [dropoff, setDropoff] = useState('')
  const [date, setDate] = useState(defaultDateISO())
  const [time, setTime] = useState('14:00')
  const [pax, setPax] = useState(2)
  const [error, setError] = useState('')

  const greeting = isAuthenticated && user?.name
    ? `${greetingForNow()}, ${user.name.split(' ')[0]}`
    : greetingForNow()

  const handleSeePrices = (e) => {
    e?.preventDefault?.()
    if (!pickup.trim() || !dropoff.trim()) {
      setError('Enter both pickup and drop-off')
      return
    }
    setError('')
    const q = new URLSearchParams({
      from: pickup, to: dropoff,
      date, time, pax: String(pax),
      trip: tripType,
    })
    navigate(`/search?${q.toString()}`)
  }

  const useSuggestion = (s) => {
    setPickup(s.fromPlace)
    setDropoff(s.toPlace)
    setError('')
    // Smooth scroll to top so they see the inputs they just filled
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div style={{
      background: WHITE, color: BLACK,
      fontFamily: FONT, letterSpacing: '-0.01em',
      minHeight: '100%',
      // Top padding extends UNDER the status bar via safe-area inset so
      // the WebView is truly edge-to-edge. Status bar icons remain
      // legible against the white background.
      padding: 'calc(12px + env(safe-area-inset-top)) 16px calc(96px + env(safe-area-inset-bottom))',
    }}>

      {/* ── Greeting ─────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 16 }}>
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

      {/* ── Trip type pills — Liquid Glass containers ───────────────────
          Translucent backdrop blur reads through the page background.
          Active pill is solid black (Apple-style "selected" treatment). */}
      <div style={{
        display: 'inline-flex', gap: 0,
        marginBottom: 16,
        padding: 4,
        borderRadius: 999,
        background: 'rgba(0, 0, 0, 0.04)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        backdropFilter: 'blur(20px) saturate(180%)',
        border: '0.5px solid rgba(0, 0, 0, 0.06)',
      }}>
        {QUICK_TYPES.map(t => (
          <button
            key={t.id}
            onClick={() => setTripType(t.id)}
            style={{
              position: 'relative',
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 999,
              fontWeight: 600, fontSize: 13,
              border: 0, cursor: 'pointer',
              background: tripType === t.id ? BLACK : 'transparent',
              color:      tripType === t.id ? WHITE : BLACK,
              transition: 'background 240ms cubic-bezier(0.16, 1, 0.3, 1), color 240ms ease, transform 180ms ease',
              boxShadow: tripType === t.id ? '0 2px 8px -2px rgba(0,0,0,0.25)' : 'none',
            }}
          >
            <t.icon size={14}/> {t.label}
          </button>
        ))}
      </div>

      {/* ── Pickup + Dropoff card (uber-style stacked) ───────────────── */}
      <form onSubmit={handleSeePrices} style={{
        background: GRAY_50,
        borderRadius: 14,
        padding: 4,
        marginBottom: 12,
      }}>
        <LocationField
          dotShape="circle"
          placeholder="Pickup location"
          value={pickup}
          onChange={setPickup}
        />

        <div style={{ height: 1, background: GRAY_100, marginLeft: 38 }}/>

        <LocationField
          dotShape="square"
          placeholder={tripType === 'hourly' ? 'As-directed (optional)' : 'Drop-off location'}
          value={dropoff}
          onChange={setDropoff}
        />

        <div style={{ height: 1, background: GRAY_100, marginLeft: 38 }}/>

        {/* Date / Time / Pax compact row */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
          padding: '4px 4px 4px 4px',
        }}>
          <CompactPicker icon={FiCalendar}>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={compactInputStyle}
            />
          </CompactPicker>
          <CompactPicker icon={FiClock}>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              style={compactInputStyle}
            />
          </CompactPicker>
          <CompactPicker icon={FiUsers}>
            <select
              value={pax}
              onChange={(e) => setPax(Number(e.target.value))}
              style={{ ...compactInputStyle, appearance: 'none', paddingRight: 4 }}
            >
              {[1,2,3,4,5,6,8,10,14,20,30,55].map(n => (
                <option key={n} value={n}>{n} pax</option>
              ))}
            </select>
          </CompactPicker>
        </div>
      </form>

      {error && (
        <div style={{
          background: '#fee2e2', color: '#991b1b',
          padding: '10px 14px', borderRadius: 8,
          fontSize: 13, fontWeight: 600, marginBottom: 12,
        }}>
          {error}
        </div>
      )}

      {/* ── See Prices CTA ──────────────────────────────────────────── */}
      <button
        onClick={handleSeePrices}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          width: '100%', padding: '16px',
          background: BLACK, color: WHITE,
          border: 0, borderRadius: 12,
          fontSize: 16, fontWeight: 700, cursor: 'pointer',
          boxShadow: '0 10px 30px -10px rgba(0,0,0,0.35)',
          marginBottom: 10,
        }}
      >
        Book instantly · See prices <FiArrowRight size={17}/>
      </button>

      {/* "Post your ride" alternative — auth required */}
      <button
        onClick={() => navigate('/post-ride')}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          width: '100%', padding: '14px',
          background: WHITE, color: BLACK,
          border: `1.5px solid ${BLACK}`, borderRadius: 12,
          fontSize: 14, fontWeight: 600, cursor: 'pointer',
          marginBottom: 24,
        }}
      >
        Or post your ride for offers
      </button>

      {/* ── Saved places ─────────────────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={sectionTitle}>Quick book</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <SavedPlace icon={FiHome}      label="Home" hint="Set up" />
          <SavedPlace icon={FiBriefcase} label="Work" hint="Set up" />
        </div>
      </div>

      {/* ── Popular routes ───────────────────────────────────────────── */}
      <div style={{ marginBottom: 22 }}>
        <h2 style={sectionTitle}>Popular routes</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {SUGGESTIONS.map(s => (
            <button
              key={`${s.from}-${s.to}`}
              onClick={() => useSuggestion(s)}
              style={{
                width: '100%', textAlign: 'left',
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px',
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
                <FiArrowRight size={15}/>
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

      {/* ── Bottom dispatch ──────────────────────────────────────────── */}
      <a
        href="tel:+17186586000"
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 16px', borderRadius: 10,
          background: GRAY_50, color: BLACK,
          textDecoration: 'none',
        }}
      >
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: WHITE, border: `1px solid ${GRAY_100}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <FiPhone size={15}/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>Need to talk to dispatch?</div>
          <div style={{ fontSize: 12, color: GRAY_500, marginTop: 2 }}>24/7 · (718) 658-6000</div>
        </div>
      </a>
    </div>
  )
}

// ── Subcomponents ──────────────────────────────────────────────────────

function LocationField({ dotShape, placeholder, value, onChange }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      padding: '14px 14px',
      background: WHITE,
      borderRadius: 12,
    }}>
      <span style={{
        width: 12, height: 12,
        background: BLACK,
        borderRadius: dotShape === 'circle' ? '50%' : 2,
        flexShrink: 0,
        marginRight: 12,
      }}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <PlaceAutocomplete
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="ec-mobile-place-input"
          aria-label={placeholder}
        />
      </div>
    </div>
  )
}

function CompactPicker({ icon: Icon, children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      background: WHITE,
      padding: '10px 10px',
      borderRadius: 10,
      margin: 2,
      minWidth: 0,
    }}>
      <Icon size={14} style={{ color: GRAY_500, flexShrink: 0 }}/>
      {children}
    </div>
  )
}

function SavedPlace({ icon: Icon, label, hint }) {
  return (
    <button
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

const compactInputStyle = {
  width: '100%', minWidth: 0,
  background: 'transparent',
  border: 0, outline: 'none',
  fontSize: 13, fontWeight: 600,
  color: BLACK,
  fontFamily: FONT,
}
