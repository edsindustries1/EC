import React from 'react'
import { FiDollarSign, FiTrendingUp, FiCalendar } from 'react-icons/fi'

const Revenue = () => {
  return (
    <div className="min-h-screen bg-gray-50 section-padding">
      <div className="container-custom">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Revenue Reports</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-2">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">$456,232</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <FiDollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-2">This Month</p>
                <p className="text-3xl font-bold text-gray-900">$38,450</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <FiCalendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-2">Growth Rate</p>
                <p className="text-3xl font-bold text-gray-900">+18%</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <FiTrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Revenue by Operator</h2>
          <p className="text-gray-600">Detailed breakdown coming soon...</p>
        </div>
      </div>
    </div>
  )
}

export default Revenue
