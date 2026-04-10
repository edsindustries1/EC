import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../utils/api';
import PlaceAutocomplete from '../components/PlaceAutocomplete';
import {
  FiMapPin,
  FiCalendar,
  FiClock,
  FiUsers,
  FiArrowRight,
  FiCheck,
  FiPhone,
  FiStar,
  FiTruck,
  FiShield,
  FiDollarSign,
  FiHeadphones,
  FiChevronDown,
  FiChevronUp,
  FiUser,
  FiNavigation2,
  FiZap,
  FiGlobe,
  FiAward,
  FiCheckCircle,
  FiBriefcase,
} from 'react-icons/fi';

// Animated counter hook
function useCountUp(target, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let rafId = null;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
    return () => { if (rafId) cancelAnimationFrame(rafId); };
  }, [target, duration, start]);
  return count;
}

// Static data
const FLEET = [
  {
    type: 'Luxury Electric',
    models: 'Cadillac Lyriq · Tesla Model S',
    tagline: 'Zero emissions, maximum prestige',
    passengers: '2–4',
    bags: '2–3',
    features: ['All-Electric Drive', 'Heated Leather Seats', 'Panoramic Roof'],
    bestFor: 'Eco-conscious executives & airport runs',
    image: '/images/fleet-electric.png',
    bookingValue: 'Cadillac Lyriq (2-4 Passengers)',
  },
  {
    type: 'Luxury Sedans',
    models: 'Mercedes S-Class · Lincoln Continental',
    tagline: 'Classic sophistication, every mile',
    passengers: '2–3',
    bags: '2–3',
    features: ['Climate Control', 'Leather Interior', 'USB & Wireless Charging'],
    bestFor: 'Business meetings & airport transfers',
    image: '/images/fleet-sedan.png',
    bookingValue: 'Mercedes S-Class (2-3 Passengers)',
  },
  {
    type: 'SUVs',
    models: 'Cadillac Escalade · GMC Yukon · Lincoln Navigator',
    tagline: 'Premium space for any occasion',
    passengers: '3–5',
    bags: '4–6',
    features: ['Extended Luggage Space', 'Privacy Glass', 'Wi-Fi Hotspot'],
    bestFor: 'Groups, families & corporate travel',
    image: '/images/fleet-suv.png',
    bookingValue: 'Cadillac Escalade (3-5 Passengers)',
  },
  {
    type: 'Sprinter Vans',
    models: 'Mercedes Sprinter · Ford Transit',
    tagline: 'Group luxury, redefined',
    passengers: '11–14',
    bags: '10+',
    features: ['Captain Seating', 'Overhead Storage', 'Climate Zones'],
    bestFor: 'Corporate groups, tours & weddings',
    image: '/images/fleet-sprinter.png',
    bookingValue: 'Mercedes Sprinter Van (11-12 Passengers)',
  },
  {
    type: 'Coach Buses',
    models: 'Temsa TS35 · MCI Coach · Prevost',
    tagline: 'Full charter, full experience',
    passengers: '20–55',
    bags: 'Luggage bay',
    features: ['Restroom On-Board', 'PA System', 'Wi-Fi & Power Outlets'],
    bestFor: 'Large events, conferences & tours',
    image: '/images/fleet-coach.png',
    bookingValue: 'MCI Coach Bus (55 Passengers)',
  },
];

const TESTIMONIALS = [
  {
    name: 'David R.',
    role: 'Finance Executive',
    route: 'JFK → Midtown Manhattan',
    rating: 5,
    text: 'I fly into JFK every Monday. Everywhere Cars has been my go-to for two years. The Escalade is always immaculate, driver is always on time, and billing through the corporate account is seamless.',
  },
  {
    name: 'Sophia M.',
    role: 'Wedding Planner',
    route: 'LGA → Long Island City',
    rating: 5,
    text: 'We used three Sprinter vans for a wedding party transfer from LaGuardia. The coordination was flawless, the vehicles were stunning, and every guest arrived on time and in style.',
  },
  {
    name: 'James & Rachel W.',
    role: 'Anniversary Trip',
    route: 'EWR → Manhattan',
    rating: 5,
    text: 'Flying into Newark, we were exhausted after a transatlantic flight. The chauffeur was waiting in arrivals with our name on a sign. The Lincoln Continental was spotless. Exactly what we needed.',
  },
  {
    name: 'Dr. Kenji M.',
    role: 'Medical Conference Attendee',
    route: 'JFK → Brooklyn',
    rating: 5,
    text: 'After a red-eye from the West Coast the driver was waiting, tracked my delayed flight, and didn\'t charge extra. Quiet, clean sedan, professional driver — exactly what you need after a long flight.',
  },
  {
    name: 'Sandra L.',
    role: 'Event Director',
    route: 'Manhattan → Javits Center',
    rating: 5,
    text: 'Coordinated a 55-passenger coach for our annual conference. Booking was simple, the MCI coach arrived early, and every single delegate commented on how professional the service was.',
  },
  {
    name: 'Antonio R.',
    role: 'Startup Founder',
    route: 'Midtown → FBO Teterboro',
    rating: 5,
    text: 'Last-minute request to get to a private terminal at Teterboro. Called at 7 AM and had a black Cadillac Escalade in front of my office at 8:15. This is what real service looks like.',
  },
];

const GUARANTEES = [
  {
    icon: FiClock,
    title: 'Free 60-Min Airport Wait',
    description: 'Your driver tracks your flight in real time and waits at no extra charge, even if you are delayed.',
  },
  {
    icon: FiDollarSign,
    title: 'No Hidden Fees',
    description: 'The price you see is the price you pay. No surge pricing, no surprise tolls billed later.',
  },
  {
    icon: FiShield,
    title: 'Licensed & Insured Drivers',
    description: 'Every driver passes a full background check, holds a commercial license, and carries full liability coverage.',
  },
  {
    icon: FiHeadphones,
    title: '24 / 7 Live Support',
    description: 'Real humans answer the phone around the clock — before, during, and after every ride.',
  },
];

const FAQS = [
  {
    q: 'How is my price determined?',
    a: 'Your quote is based on the distance, vehicle type, and time of day. Everywhere Cars provides a fixed, all-inclusive price upfront — no meters, no surge pricing.',
  },
  {
    q: 'Can I cancel or change my booking?',
    a: 'Yes. Cancellations made at least 24 hours before pickup are fully refunded. Changes to pickup time or location can be made up to 2 hours in advance at no extra cost.',
  },
  {
    q: 'How do I know my driver is vetted?',
    a: 'All operators on our platform pass a multi-step background check, hold a valid commercial driver\'s license, and maintain a minimum 4.7-star average rating from past customers.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit and debit cards, Apple Pay, Google Pay, and invoicing for approved corporate accounts.',
  },
  {
    q: 'Can I book for a large group or event?',
    a: 'Absolutely. We offer vans, Sprinters, and charter buses for groups of up to 50. Contact us for multi-vehicle event packages and volume discounts.',
  },
  {
    q: 'What if I need a ride on short notice?',
    a: 'We handle same-day bookings when availability allows. For urgent requests call us directly — our dispatch team can often arrange transport within 30–60 minutes.',
  },
];

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  /* Booking form state */
  const [loading, setLoading] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [formData, setFormData] = useState({
    pickup_location: '',
    destination: '',
    date: '',
    time: '',
    passengers: 1,
    vehicle_type: 'Mercedes S-Class (2-3 Passengers)',
    special_instructions: '',
  });

  /* Stats counter */
  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);
  const vehiclesCount = useCountUp(250, 1800, statsVisible);
  const sprintersCount = useCountUp(50, 1400, statsVisible);
  const coachesCount = useCountUp(20, 1200, statsVisible);
  const ratingRaw = useCountUp(49, 1600, statsVisible);

  /* FAQ accordion */
  const [openFaq, setOpenFaq] = useState(null);

  /* Sticky mobile CTA — show after hero scrolls out, hide when site footer is visible */
  const heroRef = useRef(null);
  const [showStickyCta, setShowStickyCta] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);
  useEffect(() => {
    const heroObserver = new IntersectionObserver(
      ([entry]) => setShowStickyCta(!entry.isIntersecting),
      { threshold: 0 }
    );
    if (heroRef.current) heroObserver.observe(heroRef.current);

    const footerObserver = new IntersectionObserver(
      ([entry]) => setFooterVisible(entry.isIntersecting),
      { threshold: 0 }
    );
    const attachFooter = () => {
      const footerEl = document.querySelector('footer');
      if (footerEl) footerObserver.observe(footerEl);
    };
    attachFooter();
    // Retry after paint to handle late layout composition
    const retryId = setTimeout(attachFooter, 200);

    return () => {
      clearTimeout(retryId);
      heroObserver.disconnect();
      footerObserver.disconnect();
    };
  }, []);

  /* Handlers */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceChange = (field) => (value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.pickup_location || !formData.destination || !formData.date || !formData.time) {
      toast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      await api.post('/rides', formData);
      toast.success('Ride request submitted! Check your quotes.');
      navigate('/my-rides');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create ride request');
    } finally {
      setLoading(false);
    }
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const bookVehicle = (bookingValue) => {
    setFormData((prev) => ({ ...prev, vehicle_type: bookingValue }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-white overflow-x-hidden">

      
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center bg-gradient-to-br from-[#0f1f3d] via-[#1a365d] to-[#1a3a6b] overflow-hidden"
      >
        {/* decorative blurs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600 opacity-10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/4" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-800 opacity-15 rounded-full blur-3xl -translate-x-1/4 translate-y-1/4" />
          <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-blue-400 opacity-5 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

            {/* Left — headline */}
            <div className="text-white">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6 text-sm font-medium text-blue-100 backdrop-blur-sm">
                <FiZap size={14} className="text-yellow-400" />
                New York&rsquo;s Premier Luxury Chauffeur Service
              </div>

              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6 tracking-tight">
                We Go
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-200">
                  Everywhere.
                </span>
              </h1>

              <p className="text-lg text-blue-100 mb-8 max-w-md leading-relaxed">
                Premium airport transfers, hourly chauffeur service, corporate travel, and event transportation — JFK, LGA, EWR and beyond. Fixed pricing, no surprises.
              </p>

              {/* Trust signals */}
              <div className="flex flex-wrap items-center gap-6 mb-8">
                <div className="flex items-center gap-1.5">
                  {[1,2,3,4,5].map(i => (
                    <FiStar key={i} className="text-yellow-400 fill-yellow-400" size={16} />
                  ))}
                  <span className="text-sm font-semibold ml-1 text-white">4.9 / 5</span>
                </div>
                <div className="text-blue-300 text-sm">|</div>
                <span className="text-sm text-blue-100">250+ luxury vehicles</span>
                <div className="text-blue-300 text-sm">|</div>
                <span className="text-sm text-blue-100">New York &amp; beyond</span>
              </div>

              {/* Phone CTA */}
              <a
                href="tel:+17186586000"
                className="inline-flex items-center gap-2 text-white/90 hover:text-white text-sm font-medium transition-colors"
              >
                <div className="flex items-center justify-center w-8 h-8 bg-white/15 rounded-full border border-white/20">
                  <FiPhone size={14} />
                </div>
                Need help? Call <span className="font-bold">(718) 658-6000</span>
              </a>
            </div>

            {/* Right — booking form */}
            <div className="bg-white rounded-2xl shadow-2xl p-7 lg:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Get Your Free Quote</h2>
              <p className="text-sm text-gray-500 mb-6">Fill in your trip details and we&rsquo;ll respond within minutes.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="home-pickup" className="label-base">Pickup Location *</label>
                  <PlaceAutocomplete
                    id="home-pickup"
                    name="pickup_location"
                    value={formData.pickup_location}
                    onChange={handlePlaceChange('pickup_location')}
                    placeholder="Enter pickup address or airport"
                    className="input-base pl-9"
                    icon={<FiMapPin size={16} />}
                    required
                    aria-label="Pickup location"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="home-destination" className="label-base">Destination *</label>
                  <PlaceAutocomplete
                    id="home-destination"
                    name="destination"
                    value={formData.destination}
                    onChange={handlePlaceChange('destination')}
                    placeholder="Enter drop-off address"
                    className="input-base pl-9"
                    icon={<FiNavigation2 size={16} />}
                    required
                    aria-label="Destination address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="label-base">Date *</label>
                    <div className="relative">
                      <FiCalendar className="absolute left-3 top-3 text-[#1a365d]" size={16} />
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        className="input-base pl-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="label-base">Time *</label>
                    <div className="relative">
                      <FiClock className="absolute left-3 top-3 text-[#1a365d]" size={16} />
                      <input
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleInputChange}
                        className="input-base pl-9"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="label-base">Passengers *</label>
                    <div className="relative">
                      <FiUsers className="absolute left-3 top-3 text-[#1a365d]" size={16} />
                      <input
                        type="number"
                        name="passengers"
                        min="1"
                        max="50"
                        value={formData.passengers}
                        onChange={handleInputChange}
                        className="input-base pl-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="label-base">Vehicle Type *</label>
                    <select
                      name="vehicle_type"
                      value={formData.vehicle_type}
                      onChange={handleInputChange}
                      className="input-base"
                      aria-label="Vehicle type"
                    >
                      <optgroup label="Luxury Electric">
                        <option>Cadillac Lyriq (2-4 Passengers)</option>
                        <option>Tesla Model S (2-3 Passengers)</option>
                      </optgroup>
                      <optgroup label="Luxury Sedans">
                        <option>Mercedes S-Class (2-3 Passengers)</option>
                        <option>Lincoln Continental (2-3 Passengers)</option>
                        <option>Dodge Charger (2-3 Passengers)</option>
                        <option>Toyota Camry (2-3 Passengers)</option>
                        <option>Honda Accord (2-3 Passengers)</option>
                        <option>Ford Fusion (2-3 Passengers)</option>
                      </optgroup>
                      <optgroup label="SUVs">
                        <option>Cadillac Escalade (3-5 Passengers)</option>
                        <option>GMC Yukon (3-5 Passengers)</option>
                        <option>Lincoln Navigator (3-5 Passengers)</option>
                        <option>Chevy Suburban (3-5 Passengers)</option>
                        <option>Toyota Highlander (3-5 Passengers)</option>
                        <option>Nissan Pathfinder (3-5 Passengers)</option>
                        <option>Ford Explorer (3-5 Passengers)</option>
                      </optgroup>
                      <optgroup label="Vans">
                        <option>Mercedes Sprinter Van (11-12 Passengers)</option>
                        <option>Ford Transit Van (11-12 Passengers)</option>
                      </optgroup>
                      <optgroup label="Buses">
                        <option>Ford F550 Mini Bus (20 Passengers)</option>
                        <option>Temsa TS35 Coach Bus (40 Passengers)</option>
                        <option>MCI Coach Bus (55 Passengers)</option>
                        <option>Prevost Coach Bus (55 Passengers)</option>
                      </optgroup>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowNotes(!showNotes)}
                  className="text-sm text-[#1a365d] font-semibold hover:underline flex items-center gap-1"
                >
                  {showNotes ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                  Add Special Instructions
                </button>

                {showNotes && (
                  <textarea
                    name="special_instructions"
                    value={formData.special_instructions}
                    onChange={handleInputChange}
                    placeholder="Flight number, meet-and-greet preference, child seats…"
                    className="input-base resize-none"
                    rows="3"
                  />
                )}

                {user ? (
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#1a365d] text-white font-bold py-3.5 rounded-xl hover:bg-[#0f1f3d] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-base shadow-lg"
                  >
                    {loading ? 'Submitting…' : (
                      <>Request a Quote <FiArrowRight /></>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate('/signup')}
                    className="w-full bg-[#1a365d] text-white font-bold py-3.5 rounded-xl hover:bg-[#0f1f3d] transition-all duration-200 flex items-center justify-center gap-2 text-base shadow-lg"
                  >
                    Sign Up &amp; Get a Quote <FiArrowRight />
                  </button>
                )}

                <p className="text-center text-xs text-gray-400">
                  Free to post. No payment required until you confirm a driver.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      
      <section ref={statsRef} className="bg-white border-b border-gray-100 py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: vehiclesCount, suffix: '+', label: 'Luxury Vehicles', icon: FiTruck },
              { value: sprintersCount, suffix: '+', label: 'Sprinter Vans', icon: FiGlobe },
              { value: coachesCount, suffix: '+', label: 'Coach Buses', icon: FiUser },
              { value: (ratingRaw / 10).toFixed(1), suffix: '★', label: 'Average Rating', icon: FiStar },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-50 mb-3">
                  <stat.icon className="text-[#1a365d]" size={18} />
                </div>
                <div className="text-3xl font-bold text-[#1a365d]">
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}{stat.suffix}
                </div>
                <div className="text-sm text-gray-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold uppercase tracking-widest text-[#1a365d] mb-2 block">Simple &amp; Fast</span>
            <h2 className="text-4xl font-bold text-gray-900">How It Works</h2>
          </div>

          <div className="flex flex-col md:flex-row items-stretch gap-0">
            {[
              {
                step: '01',
                icon: FiMapPin,
                title: 'Post Your Trip',
                description: 'Enter your pickup, destination, date, and passenger count — it takes less than 60 seconds.',
              },
              {
                step: '02',
                icon: FiCheckCircle,
                title: 'Receive Quotes',
                description: 'Our verified drivers review your request and send competitive, all-inclusive fixed prices.',
              },
              {
                step: '03',
                icon: FiAward,
                title: 'Ride in Comfort',
                description: 'Choose your preferred driver, confirm, pay securely, and enjoy a premium experience.',
              },
            ].map((item, idx, arr) => (
              <React.Fragment key={item.step}>
                <div className="relative bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 p-8 text-center group flex-1">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#1a365d] text-white text-xs font-bold px-3 py-1 rounded-full tracking-wider">
                    STEP {item.step}
                  </div>
                  <div className="flex items-center justify-center w-16 h-16 bg-primary-50 rounded-2xl mx-auto mb-5 mt-2 group-hover:bg-[#1a365d] transition-colors duration-300">
                    <item.icon className="text-[#1a365d] group-hover:text-white transition-colors duration-300" size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-500 leading-relaxed text-sm">{item.description}</p>
                </div>
                {idx < arr.length - 1 && (
                  <div className="hidden md:flex items-center justify-center px-2 flex-shrink-0 text-[#1a365d] opacity-40">
                    <FiArrowRight size={28} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      
      <section className="bg-[#0f1f3d] py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold uppercase tracking-widest text-blue-300 mb-2 block">What We Offer</span>
            <h2 className="text-4xl font-bold text-white">Our Services</h2>
            <p className="text-blue-200 text-base mt-3 max-w-xl mx-auto">From a single airport run to a full corporate travel program — we cover every need with professionalism.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {[
              {
                icon: FiNavigation2,
                title: 'Airport Transfers',
                description: 'JFK, LGA, EWR and FBO terminals. Flight tracking, free 60-min wait, meet-and-greet included.',
              },
              {
                icon: FiClock,
                title: 'Hourly Chauffeur',
                description: 'Book by the hour for meetings, events, or city tours. Your chauffeur stays with you all day.',
              },
              {
                icon: FiAward,
                title: 'Event Transportation',
                description: 'Weddings, galas, concerts, sporting events — sedans, SUVs, Sprinters, and coach buses.',
              },
              {
                icon: FiBriefcase,
                title: 'Corporate Travel',
                description: 'Dedicated account managers, monthly invoicing, and fleet booking for executive teams.',
              },
              {
                icon: FiArrowRight,
                title: 'Point-to-Point',
                description: 'Door-to-door between any two addresses — fixed price, no meters, no surge.',
              },
            ].map((s) => (
              <div
                key={s.title}
                className="bg-white/10 border border-white/15 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 flex flex-col gap-3"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-white/15 rounded-xl">
                  <s.icon className="text-blue-200" size={22} />
                </div>
                <h3 className="text-white font-bold text-base">{s.title}</h3>
                <p className="text-blue-200 text-sm leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold uppercase tracking-widest text-[#1a365d] mb-2 block">250+ Luxury Vehicles</span>
            <h2 className="text-4xl font-bold text-gray-900">Choose Your Ride</h2>
            <p className="text-gray-500 text-base mt-3 max-w-xl mx-auto">4 vehicle groups, 20+ models, from executive sedans to 55-passenger coaches.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {FLEET.map((v) => (
              <div
                key={v.type}
                className="group border border-gray-100 rounded-2xl overflow-hidden hover:border-[#1a365d] hover:shadow-card-hover transition-all duration-300 flex flex-col"
              >
                <div className="relative h-40 overflow-hidden bg-gray-100">
                  <img
                    src={v.image}
                    alt={v.type}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <span className="text-white font-bold text-sm leading-tight drop-shadow">{v.type}</span>
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <p className="text-xs text-gray-500 italic mb-1">{v.tagline}</p>
                  <p className="text-xs text-[#1a365d] font-semibold mb-0.5">{v.passengers} pax &middot; {v.bags} bags</p>
                  <p className="text-xs text-gray-400 mb-3">{v.models}</p>
                  <ul className="space-y-1.5 mb-4 flex-grow">
                    {v.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-gray-600">
                        <FiCheck className="text-green-500 flex-shrink-0" size={12} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => bookVehicle(v.bookingValue)}
                    className="mt-auto w-full text-center text-sm font-semibold text-[#1a365d] border border-[#1a365d] rounded-lg py-2 hover:bg-[#1a365d] hover:text-white transition-all duration-200"
                  >
                    Book This Vehicle
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              to="/fleet"
              className="inline-flex items-center gap-2 bg-[#1a365d] text-white font-bold py-3.5 px-8 rounded-xl hover:bg-[#0f1f3d] transition-colors text-base shadow"
            >
              View Full Fleet <FiArrowRight size={16} />
            </Link>
            <p className="text-xs text-gray-400 mt-3">250+ vehicles across 4 categories — sedans, SUVs, vans, and coach buses</p>
          </div>
        </div>
      </section>

      
      <section className="bg-gradient-to-br from-[#0f1f3d] to-[#1a365d] py-24 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold uppercase tracking-widest text-blue-300 mb-2 block">Our Promise</span>
            <h2 className="text-4xl font-bold">Why Customers Trust Us</h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {GUARANTEES.map((g) => (
              <div
                key={g.title}
                className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-7 hover:bg-white/15 transition-all duration-300"
              >
                <div className="flex items-center justify-center w-14 h-14 bg-white/15 rounded-2xl mb-5">
                  <g.icon size={26} className="text-blue-200" />
                </div>
                <h3 className="text-lg font-bold mb-2">{g.title}</h3>
                <p className="text-blue-100 text-sm leading-relaxed">{g.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold uppercase tracking-widest text-[#1a365d] mb-2 block">Real Riders</span>
            <h2 className="text-4xl font-bold text-gray-900">What Our Customers Say</h2>
          </div>

          <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
            <div className="flex gap-5" style={{ width: 'max-content' }}>
              {TESTIMONIALS.map((t, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl shadow-card p-7 w-80 flex-shrink-0 hover:shadow-card-hover transition-all duration-300 flex flex-col"
                >
                  <div className="flex items-center gap-0.5 mb-4">
                    {[1,2,3,4,5].map(s => (
                      <FiStar
                        key={s}
                        size={14}
                        className={s <= t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-5 flex-grow">&ldquo;{t.text}&rdquo;</p>
                  <div className="border-t border-gray-100 pt-4">
                    <div className="font-bold text-gray-900 text-sm">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.role}</div>
                    <div className="text-xs text-[#1a365d] mt-1 flex items-center gap-1">
                      <FiMapPin size={10} />
                      {t.route}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      
      <section className="bg-white py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold uppercase tracking-widest text-[#1a365d] mb-2 block">Got Questions?</span>
            <h2 className="text-4xl font-bold text-gray-900">Frequently Asked</h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
                  openFaq === i
                    ? 'border-[#1a365d] shadow-card'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <button
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-semibold text-gray-900 text-sm">{faq.q}</span>
                  {openFaq === i
                    ? <FiChevronUp className="text-[#1a365d] flex-shrink-0" size={18} />
                    : <FiChevronDown className="text-gray-400 flex-shrink-0" size={18} />
                  }
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      
      <section className="bg-gradient-to-r from-[#1a365d] to-[#2d5a8c] py-24">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <div className="inline-flex items-center gap-2 bg-yellow-400 text-[#1a365d] rounded-full px-4 py-1.5 text-sm font-bold mb-8">
            <FiAward size={14} />
            Limited-Time Offer
          </div>
          <h2 className="text-4xl font-bold mb-4">Get 10% Off Your First Ride</h2>
          <p className="text-blue-100 text-lg mb-10 max-w-md mx-auto leading-relaxed">
            Create a free account today and unlock an exclusive discount on your first booking — no credit card required to sign up.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/signup')}
              className="inline-flex items-center justify-center gap-2 bg-yellow-400 text-[#1a365d] font-bold py-4 px-10 rounded-xl hover:bg-yellow-300 transition-all duration-200 text-base shadow-xl"
            >
              Create Free Account <FiArrowRight />
            </button>
            <a
              href="tel:+17186586000"
              className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/30 text-white font-semibold py-4 px-8 rounded-xl hover:bg-white/20 transition-all duration-200 text-base"
            >
              <FiPhone size={16} />
              Call (718) 658-6000
            </a>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-blue-200">
            <div className="flex items-center gap-1.5"><FiCheckCircle size={14} className="text-green-400" /> No credit card</div>
            <div className="flex items-center gap-1.5"><FiCheckCircle size={14} className="text-green-400" /> Cancel anytime</div>
            <div className="flex items-center gap-1.5"><FiCheckCircle size={14} className="text-green-400" /> Free to post</div>
          </div>
        </div>
      </section>

      {/* Sticky mobile CTA */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 md:hidden transition-all duration-300 ${
          showStickyCta && !footerVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      >
        <div className="bg-[#1a365d] border-t border-blue-800 px-4 py-3 flex items-center gap-3 shadow-2xl">
          <button
            onClick={scrollToTop}
            className="flex-grow bg-yellow-400 text-[#1a365d] font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm"
          >
            Get a Free Quote <FiArrowRight size={16} />
          </button>
          <a
            href="tel:+17186586000"
            className="flex items-center justify-center w-12 h-12 bg-white/10 border border-white/20 rounded-xl text-white"
            aria-label="Call (718) 658-6000"
          >
            <FiPhone size={18} />
          </a>
        </div>
      </div>

    </div>
  );
};

export default Home;
