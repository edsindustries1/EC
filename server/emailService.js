import nodemailer from 'nodemailer'
import { buildWelcomeEmail } from './emailTemplates/welcome.js'
import { buildQuoteConfirmationEmail } from './emailTemplates/quoteConfirmation.js'

const BASE_URL = process.env.BASE_URL || 'https://everywherecars.com'

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

export async function sendWelcomeEmail(name, email) {
  if (!email) return
  const transport = createTransport()
  if (!transport) return
  try {
    const { subject, html } = buildWelcomeEmail(name || 'there', BASE_URL)
    const info = await transport.sendMail({
      from: `"Everywhere Cars" <${process.env.GMAIL_USER}>`,
      to: email,
      subject,
      html,
    })
    console.log('[email] Welcome sent to', email, info.messageId)
  } catch (err) {
    console.error('[email] Welcome failed:', err.message)
  }
}

export async function sendQuoteConfirmation(name, email, pickup, dropoff, vehicleType) {
  if (!email) return
  const transport = createTransport()
  if (!transport) return
  try {
    const { subject, html } = buildQuoteConfirmationEmail(name || 'there', pickup, dropoff, vehicleType, BASE_URL)
    const info = await transport.sendMail({
      from: `"Everywhere Cars" <${process.env.GMAIL_USER}>`,
      to: email,
      subject,
      html,
    })
    console.log('[email] Quote confirmation sent to', email, info.messageId)
  } catch (err) {
    console.error('[email] Quote confirmation failed:', err.message)
  }
}
