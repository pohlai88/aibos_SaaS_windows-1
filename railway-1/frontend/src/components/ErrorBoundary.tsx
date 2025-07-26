/**
 * AI-BOS Error Boundary Component
 *
 * Comprehensive error boundary for catching and handling React errors
 * with proper error reporting, user feedback, and recovery mechanisms.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// ==================== MANIFESTOR INTEGRATION ====================
import { useManifestor, usePermission, useModuleConfig, useModuleEnabled } from '@/hooks/useManifestor';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  moduleId?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  private manifestorConfig: any = null;
  private manifestorEnabled: boolean = true;
  private manifestorPermissions: any = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };

    // Initialize manifestor configuration
    this.initializeManifestor();
  }

  private initializeManifestor = () => {
    try {
      // Get manifestor configuration for error handling
      const { getConfig, isEnabled } = useManifestor();
      this.manifestorConfig = getConfig('ui');
      this.manifestorEnabled = isEnabled('ui');

      // Check permissions for error reporting
      const currentUser = { id: 'current-user', role: 'user', permissions: [] };
      this.manifestorPermissions = {
        canReport: true, // Default to true for error reporting
        canRetry: true,
        canGoHome: true
      };
    } catch (error) {
      console.warn('Manifestor not available for ErrorBoundary:', error);
      this.manifestorEnabled = false;
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({ errorInfo });

    // Report error to error tracking service
    this.reportError(error, errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    try {
      // Check manifestor permissions for error reporting
      if (!this.manifestorEnabled || !this.manifestorPermissions?.canReport) {
        console.warn('Error reporting disabled by manifestor configuration');
        return;
      }

      // Report to error tracking service (e.g., Sentry, LogRocket)
      const errorReport = {
        errorId: this.state.errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: this.getUserId(),
        moduleId: this.props.moduleId || 'unknown',
        manifestorEnabled: this.manifestorEnabled
      };

      // Send to error reporting endpoint
      fetch('/api/error-reporting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorReport)
      }).catch(console.error);

    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };

  private getUserId = (): string | null => {
    try {
      // Get user ID from localStorage, session, or auth context
      return localStorage.getItem('userId') || sessionStorage.getItem('userId') || null;
    } catch {
      return null;
    }
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="text-center">
              {/* Error Icon */}
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>

              {/* Error Title */}
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Something went wrong
              </h2>

              {/* Error Message */}
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                We&apos;re sorry, but something unexpected happened. Our team has been notified and is working to fix this issue.
              </p>

              {/* Error ID for support */}
              <div className="bg-gray-100 dark:bg-gray-700 rounded-md p-3 mb-6">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Error ID (for support):
                </p>
                <p className="text-xs font-mono text-gray-700 dark:text-gray-300">
                  {this.state.errorId}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={this.handleRetry}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>

                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="w-full"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>

                <Button
                  onClick={this.handleReload}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Page
                </Button>
              </div>

              {/* Error Details (if enabled) */}
              {this.props.showDetails && this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                    <Bug className="h-4 w-4 inline mr-1" />
                    Show Error Details
                  </summary>
                  <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
                    <p className="text-xs font-mono text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {this.state.error.message}
                    </p>
                    {this.state.error.stack && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs text-gray-500 dark:text-gray-400">
                          Stack Trace
                        </summary>
                        <pre className="mt-1 text-xs font-mono text-gray-600 dark:text-gray-400 whitespace-pre-wrap overflow-auto">
                          {this.state.error.stack}
                        </pre>
                      </details>
                    )}
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for functional components
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

// Hook for functional components to handle errors
export function useErrorHandler() {
  const handleError = React.useCallback((error: Error, context?: any) => {
    console.error('Error caught by useErrorHandler:', error, context);

    // Report error
    const errorReport = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };

    fetch('/api/error-reporting', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorReport)
    }).catch(console.error);
  }, []);

  return { handleError };
}

export default ErrorBoundary;
