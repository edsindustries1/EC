import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { LoadingSpinner } from '../components'

const Profile = () => {
  const { user, logout } = useAuth()
  const [isEditing, setIsEditing] = useState(false)

  if (!user) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-gray-50 section-padding">
      <div className="container-custom max-w-2xl">
        <div className="card">
          <div className="flex items-start justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn-secondary text-sm"
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label-base">Name</label>
              <p className="text-gray-700">{user.name}</p>
            </div>
            <div>
              <label className="label-base">Email</label>
              <p className="text-gray-700">{user.email}</p>
            </div>
            <div>
              <label className="label-base">Phone</label>
              <p className="text-gray-700">{user.phone || 'Not provided'}</p>
            </div>
            <div>
              <label className="label-base">Role</label>
              <p className="text-gray-700 capitalize">{user.role}</p>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-6 pt-6">
            <button
              onClick={logout}
              className="btn-secondary text-red-600 border-red-200 hover:bg-red-50 w-full"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
