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
  if (rows[0].n === 0) {
    await seed()
  } else {
    // DB already has users (customer signups). Make sure baseline operator +
    // admin accounts exist so the team can always log in. Idempotent — if an
    // account already exists with this email, we leave its password alone.
    await ensureBaselineAccounts()
  }
}

async function ensureBaselineAccounts() {
  const accounts = [
    { email: 'reviewer@everywheretransfers.com', name: 'Apple Reviewer', role: 'customer', password: 'AppleReviewer@2026', phone: '+14085551234' },
    { email: 'operator@everywheretransfers.com', name: 'EC Operator', role: 'operator', password: 'Operator@2026', phone: '+17186586001' },
    { email: 'admin@everywheretransfers.com',    name: 'EC Admin',    role: 'admin',    password: 'Admin@2026',    phone: '+17186586000' },
  ]
  for (const a of accounts) {
    const { rows } = await pool.query('SELECT id FROM users WHERE email = $1 LIMIT 1', [a.email])
    if (rows.length === 0) {
      const hash = bcrypt.hashSync(a.password, 10)
      await pool.query(
        `INSERT INTO users (name, email, password, phone, role) VALUES ($1,$2,$3,$4,$5)`,
        [a.name, a.email, hash, a.phone, a.role]
      )
      console.log(`[db] created baseline ${a.role}: ${a.email}`)
    }
  }
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

  // Used by DELETE /api/auth/me — Apple App Store requires in-app account
  // deletion. We anonymize the user's bookings and ride requests first so
  // operator history is preserved, then hard-delete the user row.
  deleteUserAndAnonymizeData: async (id) => {
    const n = idParam(id)
    if (n == null) return null
    // Anonymize bookings — strip PII, keep the row for operator records
    await pool.query(
      `UPDATE bookings SET
         name = 'Deleted user', email = NULL, phone = NULL, customer_id = NULL
       WHERE customer_id = $1`,
      [n]
    )
    // Anonymize quote_requests
    await pool.query(
      `UPDATE quote_requests SET
         customer_name = 'Deleted user', customer_email = NULL,
         customer_phone = NULL, customer_id = NULL
       WHERE customer_id = $1`,
      [n]
    )
    // Cancel any pending payment links tied to this user
    await pool.query(
      `UPDATE payment_links SET status = 'cancelled', cancelled_at = now()
       WHERE customer_email IN (SELECT email FROM users WHERE id = $1)
         AND status = 'pending'`,
      [n]
    )
    // Hard-delete the user row
    await pool.query(`DELETE FROM users WHERE id = $1`, [n])
    return true
  },

  // Used by /api/setup/ensure-test-accounts to reset operator/admin creds
  updateUserCredentials: async (id, { password, role }) => {
    const n = idParam(id)
    if (n == null) return null
    const { rows } = await pool.query(
      `UPDATE users SET password = COALESCE($2, password),
                        role     = COALESCE($3, role)
       WHERE id = $1 RETURNING *`,
      [n, password || null, role || null]
    )
    return rowToObject(rows[0])
  },

  // CUSTOM PAYMENT LINKS ────────────────────────────────────────────────
  createPaymentLink: async (data) => {
    const cols = [
      'session_id', 'payment_url',
      'customer_email', 'customer_name',
      'amount_cents', 'currency', 'description',
      'related_bid_id', 'related_booking_reference', 'related_ride_request_id',
      'created_by_operator_id', 'expires_at',
    ]
    const values = [
      data.session_id, data.payment_url,
      data.customer_email, data.customer_name || null,
      data.amount_cents, data.currency || 'USD', data.description || null,
      idParam(data.related_bid_id),
      data.related_booking_reference || null,
      idParam(data.related_ride_request_id),
      idParam(data.created_by_operator_id),
      data.expires_at || null,
    ]
    const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ')
    const { rows } = await pool.query(
      `INSERT INTO payment_links (${cols.join(', ')})
       VALUES (${placeholders}) RETURNING *`,
      values
    )
    return rowToObject(rows[0])
  },

  listPaymentLinks: async ({ operator_id, limit = 50 } = {}) => {
    let sql = `SELECT * FROM payment_links`
    const params = []
    if (operator_id != null) {
      params.push(idParam(operator_id))
      sql += ` WHERE created_by_operator_id = $${params.length}`
    }
    sql += ` ORDER BY created_at DESC LIMIT ${Math.min(Number(limit) || 50, 200)}`
    const { rows } = await pool.query(sql, params)
    return mapRows(rows)
  },

  getPaymentLink: async (id) => {
    const n = idParam(id)
    if (n == null) return null
    const { rows } = await pool.query(`SELECT * FROM payment_links WHERE id = $1`, [n])
    return rowToObject(rows[0])
  },

  getPaymentLinkBySession: async (sessionId) => {
    const { rows } = await pool.query(
      `SELECT * FROM payment_links WHERE session_id = $1 LIMIT 1`,
      [sessionId]
    )
    return rowToObject(rows[0])
  },

  markPaymentLinkPaid: async (sessionId) => {
    const { rows } = await pool.query(
      `UPDATE payment_links SET status = 'paid', paid_at = now()
       WHERE session_id = $1 AND status = 'pending' RETURNING *`,
      [sessionId]
    )
    return rowToObject(rows[0])
  },

  cancelPaymentLink: async (id, operatorId) => {
    const n = idParam(id)
    if (n == null) return null
    const { rows } = await pool.query(
      `UPDATE payment_links SET status = 'cancelled', cancelled_at = now()
       WHERE id = $1
       AND status = 'pending'
       AND ($2::integer IS NULL OR created_by_operator_id = $2)
       RETURNING *`,
      [n, idParam(operatorId)]
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
