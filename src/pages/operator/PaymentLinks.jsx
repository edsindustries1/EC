/**
 * Operator payment-link tool — used both as a standalone page
 * (/operator/payment-links) and embedded on the Activity page.
 *
 * Lets the operator generate a custom Payroc payment link for any amount,
 * for any customer, with any description. The email goes out automatically.
 */
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  FiSend, FiCopy, FiX, FiCheck, FiDollarSign, FiMail, FiUser,
  FiRefreshCw, FiSlash, FiAlertCircle,
} from 'react-icons/fi'
import api from '../../utils/api'
import { Page, PageHeader, Card, EmptyState, PrimaryButton } from '../../components/uber'
import { BLACK, WHITE, GRAY_50, GRAY_100, GRAY_500, FONT, inputStyle, btnPrimary } from '../../styles/uber'

const POLL_MS = 15000

const STATUS_LABEL = {
  pending:   { bg: '#fef3c7', fg: '#92400e', label: 'Pending' },
  paid:      { bg: '#dcfce7', fg: '#166534', label: 'Paid' },
  cancelled: { bg: '#fee2e2', fg: '#991b1b', label: 'Cancelled' },
  expired:   { bg: '#f3f4f6', fg: '#4b5563', label: 'Expired' },
}

export default function PaymentLinks({ embedded = false, prefill = null }) {
  const navigate = useNavigate()
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(Boolean(prefill))

  const load = async () => {
    try {
      const { data } = await api.get('/operator/payment-links?limit=50')
      setLinks(data?.data || [])
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Could not load payment links')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  // Auto-poll so a paid link's status update appears without manual refresh
  useEffect(() => {
    const t = setInterval(load, POLL_MS)
    return () => clearInterval(t)
  }, [])

  const onCreated = (created) => {
    setLinks(prev => [created, ...prev])
    setShowModal(false)
    toast.success(`Payment link emailed to ${created.customer_email}`)
  }

  const cancel = async (id) => {
    if (!confirm('Cancel this payment link? The customer will not be able to pay it anymore.')) return
    try {
      const { data } = await api.post(`/operator/payment-links/${id}/cancel`)
      setLinks(prev => prev.map(l => l.id === data.data.id ? data.data : l))
      toast.success('Link cancelled')
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Cancel failed')
    }
  }

  const content = (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>
            {embedded ? 'Send a payment link' : 'Payment links'}
          </h2>
          <p style={{ fontSize: 13, color: GRAY_500, marginTop: 2 }}>
            Generate a custom Payroc payment link for any amount and we'll email it to the customer.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={load} title="Refresh" style={iconBtn}>
            <FiRefreshCw size={14}/>
          </button>
          <PrimaryButton onClick={() => setShowModal(true)} style={{ borderRadius: 999, padding: '10px 18px' }}>
            <FiSend size={13}/> Send payment link
          </PrimaryButton>
        </div>
      </div>

      {loading ? (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {[180, 220, 80, 260, 90, 60].map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, padding: '14px 16px', borderBottom: i < 4 ? `1px solid ${GRAY_100}` : 0 }}>
              <div className="skeleton" style={{ width: 110, height: 12, borderRadius: 4 }}/>
              <div className="skeleton" style={{ width: 180, height: 12, borderRadius: 4 }}/>
              <div className="skeleton" style={{ width: 60, height: 12, borderRadius: 4 }}/>
              <div className="skeleton" style={{ width: 200, height: 12, borderRadius: 4 }}/>
              <div className="skeleton" style={{ width: 70, height: 12, borderRadius: 999 }}/>
            </div>
          ))}
        </Card>
      ) : links.length === 0 ? (
        <EmptyState
          icon={FiDollarSign}
          title="No payment links yet"
          description="When you send your first payment link, it'll appear here with live status."
          action={<PrimaryButton onClick={() => setShowModal(true)} style={{ borderRadius: 999 }}>
            <FiSend size={13}/> Send your first link
          </PrimaryButton>}
        />
      ) : (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONT }}>
              <thead>
                <tr style={{ background: GRAY_50 }}>
                  {['Sent', 'Customer', 'Amount', 'Description', 'Status', ''].map(h => (
                    <th key={h} style={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {links.map(l => <LinkRow key={l.id} link={l} onCancel={() => cancel(l.id)}/>)}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {showModal && (
        <CreateModal
          prefill={prefill}
          onClose={() => setShowModal(false)}
          onCreated={onCreated}
        />
      )}
    </>
  )

  if (embedded) {
    return <div style={{ marginTop: 28 }}>{content}</div>
  }
  return (
    <Page>
      <PageHeader title="Payment links" lead="Send Payroc-backed payment links to customers."/>
      {content}
    </Page>
  )
}

// ── Row ────────────────────────────────────────────────────────────────────
function LinkRow({ link, onCancel }) {
  const status = STATUS_LABEL[link.status] || STATUS_LABEL.pending
  const amount = (Number(link.amount_cents) / 100).toFixed(2)
  const sent = link.created_at ? new Date(link.created_at).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  }) : '—'

  const copyUrl = () => {
    navigator.clipboard.writeText(link.payment_url)
    toast.success('Link copied')
  }

  return (
    <tr>
      <td style={{ ...td, whiteSpace: 'nowrap' }}>{sent}</td>
      <td style={{ ...td, minWidth: 0 }}>
        <div style={{ fontWeight: 600, color: BLACK, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {link.customer_name || '—'}
        </div>
        <div style={{ fontSize: 12, color: GRAY_500, marginTop: 1, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {link.customer_email}
        </div>
      </td>
      <td style={{ ...td, fontWeight: 700, whiteSpace: 'nowrap' }}>${amount}</td>
      <td style={{ ...td, color: GRAY_500 }}>
        <div style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {link.description || '—'}
        </div>
      </td>
      <td style={td}>
        <span style={{
          background: status.bg, color: status.fg,
          padding: '3px 9px', borderRadius: 999,
          fontSize: 11, fontWeight: 700,
        }}>{status.label}</span>
      </td>
      <td style={{ ...td, textAlign: 'right' }}>
        <button onClick={copyUrl} title="Copy payment link URL" style={iconBtnSmall}>
          <FiCopy size={13}/>
        </button>
        {link.status === 'pending' && (
          <button onClick={onCancel} title="Cancel this link" style={{ ...iconBtnSmall, marginLeft: 6, color: '#b91c1c' }}>
            <FiSlash size={13}/>
          </button>
        )}
      </td>
    </tr>
  )
}

// ── Create-link modal ──────────────────────────────────────────────────────
function CreateModal({ prefill, onClose, onCreated }) {
  const [form, setForm] = useState({
    customer_email: prefill?.email || '',
    customer_name:  prefill?.name  || '',
    amount:         prefill?.amount || '',
    description:    prefill?.description || '',
    related_booking_reference: prefill?.booking_reference || '',
  })
  const [submitting, setSubmitting] = useState(false)

  const onChange = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.customer_email.trim() || !/\S+@\S+\.\S+/.test(form.customer_email)) {
      toast.error('Valid customer email required'); return
    }
    if (!Number(form.amount) || Number(form.amount) <= 0) {
      toast.error('Amount must be greater than zero'); return
    }
    if (!form.description.trim()) {
      toast.error('Description required'); return
    }
    setSubmitting(true)
    try {
      const { data } = await api.post('/operator/payment-link', {
        customer_email: form.customer_email.trim(),
        customer_name:  form.customer_name.trim(),
        amount:         Number(form.amount),
        description:    form.description.trim(),
        related_booking_reference: form.related_booking_reference?.trim() || undefined,
      })
      onCreated(data.data)
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Could not create link')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div onClick={onClose} style={overlayStyle}>
      <div onClick={(e) => e.stopPropagation()} style={modalStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.01em' }}>Send payment link</h3>
            <p style={{ fontSize: 12, color: GRAY_500, marginTop: 2 }}>Customer gets an invoice email with a Pay button</p>
          </div>
          <button onClick={onClose} style={closeBtn}><FiX size={16}/></button>
        </div>

        <div style={{ display: 'flex', gap: 8, background: '#fef3c7', color: '#92400e', borderRadius: 8, padding: '10px 12px', fontSize: 12, marginBottom: 16 }}>
          <FiAlertCircle size={13} style={{ flexShrink: 0, marginTop: 1 }}/>
          <span>Mock mode — Payroc sandbox credentials not yet configured. Links go to <code>/mock-pay</code>.</span>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Field label="Customer email *" icon={FiMail}>
            <input type="email" value={form.customer_email} onChange={onChange('customer_email')} placeholder="customer@example.com" style={inputStyle()} autoFocus/>
          </Field>
          <Field label="Customer name" icon={FiUser}>
            <input type="text" value={form.customer_name} onChange={onChange('customer_name')} placeholder="Jane Smith" style={inputStyle()}/>
          </Field>
          <Field label="Amount (USD) *" icon={FiDollarSign}>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: 11, color: GRAY_500, fontSize: 14, fontWeight: 600 }}>$</span>
              <input type="number" min="0" step="0.01" value={form.amount} onChange={onChange('amount')} placeholder="165.00" style={{ ...inputStyle(), paddingLeft: 22, fontFamily: "'SF Mono', Menlo, monospace" }}/>
            </div>
          </Field>
          <Field label="Description (shown on invoice) *">
            <input type="text" value={form.description} onChange={onChange('description')} placeholder="Premium SUV — JFK to Manhattan, July 4 @ 2pm" style={inputStyle()}/>
          </Field>
          <Field label="Linked booking reference (optional)">
            <input type="text" value={form.related_booking_reference} onChange={onChange('related_booking_reference')} placeholder="EC-XXXXXXX" style={{ ...inputStyle(), fontFamily: "'SF Mono', Menlo, monospace", letterSpacing: '0.05em' }}/>
          </Field>

          <button type="submit" disabled={submitting} style={{ ...btnPrimary, justifyContent: 'center', padding: '14px 22px', fontSize: 15, opacity: submitting ? 0.6 : 1, marginTop: 6 }}>
            {submitting ? 'Creating link & sending email…' : <>Send payment link <FiSend size={14}/></>}
          </button>
          <p style={{ fontSize: 11, color: GRAY_500, textAlign: 'center' }}>
            Link expires in 24 hours · Customer receives a B&W invoice email
          </p>
        </form>
      </div>
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────
const iconBtn = {
  background: GRAY_50, color: BLACK, border: 0,
  padding: '10px 12px', borderRadius: 999, cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', gap: 6,
  fontSize: 13, fontWeight: 600,
}
const iconBtnSmall = {
  background: GRAY_50, color: BLACK, border: 0,
  padding: '6px 8px', borderRadius: 6, cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center',
}
const th = {
  textAlign: 'left', padding: '12px 16px',
  fontSize: 11, fontWeight: 700, color: GRAY_500,
  textTransform: 'uppercase', letterSpacing: '0.08em',
  borderBottom: `1px solid ${GRAY_100}`, whiteSpace: 'nowrap',
}
const td = {
  padding: '14px 16px', fontSize: 14, color: BLACK,
  borderBottom: `1px solid ${GRAY_100}`,
}
const overlayStyle = {
  position: 'fixed', inset: 0, zIndex: 100,
  background: 'rgba(0,0,0,0.45)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: 16, fontFamily: FONT,
}
const modalStyle = {
  background: WHITE, borderRadius: 12,
  width: '100%', maxWidth: 480, maxHeight: '92vh', overflow: 'auto',
  padding: 24,
  boxShadow: '0 20px 50px -10px rgba(0,0,0,0.3)',
}
const closeBtn = {
  background: GRAY_50, border: 0, borderRadius: '50%',
  width: 32, height: 32, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}

function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label style={{
        display: 'flex', alignItems: 'center', gap: 5,
        fontSize: 11, fontWeight: 700, color: GRAY_500,
        textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6,
      }}>
        {Icon && <Icon size={11}/>}
        {label}
      </label>
      {children}
    </div>
  )
}
