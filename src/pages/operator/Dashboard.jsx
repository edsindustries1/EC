import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiAlertCircle,
  FiClock,
  FiCheckCircle,
  FiNavigation,
  FiDollarSign,
  FiList,
  FiUsers,
  FiUserPlus,
  FiChevronRight,
} from 'react-icons/fi';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import StatsCard from '../../components/StatsCard';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [dashboardRes, requestsRes] = await Promise.all([
          api.get('/operator/dashboard'),
          api.get('/operator/requests?limit=10&sort=-createdAt'),
        ]);

        setDashboardData(dashboardRes.data.data);
        setRecentRequests(requestsRes.data.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading || !dashboardData) {
    return <LoadingSpinner />;
  }

  const pendingCount = dashboardData.stats.pending || 0;
  const quotedCount = dashboardData.stats.quoted || 0;
  const confirmedCount = dashboardData.stats.confirmed || 0;
  const activeRidesCount = dashboardData.stats.inProgress || 0;
  const completedTodayCount = dashboardData.stats.completedToday || 0;
  const todayRevenue = dashboardData.stats.todayRevenue || 0;

  const handlePendingClick = () => {
    navigate('/operator/requests?status=pending');
  };

  const handleQuoteClick = (requestId) => {
    navigate(`/operator/requests?highlight=${requestId}`);
  };

  const handleViewAllRequests = () => {
    navigate('/operator/requests');
  };

  const handleManageDrivers = () => {
    navigate('/operator/drivers');
  };

  const handleAddDriver = () => {
    navigate('/operator/drivers?action=add');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Operations Center</h1>
        <p className="text-gray-600 mt-1">
          {format(currentTime, 'EEEE, MMMM d, yyyy h:mm a')}
        </p>
      </div>

      {/* Urgent Section - Pending Requests */}
      {pendingCount > 0 && (
        <div
          onClick={handlePendingClick}
          className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-orange-300 rounded-lg p-6 cursor-pointer hover:shadow-lg hover:border-orange-400 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-orange-500 text-white rounded-full p-3">
                <FiAlertCircle size={32} />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">PENDING REQUESTS</p>
                <p className="text-3xl font-bold text-orange-600">{pendingCount}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {pendingCount === 1 ? 'Ride' : 'Rides'} waiting for quotes
                </p>
              </div>
            </div>
            <FiChevronRight size={28} className="text-orange-600" />
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatsCard
          title="Pending Requests"
          value={pendingCount}
          icon={FiClock}
          color="yellow"
          onClick={handlePendingClick}
        />
        <StatsCard
          title="Quoted"
          value={quotedCount}
          icon={FiList}
          color="blue"
        />
        <StatsCard
          title="Confirmed"
          value={confirmedCount}
          icon={FiCheckCircle}
          color="green"
        />
        <StatsCard
          title="Active Rides"
          value={activeRidesCount}
          icon={FiNavigation}
          color="indigo"
        />
        <StatsCard
          title="Completed Today"
          value={completedTodayCount}
          icon={FiCheckCircle}
          color="teal"
        />
        <StatsCard
          title="Today's Revenue"
          value={`$${todayRevenue.toFixed(0)}`}
          icon={FiDollarSign}
          color="emerald"
        />
      </div>

      {/* Recent Requests and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Recent Requests Table */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Requests</h2>
            </div>

            {recentRequests.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-gray-500">No recent requests</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Route
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
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentRequests.map((request) => (
                      <tr
                        key={request._id}
                        className={`border-b border-gray-200 hover:bg-gray-50 transition ${
                          request.status === 'pending' ? 'bg-yellow-50' : ''
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {format(new Date(request.createdAt), 'HH:mm')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {request.customer?.name || 'N/A'}
                        </td>
                        <td
                          className="px-6 py-4 text-sm text-gray-600 cursor-pointer hover:text-blue-600 max-w-xs truncate"
                          onClick={() => handleQuoteClick(request._id)}
                          title={`${request.pickupLocation} → ${request.destination}`}
                        >
                          {request.pickupLocation?.substring(0, 20)}...
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {request.status === 'pending' && (
                            <button
                              onClick={() => handleQuoteClick(request._id)}
                              className="px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded hover:bg-blue-600 transition"
                            >
                              Quote
                            </button>
                          )}
                          {request.status === 'confirmed' && (
                            <button
                              onClick={() => handleQuoteClick(request._id)}
                              className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded hover:bg-green-600 transition"
                            >
                              Assign
                            </button>
                          )}
                          {['quoted', 'assigned', 'in_progress', 'completed', 'cancelled'].includes(
                            request.status
                          ) && (
                            <span className="text-xs text-gray-500">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="px-6 py-4 border-t border-gray-200">
              <button
                onClick={handleViewAllRequests}
                className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-2"
              >
                View All Requests <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
              Quick Actions
            </h3>

            <button
              onClick={handleViewAllRequests}
              className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 mb-3"
            >
              <FiList size={18} />
              View All Requests
            </button>

            <button
              onClick={handleManageDrivers}
              className="w-full px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2 mb-3"
            >
              <FiUsers size={18} />
              Manage Drivers
            </button>

            <button
              onClick={handleAddDriver}
              className="w-full px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
            >
              <FiUserPlus size={18} />
              Add New Driver
            </button>
          </div>

          {/* Info Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 text-sm mb-2">Welcome back!</h4>
            <p className="text-sm text-blue-800">
              You have {pendingCount} {pendingCount === 1 ? 'request' : 'requests'} waiting for quotes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
