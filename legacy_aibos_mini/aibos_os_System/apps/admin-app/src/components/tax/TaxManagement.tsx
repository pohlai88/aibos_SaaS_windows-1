import React, { useState, useEffect } from 'react';
import { 
  MalaysianTaxService, 
  MalaysianTaxType,
  SSTReturn,
  MTDCalculation,
  CP204Schedule,
  TaxProvision,
  TaxReport,
  TaxValidationError,
  MALAYSIAN_TAX_RATES
} from '@aibos/ledger-sdk';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';

interface TaxManagementProps {
  organizationId: string;
}

const TaxManagement: React.FC<TaxManagementProps> = ({ organizationId }) => {
  const [activeTab, setActiveTab] = useState<'sst' | 'mtd' | 'cp204' | 'mfrs112' | 'reports'>('sst');
  const [loading, setLoading] = useState(false);
  const [taxService] = useState(() => new MalaysianTaxService(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  // SST State
  const [sstPeriod, setSstPeriod] = useState(new Date().toISOString().slice(0, 7));
  const [sstReturn, setSstReturn] = useState<SSTReturn | null>(null);
  const [sstTransactions, setSstTransactions] = useState<any[]>([]);

  // MTD State
  const [mtdPeriod, setMtdPeriod] = useState(new Date().toISOString().slice(0, 7));
  const [mtdCalculations, setMtdCalculations] = useState<MTDCalculation[]>([]);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    monthlyIncome: 0,
    cumulativeIncome: 0
  });

  // CP204 State
  const [cp204Year, setCp204Year] = useState(new Date().getFullYear());
  const [cp204Schedule, setCp204Schedule] = useState<CP204Schedule | null>(null);
  const [estimatedTax, setEstimatedTax] = useState(0);

  // MFRS 112 State
  const [mfrsPeriod, setMfrsPeriod] = useState(new Date().toISOString().slice(0, 7));
  const [taxProvision, setTaxProvision] = useState<TaxProvision | null>(null);
  const [deferredTax, setDeferredTax] = useState<any>(null);

  // Reports State
  const [taxReports, setTaxReports] = useState<TaxReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<TaxReport | null>(null);

  // Modal States
  const [showSSTModal, setShowSSTModal] = useState(false);
  const [showMTDModal, setShowMTDModal] = useState(false);
  const [showCP204Modal, setShowCP204Modal] = useState(false);
  const [showMFRSModal, setShowMFRSModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    loadTaxData();
  }, [activeTab, organizationId]);

  const loadTaxData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'sst':
          await loadSSTData();
          break;
        case 'mtd':
          await loadMTDData();
          break;
        case 'cp204':
          await loadCP204Data();
          break;
        case 'mfrs112':
          await loadMFRS112Data();
          break;
        case 'reports':
          await loadTaxReports();
          break;
      }
    } catch (error) {
      console.error('Error loading tax data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSSTData = async () => {
    const sstReturnData = await taxService.calculateSSTReturn(organizationId, sstPeriod);
    setSstReturn(sstReturnData);
  };

  const loadMTDData = async () => {
    // In practice, this would fetch from database
    const mockMTDData: MTDCalculation[] = [
      {
        employee_id: '1',
        employee_name: 'John Doe',
        monthly_income: 8000,
        cumulative_income: 24000,
        tax_rate: 0.03,
        mtd_amount: 240,
        cumulative_mtd: 720,
        month: mtdPeriod,
        organization_id: organizationId
      }
    ];
    setMtdCalculations(mockMTDData);
  };

  const loadCP204Data = async () => {
    // In practice, this would fetch from database
    if (estimatedTax > 0) {
      const schedule = taxService.calculateCP204Schedule(organizationId, cp204Year, estimatedTax);
      setCp204Schedule(schedule);
    }
  };

  const loadMFRS112Data = async () => {
    const provision = await taxService.generateTaxProvision(organizationId, mfrsPeriod);
    setTaxProvision(provision);
  };

  const loadTaxReports = async () => {
    // In practice, this would fetch from database
    const mockReports: TaxReport[] = [
      {
        id: '1',
        organization_id: organizationId,
        period: '2024-01',
        report_type: 'SST',
        generated_at: new Date().toISOString(),
        data: {},
        compliance_status: 'compliant',
        validation_errors: []
      }
    ];
    setTaxReports(mockReports);
  };

  const calculateMTD = () => {
    const calculation = taxService.calculateMTD(newEmployee.monthlyIncome, newEmployee.cumulativeIncome);
    setMtdCalculations(prev => [...prev, { ...calculation, employee_name: newEmployee.name }]);
    setNewEmployee({ name: '', monthlyIncome: 0, cumulativeIncome: 0 });
  };

  const generateTaxReport = async (reportType: 'SST' | 'MTD' | 'CP204' | 'MFRS112' | 'COMPREHENSIVE') => {
    setLoading(true);
    try {
      const report = await taxService.generateTaxReport(organizationId, sstPeriod, reportType);
      setSelectedReport(report);
      setShowReportModal(true);
    } catch (error) {
      console.error('Error generating tax report:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateCompliance = async () => {
    setLoading(true);
    try {
      const errors = await taxService.validateTaxCompliance(organizationId, sstPeriod);
      if (errors.length > 0) {
        alert(`Found ${errors.length} compliance issues. Check the reports tab for details.`);
      } else {
        alert('All tax compliance checks passed!');
      }
    } catch (error) {
      console.error('Error validating compliance:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderSSTTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Sales & Service Tax (SST)</h3>
        <div className="flex gap-2">
          <Input
            type="month"
            value={sstPeriod}
            onChange={(e) => setSstPeriod(e.target.value)}
            className="w-40"
          />
          <Button onClick={() => setShowSSTModal(true)}>Add Transaction</Button>
          <Button onClick={validateCompliance} variant="outline">Validate Compliance</Button>
        </div>
      </div>

      {sstReturn && (
        <Card className="p-6">
          <h4 className="text-md font-semibold mb-4">SST Return Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Output Tax</p>
              <p className="text-lg font-semibold">RM {sstReturn.output_tax.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Input Tax</p>
              <p className="text-lg font-semibold">RM {sstReturn.input_tax.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Net Tax Payable</p>
              <p className="text-lg font-semibold text-blue-600">RM {sstReturn.net_tax_payable.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Due Date</p>
              <p className="text-lg font-semibold">{new Date(sstReturn.due_date).toLocaleDateString()}</p>
            </div>
          </div>
        </Card>
      )}

      <Button onClick={() => generateTaxReport('SST')} disabled={loading}>
        {loading ? <LoadingSpinner /> : 'Generate SST Report'}
      </Button>
    </div>
  );

  const renderMTDTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Monthly Tax Deduction (MTD)</h3>
        <div className="flex gap-2">
          <Input
            type="month"
            value={mtdPeriod}
            onChange={(e) => setMtdPeriod(e.target.value)}
            className="w-40"
          />
          <Button onClick={() => setShowMTDModal(true)}>Add Employee</Button>
        </div>
      </div>

      <Table>
        <thead>
          <tr>
            <th>Employee</th>
            <th>Monthly Income</th>
            <th>Cumulative Income</th>
            <th>Tax Rate</th>
            <th>MTD Amount</th>
            <th>Cumulative MTD</th>
          </tr>
        </thead>
        <tbody>
          {mtdCalculations.map((mtd) => (
            <tr key={mtd.employee_id}>
              <td>{mtd.employee_name}</td>
              <td>RM {mtd.monthly_income.toFixed(2)}</td>
              <td>RM {mtd.cumulative_income.toFixed(2)}</td>
              <td>{(mtd.tax_rate * 100).toFixed(1)}%</td>
              <td>RM {mtd.mtd_amount.toFixed(2)}</td>
              <td>RM {mtd.cumulative_mtd.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Button onClick={() => generateTaxReport('MTD')} disabled={loading}>
        {loading ? <LoadingSpinner /> : 'Generate MTD Report'}
      </Button>
    </div>
  );

  const renderCP204Tab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">CP204 Installment Schedule</h3>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Year"
            value={cp204Year}
            onChange={(e) => setCp204Year(parseInt(e.target.value))}
            className="w-24"
          />
          <Input
            type="number"
            placeholder="Estimated Tax"
            value={estimatedTax}
            onChange={(e) => setEstimatedTax(parseFloat(e.target.value))}
            className="w-40"
          />
          <Button onClick={() => setShowCP204Modal(true)}>Create Schedule</Button>
        </div>
      </div>

      {cp204Schedule && (
        <Card className="p-6">
          <h4 className="text-md font-semibold mb-4">CP204 Payment Schedule</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Year</p>
              <p className="text-lg font-semibold">{cp204Schedule.year}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Estimated Tax</p>
              <p className="text-lg font-semibold">RM {cp204Schedule.estimated_tax.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Monthly Installment</p>
              <p className="text-lg font-semibold">RM {cp204Schedule.monthly_installment.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Payments</p>
              <p className="text-lg font-semibold">{cp204Schedule.payment_schedule.length}</p>
            </div>
          </div>

          <Table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Due Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {cp204Schedule.payment_schedule.map((payment) => (
                <tr key={payment.month}>
                  <td>{payment.month}</td>
                  <td>{new Date(payment.due_date).toLocaleDateString()}</td>
                  <td>RM {payment.amount.toFixed(2)}</td>
                  <td>
                    <Badge variant={payment.is_paid ? 'success' : 'warning'}>
                      {payment.is_paid ? 'Paid' : 'Pending'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      <Button onClick={() => generateTaxReport('CP204')} disabled={loading}>
        {loading ? <LoadingSpinner /> : 'Generate CP204 Report'}
      </Button>
    </div>
  );

  const renderMFRS112Tab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">MFRS 112 - Income Taxes</h3>
        <div className="flex gap-2">
          <Input
            type="month"
            value={mfrsPeriod}
            onChange={(e) => setMfrsPeriod(e.target.value)}
            className="w-40"
          />
          <Button onClick={() => setShowMFRSModal(true)}>Generate Provision</Button>
        </div>
      </div>

      {taxProvision && (
        <Card className="p-6">
          <h4 className="text-md font-semibold mb-4">Tax Provision Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Current Tax</p>
              <p className="text-lg font-semibold">RM {taxProvision.current_tax.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Deferred Tax Asset</p>
              <p className="text-lg font-semibold text-green-600">RM {taxProvision.deferred_tax_asset.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Deferred Tax Liability</p>
              <p className="text-lg font-semibold text-red-600">RM {taxProvision.deferred_tax_liability.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Tax Expense</p>
              <p className="text-lg font-semibold">RM {taxProvision.total_tax_expense.toFixed(2)}</p>
            </div>
          </div>
          <div className="mt-4">
            <Badge variant={taxProvision.mfrs_112_compliance ? 'success' : 'error'}>
              {taxProvision.mfrs_112_compliance ? 'MFRS 112 Compliant' : 'MFRS 112 Non-Compliant'}
            </Badge>
          </div>
        </Card>
      )}

      <Button onClick={() => generateTaxReport('MFRS112')} disabled={loading}>
        {loading ? <LoadingSpinner /> : 'Generate MFRS 112 Report'}
      </Button>
    </div>
  );

  const renderReportsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Tax Reports</h3>
        <Button onClick={() => generateTaxReport('COMPREHENSIVE')} disabled={loading}>
          {loading ? <LoadingSpinner /> : 'Generate Comprehensive Report'}
        </Button>
      </div>

      <Table>
        <thead>
          <tr>
            <th>Report Type</th>
            <th>Period</th>
            <th>Generated</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {taxReports.map((report) => (
            <tr key={report.id}>
              <td>{report.report_type}</td>
              <td>{report.period}</td>
              <td>{new Date(report.generated_at).toLocaleDateString()}</td>
              <td>
                <Badge variant={report.compliance_status === 'compliant' ? 'success' : 'error'}>
                  {report.compliance_status}
                </Badge>
              </td>
              <td>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    setSelectedReport(report);
                    setShowReportModal(true);
                  }}
                >
                  View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Tax Management</h2>
        <div className="flex gap-2">
          <Button 
            variant={activeTab === 'sst' ? 'default' : 'outline'}
            onClick={() => setActiveTab('sst')}
          >
            SST
          </Button>
          <Button 
            variant={activeTab === 'mtd' ? 'default' : 'outline'}
            onClick={() => setActiveTab('mtd')}
          >
            MTD
          </Button>
          <Button 
            variant={activeTab === 'cp204' ? 'default' : 'outline'}
            onClick={() => setActiveTab('cp204')}
          >
            CP204
          </Button>
          <Button 
            variant={activeTab === 'mfrs112' ? 'default' : 'outline'}
            onClick={() => setActiveTab('mfrs112')}
          >
            MFRS 112
          </Button>
          <Button 
            variant={activeTab === 'reports' ? 'default' : 'outline'}
            onClick={() => setActiveTab('reports')}
          >
            Reports
          </Button>
        </div>
      </div>

      {loading && <LoadingSpinner />}

      {!loading && (
        <>
          {activeTab === 'sst' && renderSSTTab()}
          {activeTab === 'mtd' && renderMTDTab()}
          {activeTab === 'cp204' && renderCP204Tab()}
          {activeTab === 'mfrs112' && renderMFRS112Tab()}
          {activeTab === 'reports' && renderReportsTab()}
        </>
      )}

      {/* SST Transaction Modal */}
      <Modal isOpen={showSSTModal} onClose={() => setShowSSTModal(false)}>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Add SST Transaction</h3>
          {/* SST transaction form would go here */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowSSTModal(false)}>Cancel</Button>
            <Button onClick={() => setShowSSTModal(false)}>Save</Button>
          </div>
        </div>
      </Modal>

      {/* MTD Employee Modal */}
      <Modal isOpen={showMTDModal} onClose={() => setShowMTDModal(false)}>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Add Employee for MTD</h3>
          <div className="space-y-4">
            <Input
              placeholder="Employee Name"
              value={newEmployee.name}
              onChange={(e) => setNewEmployee(prev => ({ ...prev, name: e.target.value }))}
            />
            <Input
              type="number"
              placeholder="Monthly Income"
              value={newEmployee.monthlyIncome}
              onChange={(e) => setNewEmployee(prev => ({ ...prev, monthlyIncome: parseFloat(e.target.value) }))}
            />
            <Input
              type="number"
              placeholder="Cumulative Income"
              value={newEmployee.cumulativeIncome}
              onChange={(e) => setNewEmployee(prev => ({ ...prev, cumulativeIncome: parseFloat(e.target.value) }))}
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowMTDModal(false)}>Cancel</Button>
            <Button onClick={calculateMTD}>Calculate MTD</Button>
          </div>
        </div>
      </Modal>

      {/* Report Modal */}
      <Modal isOpen={showReportModal} onClose={() => setShowReportModal(false)}>
        <div className="p-6 max-w-4xl">
          <h3 className="text-lg font-semibold mb-4">Tax Report</h3>
          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Report Type</p>
                  <p className="font-semibold">{selectedReport.report_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Period</p>
                  <p className="font-semibold">{selectedReport.period}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Compliance Status</p>
                  <Badge variant={selectedReport.compliance_status === 'compliant' ? 'success' : 'error'}>
                    {selectedReport.compliance_status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Generated</p>
                  <p className="font-semibold">{new Date(selectedReport.generated_at).toLocaleString()}</p>
                </div>
              </div>
              
              {selectedReport.validation_errors.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Validation Errors</h4>
                  <div className="space-y-2">
                    {selectedReport.validation_errors.map((error, index) => (
                      <div key={index} className="p-2 bg-red-50 border border-red-200 rounded">
                        <p className="text-sm font-semibold text-red-800">{error.message}</p>
                        <p className="text-xs text-red-600">Field: {error.field}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowReportModal(false)}>Close</Button>
            <Button onClick={() => window.print()}>Print Report</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TaxManagement; 