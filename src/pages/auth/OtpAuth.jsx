/**
 * Passwordless email OTP flow.
 *
 * Three internal stages:
 *   1. EMAIL    — enter email, get a code
 *   2. CODE     — enter 6-digit code, verify
 *   3. PROFILE  — only shown for brand-new users; collect name + phone
 *
 * On success at any terminal stage the user is logged in (token saved,
 * auth context populated) and navigated to / (or whatever they came from).
 */
import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FiArrowRight, FiArrowLeft, FiMail, FiCheckCircle } from 'react-icons/fi'
import toast from 'react-hot-toast'
import api from '../../utils/api'
import { useAuth } from '../../context/AuthContext'
import {
  BLACK, WHITE, GRAY_50, GRAY_100, GRAY_500, FONT,
  btnPrimary, inputStyle,
} from '../../styles/uber'

const STAGE = {
  EMAIL:   'email',
  CODE:    'code',
  PROFILE: 'profile',
}

export default function OtpAuth() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setSession } = useAuth()

  const [stage, setStage]     = useState(STAGE.EMAIL)
  const [email, setEmail]     = useState('')
  const [code, setCode]       = useState('')
  const [name, setName]       = useState('')
  const [phone, setPhone]     = useState('')
  const [signupToken, setSignupToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  // Tick down the resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setTimeout(() => setResendCooldown((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCooldown])

  // Save session + navigate
  const completeSession = (token, user) => {
    setSession({ token, user })
    toast.success(user?.name ? `Welcome, ${user.name.split(' ')[0]} 👋` : 'Signed in')

    const pending = location.state?.fromBidBoard ? location.state : null
    if (pending?.fromBidBoard) {
      navigate('/book', { state: pending })
      return
    }
    const role = user?.role
    navigate(role === 'operator' || role === 'admin' ? '/operator/dashboard' : '/')
  }

  // Stage 1 — request code
  const handleSendCode = async (e) => {
    e?.preventDefault?.()
    const normalised = email.trim().toLowerCase()
    if (!/\S+@\S+\.\S+/.test(normalised)) {
      toast.error('Please enter a valid email')
      return
    }
    setLoading(true)
    try {
      await api.post('/auth/request-otp', { email: normalised })
      setEmail(normalised)
      setStage(STAGE.CODE)
      setCode('')
      setResendCooldown(45)
      toast.success(`We sent a code to ${normalised}`)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not send code')
    } finally {
      setLoading(false)
    }
  }

  // Stage 2 — verify code
  const handleVerifyCode = async (e) => {
    e?.preventDefault?.()
    const trimmed = code.trim()
    if (!/^\d{6}$/.test(trimmed)) {
      toast.error('Enter the 6-digit code')
      return
    }
    setLoading(true)
    try {
      const { data } = await api.post('/auth/verify-otp', { email, code: trimmed })
      if (data?.needs_profile) {
        setSignupToken(data.signup_token)
        setStage(STAGE.PROFILE)
      } else if (data?.token && data?.user) {
        completeSession(data.token, data.user)
      } else {
        toast.error('Unexpected response — try again')
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  // Stage 3 — collect profile + create account
  const handleCompleteSignup = async (e) => {
    e?.preventDefault?.()
    if (!name.trim()) { toast.error('Please enter your name'); return }
    if (!phone.trim()) { toast.error('Please enter your phone number'); return }
    setLoading(true)
    try {
      const { data } = await api.post('/auth/complete-signup', {
        signup_token: signupToken,
        name: name.trim(),
        phone: phone.trim(),
      })
      if (data?.token && data?.user) {
        completeSession(data.token, data.user)
      } else {
        toast.error('Could not finish signup')
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not finish signup')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return
    await handleSendCode()
  }

  return (
    <div style={pageStyle}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link to="/" style={brandStyle}>
            Everywhere<span style={brandAccent}> Transfers</span>
          </Link>
        </div>

        {stage === STAGE.EMAIL   && <EmailStage email={email} setEmail={setEmail} loading={loading} onSubmit={handleSendCode} />}
        {stage === STAGE.CODE    && <CodeStage  email={email} code={code} setCode={setCode} loading={loading} resendCooldown={resendCooldown} onSubmit={handleVerifyCode} onResend={handleResend} onChangeEmail={() => { setStage(STAGE.EMAIL); setCode('') }} />}
        {stage === STAGE.PROFILE && <ProfileStage email={email} name={name} setName={setName} phone={phone} setPhone={setPhone} loading={loading} onSubmit={handleCompleteSignup} />}

      </div>
    </div>
  )
}

// ── Stage components ─────────────────────────────────────────────────────────

function EmailStage({ email, setEmail, loading, onSubmit }) {
  return (
    <>
      <h1 style={H1}>Sign in or sign up</h1>
      <p style={lead}>
        Enter your email and we'll send you a 6-digit code. No password needed.
      </p>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Email">
          <input
            type="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={inputStyle()}
            autoComplete="email"
            inputMode="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
          />
        </Field>

        <button type="submit" disabled={loading} style={primaryFullStyle(loading)}>
          {loading ? 'Sending code…' : <>Continue <FiArrowRight size={15}/></>}
        </button>
      </form>

      <Divider/>

      <p style={{ textAlign: 'center', fontSize: 13, color: GRAY_500 }}>
        Prefer a password?{' '}
        <Link to="/login" style={inlineLinkStyle}>Sign in</Link>{' '}
        ·{' '}
        <Link to="/signup" style={inlineLinkStyle}>Sign up</Link>
      </p>
    </>
  )
}

function CodeStage({ email, code, setCode, loading, resendCooldown, onSubmit, onResend, onChangeEmail }) {
  const inputRef = useRef(null)
  useEffect(() => { inputRef.current?.focus() }, [])
  return (
    <>
      <h1 style={H1}>Check your email</h1>
      <p style={lead}>
        We sent a 6-digit code to <strong style={{ color: BLACK }}>{email}</strong>. Enter it below to continue.
      </p>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Verification code">
          <input
            ref={inputRef}
            type="text"
            value={code}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, '').slice(0, 6)
              setCode(v)
              // Auto-submit when 6 digits entered (optional polish)
            }}
            placeholder="123456"
            style={{
              ...inputStyle(),
              fontFamily: 'SF Mono, Menlo, monospace',
              fontSize: 22,
              letterSpacing: '0.5em',
              paddingLeft: 22,
              textAlign: 'center',
              fontWeight: 700,
            }}
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            autoComplete="one-time-code"
            autoCorrect="off"
            spellCheck={false}
          />
        </Field>

        <button type="submit" disabled={loading || code.length !== 6} style={primaryFullStyle(loading || code.length !== 6)}>
          {loading ? 'Verifying…' : <>Verify <FiCheckCircle size={15}/></>}
        </button>
      </form>

      <div style={{ marginTop: 18, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          type="button"
          onClick={onResend}
          disabled={resendCooldown > 0}
          style={{
            background: 'transparent', border: 0, padding: 6,
            color: resendCooldown > 0 ? GRAY_500 : BLACK,
            fontSize: 13, fontWeight: 600, cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
            textDecoration: resendCooldown > 0 ? 'none' : 'underline',
            textUnderlineOffset: 3,
          }}
        >
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
        </button>
        <button
          type="button"
          onClick={onChangeEmail}
          style={{ background: 'transparent', border: 0, padding: 4, color: GRAY_500, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
        >
          <FiArrowLeft size={11}/> Change email
        </button>
      </div>
    </>
  )
}

function ProfileStage({ email, name, setName, phone, setPhone, loading, onSubmit }) {
  return (
    <>
      <h1 style={H1}>Welcome 👋</h1>
      <p style={lead}>
        Just need a couple things to set up <strong style={{ color: BLACK }}>{email}</strong>.
      </p>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Full name">
          <input
            type="text"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Smith"
            style={inputStyle()}
            autoComplete="name"
            autoCapitalize="words"
            autoCorrect="off"
            spellCheck={false}
          />
        </Field>
        <Field label="Phone">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 (212) 555-0100"
            style={inputStyle()}
            autoComplete="tel"
            inputMode="tel"
          />
        </Field>

        <button type="submit" disabled={loading} style={primaryFullStyle(loading)}>
          {loading ? 'Creating account…' : <>Create account <FiArrowRight size={15}/></>}
        </button>
      </form>
    </>
  )
}

// ── Subcomponents ────────────────────────────────────────────────────────────

function Field({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: GRAY_500, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  )
}

function Divider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
      <div style={{ flex: 1, height: 1, background: GRAY_100 }}/>
      <span style={{ fontSize: 12, color: GRAY_500 }}>OR</span>
      <div style={{ flex: 1, height: 1, background: GRAY_100 }}/>
    </div>
  )
}

// ── Styles ───────────────────────────────────────────────────────────────────

const pageStyle = {
  background: WHITE, color: BLACK, fontFamily: FONT, letterSpacing: '-0.01em',
  minHeight: '100vh',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: '48px 16px',
}
const brandStyle = { fontWeight: 800, fontSize: 28, letterSpacing: '-0.02em', color: BLACK, textDecoration: 'none' }
const brandAccent = { color: GRAY_500, fontWeight: 500 }
const H1 = { fontSize: 'clamp(1.6rem, 2.6vw, 2.1rem)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }
const lead = { color: GRAY_500, fontSize: 14, lineHeight: 1.5, marginBottom: 22 }
const inlineLinkStyle = { color: BLACK, fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 3 }
const primaryFullStyle = (disabled) => ({
  ...btnPrimary,
  justifyContent: 'center', width: '100%',
  padding: '14px 22px', fontSize: 15,
  opacity: disabled ? 0.6 : 1,
  cursor: disabled ? 'not-allowed' : 'pointer',
  marginTop: 6,
})
