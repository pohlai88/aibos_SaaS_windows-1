'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Cpu, Zap, Target, BarChart3, Plus, Settings, Activity,
  Play, Pause, RotateCcw, CheckCircle, AlertTriangle, Clock,
  Layers, Database, Cloud, Server, TrendingUp, Star, Code
} from 'lucide-react';

import {
  customAIModelTraining,
  ModelType,
  ModelStatus,
  TrainingStatus,
  DeploymentStatus,
  AIModel,
  TrainingJob,
  ModelDeployment,
  ModelMetrics
} from '@/lib/custom-ai-model-training';

interface CustomAIModelTrainingDashboardProps {
  className?: string;
}

export default function CustomAIModelTrainingDashboard({ className = '' }: CustomAIModelTrainingDashboardProps) {
  const [modelMetrics, setModelMetrics] = useState<ModelMetrics | null>(null);
  const [models, setModels] = useState<AIModel[]>([]);
  const [trainingJobs, setTrainingJobs] = useState<TrainingJob[]>([]);
  const [deployments, setDeployments] = useState<ModelDeployment[]>([]);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'models' | 'training' | 'deployments' | 'create'>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(10000);

  const [modelForm, setModelForm] = useState({
    name: '',
    description: '',
    type: 'classification' as ModelType,
    aiEnhanced: true,
    quantumEnhanced: false
  });

  useEffect(() => {
    initializeModelData();
    const interval = setInterval(() => {
      if (autoRefresh) refreshModelData();
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const initializeModelData = useCallback(async () => {
    setIsLoading(true);
    try {
      await refreshModelData();
    } catch (err) {
      console.error('Init error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshModelData = useCallback(async () => {
    try {
      // Real API call to backend model training endpoint
      const response = await fetch('/api/custom-ai-model-training/metrics', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Model Training API error: ${response.status}`);
      }

      const data = await response.json();
      setModelMetrics(data.metrics);
      setModels(data.models || []);
      setTrainingJobs(data.trainingJobs || []);
      setDeployments(data.deployments || []);
    } catch (err) {
      console.error('Model Training API error:', err);
      // Set empty state on error
      setModelMetrics(null);
      setModels([]);
      setTrainingJobs([]);
      setDeployments([]);
    }
  }, []);

  const createModel = useCallback(async () => {
    if (!modelForm.name || !modelForm.description) return;
    setIsLoading(true);
    try {
      // Real API call to create AI model
      const response = await fetch('/api/custom-ai-model-training/models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(modelForm),
      });

      if (!response.ok) {
        throw new Error(`Create model API error: ${response.status}`);
      }

      const model = await response.json();
      setModels(prev => [...prev, model]);
      setModelForm({ name: '', description: '', type: 'classification', aiEnhanced: true, quantumEnhanced: false });
      await refreshModelData();
    } catch (err) {
      console.error('Create model API error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [modelForm, refreshModelData]);

  const startTraining = useCallback(async (modelId: string) => {
    setIsLoading(true);
    try {
      // Real API call to start training
      const response = await fetch(`/api/custom-ai-model-training/models/${modelId}/train`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Start training API error: ${response.status}`);
      }

      const trainingJob = await response.json();
      setTrainingJobs(prev => [...prev, trainingJob]);
      await refreshModelData();
    } catch (err) {
      console.error('Start training API error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [refreshModelData]);

  const deployModel = useCallback(async (modelId: string) => {
    setIsLoading(true);
    try {
      // Real API call to deploy model
      const response = await fetch(`/api/custom-ai-model-training/models/${modelId}/deploy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Deploy model API error: ${response.status}`);
      }

      const deployment = await response.json();
      setDeployments(prev => [...prev, deployment]);
      await refreshModelData();
    } catch (err) {
      console.error('Deploy model API error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [refreshModelData]);

  const renderOverview = () => {
    if (!modelMetrics) {
      return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-gray-900 p-12 rounded-lg border border-gray-700 text-center">
            <Brain className="w-16 h-16 mx-auto mb-4 text-gray-500" />
            <h3 className="text-xl text-white mb-2">No AI Models Available</h3>
            <p className="text-gray-400 mb-6">Start by creating your first custom AI model to begin training and deployment.</p>
            <button
              onClick={() => setSelectedTab('create')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
            >
              Create AI Model
            </button>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Total Models" value={modelMetrics.totalModels} icon={Brain} color="blue" />
          <MetricCard title="Active Models" value={modelMetrics.activeModels} icon={Target} color="green" />
          <MetricCard title="AI Optimization" value={`${(modelMetrics.aiOptimizationRate * 100).toFixed(1)}%`} icon={Zap} color="purple" />
          <MetricCard title="Average Accuracy" value={`${(modelMetrics.averageAccuracy * 100).toFixed(1)}%`} icon={TrendingUp} color="orange" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg text-white mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Model Training Metrics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Training Jobs</span>
                <span className="text-blue-400 font-semibold">{modelMetrics.trainingJobs}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Deployed Models</span>
                <span className="text-green-400 font-semibold">{modelMetrics.deployedModels}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Avg Training Time</span>
                <span className="text-purple-400 font-semibold">{Math.round(modelMetrics.averageTrainingTime / 1000)}s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Quantum Optimization</span>
                <span className="text-orange-400 font-semibold">{(modelMetrics.quantumOptimizationRate * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg text-white mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => setSelectedTab('create')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Create New Model
              </button>
              <button
                onClick={() => setSelectedTab('training')}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Monitor Training
              </button>
              <button
                onClick={() => setSelectedTab('deployments')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
              >
                Manage Deployments
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderModels = () => {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg text-white mb-4">Custom AI Models</h3>
          {models.length === 0 ? (
            <div className="text-center py-8">
              <Brain className="w-12 h-12 mx-auto mb-3 text-gray-500" />
              <p className="text-gray-400 mb-4">No models created yet</p>
              <p className="text-sm text-gray-500">Create your first custom AI model to start training and deployment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {models.map(model => (
                <div key={model.id} className="bg-gray-800 p-4 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-white font-semibold">{model.name}</h4>
                      <p className="text-gray-400 text-sm">{model.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {model.aiEnhanced && <span className="text-blue-400 text-xs">AI</span>}
                      {model.quantumEnhanced && <span className="text-purple-400 text-xs">Quantum</span>}
                      <span className={`px-2 py-1 rounded text-xs ${
                        model.status === 'ready' ? 'bg-green-600 text-white' :
                        model.status === 'training' ? 'bg-blue-600 text-white' :
                        model.status === 'deployed' ? 'bg-purple-600 text-white' :
                        model.status === 'draft' ? 'bg-gray-600 text-white' :
                        'bg-red-600 text-white'
                      }`}>
                        {model.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center mt-3 space-x-2">
                    <span className="text-sm text-gray-500">Type: {model.type}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">Version: {model.version}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">Accuracy: {(model.performance.accuracy * 100).toFixed(1)}%</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{model.updatedAt.toLocaleDateString()}</span>
                    {model.status === 'draft' && (
                      <>
                        <span className="text-sm text-gray-500">•</span>
                        <button
                          onClick={() => startTraining(model.id)}
                          className="text-green-400 hover:text-green-300 text-sm"
                          disabled={isLoading}
                        >
                          {isLoading ? 'Starting...' : 'Start Training'}
                        </button>
                      </>
                    )}
                    {model.status === 'ready' && (
                      <>
                        <span className="text-sm text-gray-500">•</span>
                        <button
                          onClick={() => deployModel(model.id)}
                          className="text-purple-400 hover:text-purple-300 text-sm"
                          disabled={isLoading}
                        >
                          {isLoading ? 'Deploying...' : 'Deploy Model'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const renderTraining = () => {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg text-white mb-4">Training Jobs</h3>
          {trainingJobs.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 mx-auto mb-3 text-gray-500" />
              <p className="text-gray-400 mb-4">No training jobs running</p>
              <p className="text-sm text-gray-500">Start training a model to see active training jobs.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {trainingJobs.map(job => (
                <div key={job.id} className="bg-gray-800 p-4 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-white font-semibold">Training Job {job.id.slice(0, 8)}</h4>
                      <p className="text-gray-400 text-sm">Model: {models.find(m => m.id === job.modelId)?.name || 'Unknown'}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        job.status === 'running' ? 'bg-green-600 text-white' :
                        job.status === 'pending' ? 'bg-blue-600 text-white' :
                        job.status === 'completed' ? 'bg-gray-600 text-white' :
                        'bg-red-600 text-white'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-sm text-gray-300 mb-1">
                      <span>Progress</span>
                      <span>{job.progress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center mt-3 space-x-2">
                    <span className="text-sm text-gray-500">Epoch: {job.currentEpoch}/{job.totalEpochs}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">Accuracy: {(job.metrics.accuracy * 100).toFixed(1)}%</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">Loss: {job.metrics.loss.toFixed(4)}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{job.startTime.toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const renderDeployments = () => {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg text-white mb-4">Model Deployments</h3>
          {deployments.length === 0 ? (
            <div className="text-center py-8">
              <Cloud className="w-12 h-12 mx-auto mb-3 text-gray-500" />
              <p className="text-gray-400 mb-4">No deployments active</p>
              <p className="text-sm text-gray-500">Deploy a trained model to see active deployments.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {deployments.map(deployment => (
                <div key={deployment.id} className="bg-gray-800 p-4 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-white font-semibold">Deployment {deployment.id.slice(0, 8)}</h4>
                      <p className="text-gray-400 text-sm">Model: {models.find(m => m.id === deployment.modelId)?.name || 'Unknown'}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        deployment.status === 'active' ? 'bg-green-600 text-white' :
                        deployment.status === 'deploying' ? 'bg-blue-600 text-white' :
                        deployment.status === 'failed' ? 'bg-red-600 text-white' :
                        'bg-gray-600 text-white'
                      }`}>
                        {deployment.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center mt-3 space-x-2">
                    <span className="text-sm text-gray-500">Environment: {deployment.environment.type}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">Provider: {deployment.environment.provider}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">Endpoints: {deployment.endpoints.length}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{deployment.createdAt.toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const renderCreate = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
        <h3 className="text-lg text-white mb-4">Create Custom AI Model</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">Model Name</label>
            <input
              className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
              placeholder="Enter model name"
              value={modelForm.name}
              onChange={e => setModelForm({ ...modelForm, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-2">Description</label>
            <textarea
              className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
              placeholder="Describe the model purpose"
              rows={3}
              value={modelForm.description}
              onChange={e => setModelForm({ ...modelForm, description: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-2">Model Type</label>
            <select
              className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
              value={modelForm.type}
              onChange={e => setModelForm({ ...modelForm, type: e.target.value as ModelType })}
            >
              <option value="classification">Classification</option>
              <option value="regression">Regression</option>
              <option value="clustering">Clustering</option>
              <option value="nlp">Natural Language Processing</option>
              <option value="computer_vision">Computer Vision</option>
              <option value="audio">Audio Processing</option>
              <option value="multimodal">Multi-Modal</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={modelForm.aiEnhanced}
                onChange={e => setModelForm({ ...modelForm, aiEnhanced: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-300">AI Enhanced</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={modelForm.quantumEnhanced}
                onChange={e => setModelForm({ ...modelForm, quantumEnhanced: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-300">Quantum Enhanced</span>
            </label>
          </div>
          <button
            onClick={createModel}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
            disabled={isLoading || !modelForm.name || !modelForm.description}
          >
            {isLoading ? 'Creating...' : 'Create Model'}
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className={`min-h-screen bg-gray-950 text-white p-6 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold flex items-center">
              <Brain className="w-8 h-8 mr-3 text-blue-400" />
              Custom AI Model Training
            </h1>
            <button onClick={refreshModelData} className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded">
              <Activity className="w-4 h-4 inline-block mr-1" /> Refresh
            </button>
          </div>
        </motion.div>

        <div className="mb-6">
          <div className="flex space-x-1 overflow-x-auto">
            {['overview', 'models', 'training', 'deployments', 'create'].map(tab => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab as any)}
                className={`px-4 py-2 rounded whitespace-nowrap ${
                  selectedTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {selectedTab === 'overview' && renderOverview()}
          {selectedTab === 'models' && renderModels()}
          {selectedTab === 'training' && renderTraining()}
          {selectedTab === 'deployments' && renderDeployments()}
          {selectedTab === 'create' && renderCreate()}
        </AnimatePresence>
      </div>
    </div>
  );
}

const MetricCard = ({ title, value, icon: Icon, color }: { title: string; value: React.ReactNode; icon: any; color: string }) => (
  <div className={`bg-${color}-500/20 p-4 border border-${color}-500/30 rounded-lg`}>
    <div className="flex justify-between items-center">
      <div>
        <p className={`text-sm text-${color}-300`}>{title}</p>
        <p className={`text-2xl font-bold text-${color}-100`}>{value}</p>
      </div>
      <Icon className={`w-8 h-8 text-${color}-400`} />
    </div>
  </div>
);
