'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { checkConnection } from '@/lib/api';

export function TerminalLoginScreen() {
  const [loginMode, setLoginMode] = useState<'select' | 'classic' | 'modern'>('select');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bootComplete, setBootComplete] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberSession, setRememberSession] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);

  const { login, register } = useAuth();
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Demo credentials with better security
  const demoCredentials = [
    { email: 'admin@demo.com', password: 'Demo123!', name: 'Demo Admin', role: 'admin' },
    { email: 'demo@aibos.com', password: 'demo123', name: 'Demo User', role: 'user' },
    { email: 'developer@aibos.com', password: 'dev2024!', name: 'Developer', role: 'developer' }
  ];

  // Check connection status
  useEffect(() => {
    const checkServerConnection = async () => {
      try {
        const status = await checkConnection();
        setConnectionStatus(status.connected ? 'connected' : 'disconnected');

        if (!status.connected) {
          setTerminalOutput(prev => [...prev, `WARNING: ${status.error}`, '']);
        }
      } catch (error) {
        setConnectionStatus('disconnected');
        setTerminalOutput(prev => [...prev, 'WARNING: Unable to connect to server', '']);
      }
    };

    checkServerConnection();
  }, []);

  // Simulate enhanced boot sequence
  useEffect(() => {
    const bootSequence = [
      'Booting AI-BOS Hybrid Interface...',
      'Loading terminal core........ [OK]',
      'Initializing UI framework... [OK]',
      'Starting neural network.... [OK]',
      'Loading authentication... [OK]',
      'Checking server connection...',
      connectionStatus === 'connected' ? 'Server connection... [OK]' : 'Server connection... [WARNING]',
      'Authentication ready.',
      '',
      '=== HYBRID AUTHENTICATION SYSTEM ===',
      'Select authentication method:',
      '1. Classic terminal login (Retro experience)',
      '2. Modern form login (Enhanced UX)',
      '',
      'Enter choice: _'
    ];

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < bootSequence.length) {
        setTerminalOutput(prev => [...prev, bootSequence[currentIndex]]);
        currentIndex++;
      } else {
        clearInterval(interval);
        setBootComplete(true);
      }
    }, 150);

    return () => clearInterval(interval);
  }, [connectionStatus]);

  // Handle keyboard input for mode selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!bootComplete || loginMode !== 'select' || isLocked) return;

      if (e.key === '1') {
        setLoginMode('classic');
        setTerminalOutput(prev => [...prev, '> Selected: Classic terminal mode', 'Loading classic interface...', '']);
        setTimeout(() => {
          emailInputRef.current?.focus();
        }, 500);
      } else if (e.key === '2') {
        setLoginMode('modern');
        setTerminalOutput(prev => [...prev, '> Selected: Modern UI mode', 'Loading modern interface...', '']);
        setTimeout(() => {
          emailInputRef.current?.focus();
        }, 500);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [bootComplete, loginMode, isLocked]);

  // Handle lockout timer
  useEffect(() => {
    if (lockoutTime > 0) {
      const timer = setInterval(() => {
        setLockoutTime(prev => {
          if (prev <= 1) {
            setIsLocked(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [lockoutTime]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLocked) {
      setError(`Account temporarily locked. Try again in ${lockoutTime} seconds.`);
      return;
    }

    if (connectionStatus === 'disconnected') {
      setError('Cannot connect to server. Please check your connection and try again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(email, password);
      setLoginAttempts(0);
    } catch (error: any) {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);

      if (newAttempts >= 3) {
        setIsLocked(true);
        setLockoutTime(30); // 30 second lockout
        setError('Too many failed attempts. Account locked for 30 seconds.');
      } else {
        setError(error.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    const randomDemo = demoCredentials[Math.floor(Math.random() * demoCredentials.length)];
    setEmail(randomDemo.email);
    setPassword(randomDemo.password);
    setError('');

    // Auto-focus password field after filling
    setTimeout(() => {
      passwordInputRef.current?.focus();
    }, 100);
  };

  const handleModeSwitch = (mode: 'classic' | 'modern') => {
    setLoginMode(mode);
    setError('');
    setTerminalOutput(prev => [...prev, `> Switched to ${mode} mode`, '']);
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-400';
      case 'disconnected': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return '● CONNECTED';
      case 'disconnected': return '● DISCONNECTED';
      default: return '● CHECKING...';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-6">
      <div className="w-full max-w-2xl mx-auto bg-black bg-opacity-95 border border-green-500 rounded-lg overflow-hidden relative shadow-2xl">
        {/* Enhanced CRT Effect */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-green-500/10 to-transparent opacity-40"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(0, 255, 65, 0.05) 50%, transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(0, 255, 65, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: '100% 4px, 20px 20px'
          }}></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/5 to-transparent animate-pulse"></div>
        </div>

        {/* Enhanced Terminal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-green-700 bg-black relative z-10">
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2 mr-4">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="text-sm text-green-400 font-mono">AI-BOS v2.5.0</div>
          </div>
          <div className={`text-xs font-mono ${getConnectionStatusColor()}`}>
            {getConnectionStatusText()}
          </div>
        </div>

        {/* Terminal Body with Enhanced Scrolling */}
        <div className="p-4 h-96 overflow-y-auto relative z-10 scrollbar-thin scrollbar-thumb-green-700 scrollbar-track-transparent">
          <div className="font-mono text-sm space-y-1">
            {terminalOutput.map((line, index) => (
              <div key={index} className="text-green-400">
                {(line || '').includes('[OK]') ? (
                  <span className="text-green-500">✓ {line}</span>
                ) : (line || '').includes('[WARNING]') ? (
                  <span className="text-yellow-400">⚠ {line}</span>
                ) : (line || '').includes('ERROR:') ? (
                  <span className="text-red-400">✗ {line}</span>
                ) : (
                  line
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Classic Terminal Login Form */}
        {loginMode === 'classic' && (
          <div className="p-4 border-t border-green-700 bg-black bg-opacity-80 relative z-10">
            <div className="mb-4">
              <div className="text-green-400 font-mono text-sm mb-2">user@ai-bos:~$ login</div>
              <div className="text-green-400 font-mono text-sm mb-4">Terminal Authentication Required</div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm mb-2 text-green-400 font-mono">Email:</label>
                <input
                  ref={emailInputRef}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@aibos.com"
                  className="w-full px-3 py-2 bg-gray-900 border border-green-700 rounded text-green-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 font-mono text-sm transition-all"
                  required
                  disabled={isLocked}
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-green-400 font-mono">Password:</label>
                <div className="relative">
                  <input
                    ref={passwordInputRef}
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 pr-10 bg-gray-900 border border-green-700 rounded text-green-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 font-mono text-sm transition-all"
                    required
                    disabled={isLocked}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-400 hover:text-green-300 text-xs"
                  >
                    {showPassword ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
              </div>

              {/* Enhanced Demo Credentials */}
              <div className="p-3 bg-green-900/20 border border-green-700 rounded">
                <p className="text-xs text-green-300 mb-2 font-mono">Demo Credentials:</p>
                <div className="text-xs text-green-400 space-y-1 font-mono">
                  {demoCredentials.map((cred, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{cred.email}</span>
                      <span className="text-green-300">/ {cred.password}</span>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={fillDemoCredentials}
                  className="mt-2 text-xs bg-green-700 text-black px-3 py-1 rounded hover:bg-green-600 transition-colors font-mono"
                >
                  USE DEMO
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember-classic"
                    checked={rememberSession}
                    onChange={(e) => setRememberSession(e.target.checked)}
                    className="mr-2"
                    disabled={isLocked}
                  />
                  <label htmlFor="remember-classic" className="text-sm text-green-400 font-mono">Remember session</label>
                </div>
                <button
                  type="button"
                  onClick={() => handleModeSwitch('modern')}
                  className="text-xs text-green-400 hover:text-green-300 font-mono underline"
                >
                  Switch to Modern
                </button>
              </div>

              {error && (
                <div className="p-3 bg-red-900/20 border border-red-700 rounded">
                  <p className="text-sm text-red-400 font-mono">ERROR: {error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || isLocked}
                className="w-full py-2 bg-green-700 hover:bg-green-600 disabled:bg-gray-700 text-black font-bold rounded font-mono text-sm transition-all"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <LoadingSpinner size="sm" className="mr-2" />
                    AUTHENTICATING...
                  </div>
                ) : isLocked ? (
                  `LOCKED (${lockoutTime}s)`
                ) : (
                  '[ EXECUTE LOGIN ]'
                )}
              </button>
            </form>
          </div>
        )}

        {/* Modern Login Form */}
        {loginMode === 'modern' && (
          <div className="p-4 border-t border-green-700 bg-black bg-opacity-80 relative z-10">
            <div className="mb-6">
              <h2 className="text-xl text-green-400 font-mono mb-2">Welcome to AI-BOS</h2>
              <p className="text-sm text-green-300">Enter your credentials to continue</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm mb-2 text-green-400">Email Address</label>
                <input
                  ref={emailInputRef}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@aibos.com"
                  className="w-full px-3 py-2 bg-gray-900 border border-green-700 rounded text-green-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 font-mono transition-all"
                  required
                  disabled={isLocked}
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-green-400">Password</label>
                <div className="relative">
                  <input
                    ref={passwordInputRef}
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 pr-10 bg-gray-900 border border-green-700 rounded text-green-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 font-mono transition-all"
                    required
                    disabled={isLocked}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-400 hover:text-green-300 text-xs"
                  >
                    {showPassword ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
              </div>

              {/* Enhanced Demo Credentials */}
              <div className="p-3 bg-green-900/20 border border-green-700 rounded">
                <p className="text-xs text-green-300 mb-2">Demo Credentials:</p>
                <div className="text-xs text-green-400 space-y-1">
                  {demoCredentials.map((cred, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{cred.email}</span>
                      <span className="text-green-300">/ {cred.password}</span>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={fillDemoCredentials}
                  className="mt-2 text-xs bg-green-700 text-black px-3 py-1 rounded hover:bg-green-600 transition-colors"
                >
                  Use Demo
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember-modern"
                    checked={rememberSession}
                    onChange={(e) => setRememberSession(e.target.checked)}
                    className="mr-2"
                    disabled={isLocked}
                  />
                  <label htmlFor="remember-modern" className="text-sm text-green-400">Remember session</label>
                </div>
                <button
                  type="button"
                  onClick={() => handleModeSwitch('classic')}
                  className="text-xs text-green-400 hover:text-green-300 underline"
                >
                  Switch to Classic
                </button>
              </div>

              {error && (
                <div className="p-3 bg-red-900/20 border border-red-700 rounded">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || isLocked}
                className="w-full py-2 bg-green-700 hover:bg-green-600 disabled:bg-gray-700 text-black font-bold rounded font-mono transition-all"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <LoadingSpinner size="sm" className="mr-2" />
                    AUTHENTICATING...
                  </div>
                ) : isLocked ? (
                  `Account Locked (${lockoutTime}s)`
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>
        )}

        {/* Enhanced Instructions for mode selection */}
        {loginMode === 'select' && bootComplete && (
          <div className="p-4 border-t border-green-700 bg-black bg-opacity-80 relative z-10">
            <div className="text-center space-y-2">
              <p className="text-sm text-green-400 font-mono">
                Press <span className="text-yellow-400 font-bold">1</span> for Classic Terminal or <span className="text-yellow-400 font-bold">2</span> for Modern UI
              </p>
              <div className="flex justify-center space-x-4 text-xs text-green-300">
                <span>Classic: Retro terminal experience</span>
                <span>Modern: Enhanced user interface</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
