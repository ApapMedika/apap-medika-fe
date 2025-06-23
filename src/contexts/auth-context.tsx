'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: 'admin' | 'doctor' | 'nurse' | 'pharmacist' | 'patient';
  profile?: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const initAuth = async () => {
      const token = Cookies.get('token');
      const savedUser = Cookies.get('user');

      if (token && savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setUser(userData);
        } catch (error) {
          console.error('Failed to parse saved user:', error);
          Cookies.remove('token');
          Cookies.remove('user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Redirect logic
  useEffect(() => {
    if (!loading) {
      const isAuthPage = pathname === '/login' || pathname === '/signup';
      const isDashboardPage = pathname.startsWith('/dashboard');
      
      if (user && isAuthPage) {
        router.push('/dashboard');
      } else if (!user && isDashboardPage) {
        router.push('/login');
      }
    }
  }, [user, loading, pathname, router]);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password);
      const { token, user: userData } = response;
      
      Cookies.set('token', token, { expires: 7 });
      Cookies.set('user', JSON.stringify(userData), { expires: 7 });
      
      setUser(userData);
      
      toast.success('Login successful');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  const signup = async (data: any) => {
    try {
      const response = await apiClient.signup(data);
      const { token, user: userData } = response;
      
      Cookies.set('token', token, { expires: 7 });
      Cookies.set('user', JSON.stringify(userData), { expires: 7 });
      
      setUser(userData);
      
      toast.success('Registration successful');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      Cookies.remove('token');
      Cookies.remove('user');
      setUser(null);
      toast.success('Logged out successfully');
      router.push('/login');
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await apiClient.getProfile();
      setUser(userData);
      Cookies.set('user', JSON.stringify(userData), { expires: 7 });
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}