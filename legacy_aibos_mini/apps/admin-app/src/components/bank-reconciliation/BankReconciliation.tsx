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
  BankReconciliationService,
  BankAccount,
  BankStatement,
  BankTransaction,
  ReconciliationRule,
  ReconciliationMatch,
  ReconciliationSession,
  ReconciliationSummary
} from '@aibos/ledger-sdk';

interface BankReconciliationProps {
  organizationId: string;
}

export default function BankReconciliation({ organizationId }: BankReconciliationProps) {
  const [activeTab, setActiveTab] = useState<'accounts' | 'statements' | 'reconciliation' | 'rules'>('accounts');
  const [loading, setLoading] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [statements, setStatements] = useState<BankStatement[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [selectedStatement, setSelectedStatement] = useState<BankStatement | null>(null);
  const [reconciliationRules, setReconciliationRules] = useState<ReconciliationRule[]>([]);
  const [reconciliationSummary, setReconciliationSummary] = useState<ReconciliationSummary | null>(null);

  // Modal states
  const [addAccountModalOpen, setAddAccountModalOpen] = useState(false);
  const [importStatementModalOpen, setImportStatementModalOpen] = useState(false);
  const [reconciliationModalOpen, setReconciliationModalOpen] = useState(false);
  const [addRuleModalOpen, setAddRuleModalOpen] = useState(false);

  // Form states
  const [accountForm, setAccountForm] = useState({
    accountNumber: '',
    accountName: '',
    bankName: '',
    accountType: 'checking' as const,
    currency: 'USD',
    openingBalance: 0,
    currentBalance: 0
  });

  const [statementForm, setStatementForm] = useState({
    statementDate: new Date().toISOString().split('T')[0],
    openingBalance: 0,
    closingBalance: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    statementNumber: '',
    transactions: [] as any[]
  });

  const [ruleForm, setRuleForm] = useState({
    ruleName: '',
    description: '',
    priority: 1,
    criteria: {
      amountMatch: true,
      dateMatch: true,
      descriptionMatch: false,
      referenceMatch: false,
      dateTolerance: 3,
      minConfidence: 0.7
    }
  });

  const bankService = new BankReconciliationService(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'accounts') {
        const { accounts } = await bankService.getBankAccounts(organizationId);
        setBankAccounts(accounts);
      } else if (activeTab === 'rules') {
        const { rules } = await bankService.getReconciliationRules(organizationId);
        setReconciliationRules(rules);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBankAccount = async () => {
    setLoading(true);
    try {
      const { account, error } = await bankService.createBankAccount(organizationId, accountForm);
      if (error) throw error;

      setAddAccountModalOpen(false);
      resetAccountForm();
      loadData();
    } catch (error) {
      console.error('Error creating bank account:', error);
    } finally {
      setLoading(false);
    }
  };

  const importBankStatement = async () => {
    if (!selectedAccount) return;

    setLoading(true);
    try {
      const { statement, error } = await bankService.importBankStatement(
        selectedAccount.id,
        statementForm
      );
      if (error) throw error;

      setImportStatementModalOpen(false);
      resetStatementForm();
      loadData();
    } catch (error) {
      console.error('Error importing statement:', error);
    } finally {
      setLoading(false);
    }
  };

  const createReconciliationRule = async () => {
    setLoading(true);
    try {
      const { rule, error } = await bankService.createReconciliationRule(organizationId, ruleForm);
      if (error) throw error;

      setAddRuleModalOpen(false);
      resetRuleForm();
      loadData();
    } catch (error) {
      console.error('Error creating rule:', error);
    } finally {
      setLoading(false);
    }
  };

  const startReconciliation = async () => {
    if (!selectedAccount || !selectedStatement) return;

    setLoading(true);
    try {
      const { session, error } = await bankService.createReconciliationSession(
        selectedAccount.id,
        selectedStatement.id,
        'current-user-id' // Would come from auth context
      );
      if (error) throw error;

      // Load reconciliation summary
      const { summary } = await bankService.getReconciliationSummary(
        selectedAccount.id,
        selectedStatement.id
      );
      setReconciliationSummary(summary);

      setReconciliationModalOpen(true);
    } catch (error) {
      console.error('Error starting reconciliation:', error);
    } finally {
      setLoading(false);
    }
  };

  const autoMatchTransactions = async () => {
    if (!selectedAccount) return;

    setLoading(true);
    try {
      const { matches, error } = await bankService.autoMatchTransactions(
        selectedAccount.id,
        reconciliationRules
      );
      if (error) throw error;

      console.log('Auto-matched transactions:', matches);
      // Refresh reconciliation summary
      if (selectedStatement) {
        const { summary } = await bankService.getReconciliationSummary(
          selectedAccount.id,
          selectedStatement.id
        );
        setReconciliationSummary(summary);
      }
    } catch (error) {
      console.error('Error auto-matching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetAccountForm = () => {
    setAccountForm({
      accountNumber: '',
      accountName: '',
      bankName: '',
      accountType: 'checking',
      currency: 'USD',
      openingBalance: 0,
      currentBalance: 0
    });
  };

  const resetStatementForm = () => {
    setStatementForm({
      statementDate: new Date().toISOString().split('T')[0],
      openingBalance: 0,
      closingBalance: 0,
      totalDeposits: 0,
      totalWithdrawals: 0,
      statementNumber: '',
      transactions: []
    });
  };

  const resetRuleForm = () => {
    setRuleForm({
      ruleName: '',
      description: '',
      priority: 1,
      criteria: {
        amountMatch: true,
        dateMatch: true,
        descriptionMatch: false,
        referenceMatch: false,
        dateTolerance: 3,
        minConfidence: 0.7
      }
    });
  };

  const getAccountTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'checking': return 'default';
      case 'savings': return 'secondary';
      case 'credit': return 'destructive';
      case 'investment': return 'default';
      default: return 'secondary';
    }
  };

  const renderAccountsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Bank Accounts</CardTitle>
          <Button onClick={() => setAddAccountModalOpen(true)}>
            Add Bank Account
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner />
            </div>
          ) : (
            <Table>
              <thead>
                <tr>
                  <th>Account Name</th>
                  <th>Bank</th>
                  <th>Account Number</th>
                  <th>Type</th>
                  <th>Current Balance</th>
                  <th>Last Reconciliation</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bankAccounts.map((account) => (
                  <tr key={account.id}>
                    <td className="font-semibold">{account.accountName}</td>
                    <td>{account.bankName}</td>
                    <td className="font-mono">{account.accountNumber}</td>
                    <td>
                      <Badge variant={getAccountTypeBadgeVariant(account.accountType)}>
                        {account.accountType}
                      </Badge>
                    </td>
                    <td className="text-right">${account.currentBalance.toLocaleString()}</td>
                    <td>
                      {account.lastReconciliationDate 
                        ? new Date(account.lastReconciliationDate).toLocaleDateString()
                        : 'Never'
                      }
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedAccount(account);
                            setImportStatementModalOpen(true);
                          }}
                        >
                          Import Statement
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedAccount(account);
                            setActiveTab('statements');
                          }}
                        >
                          View Statements
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderStatementsTab = () => (
    <div className="space-y-6">
      {selectedAccount && (
        <Card>
          <CardHeader>
            <CardTitle>Bank Statements - {selectedAccount.accountName}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Bank: {selectedAccount.bankName}</p>
              <p className="text-sm text-gray-600">Account: {selectedAccount.accountNumber}</p>
              <p className="text-sm text-gray-600">Current Balance: ${selectedAccount.currentBalance.toLocaleString()}</p>
            </div>

            <div className="flex gap-2 mb-4">
              <Button
                onClick={() => setImportStatementModalOpen(true)}
              >
                Import New Statement
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedAccount(null)}
              >
                Change Account
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
              </div>
            ) : (
              <Table>
                <thead>
                  <tr>
                    <th>Statement Date</th>
                    <th>Statement Number</th>
                    <th>Opening Balance</th>
                    <th>Closing Balance</th>
                    <th>Transactions</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {statements.map((statement) => (
                    <tr key={statement.id}>
                      <td>{new Date(statement.statementDate).toLocaleDateString()}</td>
                      <td className="font-mono">{statement.statementNumber}</td>
                      <td className="text-right">${statement.openingBalance.toLocaleString()}</td>
                      <td className="text-right">${statement.closingBalance.toLocaleString()}</td>
                      <td className="text-center">{statement.transactions.length}</td>
                      <td>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedStatement(statement);
                              startReconciliation();
                            }}
                          >
                            Reconcile
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedStatement(statement);
                              // View statement details
                            }}
                          >
                            View Details
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {!selectedAccount && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-600 mb-4">Select a bank account to view statements</p>
            <Button onClick={() => setActiveTab('accounts')}>
              Choose Account
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderReconciliationTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Reconciliation Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-600">
              Configure rules for automatic transaction matching
            </p>
            <Button onClick={() => setAddRuleModalOpen(true)}>
              Add Rule
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner />
            </div>
          ) : (
            <Table>
              <thead>
                <tr>
                  <th>Rule Name</th>
                  <th>Priority</th>
                  <th>Criteria</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reconciliationRules.map((rule) => (
                  <tr key={rule.id}>
                    <td className="font-semibold">{rule.ruleName}</td>
                    <td>{rule.priority}</td>
                    <td>
                      <div className="text-sm">
                        {rule.criteria.amountMatch && <Badge variant="secondary" className="mr-1">Amount</Badge>}
                        {rule.criteria.dateMatch && <Badge variant="secondary" className="mr-1">Date</Badge>}
                        {rule.criteria.descriptionMatch && <Badge variant="secondary" className="mr-1">Description</Badge>}
                        {rule.criteria.referenceMatch && <Badge variant="secondary">Reference</Badge>}
                      </div>
                    </td>
                    <td>
                      <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td>
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Bank Reconciliation</h2>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {[
            { id: 'accounts', label: 'Bank Accounts' },
            { id: 'statements', label: 'Statements' },
            { id: 'reconciliation', label: 'Reconciliation Rules' }
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
        {activeTab === 'accounts' && renderAccountsTab()}
        {activeTab === 'statements' && renderStatementsTab()}
        {activeTab === 'reconciliation' && renderReconciliationTab()}
      </div>

      {/* Add Bank Account Modal */}
      <Modal
        isOpen={addAccountModalOpen}
        onClose={() => setAddAccountModalOpen(false)}
        title="Add Bank Account"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Account Name</label>
              <Input
                value={accountForm.accountName}
                onChange={(e) => setAccountForm({ ...accountForm, accountName: e.target.value })}
                placeholder="Main Checking"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bank Name</label>
              <Input
                value={accountForm.bankName}
                onChange={(e) => setAccountForm({ ...accountForm, bankName: e.target.value })}
                placeholder="Bank of America"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Account Number</label>
              <Input
                value={accountForm.accountNumber}
                onChange={(e) => setAccountForm({ ...accountForm, accountNumber: e.target.value })}
                placeholder="****1234"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Account Type</label>
              <select
                value={accountForm.accountType}
                onChange={(e) => setAccountForm({ ...accountForm, accountType: e.target.value as any })}
                className="w-full p-2 border rounded-md"
              >
                <option value="checking">Checking</option>
                <option value="savings">Savings</option>
                <option value="credit">Credit</option>
                <option value="investment">Investment</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Opening Balance</label>
              <Input
                type="number"
                value={accountForm.openingBalance}
                onChange={(e) => setAccountForm({ ...accountForm, openingBalance: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Current Balance</label>
              <Input
                type="number"
                value={accountForm.currentBalance}
                onChange={(e) => setAccountForm({ ...accountForm, currentBalance: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAddAccountModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createBankAccount} disabled={loading}>
              {loading ? <LoadingSpinner /> : 'Add Account'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Import Statement Modal */}
      <Modal
        isOpen={importStatementModalOpen}
        onClose={() => setImportStatementModalOpen(false)}
        title="Import Bank Statement"
      >
        <div className="space-y-4">
          {selectedAccount && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Account: {selectedAccount.accountName}</p>
              <p className="text-sm text-gray-600">Bank: {selectedAccount.bankName}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Statement Date</label>
              <Input
                type="date"
                value={statementForm.statementDate}
                onChange={(e) => setStatementForm({ ...statementForm, statementDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Statement Number</label>
              <Input
                value={statementForm.statementNumber}
                onChange={(e) => setStatementForm({ ...statementForm, statementNumber: e.target.value })}
                placeholder="STMT-001"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Opening Balance</label>
              <Input
                type="number"
                value={statementForm.openingBalance}
                onChange={(e) => setStatementForm({ ...statementForm, openingBalance: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Closing Balance</label>
              <Input
                type="number"
                value={statementForm.closingBalance}
                onChange={(e) => setStatementForm({ ...statementForm, closingBalance: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Total Deposits</label>
              <Input
                type="number"
                value={statementForm.totalDeposits}
                onChange={(e) => setStatementForm({ ...statementForm, totalDeposits: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Total Withdrawals</label>
              <Input
                type="number"
                value={statementForm.totalWithdrawals}
                onChange={(e) => setStatementForm({ ...statementForm, totalWithdrawals: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setImportStatementModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={importBankStatement} disabled={loading}>
              {loading ? <LoadingSpinner /> : 'Import Statement'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reconciliation Modal */}
      <Modal
        isOpen={reconciliationModalOpen}
        onClose={() => setReconciliationModalOpen(false)}
        title="Bank Reconciliation"
      >
        <div className="space-y-6">
          {reconciliationSummary && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Total Transactions</p>
                <p className="text-lg font-semibold">{reconciliationSummary.totalTransactions}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Reconciled</p>
                <p className="text-lg font-semibold text-green-600">{reconciliationSummary.reconciledTransactions}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Unreconciled</p>
                <p className="text-lg font-semibold text-orange-600">{reconciliationSummary.unreconciledTransactions}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Reconciliation Rate</p>
                <p className="text-lg font-semibold">{reconciliationSummary.reconciliationRate.toFixed(1)}%</p>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={autoMatchTransactions} disabled={loading}>
              {loading ? <LoadingSpinner /> : 'Auto-Match Transactions'}
            </Button>
            <Button variant="outline">
              Manual Match
            </Button>
            <Button variant="outline">
              View Discrepancies
            </Button>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setReconciliationModalOpen(false)}>
              Close
            </Button>
            <Button>
              Complete Reconciliation
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Rule Modal */}
      <Modal
        isOpen={addRuleModalOpen}
        onClose={() => setAddRuleModalOpen(false)}
        title="Add Reconciliation Rule"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Rule Name</label>
            <Input
              value={ruleForm.ruleName}
              onChange={(e) => setRuleForm({ ...ruleForm, ruleName: e.target.value })}
              placeholder="Exact Amount Match"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={ruleForm.description}
              onChange={(e) => setRuleForm({ ...ruleForm, description: e.target.value })}
              className="w-full p-2 border rounded-md"
              rows={3}
              placeholder="Rule description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <Input
                type="number"
                value={ruleForm.priority}
                onChange={(e) => setRuleForm({ ...ruleForm, priority: parseInt(e.target.value) || 1 })}
                min="1"
                max="10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Min Confidence</label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={ruleForm.criteria.minConfidence}
                onChange={(e) => setRuleForm({
                  ...ruleForm,
                  criteria: { ...ruleForm.criteria, minConfidence: parseFloat(e.target.value) || 0.7 }
                })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Matching Criteria</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={ruleForm.criteria.amountMatch}
                  onChange={(e) => setRuleForm({
                    ...ruleForm,
                    criteria: { ...ruleForm.criteria, amountMatch: e.target.checked }
                  })}
                  className="mr-2"
                />
                Match by amount
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={ruleForm.criteria.dateMatch}
                  onChange={(e) => setRuleForm({
                    ...ruleForm,
                    criteria: { ...ruleForm.criteria, dateMatch: e.target.checked }
                  })}
                  className="mr-2"
                />
                Match by date
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={ruleForm.criteria.descriptionMatch}
                  onChange={(e) => setRuleForm({
                    ...ruleForm,
                    criteria: { ...ruleForm.criteria, descriptionMatch: e.target.checked }
                  })}
                  className="mr-2"
                />
                Match by description
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={ruleForm.criteria.referenceMatch}
                  onChange={(e) => setRuleForm({
                    ...ruleForm,
                    criteria: { ...ruleForm.criteria, referenceMatch: e.target.checked }
                  })}
                  className="mr-2"
                />
                Match by reference
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAddRuleModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createReconciliationRule} disabled={loading}>
              {loading ? <LoadingSpinner /> : 'Add Rule'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
} 