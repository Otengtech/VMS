// src/components/superAdminDashboard/components/DashboardHome.jsx
import React, { useState, useEffect } from "react";
import {
  Terminal,
  Users,
  UserCog,
  Activity,
  AlertTriangle,
  TrendingUp,
  Server,
  ArrowRight
} from "lucide-react";

import api from "../../../services/api";

const DashboardHome = ({ user }) => {

  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalTerminals: 0,
    activeTerminals: 0,
    totalAdmins: 0,
    totalUsers: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {

    setLoading(true);

    try {

      // ===============================
      // GET TERMINALS
      // ===============================

      const terminalsRes = await api.get("/terminal/all");
      const terminals = terminalsRes.data || [];

      console.log("Terminals:", terminals);

      const activeTerminals = terminals.filter(
        (t) => t.isActive === true || t.status === "active"
      ).length;


      // ===============================
      // GET ADMINS
      // ===============================

      let totalAdmins = 0;

      try {
        const adminsRes = await api.get("/admin/all");
        totalAdmins = adminsRes.data?.length || 0;

        console.log("Admins:", adminsRes.data);

      } catch (adminError) {

        console.error("Failed to fetch admins:", adminError);

        // fallback if forbidden
        totalAdmins = 0;
      }


      // ===============================
      // GET USERS (OPTIONAL)
      // ===============================

      let totalUsers = 0;

      try {

        const usersRes = await api.get("/users/all");
        totalUsers = usersRes.data?.length || 0;

      } catch (userError) {

        console.warn("Users endpoint not available");
      }


      // ===============================
      // SET STATS
      // ===============================

      setStats({
        totalTerminals: terminals.length,
        activeTerminals: activeTerminals,
        totalAdmins: totalAdmins,
        totalUsers: totalUsers
      });

    } catch (error) {

      console.error("Failed to fetch dashboard data:", error);

    } finally {

      setLoading(false);
    }
  };


  const quickStats = [
    {
      label: "Total Terminals",
      value: stats.totalTerminals,
      icon: Terminal,
      bg: "bg-purple-100",
      text: "text-purple-600"
    },
    {
      label: "Active Terminals",
      value: stats.activeTerminals,
      icon: Server,
      bg: "bg-green-100",
      text: "text-green-600"
    },
    {
      label: "Administrators",
      value: stats.totalAdmins,
      icon: UserCog,
      bg: "bg-blue-100",
      text: "text-blue-600"
    },
  ];


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }


  return (
    <div className="space-y-6">

      {/* Welcome Banner */}

      <div className="p-6 bg-gradient-to-r from-amber-500 to-purple-600 rounded-2xl text-white">

        <h2 className="text-xl font-medium mb-2">
          Welcome back, {user?.name?.split(" ")[0] || "Admin"}!
        </h2>

        <p className="text-white/80 text-sm">
          Here's your system overview.
        </p>

      </div>


      {/* Quick Stats */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {quickStats.map((stat, index) => (

          <div
            key={index}
            className="bg-white rounded-2xl p-6 border border-stone-200 shadow hover:shadow-lg transition"
          >

            <div className="flex items-center justify-between mb-4">

              <div className={`w-12 h-12 ${stat.bg} rounded-full flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.text}`} />
              </div>

              <TrendingUp className="w-4 h-4 text-green-500" />

            </div>

            <p className="text-2xl font-light text-stone-800">
              {stat.value}
            </p>

            <p className="text-sm text-stone-500">
              {stat.label}
            </p>

          </div>

        ))}

      </div>


      {/* System Health */}

      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow">

        <div className="flex items-center justify-between mb-6">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>

            <h3 className="text-lg font-medium text-stone-800">
              System Health Overview
            </h3>

          </div>

          <button className="text-sm text-purple-600 flex items-center gap-1">
            View Details <ArrowRight size={14} />
          </button>

        </div>


        <div className="space-y-3">

          <div className="flex justify-between text-sm">
            <span>Active Terminals</span>
            <span className="font-medium text-green-600">
              {stats.activeTerminals}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span>Inactive Terminals</span>
            <span className="font-medium">
              {stats.totalTerminals - stats.activeTerminals}
            </span>
          </div>

          <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden mt-2">

            <div
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-600"
              style={{
                width:
                  stats.totalTerminals > 0
                    ? `${(stats.activeTerminals / stats.totalTerminals) * 100}%`
                    : "0%"
              }}
            />

          </div>

        </div>

      </div>

    </div>
  );
};

export default DashboardHome;