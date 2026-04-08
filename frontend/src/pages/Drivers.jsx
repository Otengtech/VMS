import { useState, useEffect } from 'react';
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiPhone,
  FiUserCheck,
  FiAlertCircle,
  FiClock,
  FiCheckCircle,
  FiSearch,
  FiUser,
  FiX,
  FiMapPin,
  FiMail,
  FiFileText,
  FiCalendar,
  FiTruck,
  FiEye,
  FiEyeOff,
  FiInfo,
  FiNavigation,
  FiCheckSquare
} from 'react-icons/fi';

import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Loader, { WaveLoader } from '../components/Common/Loader';

const Drivers = () => {

  const [drivers, setDrivers] = useState([]);
  const [terminals, setTerminals] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [editingDriver, setEditingDriver] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('table');

  const { isSuperAdmin, isAdmin } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    licenseNumber: '',
    licenseExpiry: '',
    terminalId: '',
    isActive: true
  });

  useEffect(() => {
    fetchDrivers();
    fetchTerminals();
    fetchVehicles();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/drivers');
      setDrivers(res.data.drivers);
    } catch {
      toast.error('Failed to fetch drivers');
    } finally {
      setLoading(false);
    }
  };

  const fetchTerminals = async () => {
    try {
      const res = await api.get('/terminals');
      setTerminals(res.data.terminals);
    } catch {
      toast.error('Failed to fetch terminals');
    }
  };

  const fetchVehicles = async () => {
    try {
      const res = await api.get('/vehicles');
      setVehicles(res.data.vehicles);
    } catch {
      console.error('Failed to fetch vehicles');
    }
  };

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      licenseNumber: '',
      licenseExpiry: '',
      terminalId: '',
      isActive: true
    });
    setEditingDriver(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDriver) {
        await api.put(`/drivers/${editingDriver._id}`, formData);
        toast.success('Driver updated');
      } else {
        await api.post('/drivers', formData);
        toast.success('Driver created');
      }
      setShowModal(false);
      resetForm();
      fetchDrivers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this driver?')) return;
    try {
      await api.delete(`/drivers/${id}`);
      toast.success('Driver deleted');
      fetchDrivers();
    } catch {
      toast.error('Delete failed');
    }
  };

  const toggleStatus = async (id) => {
    try {
      await api.patch(`/drivers/${id}/toggle-status`);
      toast.success('Driver status updated');
      fetchDrivers();
    } catch {
      toast.error('Status change failed');
    }
  };

  const openEditModal = (driver) => {
    setEditingDriver(driver);
    setFormData({
      ...driver,
      terminalId: driver.terminalId?._id || driver.terminalId,
      licenseExpiry: driver.licenseExpiry.split('T')[0]
    });
    setShowModal(true);
  };

  const openDetailModal = (driver) => {
    setSelectedDriver(driver);
    setShowDetailModal(true);
  };

  const isLicenseExpired = (date) => new Date(date) < new Date();

  const isLicenseExpiring = (date) => {
    const today = new Date();
    const expiry = new Date(date);
    const days = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return days <= 30 && days > 0;
  };

  const getLicenseStatus = (date) => {
    if (isLicenseExpired(date))
      return {
        label: 'Expired',
        color: 'bg-red-100 text-red-800',
        icon: FiAlertCircle
      };
    if (isLicenseExpiring(date))
      return {
        label: 'Expiring Soon',
        color: 'bg-yellow-100 text-yellow-800',
        icon: FiClock
      };
    return {
      label: 'Valid',
      color: 'bg-green-100 text-green-800',
      icon: FiCheckCircle
    };
  };

  const getDriverAssignment = (driver) => {
    const assignedVehicle = vehicles.find(v =>
      v.driverId?._id === driver._id && v.status === 'checked-in'
    );

    if (assignedVehicle) {
      return {
        isAssigned: true,
        vehicle: assignedVehicle,
        status: 'checked-in',
        message: `Assigned to ${assignedVehicle.plateNumber}`
      };
    }

    return {
      isAssigned: false,
      vehicle: null,
      status: 'available',
      message: 'Available - No vehicle assigned'
    };
  };

  const filteredDrivers = drivers.filter((d) => {
    const searchMatch =
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.phone.includes(searchTerm) ||
      d.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const statusMatch =
      filterStatus === 'all' ? true
        : filterStatus === 'active' ? d.isActive
          : filterStatus === 'inactive' ? !d.isActive
            : filterStatus === 'expired' ? isLicenseExpired(d.licenseExpiry)
              : filterStatus === 'expiring' ? isLicenseExpiring(d.licenseExpiry)
                : true;

    return searchMatch && statusMatch;
  });

  if (loading) {
    return (
      <div className="flex h-[90vh] items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <WaveLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white sticky top-0 z-10">
        <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold flex items-center text-amber-400">
                <FiUser className="mr-3 text-xl sm:text-2xl lg:text-3xl" />
                Drivers Management
              </h1>
              <p className="text-gray-400 text-sm sm:text-base">
                Manage and monitor all drivers in the fleet
              </p>
            </div>

            {/* Button */}
            {(isSuperAdmin || isAdmin) && (
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="bg-gradient-to-r from-amber-500 to-amber-600 px-4 sm:px-6 py-3 rounded-xl flex items-center justify-center hover:scale-105 transition text-sm sm:text-base"
              >
                <FiPlus className="mr-2" />
                <span className="hidden sm:inline">Add Driver</span>
                <span className="sm:hidden">Add</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Search and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, phone, or license number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap ${filterStatus === "all"
                ? "bg-amber-500 text-white"
                : "bg-gray-800/50 text-gray-400 hover:bg-gray-700 border border-gray-700"
                }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus("active")}
              className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap ${filterStatus === "active"
                ? "bg-green-500 text-white"
                : "bg-gray-800/50 text-gray-400 hover:bg-gray-700 border border-gray-700"
                }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilterStatus("inactive")}
              className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap ${filterStatus === "inactive"
                ? "bg-gray-600 text-white"
                : "bg-gray-800/50 text-gray-400 hover:bg-gray-700 border border-gray-700"
                }`}
            >
              Inactive
            </button>
            <button
              onClick={() => setFilterStatus("expired")}
              className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap ${filterStatus === "expired"
                ? "bg-red-500 text-white"
                : "bg-gray-800/50 text-gray-400 hover:bg-gray-700 border border-gray-700"
                }`}
            >
              License Expired
            </button>
            <button
              onClick={() => setFilterStatus("expiring")}
              className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap ${filterStatus === "expiring"
                ? "bg-yellow-500 text-white"
                : "bg-gray-800/50 text-gray-400 hover:bg-gray-700 border border-gray-700"
                }`}
            >
              Expiring Soon
            </button>
          </div>
        </div>

        {/* Drivers Table */}
        <div className="overflow-x-auto rounded-2xl shadow-lg" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style>
            {`
              .hide-scrollbar::-webkit-scrollbar {
                display: none;
              }
            `}
          </style>

          <table className="w-full bg-gray-800 rounded-2xl hide-scrollbar">
            <thead className="bg-gradient-to-r from-amber-500 to-amber-600">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white rounded-tl-2xl">Driver</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Contact</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Terminal</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">License</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">License Status</th>
                {/* <th className="px-6 py-4 text-left text-sm font-semibold text-white">Assignment</th> */}
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Status</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-white rounded-tr-2xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredDrivers.map((driver) => {
                const licenseStatus = getLicenseStatus(driver.licenseExpiry);
                const StatusIcon = licenseStatus.icon;
                const assignment = getDriverAssignment(driver);

                return (
                  <tr
                    key={driver._id}
                    className="hover:bg-gray-700/50 transition-colors cursor-pointer"
                    onClick={() => openDetailModal(driver)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="font-medium text-white">{driver.name}</div>
                          {/* <div className="text-xs text-gray-400">{driver.address || "No address"}</div> */}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-300">
                        <div className="flex items-center">
                          <FiPhone className="mr-2 text-amber-400" size={12} />
                          {driver.phone}
                        </div>
                        <div className="flex items-center mt-1">
                          <FiMail className="mr-2 text-amber-400" size={12} />
                          <span className="text-xs">{driver.email || "No email"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-300">
                        <FiMapPin className="mr-2 text-amber-400" size={14} />
                        {driver.terminalId?.name || "Not Assigned"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-300">
                        <div className="flex items-center">
                          <FiFileText className="mr-2 text-amber-400" size={12} />
                          {driver.licenseNumber}
                        </div>
                        {/* <div className="flex items-center mt-1">
                          <FiCalendar className="mr-2 text-amber-400" size={12} />
                          <span className="text-xs">Exp: {new Date(driver.licenseExpiry).toLocaleDateString()}</span>
                        </div> */}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${licenseStatus.color}`}>
                        <StatusIcon className="mr-1" size={12} />
                        {licenseStatus.label}
                      </span>
                    </td>
                    {/* <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        assignment.isAssigned 
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-green-500/20 text-green-400 border border-green-500/30'
                      }`}>
                        <FiTruck className="mr-1" size={12} />
                        {assignment.message}
                      </span>
                    </td> */}
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs rounded-full ${driver.isActive
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "bg-gray-600/20 text-gray-400 border border-gray-500/30"
                        }`}>
                        {driver.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => openEditModal(driver)}
                          className="p-2 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-all"
                          title="Edit Driver"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => toggleStatus(driver._id)}
                          className="p-2 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-all"
                          title={driver.isActive ? "Deactivate" : "Activate"}
                        >
                          <FiUserCheck size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(driver._id)}
                          className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                          title="Delete Driver"
                        >
                          <FiTrash2 size={16} />
                        </button>
                        <button
                          onClick={() => openDetailModal(driver)}
                          className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all"
                          title="View Details"
                        >
                          <FiEye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredDrivers.length === 0 && (
            <div className="bg-gray-800/30 rounded-2xl p-12 text-center border border-gray-700">
              <FiUser className="mx-auto h-12 w-12 text-gray-600" />
              <h3 className="mt-4 text-lg font-medium text-gray-300">No drivers found</h3>
              <p className="mt-2 text-gray-500">
                {searchTerm ? "Try adjusting your search" : "Get started by adding your first driver"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Driver Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] transform transition-all border border-gray-700 flex flex-col">
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4 rounded-t-2xl flex justify-between items-center flex-shrink-0">
              <h2 className="text-xl font-bold text-white">
                {editingDriver ? 'Edit Driver' : 'Add New Driver'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="p-1 hover:bg-white/20 rounded-lg transition"
              >
                <FiX className="text-white" size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name *</label>
                  <input
                    name="name"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number *</label>
                  <input
                    name="phone"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Address</label>
                  <input
                    name="address"
                    placeholder="Enter address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-300 mb-2">License Number *</label>
                  <input
                    name="licenseNumber"
                    placeholder="Enter license number"
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-300 mb-2">License Expiry Date *</label>
                  <input
                    type="date"
                    name="licenseExpiry"
                    value={formData.licenseExpiry}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Assigned Terminal *</label>
                  <select
                    name="terminalId"
                    value={formData.terminalId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                    required
                  >
                    <option value="">Select Terminal</option>
                    {terminals.map((terminal) => (
                      <option key={terminal._id} value={terminal._id}>
                        {terminal.name} - {terminal.location}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-6 py-2 border border-gray-600 rounded-xl text-gray-300 hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:scale-105 transition"
                >
                  {editingDriver ? 'Update Driver' : 'Create Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Driver Detail Modal */}
      {/* Driver Detail Modal */}
      {showDetailModal && selectedDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] transform transition-all border border-gray-700 flex flex-col">
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4 rounded-t-2xl flex justify-between items-center flex-shrink-0">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-3">
                  <FiUser className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Driver Details</h2>
                  <p className="text-amber-100 text-sm">{selectedDriver.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition"
              >
                <FiX className="text-white" size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {/* Basic Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-amber-400 mb-3 flex items-center">
                  <FiInfo className="mr-2" /> Personal Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">Full Name</p>
                    <p className="text-white font-medium">{selectedDriver.name}</p>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">Phone Number</p>
                    <p className="text-white font-medium">{selectedDriver.phone}</p>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-3 col-span-2">
                    <p className="text-gray-400 text-xs">Email Address</p>
                    <p className="text-white font-medium">{selectedDriver.email || "Not provided"}</p>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-3 col-span-2">
                    <p className="text-gray-400 text-xs">Address</p>
                    <p className="text-white font-medium">{selectedDriver.address || "Not provided"}</p>
                  </div>
                </div>
              </div>

              {/* License Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-amber-400 mb-3 flex items-center">
                  <FiFileText className="mr-2" /> License Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">License Number</p>
                    <p className="text-white font-medium">{selectedDriver.licenseNumber}</p>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">Expiry Date</p>
                    <p className="text-white font-medium">{new Date(selectedDriver.licenseExpiry).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-3 col-span-2">
                    <p className="text-gray-400 text-xs">License Status</p>
                    {(() => {
                      const status = getLicenseStatus(selectedDriver.licenseExpiry);
                      const StatusIcon = status.icon;
                      return (
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-1 ${status.color}`}>
                          <StatusIcon className="mr-1" size={14} />
                          {status.label}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Assignment Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-amber-400 mb-3 flex items-center">
                  <FiTruck className="mr-2" /> Current Assignment
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">Terminal</p>
                    <div className="flex items-center mt-1">
                      <FiMapPin className="mr-2 text-amber-400" size={14} />
                      <p className="text-white font-medium">{selectedDriver.terminalId?.name || "Not Assigned"}</p>
                    </div>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-3 col-span-2">
                    <p className="text-gray-400 text-xs">Vehicle Assignment</p>
                    {(() => {
                      const assignment = getDriverAssignment(selectedDriver);
                      return (
                        <div className="mt-1">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${assignment.isAssigned
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-green-500/20 text-green-400 border border-green-500/30'
                            }`}>
                            <FiTruck className="mr-1" size={14} />
                            {assignment.message}
                          </span>
                          {assignment.isAssigned && (
                            <div className="mt-2 text-sm text-gray-300">
                              Vehicle: {assignment.vehicle?.plateNumber} ({assignment.vehicle?.type})
                              <br />
                              Status: Checked In
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Account Status */}
              <div>
                <h3 className="text-lg font-semibold text-amber-400 mb-3 flex items-center">
                  <FiUserCheck className="mr-2" /> Account Status
                </h3>
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${selectedDriver.isActive
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-gray-600/20 text-gray-400 border border-gray-500/30"
                    }`}>
                    {selectedDriver.isActive ? "Active" : "Inactive"}
                  </span>
                  <p className="text-gray-400 text-xs mt-2">
                    {selectedDriver.isActive
                      ? "Driver is currently active and can be assigned to vehicles"
                      : "Driver is inactive and cannot be assigned to vehicles"}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-700 flex justify-end gap-3 flex-shrink-0">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  openEditModal(selectedDriver);
                }}
                className="px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition flex items-center"
              >
                <FiEdit2 className="mr-2" size={16} />
                Edit Driver
              </button>
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Drivers;