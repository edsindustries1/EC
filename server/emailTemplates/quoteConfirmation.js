import { buildEmailLayout, COLORS } from './layout.js'

const { BLACK, GRAY_500 } = COLORS

const VEHICLE_LABEL = {
  sedan: 'Luxury Sedan', suv: 'Premium SUV', sprinter_van: 'Sprinter Van',
  mini_bus: 'Shuttle', coach: 'Coach Bus',
}

export function buildQuoteConfirmationEmail(name, pickup, dropoff, vehicleType, baseUrl = 'https://www.everywheretransfers.com') {
  const vehicle = VEHICLE_LABEL[vehicleType] || 'Premium vehicle'
  const subject = `We've got your request — ${pickup} → ${dropoff}`
  const html = buildEmailLayout({
    preheader: `Our dispatch team is on it. You'll hear back shortly with an offer.`,
    eyebrow: 'Request received',
    headline: `Thanks, ${name || 'there'} — we've got it`,
    bodyHtml: `
      <p style="margin:0 0 18px;">
        Our dispatch team has received your request and is reaching out to our operator
        network. You'll receive an offer email shortly with the confirmed price.
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#F6F6F6;border-radius:10px;margin:0 0 18px;">
        <tr>
          <td style="padding:16px 18px;">
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${GRAY_500};margin-bottom:8px;">Your trip</div>
            <div style="font-size:15px;font-weight:700;color:${BLACK};line-height:1.5;">
              ${escapeHtml(pickup)}<br/>
              <span style="color:${GRAY_500};">↓</span><br/>
              ${escapeHtml(dropoff)}
            </div>
            <div style="font-size:13px;color:${GRAY_500};margin-top:10px;">Vehicle: ${escapeHtml(vehicle)}</div>
          </td>
        </tr>
      </table>
      <p style="margin:0;color:${GRAY_500};">
        Most offers come in within 15 minutes. You can also check your account anytime to
        see active offers and pay to confirm.
      </p>
    `,
    ctaLabel: 'View your trips',
    ctaUrl: `${baseUrl}/my-rides`,
    baseUrl,
  })
  return { subject, html }
}

function escapeHtml(s = '') {
  return String(s).replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]))
}
