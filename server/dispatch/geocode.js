// Address → { lat, lng } for the dispatch trip (the trip log shows a check mark
// and computes driver ETA only when coordinates are present). Returns null when
// no Google key is configured or the address cannot be resolved.

const cache = new Map()

export async function geocode(address) {
  const key = process.env.GOOGLE_PLACES_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || ''
  const q = String(address || '').trim()
  if (!key || !q) return null
  if (cache.has(q)) return cache.get(q)
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(q)}&key=${key}`
  const resp = await fetch(url)
  const data = await resp.json()
  const loc = data.status === 'OK' ? data.results?.[0]?.geometry?.location : null
  const result = loc ? { lat: loc.lat, lng: loc.lng } : null
  if (cache.size > 500) cache.clear()
  cache.set(q, result)
  return result
}
