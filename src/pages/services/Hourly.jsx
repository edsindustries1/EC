import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FiClock,
  FiArrowRight,
  FiPhone,
  FiCheck,
  FiCheckCircle,
  FiMapPin,
  FiShield,
  FiStar,
  FiGlobe,
} from 'react-icons/fi'

const BENEFITS = [
  {
    icon: FiClock,
    title: 'Total Convenience',
    description: "Your chauffeur is at your disposal for the entire block of time. No waiting, no re-booking — just call when you're ready for the next stop.",
  },
  {
    icon: FiShield,
    title: 'Comfort & Luxury',
    description: 'Travel in a meticulously maintained luxury vehicle with leather seating, climate control, and onboard Wi-Fi. Your office on wheels.',
  },
  {
    icon: FiClock,
    title: 'Personalized Scheduling',
    description: 'Start and end where you choose. Our as-directed service adapts to your agenda — meetings run long? Your driver waits.',
  },
  {
    icon: FiMapPin,
    title: 'Multiple Stops',
    description: 'Run errands, visit clients across the city, or make pit stops along the way. The hourly model is built for complex, multi-destination days.',
  },
  {
    icon: FiGlobe,
    title: 'Business & Leisure',
    description: "Whether it's a roadshow, a shopping trip, a night out in Manhattan, or a city tour for a VIP guest — hourly service handles it all.",
  },
]

const USE_CASES = [
  {
    title: 'Executive Roadshows',
    description: 'Multiple investor or client meetings across the city in a single day. Your driver knows the schedule and keeps you moving.',
  },
  {
    title: 'VIP City Tours',
    description: 'Arriving clients or executives who need a premium introduction to New York — helicopter-pad transfers, landmark stops, restaurant arrivals.',
  },
  {
    title: 'Shopping & Errands',
    description: 'Fifth Avenue, the Meatpacking District, or SoHo — your chauffeur handles parking while you shop, and loads every bag.',
  },
  {
    title: 'Nights Out in Manhattan',
    description: "Dinner reservations, Broadway shows, rooftop bars. Arrive in style, leave when you're ready, no surge pricing on the way home.",
  },
  {
    title: 'Corporate Day-Use',
    description: 'Full-day vehicle for executives who need an on-call car for meetings, airport connections, and last-minute detours.',
  },
  {
    title: 'Special Occasions',
    description: 'Anniversaries, proposals, birthday celebrations — a dedicated chauffeur adds a layer of luxury to every milestone.',
  },
]

const Hourly = () => {
  const navigate = useNavigate()

  return (
    <div className="bg-white overflow-x-hidden">

      <section className="relative min-h-[75vh] flex items-end bg-[#0f1f3d] overflow-hidden">
        <img
          src="/images/service-hourly.png"
          alt="Hourly chauffeur service — executive in luxury sedan"
          className="absolute inset-0 w-full h-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1f3d] via-[#0f1f3d]/60 to-transparent" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6 text-sm font-medium text-blue-100 backdrop-blur-sm">
              <FiClock size={14} className="text-yellow-400" />
              As-Directed Chauffeur Service
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6 tracking-tight text-white">
              Your Chauffeur.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-200">
                Your Schedule.
              </span>
            </h1>

            <p className="text-xl text-blue-100 mb-10 max-w-xl leading-relaxed">
              Book by the hour and take full control of your day. One driver, one luxury vehicle, wherever your agenda takes you — in New York and beyond.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/signup')}
                className="inline-flex items-center justify-center gap-2 bg-yellow-400 text-[#1a365d] font-bold py-3.5 px-8 rounded-xl hover:bg-yellow-300 transition-colors text-base shadow-lg"
              >
                Book Hourly Service <FiArrowRight />
              </button>
              <a
                href="tel:+17186586000"
                className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/25 text-white font-semibold py-3.5 px-8 rounded-xl hover:bg-white/20 transition-colors text-base"
              >
                <FiPhone size={16} />
                (718) 658-6000
              </a>
            </div>

            <div className="flex flex-wrap gap-6 mt-10">
              {['Minimum 2-hour booking', 'Driver stays with you all day', 'Multiple stops included'].map((item) => (
                <div key={item} className="flex items-center gap-2 text-blue-100 text-sm">
                  <FiCheckCircle size={15} className="text-yellow-400" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold uppercase tracking-widest text-[#1a365d] mb-2 block">How It Works</span>
            <h2 className="text-4xl font-bold text-gray-900">The As-Directed Model</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto text-lg">
              Unlike point-to-point rides, hourly service puts the vehicle entirely at your disposal. One flat hourly rate, no per-mile charges, no waiting fees.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                className="bg-white rounded-2xl p-7 border border-gray-100 hover:border-[#1a365d] hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-[#1a365d] rounded-xl mb-5">
                  <b.icon size={22} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-[#1a365d] mb-2">{b.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold uppercase tracking-widest text-[#1a365d] mb-2 block">Use Cases</span>
            <h2 className="text-4xl font-bold text-gray-900">Perfect For</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {USE_CASES.map((u) => (
              <div
                key={u.title}
                className="border-l-4 border-[#1a365d] bg-gray-50 rounded-r-2xl p-6"
              >
                <h3 className="font-bold text-[#1a365d] mb-2">{u.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{u.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-[#0f1f3d] to-[#1a365d] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="flex gap-1 mb-5">
                {[1,2,3,4,5].map(i => (
                  <FiStar key={i} size={18} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <blockquote className="text-blue-100 text-lg leading-relaxed mb-6 italic">
                "Last-minute request for an all-day car for our startup's investor roadshow. Called at 7 AM and had a black Cadillac Escalade at our office at 8:15. Six meetings, three boroughs, zero stress. Everywhere Cars is our go-to from now on."
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  AR
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Antonio R.</p>
                  <p className="text-blue-300 text-xs">Startup Founder · Full-Day Hourly in Manhattan</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-[#1a365d] mb-2">Book Your Hourly Chauffeur</h3>
              <p className="text-gray-500 text-sm mb-6">Tell us your schedule and we'll confirm availability and pricing within minutes.</p>
              <ul className="space-y-3 mb-8">
                {[
                  'Minimum 2-hour booking',
                  'All vehicle classes available',
                  'Dedicated driver for the full duration',
                  'Flexible pickup and drop-off locations',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                    <FiCheck size={15} className="text-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate('/signup')}
                className="w-full bg-[#1a365d] text-white font-bold py-3.5 rounded-xl hover:bg-[#0f1f3d] transition-colors flex items-center justify-center gap-2"
              >
                Book Hourly Service <FiArrowRight />
              </button>
              <p className="text-center text-xs text-gray-400 mt-3">
                Prefer to call? <a href="tel:+17186586000" className="font-semibold text-[#1a365d] hover:underline">(718) 658-6000</a>
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-[#0f1f3d] border-t border-blue-900 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-blue-300">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link to="/services" className="hover:text-white transition-colors">Services</Link>
            <span>/</span>
            <span className="text-white">Hourly Chauffeur</span>
          </nav>
        </div>
      </div>

    </div>
  )
}

export default Hourly
