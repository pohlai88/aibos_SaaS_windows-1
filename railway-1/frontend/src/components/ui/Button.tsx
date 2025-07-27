import React, { useCallback } from 'react';
import { cn } from '@/lib/utils';

// ==================== MANIFESTOR INTEGRATION ====================
import { useManifestor, usePermission, useModuleConfig, useModuleEnabled } from '@/hooks/useManifestor';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  loading?: boolean;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  loading = false,
  icon,
  badge,
  ...props
}: ButtonProps) {
  // ==================== MANIFESTOR INTEGRATION ====================
  const { manifestor, health, isHealthy } = useManifestor();
  const moduleConfig = useModuleConfig('ui');
  const isModuleEnabled = useModuleEnabled('ui');

  // Create the missing properties that the component expects
  const can = useCallback((resource: string, action: string, user: any) => {
    return manifestor.can(resource, action, user);
  }, [manifestor]);

  const getConfig = useCallback((moduleId: string) => {
    return manifestor.getConfig(moduleId);
  }, [manifestor]);

  const isEnabled = useCallback((moduleId: string) => {
    return manifestor.isEnabled(moduleId);
  }, [manifestor]);

  const manifestLoading = !isHealthy;
  const manifestError = health?.error || null;

  // Check permissions for current user
  const currentUser = { id: 'current-user', role: 'user', permissions: [] };
  const canView = usePermission('ui', 'view', currentUser);
  const canInteract = usePermission('ui', 'interact', currentUser);
  const canAnimate = usePermission('ui', 'animate', currentUser);

  // Get configuration from manifest
  const buttonConfig = moduleConfig.components?.Button;
  const animations = moduleConfig.animations;
  const accessibility = moduleConfig.accessibility;

  // ==================== MANIFESTOR PERMISSION CHECKS ====================
  if (manifestLoading) {
    return <div className="animate-pulse bg-gray-200 rounded-lg h-10 w-20" />;
  }

  if (manifestError) {
    return <button className="px-4 py-2 bg-red-600 text-white rounded-lg">Error</button>;
  }

  if (!isModuleEnabled) {
    return <button className="px-4 py-2 bg-gray-400 text-white rounded-lg" disabled>Disabled</button>;
  }

  if (!canView) {
    return null;
  }

  // Validate variant and size against manifest
  const allowedVariants = buttonConfig?.variants || ['primary', 'secondary', 'outline', 'ghost'];
  const allowedSizes = buttonConfig?.sizes || ['sm', 'md', 'lg'];

  const finalVariant = allowedVariants.includes(variant) ? variant : 'primary';
  const finalSize = allowedSizes.includes(size) ? size : 'md';
    // ==================== MANIFEST-DRIVEN STYLING ====================
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-500',
    outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700 focus:ring-gray-500',
    ghost: 'hover:bg-gray-100 text-gray-700 focus:ring-gray-500',
    destructive: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    link: 'text-primary-600 hover:text-primary-700 underline focus:ring-primary-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
  };

  // Check if features are enabled
  const loadingEnabled = buttonConfig?.features?.loading;
  const iconEnabled = buttonConfig?.features?.icon;
  const badgeEnabled = buttonConfig?.features?.badge;

  return (
    <button
      className={cn(
        baseClasses,
        variants[finalVariant],
        sizes[finalSize],
        // Manifest-driven animations
        animations && canAnimate ? 'transition-all duration-200' : '',
        // Manifest-driven accessibility
        accessibility ? 'focus-visible:ring-2 focus-visible:ring-offset-2' : '',
        className
      )}
      disabled={loading && loadingEnabled ? true : props.disabled}
      {...props}
    >
      {/* Manifest-driven icon */}
      {icon && iconEnabled && (
        <span className="mr-2">{icon}</span>
      )}

      {/* Manifest-driven loading state */}
      {loading && loadingEnabled && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}

      {children}

      {/* Manifest-driven badge */}
      {badge && badgeEnabled && (
        <span className="ml-2">{badge}</span>
      )}
    </button>
  );
}
