// Client for the dispatch bridge (EcBridgeController on everywheretrans.com,
// or the local mock in dev/mock-dispatch). All calls are signed POSTs with a
// JSON body; every response is { ok: true, ... } or { ok: false, error }.

import { signedHeaders } from './signing.js'

const TIMEOUT_MS = 15000

export function bridgeConfig() {
  return {
    enabled: process.env.DISPATCH_ENABLED === 'true',
    baseUrl: (process.env.DISPATCH_BRIDGE_URL || '').replace(/\/$/, ''),
    keyId: process.env.DISPATCH_BRIDGE_KEY || '',
    secret: process.env.DISPATCH_BRIDGE_SECRET || '',
    webhookSecret: process.env.DISPATCH_WEBHOOK_SECRET || process.env.DISPATCH_BRIDGE_SECRET || '',
  }
}

export function bridgeEnabled() {
  const c = bridgeConfig()
  return c.enabled && !!c.baseUrl && !!c.keyId && !!c.secret
}

export class BridgeError extends Error {
  constructor(message, { retryable = true, status } = {}) {
    super(message)
    this.retryable = retryable
    this.status = status
  }
}

async function call(action, payload) {
  const { baseUrl, keyId, secret } = bridgeConfig()
  const path = `/ec_bridge/${action}`
  const body = JSON.stringify(payload)
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  let res
  try {
    res = await fetch(baseUrl + path, {
      method: 'POST',
      headers: signedHeaders(keyId, secret, 'POST', path, body),
      body,
      signal: controller.signal,
    })
  } catch (e) {
    throw new BridgeError(`dispatch unreachable: ${e.name === 'AbortError' ? 'timeout' : e.message}`)
  } finally {
    clearTimeout(timer)
  }
  let data
  try {
    data = await res.json()
  } catch {
    throw new BridgeError(`dispatch returned non-JSON (HTTP ${res.status})`, { status: res.status })
  }
  if (!res.ok || !data.ok) {
    // 4xx means our request is wrong: retrying the same payload will not help.
    const retryable = res.status >= 500 || res.status === 429
    throw new BridgeError(data.error || `dispatch error (HTTP ${res.status})`, { retryable, status: res.status })
  }
  return data
}

export const bridge = {
  quote: (payload) => call('quote', payload),
  createTrip: (payload) => call('create_trip', payload),
  tripStatus: (payload) => call('trip_status', payload),
  cancelTrip: (payload) => call('cancel_trip', payload),
}
