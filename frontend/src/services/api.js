// config/api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to attach token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token"); // ✅ Changed to sessionStorage
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('No token found in sessionStorage');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Response error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    // If unauthorized, redirect to login
    if (error.response?.status === 401) {
      console.log('Unauthorized - redirecting to login');
      sessionStorage.removeItem('token'); // ✅ Changed to sessionStorage
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;