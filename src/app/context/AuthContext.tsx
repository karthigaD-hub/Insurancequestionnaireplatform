import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role, AuthContextType } from '../types';
import { users as mockUsers } from '../data/mockData';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('xcyber_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call - find user in mock data
    const foundUser = mockUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (foundUser) {
      // Don't store password in localStorage
      const userWithoutPassword = { ...foundUser, password: '' };
      setUser(userWithoutPassword);
      setIsAuthenticated(true);
      localStorage.setItem('xcyber_user', JSON.stringify(userWithoutPassword));
      return true;
    }

    return false;
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    phone: string,
    role: Role,
    insuranceProviderId?: string
  ): Promise<boolean> => {
    // Check if user already exists
    const existingUser = mockUsers.find((u) => u.email === email);
    if (existingUser) {
      return false;
    }

    // Create new user
    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      password: '',
      name,
      phone,
      role,
      insuranceProviderId: role === 'agent' ? insuranceProviderId : undefined,
      createdAt: new Date().toISOString(),
    };

    // Add to mock users array (in production, this would be a DB call)
    mockUsers.push({ ...newUser, password });

    setUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('xcyber_user', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('xcyber_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
