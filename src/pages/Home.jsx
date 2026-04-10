import React from 'react'
import { FiShield, FiTruck, FiHeadphones } from 'react-icons/fi'
import DispatchPanel from '../components/DispatchPanel'
import { useTheme } from '../context/ThemeContext'

export default function Home() {
  const { isDark } = useTheme()

  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden" style={{ background: 'var(--bg-page)', transition: 'background 300ms ease' }}>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0" style={{ background: isDark
          ? 'radial-gradient(ellipse 80% 55% at 50% -10%, rgba(14,165,233,0.10) 0%, transparent 65%)'
          : 'radial-gradient(ellipse 80% 55% at 50% -10%, rgba(14,165,233,0.08) 0%, transparent 65%)'
        }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-64" style={{ background: isDark
          ? 'radial-gradient(ellipse 60% 100% at 50% 100%, rgba(246,201,14,0.04) 0%, transparent 70%)'
          : 'radial-gradient(ellipse 60% 100% at 50% 100%, rgba(26,54,93,0.04) 0%, transparent 70%)'
        }} />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-10 sm:py-14">
        <DispatchPanel />
      </div>

      <section className="relative z-10 py-8" style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border-color)', transition: 'background 300ms ease' }}>
        <div className="max-w-2xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              { icon: FiShield, label: 'Licensed & Insured', desc: 'Every driver vetted & covered' },
              { icon: FiTruck, label: '250+ Vehicles', desc: 'Sedans, SUVs, Sprinters & Coaches' },
              { icon: FiHeadphones, label: '24/7 Support', desc: 'Real humans, always available' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(246,201,14,0.10)', border: '1px solid rgba(246,201,14,0.22)' }}>
                  <Icon size={16} style={{ color: '#F6C90E' }} />
                </div>
                <div>
                  <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{label}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <a href="tel:+17186586000" className="text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>
              Need help? <span className="font-bold" style={{ color: 'rgba(246,201,14,0.85)' }}>(718) 658-6000</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
