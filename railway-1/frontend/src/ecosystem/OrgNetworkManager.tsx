// ==================== AI-BOS ORG NETWORK MANAGER ====================
// The Organizational DNA of the Digital Civilization
// Steve Jobs Philosophy: "Innovation distinguishes between a leader and a follower."

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Users, Network, Share2, Settings, Plus,
  ChevronDown, ChevronRight, Globe, Lock, Unlock,
  Shield, UserCheck, UserX, ArrowRight, ArrowLeft,
  Copy, Edit, Trash2, Eye, EyeOff, Filter, Search,
  BarChart3, TrendingUp, Users2, GitBranch, GitMerge
} from 'lucide-react';

// ==================== TYPES ====================
interface Organization {
  id: string;
  name: string;
  type: 'parent' | 'subsidiary' | 'franchise' | 'department' | 'partner';
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  parentId?: string;
  children: string[];
  metadata: {
    industry: string;
    region: string;
    size: 'startup' | 'sme' | 'enterprise' | 'fortune500';
    founded: string;
    website?: string;
    description?: string;
  };
  permissions: {
    canShareModules: boolean;
    canInviteUsers: boolean;
    canManageBilling: boolean;
    canAccessAnalytics: boolean;
    canCreateSubOrgs: boolean;
  };
  limits: {
    maxUsers: number;
    maxStorage: number;
    maxModules: number;
    maxSubOrgs: number;
  };
  stats: {
    activeUsers: number;
    totalModules: number;
    sharedModules: number;
    revenue: number;
    growthRate: number;
  };
  branding: {
    logo?: string;
    primaryColor: string;
    customDomain?: string;
    whiteLabeled: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface OrgRelationship {
  id: string;
  fromOrgId: string;
  toOrgId: string;
  type: 'parent-child' | 'partnership' | 'franchise' | 'collaboration';
  status: 'active' | 'pending' | 'suspended';
  permissions: {
    dataSharing: boolean;
    moduleSharing: boolean;
    userAccess: boolean;
    billingSharing: boolean;
  };
  metadata: {
    agreementDate: Date;
    expiryDate?: Date;
    terms: string;
    contactPerson: string;
  };
  createdAt: Date;
}

interface ModuleShare {
  id: string;
  moduleId: string;
  fromOrgId: string;
  toOrgId: string;
  permissions: 'read' | 'write' | 'admin';
  status: 'active' | 'pending' | 'revoked';
  metadata: {
    sharedAt: Date;
    expiresAt?: Date;
    usageCount: number;
    revenueGenerated: number;
  };
}

interface UserAccess {
  id: string;
  userId: string;
  orgId: string;
  role: 'owner' | 'admin' | 'manager' | 'user' | 'viewer';
  status: 'active' | 'inactive' | 'pending';
  permissions: string[];
  metadata: {
    joinedAt: Date;
    lastActive: Date;
    invitedBy: string;
  };
}

// ==================== SAMPLE DATA ====================
const SAMPLE_ORGANIZATIONS: Organization[] = [
  {
    id: 'org_1',
    name: 'TechCorp Global',
    type: 'parent',
    status: 'active',
    children: ['org_2', 'org_3', 'org_4'],
    metadata: {
      industry: 'Technology',
      region: 'Global',
      size: 'enterprise',
      founded: '2010',
      website: 'https://techcorp.global',
      description: 'Leading technology solutions provider'
    },
    permissions: {
      canShareModules: true,
      canInviteUsers: true,
      canManageBilling: true,
      canAccessAnalytics: true,
      canCreateSubOrgs: true
    },
    limits: {
      maxUsers: 1000,
      maxStorage: 10000,
      maxModules: 500,
      maxSubOrgs: 50
    },
    stats: {
      activeUsers: 750,
      totalModules: 245,
      sharedModules: 89,
      revenue: 2500000,
      growthRate: 0.15
    },
    branding: {
      primaryColor: '#3B82F6',
      whiteLabeled: false
    },
    createdAt: new Date('2020-01-01'),
    updatedAt: new Date()
  },
  {
    id: 'org_2',
    name: 'TechCorp North America',
    type: 'subsidiary',
    status: 'active',
    parentId: 'org_1',
    children: ['org_5', 'org_6'],
    metadata: {
      industry: 'Technology',
      region: 'North America',
      size: 'enterprise',
      founded: '2012'
    },
    permissions: {
      canShareModules: true,
      canInviteUsers: true,
      canManageBilling: true,
      canAccessAnalytics: true,
      canCreateSubOrgs: true
    },
    limits: {
      maxUsers: 500,
      maxStorage: 5000,
      maxModules: 250,
      maxSubOrgs: 25
    },
    stats: {
      activeUsers: 320,
      totalModules: 156,
      sharedModules: 45,
      revenue: 1200000,
      growthRate: 0.12
    },
    branding: {
      primaryColor: '#3B82F6',
      whiteLabeled: false
    },
    createdAt: new Date('2012-03-15'),
    updatedAt: new Date()
  },
  {
    id: 'org_3',
    name: 'TechCorp Europe',
    type: 'subsidiary',
    status: 'active',
    parentId: 'org_1',
    children: [],
    metadata: {
      industry: 'Technology',
      region: 'Europe',
      size: 'enterprise',
      founded: '2013'
    },
    permissions: {
      canShareModules: true,
      canInviteUsers: true,
      canManageBilling: true,
      canAccessAnalytics: true,
      canCreateSubOrgs: false
    },
    limits: {
      maxUsers: 300,
      maxStorage: 3000,
      maxModules: 150,
      maxSubOrgs: 10
    },
    stats: {
      activeUsers: 180,
      totalModules: 89,
      sharedModules: 23,
      revenue: 800000,
      growthRate: 0.18
    },
    branding: {
      primaryColor: '#3B82F6',
      whiteLabeled: false
    },
    createdAt: new Date('2013-06-20'),
    updatedAt: new Date()
  },
  {
    id: 'org_4',
    name: 'TechCorp Asia Pacific',
    type: 'subsidiary',
    status: 'active',
    parentId: 'org_1',
    children: [],
    metadata: {
      industry: 'Technology',
      region: 'Asia Pacific',
      size: 'enterprise',
      founded: '2014'
    },
    permissions: {
      canShareModules: true,
      canInviteUsers: true,
      canManageBilling: true,
      canAccessAnalytics: true,
      canCreateSubOrgs: false
    },
    limits: {
      maxUsers: 200,
      maxStorage: 2000,
      maxModules: 100,
      maxSubOrgs: 5
    },
    stats: {
      activeUsers: 125,
      totalModules: 67,
      sharedModules: 18,
      revenue: 500000,
      growthRate: 0.25
    },
    branding: {
      primaryColor: '#3B82F6',
      whiteLabeled: false
    },
    createdAt: new Date('2014-09-10'),
    updatedAt: new Date()
  }
];

// ==================== COMPONENT ====================
export const OrgNetworkManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'hierarchy' | 'relationships' | 'sharing' | 'users' | 'settings'>('overview');
  const [organizations, setOrganizations] = useState<Organization[]>(SAMPLE_ORGANIZATIONS);
  const [selectedOrg, setSelectedOrg] = useState<string>('org_1');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['org_1', 'org_2']));
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // ==================== FUNCTIONS ====================
  const toggleNode = useCallback((orgId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orgId)) {
        newSet.delete(orgId);
      } else {
        newSet.add(orgId);
      }
      return newSet;
    });
  }, []);

  const getOrgById = useCallback((id: string) => {
    return organizations.find(org => org.id === id);
  }, [organizations]);

  const getChildren = useCallback((parentId: string) => {
    return organizations.filter(org => org.parentId === parentId);
  }, [organizations]);

  const getParent = useCallback((orgId: string) => {
    const org = getOrgById(orgId);
    return org?.parentId ? getOrgById(org.parentId) : null;
  }, [getOrgById]);

  const getAncestors = useCallback((orgId: string): Organization[] => {
    const ancestors: Organization[] = [];
    let current = getOrgById(orgId);

    while (current?.parentId) {
      const parent = getOrgById(current.parentId);
      if (parent) {
        ancestors.unshift(parent);
        current = parent;
      } else {
        break;
      }
    }

    return ancestors;
  }, [getOrgById]);

  const getDescendants = useCallback((orgId: string): Organization[] => {
    const descendants: Organization[] = [];
    const queue = [orgId];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const children = getChildren(currentId);
      descendants.push(...children);
      queue.push(...children.map(child => child.id));
    }

    return descendants;
  }, [getChildren]);

  const renderOrgNode = useCallback((org: Organization, level: number = 0) => {
    const children = getChildren(org.id);
    const isExpanded = expandedNodes.has(org.id);
    const hasChildren = children.length > 0;

    return (
      <div key={org.id} className="space-y-2">
        <div
          className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
            selectedOrg === org.id
              ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700'
              : 'bg-white border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700'
          }`}
          style={{ marginLeft: `${level * 24}px` }}
          onClick={() => setSelectedOrg(org.id)}
        >
          <div className="flex items-center space-x-2">
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNode(org.id);
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
              </button>
            )}
            {!hasChildren && <div className="w-6" />}

            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              org.type === 'parent' ? 'bg-blue-100 text-blue-600' :
              org.type === 'subsidiary' ? 'bg-green-100 text-green-600' :
              org.type === 'franchise' ? 'bg-purple-100 text-purple-600' :
              org.type === 'department' ? 'bg-orange-100 text-orange-600' :
              'bg-gray-100 text-gray-600'
            }`}>
              <Building2 className="w-4 h-4" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-gray-900 dark:text-white truncate">
                {org.name}
              </h3>
              <span className={`px-2 py-1 text-xs rounded-full ${
                org.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300' :
                org.status === 'inactive' ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' :
                org.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300' :
                'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'
              }`}>
                {org.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {org.metadata.industry} • {org.metadata.region} • {org.stats.activeUsers} users
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {org.branding.whiteLabeled && (
              <div className="p-1 bg-purple-100 dark:bg-purple-900/20 rounded">
                <Eye className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
            )}
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                ${org.stats.revenue.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">
                +{Math.round(org.stats.growthRate * 100)}%
              </div>
            </div>
          </div>
        </div>

        {isExpanded && hasChildren && (
          <div className="space-y-2">
            {children.map(child => renderOrgNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  }, [expandedNodes, selectedOrg, getChildren, toggleNode]);

  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch = (org.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (org.metadata?.industry?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (org.metadata?.region?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || org.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const selectedOrgData = getOrgById(selectedOrg);
  const selectedOrgChildren = selectedOrgData ? getChildren(selectedOrgData.id) : [];
  const selectedOrgAncestors = selectedOrgData ? getAncestors(selectedOrgData.id) : [];
  const selectedOrgDescendants = selectedOrgData ? getDescendants(selectedOrgData.id) : [];

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* ==================== HEADER ==================== */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <Network className="w-8 h-8 mr-3 text-blue-500" />
                Organization Network
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                The organizational DNA of the AI-BOS ecosystem
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {organizations.length}
                </div>
                <div className="text-sm text-gray-500">Total Organizations</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  {organizations.filter(org => org.status === 'active').length}
                </div>
                <div className="text-sm text-gray-500">Active Organizations</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ==================== NAVIGATION TABS ==================== */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'hierarchy', label: 'Hierarchy', icon: GitBranch },
              { id: 'relationships', label: 'Relationships', icon: Share2 },
              { id: 'sharing', label: 'Module Sharing', icon: Copy },
              { id: 'users', label: 'User Access', icon: Users },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* ==================== CONTENT AREA ==================== */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* ==================== NETWORK STATS ==================== */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                      {organizations.length}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {organizations.length}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Total Organizations</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                      {organizations.reduce((sum, org) => sum + org.stats.activeUsers, 0).toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {organizations.reduce((sum, org) => sum + org.stats.activeUsers, 0).toLocaleString()}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Active Users</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                      <Copy className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-purple-600 dark:text-purple-400 text-sm font-medium">
                      {organizations.reduce((sum, org) => sum + org.stats.sharedModules, 0)}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {organizations.reduce((sum, org) => sum + org.stats.sharedModules, 0)}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Shared Modules</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <span className="text-orange-600 dark:text-orange-400 text-sm font-medium">
                      ${organizations.reduce((sum, org) => sum + org.stats.revenue, 0).toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${organizations.reduce((sum, org) => sum + org.stats.revenue, 0).toLocaleString()}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Total Revenue</p>
                </div>
              </div>

              {/* ==================== ORGANIZATION TYPES ==================== */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                    <GitBranch className="w-5 h-5 mr-2 text-blue-500" />
                    Organization Types
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Distribution across different organizational structures
                  </p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { type: 'parent', label: 'Parent Organizations', color: 'blue', icon: Building2 },
                      { type: 'subsidiary', label: 'Subsidiaries', color: 'green', icon: GitMerge },
                      { type: 'franchise', label: 'Franchises', color: 'purple', icon: Share2 },
                      { type: 'department', label: 'Departments', color: 'orange', icon: Users2 }
                    ].map(({ type, label, color, icon: Icon }) => {
                      const count = organizations.filter(org => org.type === type).length;
                      const percentage = Math.round((count / organizations.length) * 100);

                      return (
                        <div key={type} className="text-center">
                          <div className={`w-16 h-16 mx-auto mb-4 bg-${color}-100 dark:bg-${color}-900/20 rounded-lg flex items-center justify-center`}>
                            <Icon className={`w-8 h-8 text-${color}-600 dark:text-${color}-400`} />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                            {count}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{label}</p>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full bg-${color}-500`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{percentage}%</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ==================== RECENT ACTIVITY ==================== */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                    Recent Activity
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Latest organizational changes and updates
                  </p>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {organizations
                      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
                      .slice(0, 5)
                      .map((org) => (
                        <div key={org.id} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            org.type === 'parent' ? 'bg-blue-100 text-blue-600' :
                            org.type === 'subsidiary' ? 'bg-green-100 text-green-600' :
                            org.type === 'franchise' ? 'bg-purple-100 text-purple-600' :
                            'bg-orange-100 text-orange-600'
                          }`}>
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {org.name} updated
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {org.metadata.industry} • {org.stats.activeUsers} active users
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {org.updatedAt.toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {Math.round(org.stats.growthRate * 100)}% growth
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'hierarchy' && (
            <motion.div
              key="hierarchy"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* ==================== SEARCH AND FILTERS ==================== */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search organizations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="all">All Types</option>
                      <option value="parent">Parent</option>
                      <option value="subsidiary">Subsidiary</option>
                      <option value="franchise">Franchise</option>
                      <option value="department">Department</option>
                      <option value="partner">Partner</option>
                    </select>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Organization</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* ==================== HIERARCHY TREE ==================== */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                    <GitBranch className="w-5 h-5 mr-2 text-blue-500" />
                    Organizational Hierarchy
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Visual representation of organizational relationships
                  </p>
                </div>
                <div className="p-6">
                  <div className="space-y-2">
                    {filteredOrganizations
                      .filter(org => !org.parentId) // Only show root organizations
                      .map(org => renderOrgNode(org))}
                  </div>
                </div>
              </div>

              {/* ==================== SELECTED ORGANIZATION DETAILS ==================== */}
              {selectedOrgData && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                      <Building2 className="w-5 h-5 mr-2 text-blue-500" />
                      {selectedOrgData.name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {selectedOrgData.metadata.description || `${selectedOrgData.metadata.industry} organization`}
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Basic Info */}
                      <div className="space-y-4">
                        <h3 className="font-medium text-gray-900 dark:text-white">Basic Information</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Type</span>
                            <span className="font-medium capitalize">{selectedOrgData.type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Industry</span>
                            <span className="font-medium">{selectedOrgData.metadata.industry}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Region</span>
                            <span className="font-medium">{selectedOrgData.metadata.region}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Size</span>
                            <span className="font-medium capitalize">{selectedOrgData.metadata.size}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Founded</span>
                            <span className="font-medium">{selectedOrgData.metadata.founded}</span>
                          </div>
                        </div>
                      </div>

                      {/* Hierarchy Info */}
                      <div className="space-y-4">
                        <h3 className="font-medium text-gray-900 dark:text-white">Hierarchy</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Parent</span>
                            <span className="font-medium">
                              {selectedOrgData.parentId ? getOrgById(selectedOrgData.parentId)?.name : 'None'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Children</span>
                            <span className="font-medium">{selectedOrgChildren.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Ancestors</span>
                            <span className="font-medium">{selectedOrgAncestors.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Descendants</span>
                            <span className="font-medium">{selectedOrgDescendants.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Total Network</span>
                            <span className="font-medium">{1 + selectedOrgAncestors.length + selectedOrgDescendants.length}</span>
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="space-y-4">
                        <h3 className="font-medium text-gray-900 dark:text-white">Statistics</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Active Users</span>
                            <span className="font-medium">{selectedOrgData.stats.activeUsers.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Total Modules</span>
                            <span className="font-medium">{selectedOrgData.stats.totalModules}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Shared Modules</span>
                            <span className="font-medium">{selectedOrgData.stats.sharedModules}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Revenue</span>
                            <span className="font-medium">${selectedOrgData.stats.revenue.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Growth Rate</span>
                            <span className="font-medium text-green-600">+{Math.round(selectedOrgData.stats.growthRate * 100)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'relationships' && (
            <motion.div
              key="relationships"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Organization Relationships
                  </h2>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 dark:text-gray-400">
                    Relationship management features coming soon...
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'sharing' && (
            <motion.div
              key="sharing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Module Sharing
                  </h2>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 dark:text-gray-400">
                    Module sharing features coming soon...
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    User Access Management
                  </h2>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 dark:text-gray-400">
                    User access management features coming soon...
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Network Settings
                  </h2>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 dark:text-gray-400">
                    Network configuration features coming soon...
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ==================== CREATE ORGANIZATION MODAL ==================== */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4"
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Create New Organization
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Add a new organization to your network
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrgNetworkManager;
