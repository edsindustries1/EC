import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  FiMenu, FiX, FiChevronDown, FiArrowRight,
  FiLogOut, FiSettings, FiUser,
} from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'

const BLACK = '#000'
const WHITE = '#fff'
const GRAY_50 = '#F6F6F6'
const GRAY_500 = '#6B6B6B'

const PUBLIC_LINKS = [
  { to: '/services', label: 'Ride' },
  { to: '/corporate', label: 'Business' },
  { to: '/fleet',     label: 'Fleet' },
  { to: '/how-it-works', label: 'How it works' },
]

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef(null)

  // Close menus on route change
  useEffect(() => { setOpen(false); setProfileOpen(false) }, [location.pathname])

  // Click outside profile
  useEffect(() => {
    const onClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const handleLogout = () => {
    logout()
    setProfileOpen(false)
    navigate('/')
  }

  const navStyle = {
    position: 'sticky',
    top: 0,
    zIndex: 50,
    background: WHITE,
    borderBottom: `1px solid ${GRAY_50}`,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif",
  }

  const linkStyle = {
    color: BLACK,
    fontSize: 15,
    fontWeight: 500,
    padding: '8px 12px',
    borderRadius: 999,
    textDecoration: 'none',
    transition: 'background 150ms ease',
  }

  const linkHover = (e, on) => { e.currentTarget.style.background = on ? GRAY_50 : 'transparent' }

  return (
    <nav style={navStyle}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>

        {/* Brand */}
        <Link
          to="/"
          style={{
            fontWeight: 800,
            fontSize: 22,
            letterSpacing: '-0.02em',
            color: BLACK,
            textDecoration: 'none',
          }}
        >
          Everywhere<span style={{ color: GRAY_500, fontWeight: 500 }}> Cars</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center" style={{ gap: 2 }}>
          {(user?.role === 'operator' || user?.role === 'admin' ? (
            <>
              <NavLink to="/operator/dashboard">Dashboard</NavLink>
              <NavLink to="/operator/requests">Requests</NavLink>
              <NavLink to="/operator/drivers">Drivers</NavLink>
              {user?.role === 'admin' && (
                <>
                  <NavLink to="/admin/users">Users</NavLink>
                  <NavLink to="/admin/revenue">Revenue</NavLink>
                </>
              )}
            </>
          ) : isAuthenticated ? (
            <>
              <NavLink to="/book">Ride</NavLink>
              <NavLink to="/my-rides">My trips</NavLink>
              <NavLink to="/corporate">Business</NavLink>
              <NavLink to="/fleet">Fleet</NavLink>
            </>
          ) : (
            PUBLIC_LINKS.map(l => <NavLink key={l.to} to={l.to}>{l.label}</NavLink>)
          ))}
        </div>

        {/* Right CTAs */}
        <div className="hidden md:flex items-center" style={{ gap: 10 }}>
          {isAuthenticated && user ? (
            <div style={{ position: 'relative' }} ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 12px 6px 6px',
                  border: 0, background: 'transparent', borderRadius: 999,
                  cursor: 'pointer',
                  transition: 'background 150ms ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = GRAY_50}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: BLACK, color: WHITE,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 13,
                }}>{user.name?.charAt(0)?.toUpperCase() || 'U'}</div>
                <span style={{ fontSize: 14, fontWeight: 600, color: BLACK }}>{user.name?.split(' ')[0]}</span>
                <FiChevronDown size={14} style={{ transform: profileOpen ? 'rotate(180deg)' : 'none', transition: 'transform 180ms ease' }}/>
              </button>
              {profileOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 6px)',
                  background: WHITE, borderRadius: 8,
                  boxShadow: '0 10px 30px -10px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.06)',
                  width: 220, padding: 6, zIndex: 60,
                }}>
                  <div style={{ padding: '10px 12px', borderBottom: `1px solid ${GRAY_50}`, marginBottom: 4 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: BLACK }}>{user.name}</div>
                    <div style={{ fontSize: 12, color: GRAY_500 }}>{user.email}</div>
                  </div>
                  <DropdownItem icon={FiSettings} to="/profile" onClick={() => setProfileOpen(false)}>My profile</DropdownItem>
                  <DropdownItem icon={FiLogOut} onClick={handleLogout} danger>Log out</DropdownItem>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" style={{ ...linkStyle, fontWeight: 600 }} onMouseEnter={(e) => linkHover(e, true)} onMouseLeave={(e) => linkHover(e, false)}>
                Log in
              </Link>
              <Link
                to="/signup"
                style={{
                  background: BLACK, color: WHITE,
                  padding: '10px 18px', borderRadius: 999,
                  fontWeight: 600, fontSize: 14,
                  textDecoration: 'none',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  transition: 'background 180ms ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#1f1f1f'}
                onMouseLeave={(e) => e.currentTarget.style.background = BLACK}
              >
                Sign up <FiArrowRight size={13} />
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden"
          onClick={() => setOpen(!open)}
          style={{ background: 'transparent', border: 0, padding: 8, color: BLACK, cursor: 'pointer' }}
          aria-label="Menu"
        >
          {open ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden" style={{ background: WHITE, borderTop: `1px solid ${GRAY_50}`, padding: '12px 16px 20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {(user?.role === 'operator' || user?.role === 'admin' ? (
              <>
                <MobileLink to="/operator/dashboard">Dashboard</MobileLink>
                <MobileLink to="/operator/requests">Requests</MobileLink>
                <MobileLink to="/operator/drivers">Drivers</MobileLink>
                {user?.role === 'admin' && (
                  <>
                    <MobileLink to="/admin/users">Users</MobileLink>
                    <MobileLink to="/admin/revenue">Revenue</MobileLink>
                  </>
                )}
              </>
            ) : isAuthenticated ? (
              <>
                <MobileLink to="/book">Ride</MobileLink>
                <MobileLink to="/my-rides">My trips</MobileLink>
                <MobileLink to="/corporate">Business</MobileLink>
                <MobileLink to="/fleet">Fleet</MobileLink>
              </>
            ) : (
              PUBLIC_LINKS.map(l => <MobileLink key={l.to} to={l.to}>{l.label}</MobileLink>)
            ))}

            <div style={{ borderTop: `1px solid ${GRAY_50}`, marginTop: 12, paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {isAuthenticated ? (
                <>
                  <Link to="/profile" style={mobileBtnSecondary}><FiUser size={16}/> Profile</Link>
                  <button onClick={handleLogout} style={{ ...mobileBtnSecondary, border: 0, color: '#b91c1c', background: GRAY_50, cursor: 'pointer' }}>
                    <FiLogOut size={16}/> Log out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" style={mobileBtnSecondary}>Log in</Link>
                  <Link to="/signup" style={mobileBtnPrimary}>Sign up <FiArrowRight size={14}/></Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

function NavLink({ to, children }) {
  return (
    <Link
      to={to}
      style={{
        color: BLACK,
        fontSize: 15, fontWeight: 500,
        padding: '8px 14px', borderRadius: 999,
        textDecoration: 'none',
        transition: 'background 150ms ease',
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = GRAY_50}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      {children}
    </Link>
  )
}

function MobileLink({ to, children }) {
  return (
    <Link
      to={to}
      style={{
        color: BLACK, fontSize: 16, fontWeight: 600,
        padding: '12px 14px', borderRadius: 8,
        textDecoration: 'none',
      }}
    >
      {children}
    </Link>
  )
}

function DropdownItem({ icon: Icon, to, onClick, children, danger }) {
  const style = {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 12px',
    fontSize: 14, fontWeight: 500,
    color: danger ? '#b91c1c' : BLACK,
    textDecoration: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    background: 'transparent', border: 0, width: '100%', textAlign: 'left',
  }
  if (to) {
    return <Link to={to} style={style} onClick={onClick} onMouseEnter={(e)=>e.currentTarget.style.background=GRAY_50} onMouseLeave={(e)=>e.currentTarget.style.background='transparent'}><Icon size={15}/> {children}</Link>
  }
  return <button onClick={onClick} style={style} onMouseEnter={(e)=>e.currentTarget.style.background=GRAY_50} onMouseLeave={(e)=>e.currentTarget.style.background='transparent'}><Icon size={15}/> {children}</button>
}

const mobileBtnSecondary = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  padding: '12px 16px', borderRadius: 999,
  border: `1px solid ${BLACK}`, color: BLACK, background: WHITE,
  fontWeight: 600, fontSize: 15, textDecoration: 'none',
}
const mobileBtnPrimary = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  padding: '12px 16px', borderRadius: 999,
  background: BLACK, color: WHITE, border: 0,
  fontWeight: 700, fontSize: 15, textDecoration: 'none',
}
