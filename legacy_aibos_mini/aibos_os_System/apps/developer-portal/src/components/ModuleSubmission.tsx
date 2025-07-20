'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  Code, 
  DollarSign, 
  CheckCircle, 
  AlertCircle,
  Package,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';

import { Button } from '@aibos/ui-components';
import { Card } from '@aibos/ui-components';
import { Input } from '@aibos/ui-components';
import { Modal } from '@aibos/ui-components';
import { LoadingSpinner } from '@aibos/ui-components';

interface ModuleSubmissionForm {
  name: string;
  version: string;
  description: string;
  category: string;
  tags: string;
  pricing: 'free' | 'paid';
  price?: number;
  license: string;
  documentation: string;
  repository?: string;
  website?: string;
}

interface ModuleSubmissionProps {
  developerId: string;
  onSubmit: (data: ModuleSubmissionForm, files: File[]) => Promise<void>;
}

export const ModuleSubmission: React.FC<ModuleSubmissionProps> = ({
  developerId,
  onSubmit
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset
  } = useForm<ModuleSubmissionForm>();

  const pricing = watch('pricing');

  // Handle file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validate files
    const validFiles = files.filter(file => {
      // Check file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 50MB.`);
        return false;
      }
      
      // Check file type
      const allowedTypes = [
        'application/zip',
        'application/x-zip-compressed',
        'application/x-tar',
        'application/gzip'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name} is not a supported file type. Please upload ZIP or TAR files.`);
        return false;
      }
      
      return true;
    });

    setUploadedFiles(validFiles);
    toast.success(`${validFiles.length} file(s) uploaded successfully`);
  }, []);

  // Handle form submission
  const handleFormSubmit = async (data: ModuleSubmissionForm) => {
    if (uploadedFiles.length === 0) {
      toast.error('Please upload at least one module file');
      return;
    }

    setIsSubmitting(true);
    setValidationErrors([]);

    try {
      // Validate module data
      const errors: string[] = [];
      
      if (!data.name.trim()) {
        errors.push('Module name is required');
      }
      
      if (!data.version.match(/^\d+\.\d+\.\d+$/)) {
        errors.push('Version must be in semver format (x.y.z)');
      }
      
      if (!data.description.trim()) {
        errors.push('Description is required');
      }
      
      if (!data.category) {
        errors.push('Category is required');
      }
      
      if (data.pricing === 'paid' && (!data.price || data.price <= 0)) {
        errors.push('Price is required for paid modules');
      }

      if (errors.length > 0) {
        setValidationErrors(errors);
        toast.error('Please fix the validation errors');
        return;
      }

      await onSubmit(data, uploadedFiles);
      
      toast.success('Module submitted successfully! It will be reviewed within 48 hours.');
      reset();
      setUploadedFiles([]);
      
    } catch (error) {
      console.error('Module submission error:', error);
      toast.error('Failed to submit module. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { value: 'accounting', label: 'Accounting' },
    { value: 'crm', label: 'CRM' },
    { value: 'hr', label: 'HR' },
    { value: 'workflow', label: 'Workflow' },
    { value: 'procurement', label: 'Procurement' },
    { value: 'tax', label: 'Tax' },
    { value: 'reporting', label: 'Reporting' },
    { value: 'integration', label: 'Integration' },
    { value: 'utility', label: 'Utility' },
    { value: 'custom', label: 'Custom' }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Submit Your Module
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Share your custom module with the AI-BOS community
        </p>
      </motion.div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
        >
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h3 className="font-medium text-red-800 dark:text-red-200">
              Validation Errors
            </h3>
          </div>
          <ul className="list-disc list-inside space-y-1 text-sm text-red-700 dark:text-red-300">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </motion.div>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* File Upload Section */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Upload className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Module Files
            </h2>
          </div>
          
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
            <input
              type="file"
              multiple
              accept=".zip,.tar,.gz"
              onChange={handleFileUpload}
              className="hidden"
              id="module-files"
            />
            <label
              htmlFor="module-files"
              className="cursor-pointer flex flex-col items-center space-y-4"
            >
              <Upload className="w-12 h-12 text-gray-400" />
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  Upload Module Files
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Drag and drop or click to upload ZIP/TAR files
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Maximum size: 50MB per file
                </p>
              </div>
            </label>
          </div>

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              <h3 className="font-medium text-gray-900 dark:text-white">
                Uploaded Files ({uploadedFiles.length})
              </h3>
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Package className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {file.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Module Information */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Module Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Module Name *
              </label>
              <Input
                {...register('name', { required: true })}
                placeholder="e.g., Advanced Reporting"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">Module name is required</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Version *
              </label>
              <Input
                {...register('version', { 
                  required: true,
                  pattern: /^\d+\.\d+\.\d+$/
                })}
                placeholder="e.g., 1.0.0"
                className={errors.version ? 'border-red-500' : ''}
              />
              {errors.version && (
                <p className="text-sm text-red-600 mt-1">Version must be in semver format (x.y.z)</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                {...register('description', { required: true })}
                rows={4}
                placeholder="Describe what your module does..."
                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white ${
                  errors.description ? 'border-red-500' : ''
                }`}
              />
              {errors.description && (
                <p className="text-sm text-red-600 mt-1">Description is required</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category *
              </label>
              <select
                {...register('category', { required: true })}
                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white ${
                  errors.category ? 'border-red-500' : ''
                }`}
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-sm text-red-600 mt-1">Category is required</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <Input
                {...register('tags')}
                placeholder="e.g., reporting, analytics, dashboard"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Comma-separated tags for better discoverability
              </p>
            </div>
          </div>
        </Card>

        {/* Pricing & Licensing */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Pricing & Licensing
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pricing Model *
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="free"
                    {...register('pricing', { required: true })}
                    className="text-blue-600"
                  />
                  <span className="text-gray-900 dark:text-white">Free</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="paid"
                    {...register('pricing', { required: true })}
                    className="text-blue-600"
                  />
                  <span className="text-gray-900 dark:text-white">Paid</span>
                </label>
              </div>
            </div>

            {pricing === 'paid' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price (USD) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('price', { 
                    required: pricing === 'paid',
                    min: 0
                  })}
                  placeholder="e.g., 29.99"
                  className={errors.price ? 'border-red-500' : ''}
                />
                {errors.price && (
                  <p className="text-sm text-red-600 mt-1">Price is required for paid modules</p>
                )}
              </div>
            )}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                License *
              </label>
              <select
                {...register('license', { required: true })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              >
                <option value="">Select a license</option>
                <option value="MIT">MIT License</option>
                <option value="Apache-2.0">Apache 2.0</option>
                <option value="GPL-3.0">GPL 3.0</option>
                <option value="Proprietary">Proprietary</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Additional Information */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Settings className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Additional Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Documentation URL
              </label>
              <Input
                {...register('documentation')}
                placeholder="https://docs.example.com"
                type="url"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Repository URL
              </label>
              <Input
                {...register('repository')}
                placeholder="https://github.com/username/repo"
                type="url"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Website
              </label>
              <Input
                {...register('website')}
                placeholder="https://example.com"
                type="url"
              />
            </div>
          </div>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPreview(true)}
            disabled={isSubmitting}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Submitting...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Submit Module
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="Module Preview"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            This is how your module will appear in the store:
          </p>
          
          <Card className="p-4">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
              {watch('name') || 'Module Name'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Version {watch('version') || '1.0.0'} • {watch('category') || 'Category'}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              {watch('description') || 'Module description will appear here...'}
            </p>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  By {developerId}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {watch('pricing') === 'paid' ? (
                  <span className="font-semibold text-green-600">
                    ${watch('price') || '0'}
                  </span>
                ) : (
                  <span className="font-semibold text-green-600">Free</span>
                )}
              </div>
            </div>
          </Card>
        </div>
      </Modal>
    </div>
  );
}; 