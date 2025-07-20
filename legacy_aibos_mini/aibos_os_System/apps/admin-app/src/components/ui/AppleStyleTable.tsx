'use client'

import { useState, useMemo } from 'react'
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

// Simple utility function to replace clsx
const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};

export interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  width?: string
  formatter?: (value: any) => React.ReactNode
}

export interface TableData {
  id: string
  [key: string]: any
}

export interface AppleStyleTableProps<T extends Record<string, any>> {
  columns: TableColumn[]
  data: T[]
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  searchable?: boolean
  className?: string
}

interface SortConfig {
  key: string
  direction: 'asc' | 'desc'
}

export function AppleStyleTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  error = null,
  onRetry,
  searchable = true,
  className = ''
}: AppleStyleTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null)

  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return {
          key,
          direction: current.direction === 'asc' ? 'desc' : 'asc'
        }
      }
      return { key, direction: 'asc' }
    })
  }

  const filteredData = useMemo(() => {
    if (!searchTerm) return data
    
    return data.filter(item =>
      Object.values(item).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  }, [data, searchTerm])

  const sortedAndFilteredData = useMemo(() => {
    if (!sortConfig) return filteredData
    
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }, [filteredData, sortConfig])

  if (error) {
    return (
      <div className={`glass-card ${className}`}>
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse" />
            <div className="relative h-16 w-16 text-red-500 animate-apple-bounce flex items-center justify-center">
              ⚠️
            </div>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            Oops! Something went wrong
          </h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md">
            {error}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="btn-apple-primary inline-flex items-center gap-2"
            >
              <ArrowUpDown className="h-4 w-4" />
              Try Again
            </button>
          )}
        </div>
      </div>
    )
  }

  if (!loading && sortedAndFilteredData.length === 0) {
    return (
      <div className={`glass-card ${className}`}>
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            {searchTerm ? 'No results found' : 'No data available'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {searchTerm 
              ? `No items match "${searchTerm}"`
              : 'Get started by adding some data'
            }
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`glass-card overflow-hidden ${className}`}>
      {searchable && (
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-apple text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-apple-blue transition-all duration-200 ease-apple-smooth"
          />
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider',
                    column.sortable && 'cursor-pointer hover:text-foreground transition-colors duration-200',
                    column.width && column.width
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <div className="flex flex-col">
                        <ArrowUp 
                          className={cn(
                            'h-3 w-3',
                            sortConfig?.key === column.key && sortConfig?.direction === 'asc'
                              ? 'text-apple-blue'
                              : 'text-muted-foreground'
                          )}
                        />
                        <ArrowDown 
                          className={cn(
                            'h-3 w-3 -mt-1',
                            sortConfig?.key === column.key && sortConfig?.direction === 'desc'
                              ? 'text-apple-blue'
                              : 'text-muted-foreground'
                          )}
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="animate-apple-fade">
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4">
                      <div className="h-4 bg-white/10 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              sortedAndFilteredData.map((item, index) => (
                <tr
                  key={item.id || index}
                  className="hover:bg-white/5 transition-colors duration-200 ease-apple-smooth animate-apple-fade"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 text-sm">
                      {column.formatter 
                        ? column.formatter(item[column.key])
                        : item[column.key]
                      }
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="px-6 py-4 border-t border-white/10 text-sm text-muted-foreground">
        Showing {sortedAndFilteredData.length} of {data.length} items
      </div>
    </div>
  )
} 