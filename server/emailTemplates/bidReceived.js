import { buildEmailLayout, COLORS } from './layout.js'

const { BLACK, WHITE, GRAY_500 } = COLORS

export function buildBidReceivedEmail({ customerName, pickup, dropoff, operatorName, amount, etaMinutes, paymentUrl, expiresInMinutes = 30 }) {
  const subject = `New offer for your ride: $${amount} from ${operatorName}`
  const html = buildEmailLayout({
    preheader: `${operatorName} offered $${amount} for your ride. Tap to accept.`,
    eyebrow: 'New offer',
    headline: `${operatorName} sent you an offer`,
    bodyHtml: `
      <p style="margin:0 0 16px;">
        Hi ${escapeHtml(customerName || 'there')} — an operator just bid on your ride from
        <strong>${escapeHtml(pickup)}</strong> to <strong>${escapeHtml(dropoff)}</strong>.
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${BLACK};color:${WHITE};border-radius:12px;margin:0 0 18px;">
        <tr>
          <td style="padding:22px 24px;text-align:center;">
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.6);margin-bottom:4px;">Offer</div>
            <div style="font-size:42px;font-weight:700;letter-spacing:-0.02em;line-height:1;color:${WHITE};">$${escapeHtml(String(amount))}</div>
            <div style="font-size:13px;color:rgba(255,255,255,0.7);margin-top:8px;">Ready in ~${escapeHtml(String(etaMinutes || 30))} min</div>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 6px;color:${GRAY_500};font-size:13px;">
        Tap below to confirm and pay securely. Other offers on this ride will be
        automatically cancelled once you accept.
      </p>
    `,
    ctaLabel: `Pay $${amount} to confirm`,
    ctaUrl: paymentUrl,
    footerNote: `Offer expires in ${expiresInMinutes} minutes. You'll get the operator's full details (driver, vehicle, plate) right after payment.`,
  })
  return { subject, html }
}

function escapeHtml(s = '') {
  return String(s).replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]))
}
