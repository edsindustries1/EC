/**
 * Payroc J3 client — env-var-driven, with a safe MOCK MODE for when no
 * sandbox credentials are configured yet.
 *
 * Real Payroc J3 REST API endpoints will be plugged in once docs arrive
 * (see TODOs below). Until then, the module returns a deterministic mock
 * payment URL so the rest of the marketplace flow can be developed and
 * tested end-to-end on Railway without touching real money.
 *
 * Env vars:
 *   PAYROC_API_KEY        — sandbox or production API key
 *   PAYROC_MERCHANT_ID    — merchant ID from Payroc dashboard
 *   PAYROC_API_BASE       — e.g. https://api.payroc.com or sandbox
 *   PAYROC_ENVIRONMENT    — 'sandbox' | 'production' (informational)
 *   PAYROC_WEBHOOK_SECRET — for verifying inbound webhook signatures
 *
 * When PAYROC_API_KEY is unset, isConfigured() returns false and the
 * module falls back to mock URLs (/mock-pay/...) that drive the same
 * flow as real Payroc would.
 */

import crypto from 'crypto'

const apiKey       = process.env.PAYROC_API_KEY || ''
const merchantId   = process.env.PAYROC_MERCHANT_ID || ''
const apiBase      = process.env.PAYROC_API_BASE || 'https://api.payroc.com'
const environment  = process.env.PAYROC_ENVIRONMENT || 'sandbox'
const webhookSecret = process.env.PAYROC_WEBHOOK_SECRET || ''

const PUBLIC_BASE = process.env.BASE_URL || 'https://www.everywheretransfers.com'

export function isConfigured() {
  return Boolean(apiKey && merchantId)
}

export function environmentLabel() {
  return isConfigured() ? environment : 'mock'
}

/**
 * Create a Payroc payment session for a single bid amount.
 *
 * @param {object} args
 * @param {number} args.amountCents       — total amount to charge in cents
 * @param {string} args.currency          — 3-letter ISO code, e.g. 'USD'
 * @param {string} args.description       — human-readable line shown on Payroc page
 * @param {string} args.customerEmail     — customer's email, prefilled on Payroc page
 * @param {string} args.customerName      — optional
 * @param {object} args.metadata          — opaque object echoed back on webhook
 * @param {string} args.successReturnUrl  — where Payroc sends customer after success
 * @param {string} args.cancelReturnUrl   — optional; defaults to success URL
 * @returns {Promise<{ sessionId: string, paymentUrl: string, mock: boolean }>}
 */
export async function createPaymentSession({
  amountCents,
  currency = 'USD',
  description,
  customerEmail,
  customerName,
  metadata = {},
  successReturnUrl,
  cancelReturnUrl,
}) {
  if (!isConfigured()) {
    // Mock mode — return a session that points to our own mock page
    const sessionId = `mock_${crypto.randomBytes(8).toString('hex')}`
    const params = new URLSearchParams({
      session: sessionId,
      amount: String(amountCents),
      currency,
      desc: description || '',
      email: customerEmail || '',
      meta: JSON.stringify(metadata),
      success: successReturnUrl || '',
      cancel: cancelReturnUrl || successReturnUrl || '',
    })
    return {
      sessionId,
      paymentUrl: `${PUBLIC_BASE}/mock-pay?${params.toString()}`,
      mock: true,
    }
  }

  // TODO — fill in actual Payroc J3 API call once docs arrive.
  // Expected shape (based on common J3 patterns; refine when verified):
  //
  //   POST {apiBase}/v1/sessions   (or similar)
  //   Authorization: Bearer {apiKey}
  //   {
  //     merchantId,
  //     amount: amountCents,
  //     currency,
  //     description,
  //     customer: { email, name },
  //     metadata,
  //     returnUrl: successReturnUrl,
  //     cancelUrl: cancelReturnUrl,
  //   }
  //
  //   Response:
  //   {
  //     id: 'sess_xxx',
  //     hosted_page_url: 'https://j3.payroc.com/pay/...',
  //   }
  //
  // For now, even with credentials configured we still produce a mock
  // URL — flip to real once endpoint shape is confirmed.
  const sessionId = `${environment}_${crypto.randomBytes(8).toString('hex')}`
  return {
    sessionId,
    paymentUrl: `${PUBLIC_BASE}/mock-pay?session=${sessionId}&pending_real_integration=1`,
    mock: true,
  }
}

/**
 * Verify the signature of an inbound webhook from Payroc.
 * In mock mode (no secret configured), always trust the body.
 *
 * Real Payroc signature scheme TBD — likely HMAC-SHA256 of the raw
 * request body using PAYROC_WEBHOOK_SECRET, presented in the
 * `X-Payroc-Signature` header. Refine once docs arrive.
 */
export function verifyWebhookSignature(rawBody, signatureHeader) {
  if (!webhookSecret) return true // mock / unconfigured
  if (!signatureHeader) return false
  try {
    const expected = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex')
    // Constant-time comparison
    const a = Buffer.from(expected, 'hex')
    const b = Buffer.from(signatureHeader.replace(/^sha256=/, ''), 'hex')
    return a.length === b.length && crypto.timingSafeEqual(a, b)
  } catch {
    return false
  }
}

/**
 * Capture a previously authorized payment (for the auth+capture model
 * we'll wire in once trip completion endpoint exists).
 */
export async function capturePayment(_sessionId, _amountCents) {
  if (!isConfigured()) return { ok: true, mock: true }
  // TODO — implement real capture call once docs arrive
  return { ok: true, mock: true, pending_real_integration: true }
}

/** Refund (full or partial). */
export async function refundPayment(_sessionId, _amountCents) {
  if (!isConfigured()) return { ok: true, mock: true }
  // TODO — implement real refund call once docs arrive
  return { ok: true, mock: true, pending_real_integration: true }
}
