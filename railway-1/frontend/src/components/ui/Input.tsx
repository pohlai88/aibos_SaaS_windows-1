import React from 'react';
import { cn } from '@/lib/utils';

// ==================== MANIFESTOR INTEGRATION ====================
import { useManifestor, usePermission, useModuleConfig, useModuleEnabled } from '@/hooks/useManifestor';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size' | 'prefix' | 'suffix'> {
  label?: string;
  error?: string;
  variant?: 'default' | 'error' | 'success' | 'warning';
  inputSize?: 'sm' | 'md' | 'lg';
  onChange: (value: string) => void;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
}

export function Input({
  label,
  error,
  variant = 'default',
  inputSize = 'md',
  className,
  onChange,
  prefix,
  suffix,
  clearable = false,
  onClear,
  ...props
}: InputProps) {
  // ==================== MANIFESTOR INTEGRATION ====================
  const { can, getConfig, isEnabled, health, loading: manifestLoading, error: manifestError } = useManifestor();
  const moduleConfig = useModuleConfig('ui');
  const isModuleEnabled = useModuleEnabled('ui');

  // Check permissions for current user
  const currentUser = { id: 'current-user', role: 'user', permissions: [] };
  const canView = usePermission('ui', 'view', currentUser);
  const canInteract = usePermission('ui', 'interact', currentUser);

  // Get configuration from manifest
  const inputConfig = moduleConfig.components?.Input;
  const accessibility = moduleConfig.accessibility;

  // ==================== MANIFESTOR PERMISSION CHECKS ====================
  if (manifestLoading) {
    return <div className="animate-pulse bg-gray-200 rounded-lg h-10 w-full" />;
  }

  if (manifestError) {
    return <input className="px-4 py-2 border-red-600 rounded-lg" placeholder="Error" disabled />;
  }

  if (!isModuleEnabled) {
    return <input className="px-4 py-2 bg-gray-400 rounded-lg" placeholder="Disabled" disabled />;
  }

  if (!canView) {
    return null;
  }

  // Validate variant and size against manifest
  const allowedVariants = inputConfig?.variants || ['default', 'error', 'success', 'warning'];
  const allowedSizes = inputConfig?.sizes || ['sm', 'md', 'lg'];

  const finalVariant = allowedVariants.includes(variant) ? variant : 'default';
  const finalSize = allowedSizes.includes(inputSize) ? inputSize : 'md';
  // Check if features are enabled
  const validationEnabled = inputConfig?.features?.validation;
  const prefixEnabled = inputConfig?.features?.prefix;
  const suffixEnabled = inputConfig?.features?.suffix;
  const clearableEnabled = inputConfig?.features?.clearable;

  // ==================== MANIFEST-DRIVEN STYLING ====================
  const baseClasses = 'block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variants = {
    default: 'focus:ring-primary-500 focus:border-primary-500',
    error: 'border-red-300 focus:ring-red-500 focus:border-red-500',
    success: 'border-green-300 focus:ring-green-500 focus:border-green-500',
    warning: 'border-yellow-300 focus:ring-yellow-500 focus:border-yellow-500',
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  const inputVariant = error ? 'error' : finalVariant;
  const inputValue = props.value as string || '';

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        {/* Manifest-driven prefix */}
        {prefix && prefixEnabled && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500">{prefix}</span>
          </div>
        )}

        <input
          className={cn(
            baseClasses,
            variants[inputVariant],
            sizes[finalSize],
            // Manifest-driven accessibility
            accessibility ? 'focus-visible:ring-2 focus-visible:ring-offset-2' : '',
            // Prefix spacing
            prefix && prefixEnabled ? 'pl-10' : '',
            // Suffix spacing
            (suffix && suffixEnabled) || (clearable && clearableEnabled && inputValue) ? 'pr-10' : '',
            className
          )}
          onChange={(e) => onChange(e.target.value)}
          {...props}
        />

        {/* Manifest-driven suffix */}
        {suffix && suffixEnabled && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500">{suffix}</span>
          </div>
        )}

        {/* Manifest-driven clearable */}
        {clearable && clearableEnabled && inputValue && onClear && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={onClear}
          >
            <svg className="h-4 w-4 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Manifest-driven validation */}
      {error && validationEnabled && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
