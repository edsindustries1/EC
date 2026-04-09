import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import {
  FiMapPin,
  FiCalendar,
  FiUsers,
  FiChevronRight,
  FiPlus,
  FiCheck,
  FiX,
  FiStar,
  FiPhone,
  FiTruck,
} from 'react-icons/fi';
import StatusBadge from '../../components/StatusBadge';

const MyRides = () => {
  const navigate = useNavigate();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [processingId, setProcessingId] = useState(null);

  const filters = ['All', 'Pending Quote', 'Quoted', 'Confirmed', 'In Progress', 'Completed'];

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    setLoading(true);
    try {
      const response = await api.get('/rides');
      setRides(response.data);
    } catch (error) {
      console.error('Failed to fetch rides:', error);
      toast.error('Failed to load rides');
    } finally {
      setLoading(false);
    }
  };

  const filterRides = () => {
    if (selectedFilter === 'All') return rides;
    if (selectedFilter === 'Pending Quote') return rides.filter((r) => r.status === 'requested');
    if (selectedFilter === 'Quoted') return rides.filter((r) => r.status === 'quoted');
    if (selectedFilter === 'Confirmed') return rides.filter((r) => r.status === 'confirmed');
    if (selectedFilter === 'In Progress') return rides.filter((r) => r.status === 'in_progress');
    if (selectedFilter === 'Completed') return rides.filter((r) => r.status === 'completed');
    return rides;
  };

  const handleAcceptQuote = async (rideId) => {
    setProcessingId(rideId);
    try {
      await api.put(`/rides/${rideId}/accept-quote`);
      toast.success('Quote accepted! Proceeding to payment...');
      setTimeout(() => navigate(`/rides/${rideId}`), 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept quote');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeclineQuote = async (rideId) => {
    if (window.confirm('Are you sure you want to decline this quote?')) {
      setProcessingId(rideId);
      try {
        await api.put(`/rides/${rideId}/decline-quote`);
        toast.success('Quote declined');
        fetchRides();
      } catch (error) {
        toast.error('Failed to decline quote');
      } finally {
        setProcessingId(null);
      }
    }
  };

  const filteredRides = filterRides();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Rides</h1>
              <p className="text-gray-600 mt-1">Track and manage all your transportation requests</p>
            </div>
            <button
              onClick={() => navigate('/book')}
              className="flex items-center bg-[#1a365d] text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-[#0f1f3d] transition"
            >
              <FiPlus className="mr-2" />
              Book New Ride
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-3 -mx-4 px-4 overflow-x-auto">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                  selectedFilter === filter
                    ? 'bg-[#1a365d] text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a365d]"></div>
            </div>
            <p className="text-gray-600 mt-4">Loading your rides...</p>
          </div>
        ) : filteredRides.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-5xl mb-4">🚗</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No rides yet</h3>
            <p className="text-gray-600 mb-6">Book your first ride to get started with Everywhere Cars</p>
            <button
              onClick={() => navigate('/book')}
              className="inline-flex items-center bg-[#1a365d] text-white font-semibold py-2.5 px-8 rounded-lg hover:bg-[#0f1f3d] transition"
            >
              <FiPlus className="mr-2" />
              Book Your First Ride
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRides.map((ride) => (
              <div key={ride.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden">
                <div className="p-6">
                  {/* Route and Basic Info */}
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                    {/* Route */}
                    <div className="flex-1">
                      <div className="flex items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center text-lg font-semibold text-gray-900 mb-2">
                            <FiMapPin className="text-[#1a365d] mr-2 flex-shrink-0" />
                            {ride.pickup_location}
                          </div>
                          <div className="flex items-center text-xs text-gray-500 py-2 ml-6">
                            <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
                          </div>
                          <div className="flex items-center text-lg font-semibold text-gray-900 ml-6">
                            <FiMapPin className="text-[#1a365d] mr-2 flex-shrink-0" />
                            {ride.destination}
                          </div>
                        </div>
                      </div>

                      {/* Date and Time */}
                      <div className="flex flex-wrap gap-4 mt-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <FiCalendar className="mr-2 text-[#1a365d]" />
                          {format(parseISO(ride.scheduled_date), 'MMM dd, yyyy')} at{' '}
                          {format(parseISO(`2000-01-01T${ride.scheduled_time}`), 'h:mm a')}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <FiUsers className="mr-2 text-[#1a365d]" />
                          {ride.passengers} {ride.passengers === 1 ? 'Passenger' : 'Passengers'}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <FiTruck className="mr-2 text-[#1a365d]" />
                          {ride.vehicle_type}
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Status and Actions */}
                    <div className="flex flex-col items-end gap-3">
                      <StatusBadge status={ride.status} />

                      {/* Show Price for Quoted Status */}
                      {ride.status === 'quoted' && ride.quoted_price && (
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Quoted Price</p>
                          <p className="text-2xl font-bold text-[#1a365d]">${ride.quoted_price.toFixed(2)}</p>
                        </div>
                      )}

                      {/* Driver Info for In Progress/Assigned */}
                      {(ride.status === 'assigned' || ride.status === 'in_progress') && ride.driver && (
                        <div className="text-right text-sm">
                          <p className="text-gray-600">Driver</p>
                          <p className="font-semibold text-gray-900">{ride.driver.name}</p>
                          <p className="text-gray-500 text-xs">{ride.driver.vehicle_type}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-200">
                    {ride.status === 'quoted' && (
                      <>
                        <button
                          onClick={() => handleAcceptQuote(ride.id)}
                          disabled={processingId === ride.id}
                          className="flex-1 md:flex-none flex items-center justify-center bg-green-500 text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FiCheck className="mr-2" />
                          {processingId === ride.id ? 'Processing...' : 'Accept & Pay'}
                        </button>
                        <button
                          onClick={() => handleDeclineQuote(ride.id)}
                          disabled={processingId === ride.id}
                          className="flex-1 md:flex-none flex items-center justify-center bg-gray-300 text-gray-700 font-semibold py-2.5 px-6 rounded-lg hover:bg-gray-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FiX className="mr-2" />
                          Decline
                        </button>
                      </>
                    )}

                    {ride.status === 'completed' && !ride.rating && (
                      <button
                        onClick={() => navigate(`/rides/${ride.id}`)}
                        className="flex-1 md:flex-none flex items-center justify-center bg-yellow-500 text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-yellow-600 transition"
                      >
                        <FiStar className="mr-2" />
                        Rate This Ride
                      </button>
                    )}

                    {(ride.status === 'assigned' || ride.status === 'in_progress') && ride.driver && (
                      <a
                        href={`tel:${ride.driver.phone}`}
                        className="flex-1 md:flex-none flex items-center justify-center bg-blue-500 text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-blue-600 transition"
                      >
                        <FiPhone className="mr-2" />
                        Call Driver
                      </a>
                    )}

                    <button
                      onClick={() => navigate(`/rides/${ride.id}`)}
                      className="flex-1 md:flex-none flex items-center justify-center bg-[#1a365d] text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-[#0f1f3d] transition"
                    >
                      View Details
                      <FiChevronRight className="ml-2" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRides;
