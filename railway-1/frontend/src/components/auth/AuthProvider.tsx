'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { useAIBOSStore, useUser, useToken, useIsAuthenticated } from '@/lib/store';
import { User } from '@/lib/store';

// ==================== MANIFESTOR INTEGRATION ====================
import { useManifestor, usePermission, useModuleConfig, useModuleEnabled } from '@/hooks/useManifestor';

// ==================== TYPES ====================

interface AuthContextType {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string, tenant_name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

// ==================== AUTH CONTEXT ====================

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// ==================== AUTH PROVIDER ====================

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ==================== MANIFESTOR INTEGRATION ====================
  const { can, getConfig, isEnabled, health, loading: manifestLoading, error: manifestError } = useManifestor();
  const moduleConfig = useModuleConfig('auth');
  const isModuleEnabled = useModuleEnabled('auth');

  // Check permissions for current user
  const currentUser = { id: 'current-user', role: 'guest', permissions: [] };
  const canLogin = usePermission('auth', 'login', currentUser);
  const canRegister = usePermission('auth', 'register', currentUser);

  // Get configuration from manifest
  const authConfig = moduleConfig.components?.AuthProvider;
  const security = moduleConfig.security;
  const performance = moduleConfig.performance;

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    user,
    token,
    setUser,
    setToken,
    setSystemState,
    addNotification,
    logout: storeLogout
  } = useAIBOSStore();

  // ==================== MANIFESTOR PERMISSION CHECKS ====================
  if (manifestLoading) {
    return <div className="animate-pulse bg-gray-200 rounded-lg h-screen w-full" />;
  }

  if (manifestError) {
    return <div className="text-red-600 p-4">Authentication Error</div>;
  }

  if (!isModuleEnabled) {
    return <div className="text-gray-600 p-4">Authentication Disabled</div>;
  }

  // ==================== SESSION MANAGEMENT ====================

  useEffect(() => {
    if (authConfig?.features?.autoLogin) {
      initializeAuth();
    } else {
      setIsLoading(false);
    }
  }, [authConfig?.features?.autoLogin]);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check for stored token
      const storedToken = localStorage.getItem('aibos_token');
      const storedUser = localStorage.getItem('aibos_user');

      if (storedToken && storedUser) {
        try {
          // Validate token with backend
          const response = await authAPI.me();

          if (response.data.success) {
            const userData = response.data.user;
            setToken(storedToken);
            setUser(userData);
            setSystemState({ isAuthenticated: true });

            // Update last login
            addNotification({
              type: 'success',
              title: 'Welcome back!',
              message: `Logged in as ${userData.name}`,
              isRead: false
            });
          } else {
            // Invalid token, clear storage
            clearAuthData();
          }
        } catch (error) {
          console.error('Token validation failed:', error);
          clearAuthData();
        }
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      setError('Failed to initialize authentication');
    } finally {
      setIsLoading(false);
    }
  };

  const clearAuthData = () => {
    // Manifest-driven session cleanup
    if (authConfig?.features?.persistentSessions) {
      localStorage.removeItem('aibos_token');
      localStorage.removeItem('aibos_user');
    }
    setToken(null);
    setUser(null);
    setSystemState({ isAuthenticated: false });
  };

  // ==================== AUTH ACTIONS ====================

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Manifest-driven permission check
    if (!canLogin) {
      return { success: false, error: 'Login not permitted' };
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await authAPI.login(email, password);

      if (response.data.success) {
        const { token: authToken, user: userData } = response.data;

        // Manifest-driven session storage
        if (authConfig?.features?.persistentSessions) {
          localStorage.setItem('aibos_token', authToken);
          localStorage.setItem('aibos_user', JSON.stringify(userData));
        }

        // Update store
        setToken(authToken);
        setUser(userData);
        setSystemState({ isAuthenticated: true });

        // Manifest-driven audit logging
        if (authConfig?.features?.auditLogging) {
          console.log('Auth audit: User login successful', { userId: userData.id, timestamp: new Date() });
        }

        // Success notification
        addNotification({
          type: 'success',
          title: 'Login successful',
          message: `Welcome to AI-BOS, ${userData.name}!`,
          isRead: false
        });

        return { success: true };
      } else {
        const errorMessage = response.data.error || 'Login failed';
        setError(errorMessage);
        addNotification({
          type: 'error',
          title: 'Login failed',
          message: errorMessage,
          isRead: false
        });
        return { success: false, error: errorMessage };
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Login failed';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Login failed',
        message: errorMessage,
        isRead: false
      });
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, tenant_name: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authAPI.register(email, password, name, tenant_name);

      if (response.data.success) {
        const { token: authToken, user: userData } = response.data;

        // Store in localStorage
        localStorage.setItem('aibos_token', authToken);
        localStorage.setItem('aibos_user', JSON.stringify(userData));

        // Update store
        setToken(authToken);
        setUser(userData);
        setSystemState({ isAuthenticated: true });

        // Success notification
        addNotification({
          type: 'success',
          title: 'Registration successful',
          message: `Welcome to AI-BOS, ${userData.name}! Your account has been created.`,
          isRead: false
        });

        return { success: true };
      } else {
        const errorMessage = response.data.error || 'Registration failed';
        setError(errorMessage);
        addNotification({
          type: 'error',
          title: 'Registration failed',
          message: errorMessage,
          isRead: false
        });
        return { success: false, error: errorMessage };
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Registration failed';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Registration failed',
        message: errorMessage,
        isRead: false
      });
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Call logout endpoint
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear local data regardless of API call success
      clearAuthData();
      storeLogout();

      addNotification({
        type: 'info',
        title: 'Logged out',
        message: 'You have been successfully logged out',
        isRead: false
      });

      // Redirect to login
      router.push('/');
    }
  };

  const refreshSession = async (): Promise<void> => {
    try {
      const response = await authAPI.me();

      if (response.data.success) {
        const userData = response.data.user;
        setUser(userData);
        localStorage.setItem('aibos_user', JSON.stringify(userData));
      } else {
        // Session expired, logout
        await logout();
      }
    } catch (error) {
      console.error('Session refresh failed:', error);
      await logout();
    }
  };

  // ==================== CONTEXT VALUE ====================

  const contextValue: AuthContextType = {
    login,
    register,
    logout,
    refreshSession,
    isLoading,
    error
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
