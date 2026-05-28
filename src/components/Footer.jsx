import React from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiInstagram, FiLinkedin, FiFacebook } from 'react-icons/fi'

const BLACK = '#000'
const WHITE = '#fff'
const GRAY_300 = '#9CA3AF'
const FONT = "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif"

const COLUMNS = [
  {
    title: 'Company',
    links: [
      { to: '/how-it-works', label: 'How it works' },
      { to: '/fleet', label: 'Fleet' },
      { to: '/corporate', label: 'Business' },
      { to: '/services', label: 'Services' },
    ],
  },
  {
    title: 'Popular routes',
    links: [
      { to: '/transfers/jfk-to-manhattan',      label: 'JFK → Manhattan' },
      { to: '/transfers/lga-to-manhattan',      label: 'LGA → Manhattan' },
      { to: '/transfers/ewr-to-manhattan',      label: 'EWR → Manhattan' },
      { to: '/transfers/manhattan-to-hamptons', label: 'Manhattan → Hamptons' },
      { to: '/transfers/nyc-to-boston',         label: 'NYC → Boston' },
      { to: '/transfers/nyc-to-philadelphia',   label: 'NYC → Philadelphia' },
    ],
  },
  {
    title: 'Support',
    links: [
      { to: '/quote', label: 'Get a quote' },
      { href: 'tel:+17186586000', label: '(718) 658-6000' },
      { href: 'mailto:reservations@everywherecars.com', label: 'reservations@everywherecars.com' },
      { to: '/privacy', label: 'Privacy' },
      { to: '/terms', label: 'Terms' },
    ],
  },
]

export default function Footer() {
  return (
    <footer style={{
      background: BLACK, color: WHITE,
      fontFamily: FONT, letterSpacing: '-0.01em',
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12" style={{ padding: '64px 0 32px' }}>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 24, marginBottom: 48, paddingBottom: 32, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 26, letterSpacing: '-0.02em' }}>
              Everywhere<span style={{ color: GRAY_300, fontWeight: 500 }}> Cars</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, marginTop: 8, maxWidth: 420 }}>
              Premium chauffeur service across the Northeast. Sedans, SUVs, vans, shuttles, coaches.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Link to="/signup" style={{
              background: WHITE, color: BLACK,
              padding: '12px 22px', borderRadius: 999,
              fontWeight: 700, fontSize: 14,
              textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              Sign up <FiArrowRight size={13}/>
            </Link>
            <a href="https://instagram.com" aria-label="Instagram" style={socialBtn}><FiInstagram size={16}/></a>
            <a href="https://linkedin.com"  aria-label="LinkedIn"  style={socialBtn}><FiLinkedin size={16}/></a>
            <a href="https://facebook.com"  aria-label="Facebook"  style={socialBtn}><FiFacebook size={16}/></a>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.55)', marginBottom: 14 }}>{col.title}</h4>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {col.links.map((l) => (
                  <li key={l.label}>
                    {l.to
                      ? <Link to={l.to} style={linkStyle}>{l.label}</Link>
                      : <a href={l.href} style={linkStyle}>{l.label}</a>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16, alignItems: 'center', paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.12)' }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
            © {new Date().getFullYear()} Everywhere Cars. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: 18 }}>
            <Link to="/privacy" style={{ ...linkStyle, fontSize: 13 }}>Privacy</Link>
            <Link to="/terms"   style={{ ...linkStyle, fontSize: 13 }}>Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

const linkStyle = {
  color: 'rgba(255,255,255,0.78)',
  fontSize: 14,
  textDecoration: 'none',
  transition: 'color 150ms ease',
}
const socialBtn = {
  width: 38, height: 38, borderRadius: '50%',
  background: 'rgba(255,255,255,0.08)',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  color: WHITE, textDecoration: 'none',
}
