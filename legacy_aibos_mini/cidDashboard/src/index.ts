export { default as CIDDashboard } from './components/CIDDashboard'
export * from './types'
export * from './lib/utils'

// Module metadata for AI-BOS OS integration
export const moduleMetadata = {
  id: 'cid-dashboard',
  name: 'CID Dashboard',
  version: '1.0.0',
  description: 'Comprehensive Customer Intelligence Dashboard',
  category: 'reporting',
  entryComponent: 'CIDDashboard'
}