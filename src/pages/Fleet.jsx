import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FiArrowRight,
  FiPhone,
  FiUsers,
  FiPackage,
  FiCheck,
  FiZap,
  FiChevronDown,
} from 'react-icons/fi'

const STATS = [
  { value: '250+', label: 'SUVs & Sedans' },
  { value: '50+', label: 'Sprinter Vans' },
  { value: '16', label: 'Mini Buses' },
  { value: '20+', label: 'Coach Buses' },
]

const SEDAN_AMENITIES = [
  'Leather Interior',
  'Dual-Zone Climate Control',
  'USB & Wireless Charging',
  'Bottled Water',
]

const SUV_AMENITIES = [
  'Leather Interior',
  'Extended Luggage Space',
  'Privacy Glass',
  'Wi-Fi Hotspot',
]

const FLEET_GROUPS = [
  {
    id: 'electric',
    label: 'Luxury Electric Vehicles',
    badge: 'Zero Emissions',
    tagline: 'The future of luxury transportation — silent, powerful, and impeccably comfortable.',
    image: '/images/fleet-electric.png',
    vehicles: [
      {
        name: 'Cadillac Lyriq',
        pax: 4,
        bags: 3,
        amenities: ['Premium Seating', 'Dual-Zone Climate Control', 'USB Charging', 'Bottled Water'],
        bookingValue: 'Cadillac Lyriq (2-4 Passengers)',
      },
      {
        name: 'Tesla Model S',
        pax: 3,
        bags: 2,
        amenities: ['Premium Seating', 'Glass Roof', 'Charging Ports', 'Bottled Water'],
        bookingValue: 'Tesla Model S (2-3 Passengers)',
      },
    ],
  },
  {
    id: 'sedans',
    label: 'Luxury Sedans',
    badge: '2–3 Passengers',
    tagline: 'Classic sophistication and professional presentation for every occasion.',
    image: '/images/fleet-sedan.png',
    vehicles: [
      {
        name: 'Mercedes-Benz S-Class',
        pax: 3,
        bags: 3,
        amenities: SEDAN_AMENITIES,
        bookingValue: 'Mercedes S-Class (2-3 Passengers)',
      },
      {
        name: 'Lincoln Continental',
        pax: 3,
        bags: 3,
        amenities: SEDAN_AMENITIES,
        bookingValue: 'Lincoln Continental (2-3 Passengers)',
      },
      {
        name: 'Dodge Charger',
        pax: 3,
        bags: 2,
        amenities: SEDAN_AMENITIES,
        bookingValue: 'Dodge Charger (2-3 Passengers)',
      },
      {
        name: 'Toyota Camry',
        pax: 3,
        bags: 2,
        amenities: SEDAN_AMENITIES,
        bookingValue: 'Toyota Camry (2-3 Passengers)',
      },
      {
        name: 'Honda Accord',
        pax: 3,
        bags: 2,
        amenities: SEDAN_AMENITIES,
        bookingValue: 'Honda Accord (2-3 Passengers)',
      },
      {
        name: 'Ford Fusion',
        pax: 3,
        bags: 2,
        amenities: SEDAN_AMENITIES,
        bookingValue: 'Ford Fusion (2-3 Passengers)',
      },
    ],
  },
  {
    id: 'suvs',
    label: 'SUVs',
    badge: '3–5 Passengers',
    tagline: 'Premium space, commanding presence, and luxury comfort for groups of any size.',
    image: '/images/fleet-suv.png',
    vehicles: [
      {
        name: 'Cadillac Escalade',
        pax: 5,
        bags: 6,
        amenities: SUV_AMENITIES,
        bookingValue: 'Cadillac Escalade (3-5 Passengers)',
      },
      {
        name: 'GMC Yukon',
        pax: 5,
        bags: 5,
        amenities: SUV_AMENITIES,
        bookingValue: 'GMC Yukon (3-5 Passengers)',
      },
      {
        name: 'Lincoln Navigator',
        pax: 5,
        bags: 5,
        amenities: SUV_AMENITIES,
        bookingValue: 'Lincoln Navigator (3-5 Passengers)',
      },
      {
        name: 'Chevy Suburban',
        pax: 5,
        bags: 5,
        amenities: SUV_AMENITIES,
        bookingValue: 'Chevy Suburban (3-5 Passengers)',
      },
      {
        name: 'Toyota Highlander',
        pax: 5,
        bags: 4,
        amenities: SUV_AMENITIES,
        bookingValue: 'Toyota Highlander (3-5 Passengers)',
      },
      {
        name: 'Nissan Pathfinder',
        pax: 5,
        bags: 4,
        amenities: SUV_AMENITIES,
        bookingValue: 'Nissan Pathfinder (3-5 Passengers)',
      },
      {
        name: 'Ford Explorer',
        pax: 5,
        bags: 4,
        amenities: SUV_AMENITIES,
        bookingValue: 'Ford Explorer (3-5 Passengers)',
      },
    ],
  },
  {
    id: 'vans-buses',
    label: 'Vans & Buses',
    badge: '11–55 Passengers',
    tagline: 'From intimate Sprinter transfers to full charter coaches — we scale with your group.',
    image: '/images/fleet-sprinter.png',
    imageCoach: '/images/fleet-coach.png',
    vehicles: [
      {
        name: 'Mercedes-Benz Sprinter Van',
        pax: 12,
        bags: 10,
        amenities: ['Captain Seating', 'Overhead Storage', 'Climate Control', 'USB Charging'],
        bookingValue: 'Mercedes Sprinter Van (11-12 Passengers)',
      },
      {
        name: 'Ford Transit Van',
        pax: 12,
        bags: 10,
        amenities: ['Captain Seating', 'Overhead Storage', 'Climate Control', 'USB Charging'],
        bookingValue: 'Ford Transit Van (11-12 Passengers)',
      },
      {
        name: 'Ford F550 Mini Bus',
        pax: 20,
        bags: 15,
        amenities: ['Comfortable Seating', 'Air Conditioning', 'USB Charging', 'Overhead Storage'],
        bookingValue: 'Ford F550 Mini Bus (20 Passengers)',
      },
      {
        name: 'Temsa TS35 Coach Bus',
        pax: 40,
        bags: null,
        amenities: ['Reclining Seats', 'Restroom On-Board', 'PA System', 'Wi-Fi'],
        bookingValue: 'Temsa TS35 Coach Bus (40 Passengers)',
      },
      {
        name: 'MCI Coach Bus',
        pax: 55,
        bags: null,
        amenities: ['Reclining Seats', 'Restroom On-Board', 'PA System', 'Wi-Fi & Power'],
        bookingValue: 'MCI Coach Bus (55 Passengers)',
      },
      {
        name: 'Prevost Coach Bus',
        pax: 55,
        bags: null,
        amenities: ['Reclining Seats', 'Restroom On-Board', 'PA System', 'Wi-Fi & Power'],
        bookingValue: 'Prevost Coach Bus (55 Passengers)',
      },
    ],
  },
]

const VehicleCard = ({ vehicle, onBook }) => (
  <div className="bg-white rounded-2xl border border-gray-100 hover:border-[#1a365d] hover:shadow-lg transition-all duration-200 p-6 flex flex-col">
    <div className="flex items-start justify-between mb-3">
      <h3 className="text-base font-bold text-[#1a365d] leading-tight">{vehicle.name}</h3>
    </div>

    <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
      <div className="flex items-center gap-1.5">
        <FiUsers size={13} className="text-[#1a365d]" />
        <span>{vehicle.pax} pax</span>
      </div>
      {vehicle.bags !== null && (
        <div className="flex items-center gap-1.5">
          <FiPackage size={13} className="text-[#1a365d]" />
          <span>{vehicle.bags} bags</span>
        </div>
      )}
      {vehicle.bags === null && (
        <div className="flex items-center gap-1.5">
          <FiPackage size={13} className="text-[#1a365d]" />
          <span>Luggage bay</span>
        </div>
      )}
    </div>

    <ul className="space-y-1.5 flex-grow mb-5">
      {vehicle.amenities.map((a) => (
        <li key={a} className="flex items-center gap-2 text-xs text-gray-600">
          <FiCheck size={12} className="text-green-500 flex-shrink-0" />
          {a}
        </li>
      ))}
    </ul>

    <button
      onClick={() => onBook(vehicle.bookingValue)}
      className="w-full text-center text-sm font-semibold text-[#1a365d] border border-[#1a365d] rounded-xl py-2.5 hover:bg-[#1a365d] hover:text-white transition-all duration-200 flex items-center justify-center gap-1.5"
    >
      Book This Vehicle <FiArrowRight size={13} />
    </button>
  </div>
)

const GroupSection = ({ group, onBook }) => {
  const [expanded, setExpanded] = useState(true)

  return (
    <section className="py-14 border-b border-gray-100 last:border-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          <div className="lg:w-80 flex-shrink-0">
            <div className="rounded-2xl overflow-hidden mb-3 h-52">
              <img
                src={group.image}
                alt={group.label}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            {group.imageCoach && (
              <div className="rounded-2xl overflow-hidden mb-3 h-36">
                <img
                  src={group.imageCoach}
                  alt="Coach buses"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            )}
            <div className="inline-flex items-center gap-1.5 bg-[#1a365d]/10 text-[#1a365d] text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-2">
              {group.id === 'electric' && <FiZap size={11} />}
              {group.badge}
            </div>
            <h2 className="text-2xl font-bold text-[#1a365d] mb-2">{group.label}</h2>
            <p className="text-gray-500 text-sm leading-relaxed">{group.tagline}</p>
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#1a365d] hover:underline lg:hidden"
            >
              {expanded ? 'Collapse' : 'Show vehicles'}
              <FiChevronDown size={13} className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className={`flex-1 ${!expanded ? 'hidden lg:block' : ''}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {group.vehicles.map((v) => (
                <VehicleCard key={v.name} vehicle={v} onBook={onBook} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

const Fleet = () => {
  const navigate = useNavigate()

  const handleBook = (bookingValue) => {
    navigate('/signup', { state: { bookingValue } })
  }

  return (
    <div className="bg-white overflow-x-hidden">

      <section className="relative min-h-[65vh] flex items-end bg-[#0f1f3d] overflow-hidden">
        <img
          src="/images/fleet-suv.png"
          alt="Everywhere Cars luxury fleet"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1f3d] via-[#0f1f3d]/60 to-transparent" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6 text-sm font-medium text-blue-100 backdrop-blur-sm">
              <FiZap size={14} className="text-yellow-400" />
              250+ Luxury Vehicles
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-5 tracking-tight text-white">
              Our Complete
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-200">
                Fleet Lineup.
              </span>
            </h1>
            <p className="text-xl text-blue-100 mb-10 max-w-xl leading-relaxed">
              From executive sedans to 55-passenger coach buses — every vehicle in our fleet is meticulously maintained and driven by a professionally trained chauffeur.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/signup')}
                className="inline-flex items-center justify-center gap-2 bg-yellow-400 text-[#1a365d] font-bold py-3.5 px-8 rounded-xl hover:bg-yellow-300 transition-colors text-base shadow-lg"
              >
                Book Your Vehicle <FiArrowRight />
              </button>
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

      <section className="bg-[#1a365d] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {STATS.map((s) => (
              <div key={s.label}>
                <div className="text-4xl font-bold text-yellow-400 mb-1">{s.value}</div>
                <div className="text-blue-200 text-sm font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 overflow-x-auto gap-2">
            {FLEET_GROUPS.map((g) => (
              <a
                key={g.id}
                href={`#${g.id}`}
                className="flex-shrink-0 bg-white border border-gray-200 text-[#1a365d] font-semibold text-sm px-5 py-2 rounded-full hover:bg-[#1a365d] hover:text-white hover:border-[#1a365d] transition-colors"
              >
                {g.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {FLEET_GROUPS.map((group) => (
        <div key={group.id} id={group.id}>
          <GroupSection group={group} onBook={handleBook} />
        </div>
      ))}

      <section className="bg-gray-50 border-t border-gray-100 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-gray-400 max-w-2xl mx-auto">
            Vehicles may vary slightly in color, model year, or trim, but will always match the booked vehicle class.
          </p>
        </div>
      </section>

      <section className="bg-gradient-to-br from-[#0f1f3d] to-[#1a365d] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Ready to Book Your Vehicle?</h2>
          <p className="text-blue-200 mb-8 max-w-lg mx-auto">
            Tell us your trip details and we&rsquo;ll match you with the perfect vehicle and driver. Fixed pricing, no surprises.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/signup')}
              className="inline-flex items-center justify-center gap-2 bg-yellow-400 text-[#1a365d] font-bold py-3.5 px-8 rounded-xl hover:bg-yellow-300 transition-colors text-base shadow-lg"
            >
              Get a Free Quote <FiArrowRight />
            </button>
            <a
              href="tel:+17186586000"
              className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/25 text-white font-semibold py-3.5 px-8 rounded-xl hover:bg-white/20 transition-colors text-base"
            >
              <FiPhone size={16} />
              Call (718) 658-6000
            </a>
          </div>
        </div>
      </section>

      <div className="bg-[#0f1f3d] border-t border-blue-900 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-blue-300">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white">Our Fleet</span>
          </nav>
        </div>
      </div>

    </div>
  )
}

export default Fleet
