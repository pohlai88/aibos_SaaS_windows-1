'use client';

import React, { useState } from 'react';
import { useMetadataTerms } from '../hooks/useMetadataTerms';
import { 
  Database, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Search, 
  Filter,
  Eye,
  EyeOff,
  RefreshCw,
  BarChart3,
  Tag,
  Hash,
  Zap,
  Link,
  Unlink,
  Settings,
  FileText,
  Globe,
  Lock,
  Unlock
} from 'lucide-react';

interface MetadataIntegrationPanelProps {
  organizationId: string;
  supabaseUrl: string;
  supabaseKey: string;
}

export default function MetadataIntegrationPanel({
  organizationId,
  supabaseUrl,
  supabaseKey
}: MetadataIntegrationPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'terms' | 'integration' | 'validation'>('overview');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const {
    terms,
    groupedTerms,
    loading,
    error,
    stats,
    searchTerms,
    getTermsByDomain,
    validateDataAgainstTerm,
    getTermByPrefix,
    generateTermPrefix,
    refresh
  } = useMetadataTerms({
    organizationId,
    supabaseUrl,
    supabaseKey
  });

  const [testData, setTestData] = useState({
    term_prefix: '',
    test_value: '',
    validation_result: null as { isValid: boolean; errors: string[] } | null
  });

  const handleTestValidation = async () => {
    if (!testData.term_prefix || !testData.test_value) return;

    const term = await getTermByPrefix(testData.term_prefix);
    if (term) {
      const result = validateDataAgainstTerm(testData.test_value, term.id);
      setTestData(prev => ({ ...prev, validation_result: result }));
    }
  };

  const getDomainColor = (domain: string) => {
    const colors: Record<string, string> = {
      accounting: 'bg-blue-100 text-blue-800',
      finance: 'bg-green-100 text-green-800',
      hr: 'bg-purple-100 text-purple-800',
      sales: 'bg-orange-100 text-orange-800',
      marketing: 'bg-pink-100 text-pink-800',
      operations: 'bg-indigo-100 text-indigo-800',
      compliance: 'bg-red-100 text-red-800',
      customer: 'bg-teal-100 text-teal-800',
      vendor: 'bg-amber-100 text-amber-800',
      employee: 'bg-cyan-100 text-cyan-800',
      inventory: 'bg-emerald-100 text-emerald-800',
      project: 'bg-violet-100 text-violet-800',
      reporting: 'bg-rose-100 text-rose-800',
      audit: 'bg-slate-100 text-slate-800',
      tax: 'bg-lime-100 text-lime-800',
      general: 'bg-gray-100 text-gray-800'
    };
    return colors[domain] || colors.general;
  };

  const getSecurityLevelIcon = (level: string) => {
    switch (level) {
      case 'restricted': return <Lock className="h-4 w-4 text-red-500" />;
      case 'confidential': return <Shield className="h-4 w-4 text-orange-500" />;
      case 'internal': return <Eye className="h-4 w-4 text-blue-500" />;
      case 'public': return <Globe className="h-4 w-4 text-green-500" />;
      default: return <Eye className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-32">
          <RefreshCw className="h-8 w-8 animate-spin text-primary-600" />
          <span className="ml-2 text-gray-600">Loading metadata integration...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-32 text-red-600">
          <AlertCircle className="h-8 w-8 mr-2" />
          <span>Error: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Database className="h-5 w-5" />
              Metadata Integration
            </h2>
            <p className="text-gray-600">Connect metadata registry with data governance and database</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refresh}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              {showAdvanced ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'overview', name: 'Overview', icon: BarChart3 },
            { id: 'terms', name: 'Metadata Terms', icon: Tag },
            { id: 'integration', name: 'Integration', icon: Link },
            { id: 'validation', name: 'Validation', icon: CheckCircle }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Terms</p>
                    <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                  </div>
                  <Database className="h-8 w-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Active Terms</p>
                    <p className="text-2xl font-bold text-green-900">{stats.active}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Domains</p>
                    <p className="text-2xl font-bold text-purple-900">{stats.domains.length}</p>
                  </div>
                  <Globe className="h-8 w-8 text-purple-500" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">Compliance Score</p>
                    <p className="text-2xl font-bold text-orange-900">{stats.compliance_average}/10</p>
                  </div>
                  <Shield className="h-8 w-8 text-orange-500" />
                </div>
              </div>
            </div>

            {/* Domain Breakdown */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Terms by Domain</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(groupedTerms).map(([domain, data]) => (
                  <div key={domain} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDomainColor(domain)}`}>
                        {domain.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-500">{data.count} terms</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Compliance Score:</span>
                        <span className="font-medium">{data.compliance_score.toFixed(1)}/10</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full" 
                          style={{ width: `${(data.compliance_score / 10) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'terms' && (
          <div className="space-y-4">
            {/* Search and Filter */}
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search terms by name, prefix, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Domains</option>
                {stats.domains.map(domain => (
                  <option key={domain} value={domain}>{domain.toUpperCase()}</option>
                ))}
              </select>
            </div>

            {/* Terms List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {terms
                .filter(term => 
                  (selectedDomain === 'all' || term.domain === selectedDomain) &&
                  (searchQuery === '' || 
                    term.term_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    term.term_prefix.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    term.display_name.toLowerCase().includes(searchQuery.toLowerCase()))
                )
                .map(term => (
                  <div key={term.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">{term.display_name}</span>
                          <span className="text-sm text-gray-500 font-mono">{term.term_prefix}</span>
                          {getSecurityLevelIcon(term.security_level)}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{term.description}</p>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDomainColor(term.domain)}`}>
                            {term.domain.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500">{term.data_type}</span>
                          {term.is_pii && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              PII
                            </span>
                          )}
                          {term.is_sensitive && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              SENSITIVE
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          term.status === 'active' ? 'bg-green-100 text-green-800' :
                          term.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {term.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {activeTab === 'integration' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-blue-900 mb-2">Integration Status</h3>
              <p className="text-blue-700">
                This panel demonstrates how metadata terms integrate with data governance and database systems.
                The term prefix system ensures consistency across all components.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Metadata Registry */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Database className="h-5 w-5 text-blue-500" />
                  <h4 className="font-medium text-gray-900">Metadata Registry</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Terms:</span>
                    <span className="font-medium">{stats.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Terms:</span>
                    <span className="font-medium">{stats.active}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Domains:</span>
                    <span className="font-medium">{stats.domains.length}</span>
                  </div>
                </div>
              </div>

              {/* Data Governance */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-5 w-5 text-green-500" />
                  <h4 className="font-medium text-gray-900">Data Governance</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Compliance Score:</span>
                    <span className="font-medium">{stats.compliance_average}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PII Terms:</span>
                    <span className="font-medium">{terms.filter(t => t.is_pii).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sensitive Terms:</span>
                    <span className="font-medium">{terms.filter(t => t.is_sensitive).length}</span>
                  </div>
                </div>
              </div>

              {/* Database Integration */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Link className="h-5 w-5 text-purple-500" />
                  <h4 className="font-medium text-gray-900">Database Integration</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Mapped Fields:</span>
                    <span className="font-medium">{stats.active}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Validation Rules:</span>
                    <span className="font-medium">{terms.reduce((acc, t) => acc + t.validation_rules.length, 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Prefix System:</span>
                    <span className="font-medium text-green-600">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'validation' && (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-green-900 mb-2">Data Validation Testing</h3>
              <p className="text-green-700">
                Test how data validates against metadata terms using the prefix system.
                This ensures type safety and prevents errors in your CID dashboard.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Test Input */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Test Validation</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Term Prefix
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., term_customer_email"
                      value={testData.term_prefix}
                      onChange={(e) => setTestData(prev => ({ ...prev, term_prefix: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Test Value
                    </label>
                    <input
                      type="text"
                      placeholder="Enter value to test"
                      value={testData.test_value}
                      onChange={(e) => setTestData(prev => ({ ...prev, test_value: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={handleTestValidation}
                    disabled={!testData.term_prefix || !testData.test_value}
                    className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Zap className="h-4 w-4 inline mr-2" />
                    Test Validation
                  </button>
                </div>
              </div>

              {/* Validation Result */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Validation Result</h4>
                {testData.validation_result ? (
                  <div className={`p-4 rounded-lg border ${
                    testData.validation_result.isValid 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {testData.validation_result.isValid ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span className={`font-medium ${
                        testData.validation_result.isValid ? 'text-green-900' : 'text-red-900'
                      }`}>
                        {testData.validation_result.isValid ? 'Valid' : 'Invalid'}
                      </span>
                    </div>
                    {testData.validation_result.errors.length > 0 && (
                      <ul className="text-sm text-red-700 space-y-1">
                        {testData.validation_result.errors.map((error, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-red-500 mt-1">•</span>
                            {error}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-gray-500 text-sm">
                      Enter a term prefix and test value to validate data against metadata terms.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 