const VEHICLE_LABELS = {
  sedan: 'Luxury Sedan',
  suv: 'SUV / Escalade',
  sprinter: 'Sprinter Van',
  limo: 'Stretch Limousine',
  minibus: 'Mini Bus',
  coach: 'Coach Bus',
}

export function buildQuoteConfirmationEmail(name, pickup, dropoff, vehicleType, baseUrl) {
  const year = new Date().getFullYear()
  const vehicleLabel = VEHICLE_LABELS[vehicleType] || vehicleType || 'Luxury Sedan'
  const callUrl = 'tel:+17186586000'
  const whatsappUrl = 'https://wa.me/17182196683'

  return {
    subject: 'We received your quote request — Everywhere Transfers',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Quote Request Received — Everywhere Transfers</title>
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
            <td style="background-color:#0f1f3d;padding:32px 40px 28px;text-align:center;">
              <h1 style="margin:0 0 12px;color:#ffffff;font-size:26px;font-weight:700;line-height:1.3;">
                Quote Request Received
              </h1>
              <div style="width:48px;height:3px;background-color:#F6C90E;margin:0 auto 16px;"></div>
              <p style="margin:0;color:#c8d6ea;font-size:15px;line-height:1.6;">
                Our team will reach out within 15 minutes with your personalized quote.
              </p>
            </td>
          </tr>

          <!-- GREETING -->
          <tr>
            <td style="background-color:#ffffff;padding:36px 40px 8px;">
              <p style="margin:0 0 12px;color:#0f1f3d;font-size:17px;font-weight:700;">Hi ${name},</p>
              <p style="margin:0;color:#374151;font-size:15px;line-height:1.7;">
                Thank you for reaching out to Everywhere Transfers. We have received your ride request and a member of our dispatch team is reviewing it right now.
              </p>
            </td>
          </tr>

          <!-- TRIP DETAILS BOX -->
          <tr>
            <td style="background-color:#ffffff;padding:24px 40px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0f4fa;border-radius:8px;border-left:4px solid #F6C90E;padding:0;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 14px;color:#0f1f3d;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Trip Details</p>

                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding:0 0 10px;width:32px;vertical-align:top;">
                          <div style="width:10px;height:10px;background-color:#F6C90E;border-radius:50%;margin-top:4px;"></div>
                        </td>
                        <td style="padding:0 0 10px;vertical-align:top;">
                          <p style="margin:0;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:0.8px;font-weight:700;">Pickup</p>
                          <p style="margin:2px 0 0;color:#0f1f3d;font-size:14px;font-weight:600;">${pickup}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:0 0 10px;width:32px;vertical-align:top;">
                          <div style="width:10px;height:10px;background-color:#0f1f3d;border-radius:50%;margin-top:4px;"></div>
                        </td>
                        <td style="padding:0 0 10px;vertical-align:top;">
                          <p style="margin:0;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:0.8px;font-weight:700;">Drop-off</p>
                          <p style="margin:2px 0 0;color:#0f1f3d;font-size:14px;font-weight:600;">${dropoff}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:0;width:32px;vertical-align:top;">
                          <div style="width:10px;height:10px;background-color:#F6C90E;border-radius:2px;margin-top:4px;"></div>
                        </td>
                        <td style="padding:0;vertical-align:top;">
                          <p style="margin:0;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:0.8px;font-weight:700;">Vehicle</p>
                          <p style="margin:2px 0 0;color:#0f1f3d;font-size:14px;font-weight:600;">${vehicleLabel}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- WHAT HAPPENS NEXT -->
          <tr>
            <td style="background-color:#ffffff;padding:0 40px 32px;">
              <p style="margin:0 0 10px;color:#0f1f3d;font-size:14px;font-weight:700;">What happens next?</p>
              <p style="margin:0 0 6px;color:#374151;font-size:14px;line-height:1.7;">
                &#10003;&nbsp; Our dispatch team reviews your request
              </p>
              <p style="margin:0 0 6px;color:#374151;font-size:14px;line-height:1.7;">
                &#10003;&nbsp; We match you with an available, verified driver
              </p>
              <p style="margin:0;color:#374151;font-size:14px;line-height:1.7;">
                &#10003;&nbsp; You receive a personalized quote within 15 minutes
              </p>
            </td>
          </tr>

          <!-- IMMEDIATE CONTACT CTA -->
          <tr>
            <td style="background-color:#f8f9fb;padding:28px 40px;text-align:center;border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;">
              <p style="margin:0 0 16px;color:#374151;font-size:14px;line-height:1.6;">
                Need your ride confirmed faster? Contact us directly:
              </p>
              <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
                <tr>
                  <td style="padding:0 8px 0 0;">
                    <a href="${callUrl}" style="display:inline-block;background-color:#0f1f3d;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:12px 24px;border-radius:6px;">
                      Call Us Now
                    </a>
                  </td>
                  <td style="padding:0 0 0 8px;">
                    <a href="${whatsappUrl}" style="display:inline-block;background-color:#F6C90E;color:#0f1f3d;text-decoration:none;font-size:14px;font-weight:700;padding:12px 24px;border-radius:6px;">
                      WhatsApp
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:16px 0 0;color:#6b7280;font-size:13px;">
                +1 (718) 658-6000 &nbsp;&mdash;&nbsp; Available 24/7
              </p>
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
