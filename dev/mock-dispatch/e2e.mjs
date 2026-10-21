// End-to-end check of the dispatch integration against the local mock.
// Needs the mock (port 4100) and the API (port 3001, DISPATCH_ENABLED=true,
// JSON dev database) running. Run: node dev/mock-dispatch/e2e.mjs

import { signedHeaders } from '../../server/dispatch/signing.js'

const API = process.env.API_URL || 'http://localhost:3001/api'
const MOCK = process.env.MOCK_URL || 'http://localhost:4100'
let failures = 0

function check(name, ok, detail = '') {
  if (!ok) failures++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  — ${detail}` : ''}`)
}
const sleep = ms => new Promise(r => setTimeout(r, ms))

async function api(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(API + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  return { status: res.status, data: await res.json().catch(() => ({})) }
}

async function mockState() { return (await fetch(`${MOCK}/sim/state`)).json() }
async function sim(id, action, body) {
  const res = await fetch(`${MOCK}/sim/${id}/${action}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) })
  return res.json()
}

async function waitFor(fn, label, ms = 15000) {
  const end = Date.now() + ms
  while (Date.now() < end) {
    const v = await fn()
    if (v) return v
    await sleep(500)
  }
  throw new Error(`timed out waiting for ${label}`)
}

async function live(ref, token) { return (await api(`/bookings/${ref}/live`, { token })).data.data }

const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10)
const inThreeDays = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10)

// 1. Log in as the local demo customer (JSON dev database seed).
const CUSTOMER = 'customer@test.com'
const login = await api('/auth/login', { method: 'POST', body: { email: CUSTOMER, password: 'customer123' } })
const token = login.data.token
check('login', !!token)

// 2. Quote comes from dispatch fares.
const quote = await api('/quote/estimate', { method: 'POST', body: { pickup: 'JFK Airport Terminal 4, Queens, NY', dropoff: 'Times Square, Manhattan, NY' } })
const sedan = quote.data.data?.options?.find(o => o.vehicle_type === 'sedan')
const coach = quote.data.data?.options?.find(o => o.vehicle_type === 'coach')
check('quote: sedan priced by dispatch', sedan?.source === 'dispatch', `$${sedan?.point}`)
check('quote: coach falls back to app table', coach?.source === 'table')

// 3. Round-trip booking → two waiting jobs in the trip log.
const booked = await api('/bookings', {
  method: 'POST', token,
  body: {
    pickup: 'JFK Airport Terminal 4, Queens, NY', dropoff: 'Times Square, Manhattan, NY',
    pickup_date: tomorrow, pickup_time: '14:30', passengers: 2, vehicle_type: 'sedan',
    trip_type: 'roundtrip', return_date: inThreeDays, return_time: '09:00',
    name: 'Test Rider', email: CUSTOMER, phone: '2125550100',
    flight_number: 'AA100', child_seats: 1, special_requests: 'Meet at arrivals',
  },
})
const ref = booked.data.data?.reference
check('booking created', booked.status === 201 && !!ref, ref)
check('booking price_source=dispatch', booked.data.data?.price_source === 'dispatch')

const outbound = await waitFor(async () => (await mockState()).trips.find(t => t.external_ref === ref), 'outbound in trip log')
const ret = (await mockState()).trips.find(t => t.external_ref === `${ref}-R`)
check('outbound job in trip log', !!outbound, `Fare# ${outbound.job_no}, ${outbound.status}`)
check('return job in trip log', !!ret && ret.pickup_address.startsWith('Times Square'))
check('app notes visible to dispatcher', outbound.notes.startsWith('APP') && outbound.notes.includes('Flight AA100'))
check('fare on trip = dispatch quote', Number(outbound.fare.total) === Number(sedan?.point))

let l = await waitFor(async () => { const v = await live(ref, token); return v?.dispatch === 'sent' ? v : null }, 'dispatch sent')
check('live view: both legs sent', l.legs.length === 2 && l.status === 'confirmed', l.legs.map(x => x.status).join(','))

// 4. Duplicate create is idempotent.
const path = '/ec_bridge/create_trip'
const dupBody = JSON.stringify({ external_ref: ref, vehicle_type: 'sedan', pickup: { address: 'x' }, pickup_date: tomorrow, pickup_time: '14:30' })
const dup = await (await fetch(MOCK + path, { method: 'POST', headers: signedHeaders('ec-app', 'dev-bridge-secret', 'POST', path, dupBody), body: dupBody })).json()
check('duplicate create returns same trip', dup.duplicate === true && dup.trip.trip_id === String(outbound.id))

// 5. Dispatcher sends to car 101 → offered; driver accepts → assigned with driver card.
await sim(outbound.id, 'send', { car_no: '101' })
l = await waitFor(async () => { const v = await live(ref, token); return v?.legs[0].status === 'offered' ? v : null }, 'offered')
check('car sent → app shows "offered"', l.status === 'confirmed')
await sim(outbound.id, 'accept')
l = await waitFor(async () => { const v = await live(ref, token); return v?.status === 'assigned' ? v : null }, 'assigned')
check('driver accepts → app status assigned', l.legs[0].car_no === '101' && l.legs[0].driver?.first_name === 'Marcus', `${l.legs[0].vehicle?.make} ${l.legs[0].vehicle?.model}`)
check('driver phone hidden by default', l.legs[0].driver?.phone == null)
check('driver location shown', !!l.legs[0].location?.lat)

// 6. Arrived → on board → completed. Booking stays active because the return leg is pending.
await sim(outbound.id, 'arrived')
l = await waitFor(async () => { const v = await live(ref, token); return v?.status === 'arrived' ? v : null }, 'arrived')
check('arrived', true)
await sim(outbound.id, 'onboard')
l = await waitFor(async () => { const v = await live(ref, token); return v?.status === 'in_progress' ? v : null }, 'on board')
check('on board → in_progress', !l.can_cancel)
await sim(outbound.id, 'complete')
l = await waitFor(async () => { const v = await live(ref, token); return v?.legs[0].status === 'completed' ? v : null }, 'outbound completed')
check('outbound completed, return still upcoming', l.status === 'confirmed' && l.active_leg === 'return', l.legs[1].status)

// 7. Customer cancels the return leg from the app.
const cancel = await api(`/bookings/${ref}/cancel`, { method: 'POST', token, body: { reason: 'e2e' } })
check('customer cancel accepted', cancel.status === 200, cancel.data.message || '')
const retAfter = (await mockState()).trips.find(t => t.external_ref === `${ref}-R`)
check('return job cancelled in trip log', retAfter.status === 'cancelled')
check('booking ends completed (outbound ridden, return cancelled)', cancel.data.data?.status === 'completed', cancel.data.data?.status)

// 8. One-way booking, dispatcher-side cancel reaches the app.
const one = await api('/bookings', {
  method: 'POST', token,
  body: { pickup: 'LaGuardia Airport, Queens, NY', dropoff: 'Brooklyn, NY', pickup_date: tomorrow, pickup_time: '08:00', passengers: 1, vehicle_type: 'suv', name: 'Test Rider', email: CUSTOMER, phone: '2125550100' },
})
const ref2 = one.data.data.reference
const t2 = await waitFor(async () => (await mockState()).trips.find(t => t.external_ref === ref2), 'one-way in trip log')
await sim(t2.id, 'cancel')
l = await waitFor(async () => { const v = await live(ref2, token); return v?.status === 'cancelled' ? v : null }, 'dispatcher cancel')
check('dispatcher cancel → app cancelled', !l.can_cancel)

// 9. Coach booking is not sent to dispatch (no fleet cab).
const big = await api('/bookings', {
  method: 'POST', token,
  body: { pickup: 'Manhattan, NY', dropoff: 'Boston, MA', pickup_date: tomorrow, pickup_time: '10:00', passengers: 40, vehicle_type: 'coach', name: 'Group', email: CUSTOMER, phone: '2125550100' },
})
await sleep(1500)
const bigLive = await live(big.data.data.reference, token)
const inLog = (await mockState()).trips.some(t => t.external_ref === big.data.data.reference)
check('coach not dispatched', !inLog && bigLive.dispatch === 'not_dispatchable', bigLive.dispatch)

// 10. Security: forged webhook rejected; live view needs owner/email.
const forged = await fetch(`${API}/dispatch/webhook`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-EC-Key': 'ec-app', 'X-EC-Timestamp': String(Math.floor(Date.now() / 1000)), 'X-EC-Signature': 'ab'.repeat(32) }, body: JSON.stringify({ type: 'trip.status', trip: { external_ref: ref2, status: 'completed' } }) })
check('forged webhook rejected (401)', forged.status === 401)
const anon = await api(`/bookings/${ref}/live`)
check('live view without login/email → 403', anon.status === 403)
const byEmail = await api(`/bookings/${ref}/live?email=${CUSTOMER}`)
check('live view with matching email → 200', byEmail.status === 200)

// 11. Operator sync view.
const op = await api('/auth/login', { method: 'POST', body: { email: 'operator@everywheretransfers.com', password: process.env.E2E_OPERATOR_PASSWORD || 'operator123' } })
const ops = await api('/operator/dispatch', { token: op.data.token })
check('operator dispatch view lists bookings', ops.status === 200 && ops.data.data.some(b => b.reference === ref))

console.log(failures ? `\n${failures} check(s) failed` : '\nAll checks passed')
process.exit(failures ? 1 : 0)
