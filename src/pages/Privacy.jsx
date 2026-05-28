import React from 'react'
import { BLACK, WHITE, GRAY_50, GRAY_100, GRAY_500, FONT } from '../styles/uber'

const SECTIONS = [
  { title: 'Introduction',                  body: 'Everywhere Cars ("we", "our", "us") operates this website and mobile application. This page describes how we collect, use, and protect your personal information when you use our service.' },
  { title: 'Information we collect',        body: 'We collect a small set of personal information to provide and improve our service: your name, email, phone number, and pickup / drop-off addresses; usage data (pages visited, device and browser info); and payment details (processed securely by our payment providers — we never store full card numbers).' },
  { title: 'How we use it',                 body: 'We use this data to confirm and dispatch your rides, notify you about changes to your trip, improve our service, and meet legal obligations. We do not sell your personal information.' },
  { title: 'Security',                      body: 'We use commercially reasonable encryption, access controls, and monitoring to protect your data. No system is 100% secure, but we treat every reservation as a duty of care obligation.' },
  { title: 'Your rights',                   body: 'You can request a copy of the personal data we hold about you, ask us to correct or delete it, or opt out of marketing communications at any time by emailing privacy@everywherecars.com.' },
  { title: 'Contact',                       body: 'Questions? Email privacy@everywherecars.com or call (718) 658-6000.' },
]

export default function Privacy() {
  return <Legal title="Privacy Policy" lead="How Everywhere Cars collects, uses and protects your personal information." sections={SECTIONS}/>
}

export function Legal({ title, lead, sections }) {
  return (
    <div style={{ background: WHITE, color: BLACK, fontFamily: FONT, letterSpacing: '-0.01em', minHeight: '100vh' }}>
      <section style={{ background: BLACK, color: WHITE }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-12" style={{ padding: '80px 0', textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: 12 }}>
            {title}
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.78)', lineHeight: 1.5, maxWidth: 560, margin: '0 auto' }}>{lead}</p>
        </div>
      </section>

      <section style={{ background: GRAY_50 }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-12" style={{ padding: '64px 0' }}>
          <div style={{ background: WHITE, borderRadius: 12, border: `1px solid ${GRAY_100}`, padding: '40px 36px', display: 'flex', flexDirection: 'column', gap: 28 }}>
            {sections.map((s, i) => (
              <div key={s.title}>
                <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 10, paddingBottom: 8, borderBottom: `1px solid ${GRAY_100}` }}>
                  {i + 1}. {s.title}
                </h2>
                <p style={{ fontSize: 15, color: GRAY_500, lineHeight: 1.65 }}>{s.body}</p>
              </div>
            ))}
            <p style={{ fontSize: 12, color: GRAY_500, marginTop: 8 }}>
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
