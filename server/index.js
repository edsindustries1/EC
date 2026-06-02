import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { fileURLToPath } from 'url'
import { join, dirname } from 'path'
import { existsSync } from 'fs'
import { db, initDb } from './db.js'
import { sendWelcomeEmail, sendQuoteConfirmation, sendOperatorNotification } from './emailService.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001
const JWT_SECRET = process.env.JWT_SECRET || 'ec-secret-key-2024'
const DIST = join(__dirname, '../dist')

app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

// ── Serve built frontend static files ────────────────────────────────────────

app.use(express.static(DIST))

// ── HELPERS ───────────────────────────────────────────────────────────────────

function sign(user) {
  const { password, ...safe } = user
  return { token: jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' }), user: safe }
}

function auth(req, res, next) {
  const h = req.headers.authorization
  if (!h?.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' })
  try {
    req.user = jwt.verify(h.slice(7), JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ message: 'Token expired or invalid' })
  }
}

function role(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) return res.status(403).json({ message: 'Forbidden' })
    next()
  }
}

function safe(user) {
  if (!user) return null
  const { password, ...rest } = user
  return rest
}

function qrToLead(qr) {
  return {
    ...qr,
    name: qr.customer_name || qr.name || 'Guest',
    phone: qr.customer_phone || qr.phone || '',
    email: qr.customer_email || qr.email || '',
  }
}

// ── AUTH ──────────────────────────────────────────────────────────────────────

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password required' })
    if (await db.getUserByEmail(email)) return res.status(409).json({ message: 'Email already registered' })
    const hashed = bcrypt.hashSync(password, 10)
    const user = await db.createUser({ name, email, password: hashed, phone: phone || '', role: 'customer' })
    sendWelcomeEmail(name, email).catch(err => console.error('[email] welcome failed:', err.message))
    res.status(201).json(sign(user))
  } catch (e) {
    res.status(500).json({ message: 'Registration failed', error: e.message })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await db.getUserByEmail(email)
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }
    res.json(sign(user))
  } catch (e) {
    res.status(500).json({ message: 'Login failed', error: e.message })
  }
})

app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const user = await db.getUser(req.user.id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ user: safe(user) })
  } catch (e) {
    res.status(500).json({ message: 'Could not fetch user', error: e.message })
  }
})

// ── QUOTE REQUESTS ────────────────────────────────────────────────────────────

app.post('/api/quote-requests', async (req, res) => {
  try {
    const { name, phone, email, pickup, dropoff, ride_date, passengers, vehicle_type } = req.body
    if (!pickup || !dropoff) return res.status(400).json({ message: 'Pickup and dropoff required' })

    const token = req.headers.authorization?.slice(7)
    let customerId = null
    try { if (token) { const d = jwt.verify(token, JWT_SECRET); customerId = d.id } } catch {}

    const qr = await db.createQuoteRequest({
      customer_name: name || 'Guest',
      customer_phone: phone || '',
      customer_email: email || '',
      customer_id: customerId,
      pickup,
      dropoff,
      ride_date,
      passengers: passengers || 1,
      vehicle_type: vehicle_type || 'sedan',
      status: 'pending',
    })
    if (email) {
      sendQuoteConfirmation(name || 'Guest', email, pickup, dropoff, vehicle_type || 'sedan')
        .catch(err => console.error('[email] quote confirmation failed:', err.message))
    }
    sendOperatorNotification({
      name: name || 'Guest',
      email: email || '',
      phone: phone || '',
      pickup,
      dropoff,
      vehicleType: vehicle_type || 'sedan',
      passengers: passengers || 1,
      rideDate: ride_date || '',
    }).catch(err => console.error('[email] operator notification failed:', err.message))
    res.status(201).json({ success: true, data: qr })
  } catch (e) {
    res.status(500).json({ message: 'Could not create quote request', error: e.message })
  }
})

app.get('/api/quote-requests', auth, role('operator', 'admin'), async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query
    const list = await db.listQuoteRequests({ status, search })
    const total = list.length
    const totalPages = Math.ceil(total / Number(limit)) || 1
    const start = (Number(page) - 1) * Number(limit)
    const sliced = list.slice(start, start + Number(limit))
    const items = await Promise.all(sliced.map(async qr => ({
      ...qrToLead(qr),
      bids: await db.getBidsForRequest(qr.id),
    })))
    res.json({ data: items, pagination: { total, totalPages, page: Number(page), limit: Number(limit) } })
  } catch (e) {
    res.status(500).json({ message: 'Could not fetch requests', error: e.message })
  }
})

app.get('/api/quote-requests/:id', async (req, res) => {
  try {
    const qr = await db.getQuoteRequest(req.params.id)
    if (!qr) return res.status(404).json({ message: 'Quote request not found' })
    const bids = await db.getBidsForRequest(qr.id)
    res.json({ success: true, data: { ...qrToLead(qr), bids } })
  } catch (e) {
    res.status(500).json({ message: 'Could not fetch quote request', error: e.message })
  }
})

app.patch('/api/quote-requests/:id', auth, role('operator', 'admin'), async (req, res) => {
  try {
    const { bid_price, eta_minutes, notes, status, vehicle_type, ...rest } = req.body
    const updates = { ...rest }
    if (status) updates.status = status
    if (vehicle_type) updates.vehicle_type = vehicle_type
    if (bid_price) updates.bid_price = Number(bid_price)
    if (eta_minutes) updates.eta_minutes = Number(eta_minutes)
    if (notes !== undefined) updates.notes = notes

    if (bid_price) {
      const operator = await db.getUser(req.user.id)
      await db.createBid({
        quote_request_id: req.params.id,
        operator_id: req.user.id,
        operator_name: operator?.name || 'Everywhere Transfers',
        price: Number(bid_price),
        vehicle_type: vehicle_type || 'sedan',
        eta_minutes: eta_minutes ? Number(eta_minutes) : 30,
        message: notes || '',
        notes: notes || '',
      })
      if (!status) updates.status = 'quoted'
    }

    const updated = await db.updateQuoteRequest(req.params.id, updates)
    if (!updated) return res.status(404).json({ message: 'Not found' })
    res.json({ success: true, data: qrToLead(updated) })
  } catch (e) {
    res.status(500).json({ message: 'Update failed', error: e.message })
  }
})

app.patch('/api/quote-requests/:id/status', auth, role('operator', 'admin'), async (req, res) => {
  try {
    const { status } = req.body
    const updated = await db.updateQuoteRequest(req.params.id, { status })
    if (!updated) return res.status(404).json({ message: 'Not found' })
    res.json({ success: true, data: qrToLead(updated) })
  } catch (e) {
    res.status(500).json({ message: 'Status update failed', error: e.message })
  }
})

// ── BIDS ──────────────────────────────────────────────────────────────────────

app.post('/api/quote-requests/:id/bids', auth, role('operator', 'admin'), async (req, res) => {
  try {
    const qr = await db.getQuoteRequest(req.params.id)
    if (!qr) return res.status(404).json({ message: 'Quote request not found' })
    const operator = await db.getUser(req.user.id)
    const { price, vehicle_type, eta_minutes, message, notes } = req.body
    if (!price) return res.status(400).json({ message: 'Price required' })
    const bid = await db.createBid({
      quote_request_id: qr.id,
      operator_id: req.user.id,
      operator_name: operator?.name || 'Operator',
      price: Number(price),
      vehicle_type: vehicle_type || qr.vehicle_type,
      eta_minutes: eta_minutes ? Number(eta_minutes) : 30,
      message: message || notes || '',
      notes: message || notes || '',
    })
    await db.updateQuoteRequest(qr.id, { status: 'quoted', bid_price: Number(price) })
    res.status(201).json({ success: true, data: bid })
  } catch (e) {
    res.status(500).json({ message: 'Could not submit bid', error: e.message })
  }
})

// ── OPERATOR DASHBOARD ────────────────────────────────────────────────────────

app.get('/api/operator/dashboard', auth, role('operator', 'admin'), async (req, res) => {
  try {
    const all = await db.listQuoteRequests()
    const pending = all.filter(r => r.status === 'pending' || r.status === 'new').length
    const quoted = all.filter(r => r.status === 'quoted' || r.status === 'contacted').length
    const completed = all.filter(r => r.status === 'completed' || r.status === 'booked').length
    const bidLists = await Promise.all(all.map(r => db.getBidsForRequest(r.id)))
    const bids = bidLists.flat()
    const revenue = bids.reduce((s, b) => s + (Number(b.price) || 0), 0)
    res.json({
      data: {
        stats: {
          pending_requests: pending,
          active_bids: quoted,
          completed_rides: completed,
          total_revenue: revenue,
          total_requests: all.length,
        }
      }
    })
  } catch (e) {
    res.status(500).json({ message: 'Could not fetch dashboard', error: e.message })
  }
})

app.get('/api/operator/requests', auth, role('operator', 'admin'), async (req, res) => {
  try {
    const { limit = 10, status, search } = req.query
    const list = (await db.listQuoteRequests({ status, search })).slice(0, Number(limit))
    const enriched = await Promise.all(list.map(async qr => ({
      ...qrToLead(qr),
      bids: await db.getBidsForRequest(qr.id),
    })))
    res.json({ data: enriched })
  } catch (e) {
    res.status(500).json({ message: 'Could not fetch requests', error: e.message })
  }
})

// ── DRIVERS ───────────────────────────────────────────────────────────────────

app.get('/api/drivers', auth, role('operator', 'admin'), async (req, res) => {
  try {
    const opId = req.user.role === 'admin' ? undefined : req.user.id
    res.json({ data: await db.listDrivers(opId) })
  } catch (e) {
    res.status(500).json({ message: 'Could not fetch drivers', error: e.message })
  }
})

app.post('/api/drivers', auth, role('operator', 'admin'), async (req, res) => {
  try {
    const { name, phone, vehicle_type, vehicle, plate } = req.body
    if (!name || !phone) return res.status(400).json({ message: 'Name and phone required' })
    const driver = await db.createDriver({ operator_id: req.user.id, name, phone, vehicle_type: vehicle_type || 'sedan', vehicle: vehicle || '', plate: plate || '', status: 'available' })
    res.status(201).json({ success: true, data: driver })
  } catch (e) {
    res.status(500).json({ message: 'Could not create driver', error: e.message })
  }
})

// ── USERS (admin) ─────────────────────────────────────────────────────────────

app.get('/api/users', auth, role('admin'), async (req, res) => {
  try {
    const users = await db.listUsers()
    res.json({ data: users.map(safe) })
  } catch (e) {
    res.status(500).json({ message: 'Could not fetch users', error: e.message })
  }
})

// ── REVENUE ───────────────────────────────────────────────────────────────────

app.get('/api/revenue', auth, role('operator', 'admin'), async (req, res) => {
  try {
    const requests = await db.listQuoteRequests()
    const completed = requests.filter(r => r.status === 'completed' || r.status === 'booked')
    const bidLists = await Promise.all(completed.map(r => db.getBidsForRequest(r.id)))
    const bids = bidLists.flat()
    const total = bids.reduce((s, b) => s + (Number(b.price) || 0), 0)
    res.json({
      data: {
        total_revenue: total,
        completed_rides: completed.length,
        pending_rides: requests.filter(r => r.status === 'pending').length,
        total_requests: requests.length,
        monthly: [],
      }
    })
  } catch (e) {
    res.status(500).json({ message: 'Could not fetch revenue', error: e.message })
  }
})

// ── BOOKINGS (amtrak-style instant reservation) ──────────────────────────────

const PRICE_TABLE = {
  sedan:        { local: [55, 75],    airport: [75, 110],   long: [150, 220]  },
  suv:          { local: [75, 100],   airport: [95, 140],   long: [200, 280]  },
  sprinter_van: { local: [150, 200],  airport: [175, 250],  long: [380, 480]  },
  mini_bus:     { local: [250, 350],  airport: [300, 400],  long: [600, 800]  },
  coach:        { local: [500, 700],  airport: [600, 800],  long: [1200, 1600] },
}
const AIRPORT_KEYWORDS = ['jfk', 'lga', 'ewr', 'fbo', 'airport', 'laguardia', 'kennedy']
const LONG_KEYWORDS = ['philadelphia', 'connecticut', 'boston', 'hamptons', 'hartford', 'bridgeport', 'stamford', 'providence', 'new jersey', 'jersey city', 'hoboken', 'trenton', 'princeton', 'newark']

function detectRouteType(pickup, dropoff) {
  const combined = `${pickup || ''} ${dropoff || ''}`.toLowerCase()
  if (AIRPORT_KEYWORDS.some(k => combined.includes(k))) return 'airport'
  if (LONG_KEYWORDS.some(k => combined.includes(k))) return 'long'
  return 'local'
}

function priceFor(vehicleType, routeType) {
  const row = PRICE_TABLE[vehicleType] || PRICE_TABLE.sedan
  const [low, high] = row[routeType] || row.local
  return { low, high, point: Math.round((low + high) / 2) }
}

function makeReference() {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const nums = '23456789'
  let ref = 'EC-'
  for (let i = 0; i < 3; i++) ref += letters[Math.floor(Math.random() * letters.length)]
  for (let i = 0; i < 4; i++) ref += nums[Math.floor(Math.random() * nums.length)]
  return ref
}

// Instant price estimate for the search results screen
app.post('/api/quote/estimate', (req, res) => {
  try {
    const { pickup, dropoff } = req.body
    if (!pickup || !dropoff) return res.status(400).json({ message: 'Pickup and dropoff required' })
    const routeType = detectRouteType(pickup, dropoff)
    const options = Object.keys(PRICE_TABLE).map(v => ({
      vehicle_type: v,
      route_type: routeType,
      ...priceFor(v, routeType),
    }))
    res.json({ success: true, data: { route_type: routeType, options } })
  } catch (e) {
    res.status(500).json({ message: 'Estimate failed', error: e.message })
  }
})

// Create a confirmed reservation (amtrak-style — instant, no bid wait)
app.post('/api/bookings', async (req, res) => {
  try {
    const {
      pickup, dropoff, pickup_date, pickup_time, passengers,
      vehicle_type, trip_type, return_date, return_time,
      name, email, phone, flight_number, child_seats, special_requests,
    } = req.body
    if (!pickup || !dropoff) return res.status(400).json({ message: 'Pickup and dropoff required' })
    if (!name || !email || !phone) return res.status(400).json({ message: 'Contact info required' })

    const routeType = detectRouteType(pickup, dropoff)
    const price = priceFor(vehicle_type || 'sedan', routeType)

    let reference
    let collisions = 0
    do {
      reference = makeReference()
      collisions++
      if (collisions > 10) throw new Error('Could not generate unique reference')
    } while (await db.getBookingByRef(reference))

    const token = req.headers.authorization?.slice(7)
    let customerId = null
    try { if (token) customerId = jwt.verify(token, JWT_SECRET).id } catch {}

    const booking = await db.createBooking({
      reference,
      customer_id: customerId,
      name, email, phone,
      pickup, dropoff,
      pickup_date: pickup_date || '',
      pickup_time: pickup_time || '',
      passengers: Number(passengers) || 1,
      vehicle_type: vehicle_type || 'sedan',
      trip_type: trip_type || 'oneway',
      return_date: return_date || '',
      return_time: return_time || '',
      route_type: routeType,
      price_low: price.low,
      price_high: price.high,
      price_quoted: price.point,
      flight_number: flight_number || '',
      child_seats: Number(child_seats) || 0,
      special_requests: special_requests || '',
      status: 'confirmed',
    })

    sendQuoteConfirmation(name, email, pickup, dropoff, vehicle_type || 'sedan')
      .catch(err => console.error('[email] booking confirmation failed:', err.message))
    sendOperatorNotification({
      name, email, phone, pickup, dropoff,
      vehicleType: vehicle_type || 'sedan',
      passengers: Number(passengers) || 1,
      rideDate: `${pickup_date || ''} ${pickup_time || ''}`.trim(),
    }).catch(err => console.error('[email] operator notification failed:', err.message))

    res.status(201).json({ success: true, data: booking })
  } catch (e) {
    res.status(500).json({ message: 'Booking failed', error: e.message })
  }
})

// Lookup by reservation reference (Amtrak-style "Manage Trip")
app.get('/api/bookings/:ref', async (req, res) => {
  try {
    const booking = await db.getBookingByRef(req.params.ref)
    if (!booking) return res.status(404).json({ message: 'Reservation not found' })
    const { email } = req.query
    if (email && booking.email.toLowerCase() !== String(email).toLowerCase()) {
      return res.status(403).json({ message: 'Email does not match this reservation' })
    }
    res.json({ success: true, data: booking })
  } catch (e) {
    res.status(500).json({ message: 'Lookup failed', error: e.message })
  }
})

// Operator-facing booking list
app.get('/api/bookings', auth, role('operator', 'admin'), async (req, res) => {
  try {
    res.json({ data: await db.listBookings(req.query) })
  } catch (e) {
    res.status(500).json({ message: 'Could not fetch bookings', error: e.message })
  }
})

// Customer-facing — their own trips (bookings + quote requests) by email
app.get('/api/my-trips', auth, async (req, res) => {
  try {
    const user = await db.getUser(req.user.id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    const email = user.email.toLowerCase()
    const [allBookings, allQuotes] = await Promise.all([
      db.listBookings({}),
      db.listQuoteRequests({}),
    ])
    const bookings = (allBookings || []).filter(b => b.email?.toLowerCase() === email)
    const quotes = (allQuotes || []).filter(q => q.customer_email?.toLowerCase() === email)
    const items = [
      ...bookings.map(b => ({ kind: 'booking', ...b })),
      ...quotes.map(q => ({ kind: 'quote_request', ...q })),
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    res.json({ success: true, data: items })
  } catch (e) {
    res.status(500).json({ message: 'Could not fetch trips', error: e.message })
  }
})

// ── NOTIFICATIONS (real-time feed for admin/operator) ────────────────────────

// Combined feed of new bookings + quote_requests, newest first.
// Optional `since` (ISO timestamp) returns only items created after that.
app.get('/api/notifications/recent', auth, role('operator', 'admin'), async (req, res) => {
  try {
    const sinceTs = req.query.since ? new Date(req.query.since).getTime() : 0
    const limit = Number(req.query.limit) || 20

    const [allBookings, allQuotes] = await Promise.all([
      db.listBookings({}),
      db.listQuoteRequests({}),
    ])

    const bookings = (allBookings || []).map(b => ({
      id: `b_${b.id}`,
      kind: 'booking',
      reference: b.reference || null,
      title: `New reservation · ${b.reference || b.id}`,
      subtitle: `${b.pickup || ''} → ${b.dropoff || ''}`,
      meta: `${b.name || 'Guest'} · ${b.vehicle_type || 'sedan'} · ${b.passengers || 1} pax`,
      name: b.name, email: b.email, phone: b.phone,
      pickup: b.pickup, dropoff: b.dropoff,
      pickup_date: b.pickup_date, pickup_time: b.pickup_time,
      passengers: b.passengers, vehicle_type: b.vehicle_type,
      flight_number: b.flight_number, special_requests: b.special_requests,
      price: b.price_quoted, price_low: b.price_low, price_high: b.price_high,
      status: b.status,
      created_at: b.created_at,
      link: `/operator/activity#${b.reference || b.id}`,
      raw_id: b.id,
    }))

    const quotes = (allQuotes || []).map(q => ({
      id: `q_${q.id}`,
      kind: 'quote_request',
      reference: null,
      title: `Quote request · ${q.customer_name || 'Guest'}`,
      subtitle: `${q.pickup || ''} → ${q.dropoff || ''}`,
      meta: `${q.vehicle_type || 'sedan'} · ${q.passengers || 1} pax · ${q.status || 'pending'}`,
      name: q.customer_name, email: q.customer_email, phone: q.customer_phone,
      pickup: q.pickup, dropoff: q.dropoff,
      pickup_date: q.ride_date, pickup_time: '',
      passengers: q.passengers, vehicle_type: q.vehicle_type,
      flight_number: '', special_requests: q.notes || '',
      price: q.bid_price || null,
      status: q.status,
      created_at: q.created_at,
      link: `/operator/activity#${q.id}`,
      raw_id: q.id,
    }))

    const combined = [...bookings, ...quotes]
      .filter(item => {
        if (!sinceTs) return true
        const t = new Date(item.created_at).getTime()
        return t > sinceTs
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit)

    const newest = combined[0]?.created_at || new Date().toISOString()

    res.json({
      success: true,
      data: {
        items: combined,
        unread_count: combined.length,
        newest_at: newest,
        server_time: new Date().toISOString(),
      }
    })
  } catch (e) {
    res.status(500).json({ message: 'Notifications failed', error: e.message })
  }
})

// ── HEALTH ────────────────────────────────────────────────────────────────────

app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date().toISOString() }))

// ── SPA FALLBACK — must be last ───────────────────────────────────────────────

app.use((req, res) => {
  const indexPath = join(DIST, 'index.html')
  if (existsSync(indexPath)) {
    res.sendFile(indexPath)
  } else {
    res.status(503).send('Frontend not built. Run: npm run build')
  }
})

// ── START ─────────────────────────────────────────────────────────────────────

async function start() {
  try {
    await initDb()
  } catch (err) {
    console.error('[FATAL] Database init failed:', err.message)
    process.exit(1)
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[API] Server running on port ${PORT}`)
    console.log(`[API] Serving frontend from: ${DIST}`)
    console.log(`[API] NODE_ENV: ${process.env.NODE_ENV || 'development'}`)
  })
}

start()
