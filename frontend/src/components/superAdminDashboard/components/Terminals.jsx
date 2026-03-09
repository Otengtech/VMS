import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../../../services/api";
import {
    Building2, MapPin, User, Calendar, Plus,
    Search, X, Edit, Trash2, MoreHorizontal,
    CheckCircle, AlertCircle, Clock, Filter,
    Download, RefreshCw, ChevronRight, Server
} from "lucide-react";

export default function SuperAdminTerminals() {
    const [terminals, setTerminals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [terminalToDelete, setTerminalToDelete] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingTerminal, setEditingTerminal] = useState(null);
    const [editForm, setEditForm] = useState({
        name: "",
        location: "",
        address: "",
        status: "active"
    });
    
    const fetchTerminals = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await API.get("/terminal/all");
            setTerminals(res.data);
        } catch (err) {
            console.error("Error fetching terminals:", err);
            setError("Failed to load terminals. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTerminals();
    }, []);

    const deleteTerminal = async () => {
        if (!terminalToDelete) return;
        try {
            await API.delete(`/terminal/${terminalToDelete}`);
            setShowDeleteModal(false);
            setTerminalToDelete(null);
            fetchTerminals();
        } catch (err) {
            console.error("Error deleting terminal:", err);
            setError("Failed to delete terminal.");
        }
    };

    const confirmDelete = (id) => {
        setTerminalToDelete(id);
        setShowDeleteModal(true);
    };

    const openEditModal = (terminal) => {
        setEditingTerminal(terminal);
        setEditForm({
            name: terminal.name,
            location: terminal.location,
            address: terminal.address || "",
            status: terminal.status || "active"
        });
        setShowEditModal(true);
    };

    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!editingTerminal) return;

        try {
            await API.put(`/terminal/${editingTerminal._id}`, editForm);
            setShowEditModal(false);
            setEditingTerminal(null);
            fetchTerminals();
        } catch (err) {
            console.error("Error updating terminal:", err);
            setError("Failed to update terminal.");
        }
    };

    // Filter terminals based on search and status
    const filteredTerminals = terminals.filter(terminal => {
        const matchesSearch =
            terminal.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            terminal.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            terminal.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            terminal.code?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "all" || terminal.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: terminals.length,
        active: terminals.filter(t => t.status === 'active').length,
        inactive: terminals.filter(t => t.status === 'inactive').length,
        maintenance: terminals.filter(t => t.status === 'maintenance').length,
        unassigned: terminals.filter(t => !t.adminId).length
    };

    const DeleteConfirmationModal = () => (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 animate-in slide-in-from-bottom-4">
                <div className="flex items-center gap-3 text-red-600 mb-4">
                    <div className="p-3 bg-red-100 rounded-full">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold">Confirm Deletion</h3>
                </div>
                <p className="text-stone-600 mb-6">
                    Are you sure you want to delete this terminal? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={() => setShowDeleteModal(false)}
                        className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={deleteTerminal}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete Terminal
                    </button>
                </div>
            </div>
        </div>
    );

    const EditModal = () => (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4 animate-in slide-in-from-bottom-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-stone-800">Edit Terminal</h3>
                    <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-stone-100 rounded-lg">
                        <X className="w-5 h-5 text-stone-500" />
                    </button>
                </div>

                <form onSubmit={handleEditSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-stone-600 mb-1">
                            Terminal Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={editForm.name}
                            onChange={handleEditChange}
                            required
                            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-600 mb-1">
                            Location <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="location"
                            value={editForm.location}
                            onChange={handleEditChange}
                            required
                            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-600 mb-1">
                            Address
                        </label>
                        <textarea
                            name="address"
                            value={editForm.address}
                            onChange={handleEditChange}
                            rows="2"
                            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-600 mb-1">
                            Status
                        </label>
                        <select
                            name="status"
                            value={editForm.status}
                            onChange={handleEditChange}
                            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="maintenance">Maintenance</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setShowEditModal(false)}
                            className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            Update Terminal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    const StatCard = ({ label, value, icon: Icon, color }) => (
        <div className="bg-white rounded-xl border border-stone-200 p-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs text-stone-500">{label}</p>
                    <p className="text-xl font-semibold text-stone-800 mt-1">{value}</p>
                </div>
                <div className={`${color} p-2 rounded-full flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white" />
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-3" />
                    <p className="text-sm text-stone-600">Loading terminals...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-6">
            {showDeleteModal && <DeleteConfirmationModal />}
            {showEditModal && <EditModal />}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-stone-800">Terminal Management</h1>
                    <p className="text-sm text-stone-500 mt-1">Manage all terminal locations</p>
                </div>
                <Link
                    to="/createterminal_admin"
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-full hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-purple-500/25 w-full sm:w-auto justify-center"
                >
                    <Plus className="w-4 h-4" />
                    Create Terminal
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard label="Total" value={stats.total} icon={Building2} color="bg-purple-500" />
                <StatCard label="Active" value={stats.active} icon={CheckCircle} color="bg-green-500" />
                <StatCard label="Inactive" value={stats.inactive} icon={Clock} color="bg-amber-500" />
                <StatCard label="Unassigned" value={stats.unassigned} icon={User} color="bg-blue-500" />
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-stone-200 p-4">
                <div className="flex flex-col md:flex-row md:items-center gap-3 w-full">

                    {/* Search */}
                    <div className="relative w-full md:flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input
                            type="text"
                            placeholder="Search terminals..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-9 py-2 bg-stone-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                        />

                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                            >
                                <X className="w-4 h-4 text-stone-400 hover:text-stone-600" />
                            </button>
                        )}
                    </div>

                    {/* Status Filter */}
                    <div className="relative w-full md:w-48">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full pl-9 pr-8 py-2 bg-stone-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 appearance-none"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="maintenance">Maintenance</option>
                        </select>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">

                        {/* Refresh */}
                        <button
                            onClick={fetchTerminals}
                            className="flex items-center justify-center p-2 w-10 h-10 hover:bg-stone-100 rounded-lg text-stone-600"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>

                        {/* Export */}
                        <button className="flex items-center justify-center p-2 w-10 h-10 hover:bg-stone-100 rounded-lg text-stone-600">
                            <Download className="w-4 h-4" />
                        </button>

                    </div>
                </div>
            </div>
            
            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <p className="text-red-700 text-sm">{error}</p>
                    <button
                        onClick={fetchTerminals}
                        className="ml-auto text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Terminals Grid */}
            {filteredTerminals.length === 0 ? (
                <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
                    <Building2 className="w-16 h-16 rounded-full text-stone-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-stone-800 mb-2">No Terminals Found</h3>
                    <p className="text-stone-500 mb-6">
                        {searchTerm || statusFilter !== "all"
                            ? "Try adjusting your search or filters"
                            : "Get started by creating your first terminal."}
                    </p>
                    <Link
                        to="/createterminal_admin"
                        className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        Create New Terminal
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredTerminals.map((terminal) => (
                        <div key={terminal._id} className="bg-white rounded-xl border border-stone-200 hover:shadow-lg transition-all overflow-hidden group">
                            <div className="p-5">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <h3 className="font-semibold text-stone-800">{terminal.name}</h3>
                                            <p className="text-xs text-stone-500">ID: {terminal.code || terminal._id.slice(-6)}</p>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-stone-100 rounded-lg">
                                            <MoreHorizontal className="w-4 h-4 text-stone-400" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm mb-4">
                                    <div className="flex items-center gap-2 text-stone-600">
                                        <MapPin className="w-4 h-4 text-stone-400" />
                                        <span className="truncate">{terminal.location}</span>
                                    </div>
                                    {terminal.address && (
                                        <div className="flex items-center gap-2 text-stone-600">
                                            <Server className="w-4 h-4 text-stone-400" />
                                            <span className="truncate text-xs">{terminal.address}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-stone-600">
                                        <User className="w-4 h-4 text-stone-400" />
                                        <span className="truncate">{terminal.adminId?.fullName || "No Admin Assigned"}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                                    <span className={`text-xs px-2 py-1 rounded-full ${terminal.status === 'active' ? 'bg-green-100 text-green-700' :
                                            terminal.status === 'inactive' ? 'bg-stone-100 text-stone-600' :
                                                'bg-amber-100 text-amber-700'
                                        }`}>
                                        {terminal.status || 'Active'}
                                    </span>

                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => openEditModal(terminal)}
                                            className="p-1.5 hover:bg-stone-100 rounded-lg text-blue-600"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => confirmDelete(terminal._id)}
                                            className="p-1.5 hover:bg-stone-100 rounded-lg text-red-600"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <Link
                                            to={`/superadmin/terminals/${terminal._id}`}
                                            className="p-1.5 hover:bg-stone-100 rounded-lg text-purple-600"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}