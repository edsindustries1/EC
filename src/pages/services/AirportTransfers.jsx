import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FiNavigation2,
  FiArrowRight,
  FiPhone,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiShield,
  FiUsers,
  FiStar,
} from 'react-icons/fi'

const FEATURES = [
  {
    icon: FiClock,
    title: 'Real-Time Flight Tracking',
    description: 'We monitor your flight status from the moment you land. Your driver adjusts automatically for early arrivals or delays — at no extra charge.',
  },
  {
    icon: FiUsers,
    title: 'Meet & Greet Service',
    description: 'Your professionally dressed chauffeur will be waiting in the arrivals hall with a name sign, ready to assist with luggage from the moment you walk out.',
  },
  {
    icon: FiNavigation2,
    title: 'Private Aviation & FBO',
    description: 'We serve all FBO terminals including Teterboro, Westchester, and private suites at JFK and EWR — seamless transfers for private jet travelers.',
  },
  {
    icon: FiShield,
    title: 'Coordinated Shuttle Service',
    description: 'Moving a large group? We coordinate multi-vehicle shuttle runs from any NYC airport to hotels, venues, or corporate campuses with precision timing.',
  },
]

const AIRPORTS = [
  { code: 'JFK', name: 'John F. Kennedy International', location: 'Queens, NY' },
  { code: 'LGA', name: 'LaGuardia Airport', location: 'Queens, NY' },
  { code: 'EWR', name: 'Newark Liberty International', location: 'Newark, NJ' },
  { code: 'FBO', name: 'Private FBO Terminals', location: 'Teterboro · Westchester · JFK' },
]

const VEHICLES = [
  { type: 'Mercedes S-Class', pax: '2–3', ideal: 'Solo & couple airport runs' },
  { type: 'Cadillac Escalade', pax: '3–5', ideal: 'Family & executive groups' },
  { type: 'Mercedes Sprinter', pax: '11–14', ideal: 'Corporate delegations' },
  { type: 'MCI Coach Bus', pax: '55', ideal: 'Large group arrivals/departures' },
]

const AirportTransfers = () => {
  const navigate = useNavigate()

  return (
    <div className="bg-white overflow-x-hidden">

      <section className="relative min-h-[75vh] flex items-end bg-[#0f1f3d] overflow-hidden">
        <img
          src="/images/service-airport.png"
          alt="Airport transfer service — luxury car at terminal"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1f3d] via-[#0f1f3d]/60 to-transparent" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6 text-sm font-medium text-blue-100 backdrop-blur-sm">
              <FiNavigation2 size={14} className="text-yellow-400" />
              Airport Transfer Service
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6 tracking-tight text-white">
              Airport Transfers,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-200">
                Done Right.
              </span>
            </h1>

            <p className="text-xl text-blue-100 mb-10 max-w-xl leading-relaxed">
              JFK, LGA, EWR and private FBO terminals — we track your flight, wait for you, and get you where you need to be. Fixed pricing, no surprises.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/signup')}
                className="inline-flex items-center justify-center gap-2 bg-yellow-400 text-[#1a365d] font-bold py-3.5 px-8 rounded-xl hover:bg-yellow-300 transition-colors text-base shadow-lg"
              >
                Book a Transfer <FiArrowRight />
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
              {['Free 60-min airport wait', 'Flight tracking included', 'Fixed pricing — no surge'].map((item) => (
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
            <span className="text-sm font-semibold uppercase tracking-widest text-[#1a365d] mb-2 block">Airports We Serve</span>
            <h2 className="text-4xl font-bold text-gray-900">Every Major New York Area Airport</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
            {AIRPORTS.map((a) => (
              <div
                key={a.code}
                className="bg-gradient-to-br from-[#0f1f3d] to-[#1a365d] rounded-2xl p-6 text-white text-center"
              >
                <div className="text-3xl font-bold text-yellow-400 mb-2">{a.code}</div>
                <div className="font-semibold text-sm mb-1">{a.name}</div>
                <div className="text-blue-300 text-xs">{a.location}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold uppercase tracking-widest text-[#1a365d] mb-2 block">What's Included</span>
            <h2 className="text-4xl font-bold text-gray-900">Every Transfer Comes Standard With</h2>
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

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold uppercase tracking-widest text-[#1a365d] mb-2 block">Fleet Options</span>
            <h2 className="text-4xl font-bold text-gray-900">Choose the Right Vehicle</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VEHICLES.map((v) => (
              <div
                key={v.type}
                className="border border-gray-100 rounded-2xl p-6 hover:border-[#1a365d] hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-center w-10 h-10 bg-primary-50 rounded-xl mb-4">
                  <FiUsers className="text-[#1a365d]" size={18} />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{v.type}</h3>
                <p className="text-xs text-[#1a365d] font-semibold mb-1">{v.pax} passengers</p>
                <p className="text-xs text-gray-400">{v.ideal}</p>
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
                "After my 11 PM red-eye into JFK the driver was already waiting in arrivals. No hunting for a pickup pin, no surge fee — just walked straight into a clean Escalade. This is what airport service should feel like."
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  KM
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Dr. Kenji M.</p>
                  <p className="text-blue-300 text-xs">Medical Conference Attendee · JFK to Brooklyn</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-[#1a365d] mb-2">Ready to Book Your Transfer?</h3>
              <p className="text-gray-500 text-sm mb-6">Get a fixed quote in seconds. No account required to get started.</p>
              <ul className="space-y-3 mb-8">
                {[
                  'Fixed price — no meters, no surge',
                  'Free flight delay monitoring',
                  'Professional meet & greet in arrivals',
                  'All NYC-area airports covered',
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
                Book an Airport Transfer <FiArrowRight />
              </button>
              <p className="text-center text-xs text-gray-400 mt-3">
                Or call us at <a href="tel:+17186586000" className="font-semibold text-[#1a365d] hover:underline">(718) 658-6000</a>
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
            <span className="text-white">Airport Transfers</span>
          </nav>
        </div>
      </div>

    </div>
  )
}

export default AirportTransfers
