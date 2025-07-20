'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Plus,
  Filter,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  Calendar,
  Users,
  Building
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { Table } from '@/components/ui/Table';

import { expenseService } from '../services/expenseService';
import { ExpenseClaimForm } from './ExpenseClaimForm';
import { EXPENSE_STATUS, EXPENSE_PRIORITY, EXPENSE_STATUS_COLORS } from '../constants/expense';
import type { 
  ExpenseClaim, 
  ExpenseAnalytics, 
  ExpenseFilters,
  ExpenseCategory,
  ExpensePolicy,
  ExpenseBudget
} from '../types/expense';

interface ExpenseDashboardProps {
  employeeId?: string;
  isManager?: boolean;
  isFinance?: boolean;
  isAdmin?: boolean;
}

export const ExpenseDashboard: React.FC<ExpenseDashboardProps> = ({
  employeeId,
  isManager = false,
  isFinance = false,
  isAdmin = false,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<ExpenseAnalytics | null>(null);
  const [recentClaims, setRecentClaims] = useState<ExpenseClaim[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [policies, setPolicies] = useState<ExpensePolicy[]>([]);
  const [budgets, setBudgets] = useState<ExpenseBudget[]>([]);
  const [filters, setFilters] = useState<ExpenseFilters>({
    page: 1,
    limit: 10,
  });
  const [showNewClaimModal, setShowNewClaimModal] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [analyticsData, claimsData, categoriesData, policiesData, budgetsData] = await Promise.all([
        expenseService.getExpenseAnalytics({
          date_from: getDateFromRange(selectedTimeRange),
          date_to: new Date().toISOString(),
        }),
        expenseService.getExpenseClaims({
          ...filters,
          limit: 10,
        }),
        expenseService.getExpenseCategories(),
        expenseService.getExpensePolicies(),
        expenseService.getExpenseBudgets(),
      ]);

      setAnalytics(analyticsData);
      setRecentClaims(claimsData);
      setCategories(categoriesData);
      setPolicies(policiesData);
      setBudgets(budgetsData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, [filters, selectedTimeRange]);

  // Get date from time range
  const getDateFromRange = (range: string): string => {
    const now = new Date();
    switch (range) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
      case '1y':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    }
  };

  // Handle new claim submission
  const handleNewClaim = async (data: any) => {
    try {
      await expenseService.createExpenseClaim(data);
      setShowNewClaimModal(false);
      loadDashboardData();
    } catch (error) {
      console.error('Failed to create expense claim:', error);
    }
  };

  // Handle claim status update
  const handleStatusUpdate = async (claimId: string, status: string) => {
    try {
      await expenseService.updateExpenseClaim(claimId, { status });
      loadDashboardData();
      toast.success('Claim status updated successfully');
    } catch (error) {
      toast.error('Failed to update claim status');
    }
  };

  // Export data
  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      const reportData = {
        report_type: 'custom',
        date_range: {
          start_date: getDateFromRange(selectedTimeRange),
          end_date: new Date().toISOString(),
        },
        filters,
        export_format: format,
      };

      await expenseService.generateExpenseReport(reportData);
      toast.success(`Export completed successfully`);
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  // Load data on mount and when filters change
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Expense Management Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor and manage expense claims and analytics
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowFiltersModal(true)}
            className="flex items-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </Button>

          <div className="relative">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>

          <Button
            onClick={() => setShowNewClaimModal(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Claim</span>
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Spent */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Spent
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  MYR {analytics.processing_metrics?.total_spent?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-green-600">+12.5%</span>
              <span className="text-gray-600 dark:text-gray-400 ml-1">from last period</span>
            </div>
          </Card>

          {/* Pending Claims */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Pending Claims
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.processing_metrics?.pending_claims || 0}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Average processing time: {analytics.processing_metrics?.average_approval_time || 0} days
              </span>
            </div>
          </Card>

          {/* Approval Rate */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Approval Rate
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {((analytics.processing_metrics?.approval_rate || 0) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {analytics.processing_metrics?.rejection_rate ? 
                  `${((analytics.processing_metrics.rejection_rate) * 100).toFixed(1)}% rejected` : 
                  '0% rejected'
                }
              </span>
            </div>
          </Card>

          {/* Compliance Rate */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Compliance Rate
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {((analytics.compliance_metrics?.compliance_rate || 0) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                <AlertTriangle className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {analytics.compliance_metrics?.non_compliant_claims || 0} violations
              </span>
            </div>
          </Card>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending by Category */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Spending by Category
            </h3>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {analytics?.category_spending?.slice(0, 5).map((category) => (
              <div key={category.category_id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {category.category_name}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    MYR {category.total_spent.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {category.claim_count} claims
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Monthly Trends */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Monthly Trends
            </h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {analytics?.monthly_trends?.slice(-6).map((trend) => (
              <div key={trend.month} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {new Date(trend.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    {trend.claim_count} claims
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    MYR {trend.total_spent.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Claims Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Claims
          </h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadDashboardData}
              className="flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('excel')}
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <thead>
              <tr>
                <th>Claim #</th>
                <th>Employee</th>
                <th>Title</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentClaims.map((claim) => (
                <tr key={claim.id}>
                  <td className="font-medium">{claim.claim_number}</td>
                  <td>{claim.submitted_by}</td>
                  <td className="max-w-xs truncate">{claim.title}</td>
                  <td className="font-medium">
                    {claim.currency} {claim.total_amount.toFixed(2)}
                  </td>
                  <td>
                    <Badge
                      variant="outline"
                      color={EXPENSE_STATUS_COLORS[claim.status]}
                    >
                      {claim.status}
                    </Badge>
                  </td>
                  <td>
                    <Badge
                      variant="outline"
                      color={claim.priority === 'urgent' ? 'red' : 
                             claim.priority === 'high' ? 'orange' : 
                             claim.priority === 'medium' ? 'blue' : 'gray'}
                    >
                      {claim.priority}
                    </Badge>
                  </td>
                  <td>
                    {new Date(claim.submitted_at).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {/* View details */}}
                      >
                        View
                      </Button>
                      {(isManager || isFinance) && claim.status === 'submitted' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {/* Approve */}}
                        >
                          Approve
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {recentClaims.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              No expense claims found
            </p>
          </div>
        )}
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Policy Compliance */}
        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <Building className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active Policies
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {policies.filter(p => p.is_active).length}
              </p>
            </div>
          </div>
        </Card>

        {/* Budget Status */}
        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active Budgets
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {budgets.filter(b => b.is_active).length}
              </p>
            </div>
          </div>
        </Card>

        {/* Categories */}
        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Categories
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {categories.filter(c => c.is_active).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* New Claim Modal */}
      <Modal
        isOpen={showNewClaimModal}
        onClose={() => setShowNewClaimModal(false)}
        title="New Expense Claim"
        size="lg"
      >
        <ExpenseClaimForm
          onSubmit={handleNewClaim}
          onCancel={() => setShowNewClaimModal(false)}
          categories={categories}
          employeeId={employeeId || ''}
        />
      </Modal>

      {/* Filters Modal */}
      <Modal
        isOpen={showFiltersModal}
        onClose={() => setShowFiltersModal(false)}
        title="Filter Options"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={filters.status || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value || undefined }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              <option value="">All Statuses</option>
              {Object.entries(EXPENSE_STATUS).map(([key, value]) => (
                <option key={key} value={value}>{value}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Priority
            </label>
            <select
              value={filters.priority || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value || undefined }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              <option value="">All Priorities</option>
              {Object.entries(EXPENSE_PRIORITY).map(([key, value]) => (
                <option key={key} value={value}>{value}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date From
              </label>
              <input
                type="date"
                value={filters.date_from || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value || undefined }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date To
              </label>
              <input
                type="date"
                value={filters.date_to || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, date_to: e.target.value || undefined }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setFilters({ page: 1, limit: 10 });
                setShowFiltersModal(false);
              }}
            >
              Clear Filters
            </Button>
            <Button
              onClick={() => setShowFiltersModal(false)}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}; 