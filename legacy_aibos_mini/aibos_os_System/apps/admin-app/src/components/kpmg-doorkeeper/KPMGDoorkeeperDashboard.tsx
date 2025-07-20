import React, { useState, useEffect } from 'react';
import { 
  KPMGDoorkeeperService,
  DoorkeeperValidation,
  DoorkeeperReport,
  KPMGStandard,
  ValidationStatus,
  RiskLevel,
  DoorkeeperValidationType
} from '@aibos/ledger-sdk';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';

interface KPMGDoorkeeperDashboardProps {
  organizationId: string;
}

const KPMGDoorkeeperDashboard: React.FC<KPMGDoorkeeperDashboardProps> = ({ organizationId }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'validations' | 'reports' | 'settings'>('overview');
  const [loading, setLoading] = useState(false);
  const [doorkeeperService] = useState(() => new KPMGDoorkeeperService(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  // State
  const [currentReport, setCurrentReport] = useState<DoorkeeperReport | null>(null);
  const [recentValidations, setRecentValidations] = useState<DoorkeeperValidation[]>([]);
  const [criticalIssues, setCriticalIssues] = useState<any[]>([]);
  const [auditReadinessScore, setAuditReadinessScore] = useState(0);
  const [complianceScore, setComplianceScore] = useState(0);
  const [riskLevel, setRiskLevel] = useState<RiskLevel>(RiskLevel.LOW);

  // Modal states
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedValidation, setSelectedValidation] = useState<DoorkeeperValidation | null>(null);

  useEffect(() => {
    loadDoorkeeperData();
  }, [organizationId]);

  const loadDoorkeeperData = async () => {
    setLoading(true);
    try {
      // Generate current report
      const report = await doorkeeperService.generateDoorkeeperReport(
        organizationId,
        new Date().toISOString().slice(0, 7),
        'monthly'
      );
      setCurrentReport(report);
      setAuditReadinessScore(report.audit_readiness_score);
      setComplianceScore(report.overall_compliance_score);
      setRiskLevel(report.risk_assessment.overall_risk_level);
      setCriticalIssues(report.critical_issues);

      // Load recent validations (mock data for now)
      const mockValidations: DoorkeeperValidation[] = [
        {
          id: '1',
          transaction_id: 'TXN001',
          validation_type: DoorkeeperValidationType.TRANSACTION_ENTRY,
          kpmg_standard: KPMGStandard.FINANCIAL_REPORTING,
          validation_status: ValidationStatus.PASSED,
          risk_level: RiskLevel.LOW,
          compliance_score: 95,
          audit_notes: ['Transaction properly classified', 'Amounts accurate'],
          recommendations: [],
          kpmg_reference: 'KPMG-AUDIT-001',
          validated_at: new Date().toISOString(),
          validated_by: 'system',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          transaction_id: 'TXN002',
          validation_type: DoorkeeperValidationType.JOURNAL_POSTING,
          kpmg_standard: KPMGStandard.INTERNAL_CONTROLS,
          validation_status: ValidationStatus.FAILED,
          risk_level: RiskLevel.HIGH,
          compliance_score: 60,
          audit_notes: ['Segregation of duties issue detected'],
          recommendations: ['Review approval chain', 'Implement additional controls'],
          kpmg_reference: 'KPMG-IC-002',
          validated_at: new Date().toISOString(),
          validated_by: 'system',
          created_at: new Date().toISOString()
        }
      ];
      setRecentValidations(mockValidations);
    } catch (error) {
      console.error('Error loading Doorkeeper data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (level: RiskLevel) => {
    switch (level) {
      case RiskLevel.LOW: return 'bg-green-100 text-green-800';
      case RiskLevel.MEDIUM: return 'bg-yellow-100 text-yellow-800';
      case RiskLevel.HIGH: return 'bg-orange-100 text-orange-800';
      case RiskLevel.CRITICAL: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getValidationStatusColor = (status: ValidationStatus) => {
    switch (status) {
      case ValidationStatus.PASSED: return 'bg-green-100 text-green-800';
      case ValidationStatus.FAILED: return 'bg-red-100 text-red-800';
      case ValidationStatus.WARNING: return 'bg-yellow-100 text-yellow-800';
      case ValidationStatus.REQUIRES_REVIEW: return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Audit Readiness Score */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Audit Readiness Score</h3>
          <Badge className={getRiskLevelColor(riskLevel)}>
            {riskLevel.toUpperCase()} RISK
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className={`text-4xl font-bold ${getScoreColor(auditReadinessScore)}`}>
              {auditReadinessScore.toFixed(1)}%
            </div>
            <p className="text-sm text-gray-600">Audit Readiness</p>
          </div>
          <div className="text-center">
            <div className={`text-4xl font-bold ${getScoreColor(complianceScore)}`}>
              {complianceScore.toFixed(1)}%
            </div>
            <p className="text-sm text-gray-600">Compliance Score</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600">
              {recentValidations.length}
            </div>
            <p className="text-sm text-gray-600">Validations Today</p>
          </div>
        </div>
      </Card>

      {/* KPMG Standards Coverage */}
      {currentReport && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">KPMG Standards Coverage</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {currentReport.kpmg_standards_coverage.map((coverage) => (
              <div key={coverage.standard} className="text-center p-4 border rounded-lg">
                <div className={`text-2xl font-bold ${getScoreColor(coverage.compliance_score)}`}>
                  {coverage.compliance_score.toFixed(0)}%
                </div>
                <p className="text-sm font-medium">{coverage.standard.replace('_', ' ')}</p>
                <p className="text-xs text-gray-500">{coverage.validation_count} validations</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Critical Issues */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Critical Issues</h3>
          <Badge className="bg-red-100 text-red-800">
            {criticalIssues.length} Issues
          </Badge>
        </div>
        {criticalIssues.length > 0 ? (
          <div className="space-y-3">
            {criticalIssues.slice(0, 3).map((issue) => (
              <div key={issue.id} className="p-3 border border-red-200 rounded-lg bg-red-50">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-red-800">{issue.issue_type}</h4>
                  <Badge className="bg-red-100 text-red-800">
                    {issue.risk_level.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-red-700 mt-1">{issue.description}</p>
                <p className="text-xs text-red-600 mt-2">Deadline: {new Date(issue.deadline).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-green-600 text-center py-4">No critical issues found! 🎉</p>
        )}
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button 
            onClick={() => setShowReportModal(true)}
            className="flex flex-col items-center p-4 h-auto"
          >
            <span className="text-2xl mb-2">📊</span>
            <span className="text-sm">Generate Report</span>
          </Button>
          <Button 
            variant="outline"
            className="flex flex-col items-center p-4 h-auto"
          >
            <span className="text-2xl mb-2">🔍</span>
            <span className="text-sm">Review Issues</span>
          </Button>
          <Button 
            variant="outline"
            className="flex flex-col items-center p-4 h-auto"
          >
            <span className="text-2xl mb-2">⚙️</span>
            <span className="text-sm">Settings</span>
          </Button>
          <Button 
            variant="outline"
            className="flex flex-col items-center p-4 h-auto"
          >
            <span className="text-2xl mb-2">📧</span>
            <span className="text-sm">Export Report</span>
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderValidationsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Recent Validations</h3>
        <Button onClick={() => setShowValidationModal(true)}>View All</Button>
      </div>

      <Table>
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>Validation Type</th>
            <th>KPMG Standard</th>
            <th>Status</th>
            <th>Risk Level</th>
            <th>Score</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {recentValidations.map((validation) => (
            <tr key={validation.id}>
              <td>{validation.transaction_id}</td>
              <td>{validation.validation_type.replace('_', ' ')}</td>
              <td>{validation.kpmg_standard.replace('_', ' ')}</td>
              <td>
                <Badge className={getValidationStatusColor(validation.validation_status)}>
                  {validation.validation_status.toUpperCase()}
                </Badge>
              </td>
              <td>
                <Badge className={getRiskLevelColor(validation.risk_level)}>
                  {validation.risk_level.toUpperCase()}
                </Badge>
              </td>
              <td>
                <span className={`font-semibold ${getScoreColor(validation.compliance_score)}`}>
                  {validation.compliance_score}%
                </span>
              </td>
              <td>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    setSelectedValidation(validation);
                    setShowValidationModal(true);
                  }}
                >
                  View Details
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );

  const renderReportsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">KPMG Doorkeeper Reports</h3>
        <Button onClick={() => setShowReportModal(true)}>Generate New Report</Button>
      </div>

      {currentReport && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-semibold">Latest Report</h4>
            <Badge className="bg-blue-100 text-blue-800">
              {currentReport.report_type.toUpperCase()}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Period</p>
              <p className="font-semibold">{currentReport.report_period}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Generated</p>
              <p className="font-semibold">{new Date(currentReport.generated_at).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Compliance Score</p>
              <p className={`font-semibold ${getScoreColor(currentReport.overall_compliance_score)}`}>
                {currentReport.overall_compliance_score.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Audit Readiness</p>
              <p className={`font-semibold ${getScoreColor(currentReport.audit_readiness_score)}`}>
                {currentReport.audit_readiness_score.toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h5 className="font-semibold">Recommendations</h5>
            {currentReport.recommendations.map((rec, index) => (
              <div key={index} className="p-2 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-800">• {rec}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">KPMG Doorkeeper Settings</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Auto Validation</label>
            <div className="flex items-center">
              <input type="checkbox" defaultChecked className="mr-2" />
              <span className="text-sm">Enable automatic validation for all transactions</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Critical Issue Alerts</label>
            <div className="flex items-center">
              <input type="checkbox" defaultChecked className="mr-2" />
              <span className="text-sm">Send alerts for critical compliance issues</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">KPMG Standards</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(KPMGStandard).map((standard) => (
                <div key={standard} className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-2" />
                  <span className="text-sm">{standard.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Risk Thresholds</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-gray-600">Low</label>
                <input type="number" defaultValue={0} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-xs text-gray-600">Medium</label>
                <input type="number" defaultValue={25} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-xs text-gray-600">High</label>
                <input type="number" defaultValue={50} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-xs text-gray-600">Critical</label>
                <input type="number" defaultValue={75} className="w-full p-2 border rounded" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Button>Save Settings</Button>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">KPMG Doorkeeper</h2>
          <p className="text-gray-600">Real-time audit readiness monitoring</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={activeTab === 'overview' ? 'default' : 'outline'}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </Button>
          <Button 
            variant={activeTab === 'validations' ? 'default' : 'outline'}
            onClick={() => setActiveTab('validations')}
          >
            Validations
          </Button>
          <Button 
            variant={activeTab === 'reports' ? 'default' : 'outline'}
            onClick={() => setActiveTab('reports')}
          >
            Reports
          </Button>
          <Button 
            variant={activeTab === 'settings' ? 'default' : 'outline'}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </Button>
        </div>
      </div>

      {loading && <LoadingSpinner />}

      {!loading && (
        <>
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'validations' && renderValidationsTab()}
          {activeTab === 'reports' && renderReportsTab()}
          {activeTab === 'settings' && renderSettingsTab()}
        </>
      )}

      {/* Validation Details Modal */}
      <Modal isOpen={showValidationModal} onClose={() => setShowValidationModal(false)}>
        <div className="p-6 max-w-2xl">
          <h3 className="text-lg font-semibold mb-4">Validation Details</h3>
          {selectedValidation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Transaction ID</p>
                  <p className="font-semibold">{selectedValidation.transaction_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Validation Type</p>
                  <p className="font-semibold">{selectedValidation.validation_type.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">KPMG Standard</p>
                  <p className="font-semibold">{selectedValidation.kpmg_standard.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Compliance Score</p>
                  <p className={`font-semibold ${getScoreColor(selectedValidation.compliance_score)}`}>
                    {selectedValidation.compliance_score}%
                  </p>
                </div>
              </div>

              {selectedValidation.audit_notes.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Audit Notes</h4>
                  <div className="space-y-2">
                    {selectedValidation.audit_notes.map((note, index) => (
                      <div key={index} className="p-2 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-sm text-blue-800">{note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedValidation.recommendations.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Recommendations</h4>
                  <div className="space-y-2">
                    {selectedValidation.recommendations.map((rec, index) => (
                      <div key={index} className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-sm text-yellow-800">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600">KPMG Reference</p>
                <p className="font-mono text-sm">{selectedValidation.kpmg_reference}</p>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowValidationModal(false)}>Close</Button>
            <Button>Export Details</Button>
          </div>
        </div>
      </Modal>

      {/* Report Modal */}
      <Modal isOpen={showReportModal} onClose={() => setShowReportModal(false)}>
        <div className="p-6 max-w-4xl">
          <h3 className="text-lg font-semibold mb-4">KPMG Doorkeeper Report</h3>
          {currentReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Report Type</p>
                  <p className="font-semibold">{currentReport.report_type.toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Period</p>
                  <p className="font-semibold">{currentReport.report_period}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Compliance Score</p>
                  <p className={`font-semibold ${getScoreColor(currentReport.overall_compliance_score)}`}>
                    {currentReport.overall_compliance_score.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Audit Readiness</p>
                  <p className={`font-semibold ${getScoreColor(currentReport.audit_readiness_score)}`}>
                    {currentReport.audit_readiness_score.toFixed(1)}%
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Risk Assessment</h4>
                <div className="p-3 bg-gray-50 border rounded">
                  <p className="text-sm">
                    <strong>Overall Risk Level:</strong> {currentReport.risk_assessment.overall_risk_level.toUpperCase()}
                  </p>
                  <p className="text-sm">
                    <strong>Risk Score:</strong> {currentReport.risk_assessment.risk_score}/10
                  </p>
                  <p className="text-sm">
                    <strong>Trend:</strong> {currentReport.risk_assessment.risk_trend}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Critical Issues</h4>
                {currentReport.critical_issues.length > 0 ? (
                  <div className="space-y-2">
                    {currentReport.critical_issues.map((issue) => (
                      <div key={issue.id} className="p-3 border border-red-200 rounded bg-red-50">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-red-800">{issue.issue_type}</h5>
                          <Badge className="bg-red-100 text-red-800">
                            {issue.risk_level.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-red-700 mt-1">{issue.description}</p>
                        <p className="text-xs text-red-600 mt-2">Deadline: {new Date(issue.deadline).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-green-600 text-center py-4">No critical issues found! 🎉</p>
                )}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowReportModal(false)}>Close</Button>
            <Button onClick={() => window.print()}>Print Report</Button>
            <Button>Export PDF</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default KPMGDoorkeeperDashboard; 