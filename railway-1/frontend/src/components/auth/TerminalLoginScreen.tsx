'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function TerminalLoginScreen() {
  const [loginMode, setLoginMode] = useState<'select' | 'classic' | 'modern'>('select');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bootComplete, setBootComplete] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [inputType, setInputType] = useState<'email' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberSession, setRememberSession] = useState(false);

  const { login, register } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);

  // Demo credentials (frontend display only - sensitive credentials removed)
  const demoCredentials = [
    { email: 'admin@demo.com', password: 'Demo123!', name: 'Demo Admin' },
    { email: 'demo@aibos.com', password: 'demo123', name: 'Demo User' }
  ];

  // Simulate boot sequence
  useEffect(() => {
    const bootSequence = [
      'Booting AI-BOS Hybrid Interface...',
      'Loading terminal core........ [OK]',
      'Initializing UI framework... [OK]',
      'Starting neural network.... [OK]',
      'Authentication ready.',
      '',
      '=== HYBRID AUTHENTICATION ===',
      'Select method:',
      '1. Classic terminal login',
      '2. Modern form login',
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
    }, 200);

    return () => clearInterval(interval);
  }, []);

  // Handle keyboard input for terminal mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!bootComplete) return;

      if (loginMode === 'select') {
        if (e.key === '1') {
          setLoginMode('classic');
          setTerminalOutput(prev => [...prev, '> Selected: Classic terminal mode']);
          setTerminalOutput(prev => [...prev, 'Terminal Login Sequence:']);
          setTerminalOutput(prev => [...prev, 'user@ai-bos:~$ login']);
          setTerminalOutput(prev => [...prev, 'Email: _']);
          setTimeout(() => inputRef.current?.focus(), 100);
        } else if (e.key === '2') {
          setLoginMode('modern');
          setTerminalOutput(prev => [...prev, '> Selected: Modern UI mode']);
        }
      } else if (loginMode === 'classic') {
        if (e.key === 'Enter') {
          if (inputType === 'email') {
            setEmail(currentInput);
            setInputType('password');
            setTerminalOutput(prev => [...prev, `> ${currentInput}`]);
            setTerminalOutput(prev => [...prev, 'Password: _']);
            setCurrentInput('');
            setTimeout(() => inputRef.current?.focus(), 100);
          } else if (inputType === 'password') {
            setPassword(currentInput);
            setTerminalOutput(prev => [...prev, '> ********']);
            setTerminalOutput(prev => [...prev, 'user@ai-bos:~$ _']);
            setCurrentInput('');
            // Attempt login
            handleClassicLogin();
          }
        } else if (e.key === 'Backspace') {
          setCurrentInput(prev => prev.slice(0, -1));
        } else if (e.key.length === 1) {
          setCurrentInput(prev => prev + e.key);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [bootComplete, loginMode, inputType, currentInput, email, password]);

  const handleClassicLogin = async () => {
    setLoading(true);
    setError('');

    try {
      await login(email, password);
    } catch (error: any) {
      setError(error.message || 'Login failed');
      setTerminalOutput(prev => [...prev, '> ERROR: Authentication failed']);
      setTerminalOutput(prev => [...prev, '> Please try again']);
      setTerminalOutput(prev => [...prev, 'Email: _']);
      setInputType('email');
      setEmail('');
      setPassword('');
      setCurrentInput('');
    } finally {
      setLoading(false);
    }
  };

  const handleModernLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
    } catch (error: any) {
      setError(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    const randomDemo = demoCredentials[Math.floor(Math.random() * demoCredentials.length)];
    setEmail(randomDemo.email);
    setPassword(randomDemo.password);
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-6">
      <div className="w-full max-w-2xl mx-auto bg-black bg-opacity-90 border border-green-500 rounded-lg overflow-hidden relative">
        {/* CRT Effect */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 to-transparent opacity-30"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(0, 255, 65, 0.03) 50%, transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(0, 255, 65, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: '100% 4px, 20px 20px'
          }}></div>
        </div>

        {/* Terminal Header */}
        <div className="flex items-center px-4 py-2 border-b border-green-700 bg-black relative z-10">
          <div className="flex space-x-2 mr-4">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="text-sm text-green-400">AI-BOS v2.5.0</div>
        </div>

        {/* Terminal Body */}
        <div className="p-4 h-96 overflow-y-auto relative z-10">
          <div className="font-mono text-sm">
            {terminalOutput.map((line, index) => (
              <div key={index} className="text-green-400">
                {(line || '').includes('[OK]') ? (
                  <span className="text-green-500">✓ {line}</span>
                ) : (line || '').includes('ERROR:') ? (
                  <span className="text-red-400">{line}</span>
                ) : (
                  line
                )}
              </div>
            ))}

            {/* Current input line */}
            {loginMode === 'classic' && inputType === 'email' && (
              <div className="flex items-center">
                <span className="text-yellow-400 mr-2">Email:</span>
                <span className="text-green-400">{currentInput}</span>
                <span className="text-green-400 animate-pulse">_</span>
              </div>
            )}

            {loginMode === 'classic' && inputType === 'password' && (
              <div className="flex items-center">
                <span className="text-yellow-400 mr-2">Password:</span>
                <span className="text-green-400">{'*'.repeat(currentInput.length)}</span>
                <span className="text-green-400 animate-pulse">_</span>
              </div>
            )}
          </div>
        </div>

        {/* Hidden input for terminal mode */}
        <input
          ref={inputRef}
          type="text"
          className="absolute opacity-0 pointer-events-none"
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
        />

        {/* Modern Login Form */}
        {loginMode === 'modern' && (
          <div className="p-4 border-t border-green-700 bg-black bg-opacity-70 relative z-10">
            <div className="mb-4">
              <label className="block text-sm mb-1 text-green-400">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@aibos.com"
                className="w-full px-3 py-2 bg-gray-900 border border-green-700 rounded text-green-400 focus:outline-none focus:border-green-500 font-mono"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1 text-green-400">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-gray-900 border border-green-700 rounded text-green-400 focus:outline-none focus:border-green-500 font-mono"
              />
            </div>

            {/* Demo Credentials */}
            <div className="mb-4 p-3 bg-green-900/20 border border-green-700 rounded">
              <p className="text-xs text-green-300 mb-2">Demo Credentials:</p>
              <div className="text-xs text-green-400 space-y-1">
                <div>admin@demo.com / Demo123!</div>
                <div>demo@aibos.com / demo123</div>
              </div>
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="mt-2 text-xs bg-green-700 text-black px-2 py-1 rounded hover:bg-green-600 transition-colors"
              >
                Use Demo
              </button>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberSession}
                  onChange={(e) => setRememberSession(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="remember" className="text-sm text-green-400">Remember session</label>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-900/20 border border-red-700 rounded">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <button
              onClick={handleModernLogin}
              disabled={loading}
              className="w-full py-2 bg-green-700 hover:bg-green-600 disabled:bg-gray-700 text-black font-bold rounded font-mono"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="sm" className="mr-2" />
                  AUTHENTICATING...
                </div>
              ) : (
                '[ EXECUTE LOGIN ]'
              )}
            </button>
          </div>
        )}

        {/* Instructions for terminal mode */}
        {loginMode === 'select' && bootComplete && (
          <div className="p-4 border-t border-green-700 bg-black bg-opacity-70 relative z-10">
            <p className="text-sm text-green-400 text-center">
              Press <span className="text-yellow-400">1</span> for Classic Terminal or <span className="text-yellow-400">2</span> for Modern UI
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
