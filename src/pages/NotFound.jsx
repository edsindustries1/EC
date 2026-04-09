import React from 'react'
import { Link } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center section-padding">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary-800">404</h1>
          <p className="text-2xl font-semibold text-gray-900 mt-4">Page Not Found</p>
        </div>
        <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
          Sorry, the page you're looking for doesn't exist. Let's get you back on track.
        </p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2">
          <FiArrowLeft /> Back to Home
        </Link>
      </div>
    </div>
  )
}

export default NotFound
