/**
 * Bottom tab bar — Liquid Glass aesthetic.
 *
 * Frosted-glass background using backdrop-filter (iOS Safari supports it via
 * -webkit-backdrop-filter). The white surface is set to ~72% opacity so the
 * page content blurs through underneath — same effect as the iOS 26 native
 * tab bar / Control Centre. Respects safe-area-inset-bottom so it sits
 * above the home indicator instead of being hidden by it.
 */
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FiHome, FiClock, FiUser } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { BLACK, GRAY_500, FONT } from '../../styles/uber'

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
        // Liquid Glass: translucent white with heavy backdrop blur
        background: 'rgba(255, 255, 255, 0.72)',
        WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        backdropFilter: 'blur(28px) saturate(180%)',
        // Hairline top border that adapts to the blurred content underneath
        borderTop: '0.5px solid rgba(0, 0, 0, 0.08)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        fontFamily: FONT,
      }}
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${TABS.length}, 1fr)`,
      }}>
        {TABS.map(t => {
          const active = t.match(location.pathname)
          const to = t.to === '/account'
            ? (isAuthenticated ? '/profile' : '/verify')
            : t.to
          return (
            <Link
              key={t.to}
              to={to}
              style={{
                position: 'relative',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 4, padding: '10px 4px 10px',
                color: active ? BLACK : GRAY_500,
                textDecoration: 'none',
                transition: 'color 180ms ease',
              }}
            >
              {/* Active indicator — small pill behind the icon */}
              {active && (
                <span style={{
                  position: 'absolute',
                  top: 6, left: '50%',
                  transform: 'translateX(-50%)',
                  width: 38, height: 30, borderRadius: 999,
                  background: 'rgba(0, 0, 0, 0.06)',
                  transition: 'all 220ms cubic-bezier(0.16, 1, 0.3, 1)',
                }}/>
              )}
              <t.icon size={20} style={{ position: 'relative', zIndex: 1 }} />
              <span style={{
                fontSize: 11, fontWeight: active ? 700 : 600,
                letterSpacing: '0.01em',
                position: 'relative', zIndex: 1,
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
