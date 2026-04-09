import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  FiFacebook,
  FiTwitter,
  FiLinkedin,
  FiInstagram,
  FiMail,
  FiPhone,
  FiShield,
  FiUser,
  FiLock,
  FiArrowRight,
  FiBriefcase,
} from 'react-icons/fi'

const TRUST_BADGES = [
  { icon: FiShield, label: 'Licensed & Insured' },
  { icon: FiUser, label: 'Verified Drivers' },
  { icon: FiLock, label: 'Secure Payments' },
]

const Footer = () => {
  const currentYear = new Date().getFullYear()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleNewsletter = (e) => {
    e.preventDefault()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address')
      return
    }
    setSubmitted(true)
    setEmail('')
    toast.success('You\'re in! Your 10% discount code is on its way.')
  }

  return (
    <footer className="bg-gradient-to-b from-primary-900 to-primary-950 text-gray-100">
      {/* Newsletter row */}
      <div className="border-b border-primary-800">
        <div className="container-custom px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold text-white mb-1">Get 10% Off Your First Ride</h3>
              <p className="text-sm text-gray-400">Join our list and receive an exclusive discount code instantly.</p>
            </div>

            {submitted ? (
              <div className="flex items-center gap-2 text-green-400 font-medium text-sm">
                <FiShield size={16} />
                Check your inbox for your discount code!
              </div>
            ) : (
              <form
                onSubmit={handleNewsletter}
                className="flex w-full md:w-auto gap-2"
              >
                <div className="relative flex-grow md:w-72">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    aria-label="Email address for newsletter signup"
                    className="w-full pl-9 pr-4 py-2.5 bg-primary-800 border border-primary-700 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 bg-yellow-400 text-primary-900 font-bold px-5 py-2.5 rounded-lg hover:bg-yellow-300 transition-colors text-sm flex-shrink-0"
                >
                  Get 10% Off <FiArrowRight size={14} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container-custom px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Company Column — spans 2 on large screens */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <img
                src="/logo.png"
                alt="Everywhere Transfers"
                className="h-10 w-auto brightness-0 invert"
              />
            </div>
            <p className="text-sm text-gray-400 mb-5 max-w-xs leading-relaxed">
              Your trusted transportation marketplace connecting customers with reliable, licensed drivers across 100+ US cities.
            </p>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-accent-500 transition-colors"
                aria-label="Facebook"
              >
                <FiFacebook className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-accent-500 transition-colors"
                aria-label="Twitter"
              >
                <FiTwitter className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-accent-500 transition-colors"
                aria-label="LinkedIn"
              >
                <FiLinkedin className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-accent-500 transition-colors"
                aria-label="Instagram"
              >
                <FiInstagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Services Column */}
          <div>
            <h4 className="text-base font-semibold text-white mb-4">Services</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/book" className="text-sm text-gray-400 hover:text-accent-500 transition-colors">
                  Book a Ride
                </Link>
              </li>
              <li>
                <Link
                  to="/corporate"
                  className="text-sm text-gray-400 hover:text-accent-500 transition-colors flex items-center gap-1.5"
                >
                  <FiBriefcase size={12} />
                  Corporate Travel
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-sm text-gray-400 hover:text-accent-500 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <a href="#pricing" className="text-sm text-gray-400 hover:text-accent-500 transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#features" className="text-sm text-gray-400 hover:text-accent-500 transition-colors">
                  Features
                </a>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h4 className="text-base font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="mailto:support@everywherecars.com"
                  className="text-sm text-gray-400 hover:text-accent-500 transition-colors flex items-center gap-2"
                >
                  <FiMail className="w-4 h-4 flex-shrink-0" />
                  support@everywherecars.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+18005551234"
                  className="text-sm text-gray-400 hover:text-accent-500 transition-colors flex items-center gap-2"
                >
                  <FiPhone className="w-4 h-4 flex-shrink-0" />
                  (800) 555-1234
                </a>
              </li>
              <li>
                <a href="#faq" className="text-sm text-gray-400 hover:text-accent-500 transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#contact" className="text-sm text-gray-400 hover:text-accent-500 transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="text-base font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/privacy" className="text-sm text-gray-400 hover:text-accent-500 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-gray-400 hover:text-accent-500 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <a href="#cookies" className="text-sm text-gray-400 hover:text-accent-500 transition-colors">
                  Cookie Policy
                </a>
              </li>
              <li>
                <a href="#accessibility" className="text-sm text-gray-400 hover:text-accent-500 transition-colors">
                  Accessibility
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-primary-700" />

        {/* Copyright Bar with trust badges */}
        <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            &copy; {currentYear} Everywhere Transfers. All rights reserved.
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {TRUST_BADGES.map((badge) => (
              <div key={badge.label} className="flex items-center gap-1.5 text-gray-400 text-xs">
                <badge.icon size={13} className="text-blue-300" />
                <span>{badge.label}</span>
              </div>
            ))}
          </div>

          <p className="text-sm text-gray-500">
            Made with passion for seamless mobility
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
