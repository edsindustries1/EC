import React, { useEffect, useMemo, useState } from 'react'
import { FiRefreshCw, FiSend, FiRadio } from 'react-icons/fi'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { Page, PageHeader, Card, EmptyState, StatusChip } from '../../components/uber'
import { BLACK, WHITE, GRAY_50, GRAY_100, GRAY_500 } from '../../styles/uber'

// Operator view of how app bookings are syncing with the dispatch trip log.

const SYNC_LABEL = {
  sent: { label: 'In trip log', bg: '#dcfce7', fg: '#166534' },
  partial: { label: 'Partly sent', bg: '#fef3c7', fg: '#92400e' },
  queued: { label: 'Queued — retrying', bg: '#fef3c7', fg: '#92400e' },
  failed: { label: 'Failed', bg: '#fee2e2', fg: '#991b1b' },
  not_dispatchable: { label: 'Not dispatched (vehicle type)', bg: GRAY_100, fg: GRAY_500 },
  skipped_test: { label: 'Test account — not sent', bg: GRAY_100, fg: GRAY_500 },
  none: { label: 'Not sent', bg: GRAY_100, fg: GRAY_500 },
}

const TABS = [
  { id: 'attention', label: 'Needs attention' },
  { id: 'active', label: 'Active' },
  { id: 'all', label: 'All' },
]

const LEG_LABEL = {
  pending: 'Sending', waiting: 'Waiting', scheduled: 'Reservation', offered: 'Sent to car', on_hold: 'On hold',
  assigned: 'Driver accepted', arrived: 'Arrived', on_board: 'Picked up', completed: 'Completed', cancelled: 'Cancelled', no_show: 'No show',
}

export default function OperatorDispatch() {
  const [rows, setRows] = useState([])
  const [enabled, setEnabled] = useState(true)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('attention')
  const [busy, setBusy] = useState(null)

  const load = async () => {
    try {
      const { data } = await api.get('/operator/dispatch')
      setRows(data?.data || [])
      setEnabled(!!data?.enabled)
    } catch {
      toast.error('Failed to load dispatch status')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    load()
    const t = setInterval(load, 15000)
    return () => clearInterval(t)
  }, [])

  const filtered = useMemo(() => rows.filter(r => {
    if (tab === 'attention') return ['failed', 'queued', 'partial'].includes(r.dispatch_state) || (!r.dispatch_state && !['completed', 'cancelled'].includes(r.status))
    if (tab === 'active') return !['completed', 'cancelled', 'no_show'].includes(r.status)
    return true
  }), [rows, tab])

  const send = async (ref) => {
    setBusy(ref)
    try {
      const { data } = await api.post(`/operator/bookings/${ref}/dispatch`)
      const d = data?.data
      if (d?.dispatch_state === 'sent') toast.success(`${ref} is in the trip log`)
      else toast.error(d?.dispatch_error || `${ref}: ${d?.dispatch_state}`)
      load()
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Send failed')
    } finally {
      setBusy(null)
    }
  }

  return (
    <Page>
      <PageHeader
        title="Dispatch"
        lead="App bookings in the dispatch trip log. Bookings appear there as waiting jobs; dispatchers assign cars as usual."
        right={<button onClick={load} style={ghostBtn}><FiRefreshCw size={13} /> Refresh</button>}
      />

      {!enabled && (
        <Card style={{ marginBottom: 16, background: '#fffbeb', borderColor: '#fde68a' }}>
          <strong>Dispatch integration is switched off.</strong> New bookings are not sent to the trip log. Set DISPATCH_ENABLED=true on the server to turn it on.
        </Card>
      )}

      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ ...ghostBtn, background: tab === t.id ? BLACK : WHITE, color: tab === t.id ? WHITE : BLACK }}>{t.label}</button>
        ))}
      </div>

      {loading ? null : filtered.length === 0 ? (
        <EmptyState icon={FiRadio} title="Nothing here" description={tab === 'attention' ? 'Every booking is in the trip log.' : 'No bookings yet.'} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(r => {
            const sync = SYNC_LABEL[r.dispatch_state || 'none'] || SYNC_LABEL.none
            const canSend = enabled && !['completed', 'cancelled', 'no_show'].includes(r.status) && !['sent', 'not_dispatchable', 'skipped_test'].includes(r.dispatch_state)
            return (
              <Card key={r.reference} padded={false} style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, justifyContent: 'space-between' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: 'monospace', fontWeight: 700 }}>{r.reference} <span style={{ fontFamily: 'inherit', fontWeight: 500, color: GRAY_500 }}>· {r.name} · {r.vehicle_type}</span></div>
                    <div style={{ fontSize: 13, color: GRAY_500, marginTop: 2 }}>{r.pickup} → {r.dropoff}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <StatusChip status={r.status} />
                    <span style={{ padding: '3px 9px', borderRadius: 999, background: sync.bg, color: sync.fg, fontSize: 11, fontWeight: 700 }}>{sync.label}</span>
                    {canSend && (
                      <button onClick={() => send(r.reference)} disabled={busy === r.reference} style={{ ...ghostBtn, background: BLACK, color: WHITE }}>
                        <FiSend size={12} /> {busy === r.reference ? 'Sending…' : 'Send to dispatch'}
                      </button>
                    )}
                  </div>
                </div>
                {r.legs?.length > 0 && (
                  <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {r.legs.map(l => (
                      <div key={l.leg} style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 12, padding: '6px 10px', background: GRAY_50, borderRadius: 6 }}>
                        <strong style={{ width: 70 }}>{l.leg === 'return' ? 'Return' : 'Outbound'}</strong>
                        <span>{l.pickup_date} {l.pickup_time}</span>
                        <span>{l.job_no ? `Job #${l.job_no}` : l.trip_id ? `Trip ${l.trip_id}` : 'not in trip log'}</span>
                        <span style={{ fontWeight: 600 }}>{LEG_LABEL[l.status] || l.status}</span>
                        {l.car_no && <span>Car {l.car_no}{l.driver?.first_name ? ` · ${l.driver.first_name}` : ''}</span>}
                        {l.error && <span style={{ color: '#991b1b' }}>{l.error} (attempt {l.attempts})</span>}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </Page>
  )
}

const ghostBtn = {
  background: WHITE, color: BLACK, border: `1px solid ${GRAY_100}`, borderRadius: 999,
  padding: '7px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', gap: 6,
}
