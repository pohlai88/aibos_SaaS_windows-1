import { useQuery } from '@tanstack/react-query'
import { EnterpriseSchemaRegistry } from '@aibos/data-governance'

export interface GovernanceHealth {
  systemStatus: 'Operational' | 'Warning' | 'Critical'
  cripCompliance: number
  seaCompliance: number
  auditStatus: 'Healthy' | 'Issues'
  complianceIssues: number
  encryptionStatus: 'Active' | 'Partial' | 'Inactive'
  lastAudit: string
}

export function useGovernanceHealth() {
  return useQuery({
    queryKey: ['governance-health'],
    queryFn: async (): Promise<GovernanceHealth> => {
      const governance = new EnterpriseSchemaRegistry()
      return await governance.getSystemHealth()
    },
    refetchInterval: 60000, // Refresh every minute
  })
}