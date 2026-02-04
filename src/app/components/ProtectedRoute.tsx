import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import { Navbar } from './Navbar';

interface ProtectedRouteProps {
  allowedRoles: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    const redirectPath = 
      user.role === 'admin' ? '/admin' :
      user.role === 'agent' ? '/agent' :
      '/user';
    return <Navigate to={redirectPath} replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Outlet />
    </div>
  );
};
