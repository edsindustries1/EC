import React, { useEffect, useState, useCallback } from 'react'
import { FiClock, FiTruck, FiMapPin, FiCheckCircle, FiXCircle, FiPhone, FiNavigation, FiCalendar } from 'react-icons/fi'
import toast from 'react-hot-toast'
import api from '../utils/api'
import TileMap from './TileMap'

// Live dispatch status for a reservation: progress, driver card, map, cancel.
// Renders nothing when the dispatch integration is off for this booking.

const BLACK = '#000', WHITE = '#fff'
const GRAY_50 = '#F6F6F6', GRAY_100 = '#EEEEEE', GRAY_500 = '#6B6B6B'
const GREEN = '#0E8345', RED = '#B42318'
const DISPATCH_PHONE = '+17186586000'
const DISPATCH_PHONE_LABEL = '(718) 658-6000'
const POLL_MS = 8000

const STEPS = ['confirmed', 'assigned', 'arrived', 'on_board', 'completed']
const STEP_LABEL = { confirmed: 'Confirmed', assigned: 'Driver assigned', arrived: 'Arrived', on_board: 'On board', completed: 'Completed' }

const LEG_STATE = {
  pending: { title: 'Sending to dispatch', body: 'Your trip is being added to our dispatch board.', icon: FiClock },
  waiting: { title: 'Received by dispatch', body: 'Our dispatch team has your trip and will assign a driver shortly.', icon: FiClock },
  scheduled: { title: 'Scheduled', body: 'Your trip is booked. We assign your driver ahead of pickup and notify you.', icon: FiCalendar },
  offered: { title: 'Assigning your driver', body: 'A driver has been offered your trip and is confirming.', icon: FiClock },
  on_hold: { title: 'Received by dispatch', body: 'Our dispatch team has your trip.', icon: FiClock },
  assigned: { title: 'Driver on the way', body: 'Your driver is heading to the pickup point.', icon: FiTruck },
  arrived: { title: 'Your driver is here', body: 'Your driver has arrived at the pickup point.', icon: FiMapPin },
  on_board: { title: 'On your way', body: 'Enjoy the ride.', icon: FiNavigation },
  completed: { title: 'Trip complete', body: 'Thanks for riding with Everywhere Transfers.', icon: FiCheckCircle },
  cancelled: { title: 'Cancelled', body: 'This trip has been cancelled.', icon: FiXCircle },
  no_show: { title: 'Missed pickup', body: 'Your driver could not find you at pickup. Call dispatch if you still need a ride.', icon: FiXCircle },
}

function stepIndex(status) {
  if (['assigned'].includes(status)) return 1
  if (status === 'arrived') return 2
  if (status === 'on_board') return 3
  if (status === 'completed') return 4
  return 0
}

export default function LiveTrip({ reference, email, onChange }) {
  const [live, setLive] = useState(null)
  const [cancelling, setCancelling] = useState(false)

  const load = useCallback(async () => {
    try {
      const qs = email ? `?email=${encodeURIComponent(email)}` : ''
      const { data } = await api.get(`/bookings/${reference}/live${qs}`)
      setLive(data?.data || null)
      return data?.data
    } catch {
      return null
    }
  }, [reference, email])

  useEffect(() => {
    let timer
    let stopped = false
    const tick = async () => {
      const v = await load()
      if (stopped) return
      if (v && !['completed', 'cancelled', 'no_show'].includes(v.status)) timer = setTimeout(tick, POLL_MS)
    }
    tick()
    return () => { stopped = true; clearTimeout(timer) }
  }, [load])

  useEffect(() => { if (live && onChange) onChange(live) }, [live, onChange])

  if (!live || live.dispatch === 'off' || !live.legs?.length) return null

  const active = live.legs.find(l => l.leg === live.active_leg) || live.legs[0]
  const state = LEG_STATE[active.status] || LEG_STATE.waiting
  const Icon = state.icon
  const isFinal = ['completed', 'cancelled', 'no_show'].includes(active.status)
  const step = stepIndex(active.status)
  const loggedIn = !!localStorage.getItem('token')

  const cancel = async () => {
    if (!window.confirm('Cancel this reservation? Dispatch will be notified immediately.')) return
    setCancelling(true)
    try {
      const { data } = await api.post(`/bookings/${reference}/cancel`, { reason: 'Cancelled by customer in app' })
      setLive(data?.data || null)
      toast.success('Reservation cancelled')
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Could not cancel — please call dispatch')
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div style={{ background: WHITE, border: `1px solid ${GRAY_100}`, borderRadius: 8, padding: '22px 24px', marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 999, background: active.status === 'cancelled' || active.status === 'no_show' ? '#FEF3F2' : GRAY_50, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={20} style={{ color: active.status === 'cancelled' || active.status === 'no_show' ? RED : BLACK }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: GRAY_500, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {live.legs.length > 1 ? (active.leg === 'return' ? 'Return trip' : 'Outbound trip') : 'Live status'}
            {active.job_no ? ` · Job #${active.job_no}` : ''}
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, margin: '2px 0 4px' }}>{state.title}</div>
          <div style={{ fontSize: 14, color: GRAY_500 }}>{state.body}</div>
        </div>
      </div>

      {!['cancelled', 'no_show'].includes(active.status) && (
        <div style={{ display: 'flex', gap: 6, margin: '20px 0 6px' }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ flex: 1 }}>
              <div style={{ height: 4, borderRadius: 4, background: i <= step ? (i === 4 ? GREEN : BLACK) : GRAY_100 }} />
              <div style={{ fontSize: 11, marginTop: 6, color: i <= step ? BLACK : GRAY_500, fontWeight: i === step ? 700 : 500 }}>{STEP_LABEL[s]}</div>
            </div>
          ))}
        </div>
      )}

      {active.driver && ['assigned', 'arrived', 'on_board'].includes(active.status) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 18, padding: 14, background: GRAY_50, borderRadius: 8 }}>
          <div style={{ width: 48, height: 48, borderRadius: 999, background: BLACK, color: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, flexShrink: 0, overflow: 'hidden' }}>
            {active.driver.photo ? <img src={active.driver.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (active.driver.first_name || '?').slice(0, 1)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{active.driver.first_name || 'Your driver'}</div>
            <div style={{ fontSize: 13, color: GRAY_500 }}>
              {[active.vehicle?.color, active.vehicle?.make, active.vehicle?.model].filter(Boolean).join(' ')}
            </div>
            <div style={{ fontSize: 13, marginTop: 2 }}>
              {active.vehicle?.plate && <span style={{ fontFamily: 'monospace', fontWeight: 700, background: WHITE, border: `1px solid ${GRAY_100}`, borderRadius: 4, padding: '1px 6px', marginRight: 8 }}>{active.vehicle.plate}</span>}
              {active.car_no && <span style={{ color: GRAY_500 }}>Car {active.car_no}</span>}
            </div>
          </div>
          {active.status === 'assigned' && active.eta_minutes != null && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1 }}>{active.eta_minutes}<span style={{ fontSize: 13 }}> min</span></div>
              <div style={{ fontSize: 11, color: GRAY_500 }}>away</div>
            </div>
          )}
        </div>
      )}

      {active.location?.lat != null && (
        <div style={{ marginTop: 14, borderRadius: 8, overflow: 'hidden', border: `1px solid ${GRAY_100}` }}>
          <TileMap markers={[
            { label: 'Driver', kind: 'car', lat: Number(active.location.lat), lng: Number(active.location.lng) },
            ...(active.status === 'assigned' && active.pickup_coords ? [{ label: 'Pickup', kind: 'pickup', ...active.pickup_coords }] : []),
          ]} />
          <div style={{ fontSize: 11, color: GRAY_500, padding: '6px 10px' }}>Driver location updates automatically.</div>
        </div>
      )}

      {live.legs.length > 1 && (
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {live.legs.map(l => (
            <div key={l.leg} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13, padding: '8px 10px', borderRadius: 6, background: l.leg === active.leg ? GRAY_50 : WHITE, border: `1px solid ${GRAY_100}` }}>
              <span><strong>{l.leg === 'return' ? 'Return' : 'Outbound'}</strong> · {l.pickup_date} {l.pickup_time}</span>
              <span style={{ color: GRAY_500 }}>{(LEG_STATE[l.status] || LEG_STATE.waiting).title}</span>
            </div>
          ))}
        </div>
      )}

      {!isFinal && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 18 }}>
          <a href={`tel:${DISPATCH_PHONE}`} style={secondaryBtn}><FiPhone size={13} /> Call dispatch {DISPATCH_PHONE_LABEL}</a>
          {live.can_cancel && loggedIn && (
            <button onClick={cancel} disabled={cancelling} style={{ ...secondaryBtn, color: RED, borderColor: '#FECDCA', marginLeft: 'auto' }}>
              <FiXCircle size={13} /> {cancelling ? 'Cancelling…' : 'Cancel reservation'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

const secondaryBtn = {
  background: GRAY_50, color: BLACK,
  padding: '10px 16px', borderRadius: 999,
  border: `1px solid ${GRAY_100}`,
  fontWeight: 600, fontSize: 13, cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', gap: 6,
  textDecoration: 'none',
}
