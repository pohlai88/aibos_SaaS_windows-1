import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, Clock, Settings, TrendingUp, AlertTriangle, AlertCircle, HelpCircle, Star, Zap, Circle, Shield } from 'lucide-react';
import type { ReactNode } from 'react';
import type { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { Button } from '../primitives/Button';
import { Badge } from '../primitives/Badge';
import { Progress } from '../primitives/Progress';
import {
 AlertTriangle,
 CheckCircle,
 Info,
 X,
 Shield,
 Zap,
 Circle,
 TrendingUp,
 Clock,
 Star,
 AlertCircle,
 HelpCircle,
 Settings,
 Clock
} from 'lucide-react';
const dialogVariants = cva('fixed inset-0 z-50 flex items-center justify-center p-4', {;
 variants: {
 variant: {
 default: '',
 destructive: '',
 warning: '',
 info: '',
 success: ''
 }
 },
 defaultVariants: {
 variant: 'default'
 }
});
const contentVariants = cva(;
 'relative bg-background rounded-lg shadow-lg border border-border max-w-md w-full overflow-hidden',
 {
 variants: {
 size: {
 sm: 'max-w-sm',
 md: 'max-w-md',
 lg: 'max-w-lg',
 xl: 'max-w-xl'
 }
 },
 defaultVariants: {
 size: 'md'
 }
 },
);
export interface ConfirmAction {
 id: string;
 label: string;
 variant?: 'default' | 'destructive' | 'outline' | 'ghost';
 icon?: ReactNode;
 description?: string;
 risk?: 'low' | 'medium' | 'high';
 aiScore?: number; // 0-100 AI confidence score
 usageCount?: number;
 isRecommended?: boolean;
 isDestructive?: boolean;
 requiresConfirmation?: boolean;
}
export interface ConfirmDialogProps extends VariantProps<typeof dialogVariants> {
 isOpen: boolean;
 onClose: () => void;
 title: string;
 description?: string;
 icon?: ReactNode;
 actions: ConfirmAction[];
 onAction: (actionId: string) => void;
 className?: string;
 size?: VariantProps<typeof contentVariants>['size'];
 aiFeatures?: {
 smartSuggestions?: boolean;
 riskAssessment?: boolean;
 usageOptimization?: boolean;
 contextAware?: boolean;
 predictiveActions?: boolean;
 };
 context?: {
 userRole?: string;
 previousActions?: string[];
 riskTolerance?: 'low' | 'medium' | 'high';
 timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
 };
 analytics?: {
 totalConfirmations?: number;
 successRate?: number;
 averageResponseTime?: number;
 };
}
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
 isOpen,
 onClose,
 title,
 description,
 icon,
 actions,
 onAction,
 className,
 size = 'md',
 aiFeatures = {},
 context = {},
 analytics = {},
 variant = 'default'
}) => {
 const [selectedAction, setSelectedAction] = useState<string | null>(null);
 const [showRiskDetails, setShowRiskDetails] = useState<boolean>(false);
 const [aiSuggestions, setAiSuggestions] = useState<ConfirmAction[]>([]);
 const [usageStats, setUsageStats] = useState<;
 Record<string, { count: number; successRate: number }>
 >({});
 // AI-powered action suggestions
 useEffect(() => {
 if (aiFeatures.smartSuggestions && actions.length > 0) {
 const suggestions = actions;
 .filter((action) => action.aiScore && action.aiScore > 70)
 .sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0))
 .slice(0, 2);
 setAiSuggestions(suggestions);
 }
 }, [actions, aiFeatures.smartSuggestions]);
 // AI-powered risk assessment
 const assessRisk = useCallback(;
 (action: ConfirmAction) => {
 if (!aiFeatures.riskAssessment) return null;
 const baseRisk = action.risk === 'high' ? 80 : action.risk === 'medium' ? 50 : 20;
 let adjustedRisk = baseRisk;
 // Context-based risk adjustment
 if (context.timeOfDay === 'night' && action.isDestructive) {
 adjustedRisk += 20;
 }
 if (context.riskTolerance === 'low' && baseRisk > 30) {
 adjustedRisk += 15;
 }
 if (context.userRole === 'admin' && action.isDestructive) {
 adjustedRisk -= 10;
 }
 return Math.min(100, Math.max(0, adjustedRisk));
 },
 [aiFeatures.riskAssessment, context],
 );
 // AI-powered usage optimization
 const _getRecommendedAction = useCallback(() => {;
 if (!aiFeatures.usageOptimization) return null;
 return actions;
 .filter((action) => action.usageCount && action.usageCount > 0)
 .sort((a, b) => {
 const _aScore = ((a.usageCount || 0) * (a.aiScore || 50)) / 100;
 const _bScore = ((b.usageCount || 0) * (b.aiScore || 50)) / 100;
 return bScore - aScore;
 })[0];
 }, [actions, aiFeatures.usageOptimization]);
 const _handleActionClick = useCallback(;
 (actionId: string) => {
 const action = actions.find((a) => a.id === actionId);
 if (action?.requiresConfirmation) {
 setSelectedAction(actionId);
 } else {
 onAction(actionId);
 onClose();
 }
 },
 [actions, onAction, onClose],
 );
 const _handleConfirmAction = useCallback(() => {;
 if (selectedAction) {
 onAction(selectedAction);
 onClose();
 setSelectedAction(null);
 }
 }, [selectedAction, onAction, onClose]);
 const _getIconForVariant = () => {;
 switch (variant) {
 case 'destructive':
 return <AlertTriangle className="h-6 w-6 text-red-500" />;
 case 'warning':
 return <AlertCircle className="h-6 w-6 text-yellow-500" />;
 case 'info':
 return <Info className="h-6 w-6 text-blue-500" />;
 case 'success':
 return <CheckCircle className="h-6 w-6 text-green-500" />;
 default:
 return icon || <HelpCircle className="h-6 w-6 text-muted-foreground" />;
 }
 };
 const recommendedAction = getRecommendedAction();
 if (!isOpen) return null;
 return (;
 <div className={cn(dialogVariants({ variant }), className)}>
 {/* Backdrop */}
 <div
 className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
 onClick={onClose}
 aria-hidden="true"
 />
 {/* Dialog */}
 <div className={cn(contentVariants({ size }))}>
 {/* Header */}
 <div className="flex items-start gap-3 p-6 border-b border-border">
 <div className="flex-shrink-0">{getIconForVariant()}</div>
 <div className="flex-1 min-w-0">
 <h2 className="text-lg font-semibold text-foreground">{title}</h2>
 {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
 </div>
 <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close dialog">
 <X className="h-4 w-4" />
 </Button>
 </div>
 {/* Content */}
 <div className="p-6 space-y-4">
 {/* AI Suggestions */}
 {aiFeatures.smartSuggestions && aiSuggestions.length > 0 && (
 <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
 <div className="flex items-center gap-2 mb-2">
 <Circle className="h-4 w-4 text-blue-600" />
 <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
 AI Recommendations
 </span>
 </div>
 <div className="space-y-2">
 {aiSuggestions.map((action) => (
 <div key={action.id} className="flex items-center justify-between">
 <span className="text-sm text-blue-800 dark:text-blue-200">{action.label}</span>
 <Badge variant="outline" size="sm">
 {action.aiScore}% confidence
 </Badge>
 </div>
 ))}
 </div>
 </div>
 )}
 {/* Risk Assessment */}
 {aiFeatures.riskAssessment &&
 actions.some((a) => a.risk === 'high' || a.isDestructive) && (
 <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
 <div className="flex items-center gap-2 mb-2">
 <Shield className="h-4 w-4 text-yellow-600" />
 <span className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
 Risk Assessment
 </span>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => setShowRiskDetails(!showRiskDetails)}
 >
 {showRiskDetails ? 'Hide' : 'Show'} Details
 </Button>
 </div>
 {showRiskDetails && (
 <div className="space-y-2">
 {actions
 .filter((action) => action.risk === 'high' || action.isDestructive)
 .map((action) => {
 const riskScore = assessRisk(action);
 return (;
 <div key={action.id} className="space-y-1">
 <div className="flex items-center justify-between text-sm">
 <span>{action.label}</span>
 <Badge
 variant={riskScore && riskScore > 70 ? 'destructive' : 'warning'}
 size="sm"
 >
 {riskScore}% risk
 </Badge>
 </div>
 {riskScore && (
 <Progress value={riskScore} size="sm" variant="warning" />
 )}
 </div>
 );
 })}
 </div>
 )}
 </div>
 )}
 {/* Usage Analytics */}
 {aiFeatures.usageOptimization && analytics.totalConfirmations && (
 <div className="p-3 bg-muted/50 rounded-lg">
 <div className="flex items-center gap-2 mb-2">
 <TrendingUp className="h-4 w-4 text-muted-foreground" />
 <span className="text-sm font-medium">Usage Analytics</span>
 </div>
 <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
 <div>
 <div className="font-medium">{analytics.totalConfirmations}</div>
 <div>Total</div>
 </div>
 <div>
 <div className="font-medium">{analytics.successRate}%</div>
 <div>Success</div>
 </div>
 <div>
 <div className="font-medium">{analytics.averageResponseTime}s</div>
 <div>Avg Time</div>
 </div>
 </div>
 </div>
 )}
 {/* Recommended Action */}
 {recommendedAction && (
 <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
 <div className="flex items-center gap-2 mb-2">
 <Star className="h-4 w-4 text-green-600" />
 <span className="text-sm font-medium text-green-900 dark:text-green-100">
 Recommended Action
 </span>
 </div>
 <div className="flex items-center justify-between">
 <span className="text-sm text-green-800 dark:text-green-200">
 {recommendedAction.label}
 </span>
 <Badge variant="outline" size="sm">
 {recommendedAction.usageCount} uses
 </Badge>
 </div>
 </div>
 )}
 {/* Actions */}
 <div className="space-y-2">
 {actions.map((action) => {
 const riskScore = assessRisk(action);
 const isRecommended = recommendedAction?.id === action.id;
 return (;
 <div key={action.id} className="space-y-2">
 <Button
 variant={action.variant || 'default'}
 size="lg"
 className={cn(
 'w-full justify-between',
 isRecommended && 'ring-2 ring-green-500',
 )}
 onClick={() => handleActionClick(action.id)}
 >
 <div className="flex items-center gap-2">
 {action.icon}
 <span>{action.label}</span>
 {action.isRecommended && <Star className="h-4 w-4 text-yellow-500" />}
 </div>
 <div className="flex items-center gap-2">
 {riskScore && riskScore > 70 && (
 <Badge variant="destructive" size="sm">
 High Risk
 </Badge>
 )}
 {action.usageCount && (
 <Badge variant="secondary" size="sm">
 {action.usageCount}
 </Badge>
 )}
 </div>
 </Button>
 {action.description && (
 <p className="text-xs text-muted-foreground ml-4">{action.description}</p>
 )}
 </div>
 );
 })}
 </div>
 {/* AI Context Indicator */}
 {aiFeatures.contextAware && (
 <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
 AI Context: {context.userRole || 'User'} • {context.riskTolerance || 'Medium'} Risk
 Tolerance
 </div>
 )}
 </div>
 {/* Footer */}
 <div className="flex items-center justify-end gap-2 p-6 border-t border-border">
 <Button variant="outline" onClick={onClose}>
 Cancel
 </Button>
 </div>
 </div>
 {/* Confirmation Dialog for Destructive Actions */}
 {selectedAction && (
 <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
 <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
 <div className="relative bg-background rounded-lg shadow-lg border border-border max-w-sm w-full p-6">
 <div className="flex items-center gap-3 mb-4">
 <AlertTriangle className="h-5 w-5 text-red-500" />
 <h3 className="text-lg font-semibold">Confirm Action</h3>
 </div>
 <p className="text-sm text-muted-foreground mb-6">
 This action cannot be undone. Are you sure you want to proceed?
 </p>
 <div className="flex items-center justify-end gap-2">
 <Button variant="outline" onClick={() => setSelectedAction(null)}>
 Cancel
 </Button>
 <Button variant="destructive" onClick={handleConfirmAction}>
 Confirm
 </Button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
};
// AI-Powered Confirmation Hook
export const _useAIConfirm = (
 options: {
 smartSuggestions?: boolean;
 riskAssessment?: boolean;
 usageOptimization?: boolean;
 contextAware?: boolean;
 } = {},
) => {
 const [isOpen, setIsOpen] = useState<boolean>(false);
 const [config, setConfig] = useState<Partial<ConfirmDialogProps>>({});
 const _confirm = useCallback((config: Partial<ConfirmDialogProps>) => {;
 setConfig(config);
 setIsOpen(true);
 }, []);
 const _close = useCallback(() => {;
 setIsOpen(false);
 }, []);
 return {;
 isOpen,
 config,
 confirm,
 close
 };
};