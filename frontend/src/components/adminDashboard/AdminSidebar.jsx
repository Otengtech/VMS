// src/components/adminDashboard/AdminSidebar.js
import React from "react";
import {
  LayoutDashboard,
  Terminal,
  MapPin,
  Home,
  User,
  BarChart3,
  FileText,
  Truck,
  Settings,
  LogOut,
  ChevronRight,
  X
} from "lucide-react";

const AdminSidebar = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  currentTab, 
  setCurrentTab, 
  isMobile,
  user,
  terminal,
  logout 
}) => {
  
  const navigation = [
    { 
      id: 'dashboard',
      name: 'Dashboard', 
      icon: LayoutDashboard,
      disabled: false
    },
    { 
      id: 'terminals',
      name: 'Terminal Details', 
      icon: MapPin,
      disabled: false
    },
    ...(!user?.terminalId ? [{
      id: 'create-terminal',
      name: 'Create Terminal', 
      icon: Home,
      disabled: false
    }] : []),
    { 
      id: 'profile',
      name: 'Profile', 
      icon: User,
      disabled: false
    },
    { 
      id: 'records',
      name: 'Records', 
      icon: FileText,
      disabled: false
    },
    { 
      id: 'vehicles',
      name: 'Vehicles', 
      icon: Truck,
      disabled: false
    },
    { 
      id: 'drivers',
      name: 'Drivers', 
      icon: User,
      disabled: false
    },
  ];

  const handleTabClick = (tabId, disabled) => {
    if (!disabled) {
      setCurrentTab(tabId);
      if (isMobile) {
        setSidebarOpen(false);
      }
    }
  };

  return (
    <aside className={`
      h-full bg-gradient-to-b from-white to-stone-50/90 
      backdrop-blur-xl border-r border-stone-200/80
      shadow-xl flex flex-col
      ${sidebarOpen ? 'w-80' : 'w-20'}
      transition-all duration-300
    `}>
      {/* Sidebar Header */}
      <div className={`flex items-center ${sidebarOpen ? 'justify-between px-6' : 'justify-center px-2'} border-b border-stone-200/80`}>
        {sidebarOpen ? (
          <>
            {isMobile && (
              <button 
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-stone-100 rounded-full transition-colors"
              >
                <X size={20} className="text-stone-600" />
              </button>
            )}
          </>
        ) : (
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Terminal className="w-5 h-5 text-white" />
          </div>
        )}
      </div>

      {/* User Info - Only show when sidebar is open */}
      {sidebarOpen && (
        <div className="px-4 py-4 border-b border-stone-200/80">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-800 truncate">{user?.name}</p>
              <p className="text-xs text-stone-500 capitalize truncate">{user?.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Links - Scrollable */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 scrollbar-thin scrollbar-thumb-stone-300 scrollbar-track-transparent">
        <div className="space-y-1">
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id, item.disabled)}
              disabled={item.disabled}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-full text-sm font-medium
                transition-all duration-200 group relative
                ${sidebarOpen ? 'justify-start' : 'justify-center'}
                ${currentTab === item.id && !item.disabled
                  ? 'bg-gradient-to-r from-amber-500 to-purple-600 text-white shadow-md' 
                  : item.disabled
                    ? 'text-stone-400 cursor-not-allowed opacity-50'
                    : 'text-stone-700 hover:bg-stone-200/80 hover:text-stone-900'
                }
              `}
              title={!sidebarOpen ? item.name : ''}
            >
              <item.icon size={20} className={`
                flex-shrink-0 transition-transform duration-200
                ${currentTab === item.id && !item.disabled 
                  ? 'text-white' 
                  : 'text-stone-500 group-hover:text-stone-700'
                }
                ${!item.disabled && 'group-hover:scale-110'}
              `} />
              
              {sidebarOpen && (
                <>
                  <span className="flex-1 text-left">{item.name}</span>
                  {currentTab === item.id && !item.disabled && (
                    <ChevronRight size={16} className="text-white/70 flex-shrink-0" />
                  )}
                  {item.disabled && (
                    <span className="text-[10px] bg-stone-200 px-2 py-0.5 rounded-full text-stone-600 flex-shrink-0">
                      Locked
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-stone-200/80">
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

export default AdminSidebar;