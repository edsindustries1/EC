import React, { useEffect, useMemo, useState } from 'react'
import { FiSearch, FiPhone, FiMail, FiMapPin, FiCalendar, FiUsers, FiTruck, FiDollarSign, FiX, FiArrowRight } from 'react-icons/fi'
import { format } from 'date-fns'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { Page, PageHeader, Card, EmptyState, StatusChip } from '../../components/uber'
import { BLACK, WHITE, GRAY_50, GRAY_100, GRAY_500, FONT, inputStyle, btnPrimary } from '../../styles/uber'

const STATUS_TABS = [
  { id: 'all',       label: 'All' },
  { id: 'pending',   label: 'Pending' },
  { id: 'quoted',    label: 'Quoted' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
]

const VEHICLE_LABEL = {
  sedan: 'Sedan', suv: 'SUV', sprinter_van: 'Sprinter',
  mini_bus: 'Shuttle', coach: 'Coach', limo: 'Limo',
}

export default function OperatorRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [bidFor, setBidFor] = useState(null)

  const load = async () => {
    try {
      const res = await api.get('/quote-requests', { params: { limit: 100 } })
      setRequests(res.data?.data || [])
    } catch { toast.error('Failed to load requests') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return requests.filter(r => {
      if (status !== 'all' && r.status !== status) return false
      if (q) {
        const blob = `${r.name || r.customer_name || ''} ${r.email || ''} ${r.phone || ''} ${r.pickup || ''} ${r.dropoff || ''}`.toLowerCase()
        if (!blob.includes(q)) return false
      }
      return true
    })
  }, [requests, search, status])

  const counts = useMemo(() => {
    const c = { all: requests.length }
    STATUS_TABS.forEach(s => { if (s.id !== 'all') c[s.id] = requests.filter(r => r.status === s.id).length })
    return c
  }, [requests])

  return (
    <Page>
      <PageHeader
        title="Quote requests"
        lead="Customer lead requests that need an operator quote."
      />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        <Tabs value={status} onChange={setStatus} tabs={STATUS_TABS} counts={counts}/>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <FiSearch size={14} style={{ position: 'absolute', left: 12, top: 13, color: GRAY_500 }}/>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, route, phone…"
            style={{ ...inputStyle(), borderRadius: 999, paddingLeft: 34 }}
          />
        </div>
      </div>

      {loading ? (
        <Card><div style={{ color: GRAY_500, textAlign: 'center', padding: 32 }}>Loading…</div></Card>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FiMapPin}
          title="No requests yet"
          description={search || status !== 'all' ? 'Try clearing filters.' : 'New quote requests will appear here.'}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(r => (
            <RequestCard key={r.id} r={r} onBid={() => setBidFor(r)}/>
          ))}
        </div>
      )}

      {bidFor && <BidModal req={bidFor} onClose={() => setBidFor(null)} onSubmitted={load}/>}
    </Page>
  )
}

function RequestCard({ r, onBid }) {
  const ts = r.created_at ? format(new Date(r.created_at), 'MMM d · HH:mm') : ''
  // Operators can bid on any request that's open / pending / has bids but
  // hasn't been confirmed yet. 'open' is the status set by the customer-
  // facing /api/ride-requests endpoint; 'pending' by the legacy quote form;
  // 'quoted' once at least one operator has bid.
  const canBid = ['open', 'pending', 'quoted', 'new'].includes(r.status)
  return (
    <Card style={{ padding: 0 }}>
      <div style={{ padding: '18px 22px', display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'flex-start' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
            <span style={{ fontSize: 16, fontWeight: 700 }}>{r.name || r.customer_name || 'Guest'}</span>
            <StatusChip status={r.status}/>
            <span style={{ fontSize: 12, color: GRAY_500 }}>{ts}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: BLACK, marginBottom: 6 }}>
            <FiMapPin size={12} style={{ color: GRAY_500 }}/>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {r.pickup} <span style={{ color: GRAY_500, margin: '0 4px' }}>→</span> {r.dropoff}
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: 13, color: GRAY_500 }}>
            <span style={meta}><FiTruck size={11}/> {VEHICLE_LABEL[r.vehicle_type] || r.vehicle_type || 'sedan'}</span>
            <span style={meta}><FiUsers size={11}/> {r.passengers || 1} pax</span>
            {r.ride_date && <span style={meta}><FiCalendar size={11}/> {r.ride_date}</span>}
            {r.phone && <span style={meta}><FiPhone size={11}/> <a href={`tel:${r.phone}`} style={link}>{r.phone}</a></span>}
            {r.email && <span style={meta}><FiMail size={11}/> <a href={`mailto:${r.email}`} style={link}>{r.email}</a></span>}
          </div>
          {r.bids?.length > 0 && (
            <div style={{ marginTop: 10, padding: '8px 10px', background: GRAY_50, borderRadius: 999, fontSize: 13 }}>
              <span style={{ fontWeight: 700 }}>${r.bids[0].price}</span>
              <span style={{ color: GRAY_500, marginLeft: 8 }}>· {r.bids[0].operator_name || 'You'}</span>
              {r.bids[0].notes && <span style={{ color: GRAY_500, marginLeft: 8 }}>· {r.bids[0].notes}</span>}
            </div>
          )}
        </div>
        {canBid && (
          <button onClick={onBid} style={{ ...btnPrimary, borderRadius: 999 }}>
            <FiDollarSign size={13}/> Send bid
          </button>
        )}
      </div>
    </Card>
  )
}

function BidModal({ req, onClose, onSubmitted }) {
  const [price, setPrice] = useState('')
  const [eta, setEta] = useState('30')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!price) { toast.error('Price required'); return }
    setSubmitting(true)
    try {
      // Use the new bid-marketplace endpoint — generates a Payroc payment
      // session + emails the customer the offer with a payment link.
      await api.post(`/operator/bids`, {
        quote_request_id: req.id,
        price: Number(price),
        eta_minutes: Number(eta) || 30,
        vehicle_type: req.vehicle_type || 'sedan',
        notes,
      })
      toast.success('Bid sent')
      onSubmitted()
      onClose()
    } catch { toast.error('Could not send bid') }
    finally { setSubmitting(false) }
  }

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16, fontFamily: FONT,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: WHITE, borderRadius: 12,
        width: '100%', maxWidth: 460, maxHeight: '92vh', overflow: 'auto',
        padding: 24,
        boxShadow: '0 20px 50px -10px rgba(0,0,0,0.3)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>Send bid</h2>
          <button onClick={onClose} style={{
            background: GRAY_50, border: 0, borderRadius: '50%',
            width: 32, height: 32, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><FiX size={16}/></button>
        </div>

        <div style={{ background: GRAY_50, padding: 14, borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>{req.name || req.customer_name || 'Guest'}</div>
          <div style={{ color: GRAY_500 }}>{req.pickup} → {req.dropoff}</div>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Field label="Your price ($) *">
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="120" style={inputStyle()} autoFocus/>
          </Field>
          <Field label="ETA (minutes)">
            <input type="number" value={eta} onChange={(e) => setEta(e.target.value)} placeholder="30" style={inputStyle()}/>
          </Field>
          <Field label="Message (optional)">
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Add a note for the customer…" style={inputStyle()}/>
          </Field>
          <button type="submit" disabled={submitting} style={{
            ...btnPrimary, justifyContent: 'center', width: '100%',
            padding: '13px 22px', fontSize: 15,
            opacity: submitting ? 0.6 : 1, cursor: submitting ? 'not-allowed' : 'pointer',
            marginTop: 4,
          }}>
            {submitting ? 'Sending…' : <>Send bid <FiArrowRight size={14}/></>}
          </button>
        </form>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: GRAY_500, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  )
}

function Tabs({ value, onChange, tabs, counts }) {
  return (
    <div style={{ display: 'inline-flex', gap: 4, background: GRAY_50, padding: 4, borderRadius: 999 }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)}
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
            <span style={{ fontSize: 10, fontWeight: 700, background: value === t.id ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.08)', padding: '1px 6px', borderRadius: 999 }}>{counts[t.id]}</span>
          )}
        </button>
      ))}
    </div>
  )
}

const meta = { display: 'inline-flex', alignItems: 'center', gap: 4 }
const link = { color: BLACK, textDecoration: 'none' }
