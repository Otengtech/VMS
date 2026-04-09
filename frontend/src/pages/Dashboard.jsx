import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiTruck,
  FiUserCheck,
  FiClock,
  FiRefreshCw,
  FiAlertCircle,
  FiActivity,
  FiPieChart,
  FiBarChart2,
  FiArrowUp,
  FiArrowDown,
  FiMapPin,
} from "react-icons/fi";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { WaveLoader } from "../components/Common/Loader";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [terminalCount, setTerminalCount] = useState(0);
  const [vehicleCount, setVehicleCount] = useState(0);
  const [driverCount, setDriverCount] = useState(0);
  const [activeDriverCount, setActiveDriverCount] = useState(0);
  const [checkedInCount, setCheckedInCount] = useState(0);
  const [recentRecords, setRecentRecords] = useState([]);
  const [activeTripsCount, setActiveTripsCount] = useState(0);
  const [completedTripsCount, setCompletedTripsCount] = useState(0);
  
  // Chart data states
  const [weeklyActivityData, setWeeklyActivityData] = useState([]);
  const [vehicleDistributionData, setVehicleDistributionData] = useState([]);
  const [monthlyTrendData, setMonthlyTrendData] = useState([]);
  
  // Additional stats
  const [totalTripsToday, setTotalTripsToday] = useState(0);
  const [totalRevenueToday, setTotalRevenueToday] = useState(0);
  const [averageTripDuration, setAverageTripDuration] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  useEffect(() => {
    fetchAllData();
    
    // Update current time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  // Fetch weekly activity data from trips
  const fetchWeeklyActivity = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      
      const response = await api.get('/trips', {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      });
      
      const trips = response.data.trips || [];
      
      // Group trips by day of week
      const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const weeklyData = daysOfWeek.map(day => ({
        day,
        trips: 0,
        completed: 0,
        cancelled: 0
      }));
      
      trips.forEach(trip => {
        const tripDate = new Date(trip.departureTime);
        const dayName = daysOfWeek[tripDate.getDay()];
        const dayData = weeklyData.find(d => d.day === dayName);
        
        if (dayData) {
          dayData.trips++;
          if (trip.status === 'completed') dayData.completed++;
          if (trip.status === 'cancelled') dayData.cancelled++;
        }
      });
      
      setWeeklyActivityData(weeklyData);
    } catch (error) {
      console.error('Error fetching weekly activity:', error);
    }
  };
  
  // Fetch vehicle distribution from actual vehicles
  const fetchVehicleDistribution = async () => {
    try {
      const response = await api.get('/vehicles');
      const vehicles = response.data.vehicles || [];
      
      const distribution = {};
      vehicles.forEach(vehicle => {
        const type = vehicle.type || 'Other';
        distribution[type] = (distribution[type] || 0) + 1;
      });
      
      // Color mapping for different vehicle types
      const colorMap = {
        'Bus': '#f59e0b',
        'Taxi': '#000000',
        'Truck': '#6b7280',
        'Car': '#3b82f6',
        'Van': '#10b981',
        'Other': '#9ca3af'
      };
      
      const pieData = Object.entries(distribution).map(([name, value]) => ({
        name,
        value,
        color: colorMap[name] || '#9ca3af'
      }));
      
      setVehicleDistributionData(pieData);
    } catch (error) {
      console.error('Error fetching vehicle distribution:', error);
      // Fallback data if API fails
      setVehicleDistributionData([
        { name: "Buses", value: 45, color: "#f59e0b" },
        { name: "Taxis", value: 30, color: "#000000" },
        { name: "Trucks", value: 15, color: "#6b7280" },
        { name: "Private", value: 10, color: "#9ca3af" },
      ]);
    }
  };
  
  // Fetch monthly trend data
  const fetchMonthlyTrend = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6);
      
      const response = await api.get('/trips', {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      });
      
      const trips = response.data.trips || [];
      
      // Group by month
      const monthlyData = {};
      trips.forEach(trip => {
        const date = new Date(trip.departureTime);
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
        const monthName = date.toLocaleString('default', { month: 'short' });
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            month: monthName,
            trips: 0,
            revenue: 0
          };
        }
        
        monthlyData[monthKey].trips++;
        monthlyData[monthKey].revenue += trip.passengers?.totalFare || 0;
      });
      
      const trendData = Object.values(monthlyData).slice(-6);
      setMonthlyTrendData(trendData);
    } catch (error) {
      console.error('Error fetching monthly trend:', error);
    }
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch terminals
      const terminalsRes = await api.get("/terminals");
      const terminals = terminalsRes.data.terminals || [];
      setTerminalCount(terminals.length);
      
      // Fetch vehicles
      const vehiclesRes = await api.get("/vehicles");
      const vehicles = vehiclesRes.data.vehicles || [];
      setVehicleCount(vehicles.length);
      
      // Fetch drivers
      const driversRes = await api.get("/drivers");
      const drivers = driversRes.data.drivers || [];
      setDriverCount(drivers.length);
      const activeDrivers = drivers.filter((d) => d.isActive).length;
      setActiveDriverCount(activeDrivers);
      
      // Fetch records for today
      const today = new Date().toISOString().split("T")[0];
      const recordsRes = await api.get(`/records?startDate=${today}`);
      const records = recordsRes.data.records || [];
      setCheckedInCount(records.length);
      
      // Fetch recent records
      const recentRes = await api.get("/records?limit=5");
      setRecentRecords(recentRes.data.records || []);
      
      // Fetch trip statistics
      const tripsRes = await api.get("/trips/stats");
      const tripStats = tripsRes.data;
      setActiveTripsCount(tripStats.activeTrips || 0);
      setCompletedTripsCount(tripStats.completedTrips || 0);
      
      // Fetch today's trips for revenue calculation
      const todayTripsRes = await api.get("/trips", {
        params: {
          startDate: today,
          endDate: today
        }
      });
      const todayTrips = todayTripsRes.data.trips || [];
      setTotalTripsToday(todayTrips.length);
      const todayRevenue = todayTrips.reduce((sum, trip) => sum + (trip.passengers?.totalFare || 0), 0);
      setTotalRevenueToday(todayRevenue);
      
      // Calculate average trip duration from completed trips
      const completedTrips = todayTrips.filter(trip => trip.status === 'completed' && trip.departureTime && trip.returnTime);
      if (completedTrips.length > 0) {
        const totalDuration = completedTrips.reduce((sum, trip) => {
          const start = new Date(trip.departureTime);
          const end = new Date(trip.returnTime);
          const durationHours = (end - start) / (1000 * 60 * 60);
          return sum + durationHours;
        }, 0);
        setAverageTripDuration((totalDuration / completedTrips.length).toFixed(1));
      }
      
      // Fetch chart data
      await Promise.all([
        fetchWeeklyActivity(),
        fetchVehicleDistribution(),
        fetchMonthlyTrend()
      ]);
      
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard");
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
    toast.success("Dashboard refreshed");
  };

  // Handle stat card clicks for navigation
  const handleStatClick = (path) => {
    navigate(path);
  };

  // Stats cards configuration with navigation paths
  const statsCards = [
    {
      title: "Total Terminals",
      value: terminalCount,
      icon: FiMapPin,
      trend: "+0",
      trendUp: true,
      gradient: "from-amber-500 to-amber-600",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      navPath: "/terminals",
      description: "Manage all terminals"
    },
    {
      title: "Total Vehicles",
      value: vehicleCount,
      icon: FiTruck,
      trend: "+0",
      trendUp: true,
      gradient: "from-blue-500 to-blue-600",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      navPath: "/vehicles",
      description: "View vehicle fleet"
    },
    {
      title: "Active Drivers",
      value: activeDriverCount,
      icon: FiUserCheck,
      trend: `${activeDriverCount}`,
      trendUp: true,
      gradient: "from-green-500 to-green-600",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      navPath: "/drivers",
      description: "Currently active drivers"
    },
    {
      title: "Checked In Today",
      value: checkedInCount,
      icon: FiClock,
      trend: "+0",
      trendUp: true,
      gradient: "from-purple-500 to-purple-600",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      navPath: "/records",
      description: "Vehicles checked in today"
    },
    {
      title: "Active Trips",
      value: activeTripsCount,
      icon: FiActivity,
      trend: "+0",
      trendUp: true,
      gradient: "from-red-500 to-red-600",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      navPath: "/trips/active",
      description: "Ongoing trips"
    },
    {
      title: "Today's Revenue",
      value: `₦${totalRevenueToday.toLocaleString()}`,
      icon: FiBarChart2,
      trend: "+0",
      trendUp: true,
      gradient: "from-emerald-500 to-emerald-600",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      navPath: "/trips/history",
      description: "Total fare collected today"
    }
  ];

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border">
          <p className="font-semibold">{label}</p>
          {payload.map((p, index) => (
            <p key={index} className="text-sm" style={{ color: p.color }}>
              {p.name}: {p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-[90vh] flex items-center justify-center bg-gray-900">
        <WaveLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center bg-gray-900">
        <div>
          <FiAlertCircle className="text-red-500 text-5xl mb-4 mx-auto" />
          <p className="text-gray-400">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-amber-500 text-black rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-amber-400">
            Dashboard
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Welcome back, {user?.name || "Admin"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={logout}
            className="text-xs cursor-pointer hover:scale-105 transition-all duration-200 text-white bg-red-600 px-4 sm:px-6 py-2 rounded-full"
          >
            LOGOUT
          </button>

          <div className="text-xs text-gray-900 bg-amber-400 px-4 sm:px-6 py-2 rounded-full whitespace-nowrap">
            {formatDate(currentTime)}
          </div>

          <button
            onClick={handleRefresh}
            className="p-2 text-amber-400 hover:bg-amber-400 hover:text-black rounded-lg transition-colors"
          >
            <FiRefreshCw
              className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Stats Cards Grid - 3 columns on desktop, 2 on tablet, 1 on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {statsCards.map((stat, index) => (
          <div
            key={index}
            onClick={() => handleStatClick(stat.navPath)}
            className="bg-white/10 cursor-pointer hover:scale-105 hover:bg-white/20 transition-all duration-200 backdrop-blur-sm rounded-2xl shadow p-6 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-gray-300 text-sm font-medium mb-1">
                  {stat.title}
                </h3>
                <p className="text-3xl text-amber-400 font-bold mb-1">
                  {stat.value}
                </p>
                <p className="text-gray-500 text-xs">{stat.description}</p>
              </div>
              
              <div className="p-3 rounded-full bg-amber-400/20 group-hover:bg-amber-400 transition-all duration-200">
                <stat.icon className="text-2xl text-amber-400 group-hover:text-black" />
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-700">
              <span className="text-xs text-amber-400">Click to view details →</span>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 backdrop-blur-sm rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Trips Today</p>
              <p className="text-3xl font-bold text-blue-400">{totalTripsToday}</p>
            </div>
            <FiActivity className="text-blue-400 text-4xl" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 backdrop-blur-sm rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg. Trip Duration</p>
              <p className="text-3xl font-bold text-emerald-400">{averageTripDuration}</p>
              <p className="text-gray-500 text-xs">hours</p>
            </div>
            <FiClock className="text-emerald-400 text-4xl" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 backdrop-blur-sm rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Completion Rate</p>
              <p className="text-3xl font-bold text-purple-400">
                {completedTripsCount + activeTripsCount > 0
                  ? ((completedTripsCount / (completedTripsCount + activeTripsCount)) * 100).toFixed(1)
                  : 0}%
              </p>
            </div>
            <FiCheckCircle className="text-purple-400 text-4xl" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly Activity Chart */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FiActivity className="mr-2 text-amber-500" />
              <h2 className="font-semibold text-gray-800">Weekly Activity</h2>
            </div>
            <span className="text-xs text-gray-500">Last 7 days</span>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyActivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="trips"
                  name="Total Trips"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  fillOpacity={0.2}
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  name="Completed"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vehicle Distribution Pie Chart */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FiPieChart className="mr-2 text-purple-500" />
              <h2 className="font-semibold text-gray-800">Vehicle Distribution</h2>
            </div>
            <span className="text-xs text-gray-500">By type</span>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={vehicleDistributionData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {vehicleDistributionData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly Trend Chart */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FiBarChart2 className="mr-2 text-blue-500" />
            <h2 className="font-semibold text-gray-800">Monthly Trend</h2>
          </div>
          <span className="text-xs text-gray-500">Last 6 months</span>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" orientation="left" stroke="#f59e0b" />
              <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar yAxisId="left" dataKey="trips" name="Number of Trips" fill="#f59e0b" />
              <Bar yAxisId="right" dataKey="revenue" name="Revenue (₦)" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h2 className="font-semibold flex items-center text-gray-800">
            <FiClock className="mr-2 text-green-500" />
            Recent Activity
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left text-gray-600">Vehicle</th>
                <th className="p-4 text-left text-gray-600">Driver</th>
                <th className="p-4 text-left text-gray-600">Action</th>
                <th className="p-4 text-left text-gray-600">Time</th>
              </tr>
            </thead>
            <tbody>
              {recentRecords.map((record) => (
                <tr key={record._id} className="border-t hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-gray-700">
                    {record.vehicleId?.plateNumber || "N/A"}
                  </td>
                  <td className="p-4 text-gray-700">
                    {record.driverId?.name || "N/A"}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      record.action === "check-in" 
                        ? "bg-green-100 text-green-700" 
                        : "bg-red-100 text-red-700"
                    }`}>
                      {record.action === "check-in" ? "Check In" : "Check Out"}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">
                    {new Date(record.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {recentRecords.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No recent activity
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;