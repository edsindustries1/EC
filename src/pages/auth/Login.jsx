import React, { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi'
import {
  BLACK, WHITE, GRAY_50, GRAY_100, GRAY_500, FONT,
  btnPrimary, inputStyle,
} from '../../styles/uber'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  const onChange = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { toast.error('Please fill in all fields'); return }
    setLoading(true)
    try {
      const res = await login(form.email, form.password)
      toast.success('Welcome back')

      const pending = location.state?.fromBidBoard
        ? location.state
        : (() => { try { const s = sessionStorage.getItem('pendingBidBooking'); return s ? JSON.parse(s) : null } catch { return null } })()

      if (pending?.fromBidBoard) {
        try { sessionStorage.removeItem('pendingBidBooking') } catch {}
        navigate('/book', { state: pending })
        return
      }

      if (res?.user?.role === 'customer') navigate('/my-rides')
      else if (res?.user?.role === 'operator' || res?.user?.role === 'admin') navigate('/operator/dashboard')
      else navigate('/my-rides')
    } catch (err) {
      toast.error(err.message || 'Invalid email or password')
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
      <div style={{ width: '100%', maxWidth: 420 }}>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ fontWeight: 800, fontSize: 28, letterSpacing: '-0.02em', color: BLACK, textDecoration: 'none' }}>
            Everywhere<span style={{ color: GRAY_500, fontWeight: 500 }}> Cars</span>
          </Link>
        </div>

        <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>
          Welcome back
        </h1>
        <p style={{ color: GRAY_500, fontSize: 15, marginBottom: 28 }}>
          Sign in to manage your bookings.
        </p>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Email">
            <input
              type="email"
              value={form.email}
              onChange={onChange('email')}
              placeholder="you@example.com"
              style={inputStyle()}
              autoComplete="email"
            />
          </Field>

          <Field label="Password">
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={onChange('password')}
                placeholder="••••••••"
                style={{ ...inputStyle(), paddingRight: 42 }}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                  background: 'transparent', border: 0, padding: 6,
                  color: GRAY_500, cursor: 'pointer',
                  display: 'flex', alignItems: 'center',
                }}
              >
                {showPw ? <FiEyeOff size={16}/> : <FiEye size={16}/>}
              </button>
            </div>
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
              marginTop: 6,
            }}
          >
            {loading ? 'Signing in…' : <>Sign in <FiArrowRight size={15}/></>}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '28px 0' }}>
          <div style={{ flex: 1, height: 1, background: GRAY_100 }}/>
          <span style={{ fontSize: 12, color: GRAY_500 }}>OR</span>
          <div style={{ flex: 1, height: 1, background: GRAY_100 }}/>
        </div>

        <div style={{ textAlign: 'center', fontSize: 14, color: GRAY_500 }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: BLACK, fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 3 }}>
            Sign up
          </Link>
        </div>

        <p style={{ fontSize: 11, color: GRAY_500, marginTop: 32, textAlign: 'center', lineHeight: 1.5 }}>
          By signing in, you agree to our{' '}
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
