import React, { useEffect, useMemo, useRef, useState } from 'react'
import { FiRefreshCw, FiSearch, FiPhone, FiMail, FiMapPin, FiCalendar, FiClock, FiUsers, FiTruck, FiChevronDown } from 'react-icons/fi'
import api from '../../utils/api'

const BLACK = '#000', WHITE = '#fff'
const GRAY_50 = '#F6F6F6', GRAY_100 = '#EEEEEE', GRAY_500 = '#6B6B6B'
const FONT = "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif"

const POLL_MS = 10000

const KIND_TABS = [
  { id: 'all',           label: 'All' },
  { id: 'booking',       label: 'Bookings' },
  { id: 'quote_request', label: 'Quote requests' },
]
const STATUS_TABS = [
  { id: 'all',        label: 'All' },
  { id: 'pending',    label: 'Pending' },
  { id: 'confirmed',  label: 'Confirmed' },
  { id: 'quoted',     label: 'Quoted' },
  { id: 'completed',  label: 'Completed' },
  { id: 'cancelled',  label: 'Cancelled' },
]

const VEHICLE_LABEL = {
  sedan: 'Sedan', suv: 'SUV', sprinter_van: 'Sprinter',
  mini_bus: 'Shuttle', coach: 'Coach', limo: 'Limo',
}

function timeAgo(iso) {
  if (!iso) return ''
  const d = new Date(iso).getTime()
  const s = Math.max(1, Math.floor((Date.now() - d) / 1000))
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function OperatorActivity() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [polling, setPolling] = useState(false)
  const [lastFetched, setLastFetched] = useState(null)
  const [kind, setKind] = useState('all')
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(null)
  const [tickToken, setTickToken] = useState(0)
  const cancelRef = useRef(false)

  // Re-render every 30s so "X min ago" stays fresh
  useEffect(() => {
    const t = setInterval(() => setTickToken(v => v + 1), 30000)
    return () => clearInterval(t)
  }, [])

  // Fetch + poll
  useEffect(() => {
    cancelRef.current = false
    let timer = null

    const tick = async (showSpinner = false) => {
      if (showSpinner) setPolling(true)
      try {
        const { data } = await api.get('/notifications/recent?limit=50')
        if (cancelRef.current) return
        setItems(data?.data?.items || [])
        setLastFetched(new Date())
      } catch (e) {
        // ignore network blips
      } finally {
        if (!cancelRef.current) {
          setLoading(false)
          setPolling(false)
          timer = setTimeout(() => tick(false), POLL_MS)
        }
      }
    }
    tick(true)
    return () => { cancelRef.current = true; if (timer) clearTimeout(timer) }
  }, [])

  const manualRefresh = async () => {
    setPolling(true)
    try {
      const { data } = await api.get('/notifications/recent?limit=50')
      setItems(data?.data?.items || [])
      setLastFetched(new Date())
    } catch {}
    setPolling(false)
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter(it => {
      if (kind !== 'all' && it.kind !== kind) return false
      if (status !== 'all' && it.status !== status) return false
      if (q) {
        const blob = `${it.name || ''} ${it.email || ''} ${it.phone || ''} ${it.pickup || ''} ${it.dropoff || ''} ${it.reference || ''}`.toLowerCase()
        if (!blob.includes(q)) return false
      }
      return true
    })
  }, [items, kind, status, search, tickToken])

  const counts = useMemo(() => {
    return {
      all: items.length,
      booking: items.filter(i => i.kind === 'booking').length,
      quote_request: items.filter(i => i.kind === 'quote_request').length,
    }
  }, [items])

  return (
    <div style={{ background: WHITE, color: BLACK, minHeight: '100vh', fontFamily: FONT, letterSpacing: '-0.01em' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12" style={{ padding: '32px 0 80px' }}>

        {/* HEADER */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 22 }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>
              Live activity
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: GRAY_500 }}>
              <LiveDot />
              <span>Live — updates every {POLL_MS / 1000}s</span>
              {lastFetched && <span>· last refresh {timeAgo(lastFetched.toISOString())}</span>}
            </div>
          </div>
          <button
            onClick={manualRefresh}
            disabled={polling}
            style={{
              background: BLACK, color: WHITE,
              padding: '10px 18px', borderRadius: 999, border: 0,
              fontWeight: 600, fontSize: 13, cursor: polling ? 'wait' : 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              opacity: polling ? 0.6 : 1,
            }}
          >
            <FiRefreshCw size={13} style={{ animation: polling ? 'spin 0.9s linear infinite' : 'none' }}/>
            Refresh
          </button>
        </div>

        {/* TABS + SEARCH */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16, alignItems: 'center' }}>
          <Tabs value={kind} onChange={setKind} tabs={KIND_TABS} counts={counts}/>
          <Tabs value={status} onChange={setStatus} tabs={STATUS_TABS}/>
          <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
            <FiSearch size={14} style={{ position: 'absolute', left: 12, top: 13, color: GRAY_500 }}/>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, route, reference…"
              style={{
                width: '100%', padding: '10px 12px 10px 34px',
                background: GRAY_50, border: `1px solid ${GRAY_100}`,
                borderRadius: 999, fontSize: 13, color: BLACK, outline: 'none', fontFamily: FONT,
              }}
            />
          </div>
        </div>

        {/* LIST */}
        {loading ? (
          <SkeletonList />
        ) : filtered.length === 0 ? (
          <EmptyState hasFilter={kind !== 'all' || status !== 'all' || !!search}/>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(it => (
              <Row
                key={it.id}
                item={it}
                expanded={expanded === it.id}
                onToggle={() => setExpanded(e => e === it.id ? null : it.id)}
              />
            ))}
          </ul>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

function Tabs({ value, onChange, tabs, counts }) {
  return (
    <div style={{ display: 'flex', gap: 4, background: GRAY_50, padding: 4, borderRadius: 999 }}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            padding: '7px 14px', borderRadius: 999,
            fontWeight: 600, fontSize: 12, border: 0, cursor: 'pointer',
            background: value === t.id ? BLACK : 'transparent',
            color: value === t.id ? WHITE : BLACK,
            display: 'inline-flex', alignItems: 'center', gap: 5,
            transition: 'all 150ms ease',
          }}
        >
          {t.label}
          {counts && counts[t.id] != null && (
            <span style={{
              fontSize: 10, fontWeight: 700,
              background: value === t.id ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.08)',
              color: value === t.id ? WHITE : BLACK,
              padding: '1px 6px', borderRadius: 999,
            }}>{counts[t.id]}</span>
          )}
        </button>
      ))}
    </div>
  )
}

function Row({ item, expanded, onToggle }) {
  const isBooking = item.kind === 'booking'
  return (
    <li>
      <div style={{
        background: WHITE,
        border: `1px solid ${GRAY_100}`,
        borderRadius: 8,
        overflow: 'hidden',
        transition: 'border-color 180ms ease',
      }}>
        <button
          onClick={onToggle}
          style={{
            width: '100%', textAlign: 'left',
            background: 'transparent', border: 0,
            padding: '14px 18px',
            cursor: 'pointer',
            display: 'grid', gap: 12,
            gridTemplateColumns: 'auto 1fr auto auto auto auto',
            alignItems: 'center',
          }}
        >
          <KindPill kind={item.kind}/>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {item.name || 'Guest'}
              {item.reference && <span style={{ fontFamily: 'monospace', fontSize: 12, color: GRAY_500, fontWeight: 600 }}>{item.reference}</span>}
            </div>
            <div style={{
              fontSize: 13, color: GRAY_500, marginTop: 2,
              display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
            }}>
              <FiMapPin size={11}/>
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 380 }}>
                {item.pickup} → {item.dropoff}
              </span>
            </div>
          </div>
          <div style={cell}>
            <FiTruck size={12} style={{ color: GRAY_500 }}/>
            <span style={cellTxt}>{VEHICLE_LABEL[item.vehicle_type] || item.vehicle_type || '—'}</span>
          </div>
          <div style={cell}>
            <FiUsers size={12} style={{ color: GRAY_500 }}/>
            <span style={cellTxt}>{item.passengers || 1}</span>
          </div>
          <div style={{ ...cellTxt, fontWeight: 700 }}>
            {item.price ? `$${item.price}` : '—'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <StatusChip status={item.status}/>
            <span style={{ fontSize: 12, color: GRAY_500, minWidth: 60, textAlign: 'right' }}>{timeAgo(item.created_at)}</span>
            <FiChevronDown size={14} style={{ color: GRAY_500, transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 180ms ease' }}/>
          </div>
        </button>

        {expanded && (
          <div style={{ borderTop: `1px solid ${GRAY_100}`, padding: '18px 22px', background: GRAY_50 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3" style={{ fontSize: 13 }}>
              <DetailRow icon={FiUsers} label="Customer">{item.name || 'Guest'}</DetailRow>
              <DetailRow icon={FiCalendar} label="When">{item.pickup_date} {item.pickup_time}</DetailRow>
              <DetailRow icon={FiPhone} label="Phone"><a href={`tel:${item.phone}`} style={link}>{item.phone || '—'}</a></DetailRow>
              <DetailRow icon={FiMail} label="Email"><a href={`mailto:${item.email}`} style={link}>{item.email || '—'}</a></DetailRow>
              {item.flight_number && <DetailRow label="Flight">{item.flight_number}</DetailRow>}
              {item.special_requests && <DetailRow label="Notes">{item.special_requests}</DetailRow>}
              {item.price_low && <DetailRow label="Quoted range">${item.price_low}–${item.price_high}</DetailRow>}
            </div>
          </div>
        )}
      </div>
    </li>
  )
}

function KindPill({ kind }) {
  const isBooking = kind === 'booking'
  return (
    <span style={{
      padding: '4px 10px', borderRadius: 999,
      background: isBooking ? BLACK : GRAY_100,
      color: isBooking ? WHITE : BLACK,
      fontSize: 10, fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.08em',
      whiteSpace: 'nowrap',
    }}>
      {isBooking ? 'Booking' : 'Quote req'}
    </span>
  )
}

function StatusChip({ status }) {
  const map = {
    pending:    { bg: '#fef3c7', fg: '#92400e' },
    quoted:     { bg: '#dbeafe', fg: '#1e40af' },
    confirmed:  { bg: '#dcfce7', fg: '#166534' },
    assigned:   { bg: '#e0e7ff', fg: '#3730a3' },
    in_progress:{ bg: '#fce7f3', fg: '#9d174d' },
    completed:  { bg: GRAY_100,  fg: BLACK     },
    cancelled:  { bg: '#fee2e2', fg: '#991b1b' },
  }
  const c = map[status] || { bg: GRAY_100, fg: BLACK }
  return (
    <span style={{
      padding: '3px 9px', borderRadius: 999,
      background: c.bg, color: c.fg,
      fontSize: 11, fontWeight: 700,
      textTransform: 'capitalize',
    }}>{(status || 'pending').replace('_', ' ')}</span>
  )
}

function DetailRow({ icon: Icon, label, children }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
      {Icon && <Icon size={12} style={{ color: GRAY_500, marginTop: 3 }}/>}
      <div style={{ color: GRAY_500, minWidth: 90, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      <div style={{ color: BLACK, fontWeight: 500, wordBreak: 'break-word' }}>{children}</div>
    </div>
  )
}

function LiveDot() {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', width: 8, height: 8 }}>
      <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#22c55e', opacity: 0.5, animation: 'ping 1.6s cubic-bezier(0,0,0.2,1) infinite' }}/>
      <span style={{ position: 'relative', width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }}/>
      <style>{`@keyframes ping { 0% { transform: scale(1); opacity: 0.7 } 80%, 100% { transform: scale(2.4); opacity: 0 } }`}</style>
    </span>
  )
}

function SkeletonList() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {[1,2,3,4,5].map(i => (
        <div key={i} className="animate-pulse" style={{ background: WHITE, border: `1px solid ${GRAY_100}`, borderRadius: 8, padding: 18, height: 70 }}/>
      ))}
    </div>
  )
}

function EmptyState({ hasFilter }) {
  return (
    <div style={{ padding: '60px 24px', textAlign: 'center', background: GRAY_50, borderRadius: 8, border: `1px dashed ${GRAY_100}` }}>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
        {hasFilter ? 'No matching activity' : 'Waiting for activity'}
      </div>
      <p style={{ color: GRAY_500, fontSize: 14 }}>
        {hasFilter ? 'Try clearing filters or search.' : 'New bookings and quote requests will appear here in real time.'}
      </p>
    </div>
  )
}

const cell = { display: 'inline-flex', alignItems: 'center', gap: 6 }
const cellTxt = { fontSize: 13, color: BLACK }
const link = { color: BLACK, fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 2 }
