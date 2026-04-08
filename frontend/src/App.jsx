// App.js
import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import ProtectedRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Terminals from './pages/Terminals';
import Drivers from './pages/Drivers';
import Vehicles from './pages/Vehicles';
import Records from './pages/Records';
import Users from './pages/Users';
import { useAuth } from './context/AuthContext';
import TripHistory from './pages/Trip/TripHistory';
import ActiveTrips from './pages/Trip/ActiveTrips';
import Help from './pages/Help';

function App() {
  const { isAuthenticated, isFirstLogin } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          isAuthenticated && !isFirstLogin ? (
            <Navigate to="/dashboard" replace />
          ) : isAuthenticated && isFirstLogin ? (
            <Navigate to="/change-password" replace />
          ) : (
            <Login />
          )
        }
      />

      {/* Protected Routes - Require Authentication */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requireFirstLoginChange={false}>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/terminals"
        element={
          <ProtectedRoute requireFirstLoginChange={false}>
            <Layout>
              <Terminals />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/help"
        element={
          <ProtectedRoute requireFirstLoginChange={false}>
            <Layout>
              <Help />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/drivers"
        element={
          <ProtectedRoute requireFirstLoginChange={false}>
            <Layout>
              <Drivers />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/trips/history"
        element={
          <ProtectedRoute requireFirstLoginChange={false}>
            <Layout>
              <TripHistory />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/trips/active"
        element={
          <ProtectedRoute requireFirstLoginChange={false}>
            <Layout>
              <ActiveTrips />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/vehicles"
        element={
          <ProtectedRoute requireFirstLoginChange={false}>
            <Layout>
              <Vehicles />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/records"
        element={
          <ProtectedRoute requireFirstLoginChange={false}>
            <Layout>
              <Records />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Super Admin Only Routes */}
      <Route
        path="/users"
        element={
          <ProtectedRoute 
            allowedRoles={['superadmin']} 
            requireFirstLoginChange={false}
          >
            <Layout>
              <Users />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Redirect root to appropriate page */}
      <Route
        path="/"
        element={
          !isAuthenticated ? (
            <Navigate to="/login" replace />
          ) : isFirstLogin ? (
            <Navigate to="/change-password" replace />
          ) : (
            <Navigate to="/dashboard" replace />
          )
        }
      />

      {/* 404 - Catch all */}
      <Route
        path="*"
        element={
          <Navigate to="/" replace />
        }
      />
    </Routes>
  );
}

export default App;