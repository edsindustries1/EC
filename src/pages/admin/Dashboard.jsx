import React from 'react'
import { StatsCard } from '../../components'
import { FiBarChart2, FiUsers, FiTrendingUp, FiDollarSign } from 'react-icons/fi'

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 section-padding">
      <div className="container-custom">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Users"
            value="2,456"
            icon={FiUsers}
            color="blue"
            change={8}
          />
          <StatsCard
            title="Total Rides"
            value="12,890"
            icon={FiBarChart2}
            color="green"
            change={24}
          />
          <StatsCard
            title="Active Operators"
            value="156"
            icon={FiTrendingUp}
            color="purple"
            change={5}
          />
          <StatsCard
            title="Total Revenue"
            value="$456,232"
            icon={FiDollarSign}
            color="orange"
            change={18}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">System Overview</h2>
            <p className="text-gray-600">Analytics and charts coming soon...</p>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Admin Links</h2>
            <ul className="space-y-2">
              <li>
                <a href="/admin/users" className="text-primary-800 hover:text-primary-900">
                  Manage Users
                </a>
              </li>
              <li>
                <a href="/admin/revenue" className="text-primary-800 hover:text-primary-900">
                  Revenue Reports
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
