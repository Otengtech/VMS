// src/components/adminDashboard/AdminNavbar.js
import React, { useState, useRef, useEffect } from "react";
import { Menu, Bell, Home, ChevronDown, User, Settings, LogOut, HelpCircle } from "lucide-react";

const AdminNavbar = ({
  sidebarOpen,
  setSidebarOpen,
  currentTab,
  setCurrentTab,
  isMobile,
  user,
  terminal,
  logout
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);

  const getPageTitle = () => {
    const titles = {
      dashboard: 'Dashboard',
      'terminal-info': 'Terminal Information',
      terminals: 'Terminal Details',
      'create-terminal': 'Create New Terminal',
      profile: 'My Profile',
      analytics: 'Analytics & Reports',
      settings: 'Settings'
    };
    return titles[currentTab] || 'Dashboard';
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
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateTerminal = () => {
    setCurrentTab('create-terminal');
  };

  const handleProfileClick = () => {
    setCurrentTab('profile');
    setShowUserMenu(false);
  };

  const handleSettingsClick = () => {
    setCurrentTab('settings');
    setShowUserMenu(false);
  };

  const notifications = [
    { id: 1, title: 'New transaction', message: 'A new transaction was processed', time: '2 min ago', read: false },
    { id: 2, title: 'System update', message: 'System maintenance scheduled', time: '1 hour ago', read: false },
    { id: 3, title: 'Terminal sync', message: 'Terminal synced successfully', time: '3 hours ago', read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav className="h-16 bg-white/80 backdrop-blur-xl border-b border-purple-200/80 shadow-sm fixed top-0 right-0 left-0 lg:left-80 z-20">
      <div className="h-full px-4 lg:px-8 flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-stone-100 rounded-full transition-colors"
              aria-label="Toggle sidebar"
            >
              <Menu size={20} className="text-stone-600" />
            </button>
          )}

          {/* Page Title with icon */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center lg:hidden">
              <span className="text-amber-600 font-semibold text-sm">
                {getPageTitle().charAt(0)}
              </span>
            </div>
            <h1 className="text-lg font-medium text-stone-800">
              {getPageTitle()}
            </h1>
          </div>

          {/* Terminal badge */}
          {terminal && (
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              {terminal.name}
              {terminal.location && (
                <span className="text-amber-500">• {terminal.location}</span>
              )}
            </span>
          )}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">

          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-stone-100 rounded-full transition-colors group"
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
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-stone-200/80 overflow-hidden z-50">
                <div className="p-4 border-b border-stone-200/80">
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
                        className={`p-4 border-b border-stone-100 hover:bg-stone-50 cursor-pointer transition-colors ${!notification.read ? 'bg-amber-50/30' : ''
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 mt-2 rounded-full ${notification.read ? 'bg-stone-300' : 'bg-amber-500'
                            }`} />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-stone-800">{notification.title}</p>
                            <p className="text-xs text-stone-600 mt-0.5">{notification.message}</p>
                            <p className="text-xs text-stone-400 mt-1">{notification.time}</p>
                          </div>
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
                <div className="p-3 border-t border-stone-200/80 text-center">
                  <button className="text-xs text-amber-600 hover:text-amber-700 font-medium">
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
              className="flex items-center gap-2 p-1.5 pr-3 hover:bg-stone-100 rounded-full transition-colors group"
              aria-label="User menu"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md group-hover:shadow-lg transition-shadow">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-stone-800 leading-tight">{user?.name}</p>
                <p className="text-xs text-stone-500 leading-tight capitalize">{user?.role}</p>
              </div>
              <ChevronDown size={16} className={`text-stone-500 hidden md:block transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* User dropdown menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-200/80 overflow-hidden z-50">
                <div className="p-3 border-b border-stone-200/80 md:hidden">
                  <p className="text-sm font-medium text-stone-800">{user?.name}</p>
                  <p className="text-xs text-stone-500 capitalize">{user?.role}</p>
                </div>

                <div className="p-2">
                  <button
                    onClick={handleProfileClick}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-stone-700 hover:bg-stone-100 rounded-xl transition-colors"
                  >
                    <User size={16} className="text-stone-500" />
                    <span>My Profile</span>
                  </button>

                  <button
                    onClick={handleSettingsClick}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-stone-700 hover:bg-stone-100 rounded-xl transition-colors"
                  >
                    <Settings size={16} className="text-stone-500" />
                    <span>Settings</span>
                  </button>

                  <div className="border-t border-stone-200/80 my-2"></div>

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
    </nav>
  );
};

export default AdminNavbar;