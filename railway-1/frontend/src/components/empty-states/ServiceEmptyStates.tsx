'use client';

import React from 'react';
import {
  WifiOff, Server, Database, Brain, RefreshCw,
  AlertTriangle, Info, CheckCircle, XCircle
} from 'lucide-react';
import EmptyState from './EmptyState';

// ==================== SERVICE EMPTY STATES ====================

export const BackendDisconnectedState: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <EmptyState
    icon={Server}
    title="Backend Unavailable"
    description="Unable to connect to the AI-BOS backend server. Please check your internet connection and try again."
    action={{
      label: "Retry Connection",
      onClick: onRetry,
      variant: 'primary'
    }}
    variant="error"
    size="lg"
  />
);

export const DatabaseDisconnectedState: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <EmptyState
    icon={Database}
    title="Database Unavailable"
    description="The AI-governed database is currently unreachable. Your data is safe and will sync when connection is restored."
    action={{
      label: "Check Connection",
      onClick: onRetry,
      variant: 'outline'
    }}
    variant="warning"
    size="md"
  />
);

export const ConsciousnessDisconnectedState: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <EmptyState
    icon={Brain}
    title="Consciousness Engine Offline"
    description="The AI consciousness system is temporarily unavailable. Basic functionality will continue to work."
    action={{
      label: "Reconnect",
      onClick: onRetry,
      variant: 'secondary'
    }}
    variant="info"
    size="md"
  />
);

export const NetworkErrorState: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <EmptyState
    icon={WifiOff}
    title="Network Connection Lost"
    description="Unable to reach AI-BOS services. Please check your internet connection and try again."
    action={{
      label: "Retry",
      onClick: onRetry,
      variant: 'primary'
    }}
    variant="error"
    size="lg"
  />
);

export const ServiceLoadingState: React.FC<{ service: string }> = ({ service }) => (
  <EmptyState
    icon={RefreshCw}
    title={`Connecting to ${service}...`}
    description="Establishing secure connection to AI-BOS services. This may take a few moments."
    variant="info"
    size="md"
  />
);

export const PartialConnectionState: React.FC<{
  connectedServices: string[];
  disconnectedServices: string[];
  onRetry: () => void;
}> = ({ connectedServices, disconnectedServices, onRetry }) => (
  <EmptyState
    icon={AlertTriangle}
    title="Partial Connection"
    description={`Some services are unavailable: ${disconnectedServices.join(', ')}. Connected: ${connectedServices.join(', ')}.`}
    action={{
      label: "Retry All Services",
      onClick: onRetry,
      variant: 'outline'
    }}
    variant="warning"
    size="md"
  />
);

export const NoDataState: React.FC<{
  title: string;
  description: string;
  onAction?: () => void;
  actionLabel?: string;
}> = ({ title, description, onAction, actionLabel }) => (
  <EmptyState
    icon={Info}
    title={title}
    description={description}
    action={onAction && actionLabel ? {
      label: actionLabel,
      onClick: onAction,
      variant: 'primary'
    } : undefined}
    variant="default"
    size="md"
  />
);

export const SuccessState: React.FC<{
  title: string;
  description: string;
}> = ({ title, description }) => (
  <EmptyState
    icon={CheckCircle}
    title={title}
    description={description}
    variant="default"
    size="md"
  />
);

export const ErrorState: React.FC<{
  title: string;
  description: string;
  onRetry?: () => void;
}> = ({ title, description, onRetry }) => (
  <EmptyState
    icon={XCircle}
    title={title}
    description={description}
    action={onRetry ? {
      label: "Try Again",
      onClick: onRetry,
      variant: 'primary'
    } : undefined}
    variant="error"
    size="md"
  />
);
