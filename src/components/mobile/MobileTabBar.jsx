/**
 * Bottom tab bar — only rendered on native (Capacitor) builds.
 * Fixed at the bottom of the screen, respects safe-area inset.
 */
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FiHome, FiClock, FiUser } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { BLACK, WHITE, GRAY_100, GRAY_500, FONT } from '../../styles/uber'

const TABS = [
  { to: '/',          label: 'Ride',    icon: FiHome,  match: (p) => p === '/' },
  { to: '/my-rides',  label: 'Trips',   icon: FiClock, match: (p) => p.startsWith('/my-rides') || p.startsWith('/reservation') },
  { to: '/account',   label: 'Account', icon: FiUser,  match: (p) => p === '/account' || p === '/profile' || p === '/login' || p === '/signup' },
]

export default function MobileTabBar() {
  const location = useLocation()
  const { isAuthenticated } = useAuth() || {}

  // Hide on flow screens where the user should focus on the task
  const hideOn = ['/search', '/book-trip', '/reservation']
  if (hideOn.some(p => location.pathname.startsWith(p))) return null

  return (
    <nav
      style={{
        position: 'fixed', left: 0, right: 0, bottom: 0,
        zIndex: 50,
        background: WHITE,
        borderTop: `1px solid ${GRAY_100}`,
        paddingBottom: 'env(safe-area-inset-bottom)',
        fontFamily: FONT,
      }}
    >
      <div style={{
        display: 'grid', gridTemplateColumns: `repeat(${TABS.length}, 1fr)`,
      }}>
        {TABS.map(t => {
          const active = t.match(location.pathname)
          // Tab routes "Account" to /profile if logged in, /verify (OTP flow) if not
          const to = t.to === '/account'
            ? (isAuthenticated ? '/profile' : '/verify')
            : t.to
          return (
            <Link
              key={t.to}
              to={to}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 4, padding: '10px 4px 8px',
                color: active ? BLACK : GRAY_500,
                textDecoration: 'none',
              }}
            >
              <t.icon size={20} />
              <span style={{
                fontSize: 11, fontWeight: active ? 700 : 600,
                letterSpacing: '0.01em',
              }}>
                {t.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
