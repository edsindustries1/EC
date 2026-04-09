import React, { useState, useEffect } from 'react';
import {
  FiSearch,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiToggleRight,
  FiToggleLeft,
  FiX,
  FiUsers,
  FiCheckCircle,
  FiAlertCircle,
  FiStar,
  FiStickyNote,
  FiPhone,
  FiMail,
  FiTruck,
} from 'react-icons/fi';
import api from '../../utils/api';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const VEHICLE_TYPES = ['Sedan', 'SUV', 'Van', 'Sprinter', 'Bus'];

export default function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterAvailability, setFilterAvailability] = useState('all');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('all');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    vehicleType: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    vehicleColor: '',
    licensePlate: '',
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        setLoading(true);
        const res = await api.get('/drivers');
        setDrivers(res.data.data || []);
      } catch (error) {
        console.error('Failed to fetch drivers:', error);
        toast.error('Failed to load drivers');
      } finally {
        setLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  const handleOpenAddModal = () => {
    setSelectedDriver(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      vehicleType: '',
      vehicleMake: '',
      vehicleModel: '',
      vehicleYear: '',
      vehicleColor: '',
      licensePlate: '',
      notes: '',
    });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (driver) => {
    setSelectedDriver(driver);
    setFormData({
      name: driver.name,
      phone: driver.phone,
      email: driver.email || '',
      vehicleType: driver.vehicle?.type || '',
      vehicleMake: driver.vehicle?.make || '',
      vehicleModel: driver.vehicle?.model || '',
      vehicleYear: driver.vehicle?.year || '',
      vehicleColor: driver.vehicle?.color || '',
      licensePlate: driver.vehicle?.licensePlate || '',
      notes: driver.notes || '',
    });
    setShowEditModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setFormData({
      name: '',
      phone: '',
      email: '',
      vehicleType: '',
      vehicleMake: '',
      vehicleModel: '',
      vehicleYear: '',
      vehicleColor: '',
      licensePlate: '',
      notes: '',
    });
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedDriver(null);
  };

  const handleSubmitAdd = async () => {
    if (!formData.name || !formData.phone || !formData.vehicleType) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        vehicle: {
          type: formData.vehicleType,
          make: formData.vehicleMake,
          model: formData.vehicleModel,
          year: formData.vehicleYear,
          color: formData.vehicleColor,
          licensePlate: formData.licensePlate,
        },
        notes: formData.notes || undefined,
      };

      const res = await api.post('/drivers', payload);
      setDrivers([...drivers, res.data.data]);
      toast.success('Driver added successfully!');
      handleCloseAddModal();
    } catch (error) {
      console.error('Failed to add driver:', error);
      toast.error(error.response?.data?.message || 'Failed to add driver');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!formData.name || !formData.phone || !formData.vehicleType) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        vehicle: {
          type: formData.vehicleType,
          make: formData.vehicleMake,
          model: formData.vehicleModel,
          year: formData.vehicleYear,
          color: formData.vehicleColor,
          licensePlate: formData.licensePlate,
        },
        notes: formData.notes || undefined,
      };

      await api.put(`/drivers/${selectedDriver._id}`, payload);
      setDrivers(
        drivers.map((d) =>
          d._id === selectedDriver._id
            ? {
                ...d,
                ...payload,
                vehicle: payload.vehicle,
              }
            : d
        )
      );
      toast.success('Driver updated successfully!');
      handleCloseEditModal();
    } catch (error) {
      console.error('Failed to update driver:', error);
      toast.error(error.response?.data?.message || 'Failed to update driver');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleAvailability = async (driver) => {
    try {
      const newAvailable = !driver.available;
      await api.patch(`/drivers/${driver._id}`, { available: newAvailable });

      setDrivers(
        drivers.map((d) =>
          d._id === driver._id ? { ...d, available: newAvailable } : d
        )
      );

      toast.success(
        `Driver marked as ${newAvailable ? 'available' : 'unavailable'}`
      );
    } catch (error) {
      console.error('Failed to toggle availability:', error);
      toast.error('Failed to update driver status');
    }
  };

  const handleOpenDeleteConfirm = (driver) => {
    setSelectedDriver(driver);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setDeletingId(selectedDriver._id);
      await api.delete(`/drivers/${selectedDriver._id}`);

      setDrivers(drivers.filter((d) => d._id !== selectedDriver._id));
      toast.success('Driver deleted successfully');
      setShowDeleteConfirm(false);
      setSelectedDriver(null);
    } catch (error) {
      console.error('Failed to delete driver:', error);
      toast.error(error.response?.data?.message || 'Failed to delete driver');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredDrivers = drivers.filter((driver) => {
    // Search filter
    if (
      searchQuery &&
      !driver.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !driver.phone.includes(searchQuery)
    ) {
      return false;
    }

    // Availability filter
    if (filterAvailability === 'available' && !driver.available) {
      return false;
    }
    if (filterAvailability === 'unavailable' && driver.available) {
      return false;
    }

    // Vehicle type filter
    if (vehicleTypeFilter !== 'all' && driver.vehicle?.type !== vehicleTypeFilter) {
      return false;
    }

    return true;
  });

  const totalDrivers = drivers.length;
  const availableCount = drivers.filter((d) => d.available).length;
  const onRideCount = drivers.filter((d) => d.onRide).length;
  const inactiveCount = drivers.filter((d) => !d.available).length;

  if (loading) {
    return <LoadingSpinner />;
  }

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const getAvatarColor = (name) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Driver Fleet</h1>
          <p className="text-gray-600 mt-1">{totalDrivers} drivers managed</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <FiPlus size={20} /> Add New Driver
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 font-medium">Total Drivers</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{totalDrivers}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 font-medium">Available Now</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{availableCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 font-medium">On Ride</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{onRideCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 font-medium">Inactive</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{inactiveCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Availability Filter */}
          <select
            value={filterAvailability}
            onChange={(e) => setFilterAvailability(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Drivers</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>

          {/* Vehicle Type Filter */}
          <select
            value={vehicleTypeFilter}
            onChange={(e) => setVehicleTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Vehicle Types</option>
            {VEHICLE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Driver Cards Grid */}
      {filteredDrivers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 text-lg">No drivers found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrivers.map((driver) => (
            <div
              key={driver._id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition"
            >
              <div className="p-6 space-y-4">
                {/* Avatar and Name */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full ${getAvatarColor(driver.name)} flex items-center justify-center text-white font-bold`}>
                      {getInitials(driver.name)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{driver.name}</h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <FiPhone size={14} />
                        {driver.phone}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-1">
                    {driver.available ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                        <FiCheckCircle size={14} /> Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                        <FiAlertCircle size={14} /> Unavailable
                      </span>
                    )}
                  </div>
                </div>

                {/* Email */}
                {driver.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FiMail size={14} />
                    {driver.email}
                  </div>
                )}

                {/* Vehicle Info */}
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <FiTruck size={16} className="text-gray-600" />
                    <span className="font-semibold text-gray-900">
                      {driver.vehicle?.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">
                    {driver.vehicle?.make} {driver.vehicle?.model} {driver.vehicle?.year}
                  </p>
                  {driver.vehicle?.color && (
                    <p className="text-sm text-gray-600">
                      Color: {driver.vehicle.color}
                    </p>
                  )}
                  <p className="text-xs text-gray-600 font-mono">
                    {driver.vehicle?.licensePlate}
                  </p>
                </div>

                {/* Rating and Rides */}
                <div className="grid grid-cols-2 gap-3">
                  {driver.rating && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <FiStar size={16} className="text-yellow-500" />
                        <span className="font-bold text-gray-900">
                          {driver.rating.toFixed(1)}
                        </span>
                      </div>
                      <span className="text-xs text-gray-600">Rating</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">
                      {driver.totalRides || 0}
                    </span>
                    <span className="text-xs text-gray-600">Rides</span>
                  </div>
                </div>

                {/* Notes Indicator */}
                {driver.notes && (
                  <div className="flex items-start gap-2 bg-blue-50 rounded p-2">
                    <FiStickyNote size={14} className="text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-900 line-clamp-2">{driver.notes}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="border-t border-gray-200 pt-4 grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleOpenEditModal(driver)}
                    className="px-3 py-2 bg-blue-100 text-blue-700 font-semibold text-sm rounded-lg hover:bg-blue-200 transition flex items-center justify-center gap-1"
                  >
                    <FiEdit2 size={14} /> Edit
                  </button>

                  <button
                    onClick={() => handleToggleAvailability(driver)}
                    className={`px-3 py-2 font-semibold text-sm rounded-lg transition flex items-center justify-center gap-1 ${
                      driver.available
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {driver.available ? (
                      <>
                        <FiToggleRight size={14} /> Disable
                      </>
                    ) : (
                      <>
                        <FiToggleLeft size={14} /> Enable
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleOpenDeleteConfirm(driver)}
                    className="px-3 py-2 bg-red-100 text-red-700 font-semibold text-sm rounded-lg hover:bg-red-200 transition flex items-center justify-center gap-1"
                  >
                    <FiTrash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Driver Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={handleCloseAddModal}
        title="Add New Driver"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Phone *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Vehicle Type *
              </label>
              <select
                value={formData.vehicleType}
                onChange={(e) =>
                  setFormData({ ...formData, vehicleType: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a type</option>
                {VEHICLE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Make
              </label>
              <input
                type="text"
                value={formData.vehicleMake}
                onChange={(e) =>
                  setFormData({ ...formData, vehicleMake: e.target.value })
                }
                placeholder="e.g. Toyota"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Model
              </label>
              <input
                type="text"
                value={formData.vehicleModel}
                onChange={(e) =>
                  setFormData({ ...formData, vehicleModel: e.target.value })
                }
                placeholder="e.g. Camry"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Year
              </label>
              <input
                type="number"
                value={formData.vehicleYear}
                onChange={(e) =>
                  setFormData({ ...formData, vehicleYear: e.target.value })
                }
                placeholder="2024"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Color
              </label>
              <input
                type="text"
                value={formData.vehicleColor}
                onChange={(e) =>
                  setFormData({ ...formData, vehicleColor: e.target.value })
                }
                placeholder="e.g. Black"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                License Plate
              </label>
              <input
                type="text"
                value={formData.licensePlate}
                onChange={(e) =>
                  setFormData({ ...formData, licensePlate: e.target.value })
                }
                placeholder="e.g. ABC1234"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Internal notes..."
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 flex gap-2">
            <button
              onClick={handleCloseAddModal}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitAdd}
              disabled={submitting}
              className="flex-1 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {submitting ? 'Adding...' : 'Add Driver'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Driver Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        title="Edit Driver"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Phone *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Vehicle Type *
              </label>
              <select
                value={formData.vehicleType}
                onChange={(e) =>
                  setFormData({ ...formData, vehicleType: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a type</option>
                {VEHICLE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Make
              </label>
              <input
                type="text"
                value={formData.vehicleMake}
                onChange={(e) =>
                  setFormData({ ...formData, vehicleMake: e.target.value })
                }
                placeholder="e.g. Toyota"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Model
              </label>
              <input
                type="text"
                value={formData.vehicleModel}
                onChange={(e) =>
                  setFormData({ ...formData, vehicleModel: e.target.value })
                }
                placeholder="e.g. Camry"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Year
              </label>
              <input
                type="number"
                value={formData.vehicleYear}
                onChange={(e) =>
                  setFormData({ ...formData, vehicleYear: e.target.value })
                }
                placeholder="2024"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Color
              </label>
              <input
                type="text"
                value={formData.vehicleColor}
                onChange={(e) =>
                  setFormData({ ...formData, vehicleColor: e.target.value })
                }
                placeholder="e.g. Black"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                License Plate
              </label>
              <input
                type="text"
                value={formData.licensePlate}
                onChange={(e) =>
                  setFormData({ ...formData, licensePlate: e.target.value })
                }
                placeholder="e.g. ABC1234"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Internal notes..."
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 flex gap-2">
            <button
              onClick={handleCloseEditModal}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitEdit}
              disabled={submitting}
              className="flex-1 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Driver"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete <strong>{selectedDriver?.name}</strong>? This
            action cannot be undone.
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={deletingId === selectedDriver?._id}
              className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {deletingId === selectedDriver?._id ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
