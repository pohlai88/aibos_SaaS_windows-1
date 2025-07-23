/**
 * AI-BOS Community Template Browser
 *
 * Marketplace interface for discovering, previewing, and installing
 * community-contributed app templates with AI-powered recommendations.
 */

'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Star,
  Download,
  Eye,
  Tag,
  TrendingUp,
  Clock,
  Users,
  Zap,
  Grid,
  List,
  ArrowRight,
  ThumbsUp,
  MessageSquare,
  Code,
  Palette,
  Database,
  ShoppingCart,
  Calendar,
  FileText,
  Globe,
  Sparkles,
  ChevronDown,
  X,
  Play,
} from 'lucide-react';
import Fuse from 'fuse.js';

// AI-BOS Shared Library Integration
import type { EventBus } from '@aibos/shared/lib';
import { logger, monitoring } from '@aibos/shared/lib';
import type { AIEngine } from '@aibos/shared/ai';

// Visual Dev Integration
import { VisualAppBuilder } from '@aibos/visual-dev';

// Types
import type {
  AppTemplate,
  TemplateCategory,
  TemplateFilter,
  TemplateRecommendation,
  UserProfile,
  TemplateInstallation,
  TemplateRating,
  TemplatePreview,
} from '../types';

// Components
import { TemplateCard } from './TemplateCard';
import { TemplatePreviewModal } from './TemplatePreviewModal';
import { TemplateInstaller } from '../installer/TemplateInstaller';
import { RecommendationEngine } from './RecommendationEngine';

// ============================================================================
// TEMPLATE BROWSER COMPONENT
// ============================================================================

export interface TemplateBrowserProps {
  /** User profile for personalized recommendations */
  userProfile?: UserProfile;
  /** AI Engine for recommendations */
  aiEngine?: AIEngine;
  /** Event bus for tracking */
  eventBus?: EventBus;
  /** Template installation handler */
  onTemplateInstall?: (template: AppTemplate) => Promise<void>;
  /** Template preview handler */
  onTemplatePreview?: (template: AppTemplate) => void;
  /** Initial category filter */
  initialCategory?: TemplateCategory;
  /** Enable AI recommendations */
  enableRecommendations?: boolean;
}

/**
 * Community Template Browser
 * Marketplace interface for discovering and installing app templates
 */
export const TemplateBrowser: React.FC<TemplateBrowserProps> = ({
  userProfile,
  aiEngine,
  eventBus,
  onTemplateInstall,
  onTemplatePreview,
  initialCategory,
  enableRecommendations = true,
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [templates, setTemplates] = useState<AppTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<AppTemplate[]>([]);
  const [recommendations, setRecommendations] = useState<TemplateRecommendation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>(
    initialCategory || 'all',
  );
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'rating' | 'downloads'>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<AppTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showInstaller, setShowInstaller] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // ============================================================================
  // TEMPLATE CATEGORIES & FILTERS
  // ============================================================================

  const categories: Record<
    TemplateCategory,
    { label: string; icon: React.ComponentType<any>; color: string }
  > = {
    business: { label: 'Business', icon: ShoppingCart, color: 'blue' },
    ecommerce: { label: 'E-commerce', icon: ShoppingCart, color: 'green' },
    blog: { label: 'Blog & CMS', icon: FileText, color: 'purple' },
    portfolio: { label: 'Portfolio', icon: Palette, color: 'pink' },
    dashboard: { label: 'Dashboard', icon: Grid, color: 'orange' },
    social: { label: 'Social', icon: Users, color: 'indigo' },
    productivity: { label: 'Productivity', icon: Calendar, color: 'red' },
    landing: { label: 'Landing Page', icon: Globe, color: 'teal' },
    education: { label: 'Education', icon: FileText, color: 'yellow' },
    saas: { label: 'SaaS', icon: Zap, color: 'cyan' },
  };

  const availableTags = [
    'responsive',
    'dark-mode',
    'multi-language',
    'real-time',
    'analytics',
    'payments',
    'authentication',
    'api-integration',
    'mobile-first',
    'accessible',
    'modern-design',
    'minimal',
    'professional',
    'startup',
    'enterprise',
  ];

  // ============================================================================
  // MOCK DATA (In real implementation, this would come from API)
  // ============================================================================

  const mockTemplates: AppTemplate[] = useMemo(
    () => [
      {
        id: 'template-1',
        name: 'Modern E-commerce Store',
        description:
          'Complete e-commerce solution with product catalog, shopping cart, and checkout',
        category: 'ecommerce',
        author: {
          id: 'user-1',
          name: 'Sarah Chen',
          avatar: '👩‍💻',
          verified: true,
          reputation: 4.8,
        },
        thumbnail: '/templates/ecommerce-store.jpg',
        screenshots: ['/templates/ecommerce-1.jpg', '/templates/ecommerce-2.jpg'],
        tags: ['responsive', 'payments', 'modern-design', 'api-integration'],
        rating: 4.9,
        totalRatings: 234,
        downloads: 1250,
        createdAt: Date.now() - 86400000 * 7, // 7 days ago
        updatedAt: Date.now() - 86400000 * 2, // 2 days ago
        manifest: {
          version: '1.2.0',
          entities: ['Product', 'Order', 'Customer'],
          events: ['ProductAdded', 'OrderPlaced', 'PaymentProcessed'],
          dependencies: ['stripe', 'auth'],
          complexity: 'intermediate',
        },
        preview: {
          demoUrl: 'https://demo.ecommerce-template.com',
          codeUrl: 'https://github.com/template/ecommerce',
          features: ['Product Management', 'Shopping Cart', 'Payment Processing', 'Order Tracking'],
        },
        pricing: { type: 'free' },
        stats: {
          views: 5230,
          likes: 420,
          forks: 89,
          comments: 23,
        },
      },
      {
        id: 'template-2',
        name: 'SaaS Dashboard Pro',
        description:
          'Professional dashboard template with analytics, user management, and real-time data',
        category: 'dashboard',
        author: {
          id: 'user-2',
          name: 'Alex Rodriguez',
          avatar: '👨‍💼',
          verified: true,
          reputation: 4.7,
        },
        thumbnail: '/templates/saas-dashboard.jpg',
        screenshots: ['/templates/dashboard-1.jpg', '/templates/dashboard-2.jpg'],
        tags: ['analytics', 'real-time', 'enterprise', 'api-integration'],
        rating: 4.8,
        totalRatings: 156,
        downloads: 890,
        createdAt: Date.now() - 86400000 * 14, // 14 days ago
        updatedAt: Date.now() - 86400000 * 5, // 5 days ago
        manifest: {
          version: '2.1.0',
          entities: ['User', 'Organization', 'Analytics', 'Report'],
          events: ['UserLoggedIn', 'DataUpdated', 'ReportGenerated'],
          dependencies: ['charts', 'realtime'],
          complexity: 'advanced',
        },
        preview: {
          demoUrl: 'https://demo.saas-dashboard.com',
          codeUrl: 'https://github.com/template/saas-dashboard',
          features: [
            'Analytics Dashboard',
            'User Management',
            'Real-time Updates',
            'Custom Reports',
          ],
        },
        pricing: { type: 'premium', price: 49 },
        stats: {
          views: 3450,
          likes: 290,
          forks: 67,
          comments: 18,
        },
      },
      {
        id: 'template-3',
        name: 'Personal Portfolio',
        description: 'Elegant portfolio template for showcasing your work and skills',
        category: 'portfolio',
        author: {
          id: 'user-3',
          name: 'Emma Wilson',
          avatar: '👩‍🎨',
          verified: false,
          reputation: 4.5,
        },
        thumbnail: '/templates/portfolio.jpg',
        screenshots: ['/templates/portfolio-1.jpg', '/templates/portfolio-2.jpg'],
        tags: ['responsive', 'minimal', 'modern-design', 'mobile-first'],
        rating: 4.6,
        totalRatings: 89,
        downloads: 520,
        createdAt: Date.now() - 86400000 * 3, // 3 days ago
        updatedAt: Date.now() - 86400000 * 1, // 1 day ago
        manifest: {
          version: '1.0.0',
          entities: ['Project', 'Skill', 'Experience'],
          events: ['ProjectViewed', 'ContactSubmitted'],
          dependencies: [],
          complexity: 'beginner',
        },
        preview: {
          demoUrl: 'https://demo.portfolio-template.com',
          codeUrl: 'https://github.com/template/portfolio',
          features: ['Project Showcase', 'Skills Section', 'Contact Form', 'Responsive Design'],
        },
        pricing: { type: 'free' },
        stats: {
          views: 1230,
          likes: 95,
          forks: 23,
          comments: 7,
        },
      },
    ],
    [],
  );

  // ============================================================================
  // SEARCH & FILTERING
  // ============================================================================

  const fuse = useMemo(
    () =>
      new Fuse(templates, {
        keys: ['name', 'description', 'tags', 'author.name'],
        threshold: 0.3,
        includeScore: true,
      }),
    [templates],
  );

  /**
   * Apply filters and search
   */
  const applyFiltersAndSearch = useCallback(() => {
    let filtered = templates;

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((t) => t.category === selectedCategory);
    }

    // Apply tag filters
    if (selectedTags.length > 0) {
      filtered = filtered.filter((t) => selectedTags.some((tag) => t.tags.includes(tag)));
    }

    // Apply search query
    if (searchQuery.trim()) {
      const searchResults = fuse.search(searchQuery);
      filtered = searchResults.map((result) => result.item);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.downloads - a.downloads;
        case 'recent':
          return b.updatedAt - a.updatedAt;
        case 'rating':
          return b.rating - a.rating;
        case 'downloads':
          return b.downloads - a.downloads;
        default:
          return 0;
      }
    });

    setFilteredTemplates(filtered);
  }, [templates, selectedCategory, selectedTags, searchQuery, sortBy, fuse]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  /**
   * Handle template selection
   */
  const handleTemplateSelect = useCallback(
    (template: AppTemplate) => {
      setSelectedTemplate(template);

      // Track template view
      eventBus?.emit('template:viewed', {
        templateId: template.id,
        userId: userProfile?.id || 'anonymous',
        timestamp: Date.now(),
      });

      logger.info('Template selected', { templateId: template.id });
    },
    [eventBus, userProfile?.id],
  );

  /**
   * Handle template preview
   */
  const handleTemplatePreview = useCallback(
    (template: AppTemplate) => {
      setSelectedTemplate(template);
      setShowPreview(true);

      onTemplatePreview?.(template);

      // Track preview
      eventBus?.emit('template:previewed', {
        templateId: template.id,
        userId: userProfile?.id || 'anonymous',
        timestamp: Date.now(),
      });

      logger.info('Template preview opened', { templateId: template.id });
    },
    [onTemplatePreview, eventBus, userProfile?.id],
  );

  /**
   * Handle template installation
   */
  const handleTemplateInstall = useCallback(
    (template: AppTemplate) => {
      setSelectedTemplate(template);
      setShowInstaller(true);

      // Track installation intent
      eventBus?.emit('template:install-started', {
        templateId: template.id,
        userId: userProfile?.id || 'anonymous',
        timestamp: Date.now(),
      });

      logger.info('Template installation started', { templateId: template.id });
    },
    [eventBus, userProfile?.id],
  );

  /**
   * Handle tag selection
   */
  const handleTagSelect = useCallback(
    (tag: string) => {
      if (selectedTags.includes(tag)) {
        setSelectedTags((prev) => prev.filter((t) => t !== tag));
      } else {
        setSelectedTags((prev) => [...prev, tag]);
      }
    },
    [selectedTags],
  );

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * Load initial templates
   */
  useEffect(() => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setTemplates(mockTemplates);
      setIsLoading(false);
    }, 1000);
  }, [mockTemplates]);

  /**
   * Apply filters when dependencies change
   */
  useEffect(() => {
    applyFiltersAndSearch();
  }, [applyFiltersAndSearch]);

  /**
   * Generate AI recommendations
   */
  useEffect(() => {
    if (enableRecommendations && userProfile && templates.length > 0) {
      // Simulate AI recommendations based on user profile and browsing history
      const mockRecommendations: TemplateRecommendation[] = [
        {
          id: 'rec-1',
          templateId: 'template-1',
          reason: 'Based on your interest in e-commerce projects',
          confidence: 0.92,
          type: 'user-preference',
        },
        {
          id: 'rec-2',
          templateId: 'template-2',
          reason: 'Popular among developers with your skill level',
          confidence: 0.85,
          type: 'collaborative-filtering',
        },
      ];

      setRecommendations(mockRecommendations);
    }
  }, [enableRecommendations, userProfile, templates]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  /**
   * Get category icon
   */
  const getCategoryIcon = (category: TemplateCategory) => {
    const IconComponent = categories[category]?.icon || Grid;
    return <IconComponent className="w-4 h-4" />;
  };

  /**
   * Get category color
   */
  const getCategoryColor = (category: TemplateCategory) => {
    return categories[category]?.color || 'gray';
  };

  /**
   * Render filter sidebar
   */
  const renderFilterSidebar = () => (
    <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Categories</h3>
        <div className="space-y-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
              selectedCategory === 'all'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>All Templates</span>
            <span className="text-xs text-gray-500">{templates.length}</span>
          </button>

          {Object.entries(categories).map(([key, category]) => {
            const count = templates.filter((t) => t.category === key).length;
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key as TemplateCategory)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                  selectedCategory === key
                    ? `bg-${category.color}-100 text-${category.color}-700`
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {getCategoryIcon(key as TemplateCategory)}
                  <span>{category.label}</span>
                </div>
                <span className="text-xs text-gray-500">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tags */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagSelect(tag)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                selectedTags.includes(tag)
                  ? 'bg-blue-100 border-blue-300 text-blue-700'
                  : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Sort Options */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Sort by</h3>
        <div className="space-y-1">
          {[
            { key: 'popular', label: 'Most Popular', icon: TrendingUp },
            { key: 'recent', label: 'Most Recent', icon: Clock },
            { key: 'rating', label: 'Highest Rated', icon: Star },
            { key: 'downloads', label: 'Most Downloaded', icon: Download },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setSortBy(key as any)}
              className={`w-full flex items-center space-x-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                sortBy === key ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Filter Sidebar */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {renderFilterSidebar()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Community Templates</h1>
              <p className="text-gray-600">
                Discover and install amazing app templates from the community
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${
                    viewMode === 'grid'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${
                    viewMode === 'list'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  showFilters
                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {/* Active Filters */}
          {(selectedCategory !== 'all' || selectedTags.length > 0) && (
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-sm text-gray-500">Active filters:</span>

              {selectedCategory !== 'all' && (
                <div className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                  <span>{categories[selectedCategory as TemplateCategory]?.label}</span>
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="ml-1 text-blue-500 hover:text-blue-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {selectedTags.map((tag) => (
                <div
                  key={tag}
                  className="flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                >
                  <span>{tag}</span>
                  <button
                    onClick={() => handleTagSelect(tag)}
                    className="ml-1 text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Results Count */}
          <div className="text-sm text-gray-500">
            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
          </div>
        </div>

        {/* Templates Grid/List */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading templates...</p>
              </div>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your filters or search query</p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedTags([]);
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'space-y-4'
              }
            >
              <AnimatePresence>
                {filteredTemplates.map((template, index) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <TemplateCard
                      template={template}
                      viewMode={viewMode}
                      onSelect={() => handleTemplateSelect(template)}
                      onPreview={() => handleTemplatePreview(template)}
                      onInstall={() => handleTemplateInstall(template)}
                      recommendations={recommendations.filter((r) => r.templateId === template.id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showPreview && selectedTemplate && (
          <TemplatePreviewModal
            template={selectedTemplate}
            onClose={() => setShowPreview(false)}
            onInstall={() => {
              setShowPreview(false);
              handleTemplateInstall(selectedTemplate);
            }}
          />
        )}

        {showInstaller && selectedTemplate && (
          <TemplateInstaller
            template={selectedTemplate}
            onClose={() => setShowInstaller(false)}
            onComplete={(installation) => {
              setShowInstaller(false);
              onTemplateInstall?.(selectedTemplate);

              // Track successful installation
              eventBus?.emit('template:installed', {
                templateId: selectedTemplate.id,
                userId: userProfile?.id || 'anonymous',
                installation,
                timestamp: Date.now(),
              });
            }}
            userProfile={userProfile}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
