import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { WaveLoader } from './Common/Loader';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // ✅ Show loader while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <WaveLoader />
      </div>
    );
  }

  // ❌ Not logged in → go to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ❌ Role restriction
  if (allowedRoles.length > 0) {
    if (!user || !allowedRoles.includes(user.role)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // ✅ Allow access
  return children;
};

export default ProtectedRoute;