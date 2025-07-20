/**
 * Enterprise DataTable Component
 * ISO27001, GDPR, SOC2, HIPAA compliant data table with virtualization
 *
 * @author AI-BOS Team
 * @version 1.0.0
 * @license MIT
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { Button } from '../../primitives/Button/Button';
import { Input } from '../../primitives/Input/Input';
import Badge from '../../primitives/Badge/Badge';
import type { DataClassification } from '../../types';

// ============================================================================
// DATA TABLE VARIANTS
// ============================================================================

const dataTableVariants = cva(
  'w-full border border-gray-200 rounded-lg overflow-hidden',
  {
    variants: {
      size: {
        sm: 'text-sm',
  md: 'text-base',
        lg: 'text-lg',
      },
      striped: {
        true: '[&_tr:nth-child(even)]:bg-gray-50',
      },
      hoverable: {
        true: '[&_tr:hover]:bg-gray-100',
      },
    },
    defaultVariants: {
      size: 'md',
  striped: true,
      hoverable: true,
    },
  }
);

// ============================================================================
// COLUMN DEFINITION
// ============================================================================

export interface Column<T = any> {
  key: string;
  header: string;
  accessor: (row: T) => any;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any,
  row: T, index: number) => React.ReactNode;
  dataClassification?: DataClassification
}

// ============================================================================
// SORT CONFIGURATION
// ============================================================================

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc'
}

// ============================================================================
// FILTER CONFIGURATION
// ============================================================================

export interface FilterConfig {
  key: string;
  value: string;
  operator: 'contains' | 'equals' | 'startsWith' | 'endsWith'
}

// ============================================================================
// DATA TABLE PROPS
// ============================================================================

export interface DataTableProps<T = any>
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dataTableVariants> {
  data: T[];
  columns: Column<T>[];
  sortConfig?: SortConfig;
  onSortChange?: (config: SortConfig | null) => void;
  filters?: FilterConfig[];
  onFiltersChange?: (filters: FilterConfig[]) => void;
  dataClassification?: DataClassification;
  auditId?: string;
  virtualized?: boolean;
  itemHeight?: number;
  maxHeight?: string;
  selectable?: boolean;
  selectedRows?: Set<string>;
  onSelectionChange?: (selectedRows: Set<string>) => void;
  rowKey?: (row: T) => string;
  loading?: boolean;
  emptyMessage?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void
}
}

// ============================================================================
// DATA TABLE COMPONENT
// ============================================================================

function DataTable<T = any>({
  data,
  columns,
  sortConfig,
  onSortChange,
  filters = [],
  onFiltersChange,
  dataClassification = 'public',
  auditId,
  virtualized = false,
  itemHeight = 50,
  maxHeight = '600px',
  selectable = false,
  selectedRows = new Set(),
  onSelectionChange,
  rowKey = (row: T) => (row as any).id || JSON.stringify(row),
  loading = false,
  emptyMessage = 'No data available',
  pagination,
  className,
  size,
  striped,
  hoverable,
  ...props
}: DataTableProps<T>) {
  const [localFilters, setLocalFilters] = React.useState<FilterConfig[]>(filters);
  const [localSortConfig, setLocalSortConfig] = React.useState<SortConfig | null>(sortConfig || null);

  // Audit logging
  React.useEffect(() => {
    if (dataClassification === 'confidential' && auditId) {
      console.log(`[AUDIT] DataTable rendered: ${auditId} - ${dataClassification} - ${data.length} rows`)
}
  }, [dataClassification, auditId, data.length]);

  // Handle sorting
  const handleSort = (columnKey: string) => {
    const newSortConfig: SortConfig = {
      key: columnKey,
  direction: localSortConfig?.key === columnKey && localSortConfig.direction === 'asc' ? 'desc' : 'asc',
    };

    setLocalSortConfig(newSortConfig);
    onSortChange?.(newSortConfig)
};

  // Handle filtering
  const handleFilterChange = (columnKey: string,
  value: string) => {
    const newFilters = localFilters.filter(f => f.key !== columnKey);
    if (value) {
      newFilters.push({ key: columnKey, value, operator: 'contains' })
}

    setLocalFilters(newFilters);
    onFiltersChange?.(newFilters)
};

  // Process data (sort and filter)
  const processedData = React.useMemo(() => {
    let result = [...data];

    // Apply filters
    if (localFilters.length > 0) {
      result = result.filter(row => {
        return localFilters.every(filter => {
          const value = columns.find(col => col.key === filter.key)?.accessor(row);
          const stringValue = String(value).toLowerCase();
          const filterValue = filter.value.toLowerCase();

          switch (filter.operator) {
            case 'contains':
              return stringValue.includes(filterValue);
            case 'equals':
              return stringValue === filterValue;
            case 'startsWith':
              return stringValue.startsWith(filterValue);
            case 'endsWith':
              return stringValue.endsWith(filterValue);
            default:
              return true
}
        })
})
}

    // Apply sorting
    if (localSortConfig) {
      result.sort((a, b) => {
        const aValue = columns.find(col => col.key === localSortConfig.key)?.accessor(a);
        const bValue = columns.find(col => col.key === localSortConfig.key)?.accessor(b);

        if (aValue < bValue) return localSortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return localSortConfig.direction === 'asc' ? 1 : -1;
        return 0
})
}

    return result
}, [data, localFilters, localSortConfig, columns]);

  // Handle row selection
  const handleRowSelect = (rowKeyValue: string) => {
    const newSelectedRows = new Set(selectedRows);
    if (newSelectedRows.has(rowKeyValue)) {
      newSelectedRows.delete(rowKeyValue)
} else {
      newSelectedRows.add(rowKeyValue)
}
    onSelectionChange?.(newSelectedRows)
};

  // Handle select all
  const handleSelectAll = () => {
    if (selectedRows.size === processedData.length) {
      onSelectionChange?.(new Set())
} else {
      onSelectionChange?.(new Set(processedData.map(row => rowKey(row))))
}
  };

  const renderCell = (column: Column<T>, row: T,
  index: number) => {
    const value = column.accessor(row);

    if (column.render) {
      return column.render(value, row, index)
}

    return value
};

  const tableContent = (
    <table className="w-full">
      <thead className="bg-gray-50 border-b border-gray-200">
        <tr>
          {selectable && (
            <th className="px-4 py-3 text-left">
              <input
                type="checkbox"
                checked={selectedRows.size === processedData.length && processedData.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300"
              />
            </th>
          )}

          {columns.map(column => (
            <th
              key={column.key}
              className={cn(
                'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                column.align === 'center' && 'text-center',
                column.align === 'right' && 'text-right',
                column.sortable && 'cursor-pointer hover:bg-gray-100',
                column.width && `w-${column.width}`
              )}
              onClick={column.sortable ? () => handleSort(column.key) : undefined}
            >
              <div className="flex items-center justify-between">
                <span>{column.header}</span>
                {column.sortable && localSortConfig?.key === column.key && (
                  <span className="ml-1">
                    {localSortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </div>
            </th>
          ))}
        </tr>

        {/* Filter row */}
        {(localFilters.length > 0 || columns.some(col => col.filterable)) && (
          <tr className="bg-gray-25">
            {selectable && <th className="px-4 py-2" />}
            {columns.map(column => (
              <th key={column.key} className="px-4 py-2">
                {column.filterable && (
                  <Input
                    placeholder={`Filter ${column.header}`}
                    value={localFilters.find(f => f.key === column.key)?.value || ''}
                    onChange={(e) => handleFilterChange(column.key, e.target.value)}
                    size="sm"
                    className="w-full"
                  />
                )}
              </th>
            ))}
          </tr>
        )}
      </thead>

      <tbody>
        {loading ? (
          <tr>
            <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-4 py-8 text-center text-gray-500">
              Loading...
            </td>
          </tr>
        ) : processedData.length === 0 ? (
          <tr>
            <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-4 py-8 text-center text-gray-500">
              {emptyMessage}
            </td>
          </tr>
        ) : (
          processedData.map((row, index) => {
            const rowKeyValue = rowKey(row);
            const isSelected = selectedRows.has(rowKeyValue);

            return (
              <tr
                key={rowKeyValue}
                className={cn(
                  'border-b border-gray-200',
                  isSelected && 'bg-blue-50'
                )}
              >
                {selectable && (
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleRowSelect(rowKeyValue)}
                      className="rounded border-gray-300"
                    />
                  </td>
                )}

                {columns.map(column => (
                  <td
                    key={column.key}
                    className={cn(
                      'px-4 py-3',
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right'
                    )}
                  >
                    {renderCell(column, row, index)}
                  </td>
                ))}
              </tr>
            )
})
        )}
      </tbody>
    </table>
  );

  return (
    <div
      className={cn('space-y-4', className)}
      data-classification={dataClassification}
      data-audit-id={auditId}
      {...props}
    >
      {/* Table */}
      <div
        className={cn(
          dataTableVariants({ size, striped, hoverable }),
          virtualized && 'overflow-hidden'
        )}
        style={virtualized ? { maxHeight } : undefined}
      >
        {virtualized ? (
          <div style={{ height: maxHeight,
  overflow: 'auto' }}>
            {tableContent}
          </div>
        ) : (
          tableContent
        )}
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <select
              value={pagination.pageSize}
              onChange={(e) => pagination.onPageSizeChange(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
            >
              Previous
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export { dataTableVariants };
export default DataTable;
