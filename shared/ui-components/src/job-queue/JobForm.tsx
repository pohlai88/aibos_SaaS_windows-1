import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Save,
  X,
  Clock,
  AlertTriangle,
  Settings,
  Tag,
  FileText,
  Calendar,
} from 'lucide-react';
import { JobPriority } from './types';

export interface JobFormData {
  name: string;
  data: any;
  priority: JobPriority;
  delay?: number;
  retries?: number;
  retryDelay?: number;
  timeout?: number;
  tags: string[];
  metadata: Record<string, any>;
}

export interface JobFormProps {
  onSubmit: (jobData: JobFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
  initialData?: Partial<JobFormData>;
  showAdvanced?: boolean;
}

const priorityOptions = [
  { value: JobPriority.LOW, label: 'Low', description: 'Background tasks' },
  { value: JobPriority.NORMAL, label: 'Normal', description: 'Standard tasks' },
  { value: JobPriority.HIGH, label: 'High', description: 'Important tasks' },
  { value: JobPriority.URGENT, label: 'Urgent', description: 'Time-sensitive tasks' },
  { value: JobPriority.CRITICAL, label: 'Critical', description: 'System-critical tasks' },
];

export const JobForm: React.FC<JobFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
  error = null,
  className = '',
  initialData,
  showAdvanced = false,
}) => {
  const [formData, setFormData] = useState<JobFormData>({
    name: '',
    data: {},
    priority: JobPriority.NORMAL,
    delay: 0,
    retries: 3,
    retryDelay: 5000,
    timeout: 30000,
    tags: [],
    metadata: {},
    ...initialData,
  });

  const [showAdvancedOptions, setShowAdvancedOptions] = useState(showAdvanced);
  const [newTag, setNewTag] = useState('');
  const [newMetadataKey, setNewMetadataKey] = useState('');
  const [newMetadataValue, setNewMetadataValue] = useState('');
  const [dataInput, setDataInput] = useState(JSON.stringify(formData.data, null, 2));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Parse JSON data
      const parsedData = JSON.parse(dataInput);
      const jobData = { ...formData, data: parsedData };
      await onSubmit(jobData);

      // Reset form on success
      setFormData({
        name: '',
        data: {},
        priority: JobPriority.NORMAL,
        delay: 0,
        retries: 3,
        retryDelay: 5000,
        timeout: 30000,
        tags: [],
        metadata: {},
      });
      setDataInput('{}');
    } catch (err) {
      console.error('Error submitting job:', err);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const addMetadata = () => {
    if (newMetadataKey.trim() && newMetadataValue.trim()) {
      setFormData((prev) => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          [newMetadataKey.trim()]: newMetadataValue.trim(),
        },
      }));
      setNewMetadataKey('');
      setNewMetadataValue('');
    }
  };

  const removeMetadata = (keyToRemove: string) => {
    setFormData((prev) => {
      const newMetadata = { ...prev.metadata };
      delete newMetadata[keyToRemove];
      return { ...prev, metadata: newMetadata };
    });
  };

  const isDataValid = () => {
    try {
      JSON.parse(dataInput);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`bg-white rounded-lg shadow-lg border ${className}`}
    >
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Plus className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Add New Job</h2>
              <p className="text-sm text-gray-600">Configure and submit a new job to the queue</p>
            </div>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">Error:</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>

          <div>
            <label htmlFor="jobName" className="block text-sm font-medium text-gray-700 mb-2">
              Job Name *
            </label>
            <input
              id="jobName"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Enter job name"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="jobPriority" className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              id="jobPriority"
              value={formData.priority}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, priority: e.target.value as JobPriority }))
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {priorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} - {option.description}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="jobData" className="block text-sm font-medium text-gray-700 mb-2">
              Job Data (JSON) *
            </label>
            <textarea
              id="jobData"
              required
              value={dataInput}
              onChange={(e) => setDataInput(e.target.value)}
              placeholder='{"key": "value"}'
              rows={6}
              className={`w-full border rounded-lg px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDataValid() ? 'border-gray-300' : 'border-red-300'
              }`}
            />
            {!isDataValid() && dataInput && (
              <p className="mt-1 text-sm text-red-600">Invalid JSON format</p>
            )}
          </div>
        </div>

        {/* Advanced Options Toggle */}
        <div className="border-t border-gray-200 pt-6">
          <button
            type="button"
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span className="font-medium">Advanced Options</span>
          </button>
        </div>

        {/* Advanced Options */}
        {showAdvancedOptions && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-6 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="jobDelay" className="block text-sm font-medium text-gray-700 mb-2">
                  Delay (ms)
                </label>
                <div className="relative">
                  <input
                    id="jobDelay"
                    type="number"
                    min="0"
                    value={formData.delay}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, delay: Number(e.target.value) }))
                    }
                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
                <p className="mt-1 text-xs text-gray-500">Delay before job execution starts</p>
              </div>

              <div>
                <label
                  htmlFor="jobRetries"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Max Retries
                </label>
                <input
                  id="jobRetries"
                  type="number"
                  min="0"
                  max="10"
                  value={formData.retries}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, retries: Number(e.target.value) }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label
                  htmlFor="jobRetryDelay"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Retry Delay (ms)
                </label>
                <input
                  id="jobRetryDelay"
                  type="number"
                  min="1000"
                  value={formData.retryDelay}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, retryDelay: Number(e.target.value) }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label
                  htmlFor="jobTimeout"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Timeout (ms)
                </label>
                <input
                  id="jobTimeout"
                  type="number"
                  min="1000"
                  value={formData.timeout}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, timeout: Number(e.target.value) }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <div className="flex items-center space-x-2 mb-3">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Enter tag"
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center space-x-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      <Tag className="w-3 h-3" />
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Metadata */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Metadata</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
                <input
                  type="text"
                  value={newMetadataKey}
                  onChange={(e) => setNewMetadataKey(e.target.value)}
                  placeholder="Key"
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  value={newMetadataValue}
                  onChange={(e) => setNewMetadataValue(e.target.value)}
                  placeholder="Value"
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={addMetadata}
                  className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {Object.keys(formData.metadata).length > 0 && (
                <div className="space-y-2">
                  {Object.entries(formData.metadata).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg"
                    >
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">{key}:</span>
                        <span className="text-sm text-gray-600">{value}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMetadata(key)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || !formData.name || !isDataValid()}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isLoading ? 'Adding Job...' : 'Add Job'}</span>
          </button>
        </div>
      </form>
    </motion.div>
  );
};
