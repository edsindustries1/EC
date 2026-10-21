// Keeps app bookings in step with the dispatch system.
//
// A booking becomes one dispatch trip per leg (outbound, plus return for round
// trips). Each leg is created in the dispatcher's trip log as a waiting job;
// dispatchers assign a car exactly as they do for phone bookings. Status comes
// back by signed webhook, with a periodic poll as a safety net.

import { db } from '../db.js'
import { bridge, bridgeEnabled, BridgeError } from './bridgeClient.js'
import { geocode } from './geocode.js'
import { notifyTripUpdate } from './notify.js'

const MAX_SEND_ATTEMPTS = 8
const FINAL = new Set(['completed', 'cancelled', 'no_show'])

// Dispatch status → status the customer sees on the booking.
//   waiting   in the trip log, no car yet
//   scheduled future reservation, released to the trip log at lead time
//   offered   dispatcher typed a car #, driver has not accepted yet
const CUSTOMER_STATUS = {
  pending: 'confirmed',
  waiting: 'confirmed',
  scheduled: 'confirmed',
  offered: 'confirmed',
  on_hold: 'confirmed',
  assigned: 'assigned',
  arrived: 'arrived',
  on_board: 'in_progress',
  completed: 'completed',
  cancelled: 'cancelled',
  no_show: 'no_show',
}

// Vehicle types sent to dispatch. The dispatch side maps each to its own cab
// name (EcBridge config cab_map). Others (mini bus, coach: no fleet cab) stay
// on the operator flow. Override with DISPATCH_VEHICLE_TYPES=sedan,suv,...
export function dispatchableTypes() {
  return String(process.env.DISPATCH_VEHICLE_TYPES || 'sedan,suv,sprinter_van')
    .split(',').map(s => s.trim()).filter(Boolean)
}

// Accounts that must never create jobs in the live trip log (App Store review
// and internal demo logins). DISPATCH_SEND_TEST_ACCOUNTS=true allows them, for
// use against the local mock or staging only.
const TEST_EMAILS = new Set([
  'reviewer@everywheretransfers.com',
  'operator@everywheretransfers.com',
  'admin@everywheretransfers.com',
  ...String(process.env.DISPATCH_TEST_EMAILS || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean),
])

export function isTestBooking(booking) {
  return process.env.DISPATCH_SEND_TEST_ACCOUNTS !== 'true' && TEST_EMAILS.has(String(booking.email || '').toLowerCase())
}

export function legsOf(booking) {
  const legs = booking.dispatch_legs
  if (Array.isArray(legs)) return legs
  if (typeof legs === 'string') {
    try { return JSON.parse(legs) } catch { return [] }
  }
  return []
}

export function activeLeg(legs) {
  return legs.find(l => !FINAL.has(l.status)) || legs[legs.length - 1] || null
}

export function customerStatus(legs, fallback = 'confirmed') {
  if (!legs.length) return fallback
  if (legs.every(l => l.status === 'cancelled')) return 'cancelled'
  if (legs.every(l => l.status === 'completed')) return 'completed'
  const leg = activeLeg(legs)
  if (FINAL.has(leg.status)) {
    // All legs closed: any ridden leg makes the booking completed (e.g.
    // outbound ridden, return cancelled).
    return legs.some(l => l.status === 'completed') ? 'completed' : CUSTOMER_STATUS[leg.status]
  }
  return CUSTOMER_STATUS[leg.status] || fallback
}

function buildLegs(booking, coords) {
  const legs = [{
    leg: 'outbound',
    external_ref: booking.reference,
    pickup: { address: booking.pickup, ...coords.pickup },
    dropoff: { address: booking.dropoff, ...coords.dropoff },
    pickup_date: booking.pickup_date,
    pickup_time: booking.pickup_time,
  }]
  if (booking.trip_type === 'roundtrip' && booking.return_date && booking.return_time) {
    legs.push({
      leg: 'return',
      external_ref: `${booking.reference}-R`,
      pickup: { address: booking.dropoff, ...coords.dropoff },
      dropoff: { address: booking.pickup, ...coords.pickup },
      pickup_date: booking.return_date,
      pickup_time: booking.return_time,
    })
  }
  return legs.map(l => ({ ...l, trip_id: null, send: 'queued', attempts: 0, error: null, status: 'pending' }))
}

// Called right after a booking is saved. Never throws: a dispatch outage must
// not lose the booking, so failed sends stay queued for the poller.
export async function queueBooking(booking) {
  if (!bridgeEnabled()) return booking
  if (isTestBooking(booking)) {
    return db.updateBooking(booking.id, { dispatch_state: 'skipped_test' })
  }
  if (!dispatchableTypes().includes(booking.vehicle_type)) {
    return db.updateBooking(booking.id, { dispatch_state: 'not_dispatchable' })
  }
  const [pickup, dropoff] = await Promise.all([
    geocode(booking.pickup).catch(() => null),
    geocode(booking.dropoff).catch(() => null),
  ])
  const coords = { pickup: pickup || {}, dropoff: dropoff || {} }
  const updated = await db.updateBooking(booking.id, {
    dispatch_state: 'queued',
    dispatch_legs: JSON.stringify(buildLegs(booking, coords)),
    pickup_lat: pickup?.lat ?? null,
    pickup_lng: pickup?.lng ?? null,
    dropoff_lat: dropoff?.lat ?? null,
    dropoff_lng: dropoff?.lng ?? null,
  })
  return sendPendingLegs(updated)
}

function tripPayload(booking, leg) {
  const notes = [
    booking.flight_number && `Flight ${booking.flight_number}`,
    Number(booking.child_seats) > 0 && `${booking.child_seats} child seat(s)`,
    booking.special_requests,
  ].filter(Boolean).join(' | ')
  return {
    external_ref: leg.external_ref,
    booking_reference: booking.reference,
    leg: leg.leg,
    pickup: leg.pickup,
    dropoff: leg.dropoff,
    pickup_date: leg.pickup_date,
    pickup_time: leg.pickup_time,
    passengers: Number(booking.passengers) || 1,
    vehicle_type: booking.vehicle_type,
    passenger: { name: booking.name, phone: booking.phone, email: booking.email },
    notes,
    // Only a dispatch-priced fare goes on the trip; a table estimate is left
    // for the dispatcher to price, exactly as with a phone booking.
    quoted_price: booking.price_source === 'dispatch' && booking.price_quoted != null ? Number(booking.price_quoted) : null,
  }
}

export async function sendPendingLegs(booking) {
  if (!bridgeEnabled() || !booking) return booking
  const legs = legsOf(booking)
  let changed = false
  for (const leg of legs) {
    if (leg.send === 'sent' || (leg.send === 'failed' && leg.attempts >= MAX_SEND_ATTEMPTS)) continue
    leg.attempts += 1
    try {
      const res = await bridge.createTrip(tripPayload(booking, leg))
      leg.send = 'sent'
      leg.trip_id = res.trip.trip_id
      leg.error = null
      mergeTrip(leg, res.trip)
    } catch (e) {
      leg.error = e.message
      leg.send = e instanceof BridgeError && !e.retryable ? 'failed' : (leg.attempts >= MAX_SEND_ATTEMPTS ? 'failed' : 'queued')
      console.error(`[dispatch] send ${leg.external_ref} attempt ${leg.attempts} failed: ${e.message}`)
    }
    changed = true
  }
  if (!changed) return booking
  return saveLegs(booking, legs)
}

function dispatchState(legs) {
  if (legs.every(l => l.send === 'sent')) return 'sent'
  if (legs.some(l => l.send === 'failed')) return 'failed'
  return legs.some(l => l.send === 'sent') ? 'partial' : 'queued'
}

function mergeTrip(leg, trip) {
  if (!trip) return
  leg.status = trip.status || leg.status
  leg.car_no = trip.car_no ?? leg.car_no ?? null
  leg.driver = trip.driver ?? leg.driver ?? null
  leg.vehicle = trip.vehicle ?? leg.vehicle ?? null
  leg.location = trip.location ?? leg.location ?? null
  leg.eta_minutes = trip.eta_minutes ?? null
  leg.fare_total = trip.fare?.total ?? leg.fare_total ?? null
  leg.is_reservation = trip.is_reservation ?? leg.is_reservation
  leg.job_no = trip.job_no ?? leg.job_no ?? null
  // Dispatch may know coordinates the app could not geocode.
  if (trip.pickup_coords?.lat != null && leg.pickup && leg.pickup.lat == null) {
    leg.pickup = { ...leg.pickup, lat: Number(trip.pickup_coords.lat), lng: Number(trip.pickup_coords.lng) }
  }
  leg.seq = trip.seq ?? leg.seq ?? 0
  leg.updated_at = trip.updated_at || new Date().toISOString()
}

async function saveLegs(booking, legs) {
  const before = booking.status
  const status = customerStatus(legs, before)
  const updated = await db.updateBooking(booking.id, {
    dispatch_legs: JSON.stringify(legs),
    dispatch_state: dispatchState(legs),
    dispatch_error: legs.map(l => l.error).filter(Boolean).join('; ') || null,
    dispatch_synced_at: new Date().toISOString(),
    status,
  })
  if (status !== before) {
    notifyTripUpdate(updated, activeLeg(legs), before)
      .catch(err => console.error('[dispatch] notify failed:', err.message))
  }
  return updated
}

// Apply a trip status object (from webhook or poll) to whichever booking leg
// owns it. Out-of-order deliveries are ignored using updated_at.
export async function applyTripUpdate(trip) {
  const ref = String(trip.external_ref || '')
  const bookingRef = ref.replace(/-R$/, '')
  const booking = await db.getBookingByRef(bookingRef)
  if (!booking) return { matched: false }
  const legs = legsOf(booking)
  const leg = legs.find(l => l.external_ref === ref || (trip.trip_id && String(l.trip_id) === String(trip.trip_id)))
  if (!leg) return { matched: false }
  // Out-of-order guard: dispatch numbers every change of a trip (seq).
  if (trip.seq != null && leg.seq != null && Number(trip.seq) < Number(leg.seq)) {
    return { matched: true, stale: true }
  }
  leg.trip_id = leg.trip_id || trip.trip_id
  leg.send = 'sent'
  mergeTrip(leg, trip)
  await saveLegs(booking, legs)
  return { matched: true }
}

export async function cancelBooking(booking, reason) {
  const legs = legsOf(booking)
  // A completed outbound leg does not block cancelling the return leg; a
  // passenger currently on board does.
  const blocked = legs.find(l => l.status === 'on_board')
  if (blocked) throw new BridgeError('This trip is already under way and cannot be cancelled in the app', { retryable: false })
  for (const leg of legs) {
    if (FINAL.has(leg.status)) continue
    if (leg.send === 'sent' && leg.trip_id) {
      const res = await bridge.cancelTrip({ trip_id: leg.trip_id, external_ref: leg.external_ref, reason })
      mergeTrip(leg, res.trip)
    }
    leg.status = 'cancelled'
    leg.send = 'sent'
  }
  if (!legs.length) return db.updateBooking(booking.id, { status: 'cancelled' })
  return saveLegs(booking, legs)
}

// Safety net: retry unsent legs and refresh live trips the webhook may have
// missed. Runs every DISPATCH_POLL_SECONDS (default 60).
let polling = false
export async function pollOnce() {
  if (polling || !bridgeEnabled()) return
  polling = true
  try {
    const bookings = await db.listBookings({})
    const staleBefore = Date.now() - 90 * 1000
    for (const booking of bookings) {
      const legs = legsOf(booking)
      if (!legs.length) continue
      if (legs.some(l => l.send === 'queued')) {
        await sendPendingLegs(booking)
        continue
      }
      const live = legs.filter(l => l.send === 'sent' && l.trip_id && !FINAL.has(l.status))
      if (!live.length) continue
      const synced = booking.dispatch_synced_at ? new Date(booking.dispatch_synced_at).getTime() : 0
      if (synced > staleBefore) continue
      for (const leg of live) {
        try {
          const res = await bridge.tripStatus({ trip_id: leg.trip_id, external_ref: leg.external_ref })
          mergeTrip(leg, res.trip)
        } catch (e) {
          console.error(`[dispatch] poll ${leg.external_ref} failed: ${e.message}`)
        }
      }
      await saveLegs(booking, legs)
    }
  } finally {
    polling = false
  }
}

export function startPoller() {
  if (!bridgeEnabled()) {
    console.log('[dispatch] bridge disabled (set DISPATCH_ENABLED=true and DISPATCH_BRIDGE_*)')
    return
  }
  const seconds = Number(process.env.DISPATCH_POLL_SECONDS) || 60
  console.log(`[dispatch] bridge enabled → ${process.env.DISPATCH_BRIDGE_URL}, polling every ${seconds}s`)
  setInterval(() => pollOnce().catch(e => console.error('[dispatch] poll error:', e.message)), seconds * 1000)
}
