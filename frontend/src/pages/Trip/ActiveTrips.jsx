import { useState, useEffect } from 'react';
import { FiClock, FiMapPin, FiTruck, FiUser, FiX, FiPlayCircle, FiCheckCircle, FiRefreshCw, FiAlertCircle, FiSearch, FiInfo } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import CompleteTripModal from './CompleteTripModal';
import { WaveLoader } from '../../components/Common/Loader';

const ActiveTrips = ({ refreshTrigger, onTripComplete }) => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [showStartTrip, setShowStartTrip] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tripForm, setTripForm] = useState({
    destination: '',
    passengersCount: 0,
    cargoType: '',
    cargoWeight: 0,
    notes: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchActiveTrips();
    fetchAvailableVehicles();
  }, [refreshTrigger]);

  const fetchActiveTrips = async () => {
    try {
      setLoading(true);
      const response = await api.get('/trips/active');
      setTrips(response.data.trips || []);
    } catch (error) {
      console.error('Failed to fetch active trips:', error);
      toast.error('Failed to load active trips');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableVehicles = async () => {
    try {
      const response = await api.get('/vehicles');
      // Filter vehicles that are checked-in and not on an active trip
      const available = (response.data.vehicles || []).filter(vehicle =>
        vehicle.status === 'checked-in' &&
        !trips.some(trip => trip.vehicleId?._id === vehicle._id)
      );
      setAvailableVehicles(available);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
    }
  };

  const handleCompleteClick = (trip) => {
    setSelectedTrip(trip);
    setShowCompleteModal(true);
  };

  const handleComplete = () => {
    setShowCompleteModal(false);
    setSelectedTrip(null);
    fetchActiveTrips();
    fetchAvailableVehicles();
    if (onTripComplete) onTripComplete();
    toast.success('Trip completed successfully');
  };

  const handleStartTrip = async (e) => {
    e.preventDefault();

    if (!selectedVehicle) {
      toast.error('Please select a vehicle');
      return;
    }

    if (!tripForm.destination.trim()) {
      toast.error('Please enter destination');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare payload based on what your backend expects
      const payload = {
        vehicleId: selectedVehicle._id,
        driverId: selectedVehicle.driverId?._id,
        destination: tripForm.destination,
        passengersCount: tripForm.passengersCount || 0,
        cargoType: tripForm.cargoType || '',
        cargoWeight: tripForm.cargoWeight || 0,
        notes: tripForm.notes || '',
        departureTime: new Date().toISOString()
      };

      console.log('Starting trip with payload:', payload);

      const response = await api.post('/trips/start', payload);

      console.log('Trip started successfully:', response.data);
      toast.success('Trip started successfully');

      // Reset form and close modal
      setShowStartTrip(false);
      setSelectedVehicle(null);
      setTripForm({
        destination: '',
        passengersCount: 0,
        cargoType: '',
        cargoWeight: 0,
        notes: ''
      });
      setSearchTerm('');

      // Refresh data
      await fetchActiveTrips();
      await fetchAvailableVehicles();
      if (onTripComplete) onTripComplete();

    } catch (error) {
      console.error('Start trip error:', error);
      // Show detailed error message
      const errorMessage = error.response?.data?.error ||
        error.response?.data?.message ||
        'Failed to start trip';
      toast.error(errorMessage);

      // Log the full error for debugging
      if (error.response?.data) {
        console.error('Server response:', error.response.data);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredVehicles = availableVehicles.filter(vehicle =>
    vehicle.plateNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.driverId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.terminalId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-[90vh] flex items-center justify-center bg-gray-900">
        <WaveLoader />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 rounded-xl">
      {/* Info Banner */}
      {/* <div className="mb-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <FiInfo className="text-blue-400 mt-0.5" size={20} />
          <div className="text-sm">
            <p className="text-blue-400 font-medium mb-1">Understanding Vehicle Status:</p>
            <ul className="text-gray-300 space-y-1">
              <li>• <strong className="text-green-400">Checked-in</strong> = Vehicle is at terminal, ready for trips</li>
              <li>• <strong className="text-amber-400">On Trip</strong> = Vehicle is currently on a journey</li>
              <li>• <strong className="text-gray-400">Checked-out</strong> = Vehicle is away from terminal</li>
            </ul>
          </div>
        </div>
      </div> */}

      {/* Start Trip Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowStartTrip(true)}
          className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 rounded-full flex items-center gap-2 hover:scale-105 transition-transform"
        >
          <FiPlayCircle size={20} />
          Start New Trip
        </button>
      </div>

      {/* Active Trips Section */}
      {trips.length === 0 && availableVehicles.length === 0 ? (
        <div className="bg-gray-800/30 rounded-2xl p-12 text-center border border-gray-700">
          <FiClock className="mx-auto h-12 w-12 text-gray-600" />
          <h3 className="mt-4 text-lg font-medium text-gray-300">No active trips</h3>
          <p className="mt-2 text-gray-500">
            All vehicles are either checked-out or already on a trip
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Please check-in a vehicle first from the Vehicles page
          </p>
        </div>
      ) : trips.length === 0 ? (
        <div className="bg-gray-800/30 rounded-2xl p-12 text-center border border-gray-700">
          <FiPlayCircle className="mx-auto h-12 w-12 text-gray-600" />
          <h3 className="mt-4 text-lg font-medium text-gray-300">No active trips</h3>
          <p className="mt-2 text-gray-500">Click "Start New Trip" to begin a journey</p>
          {availableVehicles.length > 0 && (
            <p className="mt-1 text-sm text-green-400">
              {availableVehicles.length} vehicle(s) available for trips
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <div key={trip._id} className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6 hover:shadow-xl transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <FiTruck className="text-amber-400" size={20} />
                  <h3 className="font-bold text-white text-lg">{trip.vehicleId?.plateNumber}</h3>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                  On Trip
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-gray-300">
                  <FiUser className="mr-2 text-amber-400" size={14} />
                  <span className="text-sm">Driver: {trip.driverId?.name}</span>
                </div>

                <div className="flex items-center text-gray-300">
                  <FiMapPin className="mr-2 text-amber-400" size={14} />
                  <span className="text-sm">Destination: {trip.destination}</span>
                </div>

                <div className="flex items-center text-gray-300">
                  <FiClock className="mr-2 text-amber-400" size={14} />
                  <span className="text-sm">Started: {new Date(trip.departureTime).toLocaleString()}</span>
                </div>

                {(trip.passengersCount > 0 || trip.passengers?.count > 0) && (
                  <div className="text-sm text-gray-400">
                    Passengers: {trip.passengersCount || trip.passengers?.count || 0}
                  </div>
                )}

                {(trip.cargoType || trip.cargo) && (
                  <div className="text-sm text-gray-400">
                    Cargo: {trip.cargoType || trip.cargo} ({trip.cargoWeight || 0} kg)
                  </div>
                )}
              </div>

              <button
                onClick={() => handleCompleteClick(trip)}
                className="mt-4 w-full bg-gradient-to-r from-green-500 to-green-600 px-4 py-2 rounded-xl flex items-center justify-center gap-2 hover:scale-105 transition-transform"
              >
                <FiCheckCircle size={16} />
                Complete Trip
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Start Trip Modal */}
      {showStartTrip && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col transform transition-all animate-slideUp border border-gray-700">
            {/* Header - Fixed at top */}
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-5 rounded-t-2xl flex-shrink-0">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <FiPlayCircle className="mr-2" />
                  Start New Trip
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setShowStartTrip(false);
                    setSelectedVehicle(null);
                    setSearchTerm('');
                    setTripForm({
                      destination: '',
                      passengersCount: 0,
                      cargoType: '',
                      cargoWeight: 0,
                      notes: ''
                    });
                  }}
                  className="p-1 hover:bg-white/20 rounded-lg transition"
                >
                  <FiX className="text-white" size={24} />
                </button>
              </div>
              <p className="text-amber-100 text-sm mt-1">
                Select a checked-in vehicle and enter trip details
              </p>
            </div>

            {/* Scrollable Form Area */}
            <form onSubmit={handleStartTrip} className="flex-1 overflow-y-auto">
              <div className="p-6">
                {/* Step 1: Vehicle Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Step 1: Select Vehicle *
                  </label>

                  {availableVehicles.length === 0 ? (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-center">
                      <FiAlertCircle className="mx-auto text-yellow-400 mb-2" size={24} />
                      <p className="text-yellow-400">No available vehicles</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Please check-in a vehicle first from the Vehicles page
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="relative mb-3">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search by plate, driver or terminal..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <div className="max-h-48 overflow-y-auto space-y-2">
                        {filteredVehicles.map((vehicle) => (
                          <button
                            key={vehicle._id}
                            type="button"
                            onClick={() => setSelectedVehicle(vehicle)}
                            className={`w-full p-4 rounded-xl border transition-all text-left ${selectedVehicle?._id === vehicle._id
                                ? 'bg-amber-500/20 border-amber-500'
                                : 'bg-gray-700/50 border-gray-600 hover:border-amber-500/50'
                              }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-bold text-white">{vehicle.plateNumber}</div>
                                <div className="text-sm text-gray-400">
                                  Driver: {vehicle.driverId?.name || 'Not assigned'}
                                </div>
                                <div className="text-sm text-gray-400">
                                  Terminal: {vehicle.terminalId?.name || 'N/A'}
                                </div>
                              </div>
                              <div className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">
                                Checked In
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Step 2: Trip Details */}
                {selectedVehicle && (
                  <div className="space-y-4 animate-fadeIn">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Destination *
                      </label>
                      <input
                        type="text"
                        value={tripForm.destination}
                        onChange={(e) => setTripForm({ ...tripForm, destination: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="Enter destination"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Passenger Count
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={tripForm.passengersCount}
                          onChange={(e) => setTripForm({ ...tripForm, passengersCount: parseInt(e.target.value) || 0 })}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      {/* <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Cargo Weight (kg)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={tripForm.cargoWeight}
                          onChange={(e) => setTripForm({ ...tripForm, cargoWeight: parseInt(e.target.value) || 0 })}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div> */}
                    </div>

                    {/* <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Cargo Type
                      </label>
                      <input
                        type="text"
                        value={tripForm.cargoType}
                        onChange={(e) => setTripForm({ ...tripForm, cargoType: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="e.g., Electronics, Furniture, etc."
                      />
                    </div> */}

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Notes
                      </label>
                      <textarea
                        rows="3"
                        value={tripForm.notes}
                        onChange={(e) => setTripForm({ ...tripForm, notes: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                        placeholder="Additional notes (optional)"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Footer - Fixed at bottom */}
              <div className="sticky bottom-0 bg-gray-800 px-6 py-4 border-t border-gray-700 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowStartTrip(false);
                    setSelectedVehicle(null);
                    setSearchTerm('');
                    setTripForm({
                      destination: '',
                      passengersCount: 0,
                      cargoType: '',
                      cargoWeight: 0,
                      notes: ''
                    });
                  }}
                  className="px-6 py-3 border border-gray-600 rounded-xl text-gray-300 font-medium hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedVehicle || !tripForm.destination || isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isSubmitting ? 'Starting...' : 'Start Trip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Trip Modal */}
      <CompleteTripModal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        trip={selectedTrip}
        onComplete={handleComplete}
      />

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ActiveTrips;