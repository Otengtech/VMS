// src/pages/AdminDashboard.js
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

// Layout Components
import AdminSidebar from "../components/adminDashboard/AdminSidebar";
import AdminNavbar from "../components/adminDashboard/AdminNavbar";

// Page Components
import DashboardHome from "../components/adminDashboard/components/AdminDashboardHome";
import Terminals from "../components/adminDashboard/components/Terminals";
// import TerminalDetails from "../components/adminDashboard/components/TerminalDetails";
import CreateTerminal from "../components/adminDashboard/components/CreateTerminal";
import Profile from "../components/adminDashboard/components/Profile";
import Records from "../components/adminDashboard/components/Records";
import Vehicles from "../components/adminDashboard/components/Vehicles";
import Drivers from "../components/adminDashboard/components/Drivers"
// import Analytics from "../components/adminDashboard/components/Analytics";
// import Settings from "../components/adminDashboard/components/Settings";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [terminal, setTerminal] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Close sidebar by default on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  // Fetch terminal data if user has terminalId
  useEffect(() => {
    if (user?.terminalId) {
      fetchTerminal();
    }
  }, [user]);

  const fetchTerminal = async () => {
    try {
      const response = await api.get(`/terminal/${user.terminalId}`);
      setTerminal(response.data);
    } catch (error) {
      console.error("Failed to fetch terminal:", error);
    }
  };

  const renderContent = () => {
    switch (currentTab) {
      case "dashboard":
        return <DashboardHome terminal={terminal} user={user} />;
      case "create-terminal":
        return <CreateTerminal onSuccess={fetchTerminal} />;
      case "profile":
        return <Profile user={user} />;
      case "terminals":
        return <Terminals user={user} />;
      case "records":
        return <Records user={user} />;
      case "vehicles":
        return <Vehicles user={user} />;
      case "drivers":
        return <Drivers user={user} />;
      default:
        return <DashboardHome terminal={terminal} user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50/30 flex overflow-hidden">
      {/* Overlay for mobile when sidebar is open */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`
          ${isMobile 
            ? 'fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out'
            : `${sidebarOpen ? 'w-80' : 'w-20'} transition-all duration-300 flex-shrink-0 h-screen overflow-hidden relative`
          }
          ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'}
        `}
      >
        <AdminSidebar 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          isMobile={isMobile}
          user={user}
          terminal={terminal}
          logout={logout}
        />
      </div>
      
      {/* Main Content Area - handles all scrolling */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Navbar - fixed at top */}
        <div className="flex-shrink-0">
          <AdminNavbar 
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            currentTab={currentTab}
            isMobile={isMobile}
            user={user}
            terminal={terminal}
          />
        </div>
        
        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto pt-20 min-h-0">
          <div className="p-4 lg:p-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}