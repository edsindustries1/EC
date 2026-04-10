import React from 'react'
import { Link } from 'react-router-dom'
import {
  FiNavigation2,
  FiClock,
  FiAward,
  FiBriefcase,
  FiArrowRight,
  FiMapPin,
  FiPhone,
} from 'react-icons/fi'

const SERVICES = [
  {
    icon: FiNavigation2,
    title: 'Airport Transfers',
    description: 'Reliable, fixed-price transfers to and from JFK, LGA, EWR and private FBO terminals. Flight tracking and free 60-minute wait included.',
    href: '/services/airport-transfers',
    badge: 'JFK · LGA · EWR · FBO',
  },
  {
    icon: FiClock,
    title: 'Hourly Chauffeur',
    description: 'Book your chauffeur by the hour for meetings, errands, city tours, or a full day on the road. The driver stays with you wherever you go.',
    href: '/services/hourly',
    badge: 'As-Directed Service',
  },
  {
    icon: FiAward,
    title: 'Event Transportation',
    description: 'Weddings, galas, concerts, proms, and VIP events. We coordinate single cars to full coach fleets — up to 55 passengers per vehicle.',
    href: '/services/events',
    badge: 'Up to 55 Passengers',
  },
  {
    icon: FiBriefcase,
    title: 'Corporate Travel',
    description: 'Dedicated account managers, monthly invoicing, and priority fleet access for teams. Trusted by leading New York companies.',
    href: '/corporate',
    badge: 'Enterprise Accounts',
  },
  {
    icon: FiMapPin,
    title: 'Point-to-Point',
    description: 'Door-to-door transfers between any two addresses — city to city, hotel to venue, residence to office. Fixed price, no meters, no surge.',
    href: '/book',
    badge: 'Fixed Pricing',
  },
]

const Services = () => {
  return (
    <div className="bg-white overflow-x-hidden">

      <section className="relative min-h-[60vh] flex items-center bg-gradient-to-br from-[#0f1f3d] via-[#1a365d] to-[#1a3a6b] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600 opacity-10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/4" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-800 opacity-15 rounded-full blur-3xl -translate-x-1/4 translate-y-1/4" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6 text-sm font-medium text-blue-100 backdrop-blur-sm">
              <FiMapPin size={14} className="text-yellow-400" />
              Premium Ground Transportation
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6 tracking-tight text-white">
              Every Service.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-200">
                Every Occasion.
              </span>
            </h1>

            <p className="text-xl text-blue-100 mb-10 max-w-xl leading-relaxed">
              From a solo airport run to a 55-passenger charter — Everywhere Cars delivers premium chauffeur service across New York and beyond.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/book"
                className="inline-flex items-center justify-center gap-2 bg-yellow-400 text-[#1a365d] font-bold py-3.5 px-8 rounded-xl hover:bg-yellow-300 transition-colors text-base shadow-lg"
              >
                Book Now <FiArrowRight />
              </Link>
              <a
                href="tel:+17186586000"
                className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/25 text-white font-semibold py-3.5 px-8 rounded-xl hover:bg-white/20 transition-colors text-base"
              >
                <FiPhone size={16} />
                (718) 658-6000
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold uppercase tracking-widest text-[#1a365d] mb-2 block">What We Offer</span>
            <h2 className="text-4xl font-bold text-gray-900">Our Services</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              Every Everywhere Cars service is built around one promise: professional, punctual, premium transportation — every time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICES.map((s) => (
              <Link
                key={s.title}
                to={s.href}
                className="group border border-gray-100 rounded-2xl p-8 hover:border-[#1a365d] hover:shadow-lg transition-all duration-300 flex flex-col"
              >
                <div className="flex items-center justify-center w-14 h-14 bg-primary-50 rounded-2xl mb-5 group-hover:bg-[#1a365d] transition-colors duration-300">
                  <s.icon className="text-[#1a365d] group-hover:text-white transition-colors duration-300" size={24} />
                </div>
                <div className="mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                    {s.badge}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed flex-grow">{s.description}</p>
                <div className="flex items-center gap-1.5 text-[#1a365d] font-semibold text-sm mt-5 group-hover:gap-3 transition-all duration-200">
                  Learn More <FiArrowRight size={16} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-[#1a365d] to-[#2d5a8c] py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Not Sure Which Service Fits?</h2>
          <p className="text-blue-100 text-lg mb-8 leading-relaxed">
            Call our team and we'll recommend the right vehicle and service type for your trip.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+17186586000"
              className="inline-flex items-center justify-center gap-2 bg-yellow-400 text-[#1a365d] font-bold py-3.5 px-8 rounded-xl hover:bg-yellow-300 transition-colors text-base"
            >
              <FiPhone size={16} />
              Call (718) 658-6000
            </a>
            <Link
              to="/book"
              className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/30 text-white font-semibold py-3.5 px-8 rounded-xl hover:bg-white/20 transition-colors text-base"
            >
              Book Online <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}

export default Services
