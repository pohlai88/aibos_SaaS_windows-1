'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import realtimeClient from '@/lib/realtime';

interface User {
  user_id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
}

interface Tenant {
  tenant_id: string;
  name: string;
  status: string;
}

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string, tenant_name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const storedToken = localStorage.getItem('aibos_token');
    if (storedToken) {
      setToken(storedToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  // Authenticate realtime when user and tenant are available
  useEffect(() => {
    if (user && tenant && token && realtimeClient.isConnected) {
      realtimeClient.authenticate(tenant.tenant_id, user.user_id, token);
    }
  }, [user, tenant, token]);

  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data.success) {
        setUser(response.data.data.user);
        setTenant(response.data.data.tenant);
      } else {
        // Token is invalid, clear it
        localStorage.removeItem('aibos_token');
        setToken(null);
        delete api.defaults.headers.common['Authorization'];
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('aibos_token');
      setToken(null);
      delete api.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        const { token: newToken, user: userData, tenant: tenantData } = response.data.data;
        
        setToken(newToken);
        setUser(userData);
        setTenant(tenantData);
        
        localStorage.setItem('aibos_token', newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

        // Authenticate realtime client
        if (realtimeClient.isConnected) {
          realtimeClient.authenticate(tenantData.tenant_id, userData.user_id, newToken);
        }
      } else {
        throw new Error(response.data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string, tenant_name: string) => {
    try {
      const response = await api.post('/auth/register', { email, password, name, tenant_name });
      if (response.data.success) {
        const { token: newToken, user: userData, tenant: tenantData } = response.data.data;
        
        setToken(newToken);
        setUser(userData);
        setTenant(tenantData);
        
        localStorage.setItem('aibos_token', newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

        // Authenticate realtime client
        if (realtimeClient.isConnected) {
          realtimeClient.authenticate(tenantData.tenant_id, userData.user_id, newToken);
        }
      } else {
        throw new Error(response.data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setTenant(null);
    setToken(null);
    localStorage.removeItem('aibos_token');
    delete api.defaults.headers.common['Authorization'];
    
    // Disconnect realtime client
    realtimeClient.disconnect();
  };

  const value: AuthContextType = {
    user,
    tenant,
    token,
    loading,
    login,
    logout,
    register,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 