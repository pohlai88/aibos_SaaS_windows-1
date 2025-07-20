'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showDemo, setShowDemo] = useState(true);
  
  const { login, register } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    tenant_name: '',
  });

  // Auto-fill demo credentials
  const fillDemoCredentials = () => {
    setFormData({
      email: 'admin@demo.com',
      password: 'Demo123!',
      name: 'Demo Admin',
      tenant_name: 'Demo Company'
    });
    setError('');
    setPasswordError('');
  };

  // Enhanced password validation
  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    return {
      isValid: minLength && hasUpper && hasLower && hasNumber,
      errors: {
        minLength,
        hasUpper,
        hasLower,
        hasNumber
      }
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPasswordError('');

    // Validate form data
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    if (!isLogin) {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        setPasswordError('Password must be at least 8 characters with uppercase, lowercase, and number.');
        setLoading(false);
        return;
      }

      if (!formData.name || !formData.tenant_name) {
        setError('Please fill in all required fields for registration.');
        setLoading(false);
        return;
      }
    }

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.email, formData.password, formData.name, formData.tenant_name);
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      
      // Handle different types of errors
      if (error.response?.status === 401) {
        setError('Invalid email or password. Please try again.');
      } else if (error.response?.status === 409) {
        setError('An account with this email already exists.');
      } else if (error.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        setError('Unable to connect to server. Please check your internet connection.');
      } else {
        setError(error.response?.data?.error || error.message || 'An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear errors when user starts typing
    if (error) setError('');
    if (passwordError) setPasswordError('');
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setPasswordError('');
    // Clear form when switching modes
    setFormData({
      email: '',
      password: '',
      name: '',
      tenant_name: '',
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">AI</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">AI-BOS Platform</h1>
            <p className="text-gray-600">The Windows OS for SaaS</p>
          </div>

          {/* Demo Credentials */}
          {showDemo && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 relative">
              <button
                onClick={() => setShowDemo(false)}
                className="absolute top-2 right-2 text-blue-400 hover:text-blue-600"
                aria-label="Close demo info"
              >
                ×
              </button>
              <p className="text-sm text-blue-800 font-medium mb-2">Demo Credentials:</p>
              <p className="text-sm text-blue-700 mb-1">Email: admin@demo.com</p>
              <p className="text-sm text-blue-700 mb-3">Password: any password</p>
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
              >
                Use Demo Credentials
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <Input
                  label="Full Name"
                  type="text"
                  value={formData.name}
                  onChange={(value) => handleInputChange('name', value)}
                  required
                  placeholder="Enter your full name"
                />
                <Input
                  label="Company Name"
                  type="text"
                  value={formData.tenant_name}
                  onChange={(value) => handleInputChange('tenant_name', value)}
                  required
                  placeholder="Enter your company name"
                />
              </>
            )}

            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(value) => handleInputChange('email', value)}
              required
              placeholder="Enter your email address"
            />

            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(value) => handleInputChange('password', value)}
              required
              placeholder="Enter your password"
            />
            
            {/* Password requirements (only show for registration) */}
            {!isLogin && (
              <div className="text-xs text-gray-500 space-y-1">
                <p>Password requirements:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>At least 8 characters</li>
                  <li>Include uppercase letter</li>
                  <li>Include lowercase letter</li>
                  <li>Include at least one number</li>
                </ul>
              </div>
            )}
            
            {passwordError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{passwordError}</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="sm" className="mr-2" />
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </div>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </Button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>

          {/* Connection Status */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400">
              API: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}