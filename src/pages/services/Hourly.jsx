import React from 'react'
import { FiClock, FiNavigation, FiUsers, FiShield } from 'react-icons/fi'
import { ServiceDetail } from './AirportTransfers'

const FEATURES = [
  { icon: FiClock,      title: '3-hour minimum',     desc: 'Hourly service starts at a 3-hour minimum. Time is yours — meetings, shopping, dinner, and back.' },
  { icon: FiNavigation, title: 'Multi-stop included', desc: 'Add as many stops as you need. Your chauffeur waits between stops at no additional charge.' },
  { icon: FiUsers,      title: 'Wait time included',  desc: 'Need an hour at a meeting? No problem. You\'re renting the chauffeur and the vehicle for the duration.' },
  { icon: FiShield,     title: 'Discreet & professional', desc: 'Suited chauffeurs who respect privacy and confidentiality — perfect for sensitive engagements.' },
]

const VEHICLES = [
  { type: 'Luxury sedan',     pax: '2–3',   ideal: 'Executive day trips',      img: '/images/fleet-sedan.png' },
  { type: 'Premium SUV',      pax: '3–5',   ideal: 'Family multi-stop days',   img: '/images/fleet-suv.png' },
  { type: 'Mercedes Sprinter', pax: '11–14', ideal: 'Corporate teams on tour',  img: '/images/fleet-sprinter.png' },
  { type: 'Stretch limo',     pax: '6–8',   ideal: 'Nights out, special days', img: '/images/fleet-limo.png' },
]

export default function Hourly() {
  return <ServiceDetail
    eyebrow="Service · By the hour"
    title="Your chauffeur,"
    titleAccent="on your schedule."
    lead="As-directed chauffeur service for multi-stop days, business meetings, shopping, weddings and nights out. You set the schedule — we keep the wheels turning."
    heroImage="/images/service-hourly.png"
    features={FEATURES}
    vehicles={VEHICLES}
  />
}
