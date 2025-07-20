import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, PlayIcon } from '@heroicons/react/24/outline';

interface DeploymentStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  command?: string;
}

interface GoLivePanelProps {
  onDeploymentComplete?: () => void;
}

export const GoLivePanel: React.FC<GoLivePanelProps> = ({ onDeploymentComplete }) => {
  const [deploymentSteps, setDeploymentSteps] = useState<DeploymentStep[]>([
    {
      id: 'governance-schema',
      name: 'Deploy Governance Schema',
      description: 'Create governance_metadata and governance_audit_log tables',
      status: 'pending',
      command: 'npm run deploy:governance-schema'
    },
    {
      id: 'metadata-registry',
      name: 'Deploy Metadata Registry',
      description: 'Upload metadata registry service and configurations',
      status: 'pending',
      command: 'npm run deploy:metadata'
    },
    {
      id: 'data-governance',
      name: 'Deploy Data Governance',
      description: 'Upload data governance policies and integration logic',
      status: 'pending',
      command: 'npm run deploy:governance'
    },
    {
      id: 'database-integration',
      name: 'Deploy Database Integration',
      description: 'Apply database migrations and governance integration',
      status: 'pending',
      command: 'npm run deploy:database'
    },
    {
      id: 'integration-test',
      name: 'Run Integration Tests',
      description: 'Verify all components are working together',
      status: 'pending',
      command: 'npm run test:integration'
    }
  ]);

  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentLogs, setDeploymentLogs] = useState<string[]>([]);

  const executeDeploymentStep = async (step: DeploymentStep) => {
    setDeploymentSteps(prev => 
      prev.map(s => s.id === step.id ? { ...s, status: 'running' } : s)
    );

    try {
      // Simulate API call to execute deployment command
      const response = await fetch('/api/deployment/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: step.command, stepId: step.id })
      });

      if (response.ok) {
        const result = await response.json();
        setDeploymentLogs(prev => [...prev, `✅ ${step.name}: ${result.message}`]);
        setDeploymentSteps(prev => 
          prev.map(s => s.id === step.id ? { ...s, status: 'completed' } : s)
        );
      } else {
        throw new Error(`Deployment failed: ${response.statusText}`);
      }
    } catch (error) {
      setDeploymentLogs(prev => [...prev, `❌ ${step.name}: ${error.message}`]);
      setDeploymentSteps(prev => 
        prev.map(s => s.id === step.id ? { ...s, status: 'failed' } : s)
      );
      throw error;
    }
  };

  const startDeployment = async () => {
    setIsDeploying(true);
    setDeploymentLogs(['🚀 Starting deployment process...']);

    try {
      for (const step of deploymentSteps) {
        await executeDeploymentStep(step);
      }
      
      setDeploymentLogs(prev => [...prev, '🎉 Deployment completed successfully!']);
      onDeploymentComplete?.();
    } catch (error) {
      setDeploymentLogs(prev => [...prev, `💥 Deployment failed: ${error.message}`]);
    } finally {
      setIsDeploying(false);
    }
  };

  const getStatusIcon = (status: DeploymentStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'running':
        return <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Go Live Deployment</h2>
          <p className="text-sm text-gray-600 mt-1">
            Deploy metadata registry, data governance, and database integration to production
          </p>
        </div>
        <button
          onClick={startDeployment}
          disabled={isDeploying}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PlayIcon className="h-4 w-4 mr-2" />
          {isDeploying ? 'Deploying...' : 'Start Deployment'}
        </button>
      </div>

      {/* Deployment Steps */}
      <div className="space-y-4 mb-6">
        {deploymentSteps.map((step, index) => (
          <div key={step.id} className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              {getStatusIcon(step.status)}
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900">{step.name}</h3>
              <p className="text-sm text-gray-600">{step.description}</p>
              {step.command && (
                <code className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                  {step.command}
                </code>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Deployment Logs */}
      {deploymentLogs.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Deployment Logs</h3>
          <div className="bg-black text-green-400 text-xs font-mono p-3 rounded max-h-40 overflow-y-auto">
            {deploymentLogs.map((log, index) => (
              <div key={index}>{log}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};