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
    webhookSecret: process.env.DISPATCH_WEBHOOK_SECRET || '',
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

async function call(action, payload, timeoutMs = TIMEOUT_MS) {
  const { baseUrl, keyId, secret } = bridgeConfig()
  const path = `/ec_bridge/${action}`
  const body = JSON.stringify(payload)
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
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
    // Other 4xx mean our request is wrong: retrying the same payload will not help.
    // 409 (creation in progress, replayed request) and 429 clear up on retry.
    const retryable = res.status >= 500 || res.status === 429 || res.status === 409
    throw new BridgeError(data.error || `dispatch error (HTTP ${res.status})`, { retryable, status: res.status })
  }
  return data
}

export const bridge = {
  // Quotes sit on the customer's search path: give up fast and use the table.
  quote: (payload) => call('quote', payload, 4000),
  createTrip: (payload) => call('create_trip', payload),
  tripStatus: (payload) => call('trip_status', payload),
  cancelTrip: (payload) => call('cancel_trip', payload),
}
