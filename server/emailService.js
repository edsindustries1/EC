import nodemailer from 'nodemailer'
import { buildWelcomeEmail } from './emailTemplates/welcome.js'
import { buildQuoteConfirmationEmail } from './emailTemplates/quoteConfirmation.js'
import { buildOperatorNotificationEmail } from './emailTemplates/operatorNotification.js'

const BASE_URL = process.env.BASE_URL || 'https://everywheretransfers.com'
// Lead notifications go to this address. Falls back to the sending account.
const OPERATOR_EMAIL = process.env.OPERATOR_EMAIL || process.env.GMAIL_USER || 'reservations@everywheretransfers.com'
const FROM_NAME = process.env.FROM_NAME || 'Everywhere Transfers'

function createTransport() {
  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_APP_PASSWORD
  if (!user || !pass) {
    console.warn('[email] GMAIL_USER / GMAIL_APP_PASSWORD not set — emails disabled')
    return null
  }
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  })
}

async function send(to, subject, html) {
  const transport = createTransport()
  if (!transport) return
  const info = await transport.sendMail({
    from: `"${FROM_NAME}" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  })
  return info.messageId
}

export async function sendWelcomeEmail(name, email) {
  if (!email) return
  try {
    const { subject, html } = buildWelcomeEmail(name || 'there', BASE_URL)
    const id = await send(email, subject, html)
    console.log('[email] Welcome sent to', email, id || '')
  } catch (err) {
    console.error('[email] Welcome failed:', err.message)
  }
}

export async function sendQuoteConfirmation(name, email, pickup, dropoff, vehicleType) {
  if (!email) return
  try {
    const { subject, html } = buildQuoteConfirmationEmail(name || 'there', pickup, dropoff, vehicleType, BASE_URL)
    const id = await send(email, subject, html)
    console.log('[email] Quote confirmation sent to', email, id || '')
  } catch (err) {
    console.error('[email] Quote confirmation failed:', err.message)
  }
}

export async function sendOperatorNotification(lead) {
  try {
    const { subject, html } = buildOperatorNotificationEmail(lead, BASE_URL)
    const id = await send(OPERATOR_EMAIL, subject, html)
    console.log('[email] Operator notification sent', id || '')
  } catch (err) {
    console.error('[email] Operator notification failed:', err.message)
  }
}
