'use client'

import { useState, useEffect } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  FileText, 
  Settings,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Search,
  Bell,
  Calendar,
  Activity,
  CreditCard,
  PieChart
} from 'lucide-react'
import { DashboardLayout } from '../components/layouts/dashboard-layout'
import { MetricCard } from '../components/ui/MetricCard'
import { EnhancedQuickActions } from '../components/dashboard/enhanced-quick-actions'
import { RecentActivity } from '../components/dashboard/recent-activity'
import { DashboardSection } from '../components/ui/DashboardSection'
import { RevenueExpensesTable } from '../components/ui/RevenueExpensesTable'
import { RevenueExpensesChart } from '../components/ui/RevenueExpensesChart'
import { LuxuryTabs } from '../components/ui/LuxuryTabs'
import { AppleStyleTable } from '../components/ui/AppleStyleTable'

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  const metrics = [
    {
      title: 'Total Revenue',
      value: '$124,500',
      change: { value: 12.5, isPositive: true, period: 'month' as const },
      icon: <TrendingUp className="h-5 w-5" />,
      info: 'Total revenue for the current month.'
    },
    {
      title: 'Pending Invoices',
      value: '23',
      change: { value: 0, isPositive: true, period: 'month' as const },
      icon: <FileText className="h-5 w-5" />,
      info: 'Number of invoices awaiting payment.'
    },
    {
      title: 'Overdue Amount',
      value: '$8,450',
      change: { value: 5.2, isPositive: false, period: 'month' as const },
      icon: <ArrowDownRight className="h-5 w-5" />,
      info: 'Total amount overdue for payment.'
    },
    {
      title: 'Active Customers',
      value: '156',
      change: { value: 8.7, isPositive: true, period: 'month' as const },
      icon: <Users className="h-5 w-5" />,
      info: 'Number of active customers this month.'
    }
  ]

  const chartData = [
    { label: 'Jan', revenue: 12000, expenses: 8000 },
    { label: 'Feb', revenue: 15000, expenses: 9000 },
    { label: 'Mar', revenue: 18000, expenses: 11000 },
    { label: 'Apr', revenue: 14000, expenses: 8500 },
    { label: 'May', revenue: 22000, expenses: 12000 },
    { label: 'Jun', revenue: 25000, expenses: 14000 },
  ]

  const activities = [
    {
      id: '1',
      type: 'journal_entry' as const,
      description: 'Created journal entry JE-001',
      amount: 5000,
      date: '2024-01-15',
      user: 'John Doe'
    },
    {
      id: '2',
      type: 'invoice' as const,
      description: 'Generated invoice INV-2024-001',
      amount: 2500,
      date: '2024-01-14',
      user: 'Jane Smith'
    },
    {
      id: '3',
      type: 'payment' as const,
      description: 'Received payment for INV-2024-001',
      amount: 2500,
      date: '2024-01-13',
      user: 'Mike Johnson'
    },
    {
      id: '4',
      type: 'bill' as const,
      description: 'Processed vendor bill VB-2024-001',
      amount: 1200,
      date: '2024-01-12',
      user: 'Sarah Wilson'
    }
  ]

  // Sample data for Apple-style table
  const tableData = [
    { id: '1', customer: 'Acme Corp', amount: 25000, status: 'Paid', date: '2024-01-15', method: 'Credit Card' },
    { id: '2', customer: 'TechStart Inc', amount: 15000, status: 'Pending', date: '2024-01-14', method: 'Bank Transfer' },
    { id: '3', customer: 'Global Solutions', amount: 35000, status: 'Overdue', date: '2024-01-10', method: 'Check' },
    { id: '4', customer: 'Innovation Labs', amount: 18000, status: 'Paid', date: '2024-01-12', method: 'Credit Card' },
    { id: '5', customer: 'Future Systems', amount: 22000, status: 'Pending', date: '2024-01-13', method: 'Bank Transfer' },
  ]

  const tableColumns = [
    { key: 'customer', label: 'Customer', sortable: true },
    { 
      key: 'amount', 
      label: 'Amount', 
      sortable: true,
      formatter: (value: number) => `$${value.toLocaleString()}`
    },
    { 
      key: 'status', 
      label: 'Status', 
      sortable: true,
      formatter: (value: string) => (
        <span className={`
          px-2 py-1 rounded-full text-xs font-medium
          ${value === 'Paid' ? 'bg-green-500/20 text-green-400' : ''}
          ${value === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' : ''}
          ${value === 'Overdue' ? 'bg-red-500/20 text-red-400' : ''}
        `}>
          {value}
        </span>
      )
    },
    { key: 'date', label: 'Date', sortable: true },
    { key: 'method', label: 'Payment Method', sortable: true },
  ]

  const tabItems = [
    {
      key: 'overview',
      label: 'Financial Overview',
      icon: <BarChart3 className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenueExpensesTable data={chartData} />
            <RevenueExpensesChart data={chartData} />
          </div>
        </div>
      )
    },
    {
      key: 'transactions',
      label: 'Recent Transactions',
      icon: <CreditCard className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <AppleStyleTable
            columns={tableColumns}
            data={tableData}
            searchable={true}
            className="animate-apple-fade"
          />
        </div>
      )
    },
    {
      key: 'analytics',
      label: 'Analytics',
      icon: <PieChart className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card">
              <div className="text-sm text-muted-foreground">Growth Rate</div>
              <div className="text-2xl font-bold text-neon-green">+12.5%</div>
              <div className="text-xs text-muted-foreground mt-1">vs last month</div>
            </div>
            <div className="glass-card">
              <div className="text-sm text-muted-foreground">Conversion Rate</div>
              <div className="text-2xl font-bold text-neon-blue">8.2%</div>
              <div className="text-xs text-muted-foreground mt-1">lead to customer</div>
            </div>
            <div className="glass-card">
              <div className="text-sm text-muted-foreground">Customer ROI</div>
              <div className="text-2xl font-bold text-neon-pink">156%</div>
              <div className="text-xs text-muted-foreground mt-1">lifetime value</div>
            </div>
          </div>
          
          <div className="glass-card">
            <h3 className="text-lg font-semibold mb-4">Performance Trends</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-neon-green">98%</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-neon-blue">2.3s</div>
                <div className="text-sm text-muted-foreground">Avg Response</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-neon-pink">1,247</div>
                <div className="text-sm text-muted-foreground">Transactions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">99.9%</div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'insights',
      label: 'Insights',
      icon: <Activity className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card">
              <h3 className="text-lg font-semibold mb-4">Top Revenue Sources</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Software Licenses</span>
                  <span className="font-semibold text-neon-green">$45,230</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Consulting</span>
                  <span className="font-semibold text-neon-blue">$32,150</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Support</span>
                  <span className="font-semibold text-neon-pink">$18,420</span>
                </div>
              </div>
            </div>
            
            <div className="glass-card">
              <h3 className="text-lg font-semibold mb-4">Recent Milestones</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-neon-green rounded-full"></div>
                  <span className="text-sm">Reached 1000 customers</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-neon-blue rounded-full"></div>
                  <span className="text-sm">Launched mobile app</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-neon-pink rounded-full"></div>
                  <span className="text-sm">Achieved 99.9% uptime</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
  ]

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-green"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-apple-fade">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-light tracking-tight text-foreground">
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Welcome back! Here's what's happening with your business today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-apple-secondary">
              <Calendar className="h-4 w-4 mr-2" />
              Today
            </button>
            <button className="btn-apple-primary">
              <Plus className="h-4 w-4 mr-2" />
              New Transaction
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <MetricCard
              key={metric.title}
              {...metric}
              className="animate-apple-fade"
              style={{ animationDelay: `${index * 100}ms` }}
            />
          ))}
        </div>

        {/* Quick Actions */}
        <EnhancedQuickActions />

        {/* Main Content Tabs */}
        <LuxuryTabs items={tabItems} />

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <DashboardSection
              title="Recent Activity"
              icon={<Activity className="h-5 w-5" />}
              className="animate-apple-fade"
              style={{ animationDelay: '400ms' }}
            >
              <RecentActivity activities={activities} />
            </DashboardSection>
          </div>
          
          <div>
            <DashboardSection
              title="Quick Stats"
              icon={<BarChart3 className="h-5 w-5" />}
              className="animate-apple-fade"
              style={{ animationDelay: '500ms' }}
            >
              <div className="space-y-4">
                <div className="glass-card">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">This Month</span>
                    <span className="text-lg font-semibold text-neon-green">+$24,500</span>
                  </div>
                </div>
                <div className="glass-card">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Pending</span>
                    <span className="text-lg font-semibold text-neon-yellow">$8,450</span>
                  </div>
                </div>
                <div className="glass-card">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Overdue</span>
                    <span className="text-lg font-semibold text-red-400">$2,100</span>
                  </div>
                </div>
              </div>
            </DashboardSection>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 