/**
 * One-time code email — minimal, B&W brand, big monospaced code that stands
 * out in the email preview so users can read it from the notification.
 */
export function buildOtpEmail(code, baseUrl = 'https://www.everywheretransfers.com') {
  const subject = `${code} is your Everywhere Transfers verification code`
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#F6F6F6;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Helvetica,Arial,sans-serif;color:#000;-webkit-font-smoothing:antialiased;">
  <div style="max-width:480px;margin:0 auto;padding:32px 16px;">
    <div style="background:#fff;border-radius:14px;padding:36px 28px;text-align:center;">
      <div style="font-weight:800;font-size:22px;letter-spacing:-0.02em;color:#000;margin-bottom:8px;">
        Everywhere <span style="color:#9CA3AF;font-weight:500;">Transfers</span>
      </div>
      <p style="font-size:14px;color:#6B6B6B;margin:0 0 28px;">Your one-time verification code</p>

      <div style="background:#000;color:#fff;border-radius:12px;padding:24px 16px;margin:0 0 28px;">
        <div style="font-family:'SF Mono','Menlo','Monaco',monospace;font-size:42px;font-weight:700;letter-spacing:0.5em;padding-left:0.5em;">
          ${code}
        </div>
      </div>

      <p style="font-size:14px;color:#000;font-weight:600;margin:0 0 8px;">
        Enter this code in the app to continue.
      </p>
      <p style="font-size:13px;color:#6B6B6B;line-height:1.55;margin:0 0 24px;">
        The code expires in 10 minutes. If you didn't request it, just ignore this email — nothing happens unless someone enters it.
      </p>

      <hr style="border:0;border-top:1px solid #EEEEEE;margin:24px 0;"/>

      <p style="font-size:12px;color:#9CA3AF;margin:0;">
        Need help? <a href="mailto:reservations@everywheretransfers.com" style="color:#000;text-decoration:underline;">reservations@everywheretransfers.com</a>
        · <a href="tel:+17186586000" style="color:#000;text-decoration:underline;">(718) 658-6000</a>
      </p>
    </div>
    <p style="text-align:center;font-size:11px;color:#9CA3AF;margin:18px 0 0;">
      © ${new Date().getFullYear()} Everywhere Transfers
    </p>
  </div>
</body>
</html>`
  return { subject, html }
}
