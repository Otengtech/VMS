// TripHistory.jsx - Updated to show issues
import { useState, useEffect } from 'react';
import { FiSearch, FiCalendar, FiTruck, FiUser, FiMapPin, FiClock, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import WaveLoader from '../../components/Common/Loader';

const TripHistory = ({ refreshTrigger }) => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchTrips();
  }, [refreshTrigger, filterStatus, startDate, endDate]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      let url = '/trips?';
      if (filterStatus !== 'all') url += `status=${filterStatus}&`;
      if (startDate) url += `startDate=${startDate}&`;
      if (endDate) url += `endDate=${endDate}&`;

      const response = await api.get(url);
      setTrips(response.data.trips || []);
    } catch (error) {
      console.error('Failed to fetch trips:', error);
      toast.error('Failed to load trip history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return { bg: 'bg-green-500/20', text: 'text-green-400', icon: FiCheckCircle, label: 'Completed' };
      case 'cancelled':
        return { bg: 'bg-red-500/20', text: 'text-red-400', icon: FiXCircle, label: 'Cancelled' };
      default:
        return { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: FiClock, label: 'Active' };
    }
  };

  const filteredTrips = trips.filter(trip => {
    const searchMatch =
      trip.vehicleId?.plateNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.driverId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.destination?.toLowerCase().includes(searchTerm.toLowerCase());
    return searchMatch;
  });

  const TripDetailsModal = ({ trip, onClose }) => {
    if (!trip) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-5 rounded-t-2xl sticky top-0">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Trip Details</h2>
              <button onClick={onClose} className="text-white hover:bg-white/20 rounded-lg p-2">
                <FiXCircle size={24} />
              </button>
            </div>
            <p className="text-amber-100 text-sm">Trip #{trip._id?.slice(-8)}</p>
          </div>
          
          <div className="p-6 space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400">Vehicle</label>
                <p className="text-white font-medium">{trip.vehicleId?.plateNumber}</p>
              </div>
              <div>
                <label className="text-xs text-gray-400">Driver</label>
                <p className="text-white font-medium">{trip.driverId?.name}</p>
              </div>
              <div>
                <label className="text-xs text-gray-400">Destination</label>
                <p className="text-white font-medium">{trip.destination}</p>
              </div>
              <div>
                <label className="text-xs text-gray-400">Status</label>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                  getStatusBadge(trip.status).bg
                } ${getStatusBadge(trip.status).text}`}>
                  {getStatusBadge(trip.status).label}
                </span>
              </div>
            </div>
            
            {/* Time Info */}
            <div className="border-t border-gray-700 pt-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Timeline</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400">Departure Time</label>
                  <p className="text-white text-sm">
                    {new Date(trip.departureTime).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-400">Return Time</label>
                  <p className="text-white text-sm">
                    {trip.returnTime ? new Date(trip.returnTime).toLocaleString() : 'Not returned'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Passenger Info */}
            {(trip.passengers?.count > 0 || trip.passengers?.totalFare > 0) && (
              <div className="border-t border-gray-700 pt-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">Passenger Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400">Passenger Count</label>
                    <p className="text-white">{trip.passengers?.count || 0}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Total Fare</label>
                    <p className="text-green-400 font-semibold">₦{trip.passengers?.totalFare?.toLocaleString() || 0}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Vehicle Readings */}
            {(trip.fuelStart || trip.fuelEnd || trip.odometerStart || trip.odometerEnd) && (
              <div className="border-t border-gray-700 pt-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">Vehicle Readings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400">Fuel (Start/End)</label>
                    <p className="text-white">{trip.fuelStart || 0}L → {trip.fuelEnd || 0}L</p>
                    {trip.fuelEnd && trip.fuelStart && (
                      <p className="text-xs text-amber-400">Consumed: {trip.fuelEnd - trip.fuelStart}L</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Odometer (Start/End)</label>
                    <p className="text-white">{trip.odometerStart || 0}km → {trip.odometerEnd || 0}km</p>
                    {trip.odometerEnd && trip.odometerStart && (
                      <p className="text-xs text-amber-400">Distance: {trip.odometerEnd - trip.odometerStart}km</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Issues Section - IMPORTANT */}
            {trip.issues && (
              <div className="border-t border-red-700/50 pt-4">
                <h3 className="text-sm font-semibold text-red-400 mb-2 flex items-center">
                  <FiAlertCircle className="mr-2" /> Issues Encountered
                </h3>
                <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-3">
                  <p className="text-red-300 text-sm whitespace-pre-wrap">{trip.issues}</p>
                </div>
              </div>
            )}
            
            {/* Notes Section */}
            {trip.notes && (
              <div className="border-t border-gray-700 pt-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">Additional Notes</h3>
                <div className="bg-gray-700/30 rounded-lg p-3">
                  <p className="text-gray-300 text-sm whitespace-pre-wrap">{trip.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-[90vh] flex items-center justify-center bg-gray-900">
        <WaveLoader />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 rounded-xl">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by plate number, driver, or destination..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white focus:outline-none focus:border-amber-500"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-xl transition-colors ${filterStatus === 'all' ? 'bg-amber-500 text-white' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-4 py-2 rounded-xl transition-colors ${filterStatus === 'active' ? 'bg-blue-500 text-white' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700'}`}
          >
            Active
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-4 py-2 rounded-xl transition-colors ${filterStatus === 'completed' ? 'bg-green-500 text-white' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700'}`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilterStatus('cancelled')}
            className={`px-4 py-2 rounded-xl transition-colors ${filterStatus === 'cancelled' ? 'bg-red-500 text-white' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700'}`}
          >
            Cancelled
          </button>
        </div>
      </div>

      {/* Trips Table */}
      {filteredTrips.length === 0 ? (
        <div className="bg-gray-800/30 rounded-2xl p-12 text-center border border-gray-700">
          <FiCalendar className="mx-auto h-12 w-12 text-gray-600" />
          <h3 className="mt-4 text-lg font-medium text-gray-300">No trips found</h3>
          <p className="mt-2 text-gray-500">No trips match your search criteria</p>
        </div>
      ) : (
        <div className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Vehicle</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Driver</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Destination</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Departure</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Return</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Issues</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredTrips.map((trip) => {
                  const status = getStatusBadge(trip.status);
                  const StatusIcon = status.icon;
                  const hasIssues = trip.issues && trip.issues.trim().length > 0;

                  return (
                    <tr key={trip._id} className="hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FiTruck className="mr-2 text-amber-400" size={16} />
                          <span className="text-white">{trip.vehicleId?.plateNumber}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FiUser className="mr-2 text-amber-400" size={16} />
                          <span className="text-white">{trip.driverId?.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FiMapPin className="mr-2 text-amber-400" size={16} />
                          <span className="text-white">{trip.destination}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">
                          {new Date(trip.departureTime).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(trip.departureTime).toLocaleTimeString()}
                        </div>
                       </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {trip.returnTime ? (
                          <>
                            <div className="text-sm text-gray-300">
                              {new Date(trip.returnTime).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(trip.returnTime).toLocaleTimeString()}
                            </div>
                          </>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                       </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {hasIssues ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400">
                            <FiAlertCircle className="mr-1" size={12} />
                            Yes
                          </span>
                        ) : (
                          <span className="text-gray-500 text-xs">None</span>
                        )}
                       </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                          <StatusIcon className="mr-1.5" size={12} />
                          {status.label}
                        </span>
                       </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedTrip(trip);
                            setShowDetailsModal(true);
                          }}
                          className="text-amber-400 hover:text-amber-300 text-sm font-medium"
                        >
                          View Details
                        </button>
                       </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Details Modal */}
      {showDetailsModal && (
        <TripDetailsModal 
          trip={selectedTrip} 
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedTrip(null);
          }}
        />
      )}
    </div>
  );
};

export default TripHistory;