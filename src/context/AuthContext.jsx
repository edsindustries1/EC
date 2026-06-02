/**
 * AuthContext — data layer only.
 *
 * - login()/register()/logout() expose async functions that return a
 *   clean `{ ok, user?, error? }` shape. Callers are responsible for
 *   UI feedback (toasts, navigation, redirects) so we don't get
 *   duplicate toasts when both the context and the page show them.
 * - Pass an object to login/register (named args). Forward-compat.
 */
import React, { createContext, useState, useEffect, useContext } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Validate any stored token on mount
  useEffect(() => {
    let cancelled = false
    const validate = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return
        const { data } = await api.get('/auth/me')
        if (cancelled) return
        setUser(data.user)
        setIsAuthenticated(true)
        try { localStorage.setItem('user', JSON.stringify(data.user)) } catch {}
      } catch (err) {
        // Token invalid / network error — clear state
        if (cancelled) return
        try {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        } catch {}
        setUser(null)
        setIsAuthenticated(false)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    validate()
    return () => { cancelled = true }
  }, [])

  /**
   * @param {{ email: string, password: string }} args
   * @returns {Promise<{ ok: true, user } | { ok: false, error }>}
   */
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

  /**
   * @param {{ name, email, password, phone? }} args
   * @returns {Promise<{ ok: true, user } | { ok: false, error }>}
   */
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

  const value = { user, loading, isAuthenticated, login, register, logout }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export default AuthContext
