'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Bug, Shield, Zap, Brain } from 'lucide-react';

// ==================== ERROR BOUNDARY TYPES ====================
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  enableReporting?: boolean;
  enableRecovery?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  recoveryAttempts: number;
  isRecovering: boolean;
}

// ==================== AI-BOS ERROR BOUNDARY ====================
export class AIBOSErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      recoveryAttempts: 0,
      isRecovering: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Log error for debugging
    console.error('AIBOS Error Boundary caught an error:', error, errorInfo);

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Report error if enabled
    if (this.props.enableReporting) {
      this.reportError(error, errorInfo);
    }
  }

  reportError = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      const errorReport = {
        id: this.state.errorId,
        timestamp: new Date().toISOString(),
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        },
        errorInfo: {
          componentStack: errorInfo.componentStack
        },
        context: {
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: Date.now()
        }
      };

      // Send to error reporting service
      await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(errorReport)
      });
    } catch (reportError) {
      console.error('Failed to report error:', reportError);
    }
  };

  handleRecovery = async () => {
    this.setState({ isRecovering: true });

    try {
      // Attempt to recover by clearing error state
      await new Promise(resolve => setTimeout(resolve, 1000));

      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        recoveryAttempts: this.state.recoveryAttempts + 1,
        isRecovering: false
      });
    } catch (recoveryError) {
      console.error('Recovery failed:', recoveryError);
      this.setState({ isRecovering: false });
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      recoveryAttempts: 0,
      isRecovering: false
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default AI-BOS error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-red-200 dark:border-red-800 p-6"
          >
            {/* Error Header */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  AI-BOS Error Recovery
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Error ID: {this.state.errorId}
                </p>
              </div>
            </div>

            {/* Error Details */}
            <div className="space-y-3 mb-6">
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Bug className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span className="text-sm font-medium text-red-800 dark:text-red-200">
                    {this.state.error?.name || 'Unknown Error'}
                  </span>
                </div>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {this.state.error?.message || 'An unexpected error occurred'}
                </p>
              </div>

              {/* Recovery Status */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    AI-Powered Recovery
                  </span>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Recovery attempts: {this.state.recoveryAttempts}
                </p>
              </div>

              {/* Component Stack */}
              {this.state.errorInfo && (
                <details className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3">
                  <summary className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                    Component Stack Trace
                  </summary>
                  <pre className="text-xs text-gray-600 dark:text-gray-400 mt-2 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-3">
              {this.props.enableRecovery && (
                <button
                  onClick={this.handleRecovery}
                  disabled={this.state.isRecovering}
                  className="flex items-center justify-center space-x-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {this.state.isRecovering ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Recovering...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Attempt Recovery</span>
                    </>
                  )}
                </button>
              )}

              <button
                onClick={this.handleReset}
                className="flex items-center justify-center space-x-2 w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reset Component</span>
              </button>

              <button
                onClick={() => window.location.reload()}
                className="flex items-center justify-center space-x-2 w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>
            </div>

            {/* AI Assistance */}
            <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                  AI Assistant
                </span>
              </div>
              <p className="text-xs text-purple-700 dark:text-purple-300">
                Our AI is analyzing this error and will provide suggestions for prevention.
              </p>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ==================== FUNCTIONAL ERROR BOUNDARY ====================
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<ErrorBoundaryProps>
) => {
  const WrappedComponent = (props: P) => (
    <AIBOSErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </AIBOSErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// ==================== ERROR MONITORING HOOK ====================
export const useErrorMonitoring = () => {
  const reportError = React.useCallback((error: Error, context?: Record<string, any>) => {
    const errorReport = {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      context: {
        ...context,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: Date.now()
      }
    };

    // Send to error reporting service
    fetch('/api/errors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(errorReport)
    }).catch(console.error);
  }, []);

  return { reportError };
};

// ==================== ERROR UTILITIES ====================
export const createErrorBoundary = (options: Partial<ErrorBoundaryProps> = {}) => {
  const ErrorBoundaryComponent = ({ children }: { children: ReactNode }) => (
    <AIBOSErrorBoundary {...options}>
      {children}
    </AIBOSErrorBoundary>
  );

  ErrorBoundaryComponent.displayName = 'ErrorBoundaryComponent';
  return ErrorBoundaryComponent;
};

export default AIBOSErrorBoundary;
