// Prices from the dispatch system's own fare tables, so the customer sees the
// same fare dispatchers and drivers see. Returns null on any failure so the
// caller can fall back to the app's built-in price table.

import { bridge, bridgeEnabled } from './bridgeClient.js'
import { geocode } from './geocode.js'
import { dispatchableTypes } from './sync.js'

// Same route asked again within 5 minutes reuses the answer, and each client
// IP gets at most 30 dispatch quotes a minute (then the table is used). This
// protects the dispatch rate limit and the Google bill from search traffic.
const CACHE_MS = 5 * 60 * 1000
const PER_IP_PER_MIN = 30
const cache = new Map()
const hits = new Map()

function overLimit(ip) {
  if (!ip) return false
  const now = Date.now()
  const recent = (hits.get(ip) || []).filter(t => now - t < 60000)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) hits.clear()
  return recent.length > PER_IP_PER_MIN
}

export async function dispatchQuote({ pickup, dropoff, pickup_date, pickup_time, passengers }, { ip } = {}) {
  if (!bridgeEnabled()) return null
  const key = [pickup, dropoff, pickup_date, Number(passengers) || 1].map(v => String(v || '').trim().toLowerCase()).join('|')
  const cached = cache.get(key)
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.prices
  if (overLimit(ip)) return null
  try {
    const [from, to] = await Promise.all([
      geocode(pickup).catch(() => null),
      geocode(dropoff).catch(() => null),
    ])
    const types = dispatchableTypes()
    const res = await bridge.quote({
      pickup: { address: pickup, ...(from || {}) },
      dropoff: { address: dropoff, ...(to || {}) },
      pickup_date: pickup_date || null,
      pickup_time: pickup_time || null,
      passengers: Number(passengers) || 1,
      vehicle_types: types,
    })
    const prices = {}
    for (const opt of res.options || []) {
      if (types.includes(opt.vehicle_type) && Number(opt.price) > 0) {
        prices[opt.vehicle_type] = { price: Math.round(Number(opt.price) * 100) / 100, distance_miles: opt.distance_miles ?? null }
      }
    }
    const result = Object.keys(prices).length ? prices : null
    if (cache.size > 2000) cache.clear()
    cache.set(key, { at: Date.now(), prices: result })
    return result
  } catch (e) {
    console.error('[dispatch] quote failed, using price table:', e.message)
    return null
  }
}
