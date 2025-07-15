import React, { useState, useMemo, useCallback } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

// Core types
export type SortDirection = 'asc' | 'desc';

export type SortConfig = {
  key: string;
  direction: SortDirection;
};

export type Column<T> = {
  key: keyof T;
  label: string;
  sortable?: boolean;
  width?: number | string;
  minWidth?: number;
  maxWidth?: number;
  render?: (value: T[keyof T], row: T, index: number) => React.ReactNode;
  headerRender?: (column: Column<T>) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  hidden?: boolean;
  fixed?: 'left' | 'right';
  tooltip?: string;
};

export type PaginationConfig = {
  page: number;
  pageSize: number;
  total: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

export type SelectionConfig<T> = {
  selectedRows?: string[];
  onSelectionChange?: (selectedRows: string[]) => void;
  getRowKey: (row: T) => string;
  selectAll?: boolean;
  onSelectAllChange?: (selectAll: boolean) => void;
};

export type ExpandableConfig<T> = {
  expandedRows?: string[];
  onExpandedChange?: (expandedRows: string[]) => void;
  renderExpandedContent?: (row: T) => React.ReactNode;
  getRowKey: (row: T) => string;
};

export type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  error?: string;
  
  // Sorting
  sortConfig?: SortConfig;
  onSortChange?: (sortConfig: SortConfig) => void;
  
  // Pagination
  pagination?: PaginationConfig;
  
  // Selection
  selection?: SelectionConfig<T>;
  
  // Expandable rows
  expandable?: ExpandableConfig<T>;
  
  // Styling
  variant?: 'default' | 'striped' | 'bordered' | 'minimal';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  
  // Row styling
  getRowClassName?: (row: T, index: number) => string;
  onRowClick?: (row: T, index: number) => void;
  
  // Empty state
  emptyMessage?: string;
  
  // Virtual scrolling
  virtualScrolling?: boolean;
  rowHeight?: number;
  maxHeight?: number;
};

const DataTable = <T,>({
  columns,
  data,
  loading = false,
  error,
  sortConfig,
  onSortChange,
  pagination,
  selection,
  expandable,
  variant = 'default',
  size = 'default',
  className = '',
  getRowClassName,
  onRowClick,
  emptyMessage = 'No data available'
}: DataTableProps<T>) => {
  const [internalSortConfig, setInternalSortConfig] = useState<SortConfig | undefined>();
  
  const currentSortConfig = sortConfig || internalSortConfig;
  
  const handleSort = useCallback((key: string) => {
    const newSortConfig: SortConfig = {
      key,
      direction: currentSortConfig?.key === key && currentSortConfig.direction === 'asc' ? 'desc' : 'asc'
    };
    
    if (onSortChange) {
      onSortChange(newSortConfig);
    } else {
      setInternalSortConfig(newSortConfig);
    }
  }, [currentSortConfig, onSortChange]);
  
  const sortedData = useMemo(() => {
    if (!currentSortConfig) return data;
    
    return [...data].sort((a, b) => {
      const aValue = a[currentSortConfig.key as keyof T];
      const bValue = b[currentSortConfig.key as keyof T];
      
      if (aValue < bValue) return currentSortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return currentSortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, currentSortConfig]);
  
  const getTableClasses = () => {
    const baseClasses = "w-full";
    
    const variantClasses = {
      default: "border border-gray-200 rounded-lg overflow-hidden",
      striped: "border border-gray-200 rounded-lg overflow-hidden",
      bordered: "border-2 border-gray-300 rounded-lg overflow-hidden",
      minimal: "border-0"
    };
    
    return `${baseClasses} ${variantClasses[variant]} ${className}`;
  };
  
  const getHeaderClasses = () => {
    const baseClasses = "bg-gray-50 border-b border-gray-200";
    
    const sizeClasses = {
      sm: "px-2 py-2 text-sm",
      default: "px-4 py-3",
      lg: "px-6 py-4"
    };
    
    return `${baseClasses} ${sizeClasses[size]}`;
  };
  
  const getCellClasses = (column: Column<T>) => {
    const baseClasses = "border-b border-gray-200 transition-colors";
    
    const sizeClasses = {
      sm: "px-2 py-2 text-sm",
      default: "px-4 py-3",
      lg: "px-6 py-4"
    };
    
    const alignClasses = {
      left: "text-left",
      center: "text-center",
      right: "text-right"
    };
    
    return `${baseClasses} ${sizeClasses[size]} ${alignClasses[column.align || 'left']}`;
  };
  
  const getRowClasses = (row: T, index: number) => {
    const baseClasses = "hover:bg-gray-50 transition-colors";
    
    const variantClasses = {
      default: "",
      striped: index % 2 === 0 ? "bg-white" : "bg-gray-50",
      bordered: "border-b border-gray-200",
      minimal: ""
    };
    
    const clickableClasses = onRowClick ? "cursor-pointer hover:bg-blue-50" : "";
    const customClasses = getRowClassName ? getRowClassName(row, index) : "";
    
    return `${baseClasses} ${variantClasses[variant]} ${clickableClasses} ${customClasses}`;
  };
  
  const handleRowClick = (row: T, index: number) => {
    if (onRowClick) {
      onRowClick(row, index);
    }
  };
  
  const handleSelectAll = (checked: boolean) => {
    if (selection?.onSelectAllChange) {
      selection.onSelectAllChange(checked);
    }
  };
  
  const handleRowSelect = (rowKey: string, checked: boolean) => {
    if (selection?.onSelectionChange) {
      const currentSelected = selection.selectedRows || [];
      const newSelected = checked
        ? [...currentSelected, rowKey]
        : currentSelected.filter(key => key !== rowKey);
      selection.onSelectionChange(newSelected);
    }
  };
  
  const handleRowExpand = (rowKey: string) => {
    if (expandable?.onExpandedChange) {
      const currentExpanded = expandable.expandedRows || [];
      const isExpanded = currentExpanded.includes(rowKey);
      const newExpanded = isExpanded
        ? currentExpanded.filter(key => key !== rowKey)
        : [...currentExpanded, rowKey];
      expandable.onExpandedChange(newExpanded);
    }
  };
  
  const renderSortIcon = (column: Column<T>) => {
    if (!column.sortable) return null;
    
    const isSorted = currentSortConfig?.key === column.key;
    const direction = currentSortConfig?.direction;
    
    return (
      <span className="ml-2 inline-flex flex-col">
        <ChevronUp 
          className={`w-3 h-3 -mb-1 ${isSorted && direction === 'asc' ? 'text-blue-600' : 'text-gray-400'}`} 
        />
        <ChevronDown 
          className={`w-3 h-3 -mt-1 ${isSorted && direction === 'desc' ? 'text-blue-600' : 'text-gray-400'}`} 
        />
      </span>
    );
  };
  
  const renderPagination = () => {
    if (!pagination) return null;
    
    const { page, pageSize, total, pageSizeOptions = [10, 25, 50, 100], onPageChange, onPageSizeChange } = pagination;
    const totalPages = Math.ceil(total / pageSize);
    const startItem = (page - 1) * pageSize + 1;
    const endItem = Math.min(page * pageSize, total);
    
    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">
            Showing {startItem} to {endItem} of {total} results
          </span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="ml-2 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {pageSizeOptions.map(size => (
              <option key={size} value={size}>
                {size} per page
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="text-sm text-gray-700">
            Page {page} of {totalPages}
          </span>
          
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };
  
  const visibleColumns = columns.filter(col => !col.hidden);
  
  if (loading) {
    return (
      <div className={getTableClasses()}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={getTableClasses()}>
        <div className="flex items-center justify-center py-12 text-red-600">
          <span>Error: {error}</span>
        </div>
      </div>
    );
  }
  
  if (data.length === 0) {
    return (
      <div className={getTableClasses()}>
        <div className="flex items-center justify-center py-12 text-gray-500">
          <span>{emptyMessage}</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className={getTableClasses()}>
      <table className="w-full">
        <thead>
          <tr>
            {selection && (
              <th className={`${getHeaderClasses()} w-12`}>
                <input
                  type="checkbox"
                  checked={selection.selectAll || false}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
            )}
            {expandable && (
              <th className={`${getHeaderClasses()} w-12`}></th>
            )}
            {visibleColumns.map((column) => (
              <th
                key={String(column.key)}
                className={`${getHeaderClasses()} ${column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                onClick={() => column.sortable && handleSort(String(column.key))}
                style={{
                  width: column.width,
                  minWidth: column.minWidth,
                  maxWidth: column.maxWidth
                }}
              >
                <div className="flex items-center">
                  {column.headerRender ? column.headerRender(column) : column.label}
                  {renderSortIcon(column)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, index) => {
            const rowKey = selection?.getRowKey(row) || String(index);
            const isSelected = selection?.selectedRows?.includes(rowKey) || false;
            const isExpanded = expandable?.expandedRows?.includes(rowKey) || false;
            
            return (
              <React.Fragment key={rowKey}>
                <tr className={getRowClasses(row, index)} onClick={() => handleRowClick(row, index)}>
                  {selection && (
                    <td className={getCellClasses(visibleColumns[0])}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleRowSelect(rowKey, e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                  )}
                  {expandable && (
                    <td className={getCellClasses(visibleColumns[0])}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowExpand(rowKey);
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        {isExpanded ? '−' : '+'}
                      </button>
                    </td>
                  )}
                  {visibleColumns.map((column) => (
                    <td key={String(column.key)} className={getCellClasses(column)}>
                      {column.render
                        ? column.render(row[column.key], row, index)
                        : String(row[column.key] || '')}
                    </td>
                  ))}
                </tr>
                {expandable && isExpanded && expandable.renderExpandedContent && (
                  <tr>
                    <td colSpan={visibleColumns.length + (selection ? 1 : 0) + (expandable ? 1 : 0)} className="bg-gray-50">
                      {expandable.renderExpandedContent(row)}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
      {renderPagination()}
    </div>
  );
};

export default DataTable; 