import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Globe, 
  Clock, 
  Users, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  PieChart,
  BarChart3,
  Calendar,
  MapPin,
  DollarSign,
  Shield,
  Eye,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Settings,
  RefreshCw
} from 'lucide-react';

interface Entity {
  id: string;
  name: string;
  legal_name: string;
  entity_type: string;
  country_code: string;
  parent_entity_id?: string;
  registration_number: string;
  tax_id?: string;
  industry_sector: string;
  ownership_type: string;
  status: string;
  compliance_score?: number;
  risk_score?: number;
  timezone: string;
  reporting_currency: string;
  direct_company: boolean;
  associate_type?: string;
  created_at: string;
  updated_at: string;
}

interface ConsolidationGroup {
  id: string;
  name: string;
  consolidation_method: string;
  reporting_currency: string;
  timezone: string;
  fiscal_year_end: string;
  consolidation_entities: string[];
}

interface ComplianceStats {
  total_entities: number;
  compliant_entities: number;
  non_compliant_entities: number;
  pending_approval: number;
  by_country: Record<string, number>;
  by_industry: Record<string, number>;
  upcoming_deadlines: any[];
}

const MultiEntityDashboard: React.FC = () => {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [consolidationGroups, setConsolidationGroups] = useState<ConsolidationGroup[]>([]);
  const [complianceStats, setComplianceStats] = useState<ComplianceStats | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCountry, setFilterCountry] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockEntities: Entity[] = [
      {
        id: '1',
        name: 'AIBOS Malaysia Sdn Bhd',
        legal_name: 'AIBOS Malaysia Sdn Bhd',
        entity_type: 'PrivateCompany',
        country_code: 'MY',
        registration_number: '202001234567',
        tax_id: '123456789012',
        industry_sector: 'Technology',
        ownership_type: 'Private',
        status: 'Active',
        compliance_score: 95,
        risk_score: 15,
        timezone: 'GMT+8',
        reporting_currency: 'MYR',
        direct_company: true,
        associate_type: 'Direct',
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      },
      {
        id: '2',
        name: 'AIBOS Singapore Pte Ltd',
        legal_name: 'AIBOS Singapore Pte Ltd',
        entity_type: 'PrivateCompany',
        country_code: 'SG',
        registration_number: '202012345A',
        tax_id: '12345678A',
        industry_sector: 'Technology',
        ownership_type: 'Private',
        status: 'Active',
        compliance_score: 98,
        risk_score: 10,
        timezone: 'GMT+8',
        reporting_currency: 'SGD',
        direct_company: true,
        associate_type: 'Direct',
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      },
      {
        id: '3',
        name: 'AIBOS Thailand Co Ltd',
        legal_name: 'AIBOS Thailand Co Ltd',
        entity_type: 'PrivateCompany',
        country_code: 'TH',
        parent_entity_id: '1',
        registration_number: '0123456789012',
        tax_id: '1234567890123',
        industry_sector: 'Technology',
        ownership_type: 'Private',
        status: 'Active',
        compliance_score: 87,
        risk_score: 25,
        timezone: 'GMT+8',
        reporting_currency: 'THB',
        direct_company: false,
        associate_type: 'Subsidiary',
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      }
    ];

    const mockGroups: ConsolidationGroup[] = [
      {
        id: '1',
        name: 'AIBOS SEA Group',
        consolidation_method: 'Full',
        reporting_currency: 'USD',
        timezone: 'GMT+8',
        fiscal_year_end: '2024-12-31',
        consolidation_entities: ['1', '2', '3']
      }
    ];

    const mockStats: ComplianceStats = {
      total_entities: 3,
      compliant_entities: 2,
      non_compliant_entities: 1,
      pending_approval: 0,
      by_country: { MY: 1, SG: 1, TH: 1 },
      by_industry: { Technology: 3 },
      upcoming_deadlines: []
    };

    setEntities(mockEntities);
    setConsolidationGroups(mockGroups);
    setComplianceStats(mockStats);
    setLoading(false);
  }, []);

  const filteredEntities = entities.filter(entity => {
    const matchesSearch = entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entity.legal_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = filterCountry === 'all' || entity.country_code === filterCountry;
    const matchesStatus = filterStatus === 'all' || entity.status === filterStatus;
    
    return matchesSearch && matchesCountry && matchesStatus;
  });

  const getCountryFlag = (countryCode: string) => {
    const flags: Record<string, string> = {
      'MY': '🇲🇾',
      'SG': '🇸🇬',
      'TH': '🇹🇭',
      'ID': '🇮🇩',
      'PH': '🇵🇭',
      'VN': '🇻🇳',
      'BN': '🇧🇳',
      'KH': '🇰🇭',
      'LA': '🇱🇦',
      'MM': '🇲🇲'
    };
    return flags[countryCode] || '🌍';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-green-600 bg-green-100';
      case 'PendingApproval': return 'text-yellow-600 bg-yellow-100';
      case 'Suspended': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Building2 className="h-8 w-8 text-blue-600" />
              Multi-Entity Governance
            </h1>
            <p className="text-gray-600 mt-2">
              Unified management for Southeast Asian business consolidation
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-secondary flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import
            </button>
            <button className="btn-primary flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Entity
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Entities</p>
              <p className="text-2xl font-bold text-gray-900">{complianceStats?.total_entities}</p>
            </div>
            <Building2 className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Compliant</p>
              <p className="text-2xl font-bold text-green-600">{complianceStats?.compliant_entities}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Non-Compliant</p>
              <p className="text-2xl font-bold text-red-600">{complianceStats?.non_compliant_entities}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Approval</p>
              <p className="text-2xl font-bold text-yellow-600">{complianceStats?.pending_approval}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: PieChart },
              { id: 'entities', label: 'Entities', icon: Building2 },
              { id: 'consolidation', label: 'Consolidation', icon: TrendingUp },
              { id: 'compliance', label: 'Compliance', icon: Shield },
              { id: 'relationships', label: 'Relationships', icon: Users },
              { id: 'reports', label: 'Reports', icon: FileText }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Entity Distribution by Country */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Entities by Country
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(complianceStats?.by_country || {}).map(([country, count]) => (
                      <div key={country} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getCountryFlag(country)}</span>
                          <span className="font-medium">{country}</span>
                        </div>
                        <span className="text-gray-600">{count} entities</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Entity Distribution by Industry */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Entities by Industry
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(complianceStats?.by_industry || {}).map(([industry, count]) => (
                      <div key={industry} className="flex items-center justify-between">
                        <span className="font-medium">{industry}</span>
                        <span className="text-gray-600">{count} entities</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Timezone Standardization */}
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Timezone Standardization
                </h3>
                <p className="text-blue-800 mb-4">
                  All entities standardized to <strong>GMT+8</strong> for consistent reporting and consolidation.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">GMT+8</div>
                    <div className="text-sm text-gray-600">Standard Timezone</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">100%</div>
                    <div className="text-sm text-gray-600">Compliance</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">Unified</div>
                    <div className="text-sm text-gray-600">Reporting</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Entities Tab */}
          {activeTab === 'entities' && (
            <div className="space-y-6">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search entities..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <select
                  value={filterCountry}
                  onChange={(e) => setFilterCountry(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Countries</option>
                  <option value="MY">Malaysia</option>
                  <option value="SG">Singapore</option>
                  <option value="TH">Thailand</option>
                  <option value="ID">Indonesia</option>
                  <option value="PH">Philippines</option>
                  <option value="VN">Vietnam</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="Active">Active</option>
                  <option value="PendingApproval">Pending Approval</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>

              {/* Entities Table */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Entity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Country
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Compliance
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Currency
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredEntities.map((entity) => (
                        <tr key={entity.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{entity.name}</div>
                              <div className="text-sm text-gray-500">{entity.legal_name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{getCountryFlag(entity.country_code)}</span>
                              <span className="text-sm text-gray-900">{entity.country_code}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{entity.entity_type}</div>
                            <div className="text-sm text-gray-500">{entity.associate_type}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(entity.status)}`}>
                              {entity.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-medium ${getComplianceColor(entity.compliance_score || 0)}`}>
                                {entity.compliance_score}%
                              </span>
                              {entity.compliance_score >= 90 ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : entity.compliance_score >= 80 ? (
                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-900">{entity.reporting_currency}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => setSelectedEntity(entity)}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-900">
                              <Settings className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Consolidation Tab */}
          {activeTab === 'consolidation' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {consolidationGroups.map((group) => (
                  <div key={group.id} className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{group.name}</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Method:</span>
                        <span className="font-medium">{group.consolidation_method}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Currency:</span>
                        <span className="font-medium">{group.reporting_currency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Timezone:</span>
                        <span className="font-medium">{group.timezone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fiscal Year End:</span>
                        <span className="font-medium">{group.fiscal_year_end}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Entities:</span>
                        <span className="font-medium">{group.consolidation_entities.length}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compliance Tab */}
          {activeTab === 'compliance' && (
            <div className="space-y-6">
              <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                <h3 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Compliance Alerts
                </h3>
                <p className="text-yellow-800">
                  {complianceStats?.non_compliant_entities} entities require attention for compliance issues.
                </p>
              </div>
            </div>
          )}

          {/* Relationships Tab */}
          {activeTab === 'relationships' && (
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Entity Relationships
                </h3>
                <p className="text-blue-800">
                  Clear hierarchy showing parent-subsidiary relationships and ownership structures.
                </p>
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Consolidated Reports
                </h3>
                <p className="text-green-800">
                  Generate unified reports across all entities with standardized timezone and currency.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Entity Detail Modal */}
      {selectedEntity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">{selectedEntity.name}</h2>
                <button
                  onClick={() => setSelectedEntity(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Legal Name</label>
                  <p className="text-gray-900">{selectedEntity.legal_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Country</label>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getCountryFlag(selectedEntity.country_code)}</span>
                    <span className="text-gray-900">{selectedEntity.country_code}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Entity Type</label>
                  <p className="text-gray-900">{selectedEntity.entity_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedEntity.status)}`}>
                    {selectedEntity.status}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Compliance Score</label>
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${getComplianceColor(selectedEntity.compliance_score || 0)}`}>
                      {selectedEntity.compliance_score}%
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Reporting Currency</label>
                  <p className="text-gray-900">{selectedEntity.reporting_currency}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Timezone</label>
                  <p className="text-gray-900">{selectedEntity.timezone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Direct Company</label>
                  <p className="text-gray-900">{selectedEntity.direct_company ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiEntityDashboard; 