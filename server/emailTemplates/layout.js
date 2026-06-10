/**
 * Shared email layout — used by every transactional email we send.
 *
 * Pure black + white "premium chauffeur" aesthetic that matches the
 * website. Inline styles only, table-based for max email-client
 * compatibility (Gmail, Outlook, Apple Mail, etc).
 *
 * Templates supply only the body — the wordmark header, contact strip,
 * and legal footer come from here.
 */

const BLACK = '#000000'
const WHITE = '#FFFFFF'
const GRAY_50 = '#F6F6F6'
const GRAY_100 = '#EEEEEE'
const GRAY_300 = '#9CA3AF'
const GRAY_500 = '#6B6B6B'
const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"

const SUPPORT_EMAIL = 'reservations@everywheretransfers.com'
const SUPPORT_PHONE = '(718) 658-6000'

/**
 * @param {object} opts
 * @param {string} opts.preheader      — hidden preview text shown in inbox list
 * @param {string} opts.eyebrow        — small all-caps line above the headline
 * @param {string} opts.headline       — the email's main h1
 * @param {string} opts.bodyHtml       — full HTML for the body content
 * @param {string=} opts.ctaLabel      — optional primary button label
 * @param {string=} opts.ctaUrl        — optional primary button URL
 * @param {string=} opts.footerNote    — optional small note above the contact strip
 * @param {string=} opts.baseUrl       — public site URL (for privacy/terms links)
 */
export function buildEmailLayout({
  preheader = '',
  eyebrow = '',
  headline = '',
  bodyHtml = '',
  ctaLabel,
  ctaUrl,
  footerNote = '',
  baseUrl = 'https://www.everywheretransfers.com',
}) {
  const cta = (ctaLabel && ctaUrl) ? `
    <tr>
      <td style="padding:8px 32px 0;">
        <a href="${escapeAttr(ctaUrl)}" style="display:inline-block;background:${BLACK};color:${WHITE};text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:700;font-size:15px;letter-spacing:-0.01em;font-family:${FONT};">
          ${escapeHtml(ctaLabel)}
        </a>
      </td>
    </tr>
  ` : ''

  const note = footerNote ? `
    <tr>
      <td style="padding:18px 32px 0;font-family:${FONT};font-size:13px;line-height:1.55;color:${GRAY_500};">
        ${footerNote}
      </td>
    </tr>
  ` : ''

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <title>${escapeHtml(headline || 'Everywhere Transfers')}</title>
</head>
<body style="margin:0;padding:0;background:${GRAY_50};font-family:${FONT};color:${BLACK};-webkit-font-smoothing:antialiased;">
  <!-- Hidden preheader (shown in inbox preview) -->
  <div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">
    ${escapeHtml(preheader)}
  </div>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${GRAY_50};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="max-width:560px;width:100%;background:${WHITE};border-radius:14px;overflow:hidden;border:1px solid ${GRAY_100};">

          <!-- ── HEADER ─────────────────────────────────────── -->
          <tr>
            <td style="padding:28px 32px 8px;font-family:${FONT};">
              <div style="font-weight:800;font-size:22px;letter-spacing:-0.02em;color:${BLACK};">
                Everywhere<span style="color:${GRAY_300};font-weight:500;"> Transfers</span>
              </div>
              <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:${GRAY_500};margin-top:4px;">
                Premium chauffeur service
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:0 32px;">
              <div style="height:1px;background:${GRAY_100};margin:14px 0 0;"></div>
            </td>
          </tr>

          ${eyebrow ? `
          <tr>
            <td style="padding:24px 32px 0;font-family:${FONT};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:${GRAY_500};">
              ${escapeHtml(eyebrow)}
            </td>
          </tr>
          ` : ''}

          ${headline ? `
          <tr>
            <td style="padding:${eyebrow ? '6px' : '24px'} 32px 0;font-family:${FONT};">
              <h1 style="margin:0;font-size:24px;font-weight:700;letter-spacing:-0.02em;color:${BLACK};line-height:1.15;">
                ${escapeHtml(headline)}
              </h1>
            </td>
          </tr>
          ` : ''}

          <!-- ── BODY ───────────────────────────────────────── -->
          <tr>
            <td style="padding:18px 32px 0;font-family:${FONT};font-size:15px;line-height:1.55;color:${BLACK};">
              ${bodyHtml}
            </td>
          </tr>

          ${cta}
          ${note}

          <tr>
            <td style="padding:32px 32px 0;">
              <div style="height:1px;background:${GRAY_100};"></div>
            </td>
          </tr>

          <!-- ── CONTACT STRIP ──────────────────────────────── -->
          <tr>
            <td style="padding:20px 32px;font-family:${FONT};font-size:12px;color:${GRAY_500};line-height:1.6;">
              <strong style="color:${BLACK};">Need help?</strong>
              <br/>
              <a href="mailto:${SUPPORT_EMAIL}" style="color:${BLACK};text-decoration:underline;">${SUPPORT_EMAIL}</a>
              &nbsp;·&nbsp;
              <a href="tel:+17186586000" style="color:${BLACK};text-decoration:underline;">${SUPPORT_PHONE}</a>
              &nbsp;·&nbsp; 24/7 dispatch
            </td>
          </tr>
        </table>

        <!-- ── LEGAL FOOTER ─────────────────────────────────── -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="max-width:560px;width:100%;margin-top:14px;">
          <tr>
            <td align="center" style="font-family:${FONT};font-size:11px;color:${GRAY_300};line-height:1.55;">
              © ${new Date().getFullYear()} Everywhere Transfers &nbsp;·&nbsp;
              <a href="${baseUrl}/privacy" style="color:${GRAY_500};text-decoration:underline;">Privacy</a>
              &nbsp;·&nbsp;
              <a href="${baseUrl}/terms" style="color:${GRAY_500};text-decoration:underline;">Terms</a>
              <br/>
              <span style="color:${GRAY_300};">You're receiving this because you have an account or made a reservation with Everywhere Transfers.</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ── helpers ────────────────────────────────────────────────────────────────
function escapeHtml(s = '') {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}
function escapeAttr(s = '') {
  return String(s).replace(/"/g, '%22')
}

// Re-export colour tokens so templates can use them inline
export const COLORS = { BLACK, WHITE, GRAY_50, GRAY_100, GRAY_300, GRAY_500, FONT }
