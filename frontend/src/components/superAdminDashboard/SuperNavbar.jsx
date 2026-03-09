// src/components/superAdminDashboard/SuperAdminNavbar.js
import React, { useState, useRef, useEffect } from "react";
import { 
  Menu, 
  Bell, 
  ChevronDown, 
  User, 
  Settings, 
  LogOut, 
  HelpCircle,
  Search,
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield
} from "lucide-react";
import { 
  LayoutDashboard, 
  Terminal, 
  UserCog, 
  Users, 
  BarChart3, 
  FileText 
} from "lucide-react";

const SuperAdminNavbar = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  currentTab, 
  setCurrentTab,
  isMobile,
  user,
  logout 
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);
  const searchRef = useRef(null);

  const getPageTitle = () => {
    const titles = {
      dashboard: 'Dashboard',
      terminals: 'Terminal Management',
      administrators: 'Administrator Management',
      users: 'User Management',
      analytics: 'Analytics & Reports',
      settings: 'System Settings',
      logs: 'Audit Logs',
      profile: 'My Profile'
    };
    return titles[currentTab] || 'Dashboard';
  };

  const getPageIcon = () => {
    const icons = {
      dashboard: <LayoutDashboard size={20} className="text-purple-600" />,
      terminals: <Terminal size={20} className="text-purple-600" />,
      administrators: <UserCog size={20} className="text-purple-600" />,
      users: <Users size={20} className="text-purple-600" />,
      analytics: <BarChart3 size={20} className="text-purple-600" />,
      settings: <Settings size={20} className="text-purple-600" />,
      logs: <FileText size={20} className="text-purple-600" />,
      profile: <User size={20} className="text-purple-600" />
    };
    return icons[currentTab] || <LayoutDashboard size={20} className="text-purple-600" />;
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = [
    { 
      id: 1, 
      title: 'New terminal registered', 
      message: 'Terminal "Main Branch" was added', 
      time: '5 min ago', 
      read: false,
      type: 'success',
      icon: CheckCircle
    },
    { 
      id: 2, 
      title: 'System update', 
      message: 'Scheduled maintenance in 2 hours', 
      time: '1 hour ago', 
      read: false,
      type: 'warning',
      icon: Clock
    },
    { 
      id: 3, 
      title: 'Security alert', 
      message: 'Multiple failed login attempts', 
      time: '3 hours ago', 
      read: true,
      type: 'error',
      icon: AlertTriangle
    },
    { 
      id: 4, 
      title: 'Backup completed', 
      message: 'System backup was successful', 
      time: '5 hours ago', 
      read: true,
      type: 'success',
      icon: CheckCircle
    },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (notification) => {
    const Icon = notification.icon;
    const colors = {
      success: 'text-green-500',
      warning: 'text-amber-500',
      error: 'text-red-500'
    };
    return <Icon size={16} className={colors[notification.type]} />;
  };

  const handleProfileClick = () => {
    setCurrentTab('profile');
    setShowUserMenu(false);
  };

  const handleSettingsClick = () => {
    setCurrentTab('settings');
    setShowUserMenu(false);
  };

  return (
    <nav className="h-16 bg-white/80 backdrop-blur-xl border-b border-purple-200/80 shadow-sm fixed top-0 right-0 left-0 lg:left-80 z-20">
      <div className="h-full px-4 lg:px-8 flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-purple-100 rounded-full transition-colors"
              aria-label="Toggle sidebar"
            >
              <Menu size={20} className="text-stone-600" />
            </button>
          )}

          {/* Page Icon & Title */}
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-lg font-medium text-stone-800">
                SUPERADMIN
              </h1>
              <p className="text-xs text-stone-500 hidden sm:block">
                System Overview
              </p>
            </div>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">

          
          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-purple-100 rounded-full transition-colors group"
              aria-label="Notifications"
            >
              <Bell size={20} className="text-stone-600" />
              {unreadCount > 0 && (
                <>
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                </>
              )}
            </button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-purple-200/80 overflow-hidden z-50">
                <div className="p-4 border-b border-purple-200/80">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-stone-800">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`p-4 border-b border-stone-100 hover:bg-purple-50 cursor-pointer transition-colors ${
                          !notification.read ? 'bg-purple-50/30' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {getNotificationIcon(notification)}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-stone-800">{notification.title}</p>
                            <p className="text-xs text-stone-600 mt-0.5">{notification.message}</p>
                            <p className="text-xs text-stone-400 mt-1">{notification.time}</p>
                          </div>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <Bell size={32} className="mx-auto text-stone-300 mb-2" />
                      <p className="text-sm text-stone-500">No notifications</p>
                    </div>
                  )}
                </div>
                <div className="p-3 border-t border-purple-200/80 text-center">
                  <button className="text-xs text-purple-600 hover:text-purple-700 font-medium">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 pr-3 hover:bg-purple-100 rounded-full transition-colors group"
              aria-label="User menu"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md group-hover:shadow-lg transition-shadow">
                {user?.name?.charAt(0)?.toUpperCase() || 'S'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-stone-800 leading-tight">{user?.name}</p>
                <p className="text-xs text-purple-600 leading-tight capitalize">{user?.role}</p>
              </div>
              <ChevronDown size={16} className={`text-stone-500 hidden md:block transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* User dropdown menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-purple-200/80 overflow-hidden z-50">
                <div className="p-3 border-b border-purple-200/80 md:hidden">
                  <p className="text-sm font-medium text-stone-800">{user?.name}</p>
                  <p className="text-xs text-purple-600 capitalize">{user?.role}</p>
                </div>
                
                <div className="p-2">
                  <button
                    onClick={handleProfileClick}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-stone-700 hover:bg-purple-50 rounded-xl transition-colors"
                  >
                    <User size={16} className="text-purple-500" />
                    <span>My Profile</span>
                  </button>
                  
                  <button
                    onClick={handleSettingsClick}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-stone-700 hover:bg-purple-50 rounded-xl transition-colors"
                  >
                    <Settings size={16} className="text-purple-500" />
                    <span>System Settings</span>
                  </button>
                  
                  <div className="border-t border-purple-200/80 my-2"></div>
                  
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {showSearch && isMobile && (
        <div className="absolute top-16 left-0 right-0 p-4 bg-white border-b border-purple-200/80 shadow-lg" ref={searchRef}>
          <input
            type="text"
            placeholder="Search..."
            className="w-full px-4 py-3 bg-stone-100 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200"
            autoFocus
          />
        </div>
      )}
    </nav>
  );
};

export default SuperAdminNavbar;