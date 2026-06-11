/**
 * Reusable "Powered by Everyday Digital Solutions" attribution.
 *
 * Renders as a properly-clickable external link with a clear tap
 * target. Used across the app on:
 *   - Mobile home (bottom of scroll)
 *   - OtpAuth + Login + Signup pages (footer)
 *   - Reservation confirmation page (subtle bottom line)
 *   - MockPay / payment screens (next to security badges)
 *   - Profile page (Account screen About block)
 *   - Web Footer (already rendered there)
 *
 * Variants control the visual weight: 'subtle' on busy screens,
 * 'inline' for one-line attributions, 'centered' for footer blocks.
 */
import React from 'react'

const URL = 'https://everydaydigitalsolutions.com'

export default function PoweredBy({
  variant = 'subtle',
  align = 'center',
  color = '#000',          // primary link color
  muted = '#6B6B6B',        // "Powered by" text color
}) {
  // Capacitor's WKWebView lets target="_blank" open in Safari, which is
  // what we want — keeps the user out of the in-app webview drawer.
  return (
    <div
      style={{
        textAlign: align,
        fontSize: variant === 'inline' ? 11 : 10,
        fontWeight: 600,
        color: muted,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        padding: variant === 'centered' ? '20px 16px' : '12px 0',
        lineHeight: 1.6,
      }}
    >
      Powered by{' '}
      <a
        href={URL}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color,
          fontWeight: 800,
          textDecoration: 'underline',
          textDecorationThickness: '1px',
          textUnderlineOffset: '3px',
          padding: '4px 6px',
          margin: '-4px 0',
          borderRadius: 4,
          display: 'inline-block',
        }}
        onTouchStart={(e) => {
          e.currentTarget.style.background = 'rgba(0,0,0,0.05)'
        }}
        onTouchEnd={(e) => {
          e.currentTarget.style.background = 'transparent'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(0,0,0,0.05)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent'
        }}
      >
        Everyday Digital Solutions
      </a>
    </div>
  )
}
