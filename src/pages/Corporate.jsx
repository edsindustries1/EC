import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FiArrowRight, FiCheck, FiBriefcase, FiClock, FiCreditCard, FiUsers, FiShield, FiPhone, FiPieChart } from 'react-icons/fi'
import { FadeIn } from '../hooks/useFadeIn'
import api from '../utils/api'

const BLACK = '#000', WHITE = '#fff'
const GRAY_50 = '#F6F6F6', GRAY_100 = '#EEEEEE', GRAY_500 = '#6B6B6B'
const FONT = "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif"

const FEATURES = [
  { icon: FiCreditCard, title: 'Centralised billing',    desc: 'One consolidated monthly invoice for your entire team. Itemised by traveller, trip, and cost centre.' },
  { icon: FiClock,      title: 'Priority dispatch',      desc: 'Skip the queue. Corporate accounts get first-available vehicles and SLA-backed response times.' },
  { icon: FiPieChart,   title: 'Expense automation',    desc: 'Auto-export to Concur, Expensify, and SAP. Receipt photos, mileage, and gratuity captured.' },
  { icon: FiUsers,      title: 'Traveller management', desc: 'Add and remove travellers in seconds. Set per-traveller spend limits and approval workflows.' },
  { icon: FiShield,     title: 'Duty of care',          desc: 'Background-checked chauffeurs, GPS-tracked vehicles, 24/7 incident response — your obligation, our standard.' },
  { icon: FiBriefcase,  title: 'Dedicated account team', desc: 'A real person who knows your team and your travel patterns. Direct line, no IVRs.' },
]

const TIERS = [
  { name: 'Starter',    desc: 'For small teams getting started', includes: ['Up to 10 travellers', 'Monthly invoicing', 'Email support'] },
  { name: 'Business',   desc: 'For growing teams', highlight: true, includes: ['Up to 100 travellers', 'Concur / Expensify export', 'Dedicated rep', '24/7 priority dispatch'] },
  { name: 'Enterprise', desc: 'For organisations with global travel', includes: ['Unlimited travellers', 'Custom SLAs & contracts', 'API access', 'Multi-city operations'] },
]

export default function Corporate() {
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', team_size: '', notes: '' })

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email) { toast.error('Name and email required'); return }
    setSubmitting(true)
    try {
      await api.post('/quote-requests', {
        name: form.name, email: form.email, phone: form.phone,
        pickup: 'Corporate inquiry', dropoff: form.company || 'Corporate inquiry',
        vehicle_type: 'sedan',
        passengers: form.team_size || 1,
        ride_date: new Date().toISOString().slice(0, 10),
      })
      toast.success('Thanks — our corporate team will reach out within one business day.')
      setForm({ name: '', email: '', phone: '', company: '', team_size: '', notes: '' })
    } catch {
      toast.error('Could not send. Please call (718) 658-6000.')
    } finally {
      setSubmitting(false)
    }
  }

  const onChange = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div style={{ background: WHITE, color: BLACK, fontFamily: FONT, letterSpacing: '-0.01em' }}>

      <Section bg={WHITE}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <FadeIn className="lg:col-span-7">
            <p style={EYEBROW}>Everywhere Transfers for Business</p>
            <h1 style={H1}>Move your team like<br/>the executives they are.</h1>
            <p style={LEAD}>One account. Hundreds of travellers. Centralised billing, automated expensing, and priority dispatch — across every city we serve.</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a href="#contact" style={btnPrimary}>Talk to sales <FiArrowRight size={15}/></a>
              <a href="tel:+17186586000" style={btnSecondary}><FiPhone size={14}/> (718) 658-6000</a>
            </div>
          </FadeIn>
          <FadeIn delay={120} className="lg:col-span-5">
            <div style={{ aspectRatio: '4/3', background: GRAY_50, borderRadius: 8, overflow: 'hidden' }}>
              <img src="/images/service-corporate.png" alt="" onError={(e) => { e.currentTarget.style.display = 'none' }} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
            </div>
          </FadeIn>
        </div>
      </Section>

      <Section bg={GRAY_50}>
        <FadeIn><h2 style={H2}>Built for the way you work</h2></FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <FadeIn key={f.title} delay={i * 60}>
              <div style={card}>
                <div style={{ width: 44, height: 44, borderRadius: 8, background: BLACK, color: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <f.icon size={20}/>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6, letterSpacing: '-0.01em' }}>{f.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.55, color: GRAY_500 }}>{f.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </Section>

      <Section bg={WHITE}>
        <FadeIn><h2 style={H2}>Choose your plan</h2></FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TIERS.map((t, i) => (
            <FadeIn key={t.name} delay={i * 80}>
              <div style={{
                ...card,
                background: t.highlight ? BLACK : WHITE,
                color: t.highlight ? WHITE : BLACK,
                borderColor: t.highlight ? BLACK : GRAY_100,
                position: 'relative',
              }}>
                {t.highlight && (
                  <span style={{ position: 'absolute', top: -10, right: 20, background: WHITE, color: BLACK, padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Most popular
                  </span>
                )}
                <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, letterSpacing: '-0.01em' }}>{t.name}</h3>
                <p style={{ fontSize: 14, color: t.highlight ? 'rgba(255,255,255,0.7)' : GRAY_500, marginBottom: 18 }}>{t.desc}</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {t.includes.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                      <FiCheck size={14}/> {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="#contact"
                  style={{
                    ...btnPrimary,
                    marginTop: 22,
                    background: t.highlight ? WHITE : BLACK,
                    color: t.highlight ? BLACK : WHITE,
                  }}
                >
                  Get started <FiArrowRight size={14}/>
                </a>
              </div>
            </FadeIn>
          ))}
        </div>
      </Section>

      <Section bg={GRAY_50}>
        <div id="contact" className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <FadeIn className="lg:col-span-5">
            <p style={EYEBROW}>Talk to sales</p>
            <h2 style={H2}>Let's build the right account for your team.</h2>
            <p style={LEAD}>Drop your details and we'll set up a 20-minute walkthrough. No commitment, no pressure.</p>
            <div style={{ fontSize: 14, color: GRAY_500 }}>Prefer a call? <a href="tel:+17186586000" style={{ color: BLACK, fontWeight: 600, textDecoration: 'underline' }}>(718) 658-6000</a></div>
          </FadeIn>
          <FadeIn delay={120} className="lg:col-span-7">
            <form onSubmit={submit} style={{ background: WHITE, padding: 28, borderRadius: 8, border: `1px solid ${GRAY_100}`, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input label="Full name *"  value={form.name}    onChange={onChange('name')}    placeholder="Jane Smith"/>
                <Input label="Work email *" value={form.email}   onChange={onChange('email')}   placeholder="jane@company.com" type="email"/>
                <Input label="Phone"        value={form.phone}   onChange={onChange('phone')}   placeholder="+1 (212) 555-0100"/>
                <Input label="Company"      value={form.company} onChange={onChange('company')} placeholder="Acme, Inc."/>
              </div>
              <Input label="Team size"      value={form.team_size} onChange={onChange('team_size')} placeholder="e.g. 25"/>
              <div>
                <Label>What can we help with?</Label>
                <textarea
                  value={form.notes}
                  onChange={onChange('notes')}
                  rows={3}
                  placeholder="Routes, volume, integrations…"
                  style={inputStyle()}
                />
              </div>
              <button type="submit" disabled={submitting} style={{ ...btnPrimary, justifyContent: 'center', padding: '14px 22px', fontSize: 15, opacity: submitting ? 0.6 : 1 }}>
                {submitting ? 'Sending…' : <>Request a walkthrough <FiArrowRight size={15}/></>}
              </button>
            </form>
          </FadeIn>
        </div>
      </Section>
    </div>
  )
}

function Section({ children, bg = WHITE, text = BLACK }) {
  return (
    <section style={{ background: bg, color: text }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12" style={{ padding: '80px 0' }}>{children}</div>
    </section>
  )
}
function Input({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <Label>{label}</Label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={inputStyle()}/>
    </div>
  )
}
function Label({ children }) {
  return <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: GRAY_500, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{children}</label>
}
const inputStyle = () => ({ width: '100%', padding: '11px 12px', borderRadius: 12, fontSize: 14, border: `1px solid ${GRAY_100}`, background: GRAY_50, color: BLACK, outline: 'none', fontFamily: FONT })
const EYEBROW = { fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: GRAY_500, marginBottom: 10 }
const H1 = { fontSize: 'clamp(2.4rem, 5vw, 4rem)', lineHeight: 1.05, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '1.25rem' }
const H2 = { fontSize: 'clamp(1.75rem, 3.4vw, 2.6rem)', lineHeight: 1.1, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '2rem' }
const LEAD = { fontSize: 18, lineHeight: 1.5, color: GRAY_500, maxWidth: 580, marginBottom: '1.75rem' }
const card = { background: WHITE, padding: 24, borderRadius: 8, border: `1px solid ${GRAY_100}`, height: '100%' }
const btnPrimary = { background: BLACK, color: WHITE, padding: '14px 26px', borderRadius: 999, border: 0, fontWeight: 600, fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', cursor: 'pointer' }
const btnSecondary = { background: 'transparent', color: BLACK, padding: '12px 22px', borderRadius: 999, border: `1px solid ${BLACK}`, fontWeight: 600, fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', cursor: 'pointer' }
