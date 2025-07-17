/**
 * AI-BOS Spotlight Search
 *
 * Global search functionality with fuzzy matching, keyboard shortcuts,
 * and real-time search results with highlighting.
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Fuse from 'fuse.js';
import {
  Search,
  Command,
  ArrowUp,
  ArrowDown,
  X,
  FileText,
  Settings,
  Users,
  Database,
  Code,
  Globe,
  Clock,
  Star,
} from 'lucide-react';

// Search result types
export interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: SearchCategory;
  url?: string;
  icon?: React.ReactNode;
  tags?: string[];
  lastAccessed?: Date;
  score?: number;
}

export type SearchCategory =
  | 'entity'
  | 'event'
  | 'manifest'
  | 'api'
  | 'component'
  | 'documentation'
  | 'settings'
  | 'user'
  | 'file'
  | 'recent'
  | 'favorite';

// Search category configuration
const SEARCH_CATEGORIES = {
  entity: {
    name: 'Entities',
    icon: <Database size={16} />,
    color: '#3B82F6',
  },
  event: {
    name: 'Events',
    icon: <Code size={16} />,
    color: '#8B5CF6',
  },
  manifest: {
    name: 'Manifests',
    icon: <FileText size={16} />,
    color: '#10B981',
  },
  api: {
    name: 'APIs',
    icon: <Globe size={16} />,
    color: '#F59E0B',
  },
  component: {
    name: 'Components',
    icon: <Code size={16} />,
    color: '#EF4444',
  },
  documentation: {
    name: 'Documentation',
    icon: <FileText size={16} />,
    color: '#6B7280',
  },
  settings: {
    name: 'Settings',
    icon: <Settings size={16} />,
    color: '#8B5CF6',
  },
  user: {
    name: 'Users',
    icon: <Users size={16} />,
    color: '#10B981',
  },
  file: {
    name: 'Files',
    icon: <FileText size={16} />,
    color: '#6B7280',
  },
  recent: {
    name: 'Recent',
    icon: <Clock size={16} />,
    color: '#F59E0B',
  },
  favorite: {
    name: 'Favorites',
    icon: <Star size={16} />,
    color: '#EF4444',
  },
};

// Spotlight props
interface SpotlightProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (result: SearchResult) => void;
  data?: SearchResult[];
  placeholder?: string;
  maxResults?: number;
  enableKeyboard?: boolean;
  enableFuzzy?: boolean;
  enableHistory?: boolean;
}

export function Spotlight({
  isOpen,
  onClose,
  onSelect,
  data = [],
  placeholder = 'Search entities, events, manifests, APIs...',
  maxResults = 10,
  enableKeyboard = true,
  enableFuzzy = true,
  enableHistory = true,
}: SpotlightProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Mock data for demonstration
  const mockData: SearchResult[] = useMemo(
    () => [
      {
        id: 'user-entity',
        title: 'User Entity',
        description: 'User management entity with authentication',
        category: 'entity',
        url: '/entities/user',
        tags: ['authentication', 'profile', 'roles'],
      },
      {
        id: 'user-created-event',
        title: 'UserCreated Event',
        description: 'Event fired when a new user is created',
        category: 'event',
        url: '/events/user-created',
        tags: ['user', 'creation', 'notification'],
      },
      {
        id: 'app-manifest',
        title: 'Application Manifest',
        description: 'Main application configuration manifest',
        category: 'manifest',
        url: '/manifests/app',
        tags: ['config', 'settings', 'deployment'],
      },
      {
        id: 'user-api',
        title: 'User API',
        description: 'REST API for user management operations',
        category: 'api',
        url: '/api/users',
        tags: ['rest', 'crud', 'authentication'],
      },
      {
        id: 'user-form',
        title: 'User Form Component',
        description: 'React component for user input forms',
        category: 'component',
        url: '/components/user-form',
        tags: ['react', 'form', 'validation'],
      },
      {
        id: 'getting-started',
        title: 'Getting Started Guide',
        description: 'Quick start guide for AI-BOS platform',
        category: 'documentation',
        url: '/docs/getting-started',
        tags: ['guide', 'tutorial', 'beginner'],
      },
      {
        id: 'theme-settings',
        title: 'Theme Settings',
        description: 'Application theme and appearance settings',
        category: 'settings',
        url: '/settings/theme',
        tags: ['theme', 'appearance', 'customization'],
      },
    ],
    [],
  );

  // Combine mock data with provided data
  const allData = useMemo(() => [...mockData, ...data], [mockData, data]);

  // Configure Fuse.js for fuzzy search
  const fuse = useMemo(() => {
    if (!enableFuzzy) return null;

    return new Fuse(allData, {
      keys: ['title', 'description', 'tags'],
      threshold: 0.3,
      includeScore: true,
      includeMatches: true,
    });
  }, [allData, enableFuzzy]);

  // Perform search
  const searchResults = useMemo(() => {
    if (!query.trim()) {
      return allData.slice(0, maxResults);
    }

    if (fuse) {
      const results = fuse.search(query);
      return results
        .map((result) => ({
          ...result.item,
          score: result.score,
        }))
        .slice(0, maxResults);
    } else {
      // Simple text search
      return allData
        .filter(
          (item) =>
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.description.toLowerCase().includes(query.toLowerCase()) ||
            item.tags?.some((tag) => tag.toLowerCase().includes(query.toLowerCase())),
        )
        .slice(0, maxResults);
    }
  }, [query, allData, fuse, maxResults]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (searchResults[selectedIndex]) {
            handleSelect(searchResults[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    },
    [isOpen, searchResults, selectedIndex, onClose],
  );

  // Handle result selection
  const handleSelect = useCallback(
    (result: SearchResult) => {
      // Add to search history
      if (enableHistory && query.trim()) {
        setSearchHistory((prev) => {
          const newHistory = [query, ...prev.filter((item) => item !== query)];
          return newHistory.slice(0, 10);
        });
      }

      // Add to favorites if starred
      if (result.category === 'favorite') {
        setFavorites((prev) => {
          const exists = prev.find((fav) => fav.id === result.id);
          if (!exists) {
            return [...prev, result];
          }
          return prev;
        });
      }

      onSelect(result);
      onClose();
      setQuery('');
      setSelectedIndex(0);
    },
    [query, enableHistory, onSelect, onClose],
  );

  // Handle global keyboard shortcut
  useEffect(() => {
    if (!enableKeyboard) return;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Trigger open (this would be handled by parent)
        }
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [enableKeyboard, isOpen, onClose]);

  // Handle keyboard navigation
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current && selectedIndex >= 0) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  // Highlight text in search results
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="highlight">
          {part}
        </mark>
      ) : (
        part
      ),
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="spotlight-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="spotlight-modal"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="spotlight-input-container">
              <Search className="search-icon" size={20} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="spotlight-input"
              />
              <div className="spotlight-shortcuts">
                <kbd className="shortcut-key">
                  <Command size={12} />K
                </kbd>
              </div>
              <button className="spotlight-close" onClick={onClose}>
                <X size={20} />
              </button>
            </div>

            {/* Search Results */}
            <div className="spotlight-results" ref={resultsRef}>
              {searchResults.length > 0 ? (
                searchResults.map((result, index) => (
                  <motion.div
                    key={result.id}
                    className={`spotlight-result ${index === selectedIndex ? 'selected' : ''}`}
                    onClick={() => handleSelect(result)}
                    whileHover={{ backgroundColor: 'var(--color-surface)' }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="result-icon">
                      {result.icon || SEARCH_CATEGORIES[result.category].icon}
                    </div>
                    <div className="result-content">
                      <div className="result-title">{highlightText(result.title, query)}</div>
                      <div className="result-description">
                        {highlightText(result.description, query)}
                      </div>
                      <div className="result-meta">
                        <span className="result-category">
                          {SEARCH_CATEGORIES[result.category].name}
                        </span>
                        {result.tags && (
                          <div className="result-tags">
                            {result.tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="result-tag">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="result-actions">
                      <button
                        className="result-favorite"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Toggle favorite
                        }}
                      >
                        <Star size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="spotlight-empty">
                  <Search size={48} />
                  <h3>No results found</h3>
                  <p>Try adjusting your search terms</p>
                </div>
              )}
            </div>

            {/* Search History */}
            {enableHistory && searchHistory.length > 0 && !query && (
              <div className="spotlight-history">
                <h4>Recent Searches</h4>
                <div className="history-list">
                  {searchHistory.slice(0, 5).map((term, index) => (
                    <button key={index} className="history-item" onClick={() => setQuery(term)}>
                      <Clock size={16} />
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Favorites */}
            {favorites.length > 0 && !query && (
              <div className="spotlight-favorites">
                <h4>Favorites</h4>
                <div className="favorites-list">
                  {favorites.slice(0, 5).map((favorite) => (
                    <button
                      key={favorite.id}
                      className="favorite-item"
                      onClick={() => handleSelect(favorite)}
                    >
                      <Star size={16} />
                      {favorite.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook to use spotlight
export function useSpotlight() {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}
