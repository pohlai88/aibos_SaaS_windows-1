'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, Command, FileText, Settings, Clock,
  Calculator, Cloud, Terminal, Sparkles, ArrowUp,
  ArrowDown, Folder, Star, Clock as ClockIcon
} from 'lucide-react';

// ==================== TYPES ====================

export interface SearchResult {
  id: string;
  type: 'app' | 'file' | 'setting' | 'recent' | 'action';
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  action: () => void;
  score: number;
  tags: string[];
  metadata?: Record<string, any>;
}

export interface SearchCategory {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  results: SearchResult[];
}

// ==================== GLOBAL SEARCH ====================

const GlobalSearch: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // ==================== MOCK DATA ====================

  const mockApps: SearchResult[] = [
    {
      id: 'terminal',
      type: 'app',
      title: 'Terminal',
      description: 'Command-line interface',
      icon: Terminal,
      action: () => console.log('Open Terminal'),
      score: 1.0,
      tags: ['terminal', 'cli', 'command', 'shell']
    },
    {
      id: 'notes',
      type: 'app',
      title: 'Notes',
      description: 'Rich text editor',
      icon: FileText,
      action: () => console.log('Open Notes'),
      score: 1.0,
      tags: ['notes', 'text', 'editor', 'writing']
    },
    {
      id: 'calculator',
      type: 'app',
      title: 'Calculator',
      description: 'Scientific calculator',
      icon: Calculator,
      action: () => console.log('Open Calculator'),
      score: 1.0,
      tags: ['calculator', 'math', 'scientific', 'compute']
    },
    {
      id: 'weather',
      type: 'app',
      title: 'Weather',
      description: 'Weather forecast',
      icon: Cloud,
      action: () => console.log('Open Weather'),
      score: 1.0,
      tags: ['weather', 'forecast', 'climate', 'temperature']
    },
    {
      id: 'clock',
      type: 'app',
      title: 'Clock',
      description: 'Time management',
      icon: ClockIcon,
      action: () => console.log('Open Clock'),
      score: 1.0,
      tags: ['clock', 'time', 'timer', 'stopwatch']
    }
  ];

  const mockFiles: SearchResult[] = [
    {
      id: 'document1',
      type: 'file',
      title: 'Project Notes.md',
      description: 'Last modified 2 hours ago',
      icon: FileText,
      action: () => console.log('Open Project Notes'),
      score: 0.9,
      tags: ['markdown', 'notes', 'project'],
      metadata: { path: '/documents/project-notes.md', size: '2.3 KB' }
    },
    {
      id: 'document2',
      type: 'file',
      title: 'Meeting Agenda.docx',
      description: 'Last modified yesterday',
      icon: FileText,
      action: () => console.log('Open Meeting Agenda'),
      score: 0.8,
      tags: ['document', 'meeting', 'agenda'],
      metadata: { path: '/documents/meeting-agenda.docx', size: '15.7 KB' }
    }
  ];

  const mockSettings: SearchResult[] = [
    {
      id: 'system-settings',
      type: 'setting',
      title: 'System Settings',
      description: 'Configure system preferences',
      icon: Settings,
      action: () => console.log('Open System Settings'),
      score: 0.9,
      tags: ['settings', 'system', 'preferences', 'config']
    },
    {
      id: 'keyboard-shortcuts',
      type: 'setting',
      title: 'Keyboard Shortcuts',
      description: 'Customize keyboard shortcuts',
      icon: Command,
      action: () => console.log('Open Keyboard Shortcuts'),
      score: 0.8,
      tags: ['shortcuts', 'keyboard', 'hotkeys', 'commands']
    }
  ];

  const mockActions: SearchResult[] = [
    {
      id: 'new-note',
      type: 'action',
      title: 'Create New Note',
      description: 'Start a new note',
      icon: FileText,
      action: () => console.log('Create New Note'),
      score: 0.7,
      tags: ['create', 'new', 'note', 'document']
    },
    {
      id: 'new-workspace',
      type: 'action',
      title: 'Create New Workspace',
      description: 'Start a new workspace',
      icon: Folder,
      action: () => console.log('Create New Workspace'),
      score: 0.7,
      tags: ['create', 'new', 'workspace', 'space']
    }
  ];

  // ==================== SEARCH LOGIC ====================

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 150));

    const query = searchQuery.toLowerCase();
    const allResults = [...mockApps, ...mockFiles, ...mockSettings, ...mockActions];

    const filteredResults = allResults
      .filter(result => {
        const titleMatch = result.title.toLowerCase().includes(query);
        const descriptionMatch = result.description.toLowerCase().includes(query);
        const tagMatch = result.tags.some(tag => tag.toLowerCase().includes(query));

        return titleMatch || descriptionMatch || tagMatch;
      })
      .map(result => {
        // Calculate relevance score
        let score = result.score;
        const queryWords = query.split(' ');

        queryWords.forEach(word => {
          if (result.title.toLowerCase().includes(word)) score += 0.3;
          if (result.description.toLowerCase().includes(word)) score += 0.2;
          if (result.tags.some(tag => tag.toLowerCase().includes(word))) score += 0.1;
        });

        return { ...result, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    setSearchResults(filteredResults);
    setIsLoading(false);
  }, []);

  // ==================== SEARCH HANDLERS ====================

  const handleQueryChange = useCallback((newQuery: string) => {
    setQuery(newQuery);
    setSelectedIndex(0);
    performSearch(newQuery);
  }, [performSearch]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < searchResults.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : searchResults.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (searchResults[selectedIndex]) {
          executeResult(searchResults[selectedIndex]);
        }
        break;
    }
  }, [isOpen, searchResults, selectedIndex]);

  const executeResult = useCallback((result: SearchResult) => {
    result.action();

    // Add to recent searches
    if (query.trim()) {
      setRecentSearches(prev => {
        const newRecent = [query, ...prev.filter(s => s !== query)].slice(0, 5);
        return newRecent;
      });
    }

    setIsOpen(false);
    setQuery('');
  }, [query]);

  // ==================== EVENT LISTENERS ====================

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // ==================== SCROLL TO SELECTED ====================

  useEffect(() => {
    if (resultsRef.current && selectedIndex >= 0) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [selectedIndex]);

  // ==================== RENDER ====================

  const getResultIcon = (result: SearchResult) => {
    const Icon = result.icon;
    return <Icon size={20} className="flex-shrink-0" />;
  };

  const getResultColor = (result: SearchResult) => {
    switch (result.type) {
      case 'app': return 'text-blue-500';
      case 'file': return 'text-green-500';
      case 'setting': return 'text-purple-500';
      case 'action': return 'text-orange-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <>
      {/* Global Search Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20 p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -20 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search Input */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search apps, files, settings..."
                    value={query}
                    onChange={(e) => handleQueryChange(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 border-0 focus:outline-none text-lg"
                    autoFocus
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                    <kbd className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs font-mono">
                      ⌘K
                    </kbd>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Search Results */}
              <div className="max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
                    />
                    <p className="text-gray-500">Searching...</p>
                  </div>
                ) : query.trim() ? (
                  searchResults.length > 0 ? (
                    <div ref={resultsRef}>
                      {searchResults.map((result, index) => (
                        <motion.button
                          key={result.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => executeResult(result)}
                          className={`w-full flex items-center space-x-3 p-4 text-left transition-colors ${
                            selectedIndex === index
                              ? 'bg-blue-50 border-r-2 border-blue-500'
                              : 'hover:bg-gray-50'
                          }`}
                          onMouseEnter={() => setSelectedIndex(index)}
                        >
                          <div className={getResultColor(result)}>
                            {getResultIcon(result)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-800 truncate">
                              {result.title}
                            </div>
                            <div className="text-sm text-gray-500 truncate">
                              {result.description}
                            </div>
                            {result.metadata && (
                              <div className="text-xs text-gray-400 mt-1">
                                {result.metadata.path && `${result.metadata.path} • `}
                                {result.metadata.size && `${result.metadata.size}`}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {result.tags.slice(0, 2).map(tag => (
                              <span
                                key={tag}
                                className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                                                         {selectedIndex === index && (
                               <ArrowUp size={16} className="text-blue-500" />
                             )}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <Search size={48} className="mx-auto mb-4 text-gray-300" />
                      <p>No results found for &quot;{query}&quot;</p>
                      <p className="text-sm mt-2">Try different keywords or check your spelling</p>
                    </div>
                  )
                ) : (
                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Recent Searches</h3>
                      {recentSearches.length > 0 ? (
                        <div className="space-y-1">
                          {recentSearches.map((search, index) => (
                            <button
                              key={index}
                              onClick={() => handleQueryChange(search)}
                              className="w-full flex items-center space-x-2 p-2 text-left text-sm text-gray-600 hover:bg-gray-50 rounded"
                            >
                              <Clock size={14} className="text-gray-400" />
                              <span>{search}</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400">No recent searches</p>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Quick Actions</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {mockActions.slice(0, 4).map((action) => (
                          <button
                            key={action.id}
                            onClick={() => executeResult(action)}
                            className="flex items-center space-x-2 p-2 text-left text-sm text-gray-600 hover:bg-gray-50 rounded"
                          >
                            <action.icon size={16} className="text-gray-400" />
                            <span>{action.title}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{searchResults.length} result{searchResults.length !== 1 ? 's' : ''}</span>
                  <div className="flex items-center space-x-4">
                    <span>Use ↑↓ to navigate, Enter to select</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GlobalSearch;
