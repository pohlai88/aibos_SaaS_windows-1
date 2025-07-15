import React, { useState } from 'react';
import { Button } from './primitives/Button';
import { Modal } from './primitives/Modal';
import { Drawer, useAIDrawer } from './layout/Drawer';
import { Tabs, TabAnalytics, useAITabs } from './layout/Tabs';
import { Breadcrumb, useAIBreadcrumb } from './layout/Breadcrumb';
import { DateTimePicker } from './forms/DateTimePicker';
import { ConfirmDialog, useAIConfirm } from './feedback/ConfirmDialog';
import { useToast } from './feedback/Toast';
import { Badge, StatusBadge, NotificationBadge } from './primitives/Badge';
import { Progress, CircularProgress } from './primitives/Progress';
import { Skeleton, SkeletonCard } from './primitives/Skeleton';
import { Tooltip } from './primitives/Tooltip';
import { 
  Brain, 
  Zap, 
  Star, 
  TrendingUp, 
  Settings, 
  Users, 
  Database,
  FileText,
  BarChart3,
  MessageSquare,
  Bell,
  Calendar,
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle,
  Info,
  Home,
  Folder,
  File,
  ChevronRight
} from 'lucide-react';

export const UltimateDemo: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { addToast } = useToast();
  const { confirm } = useAIConfirm();

  // AI-Powered Drawer
  const drawer = useAIDrawer({
    autoCollapse: true,
    contextAware: true,
    smartResize: true,
    usageOptimization: true,
  });

  // AI-Powered Tabs
  const { tabs, activeTab, setActiveTab, addTab, removeTab } = useAITabs({
    smartOrdering: true,
    usageTracking: true,
    contextAware: true,
    autoClose: true,
    maxTabs: 5,
  });

  // AI-Powered Breadcrumb
  const breadcrumb = useAIBreadcrumb({
    smartSuggestions: true,
    contextAware: true,
    usageTracking: true,
    predictiveNavigation: true,
  });

  // Initialize demo data
  React.useEffect(() => {
    // Add demo tabs
    addTab({
      label: 'Dashboard',
      content: <DashboardContent />,
      icon: <BarChart3 className="h-4 w-4" />,
      badge: 'Live',
      pinned: true,
    });
    addTab({
      label: 'Users',
      content: <UsersContent />,
      icon: <Users className="h-4 w-4" />,
      badge: 1.2,
    });
    addTab({
      label: 'Analytics',
      content: <AnalyticsContent />,
      icon: <TrendingUp className="h-4 w-4" />,
    });

    // Add demo breadcrumb items
    breadcrumb.addItem({
      id: 'home',
      label: 'Home',
      icon: <Home className="h-4 w-4" />,
    });
    breadcrumb.addItem({
      id: 'projects',
      label: 'Projects',
      icon: <Folder className="h-4 w-4" />,
    });
    breadcrumb.addItem({
      id: 'current',
      label: 'AI-BOS Platform',
      icon: <File className="h-4 w-4" />,
    });
  }, []);

  const showAIConfirmation = () => {
    confirm({
      title: 'AI-Powered Confirmation',
      description: 'This dialog demonstrates advanced AI features including risk assessment, smart suggestions, and usage optimization.',
      actions: [
        {
          id: 'proceed',
          label: 'Proceed with AI Optimization',
          variant: 'default',
          icon: <Brain className="h-4 w-4" />,
          description: 'AI will optimize the process based on usage patterns',
          risk: 'low',
          aiScore: 95,
          usageCount: 42,
          isRecommended: true,
        },
        {
          id: 'manual',
          label: 'Manual Configuration',
          variant: 'outline',
          icon: <Settings className="h-4 w-4" />,
          description: 'Full manual control over all settings',
          risk: 'medium',
          aiScore: 60,
          usageCount: 15,
        },
        {
          id: 'destructive',
          label: 'Reset All Settings',
          variant: 'destructive',
          icon: <AlertTriangle className="h-4 w-4" />,
          description: 'This will reset all configurations to defaults',
          risk: 'high',
          aiScore: 30,
          usageCount: 3,
          isDestructive: true,
          requiresConfirmation: true,
        },
      ],
      onAction: (actionId) => {
        addToast({
          title: 'Action Executed',
          description: `Selected: ${actionId}`,
          variant: 'success',
        });
      },
      aiFeatures: {
        smartSuggestions: true,
        riskAssessment: true,
        usageOptimization: true,
        contextAware: true,
      },
      context: {
        userRole: 'admin',
        riskTolerance: 'medium',
        timeOfDay: 'afternoon',
      },
      analytics: {
        totalConfirmations: 156,
        successRate: 94,
        averageResponseTime: 2.3,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Brain className="h-8 w-8 text-blue-600" />
                <h1 className="text-xl font-bold">AI-BOS Ultimate Demo</h1>
              </div>
              <Badge variant="success" dot>
                AI-Powered
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <NotificationBadge count={5}>
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5" />
                </Button>
              </NotificationBadge>
              
              <StatusBadge status="online" />
              
              <Button
                variant="outline"
                onClick={() => drawer.open()}
                leftIcon={<Settings className="h-4 w-4" />}
              >
                AI Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb
            items={breadcrumb.items}
            onItemClick={(item, index) => {
              addToast({
                title: 'Navigation',
                description: `Navigated to: ${item.label}`,
                variant: 'info',
              });
            }}
            aiFeatures={{
              smartSuggestions: true,
              contextAware: true,
              usageTracking: true,
              predictiveNavigation: true,
            }}
            suggestions={[
              {
                id: 'suggestion-1',
                label: 'Recent Projects',
                icon: <Folder className="h-3 w-3" />,
                metadata: { priority: 1 },
              },
              {
                id: 'suggestion-2',
                label: 'Frequently Visited',
                icon: <TrendingUp className="h-3 w-3" />,
                metadata: { priority: 2 },
              },
            ]}
            onSuggestionClick={(suggestion) => {
              addToast({
                title: 'AI Suggestion',
                description: `Quick access to: ${suggestion.label}`,
                variant: 'success',
              });
            }}
          />
        </div>

        {/* Feature Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* AI-Powered Tabs */}
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold">AI-Powered Tabs</h2>
              <Badge variant="info">Smart Ordering</Badge>
            </div>
            
            <Tabs
              tabs={tabs}
              defaultActiveTab={activeTab}
              onTabChange={setActiveTab}
              onTabAdd={addTab}
              onTabRemove={removeTab}
              showAddButton
              showCloseButtons
              showMoreMenu
              draggable
              aiFeatures={{
                smartOrdering: true,
                usageTracking: true,
                contextAware: true,
                autoClose: true,
                usageAnalytics: true,
              }}
            />
            
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => addTab({
                  label: 'New Tab',
                  content: <div className="p-4">New tab content with AI features</div>,
                  icon: <FileText className="h-4 w-4" />,
                })}
              >
                Add Tab
              </Button>
            </div>
          </div>

          {/* AI-Powered Date/Time Picker */}
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-green-600" />
              <h2 className="text-lg font-semibold">AI Date/Time Picker</h2>
              <Badge variant="success">Natural Language</Badge>
            </div>
            
            <div className="space-y-4">
              <DateTimePicker
                value={selectedDate}
                onChange={setSelectedDate}
                placeholder="Try: 'tomorrow 3pm' or 'next week'"
                aiFeatures={{
                  smartSuggestions: true,
                  naturalLanguage: true,
                  contextAware: true,
                  usageOptimization: true,
                  predictiveInput: true,
                }}
                quickOptions={{
                  today: true,
                  tomorrow: true,
                  nextWeek: true,
                  nextMonth: true,
                }}
              />
              
              {selectedDate && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-sm font-medium text-green-900 dark:text-green-100">
                    Selected: {selectedDate.toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Advanced Features Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Progress Indicators */}
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold mb-4">AI Progress Tracking</h3>
            <div className="space-y-4">
              <Progress value={75} showValue showLabel label="AI Processing" />
              <CircularProgress value={60} showValue size={80} />
              <div className="flex items-center gap-2">
                <StatusBadge status="online" size="sm" />
                <span className="text-sm text-muted-foreground">AI System Active</span>
              </div>
            </div>
          </div>

          {/* Skeleton Loading */}
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold mb-4">Smart Loading States</h3>
            <div className="space-y-4">
              <SkeletonCard showImage={false} />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </div>

          {/* Tooltips */}
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold mb-4">AI-Enhanced Tooltips</h3>
            <div className="space-y-4">
              <Tooltip content="AI-powered tooltip with context awareness">
                <Button variant="outline">Hover for AI Info</Button>
              </Tooltip>
              
              <Tooltip content="Smart positioning based on viewport" side="right">
                <Button variant="outline">Right Tooltip</Button>
              </Tooltip>
              
              <Tooltip content="Context-aware suggestions" variant="info">
                <Button variant="outline">Info Tooltip</Button>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button
            variant="default"
            size="lg"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Brain className="h-5 w-5" />}
          >
            Open AI Modal
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            onClick={showAIConfirmation}
            leftIcon={<Shield className="h-5 w-5" />}
          >
            AI Confirmation
          </Button>
          
          <Button
            variant="secondary"
            size="lg"
            onClick={() => {
              addToast({
                title: 'AI Feature Activated',
                description: 'Advanced AI features are now active and learning from your interactions.',
                variant: 'success',
                duration: 5000,
              });
            }}
            leftIcon={<Zap className="h-5 w-5" />}
          >
            Activate AI Features
          </Button>
        </div>
      </main>

      {/* AI-Powered Drawer */}
      <Drawer
        isOpen={drawer.isOpen}
        onClose={drawer.close}
        title="AI Settings & Analytics"
        subtitle="Advanced configuration with AI-powered optimization"
        resizable
        collapsible
        onResize={drawer.resize}
        onCollapse={drawer.collapse}
        aiFeatures={{
          autoCollapse: true,
          contextAware: true,
          smartResize: true,
          usageOptimization: true,
        }}
        header={
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="font-semibold">AI-BOS Settings</h3>
              <p className="text-sm text-muted-foreground">Powered by Advanced AI</p>
            </div>
          </div>
        }
        footer={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              AI Active
            </div>
            <Button size="sm" variant="outline">
              Save Settings
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="font-medium">AI Features</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Smart Suggestions</span>
                <Badge variant="success">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Context Awareness</span>
                <Badge variant="success">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Usage Optimization</span>
                <Badge variant="success">Active</Badge>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Usage Analytics</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total Interactions</span>
                <span className="font-medium">1,247</span>
              </div>
              <div className="flex justify-between">
                <span>AI Suggestions Used</span>
                <span className="font-medium">89%</span>
              </div>
              <div className="flex justify-between">
                <span>Time Saved</span>
                <span className="font-medium">2.3h</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Performance</h4>
            <Progress value={94} showValue showLabel label="AI Accuracy" />
            <Progress value={87} showValue showLabel label="Response Time" variant="success" />
          </div>
        </div>
      </Drawer>

      {/* AI-Powered Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="AI-BOS Advanced Features"
        description="Experience the future of UI components with AI-powered intelligence"
        size="xl"
        footer={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Brain className="h-4 w-4" />
              AI-Powered Interface
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Close
              </Button>
              <Button onClick={() => setIsModalOpen(false)}>
                Activate All Features
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Revolutionary Features</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Brain className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium">AI-Powered Suggestions</div>
                    <div className="text-sm text-muted-foreground">Smart recommendations based on usage patterns</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  <div>
                    <div className="font-medium">Lightning Fast Performance</div>
                    <div className="text-sm text-muted-foreground">Optimized rendering and intelligent caching</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium">Enterprise Security</div>
                    <div className="text-sm text-muted-foreground">Built-in security and compliance features</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">AI Analytics</h4>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900 dark:text-blue-100">Performance</span>
                  </div>
                  <Progress value={96} showValue showLabel label="AI Accuracy" />
                </div>
                
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-900 dark:text-green-100">Success Rate</span>
                  </div>
                  <Progress value={94} showValue showLabel label="User Satisfaction" variant="success" />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center justify-center gap-4">
              <Badge variant="success" size="lg">
                <Star className="h-4 w-4 mr-1" />
                Enterprise Ready
              </Badge>
              <Badge variant="info" size="lg">
                <Brain className="h-4 w-4 mr-1" />
                AI-Powered
              </Badge>
              <Badge variant="warning" size="lg">
                <Zap className="h-4 w-4 mr-1" />
                High Performance
              </Badge>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Demo Content Components
const DashboardContent: React.FC = () => (
  <div className="p-4 space-y-4">
    <h3 className="text-lg font-semibold">AI Dashboard</h3>
    <div className="grid grid-cols-2 gap-4">
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="text-2xl font-bold text-blue-600">1,247</div>
        <div className="text-sm text-muted-foreground">Total Interactions</div>
      </div>
      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <div className="text-2xl font-bold text-green-600">94%</div>
        <div className="text-sm text-muted-foreground">AI Accuracy</div>
      </div>
    </div>
  </div>
);

const UsersContent: React.FC = () => (
  <div className="p-4 space-y-4">
    <h3 className="text-lg font-semibold">User Management</h3>
    <div className="space-y-2">
      <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
        <span>Active Users</span>
        <Badge variant="success">1,234</Badge>
      </div>
      <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
        <span>New This Week</span>
        <Badge variant="info">89</Badge>
      </div>
    </div>
  </div>
);

const AnalyticsContent: React.FC = () => (
  <div className="p-4 space-y-4">
    <h3 className="text-lg font-semibold">Analytics</h3>
    <div className="space-y-4">
      <Progress value={75} showValue showLabel label="Feature Usage" />
      <Progress value={89} showValue showLabel label="User Engagement" variant="success" />
      <Progress value={67} showValue showLabel label="Performance" variant="warning" />
    </div>
  </div>
); 