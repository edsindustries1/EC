import React, { useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { FiCheckCircle, FiMapPin, FiCalendar, FiUsers, FiPhone, FiMail, FiArrowLeft, FiPrinter, FiCopy, FiTruck } from 'react-icons/fi'
import toast from 'react-hot-toast'
import api from '../utils/api'
import CelebrationOverlay from '../components/CelebrationOverlay'
import PoweredBy from '../components/PoweredBy'

const BLACK = '#000', WHITE = '#fff'
const GRAY_50 = '#F6F6F6', GRAY_100 = '#EEEEEE', GRAY_500 = '#6B6B6B'
const FONT = "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif"

const VEHICLE_LABEL = {
  sedan: 'Sedan', suv: 'SUV', sprinter_van: 'Sprinter Van',
  mini_bus: 'Shuttle', coach: 'Coach Bus',
}

export default function Reservation() {
  const { ref } = useParams()
  const [params] = useSearchParams()
  const email = params.get('email') || ''
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [lookupEmail, setLookupEmail] = useState(email)
  // Play the celebration overlay once per fresh load of a confirmed booking
  const [celebrate, setCelebrate] = useState(false)
  const celebratedRef = useRef(false)

  const load = async (emailArg) => {
    setLoading(true)
    setErr('')
    try {
      const url = emailArg ? `/bookings/${ref}?email=${encodeURIComponent(emailArg)}` : `/bookings/${ref}`
      const { data } = await api.get(url)
      setBooking(data?.data || null)
    } catch (e) {
      setErr(e?.response?.data?.message || 'Could not find reservation')
      setBooking(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (ref) load(email) }, [ref])

  // Trigger the celebration overlay the first time we have a confirmed
  // booking in this session. sessionStorage prevents re-firing on refresh
  // or re-navigation.
  useEffect(() => {
    if (!booking || celebratedRef.current) return
    const key = `et:celebrated:${booking.reference}`
    try {
      if (sessionStorage.getItem(key) === '1') return
      sessionStorage.setItem(key, '1')
    } catch {}
    celebratedRef.current = true
    setCelebrate(true)
  }, [booking])

  const copyRef = () => { navigator.clipboard.writeText(ref); toast.success('Reference copied') }

  if (loading) {
    return <div style={{ background: WHITE, fontFamily: FONT, color: GRAY_500, padding: '5rem 1.5rem', textAlign: 'center', minHeight: '100vh' }}>Loading reservation…</div>
  }

  if (err === 'Email does not match this reservation') {
    return (
      <div style={{ background: WHITE, minHeight: '100vh', padding: '5rem 1.5rem', fontFamily: FONT, letterSpacing: '-0.01em' }}>
        <div style={{ maxWidth: 420, margin: '0 auto', textAlign: 'center', background: WHITE, border: `1px solid ${GRAY_100}`, borderRadius: 8, padding: 32 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Verify your email</h2>
          <p style={{ fontSize: 14, color: GRAY_500, marginBottom: 20 }}>Enter the email on reservation <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{ref}</span></p>
          <input
            value={lookupEmail}
            onChange={(e) => setLookupEmail(e.target.value)}
            placeholder="email@example.com"
            style={{ width: '100%', padding: '12px 14px', borderRadius: 999, border: `1px solid ${GRAY_100}`, background: GRAY_50, color: BLACK, fontSize: 14, fontFamily: FONT, outline: 'none', marginBottom: 12 }}
          />
          <button onClick={() => load(lookupEmail)} style={{ ...primaryBtnStyle, width: '100%', justifyContent: 'center' }}>
            View reservation
          </button>
        </div>
      </div>
    )
  }

  if (err || !booking) {
    return (
      <div style={{ background: WHITE, minHeight: '100vh', padding: '5rem 1.5rem', fontFamily: FONT, textAlign: 'center' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Reservation not found</h2>
        <p style={{ fontSize: 14, color: GRAY_500, marginBottom: 24 }}>We couldn’t find a reservation matching <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{ref}</span>.</p>
        <Link to="/" style={primaryBtnStyle}><FiArrowLeft size={16}/> Back to home</Link>
      </div>
    )
  }

  return (
    <div style={{ background: WHITE, color: BLACK, minHeight: '100vh', fontFamily: FONT, letterSpacing: '-0.01em' }}>
      <CelebrationOverlay
        show={celebrate}
        onDone={() => setCelebrate(false)}
        title="Reservation confirmed"
        subtitle="Your chauffeur is on the way"
        icon="car"
        hold={1800}
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-12" style={{ padding: '40px 0 80px' }}>

        {/* Success header */}
        <div style={{ background: BLACK, color: WHITE, borderRadius: 12, padding: '36px 28px', textAlign: 'center', marginBottom: 18 }}>
          <FiCheckCircle size={44} style={{ margin: '0 auto 14px' }} />
          <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>Reservation confirmed</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 22 }}>A confirmation email is on its way to {booking.email}.</p>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, padding: '14px 20px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Reservation #</div>
              <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 22, color: WHITE, letterSpacing: '0.1em' }}>{booking.reference}</div>
            </div>
            <button onClick={copyRef} style={{ background: 'rgba(255,255,255,0.1)', border: 0, padding: 10, borderRadius: 6, color: WHITE, cursor: 'pointer' }} aria-label="Copy">
              <FiCopy size={14}/>
            </button>
          </div>
        </div>

        {/* Trip details */}
        <div style={{ background: WHITE, border: `1px solid ${GRAY_100}`, borderRadius: 8, padding: '22px 24px', marginBottom: 14 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Trip details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
            <Row icon={FiMapPin} label="Pickup"     value={booking.pickup}/>
            <Row icon={FiMapPin} label="Drop-off"   value={booking.dropoff}/>
            <Row icon={FiCalendar} label="When"     value={`${booking.pickup_date || '—'} ${booking.pickup_time || ''}`}/>
            <Row icon={FiUsers}    label="Passengers" value={String(booking.passengers)}/>
            <Row icon={FiTruck}    label="Vehicle"  value={VEHICLE_LABEL[booking.vehicle_type] || booking.vehicle_type} highlight/>
            {booking.flight_number && <Row label="Flight" value={booking.flight_number}/>}
            {booking.special_requests && <Row label="Notes" value={booking.special_requests}/>}
          </div>
        </div>

        {/* Contact + Price */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ marginBottom: 14 }}>
          <div style={{ background: WHITE, border: `1px solid ${GRAY_100}`, borderRadius: 8, padding: '22px 24px' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Contact</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14, color: BLACK }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FiUsers size={13} style={{ color: GRAY_500 }}/> {booking.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FiPhone size={13} style={{ color: GRAY_500 }}/> {booking.phone}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FiMail size={13} style={{ color: GRAY_500 }}/> {booking.email}</div>
            </div>
          </div>
          <div style={{ background: WHITE, border: `1px solid ${GRAY_100}`, borderRadius: 8, padding: '22px 24px' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Estimated total</h3>
            <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1 }}>${booking.price_quoted}</div>
            <div style={{ fontSize: 12, color: GRAY_500, marginTop: 6 }}>Range: ${booking.price_low}–${booking.price_high}</div>
            <div style={{ fontSize: 12, color: GRAY_500, marginTop: 14 }}>Payment collected at trip time. Gratuity included.</div>
          </div>
        </div>

        {/* Next steps */}
        <div style={{ background: WHITE, border: `1px solid ${GRAY_100}`, borderRadius: 8, padding: '22px 24px' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>What happens next</h3>
          <ol style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14, color: BLACK }}>
            <li><strong style={{ color: GRAY_500, marginRight: 8 }}>1.</strong>Our dispatch team confirms your chauffeur within 1 hour.</li>
            <li><strong style={{ color: GRAY_500, marginRight: 8 }}>2.</strong>You receive driver details via SMS and email 24h before pickup.</li>
            <li><strong style={{ color: GRAY_500, marginRight: 8 }}>3.</strong>Driver contacts you 15 minutes before arrival.</li>
          </ol>
          <div style={{ marginTop: 22, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <button onClick={() => window.print()} style={secondaryBtnStyle}>
              <FiPrinter size={13}/> Print
            </button>
            <a href="tel:+17186586000" style={secondaryBtnStyle}>
              <FiPhone size={13}/> Call (718) 658-6000
            </a>
            <Link to="/" style={{ ...primaryBtnStyle, marginLeft: 'auto' }}>
              Book another trip
            </Link>
          </div>
        </div>

        <PoweredBy variant="centered" />
      </div>
    </div>
  )
}

function Row({ icon: Icon, label, value, highlight }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      {Icon && <Icon size={14} style={{ color: highlight ? BLACK : GRAY_500, marginTop: 3 }}/>}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ color: GRAY_500 }}>{label}</span>
        <span style={{ fontWeight: 600, color: BLACK, textAlign: 'right' }}>{value}</span>
      </div>
    </div>
  )
}

const primaryBtnStyle = {
  background: BLACK, color: WHITE,
  padding: '11px 18px', borderRadius: 999, border: 0,
  fontWeight: 600, fontSize: 14, cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', gap: 8,
  textDecoration: 'none',
}
const secondaryBtnStyle = {
  background: GRAY_50, color: BLACK,
  padding: '10px 16px', borderRadius: 999,
  border: `1px solid ${GRAY_100}`,
  fontWeight: 600, fontSize: 13, cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', gap: 6,
  textDecoration: 'none',
}
