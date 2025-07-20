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
  Building,
  Calculator,
  Target,
  Activity,
  Layers
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { Table } from '@/components/ui/Table';

import { costingService } from '../services/costingService';
import { CostCenterForm } from './CostCenterForm';
import { ActivityForm } from './ActivityForm';
import { StandardCostForm } from './StandardCostForm';
import { ProcessCostForm } from './ProcessCostForm';
import { CostAllocationRuleForm } from './CostAllocationRuleForm';
import { 
  COST_CENTER_TYPES, 
  COST_CENTER_TYPE_COLORS, 
  COST_CATEGORIES,
  COST_CATEGORY_COLORS,
  VARIANCE_TYPES,
  VARIANCE_TYPE_COLORS,
  PROCESS_STATUS,
  PROCESS_STATUS_COLORS,
  STANDARD_COST_STATUS,
  STANDARD_COST_STATUS_COLORS
} from '../constants/costing';
import type { 
  CostCenter, 
  Activity, 
  StandardCost, 
  ProcessCost, 
  CostVariance,
  CostingAnalytics,
  CostingFilters
} from '../types/costing';

interface CostingDashboardProps {
  organizationId: string;
  isCostAccountant?: boolean;
  isCostManager?: boolean;
  isProductionManager?: boolean;
  isFinanceManager?: boolean;
  isAdmin?: boolean;
}

export const CostingDashboard: React.FC<CostingDashboardProps> = ({
  organizationId,
  isCostAccountant = false,
  isCostManager = false,
  isProductionManager = false,
  isFinanceManager = false,
  isAdmin = false,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<CostingAnalytics | null>(null);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [standardCosts, setStandardCosts] = useState<StandardCost[]>([]);
  const [processCosts, setProcessCosts] = useState<ProcessCost[]>([]);
  const [variances, setVariances] = useState<CostVariance[]>([]);
  const [filters, setFilters] = useState<CostingFilters>({
    page: 1,
    limit: 10,
  });
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [activeTab, setActiveTab] = useState<'overview' | 'cost-centers' | 'activities' | 'standard-costs' | 'process-costs' | 'variances'>('overview');
  
  // Modal states
  const [showCostCenterModal, setShowCostCenterModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showStandardCostModal, setShowStandardCostModal] = useState(false);
  const [showProcessCostModal, setShowProcessCostModal] = useState(false);
  const [showAllocationRuleModal, setShowAllocationRuleModal] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [analyticsData, costCentersData, activitiesData, standardCostsData, processCostsData, variancesData] = await Promise.all([
        costingService.getCostingAnalytics({
          date_from: getDateFromRange(selectedTimeRange),
          date_to: new Date().toISOString(),
        }),
        costingService.getCostCenters({
          ...filters,
          limit: 50,
        }),
        costingService.getActivities({
          ...filters,
          limit: 50,
        }),
        costingService.getStandardCosts({
          ...filters,
          limit: 20,
        }),
        costingService.getProcessCosts({
          ...filters,
          limit: 20,
        }),
        costingService.getCostVariances({
          ...filters,
          limit: 20,
        }),
      ]);

      setAnalytics(analyticsData);
      setCostCenters(costCentersData);
      setActivities(activitiesData);
      setStandardCosts(standardCostsData);
      setProcessCosts(processCostsData);
      setVariances(variancesData);
    } catch (error) {
      console.error('Failed to load costing dashboard data:', error);
      toast.error('Failed to load costing dashboard data');
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

  // Handle form submissions
  const handleCostCenterSubmit = async (data: any) => {
    try {
      await costingService.createCostCenter(data);
      setShowCostCenterModal(false);
      loadDashboardData();
    } catch (error) {
      console.error('Failed to create cost center:', error);
    }
  };

  const handleActivitySubmit = async (data: any) => {
    try {
      await costingService.createActivity(data);
      setShowActivityModal(false);
      loadDashboardData();
    } catch (error) {
      console.error('Failed to create activity:', error);
    }
  };

  const handleStandardCostSubmit = async (data: any) => {
    try {
      await costingService.createStandardCost(data);
      setShowStandardCostModal(false);
      loadDashboardData();
    } catch (error) {
      console.error('Failed to create standard cost:', error);
    }
  };

  const handleProcessCostSubmit = async (data: any) => {
    try {
      await costingService.createProcessCost(data);
      setShowProcessCostModal(false);
      loadDashboardData();
    } catch (error) {
      console.error('Failed to create process cost:', error);
    }
  };

  const handleAllocationRuleSubmit = async (data: any) => {
    try {
      await costingService.createCostAllocationRule(data);
      setShowAllocationRuleModal(false);
      loadDashboardData();
    } catch (error) {
      console.error('Failed to create allocation rule:', error);
    }
  };

  // Export data
  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      const reportData = {
        report_type: 'cost_center',
        date_range: {
          start_date: getDateFromRange(selectedTimeRange),
          end_date: new Date().toISOString(),
        },
        filters,
        export_format: format,
      };

      await costingService.generateCostReport(reportData);
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
            Costing Management Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive costing analysis and management for manufacturing operations
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
            onClick={() => setShowCostCenterModal(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Cost Center</span>
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'cost-centers', label: 'Cost Centers', icon: Building },
            { id: 'activities', label: 'Activities', icon: Activity },
            { id: 'standard-costs', label: 'Standard Costs', icon: Target },
            { id: 'process-costs', label: 'Process Costs', icon: Layers },
            { id: 'variances', label: 'Variances', icon: AlertTriangle },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && analytics && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Costs */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Costs
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    MYR {analytics.cost_trends[analytics.cost_trends.length - 1]?.total_costs?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-green-600">+8.2%</span>
                <span className="text-gray-600 dark:text-gray-400 ml-1">from last period</span>
              </div>
            </Card>

            {/* Cost Centers */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Active Cost Centers
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {costCenters.filter(cc => cc.is_active).length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                  <Building className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {costCenters.filter(cc => cc.type === 'production').length} production centers
                </span>
              </div>
            </Card>

            {/* Activities */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Active Activities
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {activities.filter(a => a.is_active).length}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {activities.filter(a => a.category === 'production').length} production activities
                </span>
              </div>
            </Card>

            {/* Variances */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Open Variances
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {variances.filter(v => v.status === 'open').length}
                  </p>
                </div>
                <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  MYR {variances.reduce((sum, v) => sum + Math.abs(v.variance_amount), 0).toFixed(2)} total variance
                </span>
              </div>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cost Center Performance */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Cost Center Performance
                </h3>
                <PieChart className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-3">
                {analytics.cost_center_performance?.slice(0, 5).map((cc) => (
                  <div key={cc.cost_center_id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {cc.cost_center_name}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        MYR {cc.total_costs.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {cc.efficiency_ratio.toFixed(1)}% efficiency
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Product Profitability */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Product Profitability
                </h3>
                <BarChart3 className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-3">
                {analytics.product_profitability?.slice(0, 5).map((product) => (
                  <div key={product.product_id} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {product.product_name}
                    </span>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500">
                        {product.gross_margin.toFixed(1)}% margin
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        MYR {product.gross_profit.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Cost Trends */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Cost Trends
              </h3>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {analytics.cost_trends?.slice(-6).map((trend) => (
                <div key={trend.period} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {new Date(trend.period).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      Direct: MYR {trend.direct_costs.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500">
                      Indirect: MYR {trend.indirect_costs.toFixed(2)}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Total: MYR {trend.total_costs.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Cost Centers Tab */}
      {activeTab === 'cost-centers' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Cost Centers
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
                  <th>Code</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Budget</th>
                  <th>Allocation Method</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {costCenters.map((costCenter) => (
                  <tr key={costCenter.id}>
                    <td className="font-medium">{costCenter.code}</td>
                    <td>{costCenter.name}</td>
                    <td>
                      <Badge
                        variant="outline"
                        color={COST_CENTER_TYPE_COLORS[costCenter.type]}
                      >
                        {costCenter.type}
                      </Badge>
                    </td>
                    <td>
                      <Badge
                        variant="outline"
                        color={COST_CATEGORY_COLORS[costCenter.category]}
                      >
                        {costCenter.category}
                      </Badge>
                    </td>
                    <td className="font-medium">
                      {costCenter.budget_currency} {costCenter.budget_amount.toFixed(2)}
                    </td>
                    <td>{costCenter.allocation_method}</td>
                    <td>
                      <Badge
                        variant="outline"
                        color={costCenter.is_active ? 'green' : 'gray'}
                      >
                        {costCenter.is_active ? 'Active' : 'Inactive'}
                      </Badge>
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
                        {(isCostManager || isAdmin) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {/* Edit */}}
                          >
                            Edit
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {costCenters.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No cost centers found
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Activities Tab */}
      {activeTab === 'activities' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Activities
            </h3>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowActivityModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Activity
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Cost Driver</th>
                  <th>Standard Rate</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((activity) => (
                  <tr key={activity.id}>
                    <td className="font-medium">{activity.code}</td>
                    <td>{activity.name}</td>
                    <td>{activity.type}</td>
                    <td>{activity.category}</td>
                    <td>{activity.cost_driver.name}</td>
                    <td className="font-medium">
                      {activity.cost_pool.currency} {activity.standard_rate.toFixed(2)}
                    </td>
                    <td>
                      <Badge
                        variant="outline"
                        color={activity.is_active ? 'green' : 'gray'}
                      >
                        {activity.is_active ? 'Active' : 'Inactive'}
                      </Badge>
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
                        {(isCostManager || isAdmin) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {/* Edit */}}
                          >
                            Edit
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {activities.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No activities found
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Standard Costs Tab */}
      {activeTab === 'standard-costs' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Standard Costs
            </h3>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStandardCostModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Standard Cost
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Cost Center</th>
                  <th>Total Standard Cost</th>
                  <th>Total Actual Cost</th>
                  <th>Variance</th>
                  <th>Status</th>
                  <th>Effective Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {standardCosts.map((standardCost) => (
                  <tr key={standardCost.id}>
                    <td className="font-medium">{standardCost.product_id}</td>
                    <td>{standardCost.cost_center_id}</td>
                    <td className="font-medium">
                      MYR {standardCost.total_standard_cost.toFixed(2)}
                    </td>
                    <td>
                      MYR {standardCost.total_actual_cost.toFixed(2)}
                    </td>
                    <td>
                      <span className={`font-medium ${
                        standardCost.variance >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        MYR {standardCost.variance.toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <Badge
                        variant="outline"
                        color={STANDARD_COST_STATUS_COLORS[standardCost.status]}
                      >
                        {standardCost.status}
                      </Badge>
                    </td>
                    <td>
                      {new Date(standardCost.effective_date).toLocaleDateString()}
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
                        {(isCostManager || isAdmin) && standardCost.status === 'draft' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {/* Edit */}}
                          >
                            Edit
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {standardCosts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No standard costs found
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Process Costs Tab */}
      {activeTab === 'process-costs' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Process Costs
            </h3>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowProcessCostModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Process Cost
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <thead>
                <tr>
                  <th>Process</th>
                  <th>Type</th>
                  <th>Stage</th>
                  <th>Total Cost</th>
                  <th>Units Completed</th>
                  <th>Cost per Unit</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {processCosts.map((processCost) => (
                  <tr key={processCost.id}>
                    <td className="font-medium">{processCost.process_name}</td>
                    <td>{processCost.process_type}</td>
                    <td>{processCost.process_stage}/{processCost.total_stages}</td>
                    <td className="font-medium">
                      MYR {processCost.current_period_costs.total.toFixed(2)}
                    </td>
                    <td>{processCost.units_completed}</td>
                    <td>
                      MYR {processCost.cost_per_equivalent_unit.total.toFixed(2)}
                    </td>
                    <td>
                      <Badge
                        variant="outline"
                        color={PROCESS_STATUS_COLORS[processCost.status]}
                      >
                        {processCost.status}
                      </Badge>
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
                        {(isProductionManager || isAdmin) && processCost.status === 'in_progress' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {/* Edit */}}
                          >
                            Edit
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {processCosts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No process costs found
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Variances Tab */}
      {activeTab === 'variances' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Cost Variances
            </h3>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllocationRuleModal(true)}
              >
                <Calculator className="w-4 h-4 mr-2" />
                Allocation Rules
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Cost Center</th>
                  <th>Period</th>
                  <th>Standard Cost</th>
                  <th>Actual Cost</th>
                  <th>Variance</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {variances.map((variance) => (
                  <tr key={variance.id}>
                    <td>
                      <Badge
                        variant="outline"
                        color={VARIANCE_TYPE_COLORS[variance.variance_type]}
                      >
                        {variance.variance_type}
                      </Badge>
                    </td>
                    <td>{variance.cost_center_id}</td>
                    <td>
                      {new Date(variance.period).toLocaleDateString()}
                    </td>
                    <td className="font-medium">
                      MYR {variance.standard_cost.toFixed(2)}
                    </td>
                    <td>
                      MYR {variance.actual_cost.toFixed(2)}
                    </td>
                    <td>
                      <span className={`font-medium ${
                        variance.is_favorable ? 'text-green-600' : 'text-red-600'
                      }`}>
                        MYR {variance.variance_amount.toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <Badge
                        variant="outline"
                        color={variance.status === 'open' ? 'red' : 
                               variance.status === 'investigating' ? 'yellow' : 
                               variance.status === 'resolved' ? 'green' : 'gray'}
                      >
                        {variance.status}
                      </Badge>
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
                        {(isCostManager || isAdmin) && variance.status === 'open' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {/* Investigate */}}
                          >
                            Investigate
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {variances.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No variances found
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Modals */}
      <Modal
        isOpen={showCostCenterModal}
        onClose={() => setShowCostCenterModal(false)}
        title="New Cost Center"
        size="lg"
      >
        <CostCenterForm
          onSubmit={handleCostCenterSubmit}
          onCancel={() => setShowCostCenterModal(false)}
          organizationId={organizationId}
        />
      </Modal>

      <Modal
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        title="New Activity"
        size="lg"
      >
        <ActivityForm
          onSubmit={handleActivitySubmit}
          onCancel={() => setShowActivityModal(false)}
          organizationId={organizationId}
          costCenters={costCenters}
        />
      </Modal>

      <Modal
        isOpen={showStandardCostModal}
        onClose={() => setShowStandardCostModal(false)}
        title="New Standard Cost"
        size="xl"
      >
        <StandardCostForm
          onSubmit={handleStandardCostSubmit}
          onCancel={() => setShowStandardCostModal(false)}
          organizationId={organizationId}
          costCenters={costCenters}
          activities={activities}
        />
      </Modal>

      <Modal
        isOpen={showProcessCostModal}
        onClose={() => setShowProcessCostModal(false)}
        title="New Process Cost"
        size="lg"
      >
        <ProcessCostForm
          onSubmit={handleProcessCostSubmit}
          onCancel={() => setShowProcessCostModal(false)}
          organizationId={organizationId}
          costCenters={costCenters}
        />
      </Modal>

      <Modal
        isOpen={showAllocationRuleModal}
        onClose={() => setShowAllocationRuleModal(false)}
        title="Cost Allocation Rules"
        size="lg"
      >
        <CostAllocationRuleForm
          onSubmit={handleAllocationRuleSubmit}
          onCancel={() => setShowAllocationRuleModal(false)}
          organizationId={organizationId}
          costCenters={costCenters}
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
              Cost Center Type
            </label>
            <select
              value={filters.cost_type || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, cost_type: e.target.value || undefined }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              <option value="">All Types</option>
              {Object.entries(COST_CENTER_TYPES).map(([key, value]) => (
                <option key={key} value={value}>{value}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={filters.category || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value || undefined }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              <option value="">All Categories</option>
              {Object.entries(COST_CATEGORIES).map(([key, value]) => (
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