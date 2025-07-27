'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Command, Search, X, Settings, Keyboard,
  Zap, Star, Clock, Eye, EyeOff, HelpCircle
} from 'lucide-react';

// ==================== TYPES ====================

export interface Shortcut {
  id: string;
  key: string;
  description: string;
  category: string;
  action: () => void;
  isGlobal?: boolean;
  isEnabled?: boolean;
  icon?: React.ComponentType<any>;
}

export interface ShortcutCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  shortcuts: Shortcut[];
}

// ==================== KEYBOARD SHORTCUTS MANAGER ====================

const KeyboardShortcuts: React.FC = () => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('general');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingShortcut, setRecordingShortcut] = useState<string | null>(null);
  const [customShortcuts, setCustomShortcuts] = useState<Record<string, string>>({});
  const searchRef = useRef<HTMLInputElement>(null);

  // ==================== SHORTCUT CATEGORIES ====================

  const shortcutCategories: ShortcutCategory[] = [
    {
      id: 'general',
      name: 'General',
      description: 'Basic system shortcuts',
      icon: Zap,
      shortcuts: [
        {
          id: 'help',
          key: 'Ctrl+Shift+/',
          description: 'Show keyboard shortcuts',
          category: 'general',
          action: () => setIsHelpOpen(true),
          isGlobal: true
        },
        {
          id: 'search',
          key: 'Ctrl+K',
          description: 'Global search',
          category: 'general',
          action: () => console.log('Global search'),
          isGlobal: true
        },
        {
          id: 'settings',
          key: 'Ctrl+,',
          description: 'Open settings',
          category: 'general',
          action: () => console.log('Open settings'),
          isGlobal: true
        }
      ]
    },
    {
      id: 'navigation',
      name: 'Navigation',
      description: 'Window and workspace navigation',
      icon: Eye,
      shortcuts: [
        {
          id: 'next-window',
          key: 'Ctrl+Tab',
          description: 'Switch to next window',
          category: 'navigation',
          action: () => console.log('Next window'),
          isGlobal: true
        },
        {
          id: 'prev-window',
          key: 'Ctrl+Shift+Tab',
          description: 'Switch to previous window',
          category: 'navigation',
          action: () => console.log('Previous window'),
          isGlobal: true
        },
        {
          id: 'close-window',
          key: 'Ctrl+W',
          description: 'Close active window',
          category: 'navigation',
          action: () => console.log('Close window'),
          isGlobal: true
        },
        {
          id: 'minimize-window',
          key: 'Ctrl+M',
          description: 'Minimize active window',
          category: 'navigation',
          action: () => console.log('Minimize window'),
          isGlobal: true
        }
      ]
    },
    {
      id: 'workspace',
      name: 'Workspace',
      description: 'Workspace management',
      icon: Star,
      shortcuts: [
        {
          id: 'new-workspace',
          key: 'Ctrl+N',
          description: 'Create new workspace',
          category: 'workspace',
          action: () => console.log('New workspace'),
          isGlobal: true
        },
        {
          id: 'switch-workspace-1',
          key: 'Ctrl+1',
          description: 'Switch to workspace 1',
          category: 'workspace',
          action: () => console.log('Workspace 1'),
          isGlobal: true
        },
        {
          id: 'switch-workspace-2',
          key: 'Ctrl+2',
          description: 'Switch to workspace 2',
          category: 'workspace',
          action: () => console.log('Workspace 2'),
          isGlobal: true
        },
        {
          id: 'switch-workspace-3',
          key: 'Ctrl+3',
          description: 'Switch to workspace 3',
          category: 'workspace',
          action: () => console.log('Workspace 3'),
          isGlobal: true
        }
      ]
    },
    {
      id: 'apps',
      name: 'Applications',
      description: 'Quick app launcher',
      icon: Command,
      shortcuts: [
        {
          id: 'terminal',
          key: 'Ctrl+`',
          description: 'Open terminal',
          category: 'apps',
          action: () => console.log('Open terminal'),
          isGlobal: true
        },
        {
          id: 'notes',
          key: 'Ctrl+Shift+N',
          description: 'Open notes',
          category: 'apps',
          action: () => console.log('Open notes'),
          isGlobal: true
        },
        {
          id: 'calculator',
          key: 'Ctrl+Shift+C',
          description: 'Open calculator',
          category: 'apps',
          action: () => console.log('Open calculator'),
          isGlobal: true
        },
        {
          id: 'weather',
          key: 'Ctrl+Shift+W',
          description: 'Open weather',
          category: 'apps',
          action: () => console.log('Open weather'),
          isGlobal: true
        }
      ]
    },
    {
      id: 'system',
      name: 'System',
      description: 'System controls',
      icon: Settings,
      shortcuts: [
        {
          id: 'consciousness-overlay',
          key: 'Ctrl+T',
          description: 'Toggle consciousness overlay',
          category: 'system',
          action: () => console.log('Toggle consciousness'),
          isGlobal: true
        },
        {
          id: 'workspace-grid',
          key: 'Ctrl+G',
          description: 'Toggle workspace grid',
          category: 'system',
          action: () => console.log('Toggle grid'),
          isGlobal: true
        },
        {
          id: 'performance-mode',
          key: 'Ctrl+Shift+P',
          description: 'Toggle performance mode',
          category: 'system',
          action: () => console.log('Performance mode'),
          isGlobal: true
        }
      ]
    }
  ];

  // ==================== SHORTCUT HANDLING ====================

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (isHelpOpen) return;

    const key = getKeyCombo(e);
    const shortcut = findShortcutByKey(key);

    if (shortcut && shortcut.isEnabled !== false) {
      e.preventDefault();
      shortcut.action();
    }
  }, [isHelpOpen]);

  const getKeyCombo = (e: KeyboardEvent): string => {
    const keys: string[] = [];

    if (e.ctrlKey) keys.push('Ctrl');
    if (e.shiftKey) keys.push('Shift');
    if (e.altKey) keys.push('Alt');
    if (e.metaKey) keys.push('Cmd');

    if (e.key !== 'Control' && e.key !== 'Shift' && e.key !== 'Alt' && e.key !== 'Meta') {
      keys.push(e.key.toUpperCase());
    }

    return keys.join('+');
  };

  const findShortcutByKey = (key: string): Shortcut | null => {
    for (const category of shortcutCategories) {
      const shortcut = category.shortcuts.find(s => s.key === key);
      if (shortcut) return shortcut;
    }
    return null;
  };

  // ==================== SHORTCUT RECORDING ====================

  const startRecording = useCallback((shortcutId: string) => {
    setIsRecording(true);
    setRecordingShortcut(shortcutId);
  }, []);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    setRecordingShortcut(null);
  }, []);

  const handleRecordingKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isRecording) return;

    e.preventDefault();
    const key = getKeyCombo(e);

    if (recordingShortcut) {
      setCustomShortcuts(prev => ({
        ...prev,
        [recordingShortcut]: key
      }));
    }

    stopRecording();
  }, [isRecording, recordingShortcut, stopRecording]);

  // ==================== EVENT LISTENERS ====================

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isRecording) {
      document.addEventListener('keydown', handleRecordingKeyDown);
      return () => document.removeEventListener('keydown', handleRecordingKeyDown);
    }
    return undefined;
  }, [isRecording, handleRecordingKeyDown]);

  // ==================== SEARCH FUNCTIONALITY ====================

  const filteredCategories = shortcutCategories.map(category => ({
    ...category,
    shortcuts: category.shortcuts.filter(shortcut =>
      shortcut.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shortcut.key.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.shortcuts.length > 0);

  const activeCategoryData = filteredCategories.find(cat => cat.id === activeCategory) || filteredCategories[0];

  // ==================== UTILITY FUNCTIONS ====================

  const formatKeyDisplay = (key: string): string => {
    return key
      .replace('Ctrl', '⌃')
      .replace('Shift', '⇧')
      .replace('Alt', '⌥')
      .replace('Cmd', '⌘');
  };

  const getShortcutKey = (shortcutId: string): string => {
    return customShortcuts[shortcutId] ||
           shortcutCategories
             .flatMap(cat => cat.shortcuts)
             .find(s => s.id === shortcutId)?.key || '';
  };

  // ==================== RENDER ====================

  return (
    <>
      {/* Help Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsHelpOpen(true)}
        className="fixed bottom-4 right-4 p-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors z-40"
        title="Keyboard Shortcuts (Ctrl+Shift+/)"
      >
        <Keyboard size={20} />
      </motion.button>

      {/* Help Overlay */}
      <AnimatePresence>
        {isHelpOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsHelpOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <Keyboard className="text-blue-500" size={24} />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">Keyboard Shortcuts</h2>
                    <p className="text-sm text-gray-500">Master your AI-BOS workflow</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsHelpOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Search */}
              <div className="p-6 border-b border-gray-200">
                <div className="relative">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    ref={searchRef}
                    type="text"
                    placeholder="Search shortcuts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                </div>
              </div>

              {/* Content */}
              <div className="flex h-96">
                {/* Categories Sidebar */}
                <div className="w-64 border-r border-gray-200 overflow-y-auto">
                  {filteredCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors ${
                        activeCategory === category.id
                          ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-500'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <category.icon size={20} />
                      <div>
                        <div className="font-medium">{category.name}</div>
                        <div className="text-xs text-gray-500">{category.description}</div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Shortcuts List */}
                <div className="flex-1 overflow-y-auto">
                  {activeCategoryData ? (
                    <div className="p-6">
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">{activeCategoryData.name}</h3>
                        <p className="text-sm text-gray-500">{activeCategoryData.description}</p>
                      </div>

                      <div className="space-y-2">
                        {activeCategoryData.shortcuts.map((shortcut) => (
                          <motion.div
                            key={shortcut.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              {shortcut.icon && <shortcut.icon size={16} className="text-gray-400" />}
                              <span className="text-gray-700">{shortcut.description}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-sm font-mono text-gray-700">
                                {formatKeyDisplay(getShortcutKey(shortcut.id))}
                              </kbd>
                              <button
                                onClick={() => startRecording(shortcut.id)}
                                className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                                title="Customize shortcut"
                              >
                                <Settings size={14} />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      <Search size={48} className="mx-auto mb-4 text-gray-300" />
                      <p>No shortcuts found</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Press Esc to close</span>
                  <div className="flex items-center space-x-4">
                    <span>Custom shortcuts are saved automatically</span>
                    <button
                      onClick={() => setCustomShortcuts({})}
                      className="text-blue-500 hover:text-blue-600"
                    >
                      Reset all
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recording Overlay */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-xl p-8 text-center shadow-2xl"
            >
              <Keyboard size={48} className="mx-auto mb-4 text-blue-500" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Recording Shortcut</h3>
              <p className="text-gray-500 mb-4">Press the key combination you want to assign</p>
              <div className="text-sm text-gray-400">Press Esc to cancel</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default KeyboardShortcuts;
