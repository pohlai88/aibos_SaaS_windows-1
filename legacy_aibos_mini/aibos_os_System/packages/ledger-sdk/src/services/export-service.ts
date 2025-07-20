import { ExportOptions, TrialBalanceReport, BalanceSheet, IncomeStatement, FinancialMetrics, ComparativeReport, IntercompanyReport } from '../../types';

export class ExportService {
  /**
   * Export data in CSV format
   */
  static exportToCSV(data: any, exportType: string): string {
    switch (exportType) {
      case 'trial_balance':
        return this.trialBalanceToCSV(data);
      case 'balance_sheet':
        return this.balanceSheetToCSV(data);
      case 'income_statement':
        return this.incomeStatementToCSV(data);
      case 'kpis':
        return this.kpisToCSV(data);
      case 'comparative':
        return this.comparativeToCSV(data);
      case 'intercompany':
        return this.intercompanyToCSV(data);
      default:
        return this.genericToCSV(data);
    }
  }

  /**
   * Export data in Excel format
   */
  static exportToExcel(data: any, exportType: string, options: ExportOptions): any {
    // This would use a library like xlsx
    // For now, return structured data that can be processed by the client
    return {
      type: 'excel',
      data: this.prepareExcelData(data, exportType),
      exportType,
      options,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Export data in PDF format
   */
  static exportToPDF(data: any, exportType: string, options: ExportOptions): any {
    // This would use a library like jsPDF or puppeteer
    // For now, return structured data that can be processed by the client
    return {
      type: 'pdf',
      data: this.preparePDFData(data, exportType),
      exportType,
      options,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Export data in JSON format
   */
  static exportToJSON(data: any, exportType: string, options: ExportOptions): string {
    const exportData = {
      exportType,
      generatedAt: new Date().toISOString(),
      options,
      data,
      metadata: {
        version: '1.0',
        format: 'json',
        encoding: 'utf-8'
      }
    };

    return JSON.stringify(exportData, null, 2);
  }

  // CSV Export Methods
  private static trialBalanceToCSV(data: TrialBalanceReport): string {
    const headers = [
      'Account Code',
      'Account Name',
      'Account Type',
      'Normal Balance',
      'Level',
      'Opening Balance',
      'Debits',
      'Credits',
      'Closing Balance',
      'Currency'
    ];

    const rows = data.trialBalance.map(account => [
      account.accountCode,
      account.accountName,
      account.accountType,
      account.normalBalance,
      account.level,
      account.openingBalance,
      account.debitTotal,
      account.creditTotal,
      account.closingBalance,
      account.currency
    ]);

    // Add totals row
    rows.push([
      'TOTALS',
      '',
      '',
      '',
      '',
      data.totals.totalOpeningBalance,
      data.totals.totalDebits,
      data.totals.totalCredits,
      data.totals.totalClosingBalance,
      'USD'
    ]);

    return this.arrayToCSV([headers, ...rows]);
  }

  private static balanceSheetToCSV(data: BalanceSheet): string {
    const rows = [];

    // Assets
    rows.push(['ASSETS']);
    rows.push(['Account', 'Amount', 'Percentage']);
    data.assets.forEach(asset => {
      rows.push([
        asset.accountName,
        asset.amount,
        `${asset.percentage.toFixed(1)}%`
      ]);
    });
    rows.push(['Total Assets', data.totalAssets, '100%']);
    rows.push([]);

    // Liabilities
    rows.push(['LIABILITIES']);
    rows.push(['Account', 'Amount', 'Percentage']);
    data.liabilities.forEach(liability => {
      rows.push([
        liability.accountName,
        liability.amount,
        `${liability.percentage.toFixed(1)}%`
      ]);
    });
    rows.push(['Total Liabilities', data.totalLiabilities, '100%']);
    rows.push([]);

    // Equity
    rows.push(['EQUITY']);
    rows.push(['Account', 'Amount', 'Percentage']);
    data.equity.forEach(equity => {
      rows.push([
        equity.accountName,
        equity.amount,
        `${equity.percentage.toFixed(1)}%`
      ]);
    });
    rows.push(['Total Equity', data.totalEquity, '100%']);
    rows.push([]);

    // Summary
    rows.push(['SUMMARY']);
    rows.push(['Total Assets', data.totalAssets]);
    rows.push(['Total Liabilities', data.totalLiabilities]);
    rows.push(['Net Worth', data.netWorth]);

    return this.arrayToCSV(rows);
  }

  private static incomeStatementToCSV(data: IncomeStatement): string {
    const rows = [];

    // Revenue
    rows.push(['REVENUE']);
    rows.push(['Account', 'Amount']);
    data.revenue.forEach(item => {
      rows.push([item.accountName, item.amount]);
    });
    rows.push(['Total Revenue', data.totalRevenue]);
    rows.push([]);

    // Expenses
    rows.push(['EXPENSES']);
    rows.push(['Account', 'Amount']);
    data.expenses.forEach(item => {
      rows.push([item.accountName, item.amount]);
    });
    rows.push(['Total Expenses', data.totalExpenses]);
    rows.push([]);

    // Summary
    rows.push(['SUMMARY']);
    rows.push(['Gross Profit', data.grossProfit]);
    rows.push(['Net Income', data.netIncome]);

    return this.arrayToCSV(rows);
  }

  private static kpisToCSV(data: FinancialMetrics): string {
    const rows = [
      ['FINANCIAL KPIs'],
      ['Metric', 'Value', 'Description'],
      ['Current Ratio', data.metrics.currentRatio, 'Current Assets / Current Liabilities'],
      ['Quick Ratio', data.metrics.quickRatio, 'Quick Assets / Current Liabilities'],
      ['Working Capital', data.metrics.workingCapital, 'Current Assets - Current Liabilities'],
      ['Cash Ratio', data.metrics.cashRatio, 'Cash / Current Liabilities'],
      ['Gross Profit Margin', `${data.metrics.grossProfitMargin.toFixed(1)}%`, 'Gross Profit / Revenue'],
      ['Net Profit Margin', `${data.metrics.netProfitMargin.toFixed(1)}%`, 'Net Income / Revenue'],
      ['Return on Assets', `${data.metrics.returnOnAssets.toFixed(1)}%`, 'Net Income / Total Assets'],
      ['Return on Equity', `${data.metrics.returnOnEquity.toFixed(1)}%`, 'Net Income / Total Equity'],
      ['Debt to Equity', data.metrics.debtToEquityRatio, 'Total Debt / Total Equity'],
      ['Debt to Assets', data.metrics.debtToAssetsRatio, 'Total Debt / Total Assets'],
      ['Equity Ratio', data.metrics.equityRatio, 'Total Equity / Total Assets'],
      ['Asset Turnover', data.metrics.assetTurnoverRatio, 'Revenue / Total Assets']
    ];

    return this.arrayToCSV(rows);
  }

  private static comparativeToCSV(data: ComparativeReport): string {
    const rows = [
      ['COMPARATIVE REPORT'],
      [`Current Period: ${data.currentPeriod.startDate} to ${data.currentPeriod.endDate}`],
      [`Comparative Period: ${data.comparativePeriod.startDate} to ${data.comparativePeriod.endDate}`],
      [],
      ['KEY VARIANCES'],
      ['Metric', 'Current', 'Comparative', 'Variance', '% Change', 'Significance']
    ];

    data.keyVariances.forEach(variance => {
      rows.push([
        String(variance.metric),
        String(variance.current),
        String(variance.comparative),
        String(variance.variance),
        `${variance.variancePercent.toFixed(1)}%`,
        String(variance.significance)
      ]);
    });

    rows.push([]);
    rows.push(['BALANCE SHEET COMPARISON']);
    rows.push(['Metric', 'Current', 'Comparative', 'Variance', '% Change']);

    Object.entries(data.balanceSheetComparison).forEach(([key, value]) => {
      rows.push([
        key.replace(/([A-Z])/g, ' $1').trim(),
        String(value.current),
        String(value.comparative),
        String(value.variance),
        `${value.variancePercent.toFixed(1)}%`
      ]);
    });

    return this.arrayToCSV(rows);
  }

  private static intercompanyToCSV(data: IntercompanyReport): string {
    const rows = [
      ['INTERCOMPANY REPORT'],
      [`As of: ${data.asOfDate}`],
      [],
      ['SUMMARY'],
      ['Total Transactions', String(data.totalTransactions)],
      ['Total Amount', String(data.totalAmount)],
      ['Number of Accounts', String(data.intercompanyAccounts.length)],
      [],
      ['INTERCOMPANY BALANCES'],
      ['From Entity', 'To Entity', 'Balance', 'Currency']
    ];

    data.intercompanyBalances.forEach(balance => {
      rows.push([
        balance.fromEntity?.entityName || balance.fromEntityId,
        balance.toEntity?.entityName || balance.toEntityId,
        String(balance.balance),
        balance.currency
      ]);
    });

    return this.arrayToCSV(rows);
  }

  private static genericToCSV(data: any): string {
    if (Array.isArray(data)) {
      return this.arrayToCSV(data);
    } else if (typeof data === 'object') {
      const rows = [];
      for (const [key, value] of Object.entries(data)) {
        rows.push([key, typeof value === 'object' ? JSON.stringify(value) : String(value)]);
      }
      return this.arrayToCSV(rows);
    }
    return String(data);
  }

  private static arrayToCSV(rows: any[][]): string {
    return rows.map(row => 
      row.map(cell => {
        const cellStr = String(cell);
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(',')
    ).join('\n');
  }

  // Excel Export Methods
  private static prepareExcelData(data: any, exportType: string): any {
    switch (exportType) {
      case 'trial_balance':
        return {
          sheets: [
            {
              name: 'Trial Balance',
              data: this.trialBalanceToExcel(data)
            },
            {
              name: 'Summary',
              data: this.trialBalanceSummaryToExcel(data)
            }
          ]
        };
      case 'balance_sheet':
        return {
          sheets: [
            {
              name: 'Balance Sheet',
              data: this.balanceSheetToExcel(data)
            },
            {
              name: 'Assets',
              data: this.assetsToExcel(data)
            },
            {
              name: 'Liabilities & Equity',
              data: this.liabilitiesEquityToExcel(data)
            }
          ]
        };
      case 'kpis':
        return {
          sheets: [
            {
              name: 'Financial KPIs',
              data: this.kpisToExcel(data)
            },
            {
              name: 'Ratios Analysis',
              data: this.ratiosAnalysisToExcel(data)
            }
          ]
        };
      default:
        return {
          sheets: [
            {
              name: 'Data',
              data: this.genericToExcel(data)
            }
          ]
        };
    }
  }

  private static trialBalanceToExcel(data: TrialBalanceReport): any[][] {
    const rows = [
      ['Trial Balance Report'],
      [`Generated: ${data.generatedAt}`],
      [`As of: ${data.asOfDate}`],
      [],
      ['Account Code', 'Account Name', 'Type', 'Opening Balance', 'Debits', 'Credits', 'Closing Balance']
    ];

    data.trialBalance.forEach(account => {
      rows.push([
        String(account.accountCode),
        String(account.accountName),
        String(account.accountType),
        String(account.openingBalance),
        String(account.debitTotal),
        String(account.creditTotal),
        String(account.closingBalance)
      ]);
    });

    return rows;
  }

  private static trialBalanceSummaryToExcel(data: TrialBalanceReport): any[][] {
    return [
      ['Trial Balance Summary'],
      [],
      ['Total Debits', data.totals.totalDebits],
      ['Total Credits', data.totals.totalCredits],
      ['Total Opening Balance', data.totals.totalOpeningBalance],
      ['Total Closing Balance', data.totals.totalClosingBalance],
      ['Difference', data.totals.totalDebits - data.totals.totalCredits]
    ];
  }

  private static balanceSheetToExcel(data: BalanceSheet): any[][] {
    const rows = [
      ['Balance Sheet'],
      [`As of: ${data.asOfDate.toISOString().split('T')[0]}`],
      [`Currency: ${data.currency}`],
      [],
      ['ASSETS', 'Amount', 'Percentage']
    ];

    data.assets.forEach(asset => {
      rows.push([String(asset.accountName), String(asset.amount), `${asset.percentage.toFixed(1)}%`]);
    });

    rows.push(['Total Assets', String(data.totalAssets), '100%']);
    rows.push([]);
    rows.push(['LIABILITIES & EQUITY', 'Amount', 'Percentage']);

    [...data.liabilities, ...data.equity].forEach(item => {
      rows.push([String(item.accountName), String(item.amount), `${item.percentage.toFixed(1)}%`]);
    });

    rows.push(['Total Liabilities & Equity', String(data.totalLiabilities + data.totalEquity), '100%']);

    return rows;
  }

  private static assetsToExcel(data: BalanceSheet): any[][] {
    return [
      ['Assets Detail'],
      ['Account', 'Amount', 'Percentage'],
      ...data.assets.map(asset => [asset.accountName, asset.amount, `${asset.percentage.toFixed(1)}%`])
    ];
  }

  private static liabilitiesEquityToExcel(data: BalanceSheet): any[][] {
    return [
      ['Liabilities & Equity Detail'],
      ['Account', 'Amount', 'Percentage'],
      ...data.liabilities.map(liability => [liability.accountName, liability.amount, `${liability.percentage.toFixed(1)}%`]),
      ...data.equity.map(equity => [equity.accountName, equity.amount, `${equity.percentage.toFixed(1)}%`])
    ];
  }

  private static kpisToExcel(data: FinancialMetrics): any[][] {
    return [
      ['Financial KPIs'],
      [`Generated: ${data.asOfDate.toISOString().split('T')[0]}`],
      [],
      ['Category', 'Metric', 'Value', 'Description'],
      ['Liquidity', 'Current Ratio', data.metrics.currentRatio, 'Current Assets / Current Liabilities'],
      ['Liquidity', 'Quick Ratio', data.metrics.quickRatio, 'Quick Assets / Current Liabilities'],
      ['Liquidity', 'Working Capital', data.metrics.workingCapital, 'Current Assets - Current Liabilities'],
      ['Liquidity', 'Cash Ratio', data.metrics.cashRatio, 'Cash / Current Liabilities'],
      ['Profitability', 'Gross Profit Margin', `${data.metrics.grossProfitMargin.toFixed(1)}%`, 'Gross Profit / Revenue'],
      ['Profitability', 'Net Profit Margin', `${data.metrics.netProfitMargin.toFixed(1)}%`, 'Net Income / Revenue'],
      ['Profitability', 'Return on Assets', `${data.metrics.returnOnAssets.toFixed(1)}%`, 'Net Income / Total Assets'],
      ['Profitability', 'Return on Equity', `${data.metrics.returnOnEquity.toFixed(1)}%`, 'Net Income / Total Equity'],
      ['Leverage', 'Debt to Equity', data.metrics.debtToEquityRatio, 'Total Debt / Total Equity'],
      ['Leverage', 'Debt to Assets', data.metrics.debtToAssetsRatio, 'Total Debt / Total Assets'],
      ['Leverage', 'Equity Ratio', data.metrics.equityRatio, 'Total Equity / Total Assets'],
      ['Efficiency', 'Asset Turnover', data.metrics.assetTurnoverRatio, 'Revenue / Total Assets']
    ];
  }

  private static ratiosAnalysisToExcel(data: FinancialMetrics): any[][] {
    return [
      ['Ratio Analysis'],
      [],
      ['Ratio', 'Value', 'Benchmark', 'Status'],
      ['Current Ratio', data.metrics.currentRatio, '> 1.0', data.metrics.currentRatio > 1 ? 'Good' : 'Poor'],
      ['Quick Ratio', data.metrics.quickRatio, '> 0.8', data.metrics.quickRatio > 0.8 ? 'Good' : 'Poor'],
      ['Debt to Equity', data.metrics.debtToEquityRatio, '< 2.0', data.metrics.debtToEquityRatio < 2 ? 'Good' : 'Poor'],
      ['ROA', `${data.metrics.returnOnAssets.toFixed(1)}%`, '> 5%', data.metrics.returnOnAssets > 5 ? 'Good' : 'Poor'],
      ['ROE', `${data.metrics.returnOnEquity.toFixed(1)}%`, '> 10%', data.metrics.returnOnEquity > 10 ? 'Good' : 'Poor']
    ];
  }

  private static genericToExcel(data: any): any[][] {
    if (Array.isArray(data)) {
      return data.map(row => Array.isArray(row) ? row : [row]);
    } else if (typeof data === 'object') {
      return Object.entries(data).map(([key, value]) => [key, value]);
    }
    return [[data]];
  }

  // PDF Export Methods
  private static preparePDFData(data: any, exportType: string): any {
    return {
      title: this.getPDFTitle(exportType),
      data: this.formatPDFData(data, exportType),
      template: this.getPDFTemplate(exportType),
      options: {
        orientation: 'portrait',
        format: 'A4',
        margins: { top: 20, right: 20, bottom: 20, left: 20 }
      }
    };
  }

  private static getPDFTitle(exportType: string): string {
    const titles = {
      trial_balance: 'Trial Balance Report',
      balance_sheet: 'Balance Sheet',
      income_statement: 'Income Statement',
      kpis: 'Financial KPIs Report',
      comparative: 'Comparative Financial Report',
      intercompany: 'Intercompany Report'
    };
    return titles[exportType as keyof typeof titles] || 'Financial Report';
  }

  private static formatPDFData(data: any, exportType: string): any {
    switch (exportType) {
      case 'trial_balance':
        return {
          summary: {
            totalDebits: data.totals.totalDebits,
            totalCredits: data.totals.totalCredits,
            totalOpeningBalance: data.totals.totalOpeningBalance,
            totalClosingBalance: data.totals.totalClosingBalance
          },
          accounts: data.trialBalance
        };
      case 'balance_sheet':
        return {
          assets: data.assets,
          liabilities: data.liabilities,
          equity: data.equity,
          totals: {
            totalAssets: data.totalAssets,
            totalLiabilities: data.totalLiabilities,
            totalEquity: data.totalEquity,
            netWorth: data.netWorth
          }
        };
      case 'kpis':
        return {
          metrics: data.metrics,
          categories: {
            liquidity: ['currentRatio', 'quickRatio', 'workingCapital', 'cashRatio'],
            profitability: ['grossProfitMargin', 'netProfitMargin', 'returnOnAssets', 'returnOnEquity'],
            leverage: ['debtToEquityRatio', 'debtToAssetsRatio', 'equityRatio'],
            efficiency: ['assetTurnoverRatio', 'inventoryTurnoverRatio', 'receivablesTurnoverRatio']
          }
        };
      default:
        return data;
    }
  }

  private static getPDFTemplate(exportType: string): string {
    const templates = {
      trial_balance: 'financial-report',
      balance_sheet: 'balance-sheet',
      income_statement: 'income-statement',
      kpis: 'kpi-dashboard',
      comparative: 'comparative-report',
      intercompany: 'intercompany-report'
    };
    return templates[exportType as keyof typeof templates] || 'default';
  }
}

// User-defined export template type
export interface CustomExportTemplate {
  id: string;
  userId: string;
  organizationId: string;
  name: string;
  description?: string;
  exportType: string;
  columns: Array<{
    key: string;
    label: string;
    order: number;
    format?: string;
    formula?: string;
  }>;
  filters?: any;
  sort?: Array<{ key: string; direction: 'asc' | 'desc' }>;
  createdAt: string;
  updatedAt: string;
}

// Example: In-memory storage for demonstration (replace with DB in production)
const customExportTemplates: CustomExportTemplate[] = [];

export function saveCustomExportTemplate(template: CustomExportTemplate) {
  const idx = customExportTemplates.findIndex(t => t.id === template.id);
  if (idx >= 0) {
    customExportTemplates[idx] = template;
  } else {
    customExportTemplates.push(template);
  }
}

export function getCustomExportTemplates(userId: string, organizationId: string): CustomExportTemplate[] {
  return customExportTemplates.filter(t => t.userId === userId && t.organizationId === organizationId);
}

export function getCustomExportTemplateById(id: string): CustomExportTemplate | undefined {
  return customExportTemplates.find(t => t.id === id);
}