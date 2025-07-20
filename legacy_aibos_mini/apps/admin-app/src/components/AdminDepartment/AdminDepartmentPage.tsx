import React, { useState, useEffect } from "react";
import { departmentSDK } from "./department-sdk";
import type { Department, Team, DepartmentStatistics } from "./types";

interface AdminDepartmentPageProps {
  className?: string;
}

type DepartmentSection =
  | "overview"
  | "departments"
  | "teams"
  | "employees"
  | "budget"
  | "reports"
  | "goals"
  | "announcements"
  | "events";

export const AdminDepartmentPage: React.FC<AdminDepartmentPageProps> = ({
  className = "",
}) => {
  const [currentSection, setCurrentSection] = useState<DepartmentSection>("overview");
  const [loading, setLoading] = useState(true);
  const [departmentStats, setDepartmentStats] = useState<DepartmentStatistics>({
    total_departments: 0,
    active_departments: 0,
    total_employees: 0,
    average_employees_per_dept: 0,
    total_teams: 0,
    average_teams_per_dept: 0,
    budget_utilization: 0,
    headcount_growth: 0,
    turnover_rate: 0,
    top_performing_depts: [],
  });

  useEffect(() => {
    fetchDepartmentStats();
  }, []);

  const fetchDepartmentStats = async () => {
    try {
      setLoading(true);
      const stats = await departmentSDK.getDepartmentStatistics("org-1"); // TODO: Get from context
      setDepartmentStats(stats);
    } catch (error) {
      console.error("Error fetching department stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderSection = () => {
    switch (currentSection) {
      case "overview":
        return <DepartmentOverview stats={departmentStats} />;
      case "departments":
        return <DepartmentManagement />;
      case "teams":
        return <TeamManagement />;
      case "employees":
        return <EmployeeManagement />;
      case "budget":
        return <BudgetManagement />;
      case "reports":
        return <ReportManagement />;
      case "goals":
        return <GoalManagement />;
      case "announcements":
        return <AnnouncementManagement />;
      case "events":
        return <EventManagement />;
      default:
        return <DepartmentOverview stats={departmentStats} />;
    }
  };

  const getSectionTitle = () => {
    switch (currentSection) {
      case "overview":
        return "Department Overview";
      case "departments":
        return "Department Management";
      case "teams":
        return "Team Management";
      case "employees":
        return "Employee Management";
      case "budget":
        return "Budget Management";
      case "reports":
        return "Reports & Analytics";
      case "goals":
        return "Goals & KPIs";
      case "announcements":
        return "Announcements";
      case "events":
        return "Events & Calendar";
      default:
        return "Department Admin";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          <div className="w-64 bg-white shadow-sm">
            <div className="animate-pulse p-6">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 rounded mb-3"></div>
              ))}
            </div>
          </div>
          <div className="flex-1 p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-48 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <div className="flex">
        {/* Sidebar */}
        <DepartmentSidebar
          currentSection={currentSection}
          onSectionChange={(section: string) =>
            setCurrentSection(section as DepartmentSection)
          }
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {getSectionTitle()}
                </h1>
                <p className="text-sm text-gray-500">
                  Manage departments, teams, and organizational structure
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-500">System Online</span>
                </div>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">{renderSection()}</div>
          </main>
        </div>
      </div>
    </div>
  );
};

// Department Sidebar Component
interface DepartmentSidebarProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
}

const DepartmentSidebar: React.FC<DepartmentSidebarProps> = ({
  currentSection,
  onSectionChange,
}) => {
  const navItems = [
    {
      id: "overview",
      label: "Overview",
      icon: "📊",
      description: "Department statistics and insights",
    },
    {
      id: "departments",
      label: "Departments",
      icon: "🏢",
      description: "Manage departments and structure",
      badge: "Active",
      badgeColor: "bg-green-100 text-green-800",
    },
    {
      id: "teams",
      label: "Teams",
      icon: "👥",
      description: "Manage teams and assignments",
    },
    {
      id: "employees",
      label: "Employees",
      icon: "👤",
      description: "Employee management and assignments",
    },
    {
      id: "budget",
      label: "Budget",
      icon: "💰",
      description: "Budget tracking and management",
    },
    {
      id: "reports",
      label: "Reports",
      icon: "📈",
      description: "Analytics and reporting",
    },
    {
      id: "goals",
      label: "Goals",
      icon: "🎯",
      description: "Goals and KPIs tracking",
    },
    {
      id: "announcements",
      label: "Announcements",
      icon: "📢",
      description: "Department communications",
    },
    {
      id: "events",
      label: "Events",
      icon: "📅",
      description: "Events and calendar",
    },
  ];

  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Department Admin</h2>
          <p className="text-xs text-gray-500">Organizational Management</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                currentSection === item.id
                  ? "bg-blue-50 border border-blue-200 text-blue-700"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <div className="flex-shrink-0 text-lg">{item.icon}</div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium truncate">
                    {item.label}
                  </span>
                  {item.badge && (
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate">
                  {item.description}
                </p>
              </div>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-500">System Online</span>
            </div>
            <div className="text-xs text-gray-400">AIBOS v6.0.0</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

// Department Overview Component
interface DepartmentOverviewProps {
  stats: DepartmentStatistics;
}

const DepartmentOverview: React.FC<DepartmentOverviewProps> = ({ stats }) => {
  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-2xl">🏢</div>
            <div className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
              Active
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.total_departments}
          </div>
          <div className="text-sm text-gray-500">Total Departments</div>
          <div className="text-xs text-green-600 mt-1">
            {stats.active_departments} active
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-2xl">👥</div>
            <div className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
              Teams
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.total_teams}
          </div>
          <div className="text-sm text-gray-500">Total Teams</div>
          <div className="text-xs text-blue-600 mt-1">
            Avg {stats.average_teams_per_dept.toFixed(1)} per dept
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-2xl">👤</div>
            <div className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">
              Employees
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.total_employees}
          </div>
          <div className="text-sm text-gray-500">Total Employees</div>
          <div className="text-xs text-purple-600 mt-1">
            Avg {stats.average_employees_per_dept.toFixed(1)} per dept
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-2xl">💰</div>
            <div className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
              Budget
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.budget_utilization.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-500">Budget Utilization</div>
          <div className="text-xs text-yellow-600 mt-1">
            {stats.headcount_growth > 0 ? '+' : ''}{stats.headcount_growth}% growth
          </div>
        </div>
      </div>

      {/* Top Performing Departments */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Top Performing Departments
        </h3>
        <div className="space-y-4">
          {stats.top_performing_depts.map((dept, index) => (
            <div
              key={dept.department_id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600">
                    {index + 1}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    {dept.department_name}
                  </h4>
                  <p className="text-xs text-gray-500">
                    Performance Score: {dept.performance_score.toFixed(1)}%
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {dept.performance_score.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">Score</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-2xl mb-2">➕</div>
            <div className="text-sm font-medium text-gray-900">Add Department</div>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-2xl mb-2">👥</div>
            <div className="text-sm font-medium text-gray-900">Create Team</div>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-2xl mb-2">📊</div>
            <div className="text-sm font-medium text-gray-900">Generate Report</div>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-2xl mb-2">📢</div>
            <div className="text-sm font-medium text-gray-900">Send Announcement</div>
          </button>
        </div>
      </div>
    </div>
  );
};

// Placeholder Components for other sections
const DepartmentManagement: React.FC = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Department Management</h2>
        <p className="text-gray-600">Manage departments and organizational structure</p>
      </div>
      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
        + Add Department
      </button>
    </div>
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <p className="text-gray-500">Department management interface coming soon...</p>
    </div>
  </div>
);

const TeamManagement: React.FC = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Team Management</h2>
        <p className="text-gray-600">Manage teams and team assignments</p>
      </div>
      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
        + Create Team
      </button>
    </div>
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <p className="text-gray-500">Team management interface coming soon...</p>
    </div>
  </div>
);

const EmployeeManagement: React.FC = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Employee Management</h2>
        <p className="text-gray-600">Manage employee assignments and roles</p>
      </div>
      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
        + Assign Employee
      </button>
    </div>
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <p className="text-gray-500">Employee management interface coming soon...</p>
    </div>
  </div>
);

const BudgetManagement: React.FC = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Budget Management</h2>
        <p className="text-gray-600">Track and manage department budgets</p>
      </div>
      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
        + Add Budget
      </button>
    </div>
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <p className="text-gray-500">Budget management interface coming soon...</p>
    </div>
  </div>
);

const ReportManagement: React.FC = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
        <p className="text-gray-600">Generate reports and view analytics</p>
      </div>
      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
        Generate Report
      </button>
    </div>
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <p className="text-gray-500">Reports and analytics interface coming soon...</p>
    </div>
  </div>
);

const GoalManagement: React.FC = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Goals & KPIs</h2>
        <p className="text-gray-600">Track department goals and key performance indicators</p>
      </div>
      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
        + Add Goal
      </button>
    </div>
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <p className="text-gray-500">Goals and KPIs interface coming soon...</p>
    </div>
  </div>
);

const AnnouncementManagement: React.FC = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Announcements</h2>
        <p className="text-gray-600">Manage department announcements and communications</p>
      </div>
      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
        + Send Announcement
      </button>
    </div>
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <p className="text-gray-500">Announcements interface coming soon...</p>
    </div>
  </div>
);

const EventManagement: React.FC = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Events & Calendar</h2>
        <p className="text-gray-600">Manage department events and calendar</p>
      </div>
      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
        + Add Event
      </button>
    </div>
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <p className="text-gray-500">Events and calendar interface coming soon...</p>
    </div>
  </div>
); 