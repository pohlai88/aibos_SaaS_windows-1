import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { withCompliance } from '../../core/compliance/withCompliance';
import { withPerformance } from '../../core/performance/withPerformance';
import { auditLog } from '../../utils/auditLogger';
import { cn } from '../../utils/cn';
import Badge from '../../primitives/Badge/Badge';
import { Progress } from '../../primitives/Progress/Progress';
import { Card, CardContent } from '../../primitives/Card/Card';

const aiStatusVariants = cva(
  'flex items-center space-x-3 p-4 rounded-lg border',
  {
    variants: {
      variant: {
        default: 'bg-white border-gray-200',
  online: 'bg-green-50 border-green-200',
        offline: 'bg-red-50 border-red-200',
  warning: 'bg-yellow-50 border-yellow-200',
        loading: 'bg-blue-50 border-blue-200',
      },
      size: {
        sm: 'p-2',
  md: 'p-4',
        lg: 'p-6',
      },
    },
    defaultVariants: {
      variant: 'default',
  size: 'md',
    },
  }
);

export interface AIModelInfo {
  id: string;
  name: string;
  version: string;
  provider: string;
  status: 'online' | 'offline' | 'warning' | 'loading';
  performance: {
    latency: number;
    throughput: number;
    accuracy: number;
    availability: number
};
  compliance: {
    gdpr: boolean;
    soc2: boolean;
    hipaa: boolean;
    iso27001: boolean
};
  usage: {
    current: number;
    limit: number;
    unit: string
};
  lastUpdated: Date
}

export interface AIStatusProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof aiStatusVariants> {
  models: AIModelInfo[];
  showDetails?: boolean;
  showPerformance?: boolean;
  showCompliance?: boolean;
  showUsage?: boolean;
  onModelClick?: (model: AIModelInfo) => void;
  onRefresh?: () => void;
  refreshInterval?: number
}

const AIStatusComponent: React.FC<AIStatusProps> = ({
  className,
  variant,
  size,
  models,
  showDetails = true,
  showPerformance = true,
  showCompliance = true,
  showUsage = true,
  onModelClick,
  onRefresh,
  refreshInterval,
  ...props
}) => {
  const [selectedModel, setSelectedModel] = React.useState<AIModelInfo | null>(null);

  React.useEffect(() => {
    if (refreshInterval && onRefresh) {
      const interval = setInterval(() => {
        onRefresh();
        auditLog('ai_status_refresh', {
          component: 'AIStatus',
  modelsCount: models.length,
        })
}, refreshInterval);

      return () => clearInterval(interval)
}
  }, [refreshInterval, onRefresh, models.length]);

  const handleModelClick = (model: AIModelInfo) => {
    setSelectedModel(selectedModel?.id === model.id ? null : model);
    onModelClick?.(model);

    auditLog('ai_status_model_click', {
      component: 'AIStatus',
  modelId: model.id,
      modelName: model.name,
    })
};

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'success';
      case 'offline':
        return 'error';
      case 'warning':
        return 'warning';
      case 'loading':
        return 'info';
      default:
        return 'default'
}
  };

  const getComplianceStatus = (compliance: AIModelInfo['compliance']) => {
    const total = Object.keys(compliance).length;
    const compliant = Object.values(compliance).filter(Boolean).length;
    return { compliant, total, percentage: (compliant / total) * 100 }
};

  return (
    <div className={cn('space-y-4', className)} {...props}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">AI Model Status</h3>
        <div className="flex items-center space-x-2">
          <Badge variant="info">{models.length} Models</Badge>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Refresh status"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {models.map((model) => (
          <Card
            key={model.id}
            className={cn(
              'cursor-pointer transition-all hover:shadow-md',
              selectedModel?.id === model.id && 'ring-2 ring-blue-500'
            )}
            onClick={() => handleModelClick(model)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{model.name}</h4>
                  <p className="text-sm text-gray-500">{model.provider} v{model.version}</p>
                </div>
                <Badge variant={getStatusColor(model.status)}>
                  {model.status}
                </Badge>
              </div>

              {showPerformance && (
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Latency</span>
                    <span>{model.performance.latency}ms</span>
                  </div>
                  <Progress
                    value={model.performance.availability}
                    size="sm"
                    variant={model.performance.availability > 90 ? 'success' : 'warning'}
                    showPercentage
                  />
                </div>
              )}

              {showCompliance && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Compliance</span>
                    <span>{getComplianceStatus(model.compliance).compliant}/{getComplianceStatus(model.compliance).total}</span>
                  </div>
                  <div className="flex space-x-1">
                    {Object.entries(model.compliance).map(([key, value]) => (
                      <div
                        key={key}
                        className={cn(
                          'w-2 h-2 rounded-full',
                          value ? 'bg-green-500' : 'bg-red-500'
                        )}
                        title={`${key.toUpperCase()}: ${value ? 'Compliant' : 'Non-compliant'}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {showUsage && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Usage</span>
                    <span>{model.usage.current}/{model.usage.limit} {model.usage.unit}</span>
                  </div>
                  <Progress
                    value={(model.usage.current / model.usage.limit) * 100}
                    size="sm"
                    variant={(model.usage.current / model.usage.limit) > 0.8 ? 'warning' : 'default'}
                  />
                </div>
              )}

              <div className="mt-3 text-xs text-gray-400">
                Updated: {model.lastUpdated.toLocaleTimeString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showDetails && selectedModel && (
        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">
                {selectedModel.name} Details
              </h4>
              <Badge variant={getStatusColor(selectedModel.status)}>
                {selectedModel.status}
              </Badge>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h5 className="font-medium text-gray-900 mb-3">Performance Metrics</h5>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Latency</span>
                    <span className="text-sm font-medium">{selectedModel.performance.latency}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Throughput</span>
                    <span className="text-sm font-medium">{selectedModel.performance.throughput} req/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Accuracy</span>
                    <span className="text-sm font-medium">{selectedModel.performance.accuracy}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Availability</span>
                    <span className="text-sm font-medium">{selectedModel.performance.availability}%</span>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="font-medium text-gray-900 mb-3">Compliance Status</h5>
                <div className="space-y-2">
                  {Object.entries(selectedModel.compliance).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{key.toUpperCase()}</span>
                      <Badge variant={value ? 'success' : 'error'} size="sm">
                        {value ? 'Compliant' : 'Non-compliant'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
};

export const AIStatus = withCompliance(withPerformance(AIStatusComponent));

export default AIStatus;
