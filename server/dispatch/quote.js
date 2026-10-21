// Prices from the dispatch system's own fare tables, so the customer sees the
// same fare dispatchers and drivers see. Returns null on any failure so the
// caller can fall back to the app's built-in price table.

import { bridge, bridgeEnabled } from './bridgeClient.js'
import { geocode } from './geocode.js'
import { dispatchableTypes } from './sync.js'

export async function dispatchQuote({ pickup, dropoff, pickup_date, pickup_time, passengers }) {
  if (!bridgeEnabled()) return null
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
    return Object.keys(prices).length ? prices : null
  } catch (e) {
    console.error('[dispatch] quote failed, using price table:', e.message)
    return null
  }
}
