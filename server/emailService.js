import { Resend } from 'resend'
import { buildWelcomeEmail } from './emailTemplates/welcome.js'
import { buildQuoteConfirmationEmail } from './emailTemplates/quoteConfirmation.js'

const BASE_URL = process.env.BASE_URL || 'https://everywherecars.com'

async function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[email] RESEND_API_KEY not set — emails disabled')
    return null
  }
  const fromEmail = process.env.FROM_EMAIL || 'Everywhere Cars <onboarding@resend.dev>'
  return { client: new Resend(apiKey), fromEmail }
}

export async function sendWelcomeEmail(name, email) {
  if (!email) return
  const resend = await getResendClient()
  if (!resend) return
  try {
    const { subject, html } = buildWelcomeEmail(name || 'there', BASE_URL)
    const result = await resend.client.emails.send({
      from: resend.fromEmail,
      to: email,
      subject,
      html,
    })
    console.log('[email] Welcome sent to', email, result?.data?.id || '')
  } catch (err) {
    console.error('[email] Welcome failed:', err.message)
  }
}

export async function sendQuoteConfirmation(name, email, pickup, dropoff, vehicleType) {
  if (!email) return
  const resend = await getResendClient()
  if (!resend) return
  try {
    const { subject, html } = buildQuoteConfirmationEmail(name || 'there', pickup, dropoff, vehicleType, BASE_URL)
    const result = await resend.client.emails.send({
      from: resend.fromEmail,
      to: email,
      subject,
      html,
    })
    console.log('[email] Quote confirmation sent to', email, result?.data?.id || '')
  } catch (err) {
    console.error('[email] Quote confirmation failed:', err.message)
  }
}
