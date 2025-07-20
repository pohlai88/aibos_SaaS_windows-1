// DepartmentSDK
// Comprehensive service layer for department and team management

import { supabase } from '@/lib/supabase';
import { AdminDepartmentSchemas, type Department, type Team, type DepartmentEmployee, type DepartmentBudget, type DepartmentReport, type DepartmentGoal, type DepartmentAnnouncement, type DepartmentEvent, type DepartmentStatistics } from './types';

class DepartmentSDK {
  private static instance: DepartmentSDK;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  static getInstance(): DepartmentSDK {
    if (!DepartmentSDK.instance) {
      DepartmentSDK.instance = new DepartmentSDK();
    }
    return DepartmentSDK.instance;
  }

  // Cache Management
  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data as T;
    }
    return null;
  }

  private setCached<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // Department Management
  async getDepartments(params: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    status?: string;
    organization_id?: string;
    parent_department_id?: string;
  } = {}): Promise<{ departments: Department[]; total: number; pagination: any }> {
    const cacheKey = `departments_${JSON.stringify(params)}`;
    const cached = this.getCached<{ departments: Department[]; total: number; pagination: any }>(cacheKey);
    if (cached) return cached;

    try {
      // For now, return mock data - implement actual department table later
      const mockDepartments: Department[] = [
        {
          id: 'dept-1',
          name: 'Human Resources',
          code: 'HR',
          description: 'Human Resources Department',
          organization_id: 'org-1',
          status: 'active',
          type: 'hr',
          level: 1,
          max_employees: 50,
          current_employees: 25,
          budget: 500000,
          currency: 'USD',
          location: {
            address: '123 Main St',
            city: 'Kuala Lumpur',
            state: 'WP Kuala Lumpur',
            country: 'MY',
            postal_code: '50000',
            timezone: 'Asia/Kuala_Lumpur',
          },
          contact_info: {
            email: 'hr@company.com',
            phone: '+60-3-1234-5678',
          },
          settings: {
            allow_remote_work: true,
            max_remote_days: 3,
            working_hours: {
              monday: { is_working_day: true, start_time: '09:00', end_time: '17:00' },
              tuesday: { is_working_day: true, start_time: '09:00', end_time: '17:00' },
              wednesday: { is_working_day: true, start_time: '09:00', end_time: '17:00' },
              thursday: { is_working_day: true, start_time: '09:00', end_time: '17:00' },
              friday: { is_working_day: true, start_time: '09:00', end_time: '17:00' },
              saturday: { is_working_day: false },
              sunday: { is_working_day: false },
            },
            holidays: [],
            policies: [],
            permissions: [],
            integrations: [],
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: 'user-1',
        },
        {
          id: 'dept-2',
          name: 'Information Technology',
          code: 'IT',
          description: 'Information Technology Department',
          organization_id: 'org-1',
          status: 'active',
          type: 'it',
          level: 1,
          max_employees: 30,
          current_employees: 18,
          budget: 800000,
          currency: 'USD',
          location: {
            address: '456 Tech Ave',
            city: 'Kuala Lumpur',
            state: 'WP Kuala Lumpur',
            country: 'MY',
            postal_code: '50001',
            timezone: 'Asia/Kuala_Lumpur',
          },
          contact_info: {
            email: 'it@company.com',
            phone: '+60-3-1234-5679',
          },
          settings: {
            allow_remote_work: true,
            max_remote_days: 5,
            working_hours: {
              monday: { is_working_day: true, start_time: '08:00', end_time: '18:00' },
              tuesday: { is_working_day: true, start_time: '08:00', end_time: '18:00' },
              wednesday: { is_working_day: true, start_time: '08:00', end_time: '18:00' },
              thursday: { is_working_day: true, start_time: '08:00', end_time: '18:00' },
              friday: { is_working_day: true, start_time: '08:00', end_time: '18:00' },
              saturday: { is_working_day: false },
              sunday: { is_working_day: false },
            },
            holidays: [],
            policies: [],
            permissions: [],
            integrations: [],
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: 'user-1',
        },
      ];

      // Apply filters
      let filteredDepartments = mockDepartments;
      
      if (params.search) {
        filteredDepartments = filteredDepartments.filter(dept =>
          dept.name.toLowerCase().includes(params.search!.toLowerCase()) ||
          dept.code.toLowerCase().includes(params.search!.toLowerCase())
        );
      }

      if (params.type) {
        filteredDepartments = filteredDepartments.filter(dept => dept.type === params.type);
      }

      if (params.status) {
        filteredDepartments = filteredDepartments.filter(dept => dept.status === params.status);
      }

      if (params.organization_id) {
        filteredDepartments = filteredDepartments.filter(dept => dept.organization_id === params.organization_id);
      }

      if (params.parent_department_id) {
        filteredDepartments = filteredDepartments.filter(dept => dept.parent_department_id === params.parent_department_id);
      }

      // Apply pagination
      const page = params.page || 1;
      const limit = params.limit || 20;
      const from = (page - 1) * limit;
      const to = from + limit;
      const paginatedDepartments = filteredDepartments.slice(from, to);

      const result = {
        departments: paginatedDepartments,
        total: filteredDepartments.length,
        pagination: {
          page,
          limit,
          total: filteredDepartments.length,
          total_pages: Math.ceil(filteredDepartments.length / limit),
          has_next: to < filteredDepartments.length,
          has_prev: page > 1,
        },
      };

      this.setCached(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error fetching departments:', error);
      throw error;
    }
  }

  async createDepartment(departmentData: {
    name: string;
    code: string;
    description: string;
    parent_department_id?: string;
    manager_id?: string;
    organization_id: string;
    type: string;
    max_employees: number;
    budget: number;
    currency: string;
    location: any;
    contact_info: any;
    settings?: any;
  }): Promise<Department> {
    try {
      // Validate input
      const validated = AdminDepartmentSchemas.CreateDepartment.parse(departmentData);

      // TODO: Implement actual department creation
      const newDepartment: Department = {
        id: crypto.randomUUID(),
        ...validated,
        status: 'active',
        level: 1,
        current_employees: 0,
        settings: validated.settings || {
          allow_remote_work: true,
          max_remote_days: 3,
          working_hours: {
            monday: { is_working_day: true, start_time: '09:00', end_time: '17:00' },
            tuesday: { is_working_day: true, start_time: '09:00', end_time: '17:00' },
            wednesday: { is_working_day: true, start_time: '09:00', end_time: '17:00' },
            thursday: { is_working_day: true, start_time: '09:00', end_time: '17:00' },
            friday: { is_working_day: true, start_time: '09:00', end_time: '17:00' },
            saturday: { is_working_day: false },
            sunday: { is_working_day: false },
          },
          holidays: [],
          policies: [],
          permissions: [],
          integrations: [],
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'current-user-id', // TODO: Get from auth context
      };

      // Clear department cache
      this.clearCache('departments');

      // Log admin action
      await this.logDepartmentAction({
        type: 'department_creation',
        user_id: 'current-user-id',
        target_type: 'department',
        target_id: newDepartment.id,
        details: { created_department: validated },
        status: 'completed',
      });

      return newDepartment;
    } catch (error) {
      console.error('Error creating department:', error);
      throw error;
    }
  }

  async updateDepartment(departmentId: string, updates: Partial<Department>): Promise<Department> {
    try {
      const validated = AdminDepartmentSchemas.UpdateDepartment.parse({ id: departmentId, ...updates });

      // TODO: Implement actual department update
      console.log(`Updating department ${departmentId}`, updates);

      // Clear department cache
      this.clearCache('departments');

      await this.logDepartmentAction({
        type: 'department_update',
        user_id: 'current-user-id',
        target_type: 'department',
        target_id: departmentId,
        details: { updates: validated },
        status: 'completed',
      });

      // Return updated department (mock for now)
      return {} as Department;
    } catch (error) {
      console.error('Error updating department:', error);
      throw error;
    }
  }

  async deleteDepartment(departmentId: string): Promise<void> {
    try {
      // TODO: Implement actual department deletion
      console.log(`Deleting department ${departmentId}`);

      this.clearCache('departments');

      await this.logDepartmentAction({
        type: 'department_deletion',
        user_id: 'current-user-id',
        target_type: 'department',
        target_id: departmentId,
        details: { deleted_department_id: departmentId },
        status: 'completed',
      });
    } catch (error) {
      console.error('Error deleting department:', error);
      throw error;
    }
  }

  // Team Management
  async getTeams(params: {
    page?: number;
    limit?: number;
    search?: string;
    department_id?: string;
    type?: string;
    status?: string;
  } = {}): Promise<{ teams: Team[]; total: number; pagination: any }> {
    const cacheKey = `teams_${JSON.stringify(params)}`;
    const cached = this.getCached<{ teams: Team[]; total: number; pagination: any }>(cacheKey);
    if (cached) return cached;

    try {
      // Mock teams data
      const mockTeams: Team[] = [
        {
          id: 'team-1',
          name: 'HR Operations',
          description: 'Core HR operations team',
          department_id: 'dept-1',
          type: 'functional',
          status: 'performing',
          max_members: 10,
          current_members: 8,
          skills_required: ['HR Management', 'Employee Relations', 'Compliance'],
          projects: ['Employee Handbook Update', 'Benefits Review'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: 'user-1',
        },
        {
          id: 'team-2',
          name: 'IT Infrastructure',
          description: 'IT infrastructure and systems team',
          department_id: 'dept-2',
          type: 'functional',
          status: 'performing',
          max_members: 8,
          current_members: 6,
          skills_required: ['System Administration', 'Network Security', 'Cloud Computing'],
          projects: ['Cloud Migration', 'Security Audit'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: 'user-1',
        },
      ];

      // Apply filters
      let filteredTeams = mockTeams;
      
      if (params.search) {
        filteredTeams = filteredTeams.filter(team =>
          team.name.toLowerCase().includes(params.search!.toLowerCase()) ||
          team.description.toLowerCase().includes(params.search!.toLowerCase())
        );
      }

      if (params.department_id) {
        filteredTeams = filteredTeams.filter(team => team.department_id === params.department_id);
      }

      if (params.type) {
        filteredTeams = filteredTeams.filter(team => team.type === params.type);
      }

      if (params.status) {
        filteredTeams = filteredTeams.filter(team => team.status === params.status);
      }

      // Apply pagination
      const page = params.page || 1;
      const limit = params.limit || 20;
      const from = (page - 1) * limit;
      const to = from + limit;
      const paginatedTeams = filteredTeams.slice(from, to);

      const result = {
        teams: paginatedTeams,
        total: filteredTeams.length,
        pagination: {
          page,
          limit,
          total: filteredTeams.length,
          total_pages: Math.ceil(filteredTeams.length / limit),
          has_next: to < filteredTeams.length,
          has_prev: page > 1,
        },
      };

      this.setCached(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error fetching teams:', error);
      throw error;
    }
  }

  async createTeam(teamData: {
    name: string;
    description: string;
    department_id: string;
    team_lead_id?: string;
    type: string;
    max_members: number;
    skills_required: string[];
    projects: string[];
  }): Promise<Team> {
    try {
      const validated = AdminDepartmentSchemas.CreateTeam.parse(teamData);

      const newTeam: Team = {
        id: crypto.randomUUID(),
        ...validated,
        status: 'forming',
        current_members: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'current-user-id',
      };

      this.clearCache('teams');

      await this.logDepartmentAction({
        type: 'team_creation',
        user_id: 'current-user-id',
        target_type: 'team',
        target_id: newTeam.id,
        details: { created_team: validated },
        status: 'completed',
      });

      return newTeam;
    } catch (error) {
      console.error('Error creating team:', error);
      throw error;
    }
  }

  // Department Statistics
  async getDepartmentStatistics(organizationId: string): Promise<DepartmentStatistics> {
    try {
      const [departmentsResult, teamsResult] = await Promise.all([
        this.getDepartments({ organization_id: organizationId }),
        this.getTeams(),
      ]);

      const departments = departmentsResult.departments;
      const teams = teamsResult.teams;

      const totalDepartments = departments.length;
      const activeDepartments = departments.filter(d => d.status === 'active').length;
      const totalEmployees = departments.reduce((sum, dept) => sum + dept.current_employees, 0);
      const averageEmployeesPerDept = totalDepartments > 0 ? totalEmployees / totalDepartments : 0;
      const totalTeams = teams.length;
      const averageTeamsPerDept = totalDepartments > 0 ? totalTeams / totalDepartments : 0;

      const totalBudget = departments.reduce((sum, dept) => sum + dept.budget, 0);
      const spentBudget = departments.reduce((sum, dept) => sum + (dept.budget * 0.7), 0); // Mock spent budget
      const budgetUtilization = totalBudget > 0 ? (spentBudget / totalBudget) * 100 : 0;

      const stats: DepartmentStatistics = {
        total_departments: totalDepartments,
        active_departments: activeDepartments,
        total_employees: totalEmployees,
        average_employees_per_dept: averageEmployeesPerDept,
        total_teams: totalTeams,
        average_teams_per_dept: averageTeamsPerDept,
        budget_utilization: budgetUtilization,
        headcount_growth: 5.2, // Mock growth percentage
        turnover_rate: 3.1, // Mock turnover rate
        top_performing_depts: departments.slice(0, 5).map(dept => ({
          department_id: dept.id,
          department_name: dept.name,
          performance_score: Math.random() * 40 + 60, // Mock score between 60-100
          metrics: [],
          goals: [],
        })),
      };

      return stats;
    } catch (error) {
      console.error('Error fetching department statistics:', error);
      throw error;
    }
  }

  // Department Budget Management
  async getDepartmentBudget(departmentId: string, fiscalYear: string): Promise<DepartmentBudget | null> {
    try {
      // Mock budget data
      const budget: DepartmentBudget = {
        id: crypto.randomUUID(),
        department_id: departmentId,
        fiscal_year: fiscalYear,
        total_budget: 500000,
        allocated_budget: 450000,
        spent_budget: 320000,
        remaining_budget: 180000,
        currency: 'USD',
        categories: [
          {
            id: 'cat-1',
            name: 'Personnel',
            allocated: 300000,
            spent: 250000,
            remaining: 50000,
          },
          {
            id: 'cat-2',
            name: 'Operations',
            allocated: 100000,
            spent: 50000,
            remaining: 50000,
          },
          {
            id: 'cat-3',
            name: 'Technology',
            allocated: 50000,
            spent: 20000,
            remaining: 30000,
          },
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return budget;
    } catch (error) {
      console.error('Error fetching department budget:', error);
      throw error;
    }
  }

  // Department Reports
  async generateDepartmentReport(departmentId: string, reportType: string, period: string): Promise<DepartmentReport> {
    try {
      const report: DepartmentReport = {
        id: crypto.randomUUID(),
        department_id: departmentId,
        report_type: reportType as any,
        period,
        data: {
          headcount: 25,
          budget_utilization: 75.5,
          performance_score: 82.3,
          turnover_rate: 2.1,
          productivity_metrics: {
            projects_completed: 12,
            average_completion_time: 15.5,
            quality_score: 4.2,
          },
        },
        generated_at: new Date().toISOString(),
        generated_by: 'current-user-id',
        status: 'published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return report;
    } catch (error) {
      console.error('Error generating department report:', error);
      throw error;
    }
  }

  // Department Goals
  async getDepartmentGoals(departmentId: string): Promise<DepartmentGoal[]> {
    try {
      const goals: DepartmentGoal[] = [
        {
          id: 'goal-1',
          department_id: departmentId,
          title: 'Increase Employee Satisfaction',
          description: 'Improve employee satisfaction score to 85%',
          type: 'operational',
          target_value: 85,
          current_value: 78,
          unit: 'percentage',
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'in_progress',
          priority: 'high',
          progress_percentage: 78,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'goal-2',
          department_id: departmentId,
          title: 'Reduce Operational Costs',
          description: 'Reduce operational costs by 10%',
          type: 'financial',
          target_value: 10,
          current_value: 6,
          unit: 'percentage',
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'on_track',
          priority: 'medium',
          progress_percentage: 60,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      return goals;
    } catch (error) {
      console.error('Error fetching department goals:', error);
      throw error;
    }
  }

  // Department Announcements
  async getDepartmentAnnouncements(departmentId: string): Promise<DepartmentAnnouncement[]> {
    try {
      const announcements: DepartmentAnnouncement[] = [
        {
          id: 'announcement-1',
          department_id: departmentId,
          title: 'New Remote Work Policy',
          content: 'Starting next month, employees can work remotely up to 3 days per week.',
          type: 'policy',
          priority: 'high',
          is_published: true,
          publish_date: new Date().toISOString(),
          created_by: 'user-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          read_by: ['user-2', 'user-3'],
        },
        {
          id: 'announcement-2',
          department_id: departmentId,
          title: 'Team Building Event',
          content: 'Join us for a team building event this Friday at 3 PM.',
          type: 'event',
          priority: 'medium',
          is_published: true,
          publish_date: new Date().toISOString(),
          created_by: 'user-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          read_by: ['user-2'],
        },
      ];

      return announcements;
    } catch (error) {
      console.error('Error fetching department announcements:', error);
      throw error;
    }
  }

  // Department Events
  async getDepartmentEvents(departmentId: string): Promise<DepartmentEvent[]> {
    try {
      const events: DepartmentEvent[] = [
        {
          id: 'event-1',
          department_id: departmentId,
          title: 'Monthly Team Meeting',
          description: 'Regular monthly team meeting to discuss progress and upcoming projects',
          type: 'meeting',
          start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
          location: 'Conference Room A',
          is_all_day: false,
          attendees: ['user-1', 'user-2', 'user-3'],
          organizer: 'user-1',
          status: 'scheduled',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'event-2',
          department_id: departmentId,
          title: 'Training Session: New Software',
          description: 'Training session for the new project management software',
          type: 'training',
          start_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
          location: 'Training Room B',
          is_all_day: false,
          attendees: ['user-1', 'user-2', 'user-3', 'user-4'],
          organizer: 'user-2',
          status: 'scheduled',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      return events;
    } catch (error) {
      console.error('Error fetching department events:', error);
      throw error;
    }
  }

  // Utility Methods
  async logDepartmentAction(action: {
    type: string;
    user_id: string;
    target_type: string;
    target_id: string;
    details: Record<string, any>;
    status: string;
  }): Promise<void> {
    try {
      // TODO: Implement actual logging
      console.log('Department action logged:', action);
    } catch (error) {
      console.error('Error logging department action:', error);
      // Don't throw - logging should not break main operations
    }
  }

  async clearAllCache(): Promise<void> {
    this.cache.clear();
  }

  async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      return {
        status: 'healthy',
        details: {
          cache_size: this.cache.size,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        },
      };
    }
  }
}

// Export singleton instance
export const departmentSDK = DepartmentSDK.getInstance();

// Export types for convenience
export type { Department, Team, DepartmentEmployee, DepartmentBudget, DepartmentReport, DepartmentGoal, DepartmentAnnouncement, DepartmentEvent, DepartmentStatistics }; 