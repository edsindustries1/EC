// Postgres adapter — exposes the same interface as the JSON db so the
// rest of the app needs no changes. Activated when DATABASE_URL is set.

import pg from 'pg'
import bcrypt from 'bcryptjs'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

let pool = null

export async function init(connectionString) {
  pool = new pg.Pool({
    connectionString,
    ssl: connectionString.includes('localhost') || connectionString.includes('127.0.0.1')
      ? false
      : { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
  })

  // Verify connection
  await pool.query('SELECT 1')

  // Apply schema
  const sql = readFileSync(join(__dirname, 'schema.sql'), 'utf8')
  await pool.query(sql)

  // Seed if empty
  const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM users')
  if (rows[0].n === 0) await seed()
}

async function seed() {
  const adminHash = bcrypt.hashSync(process.env.ADMIN_PASSWORD    || 'admin123',    10)
  const opHash    = bcrypt.hashSync(process.env.OPERATOR_PASSWORD || 'operator123', 10)
  const custHash  = bcrypt.hashSync('customer123', 10)

  await pool.query(`
    INSERT INTO users (name, email, password, phone, role)
    VALUES
      ('Admin',         $1, $4, '+17186586000', 'admin'),
      ('EC Operator',   $2, $5, '+17186586001', 'operator'),
      ('Demo Customer', $3, $6, '+12125550001', 'customer')
  `, [
    process.env.ADMIN_EMAIL    || 'admin@everywheretransfers.com',
    process.env.OPERATOR_EMAIL || 'operator@everywheretransfers.com',
    'customer@test.com',
    adminHash, opHash, custHash,
  ])

  const { rows: [operator] } = await pool.query(
    `SELECT id FROM users WHERE email = $1`,
    [process.env.OPERATOR_EMAIL || 'operator@everywheretransfers.com']
  )

  await pool.query(`
    INSERT INTO drivers (operator_id, name, phone, vehicle_type, vehicle, plate, status)
    VALUES
      ($1, 'James Carter', '+17185550001', 'sedan',        'Lincoln Town Car',   'NYC-1234', 'available'),
      ($1, 'Maria Santos', '+17185550002', 'suv',          'Cadillac Escalade',  'NYC-5678', 'available'),
      ($1, 'Kevin Brown',  '+17185550003', 'sprinter_van', 'Mercedes Sprinter',  'NYC-9012', 'on_trip')
  `, [operator.id])

  console.log('[db] seed complete — admin / operator / customer accounts created')
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function rowToObject(row) {
  if (!row) return null
  const out = { ...row }
  // Convert SERIAL ids to strings to match the previous JSON contract
  if (typeof out.id === 'number') out.id = String(out.id)
  if (typeof out.customer_id === 'number') out.customer_id = String(out.customer_id)
  if (typeof out.operator_id === 'number') out.operator_id = String(out.operator_id)
  if (typeof out.quote_request_id === 'number') out.quote_request_id = String(out.quote_request_id)
  // Numeric → number for prices
  ;['price', 'bid_price', 'price_low', 'price_high', 'price_quoted'].forEach(k => {
    if (out[k] != null) out[k] = Number(out[k])
  })
  // Timestamps → ISO strings
  ;['created_at', 'updated_at'].forEach(k => {
    if (out[k] instanceof Date) out[k] = out[k].toISOString()
  })
  return out
}

function mapRows(rows) { return rows.map(rowToObject) }

// Convert a string id back to an integer for parameter use
function idParam(id) {
  if (id == null) return null
  const n = Number(id)
  return Number.isFinite(n) ? n : null
}

// ── API ──────────────────────────────────────────────────────────────────────

export const db = {
  // USERS ──────────────────────────────────────────────────────────────────
  getUser: async (id) => {
    const n = idParam(id)
    if (n == null) return null
    const { rows } = await pool.query(`SELECT * FROM users WHERE id = $1`, [n])
    return rowToObject(rows[0])
  },

  getUserByEmail: async (email) => {
    const { rows } = await pool.query(
      `SELECT * FROM users WHERE LOWER(email) = LOWER($1)`,
      [email]
    )
    return rowToObject(rows[0])
  },

  createUser: async (data) => {
    const { name, email, password, phone, role = 'customer' } = data
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password, phone, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, email, password, phone || '', role]
    )
    return rowToObject(rows[0])
  },

  listUsers: async () => {
    const { rows } = await pool.query(`SELECT * FROM users ORDER BY created_at DESC`)
    return mapRows(rows)
  },

  // QUOTE REQUESTS ─────────────────────────────────────────────────────────
  createQuoteRequest: async (data) => {
    const cols = [
      'customer_id', 'customer_name', 'customer_email', 'customer_phone',
      'pickup', 'dropoff', 'ride_date', 'passengers', 'vehicle_type', 'status',
    ]
    const values = [
      idParam(data.customer_id),
      data.customer_name || null,
      data.customer_email || null,
      data.customer_phone || null,
      data.pickup,
      data.dropoff,
      data.ride_date || null,
      data.passengers || 1,
      data.vehicle_type || 'sedan',
      data.status || 'pending',
    ]
    const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ')
    const { rows } = await pool.query(
      `INSERT INTO quote_requests (${cols.join(', ')}) VALUES (${placeholders}) RETURNING *`,
      values
    )
    return rowToObject(rows[0])
  },

  getQuoteRequest: async (id) => {
    const n = idParam(id)
    if (n == null) return null
    const { rows } = await pool.query(`SELECT * FROM quote_requests WHERE id = $1`, [n])
    return rowToObject(rows[0])
  },

  listQuoteRequests: async (filters = {}) => {
    let sql = `SELECT * FROM quote_requests WHERE 1=1`
    const params = []
    if (filters.status && filters.status !== 'all') {
      params.push(filters.status)
      sql += ` AND status = $${params.length}`
    }
    if (filters.search) {
      params.push(`%${filters.search.toLowerCase()}%`)
      sql += ` AND (LOWER(pickup) LIKE $${params.length} OR LOWER(dropoff) LIKE $${params.length} OR LOWER(customer_name) LIKE $${params.length})`
    }
    sql += ` ORDER BY created_at DESC`
    const { rows } = await pool.query(sql, params)
    return mapRows(rows)
  },

  updateQuoteRequest: async (id, updates) => {
    const n = idParam(id)
    if (n == null) return null
    const cols = Object.keys(updates).filter(k => updates[k] !== undefined)
    if (cols.length === 0) return await db.getQuoteRequest(id)
    const sets = cols.map((k, i) => `${k} = $${i + 1}`).join(', ')
    const values = cols.map(k => updates[k])
    values.push(n)
    const { rows } = await pool.query(
      `UPDATE quote_requests SET ${sets}, updated_at = now()
       WHERE id = $${values.length} RETURNING *`,
      values
    )
    return rowToObject(rows[0])
  },

  // BIDS ───────────────────────────────────────────────────────────────────
  createBid: async (data) => {
    const { rows } = await pool.query(
      `INSERT INTO bids (quote_request_id, operator_id, operator_name, price, vehicle_type, eta_minutes, message, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        idParam(data.quote_request_id),
        idParam(data.operator_id),
        data.operator_name || 'Operator',
        Number(data.price),
        data.vehicle_type || 'sedan',
        Number(data.eta_minutes) || 30,
        data.message || '',
        data.notes || '',
      ]
    )
    return rowToObject(rows[0])
  },

  getBidsForRequest: async (quote_request_id) => {
    const n = idParam(quote_request_id)
    if (n == null) return []
    const { rows } = await pool.query(
      `SELECT * FROM bids WHERE quote_request_id = $1 ORDER BY created_at DESC`,
      [n]
    )
    return mapRows(rows)
  },

  // DRIVERS ────────────────────────────────────────────────────────────────
  listDrivers: async (operator_id) => {
    if (operator_id) {
      const { rows } = await pool.query(
        `SELECT * FROM drivers WHERE operator_id = $1 ORDER BY created_at DESC`,
        [idParam(operator_id)]
      )
      return mapRows(rows)
    }
    const { rows } = await pool.query(`SELECT * FROM drivers ORDER BY created_at DESC`)
    return mapRows(rows)
  },

  createDriver: async (data) => {
    const { rows } = await pool.query(
      `INSERT INTO drivers (operator_id, name, phone, email, vehicle_type, vehicle, plate, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        idParam(data.operator_id),
        data.name,
        data.phone,
        data.email || null,
        data.vehicle_type || 'sedan',
        data.vehicle || '',
        data.plate || '',
        data.status || 'available',
      ]
    )
    return rowToObject(rows[0])
  },

  // BOOKINGS ───────────────────────────────────────────────────────────────
  createBooking: async (data) => {
    const cols = [
      'reference', 'customer_id', 'name', 'email', 'phone',
      'pickup', 'dropoff', 'pickup_date', 'pickup_time',
      'passengers', 'vehicle_type', 'trip_type', 'return_date', 'return_time',
      'route_type', 'price_low', 'price_high', 'price_quoted',
      'flight_number', 'child_seats', 'special_requests', 'status',
    ]
    const values = [
      data.reference,
      idParam(data.customer_id),
      data.name, data.email, data.phone,
      data.pickup, data.dropoff,
      data.pickup_date || null, data.pickup_time || null,
      data.passengers || 1,
      data.vehicle_type || 'sedan',
      data.trip_type || 'oneway',
      data.return_date || null, data.return_time || null,
      data.route_type || null,
      data.price_low || null, data.price_high || null, data.price_quoted || null,
      data.flight_number || null,
      data.child_seats || 0,
      data.special_requests || null,
      data.status || 'confirmed',
    ]
    const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ')
    const { rows } = await pool.query(
      `INSERT INTO bookings (${cols.join(', ')}) VALUES (${placeholders}) RETURNING *`,
      values
    )
    return rowToObject(rows[0])
  },

  getBookingByRef: async (ref) => {
    const { rows } = await pool.query(
      `SELECT * FROM bookings WHERE LOWER(reference) = LOWER($1)`,
      [ref]
    )
    return rowToObject(rows[0])
  },

  listBookings: async (filters = {}) => {
    let sql = `SELECT * FROM bookings WHERE 1=1`
    const params = []
    if (filters.status && filters.status !== 'all') {
      params.push(filters.status)
      sql += ` AND status = $${params.length}`
    }
    if (filters.email) {
      params.push(filters.email.toLowerCase())
      sql += ` AND LOWER(email) = $${params.length}`
    }
    sql += ` ORDER BY created_at DESC`
    const { rows } = await pool.query(sql, params)
    return mapRows(rows)
  },

  updateBooking: async (id, updates) => {
    const n = idParam(id)
    if (n == null) return null
    const cols = Object.keys(updates).filter(k => updates[k] !== undefined)
    if (cols.length === 0) return rowToObject((await pool.query(`SELECT * FROM bookings WHERE id = $1`, [n])).rows[0])
    const sets = cols.map((k, i) => `${k} = $${i + 1}`).join(', ')
    const values = cols.map(k => updates[k])
    values.push(n)
    const { rows } = await pool.query(
      `UPDATE bookings SET ${sets}, updated_at = now()
       WHERE id = $${values.length} RETURNING *`,
      values
    )
    return rowToObject(rows[0])
  },

  // OTP CODES (passwordless auth) ──────────────────────────────────────────
  createOtp: async ({ email, code, ttlSeconds = 600 }) => {
    const { rows } = await pool.query(
      `INSERT INTO otp_codes (email, code, expires_at)
       VALUES (LOWER($1), $2, now() + ($3 || ' seconds')::interval)
       RETURNING *`,
      [email, code, String(ttlSeconds)]
    )
    return rowToObject(rows[0])
  },

  countRecentOtpRequests: async (email, withinSeconds = 60) => {
    const { rows } = await pool.query(
      `SELECT COUNT(*)::int AS n FROM otp_codes
       WHERE LOWER(email) = LOWER($1)
       AND created_at > now() - ($2 || ' seconds')::interval`,
      [email, String(withinSeconds)]
    )
    return rows[0].n
  },

  // Returns the newest unconsumed OTP whose expiry is in the future.
  getActiveOtp: async (email) => {
    const { rows } = await pool.query(
      `SELECT * FROM otp_codes
       WHERE LOWER(email) = LOWER($1)
       AND consumed_at IS NULL
       AND expires_at > now()
       ORDER BY created_at DESC
       LIMIT 1`,
      [email]
    )
    return rowToObject(rows[0])
  },

  consumeOtp: async (id) => {
    await pool.query(
      `UPDATE otp_codes SET consumed_at = now() WHERE id = $1`,
      [idParam(id)]
    )
  },

  // BID MARKETPLACE ────────────────────────────────────────────────────────
  // Returns ride requests visible to operators (not yet confirmed).
  listOpenRideRequests: async () => {
    const { rows } = await pool.query(
      `SELECT * FROM quote_requests
       WHERE status IN ('pending', 'quoted', 'open')
       AND (accepted_bid_id IS NULL)
       ORDER BY created_at DESC`
    )
    return mapRows(rows)
  },

  // Returns all ride requests by a particular customer (signed in).
  listMyRideRequests: async (customerId) => {
    const n = idParam(customerId)
    if (n == null) return []
    const { rows } = await pool.query(
      `SELECT * FROM quote_requests
       WHERE customer_id = $1
       ORDER BY created_at DESC`,
      [n]
    )
    return mapRows(rows)
  },

  // Marks the winning bid + cancels others on the same request, and
  // records the booking_reference linking them.
  acceptBid: async (bidId, bookingReference) => {
    const n = idParam(bidId)
    if (n == null) return null
    const { rows: [bid] } = await pool.query(
      `UPDATE bids
       SET status = 'paid', payment_status = 'paid', paid_at = now(),
           booking_reference = $2
       WHERE id = $1 RETURNING *`,
      [n, bookingReference]
    )
    if (!bid) return null
    // Cancel sibling bids on the same request
    await pool.query(
      `UPDATE bids SET status = 'declined'
       WHERE quote_request_id = $1 AND id <> $2 AND status NOT IN ('paid')`,
      [bid.quote_request_id, n]
    )
    // Mark the request as confirmed
    await pool.query(
      `UPDATE quote_requests
       SET status = 'confirmed', accepted_bid_id = $1, booking_reference = $2, updated_at = now()
       WHERE id = $3`,
      [n, bookingReference, bid.quote_request_id]
    )
    return rowToObject(bid)
  },

  // Lookup the bid by Payroc session ID (used by webhook handler)
  getBidByPaymentSession: async (sessionId) => {
    const { rows } = await pool.query(
      `SELECT * FROM bids WHERE payment_session_id = $1 LIMIT 1`,
      [sessionId]
    )
    return rowToObject(rows[0])
  },

  // Update payment fields on a bid (after creating a Payroc session)
  setBidPayment: async (bidId, { paymentSessionId, paymentLink, expiresAt }) => {
    const n = idParam(bidId)
    if (n == null) return null
    const { rows } = await pool.query(
      `UPDATE bids SET payment_session_id = $2, payment_link = $3, expires_at = $4
       WHERE id = $1 RETURNING *`,
      [n, paymentSessionId, paymentLink, expiresAt || null]
    )
    return rowToObject(rows[0])
  },

  incrementOtpAttempts: async (id) => {
    const { rows } = await pool.query(
      `UPDATE otp_codes SET attempts = attempts + 1
       WHERE id = $1 RETURNING attempts`,
      [idParam(id)]
    )
    return rows[0]?.attempts || 0
  },
}
