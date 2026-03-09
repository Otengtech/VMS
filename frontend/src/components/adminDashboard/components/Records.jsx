// src/components/adminDashboard/components/Records.jsx
import React, { useState, useEffect } from "react";
import {
  Truck,
  Search,
  Filter,
  Plus,
  Calendar,
  MapPin,
  User,
  Wrench,
  AlertCircle,
  CheckCircle,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";
import api from "../../../services/api";
import toast from "react-hot-toast";
import { format } from "date-fns";

const Records = () => {
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
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
    driverName: "",
    route: "",
    startLocation: "",
    endLocation: "",
    date: "",
    status: "active",
    distance: "",
    notes: ""
  });

  // Status options
  const statusOptions = [
    { value: "active", label: "Active", color: "bg-green-100 text-green-700 border-green-200" },
    { value: "in-transit", label: "In Transit", color: "bg-blue-100 text-blue-700 border-blue-200" },
    { value: "maintenance", label: "Maintenance", color: "bg-amber-100 text-amber-700 border-amber-200" },
    { value: "completed", label: "Completed", color: "bg-stone-100 text-stone-700 border-stone-200" },
    { value: "delayed", label: "Delayed", color: "bg-red-100 text-red-700 border-red-200" }
  ];

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [records, filters]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      // Replace with your actual API endpoint
      const response = await api.get("/vehicle-records");
      setRecords(response.data);
      setFilteredRecords(response.data);
    } catch (error) {
      console.error("Failed to fetch records:", error);
      toast.error("Failed to load vehicle records");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...records];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(record => 
        record.registrationNumber?.toLowerCase().includes(searchLower) ||
        record.driverName?.toLowerCase().includes(searchLower) ||
        record.route?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status !== "all") {
      filtered = filtered.filter(record => record.status === filters.status);
    }

    setFilteredRecords(filtered);
    setCurrentPage(1);
  };

  const handleView = (record) => {
    setSelectedRecord(record);
    setModalType("view");
    setShowModal(true);
  };

  const handleEdit = (record) => {
    setFormData(record);
    setSelectedRecord(record);
    setModalType("edit");
    setShowModal(true);
  };

  const handleAdd = () => {
    setFormData({
      registrationNumber: "",
      vehicleType: "truck",
      driverName: "",
      route: "",
      startLocation: "",
      endLocation: "",
      date: format(new Date(), "yyyy-MM-dd"),
      status: "active",
      distance: "",
      fuelUsed: "",
      notes: ""
    });
    setModalType("add");
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      // API call to delete record
      toast.success("Record deleted successfully");
      fetchRecords();
      setShowModal(false);
    } catch (error) {
      toast.error("Failed to delete record");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (modalType === "add") {
        await api.post("/vehicle-records", formData);
        toast.success("Record added successfully");
      } else if (modalType === "edit") {
        await api.put(`/vehicle-records/${selectedRecord.id}`, formData);
        toast.success("Record updated successfully");
      }
      
      fetchRecords();
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
  const currentItems = filteredRecords.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

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
              <h2 className="text-2xl font-light">Vehicle Records</h2>
            </div>
            <p className="text-white/80 text-sm">
              Track and manage vehicle operations
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchRecords}
              className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
            >
              <RefreshCw size={18} className={`text-white ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium hover:bg-white/30 transition-all"
            >
              <Plus size={16} />
              <span>Add Record</span>
            </button>
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
              placeholder="Search vehicles or drivers..."
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
              className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm"
            >
              <option value="all">All Status</option>
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Records Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-stone-200/80 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-stone-50 border-b border-stone-200/80">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase">Vehicle</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase">Driver</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase">Route</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200/80">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center">
                    <div className="flex justify-center">
                      <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : currentItems.length > 0 ? (
                currentItems.map((record) => (
                  <tr key={record.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                          <Truck size={16} className="text-amber-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-stone-800">{record.registrationNumber}</p>
                          <p className="text-xs text-stone-500">{record.vehicleType}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-stone-400" />
                        <span className="text-sm text-stone-700">{record.driverName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-stone-700">{record.route || "—"}</p>
                      <p className="text-xs text-stone-500">{record.startLocation} → {record.endLocation}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-sm text-stone-700">
                        <Calendar size={14} className="text-stone-400" />
                        {record.date ? format(new Date(record.date), "MMM dd, yyyy") : "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(record.status)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleView(record)}
                          className="p-1 hover:bg-stone-100 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye size={16} className="text-stone-500" />
                        </button>
                        <button
                          onClick={() => handleEdit(record)}
                          className="p-1 hover:bg-stone-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} className="text-stone-500" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRecord(record);
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
                  <td colSpan="6" className="px-4 py-12 text-center">
                    <Truck size={48} className="mx-auto text-stone-300 mb-3" />
                    <p className="text-stone-500 mb-2">No vehicle records found</p>
                    <button
                      onClick={handleAdd}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-purple-600 text-white rounded-full text-sm font-medium hover:shadow-lg transition-all"
                    >
                      <Plus size={16} />
                      <span>Add First Record</span>
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredRecords.length > 0 && (
          <div className="px-4 py-3 border-t border-stone-200/80 flex items-center justify-between">
            <p className="text-sm text-stone-500">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredRecords.length)} of {filteredRecords.length}
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
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-light text-stone-800">
                  {modalType === "add" ? "Add New Record" : "Edit Record"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-stone-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-stone-600" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
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
                    <option value="truck">Truck</option>
                    <option value="trailer">Trailer</option>
                    <option value="van">Van</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">Driver Name</label>
                  <input
                    type="text"
                    value={formData.driverName}
                    onChange={(e) => setFormData({...formData, driverName: e.target.value})}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">Route</label>
                  <input
                    type="text"
                    value={formData.route}
                    onChange={(e) => setFormData({...formData, route: e.target.value})}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-1">Start Location</label>
                    <input
                      type="text"
                      value={formData.startLocation}
                      onChange={(e) => setFormData({...formData, startLocation: e.target.value})}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-1">End Location</label>
                    <input
                      type="text"
                      value={formData.endLocation}
                      onChange={(e) => setFormData({...formData, endLocation: e.target.value})}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-1">Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
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
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-1">Distance (km)</label>
                    <input
                      type="number"
                      value={formData.distance}
                      onChange={(e) => setFormData({...formData, distance: e.target.value})}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-1">Fuel Used (L)</label>
                    <input
                      type="number"
                      value={formData.fuelUsed}
                      onChange={(e) => setFormData({...formData, fuelUsed: e.target.value})}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows="2"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm resize-none"
                  />
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
      {modalType === "view" && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-light text-stone-800">Record Details</h3>
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
                      <h4 className="font-medium text-stone-800">{selectedRecord.registrationNumber}</h4>
                      <p className="text-sm text-stone-600">{selectedRecord.vehicleType}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-stone-50 rounded-xl p-3">
                    <p className="text-xs text-stone-500 mb-1">Driver</p>
                    <p className="text-sm font-medium text-stone-800">{selectedRecord.driverName || "—"}</p>
                  </div>
                  <div className="bg-stone-50 rounded-xl p-3">
                    <p className="text-xs text-stone-500 mb-1">Status</p>
                    {getStatusBadge(selectedRecord.status)}
                  </div>
                </div>

                <div className="bg-stone-50 rounded-xl p-3">
                  <p className="text-xs text-stone-500 mb-1">Route</p>
                  <p className="text-sm text-stone-800">{selectedRecord.route || "—"}</p>
                  <p className="text-xs text-stone-500 mt-1">{selectedRecord.startLocation} → {selectedRecord.endLocation}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-stone-50 rounded-xl p-3">
                    <p className="text-xs text-stone-500 mb-1">Date</p>
                    <p className="text-sm text-stone-800">{selectedRecord.date ? format(new Date(selectedRecord.date), "MMM dd, yyyy") : "—"}</p>
                  </div>
                  <div className="bg-stone-50 rounded-xl p-3">
                    <p className="text-xs text-stone-500 mb-1">Distance</p>
                    <p className="text-sm text-stone-800">{selectedRecord.distance || 0} km</p>
                  </div>
                </div>

                {selectedRecord.notes && (
                  <div className="bg-stone-50 rounded-xl p-3">
                    <p className="text-xs text-stone-500 mb-1">Notes</p>
                    <p className="text-sm text-stone-800">{selectedRecord.notes}</p>
                  </div>
                )}
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
                <h3 className="text-lg font-medium text-stone-800">Delete Record</h3>
              </div>

              <p className="text-stone-600 text-sm mb-6">
                Are you sure you want to delete this record? This action cannot be undone.
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

export default Records;