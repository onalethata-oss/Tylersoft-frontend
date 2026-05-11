'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { apiClient } from '../services/apiClient';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user');
        
        if (token && storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {
            // Corrupted stored user data — clear it
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            localStorage.removeItem('sessionId');
          }
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    const response = await apiClient.login(email, password);
    
    if (response.success && response.data) {
      const loginData = response.data as any;

      // Normalize role string — backend may return "ADMIN" or "USER"
      let role: 'ADMIN' | 'USER' = 'USER';
      const rawRole = (loginData.role || '').toString().toUpperCase();
      if (rawRole === 'ADMIN' || rawRole === 'ROLE_ADMIN') {
        role = 'ADMIN';
      }

      const userData: User = {
        id: loginData.id?.toString() || loginData.email,
        email: loginData.email,
        name: loginData.name || loginData.email?.split('@')[0] || 'User',
        role,
      };
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', loginData.token);
        localStorage.setItem('user', JSON.stringify(userData));
        if (loginData.sessionId) {
          localStorage.setItem('sessionId', loginData.sessionId.toString());
        }
      }
      setUser(userData);
      setLoading(false);
      return { success: true };
    }
    
    setLoading(false);
    return { success: false, error: (response as any).error || 'Invalid email or password' };
  }, []);

  const logout = useCallback(() => {
    apiClient.logout();
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('sessionId');
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
