import React, { useState, useEffect } from 'react';
import {
  FiSearch,
  FiMail,
  FiPhone,
  FiCalendar,
  FiUsers,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import { format, parseISO } from 'date-fns';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [expandedUser, setExpandedUser] = useState(null);

  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const params = {
          limit: ITEMS_PER_PAGE,
          page: currentPage,
        };

        if (searchQuery) {
          params.search = searchQuery;
        }

        const res = await api.get('/admin/users', { params });
        setUsers(res.data.data || []);
        setTotalUsers(res.data.pagination?.total || 0);
        setTotalPages(res.data.pagination?.pages || 1);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        toast.error('Failed to load customers');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [searchQuery, currentPage]);

  const toggleUserExpand = (userId) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  if (loading && currentPage === 1) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Customers</h1>
        <p className="text-gray-600 mt-1">
          {totalUsers} total {totalUsers === 1 ? 'customer' : 'customers'}
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {users.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500">No customers found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Total Rides
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Joined
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
                  {users.map((user) => (
                    <React.Fragment key={user._id}>
                      <tr
                        className="border-b border-gray-200 hover:bg-gray-50 transition cursor-pointer"
                        onClick={() => toggleUserExpand(user._id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {user.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {user.totalRides || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {format(parseISO(user.createdAt), 'MMM d, yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              user.status === 'active'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {user.status || 'active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleUserExpand(user._id);
                            }}
                            className="text-blue-600 hover:text-blue-700 font-semibold"
                          >
                            {expandedUser === user._id ? 'Hide' : 'View'}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Details */}
                      {expandedUser === user._id && (
                        <tr className="bg-blue-50 border-b border-gray-200">
                          <td colSpan="7" className="px-6 py-4">
                            <div className="space-y-4">
                              <h3 className="font-semibold text-gray-900 mb-3">
                                Customer Details
                              </h3>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Personal Info */}
                                <div>
                                  <h4 className="font-semibold text-gray-900 text-sm mb-3">
                                    Personal Information
                                  </h4>
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <span className="text-gray-600 text-sm font-medium">
                                        Name:
                                      </span>
                                      <span className="text-gray-900">{user.name}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <FiMail size={16} className="text-gray-600" />
                                      <a
                                        href={`mailto:${user.email}`}
                                        className="text-blue-600 hover:text-blue-700"
                                      >
                                        {user.email}
                                      </a>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <FiPhone size={16} className="text-gray-600" />
                                      <a
                                        href={`tel:${user.phone}`}
                                        className="text-blue-600 hover:text-blue-700"
                                      >
                                        {user.phone}
                                      </a>
                                    </div>

                                    {user.address && (
                                      <div>
                                        <span className="text-gray-600 text-sm font-medium">
                                          Address:
                                        </span>
                                        <p className="text-gray-900 mt-1">{user.address}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Ride Statistics */}
                                <div>
                                  <h4 className="font-semibold text-gray-900 text-sm mb-3">
                                    Ride Statistics
                                  </h4>
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-gray-600 text-sm font-medium">
                                        Total Rides:
                                      </span>
                                      <span className="font-semibold text-gray-900">
                                        {user.totalRides || 0}
                                      </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                      <span className="text-gray-600 text-sm font-medium">
                                        Total Spent:
                                      </span>
                                      <span className="font-semibold text-gray-900">
                                        ${(user.totalSpent || 0).toFixed(2)}
                                      </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                      <span className="text-gray-600 text-sm font-medium">
                                        Average Rating:
                                      </span>
                                      <span className="font-semibold text-gray-900">
                                        {user.averageRating
                                          ? user.averageRating.toFixed(1)
                                          : 'N/A'}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <FiCalendar size={16} className="text-gray-600" />
                                      <span className="text-sm text-gray-600">
                                        Joined:{' '}
                                        {format(parseISO(user.createdAt), 'MMMM d, yyyy')}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Recent Rides */}
                              {user.recentRides && user.recentRides.length > 0 && (
                                <div>
                                  <h4 className="font-semibold text-gray-900 text-sm mb-3">
                                    Recent Rides
                                  </h4>
                                  <div className="space-y-2">
                                    {user.recentRides.slice(0, 3).map((ride) => (
                                      <div
                                        key={ride._id}
                                        className="flex items-center justify-between text-sm bg-white p-2 rounded border border-gray-200"
                                      >
                                        <span className="text-gray-600">
                                          {format(
                                            parseISO(ride.createdAt),
                                            'MMM d, yyyy'
                                          )}{' '}
                                          -{' '}
                                          <span className="text-gray-900 font-medium">
                                            {ride.pickupLocation} → {ride.destination}
                                          </span>
                                        </span>
                                        <span className="font-semibold text-gray-900">
                                          ${ride.quotedPrice?.toFixed(2)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Page {currentPage} of {totalPages} ({totalUsers} total)
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
    </div>
  );
}
