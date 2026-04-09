import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiMenu, FiX, FiUser, FiPhone, FiBriefcase, FiArrowRight } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'

const PHONE = '(800) 555-1234'
const PHONE_HREF = 'tel:+18005551234'

const Navbar = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const toggleProfileDropdown = () => setIsProfileDropdownOpen(!isProfileDropdownOpen)

  const closeAll = () => {
    setIsMenuOpen(false)
    setIsProfileDropdownOpen(false)
  }

  const handleLogout = () => {
    logout()
    closeAll()
    navigate('/')
  }

  const getDesktopNavLinks = () => {
    if (!isAuthenticated) {
      return (
        <>
          <Link to="/how-it-works" className="text-gray-100 hover:text-white transition-colors text-sm">
            How It Works
          </Link>
          <Link to="/corporate" className="text-gray-100 hover:text-white transition-colors text-sm flex items-center gap-1">
            <FiBriefcase size={14} />
            Corporate
          </Link>
          <Link to="/login" className="text-gray-100 hover:text-white transition-colors text-sm">
            Login
          </Link>
          <Link to="/signup" className="btn-primary text-sm">
            Sign Up
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
          <Link to="/corporate" className="text-gray-100 hover:text-white transition-colors text-sm flex items-center gap-1">
            <FiBriefcase size={14} />
            Corporate
          </Link>
        </>
      )
    }

    // Customer role
    return (
      <>
        <Link to="/book" className="text-gray-100 hover:text-white transition-colors text-sm">
          Book a Ride
        </Link>
        <Link to="/my-rides" className="text-gray-100 hover:text-white transition-colors text-sm">
          My Rides
        </Link>
        <Link to="/corporate" className="text-gray-100 hover:text-white transition-colors text-sm flex items-center gap-1">
          <FiBriefcase size={14} />
          Corporate
        </Link>
      </>
    )
  }

  const getMobileNavLinks = () => {
    if (!isAuthenticated) {
      return (
        <>
          <Link
            to="/how-it-works"
            className="block px-4 py-2.5 text-gray-100 hover:text-white hover:bg-primary-800 rounded-lg transition-colors text-sm"
            onClick={closeAll}
          >
            How It Works
          </Link>
          <Link
            to="/corporate"
            className="block px-4 py-2.5 text-gray-100 hover:text-white hover:bg-primary-800 rounded-lg transition-colors text-sm flex items-center gap-2"
            onClick={closeAll}
          >
            <FiBriefcase size={14} />
            Corporate Travel
          </Link>
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
          <Link
            to="/corporate"
            className="block px-4 py-2.5 text-gray-100 hover:text-white hover:bg-primary-800 rounded-lg transition-colors text-sm flex items-center gap-2"
            onClick={closeAll}
          >
            <FiBriefcase size={14} />
            Corporate Travel
          </Link>
        </>
      )
    }

    // Customer
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
        <Link
          to="/corporate"
          className="block px-4 py-2.5 text-gray-100 hover:text-white hover:bg-primary-800 rounded-lg transition-colors text-sm flex items-center gap-2"
          onClick={closeAll}
        >
          <FiBriefcase size={14} />
          Corporate Travel
        </Link>
      </>
    )
  }

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-primary-800 to-primary-900 shadow-lg">
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center flex-shrink-0 group"
            aria-label="Everywhere Transfers — go to homepage"
            onClick={closeAll}
          >
            <div className="bg-white rounded-lg px-2 py-1 group-hover:opacity-90 transition-opacity">
              <img
                src="/logo.png"
                alt="Everywhere Transfers"
                className="h-7 w-auto"
              />
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            {getDesktopNavLinks()}
          </div>

          {/* Desktop Right: Phone + Profile */}
          <div className="hidden md:flex items-center gap-4">
            {/* Phone number — always visible on desktop */}
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

          {/* Mobile Hamburger */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 hover:bg-primary-700 rounded-lg transition-colors text-white"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu — slide-down */}
      <div
        className={`md:hidden bg-primary-900 border-t border-primary-700 overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
        aria-hidden={!isMenuOpen}
        {...(!isMenuOpen && { inert: '' })}
      >
        <div className="container-custom px-4 sm:px-6 py-4 space-y-1">
          {/* Phone call row */}
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

          {/* Get a Quote CTA — only for guests and customers */}
          {(!isAuthenticated || user?.role === 'customer') && (
            <div className="pt-1 pb-2">
              <Link
                to={isAuthenticated ? '/book' : '/signup'}
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
