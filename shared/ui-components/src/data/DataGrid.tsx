import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { Button } from '../primitives/Button';
import { Input } from '../primitives/Input';
import { Badge } from '../primitives/Badge';
import { Tooltip } from '../primitives/Tooltip';
import { Skeleton } from '../primitives/Skeleton';
import { 
  ChevronUp, 
  ChevronDown, 
  MoreHorizontal, 
  Download, 
  Filter, 
  Search,
  Settings,
  Eye,
  Edit,
  Trash,
  Pin,
  Unpin,
  Column,
  SortAsc,
  SortDesc,
  RefreshCw,
  Brain,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star
} from 'lucide-react';

const gridVariants = cva(
  'w-full border border-border rounded-lg bg-background',
  {
    variants: {
      variant: {
        default: '',
        elevated: 'shadow-lg',
        bordered: 'border-2',
        minimal: 'border-0',
      },
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface Column<T = any> {
  key: string;
  header: string;
  accessor: (row: T) => any;
  sortable?: boolean;
  filterable?: boolean;
  resizable?: boolean;
  pinned?: 'left' | 'right' | false;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  cellRenderer?: (value: any, row: T, index: number) => React.ReactNode;
  headerRenderer?: (column: Column<T>) => React.ReactNode;
  aiFeatures?: {
    smartSorting?: boolean;
    autoGrouping?: boolean;
    predictiveFiltering?: boolean;
    usageOptimization?: boolean;
  };
}

export interface DataGridProps<T = any> extends VariantProps<typeof gridVariants> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  error?: string | null;
  className?: string;
  
  // Pagination
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };
  
  // Sorting
  sorting?: {
    column: string | null;
    direction: 'asc' | 'desc' | null;
    onSort: (column: string, direction: 'asc' | 'desc') => void;
  };
  
  // Filtering
  filtering?: {
    filters: Record<string, any>;
    onFilter: (filters: Record<string, any>) => void;
  };
  
  // Selection
  selection?: {
    selectedRows: Set<string>;
    onSelectionChange: (selectedRows: Set<string>) => void;
    selectAll?: boolean;
  };
  
  // Row actions
  rowActions?: {
    onEdit?: (row: T) => void;
    onDelete?: (row: T) => void;
    onView?: (row: T) => void;
    customActions?: Array<{
      label: string;
      icon?: React.ReactNode;
      onClick: (row: T) => void;
      variant?: 'default' | 'destructive' | 'outline';
    }>;
  };
  
  // Virtual scrolling
  virtualScrolling?: {
    enabled: boolean;
    itemHeight: number;
    overscan: number;
  };
  
  // Export
  export?: {
    enabled: boolean;
    formats: ('csv' | 'excel' | 'pdf')[];
    onExport: (format: string, data: T[]) => void;
  };
  
  // AI Features
  aiFeatures?: {
    smartSorting?: boolean;
    autoGrouping?: boolean;
    predictiveFiltering?: boolean;
    usageOptimization?: boolean;
    contextAware?: boolean;
    anomalyDetection?: boolean;
  };
  
  // Real-time updates
  realTime?: {
    enabled: boolean;
    refreshInterval?: number;
    onRefresh?: () => void;
  };
  
  // Performance
  performance?: {
    enableVirtualization?: boolean;
    enableMemoization?: boolean;
    enableDebouncing?: boolean;
  };
}

export const DataGrid = <T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  error = null,
  className,
  pagination,
  sorting,
  filtering,
  selection,
  rowActions,
  virtualScrolling,
  export: exportConfig,
  aiFeatures = {},
  realTime,
  performance = {},
  variant = 'default',
  size = 'md',
}: DataGridProps<T>) => {
  const [columnResizing, setColumnResizing] = useState<string | null>(null);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [showColumnMenu, setShowColumnMenu] = useState<string | null>(null);
  const [globalSearch, setGlobalSearch] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [usageStats, setUsageStats] = useState<Record<string, { count: number; lastUsed: Date }>>({});
  
  const gridRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // AI-powered smart sorting
  const getSmartSorting = useCallback((column: Column<T>) => {
    if (!aiFeatures.smartSorting) return null;
    
    const columnUsage = usageStats[column.key];
    if (columnUsage && columnUsage.count > 10) {
      return columnUsage.count > 50 ? 'desc' : 'asc';
    }
    
    // AI logic for determining optimal sort
    const sampleValues = data.slice(0, 100).map(column.accessor);
    const hasDates = sampleValues.some(v => v instanceof Date);
    const hasNumbers = sampleValues.some(v => typeof v === 'number');
    
    if (hasDates) return 'desc'; // Most recent first
    if (hasNumbers) return 'desc'; // Highest first
    return 'asc'; // Alphabetical
  }, [aiFeatures.smartSorting, usageStats, data, columns]);

  // AI-powered predictive filtering
  const getPredictiveFilters = useCallback(() => {
    if (!aiFeatures.predictiveFiltering) return [];
    
    const suggestions: string[] = [];
    const now = new Date();
    
    // Time-based suggestions
    if (columns.some(c => c.accessor({} as T) instanceof Date)) {
      suggestions.push('Last 7 days', 'This month', 'This year');
    }
    
    // Usage-based suggestions
    const frequentlyUsed = Object.entries(usageStats)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 3)
      .map(([filter]) => filter);
    
    suggestions.push(...frequentlyUsed);
    
    return suggestions;
  }, [aiFeatures.predictiveFiltering, columns, usageStats]);

  // Virtual scrolling implementation
  const VirtualizedRows = useCallback(() => {
    if (!virtualScrolling?.enabled) return null;
    
    const { itemHeight, overscan } = virtualScrolling;
    const [scrollTop, setScrollTop] = useState(0);
    const [containerHeight, setContainerHeight] = useState(0);
    
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(data.length, startIndex + visibleCount + overscan * 2);
    
    const visibleData = data.slice(startIndex, endIndex);
    const totalHeight = data.length * itemHeight;
    const offsetY = startIndex * itemHeight;
    
    return (
      <div
        style={{ height: totalHeight, position: 'relative' }}
        onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
      >
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleData.map((row, index) => (
            <DataGridRow
              key={startIndex + index}
              row={row}
              rowIndex={startIndex + index}
              columns={columns}
              selection={selection}
              rowActions={rowActions}
              columnWidths={columnWidths}
            />
          ))}
        </div>
      </div>
    );
  }, [virtualScrolling, data, columns, selection, rowActions, columnWidths]);

  // Export functionality
  const handleExport = useCallback((format: string) => {
    if (!exportConfig?.enabled) return;
    
    const exportData = selection?.selectedRows.size 
      ? data.filter((_, index) => selection.selectedRows.has(index.toString()))
      : data;
    
    exportConfig.onExport(format, exportData);
  }, [exportConfig, selection, data]);

  // AI-powered usage tracking
  const updateUsageStats = useCallback((action: string) => {
    setUsageStats(prev => ({
      ...prev,
      [action]: {
        count: (prev[action]?.count || 0) + 1,
        lastUsed: new Date(),
      },
    }));
  }, []);

  // Real-time refresh
  useEffect(() => {
    if (!realTime?.enabled || !realTime.refreshInterval) return;
    
    const interval = setInterval(() => {
      realTime.onRefresh?.();
    }, realTime.refreshInterval);
    
    return () => clearInterval(interval);
  }, [realTime]);

  // Column width management
  const handleColumnResize = useCallback((columnKey: string, newWidth: number) => {
    const column = columns.find(c => c.key === columnKey);
    if (!column) return;
    
    const minWidth = column.minWidth || 100;
    const maxWidth = column.maxWidth || 500;
    const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
    
    setColumnWidths(prev => ({
      ...prev,
      [columnKey]: clampedWidth,
    }));
  }, [columns]);

  // Global search with AI suggestions
  const filteredData = useMemo(() => {
    if (!globalSearch) return data;
    
    const searchLower = globalSearch.toLowerCase();
    return data.filter(row =>
      columns.some(column => {
        const value = column.accessor(row);
        return String(value).toLowerCase().includes(searchLower);
      })
    );
  }, [data, columns, globalSearch]);

  if (error) {
    return (
      <div className={cn(gridVariants({ variant, size }), className)}>
        <div className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
            Error Loading Data
          </h3>
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(gridVariants({ variant, size }), className)}>
      {/* Header Toolbar */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            {/* Global Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search all columns..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* AI Suggestions */}
            {aiFeatures.predictiveFiltering && (
              <div className="flex items-center gap-2">
                {getPredictiveFilters().map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setGlobalSearch(suggestion);
                      updateUsageStats(suggestion);
                    }}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* AI Features Indicator */}
            {aiFeatures.contextAware && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                AI Active
              </div>
            )}
            
            {/* Export */}
            {exportConfig?.enabled && (
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowColumnMenu('export')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                
                {showColumnMenu === 'export' && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-background border border-border rounded-lg shadow-lg z-50">
                    <div className="p-2 space-y-1">
                      {exportConfig.formats.map((format) => (
                        <button
                          key={format}
                          className="w-full flex items-center gap-2 p-2 text-sm rounded hover:bg-muted transition-colors"
                          onClick={() => {
                            handleExport(format);
                            setShowColumnMenu(null);
                          }}
                        >
                          <Download className="h-4 w-4" />
                          Export as {format.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Refresh */}
            {realTime?.enabled && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={realTime.onRefresh}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
            
            {/* Column Settings */}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setShowColumnMenu('columns')}
            >
              <Column className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Column Headers */}
      <div ref={headerRef} className="border-b border-border bg-muted/20">
        <div className="flex">
          {selection && (
            <div className="w-12 flex items-center justify-center border-r border-border">
              <input
                type="checkbox"
                checked={selection.selectAll}
                onChange={(e) => {
                  const newSelection = new Set<string>();
                  if (e.target.checked) {
                    filteredData.forEach((_, index) => newSelection.add(index.toString()));
                  }
                  selection.onSelectionChange(newSelection);
                }}
                className="rounded"
              />
            </div>
          )}
          
          {columns.map((column) => (
            <div
              key={column.key}
              className={cn(
                'flex items-center justify-between p-3 border-r border-border last:border-r-0',
                column.pinned === 'left' && 'sticky left-0 z-10 bg-background',
                column.pinned === 'right' && 'sticky right-0 z-10 bg-background'
              )}
              style={{ width: columnWidths[column.key] || column.width || 200 }}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {column.headerRenderer ? (
                  column.headerRenderer(column)
                ) : (
                  <span className="font-medium truncate">{column.header}</span>
                )}
                
                {column.sortable && (
                  <div className="flex flex-col">
                    <button
                      onClick={() => {
                        const direction = sorting?.column === column.key && sorting.direction === 'asc' ? 'desc' : 'asc';
                        sorting?.onSort(column.key, direction);
                        updateUsageStats(`sort_${column.key}`);
                      }}
                      className="h-3 w-3 hover:text-primary transition-colors"
                    >
                      <ChevronUp className={cn(
                        'h-3 w-3',
                        sorting?.column === column.key && sorting.direction === 'asc' && 'text-primary'
                      )} />
                    </button>
                    <button
                      onClick={() => {
                        const direction = sorting?.column === column.key && sorting.direction === 'desc' ? 'asc' : 'desc';
                        sorting?.onSort(column.key, direction);
                        updateUsageStats(`sort_${column.key}`);
                      }}
                      className="h-3 w-3 hover:text-primary transition-colors"
                    >
                      <ChevronDown className={cn(
                        'h-3 w-3',
                        sorting?.column === column.key && sorting.direction === 'desc' && 'text-primary'
                      )} />
                    </button>
                  </div>
                )}
                
                {aiFeatures.smartSorting && getSmartSorting(column) && (
                  <Tooltip content={`AI suggests ${getSmartSorting(column)} sorting`}>
                    <Brain className="h-3 w-3 text-blue-500" />
                  </Tooltip>
                )}
              </div>
              
              {column.resizable && (
                <div
                  className="w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors"
                  onMouseDown={(e) => {
                    setColumnResizing(column.key);
                    const startX = e.clientX;
                    const startWidth = columnWidths[column.key] || column.width || 200;
                    
                    const handleMouseMove = (e: MouseEvent) => {
                      const deltaX = e.clientX - startX;
                      handleColumnResize(column.key, startWidth + deltaX);
                    };
                    
                    const handleMouseUp = () => {
                      setColumnResizing(null);
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Data Body */}
      <div ref={bodyRef} className="overflow-auto">
        {loading ? (
          <div className="p-8">
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex gap-4">
                  {columns.map((column) => (
                    <Skeleton key={column.key} className="h-4 flex-1" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {virtualScrolling?.enabled ? (
              <VirtualizedRows />
            ) : (
              <div>
                {filteredData.map((row, index) => (
                  <DataGridRow
                    key={index}
                    row={row}
                    rowIndex={index}
                    columns={columns}
                    selection={selection}
                    rowActions={rowActions}
                    columnWidths={columnWidths}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="p-4 border-t border-border bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
              {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
              {pagination.total} results
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => pagination.onPageChange(pagination.page - 1)}
              >
                Previous
              </Button>
              
              <span className="text-sm">
                Page {pagination.page} of {Math.ceil(pagination.total / pagination.pageSize)}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
                onClick={() => pagination.onPageChange(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Data Grid Row Component
const DataGridRow = <T extends Record<string, any>>({
  row,
  rowIndex,
  columns,
  selection,
  rowActions,
  columnWidths,
}: {
  row: T;
  rowIndex: number;
  columns: Column<T>[];
  selection?: DataGridProps<T>['selection'];
  rowActions?: DataGridProps<T>['rowActions'];
  columnWidths: Record<string, number>;
}) => {
  const [showActions, setShowActions] = useState(false);
  
  return (
    <div className="flex border-b border-border hover:bg-muted/30 transition-colors">
      {selection && (
        <div className="w-12 flex items-center justify-center border-r border-border">
          <input
            type="checkbox"
            checked={selection.selectedRows.has(rowIndex.toString())}
            onChange={(e) => {
              const newSelection = new Set(selection.selectedRows);
              if (e.target.checked) {
                newSelection.add(rowIndex.toString());
              } else {
                newSelection.delete(rowIndex.toString());
              }
              selection.onSelectionChange(newSelection);
            }}
            className="rounded"
          />
        </div>
      )}
      
      {columns.map((column) => (
        <div
          key={column.key}
          className={cn(
            'p-3 border-r border-border last:border-r-0 flex items-center',
            column.pinned === 'left' && 'sticky left-0 z-10 bg-background',
            column.pinned === 'right' && 'sticky right-0 z-10 bg-background'
          )}
          style={{ width: columnWidths[column.key] || column.width || 200 }}
        >
          {column.cellRenderer ? (
            column.cellRenderer(column.accessor(row), row, rowIndex)
          ) : (
            <span className="truncate">{String(column.accessor(row))}</span>
          )}
        </div>
      ))}
      
      {rowActions && (
        <div className="w-16 flex items-center justify-center border-l border-border relative">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setShowActions(!showActions)}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
          
          {showActions && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-background border border-border rounded-lg shadow-lg z-50">
              <div className="p-2 space-y-1">
                {rowActions.onView && (
                  <button
                    className="w-full flex items-center gap-2 p-2 text-sm rounded hover:bg-muted transition-colors"
                    onClick={() => {
                      rowActions.onView!(row);
                      setShowActions(false);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </button>
                )}
                
                {rowActions.onEdit && (
                  <button
                    className="w-full flex items-center gap-2 p-2 text-sm rounded hover:bg-muted transition-colors"
                    onClick={() => {
                      rowActions.onEdit!(row);
                      setShowActions(false);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                )}
                
                {rowActions.customActions?.map((action, index) => (
                  <button
                    key={index}
                    className="w-full flex items-center gap-2 p-2 text-sm rounded hover:bg-muted transition-colors"
                    onClick={() => {
                      action.onClick(row);
                      setShowActions(false);
                    }}
                  >
                    {action.icon}
                    {action.label}
                  </button>
                ))}
                
                {rowActions.onDelete && (
                  <button
                    className="w-full flex items-center gap-2 p-2 text-sm rounded hover:bg-red-50 text-red-700 transition-colors"
                    onClick={() => {
                      rowActions.onDelete!(row);
                      setShowActions(false);
                    }}
                  >
                    <Trash className="h-4 w-4" />
                    Delete
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 