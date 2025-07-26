'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Grid, Plus, Trash2, Edit, Copy, Star, Clock,
  Monitor, Smartphone, Tablet, Layers, Zap
} from 'lucide-react';

// ==================== TYPES ====================

interface Workspace {
  id: string;
  name: string;
  windows: any[];
  consciousness: number;
  createdAt: Date;
}

interface WorkspaceManagerProps {
  workspaces: Workspace[];
  activeWorkspace: string;
  onCreateWorkspace: (name: string) => string;
  onSwitchWorkspace: (workspaceId: string) => void;
}

// ==================== WORKSPACE MANAGER ====================

const WorkspaceManager: React.FC<WorkspaceManagerProps> = ({
  workspaces,
  activeWorkspace,
  onCreateWorkspace,
  onSwitchWorkspace
}) => {
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<string | null>(null);

  const handleCreateWorkspace = () => {
    if (newWorkspaceName.trim()) {
      const workspaceId = onCreateWorkspace(newWorkspaceName.trim());
      setNewWorkspaceName('');
      setIsCreating(false);
      onSwitchWorkspace(workspaceId);
    }
  };

  const handleDuplicateWorkspace = (workspace: Workspace) => {
    const newName = `${workspace.name} (Copy)`;
    const workspaceId = onCreateWorkspace(newName);
    onSwitchWorkspace(workspaceId);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="h-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Workspace Manager</h2>
          <motion.button
            onClick={() => setIsCreating(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={16} />
            <span>New Workspace</span>
          </motion.button>
        </div>

        {/* Create New Workspace */}
        <AnimatePresence>
          {isCreating && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  placeholder="Enter workspace name..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateWorkspace()}
                  autoFocus
                />
                <button
                  onClick={handleCreateWorkspace}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setNewWorkspaceName('');
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Workspaces Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((workspace, index) => (
            <motion.div
              key={workspace.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative p-4 rounded-lg border-2 transition-all cursor-pointer ${
                workspace.id === activeWorkspace
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-purple-300 dark:hover:border-purple-600'
              }`}
              onClick={() => onSwitchWorkspace(workspace.id)}
            >
              {/* Active Indicator */}
              {workspace.id === activeWorkspace && (
                <div className="absolute top-2 right-2 w-3 h-3 bg-purple-500 rounded-full animate-pulse" />
              )}

              {/* Workspace Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Grid size={20} className="text-purple-500" />
                  <h3 className="font-semibold text-lg">{workspace.name}</h3>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicateWorkspace(workspace);
                    }}
                    className="p-1 text-gray-500 hover:text-blue-500 transition-colors"
                    title="Duplicate"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingWorkspace(workspace.id);
                    }}
                    className="p-1 text-gray-500 hover:text-yellow-500 transition-colors"
                    title="Edit"
                  >
                    <Edit size={14} />
                  </button>
                </div>
              </div>

              {/* Workspace Stats */}
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center justify-between">
                  <span>Windows</span>
                  <span className="font-medium">{workspace.windows.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Consciousness</span>
                  <span className="font-medium">{workspace.consciousness}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Created</span>
                  <span className="font-medium">{formatDate(workspace.createdAt)}</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Quick Actions</span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Add quick action here
                      }}
                      className="p-1 text-gray-400 hover:text-purple-500 transition-colors"
                      title="Pin to Dock"
                    >
                      <Star size={12} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Add quick action here
                      }}
                      className="p-1 text-gray-400 hover:text-purple-500 transition-colors"
                      title="Export"
                    >
                      <Zap size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {workspaces.length === 0 && (
          <div className="text-center py-12">
            <Grid size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
              No Workspaces Yet
            </h3>
            <p className="text-gray-500 dark:text-gray-500 mb-4">
              Create your first workspace to get started
            </p>
            <button
              onClick={() => setIsCreating(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Create Workspace
            </button>
          </div>
        )}

        {/* Keyboard Shortcuts Help */}
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="font-semibold mb-3">Keyboard Shortcuts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
            <div><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Ctrl/Cmd + N</kbd> New Workspace</div>
            <div><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Ctrl/Cmd + 1-9</kbd> Switch Workspace</div>
            <div><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Ctrl/Cmd + T</kbd> Toggle Consciousness</div>
            <div><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Ctrl/Cmd + G</kbd> Toggle Grid</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceManager;
