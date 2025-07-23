/**
 * AI-BOS Community Templates - Error Boundary Component
 *
 * Comprehensive error boundary for robust error handling with fallback UI,
 * error reporting, and recovery mechanisms.
 */

'use client';

import type { ErrorInfo, ReactNode } from 'react';
import React, { Component } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, ArrowLeft, Bug } from 'lucide-react';

// AI-BOS Shared Library Integration
import { logger, monitoring } from '@aibos/shared/lib';

// ============================================================================
// ERROR BOUNDARY TYPES
// ============================================================================

export interface ErrorBoundaryProps {
  /** Child components to render */
  children: ReactNode;
  /** Custom fallback component */
  fallback?: ReactNode;
  /** Error reporting callback */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Recovery callback */
  onRecover?: () => void;
  /** Show error details in development */
  showErrorDetails?: boolean;
  /** Custom error message */
  errorMessage?: string;
  /** Custom recovery message */
  recoveryMessage?: string;
  /** Enable automatic error reporting */
  enableReporting?: boolean;
  /** Component name for error context */
  componentName?: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  isRecovering: boolean;
}

// ============================================================================
// ERROR FALLBACK COMPONENTS
// ============================================================================

/**
 * Default error fallback component
 */
const DefaultErrorFallback: React.FC<{
  error: Error;
  errorInfo: ErrorInfo;
  errorId: string;
  onRetry: () => void;
  onGoHome: () => void;
  onGoBack: () => void;
  showErrorDetails?: boolean;
  errorMessage?: string;
  recoveryMessage?: string;
}> = ({
  error,
  errorInfo,
  errorId,
  onRetry,
  onGoHome,
  onGoBack,
  showErrorDetails = false,
  errorMessage = 'Something went wrong',
  recoveryMessage = 'We encountered an unexpected error. Please try again.',
}) => {
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center"
      >
        {/* Error Icon */}
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>

        {/* Error Message */}
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{errorMessage}</h2>

        <p className="text-gray-600 mb-6">{recoveryMessage}</p>

        {/* Error ID for support */}
        <div className="bg-gray-100 rounded-lg p-3 mb-6">
          <p className="text-sm text-gray-500">
            Error ID: <code className="font-mono text-xs">{errorId}</code>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onRetry}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <div className="flex space-x-2">
            <button
              onClick={onGoBack}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>

            <button
              onClick={onGoHome}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center space-x-2"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>
          </div>
        </div>

        {/* Error Details (Development) */}
        {showErrorDetails && (
          <div className="mt-6">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1 mx-auto"
            >
              <Bug className="w-4 h-4" />
              <span>{showDetails ? 'Hide' : 'Show'} Error Details</span>
            </button>

            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 text-left"
              >
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-2">Error Details:</h4>
                  <pre className="text-xs text-red-700 overflow-auto max-h-32">{error.stack}</pre>

                  <h4 className="font-semibold text-red-800 mb-2 mt-4">Component Stack:</h4>
                  <pre className="text-xs text-red-700 overflow-auto max-h-32">
                    {errorInfo.componentStack}
                  </pre>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Support Information */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            If this problem persists, please contact support with the Error ID above.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

/**
 * Template-specific error fallback
 */
const TemplateErrorFallback: React.FC<{
  error: Error;
  errorId: string;
  onRetry: () => void;
  onGoBack: () => void;
}> = ({ error, errorId, onRetry, onGoBack }) => (
  <div className="bg-white rounded-lg border border-red-200 p-6 text-center">
    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <AlertTriangle className="w-6 h-6 text-red-600" />
    </div>

    <h3 className="text-lg font-semibold text-gray-900 mb-2">Template Loading Error</h3>

    <p className="text-gray-600 mb-4">
      We couldn't load the template. This might be a temporary issue.
    </p>

    <div className="bg-gray-100 rounded-lg p-3 mb-4">
      <p className="text-sm text-gray-500">
        Error ID: <code className="font-mono text-xs">{errorId}</code>
      </p>
    </div>

    <div className="flex space-x-3">
      <button
        onClick={onRetry}
        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Retry</span>
      </button>

      <button
        onClick={onGoBack}
        className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center space-x-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Go Back</span>
      </button>
    </div>
  </div>
);

// ============================================================================
// ERROR BOUNDARY CLASS
// ============================================================================

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      isRecovering: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: this.generateErrorId(),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Update state with error info
    this.setState({
      errorInfo,
      errorId: this.generateErrorId(),
    });

    // Log error
    logger.error('Error Boundary caught an error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      componentName: this.props.componentName,
    });

    // Report to monitoring
    if (this.props.enableReporting !== false) {
      monitoring.captureException(error, {
        tags: {
          component: this.props.componentName || 'Unknown',
          errorId: this.state.errorId,
        },
        extra: {
          componentStack: errorInfo.componentStack,
          errorInfo,
        },
      });
    }

    // Call custom error handler
    this.props.onError?.(error, errorInfo);
  }

  /**
   * Generate unique error ID for tracking
   */
  private static generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Handle retry/recovery
   */
  private handleRetry = () => {
    this.setState({ isRecovering: true });

    // Call recovery callback
    this.props.onRecover?.();

    // Reset error state after a short delay
    setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: '',
        isRecovering: false,
      });
    }, 100);
  };

  /**
   * Handle navigation to home
   */
  private handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  /**
   * Handle navigation back
   */
  private handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      this.handleGoHome();
    }
  };

  render() {
    // Show loading state while recovering
    if (this.state.isRecovering) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Recovering...</p>
          </div>
        </div>
      );
    }

    // Show error fallback if there's an error
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Use template-specific fallback for template-related errors
      if (this.props.componentName?.includes('Template')) {
        return (
          <TemplateErrorFallback
            error={this.state.error}
            errorId={this.state.errorId}
            onRetry={this.handleRetry}
            onGoBack={this.handleGoBack}
          />
        );
      }

      // Use default fallback
      return (
        <DefaultErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo!}
          errorId={this.state.errorId}
          onRetry={this.handleRetry}
          onGoHome={this.handleGoHome}
          onGoBack={this.handleGoBack}
          showErrorDetails={this.props.showErrorDetails}
          errorMessage={this.props.errorMessage}
          recoveryMessage={this.props.recoveryMessage}
        />
      );
    }

    // Render children normally
    return this.props.children;
  }
}

// ============================================================================
// HOOK FOR FUNCTIONAL COMPONENTS
// ============================================================================

/**
 * Hook for error handling in functional components
 */
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((error: Error) => {
    setError(error);
    logger.error('Error caught by useErrorHandler', { error: error.message });
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, clearError };
};

// ============================================================================
// EXPORTS
// ============================================================================

export default ErrorBoundary;
