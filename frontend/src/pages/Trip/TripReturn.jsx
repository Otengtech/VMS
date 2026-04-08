import { useState, useEffect } from "react";
import {
  FiCheckCircle,
  FiClock,
  FiDroplet,
  FiAlertCircle,
  FiUsers,
  FiX
} from "react-icons/fi";
import { FiActivity } from 'react-icons/fi';
import api from "../../services/api";
import toast from "react-hot-toast";

const TripReturn = ({ isOpen, onClose, onSuccess, trip }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    returnTime: "",
    passengerCount: 0,
    totalFare: 0,
    fuelEnd: 0,
    odometerEnd: 0,
    issues: "",
    notes: ""
  });

  useEffect(() => {
    if (isOpen && trip) {
      setFormData({
        returnTime: new Date().toISOString().slice(0, 16),
        passengerCount: trip.passengers?.count || 0,
        totalFare: trip.passengers?.totalFare || 0,
        fuelEnd: 0,
        odometerEnd: 0,
        issues: "",
        notes: ""
      });
    }
  }, [isOpen, trip]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('Count') || name === 'totalFare' || name.includes('End')
        ? parseInt(value) || 0
        : value
    }));
  };

  const validateForm = () => {
    if (!formData.returnTime) {
      toast.error("Please select return time");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        returnTime: formData.returnTime,
        passengers: {
          count: formData.passengerCount,
          totalFare: formData.totalFare
        },
        fuelEnd: formData.fuelEnd,
        odometerEnd: formData.odometerEnd,
        issues: formData.issues,
        notes: formData.notes
      };

      await api.put(`/trips/${trip._id}/complete`, payload);
      toast.success("Trip completed successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to complete trip");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !trip) return null;

  const fuelConsumed = formData.fuelEnd && trip.fuelStart 
    ? formData.fuelEnd - trip.fuelStart 
    : 0;
  
  const distanceTraveled = formData.odometerEnd && trip.odometerStart
    ? formData.odometerEnd - trip.odometerStart
    : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl w-full max-w-2xl transform transition-all border border-gray-700">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-5 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center">
                <FiCheckCircle className="mr-2" />
                Complete Trip
              </h2>
              <p className="text-orange-100 text-sm mt-1">
                Record return details for trip #{trip._id.slice(-6)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-orange-600 rounded-lg p-2 transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Trip Summary */}
          <div className="bg-gray-700/50 rounded-xl p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Trip Summary</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-400">Vehicle:</span>
                <p className="text-white font-medium">{trip.vehicleId?.plateNumber}</p>
              </div>
              <div>
                <span className="text-gray-400">Driver:</span>
                <p className="text-white font-medium">{trip.driverId?.name}</p>
              </div>
              <div>
                <span className="text-gray-400">Destination:</span>
                <p className="text-white font-medium">{trip.destination}</p>
              </div>
              <div>
                <span className="text-gray-400">Departure:</span>
                <p className="text-white font-medium">
                  {new Date(trip.departureTime).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Return Time */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <FiClock className="inline mr-1" /> Return Time *
              </label>
              <input
                type="datetime-local"
                name="returnTime"
                value={formData.returnTime}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
                required
              />
            </div>

            {/* Passenger Updates */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <FiUsers className="inline mr-1" /> Final Passenger Count
              </label>
              <input
                type="number"
                name="passengerCount"
                value={formData.passengerCount}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Total Fare Collected
              </label>
              <input
                type="number"
                name="totalFare"
                value={formData.totalFare}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
              />
            </div>

            {/* Vehicle Readings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <FiDroplet className="inline mr-1" /> Fuel End (L)
                </label>
                <input
                  type="number"
                  name="fuelEnd"
                  value={formData.fuelEnd}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
                />
                {fuelConsumed !== 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    Fuel consumed: {fuelConsumed}L
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <FiActivity className="inline mr-1" /> Odometer End (km)
                </label>
                <input
                  type="number"
                  name="odometerEnd"
                  value={formData.odometerEnd}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
                />
                {distanceTraveled !== 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    Distance: {distanceTraveled}km
                  </p>
                )}
              </div>
            </div>

            {/* Issues */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <FiAlertCircle className="inline mr-1" /> Issues / Incidents
              </label>
              <textarea
                name="issues"
                value={formData.issues}
                onChange={handleInputChange}
                rows="2"
                placeholder="Report any issues, damages, or incidents..."
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
              />
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Additional Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="2"
                placeholder="Any additional comments..."
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-600 rounded-xl text-gray-300 font-medium hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Completing Trip..." : "Complete Trip"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TripReturn;