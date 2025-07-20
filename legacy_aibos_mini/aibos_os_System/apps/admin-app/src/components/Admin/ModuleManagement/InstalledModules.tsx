'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Input, Modal } from '@aibos/ui-components';
import { 
  Settings, 
  Trash2, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Download,
  Package
} from 'lucide-react';
import { InstallationStatus } from '@aibos/module-registry';

interface InstalledModuleProps {
  module: any;
  onUpdate: (moduleId: string) => void;
  onUninstall: (moduleId: string) => void;
  onConfigure: (moduleId: string, config: any) => void;
}

const InstalledModule: React.FC<InstalledModuleProps> = ({ 
  module, 
  onUpdate, 
  onUninstall, 
  onConfigure 
}) => {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [config, setConfig] = useState(module.configuration || {});

  const getStatusIcon = (status: InstallationStatus) => {
    switch (status) {
      case InstallationStatus.INSTALLED:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case InstallationStatus.INSTALLING:
        return <Clock className="w-4 h-4 text-blue-500" />;
      case InstallationStatus.UPDATING:
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case InstallationStatus.FAILED:
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case InstallationStatus.UNINSTALLING:
        return <Trash2 className="w-4 h-4 text-orange-500" />;
      default:
        return <Package className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: InstallationStatus) => {
    switch (status) {
      case InstallationStatus.INSTALLED:
        return 'success';
      case InstallationStatus.INSTALLING:
      case InstallationStatus.UPDATING:
        return 'warning';
      case InstallationStatus.FAILED:
        return 'destructive';
      case InstallationStatus.UNINSTALLING:
        return 'outline';
      default:
        return 'outline';
    }
  };

  const handleSaveConfig = () => {
    onConfigure(module.moduleId, config);
    setShowConfigModal(false);
  };

  return (
    <>
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {getStatusIcon(module.status)}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{module.name}</h3>
              <p className="text-sm text-gray-600">v{module.version}</p>
            </div>
          </div>
          <Badge variant={getStatusColor(module.status)}>
            {module.status}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
          <div>
            <span className="text-gray-500">Installed:</span>
            <p className="font-medium">
              {new Date(module.installedAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <span className="text-gray-500">Location:</span>
            <p className="font-medium font-mono text-xs">{module.location}</p>
          </div>
          <div>
            <span className="text-gray-500">Size:</span>
            <p className="font-medium">{module.size || 'Unknown'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConfigModal(true)}
            disabled={module.status !== InstallationStatus.INSTALLED}
          >
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUpdate(module.moduleId)}
            disabled={module.status !== InstallationStatus.INSTALLED}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Update
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onUninstall(module.id)}
            disabled={module.status !== InstallationStatus.INSTALLED}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Uninstall
          </Button>
        </div>
      </Card>

      {/* Configuration Modal */}
      <Modal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        title={`Configure ${module.name}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Module Configuration
            </label>
            <textarea
              value={JSON.stringify(config, null, 2)}
              onChange={(e) => {
                try {
                  setConfig(JSON.parse(e.target.value));
                } catch {
                  // Invalid JSON, keep current config
                }
              }}
              className="w-full h-32 p-2 border border-gray-300 rounded-md font-mono text-sm"
              placeholder="Enter JSON configuration..."
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfigModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveConfig}>
              Save Configuration
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

const InstalledModules: React.FC = () => {
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [uninstalling, setUninstalling] = useState<string | null>(null);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockInstalledModules = [
      {
        id: 'advanced-reporting-1234567890',
        moduleId: 'advanced-reporting',
        name: 'Advanced Reporting',
        version: '1.2.0',
        status: InstallationStatus.INSTALLED,
        installedAt: new Date('2024-01-10'),
        location: './packages/advanced-reporting',
        size: '2.4 MB',
        configuration: {
          enableRealTime: true,
          maxReports: 100,
          retentionDays: 365
        }
      },
      {
        id: 'invoice-automation-1234567891',
        moduleId: 'invoice-automation',
        name: 'Invoice Automation',
        version: '2.1.0',
        status: InstallationStatus.INSTALLED,
        installedAt: new Date('2024-01-05'),
        location: './packages/invoice-automation',
        size: '1.8 MB',
        configuration: {
          autoApprove: false,
          maxAmount: 10000,
          notificationEmail: 'finance@company.com'
        }
      },
      {
        id: 'customer-portal-1234567892',
        moduleId: 'customer-portal',
        name: 'Customer Portal',
        version: '1.0.0',
        status: InstallationStatus.INSTALLING,
        installedAt: new Date('2024-01-15'),
        location: './packages/customer-portal',
        size: '3.2 MB',
        configuration: {}
      }
    ];
    
    setModules(mockInstalledModules);
  }, []);

  const handleUpdate = async (moduleId: string) => {
    setUpdating(moduleId);
    setLoading(true);
    
    try {
      // Simulate update process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update module status
      setModules(prev => prev.map(module => 
        module.moduleId === moduleId 
          ? { ...module, status: InstallationStatus.INSTALLED }
          : module
      ));
      
      alert(`Module ${moduleId} updated successfully!`);
    } catch (error) {
      console.error('Update failed:', error);
      alert('Update failed. Please try again.');
    } finally {
      setUpdating(null);
      setLoading(false);
    }
  };

  const handleUninstall = async (installationId: string) => {
    if (!confirm('Are you sure you want to uninstall this module?')) {
      return;
    }
    
    setUninstalling(installationId);
    setLoading(true);
    
    try {
      // Simulate uninstall process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Remove module from list
      setModules(prev => prev.filter(module => module.id !== installationId));
      
      alert('Module uninstalled successfully!');
    } catch (error) {
      console.error('Uninstall failed:', error);
      alert('Uninstall failed. Please try again.');
    } finally {
      setUninstalling(null);
      setLoading(false);
    }
  };

  const handleConfigure = async (moduleId: string, config: any) => {
    try {
      // Update module configuration
      setModules(prev => prev.map(module => 
        module.moduleId === moduleId 
          ? { ...module, configuration: config }
          : module
      ));
      
      alert('Configuration saved successfully!');
    } catch (error) {
      console.error('Configuration failed:', error);
      alert('Failed to save configuration. Please try again.');
    }
  };

  const installedCount = modules.filter(m => m.status === InstallationStatus.INSTALLED).length;
  const updatingCount = modules.filter(m => m.status === InstallationStatus.UPDATING).length;
  const failedCount = modules.filter(m => m.status === InstallationStatus.FAILED).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Installed Modules</h1>
          <p className="text-gray-600">Manage your installed modules and configurations</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>{installedCount} installed</span>
          </div>
          {updatingCount > 0 && (
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
              <span>{updatingCount} updating</span>
            </div>
          )}
          {failedCount > 0 && (
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span>{failedCount} failed</span>
            </div>
          )}
        </div>
      </div>

      {/* Module List */}
      <div className="space-y-4">
        {modules.map(module => (
          <InstalledModule
            key={module.id}
            module={module}
            onUpdate={handleUpdate}
            onUninstall={handleUninstall}
            onConfigure={handleConfigure}
          />
        ))}
      </div>

      {modules.length === 0 && (
        <Card className="p-12 text-center">
          <div className="text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No modules installed</h3>
            <p>Visit the Module Store to install your first module</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default InstalledModules; 