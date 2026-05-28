import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom'
import { FiArrowLeft, FiArrowRight, FiMapPin, FiCalendar, FiUsers, FiCheck, FiShield, FiLock } from 'react-icons/fi'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'

const BLACK = '#000', WHITE = '#fff'
const GRAY_50 = '#F6F6F6', GRAY_100 = '#EEEEEE', GRAY_300 = '#CFCFCF', GRAY_500 = '#6B6B6B'
const FONT = "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif"

const VEHICLE_LABEL = {
  sedan: 'Sedan', suv: 'SUV', sprinter_van: 'Sprinter Van',
  mini_bus: 'Shuttle', coach: 'Coach Bus',
}
const detectAirport = (t = '') => /(jfk|lga|ewr|airport|fbo|laguardia|kennedy|newark|teterboro|teb)/.test(t.toLowerCase())

export default function BookTrip() {
  const { vehicleId } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth() || {}

  const from = params.get('from') || ''
  const to   = params.get('to')   || ''
  const date = params.get('date') || ''
  const time = params.get('time') || ''
  const pax  = Number(params.get('pax')) || 1
  const trip = params.get('trip') || 'oneway'

  const [name, setName]                       = useState(user?.name || '')
  const [email, setEmail]                     = useState(user?.email || '')
  const [phone, setPhone]                     = useState(user?.phone || '')
  const [flightNumber, setFlightNumber]       = useState('')
  const [childSeats, setChildSeats]           = useState(0)
  const [specialRequests, setSpecialRequests] = useState('')
  const [agree, setAgree]                     = useState(false)

  const [estimate, setEstimate]   = useState({ low: null, high: null, point: null })
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  const showFlightField = useMemo(() => detectAirport(from) || detectAirport(to), [from, to])

  useEffect(() => {
    if (!from || !to) return
    api.post('/quote/estimate', { pickup: from, dropoff: to })
      .then(({ data }) => {
        const opt = (data?.data?.options || []).find(o => o.vehicle_type === vehicleId)
        if (opt) setEstimate(opt)
      })
      .catch(() => {})
  }, [from, to, vehicleId])

  const validate = () => {
    const e = {}
    if (!name.trim())  e.name  = 'Required'
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) e.email = 'Valid email required'
    if (!phone.trim() || phone.replace(/\D/g, '').length < 7) e.phone = 'Valid phone required'
    if (!agree) e.agree = 'Please agree to the terms'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      const { data } = await api.post('/bookings', {
        pickup: from, dropoff: to,
        pickup_date: date, pickup_time: time,
        passengers: pax,
        vehicle_type: vehicleId,
        trip_type: trip,
        name, email, phone,
        flight_number: flightNumber || undefined,
        child_seats: childSeats || 0,
        special_requests: specialRequests || undefined,
      })
      const ref = data?.data?.reference
      if (!ref) throw new Error('No reference returned')
      toast.success(`Reservation ${ref} confirmed`)
      navigate(`/reservation/${ref}?email=${encodeURIComponent(email)}`)
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Booking failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (!from || !to) {
    return (
      <div style={{ background: WHITE, color: BLACK, fontFamily: FONT, padding: '5rem 1.5rem', textAlign: 'center', minHeight: '100vh' }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Missing trip details</h2>
        <Link to="/" style={primaryBtnStyle}><FiArrowLeft size={16}/> Start over</Link>
      </div>
    )
  }

  return (
    <div style={{ background: WHITE, color: BLACK, minHeight: '100vh', fontFamily: FONT, letterSpacing: '-0.01em' }}>
      <div style={{ borderBottom: `1px solid ${GRAY_100}` }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-12" style={{ padding: '20px 0' }}>
          <Link to={`/search?${params.toString()}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: GRAY_500, fontSize: 12, fontWeight: 600, textDecoration: 'none', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            <FiArrowLeft size={12}/> Change vehicle
          </Link>
          <h1 style={{ fontSize: 'clamp(1.6rem, 2.6vw, 2.1rem)', fontWeight: 700, letterSpacing: '-0.02em' }}>Review your trip</h1>
        </div>
      </div>

      <form onSubmit={submit} className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-12" style={{ padding: '32px 0 80px' }}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 space-y-5">
            <Card title="Trip details">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Row icon={FiMapPin} label="Pickup" value={from} />
                <Row icon={FiMapPin} label="Drop-off" value={to} />
                <Row icon={FiCalendar} label="When" value={`${date || '—'} ${time || ''}`} />
                <Row icon={FiUsers} label="Passengers" value={String(pax)} />
                <Row icon={FiCheck} label="Vehicle" value={VEHICLE_LABEL[vehicleId] || vehicleId} highlight />
              </div>
            </Card>

            <Card title="Contact information">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input label="Full name" value={name} onChange={setName} error={errors.name} placeholder="Jane Smith" />
                <Input label="Phone" value={phone} onChange={setPhone} error={errors.phone} placeholder="+1 (212) 555-0100" />
                <Input label="Email" value={email} onChange={setEmail} error={errors.email} placeholder="jane@example.com" type="email" full />
              </div>
              <p style={{ fontSize: 12, color: GRAY_500, marginTop: 10 }}>
                Your reservation reference will be emailed to this address.
              </p>
            </Card>

            <Card title="Trip preferences">
              {showFlightField && (
                <Input label="Flight number (optional)" value={flightNumber} onChange={(v) => setFlightNumber(v.toUpperCase())} placeholder="e.g., DL 1245" full />
              )}
              <div style={{ marginTop: showFlightField ? 12 : 0 }}>
                <Label>Child seats</Label>
                <select value={childSeats} onChange={(e) => setChildSeats(Number(e.target.value))} style={inputStyle()}>
                  {[0,1,2,3].map(n => <option key={n} value={n}>{n} {n===1?'seat':'seats'}</option>)}
                </select>
              </div>
              <div style={{ marginTop: 12 }}>
                <Label>Special requests (optional)</Label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  rows={3}
                  placeholder="Meet at curb, extra luggage, beverage preferences…"
                  style={inputStyle()}
                />
              </div>
            </Card>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 14, color: BLACK, cursor: 'pointer' }}>
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ marginTop: 3 }}/>
              <span>
                I agree to the{' '}
                <Link to="/terms" style={{ fontWeight: 600, textDecoration: 'underline', color: BLACK }}>terms of service</Link>{' '}
                and acknowledge the{' '}
                <Link to="/privacy" style={{ fontWeight: 600, textDecoration: 'underline', color: BLACK }}>privacy policy</Link>.
              </span>
            </label>
            {errors.agree && <div style={{ fontSize: 12, color: '#b91c1c' }}>{errors.agree}</div>}
          </div>

          <div className="lg:col-span-1">
            <div style={{ position: 'sticky', top: 88, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Card title="Price summary">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
                  <PriceRow label="Base fare" value={estimate.point ? `$${estimate.point}` : '—'} />
                  <PriceRow label="Driver gratuity" value="Included" muted />
                  <PriceRow label="Taxes & fees" value="Included" muted />
                  <div style={{ borderTop: `1px solid ${GRAY_100}`, paddingTop: 10, marginTop: 6 }}>
                    <PriceRow label="Estimated total" value={estimate.point ? `$${estimate.point}` : '—'} bold/>
                    {estimate.low && <div style={{ fontSize: 11, color: GRAY_500, marginTop: 4 }}>Range: ${estimate.low}–${estimate.high}</div>}
                  </div>
                </div>
              </Card>

              <button type="submit" disabled={submitting} style={{
                ...primaryBtnStyle,
                width: '100%', justifyContent: 'center',
                padding: '15px 22px', fontSize: 15,
                opacity: submitting ? 0.6 : 1,
                cursor: submitting ? 'not-allowed' : 'pointer',
              }}>
                {submitting ? 'Confirming…' : 'Confirm Reservation'}
                {!submitting && <FiArrowRight size={16}/>}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12, color: GRAY_500 }}>
                <FiLock size={11}/> Secure · Free cancellation up to 4h before
              </div>

              <div style={{ background: GRAY_50, borderRadius: 8, padding: 12, fontSize: 12, color: GRAY_500, display: 'flex', gap: 8 }}>
                <FiShield size={14} style={{ flexShrink: 0, marginTop: 2, color: BLACK }}/>
                <span>Payment is collected at the time of the trip. This is a reservation hold — no card required now.</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

function Card({ title, children }) {
  return (
    <div style={{ background: WHITE, border: `1px solid ${GRAY_100}`, borderRadius: 8, padding: '20px 22px' }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>{title}</h3>
      {children}
    </div>
  )
}
function Row({ icon: Icon, label, value, highlight }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      <Icon size={14} style={{ color: highlight ? BLACK : GRAY_500, marginTop: 3 }}/>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', fontSize: 14 }}>
        <span style={{ color: GRAY_500 }}>{label}</span>
        <span style={{ fontWeight: 600, color: BLACK, textAlign: 'right' }}>{value}</span>
      </div>
    </div>
  )
}
function Label({ children }) {
  return <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: GRAY_500, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{children}</label>
}
function Input({ label, value, onChange, error, placeholder, type = 'text', full }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <Label>{label}</Label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={inputStyle(!!error)}
      />
      {error && <div style={{ fontSize: 12, color: '#b91c1c', marginTop: 4 }}>{error}</div>}
    </div>
  )
}
function PriceRow({ label, value, bold, muted }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ color: muted ? GRAY_500 : BLACK }}>{label}</span>
      <span style={{ fontWeight: bold ? 700 : 600, fontSize: bold ? 18 : 14, color: BLACK }}>{value}</span>
    </div>
  )
}
const inputStyle = (error) => ({
  width: '100%', padding: '11px 12px', borderRadius: 4, fontSize: 14,
  border: `1px solid ${error ? '#b91c1c' : GRAY_100}`,
  background: GRAY_50, color: BLACK, outline: 'none',
  fontFamily: FONT,
})
const primaryBtnStyle = {
  background: BLACK, color: WHITE,
  padding: '13px 22px', borderRadius: 4, border: 0,
  fontWeight: 600, fontSize: 14, cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', gap: 8,
  textDecoration: 'none',
}
