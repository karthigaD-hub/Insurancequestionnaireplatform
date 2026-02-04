import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { LogOut, Shield, Users, FileText, BarChart3, Home } from 'lucide-react';
import { Button } from './ui/button';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    if (user?.role === 'admin') {
      return [
        { to: '/admin', label: 'Dashboard', icon: Home },
        { to: '/admin/questions', label: 'Questions', icon: FileText },
        { to: '/admin/responses', label: 'Responses', icon: BarChart3 },
        { to: '/admin/users', label: 'Users', icon: Users },
      ];
    }
    if (user?.role === 'agent') {
      return [
        { to: '/agent', label: 'Dashboard', icon: Home },
        { to: '/agent/users', label: 'Users', icon: Users },
        { to: '/agent/responses', label: 'Responses', icon: BarChart3 },
      ];
    }
    if (user?.role === 'user') {
      return [
        { to: '/user', label: 'Dashboard', icon: Home },
      ];
    }
    return [];
  };

  const navLinks = getNavLinks();

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to={user?.role ? `/${user.role}` : '/'} className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="text-xl">
                <span className="text-blue-600">X</span>Cyber
              </span>
            </Link>
            <div className="hidden md:flex md:ml-10 md:space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="inline-flex items-center px-1 pt-1 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <link.icon className="h-4 w-4 mr-2" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
