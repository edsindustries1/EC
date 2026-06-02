import React, { useEffect, useMemo, useState } from 'react'
import { FiSearch, FiPlus, FiPhone, FiTruck, FiUsers, FiX } from 'react-icons/fi'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { Page, PageHeader, Card, EmptyState, StatusChip, PrimaryButton } from '../../components/uber'
import { BLACK, WHITE, GRAY_50, GRAY_100, GRAY_500, FONT, inputStyle, btnPrimary } from '../../styles/uber'

const VEHICLE_TYPES = [
  { id: 'sedan',         label: 'Sedan' },
  { id: 'suv',           label: 'SUV' },
  { id: 'sprinter_van',  label: 'Sprinter' },
  { id: 'mini_bus',      label: 'Shuttle' },
  { id: 'coach',         label: 'Coach' },
  { id: 'limo',          label: 'Limo' },
]

const STATUS_TABS = [
  { id: 'all',       label: 'All' },
  { id: 'available', label: 'Available' },
  { id: 'on_trip',   label: 'On trip' },
  { id: 'offline',   label: 'Offline' },
]

const blankForm = {
  name: '', phone: '', email: '',
  vehicle_type: 'sedan', vehicle: '', plate: '',
}

export default function OperatorDrivers() {
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [type, setType] = useState('all')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(blankForm)
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/drivers')
      setDrivers(res.data?.data || [])
    } catch { toast.error('Failed to load drivers') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return drivers.filter(d => {
      if (status !== 'all' && d.status !== status) return false
      if (type !== 'all' && d.vehicle_type !== type) return false
      if (q) {
        const blob = `${d.name || ''} ${d.phone || ''} ${d.vehicle || ''} ${d.plate || ''}`.toLowerCase()
        if (!blob.includes(q)) return false
      }
      return true
    })
  }, [drivers, search, status, type])

  const counts = {
    all: drivers.length,
    available: drivers.filter(d => d.status === 'available').length,
    on_trip: drivers.filter(d => d.status === 'on_trip').length,
    offline: drivers.filter(d => d.status === 'offline').length,
  }

  const onChange = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim()) { toast.error('Name and phone required'); return }
    setSubmitting(true)
    try {
      await api.post('/drivers', form)
      toast.success('Driver added')
      setShowAdd(false)
      setForm(blankForm)
      load()
    } catch { toast.error('Could not add driver') }
    finally { setSubmitting(false) }
  }

  return (
    <Page>
      <PageHeader
        title="Drivers"
        lead={`${counts.all} chauffeurs · ${counts.available} available right now`}
        right={
          <PrimaryButton onClick={() => setShowAdd(true)} style={{ borderRadius: 999 }}>
            <FiPlus size={14}/> Add driver
          </PrimaryButton>
        }
      />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        <Tabs value={status} onChange={setStatus} tabs={STATUS_TABS} counts={counts}/>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <FiSearch size={14} style={{ position: 'absolute', left: 12, top: 13, color: GRAY_500 }}/>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, plate…"
            style={{ ...inputStyle(), borderRadius: 999, paddingLeft: 34 }}
          />
        </div>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={{ ...inputStyle(), maxWidth: 180, borderRadius: 999 }}
        >
          <option value="all">All vehicle types</option>
          {VEHICLE_TYPES.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
        </select>
      </div>

      {loading ? (
        <Card><div style={{ color: GRAY_500, textAlign: 'center', padding: 32 }}>Loading…</div></Card>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FiUsers}
          title="No drivers found"
          description={search || status !== 'all' ? 'Try clearing filters.' : 'Add your first driver to start dispatching.'}
          action={!search && status === 'all' && (
            <PrimaryButton onClick={() => setShowAdd(true)} style={{ borderRadius: 999 }}>
              <FiPlus size={14}/> Add driver
            </PrimaryButton>
          )}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(d => <DriverCard key={d.id} d={d}/>)}
        </div>
      )}

      {showAdd && (
        <Modal onClose={() => setShowAdd(false)} title="Add driver">
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Field label="Full name *">
              <input value={form.name} onChange={onChange('name')} placeholder="James Carter" style={inputStyle()}/>
            </Field>
            <Field label="Phone *">
              <input value={form.phone} onChange={onChange('phone')} placeholder="+1 (212) 555-0100" style={inputStyle()}/>
            </Field>
            <Field label="Email">
              <input type="email" value={form.email} onChange={onChange('email')} placeholder="james@everywheretransfers.com" style={inputStyle()}/>
            </Field>
            <Field label="Vehicle type">
              <select value={form.vehicle_type} onChange={onChange('vehicle_type')} style={inputStyle()}>
                {VEHICLE_TYPES.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
              </select>
            </Field>
            <Field label="Vehicle">
              <input value={form.vehicle} onChange={onChange('vehicle')} placeholder="Lincoln Town Car · 2022 · Black" style={inputStyle()}/>
            </Field>
            <Field label="License plate">
              <input value={form.plate} onChange={onChange('plate')} placeholder="NYC-1234" style={{ ...inputStyle(), fontFamily: 'monospace', letterSpacing: '0.05em' }}/>
            </Field>
            <button type="submit" disabled={submitting} style={{
              ...btnPrimary, justifyContent: 'center', width: '100%',
              padding: '13px 22px', fontSize: 15,
              opacity: submitting ? 0.6 : 1, cursor: submitting ? 'not-allowed' : 'pointer',
              marginTop: 6,
            }}>
              {submitting ? 'Adding…' : 'Add driver'}
            </button>
          </form>
        </Modal>
      )}
    </Page>
  )
}

function DriverCard({ d }) {
  const vt = VEHICLE_TYPES.find(v => v.id === d.vehicle_type)?.label || d.vehicle_type
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: BLACK, color: WHITE,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 16, flexShrink: 0,
        }}>{d.name?.charAt(0)?.toUpperCase() || '?'}</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{d.name}</div>
          <div style={{ fontSize: 12, color: GRAY_500 }}>{d.phone}</div>
        </div>
        <StatusChip status={d.status}/>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: GRAY_500 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <FiTruck size={12}/> {vt}{d.vehicle ? ` · ${d.vehicle}` : ''}
        </div>
        {d.plate && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: BLACK, padding: '2px 6px', background: GRAY_50, borderRadius: 4, fontFamily: 'monospace', letterSpacing: '0.05em' }}>
              {d.plate}
            </span>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
        <a href={`tel:${d.phone}`} style={{
          flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          padding: '8px 12px', borderRadius: 4,
          background: GRAY_50, color: BLACK, textDecoration: 'none',
          fontSize: 13, fontWeight: 600,
        }}>
          <FiPhone size={12}/> Call
        </a>
      </div>
    </Card>
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
          {counts && <span style={{ fontSize: 10, fontWeight: 700, background: value === t.id ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.08)', padding: '1px 6px', borderRadius: 999 }}>{counts[t.id]}</span>}
        </button>
      ))}
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

function Modal({ onClose, title, children }) {
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
          <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>{title}</h2>
          <button onClick={onClose} aria-label="Close" style={{
            background: GRAY_50, border: 0, borderRadius: '50%',
            width: 32, height: 32, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: BLACK,
          }}><FiX size={16}/></button>
        </div>
        {children}
      </div>
    </div>
  )
}
