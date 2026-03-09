// src/components/superAdminDashboard/SuperAdminSidebar.js
import React from "react";
import {
  LayoutDashboard,
  Terminal,
  Users,
  UserCog,
  BarChart3,
  Settings,
  Shield,
  FileText,
  LogOut,
  ChevronRight,
  X,
  Activity,
  AlertTriangle
} from "lucide-react";

const SuperAdminSidebar = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  currentTab, 
  setCurrentTab, 
  isMobile,
  user,
  logout 
}) => {
  
  const navigation = [
    { 
      id: 'dashboard',
      name: 'Dashboard', 
      icon: LayoutDashboard,
      description: 'Overview & stats'
    },
    { 
      id: 'terminals',
      name: 'Terminals', 
      icon: Terminal,
      description: 'Manage all terminals'
    },
    { 
      id: 'administrators',
      name: 'Administrators', 
      icon: UserCog,
      description: 'Manage admins'
    },
  ];

  const stats = {
    terminals: 12,
    admins: 5,
    users: 1243,
    issues: 2
  };

  const handleTabClick = (tabId) => {
    setCurrentTab(tabId);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <aside className={`
      h-full bg-gradient-to-b from-white to-purple-50/90 
      backdrop-blur-xl border-r border-purple-200/80
      shadow-xl flex flex-col
      ${sidebarOpen ? 'w-80' : 'w-20'}
      transition-all duration-300
    `}>
      {/* Sidebar Header */}
      <div className={`flex items-center ${sidebarOpen ? 'justify-between px-6' : 'justify-center px-2'} border-b border-purple-200/80`}>
        {sidebarOpen ? (
          <>
            {isMobile && (
              <button 
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-purple-100 rounded-full transition-colors"
              >
                <X size={20} className="text-stone-600" />
              </button>
            )}
          </>
        ) : (
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <Shield className="w-5 h-5 text-white" />
          </div>
        )}
      </div>

      {/* User Info - Only show when sidebar is open */}
      {sidebarOpen && (
        <div className="px-4 py-4 border-b border-purple-200/80">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
              {user?.name?.charAt(0) || 'S'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-800 truncate">{user?.name}</p>
              <p className="text-xs text-purple-600 capitalize truncate">{user?.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Links - Scrollable */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-transparent">
        <div className="space-y-2">
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-full text-sm font-medium
                transition-all duration-200 group relative
                ${sidebarOpen ? 'justify-start' : 'justify-center'}
                ${currentTab === item.id
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md' 
                  : 'text-stone-700 hover:bg-purple-100/80 hover:text-purple-900'
                }
              `}
              title={!sidebarOpen ? item.name : ''}
            >
              <item.icon size={20} className={`
                flex-shrink-0 transition-transform duration-200
                ${currentTab === item.id 
                  ? 'text-white' 
                  : 'text-purple-500 group-hover:text-purple-700'
                }
                group-hover:scale-110
              `} />
              
              {sidebarOpen && (
                <>
                  <div className="flex-1 text-left">
                    <span>{item.name}</span>
                  </div>
                  {currentTab === item.id && (
                    <ChevronRight size={16} className="text-white/70 flex-shrink-0" />
                  )}
                </>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-purple-200/80">
        <button
          onClick={logout}
          className={`
            w-full flex items-center gap-3 px-4 py-3 rounded-full text-sm font-medium
            text-red-600 hover:bg-red-50 transition-all duration-200 group
            ${sidebarOpen ? 'justify-start' : 'justify-center'}
          `}
          title={!sidebarOpen ? 'Logout' : ''}
        >
          <LogOut size={20} className="group-hover:scale-110 transition-transform flex-shrink-0" />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default SuperAdminSidebar;