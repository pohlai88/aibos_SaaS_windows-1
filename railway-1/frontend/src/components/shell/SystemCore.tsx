'use client';

import { createContext, useContext, useState, useEffect } from 'react';

interface SystemState {
  isBooted: boolean;
  isReady: boolean;
  bootProgress: number;
  currentPhase: string;
  session: {
    startTime: Date;
  };
  errors: any[];
  warnings: any[];
  performance: {
    memoryUsage: number;
    bootTime: number;
  };
}

interface SystemConfig {
  // Add config properties as needed
}

interface SystemCoreContextType {
  state: SystemState;
  config: SystemConfig;
}

const SystemCoreContext = createContext<SystemCoreContextType | null>(null);

export const useSystemCore = () => {
  const context = useContext(SystemCoreContext);
  if (!context) {
    throw new Error('useSystemCore must be used within SystemCoreProvider');
  }
  return context;
};

export const SystemCoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<SystemState>({
    isBooted: false,
    isReady: false,
    bootProgress: 0,
    currentPhase: 'initializing',
    session: {
      startTime: new Date()
    },
    errors: [],
    warnings: [],
    performance: {
      memoryUsage: 0,
      bootTime: 0
    }
  });

  const config: SystemConfig = {};

  useEffect(() => {
    // Simulate boot process
    const bootInterval = setInterval(() => {
      setState(prev => {
        const newProgress = Math.min(prev.bootProgress + 10, 100);
        const isBooted = newProgress >= 100;
        const isReady = isBooted;

        return {
          ...prev,
          bootProgress: newProgress,
          isBooted,
          isReady,
          currentPhase: isBooted ? 'ready' : 'booting',
          performance: {
            ...prev.performance,
            bootTime: Date.now() - prev.session.startTime.getTime()
          }
        };
      });
    }, 100);

    return () => clearInterval(bootInterval);
  }, []);

  return (
    <SystemCoreContext.Provider value={{ state, config }}>
      {children}
    </SystemCoreContext.Provider>
  );
};
