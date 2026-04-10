import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FiAward,
  FiArrowRight,
  FiPhone,
  FiCheck,
  FiCheckCircle,
  FiShield,
  FiClock,
  FiUsers,
  FiStar,
} from 'react-icons/fi'

const EVENT_TYPES = [
  { title: 'Weddings', description: 'Bridal party transfers, getaway cars, and guest shuttles. We coordinate every vehicle so you only think about the ceremony.' },
  { title: 'Corporate Galas', description: 'Executive arrivals, team shuttles from hotels to venues — impeccable presentation for your most important events.' },
  { title: 'Concerts & Shows', description: 'Door-to-venue and back. Arrive refreshed, leave without the parking rush. We handle the logistics.' },
  { title: 'Proms & Graduations', description: 'Make the milestone unforgettable. From sedans to Sprinters, safe and stylish transportation for every group size.' },
  { title: 'Private Parties', description: 'Birthday celebrations, anniversary dinners, VIP nights in Manhattan. Your personal chauffeur for the whole evening.' },
  { title: 'VIP & Red Carpet', description: 'Film premieres, fashion events, charity galas. Discreet, punctual, and always first-class.' },
]

const FEATURES = [
  {
    icon: FiShield,
    title: 'Discreet & Professional',
    description: 'Our chauffeurs are trained to maintain absolute professionalism at high-profile events — present when needed, invisible when not.',
  },
  {
    icon: FiUsers,
    title: 'Dedicated Trip Support',
    description: "A coordination specialist is assigned to your event. They manage timing, vehicles, and any last-minute changes so you don't have to.",
  },
  {
    icon: FiClock,
    title: 'Punctual Arrivals, Guaranteed',
    description: 'We pre-plan routes and build in buffer time. Your guests arrive on schedule — no exceptions.',
  },
  {
    icon: FiAward,
    title: 'Customized Itineraries',
    description: 'Multi-stop, multi-vehicle, multi-day events. We build a custom fleet plan around your schedule and guest list.',
  },
]

const Events = () => {
  const navigate = useNavigate()

  return (
    <div className="bg-white overflow-x-hidden">

      <section className="relative min-h-[75vh] flex items-end bg-[#0f1f3d] overflow-hidden">
        <img
          src="/images/service-events.png"
          alt="Event transportation — luxury vehicles at hotel entrance"
          className="absolute inset-0 w-full h-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1f3d] via-[#0f1f3d]/60 to-transparent" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6 text-sm font-medium text-blue-100 backdrop-blur-sm">
              <FiAward size={14} className="text-yellow-400" />
              Event Transportation
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6 tracking-tight text-white">
              Make Every Event
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-200">
                Unforgettable.
              </span>
            </h1>

            <p className="text-xl text-blue-100 mb-10 max-w-xl leading-relaxed">
              Weddings, galas, concerts, VIP nights and everything in between. We coordinate fleets of up to 55-passenger coaches so your guests arrive in style — every time.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/signup')}
                className="inline-flex items-center justify-center gap-2 bg-yellow-400 text-[#1a365d] font-bold py-3.5 px-8 rounded-xl hover:bg-yellow-300 transition-colors text-base shadow-lg"
              >
                Plan Your Event <FiArrowRight />
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
              {['Up to 55 passengers per coach', 'Multi-vehicle coordination', 'Dedicated event specialist'].map((item) => (
                <div key={item} className="flex items-center gap-2 text-blue-100 text-sm">
                  <FiCheckCircle size={15} className="text-yellow-400" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold uppercase tracking-widest text-[#1a365d] mb-2 block">Events We Cover</span>
            <h2 className="text-4xl font-bold text-gray-900">Every Occasion Deserves Excellence</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {EVENT_TYPES.map((e) => (
              <div
                key={e.title}
                className="bg-gray-50 rounded-2xl p-7 border border-gray-100 hover:border-[#1a365d] hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-center w-10 h-10 bg-[#1a365d] rounded-xl mb-4">
                  <FiAward size={18} className="text-white" />
                </div>
                <h3 className="font-bold text-[#1a365d] text-lg mb-2">{e.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{e.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold uppercase tracking-widest text-[#1a365d] mb-2 block">What Sets Us Apart</span>
            <h2 className="text-4xl font-bold text-gray-900">Built for High-Stakes Events</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl p-7 border border-gray-100 hover:border-[#1a365d] hover:shadow-md transition-all flex gap-5"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-[#1a365d] rounded-xl flex-shrink-0">
                  <f.icon size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1a365d] mb-2">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#0f1f3d]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-3">Fleet for Any Group Size</h2>
          <p className="text-blue-200 mb-10 max-w-xl mx-auto">From intimate sedans to 55-passenger coaches — we right-size the fleet to your guest count.</p>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { label: 'Luxury Sedans', cap: '2–3 pax' },
              { label: 'Premium SUVs', cap: '3–5 pax' },
              { label: 'Sprinter Vans', cap: '11–14 pax' },
              { label: 'Mini Buses', cap: '20 pax' },
              { label: 'Coach Buses', cap: '40–55 pax' },
            ].map((v) => (
              <div key={v.label} className="bg-white/10 border border-white/15 rounded-2xl px-6 py-4 text-center min-w-[140px]">
                <div className="text-yellow-400 font-bold text-sm mb-1">{v.cap}</div>
                <div className="text-white text-sm">{v.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-[#1a365d] to-[#2d5a8c] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="flex gap-1 mb-5">
                {[1,2,3,4,5].map(i => (
                  <FiStar key={i} size={18} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <blockquote className="text-blue-100 text-lg leading-relaxed mb-6 italic">
                "We used three Sprinter vans for our wedding party transfer from LaGuardia. The coordination was flawless — every vehicle arrived on time, the drivers were dressed impeccably, and our guests couldn't stop talking about how smooth it all was."
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  SM
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Sophia M.</p>
                  <p className="text-blue-300 text-xs">Wedding Planner · LGA to Long Island City</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-[#1a365d] mb-2">Plan Your Event Transportation</h3>
              <p className="text-gray-500 text-sm mb-6">Tell us your event details and we'll build a custom fleet plan with pricing.</p>
              <ul className="space-y-3 mb-8">
                {[
                  'Dedicated event coordination specialist',
                  'Multi-vehicle fleets for large groups',
                  'Customized itinerary planning',
                  'Fixed pricing — no last-minute surprises',
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
                Get an Event Quote <FiArrowRight />
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
            <span className="text-white">Event Transportation</span>
          </nav>
        </div>
      </div>

    </div>
  )
}

export default Events
