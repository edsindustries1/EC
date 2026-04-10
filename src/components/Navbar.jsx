import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  FiMenu, FiX, FiUser, FiPhone, FiBriefcase, FiArrowRight,
  FiFacebook, FiInstagram, FiLinkedin, FiMessageCircle,
  FiChevronDown, FiNavigation, FiClock, FiAward, FiTruck,
  FiHelpCircle, FiSun, FiMoon,
} from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const PHONE = '(718) 658-6000'
const PHONE_HREF = 'tel:+17186586000'
const SOCIALS = [
  { href: 'https://www.facebook.com/share/1CVi8FFsRs/', label: 'Facebook', Icon: FiFacebook },
  { href: 'https://www.instagram.com/everywherecars20', label: 'Instagram', Icon: FiInstagram },
  { href: 'https://www.linkedin.com/company/everywhere-transportation-inc', label: 'LinkedIn', Icon: FiLinkedin },
  { href: 'https://wa.me/17182196683', label: 'WhatsApp', Icon: FiMessageCircle },
]

const SERVICE_LINKS = [
  { to: '/services/airport-transfers', label: 'Airport Transfers', icon: FiNavigation, desc: 'JFK, LGA, EWR & more' },
  { to: '/services/hourly', label: 'Hourly Chauffeur', icon: FiClock, desc: 'As-directed service' },
  { to: '/services/events', label: 'Event Transportation', icon: FiAward, desc: 'Weddings, galas & more' },
  { to: '/corporate', label: 'Corporate Travel', icon: FiBriefcase, desc: 'Managed corporate accounts' },
]

const EXPLORE_LINKS = [
  { to: '/fleet', label: 'Our Fleet', icon: FiTruck, desc: 'Sedans, SUVs, Sprinters & Coaches' },
  { to: '/how-it-works', label: 'How It Works', icon: FiHelpCircle, desc: 'Book in 3 simple steps' },
  { to: '/corporate', label: 'Corporate', icon: FiBriefcase, desc: 'Business accounts & billing' },
]

const ROUTE_LINKS = [
  { to: '/transfers/jfk-to-manhattan', label: 'JFK → Manhattan' },
  { to: '/transfers/lga-to-manhattan', label: 'LGA → Manhattan' },
  { to: '/transfers/ewr-to-manhattan', label: 'EWR → Manhattan' },
  { to: '/transfers/jfk-to-brooklyn', label: 'JFK → Brooklyn' },
  { to: '/transfers/manhattan-to-hamptons', label: 'Manhattan → Hamptons' },
  { to: '/transfers/nyc-to-philadelphia', label: 'NYC → Philadelphia' },
  { to: '/transfers/nyc-to-connecticut', label: 'NYC → Connecticut' },
  { to: '/transfers/nyc-to-boston', label: 'NYC → Boston' },
]

const ServicesDropdown = ({ onClose }) => (
  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-50">
    <p className="px-4 pb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">Our Services</p>
    {SERVICE_LINKS.map(({ to, label, icon: Icon, desc }) => (
      <Link
        key={to}
        to={to}
        onClick={onClose}
        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 rounded-xl mx-1 transition-colors group"
      >
        <div className="flex items-center justify-center w-8 h-8 bg-[#1a365d] rounded-lg flex-shrink-0">
          <Icon size={15} className="text-white" />
        </div>
        <div>
          <div className="text-sm font-semibold text-[#1a365d] group-hover:text-[#0f1f3d]">{label}</div>
          <div className="text-xs text-gray-400">{desc}</div>
        </div>
      </Link>
    ))}
    <div className="border-t border-gray-100 mt-2 pt-2 mx-3">
      <Link
        to="/services"
        onClick={onClose}
        className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#1a365d] hover:text-[#0f1f3d] transition-colors py-1"
      >
        View all services <FiArrowRight size={12} />
      </Link>
    </div>
  </div>
)

const ExploreDropdown = ({ onClose }) => (
  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-50" style={{ width: '480px' }}>
    <div className="grid grid-cols-2 gap-0">
      <div className="border-r border-gray-100 pr-1">
        <p className="px-4 pb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">Explore</p>
        {EXPLORE_LINKS.map(({ to, label, icon: Icon, desc }) => (
          <Link
            key={to}
            to={to}
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 rounded-xl mx-1 transition-colors group"
          >
            <div className="flex items-center justify-center w-7 h-7 bg-[#1a365d] rounded-lg flex-shrink-0">
              <Icon size={13} className="text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#1a365d] group-hover:text-[#0f1f3d]">{label}</div>
              <div className="text-xs text-gray-400">{desc}</div>
            </div>
          </Link>
        ))}
      </div>
      <div className="pl-1">
        <p className="px-4 pb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">Popular Routes</p>
        <div className="space-y-0.5">
          {ROUTE_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={onClose}
              className="block px-4 py-1.5 text-sm text-gray-600 hover:text-[#1a365d] hover:bg-gray-50 rounded-lg mx-1 transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  </div>
)

const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [isServicesOpen, setIsServicesOpen] = useState(false)
  const [isExploreOpen, setIsExploreOpen] = useState(false)
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false)
  const [isMobileExploreOpen, setIsMobileExploreOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const servicesRef = useRef(null)
  const exploreRef = useRef(null)

  const isHomePage = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const toggleProfileDropdown = () => setIsProfileDropdownOpen(!isProfileDropdownOpen)

  const closeAll = () => {
    setIsMenuOpen(false)
    setIsProfileDropdownOpen(false)
    setIsServicesOpen(false)
    setIsExploreOpen(false)
    setIsMobileServicesOpen(false)
    setIsMobileExploreOpen(false)
  }

  const handleLogout = () => {
    logout()
    closeAll()
    navigate('/')
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (servicesRef.current && !servicesRef.current.contains(e.target)) {
        setIsServicesOpen(false)
      }
      if (exploreRef.current && !exploreRef.current.contains(e.target)) {
        setIsExploreOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const ServicesMenuButton = () => (
    <div className="relative" ref={servicesRef}>
      <button
        onClick={() => { setIsServicesOpen(!isServicesOpen); setIsExploreOpen(false); }}
        className="flex items-center gap-1 text-gray-100 hover:text-white transition-colors text-sm"
        aria-expanded={isServicesOpen}
        aria-haspopup="true"
      >
        Services <FiChevronDown size={13} className={`transition-transform duration-200 ${isServicesOpen ? 'rotate-180' : ''}`} />
      </button>
      {isServicesOpen && <ServicesDropdown onClose={() => setIsServicesOpen(false)} />}
    </div>
  )

  const ExploreMenuButton = () => (
    <div className="relative" ref={exploreRef}>
      <button
        onClick={() => { setIsExploreOpen(!isExploreOpen); setIsServicesOpen(false); }}
        className="flex items-center gap-1 text-gray-100 hover:text-white transition-colors text-sm"
        aria-expanded={isExploreOpen}
        aria-haspopup="true"
      >
        Explore <FiChevronDown size={13} className={`transition-transform duration-200 ${isExploreOpen ? 'rotate-180' : ''}`} />
      </button>
      {isExploreOpen && <ExploreDropdown onClose={() => setIsExploreOpen(false)} />}
    </div>
  )

  const getDesktopNavLinks = () => {
    if (!isAuthenticated) {
      return (
        <>
          <ServicesMenuButton />
          <ExploreMenuButton />
          <Link to="/login" className="text-gray-100 hover:text-white transition-colors text-sm">
            Login
          </Link>
          <Link
            to="/quote"
            className="flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 text-primary-900 font-bold px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Get a Quote <FiArrowRight size={13} />
          </Link>
        </>
      )
    }

    if (user?.role === 'operator' || user?.role === 'admin') {
      return (
        <>
          <Link to="/operator/dashboard" className="text-gray-100 hover:text-white transition-colors text-sm">
            Dashboard
          </Link>
          <Link to="/operator/requests" className="text-gray-100 hover:text-white transition-colors text-sm">
            Requests
          </Link>
          <Link to="/operator/drivers" className="text-gray-100 hover:text-white transition-colors text-sm">
            Drivers
          </Link>
          {user?.role === 'admin' && (
            <>
              <Link to="/admin/users" className="text-gray-100 hover:text-white transition-colors text-sm">
                Users
              </Link>
              <Link to="/admin/revenue" className="text-gray-100 hover:text-white transition-colors text-sm">
                Revenue
              </Link>
            </>
          )}
          <ServicesMenuButton />
        </>
      )
    }

    return (
      <>
        <Link to="/book" className="text-gray-100 hover:text-white transition-colors text-sm">
          Book a Ride
        </Link>
        <Link to="/my-rides" className="text-gray-100 hover:text-white transition-colors text-sm">
          My Rides
        </Link>
        <ServicesMenuButton />
        <ExploreMenuButton />
      </>
    )
  }

  const getMobileNavLinks = () => {
    if (!isAuthenticated) {
      return (
        <>
          <div>
            <button
              onClick={() => setIsMobileServicesOpen(!isMobileServicesOpen)}
              className="flex items-center justify-between w-full px-4 py-2.5 text-gray-100 hover:text-white hover:bg-primary-800 rounded-lg transition-colors text-sm"
            >
              Services
              <FiChevronDown size={14} className={`transition-transform duration-200 ${isMobileServicesOpen ? 'rotate-180' : ''}`} />
            </button>
            {isMobileServicesOpen && (
              <div className="ml-4 mt-1 space-y-0.5">
                {SERVICE_LINKS.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={closeAll}
                    className="block px-4 py-2 text-blue-200 hover:text-white hover:bg-primary-800 rounded-lg transition-colors text-sm"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div>
            <button
              onClick={() => setIsMobileExploreOpen(!isMobileExploreOpen)}
              className="flex items-center justify-between w-full px-4 py-2.5 text-gray-100 hover:text-white hover:bg-primary-800 rounded-lg transition-colors text-sm"
            >
              Explore
              <FiChevronDown size={14} className={`transition-transform duration-200 ${isMobileExploreOpen ? 'rotate-180' : ''}`} />
            </button>
            {isMobileExploreOpen && (
              <div className="ml-4 mt-1 space-y-0.5">
                {EXPLORE_LINKS.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={closeAll}
                    className="block px-4 py-2 text-blue-200 hover:text-white hover:bg-primary-800 rounded-lg transition-colors text-sm"
                  >
                    {label}
                  </Link>
                ))}
                <div className="border-t border-primary-700 my-1" />
                <p className="px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">Routes</p>
                {ROUTE_LINKS.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={closeAll}
                    className="block px-4 py-2 text-blue-200 hover:text-white hover:bg-primary-800 rounded-lg transition-colors text-sm"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            to="/login"
            className="block px-4 py-2.5 text-gray-100 hover:text-white hover:bg-primary-800 rounded-lg transition-colors text-sm"
            onClick={closeAll}
          >
            Login
          </Link>
        </>
      )
    }

    if (user?.role === 'operator' || user?.role === 'admin') {
      return (
        <>
          <Link
            to="/operator/dashboard"
            className="block px-4 py-2.5 text-gray-100 hover:text-white hover:bg-primary-800 rounded-lg transition-colors text-sm"
            onClick={closeAll}
          >
            Dashboard
          </Link>
          <Link
            to="/operator/requests"
            className="block px-4 py-2.5 text-gray-100 hover:text-white hover:bg-primary-800 rounded-lg transition-colors text-sm"
            onClick={closeAll}
          >
            Requests
          </Link>
          <Link
            to="/operator/drivers"
            className="block px-4 py-2.5 text-gray-100 hover:text-white hover:bg-primary-800 rounded-lg transition-colors text-sm"
            onClick={closeAll}
          >
            Drivers
          </Link>
          {user?.role === 'admin' && (
            <>
              <Link
                to="/admin/users"
                className="block px-4 py-2.5 text-gray-100 hover:text-white hover:bg-primary-800 rounded-lg transition-colors text-sm"
                onClick={closeAll}
              >
                Users
              </Link>
              <Link
                to="/admin/revenue"
                className="block px-4 py-2.5 text-gray-100 hover:text-white hover:bg-primary-800 rounded-lg transition-colors text-sm"
                onClick={closeAll}
              >
                Revenue
              </Link>
            </>
          )}
          <div>
            <button
              onClick={() => setIsMobileServicesOpen(!isMobileServicesOpen)}
              className="flex items-center justify-between w-full px-4 py-2.5 text-gray-100 hover:text-white hover:bg-primary-800 rounded-lg transition-colors text-sm"
            >
              Services
              <FiChevronDown size={14} className={`transition-transform duration-200 ${isMobileServicesOpen ? 'rotate-180' : ''}`} />
            </button>
            {isMobileServicesOpen && (
              <div className="ml-4 mt-1 space-y-0.5">
                {SERVICE_LINKS.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={closeAll}
                    className="block px-4 py-2 text-blue-200 hover:text-white hover:bg-primary-800 rounded-lg transition-colors text-sm"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )
    }

    return (
      <>
        <Link
          to="/book"
          className="block px-4 py-2.5 text-gray-100 hover:text-white hover:bg-primary-800 rounded-lg transition-colors text-sm"
          onClick={closeAll}
        >
          Book a Ride
        </Link>
        <Link
          to="/my-rides"
          className="block px-4 py-2.5 text-gray-100 hover:text-white hover:bg-primary-800 rounded-lg transition-colors text-sm"
          onClick={closeAll}
        >
          My Rides
        </Link>
        <div>
          <button
            onClick={() => setIsMobileServicesOpen(!isMobileServicesOpen)}
            className="flex items-center justify-between w-full px-4 py-2.5 text-gray-100 hover:text-white hover:bg-primary-800 rounded-lg transition-colors text-sm"
          >
            Services
            <FiChevronDown size={14} className={`transition-transform duration-200 ${isMobileServicesOpen ? 'rotate-180' : ''}`} />
          </button>
          {isMobileServicesOpen && (
            <div className="ml-4 mt-1 space-y-0.5">
              {SERVICE_LINKS.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={closeAll}
                  className="block px-4 py-2 text-blue-200 hover:text-white hover:bg-primary-800 rounded-lg transition-colors text-sm"
                >
                  {label}
                </Link>
              ))}
            </div>
          )}
        </div>
        <div>
          <button
            onClick={() => setIsMobileExploreOpen(!isMobileExploreOpen)}
            className="flex items-center justify-between w-full px-4 py-2.5 text-gray-100 hover:text-white hover:bg-primary-800 rounded-lg transition-colors text-sm"
          >
            Explore
            <FiChevronDown size={14} className={`transition-transform duration-200 ${isMobileExploreOpen ? 'rotate-180' : ''}`} />
          </button>
          {isMobileExploreOpen && (
            <div className="ml-4 mt-1 space-y-0.5">
              {EXPLORE_LINKS.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={closeAll}
                  className="block px-4 py-2 text-blue-200 hover:text-white hover:bg-primary-800 rounded-lg transition-colors text-sm"
                >
                  {label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </>
    )
  }

  return (
    <nav
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        background: isHomePage && !scrolled
          ? 'transparent'
          : 'linear-gradient(to right, #1a365d, #0f1f3d)',
        backdropFilter: isHomePage && !scrolled ? 'blur(4px)' : 'none',
        WebkitBackdropFilter: isHomePage && !scrolled ? 'blur(4px)' : 'none',
        boxShadow: isHomePage && !scrolled ? 'none' : '0 4px 24px rgba(0,0,0,0.5)',
      }}
    >
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="flex items-center flex-shrink-0 group"
            aria-label="Everywhere Cars — go to homepage"
            onClick={closeAll}
          >
            <img
              src="/logo.png?v=3"
              alt="Everywhere Cars"
              className="h-14 w-auto group-hover:opacity-90 transition-opacity"
            />
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {getDesktopNavLinks()}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-all text-white/70 hover:text-white hover:bg-white/10 flex-shrink-0"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Light mode' : 'Dark mode'}
            >
              {isDark ? <FiSun size={17} /> : <FiMoon size={17} />}
            </button>
            <div className="flex items-center gap-2 border-r border-white/20 pr-4">
              {SOCIALS.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-300 hover:text-white transition-colors"
                  aria-label={label}
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
            <a
              href={PHONE_HREF}
              className="flex items-center gap-1.5 text-blue-200 hover:text-white transition-colors text-sm font-medium"
            >
              <FiPhone size={14} />
              Call Us: {PHONE}
            </a>

            {isAuthenticated && user && (
              <div className="relative">
                <button
                  onClick={toggleProfileDropdown}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <FiUser className="w-5 h-5 text-white" />
                  <span className="text-white text-sm font-medium">{user.name}</span>
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors text-sm"
                      onClick={closeAll}
                    >
                      My Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors text-sm"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-colors text-white hover:bg-primary-700"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>
            <button
              onClick={toggleMenu}
              className="p-2 hover:bg-primary-700 rounded-lg transition-colors text-white"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      <div
        className={`md:hidden bg-primary-900 border-t border-primary-700 overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
        aria-hidden={!isMenuOpen}
        {...(!isMenuOpen && { inert: '' })}
      >
        <div className="container-custom px-4 sm:px-6 py-4 space-y-1">
          <a
            href={PHONE_HREF}
            className="flex items-center gap-2 px-4 py-2.5 text-blue-200 hover:text-white hover:bg-primary-800 rounded-lg transition-colors text-sm font-medium"
          >
            <FiPhone size={14} />
            Call Us: {PHONE}
          </a>

          <div className="border-t border-primary-700 my-1" />

          {getMobileNavLinks()}

          {isAuthenticated && user && (
            <>
              <div className="border-t border-primary-700 my-1" />
              <Link
                to="/profile"
                className="block px-4 py-2.5 text-gray-100 hover:text-white hover:bg-primary-800 rounded-lg transition-colors text-sm"
                onClick={closeAll}
              >
                My Profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-gray-100 hover:text-white hover:bg-primary-800 rounded-lg transition-colors text-sm"
              >
                Logout
              </button>
            </>
          )}

          <div className="border-t border-primary-700 my-1" />

          <div className="flex items-center gap-4 px-4 py-2">
            {SOCIALS.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 hover:text-white transition-colors"
                aria-label={label}
              >
                <Icon size={18} />
              </a>
            ))}
          </div>

          <div className="border-t border-primary-700 my-1" />

          {(!isAuthenticated || user?.role === 'customer') && (
            <div className="pt-1 pb-2">
              <Link
                to="/quote"
                onClick={closeAll}
                className="flex items-center justify-center gap-2 w-full bg-yellow-400 text-primary-900 font-bold py-3 rounded-xl text-sm hover:bg-yellow-300 transition-colors"
              >
                Get a Free Quote <FiArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
