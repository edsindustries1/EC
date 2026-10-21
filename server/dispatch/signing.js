// HMAC request signing shared by the dispatch bridge client, the webhook
// receiver and the local mock dispatch server. The PHP side
// (EcBridgeController) implements the same scheme.
//
//   X-EC-Key        key id (identifies which secret was used)
//   X-EC-Timestamp  unix seconds
//   X-EC-Signature  hex HMAC-SHA256(secret, `${timestamp}\n${METHOD}\n${path}\n${body}`)

import crypto from 'crypto'

export const MAX_SKEW_SECONDS = 300

export function signature(secret, timestamp, method, path, body) {
  return crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}\n${method.toUpperCase()}\n${path}\n${body}`)
    .digest('hex')
}

export function signedHeaders(keyId, secret, method, path, body) {
  const timestamp = String(Math.floor(Date.now() / 1000))
  return {
    'Content-Type': 'application/json',
    'X-EC-Key': keyId,
    'X-EC-Timestamp': timestamp,
    'X-EC-Signature': signature(secret, timestamp, method, path, body),
  }
}

// Returns null when valid, otherwise a short reason string.
export function verify({ keyId, secret, headers, method, path, body }) {
  const sentKey = headers['x-ec-key']
  const timestamp = headers['x-ec-timestamp']
  const sent = headers['x-ec-signature']
  if (!sentKey || !timestamp || !sent) return 'missing signature headers'
  if (sentKey !== keyId) return 'unknown key'
  const skew = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp))
  if (!Number.isFinite(skew) || skew > MAX_SKEW_SECONDS) return 'stale timestamp'
  const expected = signature(secret, timestamp, method, path, body)
  const a = Buffer.from(expected, 'hex')
  const b = Buffer.from(String(sent), 'hex')
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return 'bad signature'
  return null
}
