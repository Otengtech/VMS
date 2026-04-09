// CompleteTripModal.jsx - Updated version
import { useState } from 'react';
import { FiX, FiDroplet, FiActivity, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CompleteTripModal = ({ isOpen, onClose, trip, onComplete }) => {
  const [formData, setFormData] = useState({
    fuelEnd: 0,
    odometerEnd: 0,
    issues: '',
    notes: '',
    passengersCount: 0,
    totalFare: 0
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!trip) return;

    setLoading(true);
    try {
      // Complete the trip - the backend will handle vehicle check-in automatically
      const payload = {
        returnTime: new Date().toISOString(),
        passengersCount: formData.passengersCount,
        totalFare: formData.totalFare,
        fuelEnd: formData.fuelEnd,
        odometerEnd: formData.odometerEnd,
        issues: formData.issues,
        notes: formData.notes
      };
      
      const response = await api.post(`/trips/${trip._id}/complete`, payload);
      
      if (response.data) {
        toast.success('Trip completed! Vehicle has been checked in.');
        onComplete();
        onClose();
      }
    } catch (error) {
      console.error('Complete trip error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to complete trip';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !trip) return null;

  // Get display vehicle plate number
  const vehiclePlate = trip.vehicleId?.plateNumber || 
                      (typeof trip.vehicleId === 'object' ? trip.vehicleId?.plateNumber : 'N/A');
  const driverName = trip.driverId?.name || 
                     (typeof trip.driverId === 'object' ? trip.driverId?.name : 'N/A');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-5 rounded-t-2xl sticky top-0">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center">
              <FiCheckCircle className="mr-2" />
              Complete Trip
            </h2>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition">
              <FiX className="text-white" size={24} />
            </button>
          </div>
          <p className="text-green-100 text-sm mt-1">
            Vehicle: {vehiclePlate}
          </p>
          <p className="text-green-100 text-xs">
            Driver: {driverName}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Passenger Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Passenger Count
              </label>
              <input
                type="number"
                name="passengersCount"
                value={formData.passengersCount}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <FiAlertCircle className="inline mr-1" /> Issues Encountered
            </label>
            <textarea
              name="issues"
              value={formData.issues}
              onChange={handleChange}
              rows="3"
              placeholder="Describe any issues during the trip (mechanical, accidents, delays, etc.)..."
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Additional Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="2"
              placeholder="Any additional notes..."
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-600 rounded-xl text-gray-300 hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:scale-105 transition disabled:opacity-50"
            >
              {loading ? 'Completing...' : 'Complete Trip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteTripModal;