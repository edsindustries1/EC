import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, 'data')
const DB_FILE = join(DATA_DIR, 'db.json')

function load() {
  if (!existsSync(DB_FILE)) return null
  try { return JSON.parse(readFileSync(DB_FILE, 'utf8')) } catch { return null }
}

function save(data) {
  writeFileSync(DB_FILE, JSON.stringify(data, null, 2))
}

function seed() {
  const adminHash = bcrypt.hashSync('admin123', 10)
  const opHash = bcrypt.hashSync('operator123', 10)
  const custHash = bcrypt.hashSync('customer123', 10)
  const initial = {
    users: [
      { id: 'u1', name: 'Admin', email: 'admin@everywherecars.com', password: adminHash, phone: '+17186586000', role: 'admin', created_at: new Date().toISOString() },
      { id: 'u2', name: 'EC Operator', email: 'operator@everywherecars.com', password: opHash, phone: '+17186586001', role: 'operator', created_at: new Date().toISOString() },
      { id: 'u3', name: 'Demo Customer', email: 'customer@test.com', password: custHash, phone: '+12125550001', role: 'customer', created_at: new Date().toISOString() },
    ],
    quote_requests: [],
    bids: [],
    drivers: [
      { id: 'd1', operator_id: 'u2', name: 'James Carter', phone: '+17185550001', vehicle_type: 'sedan', vehicle: 'Lincoln Town Car', plate: 'NYC-1234', status: 'available', created_at: new Date().toISOString() },
      { id: 'd2', operator_id: 'u2', name: 'Maria Santos', phone: '+17185550002', vehicle_type: 'suv', vehicle: 'Cadillac Escalade', plate: 'NYC-5678', status: 'available', created_at: new Date().toISOString() },
      { id: 'd3', operator_id: 'u2', name: 'Kevin Brown', phone: '+17185550003', vehicle_type: 'sprinter_van', vehicle: 'Mercedes Sprinter', plate: 'NYC-9012', status: 'on_trip', created_at: new Date().toISOString() },
    ],
    _nextId: 100,
  }
  save(initial)
  return initial
}

let _db = load() || seed()

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
}
