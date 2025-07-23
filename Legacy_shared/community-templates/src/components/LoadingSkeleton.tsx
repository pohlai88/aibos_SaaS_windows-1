/**
 * AI-BOS Community Templates - Loading Skeleton Component
 *
 * Comprehensive loading skeleton for template browser with multiple variants
 * for different loading states and view modes.
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';

// ============================================================================
// SKELETON TYPES
// ============================================================================

export interface SkeletonProps {
  /** Type of skeleton to render */
  variant?: 'card' | 'list' | 'grid' | 'header' | 'sidebar' | 'modal';
  /** Number of skeleton items to render */
  count?: number;
  /** View mode for template cards */
  viewMode?: 'grid' | 'list';
  /** Show animation */
  animated?: boolean;
  /** Custom className */
  className?: string;
  /** Custom height */
  height?: string;
  /** Custom width */
  width?: string;
}

// ============================================================================
// SKELETON COMPONENTS
// ============================================================================

/**
 * Base skeleton item with animation
 */
const SkeletonItem: React.FC<{
  className?: string;
  height?: string;
  width?: string;
  animated?: boolean;
}> = ({ className = '', height = 'h-4', width = 'w-full', animated = true }) => {
  const baseClasses = `bg-gray-200 rounded ${height} ${width} ${className}`;

  if (!animated) {
    return <div className={baseClasses} />;
  }

  return (
    <motion.div
      className={baseClasses}
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
};

/**
 * Template Card Skeleton
 */
const TemplateCardSkeleton: React.FC<{ viewMode?: 'grid' | 'list' }> = ({ viewMode = 'grid' }) => {
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
        <div className="flex items-start space-x-4">
          {/* Thumbnail */}
          <SkeletonItem className="w-24 h-24 rounded-lg flex-shrink-0" />

          {/* Content */}
          <div className="flex-1 space-y-2">
            <SkeletonItem className="h-6 w-3/4" />
            <SkeletonItem className="h-4 w-full" />
            <SkeletonItem className="h-4 w-2/3" />

            {/* Tags */}
            <div className="flex space-x-2">
              <SkeletonItem className="h-6 w-16 rounded-full" />
              <SkeletonItem className="h-6 w-20 rounded-full" />
              <SkeletonItem className="h-6 w-14 rounded-full" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col space-y-2">
            <SkeletonItem className="h-8 w-20 rounded" />
            <SkeletonItem className="h-8 w-16 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Thumbnail */}
      <SkeletonItem className="w-full h-48" />

      {/* Content */}
      <div className="p-4 space-y-3">
        <SkeletonItem className="h-6 w-3/4" />
        <SkeletonItem className="h-4 w-full" />
        <SkeletonItem className="h-4 w-2/3" />

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          <SkeletonItem className="h-6 w-16 rounded-full" />
          <SkeletonItem className="h-6 w-20 rounded-full" />
          <SkeletonItem className="h-6 w-14 rounded-full" />
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-4">
            <SkeletonItem className="h-4 w-12" />
            <SkeletonItem className="h-4 w-16" />
          </div>
          <SkeletonItem className="h-8 w-20 rounded" />
        </div>
      </div>
    </div>
  );
};

/**
 * Header Skeleton
 */
const HeaderSkeleton: React.FC = () => (
  <div className="bg-white border-b border-gray-200 p-6 space-y-4">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <SkeletonItem className="h-8 w-64" />
        <SkeletonItem className="h-4 w-96" />
      </div>
      <div className="flex items-center space-x-3">
        <SkeletonItem className="h-10 w-20 rounded-lg" />
        <SkeletonItem className="h-10 w-24 rounded-lg" />
      </div>
    </div>

    {/* Active filters */}
    <div className="flex items-center space-x-2">
      <SkeletonItem className="h-4 w-24" />
      <SkeletonItem className="h-6 w-20 rounded-full" />
      <SkeletonItem className="h-6 w-16 rounded-full" />
    </div>

    <SkeletonItem className="h-4 w-32" />
  </div>
);

/**
 * Sidebar Skeleton
 */
const SidebarSkeleton: React.FC = () => (
  <div className="w-80 bg-white border-r border-gray-200 p-6 space-y-6">
    {/* Search */}
    <div className="space-y-2">
      <SkeletonItem className="h-4 w-16" />
      <SkeletonItem className="h-10 w-full rounded-lg" />
    </div>

    {/* Categories */}
    <div className="space-y-3">
      <SkeletonItem className="h-4 w-20" />
      <div className="space-y-2">
        {[...Array(6)].map((_, i) => (
          <SkeletonItem key={i} className="h-10 w-full rounded-lg" />
        ))}
      </div>
    </div>

    {/* Tags */}
    <div className="space-y-3">
      <SkeletonItem className="h-4 w-12" />
      <div className="flex flex-wrap gap-2">
        {[...Array(8)].map((_, i) => (
          <SkeletonItem key={i} className="h-6 w-16 rounded-full" />
        ))}
      </div>
    </div>

    {/* Sort */}
    <div className="space-y-3">
      <SkeletonItem className="h-4 w-16" />
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <SkeletonItem key={i} className="h-10 w-full rounded-lg" />
        ))}
      </div>
    </div>
  </div>
);

/**
 * Modal Skeleton
 */
const ModalSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg max-w-4xl mx-auto overflow-hidden">
    {/* Header */}
    <div className="p-6 border-b border-gray-200">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <SkeletonItem className="h-8 w-3/4" />
          <SkeletonItem className="h-4 w-1/2" />
        </div>
        <SkeletonItem className="h-8 w-8 rounded" />
      </div>
    </div>

    {/* Content */}
    <div className="p-6 space-y-6">
      {/* Screenshots */}
      <div className="space-y-2">
        <SkeletonItem className="h-4 w-24" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <SkeletonItem key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <SkeletonItem className="h-4 w-20" />
        <SkeletonItem className="h-4 w-full" />
        <SkeletonItem className="h-4 w-3/4" />
        <SkeletonItem className="h-4 w-2/3" />
      </div>

      {/* Features */}
      <div className="space-y-2">
        <SkeletonItem className="h-4 w-16" />
        <div className="grid grid-cols-2 gap-2">
          {[...Array(6)].map((_, i) => (
            <SkeletonItem key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-3 pt-4">
        <SkeletonItem className="h-10 w-24 rounded-lg" />
        <SkeletonItem className="h-10 w-32 rounded-lg" />
      </div>
    </div>
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Loading Skeleton Component
 * Renders appropriate skeleton based on variant and props
 */
export const LoadingSkeleton: React.FC<SkeletonProps> = ({
  variant = 'card',
  count = 1,
  viewMode = 'grid',
  animated = true,
  className = '',
  height,
  width,
}) => {
  // Custom skeleton with specific dimensions
  if (height || width) {
    return (
      <div className={className}>
        {[...Array(count)].map((_, i) => (
          <SkeletonItem key={i} height={height} width={width} animated={animated} />
        ))}
      </div>
    );
  }

  // Render based on variant
  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <div className={`space-y-4 ${className}`}>
            {[...Array(count)].map((_, i) => (
              <TemplateCardSkeleton key={i} viewMode={viewMode} />
            ))}
          </div>
        );

      case 'list':
        return (
          <div className={`space-y-4 ${className}`}>
            {[...Array(count)].map((_, i) => (
              <TemplateCardSkeleton key={i} viewMode="list" />
            ))}
          </div>
        );

      case 'grid':
        return (
          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}
          >
            {[...Array(count)].map((_, i) => (
              <TemplateCardSkeleton key={i} viewMode="grid" />
            ))}
          </div>
        );

      case 'header':
        return <HeaderSkeleton />;

      case 'sidebar':
        return <SidebarSkeleton />;

      case 'modal':
        return <ModalSkeleton />;

      default:
        return (
          <div className={className}>
            {[...Array(count)].map((_, i) => (
              <SkeletonItem key={i} animated={animated} />
            ))}
          </div>
        );
    }
  };

  return renderSkeleton();
};

// ============================================================================
// EXPORTS
// ============================================================================

export default LoadingSkeleton;
