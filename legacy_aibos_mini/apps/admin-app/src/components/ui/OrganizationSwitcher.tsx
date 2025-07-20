'use client'

import { useState } from 'react'
import { ChevronDown, Building2, Users } from 'lucide-react'

interface Organization {
  id: string
  name: string
  type: 'company' | 'department' | 'team'
  memberCount: number
}

interface OrganizationSwitcherProps {
  organizations?: Organization[]
  currentOrg?: Organization
  onOrgChange?: (org: Organization) => void
}

export default function OrganizationSwitcher({ 
  organizations = [], 
  currentOrg, 
  onOrgChange 
}: OrganizationSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)

  const defaultOrganizations: Organization[] = [
    {
      id: '1',
      name: 'AI-BOS Corp',
      type: 'company',
      memberCount: 45
    },
    {
      id: '2', 
      name: 'Engineering',
      type: 'department',
      memberCount: 12
    },
    {
      id: '3',
      name: 'Sales Team',
      type: 'team', 
      memberCount: 8
    }
  ]

  const orgs = organizations.length > 0 ? organizations : defaultOrganizations
  const selectedOrg = currentOrg || orgs[0]

  const getIcon = (type: string) => {
    switch (type) {
      case 'company':
        return <Building2 className="w-4 h-4" />
      case 'department':
      case 'team':
        return <Users className="w-4 h-4" />
      default:
        return <Building2 className="w-4 h-4" />
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {getIcon(selectedOrg.type)}
        <span>{selectedOrg.name}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-300 rounded-md shadow-lg z-50">
          <div className="py-1">
            {orgs.map((org) => (
              <button
                key={org.id}
                onClick={() => {
                  onOrgChange?.(org)
                  setIsOpen(false)
                }}
                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
              >
                {getIcon(org.type)}
                <div className="flex-1 text-left">
                  <div className="font-medium">{org.name}</div>
                  <div className="text-xs text-gray-500">
                    {org.memberCount} members
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 