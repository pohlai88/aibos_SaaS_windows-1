'use client'

import React, { useState } from 'react'
import { 
  ChartBarIcon, 
  CubeIcon, 
  ShieldCheckIcon, 
  ServerIcon,
  BellIcon,
  EnvelopeIcon,
  CogIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SyncIcon,
  ArrowUpIcon
} from '@heroicons/react/24/outline'
import { clsx } from 'clsx'
import { useMetadataStats } from '../hooks/useMetadataStats'
import { useGovernanceHealth } from '../hooks/useGovernanceHealth'
import { useModuleEcosystem } from '../hooks/useModuleEcosystem'
import { MetadataHealthCard } from './MetadataHealthCard'
import { GovernanceStatusCard } from './GovernanceStatusCard'
import { ModuleEcosystemPanel } from './ModuleEcosystemPanel'
import { AICompliancePanel } from './AICompliancePanel'
import { SystemGovernancePanel } from './SystemGovernancePanel'

interface TabType {
  id: string
  name: string
  icon: React.ComponentType<any>
}

const tabs: TabType[] = [
  { id: 'overview', name: 'Overview', icon: ChartBarIcon },
  { id: 'modules', name: 'Module Ecosystem', icon: CubeIcon },
  { id: 'ai-copilot', name: 'AI Co-Pilot', icon: ShieldCheckIcon },
  { id: 'governance', name: 'System Governance', icon: ServerIcon },
]

export default function CIDDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Real data hooks
  const { data: metadataStats, isLoading: metadataLoading } = useMetadataStats()
  const { data: governanceHealth, isLoading: governanceLoading } = useGovernanceHealth()
  const { data: moduleStats, isLoading: moduleLoading } = useModuleEcosystem()

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar - keeping existing structure */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
          {/* Logo */}
          <div className="flex items-center h-16 px-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                AI
              </div>
              <span className="ml-2 text-lg font-semibold text-gray-800">AI-BOS OS</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col flex-grow overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {/* Overview Section */}
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                  Overview
                </div>
                <a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-white bg-primary-600 group">
                  <ChartBarIcon className="mr-3 h-5 w-5 text-primary-200" />
                  Dashboard Home
                </a>
                <a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 group">
                  <ChartBarIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                  System Analytics
                </a>
              </div>

              {/* Module Ecosystem Section */}
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                  Module Ecosystem
                </div>
                <a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 group">
                  <CubeIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                  Module Store
                </a>
                <a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 group">
                  <CubeIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                  Installed Modules
                </a>
              </div>

              {/* AI Co-Pilot Section */}
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                  AI Co-Pilot
                </div>
                <a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 group">
                  <ShieldCheckIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                  Code Analysis
                </a>
                <a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 group">
                  <ShieldCheckIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                  Compliance Checks
                </a>
              </div>

              {/* System Governance Section */}
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                  System Governance
                </div>
                <a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 group">
                  <ServerIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                  Infrastructure
                </a>
                <a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 group">
                  <ShieldCheckIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                  Security Center
                </a>
              </div>
            </nav>
          </div>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
                  AU
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">Admin User</p>
                <p className="text-xs font-medium text-gray-500">Owner & Developer</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Navigation - keeping existing structure */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 bg-white">
          <div className="flex items-center">
            <button 
              className="md:hidden text-gray-500 focus:outline-none"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="ml-4 relative">
              <div className="relative">
                <input 
                  type="text" 
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
                  placeholder="Search modules, analytics..."
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  <MagnifyingGlassIcon className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative text-gray-500 hover:text-gray-700 focus:outline-none">
              <BellIcon className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">3</span>
            </button>
            <button className="relative text-gray-500 hover:text-gray-700 focus:outline-none">
              <EnvelopeIcon className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center">5</span>
            </button>
            <button className="text-gray-500 hover:text-gray-700 focus:outline-none">
              <CogIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          {/* Dashboard Header */}
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">AI-BOS OS Dashboard</h1>
              <p className="text-gray-600">Real-time governance, metadata, and module ecosystem insights.</p>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => window.location.reload()}
                className="px-3 py-1 text-sm bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
              >
                Refresh Data
              </button>
              <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                Export Report
              </button>
            </div>
          </div>

          {/* Real System Status Bar */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-primary-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">System Status</p>
                  <p className="mt-1 text-xl font-semibold text-gray-900">
                    {governanceHealth?.systemStatus || 'Loading...'}
                  </p>
                </div>
                <div className="p-2 rounded-full bg-green-100 text-green-600">
                  <CheckCircleIcon className="h-6 w-6" />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-secondary-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Active Modules</p>
                  <p className="mt-1 text-xl font-semibold text-gray-900">
                    {moduleLoading ? 'Loading...' : moduleStats?.activeModules || 0}
                  </p>
                </div>
                <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                  <CubeIcon className="h-6 w-6" />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-warning-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Metadata Fields</p>
                  <p className="mt-1 text-xl font-semibold text-gray-900">
                    {metadataLoading ? 'Loading...' : metadataStats?.totalFields || 0}
                  </p>
                </div>
                <div className="p-2 rounded-full bg-yellow-100 text-yellow-600">
                  <SyncIcon className="h-6 w-6" />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-danger-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Compliance Issues</p>
                  <p className="mt-1 text-xl font-semibold text-gray-900">
                    {governanceLoading ? 'Loading...' : governanceHealth?.complianceIssues || 0}
                  </p>
                </div>
                <div className="p-2 rounded-full bg-red-100 text-red-600">
                  <ExclamationTriangleIcon className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={clsx(
                      'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2',
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.name}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Real Tab Contents */}
          <div id="tab-contents">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Real Metadata & Governance Metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <MetadataHealthCard 
                    stats={metadataStats}
                    loading={metadataLoading}
                  />
                  
                  <GovernanceStatusCard 
                    health={governanceHealth}
                    loading={governanceLoading}
                  />
                  
                  {/* Real Quick Actions */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
                    <div className="space-y-3">
                      <button 
                        onClick={() => setActiveTab('modules')}
                        className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center">
                          <CubeIcon className="h-5 w-5 text-primary-600 mr-3" />
                          <span className="text-sm font-medium">Manage Modules</span>
                        </div>
                      </button>
                      <button 
                        onClick={() => setActiveTab('governance')}
                        className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center">
                          <ChartBarIcon className="h-5 w-5 text-green-600 mr-3" />
                          <span className="text-sm font-medium">View Governance</span>
                        </div>
                      </button>
                      <button 
                        onClick={() => setActiveTab('ai-copilot')}
                        className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center">
                          <ShieldCheckIcon className="h-5 w-5 text-yellow-600 mr-3" />
                          <span className="text-sm font-medium">Run Compliance Check</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'modules' && (
              <ModuleEcosystemPanel 
                moduleStats={moduleStats}
                loading={moduleLoading}
              />
            )}

            {activeTab === 'ai-copilot' && (
              <AICompliancePanel 
                governanceHealth={governanceHealth}
                metadataStats={metadataStats}
                loading={governanceLoading || metadataLoading}
              />
            )}

            {activeTab === 'governance' && (
              <SystemGovernancePanel 
                governanceHealth={governanceHealth}
                loading={governanceLoading}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}