/**
 * /post-ride — auth-gated form where customers post a ride request for
 * operators to bid on. Style mirrors the uber B&W system.
 */
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiMapPin, FiCalendar, FiClock, FiUsers,
  FiTruck, FiArrowRight, FiDollarSign, FiCheck,
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import api from '../utils/api'
import PlaceAutocomplete from '../components/PlaceAutocomplete'
import { useAuth } from '../context/AuthContext'
import { Page } from '../components/uber'
import { BLACK, WHITE, GRAY_50, GRAY_100, GRAY_500, FONT, inputStyle } from '../styles/uber'
import SlideToConfirm from '../components/SlideToConfirm'

const VEHICLE_TYPES = [
  { id: 'sedan',         label: 'Sedan',    pax: 'Up to 3' },
  { id: 'suv',           label: 'SUV',      pax: 'Up to 5' },
  { id: 'sprinter_van',  label: 'Sprinter', pax: 'Up to 14' },
  { id: 'mini_bus',      label: 'Shuttle',  pax: 'Up to 24' },
  { id: 'coach',         label: 'Coach',    pax: 'Up to 55' },
]

function defaultDate() {
  const d = new Date(); d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

export default function PostRide() {
  const navigate = useNavigate()
  const { isAuthenticated, loading: authLoading } = useAuth() || {}

  const [pickup, setPickup]     = useState('')
  const [dropoff, setDropoff]   = useState('')
  const [rideDate, setRideDate] = useState(defaultDate())
  const [pickupTime, setPickupTime] = useState('14:00')
  const [passengers, setPassengers] = useState(2)
  const [vehicleType, setVehicleType] = useState('sedan')
  const [budgetMax, setBudgetMax] = useState('')
  const [notes, setNotes]       = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Redirect to OTP signup if not authenticated
  if (!authLoading && !isAuthenticated) {
    setTimeout(() => navigate('/verify', { state: { returnTo: '/post-ride' } }), 0)
    return (
      <Page narrow>
        <p style={{ color: GRAY_500, textAlign: 'center', padding: '40px 0' }}>
          Sign in to post your ride…
        </p>
      </Page>
    )
  }

  // Returns true on a successful API post, false otherwise. Used by
  // both the legacy form submit handler and the SlideToConfirm widget;
  // callers decide UI flow based on the boolean result.
  const submit = async (e) => {
    e?.preventDefault?.()
    if (!pickup.trim() || !dropoff.trim()) {
      toast.error('Please enter pickup and drop-off')
      return false
    }
    setSubmitting(true)
    try {
      const { data } = await api.post('/ride-requests', {
        pickup, dropoff,
        ride_date: rideDate, pickup_time: pickupTime,
        passengers: Number(passengers),
        vehicle_type: vehicleType,
        notes,
        budget_max: budgetMax ? Number(budgetMax) : null,
      })
      toast.success('Posted — operators will start bidding shortly')
      navigate(`/ride-request/${data.data.id}`)
      return true
    } catch (err) {
      // Surface a useful message — server text first, axios fallback,
      // then a final generic. Log to console for native debug logs.
      const serverMsg = err?.response?.data?.message || err?.response?.data?.error
      const code = err?.response?.status
      const generic = err?.message || 'Could not post ride'
      const final = serverMsg
        ? `${serverMsg}${code ? ` (HTTP ${code})` : ''}`
        : code ? `Server returned HTTP ${code}` : generic
      console.error('[post-ride] failed:', { code, serverMsg, err })
      toast.error(final)
      return false
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Page narrow>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: GRAY_500, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
          Get offers
        </p>
        <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 12 }}>
          Post your ride. Get offers from our operators.
        </h1>
        <p style={{ color: GRAY_500, fontSize: 15, lineHeight: 1.5, marginBottom: 28 }}>
          Tell us where you're going. Vetted operators will bid with their best price. Pay only when you accept one.
        </p>

        <form onSubmit={submit} data-postride-form style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <Field label="Pickup" icon={FiMapPin}>
              <PlaceAutocomplete
                value={pickup}
                onChange={setPickup}
                placeholder="Pickup address, airport, hotel…"
                className="ec-mobile-place-input"
              />
            </Field>
            <Divider/>
            <Field label="Drop-off" icon={FiMapPin}>
              <PlaceAutocomplete
                value={dropoff}
                onChange={setDropoff}
                placeholder="Drop-off address, airport, hotel…"
                className="ec-mobile-place-input"
              />
            </Field>
          </Card>

          <Card>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date" icon={FiCalendar}>
                <input type="date" value={rideDate} onChange={(e) => setRideDate(e.target.value)} style={inputStyle()}/>
              </Field>
              <Field label="Time" icon={FiClock}>
                <input type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} style={inputStyle()}/>
              </Field>
            </div>
            <Divider/>
            <Field label="Passengers" icon={FiUsers}>
              <select value={passengers} onChange={(e) => setPassengers(Number(e.target.value))} style={inputStyle()}>
                {[1,2,3,4,5,6,8,10,14,20,30,55].map(n => <option key={n} value={n}>{n} passenger{n > 1 ? 's' : ''}</option>)}
              </select>
            </Field>
          </Card>

          <Card>
            <Label icon={FiTruck}>Vehicle preference</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" style={{ marginTop: 8 }}>
              {VEHICLE_TYPES.map(v => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVehicleType(v.id)}
                  style={{
                    padding: '14px 18px',
                    border: `1.5px solid ${vehicleType === v.id ? BLACK : GRAY_100}`,
                    borderRadius: 999,
                    background: vehicleType === v.id ? BLACK : WHITE,
                    color:      vehicleType === v.id ? WHITE : BLACK,
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'all 180ms cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{v.label}</div>
                      <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>{v.pax}</div>
                    </span>
                    {vehicleType === v.id && <FiCheck size={16}/>}
                  </div>
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <Field label="Max budget (optional)" icon={FiDollarSign}>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: 12, color: GRAY_500, fontSize: 14, fontWeight: 600 }}>$</span>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  placeholder="150"
                  style={{ ...inputStyle(), paddingLeft: 24 }}
                />
              </div>
              <p style={{ fontSize: 12, color: GRAY_500, marginTop: 6 }}>
                Operators won't see this — used to filter offers automatically.
              </p>
            </Field>
            <Divider/>
            <Field label="Notes (optional)">
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Flight info, child seats, meeting point, special requests…"
                style={inputStyle()}
              />
            </Field>
          </Card>

          {/* iPhone-style slide-to-confirm. Friction prevents accidental
              posts; haptic confirms the commitment at the threshold.
              submit() now returns true/false — we forward that result
              directly so the slide springs back on any failure. */}
          <SlideToConfirm
            label="Slide to post ride"
            doneLabel="Posted!"
            busy={submitting}
            onConfirm={async () => {
              if (!pickup.trim() || !dropoff.trim()) {
                toast.error('Please enter pickup and drop-off')
                return false
              }
              if (!rideDate)   { toast.error('Please pick a date');  return false }
              if (!pickupTime) { toast.error('Please pick a time');  return false }
              // submit() returns true on success, false on any failure.
              // The toast in submit() reports the actual server reason.
              return await submit()
            }}
          />

          <p style={{ fontSize: 12, color: GRAY_500, textAlign: 'center', marginTop: 8 }}>
            Free to post · You only pay when you accept an offer
          </p>
        </form>
      </div>
    </Page>
  )
}

function Card({ children }) {
  return <div style={{ background: WHITE, border: `1px solid ${GRAY_100}`, borderRadius: 12, padding: 20 }}>{children}</div>
}
function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <Label icon={Icon}>{label}</Label>
      {children}
    </div>
  )
}
function Label({ icon: Icon, children }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: GRAY_500, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
      {Icon && <Icon size={11}/>}
      {children}
    </label>
  )
}
function Divider() { return <div style={{ height: 1, background: GRAY_100, margin: '16px 0' }}/> }
