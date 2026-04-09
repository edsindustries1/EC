import React, { useState } from 'react'
import { FiMapPin, FiClock, FiUsers } from 'react-icons/fi'
import PlaceAutocomplete from '../../components/PlaceAutocomplete'

const BookRide = () => {
  const [pickup, setPickup] = useState('')
  const [dropoff, setDropoff] = useState('')

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
