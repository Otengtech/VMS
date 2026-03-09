// src/components/adminDashboard/components/CreateTerminal.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../services/api";
import { 
  Terminal, 
  MapPin, 
  Home, 
  X, 
  CheckCircle, 
  AlertCircle,
  Loader,
  ArrowLeft
} from "lucide-react";
import toast from "react-hot-toast";

const CreateTerminal = ({ onSuccess }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    address: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/terminal/create", formData);
      toast.success("Terminal created successfully!");
      
      // Call onSuccess callback if provided (for parent component refresh)
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      // Navigate based on user role
      if (user?.role === "superadmin") {
        navigate("/superadmin/terminals");
      } else {
        navigate("/admin/dashboard");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create terminal");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="w-full mx-auto">
      {/* Header with gradient */}
      <div className="p-6 bg-gradient-to-r from-amber-500 to-purple-600 rounded-2xl text-white mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {/* <Terminal className="w-5 h-5" /> */}
              <h2 className="text-2xl font-light">Create New Terminal</h2>
            </div>
            <p className="text-white/80 text-sm">
              Fill in the details below to create a new terminal. Fields marked with * are required.
            </p>
          </div>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="px-3 overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className=" space-y-6">
            {/* Terminal Name */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-stone-500 uppercase tracking-wider ml-1 flex items-center gap-1">
                Terminal Name <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Terminal size={18} className="text-stone-400 group-focus-within:text-amber-500 transition-colors" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Main Branch Terminal"
                  className="w-full pl-12 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl 
                           text-stone-700 placeholder-stone-400 focus:outline-none focus:border-amber-400 
                           focus:ring-2 focus:ring-amber-200 transition-all duration-300
                           hover:bg-white hover:border-stone-300"
                />
              </div>
              <p className="text-xs text-stone-400 ml-1">
                Choose a unique name for your terminal
              </p>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-stone-500 uppercase tracking-wider ml-1">
                Location
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MapPin size={18} className="text-stone-400 group-focus-within:text-amber-500 transition-colors" />
                </div>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Downtown, New York"
                  className="w-full pl-12 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl 
                           text-stone-700 placeholder-stone-400 focus:outline-none focus:border-amber-400 
                           focus:ring-2 focus:ring-amber-200 transition-all duration-300
                           hover:bg-white hover:border-stone-300"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-stone-500 uppercase tracking-wider ml-1">
                Address
              </label>
              <div className="relative group">
                <div className="absolute top-4 left-0 pl-4 flex items-start pointer-events-none">
                  <Home size={18} className="text-stone-400 group-focus-within:text-amber-500 transition-colors" />
                </div>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Enter the full address of the terminal"
                  className="w-full pl-12 pr-4 py-3.5 border border-stone-200 rounded-xl 
                           text-stone-700 placeholder-stone-400 focus:outline-none focus:border-amber-400 
                           focus:ring-2 focus:ring-amber-200 transition-all duration-300
                           hover:bg-white hover:border-stone-300 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="px-8 py-4 flex items-center justify-between">
            <div></div>
            
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-8 py-2.5 bg-gradient-to-r from-amber-500 to-purple-600 text-white rounded-full text-sm font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  <span>Create Terminal</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Preview Card (Optional) */}
      {formData.name && (
        <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-stone-200/80 shadow-lg p-6">
          <h3 className="text-sm font-medium text-stone-500 uppercase tracking-wider mb-4">Preview</h3>
          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-50 to-purple-50 rounded-xl">
            <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Terminal className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-medium text-stone-800">{formData.name || "Terminal Name"}</p>
              <p className="text-sm text-stone-600">{formData.location || "Location not set"}</p>
              {formData.address && (
                <p className="text-xs text-stone-500 mt-1">{formData.address}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateTerminal;