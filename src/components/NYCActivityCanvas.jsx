import React, { useEffect, useRef, useCallback } from 'react'
import { approximatePosition } from '../utils/priceEstimator'
import { useTheme } from '../context/ThemeContext'

const ELECTRIC_BLUE = 'rgba(14,165,233,'
const GOLD = '#F6C90E'

function lerp(a, b, t) { return a + (b - a) * t }

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)) }

function makeDot(W, H, isMobile) {
  const cols = isMobile ? 10 : Math.max(1, Math.floor(W / 48))
  const rows = isMobile ? 8  : Math.max(1, Math.floor(H / 40))
  const col = Math.floor(Math.random() * cols)
  const row = Math.floor(Math.random() * rows)
  const goHorizontal = Math.random() > 0.5
  const targetCol = clamp(col + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1), 0, cols - 1)
  const targetRow = clamp(row + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1), 0, rows - 1)
  return {
    col, row, goHorizontal,
    targetCol, targetRow,
    progress: Math.random(),
    speed: Math.random() * 0.4 + 0.15,
    opacity: Math.random() * 0.5 + 0.3,
    trail: [],
  }
}

function getDotCoords(dot, W, H, isMobile) {
  const cols = isMobile ? 10 : Math.max(1, Math.floor(W / 48))
  const rows = isMobile ? 8  : Math.max(1, Math.floor(H / 40))
  const stepX = W / cols
  const stepY = H / rows
  if (dot.goHorizontal) {
    const x = lerp(dot.col * stepX, dot.targetCol * stepX, dot.progress)
    const y = dot.row * stepY
    return { x, y }
  } else {
    const x = dot.col * stepX
    const y = lerp(dot.row * stepY, dot.targetRow * stepY, dot.progress)
    return { x, y }
  }
}

function resetDot(dot, W, H, isMobile) {
  const cols = isMobile ? 10 : Math.max(1, Math.floor(W / 48))
  const rows = isMobile ? 8  : Math.max(1, Math.floor(H / 40))
  const col = Math.floor(Math.random() * cols)
  const row = Math.floor(Math.random() * rows)
  const goH = !dot.goHorizontal
  dot.col = col
  dot.row = row
  dot.goHorizontal = goH
  dot.targetCol = clamp(col + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1), 0, cols - 1)
  dot.targetRow = clamp(row + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1), 0, rows - 1)
  dot.progress = 0
  dot.opacity = Math.random() * 0.5 + 0.3
  dot.trail = []
}

export default function NYCActivityCanvas({ pickup, dropoff, isMobile }) {
  const { isDark } = useTheme()
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const dotsRef = useRef([])
  const isMobileRef = useRef(isMobile)
  const routeProgressRef = useRef(0)
  const isDarkRef = useRef(isDark)
  useEffect(() => { isDarkRef.current = isDark }, [isDark])

  useEffect(() => { isMobileRef.current = isMobile }, [isMobile])

  useEffect(() => { routeProgressRef.current = 0 }, [pickup, dropoff])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width
    const H = canvas.height
    const mobile = isMobileRef.current

    ctx.clearRect(0, 0, W, H)

    if (!mobile) {
      const gridX = Math.max(1, Math.floor(W / 48)) > 0 ? 48 : 40
      const gridY = Math.max(1, Math.floor(H / 40)) > 0 ? 40 : 36
      ctx.lineWidth = 0.5
      ctx.strokeStyle = isDarkRef.current ? 'rgba(255,255,255,0.04)' : 'rgba(26,54,93,0.08)'
      for (let x = 0; x <= W; x += gridX) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
      }
      for (let y = 0; y <= H; y += gridY) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
      }
    }

    dotsRef.current.forEach(dot => {
      dot.progress += dot.speed * 0.002
      if (dot.progress >= 1) {
        resetDot(dot, W, H, mobile)
      }

      const { x: cx, y: cy } = getDotCoords(dot, W, H, mobile)

      if (!Number.isFinite(cx) || !Number.isFinite(cy)) return

      dot.trail.push({ x: cx, y: cy })
      if (dot.trail.length > 8) dot.trail.shift()

      dot.trail.forEach((pt, i) => {
        if (!Number.isFinite(pt.x) || !Number.isFinite(pt.y)) return
        const alpha = (i / dot.trail.length) * dot.opacity * 0.4
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, 1.2, 0, Math.PI * 2)
        ctx.fillStyle = `${ELECTRIC_BLUE}${alpha})`
        ctx.fill()
      })

      ctx.beginPath()
      ctx.arc(cx, cy, 3, 0, Math.PI * 2)
      ctx.fillStyle = `${ELECTRIC_BLUE}${dot.opacity})`
      ctx.shadowBlur = 6
      ctx.shadowColor = 'rgba(14,165,233,0.6)'
      ctx.fill()
      ctx.shadowBlur = 0
    })

    if (pickup && !mobile) {
      const pos = approximatePosition(pickup, W, H)
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, 7, 0, Math.PI * 2)
      ctx.fillStyle = GOLD
      ctx.shadowBlur = 20
      ctx.shadowColor = 'rgba(246,201,14,0.8)'
      ctx.fill()
      ctx.shadowBlur = 0
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, 14, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(246,201,14,0.25)'
      ctx.lineWidth = 1.5
      ctx.stroke()

      if (dropoff) {
        const pos2 = approximatePosition(dropoff, W, H)
        ctx.beginPath()
        ctx.arc(pos2.x, pos2.y, 7, 0, Math.PI * 2)
        ctx.fillStyle = isDarkRef.current ? 'rgba(255,255,255,0.9)' : 'rgba(15,31,61,0.85)'
        ctx.shadowBlur = 15
        ctx.shadowColor = isDarkRef.current ? 'rgba(255,255,255,0.5)' : 'rgba(15,31,61,0.4)'
        ctx.fill()
        ctx.shadowBlur = 0

        const dx = pos2.x - pos.x
        const dy = pos2.y - pos.y
        const totalLen = Math.sqrt(dx * dx + dy * dy)
        if (Number.isFinite(totalLen) && totalLen > 0) {
          routeProgressRef.current = Math.min(routeProgressRef.current + 0.012, 1)
          const drawLen = totalLen * routeProgressRef.current
          const endX = pos.x + dx * routeProgressRef.current
          const endY = pos.y + dy * routeProgressRef.current

          const grad = ctx.createLinearGradient(pos.x, pos.y, endX, endY)
          grad.addColorStop(0, 'rgba(246,201,14,0.9)')
          grad.addColorStop(1, 'rgba(255,255,255,0.6)')
          ctx.beginPath()
          ctx.moveTo(pos.x, pos.y)
          ctx.lineTo(endX, endY)
          ctx.strokeStyle = grad
          ctx.lineWidth = 2
          ctx.setLineDash([8, 5])
          ctx.lineDashOffset = -(routeProgressRef.current * 40)
          ctx.stroke()
          ctx.setLineDash([])
          ctx.lineDashOffset = 0
        }
      }
    }

    animRef.current = requestAnimationFrame(draw)
  }, [pickup, dropoff])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      const W = canvas.width
      const H = canvas.height
      const mobile = isMobileRef.current
      dotsRef.current = Array.from({ length: 25 }, () => makeDot(W, H, mobile))
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  useEffect(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current)
    animRef.current = requestAnimationFrame(draw)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [draw])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ background: 'transparent', display: 'block' }}
    />
  )
}
