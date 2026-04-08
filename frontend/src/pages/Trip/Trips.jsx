import { useState } from 'react';
import TripDispatch from '../Trip/TripDispatch';
import ActiveTrips from '../Trip/ActiveTrips';
import TripHistory from '../Trip/TripHistory';
import { FiPlayCircle, FiClock, FiList, FiInfo } from 'react-icons/fi';

const Trips = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleTripSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-amber-400 flex items-center">
              <FiPlayCircle className="mr-3" />
              Trips Management
            </h1>
            <p className="text-gray-400 mt-1">Start, monitor, and complete vehicle trips</p>
          </div>

          {/* Info Banner */}
          <div className="mb-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <FiInfo className="text-blue-400 mt-0.5" size={20} />
              <div className="text-sm">
                <p className="text-blue-400 font-medium mb-1">How to manage trips:</p>
                <ul className="text-gray-300 space-y-1">
                  <li>1. First, check-in a vehicle from the <strong className="text-amber-400">Vehicles</strong> page</li>
                  <li>2. Then click <strong className="text-amber-400">"Start New Trip"</strong> below to begin a journey</li>
                  <li>3. When the trip is complete, click <strong className="text-green-400">"Complete Trip"</strong> on the active trip card</li>
                  <li>4. View all completed trips in the <strong className="text-amber-400">"Trip History"</strong> tab</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-gray-700">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-6 py-3 font-medium transition-all relative ${
                activeTab === 'active'
                  ? 'text-amber-400 border-b-2 border-amber-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <FiPlayCircle className="inline mr-2" />
              Active Trips
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-3 font-medium transition-all relative ${
                activeTab === 'history'
                  ? 'text-amber-400 border-b-2 border-amber-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <FiList className="inline mr-2" />
              Trip History
            </button>
          </div>

          {/* Content */}
          {activeTab === 'active' ? (
            <ActiveTrips refreshTrigger={refreshTrigger} onTripComplete={handleTripSuccess} />
          ) : (
            <TripHistory refreshTrigger={refreshTrigger} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Trips;