import { buildEmailLayout, COLORS } from './layout.js'

const { BLACK, WHITE, GRAY_500 } = COLORS

/**
 * Invoice-style payment link email — operator manually creates a payment
 * link for an agreed amount and the system emails it here.
 */
export function buildPaymentLinkEmail({
  customerName,
  amount,
  currency = 'USD',
  description,
  paymentUrl,
  expiresAt,
  operatorName,
}) {
  const subject = `Pay $${amount} to confirm your ride · Everywhere Transfers`
  const expiresLine = expiresAt
    ? `This link is valid until ${formatDateTime(expiresAt)}.`
    : `This link is valid for 24 hours from now.`

  const html = buildEmailLayout({
    preheader: `${operatorName || 'Your operator'} sent a payment link for $${amount}. Tap to pay.`,
    eyebrow: 'Payment requested',
    headline: `Your reservation is one tap away`,
    bodyHtml: `
      <p style="margin:0 0 16px;">
        Hi ${escapeHtml(customerName || 'there')} — ${escapeHtml(operatorName || 'your operator')} has confirmed
        your booking. Tap the button below to pay securely and lock in your reservation.
      </p>

      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#F6F6F6;border-radius:12px;margin:0 0 8px;">
        <tr>
          <td style="padding:18px 20px;">
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${GRAY_500};margin-bottom:8px;">
              Invoice
            </div>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="padding:8px 0;font-size:14px;color:${BLACK};border-bottom:1px solid #EEEEEE;">
                  ${escapeHtml(description || 'Reservation')}
                </td>
                <td style="padding:8px 0;font-size:14px;color:${BLACK};text-align:right;border-bottom:1px solid #EEEEEE;font-weight:600;">
                  $${escapeHtml(formatAmount(amount))}
                </td>
              </tr>
              <tr>
                <td style="padding:14px 0 0;font-size:11px;color:${GRAY_500};text-transform:uppercase;letter-spacing:0.08em;font-weight:700;">
                  Total due
                </td>
                <td style="padding:14px 0 0;font-size:22px;color:${BLACK};text-align:right;font-weight:700;letter-spacing:-0.02em;">
                  $${escapeHtml(formatAmount(amount))} ${escapeHtml(currency.toUpperCase())}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <p style="margin:14px 0 0;font-size:13px;color:${GRAY_500};">
        ${escapeHtml(expiresLine)} Payment is processed securely — we never store your card.
      </p>
    `,
    ctaLabel: `Pay $${formatAmount(amount)} now`,
    ctaUrl: paymentUrl,
    footerNote: `Questions or need to change the price? Reply to this email and we'll sort it out before you pay.`,
  })
  return { subject, html }
}

function formatAmount(n) {
  const num = Number(n)
  if (!Number.isFinite(num)) return '0'
  return num.toFixed(2)
}

function formatDateTime(iso) {
  try {
    const d = new Date(iso)
    return d.toLocaleString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function escapeHtml(s = '') {
  return String(s).replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]))
}
