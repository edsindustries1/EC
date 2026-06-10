/**
 * Native-only UX hooks: status bar, haptics, pull-to-refresh, swipe-back.
 *
 * All hooks are web-safe — they no-op when Capacitor isn't loaded, so
 * pages can call them unconditionally without breaking the web build.
 */
import { useEffect, useRef, useCallback } from 'react'

// Lazily resolved Capacitor modules (web build doesn't import them at all)
let _StatusBar = null
let _Style = null
let _Haptics = null
let _ImpactStyle = null
let _NotificationType = null
let _capacitorLoadAttempted = false

async function ensureCapacitor() {
  if (_capacitorLoadAttempted) return
  _capacitorLoadAttempted = true
  if (typeof window === 'undefined') return
  if (!window.Capacitor?.isNativePlatform?.()) return
  try {
    const sb = await import('@capacitor/status-bar')
    _StatusBar = sb.StatusBar; _Style = sb.Style
  } catch {}
  try {
    const h = await import('@capacitor/haptics')
    _Haptics = h.Haptics; _ImpactStyle = h.ImpactStyle; _NotificationType = h.NotificationType
  } catch {}
}

// ─── 1. Status bar style per page ────────────────────────────────────────
// Call useStatusBarStyle('dark') on a page with a black/dark hero so the
// status bar icons turn WHITE (visible). Resets to dark icons (Style.Dark)
// when the page unmounts.
//
// Capacitor API confusion fix:
//   Style.Dark  → DARK icons (use on LIGHT page backgrounds)
//   Style.Light → LIGHT icons (use on DARK page backgrounds)
export function useStatusBarStyle(pageBg = 'light') {
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      await ensureCapacitor()
      if (cancelled || !_StatusBar || !_Style) return
      try {
        await _StatusBar.setStyle({ style: pageBg === 'dark' ? _Style.Light : _Style.Dark })
      } catch {}
    })()
    return () => {
      cancelled = true
      ;(async () => {
        await ensureCapacitor()
        if (!_StatusBar || !_Style) return
        try { await _StatusBar.setStyle({ style: _Style.Dark }) } catch {}
      })()
    }
  }, [pageBg])
}

// ─── 2. Haptic feedback ─────────────────────────────────────────────────
// Returns a fire-and-forget callback: haptic('light'|'success'|'error'|'heavy')
export function useHaptics() {
  return useCallback((type = 'light') => {
    ;(async () => {
      await ensureCapacitor()
      if (!_Haptics) return
      try {
        if (type === 'success' && _NotificationType) {
          await _Haptics.notification({ type: _NotificationType.Success })
        } else if (type === 'error' && _NotificationType) {
          await _Haptics.notification({ type: _NotificationType.Error })
        } else if (type === 'heavy' && _ImpactStyle) {
          await _Haptics.impact({ style: _ImpactStyle.Heavy })
        } else if (_ImpactStyle) {
          await _Haptics.impact({ style: _ImpactStyle.Light })
        }
      } catch {}
    })()
  }, [])
}

// ─── 3. Pull-to-refresh ──────────────────────────────────────────────────
// Two call patterns:
//   (a) Pass nothing → attaches to document #root (whole-page PTR on native)
//   (b) Pass { containerRef } → attaches to a specific scrollable element
//
// In both cases, touching down at the top and dragging > threshold (80px)
// fires onRefresh.
export function usePullToRefreshOnRoot(onRefresh, threshold = 80) {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!window.Capacitor?.isNativePlatform?.()) return
    const el = document.getElementById('root')
    if (!el) return
    const cleanup = attachPullToRefresh(el, onRefresh, threshold)
    return cleanup
  }, [onRefresh, threshold])
}

export function usePullToRefresh(onRefresh, threshold = 80) {
  const ref = useRef(null)
  const state = useRef({ startY: 0, pulling: false, currentY: 0, refreshing: false })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    return attachPullToRefresh(el, onRefresh, threshold)
  }, [onRefresh, threshold])

  return ref
}

// Shared low-level PTR attach helper used by both hooks above.
function attachPullToRefresh(el, onRefresh, threshold) {
  const state = { startY: 0, pulling: false, currentY: 0, refreshing: false }

  const indicator = document.createElement('div')
  indicator.setAttribute('data-pull-indicator', '')
  indicator.style.cssText = [
    'position:fixed', 'top:0', 'left:50%', 'transform:translate(-50%, -100%)',
    'width:36px', 'height:36px', 'border-radius:50%',
    'background:#000', 'color:#fff',
    'display:flex', 'align-items:center', 'justify-content:center',
    'font-size:18px', 'z-index:10000',
    'transition:transform 220ms cubic-bezier(0.4,0,0.2,1), opacity 220ms ease',
    'opacity:0', 'pointer-events:none',
    'box-shadow:0 6px 16px -4px rgba(0,0,0,0.28)',
  ].join(';')
  indicator.innerHTML = '↓'
  document.body.appendChild(indicator)

  const onTouchStart = (e) => {
    if (state.refreshing) return
    if (el.scrollTop > 0) return
    state.startY = e.touches[0].clientY
    state.pulling = true
  }
  const onTouchMove = (e) => {
    if (!state.pulling) return
    state.currentY = e.touches[0].clientY
    const delta = state.currentY - state.startY
    if (delta > 0 && el.scrollTop === 0) {
      const distance = Math.min(delta * 0.45, threshold + 28)
      const progress = Math.min(distance / threshold, 1)
      indicator.style.transform = `translate(-50%, ${distance + 12}px) rotate(${progress * 180}deg)`
      indicator.style.opacity = String(progress)
      indicator.innerHTML = progress >= 1 ? '↑' : '↓'
    }
  }
  const onTouchEnd = async () => {
    if (!state.pulling) return
    const delta = state.currentY - state.startY
    state.pulling = false
    if (delta * 0.45 >= threshold && onRefresh) {
      state.refreshing = true
      indicator.style.transform = `translate(-50%, ${threshold * 0.45 + 12}px)`
      indicator.innerHTML = '↻'
      indicator.style.animation = 'ec-spin 700ms linear infinite'
      try { await onRefresh() } finally {
        indicator.style.opacity = '0'
        indicator.style.transform = 'translate(-50%, -100%)'
        indicator.style.animation = ''
        state.refreshing = false
      }
    } else {
      indicator.style.opacity = '0'
      indicator.style.transform = 'translate(-50%, -100%)'
    }
  }
  el.addEventListener('touchstart', onTouchStart, { passive: true })
  el.addEventListener('touchmove', onTouchMove, { passive: true })
  el.addEventListener('touchend', onTouchEnd, { passive: true })
  return () => {
    el.removeEventListener('touchstart', onTouchStart)
    el.removeEventListener('touchmove', onTouchMove)
    el.removeEventListener('touchend', onTouchEnd)
    indicator.remove()
  }
}

// ─── 4. iOS-style edge swipe-back navigation ────────────────────────────
// Detects a touch that starts within 20px of the left edge and drags
// right > 60px. Triggers window.history.back() if there's history.
export function useSwipeBack() {
  const startRef = useRef(null)

  useEffect(() => {
    const onTouchStart = (e) => {
      const t = e.touches[0]
      if (t.clientX < 24 && window.history.length > 1) {
        startRef.current = { x: t.clientX, y: t.clientY, t: Date.now() }
      } else {
        startRef.current = null
      }
    }
    const onTouchEnd = (e) => {
      const s = startRef.current
      if (!s) return
      const t = e.changedTouches[0]
      const dx = t.clientX - s.x
      const dy = Math.abs(t.clientY - s.y)
      const dt = Date.now() - s.t
      if (dx > 60 && dy < 80 && dt < 600) {
        window.history.back()
      }
      startRef.current = null
    }
    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchend', onTouchEnd)
    }
  }, [])
}
