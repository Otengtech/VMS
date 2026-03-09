// src/pages/SuperAdminDashboard.js
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

// Layout Components
import SuperAdminSidebar from "../components/superAdminDashboard/SuperSidebar";
import SuperAdminNavbar from "../components/superAdminDashboard/SuperNavbar";

// Page Components
import DashboardHome from "../components/superAdminDashboard/components/SuperDashboardHome";
import Terminals from "../components/superAdminDashboard/components/Terminals";
import Administrators from "../components/superAdminDashboard/components/Administrators";
// import Users from "../components/superAdminDashboard/components/Users";
// import Analytics from "../components/superAdminDashboard/components/Analytics";
// import SystemSettings from "../components/superAdminDashboard/components/SystemSettings";
// import AuditLogs from "../components/superAdminDashboard/components/AuditLogs";
// import Profile from "../components/superAdminDashboard/components/Profile";

export default function SuperAdminDashboard() {
  const { user, logout } = useAuth();
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

  const renderContent = () => {
    switch (currentTab) {
      case "dashboard":
        return <DashboardHome user={user} />;
      case "terminals":
        return <Terminals />;
      case "administrators":
        return <Administrators />;
      default:
        return <DashboardHome user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-purple-50/30 flex overflow-hidden">
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
        <SuperAdminSidebar 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          isMobile={isMobile}
          user={user}
          logout={logout}
        />
      </div>
      
      {/* Main Content Area - handles all scrolling */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Navbar - fixed at top */}
        <div className="flex-shrink-0">
          <SuperAdminNavbar 
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            isMobile={isMobile}
            user={user}
            logout={logout}
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