import React, { useState } from 'react';
import { Button } from './Button';
import { Modal } from './Modal';
import { Tooltip } from './Tooltip';
import { Skeleton, SkeletonCard, SkeletonTable } from './Skeleton';
import { Progress, CircularProgress, MultiStepProgress } from './Progress';
import { Badge, StatusBadge, NotificationBadge, ProgressBadge } from './Badge';
import { useToast } from '../feedback/Toast';
import { 
  Play, 
  Pause, 
  Settings, 
  Download, 
  Upload, 
  Trash2, 
  Check, 
  X,
  AlertCircle,
  Info,
  Star,
  Heart,
  MessageCircle,
  Bell
} from 'lucide-react';

export const PrimitivesDemo: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [progressValue, setProgressValue] = useState(45);
  const [currentStep, setCurrentStep] = useState(1);
  const { addToast } = useToast();

  const steps = [
    { id: '1', label: 'Setup', status: 'completed' as const, description: 'Initial configuration' },
    { id: '2', label: 'Configuration', status: 'current' as const, description: 'System settings' },
    { id: '3', label: 'Validation', status: 'pending' as const, description: 'Data verification' },
    { id: '4', label: 'Deployment', status: 'pending' as const, description: 'Go live' },
  ];

  const showToast = (type: 'success' | 'error' | 'warning' | 'info') => {
    const configs = {
      success: { title: 'Success!', description: 'Operation completed successfully.' },
      error: { title: 'Error!', description: 'Something went wrong.' },
      warning: { title: 'Warning!', description: 'Please review your input.' },
      info: { title: 'Info', description: 'Here is some information.' },
    };
    
    addToast({
      ...configs[type],
      variant: type,
      duration: 3000,
    });
  };

  return (
    <div className="p-8 space-y-12 max-w-6xl mx-auto">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">AI-BOS UI Primitives</h1>
        <p className="text-xl text-muted-foreground">
          Enterprise-grade foundational components for building world-class applications
        </p>
      </div>

      {/* Button Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Button Components</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Variants</h3>
            <div className="flex flex-wrap gap-2">
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="gradient">Gradient</Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Sizes</h3>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="xl">Extra Large</Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">States</h3>
            <div className="flex flex-wrap gap-2">
              <Button loading>Loading</Button>
              <Button disabled>Disabled</Button>
              <Button leftIcon={Download}>With Icon</Button>
              <Button rightIcon={Upload}>Icon Right</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Badge Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Badge Components</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Variants</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="error">Error</Badge>
              <Badge variant="info">Info</Badge>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Status Badges</h3>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status="online" />
              <StatusBadge status="offline" />
              <StatusBadge status="away" />
              <StatusBadge status="busy" />
              <StatusBadge status="dnd" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Special Badges</h3>
            <div className="flex flex-wrap gap-2">
              <NotificationBadge count={5}>
                <Bell className="h-6 w-6" />
              </NotificationBadge>
              <ProgressBadge value={75} />
              <Badge dismissible onDismiss={() => console.log('Dismissed')}>
                Dismissible
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Progress Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Progress Components</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Linear Progress</h3>
            <div className="space-y-4">
              <Progress value={progressValue} showValue showLabel label="Upload Progress" />
              <Progress value={30} variant="success" />
              <Progress value={60} variant="warning" />
              <Progress value={90} variant="destructive" />
              <Progress indeterminate />
            </div>
            <Button onClick={() => setProgressValue(Math.min(100, progressValue + 10))}>
              Increase Progress
            </Button>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Circular Progress</h3>
            <div className="flex gap-4">
              <CircularProgress value={progressValue} showValue />
              <CircularProgress value={75} variant="success" size={80} />
              <CircularProgress value={45} variant="warning" size={100} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Multi-Step Progress</h3>
          <MultiStepProgress 
            steps={steps} 
            currentStep={currentStep}
            clickable
            onStepClick={setCurrentStep}
          />
          <div className="flex gap-2">
            <Button onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}>
              Previous
            </Button>
            <Button onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}>
              Next
            </Button>
          </div>
        </div>
      </section>

      {/* Skeleton Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Skeleton Components</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Skeletons</h3>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Skeleton Card</h3>
            <SkeletonCard />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Skeleton Table</h3>
            <SkeletonTable rows={3} columns={3} />
          </div>
        </div>
      </section>

      {/* Tooltip Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Tooltip Components</h2>
        
        <div className="flex flex-wrap gap-4">
          <Tooltip content="This is a tooltip on the top">
            <Button>Top Tooltip</Button>
          </Tooltip>
          
          <Tooltip content="This is a tooltip on the right" side="right">
            <Button>Right Tooltip</Button>
          </Tooltip>
          
          <Tooltip content="This is a tooltip on the bottom" side="bottom">
            <Button>Bottom Tooltip</Button>
          </Tooltip>
          
          <Tooltip content="This is a tooltip on the left" side="left">
            <Button>Left Tooltip</Button>
          </Tooltip>
          
          <Tooltip content="This is a warning tooltip" variant="warning">
            <Button variant="warning">Warning Tooltip</Button>
          </Tooltip>
        </div>
      </section>

      {/* Modal Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Modal Components</h2>
        
        <div className="flex gap-4">
          <Button onClick={() => setIsModalOpen(true)}>
            Open Modal
          </Button>
          
          <Button onClick={() => showToast('success')}>
            Show Success Toast
          </Button>
          
          <Button onClick={() => showToast('error')}>
            Show Error Toast
          </Button>
          
          <Button onClick={() => showToast('warning')}>
            Show Warning Toast
          </Button>
          
          <Button onClick={() => showToast('info')}>
            Show Info Toast
          </Button>
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Example Modal"
          description="This is an example modal with various components inside."
          size="lg"
          footer={
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsModalOpen(false)}>
                Confirm
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <p>This modal demonstrates the integration of various primitive components.</p>
            
            <div className="flex gap-2">
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="error">Error</Badge>
            </div>
            
            <Progress value={65} showValue showLabel label="Task Progress" />
            
            <div className="flex gap-2">
              <Button size="sm">Small Button</Button>
              <Button size="sm" variant="outline">Outline</Button>
            </div>
          </div>
        </Modal>
      </section>

      {/* Integration Example */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Integration Example</h2>
        
        <div className="border rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <StatusBadge status="online" size="sm" className="absolute -bottom-1 -right-1" />
              </div>
              <div>
                <h4 className="font-medium">User Profile</h4>
                <p className="text-sm text-muted-foreground">Last active 2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <NotificationBadge count={3}>
                <Button variant="ghost" size="icon">
                  <Bell className="h-4 w-4" />
                </Button>
              </NotificationBadge>
              <Tooltip content="Edit profile">
                <Button variant="ghost" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </Tooltip>
            </div>
          </div>
          
          <Progress value={75} showValue showLabel label="Profile Completion" />
          
          <div className="flex gap-2">
            <Badge variant="completed">Verified</Badge>
            <Badge variant="info">Premium</Badge>
            <Badge variant="processing">Processing</Badge>
          </div>
        </div>
      </section>
    </div>
  );
}; 