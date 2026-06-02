export function buildWelcomeEmail(name, baseUrl) {
  const year = new Date().getFullYear()
  const bookUrl = `${baseUrl}/#book`

  return {
    subject: 'Welcome to Everywhere Transfers \u2014 Your NYC Travel Partner \uD83D\uDE97',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Everywhere Transfers</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f6f9;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">

          <!-- HEADER -->
          <tr>
            <td style="background-color:#0f1f3d;padding:32px 40px 28px;text-align:center;border-bottom:3px solid #F6C90E;">
              <img src="${baseUrl}/logo.png" alt="Everywhere Transfers" width="180" style="display:block;margin:0 auto;max-width:180px;" />
            </td>
          </tr>

          <!-- HERO BAND -->
          <tr>
            <td style="background-color:#0f1f3d;padding:36px 40px 32px;text-align:center;">
              <h1 style="margin:0 0 12px;color:#ffffff;font-size:28px;font-weight:700;line-height:1.25;letter-spacing:-0.5px;">
                Your Professional Travel Partner<br />in New York City
              </h1>
              <div style="width:48px;height:3px;background-color:#F6C90E;margin:0 auto 16px;"></div>
              <p style="margin:0;color:#c8d6ea;font-size:15px;line-height:1.6;">
                Luxury chauffeur service, available 24/7 across the tri-state area.
              </p>
            </td>
          </tr>

          <!-- GREETING -->
          <tr>
            <td style="background-color:#ffffff;padding:36px 40px 24px;">
              <p style="margin:0 0 12px;color:#0f1f3d;font-size:17px;font-weight:700;">Hi ${name},</p>
              <p style="margin:0 0 12px;color:#374151;font-size:15px;line-height:1.7;">
                Thank you for joining Everywhere Transfers. We are New York City's premier luxury chauffeur marketplace — connecting you with professional, licensed drivers and a fleet of over 250 premium vehicles.
              </p>
              <p style="margin:0;color:#374151;font-size:15px;line-height:1.7;">
                Whether you need an airport transfer, a corporate ride, or a full-size coach for a group event, we have the right vehicle and driver for your journey.
              </p>
            </td>
          </tr>

          <!-- FLEET SECTION HEADER -->
          <tr>
            <td style="background-color:#ffffff;padding:8px 40px 20px;text-align:center;">
              <p style="margin:0;color:#0f1f3d;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;">Our Fleet</p>
              <div style="width:32px;height:2px;background-color:#F6C90E;margin:8px auto 0;"></div>
            </td>
          </tr>

          <!-- VEHICLE GRID ROW 1 -->
          <tr>
            <td style="background-color:#ffffff;padding:0 32px 12px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="48%" style="padding:0 8px 0 0;vertical-align:top;">
                    <img src="${baseUrl}/images/fleet-sedan.png" alt="Luxury Sedan" width="100%" style="display:block;width:100%;border-radius:6px;object-fit:cover;" />
                    <p style="margin:8px 0 0;color:#0f1f3d;font-size:13px;font-weight:700;text-align:center;">Luxury Sedan</p>
                    <p style="margin:2px 0 0;color:#6b7280;font-size:12px;text-align:center;">2–3 passengers</p>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="padding:0 0 0 8px;vertical-align:top;">
                    <img src="${baseUrl}/images/fleet-suv.png" alt="SUV / Escalade" width="100%" style="display:block;width:100%;border-radius:6px;object-fit:cover;" />
                    <p style="margin:8px 0 0;color:#0f1f3d;font-size:13px;font-weight:700;text-align:center;">SUV / Escalade</p>
                    <p style="margin:2px 0 0;color:#6b7280;font-size:12px;text-align:center;">3–5 passengers</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- VEHICLE GRID ROW 2 -->
          <tr>
            <td style="background-color:#ffffff;padding:12px 32px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="48%" style="padding:0 8px 0 0;vertical-align:top;">
                    <img src="${baseUrl}/images/fleet-sprinter.png" alt="Sprinter Van" width="100%" style="display:block;width:100%;border-radius:6px;object-fit:cover;" />
                    <p style="margin:8px 0 0;color:#0f1f3d;font-size:13px;font-weight:700;text-align:center;">Sprinter Van</p>
                    <p style="margin:2px 0 0;color:#6b7280;font-size:12px;text-align:center;">Up to 14 passengers</p>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="padding:0 0 0 8px;vertical-align:top;">
                    <img src="${baseUrl}/images/fleet-coach.png" alt="Coach Bus" width="100%" style="display:block;width:100%;border-radius:6px;object-fit:cover;" />
                    <p style="margin:8px 0 0;color:#0f1f3d;font-size:13px;font-weight:700;text-align:center;">Coach Bus</p>
                    <p style="margin:2px 0 0;color:#6b7280;font-size:12px;text-align:center;">20–55 passengers</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- TRUST STRIP -->
          <tr>
            <td style="background-color:#f8f9fb;padding:24px 32px;border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="33%" style="text-align:center;padding:0 8px;">
                    <p style="margin:0;font-size:18px;">&#128737;</p>
                    <p style="margin:4px 0 0;color:#0f1f3d;font-size:12px;font-weight:700;">Licensed &amp; Insured</p>
                  </td>
                  <td width="33%" style="text-align:center;padding:0 8px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
                    <p style="margin:0;font-size:18px;">&#128663;</p>
                    <p style="margin:4px 0 0;color:#0f1f3d;font-size:12px;font-weight:700;">250+ Vehicles</p>
                  </td>
                  <td width="33%" style="text-align:center;padding:0 8px;">
                    <p style="margin:0;font-size:18px;">&#128222;</p>
                    <p style="margin:4px 0 0;color:#0f1f3d;font-size:12px;font-weight:700;">24/7 Support</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="background-color:#ffffff;padding:36px 40px;text-align:center;">
              <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6;">
                Ready to experience the difference? Book your first ride today and let us take care of the rest.
              </p>
              <a href="${bookUrl}" style="display:inline-block;background-color:#F6C90E;color:#0f1f3d;text-decoration:none;font-size:15px;font-weight:700;padding:14px 36px;border-radius:6px;letter-spacing:0.3px;">
                Book Your First Ride &rarr;
              </a>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color:#0f1f3d;padding:28px 40px;text-align:center;">
              <p style="margin:0 0 8px;color:#c8d6ea;font-size:13px;">
                <a href="tel:+17186586000" style="color:#F6C90E;text-decoration:none;font-weight:700;">+1 (718) 658-6000</a>
                &nbsp;&nbsp;|&nbsp;&nbsp;
                <a href="mailto:booking@everywheretransfers.com" style="color:#c8d6ea;text-decoration:none;">booking@everywheretransfers.com</a>
              </p>
              <p style="margin:0 0 12px;color:#c8d6ea;font-size:13px;">
                <a href="https://wa.me/17182196683" style="color:#c8d6ea;text-decoration:none;">WhatsApp: +1 (718) 219-6683</a>
              </p>
              <p style="margin:0;color:#5a7494;font-size:11px;">
                &copy; ${year} Everywhere Transfers &mdash; Everywhere Transfers. All rights reserved.<br />
                New York City Luxury Chauffeur Service
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  }
}
