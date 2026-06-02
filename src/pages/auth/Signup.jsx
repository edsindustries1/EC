import React, { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { FiEye, FiEyeOff, FiCheck, FiArrowRight } from 'react-icons/fi'
import {
  BLACK, WHITE, GRAY_50, GRAY_100, GRAY_500, FONT,
  btnPrimary, inputStyle,
} from '../../styles/uber'

const GREEN = '#16a34a'
const RED = '#dc2626'

function pwStrength(pw) {
  if (!pw) return { score: 0, label: '', color: GRAY_100 }
  let s = 0
  if (pw.length >= 8) s++
  if (pw.length >= 12) s++
  if (/[A-Z]/.test(pw)) s++
  if (/[0-9]/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  if (s <= 1) return { score: 33, label: 'Weak',   color: RED }
  if (s <= 3) return { score: 66, label: 'Medium', color: '#ca8a04' }
  return        { score: 100, label: 'Strong', color: GREEN }
}

export default function Signup() {
  const navigate = useNavigate()
  const location = useLocation()
  const { register } = useAuth()
  const [loading, setLoading] = useState(false)
  const [show1, setShow1] = useState(false)
  const [show2, setShow2] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', password_confirm: '',
  })

  const onChange = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  const strength = pwStrength(form.password)
  const pwMatch = form.password_confirm && form.password === form.password_confirm

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.phone || !form.password || !form.password_confirm) {
      toast.error('Please fill in all fields'); return
    }
    if (form.password !== form.password_confirm) { toast.error('Passwords do not match'); return }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      await register({
        name: form.name, email: form.email, phone: form.phone, password: form.password,
      })
      const pending = location.state?.fromBidBoard
        ? location.state
        : (() => { try { const s = sessionStorage.getItem('pendingBidBooking'); return s ? JSON.parse(s) : null } catch { return null } })()
      if (pending?.fromBidBoard) {
        try { sessionStorage.removeItem('pendingBidBooking') } catch {}
        toast.success('Account created. Taking you to your booking…')
        setTimeout(() => navigate('/book', { state: pending }), 1100)
      } else {
        toast.success('Account created. Redirecting to login…')
        setTimeout(() => navigate('/login'), 1400)
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      background: WHITE, color: BLACK, fontFamily: FONT, letterSpacing: '-0.01em',
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '48px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: 460 }}>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link to="/" style={{ fontWeight: 800, fontSize: 28, letterSpacing: '-0.02em', color: BLACK, textDecoration: 'none' }}>
            Everywhere<span style={{ color: GRAY_500, fontWeight: 500 }}> Transfers</span>
          </Link>
        </div>

        <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>
          Create your account
        </h1>
        <p style={{ color: GRAY_500, fontSize: 15, marginBottom: 24 }}>
          Track your trips, save addresses, and book in one tap.
        </p>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Full name">
            <input type="text" value={form.name} onChange={onChange('name')} placeholder="Jane Smith" style={inputStyle()} autoComplete="name"/>
          </Field>

          <Field label="Email">
            <input type="email" value={form.email} onChange={onChange('email')} placeholder="you@example.com" style={inputStyle()} autoComplete="email"/>
          </Field>

          <Field label="Phone">
            <input type="tel" value={form.phone} onChange={onChange('phone')} placeholder="+1 (212) 555-0100" style={inputStyle()} autoComplete="tel"/>
          </Field>

          <Field label="Password">
            <div style={{ position: 'relative' }}>
              <input
                type={show1 ? 'text' : 'password'}
                value={form.password}
                onChange={onChange('password')}
                placeholder="••••••••"
                style={{ ...inputStyle(), paddingRight: 42 }}
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShow1(v => !v)} aria-label="Toggle password" style={eyeBtn}>
                {show1 ? <FiEyeOff size={16}/> : <FiEye size={16}/>}
              </button>
            </div>

            {form.password && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                  <span style={{ color: GRAY_500 }}>Strength</span>
                  <span style={{ color: strength.color, fontWeight: 700 }}>{strength.label}</span>
                </div>
                <div style={{ height: 4, background: GRAY_100, borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${strength.score}%`, background: strength.color, transition: 'width 200ms ease' }}/>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, marginTop: 8, fontSize: 12, color: GRAY_500, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <Req met={form.password.length >= 8}>At least 8 characters</Req>
                  <Req met={/[A-Z]/.test(form.password)}>One uppercase letter</Req>
                  <Req met={/[0-9]/.test(form.password)}>One number</Req>
                </ul>
              </div>
            )}
          </Field>

          <Field label="Confirm password">
            <div style={{ position: 'relative' }}>
              <input
                type={show2 ? 'text' : 'password'}
                value={form.password_confirm}
                onChange={onChange('password_confirm')}
                placeholder="••••••••"
                style={{ ...inputStyle(), paddingRight: 42 }}
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShow2(v => !v)} aria-label="Toggle password" style={eyeBtn}>
                {show2 ? <FiEyeOff size={16}/> : <FiEye size={16}/>}
              </button>
            </div>
            {form.password_confirm && !pwMatch && <p style={{ fontSize: 12, color: RED, marginTop: 4 }}>Passwords do not match</p>}
            {pwMatch && <p style={{ fontSize: 12, color: GREEN, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}><FiCheck size={12}/> Passwords match</p>}
          </Field>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...btnPrimary,
              justifyContent: 'center', width: '100%',
              padding: '14px 22px', fontSize: 15,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: 8,
            }}
          >
            {loading ? 'Creating account…' : <>Create account <FiArrowRight size={15}/></>}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '28px 0' }}>
          <div style={{ flex: 1, height: 1, background: GRAY_100 }}/>
          <span style={{ fontSize: 12, color: GRAY_500 }}>OR</span>
          <div style={{ flex: 1, height: 1, background: GRAY_100 }}/>
        </div>

        <div style={{ textAlign: 'center', fontSize: 14, color: GRAY_500 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: BLACK, fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 3 }}>
            Sign in
          </Link>
        </div>

        <p style={{ fontSize: 11, color: GRAY_500, marginTop: 28, textAlign: 'center', lineHeight: 1.5 }}>
          By creating an account, you agree to our{' '}
          <Link to="/terms" style={{ color: BLACK, textDecoration: 'underline' }}>Terms of Service</Link> and{' '}
          <Link to="/privacy" style={{ color: BLACK, textDecoration: 'underline' }}>Privacy Policy</Link>.
        </p>
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
function Req({ met, children }) {
  return (
    <li style={{ display: 'flex', alignItems: 'center', gap: 6, color: met ? GREEN : GRAY_500 }}>
      <FiCheck size={12}/> {children}
    </li>
  )
}
const eyeBtn = {
  position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
  background: 'transparent', border: 0, padding: 6,
  color: GRAY_500, cursor: 'pointer',
  display: 'flex', alignItems: 'center',
}
