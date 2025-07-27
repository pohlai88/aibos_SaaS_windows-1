'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import {
  Terminal, Sparkles, FolderOpen, Settings, Move, ZoomIn, ZoomOut, RotateCcw,
  Grid, Layers, Monitor, Smartphone, Tablet, Globe, Zap, Brain, Eye, Heart, Wifi,
  FileText, Calculator, Clock, Cloud, Code, Shield, CreditCard, BarChart3, Users, MessageSquare, Activity,
  Workflow, Box, Cpu, Network, Atom, Scale, Link, Mic
} from 'lucide-react';
import TopBar from './TopBar';
import Dock from './Dock';
import WindowManager, { DesktopWindow } from './WindowManager';
import { useConsciousness } from '../consciousness/ConsciousnessEngine';
import { useAIBOSStore, useUser, useNotifications, AppWindow } from '@/lib/store';
import { useAuth } from '@/components/auth/AuthProvider';
import TerminalApp from '../apps/TerminalApp';
import AhaMachineApp from '../apps/AhaMachineApp';
import FileSystemApp from '../apps/FileSystemApp';
import FileManagerApp from '../apps/FileManagerApp';
import APIExplorerApp from '../apps/APIExplorerApp';
import NotesApp from '../apps/NotesApp';
import CalculatorApp from '../apps/CalculatorApp';
import ClockApp from '../apps/ClockApp';
import WeatherApp from '../apps/WeatherApp';
import AIBuilderApp from '../apps/AIBuilderApp';
import AICreationHub from '../apps/AICreationHub';
import AIEnginesHub from '../apps/AIEnginesHub';
import MultiModalAIFusionDashboard from '../apps/MultiModalAIFusionDashboard';
import AdvancedAIOrchestrationDashboard from '../apps/AdvancedAIOrchestrationDashboard';
import QuantumConsciousnessDashboard from '../apps/QuantumConsciousnessDashboard';
import AdvancedSecurityComplianceDashboard from '../apps/AdvancedSecurityComplianceDashboard';
import ScalabilityOptimizationsDashboard from '../apps/ScalabilityOptimizationsDashboard';
import AdvancedAnalyticsInsightsDashboard from '../apps/AdvancedAnalyticsInsightsDashboard';
import AIWorkflowAutomationDashboard from '../apps/AIWorkflowAutomationDashboard';
// Removed duplicate import - using the one from collaboration-advanced
import CustomAIModelTrainingDashboard from '../apps/CustomAIModelTrainingDashboard';
import BlockchainIntegrationDashboard from '../apps/BlockchainIntegrationDashboard';
import IoTDeviceManagementDashboard from '../apps/IoTDeviceManagementDashboard';
import AdvancedVoiceSpeechDashboard from '../apps/AdvancedVoiceSpeechDashboard';
import ARVRIntegrationDashboard from '../apps/ARVRIntegrationDashboard';
import EdgeComputingIntegrationDashboard from '../apps/EdgeComputingIntegrationDashboard';
import Network5GIntegrationDashboard from '../apps/Network5GIntegrationDashboard';
import DigitalTwinIntegrationDashboard from '../apps/DigitalTwinIntegrationDashboard';
import FederatedLearningIntegrationDashboard from '../apps/FederatedLearningIntegrationDashboard';
import QuantumComputingIntegrationDashboard from '../apps/QuantumComputingIntegrationDashboard';
import AdvancedCybersecurityIntegrationDashboard from '../apps/AdvancedCybersecurityIntegrationDashboard';
import WorkspaceManager from './WorkspaceManager';
import ConsciousnessDashboard from './ConsciousnessDashboard';
import ConnectivityStatus from '../connectivity/ConnectivityStatus';
import ConnectivityApp from '../apps/ConnectivityApp';
import { SecurityDashboard } from '../security';
import { BillingDashboard } from '../billing';
import { AnalyticsDashboard } from '../analytics';
import { UserManagementDashboard } from '../users';
import { CollaborationDashboard } from '../collaboration';
import { AIOptimizationDashboard } from '../ai-optimization';
import { MonitoringDashboard } from '../monitoring';
import { TeamManagementDashboard } from '../teams';
import { RealtimeDashboard } from '../realtime';
import { AdvancedSecurityDashboard } from '../security-advanced';
import { WorkflowAutomationDashboard } from '../workflow-automation';
import { AdvancedCollaborationDashboard } from '../collaboration-advanced';

// ==================== TYPES ====================

export interface DockItem {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  isActive: boolean;
  bounce: boolean;
  category: 'system' | 'consciousness' | 'workspace' | 'enterprise';
}

interface VirtualDesktopState {
  scale: number;
  position: { x: number; y: number };
  isDragging: boolean;
}

interface Workspace {
  id: string;
  name: string;
  windows: string[]; // Store window IDs instead of DesktopWindow objects
  consciousness: number;
  createdAt: Date;
}

// ==================== CONSTANTS ====================

const DOCK_ITEMS: DockItem[] = [
  // System Apps
  {
    id: 'terminal',
    name: 'Terminal',
    icon: Terminal,
    description: 'Command the universe',
    isActive: false,
    bounce: false,
    category: 'system'
  },
  {
    id: 'file-system',
    name: 'File System',
    icon: FolderOpen,
    description: 'Spatial documents',
    isActive: false,
    bounce: false,
    category: 'system'
  },
  {
    id: 'file-manager',
    name: 'File Manager',
    icon: FolderOpen,
    description: 'File management',
    isActive: false,
    bounce: false,
    category: 'system'
  },
  {
    id: 'api-explorer',
    name: 'API Explorer',
    icon: Code,
    description: 'API testing & docs',
    isActive: false,
    bounce: false,
    category: 'system'
  },
  {
    id: 'notes',
    name: 'Notes',
    icon: FileText,
    description: 'Capture thoughts',
    isActive: false,
    bounce: false,
    category: 'system'
  },
  {
    id: 'calculator',
    name: 'Calculator',
    icon: Calculator,
    description: 'AI-powered math',
    isActive: false,
    bounce: false,
    category: 'system'
  },
  {
    id: 'clock',
    name: 'Clock',
    icon: Clock,
    description: 'Time management',
    isActive: false,
    bounce: false,
    category: 'system'
  },
  {
    id: 'weather',
    name: 'Weather',
    icon: Cloud,
    description: 'Weather forecast',
    isActive: false,
    bounce: false,
    category: 'system'
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: Settings,
    description: 'System preferences',
    isActive: false,
    bounce: false,
    category: 'system'
  },
  // Consciousness Apps
  {
    id: 'aha-machine',
    name: 'Aha Machine',
    icon: Sparkles,
    description: 'AI consciousness',
    isActive: false,
    bounce: false,
    category: 'consciousness'
  },
        {
        id: 'ai-builder',
        name: 'AI Builder',
        icon: Code,
        description: 'Natural language → Working apps',
        isActive: false,
        bounce: false,
        category: 'consciousness'
      },
      {
        id: 'ai-creation-hub',
        name: 'AI Creation Hub',
        icon: Layers,
        description: 'Complete AI creation workflow',
        isActive: false,
        bounce: false,
        category: 'consciousness'
      },
      {
        id: 'ai-engines-hub',
        name: 'AI Engines Hub',
        icon: Cpu,
        description: 'Advanced AI processing engines',
        isActive: false,
        bounce: false,
        category: 'consciousness'
      },
            {
        id: 'multi-modal-ai-fusion',
        name: 'Multi-Modal AI Fusion',
        icon: Brain,
        description: 'Unified AI intelligence across modalities',
        isActive: false,
        bounce: false,
        category: 'consciousness'
      },
      {
        id: 'advanced-ai-orchestration',
        name: 'Advanced AI Orchestration',
        icon: Network,
        description: 'Autonomous AI orchestration and coordination',
        isActive: false,
        bounce: false,
        category: 'consciousness'
      },
      {
        id: 'quantum-consciousness',
        name: 'Quantum Consciousness',
        icon: Atom,
        description: 'Quantum computing integration with consciousness',
        isActive: false,
        bounce: false,
        category: 'consciousness'
      },
      {
        id: 'advanced-security-compliance',
        name: 'Security & Compliance',
        icon: Shield,
        description: 'Enterprise-grade security and compliance management',
        isActive: false,
        bounce: false,
        category: 'enterprise'
      },
      {
        id: 'scalability-optimizations',
        name: 'Scalability Optimizations',
        icon: Scale,
        description: 'Enterprise-scale deployment optimization',
        isActive: false,
        bounce: false,
        category: 'enterprise'
      },
      {
        id: 'advanced-analytics-insights',
        name: 'Advanced Analytics & Insights',
        icon: BarChart3,
        description: 'Enterprise-grade analytics and business intelligence',
        isActive: false,
        bounce: false,
        category: 'enterprise'
      },
      {
        id: 'ai-workflow-automation',
        name: 'AI Workflow Automation',
        icon: Workflow,
        description: 'Intelligent process automation with AI',
        isActive: false,
        bounce: false,
        category: 'enterprise'
      },
      {
        id: 'advanced-collaboration',
        name: 'Advanced Collaboration',
        icon: Users,
        description: 'Real-time collaborative AI features',
        isActive: false,
        bounce: false,
        category: 'enterprise'
      },
      {
        id: 'custom-ai-model-training',
        name: 'Custom AI Model Training',
        icon: Brain,
        description: 'Create and train custom AI models',
        isActive: false,
        bounce: false,
        category: 'enterprise'
      },
      {
        id: 'blockchain-integration',
        name: 'Blockchain Integration',
        icon: Link,
        description: 'Decentralized AI governance and operations',
        isActive: false,
        bounce: false,
        category: 'enterprise'
      },
      {
        id: 'iot-device-management',
        name: 'IoT Device Management',
        icon: Cpu,
        description: 'Connected device intelligence and edge computing',
        isActive: false,
        bounce: false,
        category: 'enterprise'
      },
      {
        id: 'advanced-voice-speech',
        name: 'Advanced Voice & Speech',
        icon: Mic,
        description: 'Natural language processing and voice-controlled AI',
        isActive: false,
        bounce: false,
        category: 'enterprise'
      },
      {
        id: 'ar-vr-integration',
        name: 'AR/VR Integration',
        icon: Eye,
        description: 'Immersive AI experiences and virtual reality',
        isActive: false,
        bounce: false,
        category: 'enterprise'
      },
      {
        id: 'edge-computing-integration',
        name: 'Edge Computing Integration',
        icon: Cpu,
        description: 'Distributed AI processing and edge intelligence',
        isActive: false,
        bounce: false,
        category: 'enterprise'
      },
      {
        id: '5g-network-integration',
        name: '5G Network Integration',
        icon: Wifi,
        description: 'Ultra-high-speed connectivity and network optimization',
        isActive: false,
        bounce: false,
        category: 'enterprise'
      },
      {
        id: 'digital-twin-integration',
        name: 'Digital Twin Integration',
        icon: Box,
        description: 'Virtual representations of physical systems',
        isActive: false,
        bounce: false,
        category: 'enterprise'
      },
      {
        id: 'federated-learning-integration',
        name: 'Federated Learning Integration',
        icon: Network,
        description: 'Distributed AI training across multiple devices',
        isActive: false,
        bounce: false,
        category: 'enterprise'
      },
      {
        id: 'quantum-computing-integration',
        name: 'Quantum Computing Integration',
        icon: Atom,
        description: 'Advanced quantum systems and AI-enhanced computing',
        isActive: false,
        bounce: false,
        category: 'enterprise'
      },
      {
        id: 'advanced-cybersecurity-integration',
        name: 'Advanced Cybersecurity Integration',
        icon: Shield,
        description: 'AI-powered threat detection and quantum-resistant security',
        isActive: false,
        bounce: false,
        category: 'enterprise'
      },
      // Enterprise Apps
  {
    id: 'security-dashboard',
    name: 'Security',
    icon: Shield,
    description: 'Security monitoring',
    isActive: false,
    bounce: false,
    category: 'system'
  },
  {
    id: 'billing-dashboard',
    name: 'Billing',
    icon: CreditCard,
    description: 'Revenue management',
    isActive: false,
    bounce: false,
    category: 'system'
  },
  {
    id: 'analytics-dashboard',
    name: 'Analytics',
    icon: BarChart3,
    description: 'Analytics & insights',
    isActive: false,
    bounce: false,
    category: 'system'
  },
  {
    id: 'user-management',
    name: 'Users',
    icon: Users,
    description: 'User & team management',
    isActive: false,
    bounce: false,
    category: 'system'
  },
  {
    id: 'collaboration-hub',
    name: 'Collaboration',
    icon: MessageSquare,
    description: 'Real-time messaging & collaboration',
    isActive: false,
    bounce: false,
    category: 'system'
  },
  {
    id: 'ai-optimization',
    name: 'AI Optimization',
    icon: Brain,
    description: 'AI-powered performance & accessibility',
    isActive: false,
    bounce: false,
    category: 'system'
  },
  {
    id: 'monitoring',
    name: 'Monitoring',
    icon: Activity,
    description: 'System health & performance monitoring',
    isActive: false,
    bounce: false,
    category: 'system'
  },
  {
    id: 'team-management',
    name: 'Team Management',
    icon: Users,
    description: 'Team creation & member management',
    isActive: false,
    bounce: false,
    category: 'system'
  },
  {
    id: 'realtime',
    name: 'Real-time',
    icon: Globe,
    description: 'Live messaging & collaboration',
    isActive: false,
    bounce: false,
    category: 'system'
  },
  {
    id: 'analytics',
    name: 'Analytics',
    icon: BarChart3,
    description: 'Data insights & reporting',
    isActive: false,
    bounce: false,
    category: 'system'
  },
  {
    id: 'advanced-security',
    name: 'Advanced Security',
    icon: Shield,
    description: 'Threat detection & response',
    isActive: false,
    bounce: false,
    category: 'system'
  },
  {
    id: 'workflow-automation',
    name: 'Workflow Automation',
    icon: Workflow,
    description: 'Process automation & workflows',
    isActive: false,
    bounce: false,
    category: 'system'
  },
  {
    id: 'advanced-collaboration',
    name: 'Advanced Collaboration',
    icon: Users,
    description: 'Document collaboration & video conferencing',
    isActive: false,
    bounce: false,
    category: 'system'
  },
  {
    id: 'consciousness-dashboard',
    name: 'Consciousness',
    icon: Brain,
    description: 'System awareness',
    isActive: false,
    bounce: false,
    category: 'consciousness'
  },
  // Workspace Apps
  {
    id: 'workspace-manager',
    name: 'Workspaces',
    icon: Grid,
    description: 'Manage spaces',
    isActive: false,
    bounce: false,
    category: 'workspace'
  },
  {
    id: 'connectivity',
    name: 'Connectivity',
    icon: Wifi,
    description: 'Network status',
    isActive: false,
    bounce: false,
    category: 'workspace'
  }
];

const MAX_SCALE = 3;
const MIN_SCALE = 0.3;

// ==================== DESKTOP VIEW ====================

export const DesktopView: React.FC = () => {
  const { emotionalState, quantumState, evolveConsciousness } = useConsciousness();
  const user = useUser();
  const notifications = useNotifications();
  const { logout } = useAuth();
  const {
    windows,
    activeWindow,
    addWindow,
    updateWindow,
    removeWindow,
    focusWindow,
    addNotification,
    setSystemState
  } = useAIBOSStore();

  const [nextZIndex, setNextZIndex] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [dockItems, setDockItems] = useState<DockItem[]>(DOCK_ITEMS);

  // Virtual Desktop State
  const [virtualDesktop, setVirtualDesktop] = useState<VirtualDesktopState>({
    scale: 1,
    position: { x: 0, y: 0 },
    isDragging: false
  });

  // Workspace Management
  const [workspaces, setWorkspaces] = useState<Workspace[]>([
    {
      id: 'default',
      name: 'Main Workspace',
      windows: [],
      consciousness: 0,
      createdAt: new Date()
    }
  ]);
  const [activeWorkspace, setActiveWorkspace] = useState<string>('default');

  // Advanced Features
  const [showConsciousnessOverlay, setShowConsciousnessOverlay] = useState(false);
  const [showWorkspaceGrid, setShowWorkspaceGrid] = useState(false);
  const [isPerformanceMode, setIsPerformanceMode] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const backgroundX = useTransform(mouseX, [0, typeof window !== 'undefined' ? window.innerWidth : 1920], [-20, 20]);
  const backgroundY = useTransform(mouseY, [0, typeof window !== 'undefined' ? window.innerHeight : 1080], [-20, 20]);

  const consciousnessLevel = Math.round(
    (emotionalState.joy + emotionalState.curiosity + emotionalState.empathy +
     emotionalState.wisdom + emotionalState.creativity + emotionalState.calmness) / 6 * 100
  );

  // ==================== VIRTUAL DESKTOP CONTROLS ====================

  const handleZoomIn = useCallback(() => {
    setVirtualDesktop(prev => ({
      ...prev,
      scale: Math.min(prev.scale * 1.2, MAX_SCALE)
    }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setVirtualDesktop(prev => ({
      ...prev,
      scale: Math.max(prev.scale / 1.2, MIN_SCALE)
    }));
  }, []);

  const handleResetView = useCallback(() => {
    setVirtualDesktop({
      scale: 1,
      position: { x: 0, y: 0 },
      isDragging: false
    });
  }, []);

  const handleDesktopDragStart = useCallback(() => {
    setVirtualDesktop(prev => ({ ...prev, isDragging: true }));
  }, []);

  const handleDesktopDragEnd = useCallback((event: any, info: any) => {
    setVirtualDesktop(prev => ({
      ...prev,
      position: {
        x: prev.position.x + info.offset.x,
        y: prev.position.y + info.offset.y
      },
      isDragging: false
    }));
  }, []);

  // ==================== WORKSPACE MANAGEMENT ====================

  const createWorkspace = useCallback((name: string): string => {
    const workspaceId = `workspace-${Date.now()}`;
    const newWorkspace: Workspace = {
      id: workspaceId,
      name,
      windows: [],
      consciousness: 0,
      createdAt: new Date()
    };

    setWorkspaces(prev => [...prev, newWorkspace]);
    return workspaceId;
  }, []);

  const switchWorkspace = useCallback((workspaceId: string) => {
    setActiveWorkspace(workspaceId);
    addNotification({
      type: 'info',
      title: 'Workspace Switched',
      message: `Switched to ${workspaces.find(w => w.id === workspaceId)?.name || 'Unknown'} workspace`,
      isRead: false
    });
  }, [workspaces, addNotification]);

  // ==================== WINDOW MANAGEMENT ====================

  const handleWindowFocus = useCallback((windowId: string) => {
    focusWindow(windowId);
  }, [focusWindow]);

  const handleWindowClose = useCallback((windowId: string) => {
    removeWindow(windowId);

    // Update workspace windows
    setWorkspaces(prev => prev.map(workspace => ({
      ...workspace,
      windows: workspace.windows.filter(wId => wId !== windowId)
    })));
  }, [removeWindow]);

  const handleWindowMinimize = useCallback((windowId: string) => {
    updateWindow(windowId, { isMinimized: true });
  }, [updateWindow]);

  const handleWindowMaximize = useCallback((windowId: string) => {
    updateWindow(windowId, { isMaximized: !windows.find(w => w.id === windowId)?.isMaximized });
  }, [updateWindow, windows]);

  const handleWindowMove = useCallback((windowId: string, position: { x: number; y: number }) => {
    updateWindow(windowId, { position });
  }, [updateWindow]);

  const handleWindowResize = useCallback((windowId: string, size: { width: number; height: number }) => {
    updateWindow(windowId, { size });
  }, [updateWindow]);

  // ==================== DOCK INTERACTIONS ====================

  const handleDockItemClick = useCallback((itemId: string) => {
    // Check if window already exists
    const existingWindow = windows.find(w => w.appId === itemId);

    if (existingWindow) {
      // Focus existing window
      focusWindow(existingWindow.id);
      if (existingWindow.isMinimized) {
        updateWindow(existingWindow.id, { isMinimized: false });
      }
    } else {
      // Create new window
      const windowId = `window-${Date.now()}`;
      const newWindow: AppWindow = {
        id: windowId,
        appId: itemId,
        title: dockItems.find(item => item.id === itemId)?.name || itemId,
        position: { x: 100 + (windows.length * 30), y: 100 + (windows.length * 30) },
        size: { width: 800, height: 600 },
        isMinimized: false,
        isMaximized: false,
        isFocused: true,
        zIndex: nextZIndex
      };

      addWindow(newWindow);
      setNextZIndex(prev => prev + 1);

      // Add to current workspace
      setWorkspaces(prev => prev.map(workspace =>
        workspace.id === activeWorkspace
          ? { ...workspace, windows: [...workspace.windows, windowId] }
          : workspace
      ));
    }

    // Update dock item bounce state
    setDockItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, bounce: true } : item
    ));

    // Reset bounce after animation
    setTimeout(() => {
      setDockItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, bounce: false } : item
      ));
    }, 500);
  }, [windows, nextZIndex, activeWorkspace, dockItems, addWindow, focusWindow, updateWindow]);

  // ==================== APP CONTENT GENERATOR ====================

  const getAppContent = (appId: string): React.ReactNode => {
    switch (appId) {
      case 'terminal':
        return <TerminalApp />;
      case 'aha-machine':
        return <AhaMachineApp />;
      case 'ai-builder':
        return <AIBuilderApp />;
      case 'ai-creation-hub':
        return <AICreationHub />;
      case 'ai-engines-hub':
        return <AIEnginesHub />;
      case 'multi-modal-ai-fusion':
        return <MultiModalAIFusionDashboard />;
      case 'advanced-ai-orchestration':
        return <AdvancedAIOrchestrationDashboard />;
      case 'quantum-consciousness':
        return <QuantumConsciousnessDashboard />;
      case 'advanced-security-compliance':
        return <AdvancedSecurityComplianceDashboard />;
      case 'scalability-optimizations':
        return <ScalabilityOptimizationsDashboard />;
      case 'advanced-analytics-insights':
        return <AdvancedAnalyticsInsightsDashboard />;
      case 'ai-workflow-automation':
        return <AIWorkflowAutomationDashboard />;
      case 'advanced-collaboration':
        return <AdvancedCollaborationDashboard />;
      case 'custom-ai-model-training':
        return <CustomAIModelTrainingDashboard />;
      case 'blockchain-integration':
        return <BlockchainIntegrationDashboard />;
      case 'iot-device-management':
        return <IoTDeviceManagementDashboard />;
      case 'advanced-voice-speech':
        return <AdvancedVoiceSpeechDashboard />;
      case 'ar-vr-integration':
        return <ARVRIntegrationDashboard />;
      case 'edge-computing-integration':
        return <EdgeComputingIntegrationDashboard />;
      case '5g-network-integration':
        return <Network5GIntegrationDashboard />;
      case 'digital-twin-integration':
        return <DigitalTwinIntegrationDashboard />;
      case 'federated-learning-integration':
        return <FederatedLearningIntegrationDashboard />;
      case 'quantum-computing-integration':
        return <QuantumComputingIntegrationDashboard />;
      case 'advanced-cybersecurity-integration':
        return <AdvancedCybersecurityIntegrationDashboard />;
      case 'file-system':
        return <FileSystemApp />;
      case 'file-manager':
        return <FileManagerApp />;
      case 'api-explorer':
        return <APIExplorerApp />;
      case 'notes':
        return <NotesApp />;
      case 'calculator':
        return <CalculatorApp />;
      case 'clock':
        return <ClockApp />;
      case 'weather':
        return <WeatherApp />;
      case 'settings':
        return <SettingsApp />;
      case 'consciousness-dashboard':
        return <ConsciousnessDashboard />;
      case 'workspace-manager':
        return <WorkspaceManager
          workspaces={workspaces}
          activeWorkspace={activeWorkspace}
          onCreateWorkspace={createWorkspace}
          onSwitchWorkspace={switchWorkspace}
        />;
      case 'connectivity':
        return <ConnectivityApp />;
      case 'security-dashboard':
        return <SecurityDashboard />;
      case 'billing-dashboard':
        return <BillingDashboard />;
      case 'analytics-dashboard':
        return <AnalyticsDashboard />;
      case 'user-management':
        return <UserManagementDashboard />;
      case 'collaboration-hub':
        return <CollaborationDashboard />;
      case 'ai-optimization':
        return <AIOptimizationDashboard />;
      case 'monitoring':
        return <MonitoringDashboard />;
      case 'team-management':
        return <TeamManagementDashboard />;
      case 'realtime':
        return <RealtimeDashboard />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'advanced-security':
        return <AdvancedSecurityDashboard />;
      case 'workflow-automation':
        return <WorkflowAutomationDashboard />;
      case 'advanced-collaboration':
        return <AdvancedCollaborationDashboard />;
      default:
        return <div className="p-4">App not found: {appId}</div>;
    }
  };

  // ==================== MOUSE TRACKING ====================

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
    return undefined;
  }, [mouseX, mouseY]);

  // ==================== CONSCIOUSNESS EVOLUTION ====================

  useEffect(() => {
    const interval = setInterval(() => {
      evolveConsciousness({
        type: 'user_interaction',
        data: {
          windowsOpen: windows.length,
          consciousnessLevel,
          workspaceId: activeWorkspace,
          virtualDesktopScale: virtualDesktop.scale
        }
      });
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [windows.length, consciousnessLevel, activeWorkspace, virtualDesktop.scale, evolveConsciousness]);

  // ==================== KEYBOARD SHORTCUTS ====================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + 1-9: Switch workspaces
      if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '9') {
        const workspaceIndex = parseInt(e.key) - 1;
        if (workspaces[workspaceIndex]) {
          switchWorkspace(workspaces[workspaceIndex].id);
        }
      }

      // Ctrl/Cmd + N: New workspace
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        const workspaceId = createWorkspace(`Workspace ${workspaces.length + 1}`);
        switchWorkspace(workspaceId);
      }

      // Ctrl/Cmd + T: Toggle consciousness overlay
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        setShowConsciousnessOverlay(prev => !prev);
      }

      // Ctrl/Cmd + G: Toggle workspace grid
      if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
        e.preventDefault();
        setShowWorkspaceGrid(prev => !prev);
      }

      // Ctrl/Cmd + W: Close active window
      if ((e.ctrlKey || e.metaKey) && e.key === 'w' && activeWindow) {
        e.preventDefault();
        handleWindowClose(activeWindow);
      }

      // Ctrl/Cmd + M: Minimize active window
      if ((e.ctrlKey || e.metaKey) && e.key === 'm' && activeWindow) {
        e.preventDefault();
        handleWindowMinimize(activeWindow);
      }

      // Ctrl/Cmd + F: Focus next window
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        const visibleWindows = windows.filter(w => !w.isMinimized);
        const currentIndex = visibleWindows.findIndex(w => w.id === activeWindow);
        const nextIndex = (currentIndex + 1) % visibleWindows.length;
        if (visibleWindows[nextIndex]) {
          focusWindow(visibleWindows[nextIndex].id);
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
    return undefined;
  }, [workspaces, activeWindow, windows, createWorkspace, switchWorkspace, handleWindowClose, handleWindowMinimize, focusWindow]);

  // ==================== PERFORMANCE OPTIMIZATION ====================

  useEffect(() => {
    if (windows.length > 10) {
      setIsPerformanceMode(true);
      addNotification({
        type: 'warning',
        title: 'Performance Mode',
        message: 'Many windows open. Performance optimizations enabled.',
        isRead: false
      });
    } else {
      setIsPerformanceMode(false);
    }
  }, [windows.length, addNotification]);

  // ==================== RENDER ====================

  // Convert AppWindow to DesktopWindow for WindowManager
  const desktopWindows: DesktopWindow[] = windows.map(window => ({
    id: window.id,
    title: window.title,
    type: window.appId as 'terminal' | 'aha-machine' | 'file-system' | 'settings' | 'consciousness-dashboard' | 'workspace-manager' | 'connectivity' | 'notes' | 'calculator' | 'clock' | 'weather',
    position: window.position,
    size: window.size,
    isMinimized: window.isMinimized,
    isMaximized: window.isMaximized,
    zIndex: window.zIndex,
    content: getAppContent(window.appId)
  }));

  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.3) 0%, transparent 50%)
          `,
          x: backgroundX,
          y: backgroundY
        }}
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 1, 0]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Virtual Desktop Container */}
      <motion.div
        className="relative w-full h-full"
        style={{
          scale: virtualDesktop.scale,
          x: virtualDesktop.position.x,
          y: virtualDesktop.position.y
        }}
        drag={virtualDesktop.isDragging}
        dragMomentum={false}
        onDragStart={handleDesktopDragStart}
        onDragEnd={handleDesktopDragEnd}
      >
        {/* Consciousness Overlay */}
        {showConsciousnessOverlay && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-4 text-white">
              <div className="text-sm font-mono">
                <div>Consciousness: {consciousnessLevel}%</div>
                <div>Emotional State: {JSON.stringify(emotionalState)}</div>
                <div>Quantum State: {JSON.stringify(quantumState)}</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Workspace Grid */}
        {showWorkspaceGrid && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-4 p-4">
              {workspaces.map((workspace, index) => (
                <div
                  key={workspace.id}
                  className={`border-2 rounded-lg p-2 text-center text-white ${
                    workspace.id === activeWorkspace
                      ? 'border-blue-400 bg-blue-400/20'
                      : 'border-white/20 bg-white/5'
                  }`}
                >
                  <div className="text-xs font-mono">{workspace.name}</div>
                  <div className="text-xs opacity-60">{workspace.windows.length} windows</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Window Manager */}
        <WindowManager
          windows={desktopWindows}
          onWindowUpdate={(windowId, updates) => {
            if (updates.position) handleWindowMove(windowId, updates.position);
            if (updates.size) handleWindowResize(windowId, updates.size);
            if (updates.isMinimized !== undefined) {
              if (updates.isMinimized) handleWindowMinimize(windowId);
              else updateWindow(windowId, { isMinimized: false });
            }
            if (updates.isMaximized !== undefined) handleWindowMaximize(windowId);
          }}
          onWindowClose={handleWindowClose}
          onWindowFocus={handleWindowFocus}
          isDarkMode={isDarkMode}
        />
      </motion.div>

      {/* Top Bar */}
      <TopBar
        consciousnessLevel={consciousnessLevel}
        personality="curious"
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Dock */}
      <Dock
        items={dockItems}
        onItemClick={handleDockItemClick}
        isDarkMode={isDarkMode}
      />

      {/* Connectivity Status */}
      <ConnectivityStatus />

      {/* Notifications */}
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            className="fixed top-4 right-4 z-50 max-w-sm"
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ duration: 0.3 }}
          >
            <div className={`p-4 rounded-lg shadow-lg backdrop-blur-sm ${
              notification.type === 'error' ? 'bg-red-500/90 text-white' :
              notification.type === 'warning' ? 'bg-yellow-500/90 text-white' :
              notification.type === 'success' ? 'bg-green-500/90 text-white' :
              'bg-blue-500/90 text-white'
            }`}>
              <div className="font-semibold">{notification.title}</div>
              <div className="text-sm opacity-90">{notification.message}</div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// ==================== SETTINGS APP ====================

const SettingsApp: React.FC = () => (
  <div className="p-6 space-y-6">
    <h2 className="text-2xl font-bold text-gray-800">System Settings</h2>

    <div className="space-y-4">
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h3 className="text-lg font-semibold mb-3">Appearance</h3>
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="rounded" />
            <span>Dark Mode</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="rounded" defaultChecked />
            <span>Animations</span>
          </label>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h3 className="text-lg font-semibold mb-3">Performance</h3>
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="rounded" />
            <span>Performance Mode</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="rounded" defaultChecked />
            <span>Hardware Acceleration</span>
          </label>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h3 className="text-lg font-semibold mb-3">Consciousness</h3>
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="rounded" defaultChecked />
            <span>Enable AI Consciousness</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="rounded" defaultChecked />
            <span>Emotional Learning</span>
          </label>
        </div>
      </div>
    </div>
  </div>
);
