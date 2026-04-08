import React, { useState } from 'react';
import {
  FiHelpCircle,
  FiChevronDown,
  FiChevronRight,
  FiHome,
  FiMap,
  FiTruck,
  FiUsers,
  FiUser,
  FiPlayCircle,
  FiClock,
  FiList,
  FiShield,
  FiLogOut,
  FiInfo,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';

const Help = () => {
  const [expandedTopics, setExpandedTopics] = useState({});

  const toggleTopic = (topicId) => {
    setExpandedTopics(prev => ({
      ...prev,
      [topicId]: !prev[topicId]
    }));
  };

  const helpTopics = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: FiHome,
      details: [
        'View all terminals at a glance',
        'Access detailed records of all activities',
        'Monitor all vehicles in the fleet',
        'Track all drivers and their status',
        'View real-time statistics and metrics',
        'Quick access to recent activities'
      ]
    },
    {
      id: 'terminals',
      title: 'Terminals',
      icon: FiMap,
      details: [
        'View complete information about all terminals',
        'Access the Terminals page to see terminal details',
        'View terminal locations and contact information',
        'See which vehicles are assigned to each terminal',
        'Monitor terminal-specific activities and records',
        'Only Super Admins can create new terminals'
      ]
    },
    {
      id: 'vehicles',
      title: 'Vehicles',
      icon: FiTruck,
      details: [
        'View all vehicles currently at your terminal',
        'Add new vehicles with plate number, type, and terminal assignment',
        'Update vehicle information (plate number, type, driver assignment)',
        'Check-in vehicles when they arrive at the terminal',
        'Check-out vehicles when they leave the terminal',
        'Delete vehicles - NOTE: Only vehicles that are checked-out can be deleted',
        'View vehicle status (Checked-in/Checked-out)',
        'See which driver is assigned to each vehicle',
        'Search and filter vehicles by status, type, or driver'
      ]
    },
    {
      id: 'drivers',
      title: 'Drivers',
      icon: FiUsers,
      details: [
        'View all drivers in the system',
        'Add new drivers with name, license number, phone, and terminal assignment',
        'Update driver information',
        'Delete drivers when they are no longer active',
        'See which vehicle a driver is currently assigned to',
        'Track driver availability and status',
        'Drivers can only be assigned to one vehicle at a time',
        'View driver history and records'
      ]
    },
    {
      id: 'users',
      title: 'User Management',
      icon: FiUser,
      details: [
        'ONLY Super Admins can create new users (admins and other super admins)',
        'ONLY Super Admins can create and manage terminals',
        'Admins are restricted to their dedicated terminals only',
        'Admins can only view and manage data for their assigned terminal',
        'Super Admins have full access across all terminals',
        'If you forget your password, contact a Super Admin to reset it for you',
        'Users can be updated or deleted by Super Admins only',
        'Each user receives their credentials via email'
      ]
    },
    {
      id: 'trips',
      title: 'Start a Trip',
      icon: FiPlayCircle,
      details: [
        'Go to the Trips page and click "Active Trips" tab',
        'Click the "Start New Trip" button',
        'IMPORTANT: Only vehicles with status "Checked-in" can start a trip',
        'Select a vehicle from the available list (must be checked-in)',
        'Enter trip details: destination, passenger count, cargo information',
        'Once started, the vehicle status changes to "On Trip"',
        'Track active trips in real-time',
        'View all active trips on the Active Trips page'
      ]
    },
    {
      id: 'complete-trip',
      title: 'Complete a Trip',
      icon: FiCheckCircle,
      details: [
        'After arrival, go to the Active Trips page',
        'Find the active trip you want to complete',
        'Click the "Complete Trip" button',
        'Enter ending fuel level and odometer reading',
        'Add any issues encountered during the trip',
        'Add notes about the trip if needed',
        'Upon completion, the vehicle status returns to "Checked-in"',
        'The trip is moved to Trip History'
      ]
    },
    {
      id: 'trip-history',
      title: 'Trip History',
      icon: FiList,
      details: [
        'View all trips (active, completed, and cancelled)',
        'Filter trips by status: Active, Completed, or Cancelled',
        'Search trips by vehicle plate number or driver name',
        'View detailed information about each trip',
        'See departure and return times',
        'Track passenger counts and cargo details',
        'Monitor fuel consumption and distance traveled',
        'Review issues and notes from completed trips'
      ]
    },
    {
      id: 'records',
      title: 'Records & Logs',
      icon: FiClock,
      details: [
        'View all logs and activities at your terminal',
        'Track check-in and check-out records',
        'See who performed each action',
        'Monitor all vehicle movements',
        'View timestamps for all activities',
        'Track driver assignments and changes',
        'Audit trail for all operations',
        'Search and filter records by date, vehicle, or action type'
      ]
    },
    {
      id: 'auth',
      title: 'Authentication',
      icon: FiLogOut,
      details: [
        'You can login and logout at any time',
        'Session management for security',
        'Password reset requires contacting Super Admin',
        'Admins only see data from their assigned terminal',
        'Super Admins have full system access',
        'Always logout when using shared computers',
        'Credentials are sent via email for new users'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full">
              <FiHelpCircle className="text-white w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                Help & Support
              </h1>
              <p className="text-gray-400 mt-1">
                Learn how to use the Fleet Management System
              </p>
            </div>
          </div>
        </div>

        {/* Help Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {helpTopics.map((topic) => {
            const Icon = topic.icon;
            const isExpanded = expandedTopics[topic.id];

            return (
              <div
                key={topic.id}
                className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden hover:border-amber-500/50 transition-all"
              >
                {/* Topic Header */}
                <button
                  onClick={() => toggleTopic(topic.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-amber-500/20 to-amber-600/20 rounded-xl">
                      <Icon className="text-amber-400 w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                      {topic.title}
                    </h3>
                  </div>
                  <div className="text-amber-400">
                    {isExpanded ? (
                      <FiChevronDown size={20} />
                    ) : (
                      <FiChevronRight size={20} />
                    )}
                  </div>
                </button>

                {/* Topic Details (Expandable) */}
                {isExpanded && (
                  <div className="px-6 pb-4 pt-2 border-t border-gray-700">
                    <ul className="space-y-2">
                      {topic.details.map((detail, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-300">
                          <span className="text-amber-400 mt-1">•</span>
                          <span className="text-sm">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="mt-8 p-4 bg-gray-800/30 rounded-xl border border-gray-700 text-center">
          <p className="text-sm text-gray-400">
            Need additional help? Contact your system administrator or refer to the user manual.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Help;