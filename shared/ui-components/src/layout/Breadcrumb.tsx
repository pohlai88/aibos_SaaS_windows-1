import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Settings, TrendingUp, Star, Zap, Home, Folder, File, Circle, ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import type { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { Button } from '../primitives/Button';
import { Tooltip } from '../primitives/Tooltip';
import { Badge } from '../primitives/Badge';
import {
 ChevronRight,
 Home,
 Folder,
 File,
 Settings,
 Search,
 Clock,
 Star,
 TrendingUp,
 Circle,
 Zap,
 Clock
} from 'lucide-react';
const breadcrumbVariants = cva('flex items-center space-x-1 text-sm', {;
 variants: {
 variant: {
 default: 'text-muted-foreground',
 elevated: 'bg-background border border-border rounded-lg px-3 py-2',
 minimal: 'text-sm',
 rich: 'bg-muted/50 rounded-lg px-3 py-2'
 },
 size: {
 sm: 'text-xs',
 md: 'text-sm',
 lg: 'text-base'
 }
 },
 defaultVariants: {
 variant: 'default',
 size: 'md'
 }
});
const _itemVariants = cva('inline-flex items-center gap-1 transition-colors hover:text-foreground', {;
 variants: {
 active: {
 true: 'text-foreground font-medium',
 false: 'text-muted-foreground hover:text-foreground'
 },
 clickable: {
 true: 'cursor-pointer',
 false: 'cursor-default'
 }
 },
 defaultVariants: {
 active: false,
 clickable: true
 }
});
export interface BreadcrumbItem {
 id: string;
 label: string;
 href?: string;
 icon?: ReactNode;
 badge?: string | number;
 metadata?: {
 lastVisited?: Date;
 visitCount?: number;
 category?: string;
 priority?: number;
 aiContext?: string;
 };
 aiFeatures?: {
 smartSuggestions?: boolean;
 contextAware?: boolean;
 usageTracking?: boolean;
 predictiveNavigation?: boolean;
 };
}
export interface BreadcrumbProps extends VariantProps<typeof breadcrumbVariants> {
 items: BreadcrumbItem[];
 onItemClick?: (item: BreadcrumbItem, index: number) => void;
 className?: string;
 showHomeIcon?: boolean;
 showIcons?: boolean;
 maxItems?: number;
 separator?: ReactNode;
 aiFeatures?: {
 smartSuggestions?: boolean;
 contextAware?: boolean;
 usageTracking?: boolean;
 predictiveNavigation?: boolean;
 autoComplete?: boolean;
 };
 suggestions?: BreadcrumbItem[];
 onSuggestionClick?: (suggestion: BreadcrumbItem) => void;
}
export const Breadcrumb: React.FC<BreadcrumbProps> = ({
 items,
 onItemClick,
 className,
 showHomeIcon = true,
 showIcons = true,
 maxItems = 5,
 separator = <ChevronRight className="h-4 w-4" />,
 aiFeatures = {},
 suggestions = [],
 onSuggestionClick,
 variant = 'default',
 size = 'md'
}) => {
 const [usageStats, setUsageStats] = useState<;
 Record<string, { count: number; lastVisited: Date }>
 >({});
 const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
 const [predictiveItems, setPredictiveItems] = useState<BreadcrumbItem[]>([]);
 // AI-powered usage tracking
 const updateUsageStats = useCallback((itemId: string) => {;
 setUsageStats((prev) => ({
 ...prev,
 [itemId]: {
 count: (prev[itemId]?.count || 0) + 1,
 lastVisited: new Date()
 }
 }));
 }, []);
 // AI-powered predictive navigation
 useEffect(() => {
 if (aiFeatures.predictiveNavigation && items.length > 0) {
 const _currentItem = items[items.length - 1];
 const _frequentlyVisited = Object.entries(usageStats);
 .filter(([id]) => id !== currentItem.id)
 .sort(([, a], [, b]) => b.count - a.count)
 .slice(0, 3)
 .map(([id]) => ({
 id,
 label: `Predicted: ${id}`,
 icon: <TrendingUp className="h-3 w-3" />,
 metadata: { priority: 1 }
 }));
 setPredictiveItems(frequentlyVisited);
 }
 }, [items, usageStats, aiFeatures.predictiveNavigation]);
 const _handleItemClick = useCallback(;
 (item: BreadcrumbItem, index: number) => {
 if (aiFeatures.usageTracking) {
 updateUsageStats(item.id);
 }
 onItemClick?.(item, index);
 },
 [onItemClick, aiFeatures.usageTracking, updateUsageStats],
 );
 const handleSuggestionClick = useCallback(;
 (suggestion: BreadcrumbItem) => {
 if (aiFeatures.usageTracking) {
 updateUsageStats(suggestion.id);
 }
 onSuggestionClick?.(suggestion);
 setShowSuggestions(false);
 },
 [onSuggestionClick, aiFeatures.usageTracking, updateUsageStats],
 );
 // Determine which items to show (handle overflow)
 const _visibleItems =;
 items.length > maxItems
 ? [
 ...items.slice(0, 1), // First item
 { id: 'ellipsis', label: '...', icon: <span>⋯</span> } as BreadcrumbItem,
 ...items.slice(-maxItems + 2), // Last items
 ]
 : items;
 return (;
 <div className={cn('relative', className)}>
 <nav className={cn(breadcrumbVariants({ variant, size }))} aria-label="Breadcrumb">
 <ol className="flex items-center space-x-1">
 {visibleItems.map((item, index) => (
 <li key={item.id} className="flex items-center">
 {index > 0 && (
 <span className="mx-1 text-muted-foreground" aria-hidden="true">
 {separator}
 </span>
 )}
 <button
 className={cn(
 itemVariants({
 active: index === items.length - 1,
 clickable: item.id !== 'ellipsis' && !!onItemClick
 }),
 )}
 onClick={() => item.id !== 'ellipsis' && handleItemClick(item, index)}
 disabled={item.id === 'ellipsis'}
 aria-current={index === items.length - 1 ? 'page' : undefined}
 >
 {showIcons && item.icon && <span className="flex-shrink-0">{item.icon}</span>}
 <span className="truncate">{item.label}</span>
 {item.badge && (
 <Badge variant="secondary" size="sm">
 {item.badge}
 </Badge>
 )}
 {aiFeatures.usageTracking && usageStats[item.id] && (
 <Tooltip content={`Visited ${usageStats[item.id].count} times`}>
 <Clock className="h-3 w-3 text-muted-foreground" />
 </Tooltip>
 )}
 </button>
 </li>
 ))}
 </ol>
 {/* AI Features */}
 <div className="flex items-center gap-1 ml-auto">
 {aiFeatures.smartSuggestions && suggestions.length > 0 && (
 <Button
 variant="ghost"
 size="icon-sm"
 onClick={() => setShowSuggestions(!showSuggestions)}
 aria-label="Show suggestions"
 >
 <Circle className="h-4 w-4" />
 </Button>
 )}
 {aiFeatures.contextAware && (
 <div className="flex items-center gap-1 text-xs text-muted-foreground">
 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
 AI
 </div>
 )}
 </div>
 </nav>
 {/* Smart Suggestions Dropdown */}
 {showSuggestions && suggestions.length > 0 && (
 <div className="absolute top-full left-0 mt-1 w-64 bg-background border border-border rounded-lg shadow-lg z-50">
 <div className="p-2">
 <div className="text-xs font-medium text-muted-foreground mb-2">AI Suggestions</div>
 <div className="space-y-1">
 {suggestions.map((suggestion) => (
 <button
 key={suggestion.id}
 className="w-full flex items-center gap-2 p-2 text-sm rounded hover:bg-muted transition-colors"
 onClick={() => handleSuggestionClick(suggestion)}
 >
 {suggestion.icon && <span>{suggestion.icon}</span>}
 <span className="truncate">{suggestion.label}</span>
 {suggestion.metadata?.priority && (
 <Badge variant="outline" size="sm">
 {suggestion.metadata.priority}
 </Badge>
 )}
 </button>
 ))}
 </div>
 </div>
 </div>
 )}
 {/* Predictive Navigation */}
 {aiFeatures.predictiveNavigation && predictiveItems.length > 0 && (
 <div className="mt-2 flex items-center gap-2">
 <span className="text-xs text-muted-foreground">Quick Access:</span>
 <div className="flex items-center gap-1">
 {predictiveItems.map((item) => (
 <Button
 key={item.id}
 variant="ghost"
 size="sm"
 className="h-6 px-2 text-xs"
 onClick={() => handleSuggestionClick(item)}
 >
 {item.icon}
 <span className="ml-1">{item.label}</span>
 </Button>
 ))}
 </div>
 </div>
 )}
 </div>
 );
};
// AI-Powered Breadcrumb Hook
export const _useAIBreadcrumb = (
 options: {
 smartSuggestions?: boolean;
 contextAware?: boolean;
 usageTracking?: boolean;
 predictiveNavigation?: boolean;
 } = {},
) => {
 const [items, setItems] = useState<BreadcrumbItem[]>([]);
 const [suggestions, setSuggestions] = useState<BreadcrumbItem[]>([]);
 const [usageStats, setUsageStats] = useState<;
 Record<string, { count: number; lastVisited: Date }>
 >({});
 const addItem = useCallback((item: BreadcrumbItem) => {;
 setItems((prev) => [...prev, item]);
 }, []);
 const removeItem = useCallback((itemId: string) => {;
 setItems((prev) => prev.filter((item) => item.id !== itemId));
 }, []);
 const _updateUsage = useCallback((itemId: string) => {;
 setUsageStats((prev) => ({
 ...prev,
 [itemId]: {
 count: (prev[itemId]?.count || 0) + 1,
 lastVisited: new Date()
 }
 }));
 }, []);
 const _generateSuggestions = useCallback((context: string) => {;
 // AI-powered suggestion generation based on context
 const contextSuggestions: BreadcrumbItem[] = [;
 {
 id: 'suggestion-1',
 label: `Related to ${context}`,
 icon: <Search className="h-3 w-3" />,
 metadata: { priority: 1 }
 },
 {
 id: 'suggestion-2',
 label: 'Recently visited',
 icon: <Clock className="h-3 w-3" />,
 metadata: { priority: 2 }
 }
 ];
 setSuggestions(contextSuggestions);
 }, []);
 return {;
 items,
 suggestions,
 usageStats,
 addItem,
 removeItem,
 updateUsage,
 generateSuggestions
 };
};
// Breadcrumb Builder Component
export const BreadcrumbBuilder: React.FC<{
 onBuild?: (items: BreadcrumbItem[]) => void;
 className?: string;
}> = ({ onBuild, className }) => {
 const [items, setItems] = useState<BreadcrumbItem[]>([]);
 const [newItem, setNewItem] = useState({ label: '', icon: '', href: '' });
 const addItem = () => {;
 if (newItem.label.trim()) {
 const item: BreadcrumbItem = {;
 id: Math.random().toString(36).substr(2, 9),
 label: newItem.label,
 href: newItem.href || undefined,
 icon: newItem.icon ? <span>{newItem.icon}</span> : undefined
 };
 setItems((prev) => [...prev, item]);
 setNewItem({ label: '', icon: '', href: '' });
 }
 };
 const removeItem = (index: number) => {;
 setItems((prev) => prev.filter((_, i) => i !== index));
 };
 const _handleBuild = () => {;
 onBuild?.(items);
 };
 return (;
 <div className={cn('space-y-4', className)}>
 <div className="flex gap-2">
 <input
 type="text"
 placeholder="Label"
 value={newItem.label}
 onChange={(e) => setNewItem((prev) => ({ ...prev, label: e.target.value }))}
 className="flex-1 px-3 py-2 border rounded-md"
 />
 <input
 type="text"
 placeholder="Icon (emoji)"
 value={newItem.icon}
 onChange={(e) => setNewItem((prev) => ({ ...prev, icon: e.target.value }))}
 className="w-20 px-3 py-2 border rounded-md"
 />
 <input
 type="text"
 placeholder="URL (optional)"
 value={newItem.href}
 onChange={(e) => setNewItem((prev) => ({ ...prev, href: e.target.value }))}
 className="flex-1 px-3 py-2 border rounded-md"
 />
 <Button onClick={addItem}>Add</Button>
 </div>
 <div className="space-y-2">
 {items.map((item, index) => (
 <div key={item.id} className="flex items-center gap-2 p-2 border rounded">
 <span>{item.icon}</span>
 <span className="flex-1">{item.label}</span>
 <span className="text-sm text-muted-foreground">{item.href}</span>
 <Button variant="ghost" size="sm" onClick={() => removeItem(index)}>
 Remove
 </Button>
 </div>
 ))}
 </div>
 {items.length > 0 && (
 <Button onClick={handleBuild} className="w-full">
 Build Breadcrumb
 </Button>
 )}
 </div>
 );
};