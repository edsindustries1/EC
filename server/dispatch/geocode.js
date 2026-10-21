// Address → { lat, lng } for the dispatch trip (the trip log shows a check mark
// and computes driver ETA only when coordinates are present). Returns null when
// no Google key is configured or the address cannot be resolved. Only
// successful lookups are cached; each lookup gives up after 3 seconds.

const cache = new Map()
const TIMEOUT_MS = 3000

export async function geocode(address) {
  const key = process.env.GOOGLE_PLACES_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || ''
  const q = String(address || '').trim()
  if (!key || !q) return null
  if (cache.has(q)) return cache.get(q)
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(q)}&key=${key}`
    const resp = await fetch(url, { signal: controller.signal })
    if (!resp.ok) return null
    const data = await resp.json()
    const loc = data.status === 'OK' ? data.results?.[0]?.geometry?.location : null
    if (!loc) return null
    const result = { lat: loc.lat, lng: loc.lng }
    if (cache.size > 1000) cache.clear()
    cache.set(q, result)
    return result
  } finally {
    clearTimeout(timer)
  }
}
