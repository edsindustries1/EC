/**
 * AuthContext — data layer only.
 *
 * Persistence model (for "never logged out automatically" UX):
 *  - JWT token lasts 365 days (set on the server side)
 *  - On mount, we restore the cached user from localStorage IMMEDIATELY
 *    so the app boots into a logged-in state without a network round-trip.
 *  - We then validate the token against /auth/me in the BACKGROUND. If
 *    the validation FAILS with a definitive 401, we clear the session.
 *    If it fails with a network error or 5xx, we keep the cached user —
 *    the previous version logged users out on every transient network
 *    blip, which was the real cause of "I get randomly signed out".
 *  - Tokens are stored in localStorage. On native iOS this maps to
 *    WKWebView local storage which persists across app launches.
 *
 * Public API: login()/register()/logout()/setSession()/deleteAccount()
 * Each returns a clean `{ ok, user?, error? }` shape. Callers handle UI.
 */
import React, { createContext, useState, useEffect, useContext } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)

function readCachedUser() {
  try {
    const raw = localStorage.getItem('user')
    if (!raw) return null
    return JSON.parse(raw)
  } catch { return null }
}

export const AuthProvider = ({ children }) => {
  // OPTIMISTIC restore from localStorage — user is "signed in" before any
  // network call resolves. This is what prevents the random-logout UX.
  const cachedUser = typeof window !== 'undefined' ? readCachedUser() : null
  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('token')

  const [user, setUser] = useState(cachedUser)
  const [loading, setLoading] = useState(hasToken && !cachedUser) // only loading if we have a token but no cached user
  const [isAuthenticated, setIsAuthenticated] = useState(!!(cachedUser && hasToken))

  // Background validation — refresh user info from server but do NOT
  // clear the cached session on transient network failures
  useEffect(() => {
    let cancelled = false
    const validate = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const { data } = await api.get('/auth/me')
        if (cancelled) return
        setUser(data.user)
        setIsAuthenticated(true)
        try { localStorage.setItem('user', JSON.stringify(data.user)) } catch {}
      } catch (err) {
        if (cancelled) return
        // ONLY clear session for definitive auth failures (401/403).
        // Network errors, 5xx, timeouts → keep the cached user.
        const status = err?.response?.status
        if (status === 401 || status === 403) {
          try {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
          } catch {}
          setUser(null)
          setIsAuthenticated(false)
        }
        // For any other error: trust the cached user, try again later
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    validate()
    return () => { cancelled = true }
  }, [])

  const login = async ({ email, password } = {}) => {
    try {
      const { data } = await api.post('/auth/login', { email, password })
      const { token, user } = data
      try {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
      } catch {}
      setUser(user)
      setIsAuthenticated(true)
      return { ok: true, user }
    } catch (err) {
      const error = err?.response?.data?.message || err?.message || 'Login failed'
      return { ok: false, error }
    }
  }

  const register = async ({ name, email, password, phone } = {}) => {
    try {
      const { data } = await api.post('/auth/register', { name, email, password, phone })
      const { token, user } = data
      try {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
      } catch {}
      setUser(user)
      setIsAuthenticated(true)
      return { ok: true, user }
    } catch (err) {
      const error = err?.response?.data?.message || err?.message || 'Registration failed'
      return { ok: false, error }
    }
  }

  const logout = () => {
    try {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    } catch {}
    setUser(null)
    setIsAuthenticated(false)
  }

  // Apple App Store requires in-app account deletion. Hard-deletes the user
  // and anonymizes their booking history server-side.
  const deleteAccount = async () => {
    try {
      await api.delete('/auth/me')
      try {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      } catch {}
      setUser(null)
      setIsAuthenticated(false)
      return { ok: true }
    } catch (err) {
      const error = err?.response?.data?.message || err?.message || 'Could not delete account'
      return { ok: false, error }
    }
  }

  const setSession = ({ token, user: nextUser }) => {
    if (!token || !nextUser) return
    try {
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(nextUser))
    } catch {}
    setUser(nextUser)
    setIsAuthenticated(true)
  }

  const value = { user, loading, isAuthenticated, login, register, logout, setSession, deleteAccount }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export default AuthContext
