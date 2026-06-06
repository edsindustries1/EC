export function buildBidReceivedEmail({ customerName, pickup, dropoff, operatorName, amount, etaMinutes, paymentUrl, expiresInMinutes = 30 }) {
  const subject = `New offer for your ride: $${amount} from ${operatorName}`
  const html = `<!doctype html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#F6F6F6;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Helvetica,Arial,sans-serif;color:#000;-webkit-font-smoothing:antialiased;">
  <div style="max-width:520px;margin:0 auto;padding:32px 16px;">
    <div style="background:#fff;border-radius:14px;padding:36px 28px;">
      <div style="font-weight:800;font-size:22px;letter-spacing:-0.02em;color:#000;margin-bottom:18px;">
        Everywhere <span style="color:#9CA3AF;font-weight:500;">Transfers</span>
      </div>
      <p style="margin:0 0 8px;font-size:14px;color:#6B6B6B;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;">
        New offer received
      </p>
      <h1 style="margin:0 0 18px;font-size:24px;font-weight:700;letter-spacing:-0.02em;">
        Hi ${customerName || 'there'} — you have an offer
      </h1>
      <p style="margin:0 0 22px;color:#444;font-size:15px;line-height:1.5;">
        ${operatorName} just made an offer for your ride from <strong>${pickup}</strong> to <strong>${dropoff}</strong>.
      </p>

      <div style="background:#000;color:#fff;border-radius:12px;padding:22px 24px;margin:0 0 22px;text-align:center;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.65);margin-bottom:4px;">Offer</div>
        <div style="font-size:42px;font-weight:700;letter-spacing:-0.02em;line-height:1;">$${amount}</div>
        <div style="font-size:13px;color:rgba(255,255,255,0.7);margin-top:6px;">Ready in ~${etaMinutes || 30} min</div>
      </div>

      <a href="${paymentUrl}" style="display:block;background:#000;color:#fff;text-decoration:none;text-align:center;padding:16px 22px;border-radius:8px;font-weight:700;font-size:16px;letter-spacing:-0.01em;">
        Pay $${amount} to confirm
      </a>

      <p style="margin:18px 0 0;text-align:center;font-size:12px;color:#9CA3AF;">
        Offer expires in ${expiresInMinutes} minutes · You'll get the operator's full details after payment
      </p>

      <hr style="border:0;border-top:1px solid #EEEEEE;margin:28px 0;"/>
      <p style="font-size:12px;color:#9CA3AF;margin:0;text-align:center;">
        Questions? <a href="mailto:reservations@everywheretransfers.com" style="color:#000;text-decoration:underline;">reservations@everywheretransfers.com</a>
        · <a href="tel:+17186586000" style="color:#000;text-decoration:underline;">(718) 658-6000</a>
      </p>
    </div>
    <p style="text-align:center;font-size:11px;color:#9CA3AF;margin:18px 0 0;">© ${new Date().getFullYear()} Everywhere Transfers</p>
  </div>
</body></html>`
  return { subject, html }
}
