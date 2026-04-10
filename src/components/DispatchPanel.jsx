import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import api from '../utils/api'
import toast from 'react-hot-toast'
import {
  FiMic, FiMicOff, FiArrowRight, FiPlus, FiMinus,
  FiStar, FiPhone, FiMessageCircle, FiClock, FiZap,
  FiNavigation2, FiMapPin, FiCheckCircle, FiRefreshCw,
} from 'react-icons/fi'
import PlaceAutocomplete from './PlaceAutocomplete'
import {
  detectRouteType, getPriceEstimate, formatPriceRange,
  detectAirport, detectHotel, isPeakHour,
} from '../utils/priceEstimator'

const GOLD = '#F6C90E'
const ELECTRIC = '#0EA5E9'

const VEHICLES = [
  { id: 'sedan',        label: 'Sedan',    capacity: '2–3',      image: '/images/fleet-sedan.png'    },
  { id: 'suv',         label: 'SUV',       capacity: '3–5',      image: '/images/fleet-suv.png'      },
  { id: 'sprinter_van', label: 'Sprinter', capacity: '11–14',    image: '/images/fleet-sprinter.png' },
  { id: 'mini_bus',    label: 'Mini Bus',  capacity: 'Up to 20', image: '/images/fleet-sprinter.png' },
  { id: 'coach',       label: 'Coach',     capacity: '20–55',    image: '/images/fleet-coach.png'    },
]

function useTypewriter(text, speed = 35) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  useEffect(() => {
    setDisplayed('')
    setDone(false)
    if (!text) return
    let i = 0
    const id = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) { clearInterval(id); setDone(true) }
    }, speed)
    return () => clearInterval(id)
  }, [text, speed])
  return { displayed, done }
}

function useSimulatedStats() {
  const [stats, setStats] = useState({ vehicles: 17, response: 4, rides: 43 })
  useEffect(() => {
    let timerId
    const schedule = () => {
      const delay = Math.floor(Math.random() * 25000) + 15000
      timerId = setTimeout(() => {
        setStats(s => {
          const rDelta = Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0
          return {
            vehicles: Math.max(10, Math.min(30, s.vehicles + 1)),
            response: Math.max(2, Math.min(8, s.response + rDelta)),
            rides: s.rides + 1,
          }
        })
        schedule()
      }, delay)
    }
    schedule()
    return () => clearTimeout(timerId)
  }, [])
  return stats
}

function CountdownTimer({ seconds }) {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0')
  const s = String(seconds % 60).padStart(2, '0')
  const urgent = seconds < 60
  return (
    <span className="font-mono text-xs font-bold tabular-nums"
      style={{ color: urgent ? '#f87171' : ELECTRIC }}>
      {m}:{s}
    </span>
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl p-4 animate-pulse" style={{ background: 'var(--bg-field)', border: 'var(--border-field)' }}>
      <div className="flex gap-4 items-center">
        <div className="w-14 h-14 rounded-xl flex-shrink-0" style={{ background: 'var(--bg-field-hover)' }} />
        <div className="flex-1 space-y-2">
          <div className="h-3 rounded w-1/3" style={{ background: 'var(--bg-field-hover)' }} />
          <div className="h-3 rounded w-1/4" style={{ background: 'var(--bg-field)' }} />
        </div>
        <div className="w-20 h-8 rounded-xl" style={{ background: 'var(--bg-field-hover)' }} />
      </div>
    </div>
  )
}

function BidCard({ bid, onSelect, index, isLowest }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 320 + 80)
    return () => clearTimeout(t)
  }, [index])
  return (
    <div
      className="rounded-2xl p-4 transition-all duration-500"
      style={{
        background: 'var(--bg-field)',
        border: isLowest ? `1px solid rgba(246,201,14,0.5)` : 'var(--border-field)',
        borderLeft: isLowest ? `3px solid ${GOLD}` : undefined,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
      }}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0" style={{ background: 'var(--bg-field-hover)', border: 'var(--border-field)' }}>
          <img src={`/images/fleet-${bid.vehicle_type?.toLowerCase().includes('suv') ? 'suv' : bid.vehicle_type?.toLowerCase().includes('coach') || bid.vehicle_type?.toLowerCase().includes('bus') ? 'coach' : bid.vehicle_type?.toLowerCase().includes('sprinter') || bid.vehicle_type?.toLowerCase().includes('van') ? 'sprinter' : 'sedan'}.png`}
            alt="" className="w-full h-full object-cover" loading="lazy" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{bid.operator_name || 'Everywhere Cars'}</div>
          <div className="flex items-center gap-0.5 mt-0.5">
            {[1,2,3,4,5].map(i => (
              <FiStar key={i} size={10} style={{ color: i <= Math.round(bid.rating || 5) ? GOLD : 'var(--text-muted)', fill: i <= Math.round(bid.rating || 5) ? GOLD : 'transparent' }} />
            ))}
            <span className="text-xs ml-1 font-mono" style={{ color: 'var(--text-muted)' }}>{(bid.rating || 5.0).toFixed(1)}</span>
          </div>
          <div className="text-xs mt-0.5 font-mono" style={{ color: ELECTRIC }}>
            <FiClock size={10} className="inline mr-1" />
            Ready ~{bid.eta_minutes || 30} min
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="font-mono font-black leading-none" style={{ fontSize: '2rem', color: GOLD }}>
            ${bid.price}
          </div>
          <div className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>fixed</div>
        </div>
      </div>
      {(bid.notes || bid.message) && (
        <p className="text-xs italic mb-3 px-2 py-1.5 rounded-lg" style={{ color: 'var(--text-secondary)', background: 'var(--bg-field-hover)' }}>
          "{bid.notes || bid.message}"
        </p>
      )}
      <button
        onClick={() => onSelect(bid)}
        className="w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
        style={{ background: `linear-gradient(135deg, ${GOLD}, #E8B800)`, color: '#050a0f', letterSpacing: '0.04em' }}
      >
        SELECT THIS RIDE <FiArrowRight size={14} />
      </button>
    </div>
  )
}

function VoicePrompt({ target }) {
  const text = target === 'dropoff' ? 'Say where you\'re going...' : 'Say your pickup location...'
  const { displayed } = useTypewriter(text, 30)
  return (
    <p className="text-sm mb-6 min-h-[1.25rem]" style={{ color: 'rgba(255,255,255,0.8)' }}>
      {displayed}<span className="inline-block w-0.5 h-3.5 ml-0.5 align-middle animate-pulse" style={{ background: GOLD, opacity: displayed.length < text.length ? 1 : 0 }} />
    </p>
  )
}

function VoiceWaveform({ active, analyserRef }) {
  const barsRef = useRef([null, null, null, null, null])
  const rafRef = useRef(null)
  const dataRef = useRef(new Uint8Array(32))

  useEffect(() => {
    if (!active) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      barsRef.current.forEach(el => { if (el) el.style.height = '20%' })
      return
    }
    const draw = () => {
      if (analyserRef?.current) {
        analyserRef.current.getByteFrequencyData(dataRef.current)
        barsRef.current.forEach((el, i) => {
          if (!el) return
          const bin = Math.floor((i + 1) * (dataRef.current.length / 6))
          const v = dataRef.current[bin] / 255
          el.style.height = `${Math.max(15, v * 100)}%`
        })
      } else {
        barsRef.current.forEach((el) => {
          if (!el) return
          const v = 0.2 + Math.random() * 0.8
          el.style.height = `${Math.max(15, v * 100)}%`
        })
      }
      rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [active, analyserRef])

  return (
    <div className="flex items-end justify-center gap-1.5" style={{ height: 40 }}>
      {[0,1,2,3,4].map(i => (
        <div
          key={i}
          ref={el => { barsRef.current[i] = el }}
          className="w-2 rounded-full"
          style={{
            background: GOLD,
            height: '20%',
            transition: 'height 80ms ease',
            opacity: active ? 0.9 : 0.4,
          }}
        />
      ))}
    </div>
  )
}

export default function DispatchPanel({ onRouteChange }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const stats = useSimulatedStats()
  const [phase, setPhase] = useState('idle')
  const [pickup, setPickup] = useState('')
  const [dropoff, setDropoff] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [passengers, setPassengers] = useState(1)
  const [vehicle, setVehicle] = useState('sedan')
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [bids, setBids] = useState([])
  const [countdown, setCountdown] = useState(600)
  const [noOffersMsg, setNoOffersMsg] = useState(false)
  const [postedRide, setPostedRide] = useState(null)
  const [voiceActive, setVoiceActive] = useState(false)
  const [voiceTarget, setVoiceTarget] = useState(null)
  const recognitionRef = useRef(null)
  const analyserRef = useRef(null)
  const audioCtxRef = useRef(null)
  const micStreamRef = useRef(null)
  const pollRef = useRef(null)
  const countdownRef = useRef(null)
  const noOfferRef = useRef(null)
  const inputIdleRef = useRef(null)

  const pickupAirport = detectAirport(pickup)
  const dropoffAirport = detectAirport(dropoff)
  const pickupHotel = detectHotel(pickup)
  const dropoffHotel = detectHotel(dropoff)
  const peakHour = isPeakHour(date, time)
  const routeType = detectRouteType(pickup, dropoff)
  const priceEst = getPriceEstimate(vehicle, routeType)
  const todayStr = new Date().toISOString().split('T')[0]

  const hasRoute = pickup.trim().length > 3 && dropoff.trim().length > 3
  const hasTrip = hasRoute && date && time
  const hasVehicle = hasTrip && vehicle
  const canSubmit = hasVehicle && name.trim().length > 1 && contact.trim().length > 4

  useEffect(() => {
    if (onRouteChange) onRouteChange(pickup, dropoff)
  }, [pickup, dropoff, onRouteChange])

  useEffect(() => {
    if (phase === 'route' && hasRoute) {
      clearTimeout(inputIdleRef.current)
      inputIdleRef.current = setTimeout(() => setPhase('details'), 600)
    }
    return () => clearTimeout(inputIdleRef.current)
  }, [hasRoute, phase])

  useEffect(() => {
    if (phase === 'details' && hasVehicle) {
      clearTimeout(inputIdleRef.current)
      inputIdleRef.current = setTimeout(() => setPhase('contact'), 400)
    }
    return () => clearTimeout(inputIdleRef.current)
  }, [hasVehicle, phase])

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return
    setSubmitting(true)
    try {
      const isEmail = contact.includes('@')
      const payload = {
        name,
        phone: isEmail ? '' : contact,
        email: isEmail ? contact : '',
        pickup,
        dropoff,
        ride_date: `${date}T${time}`,
        passengers,
        vehicle_type: vehicle,
      }
      const res = await api.post('/quote-requests', payload)
      const id = res.data?.data?.id || res.data?.id || null
      setPostedRide({ id, pickup, dropoff, date, time, passengers, vehicle_type: vehicle })
      setPhase('bids')
      setCountdown(600)
      setBids([])
      setNoOffersMsg(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not post ride. Please try again or call us.')
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    if (phase !== 'bids') return
    clearInterval(pollRef.current)
    clearInterval(countdownRef.current)
    clearTimeout(noOfferRef.current)

    if (postedRide?.id) {
      const poll = async () => {
        try {
          const res = await api.get(`/quote-requests/${postedRide.id}`)
          const data = res.data?.data || res.data
          if (data?.bids?.length) setBids(data.bids)
          else if (data?.bid_price) setBids([{ id: 1, operator_name: 'Everywhere Cars', price: data.bid_price, vehicle_type: data.vehicle_type, rating: 4.9, eta_minutes: data.eta_minutes || 30, notes: data.notes }])
        } catch {}
      }
      poll()
      pollRef.current = setInterval(poll, 5000)
    }

    countdownRef.current = setInterval(() => setCountdown(c => { if (c <= 1) { clearInterval(countdownRef.current); return 0 } return c - 1 }), 1000)
    noOfferRef.current = setTimeout(() => setBids(prev => { if (!prev.length) setNoOffersMsg(true); return prev }), 120000)

    return () => {
      clearInterval(pollRef.current)
      clearInterval(countdownRef.current)
      clearTimeout(noOfferRef.current)
    }
  }, [phase, postedRide])

  const handleSelectBid = (bid) => {
    const payload = { rideData: postedRide, selectedBid: bid, fromBidBoard: true }
    try { sessionStorage.setItem('pendingBidBooking', JSON.stringify(payload)) } catch {}
    if (!user) navigate('/signup', { state: payload })
    else navigate('/book', { state: payload })
  }

  const startVoice = (target) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { toast.error('Voice input not supported in this browser.'); return }
    const r = new SR(); r.lang = 'en-US'; r.interimResults = false; r.maxAlternatives = 1
    recognitionRef.current = r
    r.start(); setVoiceActive(true); setVoiceTarget(target)

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (AudioCtx) {
        navigator.mediaDevices?.getUserMedia({ audio: true }).then(stream => {
          const ctx = new AudioCtx()
          const source = ctx.createMediaStreamSource(stream)
          const analyser = ctx.createAnalyser()
          analyser.fftSize = 64
          source.connect(analyser)
          audioCtxRef.current = ctx
          analyserRef.current = analyser
          micStreamRef.current = stream
        }).catch(() => {})
      }
    } catch {}

    const cleanupAudio = () => {
      try { audioCtxRef.current?.close() } catch {}
      try { micStreamRef.current?.getTracks().forEach(t => t.stop()) } catch {}
      analyserRef.current = null
      audioCtxRef.current = null
      micStreamRef.current = null
    }

    r.onresult = (e) => {
      const t = e.results[0][0].transcript
      if (target === 'dropoff') setDropoff(t)
      else setPickup(t)
      setVoiceActive(false); setVoiceTarget(null)
      cleanupAudio()
    }
    r.onerror = () => { setVoiceActive(false); setVoiceTarget(null); cleanupAudio() }
    r.onend = () => { setVoiceActive(false); setVoiceTarget(null); cleanupAudio() }
  }

  const resetAll = () => {
    setPhase('idle'); setPickup(''); setDropoff(''); setDate(''); setTime('')
    setPassengers(1); setVehicle('sedan'); setName(''); setContact('')
    setBids([]); setPostedRide(null); setNoOffersMsg(false); setCountdown(600)
  }

  const { displayed: bidHero } = useTypewriter(
    phase === 'bids' ? 'Connecting you with NYC operators...' : '', 32
  )

  const isPhaseVisible = (p) => {
    const order = ['idle', 'route', 'details', 'contact', 'bids']
    return order.indexOf(phase) >= order.indexOf(p)
  }

  return (
    <div className="relative w-full flex items-start justify-center">

      {voiceActive && (
        <div
          className="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-2xl"
          style={{ background: 'rgba(5,10,15,0.96)', backdropFilter: 'blur(16px)' }}
        >
          <div className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 animate-pulse" style={{ background: `rgba(246,201,14,0.15)`, border: `2px solid ${GOLD}` }}>
              <FiMic size={28} style={{ color: GOLD }} />
            </div>
            <VoicePrompt target={voiceTarget} />
            <VoiceWaveform active={voiceActive} analyserRef={analyserRef} />
            <button onClick={() => { recognitionRef.current?.stop(); setVoiceActive(false) }} style={{ color: 'rgba(255,255,255,0.4)' }} className="mt-6 hover:opacity-80 text-xs transition-opacity">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div
        className="relative w-full overflow-hidden"
        style={{
          maxWidth: 660,
          background: 'var(--bg-panel)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: 'var(--border-panel)',
          borderRadius: 20,
          boxShadow: isDark
            ? '0 0 80px rgba(246,201,14,0.04), 0 25px 60px rgba(0,0,0,0.3)'
            : '0 0 40px rgba(26,54,93,0.08), 0 25px 60px rgba(0,0,0,0.12)',
          transition: 'background 300ms ease, border 300ms ease, box-shadow 300ms ease',
        }}
      >
        <div className="px-4 py-2.5 flex items-center gap-3 border-b" style={{ borderColor: 'var(--bg-field)', background: 'var(--stats-bg)' }}>
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse" style={{ background: '#22c55e' }} />
          <div className="flex items-center gap-3 text-xs font-mono overflow-hidden" style={{ color: ELECTRIC }}>
            <span className="whitespace-nowrap"><span className="font-bold">{stats.vehicles}</span> vehicles ready near NYC</span>
            <span style={{ color: 'var(--text-muted)' }}>|</span>
            <span className="whitespace-nowrap">Avg response: <span className="font-bold">{stats.response} min</span></span>
            <span className="hidden sm:block" style={{ color: 'var(--text-muted)' }}>|</span>
            <span className="whitespace-nowrap hidden sm:block">Rides today: <span className="font-bold">{stats.rides}</span></span>
          </div>
        </div>

        <div className="p-6 sm:p-8">

          {phase === 'bids' ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#22c55e' }} />
                  <span className="text-xs font-bold tracking-widest uppercase font-mono" style={{ color: 'var(--text-secondary)' }}>Ride Dispatched</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>Expires</span>
                  <CountdownTimer seconds={countdown} />
                </div>
              </div>

              <h2 className="text-lg font-bold mb-3 leading-snug min-h-[1.75rem]" style={{ color: 'var(--text-primary)' }}>
                {bidHero}<span className="inline-block w-0.5 h-4 ml-0.5 align-middle animate-pulse" style={{ background: GOLD, opacity: bidHero.length < 40 ? 1 : 0 }} />
              </h2>

              <div className="flex items-center gap-3 mb-5 p-3 rounded-xl" style={{ background: 'var(--bg-field)', border: 'var(--border-field)' }}>
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: GOLD, boxShadow: `0 0 8px ${GOLD}` }} />
                  <div className="flex flex-col gap-0.5">
                    {[0,1,2].map(i => <div key={i} className="w-0.5 h-1.5 rounded-full mx-auto" style={{ background: 'rgba(246,201,14,0.4)', animation: `dashFlow 1.4s ease-in-out ${i * 0.2}s infinite` }} />)}
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--text-secondary)' }} />
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{postedRide?.pickup}</p>
                  <p className="text-sm truncate" style={{ color: 'var(--text-muted)' }}>{postedRide?.dropoff}</p>
                </div>
              </div>

              <div className="space-y-3">
                {bids.length === 0 && (
                  <>
                    <SkeletonCard />
                    <SkeletonCard />
                    <p className="text-center text-xs font-mono animate-pulse py-2" style={{ color: 'var(--text-muted)' }}>Reviewing your request...</p>
                  </>
                )}
                {bids.map((bid, i) => {
                  const isLowest = bids.length > 1 && bid.price === Math.min(...bids.map(b => b.price))
                  return <BidCard key={bid.id || i} bid={bid} onSelect={handleSelectBid} index={i} isLowest={isLowest} />
                })}
              </div>

              {noOffersMsg && !bids.length && (
                <div className="mt-4 p-4 rounded-2xl text-center" style={{ background: 'var(--bg-field)', border: 'var(--border-field)' }}>
                  <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>Our team is reviewing your request. You will hear from us shortly.</p>
                  <div className="flex gap-2 justify-center">
                    <a href="tel:+17186586000" className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-all hover:brightness-110" style={{ background: `linear-gradient(135deg, ${GOLD}, #E8B800)`, color: '#050a0f' }}>
                      <FiPhone size={12} /> (718) 658-6000
                    </a>
                    <a href="https://wa.me/17182196683" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs bg-green-600 text-white hover:bg-green-500 transition-colors">
                      <FiMessageCircle size={12} /> WhatsApp
                    </a>
                  </div>
                </div>
              )}

              <div className="mt-4 text-center">
                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                  Need help now?{' '}
                  <a href="tel:+17186586000" className="font-semibold transition-colors hover:opacity-80" style={{ color: 'var(--text-secondary)' }}>(718) 658-6000</a>
                </p>
                <button onClick={resetAll} className="text-xs transition-colors underline" style={{ color: 'var(--text-muted)' }}>Start new search</button>
              </div>
            </div>
          ) : (
            <div>
              {phase === 'idle' && (
                <div className="mb-7">
                  <div className="text-center mb-7">
                    <img src="/logo.png?v=3" alt="Everywhere Cars" className="h-11 w-auto mx-auto mb-5 opacity-95" />
                    <h1 className="font-black mb-2" style={{ color: 'var(--text-primary)', fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                      Your Ride,{' '}
                      <span style={{ color: GOLD }}>Your Price.</span>
                    </h1>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                      Post a free request — NYC operators compete to win your ride.
                    </p>
                  </div>
                </div>
              )}

              <div style={{ transition: 'all 220ms cubic-bezier(0.4,0,0.2,1)' }}>
                {phase === 'idle' ? (
                  <div>
                    <div
                      className="relative w-full flex items-center px-4 py-3 rounded-2xl transition-all"
                      style={{ background: 'var(--bg-field)', border: 'var(--border-field)' }}
                    >
                      <FiNavigation2 size={18} style={{ color: GOLD }} className="flex-shrink-0 mr-3 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Where to?"
                        className="flex-1 bg-transparent outline-none text-lg font-medium transition-colors"
                        style={{ color: 'var(--text-muted)', minWidth: 0 }}
                        onFocus={() => setPhase('route')}
                        aria-label="Where to? Enter destination to start booking"
                        readOnly
                      />
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); startVoice('dropoff') }}
                        className="p-1.5 rounded-full transition-colors hover:opacity-80 ml-2 flex-shrink-0"
                        style={{ color: 'var(--text-muted)' }}
                        aria-label="Voice input"
                      >
                        <FiMic size={16} />
                      </button>
                    </div>
                    <div className="flex items-center justify-center gap-5 mt-4 flex-wrap">
                      {['Free to post', 'No payment now', 'Licensed drivers'].map(t => (
                        <span key={t} className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#22c55e' }} />
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div style={{ transition: 'opacity 220ms ease, transform 220ms ease' }}>
                      <div className="mb-0.5 flex items-center justify-between">
                        <span className="text-xs font-mono font-bold tracking-widest" style={{ color: ELECTRIC }}>PICKUP</span>
                        <button type="button" onClick={() => startVoice('pickup')} className="flex items-center justify-center rounded-full transition-colors hover:opacity-80" style={{ width: 44, height: 44, color: 'var(--text-muted)' }} title="Voice input" aria-label="Voice input for pickup">
                          {voiceActive && voiceTarget === 'pickup' ? <FiMicOff size={15} className="text-red-400" /> : <FiMic size={15} />}
                        </button>
                      </div>
                      <div className="dispatch-field-wrap">
                        <PlaceAutocomplete
                          id="dp-pickup"
                          name="dp-pickup"
                          value={pickup}
                          onChange={setPickup}
                          placeholder="Airport, hotel, address..."
                          className="dispatch-field pl-10"
                          icon={<FiMapPin size={15} style={{ color: GOLD }} />}
                          aria-label="Pickup location"
                        />
                      </div>
                      {(pickupAirport || pickupHotel) && (
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {pickupAirport && <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium" style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#16a34a' }}>Flight tracking included</span>}
                          {pickupHotel && <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium" style={{ background: 'rgba(14,165,233,0.12)', border: '1px solid rgba(14,165,233,0.3)', color: ELECTRIC }}>Hotel pickup confirmed</span>}
                        </div>
                      )}
                    </div>

                    <div className="h-px" style={{ background: 'var(--border-field)' }} />

                    <div style={{ transition: 'opacity 220ms ease 50ms, transform 220ms ease 50ms' }}>
                      <div className="mb-0.5 flex items-center justify-between">
                        <span className="text-xs font-mono font-bold tracking-widest" style={{ color: ELECTRIC }}>DESTINATION</span>
                        <button type="button" onClick={() => startVoice('dropoff')} className="flex items-center justify-center rounded-full transition-colors hover:opacity-80" style={{ width: 44, height: 44, color: 'var(--text-muted)' }} title="Voice input" aria-label="Voice input for destination">
                          {voiceActive && voiceTarget === 'dropoff' ? <FiMicOff size={15} className="text-red-400" /> : <FiMic size={15} />}
                        </button>
                      </div>
                      <div className="dispatch-field-wrap">
                        <PlaceAutocomplete
                          id="dp-dropoff"
                          name="dp-dropoff"
                          value={dropoff}
                          onChange={setDropoff}
                          placeholder="Manhattan, Brooklyn, airport..."
                          className="dispatch-field pl-10"
                          icon={<FiNavigation2 size={15} style={{ color: 'var(--text-muted)' }} />}
                          aria-label="Dropoff location"
                        />
                      </div>
                      {(dropoffAirport || dropoffHotel) && (
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {dropoffAirport && <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium" style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#16a34a' }}>Flight tracking included</span>}
                          {dropoffHotel && <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium" style={{ background: 'rgba(14,165,233,0.12)', border: '1px solid rgba(14,165,233,0.3)', color: ELECTRIC }}>Hotel dropoff confirmed</span>}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {isPhaseVisible('details') && phase !== 'idle' && (
                <div className="mt-4 space-y-4" style={{ animation: 'slideInUp 280ms ease forwards' }}>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-xs font-mono font-bold tracking-widest block mb-1.5" style={{ color: ELECTRIC }}>DATE</span>
                      <input
                        type="date"
                        min={todayStr}
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="dispatch-field text-sm"
                        style={{ colorScheme: isDark ? 'dark' : 'light' }}
                      />
                    </div>
                    <div>
                      <span className="text-xs font-mono font-bold tracking-widest block mb-1.5" style={{ color: ELECTRIC }}>TIME</span>
                      <input
                        type="time"
                        value={time}
                        onChange={e => setTime(e.target.value)}
                        className="dispatch-field text-sm"
                        style={{ colorScheme: isDark ? 'dark' : 'light' }}
                      />
                    </div>
                    <div>
                      <span className="text-xs font-mono font-bold tracking-widest block mb-1.5" style={{ color: ELECTRIC }}>PAX</span>
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => setPassengers(p => Math.max(1, p - 1))} className="flex items-center justify-center rounded-lg transition-colors flex-shrink-0" style={{ width: 44, height: 44, background: 'var(--bg-field)', border: 'var(--border-field)', color: 'var(--text-secondary)', minWidth: 44 }}>
                          <FiMinus size={15} />
                        </button>
                        <span className="font-bold text-sm font-mono text-center flex-shrink-0" style={{ width: 28, color: 'var(--text-primary)' }}>{passengers}</span>
                        <button type="button" onClick={() => setPassengers(p => Math.min(55, p + 1))} className="flex items-center justify-center rounded-lg transition-colors flex-shrink-0" style={{ width: 44, height: 44, background: 'var(--bg-field)', border: 'var(--border-field)', color: 'var(--text-secondary)', minWidth: 44 }}>
                          <FiPlus size={15} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {peakHour && (
                    <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', color: '#d97706' }}>
                      <FiZap size={12} />
                      Peak hour — allow 15 extra min
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold tracking-widest" style={{ color: ELECTRIC }}>VEHICLE</span>
                      {hasTrip && (
                        <span className="font-mono text-sm font-bold" style={{ color: GOLD }}>
                          {formatPriceRange(priceEst.low, priceEst.high)}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide snap-x snap-mandatory">
                      {VEHICLES.map(v => {
                        const sel = vehicle === v.id
                        return (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => setVehicle(v.id)}
                            className="flex-shrink-0 snap-start rounded-xl overflow-hidden text-left transition-all duration-200 w-24"
                            style={{
                              border: sel ? `2px solid ${GOLD}` : 'var(--border-field)',
                              background: sel ? 'rgba(246,201,14,0.1)' : 'var(--bg-field)',
                              transform: sel ? 'translateY(-2px) scale(1.02)' : 'none',
                              boxShadow: sel ? `0 8px 20px rgba(246,201,14,0.2)` : 'none',
                            }}
                          >
                            <div className="h-16 overflow-hidden">
                              <img src={v.image} alt={v.label} className="w-full h-full object-cover" loading="lazy" />
                            </div>
                            <div className="px-2 py-1.5">
                              <div className="font-bold text-xs flex items-center justify-between" style={{ color: 'var(--text-primary)' }}>
                                {v.label}
                                {sel && <FiCheckCircle size={10} style={{ color: GOLD }} />}
                              </div>
                              <div className="font-mono" style={{ color: 'var(--text-muted)', fontSize: 10 }}>{v.capacity} pax</div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {isPhaseVisible('contact') && phase !== 'idle' && (
                <div className="mt-4 space-y-3" style={{ animation: 'slideInUp 280ms ease forwards' }}>
                  <div className="h-px" style={{ background: 'var(--bg-field)' }} />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-xs font-mono font-bold tracking-widest block mb-1.5" style={{ color: ELECTRIC }}>NAME</span>
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Full name"
                        className="dispatch-field text-sm"
                      />
                    </div>
                    <div>
                      <span className="text-xs font-mono font-bold tracking-widest block mb-1.5" style={{ color: ELECTRIC }}>PHONE / EMAIL</span>
                      <input
                        type="text"
                        value={contact}
                        onChange={e => setContact(e.target.value)}
                        placeholder="(718) 000-0000"
                        className="dispatch-field text-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!canSubmit || submitting}
                    className="w-full py-4 rounded-2xl font-black text-sm tracking-wider flex items-center justify-center gap-2 transition-all duration-220 active:scale-[0.98]"
                    style={{
                      background: canSubmit && !submitting
                        ? `linear-gradient(135deg, ${GOLD} 0%, #E8B800 100%)`
                        : 'var(--bg-field)',
                      color: canSubmit && !submitting ? '#050a0f' : 'var(--text-muted)',
                      boxShadow: canSubmit && !submitting ? '0 0 24px rgba(246,201,14,0.35), 0 8px 20px rgba(0,0,0,0.18)' : 'none',
                      letterSpacing: '0.05em',
                      cursor: canSubmit && !submitting ? 'pointer' : 'not-allowed',
                      animation: canSubmit && !submitting ? 'goldPulse 2.5s ease-in-out infinite' : 'none',
                    }}
                  >
                    {submitting ? (
                      <><FiRefreshCw size={16} className="animate-spin" /> Dispatching...</>
                    ) : (
                      <>DISPATCH MY RIDE <FiArrowRight size={16} /></>
                    )}
                  </button>
                </div>
              )}

              {phase !== 'idle' && phase !== 'bids' && (
                <p className="text-center text-xs mt-3 font-mono" style={{ color: 'var(--text-muted)' }}>
                  No payment required · Price confirmed in minutes
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .dispatch-field {
          width: 100%;
          background: var(--bg-field);
          border: var(--border-field);
          color: var(--text-primary);
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
          font-size: 0.9rem;
          outline: none;
          transition: border-color 220ms cubic-bezier(0.4,0,0.2,1), background 220ms, color 300ms;
        }
        .dispatch-field::placeholder { color: var(--text-muted); }
        .dispatch-field:focus {
          border-color: rgba(246,201,14,0.5);
          background: var(--bg-field-hover);
        }
        .dispatch-field-wrap .absolute.left-3 { z-index: 10; }
        .dispatch-field-wrap .dispatch-field { padding-left: 2.5rem; }
        .dispatch-field-wrap ul {
          background: var(--bg-surface);
          border: var(--border-field);
          border-radius: 0.75rem;
          overflow: hidden;
        }
        .dispatch-field-wrap ul li {
          color: var(--text-secondary);
          border-bottom: 1px solid var(--bg-field);
          padding: 0.65rem 1rem;
          font-size: 0.8rem;
        }
        .dispatch-field-wrap ul li:hover,
        .dispatch-field-wrap ul li[aria-selected="true"] {
          background: rgba(246,201,14,0.12);
          color: #F6C90E;
        }
      `}</style>
    </div>
  )
}
