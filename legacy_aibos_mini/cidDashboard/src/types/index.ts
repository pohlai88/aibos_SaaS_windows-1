export interface DashboardMetrics {
  mrr: number
  arr: number
  churnRate: number
  activeModules: number
  pendingUpdates: number
  criticalIssues: number
}

export interface ModuleInfo {
  id: string
  name: string
  version: string
  status: 'active' | 'inactive' | 'updating' | 'error'
  category: string
  lastUpdated: Date
}

export interface SystemStatus {
  overall: 'operational' | 'degraded' | 'down'
  services: {
    api: 'up' | 'down'
    database: 'up' | 'down'
    auth: 'up' | 'down'
  }
}

export interface CIDDashboardProps {
  initialTab?: string
  metrics?: DashboardMetrics
  modules?: ModuleInfo[]
  systemStatus?: SystemStatus
}