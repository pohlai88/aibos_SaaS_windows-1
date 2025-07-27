'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, Bug, X } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

// ==================== TYPES ====================

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

// ==================== ERROR BOUNDARY ====================

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      showDetails: false
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Send error to monitoring service (if available)
    this.reportError(error, errorInfo);
  }

  reportError = (error: Error, errorInfo: ErrorInfo) => {
    // In a real app, you would send this to your error monitoring service
    // like Sentry, LogRocket, etc.
    try {
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        url: typeof window !== 'undefined' ? window.location.href : '',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
      };

      // Send to backend error reporting endpoint
      fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorReport)
      }).catch(console.error);

      console.log('Error reported:', errorReport);
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false
    });
  };

  handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  override render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl w-full"
          >
            {/* Error Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-red-500/20 shadow-2xl">
              {/* Header */}
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-2xl mb-4"
                >
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </motion.div>
                <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
                <p className="text-red-200 text-sm">
                  AI-BOS encountered an unexpected error. Don&apos;t worry, we&apos;re working to fix it.
                </p>
              </div>

              {/* Error Message */}
              {this.state.error && (
                <div className="mb-6 p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                  <p className="text-red-300 text-sm font-mono">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={this.handleRetry}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={this.handleGoHome}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-200 border border-white/20"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </motion.button>
              </div>

              {/* Error Details Toggle */}
              <div className="border-t border-white/10 pt-4">
                <button
                  onClick={this.toggleDetails}
                  className="flex items-center gap-2 text-purple-300 hover:text-white text-sm transition-colors"
                >
                  <Bug className="w-4 h-4" />
                  {this.state.showDetails ? 'Hide' : 'Show'} Error Details
                </button>

                {/* Error Details */}
                <AnimatePresence>
                  {this.state.showDetails && this.state.error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 p-4 bg-black/20 rounded-xl border border-white/10"
                    >
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-white font-semibold text-sm mb-1">Error Message:</h4>
                          <p className="text-red-300 text-xs font-mono break-all">
                            {this.state.error.message}
                          </p>
                        </div>

                        {this.state.error.stack && (
                          <div>
                            <h4 className="text-white font-semibold text-sm mb-1">Stack Trace:</h4>
                            <pre className="text-red-300 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                              {this.state.error.stack}
                            </pre>
                          </div>
                        )}

                        {this.state.errorInfo?.componentStack && (
                          <div>
                            <h4 className="text-white font-semibold text-sm mb-1">Component Stack:</h4>
                            <pre className="text-red-300 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                              {this.state.errorInfo.componentStack}
                            </pre>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Help Text */}
              <div className="mt-6 text-center">
                <p className="text-gray-400 text-xs">
                  If this error persists, please contact support with the error details above.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ==================== HOOK FOR FUNCTIONAL COMPONENTS ====================

export const useErrorHandler = () => {
  const handleError = (error: Error, context?: string) => {
    console.error(`Error in ${context || 'component'}:`, error);

    // You can add custom error handling logic here
    // For example, sending to error reporting service

    // Re-throw the error to be caught by ErrorBoundary
    throw error;
  };

  return { handleError };
};

// ==================== ERROR FALLBACK COMPONENTS ====================

export const SimpleErrorFallback: React.FC<{ error?: Error; resetError?: () => void }> = ({
  error,
  resetError
}) => (
  <div className="flex items-center justify-center min-h-[200px] p-4">
    <div className="text-center">
      <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
      <h3 className="text-lg font-semibold text-white mb-2">Something went wrong</h3>
      <p className="text-gray-400 text-sm mb-4">
        {error?.message || 'An unexpected error occurred'}
      </p>
      {resetError && (
        <button
          onClick={resetError}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  </div>
);

export const LoadingErrorFallback: React.FC<{ error?: Error; retry?: () => void }> = ({
  error,
  retry
}) => (
  <div className="flex items-center justify-center min-h-[200px] p-4">
    <div className="text-center">
      <div className="w-8 h-8 border-2 border-red-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
      <h3 className="text-lg font-semibold text-white mb-2">Loading Error</h3>
      <p className="text-gray-400 text-sm mb-4">
        {error?.message || 'Failed to load content'}
      </p>
      {retry && (
        <button
          onClick={retry}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  </div>
);
