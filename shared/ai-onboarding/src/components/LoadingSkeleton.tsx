/**
 * LoadingSkeleton Component
 *
 * Provides smooth loading animations and skeleton placeholders
 * for better user experience during loading states.
 */

import React from 'react';
import { motion } from 'framer-motion';

export interface LoadingSkeletonProps {
  /** Number of skeleton items to render */
  count?: number;
  /** Height of each skeleton item */
  height?: number;
  /** Width of skeleton items (can be percentage or pixels) */
  width?: string;
  /** Spacing between skeleton items */
  spacing?: number;
  /** Animation duration */
  duration?: number;
  /** Custom className for styling */
  className?: string;
  /** Variant of skeleton to render */
  variant?: 'text' | 'card' | 'list' | 'grid';
  /** Whether to show shimmer effect */
  shimmer?: boolean;
}

/**
 * Loading Skeleton Component
 * Provides animated skeleton placeholders for loading states
 */
export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  count = 3,
  height = 20,
  width = '100%',
  spacing = 8,
  duration = 1.5,
  className = '',
  variant = 'text',
  shimmer = true,
}) => {
  // ============================================================================
  // ANIMATION VARIANTS
  // ============================================================================

  const shimmerVariants = {
    initial: { x: '-100%' },
    animate: { x: '100%' },
  };

  const pulseVariants = {
    initial: { opacity: 0.6 },
    animate: {
      opacity: [0.6, 1, 0.6],
      transition: {
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  // ============================================================================
  // SKELETON ITEM RENDERER
  // ============================================================================

  const renderSkeletonItem = (index: number) => {
    const baseClasses = 'bg-gray-200 rounded';
    const shimmerClasses = shimmer ? 'relative overflow-hidden' : '';

    switch (variant) {
      case 'card':
        return (
          <motion.div
            key={index}
            className={`${baseClasses} ${shimmerClasses} p-4`}
            style={{ height: height * 2, width }}
            variants={pulseVariants}
            initial="initial"
            animate="animate"
          >
            {shimmer && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                variants={shimmerVariants}
                initial="initial"
                animate="animate"
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-3/4" />
              <div className="h-3 bg-gray-300 rounded w-1/2" />
              <div className="h-3 bg-gray-300 rounded w-2/3" />
            </div>
          </motion.div>
        );

      case 'list':
        return (
          <motion.div
            key={index}
            className={`${baseClasses} ${shimmerClasses} flex items-center space-x-3 p-3`}
            style={{ height, width }}
            variants={pulseVariants}
            initial="initial"
            animate="animate"
          >
            {shimmer && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                variants={shimmerVariants}
                initial="initial"
                animate="animate"
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}
            <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-300 rounded w-3/4" />
              <div className="h-2 bg-gray-300 rounded w-1/2" />
            </div>
          </motion.div>
        );

      case 'grid':
        return (
          <motion.div
            key={index}
            className={`${baseClasses} ${shimmerClasses} p-3`}
            style={{ height: height * 1.5, width }}
            variants={pulseVariants}
            initial="initial"
            animate="animate"
          >
            {shimmer && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                variants={shimmerVariants}
                initial="initial"
                animate="animate"
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}
            <div className="space-y-2">
              <div className="h-3 bg-gray-300 rounded w-2/3" />
              <div className="h-2 bg-gray-300 rounded w-1/3" />
            </div>
          </motion.div>
        );

      default: // text
        return (
          <motion.div
            key={index}
            className={`${baseClasses} ${shimmerClasses}`}
            style={{ height, width }}
            variants={pulseVariants}
            initial="initial"
            animate="animate"
          >
            {shimmer && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                variants={shimmerVariants}
                initial="initial"
                animate="animate"
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}
          </motion.div>
        );
    }
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div
      className={`space-y-${spacing} ${className}`}
      style={{ '--spacing': `${spacing}px` } as React.CSSProperties}
    >
      {Array.from({ length: count }, (_, index) => renderSkeletonItem(index))}
    </div>
  );
};

/**
 * Specialized skeleton components for common use cases
 */

export const TextSkeleton: React.FC<Omit<LoadingSkeletonProps, 'variant'>> = (props) => (
  <LoadingSkeleton {...props} variant="text" />
);

export const CardSkeleton: React.FC<Omit<LoadingSkeletonProps, 'variant'>> = (props) => (
  <LoadingSkeleton {...props} variant="card" />
);

export const ListSkeleton: React.FC<Omit<LoadingSkeletonProps, 'variant'>> = (props) => (
  <LoadingSkeleton {...props} variant="list" />
);

export const GridSkeleton: React.FC<Omit<LoadingSkeletonProps, 'variant'>> = (props) => (
  <LoadingSkeleton {...props} variant="grid" />
);

/**
 * Goal selection skeleton specifically for the onboarding flow
 */
export const GoalSelectionSkeleton: React.FC = () => (
  <div className="space-y-4">
    {Array.from({ length: 5 }, (_, index) => (
      <motion.div
        key={index}
        className="p-6 border-2 border-gray-200 bg-white rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse" />
          <div className="flex-1 space-y-3">
            <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
            <div className="flex space-x-2">
              <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse" />
              <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse" />
              <div className="h-6 bg-gray-200 rounded-full w-14 animate-pulse" />
            </div>
          </div>
        </div>
      </motion.div>
    ))}
  </div>
);

/**
 * Learning path skeleton for path generation
 */
export const LearningPathSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="text-center space-y-4">
      <div className="h-8 bg-gray-200 rounded w-2/3 mx-auto animate-pulse" />
      <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto animate-pulse" />
    </div>

    <div className="space-y-4">
      {Array.from({ length: 3 }, (_, index) => (
        <motion.div
          key={index}
          className="p-4 border border-gray-200 bg-white rounded-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.2 }}
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
              <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
            </div>
            <div className="h-6 bg-gray-200 rounded w-16 animate-pulse" />
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);
