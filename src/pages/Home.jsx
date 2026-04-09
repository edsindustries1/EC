import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../utils/api';
import {
  FiMapPin,
  FiCalendar,
  FiClock,
  FiUsers,
  FiArrowRight,
  FiCheck,
  FiPhone,
  FiStar,
  FiTruck,
} from 'react-icons/fi';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [formData, setFormData] = useState({
    pickup_location: '',
    destination: '',
    date: '',
    time: '',
    passengers: 1,
    vehicle_type: 'Sedan',
    special_instructions: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.pickup_location || !formData.destination || !formData.date || !formData.time) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/rides', formData);
      toast.success('Ride request submitted! Check your quotes.');
      navigate('/my-rides');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create ride request');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpClick = () => {
    navigate('/signup');
  };

  const vehicles = [
    {
      type: 'Sedan',
      icon: '🚗',
      passengers: '1-3',
      description: 'Comfortable and reliable for small groups',
    },
    {
      type: 'SUV',
      icon: '🚙',
      passengers: '1-5',
      description: 'Extra space and luxury for business travel',
    },
    {
      type: 'Van',
      icon: '🚐',
      passengers: '6-10',
      description: 'Perfect for families and group outings',
    },
    {
      type: 'Sprinter',
      icon: '🚌',
      passengers: '10-14',
      description: 'Spacious modern transport for larger groups',
    },
    {
      type: 'Bus',
      icon: '🚎',
      passengers: '15-50',
      description: 'Complete charter solution for large events',
    },
  ];

  const features = [
    {
      title: 'Competitive Pricing',
      description: 'Get the best rates without hidden fees',
    },
    {
      title: 'Professional Drivers',
      description: 'Vetted and experienced transportation experts',
    },
    {
      title: '450+ Vehicle Fleet',
      description: 'From sedan to charter buses, we have it all',
    },
    {
      title: '24/7 Customer Support',
      description: 'Always here when you need us',
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative min-h-screen bg-gradient-to-br from-[#1a365d] via-[#2d5a8c] to-[#1a365d] overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Heading and subtext */}
            <div className="text-white">
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Your Ride,
                <br />
                Your Price
              </h1>
              <p className="text-lg text-gray-100 mb-8 max-w-md">
                Premium transportation service across the United States. Post your trip and receive a competitive quote within minutes.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <FiStar className="text-yellow-400 mr-2" />
                  <span className="text-sm font-semibold">4.9★ Rating</span>
                </div>
                <div className="text-gray-300">|</div>
                <span className="text-sm">10,000+ Rides Completed</span>
              </div>
            </div>

            {/* Right side - Booking Form */}
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Book Your Ride</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Pickup Location */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pickup Location *
                  </label>
                  <div className="relative">
                    <FiMapPin className="absolute left-3 top-3 text-[#1a365d]" />
                    <input
                      type="text"
                      name="pickup_location"
                      value={formData.pickup_location}
                      onChange={handleInputChange}
                      placeholder="Enter pickup address"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d]"
                    />
                  </div>
                </div>

                {/* Destination */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Destination *
                  </label>
                  <div className="relative">
                    <FiMapPin className="absolute left-3 top-3 text-[#1a365d]" />
                    <input
                      type="text"
                      name="destination"
                      value={formData.destination}
                      onChange={handleInputChange}
                      placeholder="Enter destination address"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d]"
                    />
                  </div>
                </div>

                {/* Date and Time Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Date *
                    </label>
                    <div className="relative">
                      <FiCalendar className="absolute left-3 top-3 text-[#1a365d]" />
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Time *
                    </label>
                    <div className="relative">
                      <FiClock className="absolute left-3 top-3 text-[#1a365d]" />
                      <input
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d]"
                      />
                    </div>
                  </div>
                </div>

                {/* Passengers and Vehicle Type Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Passengers *
                    </label>
                    <div className="relative">
                      <FiUsers className="absolute left-3 top-3 text-[#1a365d]" />
                      <input
                        type="number"
                        name="passengers"
                        min="1"
                        max="50"
                        value={formData.passengers}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Vehicle Type *
                    </label>
                    <select
                      name="vehicle_type"
                      value={formData.vehicle_type}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d]"
                    >
                      <option>Sedan</option>
                      <option>SUV</option>
                      <option>Van</option>
                      <option>Sprinter</option>
                      <option>Bus</option>
                    </select>
                  </div>
                </div>

                {/* Special Instructions Toggle */}
                <button
                  type="button"
                  onClick={() => setShowNotes(!showNotes)}
                  className="text-sm text-[#1a365d] font-semibold hover:underline flex items-center"
                >
                  + Add Special Instructions
                </button>

                {/* Special Instructions Textarea */}
                {showNotes && (
                  <div>
                    <textarea
                      name="special_instructions"
                      value={formData.special_instructions}
                      onChange={handleInputChange}
                      placeholder="Any special requests or instructions?"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d] resize-none"
                      rows="3"
                    />
                  </div>
                )}

                {/* Submit Button */}
                {user ? (
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#1a365d] text-white font-bold py-3 rounded-lg hover:bg-[#0f1f3d] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Submitting...' : 'Request a Quote'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSignUpClick}
                    className="w-full bg-[#1a365d] text-white font-bold py-3 rounded-lg hover:bg-[#0f1f3d] transition"
                  >
                    Sign Up to Book
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connection lines */}
            <div className="hidden md:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-[#1a365d] to-transparent"></div>
            <div className="hidden md:block absolute top-24 left-1/3 right-0 h-1 bg-gradient-to-r from-[#1a365d] to-transparent"></div>
            <div className="hidden md:block absolute top-24 left-2/3 right-0 h-1 bg-gradient-to-r from-[#1a365d] to-transparent"></div>

            {[
              {
                step: 1,
                title: 'Request a Ride',
                description: "Tell us where you're going and when with just a few clicks",
              },
              {
                step: 2,
                title: 'Get Your Quote',
                description: 'Our team reviews your request and sends a competitive price',
              },
              {
                step: 3,
                title: 'Enjoy Your Ride',
                description: 'Confirm, pay, and ride with a verified professional driver',
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="bg-white rounded-xl shadow-lg p-8 text-center relative z-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1a365d] text-white rounded-full font-bold text-xl mb-6">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vehicle Fleet Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Our Fleet</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {vehicles.map((vehicle) => (
              <div key={vehicle.type} className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition">
                <div className="text-5xl mb-4">{vehicle.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{vehicle.type}</h3>
                <p className="text-sm text-[#1a365d] font-semibold mb-3">{vehicle.passengers} passengers</p>
                <p className="text-sm text-gray-600">{vehicle.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Us Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Why Choose Everywhere Cars?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-8">
                <div className="flex items-center justify-center w-12 h-12 bg-[#1a365d] text-white rounded-lg mb-4">
                  <FiCheck size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-[#1a365d] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold">450+</div>
              <div className="text-sm text-gray-300">Professional Drivers</div>
            </div>
            <div>
              <div className="text-3xl font-bold">10,000+</div>
              <div className="text-sm text-gray-300">Rides Completed</div>
            </div>
            <div>
              <div className="text-3xl font-bold">100+</div>
              <div className="text-sm text-gray-300">Cities Served</div>
            </div>
            <div>
              <div className="text-3xl font-bold">4.9★</div>
              <div className="text-sm text-gray-300">Average Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Ready for Your Premium Ride?</h2>
          <p className="text-lg text-gray-600 mb-8">Join thousands of satisfied customers who trust Everywhere Cars</p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center bg-[#1a365d] text-white font-bold py-3 px-8 rounded-lg hover:bg-[#0f1f3d] transition"
          >
            Get Started <FiArrowRight className="ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
