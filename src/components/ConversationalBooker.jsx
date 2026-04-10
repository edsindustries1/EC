import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  FiArrowLeft,
  FiArrowRight,
  FiMic,
  FiMicOff,
  FiMapPin,
  FiNavigation2,
} from 'react-icons/fi';
import PlaceAutocomplete from './PlaceAutocomplete';

const STEPS = [
  { id: 1, question: 'Where are you heading?' },
  { id: 2, question: 'And your pickup location?' },
  { id: 3, question: 'When do you need us?' },
  { id: 4, question: 'How many passengers?' },
  { id: 5, question: 'Which type of ride?' },
  { id: 6, question: "Last step, so we can confirm your price." },
];

const VEHICLE_OPTIONS = [
  {
    type: 'Sedan',
    value: 'Mercedes S-Class (2-3 Passengers)',
    image: '/images/fleet-sedan.png',
    capacity: '2–3 pax',
    description: 'Luxury executive sedan',
  },
  {
    type: 'SUV',
    value: 'Cadillac Escalade (3-5 Passengers)',
    image: '/images/fleet-suv.png',
    capacity: '3–5 pax',
    description: 'Premium SUV, extra space',
  },
  {
    type: 'Sprinter Van',
    value: 'Mercedes Sprinter Van (11-12 Passengers)',
    image: '/images/fleet-sprinter.png',
    capacity: '11–14 pax',
    description: 'Group luxury van',
  },
  {
    type: 'Mini Bus',
    value: 'Ford F550 Mini Bus (20 Passengers)',
    image: '/images/fleet-sprinter.png',
    capacity: 'Up to 20 pax',
    description: 'Compact charter bus',
  },
  {
    type: 'Coach Bus',
    value: 'MCI Coach Bus (55 Passengers)',
    image: '/images/fleet-coach.png',
    capacity: '20–55 pax',
    description: 'Full charter experience',
  },
];

function useTypewriter(text, speed = 35, active = true) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!active) {
      setDisplayed(text);
      setDone(true);
      return;
    }
    setDisplayed('');
    setDone(false);
    if (!text) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, active]);

  return { displayed, done };
}

function VoiceAddressField({ value, onChange, placeholder, id, icon }) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const startVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice input not supported in this browser');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onChange(transcript);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
  };

  const stopVoice = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  return (
    <div className="relative">
      <div className="booker-input-wrapper">
        <PlaceAutocomplete
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="booker-input pl-12 pr-14"
          icon={icon}
        />
      </div>
      <button
        type="button"
        onClick={listening ? stopVoice : startVoice}
        className={`absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-all z-10 ${
          listening ? 'text-red-400 animate-pulse' : 'text-white/40 hover:text-yellow-400'
        }`}
        title="Voice input"
      >
        {listening ? <FiMicOff size={18} /> : <FiMic size={18} />}
      </button>
    </div>
  );
}

export default function ConversationalBooker({ onRidePosted }) {
  const [step, setStep] = useState(1);
  const [animDir, setAnimDir] = useState('forward');
  const [formData, setFormData] = useState({
    destination: '',
    pickup_location: '',
    date: '',
    time: '',
    passengers: 1,
    vehicle_type: '',
    name: '',
    contact: '',
  });
  const [loading, setLoading] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const currentStep = STEPS[step - 1];
  const { displayed: displayedQuestion, done: typingDone } = useTypewriter(currentStep.question, 38);

  const goNext = () => {
    if (transitioning) return;
    setAnimDir('forward');
    setTransitioning(true);
    setTimeout(() => {
      setStep(s => s + 1);
      setTransitioning(false);
    }, 280);
  };

  const goBack = () => {
    if (step <= 1 || transitioning) return;
    setAnimDir('back');
    setTransitioning(true);
    setTimeout(() => {
      setStep(s => s - 1);
      setTransitioning(false);
    }, 280);
  };

  const canAdvance = () => {
    switch (step) {
      case 1: return formData.destination.trim().length > 3;
      case 2: return formData.pickup_location.trim().length > 3;
      case 3: return !!(formData.date && formData.time);
      case 4: return formData.passengers >= 1;
      case 5: return !!formData.vehicle_type;
      case 6: return formData.name.trim().length > 1 && formData.contact.trim().length > 4;
      default: return false;
    }
  };

  const isEmailContact = (v) => v.includes('@');

  const handleSubmit = async () => {
    if (!canAdvance() || loading) return;
    setLoading(true);
    try {
      const isEmail = isEmailContact(formData.contact);
      const payload = {
        name: formData.name,
        phone: isEmail ? '' : formData.contact,
        email: isEmail ? formData.contact : '',
        pickup: formData.pickup_location,
        dropoff: formData.destination,
        ride_date: `${formData.date}T${formData.time}`,
        passengers: formData.passengers,
        vehicle_type: formData.vehicle_type,
      };
      const res = await api.post('/quote-requests', payload);
      const requestId = res.data?.data?.id || res.data?.id || null;
      if (onRidePosted) {
        onRidePosted({
          id: requestId,
          pickup: formData.pickup_location,
          dropoff: formData.destination,
          date: formData.date,
          time: formData.time,
          passengers: formData.passengers,
          vehicle_type: formData.vehicle_type,
        });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="relative z-10 w-full max-w-2xl mx-auto px-4">
      <style>{`
        .booker-input {
          width: 100%;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.22);
          color: white;
          border-radius: 0.75rem;
          padding: 1rem 3.5rem 1rem 3rem;
          font-size: 1.1rem;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .booker-input::placeholder { color: rgba(255,255,255,0.35); }
        .booker-input:focus {
          border-color: rgba(246,201,14,0.6);
          background: rgba(255,255,255,0.12);
        }
        .booker-input-wrapper .absolute.left-3 { z-index: 10; color: #F6C90E; }
        .booker-input-wrapper ul {
          background: #0f1f3d;
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 0.75rem;
        }
        .booker-input-wrapper ul li {
          color: rgba(255,255,255,0.8);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
        }
        .booker-input-wrapper ul li:hover,
        .booker-input-wrapper ul li[aria-selected="true"] {
          background: rgba(246,201,14,0.15);
          color: #F6C90E;
        }
      `}</style>

      <div className="flex justify-center gap-2.5 mb-10">
        {STEPS.map((s) => (
          <div
            key={s.id}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              s.id < step
                ? 'w-8 bg-yellow-400'
                : s.id === step
                ? 'w-8 bg-yellow-400 shadow-lg shadow-yellow-400/50'
                : 'w-4 bg-white/20'
            }`}
          />
        ))}
      </div>

      <div
        className={`transition-all duration-280 ${
          transitioning
            ? animDir === 'forward'
              ? 'opacity-0 translate-x-8'
              : 'opacity-0 -translate-x-8'
            : 'opacity-100 translate-x-0'
        }`}
        style={{ transition: 'opacity 0.28s ease, transform 0.28s ease' }}
      >
        <div className="mb-8">
          <p className="text-xs font-semibold tracking-widest text-yellow-400/70 uppercase mb-3">
            Step {step} of {STEPS.length}
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white min-h-[2.75rem]">
            {displayedQuestion}
            {!typingDone && (
              <span className="inline-block w-0.5 h-8 bg-yellow-400 ml-1 animate-pulse align-middle" />
            )}
          </h2>
        </div>

        <div className="space-y-4">
          {step === 1 && (
            <VoiceAddressField
              id="destination"
              value={formData.destination}
              onChange={(v) => setFormData(p => ({ ...p, destination: v }))}
              placeholder="e.g. JFK Airport, Manhattan..."
              icon={<FiNavigation2 size={16} />}
            />
          )}

          {step === 2 && (
            <VoiceAddressField
              id="pickup_location"
              value={formData.pickup_location}
              onChange={(v) => setFormData(p => ({ ...p, pickup_location: v }))}
              placeholder="e.g. 123 Park Ave, New York..."
              icon={<FiMapPin size={16} />}
            />
          )}

          {step === 3 && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-white/60 text-sm mb-2 block">Date</label>
                <input
                  type="date"
                  min={todayStr}
                  value={formData.date}
                  onChange={(e) => setFormData(p => ({ ...p, date: e.target.value }))}
                  className="w-full bg-white/10 border border-white/25 text-white rounded-xl px-4 py-4 text-base focus:outline-none focus:border-yellow-400/70 focus:bg-white/15 transition-all [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="text-white/60 text-sm mb-2 block">Time</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData(p => ({ ...p, time: e.target.value }))}
                  className="w-full bg-white/10 border border-white/25 text-white rounded-xl px-4 py-4 text-base focus:outline-none focus:border-yellow-400/70 focus:bg-white/15 transition-all [color-scheme:dark]"
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <div className="flex flex-wrap gap-2.5">
                {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,'20+'].map((n, i) => {
                  const val = i < 19 ? i + 1 : 20;
                  const selected = n === '20+' ? formData.passengers >= 20 : formData.passengers === val;
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, passengers: val }))}
                      className={`w-11 h-11 rounded-xl font-bold text-sm transition-all duration-200 ${
                        selected
                          ? 'bg-yellow-400 text-[#0f1f3d] shadow-lg shadow-yellow-400/30 scale-110'
                          : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/15'
                      }`}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>
              {formData.passengers > 0 && (
                <p className="mt-4 text-white/50 text-sm">
                  {formData.passengers} {formData.passengers === 1 ? 'passenger' : 'passengers'} selected
                </p>
              )}
            </div>
          )}

          {step === 5 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {VEHICLE_OPTIONS.map((v) => {
                const selected = formData.vehicle_type === v.value;
                return (
                  <button
                    key={v.type}
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, vehicle_type: v.value }))}
                    className={`relative flex flex-col rounded-2xl overflow-hidden border-2 text-left transition-all duration-200 ${
                      selected
                        ? 'border-yellow-400 shadow-lg shadow-yellow-400/20 scale-[1.02]'
                        : 'border-white/15 hover:border-white/40'
                    }`}
                  >
                    <div className="h-28 overflow-hidden bg-white/5">
                      <img
                        src={v.image}
                        alt={v.type}
                        className="w-full h-full object-cover opacity-90"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-3 bg-white/5">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-bold text-white text-sm">{v.type}</span>
                        {selected && <span className="text-yellow-400 text-xs font-bold">✓</span>}
                      </div>
                      <span className="text-yellow-400/80 text-xs">{v.capacity}</span>
                      <p className="text-white/50 text-xs mt-0.5">{v.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <div>
                <label className="text-white/60 text-sm mb-2 block">Your Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="Full name"
                  className="w-full bg-white/10 border border-white/25 text-white placeholder-white/40 rounded-xl px-4 py-4 text-base focus:outline-none focus:border-yellow-400/70 focus:bg-white/15 transition-all"
                />
              </div>
              <div>
                <label className="text-white/60 text-sm mb-2 block">Phone or Email</label>
                <input
                  type="text"
                  value={formData.contact}
                  onChange={(e) => setFormData(p => ({ ...p, contact: e.target.value }))}
                  placeholder="(718) 000-0000 or you@example.com"
                  className="w-full bg-white/10 border border-white/25 text-white placeholder-white/40 rounded-xl px-4 py-4 text-base focus:outline-none focus:border-yellow-400/70 focus:bg-white/15 transition-all"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-8">
          {step > 1 ? (
            <button
              type="button"
              onClick={goBack}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-medium py-2"
            >
              <FiArrowLeft size={16} /> Back
            </button>
          ) : (
            <div />
          )}

          {step < STEPS.length ? (
            <button
              type="button"
              onClick={goNext}
              disabled={!canAdvance()}
              className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base transition-all duration-200 ${
                canAdvance()
                  ? 'bg-yellow-400 text-[#0f1f3d] hover:bg-yellow-300 shadow-lg shadow-yellow-400/30'
                  : 'bg-white/10 text-white/30 cursor-not-allowed'
              }`}
            >
              Continue <FiArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canAdvance() || loading}
              className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base transition-all duration-200 ${
                canAdvance() && !loading
                  ? 'bg-yellow-400 text-[#0f1f3d] hover:bg-yellow-300 shadow-lg shadow-yellow-400/30'
                  : 'bg-white/10 text-white/30 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Posting…
                </span>
              ) : (
                <>Post My Ride <FiArrowRight size={16} /></>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="mt-10 text-center">
        <p className="text-white/30 text-xs">
          No payment required. We'll confirm your price within minutes.
        </p>
      </div>
    </div>
  );
}
