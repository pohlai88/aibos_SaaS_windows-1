import { MetadataStats } from '../hooks/useMetadataStats'
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface Props {
  stats: MetadataStats | undefined
  loading: boolean
}

export function MetadataHealthCard({ stats, loading }: Props) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-50 p-3 rounded-lg">
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const complianceRate = stats?.complianceRate || 0
  const isHealthy = complianceRate >= 90

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Metadata Health</h2>
        <div className="flex items-center space-x-2">
          {isHealthy ? (
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
          ) : (
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
          )}
          <span className={`text-sm font-medium ${
            isHealthy ? 'text-green-600' : 'text-yellow-600'
          }`}>
            {isHealthy ? 'Healthy' : 'Needs Attention'}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm font-medium text-gray-500">Total Fields</p>
          <p className="mt-1 text-xl font-semibold text-gray-900">{stats?.totalFields || 0}</p>
          <p className="mt-1 text-sm text-blue-600">
            {stats?.classifiedFields || 0} classified
          </p>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm font-medium text-gray-500">Compliance Rate</p>
          <p className="mt-1 text-xl font-semibold text-gray-900">{complianceRate}%</p>
          <p className={`mt-1 text-sm ${
            complianceRate >= 90 ? 'text-green-600' : 'text-yellow-600'
          }`}>
            {complianceRate >= 90 ? 'Excellent' : 'Needs improvement'}
          </p>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm font-medium text-gray-500">Critical Fields</p>
          <p className="mt-1 text-xl font-semibold text-gray-900">{stats?.criticalFields || 0}</p>
          <p className="mt-1 text-sm text-red-600">
            Require encryption
          </p>
        </div>
      </div>
    </div>
  )
}