import React from 'react'

const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-primary-100 rounded-full" />
        <div className="absolute inset-0 border-4 border-transparent border-t-primary-800 rounded-full animate-spin" />
      </div>
      {text && <p className="text-gray-600 font-medium">{text}</p>}
    </div>
  )
}

export default LoadingSpinner
