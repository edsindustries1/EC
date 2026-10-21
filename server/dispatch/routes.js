// HTTP routes for the dispatch integration.

import { db } from '../db.js'
import { bridgeConfig, bridgeEnabled } from './bridgeClient.js'
import { verify } from './signing.js'
import {
  applyTripUpdate, cancelBooking, customerStatus, legsOf, activeLeg,
  queueBooking, sendPendingLegs,
} from './sync.js'

const FINAL_BOOKING = new Set(['completed', 'cancelled', 'no_show'])

// Driver phone numbers are hidden unless the business opts in; customers call
// the dispatch line instead.
export const showDriverPhone = () => process.env.DISPATCH_SHOW_DRIVER_PHONE === 'true'

// What the customer may see about each leg. Internal fields (attempts, send
// errors, dispatch trip ids) stay server-side.
function publicLeg(l) {
  return {
    leg: l.leg,
    status: l.status,
    pickup: l.pickup?.address,
    pickup_coords: l.pickup?.lat != null ? { lat: Number(l.pickup.lat), lng: Number(l.pickup.lng) } : null,
    dropoff: l.dropoff?.address,
    pickup_date: l.pickup_date,
    pickup_time: l.pickup_time,
    car_no: l.car_no || null,
    driver: l.driver ? { first_name: l.driver.first_name || null, phone: showDriverPhone() ? (l.driver.phone || null) : null, photo: l.driver.photo || null } : null,
    job_no: l.job_no || null,
    vehicle: l.vehicle || null,
    location: ['assigned', 'arrived', 'on_board'].includes(l.status) ? (l.location || null) : null,
    eta_minutes: l.eta_minutes ?? null,
    updated_at: l.updated_at || null,
  }
}

function liveView(booking) {
  const legs = legsOf(booking)
  const active = activeLeg(legs)
  return {
    reference: booking.reference,
    status: booking.status,
    dispatch: bridgeEnabled() ? (booking.dispatch_state || 'not_sent') : 'off',
    legs: legs.map(publicLeg),
    active_leg: active ? active.leg : null,
    can_cancel: !FINAL_BOOKING.has(booking.status) && !legs.some(l => l.status === 'on_board'),
  }
}

function canView(booking, user, email) {
  if (user && ['operator', 'admin'].includes(user.role)) return true
  if (user && booking.customer_id != null && String(booking.customer_id) === String(user.id)) return true
  return !!email && booking.email?.toLowerCase() === String(email).toLowerCase()
}

export function registerDispatchRoutes(app, { auth, role, optionalUser }) {
  // Dispatch → app status push. Signed with the shared webhook secret.
  app.post('/api/dispatch/webhook', async (req, res) => {
    const { keyId, webhookSecret } = bridgeConfig()
    const reason = verify({
      keyId,
      secret: webhookSecret,
      headers: req.headers,
      method: 'POST',
      path: '/api/dispatch/webhook',
      body: req.rawBody || '',
    })
    if (reason) {
      console.warn('[dispatch] webhook rejected:', reason)
      return res.status(401).json({ ok: false, error: reason })
    }
    try {
      const { type, trip } = req.body || {}
      if (type !== 'trip.status' || !trip) return res.status(400).json({ ok: false, error: 'unsupported event' })
      const result = await applyTripUpdate(trip)
      // Unknown trips are acknowledged so dispatch does not retry forever.
      res.json({ ok: true, ...result })
    } catch (e) {
      console.error('[dispatch] webhook failed:', e.message)
      res.status(500).json({ ok: false, error: 'processing failed' })
    }
  })

  // Live trip status for the reservation screen (owner, operator, or email match).
  app.get('/api/bookings/:ref/live', async (req, res) => {
    try {
      const booking = await db.getBookingByRef(req.params.ref)
      if (!booking) return res.status(404).json({ message: 'Reservation not found' })
      if (!canView(booking, optionalUser(req), req.query.email)) return res.status(403).json({ message: 'Not allowed' })
      res.json({ success: true, data: liveView(booking) })
    } catch (e) {
      res.status(500).json({ message: 'Live status failed', error: e.message })
    }
  })

  app.post('/api/bookings/:ref/cancel', auth, async (req, res) => {
    try {
      const booking = await db.getBookingByRef(req.params.ref)
      if (!booking) return res.status(404).json({ message: 'Reservation not found' })
      if (!canView(booking, req.user, null)) return res.status(403).json({ message: 'Not allowed' })
      if (FINAL_BOOKING.has(booking.status)) return res.status(409).json({ message: `Reservation is already ${booking.status}` })
      const reason = String(req.body?.reason || 'Cancelled by customer in app').slice(0, 200)
      let updated = await cancelBooking(booking, reason)
      updated = await db.updateBooking(updated.id, { cancelled_at: new Date().toISOString() })
      res.json({ success: true, data: liveView(updated) })
    } catch (e) {
      const status = e.retryable === false ? 409 : 502
      res.status(status).json({ message: e.message || 'Cancel failed' })
    }
  })

  // Operator view: every booking with its dispatch sync state.
  app.get('/api/operator/dispatch', auth, role('operator', 'admin'), async (req, res) => {
    try {
      const bookings = await db.listBookings({})
      res.json({
        success: true,
        enabled: bridgeEnabled(),
        data: bookings.slice(0, 200).map(b => ({
          id: b.id,
          reference: b.reference,
          name: b.name,
          pickup: b.pickup,
          dropoff: b.dropoff,
          pickup_date: b.pickup_date,
          pickup_time: b.pickup_time,
          vehicle_type: b.vehicle_type,
          status: b.status,
          dispatch_state: b.dispatch_state || null,
          dispatch_error: b.dispatch_error || null,
          dispatch_synced_at: b.dispatch_synced_at || null,
          legs: legsOf(b).map(l => ({ ...publicLeg(l), trip_id: l.trip_id, send: l.send, attempts: l.attempts, error: l.error })),
        })),
      })
    } catch (e) {
      res.status(500).json({ message: 'Could not load dispatch state', error: e.message })
    }
  })

  // Operator: (re)send a booking to dispatch — failed sends, or bookings made
  // before the integration was switched on.
  app.post('/api/operator/bookings/:ref/dispatch', auth, role('operator', 'admin'), async (req, res) => {
    try {
      if (!bridgeEnabled()) return res.status(409).json({ message: 'Dispatch integration is switched off' })
      const booking = await db.getBookingByRef(req.params.ref)
      if (!booking) return res.status(404).json({ message: 'Reservation not found' })
      if (FINAL_BOOKING.has(booking.status)) return res.status(409).json({ message: `Reservation is already ${booking.status}` })
      const legs = legsOf(booking)
      let updated
      if (!legs.length) {
        updated = await queueBooking(booking)
      } else {
        for (const l of legs) if (l.send !== 'sent') { l.send = 'queued'; l.attempts = 0; l.error = null }
        updated = await sendPendingLegs(await db.updateBooking(booking.id, { dispatch_legs: JSON.stringify(legs) }))
      }
      res.json({ success: true, data: { reference: updated.reference, status: customerStatus(legsOf(updated), updated.status), dispatch_state: updated.dispatch_state, dispatch_error: updated.dispatch_error } })
    } catch (e) {
      res.status(500).json({ message: 'Dispatch send failed', error: e.message })
    }
  })
}
