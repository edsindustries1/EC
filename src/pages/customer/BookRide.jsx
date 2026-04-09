import React from 'react'
import { FiMapPin, FiClock, FiUsers } from 'react-icons/fi'

const BookRide = () => {
  return (
    <div className="min-h-screen bg-gray-50 section-padding">
      <div className="container-custom max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Book Your Ride</h1>

        <div className="card">
          <form className="space-y-6">
            <div>
              <label className="label-base">Pickup Location</label>
              <div className="relative">
                <FiMapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter pickup location"
                  className="input-base pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label-base">Dropoff Location</label>
              <div className="relative">
                <FiMapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter dropoff location"
                  className="input-base pl-10"
                  required
                />
              </div>
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
