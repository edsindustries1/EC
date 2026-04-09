import React, { useState, useEffect } from 'react';
import {
  FiDollarSign,
  FiCheckCircle,
  FiTrendingUp,
  FiX,
  FiCalendar,
} from 'react-icons/fi';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import api from '../../utils/api';
import StatsCard from '../../components/StatsCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const PERIODS = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'All Time', value: 'all' },
  { label: 'Custom', value: 'custom' },
];

const VEHICLE_TYPES = ['Sedan', 'SUV', 'Van', 'Sprinter', 'Bus'];

export default function Revenue() {
  const [period, setPeriod] = useState('today');
  const [customFromDate, setCustomFromDate] = useState('');
  const [customToDate, setCustomToDate] = useState('');
  const [revenueData, setRevenueData] = useState(null);
  const [recentRides, setRecentRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCustomDates, setShowCustomDates] = useState(false);

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setLoading(true);
        const params = { period };

        if (period === 'custom' && customFromDate && customToDate) {
          params.fromDate = customFromDate;
          params.toDate = customToDate;
        }

        const [revenueRes, ridesRes] = await Promise.all([
          api.get('/admin/revenue', { params }),
          api.get('/admin/reports/completed-rides', { params }),
        ]);

        setRevenueData(revenueRes.data.data);
        setRecentRides(ridesRes.data.data || []);
      } catch (error) {
        console.error('Failed to fetch revenue data:', error);
        toast.error('Failed to load revenue data');
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, [period, customFromDate, customToDate]);

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    if (newPeriod === 'custom') {
      setShowCustomDates(true);
    } else {
      setShowCustomDates(false);
    }
  };

  const handleApplyCustomDates = () => {
    if (customFromDate && customToDate) {
      setPeriod('custom');
      setShowCustomDates(false);
    } else {
      toast.error('Please select both dates');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const totalRevenue = revenueData?.totalRevenue || 0;
  const completedRides = revenueData?.completedRides || 0;
  const averagePrice = completedRides > 0 ? totalRevenue / completedRides : 0;
  const cancellationRate = revenueData?.cancellationRate || 0;
  const revenueByType = revenueData?.revenueByType || {};

  // Calculate max revenue for bar chart scaling
  const maxRevenue = Math.max(
    ...VEHICLE_TYPES.map((type) => revenueByType[type] || 0),
    1
  );

  const getVehicleTypeColor = (type) => {
    const colors = {
      Sedan: 'bg-blue-500',
      SUV: 'bg-indigo-500',
      Van: 'bg-green-500',
      Sprinter: 'bg-purple-500',
      Bus: 'bg-orange-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Revenue & Reports</h1>
        <p className="text-gray-600 mt-1">Track earnings and ride analytics</p>
      </div>

      {/* Period Selector */}
      <div className="mb-8 bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => handlePeriodChange(p.value)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                period === p.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Custom Date Range */}
        {showCustomDates && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  From Date
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="date"
                    value={customFromDate}
                    onChange={(e) => setCustomFromDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  To Date
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="date"
                    value={customToDate}
                    onChange={(e) => setCustomToDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleApplyCustomDates}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              Apply Date Range
            </button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Revenue"
          value={`$${totalRevenue.toFixed(0)}`}
          icon={FiDollarSign}
          color="green"
        />
        <StatsCard
          title="Completed Rides"
          value={completedRides}
          icon={FiCheckCircle}
          color="blue"
        />
        <StatsCard
          title="Average Ride Price"
          value={`$${averagePrice.toFixed(0)}`}
          icon={FiTrendingUp}
          color="purple"
        />
        <StatsCard
          title="Cancellation Rate"
          value={`${cancellationRate.toFixed(1)}%`}
          icon={FiX}
          color="red"
        />
      </div>

      {/* Revenue by Vehicle Type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Bar Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Revenue by Vehicle Type
          </h2>

          <div className="space-y-4">
            {VEHICLE_TYPES.map((type) => {
              const revenue = revenueByType[type] || 0;
              const percentage = (revenue / maxRevenue) * 100;

              return (
                <div key={type}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{type}</span>
                    <span className="font-semibold text-gray-900">
                      ${revenue.toFixed(0)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full ${getVehicleTypeColor(type)} transition-all duration-300`}
                      style={{ width: `${Math.max(percentage, 5)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <span className="text-gray-600">Total Rides</span>
              <span className="font-semibold text-lg text-gray-900">
                {completedRides}
              </span>
            </div>

            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <span className="text-gray-600">Total Revenue</span>
              <span className="font-semibold text-lg text-green-600">
                ${totalRevenue.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <span className="text-gray-600">Average Price per Ride</span>
              <span className="font-semibold text-lg text-gray-900">
                ${averagePrice.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">Cancellation Rate</span>
              <span className="font-semibold text-lg text-red-600">
                {cancellationRate.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Completed Rides */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Completed Rides
          </h2>
        </div>

        {recentRides.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500">No completed rides in this period</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentRides.map((ride) => (
                  <tr
                    key={ride._id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {format(new Date(ride.completedAt), 'MM/dd/yy HH:mm')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {ride.customer?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {ride.pickupLocation} → {ride.destination}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {ride.vehicleType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ${ride.finalAmount?.toFixed(2) || ride.quotedPrice?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                        <FiCheckCircle size={14} /> Completed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
