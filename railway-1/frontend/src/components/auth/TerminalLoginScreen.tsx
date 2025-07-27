'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useUser } from '@/lib/store';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { checkConnection } from '@/lib/api';

export function TerminalLoginScreen() {
  const [loginMode, setLoginMode] = useState<'select' | 'classic' | 'modern'>('select');
  const [loginLoading, setLoginLoading] = useState(false);
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
  const [debugMode, setDebugMode] = useState(false);
  const [thermalEffect, setThermalEffect] = useState(false);
  const [scanlineEffect, setScanlineEffect] = useState(false);
  const [glitchEffect, setGlitchEffect] = useState(false);

  const { login, register, isLoading } = useAuth();
  const user = useUser(); // Get user from Zustand store
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Enhanced demo credentials with more variety
  const demoCredentials = [
    { email: 'admin@demo.com', password: 'Demo123!', name: 'Demo Admin', role: 'admin', description: 'Full system access' },
    { email: 'user@demo.com', password: 'User123!', name: 'Demo User', role: 'user', description: 'Standard user access' },
    { email: 'developer@demo.com', password: 'Dev123!', name: 'Demo Developer', role: 'developer', description: 'Development tools access' }
  ];

  // Force logout function to clear any stored tokens
  const forceLogout = () => {
    localStorage.removeItem('aibos_token');
    window.location.reload();
  };

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

  // Enhanced boot sequence with thermal effects
  useEffect(() => {
    const bootSequence = [
      'INITIALIZING AI-BOS THERMAL INTERFACE...',
      'Loading thermal core........ [OK]',
      'Initializing neural networks... [OK]',
      'Starting consciousness engine.... [OK]',
      'Loading authentication protocols... [OK]',
      'Checking server connection...',
      connectionStatus === 'connected' ? 'Server connection... [OK]' : 'Server connection... [WARNING]',
      'Thermal interface ready.',
      '',
      '=== THERMAL AUTHENTICATION SYSTEM ===',
      'Select your preferred interface:',
      '1. CLASSIC TERMINAL (Retro thermal experience)',
      '2. MODERN THERMAL (Enhanced neural interface)',
      '',
      'Enter choice: _'
    ];

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < bootSequence.length) {
        const line = bootSequence[currentIndex];
        if (line !== undefined) {
          setTerminalOutput(prev => [...prev, line]);
        }
        currentIndex++;
      } else {
        clearInterval(interval);
        setBootComplete(true);
        // Enable thermal effects after boot
        setThermalEffect(true);
        setScanlineEffect(true);
      }
    }, 120);

    return () => clearInterval(interval);
  }, [connectionStatus]);

  // Handle keyboard input for mode selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle debug mode with Ctrl+D
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        setDebugMode(prev => !prev);
        setTerminalOutput(prev => [...prev, `> Debug mode: ${!debugMode ? 'enabled' : 'disabled'}`, '']);
        return;
      }

      // Toggle glitch effect with Ctrl+G
      if (e.ctrlKey && e.key === 'g') {
        e.preventDefault();
        setGlitchEffect(prev => !prev);
        setTerminalOutput(prev => [...prev, `> Glitch mode: ${!glitchEffect ? 'enabled' : 'disabled'}`, '']);
        return;
      }

      if (!bootComplete || loginMode !== 'select' || isLocked) return;

      if (e.key === '1') {
        setLoginMode('classic');
        setTerminalOutput(prev => [...prev, '> Selected: CLASSIC TERMINAL MODE', 'Loading retro thermal interface...', '']);
        setTimeout(() => {
          emailInputRef.current?.focus();
        }, 500);
      } else if (e.key === '2') {
        setLoginMode('modern');
        setTerminalOutput(prev => [...prev, '> Selected: MODERN THERMAL MODE', 'Loading enhanced neural interface...', '']);
        setTimeout(() => {
          emailInputRef.current?.focus();
        }, 500);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [bootComplete, loginMode, isLocked, debugMode, glitchEffect]);

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
    return undefined;
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

    setLoginLoading(true);
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
      setLoginLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    const randomDemo = demoCredentials[Math.floor(Math.random() * demoCredentials.length)];
    if (randomDemo) {
      setEmail(randomDemo.email);
      setPassword(randomDemo.password);
      setError('');

      // Auto-focus password field after filling
      setTimeout(() => {
        passwordInputRef.current?.focus();
      }, 100);
    }
  };

  const handleModeSwitch = (mode: 'classic' | 'modern') => {
    setLoginMode(mode);
    setError('');
    setTerminalOutput(prev => [...prev, `> Switched to ${mode.toUpperCase()} mode`, '']);
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
    <div className="min-h-screen flex items-center justify-center bg-black p-6 relative overflow-hidden">
      {/* Enhanced Thermal Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Thermal gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-orange-800/15 to-yellow-700/10"></div>

        {/* Thermal scanlines */}
        {scanlineEffect && (
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(255, 165, 0, 0.1) 50%, transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(255, 69, 0, 0.15) 1px, transparent 1px)
            `,
            backgroundSize: '100% 4px, 20px 20px',
            animation: 'scanline 0.1s linear infinite'
          }}></div>
        )}

        {/* Thermal glow effect */}
        {thermalEffect && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/5 to-transparent animate-pulse"></div>
        )}

        {/* Enhanced thermal particles */}
        {thermalEffect && (
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-orange-400 rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        )}

        {/* Glitch effect */}
        {glitchEffect && (
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-transparent to-blue-500/10 animate-pulse"></div>
        )}
      </div>

      <div className={`w-full max-w-4xl mx-auto relative z-10 ${glitchEffect ? 'animate-glitch' : ''}`}>
        {/* Classic Terminal Mode */}
        {loginMode === 'classic' && (
          <div className="bg-black bg-opacity-95 border-2 border-orange-500 rounded-lg overflow-hidden shadow-2xl animate-thermal-flicker">
            {/* Classic Terminal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-orange-700 bg-black">
              <div className="flex items-center space-x-4">
                <div className="flex space-x-2 mr-4">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="text-sm text-orange-400 font-mono">AI-BOS v2.5.0 - CLASSIC TERMINAL</div>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`text-xs font-mono ${getConnectionStatusColor()}`}>
                  {getConnectionStatusText()}
                </div>
                <button
                  onClick={forceLogout}
                  className="text-xs text-red-400 hover:text-red-300 font-mono underline"
                  title="Clear session and reload"
                >
                  CLEAR SESSION
                </button>
              </div>
            </div>

            {/* Classic Terminal Body */}
            <div className="p-4 h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-orange-700 scrollbar-track-transparent">
              <div className="font-mono text-sm space-y-1">
                {terminalOutput.map((line, index) => (
                  <div key={index} className="text-orange-400">
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

                {/* Debug Panel */}
                {debugMode && (
                  <div className="mt-4 p-3 bg-orange-900/20 border border-orange-700 rounded">
                    <p className="text-xs text-orange-300 mb-2 font-mono">DEBUG INFO:</p>
                    <div className="text-xs text-orange-400 space-y-1 font-mono">
                      <div>Loading: {isLoading ? 'true' : 'false'}</div>
                      <div>User: {user ? `${user.email} (${user.name})` : 'null'}</div>
                      <div>Token: {localStorage.getItem('aibos_token') ? 'exists' : 'null'}</div>
                      <div>Connection: {connectionStatus}</div>
                      <div>Login Mode: {loginMode}</div>
                      <div>Boot Complete: {bootComplete ? 'true' : 'false'}</div>
                      <div>Thermal Effect: {thermalEffect ? 'true' : 'false'}</div>
                      <div>Glitch Effect: {glitchEffect ? 'true' : 'false'}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Classic Terminal Login Form */}
            <div className="p-4 border-t border-orange-700 bg-black bg-opacity-80">
              <div className="mb-4">
                <div className="text-orange-400 font-mono text-sm mb-2">user@ai-bos:~$ login</div>
                <div className="text-orange-400 font-mono text-sm mb-4">Terminal Authentication Required</div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="login-email" className="block text-sm mb-2 text-orange-400 font-mono">Email:</label>
                  <input
                    ref={emailInputRef}
                    type="email"
                    id="login-email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@aibos.com"
                    className="w-full px-3 py-2 bg-gray-900 border border-orange-700 rounded text-orange-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-mono text-sm transition-all"
                    required
                    disabled={isLocked}
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label htmlFor="login-password" className="block text-sm mb-2 text-orange-400 font-mono">Password:</label>
                  <div className="relative">
                    <input
                      ref={passwordInputRef}
                      type={showPassword ? 'text' : 'password'}
                      id="login-password"
                      name="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 pr-10 bg-gray-900 border border-orange-700 rounded text-orange-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-mono text-sm transition-all"
                      required
                      disabled={isLocked}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-orange-400 hover:text-orange-300 text-xs"
                    >
                      {showPassword ? 'HIDE' : 'SHOW'}
                    </button>
                  </div>
                </div>

                {/* Enhanced Demo Credentials */}
                <div className="p-3 bg-orange-900/20 border border-orange-700 rounded">
                  <p className="text-xs text-orange-300 mb-2 font-mono">Demo Credentials:</p>
                  <div className="text-xs text-orange-400 space-y-1 font-mono">
                    {demoCredentials.map((cred, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{cred.email}</span>
                        <span className="text-orange-300">/ {cred.password}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={fillDemoCredentials}
                    className="mt-2 text-xs bg-orange-700 text-black px-3 py-1 rounded hover:bg-orange-600 transition-colors font-mono"
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
                    <label htmlFor="remember-classic" className="text-sm text-orange-400 font-mono">Remember session</label>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleModeSwitch('modern')}
                    className="text-xs text-orange-400 hover:text-orange-300 font-mono underline"
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
                  disabled={loginLoading || isLocked}
                  className="w-full py-2 bg-orange-700 hover:bg-orange-600 disabled:bg-gray-700 text-black font-bold rounded font-mono text-sm transition-all"
                >
                  {loginLoading ? (
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
          </div>
        )}

        {/* Modern Thermal Mode */}
        {loginMode === 'modern' && (
          <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-purple-500/30 relative">
            {/* Neural network background effect */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `
                  radial-gradient(circle at 20% 20%, rgba(147, 51, 234, 0.3) 0%, transparent 50%),
                  radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
                  radial-gradient(circle at 40% 60%, rgba(236, 72, 153, 0.2) 0%, transparent 50%)
                `,
                animation: 'neural-pulse 4s ease-in-out infinite'
              }}></div>
            </div>
            {/* Modern Header */}
            <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-6 border-b border-purple-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">AI</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">AI-BOS</h1>
                    <p className="text-purple-300 text-sm">Neural Interface v2.5.0</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    connectionStatus === 'connected' ? 'bg-green-500/20 text-green-400' :
                    connectionStatus === 'disconnected' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {getConnectionStatusText()}
                  </div>
                  <button
                    onClick={forceLogout}
                    className="text-purple-300 hover:text-white text-sm underline"
                  >
                    Clear Session
                  </button>
                </div>
              </div>
            </div>

            {/* Modern Login Form */}
            <div className="p-8">
              <div className="max-w-md mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                  <p className="text-purple-300">Access your neural workspace</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                  <div>
                    <label htmlFor="login-email" className="block text-sm font-medium text-purple-300 mb-2">
                      Email Address
                    </label>
                    <input
                      ref={emailInputRef}
                      type="email"
                      id="login-email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/30 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      required
                      disabled={isLocked}
                      autoComplete="email"
                    />
                  </div>

                  <div>
                    <label htmlFor="login-password" className="block text-sm font-medium text-purple-300 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        ref={passwordInputRef}
                        type={showPassword ? 'text' : 'password'}
                        id="login-password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full px-4 py-3 pr-12 bg-slate-800/50 border border-purple-500/30 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                        required
                        disabled={isLocked}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-300"
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>

                  {/* Enhanced Demo Credentials */}
                  <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-xl">
                    <p className="text-sm text-purple-300 mb-3 font-medium">Demo Credentials</p>
                    <div className="space-y-2">
                      {demoCredentials.map((cred, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-purple-200">{cred.email}</span>
                          <span className="text-purple-400">/ {cred.password}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={fillDemoCredentials}
                      className="mt-3 w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      Use Demo Credentials
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="remember-modern"
                        checked={rememberSession}
                        onChange={(e) => setRememberSession(e.target.checked)}
                        className="mr-2 rounded border-purple-500/30 bg-slate-800/50"
                        disabled={isLocked}
                      />
                      <label htmlFor="remember-modern" className="text-sm text-purple-300">Remember session</label>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleModeSwitch('classic')}
                      className="text-sm text-purple-400 hover:text-purple-300 underline"
                    >
                      Switch to Classic
                    </button>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                      <p className="text-sm text-red-400">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loginLoading || isLocked}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-xl transition-all transform hover:scale-105 disabled:transform-none relative overflow-hidden"
                  >
                    {/* Holographic effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full animate-holographic"></div>
                    {loginLoading ? (
                      <div className="flex items-center justify-center">
                        <LoadingSpinner size="sm" className="mr-2" />
                        Authenticating...
                      </div>
                    ) : isLocked ? (
                      `Account Locked (${lockoutTime}s)`
                    ) : (
                      'Sign In to AI-BOS'
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Mode Selection Screen */}
        {loginMode === 'select' && bootComplete && (
          <div className="bg-black bg-opacity-95 border-2 border-orange-500 rounded-lg overflow-hidden shadow-2xl">
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-orange-700 bg-black">
              <div className="flex items-center space-x-4">
                <div className="flex space-x-2 mr-4">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="text-sm text-orange-400 font-mono">AI-BOS v2.5.0 - THERMAL INTERFACE</div>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`text-xs font-mono ${getConnectionStatusColor()}`}>
                  {getConnectionStatusText()}
                </div>
              </div>
            </div>

            {/* Terminal Body */}
            <div className="p-4 h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-orange-700 scrollbar-track-transparent">
              <div className="font-mono text-sm space-y-1">
                {terminalOutput.map((line, index) => (
                  <div key={index} className="text-orange-400">
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

            {/* Mode Selection Instructions */}
            <div className="p-4 border-t border-orange-700 bg-black bg-opacity-80">
              <div className="text-center space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-orange-700 rounded-lg bg-orange-900/20">
                    <h3 className="text-lg font-bold text-orange-400 mb-2">CLASSIC TERMINAL</h3>
                    <p className="text-sm text-orange-300 mb-3">Retro thermal experience with authentic terminal interface</p>
                    <button
                      onClick={() => handleModeSwitch('classic')}
                      className="w-full py-2 bg-orange-700 hover:bg-orange-600 text-black font-bold rounded font-mono text-sm transition-all"
                    >
                      Press 1 or Click Here
                    </button>
                  </div>
                  <div className="p-4 border border-purple-700 rounded-lg bg-purple-900/20">
                    <h3 className="text-lg font-bold text-purple-400 mb-2">MODERN THERMAL</h3>
                    <p className="text-sm text-purple-300 mb-3">Enhanced neural interface with modern aesthetics</p>
                    <button
                      onClick={() => handleModeSwitch('modern')}
                      className="w-full py-2 bg-purple-700 hover:bg-purple-600 text-white font-bold rounded font-mono text-sm transition-all"
                    >
                      Press 2 or Click Here
                    </button>
                  </div>
                </div>
                <p className="text-sm text-orange-400 font-mono">
                  Press <span className="text-yellow-400 font-bold">1</span> for Classic Terminal or <span className="text-yellow-400 font-bold">2</span> for Modern Thermal
                </p>
                <div className="text-xs text-orange-300 space-y-1">
                  <p>Ctrl+D: Toggle Debug Mode</p>
                  <p>Ctrl+G: Toggle Glitch Effect</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

            <style jsx>{`
        @keyframes scanline {
          0% { transform: translateY(0); }
          100% { transform: translateY(4px); }
        }

        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }

        @keyframes neural-pulse {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.05); }
        }

                @keyframes thermal-flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }

        @keyframes holographic {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }

        .animate-glitch {
          animation: glitch 0.3s ease-in-out infinite;
        }

        .animate-thermal-flicker {
          animation: thermal-flicker 0.5s ease-in-out infinite;
        }

        .animate-holographic {
          animation: holographic 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
