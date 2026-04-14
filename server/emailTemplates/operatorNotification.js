const VEHICLE_LABELS = {
  sedan: 'Luxury Sedan',
  suv: 'SUV / Escalade',
  sprinter: 'Sprinter Van',
  limo: 'Stretch Limousine',
  minibus: 'Mini Bus',
  coach: 'Coach Bus',
}

export function buildOperatorNotificationEmail(lead, baseUrl) {
  const year = new Date().getFullYear()
  const vehicleLabel = VEHICLE_LABELS[lead.vehicleType] || lead.vehicleType || 'Not specified'
  const dashboardUrl = `${baseUrl}/operator`
  const callUrl = lead.phone ? `tel:${lead.phone.replace(/\D/g, '')}` : null
  const waUrl = lead.phone ? `https://wa.me/${lead.phone.replace(/\D/g, '')}` : null

  return {
    subject: `New Quote Request — ${lead.name} | ${lead.pickup}`,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Lead — Everywhere Cars</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f6f9;padding:24px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">

          <!-- HEADER -->
          <tr>
            <td style="background-color:#0f1f3d;padding:20px 32px;border-bottom:3px solid #F6C90E;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <img src="${baseUrl}/logo.png" alt="Everywhere Cars" height="36" style="display:block;" />
                  </td>
                  <td align="right">
                    <span style="display:inline-block;background-color:#F6C90E;color:#0f1f3d;font-size:11px;font-weight:700;padding:4px 12px;border-radius:20px;text-transform:uppercase;letter-spacing:1px;">New Lead</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ALERT BAND -->
          <tr>
            <td style="background-color:#0f1f3d;padding:20px 32px 24px;">
              <h1 style="margin:0 0 4px;color:#F6C90E;font-size:22px;font-weight:700;">New Quote Request</h1>
              <p style="margin:0;color:#c8d6ea;font-size:14px;">A customer is ready to book — respond within 15 minutes.</p>
            </td>
          </tr>

          <!-- CUSTOMER INFO -->
          <tr>
            <td style="background-color:#ffffff;padding:24px 32px 8px;">
              <p style="margin:0 0 14px;color:#0f1f3d;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Customer</p>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="50%" style="padding:0 8px 12px 0;vertical-align:top;">
                    <p style="margin:0;color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;">Name</p>
                    <p style="margin:3px 0 0;color:#0f1f3d;font-size:15px;font-weight:700;">${lead.name}</p>
                  </td>
                  <td width="50%" style="padding:0 0 12px 8px;vertical-align:top;">
                    <p style="margin:0;color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;">Email</p>
                    <p style="margin:3px 0 0;font-size:14px;">
                      <a href="mailto:${lead.email}" style="color:#0ea5e9;text-decoration:none;">${lead.email || 'Not provided'}</a>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding:0 0 16px;">
                    <p style="margin:0;color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;">Phone</p>
                    <p style="margin:3px 0 0;color:#0f1f3d;font-size:15px;font-weight:700;">${lead.phone || 'Not provided'}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- TRIP DETAILS -->
          <tr>
            <td style="background-color:#ffffff;padding:0 32px 24px;">
              <div style="background-color:#f0f4fa;border-radius:8px;border-left:4px solid #F6C90E;padding:16px 20px;">
                <p style="margin:0 0 14px;color:#0f1f3d;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Trip Details</p>
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding:0 0 10px;width:20px;vertical-align:top;">
                      <div style="width:8px;height:8px;background-color:#F6C90E;border-radius:50%;margin-top:5px;"></div>
                    </td>
                    <td style="padding:0 0 10px;">
                      <p style="margin:0;color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;">Pickup</p>
                      <p style="margin:2px 0 0;color:#0f1f3d;font-size:14px;font-weight:600;">${lead.pickup}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 0 10px;width:20px;vertical-align:top;">
                      <div style="width:8px;height:8px;background-color:#0f1f3d;border-radius:50%;margin-top:5px;"></div>
                    </td>
                    <td style="padding:0 0 10px;">
                      <p style="margin:0;color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;">Drop-off</p>
                      <p style="margin:2px 0 0;color:#0f1f3d;font-size:14px;font-weight:600;">${lead.dropoff}</p>
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2">
                      <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td width="33%" style="padding:0 8px 0 0;vertical-align:top;">
                            <p style="margin:0;color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;">Vehicle</p>
                            <p style="margin:2px 0 0;color:#0f1f3d;font-size:13px;font-weight:600;">${vehicleLabel}</p>
                          </td>
                          <td width="33%" style="padding:0 8px;vertical-align:top;">
                            <p style="margin:0;color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;">Passengers</p>
                            <p style="margin:2px 0 0;color:#0f1f3d;font-size:13px;font-weight:600;">${lead.passengers || 1}</p>
                          </td>
                          <td width="33%" style="padding:0 0 0 8px;vertical-align:top;">
                            <p style="margin:0;color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;">Date</p>
                            <p style="margin:2px 0 0;color:#0f1f3d;font-size:13px;font-weight:600;">${lead.rideDate || 'Flexible'}</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- CTA BUTTONS -->
          <tr>
            <td style="background-color:#f8f9fb;padding:20px 32px;border-top:1px solid #e5e7eb;text-align:center;">
              <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
                <tr>
                  ${callUrl ? `<td style="padding:0 6px 0 0;"><a href="${callUrl}" style="display:inline-block;background-color:#0f1f3d;color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;padding:11px 20px;border-radius:6px;">Call Customer</a></td>` : ''}
                  ${waUrl ? `<td style="padding:0 6px;"><a href="${waUrl}" style="display:inline-block;background-color:#25D366;color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;padding:11px 20px;border-radius:6px;">WhatsApp</a></td>` : ''}
                  <td style="padding:0 0 0 6px;"><a href="${dashboardUrl}" style="display:inline-block;background-color:#F6C90E;color:#0f1f3d;text-decoration:none;font-size:13px;font-weight:700;padding:11px 20px;border-radius:6px;">View Dashboard</a></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color:#0f1f3d;padding:20px 32px;text-align:center;">
              <p style="margin:0;color:#5a7494;font-size:11px;">
                &copy; ${year} Everywhere Cars &mdash; Internal Notification<br />
                This email was sent to the operator account.
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
