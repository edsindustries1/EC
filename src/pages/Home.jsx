import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  FiShield, FiTruck, FiHeadphones, FiNavigation, FiCalendar,
  FiUsers, FiBriefcase, FiArrowRight, FiPhone,
} from 'react-icons/fi'
import DispatchPanel from '../components/DispatchPanel'
import HeroSlideshow from '../components/HeroSlideshow'
import useSimulatedStats from '../hooks/useSimulatedStats'
import { useTheme } from '../context/ThemeContext'

const VEHICLE_OPTIONS = [
  { id: 'sedan',        label: 'Sedan',    icon: '🚗', desc: '2–3 passengers' },
  { id: 'suv',         label: 'SUV',       icon: '🚙', desc: '3–5 passengers' },
  { id: 'sprinter_van', label: 'Sprinter', icon: '🚐', desc: 'Up to 14 passengers' },
  { id: 'coach',       label: 'Coach Bus', icon: '🚌', desc: '20–55 passengers' },
]

const TRUST_ITEMS = [
  {
    icon: FiShield,
    label: 'Licensed & Insured',
    desc: 'Every driver fully vetted, licensed, and covered',
    color: '#22c55e',
  },
  {
    icon: FiTruck,
    label: '250+ Vehicles',
    desc: 'Sedans, SUVs, Sprinters and luxury coaches',
    color: '#F6C90E',
  },
  {
    icon: FiHeadphones,
    label: '24/7 Live Support',
    desc: 'Real humans always available to help',
    color: '#0EA5E9',
  },
]

const SERVICE_PILLS = [
  { label: 'Airport Transfers', icon: FiNavigation, href: '/services/airport-transfers' },
  { label: 'Hourly Chauffeur', icon: FiCalendar, href: '/services/hourly' },
  { label: 'Group Events', icon: FiUsers, href: '/services/events' },
  { label: 'Corporate', icon: FiBriefcase, href: '/corporate' },
]

const ELECTRIC = '#0EA5E9'
const GOLD = '#F6C90E'

export default function Home() {
  const { isDark } = useTheme()
  const stats = useSimulatedStats()
  const [presetVehicle, setPresetVehicle] = useState(null)
  const panelRef = useRef(null)

  const handleVehicleSelect = (vehicleId) => {
    setPresetVehicle(vehicleId)
    setTimeout(() => {
      panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 50)
  }

  const scrollToBook = () => {
    panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const overlayBase = isDark ? 'rgba(4,8,14,0.28)' : 'rgba(10,18,40,0.18)'
  const overlayTop = isDark
    ? 'linear-gradient(to bottom, rgba(4,8,14,0.55) 0%, transparent 100%)'
    : 'linear-gradient(to bottom, rgba(10,18,40,0.42) 0%, transparent 100%)'
  const overlayBottom = isDark
    ? 'linear-gradient(to top, rgba(4,8,14,0.60) 0%, transparent 100%)'
    : 'linear-gradient(to top, rgba(10,18,40,0.35) 0%, transparent 100%)'

  return (
    <div style={{ background: 'var(--bg-page)', transition: 'background 300ms ease' }}>

      <section
        className="relative flex flex-col overflow-hidden"
        style={{ minHeight: '100vh' }}
      >
        <HeroSlideshow />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 3 }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '35%', background: overlayTop }} />
          <div style={{ position: 'absolute', inset: 0, background: overlayBase }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%', background: overlayBottom }} />
        </div>

        <div
          ref={panelRef}
          className="relative flex-1 flex flex-col items-center justify-center px-4"
          style={{ zIndex: 4, paddingTop: '5rem', paddingBottom: '6rem' }}
        >
          <div
            className="flex items-center gap-3 mb-4 px-4 py-2 rounded-full"
            style={{
              background: 'rgba(0,0,0,0.50)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              border: '1px solid rgba(255,255,255,0.13)',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse"
              style={{ background: '#22c55e' }}
            />
            <div
              className="flex items-center gap-3 text-xs font-mono"
              style={{ color: ELECTRIC }}
            >
              <span className="whitespace-nowrap">
                <span className="font-bold text-white">{stats.vehicles}</span> vehicles ready near NYC
              </span>
              <span className="text-white/25">|</span>
              <span className="whitespace-nowrap">
                Avg response: <span className="font-bold text-white">{stats.response} min</span>
              </span>
              <span className="hidden sm:inline text-white/25">|</span>
              <span className="whitespace-nowrap hidden sm:inline">
                Rides today: <span className="font-bold text-white">{stats.rides}</span>
              </span>
            </div>
          </div>

          <div
            style={{
              '--bg-panel': 'rgba(5, 12, 25, 0.35)',
              '--border-panel': '1px solid rgba(255, 255, 255, 0.20)',
              '--bg-field': 'rgba(255, 255, 255, 0.09)',
              '--bg-field-hover': 'rgba(255, 255, 255, 0.15)',
              '--border-field': '1px solid rgba(255, 255, 255, 0.20)',
              '--border-color': 'rgba(255, 255, 255, 0.12)',
              '--stats-bg': 'rgba(255, 255, 255, 0.06)',
              '--text-primary': 'rgba(255, 255, 255, 1)',
              '--text-secondary': 'rgba(255, 255, 255, 0.78)',
              '--text-muted': 'rgba(255, 255, 255, 0.45)',
            }}
          >
            <DispatchPanel presetVehicle={presetVehicle} hideStats />
          </div>
        </div>
      </section>

      <section
        className="relative"
        style={{
          background: isDark
            ? 'linear-gradient(to bottom, rgba(4,8,14,0.0) 0%, var(--bg-surface) 80px)'
            : 'var(--bg-surface)',
          borderTop: '1px solid var(--border-color)',
          transition: 'background 300ms ease',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-14">
            {TRUST_ITEMS.map(({ icon: Icon, label, desc, color }) => (
              <div key={label} className="flex flex-col items-center text-center gap-3">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `${color}18`,
                    border: `1.5px solid ${color}30`,
                  }}
                >
                  <Icon size={22} style={{ color }} />
                </div>
                <div>
                  <div
                    className="font-bold text-base mb-1"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {label}
                  </div>
                  <div
                    className="text-sm leading-relaxed"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div
            className="rounded-2xl p-6 sm:p-8 mb-14"
            style={{
              background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(26,54,93,0.04)',
              border: '1px solid var(--border-color)',
            }}
          >
            <p
              className="text-xs font-bold uppercase tracking-widest mb-5 text-center"
              style={{ color: 'var(--text-muted)' }}
            >
              Choose your vehicle — we will pre-select it in the booking form above
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {VEHICLE_OPTIONS.map(({ id, label, icon, desc }) => {
                const isSelected = presetVehicle === id
                return (
                  <button
                    key={id}
                    onClick={() => handleVehicleSelect(id)}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all text-center"
                    style={{
                      background: isSelected
                        ? (isDark ? 'rgba(246,201,14,0.10)' : 'rgba(246,201,14,0.12)')
                        : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(26,54,93,0.05)'),
                      border: isSelected
                        ? `1.5px solid ${GOLD}`
                        : '1px solid var(--border-color)',
                      cursor: 'pointer',
                    }}
                  >
                    <span className="text-2xl">{icon}</span>
                    <div>
                      <div
                        className="text-sm font-semibold"
                        style={{ color: isSelected ? GOLD : 'var(--text-primary)' }}
                      >
                        {label}
                      </div>
                      <div
                        className="text-xs mt-0.5"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {desc}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #1a365d 0%, #0f1f3d 100%)' }}
          >
            <div className="px-6 sm:px-10 py-8 sm:py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-yellow-400 mb-2">
                  Popular services
                </p>
                <div className="flex flex-wrap gap-2">
                  {SERVICE_PILLS.map(({ label, icon: Icon, href }) => (
                    <Link
                      key={label}
                      to={href}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white/80 hover:text-white transition-colors"
                      style={{
                        background: 'rgba(255,255,255,0.10)',
                        border: '1px solid rgba(255,255,255,0.14)',
                        textDecoration: 'none',
                      }}
                    >
                      <Icon size={12} />
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="flex flex-col sm:items-end items-center gap-3">
                <button
                  onClick={scrollToBook}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105"
                  style={{
                    background: GOLD,
                    color: '#0f1f3d',
                    boxShadow: `0 4px 20px rgba(246,201,14,0.35)`,
                  }}
                >
                  Book Now <FiArrowRight size={15} />
                </button>
                <a
                  href="tel:+17186586000"
                  className="flex items-center gap-1.5 text-sm font-medium text-white/60 hover:text-white/90 transition-colors"
                >
                  <FiPhone size={13} />
                  (718) 658-6000
                </a>
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  )
}
