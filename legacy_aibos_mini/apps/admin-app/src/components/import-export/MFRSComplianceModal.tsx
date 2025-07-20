'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  X, 
  Eye, 
  FileText, 
  Download,
  Settings,
  RefreshCw,
  Shield,
  BookOpen,
  TrendingUp,
  Users
} from 'lucide-react';
import { LuxuryModal } from '../ui/LuxuryModal';
import { LuxuryButton } from '../ui/LuxuryButton';
import { LuxuryTabs } from '../ui/LuxuryTabs';
import { AppleStyleTable } from '../ui/AppleStyleTable';
import { MetricCard } from '../ui/MetricCard';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  MFRSStandard, 
  ComplianceLevel, 
  ValidationResult,
  MFRSRule,
  ValidationViolation,
  DisclosureRequirement,
  GeneratedDisclosure,
  ComplianceReport,
  ValidationLogic
} from '@aibos/ledger-sdk';

interface MFRSComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
  complianceData: any;
  onComplianceUpdate: (data: any) => void;
}

const MFRSComplianceModal: React.FC<MFRSComplianceModalProps> = ({
  isOpen,
  onClose,
  complianceData,
  onComplianceUpdate
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [complianceReport, setComplianceReport] = useState<ComplianceReport | null>(null);
  const [violations, setViolations] = useState<ValidationViolation[]>([]);
  const [disclosures, setDisclosures] = useState<GeneratedDisclosure[]>([]);
  const [rules, setRules] = useState<MFRSRule[]>([]);
  const [selectedStandard, setSelectedStandard] = useState<MFRSStandard | ''>('');
  const [showValidationDetails, setShowValidationDetails] = useState(false);

  useEffect(() => {
    if (isOpen && complianceData) {
      loadComplianceData();
    }
  }, [isOpen, complianceData]);

  const loadComplianceData = async () => {
    setLoading(true);
    try {
      // Simulate loading compliance data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate mock compliance report
      const report: ComplianceReport = {
        tenant_id: 'current-tenant',
        compliance_score: complianceData.complianceScore || 85,
        total_violations: complianceData.issues?.length || 0,
        critical_violations: complianceData.issues?.filter((i: any) => i.severity === 'high').length || 0,
        high_violations: complianceData.issues?.filter((i: any) => i.severity === 'medium').length || 0,
        medium_violations: 0,
        low_violations: 0,
        total_disclosures: 12,
        mandatory_disclosures: 8,
        optional_disclosures: 4,
        violations_by_standard: generateViolationsByStandard(),
        disclosures_by_standard: generateDisclosuresByStandard(),
        recommendations: complianceData.recommendations || [],
        generated_at: new Date().toISOString()
      };
      
      setComplianceReport(report);
      setViolations(generateMockViolations());
      setDisclosures(generateMockDisclosures());
      setRules(generateMockRules());
    } catch (error) {
      console.error('Error loading compliance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateViolationsByStandard = () => {
    const violations: Record<string, number> = {};
    complianceData.issues?.forEach((issue: any) => {
      const standard = issue.mfrsStandard || 'MFRS 101';
      violations[standard] = (violations[standard] || 0) + 1;
    });
    return violations;
  };

  const generateDisclosuresByStandard = () => {
    return {
      'MFRS 101': 3,
      'MFRS 115': 2,
      'MFRS 109': 2,
      'MFRS 116': 1,
      'MFRS 112': 1,
      'MFRS 138': 1,
      'MFRS 136': 1,
      'MFRS 137': 1
    };
  };

  const generateMockViolations = (): ValidationViolation[] => {
    return complianceData.issues?.map((issue: any, index: number) => ({
      id: `violation_${index}`,
      rule_id: `rule_${index}`,
      rule_title: `MFRS Compliance Rule ${index + 1}`,
      standard: MFRSStandard.MFRS_101,
      compliance_level: issue.severity === 'high' ? ComplianceLevel.CRITICAL : ComplianceLevel.HIGH,
      message: issue.recommendation,
      details: { account_code: issue.accountCode, account_name: issue.accountName },
      transaction_id: undefined,
      account_id: issue.accountCode,
      amount: undefined,
      suggested_correction: issue.recommendation,
      created_at: new Date().toISOString()
    })) || [];
  };

  const generateMockDisclosures = (): GeneratedDisclosure[] => {
    return [
      {
        id: 'disc_001',
        requirement_id: 'req_001',
        standard: MFRSStandard.MFRS_101,
        title: 'Significant Accounting Policies',
        content: 'The entity applies the following significant accounting policies in accordance with MFRS...',
        disclosure_type: 'note',
        financial_period: '2024',
        tenant_id: 'current-tenant',
        generated_at: new Date().toISOString(),
        is_approved: true,
        approved_by: 'System',
        approved_at: new Date().toISOString()
      },
      {
        id: 'disc_002',
        requirement_id: 'req_002',
        standard: MFRSStandard.MFRS_115,
        title: 'Revenue Recognition',
        content: 'Revenue is recognized when performance obligations are satisfied...',
        disclosure_type: 'note',
        financial_period: '2024',
        tenant_id: 'current-tenant',
        generated_at: new Date().toISOString(),
        is_approved: false
      }
    ];
  };

  const generateMockRules = (): MFRSRule[] => {
    return [
      {
        id: 'rule_001',
        standard: MFRSStandard.MFRS_101,
        rule_code: 'MFRS101_001',
        title: 'Balance Sheet Classification',
        description: 'Assets and liabilities must be classified as current or non-current',
        compliance_level: ComplianceLevel.CRITICAL,
        validation_logic: JSON.stringify({
          type: 'account_balance',
          account_code: 'current_assets',
          condition: 'greater_than',
          threshold: 0
        }),
        parameters: {},
        effective_date: new Date().toISOString(),
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'rule_002',
        standard: MFRSStandard.MFRS_115,
        rule_code: 'MFRS115_001',
        title: 'Revenue Recognition',
        description: 'Revenue must be recognized when performance obligations are satisfied',
        compliance_level: ComplianceLevel.HIGH,
        validation_logic: JSON.stringify({
          type: 'transaction_type',
          transaction_types: ['revenue', 'sales']
        }),
        parameters: {},
        effective_date: new Date().toISOString(),
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  };

  const getComplianceScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getComplianceLevelColor = (level: ComplianceLevel) => {
    switch (level) {
      case ComplianceLevel.CRITICAL:
        return 'text-red-600 bg-red-100';
      case ComplianceLevel.HIGH:
        return 'text-orange-600 bg-orange-100';
      case ComplianceLevel.MEDIUM:
        return 'text-yellow-600 bg-yellow-100';
      case ComplianceLevel.LOW:
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Compliance Score Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">MFRS Compliance Score</h3>
        {complianceReport ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getComplianceScoreColor(complianceReport.compliance_score)}`}>
                {complianceReport.compliance_score}%
              </div>
              <div className="text-sm text-gray-600">Overall Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{complianceReport.critical_violations}</div>
              <div className="text-sm text-gray-600">Critical Issues</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{complianceReport.total_disclosures}</div>
              <div className="text-sm text-gray-600">Total Disclosures</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{complianceReport.mandatory_disclosures}</div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <LoadingSpinner />
            <p className="text-gray-600 mt-2">Loading compliance data...</p>
          </div>
        )}
      </div>

      {/* MFRS Standards Coverage */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">MFRS Standards Coverage</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(complianceReport?.violations_by_standard || {}).map(([standard, count]) => (
            <div key={standard} className="border rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm">{standard}</span>
                <span className={`px-2 py-1 text-xs rounded-full ${count > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                  {count} issues
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Violations */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Violations</h3>
        <div className="space-y-3">
          {violations.slice(0, 5).map((violation) => (
            <div key={violation.id} className="border-l-4 border-red-500 pl-4 py-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{violation.rule_title}</h4>
                  <p className="text-sm text-gray-600">{violation.message}</p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${getComplianceLevelColor(violation.compliance_level)}`}>
                    {violation.compliance_level}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(violation.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {complianceReport && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">MFRS Recommendations</h3>
          <ul className="space-y-2">
            {complianceReport.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span className="text-gray-700">{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const renderStandards = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">MFRS Standards</h3>
        <select 
          value={selectedStandard} 
          onChange={(e) => setSelectedStandard(e.target.value as MFRSStandard)}
          className="border rounded-lg px-3 py-2"
        >
          <option value="">All Standards</option>
          {Object.values(MFRSStandard).map((standard) => (
            <option key={standard} value={standard}>{standard}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(MFRSStandard)
          .filter(standard => !selectedStandard || standard === selectedStandard)
          .map((standard) => {
            const violationCount = complianceReport?.violations_by_standard[standard] || 0;
            const disclosureCount = complianceReport?.disclosures_by_standard[standard] || 0;
            
            return (
              <div key={standard} className="bg-white rounded-lg shadow p-6">
                <h4 className="font-semibold text-sm mb-2">{standard}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Violations:</span>
                    <span className={violationCount > 0 ? 'text-red-600' : 'text-green-600'}>
                      {violationCount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Disclosures:</span>
                    <span className="text-blue-600">{disclosureCount}</span>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );

  const renderDisclosures = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Generated Disclosures</h3>
        <Button onClick={() => {}}>
          Generate New Disclosures
        </Button>
      </div>

      <div className="space-y-4">
        {disclosures.map((disclosure) => (
          <div key={disclosure.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-semibold">{disclosure.title}</h4>
                <p className="text-sm text-gray-600">{disclosure.standard}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded-full ${disclosure.is_approved ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                  {disclosure.is_approved ? 'Approved' : 'Pending'}
                </span>
                <span className="text-xs text-gray-500">{disclosure.disclosure_type}</span>
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-4">{disclosure.content.substring(0, 200)}...</p>
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Generated: {new Date(disclosure.generated_at).toLocaleDateString()}</span>
              {disclosure.approved_by && (
                <span>Approved by: {disclosure.approved_by}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderValidation = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Validation Rules</h3>
        <Button onClick={() => setShowValidationDetails(!showValidationDetails)}>
          {showValidationDetails ? 'Hide Details' : 'Show Details'}
        </Button>
      </div>

      <div className="space-y-4">
        {rules.map((rule) => (
          <div key={rule.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-semibold">{rule.title}</h4>
                <p className="text-sm text-gray-600">{rule.description}</p>
                <p className="text-xs text-gray-500 mt-1">{rule.standard}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${getComplianceLevelColor(rule.compliance_level)}`}>
                {rule.compliance_level}
              </span>
            </div>
            
            {showValidationDetails && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h5 className="font-medium text-sm mb-2">Validation Logic:</h5>
                <pre className="text-xs text-gray-600 overflow-x-auto">
                  {JSON.stringify(JSON.parse(rule.validation_logic), null, 2)}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'standards', label: 'MFRS Standards', icon: '📋' },
    { id: 'disclosures', label: 'Disclosures', icon: '📄' },
    { id: 'validation', label: 'Validation Rules', icon: '🔍' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'standards':
        return renderStandards();
      case 'disclosures':
        return renderDisclosures();
      case 'validation':
        return renderValidation();
      default:
        return renderOverview();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">MFRS Compliance Review</h2>
          <p className="text-gray-600 mt-2">Comprehensive Malaysian Financial Reporting Standards compliance analysis</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <LoadingSpinner />
            <p className="text-gray-600 mt-4">Analyzing MFRS compliance...</p>
          </div>
        ) : (
          renderContent()
        )}

        {/* Footer */}
        <div className="mt-8 flex justify-end space-x-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => onComplianceUpdate(complianceData)}>
            Apply Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default MFRSComplianceModal; 