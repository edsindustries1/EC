// Local stand-in for the everywheretrans.com dispatch bridge (EcBridgeController).
// Speaks the same signed JSON contract, keeps trips in dev/mock-dispatch/data.json,
// and serves a trip-log page at http://localhost:4100 where you play dispatcher
// (type a car # and press Enter) and driver (accept, arrived, on board, complete).
// Every status change is pushed to the app's webhook, signed, with retries.
//
//   node dev/mock-dispatch/server.js
//
// Env: MOCK_DISPATCH_PORT (4100), DISPATCH_BRIDGE_KEY, DISPATCH_BRIDGE_SECRET,
//      DISPATCH_WEBHOOK_URL (http://localhost:3001/api/dispatch/webhook),
//      DISPATCH_WEBHOOK_SECRET (defaults to the bridge secret)

import express from 'express'
import crypto from 'crypto'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { verify, signedHeaders } from '../../server/dispatch/signing.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_FILE = process.env.MOCK_DATA_FILE || join(__dirname, 'data.json')
const PORT = Number(process.env.PORT || process.env.MOCK_DISPATCH_PORT) || 4100
const KEY = process.env.DISPATCH_BRIDGE_KEY || 'ec-app'
const SECRET = process.env.DISPATCH_BRIDGE_SECRET || 'dev-bridge-secret'
const WEBHOOK_URL = process.env.DISPATCH_WEBHOOK_URL || 'http://localhost:3001/api/dispatch/webhook'
// Several receivers (app server + phone agent) can be given, comma-separated.
const WEBHOOK_URLS = WEBHOOK_URL.split(',').map(s => s.trim()).filter(Boolean)
const WEBHOOK_SECRET = process.env.DISPATCH_WEBHOOK_SECRET || SECRET
const RESERVATION_LEAD_MIN = 60

// ── Fleet (cars dispatchers can type into the Car # box) ─────────────────────
const FLEET = {
  101: { driver: { first_name: 'Marcus', last_name: 'Reid', phone: '+1 347 555 0101' }, vehicle: { make: 'Lincoln', model: 'Continental', color: 'Black', plate: 'T101234C', cab_name: 'Sedan' }, home: [40.7484, -73.9857] },
  102: { driver: { first_name: 'Anita', last_name: 'Kaur', phone: '+1 347 555 0102' }, vehicle: { make: 'Toyota', model: 'Camry Hybrid', color: 'Black', plate: 'T102877C', cab_name: 'Sedan' }, home: [40.7128, -74.0060] },
  205: { driver: { first_name: 'Diego', last_name: 'Ramos', phone: '+1 347 555 0205' }, vehicle: { make: 'Cadillac', model: 'Escalade', color: 'Black', plate: 'T205551C', cab_name: 'SUV' }, home: [40.6413, -73.7781] },
  206: { driver: { first_name: 'Sam', last_name: 'Okafor', phone: '+1 347 555 0206' }, vehicle: { make: 'Chevrolet', model: 'Suburban', color: 'Black', plate: 'T206118C', cab_name: 'SUV' }, home: [40.7769, -73.8740] },
  310: { driver: { first_name: 'Lena', last_name: 'Vogel', phone: '+1 347 555 0310' }, vehicle: { make: 'Mercedes-Benz', model: 'Sprinter', color: 'Silver', plate: 'T310442C', cab_name: 'Sprinter Van' }, home: [40.6895, -74.1745] },
  420: { driver: { first_name: 'Hector', last_name: 'Diaz', phone: '+1 347 555 0420' }, vehicle: { make: 'Ford', model: 'Transit 15', color: 'White', plate: 'T420090C', cab_name: 'Mini Bus' }, home: [40.7306, -73.9352] },
}

// App vehicle type → cab name (the real bridge reads this from ec_bridge.php).
const CAB_MAP = { sedan: 'Sedan', suv: 'SUV', sprinter_van: 'Sprinter Van' }

// ── Fares (stand-in for company_car_fares): straight-line miles × 1.4 ──────
const RATES = {
  'sedan':        { base: 15, per_mile: 3.25, min: 45 },
  'suv':          { base: 25, per_mile: 4.25, min: 65 },
  'sprinter van': { base: 60, per_mile: 6.0, min: 160 },
  'mini bus':     { base: 120, per_mile: 8.0, min: 260 },
  'coach':        { base: 250, per_mile: 12.0, min: 550 },
}

// Rough coordinates for common NYC-area places when the app sends no lat/lng
// (no Google key in local dev).
const PLACES = [
  ['jfk', 40.6413, -73.7781], ['kennedy', 40.6413, -73.7781], ['laguardia', 40.7769, -73.8740], ['lga', 40.7769, -73.8740],
  ['newark', 40.6895, -74.1745], ['ewr', 40.6895, -74.1745], ['times square', 40.7580, -73.9855], ['manhattan', 40.7831, -73.9712],
  ['brooklyn', 40.6782, -73.9442], ['queens', 40.7282, -73.7949], ['bronx', 40.8448, -73.8648], ['staten island', 40.5795, -74.1502],
  ['hoboken', 40.7440, -74.0324], ['jersey city', 40.7178, -74.0431], ['greenwich', 41.0262, -73.6282], ['stamford', 41.0534, -73.5387],
  ['white plains', 41.0340, -73.7629], ['philadelphia', 39.9526, -75.1652], ['hamptons', 40.9634, -72.1848], ['boston', 42.3601, -71.0589],
]

function coordsFor(point) {
  if (point && Number.isFinite(Number(point.lat)) && Number.isFinite(Number(point.lng))) {
    return { lat: Number(point.lat), lng: Number(point.lng), exact: true }
  }
  const text = String(point?.address || '').toLowerCase()
  const hit = PLACES.find(([k]) => text.includes(k))
  if (hit) return { lat: hit[1], lng: hit[2], exact: false }
  const h = crypto.createHash('md5').update(text).digest()
  return { lat: 40.70 + (h[0] / 255) * 0.12, lng: -74.02 + (h[1] / 255) * 0.14, exact: false }
}

function miles(a, b) {
  const R = 3958.8, rad = d => d * Math.PI / 180
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng)
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(x))
}

function fareFor(cabName, distance) {
  const r = RATES[String(cabName || 'sedan').toLowerCase()] || RATES.sedan
  return Math.max(r.min, Math.round((r.base + r.per_mile * distance) * 100) / 100)
}

// ── Store ────────────────────────────────────────────────────────────────────
let store = existsSync(DATA_FILE) ? JSON.parse(readFileSync(DATA_FILE, 'utf8')) : { next_id: 9001, trips: [], outbox: [] }
const save = () => writeFileSync(DATA_FILE, JSON.stringify(store, null, 2))

// Legacy Triplog.status codes, mirrored so the page reads like the real trip log.
const LEGACY = { waiting: 0, assigned: 1, arrived: 5, on_board: 4, completed: 3, cancelled: 2, no_show: 6, on_hold: 7 }

// Canonical state reported to the app (waiting splits into scheduled/offered).
function stateOf(t) {
  if (t.status !== 'waiting') return t.status
  if (t.car_no) return 'offered'
  return t.is_reservation ? 'scheduled' : 'waiting'
}

function tripView(t) {
  const car = t.car_no && t.status !== 'waiting' ? FLEET[t.car_no] : null
  return {
    trip_id: String(t.id),
    external_ref: t.external_ref,
    status: stateOf(t),
    seq: t.seq || 0,
    job_no: String(t.fare_no),
    legacy_status: LEGACY[t.status],
    fare_no: t.fare_no,
    is_reservation: t.is_reservation,
    pickup_date: t.pickup_date,
    pickup_time: t.pickup_time,
    car_no: car ? String(t.car_no) : null,
    driver: car ? { first_name: car.driver.first_name, phone: car.driver.phone, photo: null } : null,
    vehicle: car ? { make: car.vehicle.make, model: car.vehicle.model, color: car.vehicle.color, plate: car.vehicle.plate } : null,
    location: car && t.location ? { ...t.location } : null,
    eta_minutes: t.status === 'assigned' && t.location ? Math.max(1, Math.round(miles(t.location, t.pickup) * 1.4 / 18 * 60)) : null,
    pickup_coords: { lat: t.pickup.lat, lng: t.pickup.lng },
    fare: { total: t.fare_total },
    updated_at: t.updated_at,
  }
}

// Every change bumps seq and queues a webhook event.
function changed(t) {
  t.seq = (t.seq || 0) + 1
  t.updated_at = new Date().toISOString()
  store.outbox.push({ event_id: crypto.randomUUID(), trip_id: t.id, attempts: 0, next_at: 0 })
  save()
}

function setStatus(t, status) {
  t.status = status
  t.history.push({ status, at: new Date().toISOString() })
  changed(t)
}

// ── Webhook delivery with retries (stand-in for the PHP cron sender) ────────
async function flushOutbox() {
  const now = Date.now()
  for (const ev of [...store.outbox]) {
    if (ev.next_at > now) continue
    const t = store.trips.find(x => x.id === ev.trip_id)
    if (!t) { store.outbox = store.outbox.filter(e => e !== ev); continue }
    const body = JSON.stringify({ event_id: ev.event_id, type: 'trip.status', trip: tripView(t) })
    ev.delivered = ev.delivered || []
    try {
      for (const url of WEBHOOK_URLS) {
        if (ev.delivered.includes(url)) continue
        const path = new URL(url).pathname
        const res = await fetch(url, { method: 'POST', headers: signedHeaders(KEY, WEBHOOK_SECRET, 'POST', path, body), body })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        ev.delivered.push(url)
      }
      store.outbox = store.outbox.filter(e => e !== ev)
      log(`webhook ✓ ${t.external_ref} → ${t.status}`)
    } catch (e) {
      ev.attempts += 1
      ev.next_at = now + Math.min(60000, 2000 * 2 ** ev.attempts)
      if (ev.attempts >= 10) store.outbox = store.outbox.filter(x => x !== ev)
      log(`webhook ✗ ${t.external_ref} (${e.message}) attempt ${ev.attempts}`)
    }
  }
  save()
}
setInterval(() => flushOutbox().catch(() => {}), 2000)

// Simulated driver GPS: the assigned car drives toward pickup, then dropoff.
setInterval(() => {
  let moved = false
  for (const t of store.trips) {
    if (!['assigned', 'on_board'].includes(t.status) || !t.location) continue
    const target = t.status === 'assigned' ? t.pickup : t.dropoff
    const step = 0.12
    t.location = {
      lat: t.location.lat + (target.lat - t.location.lat) * step,
      lng: t.location.lng + (target.lng - t.location.lng) * step,
      updated_at: new Date().toISOString(),
    }
    changed(t)
    moved = true
  }
  if (moved) save()
}, 6000)

const logLines = []
function log(line) {
  const entry = `${new Date().toLocaleTimeString()}  ${line}`
  logLines.unshift(entry)
  logLines.length = Math.min(logLines.length, 40)
  console.log('[mock-dispatch]', line)
}

// ── Bridge API (same contract as EcBridgeController) ────────────────────────
const app = express()
app.use(express.json({ verify: (req, _res, buf) => { req.rawBody = buf.toString('utf8') } }))
app.use(express.urlencoded({ extended: false }))

function bridgeAuth(req, res, next) {
  const reason = verify({ keyId: KEY, secret: SECRET, headers: req.headers, method: 'POST', path: req.path, body: req.rawBody || '' })
  if (reason) return res.status(401).json({ ok: false, error: reason })
  next()
}

function minutesUntil(date, time) {
  const at = new Date(`${date}T${(time || '00:00').slice(0, 5)}:00`)
  return (at.getTime() - Date.now()) / 60000
}

app.post('/ec_bridge/quote', bridgeAuth, (req, res) => {
  const { pickup, dropoff, vehicle_types } = req.body || {}
  if (!pickup?.address || !dropoff?.address) return res.status(422).json({ ok: false, error: 'pickup and dropoff required' })
  const a = coordsFor(pickup), b = coordsFor(dropoff)
  const distance = Math.round(miles(a, b) * 1.4 * 10) / 10
  const types = (Array.isArray(vehicle_types) && vehicle_types.length ? vehicle_types : Object.keys(CAB_MAP)).filter(t => CAB_MAP[t])
  res.json({ ok: true, currency: 'USD', distance_miles: distance, options: types.map(t => ({ vehicle_type: t, cab_name: CAB_MAP[t], price: fareFor(CAB_MAP[t], distance), source: 'mileage', distance_miles: distance })) })
})

app.post('/ec_bridge/create_trip', bridgeAuth, (req, res) => {
  const p = req.body || {}
  if (!CAB_MAP[p.vehicle_type]) return res.status(422).json({ ok: false, error: `vehicle_type '${p.vehicle_type}' is not dispatched` })
  if (!p.external_ref || !p.pickup?.address || !p.pickup_date || !p.pickup_time) {
    return res.status(422).json({ ok: false, error: 'external_ref, pickup, pickup_date and pickup_time are required' })
  }
  const existing = store.trips.find(t => t.external_ref === p.external_ref)
  if (existing) return res.json({ ok: true, duplicate: true, trip: tripView(existing) })
  const pickup = coordsFor(p.pickup), dropoff = coordsFor(p.dropoff || {})
  const today = new Date().toISOString().slice(0, 10)
  const fareNo = store.trips.filter(t => t.created_at.slice(0, 10) === today).length + 1
  const t = {
    id: store.next_id++,
    external_ref: p.external_ref,
    booking_reference: p.booking_reference,
    leg: p.leg,
    fare_no: fareNo,
    pickup_address: p.pickup.address,
    dropoff_address: p.dropoff?.address || '',
    pickup, dropoff,
    pickup_date: p.pickup_date,
    pickup_time: p.pickup_time,
    is_reservation: minutesUntil(p.pickup_date, p.pickup_time) > RESERVATION_LEAD_MIN,
    passengers: p.passengers,
    cab_name: CAB_MAP[p.vehicle_type],
    passenger: p.passenger || {},
    account_no: p.account_no || '',
    voucher_no: p.voucher_no || '',
    notes: `${p.channel === 'phone_ai' ? 'AI CALL' : 'APP'} ${p.booking_reference || p.external_ref}${p.account_no ? ` | ACCT ${p.account_no}` : ''}${p.voucher_no ? ` | VOUCHER ${p.voucher_no}` : ''}${p.notes ? ' | ' + p.notes : ''}`,
    // No dispatch-priced fare from the app → blank; the dispatcher prices it.
    fare_total: p.quoted_price ?? null,
    car_no: null,
    location: null,
    status: 'waiting',
    seq: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    history: [],
  }
  t.history.push({ status: 'waiting', at: t.created_at })
  store.trips.push(t)
  save()
  log(`new app booking ${t.external_ref} → Fare# ${t.fare_no} (${t.is_reservation ? 'reservation' : 'ASAP'})`)
  res.json({ ok: true, trip: tripView(t) })
})

function findTrip(body) {
  return store.trips.find(t => (body.trip_id && String(t.id) === String(body.trip_id)) || (body.external_ref && t.external_ref === body.external_ref))
}

// Caller ID lookup for the phone agent: the caller's recent addresses and open
// trips, matched on the last 10 digits (the real trip log stores mixed formats).
const digits10 = v => String(v || '').replace(/\D/g, '').slice(-10)
const OPEN = ['waiting', 'assigned', 'arrived', 'on_board']

app.post('/ec_bridge/caller_lookup', bridgeAuth, (req, res) => {
  const phone = digits10(req.body?.phone)
  if (phone.length !== 10) return res.status(422).json({ ok: false, error: 'phone required' })
  const mine = store.trips.filter(t => digits10(t.passenger?.phone) === phone).reverse()
  const seen = new Set()
  const recent = []
  for (const t of mine) {
    const key = `${t.pickup_address}|${t.dropoff_address}`
    if (seen.has(key)) continue
    seen.add(key)
    recent.push({ pickup: t.pickup_address, dropoff: t.dropoff_address, cab_name: t.cab_name, last_used: t.created_at })
    if (recent.length === 5) break
  }
  const name = mine.find(t => t.passenger?.name)?.passenger.name || null
  res.json({
    ok: true,
    phone,
    name,
    recent,
    open_trips: mine.filter(t => OPEN.includes(t.status)).map(t => ({ ...tripView(t), pickup_address: t.pickup_address, dropoff_address: t.dropoff_address, cab_name: t.cab_name })),
  })
})

app.post('/ec_bridge/trip_status', bridgeAuth, (req, res) => {
  const t = findTrip(req.body || {})
  if (!t) return res.status(404).json({ ok: false, error: 'trip not found' })
  res.json({ ok: true, trip: tripView(t) })
})

app.post('/ec_bridge/cancel_trip', bridgeAuth, (req, res) => {
  const t = findTrip(req.body || {})
  if (!t) return res.status(404).json({ ok: false, error: 'trip not found' })
  if (['arrived', 'on_board', 'completed', 'no_show'].includes(t.status)) return res.status(409).json({ ok: false, error: 'not_cancellable', state: t.status })
  if (t.status !== 'cancelled') {
    setStatus(t, 'cancelled')
    log(`app cancelled ${t.external_ref}${req.body?.reason ? ` (${req.body.reason})` : ''}`)
  }
  res.json({ ok: true, trip: tripView(t) })
})

// ── Dispatcher + driver simulator page ───────────────────────────────────────
app.post('/sim/:id/:action', (req, res) => {
  const t = store.trips.find(x => String(x.id) === req.params.id)
  if (!t) return res.status(404).json({ ok: false, error: 'trip not found' })
  const a = req.params.action
  const car = String(req.body?.car_no || '').trim()
  const guard = (ok, msg) => { if (!ok) { res.status(409).json({ ok: false, error: msg }); return false } return true }
  if (a === 'send') {
    if (!guard(FLEET[car], `Car ${car} is not in the fleet (try ${Object.keys(FLEET).join(', ')})`)) return
    if (!guard(t.status === 'waiting', 'Only waiting trips can be sent')) return
    t.car_no = car
    changed(t)
    log(`dispatcher sent Fare# ${t.fare_no} to car ${car} (waiting for driver to accept)`)
  } else if (a === 'accept') {
    if (!guard(t.status === 'waiting' && t.car_no, 'Send the trip to a car first')) return
    const [lat, lng] = FLEET[t.car_no].home
    t.location = { lat, lng, updated_at: new Date().toISOString() }
    setStatus(t, 'assigned')
    log(`car ${t.car_no} accepted Fare# ${t.fare_no}`)
  } else if (a === 'arrived') {
    if (!guard(t.status === 'assigned', 'Driver must accept first')) return
    t.location = { ...t.pickup, updated_at: new Date().toISOString() }
    setStatus(t, 'arrived')
  } else if (a === 'onboard') {
    if (!guard(t.status === 'arrived', 'Driver must arrive first')) return
    setStatus(t, 'on_board')
  } else if (a === 'complete') {
    if (!guard(t.status === 'on_board', 'Passenger must be on board first')) return
    setStatus(t, 'completed')
  } else if (a === 'noshow') {
    if (!guard(['assigned', 'arrived'].includes(t.status), 'No-show only after the driver accepted')) return
    setStatus(t, 'no_show')
  } else if (a === 'cancel') {
    if (!guard(!['completed', 'cancelled'].includes(t.status), 'Trip already closed')) return
    setStatus(t, 'cancelled')
  } else if (a === 'unassign') {
    if (!guard(['waiting', 'assigned'].includes(t.status) && t.car_no, 'Nothing to unassign')) return
    t.car_no = null
    t.location = null
    setStatus(t, 'waiting')
  } else {
    return res.status(400).json({ ok: false, error: 'unknown action' })
  }
  if (a !== 'send') log(`Fare# ${t.fare_no} → ${t.status}`)
  res.json({ ok: true, trip: tripView(t) })
})

app.get('/sim/state', (_req, res) => {
  res.json({ trips: [...store.trips].reverse().map(t => ({ ...tripView(t), id: t.id, pickup_address: t.pickup_address, dropoff_address: t.dropoff_address, passenger: t.passenger, cab_name: t.cab_name, notes: t.notes, created_at: t.created_at, pending_car: t.status === 'waiting' ? t.car_no : null })), log: logLines, outbox: store.outbox.length, fleet: FLEET })
})

app.get('/', (_req, res) => res.sendFile(join(__dirname, 'triplog.html')))

app.listen(PORT, () => {
  console.log(`[mock-dispatch] trip log on http://localhost:${PORT}  (bridge key "${KEY}", webhook → ${WEBHOOK_URL})`)
})
