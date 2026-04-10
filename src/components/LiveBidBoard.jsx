import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { FiStar, FiPhone, FiMessageCircle, FiClock, FiArrowRight } from 'react-icons/fi';

const VEHICLE_IMAGES = {
  sedan: '/images/fleet-sedan.png',
  suv: '/images/fleet-suv.png',
  sprinter_van: '/images/fleet-sprinter.png',
  mini_bus: '/images/fleet-sprinter.png',
  coach: '/images/fleet-coach.png',
};

function getVehicleImage(vehicleType) {
  if (!vehicleType) return '/images/fleet-sedan.png';
  const lower = vehicleType.toLowerCase();
  if (lower.includes('suv') || lower.includes('escalade') || lower.includes('yukon') || lower.includes('navigator')) return VEHICLE_IMAGES.suv;
  if (lower.includes('sprinter') || lower.includes('transit')) return VEHICLE_IMAGES.sprinter_van;
  if (lower.includes('coach') || lower.includes('bus') || lower.includes('temsa') || lower.includes('mci') || lower.includes('prevost')) return VEHICLE_IMAGES.coach;
  if (lower.includes('mini')) return VEHICLE_IMAGES.mini_bus;
  return VEHICLE_IMAGES.sedan;
}

function useTypewriter(text, speed = 40) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    setDisplayed('');
    if (!text) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);
  return displayed;
}

function CountdownTimer({ seconds }) {
  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  const isUrgent = seconds < 60;
  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold transition-colors ${
      isUrgent ? 'border-red-500/50 text-red-400 bg-red-500/10' : 'border-yellow-400/30 text-yellow-400 bg-yellow-400/10'
    }`}>
      <FiClock size={14} />
      Offers expire in {mins}:{secs}
    </div>
  );
}

function AnimatedRouteLine({ pickup, dropoff }) {
  return (
    <div className="relative w-full max-w-sm mx-auto my-6 select-none">
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-md shadow-yellow-400/40" />
          <div className="flex flex-col gap-1 items-center" style={{ height: 32 }}>
            {[0,1,2,3,4].map(i => (
              <div
                key={i}
                className="route-dot-anim w-0.5 h-1.5 rounded-full bg-yellow-400/60"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
          <div className="w-3 h-3 rounded-full bg-white/60 shadow-md" />
        </div>
        <div className="flex flex-col justify-between gap-5 min-w-0 flex-1">
          <div>
            <p className="text-white/40 text-[10px] uppercase tracking-widest mb-0.5">Pickup</p>
            <p className="text-white text-sm font-semibold truncate">{pickup || '...'}</p>
          </div>
          <div>
            <p className="text-white/40 text-[10px] uppercase tracking-widest mb-0.5">Dropoff</p>
            <p className="text-white/80 text-sm font-semibold truncate">{dropoff || '...'}</p>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes dashFlow {
          0% { opacity: 0.15; transform: scaleY(0.5); }
          50% { opacity: 1; transform: scaleY(1.1); }
          100% { opacity: 0.15; transform: scaleY(0.5); }
        }
        .route-dot-anim { animation: dashFlow 1.4s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

function SkeletonBidCard() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-xl bg-white/10 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-white/10 rounded w-1/2" />
          <div className="h-3 bg-white/10 rounded w-1/3" />
        </div>
        <div className="h-8 w-24 bg-white/10 rounded-xl" />
      </div>
      <div className="h-3 bg-white/10 rounded w-3/4 mb-2" />
      <div className="h-3 bg-white/10 rounded w-1/2" />
    </div>
  );
}

function BidCard({ bid, onBook, index }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), index * 350);
    return () => clearTimeout(timer);
  }, [index]);

  const vehicleImg = getVehicleImage(bid.vehicle_type);

  return (
    <div
      className={`bg-gradient-to-br from-white/8 to-white/4 border border-white/15 rounded-2xl p-5 transition-all duration-500 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-white/5 border border-white/10">
          <img
            src={vehicleImg}
            alt={bid.vehicle_type || 'Vehicle'}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-white text-base truncate">
            {bid.operator_name || 'Everywhere Cars'}
          </div>
          <div className="flex items-center gap-1 mt-0.5 mb-1">
            {[1,2,3,4,5].map(i => (
              <FiStar key={i} size={11} className={i <= Math.round(bid.rating || 5) ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'} />
            ))}
            <span className="text-white/50 text-xs ml-1">{(bid.rating || 5.0).toFixed(1)}</span>
          </div>
          <p className="text-white/50 text-xs">{bid.vehicle_type || 'Premium Vehicle'}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-3xl font-bold text-yellow-400">
            ${bid.price}
          </div>
          <div className="text-white/50 text-xs mt-0.5">fixed price</div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm text-white/60 mb-4">
        <span className="flex items-center gap-1">
          <FiClock size={12} />
          Ready in ~{bid.eta_minutes || 30} min
        </span>
      </div>

      {bid.notes && (
        <p className="text-white/50 text-sm italic bg-white/5 rounded-xl px-3 py-2 mb-4">
          "{bid.notes}"
        </p>
      )}

      <button
        onClick={() => onBook(bid)}
        className="w-full bg-yellow-400 hover:bg-yellow-300 text-[#0f1f3d] font-bold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm shadow-lg shadow-yellow-400/20"
      >
        Book This Ride <FiArrowRight size={14} />
      </button>
    </div>
  );
}

export default function LiveBidBoard({ rideData, onReset }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bids, setBids] = useState([]);
  const [countdown, setCountdown] = useState(600);
  const [noOffersMessage, setNoOffersMessage] = useState(false);
  const [entered, setEntered] = useState(false);
  const pollRef = useRef(null);
  const countdownRef = useRef(null);
  const noOfferTimerRef = useRef(null);

  const heroText = `Finding you the best offers in New York City...`;
  const displayedHero = useTypewriter(heroText, 35);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!rideData?.id) return;

    const poll = async () => {
      try {
        const res = await api.get(`/quote-requests/${rideData.id}`);
        const data = res.data?.data || res.data;
        if (data?.bids && Array.isArray(data.bids) && data.bids.length > 0) {
          setBids(data.bids);
        } else if (data?.bid_price) {
          setBids([{
            id: 1,
            operator_name: 'Everywhere Cars',
            price: data.bid_price,
            vehicle_type: data.vehicle_type,
            rating: 4.9,
            eta_minutes: data.eta_minutes || 30,
            notes: data.notes,
          }]);
        }
      } catch {
      }
    };

    poll();
    pollRef.current = setInterval(poll, 5000);
    return () => clearInterval(pollRef.current);
  }, [rideData?.id]);

  useEffect(() => {
    countdownRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(countdownRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    noOfferTimerRef.current = setTimeout(() => {
      setBids(prev => {
        if (prev.length === 0) setNoOffersMessage(true);
        return prev;
      });
    }, 120000);

    return () => {
      clearInterval(countdownRef.current);
      clearTimeout(noOfferTimerRef.current);
    };
  }, []);

  const handleBook = (bid) => {
    const bookingPayload = { rideData, selectedBid: bid, fromBidBoard: true };
    if (!user) {
      try {
        sessionStorage.setItem('pendingBidBooking', JSON.stringify(bookingPayload));
      } catch {}
      navigate('/signup', { state: bookingPayload });
    } else {
      navigate('/book', { state: bookingPayload });
    }
  };

  return (
    <div
      className={`relative z-10 w-full max-w-2xl mx-auto px-4 transition-all duration-700 ${
        entered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-green-500/15 border border-green-500/30 text-green-400 text-sm font-semibold px-4 py-2 rounded-full mb-6">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Ride Posted Successfully
        </div>

        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 min-h-[2.5rem]">
          {displayedHero}
        </h2>

        {countdown > 0 && <CountdownTimer seconds={countdown} />}
      </div>

      <AnimatedRouteLine pickup={rideData?.pickup} dropoff={rideData?.dropoff} />

      <div className="space-y-4 mt-2">
        {bids.length === 0 && (
          <>
            <SkeletonBidCard />
            <SkeletonBidCard />
            <div className="text-center py-2">
              <p className="text-white/40 text-sm animate-pulse">
                Reviewing your request with our team...
              </p>
            </div>
          </>
        )}

        {bids.map((bid, i) => (
          <BidCard key={bid.id || i} bid={bid} onBook={handleBook} index={i} />
        ))}
      </div>

      {noOffersMessage && bids.length === 0 && (
        <div className="mt-6 bg-white/5 border border-white/15 rounded-2xl p-6 text-center">
          <p className="text-white/70 mb-4">
            Our team is reviewing your request. You'll receive a call or message shortly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="tel:+17186586000"
              className="flex items-center justify-center gap-2 bg-yellow-400 text-[#0f1f3d] font-bold px-6 py-3 rounded-xl hover:bg-yellow-300 transition-colors text-sm"
            >
              <FiPhone size={14} /> Call (718) 658-6000
            </a>
            <a
              href="https://wa.me/17182196683"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-green-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-green-500 transition-colors text-sm"
            >
              <FiMessageCircle size={14} /> WhatsApp Us
            </a>
          </div>
        </div>
      )}

      <div className="mt-8 text-center space-y-3">
        <p className="text-white/40 text-sm">
          Or call us to book instantly:{' '}
          <a href="tel:+17186586000" className="text-white/70 font-semibold hover:text-yellow-400 transition-colors">
            (718) 658-6000
          </a>
        </p>
        <button
          onClick={onReset}
          className="text-white/30 hover:text-white/60 text-xs transition-colors underline"
        >
          Start a new search
        </button>
      </div>
    </div>
  );
}
