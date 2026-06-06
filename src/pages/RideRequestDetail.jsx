/**
 * /ride-request/:id — customer's view of a single posted ride and all
 * the bids that came in. Tap a bid to accept + pay.
 *
 * Uses long-poll style refresh every 8s while the request is open so
 * new bids appear without a manual reload.
 */
import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  FiMapPin, FiClock, FiUsers, FiTruck, FiDollarSign,
  FiArrowRight, FiCheck, FiCheckCircle, FiAlertCircle, FiRefreshCw,
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { Capacitor } from '@capacitor/core'
import { Browser } from '@capacitor/browser'
import { Page } from '../components/uber'
import { BLACK, WHITE, GRAY_50, GRAY_100, GRAY_500, FONT } from '../styles/uber'

const VEHICLE_LABEL = {
  sedan: 'Sedan', suv: 'SUV', sprinter_van: 'Sprinter Van',
  mini_bus: 'Shuttle', coach: 'Coach Bus',
}

const POLL_INTERVAL_MS = 8000

export default function RideRequestDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr]         = useState('')
  const [accepting, setAccepting] = useState(null)
  const pollRef = useRef(null)

  const load = async () => {
    try {
      const res = await api.get(`/ride-requests/${id}`)
      setData(res.data.data)
      setErr('')
    } catch (e) {
      setErr(e?.response?.data?.message || 'Could not load ride request')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  // Auto-refresh while request is still open
  useEffect(() => {
    if (!data || data.status === 'confirmed' || data.status === 'cancelled') return
    pollRef.current = setInterval(load, POLL_INTERVAL_MS)
    return () => clearInterval(pollRef.current)
  }, [data?.status])

  // If the request has been confirmed (a bid was paid), jump to the reservation
  useEffect(() => {
    if (data?.status === 'confirmed' && data?.booking_reference) {
      navigate(`/reservation/${data.booking_reference}`, { replace: true })
    }
  }, [data?.status])

  const acceptBid = async (bid) => {
    if (!bid?.payment_link) {
      toast.error('This offer has no payment link yet')
      return
    }
    setAccepting(bid.id)
    try {
      const { data: res } = await api.post(`/bids/${bid.id}/accept`, { quote_request_id: data.id })
      const paymentUrl = res.payment_url

      // Open the payment page — Capacitor Browser on mobile, regular link on web
      if (Capacitor?.isNativePlatform?.()) {
        await Browser.open({ url: paymentUrl, presentationStyle: 'fullscreen' })
        // After the in-app browser closes, refresh status
        load()
      } else {
        window.location.href = paymentUrl
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Could not accept offer')
    } finally {
      setAccepting(null)
    }
  }

  if (loading) return <Page narrow><div style={{ color: GRAY_500, textAlign: 'center', padding: 40 }}>Loading…</div></Page>
  if (err) return <Page narrow>
    <div style={{ background: '#fee2e2', color: '#991b1b', padding: 14, borderRadius: 8 }}>{err}</div>
    <Link to="/my-rides" style={{ marginTop: 14, display: 'inline-block', color: BLACK, fontWeight: 600 }}>← Back to my trips</Link>
  </Page>
  if (!data) return null

  const openBids = (data.bids || []).filter(b => b.status === 'open' || !b.status)
    .sort((a, b) => Number(a.price) - Number(b.price))

  return (
    <Page narrow>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* Trip card */}
        <div style={{ background: BLACK, color: WHITE, borderRadius: 14, padding: '20px 22px', marginBottom: 18 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            Your ride request · #{data.id}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 17, fontWeight: 700, marginBottom: 6 }}>
            <span style={{ width: 10, height: 10, background: WHITE, borderRadius: '50%', flexShrink: 0 }}/>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{data.pickup}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 17, fontWeight: 700, marginBottom: 12 }}>
            <span style={{ width: 10, height: 10, background: WHITE, flexShrink: 0 }}/>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{data.dropoff}</span>
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {data.ride_date && <span>{data.ride_date} {data.pickup_time || ''}</span>}
            <span><FiUsers size={11} style={{ verticalAlign: -1, marginRight: 4 }}/>{data.passengers || 1} pax</span>
            <span><FiTruck size={11} style={{ verticalAlign: -1, marginRight: 4 }}/>{VEHICLE_LABEL[data.vehicle_type] || data.vehicle_type}</span>
          </div>
        </div>

        {/* Bid list */}
        <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em' }}>
            {openBids.length === 0 ? 'Waiting for offers' : `${openBids.length} ${openBids.length === 1 ? 'offer' : 'offers'}`}
          </h2>
          <button onClick={load} style={{
            background: GRAY_50, border: 0, padding: '8px 12px', borderRadius: 999,
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            <FiRefreshCw size={11}/> Refresh
          </button>
        </div>

        {openBids.length === 0 ? (
          <div style={{
            background: GRAY_50, border: `1px dashed ${GRAY_100}`, borderRadius: 12,
            padding: '36px 20px', textAlign: 'center',
          }}>
            <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>No offers yet</p>
            <p style={{ fontSize: 13, color: GRAY_500, lineHeight: 1.5 }}>
              Our operators have been notified. Most offers arrive within 15 minutes — we'll auto-refresh this page.
            </p>
            <div style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: GRAY_500 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', animation: 'pulse 1.5s ease infinite' }}/>
              Live · checks every 8s
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {openBids.map((bid, i) => (
              <BidCard
                key={bid.id}
                bid={bid}
                bestPrice={i === 0}
                onAccept={() => acceptBid(bid)}
                accepting={accepting === bid.id}
              />
            ))}
          </div>
        )}

        <Link to="/my-rides" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          marginTop: 26, color: GRAY_500, fontSize: 13, fontWeight: 600, textDecoration: 'none',
        }}>
          ← Back to my trips
        </Link>

        <style>{`@keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.4 } }`}</style>
      </div>
    </Page>
  )
}

function BidCard({ bid, bestPrice, onAccept, accepting }) {
  return (
    <div style={{
      background: WHITE, border: `1.5px solid ${bestPrice ? BLACK : GRAY_100}`,
      borderRadius: 12, padding: 18,
      position: 'relative',
    }}>
      {bestPrice && (
        <div style={{
          position: 'absolute', top: -10, left: 16,
          background: BLACK, color: WHITE,
          padding: '3px 10px', borderRadius: 999,
          fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
        }}>
          Best price
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{bid.operator_name || 'Operator'}</div>
          <div style={{ fontSize: 12, color: GRAY_500, marginTop: 2 }}>
            {VEHICLE_LABEL[bid.vehicle_type] || bid.vehicle_type} · Ready in ~{bid.eta_minutes || 30} min
          </div>
          {(bid.message || bid.notes) && (
            <p style={{ fontSize: 13, color: BLACK, marginTop: 10, lineHeight: 1.5, background: GRAY_50, padding: '8px 10px', borderRadius: 6 }}>
              "{bid.message || bid.notes}"
            </p>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: GRAY_500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Offer</div>
          <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.02em' }}>${bid.price}</div>
        </div>
      </div>

      <button
        onClick={onAccept}
        disabled={accepting}
        style={{
          marginTop: 16, width: '100%',
          background: BLACK, color: WHITE,
          padding: '13px 18px', borderRadius: 8, border: 0,
          fontWeight: 700, fontSize: 14, cursor: accepting ? 'wait' : 'pointer',
          opacity: accepting ? 0.7 : 1,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}
      >
        {accepting ? 'Opening payment…' : <>Pay ${bid.price} to accept <FiArrowRight size={14}/></>}
      </button>
    </div>
  )
}
