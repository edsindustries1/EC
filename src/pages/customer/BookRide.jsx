import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FiMapPin, FiPhone, FiCheckCircle } from 'react-icons/fi'
import PlaceAutocomplete from '../../components/PlaceAutocomplete'

const BookRide = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const stateData = location.state || null
  const sessionData = (() => {
    try { const s = sessionStorage.getItem('pendingBidBooking'); return s ? JSON.parse(s) : null; } catch { return null; }
  })()
  const incoming = stateData || sessionData || {}
  const prefillRide = incoming.rideData || null
  const prefillBid = incoming.selectedBid || null

  React.useEffect(() => {
    if (incoming.fromBidBoard) {
      try { sessionStorage.removeItem('pendingBidBooking'); } catch {}
    }
  }, [])

  const [pickup, setPickup] = useState(prefillRide?.pickup || '')
  const [dropoff, setDropoff] = useState(prefillRide?.dropoff || '')

  if (prefillBid && prefillRide) {
    return (
      <div className="min-h-screen bg-gray-50 section-padding">
        <div className="container-custom max-w-2xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Confirm Your Booking</h1>
          <p className="text-gray-500 mb-8">Review your trip details and selected offer below.</p>

          <div className="card mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FiCheckCircle className="text-green-500" /> Trip Summary
            </h2>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <FiMapPin size={14} className="mt-0.5 text-blue-600 flex-shrink-0" />
                <div><span className="font-medium">Pickup:</span> {prefillRide.pickup}</div>
              </div>
              <div className="flex items-start gap-2">
                <FiMapPin size={14} className="mt-0.5 text-gray-400 flex-shrink-0" />
                <div><span className="font-medium">Dropoff:</span> {prefillRide.dropoff}</div>
              </div>
              {prefillRide.date && (
                <div><span className="font-medium">Date/Time:</span> {prefillRide.date} {prefillRide.time}</div>
              )}
              {prefillRide.passengers && (
                <div><span className="font-medium">Passengers:</span> {prefillRide.passengers}</div>
              )}
              {prefillRide.vehicle_type && (
                <div><span className="font-medium">Vehicle:</span> {prefillRide.vehicle_type}</div>
              )}
            </div>
          </div>

          <div className="card mb-6 border-2 border-yellow-400/50 bg-yellow-50">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Selected Offer</h2>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-bold text-gray-900 text-lg">{prefillBid.operator_name || 'Everywhere Cars'}</div>
                <div className="text-gray-500 text-sm mt-1">{prefillBid.vehicle_type || 'Premium Vehicle'}</div>
                <div className="text-gray-500 text-sm">Ready in ~{prefillBid.eta_minutes || 30} min</div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-yellow-600">${prefillBid.price}</div>
                <div className="text-gray-400 text-xs">fixed price</div>
              </div>
            </div>
            {prefillBid.notes && (
              <p className="mt-3 text-sm text-gray-500 italic bg-white rounded-lg px-3 py-2">
                "{prefillBid.notes}"
              </p>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 text-sm text-blue-800 mb-6">
            <p className="font-semibold mb-1">Ready to confirm?</p>
            <p>Call or message us to complete your booking. Our team will confirm availability and payment details.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="tel:+17186586000"
              className="flex-1 flex items-center justify-center gap-2 bg-[#1a365d] text-white font-bold py-4 rounded-xl hover:bg-[#0f1f3d] transition-colors text-base"
            >
              <FiPhone size={16} /> Call to Confirm
            </a>
            <a
              href="https://wa.me/17182196683"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-500 transition-colors text-base"
            >
              WhatsApp Confirm
            </a>
          </div>

          <button
            onClick={() => navigate('/')}
            className="mt-4 w-full text-gray-400 hover:text-gray-600 text-sm py-2 transition-colors"
          >
            ← Start over
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 section-padding">
      <div className="container-custom max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Book Your Ride</h1>

        <div className="card">
          <form className="space-y-6">
            <div>
              <label htmlFor="bookride-pickup" className="label-base">Pickup Location</label>
              <PlaceAutocomplete
                id="bookride-pickup"
                name="pickup_location"
                value={pickup}
                onChange={setPickup}
                placeholder="Enter pickup location"
                className="input-base pl-10"
                icon={<FiMapPin className="w-5 h-5 text-gray-400" />}
                required
                aria-label="Pickup location"
              />
            </div>

            <div>
              <label htmlFor="bookride-dropoff" className="label-base">Dropoff Location</label>
              <PlaceAutocomplete
                id="bookride-dropoff"
                name="dropoff_location"
                value={dropoff}
                onChange={setDropoff}
                placeholder="Enter dropoff location"
                className="input-base pl-10"
                icon={<FiMapPin className="w-5 h-5 text-gray-400" />}
                required
                aria-label="Dropoff location"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-base">Ride Type</label>
                <select className="input-base">
                  <option>Standard</option>
                  <option>Premium</option>
                  <option>Shared</option>
                </select>
              </div>

              <div>
                <label className="label-base">Passengers</label>
                <select className="input-base">
                  <option>1 Passenger</option>
                  <option>2 Passengers</option>
                  <option>3 Passengers</option>
                  <option>4+ Passengers</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full">
              Get Price Quotes
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default BookRide
