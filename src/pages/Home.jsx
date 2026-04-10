import React, { useState, useEffect, useRef } from 'react';
import { FiShield, FiTruck, FiHeadphones } from 'react-icons/fi';
import ConversationalBooker from '../components/ConversationalBooker';
import LiveBidBoard from '../components/LiveBidBoard';

function ParticleBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.4,
      dx: (Math.random() - 0.5) * 0.25,
      dy: (Math.random() - 0.5) * 0.25,
      opacity: Math.random() * 0.35 + 0.05,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(246, 201, 14, ${p.opacity})`;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  );
}

export default function Home() {
  const [phase, setPhase] = useState('booking');
  const [rideData, setRideData] = useState(null);

  const handleRidePosted = (data) => {
    setRideData(data);
    setPhase('bids');
  };

  const handleReset = () => {
    setRideData(null);
    setPhase('booking');
  };

  return (
    <div className="bg-[#050d1a] overflow-x-hidden">
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f1f3d] via-[#07111f] to-[#000810]" />

        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-[-20%] right-[-10%] w-[700px] h-[700px] rounded-full opacity-[0.06]"
            style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }}
          />
          <div
            className="absolute bottom-[-15%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-[0.07]"
            style={{ background: 'radial-gradient(circle, #1e40af 0%, transparent 70%)' }}
          />
          <div
            className="absolute top-[40%] left-[30%] w-[400px] h-[400px] rounded-full opacity-[0.04]"
            style={{ background: 'radial-gradient(circle, #F6C90E 0%, transparent 70%)' }}
          />
        </div>

        <ParticleBackground />

        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 pt-12 pb-20">
          {phase === 'booking' && (
            <div>
              <div className="text-center mb-14">
                <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/25 rounded-full px-4 py-1.5 mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                  <span className="text-yellow-400/90 text-sm font-medium">New York&rsquo;s Premier Luxury Chauffeur</span>
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
                  Your Ride,{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">
                    Your Price.
                  </span>
                </h1>
                <p className="text-white/50 text-lg max-w-md mx-auto">
                  Tell us where you're going — operators compete for your business in real time.
                </p>
              </div>

              <ConversationalBooker onRidePosted={handleRidePosted} />
            </div>
          )}

          {phase === 'bids' && (
            <LiveBidBoard rideData={rideData} onReset={handleReset} />
          )}
        </div>
      </section>

      <section className="bg-[#070e1d] border-t border-white/5 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[
              {
                icon: FiShield,
                label: 'Licensed & Insured',
                desc: 'Every driver fully vetted & covered',
              },
              {
                icon: FiTruck,
                label: '250+ Vehicles',
                desc: 'Sedans, SUVs, Sprinters & Coaches',
              },
              {
                icon: FiHeadphones,
                label: '24 / 7 Support',
                desc: 'Real humans, always available',
              },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex flex-col items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center">
                  <Icon size={18} className="text-yellow-400" />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">{label}</div>
                  <div className="text-white/40 text-xs mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <a
              href="tel:+17186586000"
              className="inline-flex items-center gap-2 text-white/40 hover:text-yellow-400 transition-colors text-sm font-medium"
            >
              Need help?{' '}
              <span className="text-yellow-400/80 font-bold">(718) 658-6000</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
