import React from 'react'
import { Link } from 'react-router-dom'
import { FiArrowLeft, FiPhone } from 'react-icons/fi'
import { BLACK, WHITE, GRAY_500, FONT, btnPrimary, btnSecondary } from '../styles/uber'

export default function NotFound() {
  return (
    <div style={{
      background: WHITE, color: BLACK, fontFamily: FONT, letterSpacing: '-0.01em',
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '48px 16px',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{ fontSize: 'clamp(5rem, 16vw, 10rem)', fontWeight: 700, lineHeight: 1, letterSpacing: '-0.05em', marginBottom: 12 }}>
          404
        </div>
        <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 10 }}>
          Page not found
        </h1>
        <p style={{ color: GRAY_500, fontSize: 16, lineHeight: 1.5, marginBottom: 28 }}>
          Sorry, the page you're looking for doesn't exist. Let's get you back on the road.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" style={{ ...btnPrimary, padding: '14px 24px' }}>
            <FiArrowLeft size={15}/> Back to home
          </Link>
          <a href="tel:+17186586000" style={{ ...btnSecondary, padding: '14px 24px' }}>
            <FiPhone size={15}/> (718) 658-6000
          </a>
        </div>
      </div>
    </div>
  )
}
