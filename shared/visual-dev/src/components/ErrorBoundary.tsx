/**
 * Visual Development Error Boundaries
 *
 * Enterprise-grade error handling with graceful degradation,
 * user feedback, and comprehensive error reporting.
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RotateCcw, Download, Bug, ArrowLeft, Copy, Check } from 'lucide-react';
import { logger } from '@aibos/shared/lib';

// Temporary logger fallback until shared lib is built
const logger = {
  error: (message: string, data?: any) => {
    console.error(message, data);
  }
};

// ============================================================================
// ERROR BOUNDARY TYPES
// ============================================================================

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

interface ErrorFallbackProps {
  error: Error;
  errorInfo: ErrorInfo;
  resetError: () => void;
  errorId: string;
}

// ============================================================================
// MAIN ERROR BOUNDARY
// ============================================================================

export class VisualDevErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorId = this.state.errorId;

    // Log error with full context
    logger.error('Visual Development Error Boundary caught error', {
      errorId,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      errorInfo: {
        componentStack: errorInfo.componentStack,
      },
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    });

    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Report to monitoring service
    this.reportError(error, errorInfo, errorId);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetKeys?.some((key: string | number, idx: number) => prevProps.resetKeys?.[idx] !== key)) {
        this.resetError();
      }
    }

    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.resetError();
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    });
  };

  private reportError = async (error: Error, errorInfo: ErrorInfo, errorId: string) => {
    try {
      // In a real implementation, this would send to your error tracking service
      const errorReport = {
        errorId,
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
        componentStack: errorInfo.componentStack,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: 'current-user-id', // Get from auth context
        buildVersion: process.env.REACT_APP_VERSION || 'unknown',
      };

      // Send to error tracking service (Sentry, LogRocket, etc.)
      console.log('Error report generated:', errorReport);
    } catch (reportingError) {
      logger.error('Failed to report error', { reportingError });
    }
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;

      return (
        <FallbackComponent
          error={this.state.error!}
          errorInfo={this.state.errorInfo!}
          resetError={this.resetError}
          errorId={this.state.errorId}
        />
      );
    }

    return this.props.children;
  }
}

// ============================================================================
// DEFAULT ERROR FALLBACK COMPONENTS
// ============================================================================

const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  resetError,
  errorId,
}: ErrorFallbackProps) => {
  const [copied, setCopied] = React.useState(false);

  const copyErrorDetails = async () => {
    const errorDetails = `
Error ID: ${errorId}
Error: ${error.name}: ${error.message}
Component Stack: ${errorInfo.componentStack}
Time: ${new Date().toISOString()}
URL: ${window.location.href}
    `.trim();

    try {
      await navigator.clipboard.writeText(errorDetails);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy error details', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-red-100 rounded-full">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Something went wrong</h1>
            <p className="text-gray-600">An unexpected error occurred in the visual development environment</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">Error Details</h3>
            <button
              onClick={copyErrorDetails}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-sm text-gray-700 mb-2">
            <strong>Error:</strong> {error.message}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Error ID:</strong> {errorId}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={resetError}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Reload Page
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export const CanvasErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
  errorId,
}: ErrorFallbackProps) => (
  <div className="flex items-center justify-center h-64 bg-red-50 rounded-lg border-2 border-red-200">
    <div className="text-center p-6">
      <Bug className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-red-800 mb-2">Canvas Error</h3>
      <p className="text-red-600 mb-4">The visual canvas encountered an error</p>
      <button
        onClick={resetError}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
      >
        Reset Canvas
      </button>
    </div>
  </div>
);

export const AIAssistantErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }: ErrorFallbackProps) => (
  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
    <div className="flex items-center gap-3">
      <AlertTriangle className="w-5 h-5 text-yellow-600" />
      <div>
        <h4 className="font-medium text-yellow-800">AI Assistant Error</h4>
        <p className="text-sm text-yellow-700">The AI assistant encountered an issue</p>
      </div>
      <button
        onClick={resetError}
        className="ml-auto px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded transition-colors"
      >
        Retry
      </button>
    </div>
  </div>
);

// Helper function to wrap components with error boundary
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<ErrorBoundaryProps>
) => {
  return (props: P) => (
    <VisualDevErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </VisualDevErrorBoundary>
  );
};

// ============================================================================
// ASYNC ERROR HANDLING UTILITIES
// ============================================================================

export const handleAsyncError = (error: Error, context: string) => {
  const errorId = `async-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  logger.error(`Async error in ${context}`, {
    errorId,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    context,
    timestamp: Date.now(),
  });

  // Show user-friendly notification
  // This would integrate with your notification system
  console.error(`Error in ${context}:`, error);

  return errorId;
};

export const createSafeAsyncHandler = <T extends any[], R>(
  handler: (...args: T) => Promise<R>,
  context: string,
  fallbackValue?: R,
) => {
  return async (...args: T): Promise<R | undefined> => {
    try {
      return await handler(...args);
    } catch (error) {
      handleAsyncError(error as Error, context);
      return fallbackValue;
    }
  };
};
