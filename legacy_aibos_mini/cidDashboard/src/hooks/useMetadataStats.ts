import { useQuery } from '@tanstack/react-query'
import { MetadataRegistryService } from '@standalone/metadata-registry'

export interface MetadataStats {
  totalFields: number
  classifiedFields: number
  complianceRate: number
  criticalFields: number
  restrictedFields: number
  internalFields: number
  publicFields: number
  recentlyUpdated: number
}

export function useMetadataStats() {
  return useQuery({
    queryKey: ['metadata-stats'],
    queryFn: async (): Promise<MetadataStats> => {
      const service = new MetadataRegistryService()
      return await service.getMetadataStats()
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  })
}