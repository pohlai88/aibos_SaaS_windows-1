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
} from '@aibos/ledger-sdk';
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
  Zap
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
    try {
      switch (activeTab) {
        case 'registry':
          // Use suggestFields instead of searchMetadataFields
          const suggestions = await metadataService.suggestFields(searchQuery);
          const fields = suggestions.map(s => s.field);
          setRegistryFields(fields);
          break;
        case 'local':
          // Load local fields (this would need to be implemented in the service)
          setLocalFields([]);
          break;
        case 'governance':
          // Use the public method instead of private
          const metrics = await metadataService.getEnhancedGovernanceMetrics(organizationId);
          setGovernanceMetrics(metrics);
          break;
        case 'dictionary':
          // Create a simple data dictionary from registry fields
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
    } finally {
      setLoading(false);
    }
  };

  const handleAddField = async () => {
    try {
      await metadataService.registerMetadataField({
        ...newField,
        created_by: 'current-user', // This should come from auth context
        is_custom: true
      });
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
              <button
                onClick={() => setShowAddFieldModal(true)}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Field</span>
              </button>
              <button className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
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
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedDomain={selectedDomain}
              setSelectedDomain={setSelectedDomain}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              onFieldSuggestion={handleFieldSuggestion}
              getStatusColor={getStatusColor}
              getDomainColor={getDomainColor}
            />
          )}

          {activeTab === 'local' && (
            <LocalFieldsTab
              fields={localFields}
              loading={loading}
              onMapping={setShowMappingModal}
            />
          )}

          {activeTab === 'governance' && (
            <GovernanceTab
              metrics={governanceMetrics}
              loading={loading}
            />
          )}

          {activeTab === 'dictionary' && (
            <DataDictionaryTab
              dictionary={dataDictionary}
              loading={loading}
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
            // Handle mapping logic
            setShowSuggestionModal(false);
          }}
        />
      )}
    </div>
  );
}

// Registry Tab Component
function RegistryTab({
  fields,
  loading,
  searchQuery,
  setSearchQuery,
  selectedDomain,
  setSelectedDomain,
  selectedStatus,
  setSelectedStatus,
  onFieldSuggestion,
  getStatusColor,
  getDomainColor
}: any) {
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
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
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
                      <span className="text-sm text-gray-600">{field.usage_count}</span>
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
      )}
    </div>
  );
}

// Local Fields Tab Component
function LocalFieldsTab({ fields, loading, onMapping }: any) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">Local Metadata Fields</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Users className="w-4 h-4" />
          <span>{fields.length} local fields</span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {fields.map((field: LocalMetadataField) => (
            <div key={field.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{field.field_name}</span>
                    {field.is_mapped ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">{field.description}</div>
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
      )}
    </div>
  );
}

// Governance Tab Component
function GovernanceTab({ metrics, loading }: any) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-6">Governance Metrics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600">Total Local Fields</p>
              <p className="text-2xl font-bold text-blue-900">{metrics.total_local_fields}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600">Mapped Fields</p>
              <p className="text-2xl font-bold text-green-900">{metrics.mapped_fields}</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-yellow-600">Mapping Rate</p>
              <p className="text-2xl font-bold text-yellow-900">{metrics.mapping_rate.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-600">Needs Review</p>
              <p className="text-2xl font-bold text-purple-900">{metrics.fields_needing_review}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Duplicate Candidates */}
      {metrics.duplicate_candidates && metrics.duplicate_candidates.length > 0 && (
        <div className="bg-orange-50 rounded-lg p-6">
          <h4 className="text-lg font-medium text-orange-900 mb-4">Duplicate Candidates</h4>
          <div className="space-y-3">
            {metrics.duplicate_candidates.slice(0, 5).map((candidate: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {candidate.field1.field_name} ↔ {candidate.field2.field_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Similarity: {(candidate.similarity * 100).toFixed(1)}%
                  </p>
                </div>
                <button className="text-orange-600 hover:text-orange-800 text-sm">
                  Review
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Data Dictionary Tab Component
function DataDictionaryTab({ dictionary, loading }: any) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!dictionary) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">Data Dictionary</h3>
        <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          <Download className="w-4 h-4" />
          <span>Export Dictionary</span>
        </button>
      </div>

      <div className="space-y-6">
        {Object.entries(dictionary).map(([domain, data]: [string, any]) => (
          <div key={domain} className="border border-gray-200 rounded-lg">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h4 className="text-lg font-medium text-gray-900 capitalize">{domain}</h4>
              <p className="text-sm text-gray-500">
                {data.total_fields} fields • {data.mapped_fields} mapped
              </p>
            </div>
            <div className="p-6">
              <div className="grid gap-4">
                {data.fields.map((field: any) => (
                  <div key={field.id} className="border border-gray-100 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-gray-900">{field.field_name}</span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {field.data_type}
                          </span>
                          {field.source === 'local' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Local
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{field.description}</p>
                        {field.tags && field.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {field.tags.map((tag: string) => (
                              <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-800">
                          <Eye className="w-4 h-4" />
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
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Add New Field</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <span className="sr-only">Close</span>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Field Name
            </label>
            <input
              type="text"
              value={field.field_name}
              onChange={(e) => setField({ ...field, field_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter field name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Type
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={field.description}
              onChange={(e) => setField({ ...field, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe the purpose of this field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Domain
            </label>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_pii"
                checked={field.is_pii}
                onChange={(e) => setField({ ...field, is_pii: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_pii" className="ml-2 text-sm text-gray-700">
                Contains PII
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_sensitive"
                checked={field.is_sensitive}
                onChange={(e) => setField({ ...field, is_sensitive: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_sensitive" className="ml-2 text-sm text-gray-700">
                Sensitive Data
              </label>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_financial"
              checked={field.is_financial}
              onChange={(e) => setField({ ...field, is_financial: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_financial" className="ml-2 text-sm text-gray-700">
              Financial Reporting Impact
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Similar Fields Found</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <span className="sr-only">Close</span>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {suggestions.map((suggestion: MetadataSuggestion) => (
            <div key={suggestion.field.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium text-gray-900">{suggestion.field.field_name}</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {(suggestion.confidence * 100).toFixed(0)}% match
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{suggestion.field.description}</p>
                  <p className="text-xs text-gray-500 mb-2">{suggestion.reasoning}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Used {suggestion.usage_stats.total_usage} times</span>
                    <span>• {suggestion.usage_stats.organizations_using} organizations</span>
                    <span>• {suggestion.field.domain} domain</span>
                  </div>
                </div>
                <button
                  onClick={() => onMap(suggestion.field.id)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Map to This
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Create New Field
          </button>
        </div>
      </div>
    </div>
  );
} 