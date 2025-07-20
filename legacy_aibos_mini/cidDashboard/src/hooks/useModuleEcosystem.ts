import { useQuery } from '@tanstack/react-query'
import { AibosDatabaseKernel } from '@aibos/database'

export interface ModuleStats {
  activeModules: number
  pendingUpdates: number
  installedModules: number
  availableModules: number
  moduleHealth: 'Healthy' | 'Issues' | 'Critical'
}

export function useModuleEcosystem() {
  return useQuery({
    queryKey: ['module-ecosystem'],
    queryFn: async (): Promise<ModuleStats> => {
      const db = AibosDatabaseKernel.getInstance()
      return await db.getModuleStats()
    },
    refetchInterval: 45000, // Refresh every 45 seconds
  })
}