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
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  EyeOff,
  Search,
  Filter,
  Download,
  Upload,
  Play,
  Pause,
  Settings,
  BarChart3,
  Clock,
  Users,
  Server,
  Network,
  Lock,
  Unlock,
  FileText,
  Code,
  Package,
  Globe,
  Database,
  HardDrive,
  Cpu,
  Memory
} from 'lucide-react';

interface SecurityScan {
  id: string;
  moduleId: string;
  version: string;
  scanType: 'static' | 'dynamic' | 'behavioral' | 'dependency';
  status: 'pending' | 'scanning' | 'passed' | 'failed' | 'blocked';
  results: SecurityResult[];
  riskScore: number;
  scanDate: string;
  scanDuration: number;
}

interface SecurityResult {
  id: string;
  type: 'vulnerability' | 'malware' | 'suspicious_code' | 'dependency_issue' | 'permission_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: string;
  codeSnippet?: string;
  cveId?: string;
  confidence: number;
}

interface ContainerConfig {
  id: string;
  moduleId: string;
  version: string;
  containerType: 'docker' | 'firecracker' | 'gvisor';
  status: 'created' | 'running' | 'stopped' | 'failed';
  resources: {
    cpu: number;
    memory: number;
    storage: number;
  };
  security: {
    readOnly: boolean;
    noPrivileged: boolean;
    isolated: boolean;
  };
}

interface BundleAnalysis {
  id: string;
  moduleId: string;
  version: string;
  bundleSize: number;
  fileCount: number;
  dependencies: DependencyInfo[];
  suspiciousPatterns: SuspiciousPattern[];
  obfuscatedCode: boolean;
  minifiedCode: boolean;
  sourceMaps: boolean;
}

interface DependencyInfo {
  name: string;
  version: string;
  license: string;
  vulnerabilities: number;
  type: 'production' | 'development' | 'peer';
}

interface SuspiciousPattern {
  type: 'eval' | 'exec' | 'require' | 'import' | 'network' | 'file_system' | 'process';
  pattern: string;
  location: string;
  risk: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

interface QuarantineEntry {
  id: string;
  moduleId: string;
  version: string;
  reason: string;
  securityIssues: SecurityResult[];
  quarantineDate: string;
  status: 'quarantined' | 'reviewed' | 'approved' | 'rejected';
}

interface SecurityEvent {
  id: string;
  moduleId: string;
  version: string;
  eventType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: string;
}

export default function ThirdPartySecurityDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [securityScans, setSecurityScans] = useState<SecurityScan[]>([]);
  const [containers, setContainers] = useState<ContainerConfig[]>([]);
  const [bundleAnalyses, setBundleAnalyses] = useState<BundleAnalysis[]>([]);
  const [quarantinedModules, setQuarantinedModules] = useState<QuarantineEntry[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [showScanModal, setShowScanModal] = useState(false);
  const [showContainerModal, setShowContainerModal] = useState(false);
  const [showQuarantineModal, setShowQuarantineModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    const mockSecurityScans: SecurityScan[] = [
      {
        id: 'scan_1',
        moduleId: 'accounting',
        version: '1.0.0',
        scanType: 'static',
        status: 'passed',
        results: [],
        riskScore: 15,
        scanDate: '2024-01-15T10:00:00Z',
        scanDuration: 45
      },
      {
        id: 'scan_2',
        moduleId: 'suspicious-module',
        version: '2.1.0',
        scanType: 'static',
        status: 'blocked',
        results: [
          {
            id: 'result_1',
            type: 'suspicious_code',
            severity: 'critical',
            title: 'Eval usage detected',
            description: 'Found eval() function usage which is a security risk',
            location: 'bundle.js:45:12',
            codeSnippet: 'eval(userInput)',
            confidence: 95
          },
          {
            id: 'result_2',
            type: 'vulnerability',
            severity: 'high',
            title: 'Vulnerable dependency',
            description: 'lodash@4.17.15 has known vulnerabilities',
            location: 'package.json',
            cveId: 'CVE-2021-23337',
            confidence: 90
          }
        ],
        riskScore: 85,
        scanDate: '2024-01-15T14:30:00Z',
        scanDuration: 120
      }
    ];

    const mockContainers: ContainerConfig[] = [
      {
        id: 'container_1',
        moduleId: 'accounting',
        version: '1.0.0',
        containerType: 'docker',
        status: 'running',
        resources: { cpu: 0.5, memory: 512, storage: 1024 },
        security: { readOnly: true, noPrivileged: true, isolated: true }
      },
      {
        id: 'container_2',
        moduleId: 'tax',
        version: '2.1.0',
        containerType: 'firecracker',
        status: 'running',
        resources: { cpu: 1.0, memory: 1024, storage: 2048 },
        security: { readOnly: true, noPrivileged: true, isolated: true }
      }
    ];

    const mockBundleAnalyses: BundleAnalysis[] = [
      {
        id: 'analysis_1',
        moduleId: 'accounting',
        version: '1.0.0',
        bundleSize: 2048576, // 2MB
        fileCount: 1,
        dependencies: [
          { name: 'react', version: '18.2.0', license: 'MIT', vulnerabilities: 0, type: 'production' },
          { name: 'lodash', version: '4.17.21', license: 'MIT', vulnerabilities: 0, type: 'production' }
        ],
        suspiciousPatterns: [],
        obfuscatedCode: false,
        minifiedCode: true,
        sourceMaps: true
      },
      {
        id: 'analysis_2',
        moduleId: 'suspicious-module',
        version: '2.1.0',
        bundleSize: 1048576, // 1MB
        fileCount: 1,
        dependencies: [
          { name: 'lodash', version: '4.17.15', license: 'MIT', vulnerabilities: 2, type: 'production' }
        ],
        suspiciousPatterns: [
          {
            type: 'eval',
            pattern: 'eval\\s*\\(',
            location: 'bundle.js:45:12',
            risk: 'critical',
            description: 'Found eval() function usage'
          }
        ],
        obfuscatedCode: true,
        minifiedCode: true,
        sourceMaps: false
      }
    ];

    const mockQuarantinedModules: QuarantineEntry[] = [
      {
        id: 'quarantine_1',
        moduleId: 'suspicious-module',
        version: '2.1.0',
        reason: 'Critical security violations detected',
        securityIssues: [
          {
            id: 'issue_1',
            type: 'suspicious_code',
            severity: 'critical',
            title: 'Eval usage detected',
            description: 'Found eval() function usage which is a security risk',
            location: 'bundle.js:45:12',
            confidence: 95
          }
        ],
        quarantineDate: '2024-01-15T15:00:00Z',
        status: 'quarantined'
      }
    ];

    const mockSecurityEvents: SecurityEvent[] = [
      {
        id: 'event_1',
        moduleId: 'suspicious-module',
        version: '2.1.0',
        eventType: 'scan_completed',
        severity: 'critical',
        description: 'Security scan completed with critical violations',
        timestamp: '2024-01-15T14:30:00Z'
      },
      {
        id: 'event_2',
        moduleId: 'suspicious-module',
        version: '2.1.0',
        eventType: 'quarantine_triggered',
        severity: 'high',
        description: 'Module automatically quarantined',
        timestamp: '2024-01-15T15:00:00Z'
      }
    ];

    setSecurityScans(mockSecurityScans);
    setContainers(mockContainers);
    setBundleAnalyses(mockBundleAnalyses);
    setQuarantinedModules(mockQuarantinedModules);
    setSecurityEvents(mockSecurityEvents);
    setLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      case 'scanning': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getContainerStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800';
      case 'stopped': return 'bg-gray-100 text-gray-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-green-600';
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
          <h1 className="text-3xl font-bold text-gray-900">Third-Party Security</h1>
          <p className="text-gray-600">Secure management of external developer modules</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button className="flex items-center space-x-2">
            <Upload className="h-4 w-4" />
            <span>Upload Module</span>
          </Button>
          <Button className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Security Settings</span>
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Scans</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityScans.length}</div>
            <p className="text-xs text-muted-foreground">
              {securityScans.filter(s => s.status === 'passed').length} passed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Secure Containers</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{containers.length}</div>
            <p className="text-xs text-muted-foreground">
              {containers.filter(c => c.status === 'running').length} running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quarantined</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {quarantinedModules.filter(q => q.status === 'quarantined').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Requires review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bundle Analyses</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bundleAnalyses.length}</div>
            <p className="text-xs text-muted-foreground">
              {bundleAnalyses.filter(b => !b.obfuscatedCode).length} clean
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="scans">Security Scans</TabsTrigger>
          <TabsTrigger value="containers">Containers</TabsTrigger>
          <TabsTrigger value="bundles">Bundle Analysis</TabsTrigger>
          <TabsTrigger value="quarantine">Quarantine</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Security Scans */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Recent Security Scans</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {securityScans.slice(0, 5).map((scan) => (
                    <div key={scan.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{scan.moduleId}@{scan.version}</h4>
                        <Badge className={getStatusColor(scan.status)}>
                          {scan.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Risk: <span className={getRiskScoreColor(scan.riskScore)}>{scan.riskScore}/100</span></span>
                        <span>Type: {scan.scanType}</span>
                        <span>Duration: {scan.scanDuration}s</span>
                      </div>
                      {scan.results.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-red-600">
                            {scan.results.length} security issue(s) found
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Security Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Recent Security Events</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {securityEvents.slice(0, 5).map((event) => (
                    <div key={event.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                        event.severity === 'critical' ? 'text-red-600' :
                        event.severity === 'high' ? 'text-orange-600' :
                        event.severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{event.description}</p>
                        <p className="text-xs text-gray-500">
                          {event.moduleId}@{event.version}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(event.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <Badge className={getSeverityColor(event.severity)}>
                        {event.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Scans Tab */}
        <TabsContent value="scans" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security Scans</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Module</th>
                      <th className="text-left p-2">Version</th>
                      <th className="text-left p-2">Type</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Risk Score</th>
                      <th className="text-left p-2">Issues</th>
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {securityScans.map((scan) => (
                      <tr key={scan.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{scan.moduleId}</td>
                        <td className="p-2 text-sm">{scan.version}</td>
                        <td className="p-2 text-sm">{scan.scanType}</td>
                        <td className="p-2">
                          <Badge className={getStatusColor(scan.status)}>
                            {scan.status}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <span className={getRiskScoreColor(scan.riskScore)}>
                            {scan.riskScore}/100
                          </span>
                        </td>
                        <td className="p-2 text-sm">
                          {scan.results.length}
                        </td>
                        <td className="p-2 text-sm">
                          {new Date(scan.scanDate).toLocaleDateString()}
                        </td>
                        <td className="p-2">
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              View
                            </Button>
                            <Button size="sm" variant="outline">
                              Rescan
                            </Button>
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

        {/* Containers Tab */}
        <TabsContent value="containers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Server className="h-5 w-5" />
                <span>Secure Containers</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {containers.map((container) => (
                  <div key={container.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{container.moduleId}@{container.version}</h4>
                      <Badge className={getContainerStatusColor(container.status)}>
                        {container.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Cpu className="h-4 w-4 text-blue-600" />
                        <span>CPU: {container.resources.cpu} cores</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Memory className="h-4 w-4 text-green-600" />
                        <span>Memory: {container.resources.memory} MB</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <HardDrive className="h-4 w-4 text-purple-600" />
                        <span>Storage: {container.resources.storage} MB</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Lock className="h-4 w-4 text-orange-600" />
                        <span>Type: {container.containerType}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex space-x-2">
                      <Button size="sm" variant="outline">
                        View Logs
                      </Button>
                      <Button size="sm" variant="outline">
                        Stop
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bundle Analysis Tab */}
        <TabsContent value="bundles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Bundle Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bundleAnalyses.map((analysis) => (
                  <div key={analysis.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{analysis.moduleId}@{analysis.version}</h4>
                      <div className="flex space-x-2">
                        {analysis.obfuscatedCode && (
                          <Badge className="bg-red-100 text-red-800">Obfuscated</Badge>
                        )}
                        {analysis.minifiedCode && (
                          <Badge className="bg-blue-100 text-blue-800">Minified</Badge>
                        )}
                        {analysis.sourceMaps && (
                          <Badge className="bg-green-100 text-green-800">Source Maps</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Bundle Size:</span>
                        <br />
                        <span>{(analysis.bundleSize / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                      <div>
                        <span className="font-medium">Dependencies:</span>
                        <br />
                        <span>{analysis.dependencies.length}</span>
                      </div>
                      <div>
                        <span className="font-medium">Suspicious Patterns:</span>
                        <br />
                        <span className="text-red-600">{analysis.suspiciousPatterns.length}</span>
                      </div>
                      <div>
                        <span className="font-medium">Vulnerabilities:</span>
                        <br />
                        <span className="text-red-600">
                          {analysis.dependencies.reduce((sum, dep) => sum + dep.vulnerabilities, 0)}
                        </span>
                      </div>
                    </div>

                    {analysis.suspiciousPatterns.length > 0 && (
                      <div className="mt-4">
                        <h5 className="font-medium text-red-600 mb-2">Suspicious Patterns:</h5>
                        {analysis.suspiciousPatterns.map((pattern, index) => (
                          <div key={index} className="text-sm text-gray-600 mb-1">
                            • {pattern.type}: {pattern.description}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quarantine Tab */}
        <TabsContent value="quarantine" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Quarantined Modules</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quarantinedModules.map((quarantine) => (
                  <div key={quarantine.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold">{quarantine.moduleId}@{quarantine.version}</h4>
                        <p className="text-sm text-gray-600 mt-1">{quarantine.reason}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Quarantined: {new Date(quarantine.quarantineDate).toLocaleString()}
                        </p>
                        
                        {quarantine.securityIssues.length > 0 && (
                          <div className="mt-3">
                            <h5 className="font-medium text-red-600 mb-2">Security Issues:</h5>
                            {quarantine.securityIssues.map((issue, index) => (
                              <div key={index} className="text-sm text-gray-600 mb-1">
                                • {issue.title}: {issue.description}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-red-100 text-red-800">
                          {quarantine.status}
                        </Badge>
                        <Button size="sm" variant="outline">
                          Review
                        </Button>
                        <Button size="sm" variant="outline">
                          Approve
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Security Events</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityEvents.map((event) => (
                  <div key={event.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                      event.severity === 'critical' ? 'text-red-600' :
                      event.severity === 'high' ? 'text-orange-600' :
                      event.severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{event.description}</p>
                      <p className="text-xs text-gray-500">
                        {event.moduleId}@{event.version} • {event.eventType}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(event.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Badge className={getSeverityColor(event.severity)}>
                      {event.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      
      {/* Scan Modal */}
      <Modal
        isOpen={showScanModal}
        onClose={() => setShowScanModal(false)}
        title="Security Scan"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Module ID</label>
            <Input placeholder="Enter module ID" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Version</label>
            <Input placeholder="Enter version" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Bundle Path</label>
            <Input placeholder="Path to bundle file" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Scan Types</label>
            <Select>
              <option value="static">Static Analysis</option>
              <option value="dependency">Dependency Analysis</option>
              <option value="behavioral">Behavioral Analysis</option>
              <option value="dynamic">Dynamic Analysis</option>
            </Select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowScanModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowScanModal(false)}>
              Start Scan
            </Button>
          </div>
        </div>
      </Modal>

      {/* Container Modal */}
      <Modal
        isOpen={showContainerModal}
        onClose={() => setShowContainerModal(false)}
        title="Create Secure Container"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Module ID</label>
            <Input placeholder="Enter module ID" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Version</label>
            <Input placeholder="Enter version" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Container Type</label>
            <Select>
              <option value="docker">Docker</option>
              <option value="firecracker">Firecracker</option>
              <option value="gvisor">gVisor</option>
            </Select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowContainerModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowContainerModal(false)}>
              Create Container
            </Button>
          </div>
        </div>
      </Modal>

      {/* Quarantine Modal */}
      <Modal
        isOpen={showQuarantineModal}
        onClose={() => setShowQuarantineModal(false)}
        title="Quarantine Module"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Module ID</label>
            <Input placeholder="Enter module ID" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Version</label>
            <Input placeholder="Enter version" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Reason</label>
            <Input placeholder="Enter quarantine reason" />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowQuarantineModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => setShowQuarantineModal(false)}>
              Quarantine
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
} 