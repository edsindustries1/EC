/**
 * /mock-pay — simulated card-entry page that drives the same end-to-end
 * flow as the eventual Payroc Hosted Pay Page. Used until real Payroc
 * sandbox credentials are wired in.
 *
 * Reads ?session= ?amount= ?desc= ?email= from URL, shows a fake card
 * form, and on "Pay" calls POST /api/mock-pay/complete which fires the
 * same webhook side-effect (mark bid paid, create booking).
 */
import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  FiLock, FiArrowRight, FiCheckCircle, FiAlertTriangle, FiX,
} from 'react-icons/fi'
import api from '../utils/api'
import { BLACK, WHITE, GRAY_50, GRAY_100, GRAY_500, FONT } from '../styles/uber'

export default function MockPay() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const session = params.get('session') || ''
  const amount = Number(params.get('amount') || 0) / 100
  const desc = params.get('desc') || ''
  const email = params.get('email') || ''

  const [card, setCard]     = useState('4242 4242 4242 4242')
  const [exp, setExp]       = useState('12/30')
  const [cvc, setCvc]       = useState('123')
  const [name, setName]     = useState('')
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState(null)

  // If somehow there's no session, redirect home
  useEffect(() => {
    if (!session) navigate('/', { replace: true })
  }, [session])

  const pay = async (succeeded) => {
    setProcessing(true)
    try {
      const { data } = await api.post('/mock-pay/complete', { session_id: session, succeeded })
      setResult(data)
      if (succeeded && data.reference) {
        setTimeout(() => navigate(`/reservation/${data.reference}`, { replace: true }), 1600)
      }
    } catch (e) {
      setResult({ ok: false, error: e?.response?.data?.message || 'Payment failed' })
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div style={page}>
      <div style={{ width: '100%', maxWidth: 460 }}>

        {/* Mock banner */}
        <div style={{
          background: '#fef3c7', color: '#92400e',
          padding: '8px 14px', borderRadius: 8,
          fontSize: 12, fontWeight: 600, marginBottom: 18,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <FiAlertTriangle size={12}/>
          Demo payment page — no real charge until Payroc credentials are configured
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>
          Complete payment
        </h1>
        <p style={{ color: GRAY_500, fontSize: 14, marginBottom: 24 }}>
          {desc}
        </p>

        {/* Amount */}
        <div style={{
          background: BLACK, color: WHITE,
          borderRadius: 14, padding: '24px 22px', marginBottom: 22,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
            Total
          </div>
          <div style={{ fontSize: 46, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1 }}>${amount.toFixed(2)}</div>
        </div>

        {/* Result */}
        {result?.status === 'paid' && (
          <div style={resultBox('#dcfce7', '#166534')}>
            <FiCheckCircle size={18}/>
            <div>
              <strong>Payment received</strong>
              <div style={{ fontSize: 12, marginTop: 2 }}>Confirmation # {result.reference} · redirecting…</div>
            </div>
          </div>
        )}
        {result?.status === 'cancelled' && (
          <div style={resultBox('#fee2e2', '#991b1b')}>
            <FiX size={18}/>
            <div>Payment cancelled. The ride request stays open and you can pick a different offer.</div>
          </div>
        )}
        {result?.error && (
          <div style={resultBox('#fee2e2', '#991b1b')}>
            <FiX size={18}/>
            <div>{result.error}</div>
          </div>
        )}

        {/* Card form (purely decorative in mock) */}
        {!result && (
          <>
            <Field label="Cardholder name">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder={email.split('@')[0] || 'Your name'} style={input}/>
            </Field>
            <Field label="Card number">
              <input value={card} onChange={(e) => setCard(e.target.value)} style={{ ...input, fontFamily: 'SF Mono, Menlo, monospace' }}/>
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Field label="Expiry">
                <input value={exp} onChange={(e) => setExp(e.target.value)} style={{ ...input, fontFamily: 'SF Mono, Menlo, monospace' }}/>
              </Field>
              <Field label="CVC">
                <input value={cvc} onChange={(e) => setCvc(e.target.value)} style={{ ...input, fontFamily: 'SF Mono, Menlo, monospace' }}/>
              </Field>
            </div>

            <button
              onClick={() => pay(true)}
              disabled={processing}
              style={{
                width: '100%', marginTop: 18,
                background: BLACK, color: WHITE,
                padding: '15px 22px', borderRadius: 8, border: 0,
                fontWeight: 700, fontSize: 15, cursor: processing ? 'wait' : 'pointer',
                opacity: processing ? 0.6 : 1,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {processing ? 'Processing…' : <>Pay ${amount.toFixed(2)} <FiArrowRight size={14}/></>}
            </button>

            <button
              type="button"
              onClick={() => pay(false)}
              disabled={processing}
              style={{
                width: '100%', marginTop: 8,
                background: 'transparent', color: GRAY_500,
                padding: '12px 16px', borderRadius: 8,
                border: 0, fontWeight: 600, fontSize: 13, cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </>
        )}

        <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 18, fontSize: 11, color: GRAY_500 }}>
          <FiLock size={11}/> Mock checkout · No card data is stored
        </p>
      </div>
    </div>
  )
}

const page = {
  background: WHITE, color: BLACK, fontFamily: FONT, letterSpacing: '-0.01em',
  minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center',
  padding: '32px 16px',
}
const input = {
  width: '100%', padding: '12px 14px', borderRadius: 8,
  border: `1px solid ${GRAY_100}`, background: GRAY_50, color: BLACK,
  outline: 'none', fontSize: 16, fontFamily: FONT,
}
function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: GRAY_500, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  )
}
function resultBox(bg, color) {
  return {
    background: bg, color,
    padding: '14px 16px', borderRadius: 10, marginBottom: 18,
    display: 'flex', alignItems: 'flex-start', gap: 10,
    fontSize: 14, lineHeight: 1.5,
  }
}
