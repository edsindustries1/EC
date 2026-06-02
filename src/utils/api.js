import axios from 'axios'
import { Capacitor } from '@capacitor/core'

/**
 * API base URL strategy:
 *   - Web (Vite dev or production):   relative `/api` — same host
 *   - Native (Capacitor iOS/Android): absolute URL to the deployed backend
 *   - Override:                        VITE_API_BASE_URL at build time
 */
const PRODUCTION_BASE = 'https://www.everywheretransfers.com'

function resolveBaseURL() {
  const override = import.meta.env?.VITE_API_BASE_URL
  if (override) return `${override.replace(/\/+$/, '')}/api`

  if (Capacitor?.isNativePlatform?.()) {
    return `${PRODUCTION_BASE}/api`
  }
  return '/api'
}

const api = axios.create({
  baseURL: resolveBaseURL(),
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // On web we hard-redirect; in native we let React Router handle it.
      if (!Capacitor?.isNativePlatform?.()) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
