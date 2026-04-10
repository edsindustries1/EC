const PRICE_TABLE = {
  sedan:       { local: [55, 75],   airport: [75, 110],  long: [150, 220]  },
  suv:         { local: [75, 100],  airport: [95, 140],  long: [200, 280]  },
  sprinter_van:{ local: [150, 200], airport: [175, 250], long: [380, 480]  },
  mini_bus:    { local: [250, 350], airport: [300, 400], long: [600, 800]  },
  coach:       { local: [500, 700], airport: [600, 800], long: [1200, 1600] },
}

const AIRPORT_KEYWORDS = ['jfk', 'lga', 'ewr', 'fbo', 'airport', 'laguardia', 'kennedy']
const LONG_KEYWORDS = ['philadelphia', 'connecticut', 'boston', 'hamptons', 'hartford', 'bridgeport', 'stamford', 'providence', ' nj ', 'new jersey', 'jersey city', 'hoboken', 'trenton', 'princeton', 'newark']

export function detectRouteType(pickup, dropoff) {
  const combined = `${pickup} ${dropoff}`.toLowerCase()
  if (AIRPORT_KEYWORDS.some(k => combined.includes(k))) return 'airport'
  if (LONG_KEYWORDS.some(k => combined.includes(k))) return 'long'
  return 'local'
}

export function getPriceEstimate(vehicleType, routeType) {
  const vehicleKey = vehicleType || 'sedan'
  const route = routeType || 'local'
  const row = PRICE_TABLE[vehicleKey] || PRICE_TABLE.sedan
  const [low, high] = row[route] || row.local
  return { low, high }
}

export function formatPriceRange(low, high) {
  return `Est. ~$${low}–$${high}`
}

export function detectAirport(text) {
  const t = text.toLowerCase()
  if (t.includes('jfk') || t.includes('kennedy')) return 'JFK'
  if (t.includes('lga') || t.includes('laguardia') || t.includes('la guardia')) return 'LGA'
  if (t.includes('ewr') || t.includes('newark')) return 'EWR'
  if (t.includes('airport') || t.includes('fbo')) return 'AIRPORT'
  return null
}

const HOTEL_KEYWORDS = ['hilton', 'marriott', 'hyatt', 'sheraton', 'westin', 'ritz', 'plaza', 'four seasons', 'st. regis', 'waldorf', 'omni', 'intercontinental', 'doubletree', 'embassy suites', 'le méridien', 'sofitel', 'novotel', 'mandarin', 'loews', 'peninsula']

export function detectHotel(text) {
  const t = text.toLowerCase()
  return HOTEL_KEYWORDS.some(h => t.includes(h))
}

export function isPeakHour(dateStr, timeStr) {
  if (!dateStr || !timeStr) return false
  const day = new Date(dateStr).getDay()
  if (day === 0 || day === 6) return false
  const [h] = timeStr.split(':').map(Number)
  return (h >= 7 && h <= 9) || (h >= 16 && h <= 19)
}

export function approximatePosition(text, canvasW, canvasH) {
  const t = text.toLowerCase()
  if (t.includes('jfk') || t.includes('kennedy') || t.includes('jamaica')) return { x: canvasW * 0.78, y: canvasH * 0.62 }
  if (t.includes('lga') || t.includes('laguardia')) return { x: canvasW * 0.68, y: canvasH * 0.38 }
  if (t.includes('ewr') || t.includes('newark')) return { x: canvasW * 0.15, y: canvasH * 0.55 }
  if (t.includes('brooklyn')) return { x: canvasW * 0.68, y: canvasH * 0.72 }
  if (t.includes('bronx')) return { x: canvasW * 0.62, y: canvasH * 0.18 }
  if (t.includes('queens')) return { x: canvasW * 0.72, y: canvasH * 0.42 }
  if (t.includes('staten')) return { x: canvasW * 0.35, y: canvasH * 0.82 }
  if (t.includes('harlem') || t.includes('upper')) return { x: canvasW * 0.5, y: canvasH * 0.28 }
  if (t.includes('midtown') || t.includes('times square') || t.includes('manhattan')) return { x: canvasW * 0.48, y: canvasH * 0.45 }
  if (t.includes('downtown') || t.includes('financial') || t.includes('wall')) return { x: canvasW * 0.46, y: canvasH * 0.65 }
  if (t.includes('hamptons')) return { x: canvasW * 0.95, y: canvasH * 0.52 }
  if (t.includes('boston')) return { x: canvasW * 0.88, y: canvasH * 0.08 }
  if (t.includes('philadelphia') || t.includes('philly')) return { x: canvasW * 0.28, y: canvasH * 0.9 }
  return { x: canvasW * 0.48, y: canvasH * 0.45 }
}
