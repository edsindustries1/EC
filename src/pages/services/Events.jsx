import React from 'react'
import { FiUsers, FiCalendar, FiNavigation, FiHeart } from 'react-icons/fi'
import { ServiceDetail } from './AirportTransfers'

const FEATURES = [
  { icon: FiUsers,      title: 'Groups of any size',     desc: 'From a couple in a sedan to 200 guests across coaches — we coordinate fleets of any scale.' },
  { icon: FiCalendar,   title: 'Event-day dispatch',     desc: 'A dedicated operations team owns your event timeline. Real-time vehicle status, custom routing, and on-call problem solving.' },
  { icon: FiNavigation, title: 'Custom routing',         desc: 'Multi-venue tours, repeated shuttle loops, staggered arrivals — we build the plan around your event, not the other way around.' },
  { icon: FiHeart,      title: 'Weddings done right',    desc: 'Bridal party transport, guest shuttles between venues and hotels, day-after recovery rides. Every detail thought through.' },
]

const VEHICLES = [
  { type: 'Mercedes Sprinter', pax: '11–14', ideal: 'Bridal party & guest shuttles', img: '/images/fleet-sprinter.png' },
  { type: 'Shuttle bus',      pax: '24',    ideal: 'Hotel-to-venue shuttles',       img: '/images/fleet-minibus.png' },
  { type: 'Coach bus',        pax: '55',    ideal: 'Conferences & corporate offsites', img: '/images/fleet-coach.png' },
  { type: 'Stretch limo',     pax: '6–8',   ideal: 'Prom & special occasions',      img: '/images/fleet-limo.png' },
]

export default function Events() {
  return <ServiceDetail
    eyebrow="Service · Group & events"
    title="Move the moment,"
    titleAccent="not the chaos."
    lead="Weddings, conferences, sports teams, school trips, corporate offsites. Sprinters, shuttles and coaches with event-day dispatch — so you can focus on the event, not the logistics."
    heroImage="/images/service-events.png"
    features={FEATURES}
    vehicles={VEHICLES}
  />
}
