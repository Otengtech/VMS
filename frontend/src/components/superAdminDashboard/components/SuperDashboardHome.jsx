// src/components/superAdminDashboard/components/DashboardHome.js
import React, { useState, useEffect } from "react";
import { 
  Terminal, 
  Users, 
  UserCog, 
  Activity, 
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle,
  Shield,
  Server,
  ArrowRight
} from "lucide-react";
import api from "../../../services/api";
import axios from "axios";

const DashboardHome = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTerminals: 0,
    activeTerminals: 0,
    totalAdmins: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all terminals
      const terminalsRes = await api.get("/terminal/all");
      
      const terminals = terminalsRes.data;
      const activeTerminals = terminals.filter(t => t.isActive === true).length;
      const totalAdmins = (await api.get("/admin/all")).data.length;

      setStats({
        totalTerminals: terminals.length,
        activeTerminals: activeTerminals,
        totalAdmins: totalAdmins,
      });

    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const quickStats = [
    { 
      label: 'Total Terminals', 
      value: stats.totalTerminals, 
      active: stats.activeTerminals,
      icon: Terminal, 
      color: 'from-purple-500 to-indigo-600',
      bg: 'bg-purple-100',
      text: 'text-purple-600'
    },
    { 
      label: 'Active Terminals', 
      value: stats.activeTerminals, 
      active: stats.activeTerminals,
      icon: Server, 
      color: 'from-green-500 to-emerald-600',
      bg: 'bg-green-100',
      text: 'text-green-600'
    },
    { 
      label: 'Administrators', 
      value: stats.totalAdmins, 
      active: stats.totalAdmins,
      icon: UserCog, 
      color: 'from-blue-500 to-cyan-600',
      bg: 'bg-blue-100',
      text: 'text-blue-600'
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl text-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {/* <Shield className="w-5 h-5" /> */}
              <h2 className="text-xl font-medium">Welcome back, {user?.name?.split(' ')[0] || 'SuperAdmin'}!</h2>
            </div>
            <p className="text-white/80 text-sm max-w-2xl">
              Here's your system overview. All terminals and users are running smoothly.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickStats.map((stat, idx) => (
          <div key={idx} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-stone-200/80 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.bg} rounded-full flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.text}`} />
              </div>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl font-light text-stone-800 mb-1">{stat.value}</p>
            <p className="text-sm text-stone-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Health */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-stone-200/80 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-medium text-stone-800">System Health Overview</h3>
            </div>
            <button className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1">
              View Details <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-stone-50 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Server size={16} className="text-purple-500" />
                <span className="text-sm font-medium text-stone-700">Terminal Status</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600">Active</span>
                  <span className="font-medium text-green-600">{stats.activeTerminals}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600">Inactive</span>
                  <span className="font-medium text-stone-600">{stats.totalTerminals - stats.activeTerminals}</span>
                </div>
                <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden mt-2">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full"
                    style={{ width: `${(stats.activeTerminals / stats.totalTerminals) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-stone-50 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={16} className="text-amber-500" />
                <span className="text-sm font-medium text-stone-700">Active Issues</span>
              </div>
              <div className="text-center py-2">
                <p className="text-xs text-stone-500 mt-1">Issues requiring attention</p>
              </div>
            </div>

            <div className="p-4 bg-stone-50 rounded-xl md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <Users size={16} className="text-purple-500" />
                <span className="text-sm font-medium text-stone-700">User Distribution</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-stone-500">Administrators</p>
                  <p className="text-xl font-light text-stone-800">{stats.totalAdmins}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-500">Regular Users</p>
                  <p className="text-xl font-light text-stone-800">{stats.totalUsers}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;