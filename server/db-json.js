// JSON file backend — fast for local dev, ephemeral.
// Exposes the same surface as db-postgres.js (synchronous; the router wraps in promises).

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, 'data')
const DB_FILE = join(DATA_DIR, 'db.json')

mkdirSync(DATA_DIR, { recursive: true })

function load() {
  if (!existsSync(DB_FILE)) return null
  try { return JSON.parse(readFileSync(DB_FILE, 'utf8')) } catch { return null }
}
function save(data) { writeFileSync(DB_FILE, JSON.stringify(data, null, 2)) }

function seed() {
  const adminHash = bcrypt.hashSync(process.env.ADMIN_PASSWORD    || 'admin123',    10)
  const opHash    = bcrypt.hashSync(process.env.OPERATOR_PASSWORD || 'operator123', 10)
  const custHash  = bcrypt.hashSync('customer123', 10)
  const adminEmail = process.env.ADMIN_EMAIL    || 'admin@everywheretransfers.com'
  const opEmail    = process.env.OPERATOR_EMAIL || 'operator@everywheretransfers.com'
  const initial = {
    users: [
      { id: 'u1', name: 'Admin',         email: adminEmail,           password: adminHash, phone: '+17186586000', role: 'admin',    created_at: new Date().toISOString() },
      { id: 'u2', name: 'EC Operator',   email: opEmail,              password: opHash,    phone: '+17186586001', role: 'operator', created_at: new Date().toISOString() },
      { id: 'u3', name: 'Demo Customer', email: 'customer@test.com',  password: custHash,  phone: '+12125550001', role: 'customer', created_at: new Date().toISOString() },
    ],
    quote_requests: [],
    bids: [],
    drivers: [
      { id: 'd1', operator_id: 'u2', name: 'James Carter', phone: '+17185550001', vehicle_type: 'sedan',        vehicle: 'Lincoln Town Car',  plate: 'NYC-1234', status: 'available', created_at: new Date().toISOString() },
      { id: 'd2', operator_id: 'u2', name: 'Maria Santos', phone: '+17185550002', vehicle_type: 'suv',          vehicle: 'Cadillac Escalade', plate: 'NYC-5678', status: 'available', created_at: new Date().toISOString() },
      { id: 'd3', operator_id: 'u2', name: 'Kevin Brown',  phone: '+17185550003', vehicle_type: 'sprinter_van', vehicle: 'Mercedes Sprinter', plate: 'NYC-9012', status: 'on_trip',   created_at: new Date().toISOString() },
    ],
    bookings: [],
    _nextId: 100,
  }
  save(initial)
  return initial
}

let _db = null

export function init() {
  _db = load() || seed()
}

function nextId() {
  _db._nextId = (_db._nextId || 100) + 1
  save(_db)
  return String(_db._nextId)
}

export const db = {
  getUser: (id) => _db.users.find(u => u.id === id) || null,
  getUserByEmail: (email) => _db.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null,
  createUser: (data) => {
    const user = { id: nextId(), created_at: new Date().toISOString(), ...data }
    _db.users.push(user)
    save(_db)
    return user
  },
  listUsers: () => _db.users,

  createQuoteRequest: (data) => {
    const qr = { id: nextId(), status: 'pending', created_at: new Date().toISOString(), ...data }
    _db.quote_requests.push(qr)
    save(_db)
    return qr
  },
  getQuoteRequest: (id) => _db.quote_requests.find(q => q.id === id) || null,
  listQuoteRequests: (filters = {}) => {
    let list = [..._db.quote_requests].reverse()
    if (filters.status && filters.status !== 'all') list = list.filter(q => q.status === filters.status)
    if (filters.search) {
      const s = filters.search.toLowerCase()
      list = list.filter(q => q.pickup?.toLowerCase().includes(s) || q.dropoff?.toLowerCase().includes(s) || q.customer_name?.toLowerCase().includes(s))
    }
    return list
  },
  updateQuoteRequest: (id, updates) => {
    const idx = _db.quote_requests.findIndex(q => q.id === id)
    if (idx === -1) return null
    _db.quote_requests[idx] = { ..._db.quote_requests[idx], ...updates, updated_at: new Date().toISOString() }
    save(_db)
    return _db.quote_requests[idx]
  },

  createBid: (data) => {
    const bid = { id: nextId(), created_at: new Date().toISOString(), ...data }
    _db.bids.push(bid)
    save(_db)
    return bid
  },
  getBidsForRequest: (quote_request_id) => _db.bids.filter(b => b.quote_request_id === quote_request_id),

  listDrivers: (operator_id) => operator_id ? _db.drivers.filter(d => d.operator_id === operator_id) : _db.drivers,
  createDriver: (data) => {
    const d = { id: nextId(), created_at: new Date().toISOString(), ...data }
    _db.drivers.push(d)
    save(_db)
    return d
  },

  createBooking: (data) => {
    if (!_db.bookings) _db.bookings = []
    const b = { id: nextId(), status: 'confirmed', created_at: new Date().toISOString(), ...data }
    _db.bookings.push(b)
    save(_db)
    return b
  },
  getBookingByRef: (ref) => (_db.bookings || []).find(b => b.reference?.toLowerCase() === String(ref).toLowerCase()) || null,
  listBookings: (filters = {}) => {
    let list = [...(_db.bookings || [])].reverse()
    if (filters.status && filters.status !== 'all') list = list.filter(b => b.status === filters.status)
    if (filters.email) list = list.filter(b => b.email?.toLowerCase() === filters.email.toLowerCase())
    return list
  },
  updateBooking: (id, updates) => {
    if (!_db.bookings) return null
    const idx = _db.bookings.findIndex(b => b.id === id)
    if (idx === -1) return null
    _db.bookings[idx] = { ..._db.bookings[idx], ...updates, updated_at: new Date().toISOString() }
    save(_db)
    return _db.bookings[idx]
  },

  // OTP CODES ──────────────────────────────────────────────────────────────
  createOtp: ({ email, code, ttlSeconds = 600 }) => {
    if (!_db.otp_codes) _db.otp_codes = []
    const now = new Date()
    const otp = {
      id: nextId(),
      email: email.toLowerCase(),
      code,
      expires_at: new Date(now.getTime() + ttlSeconds * 1000).toISOString(),
      attempts: 0,
      consumed_at: null,
      created_at: now.toISOString(),
    }
    _db.otp_codes.push(otp)
    save(_db)
    return otp
  },

  countRecentOtpRequests: (email, withinSeconds = 60) => {
    if (!_db.otp_codes) return 0
    const cutoff = Date.now() - withinSeconds * 1000
    return _db.otp_codes.filter(
      (o) => o.email === email.toLowerCase() && new Date(o.created_at).getTime() > cutoff
    ).length
  },

  getActiveOtp: (email) => {
    if (!_db.otp_codes) return null
    const now = Date.now()
    const matches = _db.otp_codes
      .filter(
        (o) =>
          o.email === email.toLowerCase() &&
          !o.consumed_at &&
          new Date(o.expires_at).getTime() > now
      )
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    return matches[0] || null
  },

  consumeOtp: (id) => {
    if (!_db.otp_codes) return
    const idx = _db.otp_codes.findIndex((o) => o.id === id)
    if (idx === -1) return
    _db.otp_codes[idx].consumed_at = new Date().toISOString()
    save(_db)
  },

  // BID MARKETPLACE ──────────────────────────────────────────────────────
  listOpenRideRequests: () => {
    return _db.quote_requests
      .filter(q => ['pending', 'quoted', 'open'].includes(q.status) && !q.accepted_bid_id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  },

  listMyRideRequests: (customerId) => {
    return _db.quote_requests
      .filter(q => q.customer_id === customerId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  },

  acceptBid: (bidId, bookingReference) => {
    const idx = _db.bids.findIndex(b => b.id === bidId)
    if (idx === -1) return null
    const bid = _db.bids[idx]
    _db.bids[idx] = {
      ...bid,
      status: 'paid',
      payment_status: 'paid',
      paid_at: new Date().toISOString(),
      booking_reference: bookingReference,
    }
    _db.bids.forEach((b, i) => {
      if (b.quote_request_id === bid.quote_request_id && b.id !== bidId && b.status !== 'paid') {
        _db.bids[i] = { ..._db.bids[i], status: 'declined' }
      }
    })
    const qidx = _db.quote_requests.findIndex(q => q.id === bid.quote_request_id)
    if (qidx !== -1) {
      _db.quote_requests[qidx] = {
        ..._db.quote_requests[qidx],
        status: 'confirmed',
        accepted_bid_id: bidId,
        booking_reference: bookingReference,
        updated_at: new Date().toISOString(),
      }
    }
    save(_db)
    return _db.bids[idx]
  },

  getBidByPaymentSession: (sessionId) => {
    return _db.bids.find(b => b.payment_session_id === sessionId) || null
  },

  setBidPayment: (bidId, { paymentSessionId, paymentLink, expiresAt }) => {
    const idx = _db.bids.findIndex(b => b.id === bidId)
    if (idx === -1) return null
    _db.bids[idx] = {
      ..._db.bids[idx],
      payment_session_id: paymentSessionId,
      payment_link: paymentLink,
      expires_at: expiresAt || null,
    }
    save(_db)
    return _db.bids[idx]
  },

  // CUSTOM PAYMENT LINKS ──────────────────────────────────────────────
  createPaymentLink: (data) => {
    if (!_db.payment_links) _db.payment_links = []
    const pl = {
      id: nextId(),
      session_id: data.session_id,
      payment_url: data.payment_url,
      customer_email: data.customer_email,
      customer_name: data.customer_name || null,
      amount_cents: data.amount_cents,
      currency: data.currency || 'USD',
      description: data.description || null,
      status: 'pending',
      related_bid_id: data.related_bid_id || null,
      related_booking_reference: data.related_booking_reference || null,
      related_ride_request_id: data.related_ride_request_id || null,
      created_by_operator_id: data.created_by_operator_id || null,
      created_at: new Date().toISOString(),
      paid_at: null,
      expires_at: data.expires_at || null,
      cancelled_at: null,
    }
    _db.payment_links.push(pl)
    save(_db)
    return pl
  },

  listPaymentLinks: ({ operator_id, limit = 50 } = {}) => {
    let list = [...(_db.payment_links || [])].reverse()
    if (operator_id != null) list = list.filter(p => String(p.created_by_operator_id) === String(operator_id))
    return list.slice(0, Math.min(Number(limit) || 50, 200))
  },

  getPaymentLink: (id) => (_db.payment_links || []).find(p => String(p.id) === String(id)) || null,

  getPaymentLinkBySession: (sessionId) => (_db.payment_links || []).find(p => p.session_id === sessionId) || null,

  markPaymentLinkPaid: (sessionId) => {
    if (!_db.payment_links) return null
    const idx = _db.payment_links.findIndex(p => p.session_id === sessionId && p.status === 'pending')
    if (idx === -1) return null
    _db.payment_links[idx] = { ..._db.payment_links[idx], status: 'paid', paid_at: new Date().toISOString() }
    save(_db)
    return _db.payment_links[idx]
  },

  cancelPaymentLink: (id, operatorId) => {
    if (!_db.payment_links) return null
    const idx = _db.payment_links.findIndex(p =>
      String(p.id) === String(id) && p.status === 'pending' &&
      (operatorId == null || String(p.created_by_operator_id) === String(operatorId))
    )
    if (idx === -1) return null
    _db.payment_links[idx] = { ..._db.payment_links[idx], status: 'cancelled', cancelled_at: new Date().toISOString() }
    save(_db)
    return _db.payment_links[idx]
  },

  incrementOtpAttempts: (id) => {
    if (!_db.otp_codes) return 0
    const idx = _db.otp_codes.findIndex((o) => o.id === id)
    if (idx === -1) return 0
    _db.otp_codes[idx].attempts = (_db.otp_codes[idx].attempts || 0) + 1
    save(_db)
    return _db.otp_codes[idx].attempts
  },
}
