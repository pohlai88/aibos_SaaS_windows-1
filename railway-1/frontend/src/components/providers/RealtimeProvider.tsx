'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import realtimeClient from '@/lib/realtime';

interface RealtimeContextType {
  isConnected: boolean;
  status: any;
  connect: () => void;
  disconnect: () => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState({});

  useEffect(() => {
    const handleConnectionChange = (connectionStatus: string) => {
      setIsConnected(connectionStatus === 'connected');
      setStatus(realtimeClient.getStatus());
    };

    const handleError = (error: any) => {
      console.error('Realtime error:', error);
    };

    // Set initial status
    setStatus(realtimeClient.getStatus());
    setIsConnected(realtimeClient.isConnected);

    // Subscribe to connection changes
    const unsubscribeConnection = realtimeClient.onConnect(handleConnectionChange);
    const unsubscribeError = realtimeClient.onError(handleError);

    // Connect automatically
    if (!realtimeClient.isConnected) {
      realtimeClient.connect();
    }

    return () => {
      unsubscribeConnection();
      unsubscribeError();
    };
  }, []);

  const connect = () => {
    realtimeClient.connect();
  };

  const disconnect = () => {
    realtimeClient.disconnect();
  };

  const value: RealtimeContextType = {
    isConnected,
    status,
    connect,
    disconnect,
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (context === undefined) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
} 