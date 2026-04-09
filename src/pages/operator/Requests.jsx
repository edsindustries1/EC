import React, { useState, useEffect } from 'react';
import {
  FiSearch,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiCheck,
  FiCheckCircle,
  FiAlertCircle,
  FiDollarSign,
  FiUsers,
  FiCalendar,
  FiPhone,
  FiMapPin,
  FiStar,
} from 'react-icons/fi';
import { format, parseISO } from 'date-fns';
import api from '../../utils/api';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const STATUS_FILTERS = [
  'all',
  'pending',
  'quoted',
  'confirmed',
  'assigned',
  'in_progress',
  'completed',
  'cancelled',
];

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRequests, setTotalRequests] = useState(0);

  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [quotePrice, setQuotePrice] = useState('');
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);

  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [driversLoading, setDriversLoading] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [assignSubmitting, setAssignSubmitting] = useState(false);
  const [driverSearch, setDriverSearch] = useState('');

  const ITEMS_PER_PAGE = 20;

  // Fetch requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const params = {
          limit: ITEMS_PER_PAGE,
          page: currentPage,
        };

        if (statusFilter !== 'all') {
          params.status = statusFilter;
        }
        if (searchQuery) {
          params.search = searchQuery;
        }
        if (fromDate) {
          params.fromDate = fromDate;
        }
        if (toDate) {
          params.toDate = toDate;
        }

        const res = await api.get('/operator/requests', { params });
        setRequests(res.data.data || []);
        setTotalRequests(res.data.pagination?.total || 0);
        setTotalPages(res.data.pagination?.pages || 1);
      } catch (error) {
        console.error('Failed to fetch requests:', error);
        toast.error('Failed to load requests');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [statusFilter, searchQuery, fromDate, toDate, currentPage]);

  // Fetch available drivers when opening assign modal
  useEffect(() => {
    if (showAssignModal && selectedRequest) {
      const fetchAvailableDrivers = async () => {
        try {
          setDriversLoading(true);
          const res = await api.get('/drivers/available', {
            params: { vehicleType: selectedRequest.vehicleType },
          });
          setAvailableDrivers(res.data.data || []);
        } catch (error) {
          console.error('Failed to fetch drivers:', error);
          toast.error('Failed to load available drivers');
        } finally {
          setDriversLoading(false);
        }
      };

      fetchAvailableDrivers();
    }
  }, [showAssignModal, selectedRequest]);

  const handleOpenQuoteModal = (request) => {
    setSelectedRequest(request);
    setQuotePrice('');
    setShowQuoteModal(true);
  };

  const handleOpenAssignModal = (request) => {
    setSelectedRequest(request);
    setSelectedDriver(null);
    setDriverSearch('');
    setShowAssignModal(true);
  };

  const handleSubmitQuote = async () => {
    if (!quotePrice || parseFloat(quotePrice) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    try {
      setQuoteSubmitting(true);
      await api.put(`/operator/requests/${selectedRequest._id}/quote`, {
        price: parseFloat(quotePrice),
      });

      toast.success('Quote sent to customer!');
      setShowQuoteModal(false);

      // Update requests list
      setRequests((prev) =>
        prev.map((req) =>
          req._id === selectedRequest._id
            ? { ...req, status: 'quoted', quotedPrice: parseFloat(quotePrice) }
            : req
        )
      );
    } catch (error) {
      console.error('Failed to submit quote:', error);
      toast.error(error.response?.data?.message || 'Failed to submit quote');
    } finally {
      setQuoteSubmitting(false);
    }
  };

  const handleAssignDriver = async () => {
    if (!selectedDriver) {
      toast.error('Please select a driver');
      return;
    }

    try {
      setAssignSubmitting(true);
      await api.put(`/operator/requests/${selectedRequest._id}/assign`, {
        driverId: selectedDriver._id,
      });

      toast.success(
        `Driver assigned! SMS notification sent to ${selectedDriver.name}.`
      );
      setShowAssignModal(false);

      // Update requests list
      setRequests((prev) =>
        prev.map((req) =>
          req._id === selectedRequest._id
            ? { ...req, status: 'assigned', assignedDriver: selectedDriver._id }
            : req
        )
      );
    } catch (error) {
      console.error('Failed to assign driver:', error);
      toast.error(error.response?.data?.message || 'Failed to assign driver');
    } finally {
      setAssignSubmitting(false);
    }
  };

  const handleSetQuickPrice = (price) => {
    setQuotePrice(price.toString());
  };

  const filteredDrivers = availableDrivers.filter((driver) =>
    driver.name.toLowerCase().includes(driverSearch.toLowerCase())
  );

  const handleResetFilters = () => {
    setStatusFilter('all');
    setSearchQuery('');
    setFromDate('');
    setToDate('');
    setCurrentPage(1);
  };

  if (loading && currentPage === 1) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Ride Requests</h1>
        <p className="text-gray-600 mt-1">
          {totalRequests} total {totalRequests === 1 ? 'request' : 'requests'}
        </p>
      </div>

      {/* Status Filter Tabs */}
      <div className="mb-6 bg-white rounded-lg shadow p-4 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {STATUS_FILTERS.map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 bg-white rounded-lg shadow p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative md:col-span-2">
            <FiSearch className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by customer name or route..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* From Date */}
          <div className="relative">
            <FiCalendar className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* To Date */}
          <div className="relative">
            <FiCalendar className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Reset Filters */}
        {(statusFilter !== 'all' || searchQuery || fromDate || toDate) && (
          <button
            onClick={handleResetFilters}
            className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-2"
          >
            <FiX size={16} /> Reset filters
          </button>
        )}
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {requests.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500">No requests found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Pickup
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Destination
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Pass.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr
                      key={request._id}
                      className={`border-b border-gray-200 hover:bg-gray-50 transition ${
                        request.status === 'pending' ? 'bg-yellow-50' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                        {request._id.substring(request._id.length - 6).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {format(parseISO(request.createdAt), 'MM/dd/yy HH:mm')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {request.customer?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {request.customer?.phone || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {request.pickupLocation}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {request.destination}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {request.passengers}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {request.vehicleType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <StatusBadge status={request.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {request.quotedPrice ? `$${request.quotedPrice.toFixed(2)}` : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {request.status === 'pending' && (
                          <button
                            onClick={() => handleOpenQuoteModal(request)}
                            className="px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded hover:bg-blue-600 transition"
                          >
                            Set Quote
                          </button>
                        )}
                        {request.status === 'quoted' && (
                          <span className="text-xs text-gray-500 font-medium">Waiting...</span>
                        )}
                        {request.status === 'confirmed' && (
                          <button
                            onClick={() => handleOpenAssignModal(request)}
                            className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded hover:bg-green-600 transition"
                          >
                            Assign Driver
                          </button>
                        )}
                        {request.status === 'assigned' && (
                          <span className="text-xs text-gray-500 font-medium">—</span>
                        )}
                        {request.status === 'in_progress' && (
                          <span className="text-xs text-gray-500 font-medium">—</span>
                        )}
                        {request.status === 'completed' && (
                          <FiCheckCircle className="text-green-500" size={18} />
                        )}
                        {request.status === 'cancelled' && (
                          <FiX className="text-red-500" size={18} />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Page {currentPage} of {totalPages} ({totalRequests} total)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                >
                  <FiChevronLeft size={16} /> Previous
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                >
                  Next <FiChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Quote Modal */}
      <Modal
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        title="Set Price Quote"
        size="lg"
      >
        {selectedRequest && (
          <div className="space-y-6">
            {/* Ride Details */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-gray-900 mb-4">Ride Details</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Pickup Location</p>
                  <p className="font-medium text-gray-900">
                    {selectedRequest.pickupLocation}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Destination</p>
                  <p className="font-medium text-gray-900">
                    {selectedRequest.destination}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Scheduled Date & Time</p>
                  <p className="font-medium text-gray-900">
                    {format(parseISO(selectedRequest.scheduledDateTime), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Passengers</p>
                  <p className="font-medium text-gray-900">{selectedRequest.passengers}</p>
                </div>
              </div>

              {selectedRequest.specialRequirements && (
                <div>
                  <p className="text-sm text-gray-600">Notes</p>
                  <p className="font-medium text-gray-900">
                    {selectedRequest.specialRequirements}
                  </p>
                </div>
              )}
            </div>

            {/* Customer Info */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-gray-900 mb-4">Customer Information</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium text-gray-900">{selectedRequest.customer?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium text-gray-900">
                    {selectedRequest.customer?.phone}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{selectedRequest.customer?.email}</p>
                </div>
              </div>
            </div>

            {/* Price Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Set Price Quote
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-600 font-bold text-lg">
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={quotePrice}
                  onChange={(e) => setQuotePrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Quick Price Buttons */}
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-2">Quick Price Buttons</p>
              <div className="grid grid-cols-3 gap-2">
                {[50, 100, 150, 200, 300, 500].map((price) => (
                  <button
                    key={price}
                    onClick={() => handleSetQuickPrice(price)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                      quotePrice === price.toString()
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                    }`}
                  >
                    ${price}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitQuote}
              disabled={quoteSubmitting || !quotePrice}
              className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {quoteSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <FiCheck size={18} />
                  Send Quote to Customer
                </>
              )}
            </button>
          </div>
        )}
      </Modal>

      {/* Assign Driver Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Assign Driver"
        size="lg"
      >
        {selectedRequest && (
          <div className="space-y-6">
            {/* Ride Details */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-gray-900 mb-4">Ride Summary</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Pickup</p>
                  <p className="font-medium text-gray-900 truncate">
                    {selectedRequest.pickupLocation}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Destination</p>
                  <p className="font-medium text-gray-900 truncate">
                    {selectedRequest.destination}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Scheduled Time</p>
                  <p className="font-medium text-gray-900">
                    {format(parseISO(selectedRequest.scheduledDateTime), 'h:mm a')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Vehicle Type</p>
                  <p className="font-medium text-gray-900">{selectedRequest.vehicleType}</p>
                </div>
              </div>

              {selectedRequest.quotedPrice && (
                <div className="border-t border-gray-200 pt-3">
                  <p className="text-sm text-gray-600">Quoted Price</p>
                  <p className="font-semibold text-lg text-blue-600">
                    ${selectedRequest.quotedPrice.toFixed(2)}
                  </p>
                </div>
              )}
            </div>

            {/* Driver Search */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Select Driver
              </label>
              <div className="relative mb-4">
                <FiSearch className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search drivers by name..."
                  value={driverSearch}
                  onChange={(e) => setDriverSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Driver List */}
            {driversLoading ? (
              <div className="py-8 text-center">
                <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : filteredDrivers.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-gray-500">
                  {driverSearch
                    ? 'No drivers found matching your search'
                    : 'No available drivers for this vehicle type'}
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {filteredDrivers.map((driver) => (
                  <div
                    key={driver._id}
                    onClick={() => setSelectedDriver(driver)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                      selectedDriver?._id === driver._id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{driver.name}</p>

                        <div className="grid grid-cols-2 gap-3 mt-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <FiPhone size={14} />
                            {driver.phone}
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <FiUsers size={14} />
                            {driver.totalRides || 0} rides
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mt-2">
                          {driver.vehicle?.type} • {driver.vehicle?.make} {driver.vehicle?.model}{' '}
                          {driver.vehicle?.year}
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                          License Plate: {driver.vehicle?.licensePlate}
                        </p>
                      </div>

                      {driver.rating && (
                        <div className="flex items-center gap-1 bg-yellow-50 px-3 py-2 rounded-lg">
                          <FiStar size={16} className="text-yellow-500" />
                          <span className="font-semibold text-gray-900">
                            {driver.rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Assign Button */}
            <button
              onClick={handleAssignDriver}
              disabled={assignSubmitting || !selectedDriver}
              className="w-full px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {assignSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <FiCheck size={18} />
                  Assign Driver
                </>
              )}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
