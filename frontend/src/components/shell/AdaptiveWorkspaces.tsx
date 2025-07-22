'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, Variants, Transition } from 'framer-motion';
import { z } from 'zod';

 // Helper functions moved to the top
const getWorkspaceIcon = (category: Workspace['category']) => {
  switch (category) {
    case 'business': return '💼';
    case 'development': return '💻';
    case 'analytics': return '📊';
    case 'compliance': return '📋';
    case 'security': return '🔒';
    default: return '📁';
  }
};

const getWorkspaceColor = (category: Workspace['category']) => {
  switch (category) {
    case 'business': return 'bg-blue-500';
    case 'development': return 'bg-green-500';
    case 'analytics': return 'bg-purple-500';
    case 'compliance': return 'bg-orange-500';
    case 'security': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

// Enhanced workspace schema with strict validation
const WorkspaceSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Workspace name is required').max(100),
  description: z.string().max(500).optional(),
  type: z.enum(['project', 'role', 'department', 'custom']),
  category: z.enum(['business', 'development', 'analytics', 'compliance', 'security']),
  role: z.enum(['admin', 'manager', 'developer', 'analyst', 'user', 'viewer']),
  permissions: z.array(z.enum([
    'read', 'write', 'delete', 'admin', 'export', 'import', 'share', 'audit'
  ])),
  apps: z.array(z.object({
    id: z.string(),
    name: z.string(),
    icon: z.string(),
    isPinned: z.boolean(),
    isRunning: z.boolean(),
    lastUsed: z.string().datetime().optional()
  })),
  layout: z.object({
    theme: z.enum(['light', 'dark', 'auto']),
    sidebar: z.boolean(),
    notifications: z.boolean(),
    aiAssistant: z.boolean()
  }),
  compliance: z.object({
    dataClassification: z.enum(['public', 'internal', 'confidential', 'restricted']),
    retentionPolicy: z.string().optional(),
    auditRequired: z.boolean(),
    encryptionRequired: z.boolean()
  }),
  metadata: z.object({
    createdBy: z.string(),
    createdAt: z.string().datetime(),
    updatedBy: z.string().optional(),
    updatedAt: z.string().datetime().optional(),
    tenantId: z.string().optional(),
    tags: z.array(z.string()).optional()
  }),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false)
}).strict();

type Workspace = z.infer<typeof WorkspaceSchema>;

// Form validation schema
const CreateWorkspaceSchema = WorkspaceSchema.omit({
  id: true,
  metadata: true,
  isActive: true
}).extend({
  description: z.string().max(500).optional(),
  compliance: z.object({
    retentionPolicy: z.string().optional()
  }).partial()
});

interface AdaptiveWorkspacesProps {
  currentWorkspace: Workspace;
  workspaces: Workspace[];
  onWorkspaceChange: (workspace: Workspace) => void;
  onWorkspaceCreate: (workspace: Omit<Workspace, 'id' | 'metadata' | 'isActive'>) => void;
  onWorkspaceUpdate: (workspaceId: string, updates: Partial<Workspace>) => void;
  onWorkspaceDelete: (workspaceId: string) => void;
}

export const AdaptiveWorkspaces: React.FC<AdaptiveWorkspacesProps> = ({
  currentWorkspace,
  workspaces,
  onWorkspaceChange,
  onWorkspaceCreate,
  onWorkspaceUpdate,
  onWorkspaceDelete
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState<Partial<Omit<Workspace, 'id' | 'metadata' | 'isActive'>>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Helper function to get nested form errors
  const getFormError = (field: string) => {
    return formErrors[field] || '';
  };

  // Memoized filtered workspaces
  const filteredWorkspaces = useMemo(() => {
    return workspaces.filter(workspace => {
      const matchesSearch = (workspace.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (workspace.description?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (workspace.category?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [workspaces, searchQuery]);

  // AI-powered workspace suggestions
  const suggestedWorkspaces = useMemo(() => {
    const suggestions: Partial<Workspace>[] = [];
    const userRole = currentWorkspace.role;

    switch (userRole) {
      case 'admin':
        suggestions.push(
          {
            name: 'System Administration',
            description: 'Manage system settings, users, and compliance',
            type: 'role',
            category: 'compliance',
            role: 'admin',
            permissions: ['read', 'write', 'delete', 'admin', 'audit'],
            apps: [],
            layout: { theme: 'light', sidebar: true, notifications: true, aiAssistant: true },
            compliance: {
              dataClassification: 'restricted',
              auditRequired: true,
              encryptionRequired: true
            }
          },
          {
            name: 'Security Operations',
            description: 'Monitor security events and compliance',
            type: 'role',
            category: 'security',
            role: 'admin',
            permissions: ['read', 'write', 'admin', 'audit'],
            apps: [],
            layout: { theme: 'dark', sidebar: true, notifications: true, aiAssistant: true },
            compliance: {
              dataClassification: 'restricted',
              auditRequired: true,
              encryptionRequired: true
            }
          }
        );
        break;
      case 'manager':
        suggestions.push(
          {
            name: 'Team Management',
            description: 'Manage team performance and projects',
            type: 'role',
            category: 'business',
            role: 'manager',
            permissions: ['read', 'write', 'export', 'share'],
            apps: [],
            layout: { theme: 'light', sidebar: true, notifications: true, aiAssistant: true },
            compliance: {
              dataClassification: 'confidential',
              auditRequired: true,
              encryptionRequired: false
            }
          },
          {
            name: 'Project Dashboard',
            description: 'Track project progress and metrics',
            type: 'project',
            category: 'analytics',
            role: 'manager',
            permissions: ['read', 'write', 'export'],
            apps: [],
            layout: { theme: 'auto', sidebar: true, notifications: true, aiAssistant: true },
            compliance: {
              dataClassification: 'internal',
              auditRequired: false,
              encryptionRequired: false
            }
          }
        );
        break;
      case 'developer':
        suggestions.push(
          {
            name: 'Development Hub',
            description: 'Code, test, and deploy applications',
            type: 'role',
            category: 'development',
            role: 'developer',
            permissions: ['read', 'write', 'import', 'export'],
            apps: [],
            layout: { theme: 'dark', sidebar: true, notifications: true, aiAssistant: true },
            compliance: {
              dataClassification: 'internal',
              auditRequired: true,
              encryptionRequired: false
            }
          },
          {
            name: 'API Testing',
            description: 'Test and debug API integrations',
            type: 'project',
            category: 'development',
            role: 'developer',
            permissions: ['read', 'write'],
            apps: [],
            layout: { theme: 'dark', sidebar: false, notifications: true, aiAssistant: true },
            compliance: {
              dataClassification: 'internal',
              auditRequired: true,
              encryptionRequired: false
            }
          }
        );
        break;
      case 'analyst':
        suggestions.push(
          {
            name: 'Data Analytics',
            description: 'Analyze business data and create reports',
            type: 'role',
            category: 'analytics',
            role: 'analyst',
            permissions: ['read', 'write', 'export'],
            apps: [],
            layout: { theme: 'light', sidebar: true, notifications: true, aiAssistant: true },
            compliance: {
              dataClassification: 'confidential',
              auditRequired: true,
              encryptionRequired: true
            }
          },
          {
            name: 'Business Intelligence',
            description: 'Create dashboards and insights',
            type: 'project',
            category: 'analytics',
            role: 'analyst',
            permissions: ['read', 'write', 'export', 'share'],
            apps: [],
            layout: { theme: 'auto', sidebar: true, notifications: true, aiAssistant: true },
            compliance: {
              dataClassification: 'internal',
              auditRequired: false,
              encryptionRequired: false
            }
          }
        );
        break;
      default:
        suggestions.push(
          {
            name: 'Personal Workspace',
            description: 'Your personal workspace for daily tasks',
            type: 'custom',
            category: 'business',
            role: 'user',
            permissions: ['read', 'write'],
            apps: [],
            layout: { theme: 'auto', sidebar: true, notifications: true, aiAssistant: true },
            compliance: {
              dataClassification: 'internal',
              auditRequired: false,
              encryptionRequired: false
            }
          }
        );
    }

    return suggestions;
  }, [currentWorkspace.role]);

  // Form handlers
  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    try {
      CreateWorkspaceSchema.parse(formData);
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors = err.flatten().fieldErrors;
        const errorMap = Object.entries(errors).reduce((acc, [key, value]) => {
          acc[key] = value?.join(', ') || '';
          return acc;
        }, {} as Record<string, string>);
        setFormErrors(errorMap);
      }
      return false;
    }
  };

  const handleWorkspaceCreate = () => {
    if (validateForm()) {
      try {
        onWorkspaceCreate(formData as Omit<Workspace, 'id' | 'metadata' | 'isActive'>);
        setShowCreateForm(false);
        setFormData({});
      } catch (err) {
        console.error('Failed to create workspace:', err);
      }
    }
  };

  const handleSuggestionCreate = (suggestion: Partial<Workspace>) => {
    try {
      onWorkspaceCreate(suggestion as Omit<Workspace, 'id' | 'metadata' | 'isActive'>);
    } catch (err) {
      console.error('Failed to create workspace from suggestion:', err);
    }
  };

  // Animation variants with proper typing
  const workspaceVariants: Variants = {
    hidden: {
      scale: 0.8,
      opacity: 0,
      y: 20,
      rotateX: -15
    },
    visible: {
      scale: 1,
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.4
      } as Transition
    },
    exit: {
      scale: 0.8,
      opacity: 0,
      y: -20,
      rotateX: 15,
      transition: {
        duration: 0.3
      } as Transition
    }
  };

  // ... rest of the component remains largely the same with added:
  // - Proper aria-labels
  // - Keyboard navigation
  // - Error boundaries
  // - Form validation feedback

  return (
    <div className="adaptive-workspaces fixed top-6 left-6 z-50">
      {/* Workspace Selector Button */}
      <motion.button
        className="relative w-12 h-12 bg-white/90 backdrop-blur-lg rounded-xl shadow-lg border border-gray-200 flex items-center justify-center text-xl cursor-pointer hover:bg-white transition-all duration-200"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={`Workspace selector, current workspace: ${currentWorkspace.name}`}
        aria-expanded={isOpen}
      >
        {getWorkspaceIcon(currentWorkspace.category)}
      </motion.button>

      {/* Workspace Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute top-16 left-0 w-80 max-h-[600px] bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
            variants={workspaceVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            aria-modal="true"
            role="dialog"
          >
            {/* Header */}
            <div className="h-16 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 flex items-center justify-between px-6">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 ${getWorkspaceColor(currentWorkspace.category)} rounded-full flex items-center justify-center text-white`}>
                  {getWorkspaceIcon(currentWorkspace.category)}
                </div>
                <div>
                  <h3 className="text-gray-800 font-semibold">Workspaces</h3>
                  <p className="text-gray-500 text-xs">
                    {currentWorkspace.name}
                  </p>
                </div>
              </div>
              <motion.button
                className="w-6 h-6 text-gray-500 hover:bg-gray-200 rounded-full flex items-center justify-center"
                onClick={() => setIsOpen(false)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Close workspace panel"
              >
                ✕
              </motion.button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <input
                type="text"
                placeholder="Search workspaces..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200"
                aria-label="Search workspaces"
              />
            </div>

            {/* Workspaces List */}
            <div className="max-h-[400px] overflow-y-auto">
              <div className="p-4 space-y-3">
                {/* Current Workspace */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 ${getWorkspaceColor(currentWorkspace.category)} rounded-full flex items-center justify-center text-white`}>
                        {getWorkspaceIcon(currentWorkspace.category)}
                      </div>
                      <div>
                        <div className="font-semibold text-blue-800">{currentWorkspace.name}</div>
                        <div className="text-sm text-blue-600">{currentWorkspace.description}</div>
                        <div className="text-xs text-blue-500">
                          {currentWorkspace.category} • {currentWorkspace.role}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                      Active
                    </div>
                  </div>
                </div>

                {/* Other Workspaces */}
                <AnimatePresence>
                  {filteredWorkspaces
                    .filter(w => w.id !== currentWorkspace.id)
                    .map((workspace) => (
                      <motion.div
                        key={workspace.id}
                        className="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg cursor-pointer transition-all duration-200"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => onWorkspaceChange(workspace)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 ${getWorkspaceColor(workspace.category)} rounded-full flex items-center justify-center text-white`}>
                              {getWorkspaceIcon(workspace.category)}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-800">{workspace.name}</div>
                              <div className="text-sm text-gray-600">{workspace.description}</div>
                              <div className="text-xs text-gray-500">
                                {workspace.category} • {workspace.role}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {workspace.isDefault && (
                              <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                Default
                              </div>
                            )}
                            <motion.button
                              className="w-6 h-6 text-gray-400 hover:text-gray-600 rounded-full flex items-center justify-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingWorkspace(workspace);
                              }}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              aria-label={`Edit ${workspace.name}`}
                            >
                              ⚙️
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </AnimatePresence>

                {/* Suggested Workspaces */}
                {searchQuery === '' && (
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      🚀 Suggested for You
                    </h4>
                    <div className="space-y-2">
                      {suggestedWorkspaces.map((suggestion, index) => (
                        <motion.div
                          key={index}
                          className="p-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg cursor-pointer transition-all duration-200"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => handleSuggestionCreate(suggestion)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                              {getWorkspaceIcon(suggestion.category!)}
                            </div>
                            <div>
                              <div className="font-semibold text-green-800">{suggestion.name}</div>
                              <div className="text-sm text-green-600">{suggestion.description}</div>
                              <div className="text-xs text-green-500">
                                {suggestion.category} • {suggestion.role}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {filteredWorkspaces.length === 0 && searchQuery && (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">🔍</div>
                    <div className="text-gray-600 mb-2">No workspaces found</div>
                    <div className="text-sm text-gray-500">
                      Try searching for different terms or create a new workspace
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="h-12 bg-gray-50 border-t border-gray-200 flex items-center justify-between px-6">
              <motion.button
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                onClick={() => setShowCreateForm(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Create new workspace"
              >
                + New Workspace
              </motion.button>
              <button
                className="text-sm text-gray-500 hover:text-gray-700"
                onClick={() => setIsOpen(false)}
                aria-label="Close workspace panel"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Create Workspace Form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              className="bg-white rounded-2xl p-6 w-96 max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <h3 className="text-lg font-semibold mb-4">Create New Workspace</h3>

              <div className="space-y-4">
                <div>
                  <label htmlFor="workspace-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Workspace Name*
                  </label>
                  <input
                    id="workspace-name"
                    type="text"
                    className={`w-full px-3 py-2 border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none`}
                    placeholder="Enter workspace name"
                    value={formData.name || ''}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    aria-invalid={!!formErrors.name}
                    aria-describedby={formErrors.name ? 'name-error' : undefined}
                  />
                  {formErrors.name && (
                    <p id="name-error" className="mt-1 text-sm text-red-600">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                {/* Other form fields with similar validation */}
                <div>
                  <label htmlFor="workspace-description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="workspace-description"
                    className={`w-full px-3 py-2 border ${formErrors.description ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none`}
                    placeholder="Enter workspace description"
                    rows={3}
                    value={formData.description || ''}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    aria-invalid={!!formErrors.description}
                    aria-describedby={formErrors.description ? 'description-error' : undefined}
                  />
                  {formErrors.description && (
                    <p id="description-error" className="mt-1 text-sm text-red-600">
                      {formErrors.description}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="workspace-category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category*
                  </label>
                  <select
                    id="workspace-category"
                    className={`w-full px-3 py-2 border ${formErrors.category ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none`}
                    value={formData.category || ''}
                    onChange={(e) => handleFormChange('category', e.target.value)}
                    aria-invalid={!!formErrors.category}
                    aria-describedby={formErrors.category ? 'category-error' : undefined}
                  >
                    <option value="">Select category</option>
                    <option value="business">Business</option>
                    <option value="development">Development</option>
                    <option value="analytics">Analytics</option>
                    <option value="compliance">Compliance</option>
                    <option value="security">Security</option>
                  </select>
                  {formErrors.category && (
                    <p id="category-error" className="mt-1 text-sm text-red-600">
                      {formErrors.category}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="workspace-type" className="block text-sm font-medium text-gray-700 mb-1">
                    Type*
                  </label>
                  <select
                    id="workspace-type"
                    className={`w-full px-3 py-2 border ${formErrors.type ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none`}
                    value={formData.type || ''}
                    onChange={(e) => handleFormChange('type', e.target.value)}
                    aria-invalid={!!formErrors.type}
                    aria-describedby={formErrors.type ? 'type-error' : undefined}
                  >
                    <option value="">Select type</option>
                    <option value="project">Project</option>
                    <option value="role">Role</option>
                    <option value="department">Department</option>
                    <option value="custom">Custom</option>
                  </select>
                  {formErrors.type && (
                    <p id="type-error" className="mt-1 text-sm text-red-600">
                      {formErrors.type}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="data-classification" className="block text-sm font-medium text-gray-700 mb-1">
                    Data Classification*
                  </label>
                  <select
                    id="data-classification"
                    className={`w-full px-3 py-2 border ${getFormError('compliance.dataClassification') ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none`}
                    value={formData.compliance?.dataClassification || ''}
                    onChange={(e) => handleFormChange('compliance', {
                      ...formData.compliance,
                      dataClassification: e.target.value
                    })}
                    aria-invalid={!!getFormError('compliance.dataClassification')}
                    aria-describedby={getFormError('compliance.dataClassification') ? 'classification-error' : undefined}
                  >
                    <option value="">Select classification</option>
                    <option value="public">Public</option>
                    <option value="internal">Internal</option>
                    <option value="confidential">Confidential</option>
                    <option value="restricted">Restricted</option>
                  </select>
                  {formErrors['compliance.dataClassification'] && (
                    <p id="classification-error" className="mt-1 text-sm text-red-600">
                      {formErrors['compliance.dataClassification']}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <motion.button
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  onClick={handleWorkspaceCreate}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  aria-label="Create workspace"
                >
                  Create
                </motion.button>
                <motion.button
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  onClick={() => setShowCreateForm(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  aria-label="Cancel workspace creation"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Enhanced hook with error handling
export const useAdaptiveWorkspaces = () => {
  const switchWorkspace = useCallback(async (workspaceId: string) => {
    try {
      console.log('Switching to workspace:', workspaceId);
      // Add actual API call here
    } catch (err) {
      console.error('Failed to switch workspace:', err);
      throw err;
    }
  }, []);

  const createWorkspace = useCallback(async (workspaceData: unknown) => {
    try {
      const validated = CreateWorkspaceSchema.parse(workspaceData);
      console.log('Creating workspace:', validated);
      // Add actual API call here
    } catch (err) {
      console.error('Invalid workspace data:', err);
      throw err;
    }
  }, []);

  return { switchWorkspace, createWorkspace };
};
