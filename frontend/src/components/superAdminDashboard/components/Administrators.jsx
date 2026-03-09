import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../../../services/api";
import {
    Users, Mail, Phone, Calendar, MapPin,
    Search, X, Edit, Trash2, MoreHorizontal,
    CheckCircle, AlertCircle, Clock, Filter,
    Download, RefreshCw, ChevronRight, Building2,
    Shield, UserPlus, Lock
} from "lucide-react";

export default function SuperAdminAdmins() {
    const [admins, setAdmins] = useState([]);
    const [terminals, setTerminals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [adminToDelete, setAdminToDelete] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [editForm, setEditForm] = useState({
        fullName: "",
        email: "",
        contactNumber: "",
        age: "",
        status: "active",
        terminalId: ""
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [adminRes, terminalRes] = await Promise.all([
                API.get("/admin/all"),
                API.get("/terminal/all")
            ]);
            setAdmins(adminRes.data);
            setTerminals(terminalRes.data);
            
        } catch (err) {
            console.error("Error fetching data:", err);
            setError("Failed to load administrators. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const deleteAdmin = async () => {
        if (!adminToDelete) return;
        try {
            await API.delete(`/admin/${adminToDelete}`);
            setShowDeleteModal(false);
            setAdminToDelete(null);
            fetchData();
        } catch (err) {
            console.error("Error deleting admin:", err);
            setError("Failed to delete administrator.");
        }
    };

    const confirmDelete = (id) => {
        setAdminToDelete(id);
        setShowDeleteModal(true);
    };

    const openEditModal = (admin) => {
        setEditingAdmin(admin);
        setEditForm({
            fullName: admin.fullName || "",
            email: admin.email || "",
            contactNumber: admin.contactNumber || "",
            age: admin.age || "",
            status: admin.status || "active",
            terminalId: admin.terminalId?._id || admin.terminalId || ""
        });
        setShowEditModal(true);
    };

    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!editingAdmin) return;

        try {
            await API.put(`/admin/${editingAdmin._id}`, editForm);
            setShowEditModal(false);
            setEditingAdmin(null);
            fetchData();
        } catch (err) {
            console.error("Error updating admin:", err);
            setError("Failed to update administrator.");
        }
    };

    // Filter admins based on search and status
    const filteredAdmins = admins.filter(admin => {
        const matchesSearch =
            admin.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            admin.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            admin.contactNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            admin.terminalId?.name?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "all" || admin.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: admins.length,
        active: admins.filter(a => a.isActive === true).length,
        inactive: admins.filter(a => a.isActive === false).length,
        assigned: admins.filter(a => a.terminalId).length,
        unassigned: admins.filter(a => !a.terminalId).length
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
                    Are you sure you want to delete this administrator? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={() => setShowDeleteModal(false)}
                        className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={deleteAdmin}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete Admin
                    </button>
                </div>
            </div>
        </div>
    );

    const EditModal = () => (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4 animate-in slide-in-from-bottom-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-stone-800">Edit Administrator</h3>
                    <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-stone-100 rounded-lg">
                        <X className="w-5 h-5 text-stone-500" />
                    </button>
                </div>

                <form onSubmit={handleEditSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-stone-600 mb-1">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="fullName"
                            value={editForm.fullName}
                            onChange={handleEditChange}
                            required
                            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-600 mb-1">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={editForm.email}
                            onChange={handleEditChange}
                            required
                            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-stone-600 mb-1">
                                Contact Number
                            </label>
                            <input
                                type="text"
                                name="contactNumber"
                                value={editForm.contactNumber}
                                onChange={handleEditChange}
                                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-stone-600 mb-1">
                                Age
                            </label>
                            <input
                                type="number"
                                name="age"
                                value={editForm.age}
                                onChange={handleEditChange}
                                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                            />
                        </div>
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
                            <option value="suspended">Suspended</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-600 mb-1">
                            Assign to Terminal
                        </label>
                        <select
                            name="terminalId"
                            value={editForm.terminalId}
                            onChange={handleEditChange}
                            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                        >
                            <option value="">No Terminal</option>
                            {terminals.map(terminal => (
                                <option key={terminal._id} value={terminal._id}>
                                    {terminal.name} - {terminal.location}
                                </option>
                            ))}
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
                            Update Admin
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
                    <p className="text-sm text-stone-600">Loading administrators...</p>
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
                    <h1 className="text-2xl font-bold text-stone-800">Administrator Management</h1>
                    <p className="text-sm text-stone-500 mt-1">Manage all system administrators</p>
                </div>
                <Link
                    to="/createterminal_admin"
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-full hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-purple-500/25 w-full sm:w-auto justify-center"
                >
                    <UserPlus className="w-4 h-4" />
                    Create Admin
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard label="Total" value={stats.total} icon={Users} color="bg-purple-500" />
                <StatCard label="Active" value={stats.active} icon={CheckCircle} color="bg-green-500" />
                <StatCard label="Inactive" value={stats.inactive} icon={Clock} color="bg-amber-500" />
                <StatCard label="Assigned" value={stats.assigned} icon={Building2} color="bg-blue-500" />
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-stone-200 p-4">
                <div className="flex flex-col md:flex-row md:items-center gap-3 w-full">

                    {/* Search */}
                    <div className="relative w-full md:flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input
                            type="text"
                            placeholder="Search administrators..."
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
                            <option value="suspended">Suspended</option>
                        </select>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">

                        {/* Refresh Button */}
                        <button
                            onClick={fetchData}
                            className="flex items-center justify-center w-10 h-10 p-2 hover:bg-stone-100 rounded-lg text-stone-600"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>

                        {/* Export Button */}
                        <button className="flex items-center justify-center w-10 h-10 p-2 hover:bg-stone-100 rounded-lg text-stone-600">
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
                        onClick={fetchData}
                        className="ml-auto text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Admins Grid */}
            {filteredAdmins.length === 0 ? (
                <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
                    <Users className="w-16 h-16 text-stone-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-stone-800 mb-2">No Administrators Found</h3>
                    <p className="text-stone-500 mb-6">
                        {searchTerm || statusFilter !== "all"
                            ? "Try adjusting your search or filters"
                            : "Get started by creating your first administrator."}
                    </p>
                    <Link
                        to="/superadmin/admins/create"
                        className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
                    >
                        <UserPlus className="w-4 h-4" />
                        Create New Admin
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredAdmins.map((admin) => (
                        <div key={admin._id} className="bg-white rounded-xl border border-stone-200 hover:shadow-lg transition-all overflow-hidden group">
                            <div className="p-5">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center text-white font-semibold text-lg">
                                            {admin.fullName?.charAt(0) || "A"}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-stone-800">{admin.name}</h3>
                                            <p className="text-xs text-stone-500 capitalize">{admin.role || "Admin"}</p>
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
                                        <Mail className="w-4 h-4 text-stone-400" />
                                        <span className="truncate">{admin.email}</span>
                                    </div>
                                    {admin.contactNumber && (
                                        <div className="flex items-center gap-2 text-stone-600">
                                            <Phone className="w-4 h-4 text-stone-400" />
                                            <span>{admin.contactNumber}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-stone-600">
                                        <Building2 className="w-4 h-4 text-stone-400" />
                                        <span className="truncate">{admin.terminalId?.name || "No Terminal Assigned"}</span>
                                    </div>
                                    {admin.age && (
                                        <div className="flex items-center gap-2 text-stone-600">
                                            <Calendar className="w-4 h-4 text-stone-400" />
                                            <span>{admin.age} years</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                                    <span className={`text-xs px-2 py-1 rounded-full ${admin.status === 'active' ? 'bg-green-100 text-green-700' :
                                            admin.status === 'inactive' ? 'bg-stone-100 text-stone-600' :
                                                'bg-red-100 text-red-700'
                                        }`}>
                                        {admin.status || 'Active'}
                                    </span>

                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => openEditModal(admin)}
                                            className="p-1.5 hover:bg-stone-100 rounded-lg text-blue-600"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => confirmDelete(admin._id)}
                                            className="p-1.5 hover:bg-stone-100 rounded-lg text-red-600"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <Link
                                            to={`/superadmin/admins/${admin._id}`}
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