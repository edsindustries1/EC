import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiBell, FiVolume2, FiVolumeX, FiExternalLink, FiCheck, FiPlay } from 'react-icons/fi'
import api from '../utils/api'
import { SOUNDS, DEFAULT_SOUND_ID, playSound, getSoundById } from '../utils/notificationSounds'

const BLACK = '#000', WHITE = '#fff'
const GRAY_50 = '#F6F6F6', GRAY_100 = '#EEEEEE', GRAY_500 = '#6B6B6B'
const POLL_MS = 15000
const LAST_SEEN_KEY    = 'ec:notifications:last_seen'
const SOUND_ENABLED_KEY = 'ec:notifications:sound'
const SOUND_ID_KEY      = 'ec:notifications:sound_id'

function timeAgo(iso) {
  if (!iso) return ''
  const d = new Date(iso).getTime()
  const s = Math.max(1, Math.floor((Date.now() - d) / 1000))
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const days = Math.floor(h / 24)
  return `${days}d ago`
}

export default function NotificationBell() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [open, setOpen] = useState(false)
  const [soundPickerOpen, setSoundPickerOpen] = useState(false)
  const [lastSeen, setLastSeen] = useState(() => {
    try { return localStorage.getItem(LAST_SEEN_KEY) || '' } catch { return '' }
  })
  const [soundOn, setSoundOn] = useState(() => {
    try { return localStorage.getItem(SOUND_ENABLED_KEY) !== 'off' } catch { return true }
  })
  const [soundId, setSoundId] = useState(() => {
    try { return localStorage.getItem(SOUND_ID_KEY) || DEFAULT_SOUND_ID } catch { return DEFAULT_SOUND_ID }
  })
  const wrapRef = useRef(null)

  // ── BUG FIX (vs previous version) ───────────────────────────────────────
  // newestDingedRef tracks the most recent item we've ALREADY played sound
  // for, advanced on every poll. Previously the ref only advanced when the
  // user opened the menu — so if they ignored the bell, every poll re-played
  // the same notification's sound every 15 sec for hours. Now: ding once
  // per new item, full stop.
  const newestDingedRef = useRef(null)
  const firstLoadRef = useRef(true)
  const notifPermRequestedRef = useRef(false)

  // Close panel + sound picker on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false); setSoundPickerOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  // Browser notification permission — request lazily on first user action
  const ensureNotifPermission = () => {
    if (notifPermRequestedRef.current) return
    notifPermRequestedRef.current = true
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {})
    }
  }

  const fireDesktopNotifications = (newOnes) => {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
    newOnes.slice(0, 3).forEach((it) => {
      try {
        const n = new Notification(it.title, {
          body: `${it.subtitle}\n${it.meta}`,
          tag: it.id,
          silent: true,    // We play our own sound — silent the OS default
        })
        n.onclick = () => { window.focus(); navigate(it.link); n.close() }
      } catch {}
    })
  }

  // Poll for notifications, fire sound for NEW items only
  useEffect(() => {
    let cancelled = false
    let timer = null

    const tick = async () => {
      try {
        const { data } = await api.get('/notifications/recent?limit=20')
        if (cancelled) return
        const fetched = data?.data?.items || []
        setItems(fetched)

        // Initialise dinged-ref from last-seen on first load — so we DON'T
        // alert for everything that was already there before the user
        // started this session.
        if (firstLoadRef.current) {
          newestDingedRef.current = lastSeen
            ? new Date(lastSeen).getTime()
            : (fetched[0]?.created_at ? new Date(fetched[0].created_at).getTime() : 0)
          firstLoadRef.current = false
          return
        }

        // Detect items newer than what we've already alerted for
        const dingedTs = newestDingedRef.current || 0
        const newOnes = fetched.filter(it => new Date(it.created_at).getTime() > dingedTs)

        if (newOnes.length > 0) {
          if (soundOn) playSound(soundId)
          fireDesktopNotifications(newOnes)

          // CRITICAL: advance the ref past everything we just dinged for,
          // so next poll doesn't re-alert. The badge / lastSeen are
          // independent — they only advance when user opens the menu.
          const newestNewTs = newOnes.reduce(
            (max, it) => Math.max(max, new Date(it.created_at).getTime()),
            dingedTs
          )
          newestDingedRef.current = newestNewTs
        }
      } catch {
        // 401 (logged out) or transient network — silently retry next tick
      } finally {
        if (!cancelled) timer = setTimeout(tick, POLL_MS)
      }
    }
    tick()
    return () => { cancelled = true; if (timer) clearTimeout(timer) }
  }, [soundOn, soundId, lastSeen])

  // Items unseen by the USER (badge count) — distinct from the "already dinged" tracker
  const unreadCount = items.filter(it => {
    if (!lastSeen) return true
    return new Date(it.created_at).getTime() > new Date(lastSeen).getTime()
  }).length

  const openMenu = () => {
    ensureNotifPermission()
    setOpen(true)
    if (items[0]?.created_at) {
      const newest = items[0].created_at
      setLastSeen(newest)
      try { localStorage.setItem(LAST_SEEN_KEY, newest) } catch {}
    }
  }

  const toggleSound = (e) => {
    e.stopPropagation()
    setSoundOn(v => {
      const next = !v
      try { localStorage.setItem(SOUND_ENABLED_KEY, next ? 'on' : 'off') } catch {}
      return next
    })
  }

  const chooseSound = (id) => {
    setSoundId(id)
    try { localStorage.setItem(SOUND_ID_KEY, id) } catch {}
    // Preview the chosen sound when picked
    playSound(id)
  }

  const currentSound = getSoundById(soundId)

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <button
        onClick={() => (open ? setOpen(false) : openMenu())}
        aria-label="Notifications"
        style={{
          position: 'relative',
          background: 'transparent',
          border: 0,
          padding: 8,
          borderRadius: 999,
          color: BLACK,
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 150ms ease',
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = GRAY_50}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <FiBell size={20} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 4, right: 4,
            minWidth: 16, height: 16, padding: '0 4px',
            background: '#ef4444', color: WHITE,
            borderRadius: 999,
            fontSize: 10, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `2px solid ${WHITE}`,
            lineHeight: 1,
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 8px)',
          width: 380, maxHeight: 540, overflow: 'visible',
          background: WHITE,
          borderRadius: 10,
          boxShadow: '0 10px 30px -10px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.06)',
          zIndex: 70,
        }}>
          {/* ── Header ─────────────────────────────────────────────── */}
          <div style={{
            padding: '14px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderBottom: `1px solid ${GRAY_100}`,
            position: 'relative',
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: BLACK }}>Activity</div>

            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {/* Sound chooser */}
              <button
                onClick={(e) => { e.stopPropagation(); setSoundPickerOpen(v => !v) }}
                disabled={!soundOn}
                style={{
                  background: soundPickerOpen ? BLACK : GRAY_50,
                  color: soundPickerOpen ? WHITE : BLACK,
                  border: 0, padding: '6px 10px', borderRadius: 6,
                  cursor: soundOn ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', gap: 5,
                  fontSize: 11, fontWeight: 600,
                  opacity: soundOn ? 1 : 0.4,
                }}
                title="Pick a notification sound"
              >
                {currentSound.label}
                <span style={{ fontSize: 9, opacity: 0.7 }}>▾</span>
              </button>
              {/* Sound on/off toggle */}
              <button
                onClick={toggleSound}
                aria-label={soundOn ? 'Mute sound' : 'Unmute sound'}
                style={{
                  background: GRAY_50, border: 0,
                  padding: '6px 8px', borderRadius: 6,
                  color: BLACK, cursor: 'pointer',
                  display: 'flex', alignItems: 'center',
                }}
                title={soundOn ? 'Sound on' : 'Sound off'}
              >
                {soundOn ? <FiVolume2 size={13}/> : <FiVolumeX size={13}/>}
              </button>
            </div>

            {/* Sound picker dropdown */}
            {soundPickerOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 4px)', right: 16,
                background: WHITE, borderRadius: 10,
                boxShadow: '0 8px 24px -4px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)',
                padding: 6, width: 220, zIndex: 80,
                maxHeight: 420, overflowY: 'auto',
              }}>
                <div style={{
                  padding: '6px 10px 8px',
                  fontSize: 10, fontWeight: 700, color: GRAY_500,
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                }}>
                  Notification sound
                </div>
                {SOUNDS.map(s => (
                  <button
                    key={s.id}
                    onClick={(e) => { e.stopPropagation(); chooseSound(s.id) }}
                    style={{
                      width: '100%', textAlign: 'left',
                      background: soundId === s.id ? GRAY_50 : 'transparent',
                      border: 0, padding: '8px 10px', borderRadius: 6,
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 10,
                      marginBottom: 2,
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = GRAY_50}
                    onMouseLeave={(e) => e.currentTarget.style.background = soundId === s.id ? GRAY_50 : 'transparent'}
                  >
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%',
                      background: soundId === s.id ? BLACK : WHITE,
                      border: `1px solid ${soundId === s.id ? BLACK : GRAY_100}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {soundId === s.id
                        ? <FiCheck size={12} color={WHITE}/>
                        : <FiPlay size={9} color={GRAY_500}/>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: BLACK }}>{s.label}</div>
                      <div style={{ fontSize: 11, color: GRAY_500, marginTop: 1 }}>{s.description}</div>
                    </div>
                  </button>
                ))}
                <div style={{
                  padding: '8px 10px 4px',
                  fontSize: 10, color: GRAY_500, lineHeight: 1.5,
                  borderTop: `1px solid ${GRAY_100}`, marginTop: 4,
                }}>
                  Tap any sound to preview it. Your choice is saved per browser.
                </div>
              </div>
            )}
          </div>

          {items.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: GRAY_500, fontSize: 13 }}>
              No activity yet. New bookings and quote requests will appear here.
            </div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: 360, overflowY: 'auto' }}>
              {items.map((it) => {
                const isUnread = !lastSeen || new Date(it.created_at).getTime() > new Date(lastSeen).getTime()
                return (
                  <li key={it.id}>
                    <button
                      onClick={() => { navigate(it.link); setOpen(false) }}
                      style={{
                        width: '100%', textAlign: 'left',
                        padding: '12px 16px',
                        background: isUnread ? '#fafafa' : WHITE,
                        border: 0,
                        borderBottom: `1px solid ${GRAY_100}`,
                        cursor: 'pointer',
                        display: 'flex', gap: 10, alignItems: 'flex-start',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = GRAY_50}
                      onMouseLeave={(e) => e.currentTarget.style.background = isUnread ? '#fafafa' : WHITE}
                    >
                      <span style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: isUnread ? '#ef4444' : 'transparent',
                        marginTop: 6, flexShrink: 0,
                      }}/>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6, alignItems: 'center' }}>
                          <span style={{
                            fontSize: 10, fontWeight: 700,
                            textTransform: 'uppercase', letterSpacing: '0.08em',
                            padding: '2px 6px', borderRadius: 4,
                            background: it.kind === 'booking' ? '#000' : '#EEEEEE',
                            color: it.kind === 'booking' ? '#fff' : '#000',
                          }}>
                            {it.kind === 'booking' ? 'Booking' : 'Quote'}
                          </span>
                          <span style={{ fontSize: 11, color: GRAY_500 }}>{timeAgo(it.created_at)}</span>
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: BLACK, marginTop: 4 }}>{it.title}</div>
                        <div style={{ fontSize: 13, color: GRAY_500, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.subtitle}</div>
                        <div style={{ fontSize: 12, color: GRAY_500, marginTop: 2 }}>{it.meta}</div>
                      </div>
                      <FiExternalLink size={13} style={{ color: GRAY_500, flexShrink: 0, marginTop: 4 }}/>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}

          <div style={{ padding: '10px 16px', textAlign: 'center', borderTop: `1px solid ${GRAY_100}` }}>
            <button
              onClick={() => { navigate('/operator/activity'); setOpen(false) }}
              style={{ background: 'transparent', border: 0, color: BLACK, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              View all activity →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
