import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  FiFacebook,
  FiLinkedin,
  FiInstagram,
  FiMail,
  FiPhone,
  FiMapPin,
  FiShield,
  FiUser,
  FiLock,
  FiArrowRight,
  FiMessageCircle,
  FiBriefcase,
  FiExternalLink,
} from 'react-icons/fi'
import { useTheme } from '../context/ThemeContext'

const PHONE = '(718) 658-6000'
const PHONE_HREF = 'tel:+17186586000'
const EMAIL = 'booking@everywherecars.com'
const WHATSAPP = 'https://wa.me/17182196683'
const FACEBOOK = 'https://www.facebook.com/share/1CVi8FFsRs/'
const INSTAGRAM = 'https://www.instagram.com/everywherecars20'
const LINKEDIN = 'https://www.linkedin.com/company/everywhere-transportation-inc'

const socialLinks = [
  { icon: FiFacebook,      label: 'Facebook',  href: FACEBOOK  },
  { icon: FiInstagram,     label: 'Instagram', href: INSTAGRAM },
  { icon: FiLinkedin,      label: 'LinkedIn',  href: LINKEDIN  },
  { icon: FiMessageCircle, label: 'WhatsApp',  href: WHATSAPP  },
]

const services = [
  { text: 'Airport Transfers',    to: '/services/airport-transfers' },
  { text: 'Hourly Chauffeur',     to: '/services/hourly' },
  { text: 'Corporate Travel',     to: '/corporate' },
  { text: 'Event Transportation', to: '/services/events' },
  { text: 'View Our Fleet',       to: '/fleet' },
]

const company = [
  { text: 'How It Works',   to: '/how-it-works' },
  { text: 'Book a Ride',    to: '/' },
  { text: 'Operator Login', to: '/login' },
  { text: 'Privacy Policy', to: '/privacy' },
  { text: 'Terms of Service', to: '/terms' },
]

const contactItems = [
  { icon: FiMail,        text: EMAIL,        href: `mailto:${EMAIL}`,  highlight: false },
  { icon: FiPhone,       text: PHONE,        href: PHONE_HREF,         highlight: false },
  { icon: FiMessageCircle, text: 'WhatsApp Us', href: WHATSAPP,        highlight: true  },
  { icon: FiMapPin,      text: 'New York City, NY', href: null,        highlight: false },
]

const trustBadges = [
  { icon: FiShield, label: 'Licensed & Insured' },
  { icon: FiUser,   label: 'Vetted Chauffeurs'  },
  { icon: FiLock,   label: 'Secure & Free to Post' },
]

const GOLD  = '#F6C90E'
const WHITE = '#ffffff'

export default function Footer() {
  const { isDark } = useTheme()
  const currentYear = new Date().getFullYear()
  const [email, setEmail]       = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleNewsletter = (e) => {
    e.preventDefault()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address')
      return
    }
    setSubmitted(true)
    setEmail('')
    toast.success("You're in! Your 10% discount code is on its way.")
  }

  const bg     = isDark ? '#080f1e' : '#0c1527'
  const muted  = 'rgba(255,255,255,0.48)'
  const body   = 'rgba(255,255,255,0.68)'
  const border = 'rgba(246,201,14,0.13)'

  const LinkStyle = { color: muted, transition: 'color 150ms' }
  const hoverOn  = (e) => { e.currentTarget.style.color = WHITE }
  const hoverOff = (e) => { e.currentTarget.style.color = muted  }

  return (
    <footer style={{ background: bg, borderTop: `1px solid ${border}` }}>

      {/* ── Newsletter Strip ─────────────────────────────────────── */}
      <div style={{ borderBottom: `1px solid ${border}` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-9">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-lg font-bold mb-1" style={{ color: WHITE }}>
                Get 10% Off Your First Ride
              </h3>
              <p className="text-sm" style={{ color: body }}>
                Join our list and receive an exclusive discount code instantly.
              </p>
            </div>

            {submitted ? (
              <div className="flex items-center gap-2 text-sm font-medium" style={{ color: '#4ade80' }}>
                <FiShield size={16} />
                Check your inbox for your discount code!
              </div>
            ) : (
              <form onSubmit={handleNewsletter} className="flex w-full md:w-auto gap-2">
                <div className="relative flex-grow md:w-72">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2" size={14} style={{ color: muted }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    aria-label="Email for newsletter"
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm outline-none"
                    style={{
                      background: 'rgba(255,255,255,0.07)',
                      border: `1px solid rgba(255,255,255,0.14)`,
                      color: WHITE,
                    }}
                  />
                </div>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 font-bold px-5 py-2.5 rounded-lg text-sm flex-shrink-0 transition-opacity hover:opacity-90"
                  style={{ background: GOLD, color: '#0c1527' }}
                >
                  Get 10% Off <FiArrowRight size={13} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Columns ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <a href="/" className="inline-block mb-5">
              <img src="/logo.png?v=3" alt="Everywhere Cars" style={{ height: '46px', width: 'auto' }} />
            </a>
            <p className="text-sm leading-relaxed mb-6 max-w-xs" style={{ color: body }}>
              New York&rsquo;s luxury chauffeur marketplace. Post your ride free&nbsp;&mdash; operators compete, you choose the best price.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex items-center justify-center rounded-full transition-all duration-200"
                  style={{
                    width: '36px', height: '36px',
                    border: '1px solid rgba(246,201,14,0.22)',
                    color: muted,
                    background: 'rgba(255,255,255,0.04)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = GOLD
                    e.currentTarget.style.borderColor = 'rgba(246,201,14,0.55)'
                    e.currentTarget.style.background = 'rgba(246,201,14,0.08)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = muted
                    e.currentTarget.style.borderColor = 'rgba(246,201,14,0.22)'
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                  }}
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: GOLD }}>
              Services
            </p>
            <ul className="space-y-3">
              {services.map(({ text, to }) => (
                <li key={text}>
                  <Link
                    to={to}
                    className="text-sm"
                    style={LinkStyle}
                    onMouseEnter={hoverOn}
                    onMouseLeave={hoverOff}
                  >
                    {text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: GOLD }}>
              Company
            </p>
            <ul className="space-y-3">
              {company.map(({ text, to }) => (
                <li key={text}>
                  <Link
                    to={to}
                    className="text-sm"
                    style={LinkStyle}
                    onMouseEnter={hoverOn}
                    onMouseLeave={hoverOff}
                  >
                    {text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: GOLD }}>
              Contact
            </p>
            <ul className="space-y-3.5">
              {contactItems.map(({ icon: Icon, text, href, highlight }) => {
                const itemColor = highlight ? '#4ade80' : muted
                const itemHover = highlight ? '#86efac' : WHITE
                const inner = (
                  <span className="flex items-center gap-2.5 text-sm">
                    {highlight ? (
                      <span className="relative flex items-center gap-2">
                        <span className="relative flex size-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: '#4ade80' }} />
                          <span className="relative inline-flex size-2 rounded-full" style={{ background: '#4ade80' }} />
                        </span>
                      </span>
                    ) : (
                      <Icon size={14} className="shrink-0" />
                    )}
                    {text}
                  </span>
                )

                return href ? (
                  <li key={text}>
                    <a
                      href={href}
                      target={href.startsWith('http') ? '_blank' : undefined}
                      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      style={{ color: itemColor, transition: 'color 150ms' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = itemHover }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = itemColor }}
                    >
                      {inner}
                    </a>
                  </li>
                ) : (
                  <li key={text} style={{ color: muted }}>
                    {inner}
                  </li>
                )
              })}
            </ul>

            <div className="mt-6">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full transition-opacity hover:opacity-90"
                style={{ background: 'rgba(246,201,14,0.12)', color: GOLD, border: '1px solid rgba(246,201,14,0.30)' }}
              >
                Post a Ride — Free
                <FiExternalLink size={11} />
              </Link>
            </div>
          </div>
        </div>

        {/* ── Bottom Bar ──────────────────────────────────────────── */}
        <div
          className="mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs"
          style={{ borderTop: `1px solid ${border}`, color: muted }}
        >
          <p>&copy; {currentYear} Everywhere Cars. All rights reserved.</p>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {trustBadges.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <Icon size={12} style={{ color: '#93c5fd' }} />
                <span>{label}</span>
              </div>
            ))}
          </div>

          <p>
            Powered by{' '}
            <a
              href="https://everywheretransfers.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: GOLD }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.75' }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
            >
              Everywhere Transfers
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
