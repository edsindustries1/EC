import { buildEmailLayout, COLORS } from './layout.js'

const { BLACK, GRAY_500 } = COLORS

const COPY = {
  assigned: {
    eyebrow: 'Driver assigned',
    headline: 'Your driver is confirmed',
    body: 'A driver has been assigned to your trip. Details are below.',
  },
  arrived: {
    eyebrow: 'Driver arrived',
    headline: 'Your driver is here',
    body: 'Your driver has arrived at the pickup location.',
  },
  completed: {
    eyebrow: 'Trip complete',
    headline: 'Thanks for riding with us',
    body: 'Your trip is complete. We hope to see you again soon.',
  },
  cancelled: {
    eyebrow: 'Trip cancelled',
    headline: 'Your trip has been cancelled',
    body: 'This reservation has been cancelled. If this is unexpected, reply to this email and our dispatch team will help.',
  },
  no_show: {
    eyebrow: 'Missed pickup',
    headline: 'We could not find you at pickup',
    body: 'Your driver waited but was unable to meet you. Reply to this email if you still need a ride.',
  },
}

export function buildTripUpdateEmail({ status, name, reference, pickup, dropoff, leg }, baseUrl = 'https://www.everywheretransfers.com') {
  const copy = COPY[status]
  if (!copy) return null
  const driver = leg?.driver || {}
  const vehicle = leg?.vehicle || {}
  const vehicleLine = [vehicle.color, vehicle.make, vehicle.model].filter(Boolean).join(' ')
  const driverBlock = (status === 'assigned' || status === 'arrived') && (driver.first_name || vehicleLine || leg?.car_no)
    ? `
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${GRAY_500};margin:14px 0 8px;">Your driver</div>
      <div style="font-size:15px;font-weight:700;color:${BLACK};line-height:1.5;">
        ${escapeHtml(driver.first_name || 'Your driver')}${leg?.car_no ? ` · Car ${escapeHtml(leg.car_no)}` : ''}
      </div>
      ${vehicleLine ? `<div style="font-size:13px;color:${GRAY_500};">${escapeHtml(vehicleLine)}${vehicle.plate ? ` · ${escapeHtml(vehicle.plate)}` : ''}</div>` : ''}
      ${driver.phone && process.env.DISPATCH_SHOW_DRIVER_PHONE === 'true' ? `<div style="font-size:13px;color:${GRAY_500};">Phone: ${escapeHtml(driver.phone)}</div>` : ''}`
    : ''
  const subject = `${copy.headline} — ${reference}`
  const html = buildEmailLayout({
    preheader: copy.body,
    eyebrow: copy.eyebrow,
    headline: `${copy.headline}${name ? `, ${escapeHtml(name.split(' ')[0])}` : ''}`,
    bodyHtml: `
      <p style="margin:0 0 18px;">${copy.body}</p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#F6F6F6;border-radius:10px;margin:0 0 18px;">
        <tr>
          <td style="padding:16px 18px;">
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${GRAY_500};margin-bottom:8px;">Reservation ${escapeHtml(reference)}</div>
            <div style="font-size:15px;font-weight:700;color:${BLACK};line-height:1.5;">
              ${escapeHtml(pickup)}<br/>
              <span style="color:${GRAY_500};">↓</span><br/>
              ${escapeHtml(dropoff)}
            </div>
            ${driverBlock}
          </td>
        </tr>
      </table>
    `,
    ctaLabel: 'Track your trip',
    ctaUrl: `${baseUrl}/reservation/${encodeURIComponent(reference)}`,
    baseUrl,
  })
  return { subject, html }
}

function escapeHtml(s = '') {
  return String(s).replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]))
}
