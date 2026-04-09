import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiMenu, FiX, FiUser } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const toggleProfileDropdown = () => setIsProfileDropdownOpen(!isProfileDropdownOpen)

  const handleLogout = () => {
    logout()
    setIsProfileDropdownOpen(false)
    setIsMenuOpen(false)
    navigate('/')
  }

  const getRoleBasedLinks = () => {
    if (!isAuthenticated) {
      return (
        <>
          <Link to="/how-it-works" className="text-gray-100 hover:text-white transition-colors">
            How It Works
          </Link>
          <Link to="/login" className="text-gray-100 hover:text-white transition-colors">
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
          <Link to="/operator/dashboard" className="text-gray-100 hover:text-white transition-colors">
            Dashboard
          </Link>
          <Link to="/operator/requests" className="text-gray-100 hover:text-white transition-colors">
            Requests
          </Link>
          <Link to="/operator/drivers" className="text-gray-100 hover:text-white transition-colors">
            Drivers
          </Link>
          {user?.role === 'admin' && (
            <>
              <Link to="/admin/users" className="text-gray-100 hover:text-white transition-colors">
                Users
              </Link>
              <Link to="/admin/revenue" className="text-gray-100 hover:text-white transition-colors">
                Revenue
              </Link>
            </>
          )}
        </>
      )
    }

    // Customer role
    return (
      <>
        <Link to="/book" className="text-gray-100 hover:text-white transition-colors">
          Book a Ride
        </Link>
        <Link to="/my-rides" className="text-gray-100 hover:text-white transition-colors">
          My Rides
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
            className="flex items-center gap-2 group"
            onClick={() => setIsMenuOpen(false)}
          >
            <div className="w-8 h-8 rounded-lg bg-accent-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="hidden sm:block text-white font-bold text-lg tracking-wider group-hover:text-gray-100 transition-colors">
              EVERYWHERE CARS
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {getRoleBasedLinks()}
          </div>

          {/* Profile Dropdown / Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated && user ? (
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
                      className="block px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      My Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 hover:bg-primary-700 rounded-lg transition-colors text-white"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-primary-900 border-t border-primary-700">
          <div className="container-custom px-4 sm:px-6 py-4 space-y-3">
            {getRoleBasedLinks()}

            {isAuthenticated && user && (
              <>
                <div className="divider my-3" />
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-gray-100 hover:text-white transition-colors rounded-lg hover:bg-primary-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-gray-100 hover:text-white transition-colors rounded-lg hover:bg-primary-800"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
