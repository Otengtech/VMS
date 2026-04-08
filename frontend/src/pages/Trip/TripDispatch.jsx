import { useState, useEffect } from 'react';
import { FiX, FiTruck, FiUser, FiMapPin, FiUsers, FiPackage, FiDroplet, FiActivity } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const TripDispatch = ({ isOpen, onClose, onSuccess, vehicles = [], drivers = [] }) => {
  const [formData, setFormData] = useState({
    vehicleId: '',
    driverId: '',
    destination: '',
    passengersCount: 0,
    passengersDetails: [],
    cargo: '',
    cargoWeight: 0,
    notes: '',
    fuelStart: 0,
    odometerStart: 0
  });
  const [loading, setLoading] = useState(false);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableVehicles();
      fetchAvailableDrivers();
    }
  }, [isOpen]);

  const fetchAvailableVehicles = async () => {
    try {
      const res = await api.get('/vehicles?status=checked-in');
      setAvailableVehicles(res.data.vehicles || []);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
    }
  };

  const fetchAvailableDrivers = async () => {
    try {
      const res = await api.get('/drivers?isActive=true');
      setAvailableDrivers(res.data.drivers || []);
    } catch (error) {
      console.error('Failed to fetch drivers:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.vehicleId) {
      toast.error('Please select a vehicle');
      return;
    }
    if (!formData.driverId) {
      toast.error('Please select a driver');
      return;
    }
    if (!formData.destination) {
      toast.error('Please enter destination');
      return;
    }

    setLoading(true);
    try {
      // First, check-out the vehicle automatically (since it's leaving terminal)
      console.log('Auto check-out vehicle:', formData.vehicleId);
      
      const checkOutResponse = await api.post('/vehicles/check-out', {
        vehicleId: formData.vehicleId,
        notes: `Auto check-out for trip to ${formData.destination}`
      });
      
      console.log('Check-out response:', checkOutResponse.data);

      // Then start the trip
      const tripData = {
        vehicleId: formData.vehicleId,
        driverId: formData.driverId,
        destination: formData.destination,
        passengers: {
          count: parseInt(formData.passengersCount) || 0,
          details: [],
          totalFare: 0
        },
        cargo: formData.cargo,
        cargoWeight: parseFloat(formData.cargoWeight) || 0,
        notes: formData.notes,
        fuelStart: parseFloat(formData.fuelStart) || 0,
        odometerStart: parseFloat(formData.odometerStart) || 0
      };

      const tripResponse = await api.post('/trips/start', tripData);
      
      toast.success('Trip started successfully! Vehicle checked out.');
      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Trip start error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to start trip';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      vehicleId: '',
      driverId: '',
      destination: '',
      passengersCount: 0,
      passengersDetails: [],
      cargo: '',
      cargoWeight: 0,
      notes: '',
      fuelStart: 0,
      odometerStart: 0
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-5 rounded-t-2xl sticky top-0">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center">
              <FiTruck className="mr-2" />
              Start New Trip
            </h2>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition">
              <FiX className="text-white" size={24} />
            </button>
          </div>
          <p className="text-green-100 text-sm mt-1">
            Vehicle will be automatically checked out when trip starts
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Vehicle (Checked-in) *
              </label>
              <select
                name="vehicleId"
                value={formData.vehicleId}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Choose a vehicle</option>
                {availableVehicles.map(vehicle => (
                  <option key={vehicle._id} value={vehicle._id}>
                    {vehicle.plateNumber} - {vehicle.type} (Checked In)
                  </option>
                ))}
              </select>
              {availableVehicles.length === 0 && (
                <p className="text-xs text-yellow-400 mt-1">
                  No checked-in vehicles available. Please check in a vehicle first.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Driver *
              </label>
              <select
                name="driverId"
                value={formData.driverId}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Choose a driver</option>
                {availableDrivers.map(driver => (
                  <option key={driver._id} value={driver._id}>
                    {driver.name} - {driver.phone}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Destination *
              </label>
              <div className="relative">
                <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  placeholder="Enter destination"
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Passengers Count
              </label>
              <div className="relative">
                <FiUsers className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="number"
                  name="passengersCount"
                  value={formData.passengersCount}
                  onChange={handleChange}
                  placeholder="Number of passengers"
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-green-500"
                  min="0"
                />
              </div>
            </div>

            

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="2"
                placeholder="Additional notes..."
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-green-500"
              />
            </div>
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
              disabled={loading || availableVehicles.length === 0}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:scale-105 transition disabled:opacity-50"
            >
              {loading ? 'Starting...' : 'Start Trip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TripDispatch;