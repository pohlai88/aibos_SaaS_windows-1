'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/LuxuryTabs';
import { Modal } from '@/components/ui/LuxuryModal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/LuxurySelect';
import { 
  Activity, 
  Cpu, 
  Memory, 
  HardDrive, 
  Globe, 
  Database, 
  AlertTriangle, 
  Play, 
  Pause, 
  Settings,
  TrendingUp,
  TrendingDown,
  Zap,
  Shield,
  Gauge,
  BarChart3,
  Clock,
  Users,
  Server,
  Network
} from 'lucide-react';

interface PerformanceMetrics {
  moduleId: string;
  tenantId: string;
  version: string;
  timestamp: string;
  metrics: {
    cpu: {
      usage: number;
      load: number;
      throttled: boolean;
    };
    memory: {
      used: number;
      peak: number;
      limit: number;
      exceeded: boolean;
    };
    api: {
      requestsPerSecond: number;
      requestsPerMinute: number;
      requestsPerHour: number;
      throttled: boolean;
      responseTime: number;
    };
    database: {
      connections: number;
      activeQueries: number;
      slowQueries: number;
      throttled: boolean;
    };
    storage: {
      used: number;
      files: number;
      exceeded: boolean;
    };
  };
  violations: PerformanceViolation[];
  status: 'normal' | 'warning' | 'critical' | 'throttled' | 'suspended';
}

interface PerformanceViolation {
  id: string;
  type: 'cpu' | 'memory' | 'api' | 'database' | 'storage';
  severity: 'warning' | 'critical' | 'blocking';
  message: string;
  timestamp: string;
  value: number;
  limit: number;
  action: 'throttled' | 'suspended' | 'alerted' | 'none';
}

interface SandboxConfig {
  id: string;
  moduleId: string;
  tenantId: string;
  version: string;
  isolationLevel: 'light' | 'medium' | 'strict' | 'custom';
  status: 'active' | 'suspended' | 'throttled' | 'scaling';
  resourceLimits: any;
  createdAt: string;
}

interface PerformanceAlert {
  id: string;
  moduleId: string;
  tenantId: string;
  type: 'warning' | 'critical' | 'blocking';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  resolved: boolean;
}

interface ThrottlingEvent {
  id: string;
  sandboxId: string;
  type: 'cpu' | 'memory' | 'api' | 'database' | 'storage';
  level: 'light' | 'medium' | 'strict';
  reason: string;
  startedAt: string;
  active: boolean;
}

export default function PerformanceIsolationDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sandboxes, setSandboxes] = useState<SandboxConfig[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [throttlingEvents, setThrottlingEvents] = useState<ThrottlingEvent[]>([]);
  const [selectedSandbox, setSelectedSandbox] = useState<SandboxConfig | null>(null);
  const [showThrottleModal, setShowThrottleModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showLimitsModal, setShowLimitsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [realTimeMode, setRealTimeMode] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockSandboxes: SandboxConfig[] = [
      {
        id: 'sandbox_accounting_tenant1_1.0.0',
        moduleId: 'accounting',
        tenantId: 'tenant1',
        version: '1.0.0',
        isolationLevel: 'medium',
        status: 'active',
        resourceLimits: {
          cpu: { maxUsage: 30, burstLimit: 60, throttleThreshold: 25 },
          memory: { maxUsage: 256, softLimit: 128, hardLimit: 512 },
          api: { requestsPerSecond: 50, requestsPerMinute: 2500, requestsPerHour: 50000 }
        },
        createdAt: '2024-01-15T10:00:00Z'
      },
      {
        id: 'sandbox_tax_tenant1_2.1.0',
        moduleId: 'tax',
        tenantId: 'tenant1',
        version: '2.1.0',
        isolationLevel: 'strict',
        status: 'throttled',
        resourceLimits: {
          cpu: { maxUsage: 15, burstLimit: 30, throttleThreshold: 12 },
          memory: { maxUsage: 128, softLimit: 64, hardLimit: 256 },
          api: { requestsPerSecond: 20, requestsPerMinute: 1000, requestsPerHour: 20000 }
        },
        createdAt: '2024-01-10T14:30:00Z'
      },
      {
        id: 'sandbox_crm_tenant2_1.5.0',
        moduleId: 'crm',
        tenantId: 'tenant2',
        version: '1.5.0',
        isolationLevel: 'light',
        status: 'suspended',
        resourceLimits: {
          cpu: { maxUsage: 50, burstLimit: 80, throttleThreshold: 40 },
          memory: { maxUsage: 512, softLimit: 256, hardLimit: 1024 },
          api: { requestsPerSecond: 100, requestsPerMinute: 5000, requestsPerHour: 100000 }
        },
        createdAt: '2024-01-12T09:15:00Z'
      }
    ];

    const mockMetrics: PerformanceMetrics[] = [
      {
        moduleId: 'accounting',
        tenantId: 'tenant1',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        metrics: {
          cpu: { usage: 25.5, load: 1.2, throttled: false },
          memory: { used: 180, peak: 220, limit: 256, exceeded: false },
          api: { requestsPerSecond: 35, requestsPerMinute: 1800, requestsPerHour: 45000, throttled: false, responseTime: 120 },
          database: { connections: 3, activeQueries: 1, slowQueries: 0, throttled: false },
          storage: { used: 320, files: 450, exceeded: false }
        },
        violations: [],
        status: 'normal'
      },
      {
        moduleId: 'tax',
        tenantId: 'tenant1',
        version: '2.1.0',
        timestamp: new Date().toISOString(),
        metrics: {
          cpu: { usage: 85.2, load: 3.8, throttled: true },
          memory: { used: 240, peak: 280, limit: 128, exceeded: true },
          api: { requestsPerSecond: 25, requestsPerMinute: 1200, requestsPerHour: 25000, throttled: true, responseTime: 450 },
          database: { connections: 8, activeQueries: 5, slowQueries: 2, throttled: true },
          storage: { used: 180, files: 280, exceeded: false }
        },
        violations: [
          {
            id: 'violation_1',
            type: 'cpu',
            severity: 'critical',
            message: 'CPU usage 85.2% exceeds limit 15%',
            timestamp: new Date().toISOString(),
            value: 85.2,
            limit: 15,
            action: 'throttled'
          },
          {
            id: 'violation_2',
            type: 'memory',
            severity: 'critical',
            message: 'Memory usage 240MB exceeds limit 128MB',
            timestamp: new Date().toISOString(),
            value: 240,
            limit: 128,
            action: 'suspended'
          }
        ],
        status: 'critical'
      }
    ];

    const mockAlerts: PerformanceAlert[] = [
      {
        id: 'alert_1',
        moduleId: 'tax',
        tenantId: 'tenant1',
        type: 'critical',
        message: 'Tax module CPU usage exceeded 80% threshold',
        timestamp: '2024-01-15T14:30:00Z',
        acknowledged: false,
        resolved: false
      },
      {
        id: 'alert_2',
        moduleId: 'crm',
        tenantId: 'tenant2',
        type: 'blocking',
        message: 'CRM module suspended due to memory violation',
        timestamp: '2024-01-15T13:45:00Z',
        acknowledged: true,
        resolved: false
      }
    ];

    const mockThrottlingEvents: ThrottlingEvent[] = [
      {
        id: 'throttle_1',
        sandboxId: 'sandbox_tax_tenant1_2.1.0',
        type: 'cpu',
        level: 'strict',
        reason: 'CPU usage exceeded 80% threshold',
        startedAt: '2024-01-15T14:30:00Z',
        active: true
      },
      {
        id: 'throttle_2',
        sandboxId: 'sandbox_tax_tenant1_2.1.0',
        type: 'api',
        level: 'medium',
        reason: 'API requests exceeded rate limit',
        startedAt: '2024-01-15T14:25:00Z',
        active: true
      }
    ];

    setSandboxes(mockSandboxes);
    setMetrics(mockMetrics);
    setAlerts(mockAlerts);
    setThrottlingEvents(mockThrottlingEvents);
    setLoading(false);
  }, []);

  // Real-time updates
  useEffect(() => {
    if (!realTimeMode) return;

    const interval = setInterval(() => {
      // Simulate real-time updates
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        timestamp: new Date().toISOString(),
        metrics: {
          ...metric.metrics,
          cpu: {
            ...metric.metrics.cpu,
            usage: Math.random() * 100,
            throttled: Math.random() > 0.7
          },
          api: {
            ...metric.metrics.api,
            requestsPerSecond: Math.floor(Math.random() * 100),
            throttled: Math.random() > 0.8
          }
        }
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, [realTimeMode]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'throttled': return 'bg-yellow-100 text-yellow-800';
      case 'scaling': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'blocking': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getIsolationLevelColor = (level: string) => {
    switch (level) {
      case 'light': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'strict': return 'bg-orange-100 text-orange-800';
      case 'custom': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleThrottle = async (sandboxId: string, type: string, level: string) => {
    // Implementation for throttling
    console.log(`Throttling ${sandboxId} - ${type} at ${level} level`);
    setShowThrottleModal(false);
  };

  const handleSuspend = async (sandboxId: string, reason: string) => {
    // Implementation for suspension
    console.log(`Suspending ${sandboxId} - ${reason}`);
    setShowSuspendModal(false);
  };

  const handleUpdateLimits = async (sandboxId: string, limits: any) => {
    // Implementation for updating limits
    console.log(`Updating limits for ${sandboxId}`, limits);
    setShowLimitsModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Performance Isolation</h1>
          <p className="text-gray-600">Monitor and manage module resource usage and isolation</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant={realTimeMode ? "default" : "outline"}
            onClick={() => setRealTimeMode(!realTimeMode)}
            className="flex items-center space-x-2"
          >
            <Activity className="h-4 w-4" />
            <span>{realTimeMode ? 'Stop' : 'Start'} Real-time</span>
          </Button>
          <Button className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sandboxes</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sandboxes.length}</div>
            <p className="text-xs text-muted-foreground">
              {sandboxes.filter(s => s.status === 'active').length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {alerts.filter(a => !a.resolved).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {alerts.filter(a => a.severity === 'critical').length} critical
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Throttled Modules</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {throttlingEvents.filter(t => t.active).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {throttlingEvents.filter(t => t.level === 'strict').length} strict level
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspended Modules</CardTitle>
            <Pause className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {sandboxes.filter(s => s.status === 'suspended').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Requires manual intervention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sandboxes">Sandboxes</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="throttling">Throttling</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Gauge className="h-5 w-5" />
                  <span>Current Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {metrics.map((metric) => (
                  <div key={metric.moduleId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{metric.moduleId}</h4>
                      <Badge className={getStatusColor(metric.status)}>
                        {metric.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Cpu className="h-4 w-4 text-blue-600" />
                        <span>CPU: {metric.metrics.cpu.usage.toFixed(1)}%</span>
                        {metric.metrics.cpu.throttled && (
                          <Badge variant="destructive" className="text-xs">Throttled</Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Memory className="h-4 w-4 text-green-600" />
                        <span>Memory: {metric.metrics.memory.used}MB</span>
                        {metric.metrics.memory.exceeded && (
                          <Badge variant="destructive" className="text-xs">Exceeded</Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-purple-600" />
                        <span>API: {metric.metrics.api.requestsPerSecond}/s</span>
                        {metric.metrics.api.throttled && (
                          <Badge variant="destructive" className="text-xs">Throttled</Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Database className="h-4 w-4 text-orange-600" />
                        <span>DB: {metric.metrics.database.connections} conn</span>
                        {metric.metrics.database.throttled && (
                          <Badge variant="destructive" className="text-xs">Throttled</Badge>
                        )}
                      </div>
                    </div>

                    {metric.violations.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-red-600 font-medium">
                          {metric.violations.length} violation(s)
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                        alert.type === 'critical' ? 'text-red-600' :
                        alert.type === 'warning' ? 'text-yellow-600' : 'text-purple-600'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{alert.message}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <Badge className={getSeverityColor(alert.type)}>
                        {alert.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sandboxes Tab */}
        <TabsContent value="sandboxes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Module Sandboxes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Module</th>
                      <th className="text-left p-2">Tenant</th>
                      <th className="text-left p-2">Version</th>
                      <th className="text-left p-2">Level</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Created</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sandboxes.map((sandbox) => (
                      <tr key={sandbox.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{sandbox.moduleId}</td>
                        <td className="p-2 text-sm">{sandbox.tenantId}</td>
                        <td className="p-2 text-sm">{sandbox.version}</td>
                        <td className="p-2">
                          <Badge className={getIsolationLevelColor(sandbox.isolationLevel)}>
                            {sandbox.isolationLevel}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <Badge className={getStatusColor(sandbox.status)}>
                            {sandbox.status}
                          </Badge>
                        </td>
                        <td className="p-2 text-sm">
                          {new Date(sandbox.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-2">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedSandbox(sandbox)}
                            >
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedSandbox(sandbox);
                                setShowThrottleModal(true);
                              }}
                            >
                              Throttle
                            </Button>
                            {sandbox.status === 'active' ? (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setSelectedSandbox(sandbox);
                                  setShowSuspendModal(true);
                                }}
                              >
                                Suspend
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => {
                                  // Resume logic
                                }}
                              >
                                Resume
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Performance Alerts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                          alert.type === 'critical' ? 'text-red-600' :
                          alert.type === 'warning' ? 'text-yellow-600' : 'text-purple-600'
                        }`} />
                        <div>
                          <h4 className="font-medium">{alert.message}</h4>
                          <p className="text-sm text-gray-500">
                            Module: {alert.moduleId} | Tenant: {alert.tenantId}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getSeverityColor(alert.type)}>
                          {alert.type}
                        </Badge>
                        {!alert.acknowledged && (
                          <Button size="sm" variant="outline">
                            Acknowledge
                          </Button>
                        )}
                        {alert.acknowledged && !alert.resolved && (
                          <Button size="sm" variant="default">
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Throttling Tab */}
        <TabsContent value="throttling" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Active Throttling Events</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {throttlingEvents.filter(t => t.active).map((event) => (
                  <div key={event.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Zap className="h-5 w-5 text-yellow-600" />
                        <div>
                          <h4 className="font-medium">
                            {event.type.toUpperCase()} Throttling - {event.level} level
                          </h4>
                          <p className="text-sm text-gray-500">{event.reason}</p>
                          <p className="text-sm text-gray-500">
                            Started: {new Date(event.startedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-yellow-100 text-yellow-800">
                          {event.level}
                        </Badge>
                        <Button size="sm" variant="outline">
                          End Throttling
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Resource Usage Trends</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Chart placeholder - Resource usage over time
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Performance Violations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Chart placeholder - Violation frequency by type
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      
      {/* Throttle Modal */}
      <Modal
        isOpen={showThrottleModal}
        onClose={() => setShowThrottleModal(false)}
        title="Apply Throttling"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Resource Type</label>
            <Select>
              <option value="cpu">CPU Usage</option>
              <option value="memory">Memory Usage</option>
              <option value="api">API Requests</option>
              <option value="database">Database Connections</option>
              <option value="storage">Storage Usage</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Throttle Level</label>
            <Select>
              <option value="light">Light - Reduce by 20%</option>
              <option value="medium">Medium - Reduce by 50%</option>
              <option value="strict">Strict - Reduce by 80%</option>
            </Select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowThrottleModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleThrottle(selectedSandbox?.id || '', 'cpu', 'medium')}>
              Apply Throttling
            </Button>
          </div>
        </div>
      </Modal>

      {/* Suspend Modal */}
      <Modal
        isOpen={showSuspendModal}
        onClose={() => setShowSuspendModal(false)}
        title="Suspend Module"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Suspension Reason</label>
            <Input placeholder="Enter reason for suspension" />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowSuspendModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => handleSuspend(selectedSandbox?.id || '', 'Performance violation')}>
              Suspend Module
            </Button>
          </div>
        </div>
      </Modal>

      {/* Limits Modal */}
      <Modal
        isOpen={showLimitsModal}
        onClose={() => setShowLimitsModal(false)}
        title="Update Resource Limits"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">CPU Max Usage (%)</label>
            <Input type="number" placeholder="30" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Memory Max Usage (MB)</label>
            <Input type="number" placeholder="256" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">API Requests per Second</label>
            <Input type="number" placeholder="50" />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowLimitsModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleUpdateLimits(selectedSandbox?.id || '', {})}>
              Update Limits
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
} 