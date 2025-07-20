'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Table } from '../ui/Table';
import { Badge } from '../ui/Badge';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { 
  FinancialReportsService,
  FinancialMetrics,
  ComparativeReport,
  TrialBalanceReport,
  IntercompanyReport,
  ExportOptions
} from '@aibos/ledger-sdk';

interface FinancialReportsProps {
  organizationId: string;
}

export default function FinancialReports({ organizationId }: FinancialReportsProps) {
  const [activeTab, setActiveTab] = useState<'trial-balance' | 'balance-sheet' | 'kpis' | 'comparative' | 'intercompany'>('trial-balance');
  const [loading, setLoading] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportType, setExportType] = useState<string>('');
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'excel' | 'pdf'>('excel');
  
  // Date states
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [comparativeDate, setComparativeDate] = useState(new Date(new Date().getFullYear() - 1, new Date().getMonth(), new Date().getDate()).toISOString().split('T')[0]);

  // Report data states
  const [trialBalance, setTrialBalance] = useState<TrialBalanceReport | null>(null);
  const [balanceSheet, setBalanceSheet] = useState<any>(null);
  const [kpis, setKpis] = useState<FinancialMetrics | null>(null);
  const [comparativeReport, setComparativeReport] = useState<ComparativeReport | null>(null);
  const [intercompanyReport, setIntercompanyReport] = useState<IntercompanyReport | null>(null);

  const financialService = new FinancialReportsService(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const generateReport = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'trial-balance':
          const { report: tb } = await financialService.generateTrialBalance(organizationId, asOfDate);
          setTrialBalance(tb);
          break;
        case 'balance-sheet':
          const { report: bs } = await financialService.generateBalanceSheet(organizationId, asOfDate, comparativeDate);
          setBalanceSheet(bs);
          break;
        case 'kpis':
          const { metrics } = await financialService.generateFinancialKPIs(organizationId, asOfDate, startDate, endDate);
          setKpis(metrics);
          break;
        case 'comparative':
          const { report: comp } = await financialService.generateComparativeReport(
            organizationId,
            { startDate, endDate },
            { startDate: comparativeDate, endDate: comparativeDate }
          );
          setComparativeReport(comp);
          break;
        case 'intercompany':
          const { report: ic } = await financialService.generateIntercompanyReport(organizationId, asOfDate);
          setIntercompanyReport(ic);
          break;
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async () => {
    setLoading(true);
    try {
      const options: ExportOptions = {
        format: exportFormat,
        dateRange: {
          startDate,
          endDate
        },
        includeCharts: true,
        currency: 'USD'
      };

      const { data, error } = await financialService.exportFinancialData(
        organizationId,
        exportType as any,
        options
      );

      if (error) {
        console.error('Export error:', error);
        return;
      }

      // Handle different export formats
      if (exportFormat === 'json') {
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${exportType}_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
      } else if (exportFormat === 'csv') {
        const blob = new Blob([data], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${exportType}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
      } else {
        // For Excel/PDF, data would be a blob or URL
        console.log('Export data:', data);
      }

      setExportModalOpen(false);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateReport();
  }, [activeTab]);

  const renderTrialBalance = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Trial Balance as of {asOfDate}</h3>
        <Button onClick={() => { setExportType('trial_balance'); setExportModalOpen(true); }}>
          Export
        </Button>
      </div>
      
      {trialBalance && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Total Debits</p>
              <p className="text-lg font-semibold">${trialBalance.totals.totalDebits.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Credits</p>
              <p className="text-lg font-semibold">${trialBalance.totals.totalCredits.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Opening Balance</p>
              <p className="text-lg font-semibold">${trialBalance.totals.totalOpeningBalance.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Closing Balance</p>
              <p className="text-lg font-semibold">${trialBalance.totals.totalClosingBalance.toLocaleString()}</p>
            </div>
          </div>

          <Table>
            <thead>
              <tr>
                <th>Account Code</th>
                <th>Account Name</th>
                <th>Type</th>
                <th>Opening Balance</th>
                <th>Debits</th>
                <th>Credits</th>
                <th>Closing Balance</th>
              </tr>
            </thead>
            <tbody>
              {trialBalance.trialBalance.map((account, index) => (
                <tr key={index} className={account.level > 0 ? 'pl-4' : ''}>
                  <td className="font-mono">{account.accountCode}</td>
                  <td className={`${account.level > 0 ? 'pl-4' : ''}`}>
                    {account.accountName}
                  </td>
                  <td>
                    <Badge variant={account.accountType === 'asset' ? 'default' : 'secondary'}>
                      {account.accountType}
                    </Badge>
                  </td>
                  <td className="text-right">${account.openingBalance.toLocaleString()}</td>
                  <td className="text-right">${account.debitTotal.toLocaleString()}</td>
                  <td className="text-right">${account.creditTotal.toLocaleString()}</td>
                  <td className="text-right font-semibold">${account.closingBalance.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );

  const renderBalanceSheet = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Balance Sheet as of {asOfDate}</h3>
        <Button onClick={() => { setExportType('balance_sheet'); setExportModalOpen(true); }}>
          Export
        </Button>
      </div>
      
      {balanceSheet && (
        <div className="space-y-6">
          {/* Assets */}
          <Card>
            <CardHeader>
              <CardTitle>Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <thead>
                  <tr>
                    <th>Account</th>
                    <th>Amount</th>
                    <th>% of Total</th>
                    {comparativeDate && <th>Comparative</th>}
                    {comparativeDate && <th>Variance</th>}
                  </tr>
                </thead>
                <tbody>
                  {balanceSheet.assets.map((asset: any, index: number) => (
                    <tr key={index}>
                      <td>{asset.accountName}</td>
                      <td className="text-right">${asset.amount.toLocaleString()}</td>
                      <td className="text-right">{asset.percentage.toFixed(1)}%</td>
                      {comparativeDate && (
                        <td className="text-right">${asset.comparativeAmount?.toLocaleString() || '0'}</td>
                      )}
                      {comparativeDate && (
                        <td className={`text-right ${asset.variance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${asset.variance?.toLocaleString() || '0'}
                        </td>
                      )}
                    </tr>
                  ))}
                  <tr className="font-bold border-t">
                    <td>Total Assets</td>
                    <td className="text-right">${balanceSheet.totalAssets.toLocaleString()}</td>
                    <td className="text-right">100%</td>
                    {comparativeDate && <td></td>}
                    {comparativeDate && <td></td>}
                  </tr>
                </tbody>
              </Table>
            </CardContent>
          </Card>

          {/* Liabilities & Equity */}
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Liabilities</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <tbody>
                    {balanceSheet.liabilities.map((liability: any, index: number) => (
                      <tr key={index}>
                        <td>{liability.accountName}</td>
                        <td className="text-right">${liability.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr className="font-bold border-t">
                      <td>Total Liabilities</td>
                      <td className="text-right">${balanceSheet.totalLiabilities.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Equity</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <tbody>
                    {balanceSheet.equity.map((equity: any, index: number) => (
                      <tr key={index}>
                        <td>{equity.accountName}</td>
                        <td className="text-right">${equity.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr className="font-bold border-t">
                      <td>Total Equity</td>
                      <td className="text-right">${balanceSheet.totalEquity.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-600">Total Assets</p>
                  <p className="text-2xl font-bold text-green-600">${balanceSheet.totalAssets.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Liabilities</p>
                  <p className="text-2xl font-bold text-red-600">${balanceSheet.totalLiabilities.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Net Worth</p>
                  <p className="text-2xl font-bold text-blue-600">${balanceSheet.netWorth.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );

  const renderKPIs = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Financial KPIs</h3>
        <Button onClick={() => { setExportType('kpis'); setExportModalOpen(true); }}>
          Export
        </Button>
      </div>
      
      {kpis && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Liquidity Ratios */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Current Ratio</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{kpis.metrics.currentRatio.toFixed(2)}</p>
              <p className="text-xs text-gray-600">Current Assets / Current Liabilities</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Ratio</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{kpis.metrics.quickRatio.toFixed(2)}</p>
              <p className="text-xs text-gray-600">Quick Assets / Current Liabilities</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Working Capital</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">${kpis.metrics.workingCapital.toLocaleString()}</p>
              <p className="text-xs text-gray-600">Current Assets - Current Liabilities</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Cash Ratio</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{kpis.metrics.cashRatio.toFixed(2)}</p>
              <p className="text-xs text-gray-600">Cash / Current Liabilities</p>
            </CardContent>
          </Card>

          {/* Profitability Ratios */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Gross Profit Margin</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{kpis.metrics.grossProfitMargin.toFixed(1)}%</p>
              <p className="text-xs text-gray-600">Gross Profit / Revenue</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Net Profit Margin</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{kpis.metrics.netProfitMargin.toFixed(1)}%</p>
              <p className="text-xs text-gray-600">Net Income / Revenue</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">ROA</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{kpis.metrics.returnOnAssets.toFixed(1)}%</p>
              <p className="text-xs text-gray-600">Net Income / Total Assets</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">ROE</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{kpis.metrics.returnOnEquity.toFixed(1)}%</p>
              <p className="text-xs text-gray-600">Net Income / Total Equity</p>
            </CardContent>
          </Card>

          {/* Leverage Ratios */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Debt to Equity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{kpis.metrics.debtToEquityRatio.toFixed(2)}</p>
              <p className="text-xs text-gray-600">Total Debt / Total Equity</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Debt to Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{kpis.metrics.debtToAssetsRatio.toFixed(2)}</p>
              <p className="text-xs text-gray-600">Total Debt / Total Assets</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Equity Ratio</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{kpis.metrics.equityRatio.toFixed(2)}</p>
              <p className="text-xs text-gray-600">Total Equity / Total Assets</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Asset Turnover</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{kpis.metrics.assetTurnoverRatio.toFixed(2)}</p>
              <p className="text-xs text-gray-600">Revenue / Total Assets</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );

  const renderComparativeReport = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Comparative Report</h3>
        <Button onClick={() => { setExportType('comparative'); setExportModalOpen(true); }}>
          Export
        </Button>
      </div>
      
      {comparativeReport && (
        <div className="space-y-6">
          {/* Key Variances */}
          <Card>
            <CardHeader>
              <CardTitle>Key Variances</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Current</th>
                    <th>Comparative</th>
                    <th>Variance</th>
                    <th>% Change</th>
                    <th>Significance</th>
                  </tr>
                </thead>
                <tbody>
                  {comparativeReport.keyVariances.map((variance, index) => (
                    <tr key={index}>
                      <td>{variance.metric}</td>
                      <td className="text-right">${variance.current.toLocaleString()}</td>
                      <td className="text-right">${variance.comparative.toLocaleString()}</td>
                      <td className={`text-right ${variance.variance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${variance.variance.toLocaleString()}
                      </td>
                      <td className={`text-right ${variance.variancePercent > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {variance.variancePercent.toFixed(1)}%
                      </td>
                      <td>
                        <Badge variant={
                          variance.significance === 'high' ? 'destructive' : 
                          variance.significance === 'medium' ? 'default' : 'secondary'
                        }>
                          {variance.significance}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </CardContent>
          </Card>

          {/* Balance Sheet Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Balance Sheet Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                {Object.entries(comparativeReport.balanceSheetComparison).map(([key, value]) => (
                  <div key={key} className="p-4 border rounded-lg">
                    <h4 className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm">Current: ${value.current.toLocaleString()}</p>
                      <p className="text-sm">Comparative: ${value.comparative.toLocaleString()}</p>
                      <p className={`text-sm font-semibold ${value.variance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        Variance: ${value.variance.toLocaleString()} ({value.variancePercent.toFixed(1)}%)
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );

  const renderIntercompanyReport = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Intercompany Report as of {asOfDate}</h3>
        <Button onClick={() => { setExportType('intercompany'); setExportModalOpen(true); }}>
          Export
        </Button>
      </div>
      
      {intercompanyReport && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Total Transactions</p>
              <p className="text-lg font-semibold">{intercompanyReport.totalTransactions}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-lg font-semibold">${intercompanyReport.totalAmount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Accounts</p>
              <p className="text-lg font-semibold">{intercompanyReport.intercompanyAccounts.length}</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Intercompany Balances</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <thead>
                  <tr>
                    <th>Account Code</th>
                    <th>Account Name</th>
                    <th>Total Debits</th>
                    <th>Total Credits</th>
                    <th>Net Balance</th>
                    <th>Transactions</th>
                  </tr>
                </thead>
                <tbody>
                  {intercompanyReport.intercompanyBalances.map((balance, index) => (
                    <tr key={index}>
                      <td className="font-mono">{balance.accountCode}</td>
                      <td>{balance.accountName}</td>
                      <td className="text-right">${balance.totalDebits.toLocaleString()}</td>
                      <td className="text-right">${balance.totalCredits.toLocaleString()}</td>
                      <td className={`text-right font-semibold ${balance.netBalance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${balance.netBalance.toLocaleString()}
                      </td>
                      <td className="text-right">{balance.transactionCount}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Financial Reports</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={generateReport} disabled={loading}>
            {loading ? <LoadingSpinner /> : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Date Controls */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">As of Date</label>
          <Input
            type="date"
            value={asOfDate}
            onChange={(e) => setAsOfDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Start Date</label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">End Date</label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Comparative Date</label>
          <Input
            type="date"
            value={comparativeDate}
            onChange={(e) => setComparativeDate(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {[
            { id: 'trial-balance', label: 'Trial Balance' },
            { id: 'balance-sheet', label: 'Balance Sheet' },
            { id: 'kpis', label: 'Financial KPIs' },
            { id: 'comparative', label: 'Comparative' },
            { id: 'intercompany', label: 'Intercompany' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="mt-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            {activeTab === 'trial-balance' && renderTrialBalance()}
            {activeTab === 'balance-sheet' && renderBalanceSheet()}
            {activeTab === 'kpis' && renderKPIs()}
            {activeTab === 'comparative' && renderComparativeReport()}
            {activeTab === 'intercompany' && renderIntercompanyReport()}
          </>
        )}
      </div>

      {/* Export Modal */}
      <Modal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        title="Export Report"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Export Format</label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as any)}
              className="w-full p-2 border rounded-md"
            >
              <option value="excel">Excel (.xlsx)</option>
              <option value="pdf">PDF</option>
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </select>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setExportModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={exportReport} disabled={loading}>
              {loading ? <LoadingSpinner /> : 'Export'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
} 