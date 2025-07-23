/**
 * AI-BOS Community Templates - Template Comparison Component
 *
 * Comprehensive template comparison interface for comparing multiple
 * templates side by side with detailed feature analysis.
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compare,
  Check,
  X,
  Star,
  Download,
  Eye,
  Clock,
  Users,
  Code,
  Shield,
  Accessibility,
  TrendingUp,
  AlertTriangle,
  Info,
  ArrowLeft,
  ArrowRight,
  Maximize2,
  Minimize2,
  Share2,
  Bookmark,
  Download as DownloadIcon,
  ExternalLink,
} from 'lucide-react';

// AI-BOS Shared Library Integration
import type { EventBus } from '@aibos/shared/lib';
import { logger } from '@aibos/shared/lib';

// Types
import type { AppTemplate, TemplateComparison as ComparisonType, ComparisonResult } from '../types';

// Components
import { LoadingSkeleton } from './LoadingSkeleton';
import { ErrorBoundary } from './ErrorBoundary';

// ============================================================================
// COMPARISON TYPES
// ============================================================================

export interface TemplateComparisonProps {
  /** Templates to compare */
  templates: AppTemplate[];
  /** Maximum number of templates to compare */
  maxTemplates?: number;
  /** Event bus for tracking */
  eventBus?: EventBus;
  /** On template select callback */
  onTemplateSelect?: (template: AppTemplate) => void;
  /** On template install callback */
  onTemplateInstall?: (template: AppTemplate) => void;
  /** On template preview callback */
  onTemplatePreview?: (template: AppTemplate) => void;
  /** Custom comparison criteria */
  comparisonCriteria?: string[];
  /** Show detailed comparison */
  showDetailed?: boolean;
  /** Enable recommendations */
  enableRecommendations?: boolean;
}

export interface ComparisonFeature {
  name: string;
  key: string;
  category: 'core' | 'features' | 'technical' | 'community' | 'pricing';
  weight: number;
  format: 'boolean' | 'number' | 'text' | 'rating' | 'currency';
  description: string;
}

// ============================================================================
// COMPARISON FEATURES
// ============================================================================

const COMPARISON_FEATURES: ComparisonFeature[] = [
  // Core Features
  {
    name: 'Responsive Design',
    key: 'responsive',
    category: 'core',
    weight: 10,
    format: 'boolean',
    description: 'Template works on mobile and desktop devices',
  },
  {
    name: 'Dark Mode',
    key: 'darkMode',
    category: 'core',
    weight: 8,
    format: 'boolean',
    description: 'Supports dark/light theme switching',
  },
  {
    name: 'Accessibility',
    key: 'accessibility',
    category: 'core',
    weight: 9,
    format: 'boolean',
    description: 'WCAG compliant and screen reader friendly',
  },
  {
    name: 'SEO Optimized',
    key: 'seoOptimized',
    category: 'core',
    weight: 7,
    format: 'boolean',
    description: 'Search engine optimization features',
  },

  // Technical Features
  {
    name: 'Performance Score',
    key: 'performanceScore',
    category: 'technical',
    weight: 8,
    format: 'rating',
    description: 'Lighthouse performance score',
  },
  {
    name: 'Bundle Size',
    key: 'bundleSize',
    category: 'technical',
    weight: 6,
    format: 'number',
    description: 'JavaScript bundle size in KB',
  },
  {
    name: 'Dependencies',
    key: 'dependencies',
    category: 'technical',
    weight: 5,
    format: 'number',
    description: 'Number of external dependencies',
  },
  {
    name: 'Security Score',
    key: 'securityScore',
    category: 'technical',
    weight: 9,
    format: 'rating',
    description: 'Security vulnerability assessment',
  },

  // Community Features
  {
    name: 'Rating',
    key: 'rating',
    category: 'community',
    weight: 8,
    format: 'rating',
    description: 'User rating out of 5 stars',
  },
  {
    name: 'Downloads',
    key: 'downloads',
    category: 'community',
    weight: 6,
    format: 'number',
    description: 'Total number of downloads',
  },
  {
    name: 'Last Updated',
    key: 'lastUpdated',
    category: 'community',
    weight: 5,
    format: 'text',
    description: 'Days since last update',
  },
  {
    name: 'Community Score',
    key: 'communityScore',
    category: 'community',
    weight: 7,
    format: 'rating',
    description: 'Community engagement and support',
  },

  // Pricing Features
  {
    name: 'Price',
    key: 'price',
    category: 'pricing',
    weight: 8,
    format: 'currency',
    description: 'Template price',
  },
  {
    name: 'License Type',
    key: 'licenseType',
    category: 'pricing',
    weight: 6,
    format: 'text',
    description: 'License type (MIT, Commercial, etc.)',
  },
  {
    name: 'Support Included',
    key: 'supportIncluded',
    category: 'pricing',
    weight: 7,
    format: 'boolean',
    description: 'Includes support and documentation',
  },
];

// ============================================================================
// COMPARISON COMPONENT
// ============================================================================

/**
 * Template Comparison Component
 */
export const TemplateComparison: React.FC<TemplateComparisonProps> = ({
  templates,
  maxTemplates = 4,
  eventBus,
  onTemplateSelect,
  onTemplateInstall,
  onTemplatePreview,
  comparisonCriteria,
  showDetailed = false,
  enableRecommendations = true,
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [selectedTemplates, setSelectedTemplates] = useState<AppTemplate[]>([]);
  const [showDetailedComparison, setShowDetailedComparison] = useState(showDetailed);
  const [sortBy, setSortBy] = useState<
    'overall' | 'features' | 'performance' | 'community' | 'price'
  >('overall');
  const [highlightDifferences, setHighlightDifferences] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // ============================================================================
  // COMPARISON LOGIC
  // ============================================================================

  /**
   * Calculate feature value for template
   */
  const getFeatureValue = useCallback((template: AppTemplate, feature: ComparisonFeature): any => {
    switch (feature.key) {
      case 'responsive':
        return template.tags.includes('responsive');
      case 'darkMode':
        return template.tags.includes('dark-mode');
      case 'accessibility':
        return template.accessibility?.wcagCompliant || false;
      case 'seoOptimized':
        return template.tags.includes('seo') || template.tags.includes('optimized');
      case 'performanceScore':
        return template.stats?.rating || 0;
      case 'bundleSize':
        return template.manifest?.dependencies?.length || 0;
      case 'dependencies':
        return template.manifest?.dependencies?.length || 0;
      case 'securityScore':
        return template.security?.trusted ? 5 : 3;
      case 'rating':
        return template.rating || 0;
      case 'downloads':
        return template.downloads || 0;
      case 'lastUpdated':
        const days = Math.floor((Date.now() - template.updatedAt) / (1000 * 60 * 60 * 24));
        return days < 30 ? 'Recent' : days < 90 ? 'Updated' : 'Old';
      case 'communityScore':
        return ((template.stats?.likes || 0) / Math.max(template.stats?.views || 1, 1)) * 5;
      case 'price':
        return template.pricing?.price || 0;
      case 'licenseType':
        return template.manifest?.license || 'Unknown';
      case 'supportIncluded':
        return template.preview?.documentation || template.preview?.supportUrl;
      default:
        return null;
    }
  }, []);

  /**
   * Calculate overall score for template
   */
  const calculateOverallScore = useCallback(
    (template: AppTemplate): number => {
      let totalScore = 0;
      let totalWeight = 0;

      COMPARISON_FEATURES.forEach((feature) => {
        const value = getFeatureValue(template, feature);
        let score = 0;

        switch (feature.format) {
          case 'boolean':
            score = value ? 5 : 0;
            break;
          case 'rating':
            score = value;
            break;
          case 'number':
            score = Math.min(value / 100, 5); // Normalize to 0-5
            break;
          case 'currency':
            score = value === 0 ? 5 : Math.max(5 - value / 10, 0); // Free gets highest score
            break;
          case 'text':
            score = 3; // Default score for text features
            break;
        }

        totalScore += score * feature.weight;
        totalWeight += feature.weight;
      });

      return totalWeight > 0 ? totalScore / totalWeight : 0;
    },
    [getFeatureValue],
  );

  /**
   * Get comparison results
   */
  const comparisonResults = useMemo((): ComparisonResult => {
    if (selectedTemplates.length === 0) {
      return {
        features: {},
        dependencies: {},
        ratings: [],
        downloads: [],
        pricing: [],
        complexity: [],
        accessibility: [],
        security: [],
      };
    }

    const results: ComparisonResult = {
      features: {},
      dependencies: {},
      ratings: [],
      downloads: [],
      pricing: [],
      complexity: [],
      accessibility: [],
      security: [],
    };

    // Compare features
    COMPARISON_FEATURES.forEach((feature) => {
      results.features[feature.name] = selectedTemplates.map((template) =>
        getFeatureValue(template, feature),
      );
    });

    // Compare other aspects
    results.ratings = selectedTemplates.map((t) => t.rating);
    results.downloads = selectedTemplates.map((t) => t.downloads);
    results.pricing = selectedTemplates.map((t) => t.pricing);
    results.complexity = selectedTemplates.map((t) => t.manifest.complexity);
    results.accessibility = selectedTemplates.map((t) => t.accessibility?.wcagCompliant || false);
    results.security = selectedTemplates.map((t) => t.security?.trusted || false);

    return results;
  }, [selectedTemplates, getFeatureValue]);

  /**
   * Get recommendation
   */
  const getRecommendation = useMemo(() => {
    if (!enableRecommendations || selectedTemplates.length === 0) return null;

    const scores = selectedTemplates.map((template) => ({
      template,
      score: calculateOverallScore(template),
    }));

    scores.sort((a, b) => b.score - a.score);
    const best = scores[0];

    return {
      template: best.template,
      score: best.score,
      reason: `Highest overall score (${best.score.toFixed(1)}/5)`,
      strengths: COMPARISON_FEATURES.filter((f) => getFeatureValue(best.template, f) > 3)
        .slice(0, 3)
        .map((f) => f.name),
    };
  }, [selectedTemplates, enableRecommendations, calculateOverallScore, getFeatureValue]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  /**
   * Handle template selection
   */
  const handleTemplateSelect = useCallback(
    (template: AppTemplate) => {
      if (selectedTemplates.find((t) => t.id === template.id)) {
        setSelectedTemplates((prev) => prev.filter((t) => t.id !== template.id));
      } else if (selectedTemplates.length < maxTemplates) {
        setSelectedTemplates((prev) => [...prev, template]);
      }

      onTemplateSelect?.(template);
    },
    [selectedTemplates, maxTemplates, onTemplateSelect],
  );

  /**
   * Handle template install
   */
  const handleTemplateInstall = useCallback(
    (template: AppTemplate) => {
      onTemplateInstall?.(template);

      eventBus?.emit('template:comparison-install', {
        templateId: template.id,
        comparisonSize: selectedTemplates.length,
        timestamp: Date.now(),
      });

      logger.info('Template installed from comparison', { templateId: template.id });
    },
    [onTemplateInstall, eventBus, selectedTemplates.length],
  );

  /**
   * Handle template preview
   */
  const handleTemplatePreview = useCallback(
    (template: AppTemplate) => {
      onTemplatePreview?.(template);

      eventBus?.emit('template:comparison-preview', {
        templateId: template.id,
        comparisonSize: selectedTemplates.length,
        timestamp: Date.now(),
      });

      logger.info('Template previewed from comparison', { templateId: template.id });
    },
    [onTemplatePreview, eventBus, selectedTemplates.length],
  );

  /**
   * Clear comparison
   */
  const clearComparison = useCallback(() => {
    setSelectedTemplates([]);
  }, []);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  /**
   * Render feature comparison
   */
  const renderFeatureComparison = (feature: ComparisonFeature) => {
    const values = selectedTemplates.map((template) => getFeatureValue(template, feature));
    const maxValue = Math.max(...values.filter((v) => v !== null && v !== undefined));
    const minValue = Math.min(...values.filter((v) => v !== null && v !== undefined));

    return (
      <div key={feature.key} className="border-b border-gray-200 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <h4 className="font-medium text-gray-900">{feature.name}</h4>
            <Info className="w-4 h-4 text-gray-400" title={feature.description} />
          </div>
          <span className="text-xs text-gray-500">Weight: {feature.weight}</span>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {selectedTemplates.map((template, index) => {
            const value = values[index];
            const isBest = value === maxValue && maxValue !== minValue;
            const isWorst = value === minValue && maxValue !== minValue;

            return (
              <div
                key={template.id}
                className={`p-3 rounded-lg border ${
                  highlightDifferences
                    ? isBest
                      ? 'bg-green-50 border-green-200'
                      : isWorst
                        ? 'bg-red-50 border-red-200'
                        : 'bg-gray-50 border-gray-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="text-sm font-medium text-gray-900 mb-1">{template.name}</div>
                <div className="text-lg font-semibold">
                  {feature.format === 'boolean' ? (
                    value ? (
                      <Check className="w-5 h-5 text-green-600" />
                    ) : (
                      <X className="w-5 h-5 text-red-600" />
                    )
                  ) : feature.format === 'rating' ? (
                    <div className="flex items-center space-x-1">
                      <span>{value.toFixed(1)}</span>
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    </div>
                  ) : feature.format === 'currency' ? (
                    <span>{value === 0 ? 'Free' : `$${value}`}</span>
                  ) : (
                    <span>{value}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  /**
   * Render template card
   */
  const renderTemplateCard = (template: AppTemplate, isSelected: boolean) => {
    const overallScore = calculateOverallScore(template);

    return (
      <motion.div
        key={template.id}
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`relative bg-white rounded-lg border-2 transition-all cursor-pointer ${
          isSelected ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'
        }`}
        onClick={() => handleTemplateSelect(template)}
      >
        {/* Thumbnail */}
        <div className="relative h-32 bg-gray-100 rounded-t-lg overflow-hidden">
          <img
            src={template.thumbnail}
            alt={template.name}
            className="w-full h-full object-cover"
          />
          {isSelected && (
            <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
              <Check className="w-8 h-8 text-white" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-1 truncate">{template.name}</h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span>{template.rating.toFixed(1)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Download className="w-4 h-4" />
              <span>{template.downloads.toLocaleString()}</span>
            </div>
          </div>

          {/* Overall Score */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Overall Score</span>
            <div className="flex items-center space-x-1">
              <span className="font-semibold text-gray-900">{overallScore.toFixed(1)}</span>
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
            </div>
          </div>
        </div>

        {/* Selection Indicator */}
        {isSelected && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
        )}
      </motion.div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <ErrorBoundary componentName="TemplateComparison">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Template Comparison</h1>
            <p className="text-gray-600">Compare up to {maxTemplates} templates side by side</p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowDetailedComparison(!showDetailedComparison)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              {showDetailedComparison ? (
                <>
                  <Minimize2 className="w-4 h-4" />
                  <span>Simple View</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4" />
                  <span>Detailed View</span>
                </>
              )}
            </button>

            {selectedTemplates.length > 0 && (
              <button
                onClick={clearComparison}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Template Selection */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Select Templates to Compare ({selectedTemplates.length}/{maxTemplates})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {templates.map((template) => {
              const isSelected = selectedTemplates.some((t) => t.id === template.id);
              return renderTemplateCard(template, isSelected);
            })}
          </div>
        </div>

        {/* Comparison Results */}
        {selectedTemplates.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Recommendation */}
            {getRecommendation && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-blue-900">
                      Recommended: {getRecommendation.template.name}
                    </h3>
                    <p className="text-blue-700 text-sm">
                      {getRecommendation.reason} • Strengths:{' '}
                      {getRecommendation.strengths.join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Comparison Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Feature Comparison</h3>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={highlightDifferences}
                        onChange={(e) => setHighlightDifferences(e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-600">Highlight differences</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                {showDetailedComparison ? (
                  <div className="p-6 space-y-4">
                    {COMPARISON_FEATURES.map(renderFeatureComparison)}
                  </div>
                ) : (
                  <div className="p-6">
                    <div className="grid grid-cols-4 gap-6">
                      {selectedTemplates.map((template) => (
                        <div key={template.id} className="text-center">
                          <h4 className="font-semibold text-gray-900 mb-4">{template.name}</h4>

                          <div className="space-y-3">
                            <div>
                              <div className="text-2xl font-bold text-gray-900">
                                {calculateOverallScore(template).toFixed(1)}
                              </div>
                              <div className="text-sm text-gray-500">Overall Score</div>
                            </div>

                            <div className="flex justify-center space-x-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTemplatePreview(template);
                                }}
                                className="p-2 text-gray-600 hover:text-gray-800"
                                title="Preview"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTemplateInstall(template);
                                }}
                                className="p-2 text-gray-600 hover:text-gray-800"
                                title="Install"
                              >
                                <DownloadIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {selectedTemplates.length === 0 && (
          <div className="text-center py-12">
            <Compare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates selected</h3>
            <p className="text-gray-500">
              Select up to {maxTemplates} templates above to start comparing
            </p>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export default TemplateComparison;
