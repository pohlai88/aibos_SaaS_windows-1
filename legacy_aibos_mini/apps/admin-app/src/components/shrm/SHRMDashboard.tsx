'use client'

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  Download,
  Upload,
  Settings,
  RefreshCw,
  UserPlus,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  PieChart,
  MapPin,
  Phone,
  Mail,
  Building,
  Award,
  Target,
  Activity
} from 'lucide-react';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  position: string;
  department: string;
  employment_status: string;
  hire_date: string;
  salary: number;
  currency: string;
  performance_rating?: number;
  annual_leave_balance: number;
  sick_leave_balance: number;
  created_at: string;
}

interface EmployeeStats {
  totalEmployees: number;
  activeEmployees: number;
  newHires: number;
  turnoverRate: number;
  averageSalary: number;
  departments: number;
  byDepartment: Record<string, number>;
  byStatus: Record<string, number>;
  byPosition: Record<string, number>;
}

interface PayrollRecord {
  id: string;
  employee_id: string;
  pay_period_start: string;
  pay_period_end: string;
  pay_date: string;
  basic_salary: number;
  gross_pay: number;
  net_pay: number;
  currency: string;
  status: string;
  created_at: string;
}

interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  days_requested: number;
  reason?: string;
  status: string;
  created_at: string;
}

const SHRMDashboard: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [stats, setStats] = useState<EmployeeStats | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddEmployee, setShowAddEmployee] = useState(false);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockEmployees: Employee[] = [
      {
        id: '1',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@company.com',
        phone: '+60123456789',
        position: 'Software Engineer',
        department: 'Information Technology',
        employment_status: 'active',
        hire_date: '2024-01-15',
        salary: 75000,
        currency: 'MYR',
        performance_rating: 4.2,
        annual_leave_balance: 15,
        sick_leave_balance: 10,
        created_at: '2024-01-15'
      },
      {
        id: '2',
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@company.com',
        phone: '+60123456790',
        position: 'HR Manager',
        department: 'Human Resources',
        employment_status: 'active',
        hire_date: '2023-06-01',
        salary: 85000,
        currency: 'MYR',
        performance_rating: 4.5,
        annual_leave_balance: 12,
        sick_leave_balance: 8,
        created_at: '2023-06-01'
      },
      {
        id: '3',
        first_name: 'Mike',
        last_name: 'Johnson',
        email: 'mike.johnson@company.com',
        phone: '+60123456791',
        position: 'Financial Analyst',
        department: 'Finance',
        employment_status: 'active',
        hire_date: '2024-03-01',
        salary: 65000,
        currency: 'MYR',
        performance_rating: 3.8,
        annual_leave_balance: 20,
        sick_leave_balance: 12,
        created_at: '2024-03-01'
      }
    ];

    const mockPayrollRecords: PayrollRecord[] = [
      {
        id: '1',
        employee_id: '1',
        pay_period_start: '2024-01-01',
        pay_period_end: '2024-01-31',
        pay_date: '2024-02-01',
        basic_salary: 75000,
        gross_pay: 75000,
        net_pay: 63750,
        currency: 'MYR',
        status: 'paid',
        created_at: '2024-02-01'
      }
    ];

    const mockLeaveRequests: LeaveRequest[] = [
      {
        id: '1',
        employee_id: '1',
        leave_type: 'annual',
        start_date: '2024-02-15',
        end_date: '2024-02-17',
        days_requested: 3,
        reason: 'Family vacation',
        status: 'approved',
        created_at: '2024-01-20'
      }
    ];

    const mockStats: EmployeeStats = {
      totalEmployees: 3,
      activeEmployees: 3,
      newHires: 1,
      turnoverRate: 2.5,
      averageSalary: 75000,
      departments: 3,
      byDepartment: {
        'Information Technology': 1,
        'Human Resources': 1,
        'Finance': 1
      },
      byStatus: {
        'active': 3
      },
      byPosition: {
        'Software Engineer': 1,
        'HR Manager': 1,
        'Financial Analyst': 1
      }
    };

    setEmployees(mockEmployees);
    setPayrollRecords(mockPayrollRecords);
    setLeaveRequests(mockLeaveRequests);
    setStats(mockStats);
    setLoading(false);
  }, []);

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      emp.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = filterDepartment === 'all' || emp.department === filterDepartment;
    const matchesStatus = filterStatus === 'all' || emp.employment_status === filterStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const departments = ['all', ...Array.from(new Set(employees.map(emp => emp.department)))];
  const statuses = ['all', ...Array.from(new Set(employees.map(emp => emp.employment_status)))];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-yellow-600 bg-yellow-100';
      case 'terminated': return 'text-red-600 bg-red-100';
      case 'probation': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPerformanceColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-blue-600';
    if (rating >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getLeaveStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin h-8 w-8 text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="h-8 w-8 text-green-600" />
              Strategic Human Resource Management
            </h1>
            <p className="text-gray-600 mt-2">
              Comprehensive employee lifecycle management with SEA compliance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowAddEmployee(true)}
              className="btn-primary flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Add Employee
            </button>
            <button className="btn-secondary flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalEmployees}</p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Employees</p>
              <p className="text-2xl font-bold text-green-600">{stats?.activeEmployees}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">New Hires (30d)</p>
              <p className="text-2xl font-bold text-blue-600">{stats?.newHires}</p>
            </div>
            <UserPlus className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Salary</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats?.averageSalary ? `MYR ${stats.averageSalary.toLocaleString()}` : 'N/A'}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'employees', name: 'Employees', icon: Users },
              { id: 'payroll', name: 'Payroll', icon: DollarSign },
              { id: 'leave', name: 'Leave Management', icon: Calendar },
              { id: 'performance', name: 'Performance', icon: TrendingUp },
              { id: 'reports', name: 'Reports', icon: FileText }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Employee Distribution by Department */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Employees by Department
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(stats?.byDepartment || {}).map(([dept, count]) => (
                      <div key={dept} className="flex items-center justify-between">
                        <span className="font-medium">{dept}</span>
                        <span className="text-gray-600">{count} employees</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Employee Distribution by Status */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Employees by Status
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(stats?.byStatus || {}).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <span className="font-medium capitalize">{status}</span>
                        <span className="text-gray-600">{count} employees</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-blue-800">
                    <UserPlus className="h-4 w-4" />
                    <span>New employee Mike Johnson joined Finance department</span>
                    <span className="text-sm text-blue-600">2 days ago</span>
                  </div>
                  <div className="flex items-center gap-3 text-blue-800">
                    <Calendar className="h-4 w-4" />
                    <span>Leave request approved for John Doe</span>
                    <span className="text-sm text-blue-600">1 week ago</span>
                  </div>
                  <div className="flex items-center gap-3 text-blue-800">
                    <DollarSign className="h-4 w-4" />
                    <span>Payroll processed for January 2024</span>
                    <span className="text-sm text-blue-600">2 weeks ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Employees Tab */}
          {activeTab === 'employees' && (
            <div className="space-y-6">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search employees..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>
                      {dept === 'all' ? 'All Departments' : dept}
                    </option>
                  ))}
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>
                      {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Employees Table */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Employee
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Position
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Performance
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Leave Balance
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Salary
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredEmployees.map((employee) => (
                        <tr key={employee.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                  <span className="text-sm font-medium text-green-800">
                                    {employee.first_name[0]}{employee.last_name[0]}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {employee.first_name} {employee.last_name}
                                </div>
                                <div className="text-sm text-gray-500">{employee.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{employee.position}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{employee.department}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(employee.employment_status)}`}>
                              {employee.employment_status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {employee.performance_rating ? (
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-medium ${getPerformanceColor(employee.performance_rating)}`}>
                                  {employee.performance_rating}/5.0
                                </span>
                                <Award className="h-4 w-4 text-yellow-500" />
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">Not rated</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              <div>Annual: {employee.annual_leave_balance}</div>
                              <div>Sick: {employee.sick_leave_balance}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {employee.currency} {employee.salary.toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedEmployee(employee)}
                                className="text-green-600 hover:text-green-900"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button className="text-blue-600 hover:text-blue-900">
                                <Edit className="h-4 w-4" />
                              </button>
                              <button className="text-red-600 hover:text-red-900">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Payroll Tab */}
          {activeTab === 'payroll' && (
            <div className="space-y-6">
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Payroll Management
                </h3>
                <p className="text-green-800 mb-4">
                  Automated payroll processing with tax calculations and SEA compliance.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">MYR 225,000</div>
                    <div className="text-sm text-gray-600">Total Payroll</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">3</div>
                    <div className="text-sm text-gray-600">Employees</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">MYR 75,000</div>
                    <div className="text-sm text-gray-600">Average Salary</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Leave Management Tab */}
          {activeTab === 'leave' && (
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Leave Management
                </h3>
                <p className="text-blue-800 mb-4">
                  Track leave requests, approvals, and balances across all employees.
                </p>
                <div className="space-y-4">
                  {leaveRequests.map((request) => (
                    <div key={request.id} className="bg-white rounded-lg p-4 border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">
                            {employees.find(emp => emp.id === request.employee_id)?.first_name} {employees.find(emp => emp.id === request.employee_id)?.last_name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {request.leave_type} leave - {request.days_requested} days
                          </div>
                          <div className="text-sm text-gray-500">
                            {request.start_date} to {request.end_date}
                          </div>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLeaveStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === 'performance' && (
            <div className="space-y-6">
              <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Management
                </h3>
                <p className="text-purple-800 mb-4">
                  Track employee performance, conduct reviews, and manage career development.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-lg font-semibold text-gray-900 mb-2">Performance Ratings</div>
                    <div className="space-y-2">
                      {employees.map((employee) => (
                        <div key={employee.id} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            {employee.first_name} {employee.last_name}
                          </span>
                          <span className={`text-sm font-medium ${getPerformanceColor(employee.performance_rating || 0)}`}>
                            {employee.performance_rating ? `${employee.performance_rating}/5.0` : 'Not rated'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-lg font-semibold text-gray-900 mb-2">Upcoming Reviews</div>
                    <div className="text-sm text-gray-600">
                      No upcoming performance reviews scheduled.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
                <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  HR Reports & Analytics
                </h3>
                <p className="text-orange-800 mb-4">
                  Generate comprehensive reports for compliance, analytics, and decision-making.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <button className="bg-white rounded-lg p-4 border border-orange-200 hover:bg-orange-50 transition-colors">
                    <div className="text-lg font-semibold text-gray-900">Employee Report</div>
                    <div className="text-sm text-gray-600">Complete employee listing</div>
                  </button>
                  <button className="bg-white rounded-lg p-4 border border-orange-200 hover:bg-orange-50 transition-colors">
                    <div className="text-lg font-semibold text-gray-900">Payroll Report</div>
                    <div className="text-sm text-gray-600">Salary and tax summary</div>
                  </button>
                  <button className="bg-white rounded-lg p-4 border border-orange-200 hover:bg-orange-50 transition-colors">
                    <div className="text-lg font-semibold text-gray-900">Leave Report</div>
                    <div className="text-sm text-gray-600">Leave usage and balances</div>
                  </button>
                  <button className="bg-white rounded-lg p-4 border border-orange-200 hover:bg-orange-50 transition-colors">
                    <div className="text-lg font-semibold text-gray-900">Performance Report</div>
                    <div className="text-sm text-gray-600">Performance ratings and reviews</div>
                  </button>
                  <button className="bg-white rounded-lg p-4 border border-orange-200 hover:bg-orange-50 transition-colors">
                    <div className="text-lg font-semibold text-gray-900">Turnover Report</div>
                    <div className="text-sm text-gray-600">Employee retention analysis</div>
                  </button>
                  <button className="bg-white rounded-lg p-4 border border-orange-200 hover:bg-orange-50 transition-colors">
                    <div className="text-lg font-semibold text-gray-900">Compliance Report</div>
                    <div className="text-sm text-gray-600">Regulatory compliance status</div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedEmployee.first_name} {selectedEmployee.last_name}
                </h2>
                <button
                  onClick={() => setSelectedEmployee(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-gray-900">{selectedEmployee.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Phone</label>
                  <p className="text-gray-900">{selectedEmployee.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Position</label>
                  <p className="text-gray-900">{selectedEmployee.position}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Department</label>
                  <p className="text-gray-900">{selectedEmployee.department}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedEmployee.employment_status)}`}>
                    {selectedEmployee.employment_status}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Hire Date</label>
                  <p className="text-gray-900">{selectedEmployee.hire_date}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Salary</label>
                  <p className="text-gray-900">{selectedEmployee.currency} {selectedEmployee.salary.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Performance Rating</label>
                  <p className="text-gray-900">
                    {selectedEmployee.performance_rating ? `${selectedEmployee.performance_rating}/5.0` : 'Not rated'}
                  </p>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Leave Balances</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{selectedEmployee.annual_leave_balance}</div>
                    <div className="text-sm text-gray-600">Annual Leave</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{selectedEmployee.sick_leave_balance}</div>
                    <div className="text-sm text-gray-600">Sick Leave</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">0</div>
                    <div className="text-sm text-gray-600">Other Leave</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SHRMDashboard; 