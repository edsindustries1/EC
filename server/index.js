import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { fileURLToPath } from 'url'
import { join, dirname } from 'path'
import { existsSync } from 'fs'
import { db, initDb } from './db.js'
import {
  sendWelcomeEmail,
  sendQuoteConfirmation,
  sendOperatorNotification,
  sendOtpEmail,
  sendBidReceivedEmail,
} from './emailService.js'
import * as Payroc from './payroc.js'

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

// ── PASSWORDLESS OTP AUTH ────────────────────────────────────────────────────

function generateOtp() {
  // 6-digit numeric code, leading zeros allowed
  return String(Math.floor(100000 + Math.random() * 900000))
}

function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// 1) Request a code — sends 6-digit code to the email via Resend
app.post('/api/auth/request-otp', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase()
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' })
    }

    // Rate limit — max 3 codes per email per 60s
    const recent = await db.countRecentOtpRequests(email, 60)
    if (recent >= 3) {
      return res.status(429).json({
        message: 'Too many requests. Wait a minute and try again.',
      })
    }

    const code = generateOtp()
    await db.createOtp({ email, code, ttlSeconds: 600 })

    // Fire-and-forget email — don't block the response on it
    sendOtpEmail(email, code).catch((err) =>
      console.error('[email] OTP send failed:', err.message)
    )

    // Always return success even if email doesn't exist (don't leak account existence)
    res.json({ ok: true, message: 'Code sent. Check your email.' })
  } catch (e) {
    res.status(500).json({ message: 'Could not send code', error: e.message })
  }
})

// 2) Verify code — logs in if user exists, returns signup_token if new
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase()
    const code = String(req.body?.code || '').trim()
    if (!isValidEmail(email) || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ message: 'Email and 6-digit code required' })
    }

    const otp = await db.getActiveOtp(email)
    if (!otp) {
      return res.status(400).json({ message: 'Code expired or not found. Request a new one.' })
    }
    if ((otp.attempts || 0) >= 5) {
      return res.status(400).json({ message: 'Too many wrong attempts. Request a new code.' })
    }
    if (otp.code !== code) {
      await db.incrementOtpAttempts(otp.id)
      return res.status(400).json({ message: 'Incorrect code. Try again.' })
    }

    // Code is valid — consume it
    await db.consumeOtp(otp.id)

    // Existing user → log them in
    const existing = await db.getUserByEmail(email)
    if (existing) {
      console.log(`[auth] verify-otp OK — existing user logged in: ${email} (id=${existing.id})`)
      const { token, user } = sign(existing)
      return res.json({ ok: true, token, user })
    }

    // New user — issue a short-lived signup token they'll exchange for an account
    console.log(`[auth] verify-otp OK — new user, requires profile: ${email}`)
    const signupToken = jwt.sign(
      { email, purpose: 'signup' },
      JWT_SECRET,
      { expiresIn: '10m' }
    )
    res.json({ ok: true, needs_profile: true, signup_token: signupToken, email })
  } catch (e) {
    res.status(500).json({ message: 'Verification failed', error: e.message })
  }
})

// 3) Complete signup — exchange signup_token + profile data for a real account
app.post('/api/auth/complete-signup', async (req, res) => {
  try {
    const { signup_token, name, phone } = req.body || {}
    if (!signup_token) return res.status(400).json({ message: 'Missing signup token' })
    if (!name?.trim()) return res.status(400).json({ message: 'Name required' })

    let payload
    try {
      payload = jwt.verify(signup_token, JWT_SECRET)
    } catch {
      return res.status(401).json({ message: 'Signup link expired. Request a new code.' })
    }
    if (payload.purpose !== 'signup' || !payload.email) {
      return res.status(401).json({ message: 'Invalid signup token' })
    }

    // Defensive — guard against someone signing up twice in parallel
    const existing = await db.getUserByEmail(payload.email)
    if (existing) {
      console.log(`[auth] complete-signup short-circuit — user already exists: ${payload.email} (id=${existing.id})`)
      const { token, user } = sign(existing)
      return res.json({ ok: true, token, user })
    }

    let created
    try {
      created = await db.createUser({
        name: name.trim(),
        email: payload.email,
        phone: (phone || '').trim(),
        // No password — passwordless account. We store a random unguessable hash
        // so the password column stays NOT NULL and traditional /auth/login is
        // safely impossible (no one can ever match a 64-byte random hash).
        password: bcrypt.hashSync(Math.random().toString(36) + Date.now(), 10),
        role: 'customer',
      })
    } catch (insertErr) {
      // Most likely cause: race condition (parallel signup) hit the UNIQUE
      // email constraint. Recover by fetching the row that just won the race.
      console.warn(`[auth] complete-signup insert failed (${insertErr.message}) — recovering by re-fetching`)
      const recovered = await db.getUserByEmail(payload.email)
      if (recovered) {
        const { token, user } = sign(recovered)
        return res.json({ ok: true, token, user })
      }
      throw insertErr
    }
    console.log(`[auth] complete-signup OK — new user created: ${created.email} (id=${created.id})`)

    sendWelcomeEmail(created.name, created.email).catch((err) =>
      console.error('[email] welcome failed:', err.message)
    )

    const { token, user } = sign(created)
    res.status(201).json({ ok: true, token, user })
  } catch (e) {
    res.status(500).json({ message: 'Signup failed', error: e.message })
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

// Admin-only diagnostic: look up a single user by email — case insensitive.
// Used to debug "the system doesn't recognize my account" reports.
app.get('/api/users/by-email', auth, role('admin'), async (req, res) => {
  try {
    const email = String(req.query.email || '').trim().toLowerCase()
    if (!email) return res.status(400).json({ message: 'email query param required' })
    const user = await db.getUserByEmail(email)
    if (!user) return res.json({ found: false, normalised_lookup: email })
    res.json({ found: true, normalised_lookup: email, user: safe(user) })
  } catch (e) {
    res.status(500).json({ message: 'Lookup failed', error: e.message })
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

// Create a confirmed reservation (amtrak-style — instant, no bid wait).
// Auth required — a customer account is mandatory before any reservation.
app.post('/api/bookings', auth, async (req, res) => {
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

    // JWT user is the authoritative customer_id, even if name/email/phone
    // in the form differ (e.g. customer booking on behalf of someone else)
    const customerId = req.user.id

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

// ── GOOGLE PLACES PROXY ──────────────────────────────────────────────────────
//
// Calls Google Places Autocomplete REST API server-side. This avoids the
// retired client-side AutocompleteService widget AND eliminates the
// HTTP-referrer cross-origin pain on Capacitor (capacitor://localhost
// doesn't reliably match referrer restrictions).
//
// Key resolution:
//   - GOOGLE_PLACES_API_KEY    — preferred, dedicated server key (no
//                                referrer restriction, IP-restricted)
//   - VITE_GOOGLE_MAPS_API_KEY — fallback (the existing client key)
//
// If the client key has HTTP referrer restrictions, server calls will
// 403. In that case, set GOOGLE_PLACES_API_KEY to a separate key with
// no application restriction (server-side).

const GOOGLE_KEY = process.env.GOOGLE_PLACES_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || ''

app.get('/api/places/autocomplete', async (req, res) => {
  try {
    const q = String(req.query.q || '').trim()
    if (!q || q.length < 2) return res.json({ success: true, data: [] })
    if (!GOOGLE_KEY) return res.json({ success: true, data: [], fallback: 'photon' })

    const params = new URLSearchParams({
      input: q,
      key: GOOGLE_KEY,
      // No `types` filter — Google rejects mixed types and returns nothing
    })
    // Optional session token from client (helps Google bill cheaper)
    if (req.query.session) params.set('sessiontoken', String(req.query.session))

    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params.toString()}`
    const resp = await fetch(url)
    const data = await resp.json()

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.warn('[places] non-OK:', data.status, data.error_message || '')
      return res.json({
        success: false,
        status: data.status,
        error: data.error_message,
        data: [],
      })
    }

    const items = (data.predictions || []).map(p => ({
      key:   p.place_id,
      label: p.structured_formatting?.main_text || p.description,
      sub:   p.structured_formatting?.secondary_text || '',
      full:  p.description,
    }))
    res.json({ success: true, status: data.status, data: items })
  } catch (e) {
    console.error('[places] proxy error:', e.message)
    res.json({ success: false, error: e.message, data: [] })
  }
})

// ── BID MARKETPLACE (GetTransfer-style) ──────────────────────────────────────

function makeReferenceUnique() {
  return makeReference()
}

// 1) Customer posts a ride request — auth required (signup-gated as agreed)
app.post('/api/ride-requests', auth, async (req, res) => {
  try {
    const { pickup, dropoff, ride_date, pickup_time, passengers, vehicle_type, notes, budget_max } = req.body
    if (!pickup || !dropoff) return res.status(400).json({ message: 'Pickup and drop-off required' })

    const customer = await db.getUser(req.user.id)
    if (!customer) return res.status(401).json({ message: 'Account not found' })

    const qr = await db.createQuoteRequest({
      customer_id: req.user.id,
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: customer.phone,
      pickup,
      dropoff,
      ride_date: ride_date || null,
      pickup_time: pickup_time || null,
      passengers: Number(passengers) || 1,
      vehicle_type: vehicle_type || 'sedan',
      notes: notes || null,
      budget_max: budget_max ? Number(budget_max) : null,
      status: 'open',
    })

    // Notify operators (uses existing operator notification email)
    sendOperatorNotification({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      pickup,
      dropoff,
      vehicleType: vehicle_type || 'sedan',
      passengers: Number(passengers) || 1,
      rideDate: `${ride_date || ''} ${pickup_time || ''}`.trim(),
    }).catch(err => console.error('[email] operator notification failed:', err.message))

    res.status(201).json({ success: true, data: qr })
  } catch (e) {
    res.status(500).json({ message: 'Could not post ride', error: e.message })
  }
})

// Customer: list their own ride requests with bids
app.get('/api/ride-requests/my', auth, async (req, res) => {
  try {
    const requests = await db.listMyRideRequests(req.user.id)
    const enriched = await Promise.all(requests.map(async (qr) => {
      const bids = await db.getBidsForRequest(qr.id)
      return { ...qr, bids }
    }))
    res.json({ success: true, data: enriched })
  } catch (e) {
    res.status(500).json({ message: 'Could not fetch your ride requests', error: e.message })
  }
})

// Customer: one ride request with full bid list (used on /ride-request/:id)
app.get('/api/ride-requests/:id', auth, async (req, res) => {
  try {
    const qr = await db.getQuoteRequest(req.params.id)
    if (!qr) return res.status(404).json({ message: 'Ride request not found' })
    if (String(qr.customer_id) !== String(req.user.id) && req.user.role === 'customer') {
      return res.status(403).json({ message: 'Not your request' })
    }
    const bids = await db.getBidsForRequest(qr.id)
    res.json({ success: true, data: { ...qr, bids } })
  } catch (e) {
    res.status(500).json({ message: 'Could not fetch request', error: e.message })
  }
})

// 2) Operator submits a bid — creates Payroc payment session + emails customer
app.post('/api/operator/bids', auth, role('operator', 'admin'), async (req, res) => {
  try {
    const { quote_request_id, price, eta_minutes, vehicle_type, notes } = req.body
    if (!quote_request_id || !price) {
      return res.status(400).json({ message: 'quote_request_id and price required' })
    }

    const qr = await db.getQuoteRequest(quote_request_id)
    if (!qr) return res.status(404).json({ message: 'Ride request not found' })
    if (qr.status === 'confirmed') {
      return res.status(409).json({ message: 'This ride has already been confirmed by another offer' })
    }

    const operator = await db.getUser(req.user.id)
    const amountCents = Math.round(Number(price) * 100)

    // Create the bid first so we have an ID to associate with the payment session
    const bid = await db.createBid({
      quote_request_id,
      operator_id: req.user.id,
      operator_name: operator?.name || 'Everywhere Transfers',
      price: Number(price),
      vehicle_type: vehicle_type || qr.vehicle_type || 'sedan',
      eta_minutes: eta_minutes ? Number(eta_minutes) : 30,
      message: notes || '',
      notes: notes || '',
    })

    // Mark quote_request as 'quoted' so it leaves the unanswered queue
    if (qr.status !== 'quoted') {
      await db.updateQuoteRequest(quote_request_id, { status: 'quoted' })
    }

    // Generate Payroc payment session (mock-mode-aware)
    const session = await Payroc.createPaymentSession({
      amountCents,
      currency: 'USD',
      description: `Everywhere Transfers ride: ${qr.pickup} → ${qr.dropoff}`,
      customerEmail: qr.customer_email,
      customerName: qr.customer_name,
      metadata: { bid_id: String(bid.id), quote_request_id: String(qr.id) },
      successReturnUrl: `${process.env.BASE_URL || 'https://www.everywheretransfers.com'}/payment-return?bid=${bid.id}`,
    })

    // Persist Payroc session info on the bid + set 30min expiry
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString()
    await db.setBidPayment(bid.id, {
      paymentSessionId: session.sessionId,
      paymentLink: session.paymentUrl,
      expiresAt,
    })

    // Email customer the offer with payment link
    sendBidReceivedEmail({
      to: qr.customer_email,
      customerName: qr.customer_name,
      pickup: qr.pickup,
      dropoff: qr.dropoff,
      operatorName: operator?.name || 'Everywhere Transfers',
      amount: Number(price),
      etaMinutes: eta_minutes ? Number(eta_minutes) : 30,
      paymentUrl: session.paymentUrl,
      expiresInMinutes: 30,
    }).catch(err => console.error('[email] bid email failed:', err.message))

    res.status(201).json({
      success: true,
      data: { ...bid, payment_session_id: session.sessionId, payment_link: session.paymentUrl, expires_at: expiresAt },
      payroc_mode: Payroc.environmentLabel(),
    })
  } catch (e) {
    res.status(500).json({ message: 'Could not submit bid', error: e.message })
  }
})

// 3) Customer accepts a bid — verifies ownership, returns payment URL.
// Actual booking confirmation happens via the Payroc webhook (or mock-pay
// in mock mode) once the customer completes payment.
app.post('/api/bids/:id/accept', auth, async (req, res) => {
  try {
    const { quote_request_id } = req.body || {}
    if (!quote_request_id) return res.status(400).json({ message: 'quote_request_id required' })

    const qr = await db.getQuoteRequest(quote_request_id)
    if (!qr) return res.status(404).json({ message: 'Ride request not found' })
    if (String(qr.customer_id) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Not your bid to accept' })
    }
    if (qr.status === 'confirmed') {
      return res.status(409).json({ message: 'Ride already confirmed via another offer' })
    }
    const bids = await db.getBidsForRequest(qr.id)
    const bid = bids.find(b => String(b.id) === String(req.params.id))
    if (!bid) return res.status(404).json({ message: 'Bid not found' })
    if (!bid.payment_link) return res.status(409).json({ message: 'Bid has no payment link' })

    res.json({ success: true, payment_url: bid.payment_link, payment_session_id: bid.payment_session_id })
  } catch (e) {
    res.status(500).json({ message: 'Could not accept bid', error: e.message })
  }
})

// 4) Payroc webhook — when payment succeeds, finalize the booking
app.post('/api/payments/payroc/webhook', express.json({ verify: (req, res, buf) => { req.rawBody = buf } }), async (req, res) => {
  try {
    const signatureHeader = req.headers['x-payroc-signature'] || req.headers['payroc-signature']
    const rawBody = req.rawBody?.toString('utf8') || JSON.stringify(req.body)
    if (!Payroc.verifyWebhookSignature(rawBody, signatureHeader)) {
      return res.status(401).json({ message: 'Invalid signature' })
    }

    const { session_id, status } = req.body || {}
    if (!session_id) return res.status(400).json({ message: 'session_id required' })
    if (status !== 'paid' && status !== 'succeeded') return res.json({ ok: true, ignored: true })

    const bid = await db.getBidByPaymentSession(session_id)
    if (!bid) return res.status(404).json({ message: 'Bid not found for session' })

    const reference = makeReferenceUnique()
    await db.acceptBid(bid.id, reference)

    const qr = await db.getQuoteRequest(bid.quote_request_id)
    // Create a booking record so /reservation/:ref shows it
    await db.createBooking({
      reference,
      customer_id: qr.customer_id,
      name: qr.customer_name,
      email: qr.customer_email,
      phone: qr.customer_phone,
      pickup: qr.pickup,
      dropoff: qr.dropoff,
      pickup_date: qr.ride_date || '',
      pickup_time: qr.pickup_time || '',
      passengers: qr.passengers || 1,
      vehicle_type: bid.vehicle_type || qr.vehicle_type || 'sedan',
      price_quoted: Number(bid.price),
      special_requests: qr.notes || '',
      status: 'confirmed',
    })

    // Confirmation emails
    sendQuoteConfirmation(qr.customer_name, qr.customer_email, qr.pickup, qr.dropoff, bid.vehicle_type || 'sedan')
      .catch(err => console.error('[email] confirmation failed:', err.message))

    res.json({ ok: true, reference })
  } catch (e) {
    res.status(500).json({ message: 'Webhook handling failed', error: e.message })
  }
})

// 5) Mock payment page — fires a successful webhook immediately when in mock mode
// This lets the entire flow be tested end-to-end without real Payroc credentials.
app.get('/api/mock-pay/info', async (req, res) => {
  const sessionId = String(req.query.session || '')
  if (!sessionId) return res.status(400).json({ message: 'session required' })
  const bid = await db.getBidByPaymentSession(sessionId)
  if (!bid) return res.status(404).json({ message: 'Session not found' })
  const qr = await db.getQuoteRequest(bid.quote_request_id)
  res.json({ success: true, data: {
    session: sessionId,
    amount: Number(bid.price),
    description: `${qr?.pickup} → ${qr?.dropoff}`,
    customer_email: qr?.customer_email,
  } })
})

app.post('/api/mock-pay/complete', async (req, res) => {
  // Simulates Payroc's webhook by posting directly to the real handler
  try {
    const { session_id, succeeded = true } = req.body || {}
    if (!session_id) return res.status(400).json({ message: 'session_id required' })

    if (!succeeded) {
      return res.json({ ok: true, status: 'cancelled' })
    }

    const bid = await db.getBidByPaymentSession(session_id)
    if (!bid) return res.status(404).json({ message: 'Bid not found' })

    const reference = makeReferenceUnique()
    await db.acceptBid(bid.id, reference)

    const qr = await db.getQuoteRequest(bid.quote_request_id)
    await db.createBooking({
      reference,
      customer_id: qr.customer_id,
      name: qr.customer_name,
      email: qr.customer_email,
      phone: qr.customer_phone,
      pickup: qr.pickup,
      dropoff: qr.dropoff,
      pickup_date: qr.ride_date || '',
      pickup_time: qr.pickup_time || '',
      passengers: qr.passengers || 1,
      vehicle_type: bid.vehicle_type || qr.vehicle_type || 'sedan',
      price_quoted: Number(bid.price),
      special_requests: qr.notes || '',
      status: 'confirmed',
    })

    sendQuoteConfirmation(qr.customer_name, qr.customer_email, qr.pickup, qr.dropoff, bid.vehicle_type || 'sedan')
      .catch(err => console.error('[email] confirmation failed:', err.message))

    res.json({ ok: true, status: 'paid', reference })
  } catch (e) {
    res.status(500).json({ message: 'Mock pay failed', error: e.message })
  }
})

// Payment status check (frontend polls this after returning from Payroc/mock page)
app.get('/api/bids/:id/status', auth, async (req, res) => {
  try {
    const sessionId = String(req.query.session || '')
    let bid = null
    if (sessionId) bid = await db.getBidByPaymentSession(sessionId)
    // No getBidById — fetch via parent request instead
    if (!bid) {
      const qid = String(req.query.quote_request_id || '')
      if (qid) {
        const bids = await db.getBidsForRequest(qid)
        bid = bids.find(b => String(b.id) === String(req.params.id)) || null
      }
    }
    if (!bid) return res.status(404).json({ message: 'Bid not found' })
    res.json({ success: true, data: {
      status: bid.status, payment_status: bid.payment_status, booking_reference: bid.booking_reference
    } })
  } catch (e) {
    res.status(500).json({ message: 'Status check failed', error: e.message })
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

// Build trigger: force Railway to rebuild from source so VITE_ env vars are picked up at build time.
