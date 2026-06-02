import React, { useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { FiMapPin, FiPhone, FiCheckCircle, FiArrowRight } from 'react-icons/fi'
import { Page } from '../../components/uber'
import { BLACK, WHITE, GRAY_50, GRAY_100, GRAY_500, btnPrimary, btnSecondary } from '../../styles/uber'

export default function BookRide() {
  const location = useLocation()
  const navigate = useNavigate()

  const stateData = location.state || null
  const sessionData = (() => {
    try { const s = sessionStorage.getItem('pendingBidBooking'); return s ? JSON.parse(s) : null } catch { return null }
  })()
  const incoming = stateData || sessionData || {}
  const prefillRide = incoming.rideData || null
  const prefillBid = incoming.selectedBid || null

  useEffect(() => {
    if (incoming.fromBidBoard) {
      try { sessionStorage.removeItem('pendingBidBooking') } catch {}
    }
  }, []) // eslint-disable-line

  // Confirmation view — operator already sent a bid, customer logged in to confirm
  if (prefillBid && prefillRide) {
    return (
      <Page narrow>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <h1 style={{ fontSize: 'clamp(1.7rem, 3vw, 2.3rem)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>
            Confirm your booking
          </h1>
          <p style={{ color: GRAY_500, fontSize: 15, marginBottom: 26 }}>
            Review your trip details and the offer below.
          </p>

          <Block title="Trip summary" icon={<FiCheckCircle size={16}/>}>
            <Row label="Pickup"   value={prefillRide.pickup}/>
            <Row label="Dropoff"  value={prefillRide.dropoff}/>
            {prefillRide.date     && <Row label="Date / time" value={`${prefillRide.date} ${prefillRide.time || ''}`}/>}
            {prefillRide.passengers && <Row label="Passengers" value={prefillRide.passengers}/>}
            {prefillRide.vehicle_type && <Row label="Vehicle" value={prefillRide.vehicle_type}/>}
          </Block>

          <div style={{
            background: BLACK, color: WHITE,
            borderRadius: 12, padding: '22px 24px', marginBottom: 18,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
              Selected offer
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{prefillBid.operator_name || 'Everywhere Transfers'}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{prefillBid.vehicle_type || 'Premium vehicle'}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Ready in ~{prefillBid.eta_minutes || 30} min</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1 }}>${prefillBid.price}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>flat price</div>
              </div>
            </div>
            {prefillBid.notes && (
              <p style={{ marginTop: 14, padding: '10px 12px', background: 'rgba(255,255,255,0.08)', borderRadius: 6, fontSize: 13, fontStyle: 'italic', color: 'rgba(255,255,255,0.85)' }}>
                "{prefillBid.notes}"
              </p>
            )}
          </div>

          <div style={{ background: GRAY_50, border: `1px solid ${GRAY_100}`, borderRadius: 8, padding: '14px 16px', marginBottom: 18, fontSize: 13, color: BLACK }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Ready to confirm?</div>
            <div style={{ color: GRAY_500 }}>Call or message us to complete your booking. Our team will confirm availability and payment details.</div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <a href="tel:+17186586000" style={{ ...btnPrimary, flex: 1, justifyContent: 'center', padding: '15px 22px', fontSize: 15 }}>
              <FiPhone size={15}/> Call to confirm
            </a>
            <a href="https://wa.me/17182196683" target="_blank" rel="noopener noreferrer" style={{ ...btnSecondary, flex: 1, justifyContent: 'center', padding: '15px 22px', fontSize: 15 }}>
              WhatsApp confirm
            </a>
          </div>

          <button onClick={() => navigate('/')} style={{ background: 'transparent', border: 0, color: GRAY_500, marginTop: 18, fontSize: 13, cursor: 'pointer', width: '100%' }}>
            ← Start over
          </button>
        </div>
      </Page>
    )
  }

  // Default — point to the new uber-style search funnel on Home
  return (
    <Page narrow>
      <div style={{ maxWidth: 540, margin: '40px auto 0', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 12 }}>
          Book your ride
        </h1>
        <p style={{ color: GRAY_500, fontSize: 16, marginBottom: 28, lineHeight: 1.5 }}>
          Booking lives on the homepage now. Enter your route, choose a vehicle, and confirm in seconds.
        </p>
        <Link to="/" style={{ ...btnPrimary, padding: '14px 24px', fontSize: 15 }}>
          Go to search <FiArrowRight size={15}/>
        </Link>
        <div style={{ marginTop: 22, fontSize: 14, color: GRAY_500 }}>
          Or view your existing trips on{' '}
          <Link to="/my-rides" style={{ color: BLACK, fontWeight: 600, textDecoration: 'underline' }}>My trips</Link>.
        </div>
      </div>
    </Page>
  )
}

function Block({ title, icon, children }) {
  return (
    <div style={{ background: WHITE, border: `1px solid ${GRAY_100}`, borderRadius: 8, padding: '20px 22px', marginBottom: 14 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
        {icon}{title}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
        {children}
      </div>
    </div>
  )
}
function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
      <span style={{ color: GRAY_500 }}>{label}</span>
      <span style={{ fontWeight: 600, color: BLACK, textAlign: 'right', wordBreak: 'break-word' }}>{value}</span>
    </div>
  )
}
