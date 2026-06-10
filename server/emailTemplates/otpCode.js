import { buildEmailLayout, COLORS } from './layout.js'

const { BLACK, WHITE, GRAY_500 } = COLORS

export function buildOtpEmail(code, baseUrl = 'https://www.everywheretransfers.com') {
  const subject = `${code} is your Everywhere Transfers verification code`
  const html = buildEmailLayout({
    preheader: `Your one-time code is ${code}. Expires in 10 minutes.`,
    eyebrow: 'Sign in',
    headline: 'Your verification code',
    bodyHtml: `
      <p style="margin:0 0 18px;color:${GRAY_500};">
        Enter the code below in the app to continue. It expires in 10 minutes.
      </p>
      <div style="background:${BLACK};color:${WHITE};border-radius:12px;padding:28px 16px;text-align:center;margin:0 0 18px;">
        <div style="font-family:'SF Mono','Menlo','Monaco',monospace;font-size:38px;font-weight:700;letter-spacing:0.5em;padding-left:0.5em;line-height:1;">
          ${escapeText(code)}
        </div>
      </div>
      <p style="margin:0;font-size:13px;color:${GRAY_500};">
        Didn't request this? You can safely ignore this email — no one can sign in without
        entering the code.
      </p>
    `,
    baseUrl,
  })
  return { subject, html }
}

function escapeText(s = '') {
  return String(s).replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]))
}
