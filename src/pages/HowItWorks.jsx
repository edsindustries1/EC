import React from 'react'
import { Link } from 'react-router-dom'
import { FiCheck, FiArrowRight } from 'react-icons/fi'

const HowItWorks = () => {
  const steps = [
    { number: 1, title: 'Book Your Ride', description: 'Enter your pickup and dropoff locations' },
    { number: 2, title: 'Get Quotes', description: 'Receive transparent price quotes from drivers' },
    { number: 3, title: 'Confirm', description: 'Choose your preferred driver and confirm' },
    { number: 4, title: 'Enjoy', description: 'Sit back and enjoy your safe, comfortable ride' },
  ]

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-primary-800 to-primary-900 text-white section-padding">
        <div className="container-custom">
          <h1 className="text-5xl font-bold mb-4">How It Works</h1>
          <p className="text-xl text-gray-200 max-w-2xl">
            Everywhere Cars makes booking your ride simple and transparent
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary-800 text-white flex items-center justify-center font-bold text-2xl mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 section-padding">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">For Customers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              'Book rides on your schedule',
              'Transparent pricing before you book',
              'Multiple payment options',
              'Real-time ride tracking',
              'Rate and review drivers',
              ' Emergency support 24/7',
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <FiCheck className="w-6 h-6 text-primary-800 flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">For Operators</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              'Manage all ride requests from one dashboard',
              'Set your own pricing strategy',
              'Assign drivers efficiently',
              'Track revenue and analytics',
              'Manage driver workforce',
              'Automated billing and payouts',
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <FiCheck className="w-6 h-6 text-primary-800 flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary-800 text-white section-padding">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <Link to="/signup" className="btn-primary inline-flex items-center gap-2">
            Sign Up Now <FiArrowRight />
          </Link>
        </div>
      </section>
    </div>
  )
}

export default HowItWorks
