import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  FiBriefcase,
  FiArrowRight,
  FiPhone,
  FiUser,
  FiDollarSign,
  FiClock,
  FiShield,
  FiBarChart2,
  FiTruck,
  FiCheck,
  FiCheckCircle,
  FiStar,
  FiCalendar,
  FiMail,
} from 'react-icons/fi'

const BENEFITS = [
  {
    icon: FiBarChart2,
    title: 'Elevated Professional Image',
    description: 'Arrive at every meeting, boardroom, or client event in a luxury vehicle driven by a professionally trained chauffeur. First impressions matter — we make them count.',
  },
  {
    icon: FiClock,
    title: 'Optimized Time & Productivity',
    description: 'Turn travel time into work time. Rear-seat Wi-Fi, charging ports, and a quiet cabin let executives prepare for meetings, review documents, or take calls in comfort.',
  },
  {
    icon: FiUser,
    title: 'Dedicated Travel Support',
    description: 'Your assigned account manager handles every booking, change, and special request. No call queues, no ticket systems — one point of contact for your entire travel program.',
  },
  {
    icon: FiShield,
    title: 'Privacy & Executive Comfort',
    description: 'Tinted windows, professional discretion, and a no-conversation-unless-requested policy. Your executives travel in confidence — whether discussing strategy or unwinding between commitments.',
  },
  {
    icon: FiTruck,
    title: 'Safety You Can Trust',
    description: 'Every Everywhere Cars driver passes a full background check, holds a commercial license, and undergoes continuous safety training. Your team travels only with vetted professionals.',
  },
  {
    icon: FiDollarSign,
    title: 'Centralized Billing & Fixed Rates',
    description: 'Monthly consolidated invoices with itemized trip reports. Fixed pricing across every ride — no surge, no surprise fuel surcharges, no hidden fees.',
  },
]

const FLEET = [
  {
    type: 'Mercedes S-Class / Lincoln Continental',
    capacity: '2–3 passengers',
    image: '/images/fleet-sedan.png',
    features: ['Leather interior', 'Climate control', 'USB & wireless charging'],
    ideal: 'Solo executive transfers, airport pickups',
  },
  {
    type: 'Cadillac Escalade / GMC Yukon',
    capacity: '3–5 passengers',
    image: '/images/fleet-suv.png',
    features: ['Extended luggage room', 'Wi-Fi hotspot', 'Privacy glass'],
    ideal: 'Executive teams, roadshows, site visits',
  },
  {
    type: 'Mercedes Sprinter Van',
    capacity: '11–14 passengers',
    image: '/images/fleet-sprinter.png',
    features: ['Reclining seats', 'Overhead storage', 'Climate zones'],
    ideal: 'Team offsites, conference shuttles',
  },
]

const STEPS = [
  {
    number: '01',
    title: 'Set Up Your Account',
    description: 'Contact our sales team to create your corporate account with billing details, approved bookers, and spend limits.',
  },
  {
    number: '02',
    title: 'Add Team Members',
    description: 'Invite employees as authorized riders or bookers. Admins can view and manage all bookings in one dashboard.',
  },
  {
    number: '03',
    title: 'Book & Track All Rides',
    description: 'Team members book rides directly. You get real-time tracking, automated trip reports, and a single monthly invoice.',
  },
]

const CLIENTS = [
  { name: 'Apex Consulting', initials: 'AC', color: 'bg-blue-600' },
  { name: 'Meridian Partners', initials: 'MP', color: 'bg-indigo-600' },
  { name: 'Vantage Group', initials: 'VG', color: 'bg-slate-600' },
  { name: 'Pinnacle Capital', initials: 'PC', color: 'bg-blue-800' },
  { name: 'Horizon Tech', initials: 'HT', color: 'bg-sky-700' },
]

const MONTHLY_VOLUMES = [
  '1–5 rides',
  '6–15 rides',
  '16–30 rides',
  '31–60 rides',
  '61–100 rides',
  '100+ rides',
]

const Corporate = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    volume: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name || !form.company || !form.email || !form.volume) {
      toast.error('Please fill in all required fields')
      return
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRe.test(form.email)) {
      toast.error('Please enter a valid email address')
      return
    }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
      toast.success('Thanks! Our sales team will reach out within 1 business day.')
    }, 800)
  }

  return (
    <div className="bg-white overflow-x-hidden">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative min-h-[80vh] flex items-center bg-gradient-to-br from-[#0f1f3d] via-[#1a365d] to-[#1a3a6b] overflow-hidden">
        <img
          src="/images/service-corporate.png"
          alt="Corporate travel — executive arriving in luxury vehicle"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-blue-600 opacity-10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/4" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-800 opacity-15 rounded-full blur-3xl -translate-x-1/4 translate-y-1/4" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6 text-sm font-medium text-blue-100 backdrop-blur-sm">
              <FiBriefcase size={14} className="text-yellow-400" />
              Corporate &amp; Business Travel
            </div>

            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6 tracking-tight text-white">
              Business Travel,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-200">
                Simplified.
              </span>
            </h1>

            <p className="text-xl text-blue-100 mb-10 max-w-xl leading-relaxed">
              Dedicated account management, centralized invoicing, and a premium fleet — built for companies that move fast and can't afford surprises.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#contact-sales"
                className="inline-flex items-center justify-center gap-2 bg-yellow-400 text-[#1a365d] font-bold py-3.5 px-8 rounded-xl hover:bg-yellow-300 transition-colors text-base shadow-lg"
              >
                Contact Sales <FiArrowRight />
              </a>
              <a
                href="tel:+17186586000"
                className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/25 text-white font-semibold py-3.5 px-8 rounded-xl hover:bg-white/20 transition-colors text-base"
              >
                <FiPhone size={16} />
                (718) 658-6000
              </a>
            </div>

            <div className="flex flex-wrap gap-6 mt-10">
              {['Fortune 500 trusted', 'Net-30 invoicing', 'No contracts required'].map((item) => (
                <div key={item} className="flex items-center gap-2 text-blue-100 text-sm">
                  <FiCheckCircle size={15} className="text-yellow-400" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Why Corporate ────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest text-yellow-500 mb-3">Why Corporate?</p>
            <h2 className="text-4xl font-bold text-[#1a365d] mb-4">Built for Business, Not Leisure</h2>
            <p className="text-gray-500 max-w-xl mx-auto text-lg">
              Everything a travel manager or executive needs — with none of the friction you're used to.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                className="bg-gray-50 rounded-2xl p-7 border border-gray-100 hover:border-blue-100 hover:shadow-md transition-all"
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

      {/* ── Fleet ────────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest text-yellow-500 mb-3">Corporate Fleet</p>
            <h2 className="text-4xl font-bold text-[#1a365d] mb-4">Vehicles Your Clients Will Notice</h2>
            <p className="text-gray-500 max-w-xl mx-auto text-lg">
              From solo airport pickups to full conference shuttles — choose the right vehicle for every occasion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FLEET.map((v) => (
              <div
                key={v.type}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
              >
                <div className="h-48 overflow-hidden">
                  <img src={v.image} alt={v.type} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-lg font-bold text-[#1a365d]">{v.type}</h3>
                    <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 rounded-full">
                      {v.capacity}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-4 font-medium">{v.ideal}</p>
                  <ul className="space-y-1.5 mb-5">
                    {v.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                        <FiCheck size={13} className="text-[#1a365d] flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => navigate('/signup')}
                    className="w-full text-center text-sm font-semibold text-[#1a365d] border border-[#1a365d] rounded-xl py-2.5 hover:bg-[#1a365d] hover:text-white transition-all"
                  >
                    Get a Quote
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works for Teams ───────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest text-yellow-500 mb-3">Onboarding</p>
            <h2 className="text-4xl font-bold text-[#1a365d] mb-4">How It Works for Teams</h2>
            <p className="text-gray-500 max-w-xl mx-auto text-lg">
              Up and running in one business day. No complex integrations, no IT tickets.
            </p>
          </div>

          <div className="relative">
            {/* Connector line — desktop only */}
            <div className="hidden lg:block absolute top-8 left-[calc(16.67%+1.5rem)] right-[calc(16.67%+1.5rem)] h-0.5 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {STEPS.map((step, i) => (
                <div key={step.number} className="relative flex flex-col items-center text-center">
                  <div className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full bg-[#1a365d] text-white font-bold text-xl mb-6 shadow-lg">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-bold text-[#1a365d] mb-3">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed max-w-xs">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Client Trust ─────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-[#0f1f3d] via-[#1a365d] to-[#1a3a6b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-yellow-400 mb-3">Trusted By</p>
            <h2 className="text-3xl font-bold text-white mb-4">Companies That Move With Us</h2>
          </div>

          {/* Client logo placeholders */}
          <div className="flex flex-wrap justify-center gap-5 mb-16">
            {CLIENTS.map((c) => (
              <div
                key={c.name}
                className="flex items-center gap-3 bg-white/10 border border-white/15 backdrop-blur-sm rounded-2xl px-6 py-4"
              >
                <div className={`w-10 h-10 ${c.color} rounded-lg flex items-center justify-center text-white font-bold text-sm`}>
                  {c.initials}
                </div>
                <span className="text-white font-semibold text-sm">{c.name}</span>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="max-w-2xl mx-auto bg-white/10 border border-white/15 backdrop-blur-sm rounded-2xl p-8 text-center">
            <div className="flex justify-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <FiStar key={i} size={18} className="text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <blockquote className="text-blue-100 text-lg leading-relaxed mb-6 italic">
              "Since switching to Everywhere Cars we've cut our travel admin time by 60%. Our account manager handles everything — invoices, driver requests, last-minute changes. It's the first vendor that actually makes our lives easier."
            </blockquote>
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                JT
              </div>
              <div className="text-left">
                <p className="text-white font-semibold text-sm">Jessica T.</p>
                <p className="text-blue-300 text-xs">Head of Operations, Apex Consulting</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Lead Capture Form ─────────────────────────────────── */}
      <section id="contact-sales" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">

            {/* Left — value prop */}
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-yellow-500 mb-3">Contact Sales</p>
              <h2 className="text-4xl font-bold text-[#1a365d] mb-5">Let's Talk About Your Travel Needs</h2>
              <p className="text-gray-500 text-lg mb-8 leading-relaxed">
                Tell us a little about your company and volume. Our sales team will reach out within one business day with a custom pricing proposal.
              </p>

              <ul className="space-y-4 mb-10">
                {[
                  'No setup fees or contracts',
                  'Custom rates for high-volume accounts',
                  'Dedicated account manager assigned on day one',
                  'Invoicing in 5 business days',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-gray-700 text-sm">
                    <FiCheckCircle size={18} className="text-[#1a365d] mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <a
                href="tel:+17186586000"
                className="inline-flex items-center gap-2 text-[#1a365d] font-semibold text-sm hover:underline"
              >
                <FiPhone size={15} />
                Prefer to call? (718) 658-6000
              </a>
            </div>

            {/* Right — form */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              {submitted ? (
                <div className="flex flex-col items-center text-center py-8">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-5">
                    <FiCheckCircle size={32} className="text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#1a365d] mb-3">Request Received!</h3>
                  <p className="text-gray-500 mb-6 leading-relaxed">
                    Thank you, <strong>{form.name}</strong>. Our sales team will reach out to <strong>{form.email}</strong> within 1 business day.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: '', company: '', email: '', phone: '', volume: '' }) }}
                    className="text-sm text-[#1a365d] font-semibold hover:underline"
                  >
                    Submit another inquiry
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-[#1a365d] mb-1">Get a Corporate Proposal</h3>
                  <p className="text-sm text-gray-400 mb-6">We respond within 1 business day.</p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-sm font-semibold text-gray-700">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <FiUser className="absolute left-3 top-3 text-gray-400" size={15} />
                          <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Jane Smith"
                            aria-label="Full name"
                            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a365d]/30 focus:border-[#1a365d] transition-colors"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-sm font-semibold text-gray-700">
                          Company <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <FiBriefcase className="absolute left-3 top-3 text-gray-400" size={15} />
                          <input
                            type="text"
                            name="company"
                            value={form.company}
                            onChange={handleChange}
                            placeholder="Acme Corp"
                            aria-label="Company name"
                            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a365d]/30 focus:border-[#1a365d] transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-semibold text-gray-700">
                        Work Email <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FiMail className="absolute left-3 top-3 text-gray-400" size={15} />
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="jane@company.com"
                          aria-label="Work email address"
                          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a365d]/30 focus:border-[#1a365d] transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-semibold text-gray-700">Phone Number</label>
                      <div className="relative">
                        <FiPhone className="absolute left-3 top-3 text-gray-400" size={15} />
                        <input
                          type="tel"
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="(555) 000-0000"
                          aria-label="Phone number"
                          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a365d]/30 focus:border-[#1a365d] transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-semibold text-gray-700">
                        Estimated Monthly Ride Volume <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FiCalendar className="absolute left-3 top-3 text-gray-400" size={15} />
                        <select
                          name="volume"
                          value={form.volume}
                          onChange={handleChange}
                          aria-label="Estimated monthly ride volume"
                          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a365d]/30 focus:border-[#1a365d] transition-colors appearance-none bg-white"
                        >
                          <option value="">Select volume…</option>
                          {MONTHLY_VOLUMES.map((v) => (
                            <option key={v} value={v}>{v}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#1a365d] text-white font-bold py-3.5 rounded-xl hover:bg-[#0f1f3d] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-base shadow-lg mt-2"
                    >
                      {loading ? 'Sending…' : (
                        <>Contact Sales Team <FiArrowRight /></>
                      )}
                    </button>

                    <p className="text-center text-xs text-gray-400">
                      No spam. No commitment. We'll simply send you a custom proposal.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Corporate
