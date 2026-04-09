import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../utils/api';
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
  FiCreditCard,
  FiCheckCircle,
} from 'react-icons/fi';

/* ─── Animated counter hook ─────────────────────────────────────────── */
function useCountUp(target, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

/* ─── Data ───────────────────────────────────────────────────────────── */
const FLEET = [
  {
    type: 'Sedan',
    tagline: 'Classic comfort for professionals',
    passengers: '1–3',
    features: ['Climate Control', 'Leather Seats', 'USB Charging'],
    bestFor: 'Airport runs & business meetings',
  },
  {
    type: 'SUV',
    tagline: 'Premium space for executives',
    passengers: '1–5',
    features: ['Extra Luggage Room', 'Wi-Fi Hotspot', 'Privacy Glass'],
    bestFor: 'Corporate travel & family trips',
  },
  {
    type: 'Van',
    tagline: 'Together is better',
    passengers: '6–10',
    features: ['Row Seating', 'Climate Control', 'Rear Entertainment'],
    bestFor: 'Family outings & team travel',
  },
  {
    type: 'Sprinter',
    tagline: 'Modern group luxury',
    passengers: '10–14',
    features: ['Reclining Seats', 'Overhead Storage', 'PA System'],
    bestFor: 'Tours, weddings & events',
  },
  {
    type: 'Charter Bus',
    tagline: 'The full charter experience',
    passengers: '15–50',
    features: ['Restroom On-Board', 'Luggage Bay', 'Wi-Fi & Power'],
    bestFor: 'Corporate events & large groups',
  },
];

const TESTIMONIALS = [
  {
    name: 'Marcus T.',
    route: 'LAX → Beverly Hills',
    rating: 5,
    text: 'Absolutely seamless experience. Driver was on time, the Sprinter was spotless, and the whole team handled a last-minute schedule change without blinking.',
  },
  {
    name: 'Priya S.',
    route: 'JFK → Midtown Manhattan',
    rating: 5,
    text: 'I use Everywhere Cars for every business trip. Fixed pricing, no surge surprises, and the drivers are always professional. Highly recommend for corporate travelers.',
  },
  {
    name: 'James & Rachel W.',
    route: 'Chicago O\'Hare → Downtown',
    rating: 5,
    text: 'Booked an SUV for our anniversary trip. The driver had a welcome card waiting for us. Such a thoughtful touch — exceeded every expectation.',
  },
  {
    name: 'Dr. Kenji M.',
    route: 'Miami → Fort Lauderdale',
    rating: 5,
    text: 'After my 11 PM flight the driver was already waiting in arrivals. No hunting for an app pickup pin. Just walked straight to a clean, quiet sedan.',
  },
  {
    name: 'Sandra L.',
    route: 'Dallas → Arlington',
    rating: 5,
    text: 'Used the charter bus for our company off-site. The whole booking process was quick and the bus was amazing. Will be our go-to vendor from now on.',
  },
  {
    name: 'Antonio R.',
    route: 'DFW → Irving',
    rating: 5,
    text: 'Called at the last minute for a same-day airport run. They found me a driver in under 20 minutes. Incredible service — this is what reliability looks like.',
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

/* ─── Component ──────────────────────────────────────────────────────── */
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
    vehicle_type: 'Sedan',
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
  const ridesCount = useCountUp(10000, 1800, statsVisible);
  const citiesCount = useCountUp(100, 1400, statsVisible);
  const driversCount = useCountUp(450, 1600, statsVisible);

  /* FAQ accordion */
  const [openFaq, setOpenFaq] = useState(null);

  /* Sticky mobile CTA */
  const heroRef = useRef(null);
  const footerRef = useRef(null);
  const [showStickyCta, setShowStickyCta] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const heroBottom = heroRef.current.getBoundingClientRect().bottom;
      setShowStickyCta(heroBottom < 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* Handlers */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  /* ── RENDER ─────────────────────────────────────────────────────────── */
  return (
    <div className="bg-white overflow-x-hidden">

      {/* ════════ HERO ════════ */}
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
                Premium Transportation Across the USA
              </div>

              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6 tracking-tight">
                Your Ride,
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-200">
                  Your Price.
                </span>
              </h1>

              <p className="text-lg text-blue-100 mb-8 max-w-md leading-relaxed">
                Post your trip once and receive competitive quotes from verified professional drivers — no haggling, no hidden fees.
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
                <span className="text-sm text-blue-100">10,000+ rides completed</span>
                <div className="text-blue-300 text-sm">|</div>
                <span className="text-sm text-blue-100">100+ US cities</span>
              </div>

              {/* Phone CTA */}
              <a
                href="tel:+18005551234"
                className="inline-flex items-center gap-2 text-white/90 hover:text-white text-sm font-medium transition-colors"
              >
                <div className="flex items-center justify-center w-8 h-8 bg-white/15 rounded-full border border-white/20">
                  <FiPhone size={14} />
                </div>
                Need help? Call <span className="font-bold">(800) 555-1234</span>
              </a>
            </div>

            {/* Right — booking form */}
            <div className="bg-white rounded-2xl shadow-2xl p-7 lg:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Get Your Free Quote</h2>
              <p className="text-sm text-gray-500 mb-6">Fill in your trip details and we&rsquo;ll respond within minutes.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="label-base">Pickup Location *</label>
                  <div className="relative">
                    <FiMapPin className="absolute left-3 top-3 text-[#1a365d]" size={16} />
                    <input
                      type="text"
                      name="pickup_location"
                      value={formData.pickup_location}
                      onChange={handleInputChange}
                      placeholder="Enter pickup address or airport"
                      className="input-base pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="label-base">Destination *</label>
                  <div className="relative">
                    <FiNavigation2 className="absolute left-3 top-3 text-[#1a365d]" size={16} />
                    <input
                      type="text"
                      name="destination"
                      value={formData.destination}
                      onChange={handleInputChange}
                      placeholder="Enter drop-off address"
                      className="input-base pl-9"
                    />
                  </div>
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
                    >
                      <option>Sedan</option>
                      <option>SUV</option>
                      <option>Van</option>
                      <option>Sprinter</option>
                      <option>Bus</option>
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

      {/* ════════ STATS BAR ════════ */}
      <section ref={statsRef} className="bg-white border-b border-gray-100 py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: ridesCount, suffix: '+', label: 'Rides Completed', icon: FiTruck },
              { value: citiesCount, suffix: '+', label: 'Cities Served', icon: FiGlobe },
              { value: driversCount, suffix: '+', label: 'Verified Drivers', icon: FiUser },
              { value: '4.9', suffix: '★', label: 'Average Rating', icon: FiStar, static: true },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-50 mb-3">
                  <stat.icon className="text-[#1a365d]" size={18} />
                </div>
                <div className="text-3xl font-bold text-[#1a365d]">
                  {stat.static ? stat.value : stat.value.toLocaleString()}{stat.suffix}
                </div>
                <div className="text-sm text-gray-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ HOW IT WORKS ════════ */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold uppercase tracking-widest text-[#1a365d] mb-2 block">Simple &amp; Fast</span>
            <h2 className="text-4xl font-bold text-gray-900">How It Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-14 left-[calc(16.66%+2rem)] right-[calc(16.66%+2rem)] h-0.5 bg-gradient-to-r from-[#1a365d] via-blue-300 to-[#1a365d] opacity-20" />

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
            ].map((item) => (
              <div
                key={item.step}
                className="relative bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 p-8 text-center group"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#1a365d] text-white text-xs font-bold px-3 py-1 rounded-full tracking-wider">
                  STEP {item.step}
                </div>
                <div className="flex items-center justify-center w-16 h-16 bg-primary-50 rounded-2xl mx-auto mb-5 mt-2 group-hover:bg-[#1a365d] transition-colors duration-300">
                  <item.icon className="text-[#1a365d] group-hover:text-white transition-colors duration-300" size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ FLEET SHOWCASE ════════ */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold uppercase tracking-widest text-[#1a365d] mb-2 block">450+ Vehicles</span>
            <h2 className="text-4xl font-bold text-gray-900">Choose Your Vehicle</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {FLEET.map((v) => (
              <div
                key={v.type}
                className="group border border-gray-100 rounded-2xl p-6 hover:border-[#1a365d] hover:shadow-card-hover transition-all duration-300 flex flex-col"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-primary-50 rounded-xl mb-4 group-hover:bg-[#1a365d] transition-colors duration-300">
                  <FiTruck className="text-[#1a365d] group-hover:text-white transition-colors duration-300" size={22} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{v.type}</h3>
                <p className="text-xs text-[#1a365d] font-semibold mb-1">{v.passengers} passengers</p>
                <p className="text-xs text-gray-500 italic mb-4">{v.tagline}</p>
                <ul className="space-y-1.5 mb-5 flex-grow">
                  {v.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-gray-600">
                      <FiCheck className="text-green-500 flex-shrink-0" size={12} />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={scrollToTop}
                  className="mt-auto w-full text-center text-sm font-semibold text-[#1a365d] border border-[#1a365d] rounded-lg py-2 hover:bg-[#1a365d] hover:text-white transition-all duration-200"
                >
                  Book This Vehicle
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ TRUST & GUARANTEES ════════ */}
      <section className="bg-gradient-to-br from-[#0f1f3d] to-[#1a365d] py-24 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold uppercase tracking-widest text-blue-300 mb-2 block">Our Promise</span>
            <h2 className="text-4xl font-bold">Why Customers Trust Us</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* ════════ TESTIMONIALS ════════ */}
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
                    <div className="text-xs text-[#1a365d] mt-0.5 flex items-center gap-1">
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

      {/* ════════ FAQ ════════ */}
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

      {/* ════════ LEAD CAPTURE ════════ */}
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
              href="tel:+18005551234"
              className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/30 text-white font-semibold py-4 px-8 rounded-xl hover:bg-white/20 transition-all duration-200 text-base"
            >
              <FiPhone size={16} />
              Call Us Instead
            </a>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-blue-200">
            <div className="flex items-center gap-1.5"><FiCheckCircle size={14} className="text-green-400" /> No credit card</div>
            <div className="flex items-center gap-1.5"><FiCheckCircle size={14} className="text-green-400" /> Cancel anytime</div>
            <div className="flex items-center gap-1.5"><FiCheckCircle size={14} className="text-green-400" /> Free to post</div>
          </div>
        </div>
      </section>

      {/* ════════ STICKY MOBILE CTA ════════ */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 md:hidden transition-all duration-300 ${
          showStickyCta ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      >
        <div className="bg-[#1a365d] border-t border-blue-800 px-4 py-3 flex items-center gap-3 shadow-2xl">
          <button
            onClick={scrollToTop}
            className="flex-grow bg-yellow-400 text-[#1a365d] font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm"
          >
            Book a Ride <FiArrowRight size={16} />
          </button>
          <a
            href="tel:+18005551234"
            className="flex items-center justify-center w-12 h-12 bg-white/10 border border-white/20 rounded-xl text-white"
          >
            <FiPhone size={18} />
          </a>
        </div>
      </div>

    </div>
  );
};

export default Home;
