import React, { useState, useCallback } from 'react'
import { FiShield, FiTruck, FiHeadphones } from 'react-icons/fi'
import DispatchPanel from '../components/DispatchPanel'
import NYCActivityCanvas from '../components/NYCActivityCanvas'

export default function Home() {
  const [pickup, setPickup] = useState('')
  const [dropoff, setDropoff] = useState('')

  const handleRouteChange = useCallback((pu, do_) => {
    setPickup(pu)
    setDropoff(do_)
  }, [])

  return (
    <div style={{ background: 'var(--bg-page)', transition: 'background 300ms ease' }} className="overflow-x-hidden">
      <section className="relative min-h-screen flex">

        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(26,54,93,0.25) 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 right-0 w-96 h-96" style={{ background: 'radial-gradient(circle, rgba(246,201,14,0.03) 0%, transparent 70%)' }} />
        </div>

        <div className="hidden lg:block absolute inset-y-0 right-0 w-[42%]" style={{ background: 'var(--canvas-bg)', transition: 'background 300ms ease' }}>
          <NYCActivityCanvas pickup={pickup} dropoff={dropoff} isMobile={false} />
          <div className="absolute inset-y-0 left-0 w-32 pointer-events-none" style={{ background: 'linear-gradient(to right, var(--canvas-bg), transparent)', transition: 'background 300ms ease' }} />
        </div>

        <div className="relative z-10 w-full lg:w-[58%] min-h-screen flex flex-col">
          <div className="block lg:hidden relative w-full overflow-hidden flex-shrink-0" style={{ height: 120, background: 'var(--canvas-bg)', transition: 'background 300ms ease' }}>
            <NYCActivityCanvas pickup={pickup} dropoff={dropoff} isMobile={true} />
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom, rgba(5,10,15,0.3) 0%, transparent 40%, rgba(5,10,15,0.5) 100%)' }} />
          </div>
          <div className="flex-1 flex items-center">
            <DispatchPanel onRouteChange={handleRouteChange} />
          </div>
        </div>
      </section>

      <section className="py-10 border-t" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-panel)', transition: 'background 300ms ease' }}>
        <div className="max-w-3xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              { icon: FiShield, label: 'Licensed & Insured', desc: 'Every driver vetted & covered' },
              { icon: FiTruck, label: '250+ Vehicles', desc: 'Sedans, SUVs, Sprinters & Coaches' },
              { icon: FiHeadphones, label: '24/7 Support', desc: 'Real humans, always available' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex flex-col items-center gap-2.5">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(246,201,14,0.1)', border: '1px solid rgba(246,201,14,0.22)' }}>
                  <Icon size={17} style={{ color: '#F6C90E' }} />
                </div>
                <div>
                  <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{label}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-7">
            <a href="tel:+17186586000" className="text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>
              Need help?{' '}
              <span className="font-bold" style={{ color: 'rgba(246,201,14,0.85)' }}>(718) 658-6000</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
