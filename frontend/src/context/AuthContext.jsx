// context/AuthContext.jsx
import { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(sessionStorage.getItem('token')); // ✅ Changed to sessionStorage
  const navigate = useNavigate();

  // ✅ FIX: memoize axios instance so it doesn't recreate every render
  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true
    });

    // Request interceptor
    instance.interceptors.request.use(
      (config) => {
        console.log(`➡️ ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
        const token = sessionStorage.getItem('token'); // ✅ Add token to interceptor
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          if (error.config.url !== '/auth/login') {
            sessionStorage.removeItem('token'); // ✅ Changed to sessionStorage
            setToken(null);
            setUser(null);

            if (window.location.pathname !== '/login') {
              navigate('/login');
            }
          }
        }
        return Promise.reject(error);
      }
    );

    return instance;
  }, [navigate]);

  // ✅ Attach token globally
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token, api]);

  // ✅ Fetch user when token exists
  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const res = await api.get('/auth/me');

      if (res.data.success) {
        setUser(res.data.user);
      }
    } catch (error) {
      console.error('Fetch user error:', error);

      if (error.response?.status === 401) {
        sessionStorage.removeItem('token'); // ✅ Changed to sessionStorage
        setToken(null);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ LOGIN
  const login = async (email, password) => {
    try {
      const res = await axios.post(
        `${API_URL}/auth/login`,
        { email, password },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        }
      );

      if (res.data.success) {
        const { token, user } = res.data;

        sessionStorage.setItem('token', token); // ✅ Changed to sessionStorage
        setToken(token);
        setUser(user);

        toast.success('Login successful');

        navigate('/dashboard');

        return { success: true };
      } else {
        toast.error(res.data.error || 'Login failed');
        return { success: false };
      }
    } catch (error) {
      console.error('Login error:', error);

      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Login failed';

      toast.error(message);
      return { success: false, error: message };
    }
  };

  // ✅ LOGOUT
  const logout = () => {
    sessionStorage.removeItem('token'); // ✅ Changed to sessionStorage
    setToken(null);
    setUser(null);

    toast.success('Logged out');
    navigate('/login');
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isSuperAdmin: user?.role === 'superadmin',
    isAdmin: user?.role === 'admin',
    token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};