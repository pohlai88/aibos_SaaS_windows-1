import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../Card/Card';
import { Button } from '../Button/Button';
import { cn } from '../../utils/cn';

// Metric Card Component
export interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon?: React.ReactNode;
  trend?: {
    data: number[];
    labels: string[];
  };
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon,
  className,
}) => {
  const getChangeColor = (type: 'increase' | 'decrease' | 'neutral') => {
    switch (type) {
      case 'increase':
        return 'text-success-600 dark:text-success-400';
      case 'decrease':
        return 'text-error-600 dark:text-error-400';
      default:
        return 'text-neutral-600 dark:text-neutral-400';
    }
  };

  const getChangeIcon = (type: 'increase' | 'decrease' | 'neutral') => {
    switch (type) {
      case 'increase':
        return '↗';
      case 'decrease':
        return '↘';
      default:
        return '→';
    }
  };

  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
          {title}
        </CardTitle>
        {icon && <div className="h-4 w-4 text-neutral-600 dark:text-neutral-400">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          {value}
        </div>
        {change && (
          <p className={cn('text-xs flex items-center gap-1', getChangeColor(change.type))}>
            <span>{getChangeIcon(change.type)}</span>
            <span>{Math.abs(change.value)}%</span>
            <span>from last month</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
};

// Chart Card Component
export interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  children,
  actions,
  className,
}) => {
  return (
    <Card className={cn('col-span-full', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};

// Dashboard Grid Component
export interface DashboardGridProps {
  children: React.ReactNode;
  className?: string;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4',
        className
      )}
    >
      {children}
    </div>
  );
};

// Dashboard Layout Component
export interface DashboardLayoutProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  title,
  description,
  actions,
  children,
  className,
}) => {
  return (
    <div className={cn('space-y-6', className)}>
      {(title || description || actions) && (
        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            {title && (
              <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                {title}
              </h1>
            )}
            {description && (
              <p className="text-neutral-600 dark:text-neutral-400">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

// Quick Actions Component
export interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
}

export interface QuickActionsProps {
  actions: QuickAction[];
  className?: string;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  actions,
  className,
}) => {
  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
      {actions.map((action, index) => (
        <Card
          key={index}
          variant="interactive"
          className="cursor-pointer"
          onClick={action.onClick}
        >
          <CardHeader>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 text-neutral-600 dark:text-neutral-400">
                {action.icon}
              </div>
              <CardTitle className="text-base">{action.title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {action.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Stats Overview Component
export interface Stat {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon?: React.ReactNode;
}

export interface StatsOverviewProps {
  stats: Stat[];
  className?: string;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  stats,
  className,
}) => {
  return (
    <DashboardGrid className={className}>
      {stats.map((stat, index) => (
        <MetricCard
          key={index}
          title={stat.title}
          value={stat.value}
          change={stat.change}
          icon={stat.icon}
        />
      ))}
    </DashboardGrid>
  );
};

// Empty State Component
export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className,
}) => {
  return (
    <Card className={cn('text-center py-12', className)}>
      <CardContent className="space-y-4">
        {icon && (
          <div className="mx-auto h-12 w-12 text-neutral-400 dark:text-neutral-600">
            {icon}
          </div>
        )}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {title}
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-sm mx-auto">
            {description}
          </p>
        </div>
        {action && (
          <Button
            variant={action.variant || 'primary'}
            onClick={action.onClick}
            className="mt-4"
          >
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

// Loading State Component
export interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  className,
}) => {
  return (
    <Card className={cn('text-center py-12', className)}>
      <CardContent className="space-y-4">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
        <p className="text-neutral-600 dark:text-neutral-400">{message}</p>
      </CardContent>
    </Card>
  );
};

// Error State Component
export interface ErrorStateProps {
  title?: string;
  message: string;
  retry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  retry,
  className,
}) => {
  return (
    <Card className={cn('text-center py-12', className)}>
      <CardContent className="space-y-4">
        <div className="mx-auto h-12 w-12 text-error-500">⚠️</div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {title}
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-sm mx-auto">
            {message}
          </p>
        </div>
        {retry && (
          <Button variant="outline" onClick={retry} className="mt-4">
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}; 