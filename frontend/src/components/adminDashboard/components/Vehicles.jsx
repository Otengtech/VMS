// src/components/adminDashboard/components/Vehicles.jsx
import React, { useState, useEffect } from "react";
import {
  Truck,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  User,
  Phone,
  Package,
  CheckCircle,
  AlertCircle,
  Wrench
} from "lucide-react";
import api from "../../../services/api";
import toast from "react-hot-toast";

const Vehicles = () => {
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("view"); // view, edit, add, delete
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Filter states
  const [filters, setFilters] = useState({
    search: "",
    status: "all"
  });
  const [showFilters, setShowFilters] = useState(false);

  // Form state for add/edit
  const [formData, setFormData] = useState({
    registrationNumber: "",
    vehicleType: "truck",
    make: "",
    model: "",
    year: "",
    color: "",
    capacity: "",
    assignedDriverName: "",
    assignedDriverId: "",
    assignedDriverPhone: "",
    status: "active"
  });

  // Vehicle types
  const vehicleTypes = [
    { value: "truck", label: "Truck" },
    { value: "trailer", label: "Trailer" },
    { value: "container", label: "Container" },
    { value: "van", label: "Van" }
  ];

  // Status options
  const statusOptions = [
    { value: "active", label: "Active", color: "bg-green-100 text-green-700" },
    { value: "on-trip", label: "On Trip", color: "bg-blue-100 text-blue-700" },
    { value: "maintenance", label: "Maintenance", color: "bg-amber-100 text-amber-700" },
    { value: "idle", label: "Idle", color: "bg-stone-100 text-stone-700" }
  ];

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [vehicles, filters]);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      // Replace with your actual API endpoint
      const response = await api.get("/vehicles");
      setVehicles(response.data);
      setFilteredVehicles(response.data);
    } catch (error) {
      console.error("Failed to fetch vehicles:", error);
      toast.error("Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...vehicles];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(vehicle => 
        vehicle.registrationNumber?.toLowerCase().includes(searchLower) ||
        vehicle.make?.toLowerCase().includes(searchLower) ||
        vehicle.model?.toLowerCase().includes(searchLower) ||
        vehicle.assignedDriver?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status !== "all") {
      filtered = filtered.filter(vehicle => vehicle.status === filters.status);
    }

    setFilteredVehicles(filtered);
    setCurrentPage(1);
  };

  const handleView = (vehicle) => {
    setSelectedVehicle(vehicle);
    setModalType("view");
    setShowModal(true);
  };

  const handleEdit = (vehicle) => {
    setFormData(vehicle);
    setSelectedVehicle(vehicle);
    setModalType("edit");
    setShowModal(true);
  };

  const handleAdd = () => {
    setFormData({
      registrationNumber: "",
      vehicleType: "truck",
      make: "",
      model: "",
      year: "",
      color: "",
      capacity: "",
      assignedDriver: "",
      assignedDriverId: "",
      assignedDriverPhone: "",
      status: "active"
    });
    setModalType("add");
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      // API call to delete vehicle
      toast.success("Vehicle deleted successfully");
      fetchVehicles();
      setShowModal(false);
    } catch (error) {
      toast.error("Failed to delete vehicle");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (modalType === "add") {
        await api.post("/vehicles", formData);
        toast.success("Vehicle added successfully");
      } else if (modalType === "edit") {
        await api.put(`/vehicles/${selectedVehicle.id}`, formData);
        toast.success("Vehicle updated successfully");
      }
      
      fetchVehicles();
      setShowModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredVehicles.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);

  const getStatusBadge = (status) => {
    const option = statusOptions.find(opt => opt.value === status);
    if (!option) return null;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${option.color}`}>
        {option.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-amber-500 to-purple-600 rounded-2xl text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Truck className="w-5 h-5" />
              <h2 className="text-2xl font-light">Vehicle Management</h2>
            </div>
            <p className="text-white/80 text-sm">
              Manage your fleet vehicles and assignments
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchVehicles}
              className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
            >
              <RefreshCw size={18} className={`text-white ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium hover:bg-white/30 transition-all"
            >
              <Plus size={16} />
              <span>Add Vehicle</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-stone-200/80 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-stone-500">Total Vehicles</p>
              <p className="text-2xl font-light text-stone-800">{vehicles.length}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Truck className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-stone-200/80 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-stone-500">Active</p>
              <p className="text-2xl font-light text-green-600">
                {vehicles.filter(v => v.status === "active" || v.status === "on-trip").length}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-stone-200/80 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-stone-500">Maintenance</p>
              <p className="text-2xl font-light text-amber-600">
                {vehicles.filter(v => v.status === "maintenance").length}
              </p>
            </div>
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Wrench className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-stone-200/80 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-stone-500">Idle</p>
              <p className="text-2xl font-light text-stone-600">
                {vehicles.filter(v => v.status === "idle").length}
              </p>
            </div>
            <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center">
              <Truck className="w-5 h-5 text-stone-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-stone-200/80 shadow-lg p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search by reg no., make, model, driver..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
              ${showFilters 
                ? 'bg-gradient-to-r from-amber-500 to-purple-600 text-white' 
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }
            `}
          >
            <Filter size={16} />
            <span>Filters</span>
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-stone-200/80">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full sm:w-48 px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm"
            >
              <option value="all">All Status</option>
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Vehicles Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-stone-200/80 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-stone-50 border-b border-stone-200/80">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase">Vehicle</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase">Details</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase">Driver</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200/80">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center">
                    <div className="flex justify-center">
                      <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : currentItems.length > 0 ? (
                currentItems.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                          <Truck size={18} className="text-amber-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-stone-800">{vehicle.registrationNumber}</p>
                          <p className="text-xs text-stone-500">{vehicle.vehicleType}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-stone-700">{vehicle.make} {vehicle.model}</p>
                      <p className="text-xs text-stone-500">{vehicle.year} • {vehicle.color} • {vehicle.capacity} tons</p>
                    </td>
                    <td className="px-4 py-3">
                      {vehicle.assignedDriver ? (
                        <div>
                          <p className="text-sm text-stone-700 flex items-center gap-1">
                            <User size={14} className="text-stone-400" />
                            {vehicle.assignedDriver}
                          </p>
                          <p className="text-xs text-stone-500 flex items-center gap-1">
                            <Phone size={12} className="text-stone-400" />
                            {vehicle.assignedDriverPhone || "No phone"}
                          </p>
                        </div>
                      ) : (
                        <span className="text-sm text-stone-400">Not assigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(vehicle.status)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleView(vehicle)}
                          className="p-1 hover:bg-stone-100 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye size={16} className="text-stone-500" />
                        </button>
                        <button
                          onClick={() => handleEdit(vehicle)}
                          className="p-1 hover:bg-stone-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} className="text-stone-500" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedVehicle(vehicle);
                            setModalType("delete");
                            setShowModal(true);
                          }}
                          className="p-1 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-4 py-12 text-center">
                    <Truck size={48} className="mx-auto text-stone-300 mb-3" />
                    <p className="text-stone-500 mb-2">No vehicles found</p>
                    <button
                      onClick={handleAdd}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-purple-600 text-white rounded-full text-sm font-medium hover:shadow-lg transition-all"
                    >
                      <Plus size={16} />
                      <span>Add First Vehicle</span>
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredVehicles.length > 0 && (
          <div className="px-4 py-3 border-t border-stone-200/80 flex items-center justify-between">
            <p className="text-sm text-stone-500">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredVehicles.length)} of {filteredVehicles.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 hover:bg-stone-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <ChevronLeft size={18} className="text-stone-600" />
              </button>
              <span className="text-sm text-stone-700">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 hover:bg-stone-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <ChevronRight size={18} className="text-stone-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(modalType === "add" || modalType === "edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-light text-stone-800">
                  {modalType === "add" ? "Add New Vehicle" : "Edit Vehicle"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-stone-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-stone-600" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-1">Registration Number *</label>
                    <input
                      type="text"
                      value={formData.registrationNumber}
                      onChange={(e) => setFormData({...formData, registrationNumber: e.target.value})}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-1">Vehicle Type</label>
                    <select
                      value={formData.vehicleType}
                      onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm"
                    >
                      {vehicleTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-1">Make</label>
                    <input
                      type="text"
                      value={formData.make}
                      onChange={(e) => setFormData({...formData, make: e.target.value})}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-1">Model</label>
                    <input
                      type="text"
                      value={formData.model}
                      onChange={(e) => setFormData({...formData, model: e.target.value})}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-1">Year</label>
                    <input
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({...formData, year: e.target.value})}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-1">Color</label>
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-1">Capacity (tons)</label>
                    <input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm"
                    >
                      {statusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-1">Assigned Driver</label>
                    <input
                      type="text"
                      value={formData.assignedDriver}
                      onChange={(e) => setFormData({...formData, assignedDriver: e.target.value})}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-1">Driver ID</label>
                    <input
                      type="text"
                      value={formData.assignedDriverId}
                      onChange={(e) => setFormData({...formData, assignedDriverId: e.target.value})}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-1">Driver Phone</label>
                    <input
                      type="text"
                      value={formData.assignedDriverPhone}
                      onChange={(e) => setFormData({...formData, assignedDriverPhone: e.target.value})}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-stone-200 rounded-lg text-sm text-stone-700 hover:bg-stone-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {modalType === "view" && selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-light text-stone-800">Vehicle Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-stone-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-stone-600" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gradient-to-r from-amber-50 to-purple-50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Truck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-stone-800">{selectedVehicle.registrationNumber}</h4>
                      <p className="text-sm text-stone-600">{selectedVehicle.vehicleType}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-stone-50 rounded-xl p-3">
                    <p className="text-xs text-stone-500 mb-1">Make/Model</p>
                    <p className="text-sm font-medium text-stone-800">{selectedVehicle.make} {selectedVehicle.model}</p>
                  </div>
                  <div className="bg-stone-50 rounded-xl p-3">
                    <p className="text-xs text-stone-500 mb-1">Year/Color</p>
                    <p className="text-sm font-medium text-stone-800">{selectedVehicle.year} • {selectedVehicle.color}</p>
                  </div>
                </div>

                <div className="bg-stone-50 rounded-xl p-3">
                  <p className="text-xs text-stone-500 mb-1">Capacity</p>
                  <p className="text-sm font-medium text-stone-800">{selectedVehicle.capacity} tons</p>
                </div>

                <div className="bg-stone-50 rounded-xl p-3">
                  <p className="text-xs text-stone-500 mb-1">Driver Information</p>
                  {selectedVehicle.assignedDriver ? (
                    <div>
                      <p className="text-sm font-medium text-stone-800">{selectedVehicle.assignedDriver}</p>
                      <p className="text-xs text-stone-500">ID: {selectedVehicle.assignedDriverId || "N/A"}</p>
                      <p className="text-xs text-stone-500">Phone: {selectedVehicle.assignedDriverPhone || "N/A"}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-stone-400">No driver assigned</p>
                  )}
                </div>

                <div className="bg-stone-50 rounded-xl p-3">
                  <p className="text-xs text-stone-500 mb-1">Status</p>
                  {getStatusBadge(selectedVehicle.status)}
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-stone-100 text-stone-700 rounded-lg text-sm font-medium hover:bg-stone-200 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {modalType === "delete" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-stone-800">Delete Vehicle</h3>
              </div>

              <p className="text-stone-600 text-sm mb-6">
                Are you sure you want to delete this vehicle? This action cannot be undone.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-stone-200 rounded-lg text-sm text-stone-700 hover:bg-stone-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vehicles;