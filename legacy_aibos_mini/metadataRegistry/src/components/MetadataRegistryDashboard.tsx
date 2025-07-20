'use client';

import React, { useState, useEffect } from 'react';
import { 
  MetadataRegistryService, 
  DataType, 
  Domain, 
  MetadataStatus, 
  SecurityLevel,
  type MetadataField,
  type LocalMetadataField,
  type MetadataSuggestion,
  type MetadataUsage
} from '../services/metadata-registry-service';
import { Button, Input, Badge } from '../components/ui';
import { 
  Plus, 
  Search, 
  Filter, 
  BookOpen, 
  Shield, 
  TrendingUp, 
  Users, 
  Database,
  MapPin,
  CheckCircle,
  AlertCircle,
  Clock,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  Settings,
  BarChart3,
  FileText,
  Globe,
  Lock,
  Unlock,
  UserCheck,
  Zap,
  X,
  RefreshCw,
  HelpCircle
} from 'lucide-react';

interface MetadataRegistryDashboardProps {
  organizationId: string;
  supabaseUrl: string;
  supabaseKey: string;
}

export default function MetadataRegistryDashboard({
  organizationId,
  supabaseUrl,
  supabaseKey
}: MetadataRegistryDashboardProps) {
  const [metadataService] = useState(() => new MetadataRegistryService(supabaseUrl, supabaseKey));
  
  // State management
  const [activeTab, setActiveTab] = useState<'registry' | 'local' | 'governance' | 'dictionary'>('registry');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<Domain | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<MetadataStatus | 'all'>('all');
  
  // Data states
  const [registryFields, setRegistryFields] = useState<MetadataField[]>([]);
  const [localFields, setLocalFields] = useState<LocalMetadataField[]>([]);
  const [governanceMetrics, setGovernanceMetrics] = useState<any>(null);
  const [dataDictionary, setDataDictionary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showAddFieldModal, setShowAddFieldModal] = useState(false);
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [selectedField, setSelectedField] = useState<MetadataField | null>(null);
  const [suggestions, setSuggestions] = useState<MetadataSuggestion[]>([]);
  
  // New field form
  const [newField, setNewField] = useState({
    field_name: '',
    data_type: DataType.SHORT_TEXT,
    description: '',
    domain: Domain.GENERAL,
    is_pii: false,
    is_sensitive: false,
    is_financial: false,
    security_level: SecurityLevel.INTERNAL,
    tags: [] as string[],
    synonyms: [] as string[]
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      switch (activeTab) {
        case 'registry':
          const suggestions = await metadataService.suggestFields(searchQuery);
          const fields = suggestions.map(s => s.field);
          setRegistryFields(fields);
          break;
        case 'local':
          // TODO: Implement local fields fetch from database
          setLocalFields([]);
          break;
        case 'governance':
          const metrics = await metadataService.getEnhancedGovernanceMetrics(organizationId);
          setGovernanceMetrics(metrics);
          break;
        case 'dictionary':
          const registryFields = await metadataService.suggestFields('');
          const dictionary = registryFields.reduce((acc, suggestion) => {
            const domain = suggestion.field.domain;
            if (!acc[domain]) {
              acc[domain] = { total_fields: 0, mapped_fields: 0, fields: [] };
            }
            acc[domain].total_fields++;
            acc[domain].fields.push({
              ...suggestion.field,
              source: 'registry'
            });
            return acc;
          }, {} as any);
          setDataDictionary(dictionary);
          break;
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Unable to load data. Please try again or contact support.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddField = async () => {
    try {
      await metadataService.registerMetadataField({
        ...newField,
        created_by: 'current-user',
        is_custom: true
      }, organizationId);
      setShowAddFieldModal(false);
      setNewField({
        field_name: '',
        data_type: DataType.SHORT_TEXT,
        description: '',
        domain: Domain.GENERAL,
        is_pii: false,
        is_sensitive: false,
        is_financial: false,
        security_level: SecurityLevel.INTERNAL,
        tags: [],
        synonyms: []
      });
      loadData();
    } catch (error) {
      console.error('Error adding field:', error);
    }
  };

  const handleFieldSuggestion = async (fieldName: string) => {
    try {
      const suggestions = await metadataService.suggestFields(fieldName);
      setSuggestions(suggestions as any);
      setShowSuggestionModal(true);
    } catch (error) {
      console.error('Error getting suggestions:', error);
    }
  };

  const getStatusColor = (status: MetadataStatus) => {
    switch (status) {
      case MetadataStatus.ACTIVE: return 'text-green-600 bg-green-100';
      case MetadataStatus.DRAFT: return 'text-yellow-600 bg-yellow-100';
      case MetadataStatus.DEPRECATED: return 'text-red-600 bg-red-100';
      case MetadataStatus.ARCHIVED: return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDomainColor = (domain: Domain) => {
    const colors: Record<Domain, string> = {
      [Domain.ACCOUNTING]: 'bg-blue-100 text-blue-800',
      [Domain.FINANCE]: 'bg-green-100 text-green-800',
      [Domain.TAX]: 'bg-purple-100 text-purple-800',
      [Domain.COMPLIANCE]: 'bg-red-100 text-red-800',
      [Domain.CUSTOMER]: 'bg-orange-100 text-orange-800',
      [Domain.VENDOR]: 'bg-indigo-100 text-indigo-800',
      [Domain.EMPLOYEE]: 'bg-pink-100 text-pink-800',
      [Domain.INVENTORY]: 'bg-teal-100 text-teal-800',
      [Domain.PROJECT]: 'bg-cyan-100 text-cyan-800',
      [Domain.REPORTING]: 'bg-amber-100 text-amber-800',
      [Domain.AUDIT]: 'bg-rose-100 text-rose-800',
      [Domain.GENERAL]: 'bg-gray-100 text-gray-800'
    };
    return colors[domain] || colors[Domain.GENERAL];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Metadata Registry
              </h1>
              <p className="text-gray-600">
                Hybrid metadata framework for data governance and flexibility
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setShowAddFieldModal(true)}
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Field</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            {[
              { id: 'registry', label: 'Registry', icon: Database },
              { id: 'local', label: 'Local Fields', icon: MapPin },
              { id: 'governance', label: 'Governance', icon: Shield },
              { id: 'dictionary', label: 'Data Dictionary', icon: BookOpen }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {activeTab === 'registry' && (
            <RegistryTab
              fields={registryFields}
              loading={loading}
              error={error}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedDomain={selectedDomain}
              setSelectedDomain={setSelectedDomain}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              onFieldSuggestion={handleFieldSuggestion}
              onRetry={loadData}
              onAddField={() => setShowAddFieldModal(true)}
              getStatusColor={getStatusColor}
              getDomainColor={getDomainColor}
            />
          )}

          {activeTab === 'local' && (
            <LocalFieldsTab
              fields={localFields}
              loading={loading}
              error={error}
              onRetry={loadData}
              onMapping={setShowMappingModal}
            />
          )}

          {activeTab === 'governance' && (
            <GovernanceTab
              metrics={governanceMetrics}
              loading={loading}
              error={error}
              onRetry={loadData}
            />
          )}

          {activeTab === 'dictionary' && (
            <DataDictionaryTab
              dictionary={dataDictionary}
              loading={loading}
              error={error}
              onRetry={loadData}
            />
          )}
        </div>
      </div>

      {/* Add Field Modal */}
      {showAddFieldModal && (
        <AddFieldModal
          field={newField}
          setField={setNewField}
          onSave={handleAddField}
          onClose={() => setShowAddFieldModal(false)}
        />
      )}

      {/* Suggestions Modal */}
      {showSuggestionModal && (
        <SuggestionsModal
          suggestions={suggestions}
          onClose={() => setShowSuggestionModal(false)}
          onMap={(fieldId) => {
            setShowSuggestionModal(false);
          }}
        />
      )}
    </div>
  );
}

// Empty State Component
function EmptyState({ 
  icon, 
  title, 
  description, 
  actionText, 
  onAction, 
  helpText 
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText: string;
  onAction: () => void;
  helpText?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="text-6xl mb-6">{icon}</div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 mb-8 max-w-md">{description}</p>
      
      <Button onClick={onAction} className="mb-6">
        {actionText}
      </Button>
      
      {helpText && (
        <div className="bg-gray-50 rounded-lg p-4 max-w-md">
          <div className="flex items-start space-x-2">
            <HelpCircle className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-600">{helpText}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Error State Component
function ErrorState({ 
  message, 
  onRetry 
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="text-6xl mb-6">⚠️</div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3">Unable to Load Data</h3>
      <p className="text-gray-600 mb-8 max-w-md">{message}</p>
      
      <div className="flex items-center space-x-4">
        <Button onClick={onRetry} variant="outline" className="flex items-center space-x-2">
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </Button>
        <Button variant="outline">
          Contact Support
        </Button>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4 mt-6 max-w-md">
        <div className="flex items-start space-x-2">
          <HelpCircle className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-600">
            Need help? Our support team is here to help you get back up and running quickly.
          </p>
        </div>
      </div>
    </div>
  );
}

// Registry Tab Component
function RegistryTab({
  fields,
  loading,
  error,
  searchQuery,
  setSearchQuery,
  selectedDomain,
  setSelectedDomain,
  selectedStatus,
  setSelectedStatus,
  onFieldSuggestion,
  onRetry,
  onAddField,
  getStatusColor,
  getDomainColor
}: any) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  if (fields.length === 0) {
    return (
      <EmptyState
        icon="📋"
        title="No Metadata Fields Yet"
        description="You haven't added any metadata fields to your registry yet. Let's get started by creating your first field."
        actionText="Add Your First Field"
        onAction={onAddField}
        helpText="What are metadata fields? These define the structure and meaning of your data, helping ensure consistency and compliance across your organization."
      />
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search fields..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <select
          value={selectedDomain}
          onChange={(e) => setSelectedDomain(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Domains</option>
          {Object.values(Domain).map((domain) => (
            <option key={domain} value={domain}>
              {domain.charAt(0).toUpperCase() + domain.slice(1)}
            </option>
          ))}
        </select>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          {Object.values(MetadataStatus).map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Fields Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-900">Field Name</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Data Type</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Domain</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Usage</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Security</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field: MetadataField) => (
              <tr key={field.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div>
                    <div className="font-medium text-gray-900">{field.field_name}</div>
                    <div className="text-sm text-gray-500">{field.description}</div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {field.data_type}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDomainColor(field.domain)}`}>
                    {field.domain}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(field.status)}`}>
                    {field.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{field.usage_count || 0}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-1">
                    {field.is_pii && <Shield className="w-4 h-4 text-red-500" />}
                    {field.is_sensitive && <Lock className="w-4 h-4 text-orange-500" />}
                    {field.is_financial && <BarChart3 className="w-4 h-4 text-green-500" />}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <button className="text-blue-600 hover:text-blue-800">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-gray-600 hover:text-gray-800">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Local Fields Tab Component
function LocalFieldsTab({ fields, loading, error, onRetry, onMapping }: any) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  if (fields.length === 0) {
    return (
      <EmptyState
        icon="📍"
        title="No Local Fields Yet"
        description="Local fields represent metadata from your existing databases and systems. Let's discover and map them to the registry."
        actionText="Scan for Local Fields"
        onAction={() => onMapping(null)}
        helpText="What are local fields? These are metadata fields from your existing databases, APIs, and systems that can be mapped to the global registry for consistency."
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">Local Metadata Fields</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Users className="w-4 h-4" />
          <span>{fields.length} local fields</span>
        </div>
      </div>

      <div className="grid gap-4">
        {fields.map((field: LocalMetadataField) => (
          <div key={field.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">{field.local_name}</span>
                  {field.is_mapped ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
                <div className="text-sm text-gray-500 mt-1">{field.table_name}.{field.column_name}</div>
              </div>
              <div className="flex items-center space-x-2">
                {!field.is_mapped && (
                  <button
                    onClick={() => onMapping(field)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Map to Registry
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Governance Tab Component
function GovernanceTab({ metrics, loading, error, onRetry }: any) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  if (!metrics || Object.keys(metrics).length === 0) {
    return (
      <EmptyState
        icon="🛡️"
        title="No Governance Data Yet"
        description="Governance metrics will appear here once you have metadata fields and usage data in your registry."
        actionText="Add Your First Field"
        onAction={() => window.location.reload()}
        helpText="What are governance metrics? These track compliance, usage patterns, and data quality across your metadata registry to ensure proper data governance."
      />
    );
  }

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-6">Governance Metrics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Terms</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.total_terms || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Compliance Score</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.compliance_score || 0}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Terms</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.active_terms || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Deprecated</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.deprecated_terms || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Domain Distribution</h4>
          <div className="space-y-3">
            {metrics.domains && Object.entries(metrics.domains).map(([domain, data]: [string, any]) => (
              <div key={domain} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 capitalize">{domain}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{data.count || 0}</span>
                  <span className="text-xs text-gray-500">({data.compliance || 0}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Terms Added</span>
              <span className="text-sm font-medium text-gray-900">{metrics.recent_activity?.terms_added || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Terms Updated</span>
              <span className="text-sm font-medium text-gray-900">{metrics.recent_activity?.terms_updated || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Terms Deprecated</span>
              <span className="text-sm font-medium text-gray-900">{metrics.recent_activity?.terms_deprecated || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Sync</span>
              <span className="text-sm font-medium text-gray-900">
                {metrics.recent_activity?.last_sync ? new Date(metrics.recent_activity.last_sync).toLocaleDateString() : 'Never'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Data Dictionary Tab Component
function DataDictionaryTab({ dictionary, loading, error, onRetry }: any) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  if (!dictionary || Object.keys(dictionary).length === 0) {
    return (
      <EmptyState
        icon="📚"
        title="No Data Dictionary Yet"
        description="Your data dictionary will be automatically generated from your metadata registry fields. Add some fields to get started."
        actionText="Add Your First Field"
        onAction={() => window.location.reload()}
        helpText="What is a data dictionary? This provides a comprehensive view of all your data fields organized by domain, helping teams understand and use data consistently."
      />
    );
  }

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-6">Data Dictionary</h3>
      
      <div className="space-y-6">
        {Object.entries(dictionary).map(([domain, data]: [string, any]) => (
          <div key={domain} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-medium text-gray-900 capitalize">{domain}</h4>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>{data.total_fields || 0} total fields</span>
                  <span>{data.mapped_fields || 0} mapped</span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid gap-4">
                {data.fields && data.fields.map((field: any) => (
                  <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{field.field_name}</div>
                        <div className="text-sm text-gray-500 mt-1">{field.description}</div>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {field.data_type}
                          </span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {field.source}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-800">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-800">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Add Field Modal Component
function AddFieldModal({ field, setField, onSave, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Add New Field</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Field Name</label>
            <input
              type="text"
              value={field.field_name}
              onChange={(e) => setField({ ...field, field_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter field name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={field.description}
              onChange={(e) => setField({ ...field, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Enter field description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Type</label>
              <select
                value={field.data_type}
                onChange={(e) => setField({ ...field, data_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.values(DataType).map((type) => (
                  <option key={type} value={type}>
                    {type.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
              <select
                value={field.domain}
                onChange={(e) => setField({ ...field, domain: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.values(Domain).map((domain) => (
                  <option key={domain} value={domain}>
                    {domain.charAt(0).toUpperCase() + domain.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={field.is_pii}
                onChange={(e) => setField({ ...field, is_pii: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">PII Data</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={field.is_sensitive}
                onChange={(e) => setField({ ...field, is_sensitive: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Sensitive Data</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={field.is_financial}
                onChange={(e) => setField({ ...field, is_financial: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Financial Data</span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Add Field
          </button>
        </div>
      </div>
    </div>
  );
}

// Suggestions Modal Component
function SuggestionsModal({ suggestions, onClose, onMap }: any) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Field Suggestions</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          {suggestions.map((suggestion: MetadataSuggestion) => (
            <div key={suggestion.field.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{suggestion.field.field_name}</div>
                  <div className="text-sm text-gray-500 mt-1">{suggestion.field.description}</div>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {suggestion.field.data_type}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {suggestion.confidence_score}% match
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onMap(suggestion.field.id)}
                    className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Map
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}