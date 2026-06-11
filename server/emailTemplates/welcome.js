import { buildEmailLayout, COLORS } from './layout.js'

const { BLACK, GRAY_500 } = COLORS

export function buildWelcomeEmail(name, baseUrl = 'https://www.everywheretransfers.com') {
  const subject = `Welcome to Everywhere Transfers, ${name || 'there'} 👋`
  const html = buildEmailLayout({
    preheader: `Account ready. Tap the button to book your first ride.`,
    eyebrow: 'Account created',
    headline: `Welcome, ${name || 'there'}`,
    bodyHtml: `
      <p style="margin:0 0 14px;">
        Thanks for signing up. Your account is ready and you can now book premium chauffeur
        service across the Northeast — sedans, SUVs, Sprinters, shuttles, and coaches —
        with instant confirmation and fixed pricing.
      </p>
      <p style="margin:0 0 14px;">
        A few things worth knowing:
      </p>
      <ul style="margin:0 0 14px;padding-left:20px;color:${BLACK};line-height:1.7;">
        <li>No surge pricing. The price you see is the price you pay.</li>
        <li>Flight tracking is automatic. Your driver waits, free of charge.</li>
        <li>Free cancellation up to 4 hours before pickup.</li>
      </ul>
      <p style="margin:0 0 16px;color:${GRAY_500};">
        Tap below to start a booking, or browse our popular routes on the website.
      </p>
      <p style="margin:18px 0 0;padding-top:14px;border-top:1px solid #EEEEEE;font-size:11px;color:${GRAY_500};letter-spacing:0.04em;">
        Everywhere Transfers is built and operated by
        <a href="https://everydaydigitalsolutions.com" style="color:${BLACK};text-decoration:underline;font-weight:600;">Everyday Digital Solutions</a>
        — modern technology platforms for premium service businesses.
      </p>
    `,
    ctaLabel: 'Book your first ride',
    ctaUrl: baseUrl,
    baseUrl,
  })
  return { subject, html }
}
