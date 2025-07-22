import { useEffect, useState, useCallback, useRef } from 'react';
import realtimeClient from '../lib/realtime';

export function useRealtimeConnection() {
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState({});

  useEffect(() => {
    const handleConnectionChange = (connectionStatus) => {
      setIsConnected(connectionStatus === 'connected');
      setStatus(realtimeClient.getStatus());
    };

    const handleError = (error) => {
      console.error('Realtime error:', error);
    };

    // Set initial status
    setStatus(realtimeClient.getStatus());
    setIsConnected(realtimeClient.isConnected);

    // Subscribe to connection changes
    const unsubscribeConnection = realtimeClient.onConnect(handleConnectionChange);
    const unsubscribeError = realtimeClient.onError(handleError);

    // Connect if not already connected
    if (!realtimeClient.isConnected) {
      realtimeClient.connect();
    }

    return () => {
      unsubscribeConnection();
      unsubscribeError();
    };
  }, []);

  const connect = useCallback(() => {
    realtimeClient.connect();
  }, []);

  const disconnect = useCallback(() => {
    realtimeClient.disconnect();
  }, []);

  return {
    isConnected,
    status,
    connect,
    disconnect
  };
}

export function useRealtimeSubscription(channel, event, handler) {
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    if (channel && event && handler) {
      unsubscribeRef.current = realtimeClient.subscribe(channel, event, handler);
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [channel, event, handler]);

  const publish = useCallback((payload) => {
    realtimeClient.publish(channel, event, payload);
  }, [channel, event]);

  return { publish };
}

export function useRealtimeAuth() {
  const authenticate = useCallback((tenantId, userId, token = null) => {
    realtimeClient.authenticate(tenantId, userId, token);
  }, []);

  return { authenticate };
}

export function useRealtimeStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/realtime/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      
      const data = await response.json();
      setStats(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}

export function useRealtimeBroadcast() {
  const broadcast = useCallback(async (channel, event, payload) => {
    try {
      const response = await fetch('/api/realtime/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ channel, event, payload })
      });

      if (!response.ok) {
        throw new Error('Failed to broadcast message');
      }

      return await response.json();
    } catch (error) {
      console.error('Broadcast error:', error);
      throw error;
    }
  }, []);

  return { broadcast };
}

export function useRealtimeTest() {
  const sendTestMessage = useCallback(async (message = 'Test message') => {
    try {
      const response = await fetch('/api/realtime/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ message })
      });

      if (!response.ok) {
        throw new Error('Failed to send test message');
      }

      return await response.json();
    } catch (error) {
      console.error('Test message error:', error);
      throw error;
    }
  }, []);

  return { sendTestMessage };
}

// Hook for database change events
export function useDatabaseChanges(tableName, handler) {
  return useRealtimeSubscription('database', tableName, handler);
}

// Hook for app events
export function useAppEvents(appId, handler) {
  return useRealtimeSubscription('app', appId, handler);
}

// Hook for entity events
export function useEntityEvents(entityName, handler) {
  return useRealtimeSubscription('entity', entityName, handler);
}

// Hook for system events
export function useSystemEvents(handler) {
  return useRealtimeSubscription('system', 'all', handler);
} 