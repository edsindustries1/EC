import { buildEmailLayout, COLORS } from './layout.js'

const { BLACK, GRAY_500 } = COLORS

const VEHICLE_LABEL = {
  sedan: 'Luxury Sedan', suv: 'Premium SUV', sprinter_van: 'Sprinter Van',
  mini_bus: 'Shuttle', coach: 'Coach Bus',
}

export function buildOperatorNotificationEmail(lead, baseUrl = 'https://www.everywheretransfers.com') {
  const vehicle = VEHICLE_LABEL[lead.vehicleType] || lead.vehicleType || 'Sedan'
  const subject = `New ride request: ${lead.pickup} → ${lead.dropoff}`
  const html = buildEmailLayout({
    preheader: `${lead.name} requested ${vehicle} from ${lead.pickup} to ${lead.dropoff}.`,
    eyebrow: 'New lead',
    headline: 'A new ride request just came in',
    bodyHtml: `
      <p style="margin:0 0 14px;">
        A customer has posted a new ride request. Review the details below and submit a
        bid from the operator dashboard.
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#F6F6F6;border-radius:10px;margin:0 0 18px;">
        <tr>
          <td style="padding:18px 20px;">
            ${row('Customer', escapeHtml(lead.name || '—'))}
            ${row('Email',    `<a href="mailto:${escapeAttr(lead.email)}" style="color:${BLACK};text-decoration:underline;">${escapeHtml(lead.email || '—')}</a>`)}
            ${row('Phone',    `<a href="tel:${escapeAttr(lead.phone)}" style="color:${BLACK};text-decoration:underline;">${escapeHtml(lead.phone || '—')}</a>`)}
            ${row('Pickup',   escapeHtml(lead.pickup))}
            ${row('Drop-off', escapeHtml(lead.dropoff))}
            ${row('When',     escapeHtml(lead.rideDate || '—'))}
            ${row('Vehicle',  escapeHtml(`${vehicle} · ${lead.passengers || 1} pax`))}
          </td>
        </tr>
      </table>
      <p style="margin:0;color:${GRAY_500};">
        Reply to this email to reach the customer directly, or open the operator dashboard
        to send a bid with a payment link.
      </p>
    `,
    ctaLabel: 'Open operator dashboard',
    ctaUrl: `${baseUrl}/operator/activity`,
    baseUrl,
  })
  return { subject, html }
}

function row(label, value) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="padding:6px 0;">
      <tr>
        <td style="font-size:13px;color:#6B6B6B;font-family:-apple-system,'Helvetica Neue',Arial,sans-serif;">${label}</td>
        <td style="font-size:14px;color:#000;font-weight:600;text-align:right;font-family:-apple-system,'Helvetica Neue',Arial,sans-serif;">${value}</td>
      </tr>
    </table>
  `
}
function escapeHtml(s = '') {
  return String(s).replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]))
}
function escapeAttr(s = '') {
  return String(s || '').replace(/"/g, '%22')
}
