import { useState, useEffect } from 'react';
import { FiSearch, FiCalendar, FiTruck, FiUser, FiMapPin, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';
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
      <div className="flex flex-col md:flex-row gap-4 mb-5">
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
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-xl transition-colors ${filterStatus === 'all' ? 'bg-amber-500 text-white' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700'}`}
          >
            All
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
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredTrips.map((trip) => {
                  const status = getStatusBadge(trip.status);
                  const StatusIcon = status.icon;

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
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                          <StatusIcon className="mr-1.5" size={12} />
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripHistory;