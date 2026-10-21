import React, { useMemo } from 'react'

// Dependency-free map: raster tiles laid out in a grid with markers on top.
// Works in every browser and in the Capacitor WebView (no WebGL). Fits all
// points (driver, pickup) in view.

const TILE = 256
const TILE_URL = (z, x, y) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`

function project(lat, lng, z) {
  const s = Math.sin((lat * Math.PI) / 180)
  const n = TILE * 2 ** z
  return { x: ((lng + 180) / 360) * n, y: (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * n }
}

function fitZoom(points, width, height) {
  for (let z = 16; z >= 3; z--) {
    const p = points.map(pt => project(pt.lat, pt.lng, z))
    const w = Math.max(...p.map(q => q.x)) - Math.min(...p.map(q => q.x))
    const h = Math.max(...p.map(q => q.y)) - Math.min(...p.map(q => q.y))
    if (w < width - 80 && h < height - 80) return z
  }
  return 3
}

export default function TileMap({ markers, height = 240 }) {
  const width = 640
  const view = useMemo(() => {
    const pts = markers.filter(m => Number.isFinite(m.lat) && Number.isFinite(m.lng))
    if (!pts.length) return null
    const z = pts.length === 1 ? 15 : fitZoom(pts, width, height)
    const proj = pts.map(p => ({ ...p, ...project(p.lat, p.lng, z) }))
    const cx = (Math.min(...proj.map(p => p.x)) + Math.max(...proj.map(p => p.x))) / 2
    const cy = (Math.min(...proj.map(p => p.y)) + Math.max(...proj.map(p => p.y))) / 2
    const left = cx - width / 2, top = cy - height / 2
    const tiles = []
    for (let tx = Math.floor(left / TILE); tx <= Math.floor((left + width) / TILE); tx++) {
      for (let ty = Math.floor(top / TILE); ty <= Math.floor((top + height) / TILE); ty++) {
        const max = 2 ** z
        tiles.push({ key: `${tx}-${ty}`, src: TILE_URL(z, ((tx % max) + max) % max, ty), x: tx * TILE - left, y: ty * TILE - top })
      }
    }
    return { tiles, markers: proj.map(p => ({ ...p, px: p.x - left, py: p.y - top })) }
  }, [markers, height])

  if (!view) return null
  return (
    <div style={{ position: 'relative', width: '100%', height, overflow: 'hidden', background: '#e5e3df' }}>
      <div style={{ position: 'absolute', left: '50%', top: 0, width, height, marginLeft: -width / 2 }}>
        {view.tiles.map(t => (
          <img key={t.key} src={t.src} alt="" draggable={false} style={{ position: 'absolute', left: t.x, top: t.y, width: TILE, height: TILE }} />
        ))}
        {view.markers.map(m => (
          <div key={m.label} title={m.label} style={{ position: 'absolute', left: m.px, top: m.py, transform: 'translate(-50%, -50%)', transition: 'left 1.2s linear, top 1.2s linear' }}>
            <div style={{
              width: m.kind === 'car' ? 30 : 16, height: m.kind === 'car' ? 30 : 16, borderRadius: 999,
              background: m.kind === 'car' ? '#000' : '#fff', border: m.kind === 'car' ? '3px solid #fff' : '4px solid #000',
              boxShadow: '0 1px 6px rgba(0,0,0,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14,
            }}>{m.kind === 'car' ? '🚘' : ''}</div>
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', right: 4, bottom: 2, fontSize: 9, color: '#555', background: 'rgba(255,255,255,.7)', padding: '0 4px' }}>© OpenStreetMap</div>
    </div>
  )
}
