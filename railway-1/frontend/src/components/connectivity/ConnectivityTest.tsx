'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wifi, WifiOff, Database, Server, Brain, CheckCircle, XCircle,
  RefreshCw, Activity, Zap, Globe, AlertTriangle, Info
} from 'lucide-react';
import {
  checkConnection, consciousnessAPI, databaseAPI, systemAPI,
  authAPI, entitiesAPI, eventsAPI
} from '@/lib/api';
import {
  BackendDisconnectedState, DatabaseDisconnectedState,
  ConsciousnessDisconnectedState, NetworkErrorState,
  ServiceLoadingState, PartialConnectionState, SuccessState
} from '../empty-states/ServiceEmptyStates';

// ==================== TYPES ====================

interface ServiceStatus {
  name: string;
  status: 'connected' | 'disconnected' | 'checking' | 'error';
  responseTime: number;
  error?: string;
  lastChecked: Date;
}

interface ConnectivityTestProps {
  onComplete?: (allConnected: boolean) => void;
  showDetails?: boolean;
}

// ==================== CONNECTIVITY TEST COMPONENT ====================

const ConnectivityTest: React.FC<ConnectivityTestProps> = ({
  onComplete,
  showDetails = false
}) => {
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'Frontend', status: 'connected', responseTime: 0, lastChecked: new Date() },
    { name: 'Backend API', status: 'checking', responseTime: 0, lastChecked: new Date() },
    { name: 'Database', status: 'checking', responseTime: 0, lastChecked: new Date() },
    { name: 'Consciousness Engine', status: 'checking', responseTime: 0, lastChecked: new Date() },
    { name: 'Authentication', status: 'checking', responseTime: 0, lastChecked: new Date() },
    { name: 'Entities API', status: 'checking', responseTime: 0, lastChecked: new Date() },
    { name: 'Events API', status: 'checking', responseTime: 0, lastChecked: new Date() },
  ]);

  const [isTesting, setIsTesting] = useState(true);
  const [overallStatus, setOverallStatus] = useState<'all-connected' | 'partial' | 'disconnected'>('disconnected');

  // ==================== SERVICE TESTS ====================

  const testBackendConnection = async (): Promise<ServiceStatus> => {
    const startTime = Date.now();
    try {
      const result = await checkConnection();
      const responseTime = Date.now() - startTime;

      return {
        name: 'Backend API',
        status: result.connected ? 'connected' : 'disconnected',
        responseTime,
        lastChecked: new Date(),
        error: result.connected ? undefined : result.error
      };
    } catch (error) {
      return {
        name: 'Backend API',
        status: 'error',
        responseTime: Date.now() - startTime,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const testDatabaseConnection = async (): Promise<ServiceStatus> => {
    const startTime = Date.now();
    try {
      const result = await databaseAPI.getHealth();
      const responseTime = Date.now() - startTime;

      return {
        name: 'Database',
        status: 'connected',
        responseTime,
        lastChecked: new Date()
      };
    } catch (error) {
      return {
        name: 'Database',
        status: 'disconnected',
        responseTime: Date.now() - startTime,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Database unavailable'
      };
    }
  };

  const testConsciousnessConnection = async (): Promise<ServiceStatus> => {
    const startTime = Date.now();
    try {
      const result = await consciousnessAPI.getStatus();
      const responseTime = Date.now() - startTime;

      return {
        name: 'Consciousness Engine',
        status: 'connected',
        responseTime,
        lastChecked: new Date()
      };
    } catch (error) {
      return {
        name: 'Consciousness Engine',
        status: 'disconnected',
        responseTime: Date.now() - startTime,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Consciousness engine unavailable'
      };
    }
  };

  const testAuthConnection = async (): Promise<ServiceStatus> => {
    const startTime = Date.now();
    try {
      // Test auth endpoint without requiring authentication
      const result = await systemAPI.getHealth();
      const responseTime = Date.now() - startTime;

      return {
        name: 'Authentication',
        status: 'connected',
        responseTime,
        lastChecked: new Date()
      };
    } catch (error) {
      return {
        name: 'Authentication',
        status: 'disconnected',
        responseTime: Date.now() - startTime,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Auth service unavailable'
      };
    }
  };

  const testEntitiesConnection = async (): Promise<ServiceStatus> => {
    const startTime = Date.now();
    try {
      const result = await entitiesAPI.list({ limit: 1 });
      const responseTime = Date.now() - startTime;

      return {
        name: 'Entities API',
        status: 'connected',
        responseTime,
        lastChecked: new Date()
      };
    } catch (error) {
      return {
        name: 'Entities API',
        status: 'disconnected',
        responseTime: Date.now() - startTime,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Entities API unavailable'
      };
    }
  };

  const testEventsConnection = async (): Promise<ServiceStatus> => {
    const startTime = Date.now();
    try {
      const result = await eventsAPI.list({ limit: 1 });
      const responseTime = Date.now() - startTime;

      return {
        name: 'Events API',
        status: 'connected',
        responseTime,
        lastChecked: new Date()
      };
    } catch (error) {
      return {
        name: 'Events API',
        status: 'disconnected',
        responseTime: Date.now() - startTime,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Events API unavailable'
      };
    }
  };

  // ==================== RUN ALL TESTS ====================

  const runAllTests = async () => {
    setIsTesting(true);

    const tests = [
      testBackendConnection,
      testDatabaseConnection,
      testConsciousnessConnection,
      testAuthConnection,
      testEntitiesConnection,
      testEventsConnection
    ];

    const results = await Promise.allSettled(tests.map(test => test()));

    const newServices = [...services];
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        newServices[index + 1] = result.value; // +1 because frontend is at index 0
      } else {
        newServices[index + 1] = {
          name: newServices[index + 1].name,
          status: 'error',
          responseTime: 0,
          lastChecked: new Date(),
          error: 'Test failed'
        };
      }
    });

    setServices(newServices);

    // Determine overall status
    const connectedCount = newServices.filter(s => s.status === 'connected').length;
    const totalCount = newServices.length;

    if (connectedCount === totalCount) {
      setOverallStatus('all-connected');
    } else if (connectedCount > 0) {
      setOverallStatus('partial');
    } else {
      setOverallStatus('disconnected');
    }

    setIsTesting(false);
    onComplete?.(connectedCount === totalCount);
  };

  // ==================== INITIAL TEST ====================

  useEffect(() => {
    runAllTests();
  }, []);

  // ==================== RENDER ====================

  const connectedServices = services.filter(s => s.status === 'connected').map(s => s.name);
  const disconnectedServices = services.filter(s => s.status !== 'connected').map(s => s.name);

  if (isTesting) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <ServiceLoadingState service="AI-BOS Services" />
      </div>
    );
  }

  if (overallStatus === 'disconnected') {
    return (
      <div className="flex items-center justify-center min-h-64">
        <NetworkErrorState onRetry={runAllTests} />
      </div>
    );
  }

  if (overallStatus === 'partial') {
    return (
      <div className="flex items-center justify-center min-h-64">
        <PartialConnectionState
          connectedServices={connectedServices}
          disconnectedServices={disconnectedServices}
          onRetry={runAllTests}
        />
      </div>
    );
  }

  if (overallStatus === 'all-connected') {
    return (
      <div className="space-y-6">
        <SuccessState
          title="All Services Connected"
          description="AI-BOS is fully operational and ready to serve."
        />

        {showDetails && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Service Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service, index) => (
                <motion.div
                  key={service.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-3 rounded-lg border ${
                    service.status === 'connected'
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                      : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {service.status === 'connected' ? (
                        <CheckCircle size={16} className="text-green-500" />
                      ) : (
                        <XCircle size={16} className="text-red-500" />
                      )}
                      <span className="font-medium">{service.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {service.responseTime}ms
                    </span>
                  </div>
                  {service.error && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      {service.error}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default ConnectivityTest;
