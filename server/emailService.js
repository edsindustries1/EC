import { Resend } from 'resend'
import { buildWelcomeEmail } from './emailTemplates/welcome.js'
import { buildQuoteConfirmationEmail } from './emailTemplates/quoteConfirmation.js'
import { buildOperatorNotificationEmail } from './emailTemplates/operatorNotification.js'
import { buildOtpEmail } from './emailTemplates/otpCode.js'
import { buildBidReceivedEmail } from './emailTemplates/bidReceived.js'

const BASE_URL       = process.env.BASE_URL    || 'https://everywheretransfers.com'
const FROM_EMAIL     = process.env.FROM_EMAIL  || 'reservations@everywheretransfers.com'
const FROM_NAME      = process.env.FROM_NAME   || 'Everywhere Transfers'
const OPERATOR_EMAIL = process.env.OPERATOR_EMAIL || FROM_EMAIL
const REPLY_TO       = process.env.REPLY_TO    || FROM_EMAIL

let _client = null
function client() {
  if (_client) return _client
  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.warn('[email] RESEND_API_KEY not set — emails disabled')
    return null
  }
  _client = new Resend(key)
  return _client
}

async function send({ to, subject, html, replyTo }) {
  const c = client()
  if (!c) return null
  try {
    const { data, error } = await c.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: Array.isArray(to) ? to : [to],
      reply_to: replyTo || REPLY_TO,
      subject,
      html,
    })
    if (error) {
      console.error('[email] Resend error:', error.message || error)
      return null
    }
    return data?.id || null
  } catch (err) {
    console.error('[email] Send threw:', err.message)
    return null
  }
}

export async function sendWelcomeEmail(name, email) {
  if (!email) return
  const { subject, html } = buildWelcomeEmail(name || 'there', BASE_URL)
  const id = await send({ to: email, subject, html })
  if (id) console.log('[email] Welcome sent to', email, id)
}

export async function sendQuoteConfirmation(name, email, pickup, dropoff, vehicleType) {
  if (!email) return
  const { subject, html } = buildQuoteConfirmationEmail(name || 'there', pickup, dropoff, vehicleType, BASE_URL)
  const id = await send({ to: email, subject, html })
  if (id) console.log('[email] Quote confirmation sent to', email, id)
}

export async function sendOperatorNotification(lead) {
  const { subject, html } = buildOperatorNotificationEmail(lead, BASE_URL)
  // Reply-to the customer so the operator can hit reply and reach them directly
  const id = await send({
    to: OPERATOR_EMAIL,
    subject,
    html,
    replyTo: lead?.email || FROM_EMAIL,
  })
  if (id) console.log('[email] Operator notification sent to', OPERATOR_EMAIL, id)
}

export async function sendBidReceivedEmail({ to, customerName, pickup, dropoff, operatorName, amount, etaMinutes, paymentUrl, expiresInMinutes }) {
  if (!to) return null
  const { subject, html } = buildBidReceivedEmail({ customerName, pickup, dropoff, operatorName, amount, etaMinutes, paymentUrl, expiresInMinutes })
  const id = await send({ to, subject, html })
  if (id) console.log('[email] Bid offer sent to', to, id)
  return id
}

export async function sendOtpEmail(email, code) {
  if (!email || !code) return null
  const { subject, html } = buildOtpEmail(code, BASE_URL)
  const id = await send({ to: email, subject, html })
  if (id) console.log('[email] OTP sent to', email, id)
  return id
}
