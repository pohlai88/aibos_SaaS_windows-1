'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Eye,
  Map,
  Play,
  Plus,
  Save,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { GlassPanel } from '../ui/GlassPanel';
import { LuxuryModal } from '../ui/LuxuryModal';
import { LuxuryTabs } from '../ui/LuxuryTabs';
import { LuxurySelect } from '../ui/LuxurySelect';
import { AppleStyleTable } from '../ui/AppleStyleTable';
import { MetricCard } from '../ui/MetricCard';
import { LuxuryButton } from '../ui/LuxuryButton';
import { LuxuryInput } from '../ui/LuxuryInput';

interface ImportExportDashboardProps {
  organizationId: string;
  userId: string;
}

interface DataQualityScore {
  overall: number;
  completeness: number;
  consistency: number;
  accuracy: number;
  uniqueness: number;
  issues: DataQualityIssue[];
  suggestions: string[];
}

interface DataQualityIssue {
  type: 'missing' | 'duplicate' | 'invalid' | 'inconsistent' | 'outlier';
  column: string;
  row?: number;
  value?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  suggestion?: string;
}

interface SmartSuggestion {
  column: string;
  suggestedMapping: string;
  confidence: number;
  reasoning: string;
  alternatives: string[];
}

// Mock data for demonstration
const mockImportJobs = [
  {
    id: '1',
    fileName: 'chart_of_accounts.csv',
    type: 'csv',
    status: 'completed',
    totalRows: 150,
    processedRows: 150,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    fileName: 'transactions.xlsx',
    type: 'excel',
    status: 'processing',
    totalRows: 500,
    processedRows: 250,
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16')
  }
];

const mockExportJobs = [
  {
    id: '1',
    dataSource: 'Chart of Accounts',
    type: 'csv',
    status: 'completed',
    createdAt: new Date('2024-01-15'),
    fileUrl: 'https://example.com/export.csv'
  }
];

export const ImportExportDashboard: React.FC<ImportExportDashboardProps> = ({
  organizationId,
  userId
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'export' | 'templates' | 'migration'>('import');
  const [importJobs, setImportJobs] = useState(mockImportJobs);
  const [exportJobs, setExportJobs] = useState(mockExportJobs);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [dataQuality, setDataQuality] = useState<DataQualityScore | null>(null);
  const [smartSuggestions, setSmartSuggestions] = useState<SmartSuggestion[]>([]);
  const [currentJobId, setCurrentJobId] = useState<string>('');

  // File upload handling
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setIsProcessing(true);

    try {
      // Simulate file processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Add mock import job
      const jobId = Date.now().toString();
      const newJob = {
        id: jobId,
        fileName: file.name,
        type: file.name.endsWith('.csv') ? 'csv' : 'excel',
        status: 'pending' as const,
        totalRows: Math.floor(Math.random() * 1000) + 100,
        processedRows: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setImportJobs([newJob, ...importJobs]);
      setCurrentJobId(jobId);

      // Simulate data quality analysis
      const mockQualityScore: DataQualityScore = {
        overall: Math.floor(Math.random() * 30) + 70, // 70-100
        completeness: Math.floor(Math.random() * 20) + 80,
        consistency: Math.floor(Math.random() * 15) + 85,
        accuracy: Math.floor(Math.random() * 25) + 75,
        uniqueness: Math.floor(Math.random() * 20) + 80,
        issues: [
          {
            type: 'missing',
            column: 'Account Code',
            severity: 'medium',
            message: '15% of values are missing in column "Account Code"',
            suggestion: 'Consider filling missing values or removing incomplete rows'
          },
          {
            type: 'inconsistent',
            column: 'Amount',
            severity: 'low',
            message: '8% of values have inconsistent data types in column "Amount"',
            suggestion: 'Expected type: currency. Review and standardize data format.'
          }
        ],
        suggestions: [
          'Review and fix data quality issues before importing',
          'Consider using data cleaning tools to fill missing values'
        ]
      };

      // Simulate smart suggestions
      const mockSuggestions: SmartSuggestion[] = [
        {
          column: 'Account Code',
          suggestedMapping: 'account_code',
          confidence: 0.95,
          reasoning: 'Column name "Account Code" matches pattern for "account_code"',
          alternatives: ['code', 'account_number']
        },
        {
          column: 'Account Name',
          suggestedMapping: 'account_name',
          confidence: 0.92,
          reasoning: 'Column name "Account Name" matches pattern for "account_name"',
          alternatives: ['name', 'description']
        },
        {
          column: 'Balance',
          suggestedMapping: 'amount',
          confidence: 0.88,
          reasoning: 'Column name "Balance" matches pattern for "amount"',
          alternatives: ['value', 'total']
        }
      ];

      setDataQuality(mockQualityScore);
      setSmartSuggestions(mockSuggestions);
      setShowPreviewModal(true);
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [importJobs]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/json': ['.json'],
      'application/xml': ['.xml']
    },
    multiple: false
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'processing': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'processing': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  // Enhanced data preview modal with quality scoring
  const renderDataPreviewModal = () => (
    <LuxuryModal
      isOpen={showPreviewModal}
      onClose={() => setShowPreviewModal(false)}
      title="Data Preview & Quality Analysis"
      size="xl"
    >
      <div className="space-y-6">
        {/* File Information */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm font-medium text-gray-700">File Name</p>
            <p className="text-sm text-gray-900">sample_data.csv</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Total Rows</p>
            <p className="text-sm text-gray-900">150</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Columns</p>
            <p className="text-sm text-gray-900">8</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">File Type</p>
            <p className="text-sm text-gray-900">CSV</p>
          </div>
        </div>

        {/* Data Quality Score */}
        {dataQuality && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">Data Quality Analysis</h4>
            
            {/* Overall Score */}
            <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-gray-200"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={`${dataQuality.overall >= 90 ? 'text-green-500' : dataQuality.overall >= 70 ? 'text-yellow-500' : 'text-red-500'}`}
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray={`${dataQuality.overall}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold">{dataQuality.overall}</span>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <h5 className="text-lg font-semibold text-gray-900">Overall Quality Score</h5>
                <p className="text-sm text-gray-600">
                  {dataQuality.overall >= 90 ? 'Excellent' : dataQuality.overall >= 70 ? 'Good' : 'Needs Improvement'}
                </p>
              </div>
            </div>

            {/* Quality Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Completeness', value: dataQuality.completeness, color: 'blue' },
                { label: 'Consistency', value: dataQuality.consistency, color: 'green' },
                { label: 'Accuracy', value: dataQuality.accuracy, color: 'purple' },
                { label: 'Uniqueness', value: dataQuality.uniqueness, color: 'orange' }
              ].map((metric) => (
                <div key={metric.label} className="text-center p-3 bg-white border border-gray-200 rounded-lg">
                  <div className={`text-2xl font-bold text-${metric.color}-600`}>{metric.value}%</div>
                  <div className="text-sm text-gray-600">{metric.label}</div>
                </div>
              ))}
            </div>

            {/* Quality Issues */}
            {dataQuality.issues.length > 0 && (
              <div className="space-y-3">
                <h5 className="text-md font-semibold text-gray-900">Quality Issues</h5>
                {dataQuality.issues.map((issue, index) => (
                  <div key={index} className={`p-3 rounded-lg border-l-4 ${
                    issue.severity === 'critical' ? 'bg-red-50 border-red-400' :
                    issue.severity === 'high' ? 'bg-orange-50 border-orange-400' :
                    issue.severity === 'medium' ? 'bg-yellow-50 border-yellow-400' :
                    'bg-blue-50 border-blue-400'
                  }`}>
                    <div className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                        issue.severity === 'critical' ? 'bg-red-400' :
                        issue.severity === 'high' ? 'bg-orange-400' :
                        issue.severity === 'medium' ? 'bg-yellow-400' :
                        'bg-blue-400'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{issue.message}</p>
                        {issue.suggestion && (
                          <p className="text-sm text-gray-600 mt-1">{issue.suggestion}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Suggestions */}
            {dataQuality.suggestions.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-md font-semibold text-gray-900">Recommendations</h5>
                {dataQuality.suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                    <span>{suggestion}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Smart Suggestions */}
        {smartSuggestions.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">Smart Column Mapping Suggestions</h4>
            <div className="space-y-3">
              {smartSuggestions.map((suggestion, index) => (
                <div key={index} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">{suggestion.column}</span>
                        <span className="text-sm text-gray-500">→</span>
                        <span className="text-sm font-medium text-green-700">{suggestion.suggestedMapping}</span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          {Math.round(suggestion.confidence * 100)}% confidence
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{suggestion.reasoning}</p>
                      {suggestion.alternatives.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          Alternatives: {suggestion.alternatives.join(', ')}
                        </p>
                      )}
                    </div>
                    <LuxuryButton
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        // Apply suggestion logic would go here
                        console.log('Applying suggestion:', suggestion);
                      }}
                    >
                      Apply
                    </LuxuryButton>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sample Data Preview */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900">Sample Data Preview</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Account Code', 'Account Name', 'Type', 'Balance', 'Description', 'Date'].map((header) => (
                    <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[
                  ['1000', 'Cash', 'Asset', '$15,000.00', 'Main checking account', '2024-01-15'],
                  ['1100', 'Accounts Receivable', 'Asset', '$25,000.00', 'Customer invoices', '2024-01-15'],
                  ['2000', 'Accounts Payable', 'Liability', '$8,500.00', 'Vendor bills', '2024-01-15'],
                  ['3000', 'Common Stock', 'Equity', '$50,000.00', 'Shareholder investment', '2024-01-15']
                ].map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-50">
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <LuxuryButton
            variant="outline"
            onClick={() => setShowPreviewModal(false)}
          >
            Cancel
          </LuxuryButton>
          <LuxuryButton
            onClick={() => {
              setShowPreviewModal(false);
              setShowMappingModal(true);
            }}
          >
            Continue to Mapping
          </LuxuryButton>
        </div>
      </div>
    </LuxuryModal>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Import/Export Tools</h1>
          <p className="text-gray-600">Manage data imports, exports, and migrations</p>
        </div>
        
        {/* Quick Stats */}
        <div className="flex space-x-4">
          <MetricCard
            title="Import Jobs"
            value={importJobs.length.toString()}
            change="+12%"
            changeType="positive"
          />
          <MetricCard
            title="Success Rate"
            value="98.5%"
            change="+2.1%"
            changeType="positive"
          />
        </div>
      </div>

      {/* Main Content */}
      <LuxuryTabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as any)}
        items={[
          { value: 'import', label: 'Import Data', icon: <Upload className="w-4 h-4" /> },
          { value: 'export', label: 'Export Data', icon: <Download className="w-4 h-4" /> },
          { value: 'templates', label: 'Templates', icon: <FileText className="w-4 h-4" /> },
          { value: 'migration', label: 'Migration', icon: <ExternalLink className="w-4 h-4" /> }
        ]}
      >
        {/* Import Tab */}
        <div className="space-y-6">
          {/* File Upload Area */}
          <GlassPanel>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {isDragActive ? 'Drop your file here' : 'Drag & drop files here'}
              </h3>
              <p className="text-gray-600 mb-4">
                or click to browse files (CSV, Excel, JSON, XML)
              </p>
              <div className="text-sm text-gray-500">
                Supported formats: CSV, Excel (.xls, .xlsx), JSON, XML
              </div>
              {isProcessing && (
                <div className="mt-4 flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-gray-600">Analyzing file...</span>
                </div>
              )}
            </div>
          </GlassPanel>

          {/* Import Jobs Table */}
          <GlassPanel>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Import Jobs</h3>
              <LuxuryButton size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                New Import
              </LuxuryButton>
            </div>
            
            <AppleStyleTable
              data={importJobs}
              columns={[
                { key: 'fileName', label: 'File Name' },
                { key: 'type', label: 'Type' },
                { key: 'status', label: 'Status' },
                { key: 'totalRows', label: 'Total Rows' },
                { key: 'processedRows', label: 'Processed' },
                { key: 'createdAt', label: 'Created' },
                { key: 'actions', label: 'Actions' }
              ]}
              renderCell={(item, column) => {
                switch (column.key) {
                  case 'status':
                    return (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'completed' ? 'bg-green-100 text-green-800' :
                        item.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        item.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.status}
                      </span>
                    );
                  case 'actions':
                    return (
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-800">
                          <Play className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  default:
                    return item[column.key as keyof typeof item];
                }
              }}
            />
          </GlassPanel>
        </div>

        {/* Export Tab */}
        <div className="space-y-6">
          <GlassPanel>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Data</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <LuxurySelect
                  label="Data Source"
                  options={[
                    { value: 'chart_of_accounts', label: 'Chart of Accounts' },
                    { value: 'transactions', label: 'Transactions' },
                    { value: 'customers', label: 'Customers' },
                    { value: 'vendors', label: 'Vendors' },
                    { value: 'reports', label: 'Financial Reports' }
                  ]}
                  placeholder="Select data source"
                />
                <LuxurySelect
                  label="Export Format"
                  options={[
                    { value: 'csv', label: 'CSV' },
                    { value: 'excel', label: 'Excel' },
                    { value: 'pdf', label: 'PDF' },
                    { value: 'json', label: 'JSON' }
                  ]}
                  placeholder="Select format"
                />
                <LuxuryButton
                  className="w-full"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Creating Export...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Create Export
                    </>
                  )}
                </LuxuryButton>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Export Options</h4>
                <div className="space-y-3">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-sm text-gray-700">Include headers</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-gray-700">Include metadata</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-gray-700">Compress file</span>
                  </label>
                </div>
              </div>
            </div>
          </GlassPanel>

          {/* Export Jobs Table */}
          <GlassPanel>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Exports</h3>
              <LuxuryButton
                variant="outline"
                size="sm"
              >
                Refresh
              </LuxuryButton>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Format
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {exportJobs.map((job) => (
                    <tr key={job.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium">{job.dataSource}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-gray-100 rounded text-sm font-medium">
                          {job.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(job.status)}
                          <span className={`font-medium ${getStatusColor(job.status)}`}>
                            {job.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {job.fileUrl && (
                            <LuxuryButton
                              onClick={() => window.open(job.fileUrl, '_blank')}
                              variant="ghost"
                              size="sm"
                            >
                              <Download className="w-4 h-4" />
                            </LuxuryButton>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassPanel>
        </div>

        {/* Templates Tab */}
        <div className="space-y-6">
          <GlassPanel>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Import Templates</h3>
              <LuxuryButton
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Template
              </LuxuryButton>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { id: '1', name: 'Chart of Accounts', type: 'chart_of_accounts', description: 'Standard chart of accounts template', columns: 8 },
                { id: '2', name: 'Transactions', type: 'transactions', description: 'General transaction import template', columns: 12 },
                { id: '3', name: 'Customers', type: 'customers', description: 'Customer data import template', columns: 6 }
              ].map((template) => (
                <div
                  key={template.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{template.name}</h4>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                      {template.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{template.columns} columns</span>
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>

        {/* Migration Tab */}
        <div className="space-y-6">
          <GlassPanel>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Migration Sources</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { id: 'autocount', name: 'AutoCount', type: 'autocount', description: 'Import data from AutoCount accounting software (Malaysia)', supportedData: ['Chart of Accounts', 'Transactions', 'Customers', 'Suppliers', 'Inventory'], region: 'SEA', mfrsCompliance: true },
                { id: 'sql', name: 'SQL Accounting', type: 'sql', description: 'Import data from SQL Accounting software (Malaysia)', supportedData: ['Chart of Accounts', 'Transactions', 'Customers', 'Suppliers', 'Inventory'], region: 'SEA', mfrsCompliance: true },
                { id: 'ubs', name: 'UBS Accounting', type: 'ubs', description: 'Import data from UBS Accounting software (Singapore/Malaysia)', supportedData: ['Chart of Accounts', 'Transactions', 'Customers', 'Suppliers'], region: 'SEA', mfrsCompliance: true },
                { id: 'myob', name: 'MYOB', type: 'myob', description: 'Import data from MYOB accounting software (Australia/SEA)', supportedData: ['Chart of Accounts', 'Transactions', 'Customers', 'Suppliers'], region: 'SEA', mfrsCompliance: true },
                { id: 'sage', name: 'Sage 50', type: 'sage', description: 'Import data from Sage 50 accounting software', supportedData: ['Chart of Accounts', 'Transactions', 'Customers', 'Suppliers'], region: 'Global', mfrsCompliance: true },
                { id: 'csv', name: 'CSV File', type: 'csv', description: 'Import data from CSV files with custom mapping', supportedData: ['Any data format'], region: 'Global', mfrsCompliance: false }
              ].map((source) => (
                <div
                  key={source.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{source.name}</h4>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                      {source.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{source.description}</p>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-700">Supported Data:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {source.supportedData.map((data, index) => (
                        <li key={index}>• {data}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>
      </LuxuryTabs>

      {/* Enhanced Data Preview Modal */}
      {renderDataPreviewModal()}

      {/* Column Mapping Modal */}
      <LuxuryModal
        isOpen={showMappingModal}
        onClose={() => setShowMappingModal(false)}
        title="Column Mapping"
        size="xl"
      >
        <div className="space-y-6">
          <p className="text-sm text-gray-600">
            Map your source columns to target fields. Required fields are marked with an asterisk (*).
          </p>

          <div className="space-y-4">
            {[
              { source: 'Account Code', target: 'account_code', type: 'string', required: true },
              { source: 'Account Name', target: 'account_name', type: 'string', required: true },
              { source: 'Type', target: 'account_type', type: 'string', required: true },
              { source: 'Balance', target: 'balance', type: 'currency', required: false }
            ].map((mapping, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Source Column
                  </label>
                  <LuxuryInput
                    value={mapping.source}
                    placeholder="Source column name"
                    readOnly
                  />
                </div>
                
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Field
                  </label>
                  <LuxurySelect
                    value={mapping.target}
                    options={[
                      { value: 'account_code', label: 'Account Code' },
                      { value: 'account_name', label: 'Account Name' },
                      { value: 'account_type', label: 'Account Type' },
                      { value: 'description', label: 'Description' },
                      { value: 'amount', label: 'Amount' },
                      { value: 'date', label: 'Date' },
                      { value: 'reference', label: 'Reference' },
                      { value: 'custom', label: 'Custom Field' }
                    ]}
                    placeholder="Select target field"
                  />
                </div>
                
                <div className="w-32">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Type
                  </label>
                  <LuxurySelect
                    value={mapping.type}
                    options={[
                      { value: 'string', label: 'Text' },
                      { value: 'number', label: 'Number' },
                      { value: 'date', label: 'Date' },
                      { value: 'boolean', label: 'Boolean' },
                      { value: 'currency', label: 'Currency' }
                    ]}
                    placeholder="Type"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={mapping.required}
                      className="rounded"
                      readOnly
                    />
                    <span className="ml-2 text-sm text-gray-700">Required</span>
                  </label>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <LuxuryButton
              variant="outline"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Column
            </LuxuryButton>
            
            <div className="flex items-center space-x-3">
              <LuxuryButton
                variant="outline"
              >
                <Save className="w-4 h-4 mr-2" />
                Save as Template
              </LuxuryButton>
              <LuxuryButton
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Execute Import
                  </>
                )}
              </LuxuryButton>
            </div>
          </div>
        </div>
      </LuxuryModal>
    </div>
  );
};

export default ImportExportDashboard; 