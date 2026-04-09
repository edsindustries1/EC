import React from 'react'
import { Link } from 'react-router-dom'
import {
  FiFacebook,
  FiTwitter,
  FiLinkedin,
  FiInstagram,
  FiMail,
  FiPhone,
} from 'react-icons/fi'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-b from-primary-900 to-primary-950 text-gray-100">
      {/* Main Footer Content */}
      <div className="container-custom px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-accent-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <h3 className="text-lg font-bold text-white">EVERYWHERE CARS</h3>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Your trusted transportation marketplace connecting customers with reliable drivers.
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
            <ul className="space-y-2">
              <li>
                <Link to="/book" className="text-sm text-gray-400 hover:text-accent-500 transition-colors">
                  Book a Ride
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
            <ul className="space-y-2">
              <li>
                <a href="mailto:support@everywherecars.com" className="text-sm text-gray-400 hover:text-accent-500 transition-colors flex items-center gap-2">
                  <FiMail className="w-4 h-4" />
                  support@everywherecars.com
                </a>
              </li>
              <li>
                <a href="tel:+1234567890" className="text-sm text-gray-400 hover:text-accent-500 transition-colors flex items-center gap-2">
                  <FiPhone className="w-4 h-4" />
                  +1 (234) 567-890
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
            <ul className="space-y-2">
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

        {/* Copyright Bar */}
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            © {currentYear} Everywhere Cars. All rights reserved.
          </p>
          <p className="text-sm text-gray-400">
            Made with passion for seamless mobility
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
