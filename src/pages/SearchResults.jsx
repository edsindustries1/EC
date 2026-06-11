import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { FiArrowRight, FiArrowLeft, FiMapPin, FiCalendar, FiUsers, FiCheck, FiEdit2 } from 'react-icons/fi'
import api from '../utils/api'
import { FadeIn } from '../hooks/useFadeIn'

const BLACK = '#000', WHITE = '#fff'
const GRAY_50 = '#F6F6F6', GRAY_100 = '#EEEEEE', GRAY_300 = '#CFCFCF', GRAY_500 = '#6B6B6B'
const FONT = "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif"

const VEHICLE_META = {
  sedan:        { label: 'Sedan',    examples: 'Lincoln Town Car · Mercedes E-Class',  cap: 'Up to 3 passengers · 2 bags',  features: ['Bottled water', 'Phone chargers'], img: '/images/fleet-sedan.png' },
  suv:          { label: 'SUV',      examples: 'Cadillac Escalade · Suburban',         cap: 'Up to 5 passengers · 5 bags',  features: ['Spacious interior', 'Privacy windows'], img: '/images/fleet-suv.png' },
  sprinter_van: { label: 'Sprinter', examples: 'Mercedes-Benz Sprinter Executive',     cap: 'Up to 14 passengers · 14 bags', features: ['Reclining seats', 'USB ports'], img: '/images/fleet-sprinter.png' },
  mini_bus:     { label: 'Shuttle',  examples: 'Ford E-Series Shuttle',                cap: 'Up to 24 passengers',          features: ['Overhead storage', 'Climate control'], img: '/images/fleet-minibus.png' },
  coach:        { label: 'Coach',    examples: 'Van Hool · MCI · Prevost',             cap: 'Up to 55 passengers',          features: ['Reclining seats', 'Restroom', 'Wi-Fi'], img: '/images/fleet-coach.png' },
}
const capacityOf = (v) => ({ sedan: 3, suv: 5, sprinter_van: 14, mini_bus: 24, coach: 55 }[v] || 3)

function formatDateTime(date, time) {
  if (!date) return ''
  try {
    const d = new Date(`${date}T${time || '12:00'}`)
    return d.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
  } catch { return `${date} ${time || ''}`.trim() }
}

export default function SearchResults() {
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const from = params.get('from') || ''
  const to   = params.get('to')   || ''
  const date = params.get('date') || ''
  const time = params.get('time') || ''
  const pax  = Number(params.get('pax')) || 1
  const trip = params.get('trip') || 'oneway'

  const [loading, setLoading] = useState(true)
  const [options, setOptions] = useState([])
  const [routeType, setRouteType] = useState('local')
  const [err, setErr] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    api.post('/quote/estimate', { pickup: from, dropoff: to })
      .then(({ data }) => {
        if (!active) return
        const opts = data?.data?.options || []
        const fits = opts.filter(o => capacityOf(o.vehicle_type) >= pax)
        setOptions(fits.length ? fits : opts)
        setRouteType(data?.data?.route_type || 'local')
      })
      .catch((e) => setErr(e?.response?.data?.message || 'Could not load pricing'))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [from, to, pax])

  const select = (opt) => {
    const q = new URLSearchParams({ from, to, date, time, pax: String(pax), trip, vehicle: opt.vehicle_type, price: String(opt.point) })
    navigate(`/book-trip/${opt.vehicle_type}?${q.toString()}`)
  }

  if (!from || !to) {
    return (
      <div style={{ background: WHITE, color: BLACK, minHeight: '100vh', fontFamily: FONT, padding: '5rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Missing route</h2>
        <p style={{ color: GRAY_500, marginBottom: 24 }}>We need a pickup and drop-off to show options.</p>
        <Link to="/" style={primaryBtnStyle}><FiArrowLeft size={16}/> Back to search</Link>
      </div>
    )
  }

  return (
    <div style={{ background: WHITE, color: BLACK, minHeight: '100vh', fontFamily: FONT, letterSpacing: '-0.01em' }}>
      {/* Trip summary header */}
      <div style={{ background: WHITE, borderBottom: `1px solid ${GRAY_100}` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12" style={{ padding: '20px 0' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: GRAY_500, fontSize: 12, fontWeight: 600, textDecoration: 'none', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            <FiArrowLeft size={12}/> Edit search
          </Link>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <div className="flex items-center gap-2">
              <span style={{ width: 10, height: 10, background: BLACK, borderRadius: '50%' }}/>
              <span style={{ fontWeight: 700, fontSize: 16 }}>{from}</span>
              <FiArrowRight size={14} style={{ color: GRAY_300 }}/>
              <span style={{ width: 10, height: 10, background: BLACK }}/>
              <span style={{ fontWeight: 700, fontSize: 16 }}>{to}</span>
            </div>
            <div className="flex items-center gap-4" style={{ color: GRAY_500, fontSize: 14 }}>
              <span className="flex items-center gap-1.5"><FiCalendar size={13}/> {formatDateTime(date, time) || 'No date'}</span>
              <span className="flex items-center gap-1.5"><FiUsers size={13}/> {pax} passenger{pax > 1 ? 's' : ''}</span>
              <span style={{ background: BLACK, color: WHITE, padding: '3px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {trip === 'roundtrip' ? 'Round trip' : trip === 'hourly' ? 'Hourly' : 'One way'}
              </span>
            </div>
            <Link to="/" style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, padding: '8px 14px', borderRadius: 999, background: GRAY_50, color: BLACK, textDecoration: 'none' }}>
              <FiEdit2 size={12}/> Edit
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12" style={{ padding: '40px 0 80px' }}>
        <FadeIn>
          <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.4rem)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>
            Choose your vehicle
          </h1>
          <p style={{ color: GRAY_500, fontSize: 16, marginBottom: 32 }}>
            All prices are estimates. Final fare is locked when you reserve.
            {routeType === 'airport' && <span style={pill}>Airport route</span>}
            {routeType === 'long' && <span style={pill}>Long distance</span>}
          </p>
        </FadeIn>

        {loading && <SkeletonGrid />}
        {err && !loading && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px 18px', borderRadius: 999, marginBottom: 24, textAlign: 'center' }}>{err}</div>
        )}

        {!loading && !err && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {options.map((opt, i) => (
              <FadeIn key={opt.vehicle_type} delay={i * 60}>
                <VehicleCard opt={opt} onSelect={() => select(opt)} pax={pax} />
              </FadeIn>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function VehicleCard({ opt, onSelect, pax }) {
  const meta = VEHICLE_META[opt.vehicle_type] || VEHICLE_META.sedan
  const fits = capacityOf(opt.vehicle_type) >= pax
  return (
    <div style={{
      background: WHITE, borderRadius: 20,
      border: `1px solid ${GRAY_100}`,
      overflow: 'hidden', display: 'flex', flexDirection: 'column',
      transition: 'border-color 180ms ease, transform 180ms ease',
    }}
    onMouseEnter={(e) => { e.currentTarget.style.borderColor = BLACK }}
    onMouseLeave={(e) => { e.currentTarget.style.borderColor = GRAY_100 }}
    >
      <div style={{ aspectRatio: '16/9', background: GRAY_50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <img
          src={meta.img}
          alt={meta.label}
          onError={(e) => { e.currentTarget.style.display = 'none' }}
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
        />
      </div>

      <div style={{ padding: '22px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="flex items-start justify-between gap-3" style={{ marginBottom: 8 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 20 }}>{meta.label}</div>
            <div style={{ color: GRAY_500, fontSize: 13, marginTop: 2 }}>{meta.examples}</div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: GRAY_500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>From</div>
            <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1 }}>${opt.low}</div>
            <div style={{ fontSize: 11, color: GRAY_500, marginTop: 2 }}>${opt.low}–${opt.high} est.</div>
          </div>
        </div>

        <div style={{ fontSize: 13, fontWeight: 600, color: fits ? BLACK : '#b91c1c', marginBottom: 12 }}>
          {meta.cap}
        </div>

        <ul style={{ listStyle: 'none', padding: 0, marginBottom: 18 }}>
          {meta.features.map(f => (
            <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: GRAY_500, marginBottom: 4 }}>
              <FiCheck size={13} style={{ color: BLACK }}/> {f}
            </li>
          ))}
        </ul>

        <button onClick={onSelect} style={{ ...primaryBtnStyle, marginTop: 'auto', width: '100%', justifyContent: 'center' }}>
          Reserve <FiArrowRight size={15}/>
        </button>
      </div>
    </div>
  )
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {[1,2,3,4].map(i => (
        <div key={i} style={{ background: WHITE, borderRadius: 8, border: `1px solid ${GRAY_100}`, height: 360, overflow: 'hidden' }} className="animate-pulse">
          <div style={{ height: 180, background: GRAY_50 }}/>
          <div style={{ padding: 20 }}>
            <div style={{ height: 18, background: GRAY_100, borderRadius: 999, marginBottom: 10, width: '50%' }}/>
            <div style={{ height: 14, background: GRAY_50, borderRadius: 999, marginBottom: 18, width: '70%' }}/>
            <div style={{ height: 44, background: GRAY_50, borderRadius: 999 }}/>
          </div>
        </div>
      ))}
    </div>
  )
}

const primaryBtnStyle = {
  background: BLACK, color: WHITE,
  padding: '14px 26px', borderRadius: 999, border: 0,
  fontWeight: 600, fontSize: 14, cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', gap: 8,
  textDecoration: 'none',
}
const pill = {
  marginLeft: 8, padding: '3px 10px', borderRadius: 999,
  background: GRAY_50, color: BLACK,
  fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
}
