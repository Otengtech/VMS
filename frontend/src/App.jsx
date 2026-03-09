// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

// Pages
import Login from "./pages/Login";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import CreateTerminal from "./components/adminDashboard/components/CreateTerminal";
import ManageAdmins from "./components/superAdminDashboard/components/ManageAdmins";
import Profile from "./components/adminDashboard/components/Profile";
import Terminals from "./components/adminDashboard/components/Terminals";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" />} />

          {/* Super Admin Routes */}
          <Route
            path="/superadmin/*"
            element={
              <ProtectedRoute allowedRoles={["superadmin"]}>
                <SuperAdminRoutes />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                <AdminRoutes />
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

// Nested routes for Super Admin
const SuperAdminRoutes = () => (
  <Routes>
    <Route path="dashboard" element={<SuperAdminDashboard />} />
    <Route path="admins" element={<ManageAdmins />} />
    <Route path="terminals" element={<Terminals />} />
    <Route path="profile" element={<Profile />} />
    <Route path="*" element={<Navigate to="/superadmin/dashboard" />} />
  </Routes>
);

// Nested routes for Admin
const AdminRoutes = () => (
  <Routes>
    <Route path="dashboard" element={<AdminDashboard />} />
    <Route path="create-terminal" element={<CreateTerminal />} />
    <Route path="terminals" element={<Terminals />} />
    <Route path="profile" element={<Profile />} />
    <Route path="*" element={<Navigate to="/admin/dashboard" />} />
  </Routes>
);

export default App;