// src/components/adminDashboard/components/Profile.js
import React, { useState } from "react";
import { 
  User, 
  Mail, 
  Calendar, 
  Phone, 
  MapPin, 
  Shield, 
  ChevronRight,
  Edit2,
  Save,
  X,
  Camera,
  Clock,
  Award,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../services/api";

const Profile = ({ user: propUser }) => {
  const { user: contextUser, updateUser } = useAuth();
  const user = propUser || contextUser;
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  
  const [formData, setFormData] = useState({
    name: user?.name || "",
    age: user?.age || "",
    contact: user?.contact || "",
    dateOfBirth: user?.dateOfBirth?.split("T")[0] || "",
    address: user?.address || "",
    bio: user?.bio || ""
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
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // API call to update profile
      const response = await api.put("/users/profile", formData);
      
      // Update user in context if needed
      if (updateUser) {
        updateUser(response.data.user);
      }
      
      setSuccessMessage("Profile updated successfully!");
      setIsEditing(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      age: user?.age || "",
      contact: user?.contact || "",
      dateOfBirth: user?.dateOfBirth?.split("T")[0] || "",
      address: user?.address || "",
      bio: user?.bio || ""
    });
    setIsEditing(false);
    setErrorMessage("");
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'superadmin':
        return 'bg-gradient-to-r from-purple-500 to-indigo-600';
      case 'admin':
        return 'bg-gradient-to-r from-amber-500 to-orange-600';
      default:
        return 'bg-gradient-to-r from-blue-500 to-cyan-600';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const accountInfo = [
    { label: 'Member Since', value: formatDate(user?.createdAt), icon: Clock },
    { label: 'Last Login', value: user?.lastLogin ? formatDate(user.lastLogin) : 'Today', icon: Calendar },
    { label: 'User ID', value: user?.id || 'N/A', icon: Award },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with gradient */}
      <div className="p-6 bg-gradient-to-r from-amber-500 to-purple-600 rounded-2xl text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-light mb-2">My Profile</h2>
            <p className="text-white/80 text-sm">
              Manage your personal information and account settings
            </p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium hover:bg-white/30 transition-all duration-200"
            >
              <Edit2 size={16} />
              <span>Edit Profile</span>
            </button>
          )}
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3">
          <CheckCircle size={20} className="text-green-500" />
          <p className="text-green-700 text-sm">{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
          <AlertCircle size={20} className="text-red-500" />
          <p className="text-red-700 text-sm">{errorMessage}</p>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="backdrop-blur-sm rounded-2xl overflow-hidden">
        {/* Profile Header with Avatar */}
        {/* <div className="relative h-32 bg-gradient-to-r from-amber-500 to-purple-600">
          <div className="absolute -bottom-12 left-8">
            <div className="relative group">
              <div className="w-24 h-24 bg-white rounded-2xl shadow-xl flex items-center justify-center">
                <div className={`w-20 h-20 ${getRoleBadgeColor(user?.role)} rounded-xl flex items-center justify-center text-white font-bold text-2xl`}>
                  {getInitials(user?.name)}
                </div>
              </div>
              {isEditing && (
                <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-stone-800 rounded-full flex items-center justify-center hover:bg-stone-700 transition-colors">
                  <Camera size={14} className="text-white" />
                </button>
              )}
            </div>
          </div>
        </div> */}

        {/* Profile Content */}
        <div className="pt-16 p-8">
          {isEditing ? (
            // Edit Mode Form
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-stone-500 uppercase tracking-wider ml-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={16} className="text-stone-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-700 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                {/* Age */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-stone-500 uppercase tracking-wider ml-1">
                    Age
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar size={16} className="text-stone-400" />
                    </div>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-700 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all"
                      placeholder="Enter your age"
                    />
                  </div>
                </div>

                {/* Contact */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-stone-500 uppercase tracking-wider ml-1">
                    Contact Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone size={16} className="text-stone-400" />
                    </div>
                    <input
                      type="text"
                      name="contact"
                      value={formData.contact}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-700 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all"
                      placeholder="Enter your contact number"
                    />
                  </div>
                </div>

                {/* Date of Birth */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-stone-500 uppercase tracking-wider ml-1">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar size={16} className="text-stone-400" />
                    </div>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-700 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all"
                    />
                  </div>
                </div>

                {/* Address - Full width */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-medium text-stone-500 uppercase tracking-wider ml-1">
                    Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin size={16} className="text-stone-400" />
                    </div>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-700 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all"
                      placeholder="Enter your address"
                    />
                  </div>
                </div>

                {/* Bio - Full width */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-medium text-stone-500 uppercase tracking-wider ml-1">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-700 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all"
                    placeholder="Tell us a little about yourself"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-stone-200/80">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2.5 border border-stone-200 rounded-full text-sm font-medium text-stone-700 hover:bg-stone-100 transition-all duration-200 flex items-center gap-2"
                >
                  <X size={16} />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-purple-600 text-white rounded-full text-sm font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            // View Mode
            <>
              {/* Basic Info */}
              <div className="mb-8">
                <h3 className="text-2xl font-light text-stone-800 mb-1">{user?.name}</h3>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 ${getRoleBadgeColor(user?.role)} text-white text-xs font-medium rounded-full`}>
                    {user?.role}
                  </span>
                  <span className="text-sm text-stone-500">• {user?.email}</span>
                </div>
                {formData.bio && (
                  <p className="mt-4 text-stone-600 text-sm max-w-2xl">{formData.bio}</p>
                )}
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-stone-500 uppercase tracking-wider">Personal Information</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                      <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                        <Mail size={16} className="text-amber-600" />
                      </div>
                      <div>
                        <p className="text-xs text-stone-500">Email</p>
                        <p className="text-sm font-medium text-stone-800">{user?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                      <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                        <Phone size={16} className="text-amber-600" />
                      </div>
                      <div>
                        <p className="text-xs text-stone-500">Contact</p>
                        <p className="text-sm font-medium text-stone-800">{user?.contact || "Not provided"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                      <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                        <Calendar size={16} className="text-amber-600" />
                      </div>
                      <div>
                        <p className="text-xs text-stone-500">Date of Birth</p>
                        <p className="text-sm font-medium text-stone-800">
                          {user?.dateOfBirth ? formatDate(user.dateOfBirth) : "Not provided"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                      <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                        <MapPin size={16} className="text-amber-600" />
                      </div>
                      <div>
                        <p className="text-xs text-stone-500">Address</p>
                        <p className="text-sm font-medium text-stone-800">{user?.address || "Not provided"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                      <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                        <User size={16} className="text-amber-600" />
                      </div>
                      <div>
                        <p className="text-xs text-stone-500">Age</p>
                        <p className="text-sm font-medium text-stone-800">{user?.age || "Not provided"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Information */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-stone-500 uppercase tracking-wider">Account Information</h4>
                  
                  <div className="space-y-3">
                    {accountInfo.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <item.icon size={16} className="text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-stone-500">{item.label}</p>
                          <p className="text-sm font-medium text-stone-800">{item.value}</p>
                        </div>
                      </div>
                    ))}

                    <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <Shield size={16} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-stone-500">Account Status</p>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          <p className="text-sm font-medium text-stone-800">Active</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;