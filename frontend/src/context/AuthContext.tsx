import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../lib/api';

// 🎯 Aligned with backend "role" change
interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin'; 
  credits: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  refresh: () => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        localStorage.setItem('token', token);
        
        try {
          const { data } = await api.get('/auth/me');
          setUser(data); // data now contains 'role' instead of 'isAdmin'
        } catch (error) {
          console.error("Auth Session Expired");
          logout();
        }
      } else {
        delete api.defaults.headers.common['Authorization'];
        localStorage.removeItem('token');
        setUser(null);
      }
      setLoading(false);
    };

    initializeAuth();
  }, [token]);

  const refresh = async () => {
    const { data } = await api.get('/auth/me');
    setUser(data);
  };

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    setToken(data.token);
    setUser(data); // Assuming backend returns the full user object
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data } = await api.post('/auth/register', {
      email,
      password,
      name: fullName,
    });
    setToken(data.token);
    setUser(data);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signUp, refresh, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
