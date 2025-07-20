'use client';

import React, { useState, useMemo } from 'react';
import { 
  X, 
  Filter, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  Settings
} from 'lucide-react';
import { LuxuryModal } from '../ui/LuxuryModal';
import { LuxuryButton } from '../ui/LuxuryButton';
import { LuxuryInput } from '../ui/LuxuryInput';
import { LuxurySelect } from '../ui/LuxurySelect';
import { AppleStyleTable } from '../ui/AppleStyleTable';

interface DataPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    columns: string[];
    sampleData: any[][];
    dataTypes: { [key: string]: string };
    validationResults: any[];
  };
  dataQuality?: {
    overall: number;
    completeness: number;
    consistency: number;
    accuracy: number;
    uniqueness: number;
    issues: any[];
    suggestions: string[];
  };
  smartSuggestions?: Array<{
    column: string;
    suggestedMapping: string;
    confidence: number;
    reasoning: string;
    alternatives: string[];
  }>;
  onContinue: () => void;
}

export const DataPreviewModal: React.FC<DataPreviewModalProps> = ({
  isOpen,
  onClose,
  data,
  dataQuality,
  smartSuggestions,
  onContinue
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filter and search data
  const filteredData = useMemo(() => {
    let filtered = data.sampleData;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(row =>
        row.some(cell => 
          cell.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply column filter
    if (selectedColumn) {
      const columnIndex = data.columns.indexOf(selectedColumn);
      if (columnIndex !== -1) {
        filtered = filtered.filter(row => row[columnIndex] !== '');
      }
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(row =>
        row.some((cell, index) => {
          const columnName = data.columns[index];
          const dataType = data.dataTypes[columnName];
          return dataType === filterType;
        })
      );
    }

    // Apply sorting
    if (sortColumn) {
      const columnIndex = data.columns.indexOf(sortColumn);
      if (columnIndex !== -1) {
        filtered.sort((a, b) => {
          const aVal = a[columnIndex];
          const bVal = b[columnIndex];
          
          if (sortDirection === 'asc') {
            return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
          } else {
            return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
          }
        });
      }
    }

    return filtered;
  }, [data, searchTerm, selectedColumn, filterType, sortColumn, sortDirection]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getValidationStatus = (column: string) => {
    const validation = data.validationResults.find(v => v.column === column);
    if (!validation) return 'unknown';
    
    if (validation.invalidRows === 0) return 'valid';
    if (validation.invalidRows < validation.validRows) return 'warning';
    return 'error';
  };

  const getValidationIcon = (status: string) => {
    switch (status) {
      case 'valid': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error': return <X className="w-4 h-4 text-red-500" />;
      default: return <Info className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <LuxuryModal
      isOpen={isOpen}
      onClose={onClose}
      title="Enhanced Data Preview"
      size="full"
    >
      <div className="space-y-6 h-full flex flex-col">
        {/* Header with Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm font-medium text-gray-700">Total Rows</p>
            <p className="text-lg font-semibold text-gray-900">{data.sampleData.length}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Columns</p>
            <p className="text-lg font-semibold text-gray-900">{data.columns.length}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Filtered Rows</p>
            <p className="text-lg font-semibold text-gray-900">{filteredData.length}</p>
          </div>
          {dataQuality && (
            <div>
              <p className="text-sm font-medium text-gray-700">Quality Score</p>
              <p className="text-lg font-semibold text-gray-900">{dataQuality.overall}%</p>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <LuxuryInput
                placeholder="Search in data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>
            <LuxuryButton
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {showFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
            </LuxuryButton>
            <LuxuryButton variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </LuxuryButton>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Column</label>
                <LuxurySelect
                  value={selectedColumn}
                  onChange={(value) => setSelectedColumn(value)}
                  options={[
                    { value: '', label: 'All Columns' },
                    ...data.columns.map(col => ({ value: col, label: col }))
                  ]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Type</label>
                <LuxurySelect
                  value={filterType}
                  onChange={(value) => setFilterType(value)}
                  options={[
                    { value: 'all', label: 'All Types' },
                    { value: 'string', label: 'Text' },
                    { value: 'number', label: 'Number' },
                    { value: 'date', label: 'Date' },
                    { value: 'currency', label: 'Currency' },
                    { value: 'boolean', label: 'Boolean' }
                  ]}
                />
              </div>
              <div className="flex items-end">
                <LuxuryButton
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedColumn('');
                    setFilterType('all');
                    setSortColumn('');
                    setSortDirection('asc');
                  }}
                >
                  Clear Filters
                </LuxuryButton>
              </div>
            </div>
          )}
        </div>

        {/* Data Quality and Smart Suggestions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Data Quality Panel */}
          {dataQuality && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Data Quality Analysis
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Completeness', value: dataQuality.completeness, color: 'blue' },
                  { label: 'Consistency', value: dataQuality.consistency, color: 'green' },
                  { label: 'Accuracy', value: dataQuality.accuracy, color: 'purple' },
                  { label: 'Uniqueness', value: dataQuality.uniqueness, color: 'orange' }
                ].map((metric) => (
                  <div key={metric.label} className="text-center p-3 bg-white border border-gray-200 rounded-lg">
                    <div className={`text-xl font-bold text-${metric.color}-600`}>{metric.value}%</div>
                    <div className="text-sm text-gray-600">{metric.label}</div>
                  </div>
                ))}
              </div>

              {dataQuality.issues.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-md font-medium text-gray-900">Issues Found</h4>
                  {dataQuality.issues.slice(0, 3).map((issue, index) => (
                    <div key={index} className={`p-2 rounded text-sm ${
                      issue.severity === 'critical' ? 'bg-red-50 text-red-800' :
                      issue.severity === 'high' ? 'bg-orange-50 text-orange-800' :
                      'bg-yellow-50 text-yellow-800'
                    }`}>
                      {issue.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Smart Suggestions Panel */}
          {smartSuggestions && smartSuggestions.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Eye className="w-4 h-4 mr-2" />
                Smart Mapping Suggestions
              </h3>
              
              <div className="space-y-2">
                {smartSuggestions.slice(0, 4).map((suggestion, index) => (
                  <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">{suggestion.column}</span>
                          <span className="text-sm text-gray-500">→</span>
                          <span className="text-sm font-medium text-green-700">{suggestion.suggestedMapping}</span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            {Math.round(suggestion.confidence * 100)}% confidence
                          </span>
                          <span className="text-xs text-gray-500">{suggestion.reasoning}</span>
                        </div>
                      </div>
                      <LuxuryButton size="sm" variant="outline">
                        Apply
                      </LuxuryButton>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Data Table */}
        <div className="flex-1 min-h-0">
          <div className="h-full overflow-hidden">
            <AppleStyleTable
              data={filteredData}
              columns={data.columns.map(column => ({
                key: column,
                label: (
                  <div className="flex items-center space-x-2">
                    <span>{column}</span>
                    {getValidationIcon(getValidationStatus(column))}
                    <button
                      onClick={() => handleSort(column)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {sortColumn === column ? (
                        sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                )
              }))}
              renderCell={(row, column) => {
                const columnIndex = data.columns.indexOf(column.key);
                const value = row[columnIndex];
                const dataType = data.dataTypes[column.key];
                
                return (
                  <div className="flex items-center space-x-2">
                    <span className={`
                      ${dataType === 'currency' ? 'font-mono' : ''}
                      ${dataType === 'date' ? 'text-blue-600' : ''}
                      ${dataType === 'number' ? 'text-right' : ''}
                    `}>
                      {value}
                    </span>
                    {dataType && (
                      <span className="text-xs text-gray-400 bg-gray-100 px-1 rounded">
                        {dataType}
                      </span>
                    )}
                  </div>
                );
              }}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Showing {filteredData.length} of {data.sampleData.length} rows
          </div>
          <div className="flex space-x-3">
            <LuxuryButton variant="outline" onClick={onClose}>
              Cancel
            </LuxuryButton>
            <LuxuryButton onClick={onContinue}>
              Continue to Mapping
            </LuxuryButton>
          </div>
        </div>
      </div>
    </LuxuryModal>
  );
}; 