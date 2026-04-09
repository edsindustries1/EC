import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import {
  FiMapPin,
  FiCalendar,
  FiUsers,
  FiTruck,
  FiCheck,
  FiX,
  FiStar,
  FiChevronLeft,
  FiPhone,
  FiMessageCircle,
  FiClock,
  FiDollarSign,
} from 'react-icons/fi';
import StatusBadge from '../../components/StatusBadge';

const RideDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [processingQuote, setProcessingQuote] = useState(false);

  useEffect(() => {
    fetchRideDetails();
    const interval = setInterval(fetchRideDetails, 10000); // Auto-refresh every 10 seconds
    return () => clearInterval(interval);
  }, [id]);

  const fetchRideDetails = async () => {
    try {
      const response = await api.get(`/rides/${id}`);
      setRide(response.data);
    } catch (error) {
      console.error('Failed to fetch ride details:', error);
      toast.error('Failed to load ride details');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptQuote = async () => {
    setProcessingQuote(true);
    try {
      await api.put(`/rides/${id}/accept-quote`);
      toast.success('Quote accepted! Proceeding to payment...');
      fetchRideDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept quote');
    } finally {
      setProcessingQuote(false);
    }
  };

  const handleDeclineQuote = async () => {
    if (!window.confirm('Are you sure you want to decline this quote?')) return;

    setProcessingQuote(true);
    try {
      await api.put(`/rides/${id}/decline-quote`);
      toast.success('Quote declined');
      fetchRideDetails();
    } catch (error) {
      toast.error('Failed to decline quote');
    } finally {
      setProcessingQuote(false);
    }
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setSubmittingReview(true);
    try {
      await api.post(`/rides/${id}/rate`, {
        rating,
        review,
      });
      toast.success('Review submitted successfully!');
      fetchRideDetails();
    } catch (error) {
      toast.error('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusProgress = (status) => {
    const statuses = ['requested', 'quoted', 'confirmed', 'assigned', 'in_progress', 'completed'];
    const currentIndex = statuses.indexOf(status);
    return ((currentIndex + 1) / statuses.length) * 100;
  };

  const statusLabels = {
    requested: 'Request Submitted',
    quoted: 'Quote Received',
    confirmed: 'Confirmed',
    assigned: 'Driver Assigned',
    in_progress: 'In Progress',
    completed: 'Completed',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a365d] mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading ride details...</p>
        </div>
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Ride not found</p>
          <button onClick={() => navigate('/my-rides')} className="text-[#1a365d] font-semibold hover:underline">
            Back to My Rides
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/my-rides')}
            className="flex items-center text-[#1a365d] font-semibold hover:underline"
          >
            <FiChevronLeft className="mr-2" />
            Back to My Rides
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2">
            {/* Route Card */}
            <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  <FiMapPin className="inline mr-2 text-[#1a365d]" />
                  {ride.pickup_location}
                </h1>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1 h-1 bg-[#1a365d] rounded-full"></div>
                  <span className="mx-4 text-sm text-gray-600 whitespace-nowrap">
                    {ride.distance ? `${(ride.distance / 1000).toFixed(1)} km` : '-'}
                  </span>
                  <div className="flex-1 h-1 bg-[#1a365d] rounded-full"></div>
                </div>
                <h2 className="text-3xl font-bold text-gray-900">
                  <FiMapPin className="inline mr-2 text-[#1a365d]" />
                  {ride.destination}
                </h2>
              </div>

              {/* Trip Details */}
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-600">Date & Time</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {format(parseISO(ride.scheduled_date), 'MMM dd, yyyy')}
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {format(parseISO(`2000-01-01T${ride.scheduled_time}`), 'h:mm a')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <div className="mt-1">
                    <StatusBadge status={ride.status} />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Passengers</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {ride.passengers} {ride.passengers === 1 ? 'Passenger' : 'Passengers'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Vehicle Type</p>
                  <p className="text-lg font-semibold text-gray-900">{ride.vehicle_type}</p>
                </div>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Trip Status</h3>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1a365d] transition-all duration-500"
                    style={{ width: `${getStatusProgress(ride.status)}%` }}
                  ></div>
                </div>
              </div>

              {/* Timeline Steps */}
              <div className="space-y-4">
                {Object.entries(statusLabels).map(([status, label], index) => {
                  const isCompleted = ['requested', 'quoted', 'confirmed', 'assigned', 'in_progress', 'completed'].indexOf(status) <=
                    ['requested', 'quoted', 'confirmed', 'assigned', 'in_progress', 'completed'].indexOf(ride.status);
                  const isCurrent = ride.status === status;

                  return (
                    <div key={status} className="flex items-center">
                      <div
                        className={`w-4 h-4 rounded-full mr-4 flex-shrink-0 ${
                          isCompleted
                            ? 'bg-green-500'
                            : isCurrent
                            ? 'bg-[#1a365d] ring-4 ring-blue-200'
                            : 'bg-gray-300'
                        }`}
                      ></div>
                      <span
                        className={`font-medium ${
                          isCurrent ? 'text-[#1a365d] font-bold' : isCompleted ? 'text-gray-700' : 'text-gray-500'
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {ride.last_update && (
                <p className="text-xs text-gray-500 mt-6">
                  Last updated: {format(parseISO(ride.last_update), 'MMM dd, yyyy h:mm a')}
                </p>
              )}
            </div>

            {/* Quote Section */}
            {ride.status === 'quoted' && (
              <div className="bg-blue-50 rounded-xl shadow-sm p-8 mb-6 border-2 border-blue-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">We've Reviewed Your Request</h3>
                <p className="text-gray-600 mb-6">Our team has prepared a competitive quote for your transportation needs.</p>

                <div className="bg-white rounded-lg p-6 mb-6 border-2 border-[#1a365d]">
                  <p className="text-sm text-gray-600 mb-2">Your Quote</p>
                  <p className="text-4xl font-bold text-[#1a365d]">${ride.quoted_price?.toFixed(2)}</p>
                  {ride.quote_notes && <p className="text-sm text-gray-600 mt-4">{ride.quote_notes}</p>}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleAcceptQuote}
                    disabled={processingQuote}
                    className="flex-1 flex items-center justify-center bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiCheck className="mr-2" />
                    {processingQuote ? 'Processing...' : 'Accept & Pay'}
                  </button>
                  <button
                    onClick={handleDeclineQuote}
                    disabled={processingQuote}
                    className="flex-1 flex items-center justify-center bg-gray-300 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiX className="mr-2" />
                    Decline
                  </button>
                </div>
              </div>
            )}

            {/* Driver Section */}
            {(ride.status === 'assigned' || ride.status === 'in_progress' || ride.status === 'completed') &&
              ride.driver && (
                <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Your Driver</h3>

                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{ride.driver.name}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {ride.driver.rating ? `${ride.driver.rating.toFixed(1)}★` : 'Unrated'} • {ride.driver.rides_completed} rides
                      </p>
                    </div>
                  </div>

                  {/* Vehicle Info */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <p className="text-sm text-gray-600 mb-2">Vehicle Information</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Type</p>
                        <p className="font-semibold text-gray-900">{ride.driver.vehicle_type}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Model</p>
                        <p className="font-semibold text-gray-900">
                          {ride.driver.vehicle_year} {ride.driver.vehicle_make}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Color</p>
                        <p className="font-semibold text-gray-900">{ride.driver.vehicle_color}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">License Plate</p>
                        <p className="font-semibold text-gray-900">{ride.driver.license_plate}</p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Buttons */}
                  <div className="flex gap-3">
                    <a
                      href={`tel:${ride.driver.phone}`}
                      className="flex-1 flex items-center justify-center bg-blue-500 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-600 transition"
                    >
                      <FiPhone className="mr-2" />
                      Call
                    </a>
                    {ride.driver.phone && (
                      <a
                        href={`sms:${ride.driver.phone}`}
                        className="flex-1 flex items-center justify-center bg-green-500 text-white font-semibold py-2.5 rounded-lg hover:bg-green-600 transition"
                      >
                        <FiMessageCircle className="mr-2" />
                        Message
                      </a>
                    )}
                  </div>
                </div>
              )}

            {/* Review Section */}
            {ride.status === 'completed' && (
              <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
                {!ride.rating ? (
                  <>
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Rate Your Experience</h3>
                    <p className="text-gray-600 mb-6">Help us improve by rating your ride</p>

                    {/* Star Rating */}
                    <div className="flex justify-center gap-3 mb-8">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="focus:outline-none transition"
                        >
                          <FiStar
                            size={40}
                            className={`${
                              star <= (hoverRating || rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            } transition`}
                          />
                        </button>
                      ))}
                    </div>

                    {/* Review Textarea */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Share your feedback (optional)
                      </label>
                      <textarea
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        placeholder="Tell us about your experience..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d] resize-none"
                        rows="4"
                      />
                    </div>

                    <button
                      onClick={handleSubmitReview}
                      disabled={submittingReview || rating === 0}
                      className="w-full bg-[#1a365d] text-white font-bold py-3 rounded-lg hover:bg-[#0f1f3d] transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Your Rating</h3>
                    <div className="flex gap-1 mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FiStar
                          key={star}
                          size={24}
                          className={star <= ride.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                    {ride.review && (
                      <p className="text-gray-600 mt-4 p-4 bg-gray-50 rounded-lg">"{ride.review}"</p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Sidebar - Ride Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-20">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Ride Details</h3>

              <div className="space-y-6">
                {/* Pickup */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Pickup Location</p>
                  <p className="text-sm text-gray-900 flex items-start">
                    <FiMapPin className="mr-2 mt-0.5 flex-shrink-0 text-[#1a365d]" />
                    {ride.pickup_location}
                  </p>
                </div>

                {/* Destination */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Destination</p>
                  <p className="text-sm text-gray-900 flex items-start">
                    <FiMapPin className="mr-2 mt-0.5 flex-shrink-0 text-[#1a365d]" />
                    {ride.destination}
                  </p>
                </div>

                {/* Date & Time */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Scheduled For</p>
                  <p className="text-sm text-gray-900 flex items-center">
                    <FiCalendar className="mr-2 text-[#1a365d]" />
                    {format(parseISO(ride.scheduled_date), 'MMM dd, yyyy')}
                  </p>
                  <p className="text-sm text-gray-900 flex items-center mt-1">
                    <FiClock className="mr-2 text-[#1a365d]" />
                    {format(parseISO(`2000-01-01T${ride.scheduled_time}`), 'h:mm a')}
                  </p>
                </div>

                {/* Passengers */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Passengers</p>
                  <p className="text-sm text-gray-900 flex items-center">
                    <FiUsers className="mr-2 text-[#1a365d]" />
                    {ride.passengers}
                  </p>
                </div>

                {/* Vehicle Type */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Vehicle Type</p>
                  <p className="text-sm text-gray-900 flex items-center">
                    <FiTruck className="mr-2 text-[#1a365d]" />
                    {ride.vehicle_type}
                  </p>
                </div>

                {/* Amount Paid */}
                {ride.amount_paid && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Amount Paid</p>
                    <p className="text-sm text-gray-900 flex items-center">
                      <FiDollarSign className="mr-2 text-[#1a365d]" />
                      ${ride.amount_paid.toFixed(2)}
                    </p>
                  </div>
                )}

                {/* Special Instructions */}
                {ride.special_instructions && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Special Instructions</p>
                    <p className="text-sm text-gray-900">{ride.special_instructions}</p>
                  </div>
                )}

                {/* Created Date */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Requested On</p>
                  <p className="text-sm text-gray-900">
                    {format(parseISO(ride.created_at), 'MMM dd, yyyy h:mm a')}
                  </p>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200"></div>

                {/* Ride ID */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Ride ID</p>
                  <p className="text-xs font-mono text-gray-600">{ride.id}</p>
                </div>
              </div>

              {/* Support Button */}
              <button className="w-full mt-6 bg-gray-100 text-gray-900 font-semibold py-2.5 rounded-lg hover:bg-gray-200 transition">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RideDetails;
