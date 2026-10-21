// Keeps app bookings in step with the dispatch system.
//
// A booking becomes one dispatch trip per leg (outbound, plus return for round
// trips). Each leg is created in the dispatcher's trip log as a waiting job;
// dispatchers assign a car exactly as they do for phone bookings. Status comes
// back by signed webhook, with a periodic poll as a safety net.
//
// Every change to a booking's dispatch state runs inside withBookingLock() and
// re-reads the booking first, so the webhook, the poller and customer actions
// never overwrite each other (single server process).

import { db } from '../db.js'
import { bridge, bridgeEnabled, BridgeError } from './bridgeClient.js'
import { geocode } from './geocode.js'
import { notifyTripUpdate } from './notify.js'

const MAX_SEND_ATTEMPTS = 8
const FINAL = new Set(['completed', 'cancelled', 'no_show'])
const FINAL_BOOKING = new Set(['completed', 'cancelled', 'no_show'])
// Customers may cancel in the app until the driver is at the pickup.
export const CANCEL_BLOCKING = new Set(['arrived', 'on_board'])

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

export function isTestEmail(email) {
  return process.env.DISPATCH_SEND_TEST_ACCOUNTS !== 'true' && TEST_EMAILS.has(String(email || '').toLowerCase())
}

// Checks both the contact email on the form and the logged-in account's email
// (a reviewer could type a different contact email).
async function isTestBooking(booking) {
  if (isTestEmail(booking.email)) return true
  if (booking.customer_id == null) return false
  const user = await db.getUser(booking.customer_id).catch(() => null)
  return isTestEmail(user?.email)
}

export function legsOf(booking) {
  const legs = booking?.dispatch_legs
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

// Older app builds book round trips without a return time; the return leg
// then has to be added by the operator.
function missingReturn(booking) {
  return booking.trip_type === 'roundtrip' && !(booking.return_date && booking.return_time)
}

// ── Per-booking lock ─────────────────────────────────────────────────────────
const locks = new Map()
function withBookingLock(reference, fn) {
  const key = String(reference).toUpperCase()
  const prev = locks.get(key) || Promise.resolve()
  const run = prev.catch(() => {}).then(fn)
  const tail = run.catch(() => {})
  locks.set(key, tail)
  tail.then(() => { if (locks.get(key) === tail) locks.delete(key) })
  return run
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
  const ref = booking.reference
  const prepared = await withBookingLock(ref, async () => {
    const fresh = await db.getBookingByRef(ref)
    if (!fresh || FINAL_BOOKING.has(fresh.status) || legsOf(fresh).length) return fresh
    if (await isTestBooking(fresh)) return db.updateBooking(fresh.id, { dispatch_state: 'skipped_test' })
    if (!dispatchableTypes().includes(fresh.vehicle_type)) return db.updateBooking(fresh.id, { dispatch_state: 'not_dispatchable' })
    const [pickup, dropoff] = await Promise.all([
      geocode(fresh.pickup).catch(() => null),
      geocode(fresh.dropoff).catch(() => null),
    ])
    const coords = { pickup: pickup || {}, dropoff: dropoff || {} }
    return db.updateBooking(fresh.id, {
      dispatch_state: 'queued',
      dispatch_legs: JSON.stringify(buildLegs(fresh, coords)),
      pickup_lat: pickup?.lat ?? null,
      pickup_lng: pickup?.lng ?? null,
      dropoff_lat: dropoff?.lat ?? null,
      dropoff_lng: dropoff?.lng ?? null,
    })
  })
  if (!prepared || prepared.dispatch_state !== 'queued') return prepared
  return sendPendingLegs(ref)
}

function cleanText(s, max) {
  return String(s || '').replace(/[<>"'`]/g, '').replace(/\s+/g, ' ').trim().slice(0, max)
}

function tripPayload(booking, leg) {
  const notes = [
    missingReturn(booking) && 'ROUND TRIP - return time not given, call customer',
    booking.flight_number && `Flight ${cleanText(booking.flight_number, 20)}`,
    Number(booking.child_seats) > 0 && `${Number(booking.child_seats)} child seat(s)`,
    cleanText(booking.special_requests, 160),
  ].filter(Boolean).join(' | ')
  return {
    external_ref: leg.external_ref,
    booking_reference: booking.reference,
    leg: leg.leg,
    pickup: { ...leg.pickup, address: cleanText(leg.pickup?.address, 250) },
    dropoff: leg.dropoff ? { ...leg.dropoff, address: cleanText(leg.dropoff.address, 250) } : null,
    pickup_date: leg.pickup_date,
    pickup_time: leg.pickup_time,
    passengers: Number(booking.passengers) || 1,
    vehicle_type: booking.vehicle_type,
    passenger: { name: cleanText(booking.name, 100), phone: cleanText(booking.phone, 30), email: booking.email },
    notes,
    // Only a dispatch-priced fare goes on the trip; a table estimate is left
    // for the dispatcher to price, exactly as with a phone booking.
    quoted_price: booking.price_source === 'dispatch' && booking.price_quoted != null ? Number(booking.price_quoted) : null,
  }
}

// Sends every queued leg of a booking. Takes the reference and re-reads the
// booking under the lock, so a cancel that happened meanwhile is respected.
export function sendPendingLegs(reference) {
  return withBookingLock(reference, async () => {
    const booking = await db.getBookingByRef(reference)
    if (!bridgeEnabled() || !booking || FINAL_BOOKING.has(booking.status)) return booking
    const legs = legsOf(booking)
    let changed = false
    for (const leg of legs) {
      if (leg.send !== 'queued' || FINAL.has(leg.status)) continue
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
    return changed ? saveLegs(booking, legs) : booking
  })
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
  leg.location = trip.location ?? null
  leg.eta_minutes = trip.eta_minutes ?? null
  leg.fare_total = trip.fare?.total ?? leg.fare_total ?? null
  leg.is_reservation = trip.is_reservation ?? leg.is_reservation
  leg.job_no = trip.job_no ?? leg.job_no ?? null
  leg.cancelled_by = trip.cancelled_by ?? leg.cancelled_by ?? null
  // Dispatch may know coordinates the app could not geocode.
  if (trip.pickup_coords?.lat != null && leg.pickup && leg.pickup.lat == null) {
    leg.pickup = { ...leg.pickup, lat: Number(trip.pickup_coords.lat), lng: Number(trip.pickup_coords.lng) }
  }
  leg.seq = trip.seq ?? leg.seq ?? 0
  leg.updated_at = trip.updated_at || new Date().toISOString()
}

// Must be called inside the booking lock with a freshly read booking.
async function saveLegs(booking, legs, extra = {}) {
  const before = booking.status
  const status = extra.status || customerStatus(legs, before)
  const notes = legs.map(l => l.error).filter(Boolean)
  if (missingReturn(booking)) notes.push('Round trip booked without a return time: add the return leg in the trip log')
  if (extra.note) notes.push(extra.note)
  const updated = await db.updateBooking(booking.id, {
    dispatch_legs: JSON.stringify(legs),
    dispatch_state: dispatchState(legs),
    dispatch_error: notes.join('; ') || null,
    dispatch_synced_at: new Date().toISOString(),
    status,
    ...(extra.cancelled_at ? { cancelled_at: extra.cancelled_at } : {}),
  })
  if (status !== before) {
    notifyTripUpdate(updated, activeLeg(legs), before)
      .catch(err => console.error('[dispatch] notify failed:', err.message))
  }
  return updated
}

// Apply a trip status object (from webhook or poll) to whichever booking leg
// owns it. Out-of-order deliveries are ignored using seq.
export async function applyTripUpdate(trip) {
  const ref = String(trip.external_ref || '')
  const bookingRef = ref.replace(/-R$/, '')
  if (!bookingRef) return { matched: false }
  return withBookingLock(bookingRef, async () => {
    const booking = await db.getBookingByRef(bookingRef)
    if (!booking) return { matched: false }
    const legs = legsOf(booking)
    const leg = legs.find(l => l.external_ref === ref || (trip.trip_id && String(l.trip_id) === String(trip.trip_id)))
    if (!leg) return { matched: false }
    if (trip.seq != null && leg.seq != null && Number(trip.seq) < Number(leg.seq)) {
      return { matched: true, stale: true }
    }
    leg.trip_id = leg.trip_id || trip.trip_id
    leg.send = 'sent'
    mergeTrip(leg, trip)
    await saveLegs(booking, legs)
    return { matched: true }
  })
}

// Customer cancel. Legs are cancelled one by one and the result is saved even
// if a later leg fails, so a partial cancel is never lost.
export function cancelBooking(reference, reason) {
  return withBookingLock(reference, async () => {
    const booking = await db.getBookingByRef(reference)
    if (!booking) throw new BridgeError('Reservation not found', { retryable: false })
    if (FINAL_BOOKING.has(booking.status)) throw new BridgeError(`Reservation is already ${booking.status}`, { retryable: false })
    const legs = legsOf(booking)
    const now = new Date().toISOString()
    if (!legs.length) return db.updateBooking(booking.id, { status: 'cancelled', cancelled_at: now })
    if (legs.some(l => CANCEL_BLOCKING.has(l.status))) {
      throw new BridgeError('Your driver is already at the pickup. Please call dispatch to cancel.', { retryable: false })
    }
    let failure = null
    let note = null
    for (const leg of legs) {
      if (FINAL.has(leg.status)) continue
      if (leg.send === 'sent' && leg.trip_id) {
        if (!bridgeEnabled()) {
          note = `Cancelled in the app while dispatch link was off: cancel ${leg.external_ref} in the trip log`
        } else {
          try {
            const res = await bridge.cancelTrip({ trip_id: leg.trip_id, external_ref: leg.external_ref, reason })
            mergeTrip(leg, res.trip)
          } catch (e) {
            failure = e.status === 409
              ? new BridgeError('Your driver is already on the way to the pickup. Please call dispatch to cancel.', { retryable: false })
              : e
            break
          }
        }
      }
      leg.status = 'cancelled'
      leg.cancelled_by = 'customer'
      leg.send = 'sent'
    }
    const allClosed = legs.every(l => FINAL.has(l.status))
    const saved = await saveLegs(booking, legs, { note, cancelled_at: allClosed ? now : undefined })
    if (failure) throw failure
    return saved
  })
}

// Safety net: retry unsent legs and refresh live trips the webhook may have
// missed. Runs every DISPATCH_POLL_SECONDS (default 60).
let polling = false
export async function pollOnce() {
  if (polling || !bridgeEnabled()) return
  polling = true
  try {
    const candidates = (await db.listBookings({})).filter(b => legsOf(b).length && !FINAL_BOOKING.has(b.status))
    for (const { reference } of candidates) {
      const booking = await db.getBookingByRef(reference)
      const legs = legsOf(booking)
      if (!booking || FINAL_BOOKING.has(booking.status)) continue
      if (legs.some(l => l.send === 'queued' && !FINAL.has(l.status))) {
        await sendPendingLegs(reference)
        continue
      }
      const synced = booking.dispatch_synced_at ? new Date(booking.dispatch_synced_at).getTime() : 0
      if (synced > Date.now() - 90 * 1000) continue
      await withBookingLock(reference, async () => {
        const fresh = await db.getBookingByRef(reference)
        if (!fresh || FINAL_BOOKING.has(fresh.status)) return
        const freshLegs = legsOf(fresh)
        const live = freshLegs.filter(l => l.send === 'sent' && l.trip_id && !FINAL.has(l.status))
        if (!live.length) return
        for (const leg of live) {
          try {
            const res = await bridge.tripStatus({ trip_id: leg.trip_id, external_ref: leg.external_ref })
            if (res.trip?.seq == null || leg.seq == null || Number(res.trip.seq) >= Number(leg.seq)) mergeTrip(leg, res.trip)
          } catch (e) {
            console.error(`[dispatch] poll ${leg.external_ref} failed: ${e.message}`)
          }
        }
        await saveLegs(fresh, freshLegs)
      })
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
  if (!process.env.DISPATCH_WEBHOOK_SECRET) console.warn('[dispatch] DISPATCH_WEBHOOK_SECRET not set: status webhooks will be rejected (poll only)')
  if (!process.env.GOOGLE_PLACES_API_KEY && !process.env.VITE_GOOGLE_MAPS_API_KEY) console.warn('[dispatch] no Google key: trips are sent without coordinates')
  setInterval(() => pollOnce().catch(e => console.error('[dispatch] poll error:', e.message)), seconds * 1000)
}
