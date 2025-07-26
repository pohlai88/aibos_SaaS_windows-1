import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, UserPlus, Settings, Shield, Crown, User, UserCheck, UserX,
  Loader2, AlertCircle, XCircle, CheckCircle, Plus, Edit, Trash2,
  Search, Filter, MoreHorizontal, Mail, Calendar, BarChart3, Activity
} from 'lucide-react';
import { useAIBOSStore } from '../../lib/store';

// ==================== MANIFESTOR INTEGRATION ====================
import { useManifestor, usePermission, useModuleConfig, useModuleEnabled } from '@/hooks/useManifestor';

interface Team {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  ownerName: string;
  memberCount: number;
  createdAt: Date;
  status: 'active' | 'archived';
}

interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  status: 'active' | 'pending' | 'suspended';
  joinedAt: Date;
  lastActive: Date;
}

interface TeamInvitation {
  id: string;
  teamId: string;
  email: string;
  role: string;
  invitedBy: string;
  invitedAt: Date;
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'expired' | 'declined';
}

export const TeamManagementDashboard: React.FC = () => {
  // ==================== MANIFESTOR INTEGRATION ====================
  const { can, getConfig, isEnabled, health, loading: manifestLoading, error: manifestError } = useManifestor();
  const moduleConfig = useModuleConfig('collaboration');
  const isModuleEnabled = useModuleEnabled('collaboration');

  // Check permissions for current user
  const currentUser = { id: 'current-user', role: 'user', permissions: [] };
  const canView = usePermission('collaboration', 'view', currentUser);
  const canCreate = usePermission('collaboration', 'create', currentUser);
  const canEdit = usePermission('collaboration', 'edit', currentUser);
  const canManageTeams = usePermission('collaboration', 'manage_teams', currentUser);

  // Get configuration from manifest
  const teamConfig = moduleConfig.components?.TeamManagementDashboard;
  const features = moduleConfig.features;
  const security = moduleConfig.security;

  const [activeTab, setActiveTab] = useState<'teams' | 'members' | 'invitations' | 'activity'>('teams');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { addNotification } = useAIBOSStore();

  const [teams, setTeams] = useState<Team[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);

  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // ==================== MANIFESTOR PERMISSION CHECKS ====================
  if (manifestLoading) {
    return <div className="animate-pulse bg-gray-200 rounded-lg h-96 w-full" />;
  }

  if (manifestError) {
    return <div className="text-red-600 p-4">Team Management Error</div>;
  }

  if (!isModuleEnabled) {
    return <div className="text-gray-600 p-4">Team Management Disabled</div>;
  }

  if (!canView) {
    return <div className="text-gray-600 p-4">Access Denied</div>;
  }

  // Check if team management features are enabled
  const teamCreationEnabled = teamConfig?.features?.team_creation;
  const memberManagementEnabled = teamConfig?.features?.member_management;
  const roleAssignmentEnabled = teamConfig?.features?.role_assignment;
  const permissionManagementEnabled = teamConfig?.features?.permission_management;
  const teamAnalyticsEnabled = teamConfig?.features?.team_analytics;
  const invitationSystemEnabled = teamConfig?.features?.invitation_system;

  const fetchTeamData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const teamsResponse = await fetch('/api/teams');
      if (teamsResponse.ok) {
        const teamsData = await teamsResponse.json();
        setTeams(teamsData.data);
      }

      const membersResponse = await fetch('/api/teams/members');
      if (membersResponse.ok) {
        const membersData = await membersResponse.json();
        setTeamMembers(membersData.data);
      }

      const invitationsResponse = await fetch('/api/teams/invitations');
      if (invitationsResponse.ok) {
        const invitationsData = await invitationsResponse.json();
        setInvitations(invitationsData.data);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load team data');
      addNotification({
        type: 'error',
        title: 'Team Error',
        message: 'Unable to load team data.',
        isRead: false
      });
    } finally {
      setIsLoading(false);
    }
  }, [addNotification]);

  const handleCreateTeam = useCallback(async (teamData: { name: string; description: string }) => {
    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamData)
      });

      if (response.ok) {
        const result = await response.json();
        setTeams(prev => [...prev, result.data]);
        setShowCreateTeamModal(false);
        addNotification({
          type: 'success',
          title: 'Team Created',
          message: 'Team created successfully.',
          isRead: false
        });
      } else {
        throw new Error('Failed to create team');
      }
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Creation Failed',
        message: 'Failed to create team.',
        isRead: false
      });
    }
  }, [addNotification]);

  const handleInviteMember = useCallback(async (inviteData: { teamId: string; email: string; role: string }) => {
    try {
      const response = await fetch('/api/teams/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inviteData)
      });

      if (response.ok) {
        const result = await response.json();
        setInvitations(prev => [...prev, result.data]);
        setShowInviteModal(false);
        addNotification({
          type: 'success',
          title: 'Invitation Sent',
          message: 'Team invitation sent successfully.',
          isRead: false
        });
      } else {
        throw new Error('Failed to send invitation');
      }
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Invitation Failed',
        message: 'Failed to send team invitation.',
        isRead: false
      });
    }
  }, [addNotification]);

  const handleUpdateMemberRole = useCallback(async (memberId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/teams/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        setTeamMembers(prev => prev.map(member =>
          member.id === memberId ? { ...member, role: newRole as any } : member
        ));
        addNotification({
          type: 'success',
          title: 'Role Updated',
          message: 'Member role updated successfully.',
          isRead: false
        });
      } else {
        throw new Error('Failed to update role');
      }
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update member role.',
        isRead: false
      });
    }
  }, [addNotification]);

  const handleRemoveMember = useCallback(async (memberId: string) => {
    try {
      const response = await fetch(`/api/teams/members/${memberId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setTeamMembers(prev => prev.filter(member => member.id !== memberId));
        addNotification({
          type: 'success',
          title: 'Member Removed',
          message: 'Member removed from team successfully.',
          isRead: false
        });
      } else {
        throw new Error('Failed to remove member');
      }
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Removal Failed',
        message: 'Failed to remove member from team.',
        isRead: false
      });
    }
  }, [addNotification]);

  const handleCancelInvitation = useCallback(async (invitationId: string) => {
    try {
      const response = await fetch(`/api/teams/invitations/${invitationId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setInvitations(prev => prev.filter(invitation => invitation.id !== invitationId));
        addNotification({
          type: 'success',
          title: 'Invitation Cancelled',
          message: 'Team invitation cancelled successfully.',
          isRead: false
        });
      } else {
        throw new Error('Failed to cancel invitation');
      }
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Cancellation Failed',
        message: 'Failed to cancel team invitation.',
        isRead: false
      });
    }
  }, [addNotification]);

  useEffect(() => {
    fetchTeamData();
  }, [fetchTeamData]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'admin': return <Shield className="w-4 h-4 text-blue-600" />;
      case 'member': return <User className="w-4 h-4 text-green-600" />;
      case 'viewer': return <UserCheck className="w-4 h-4 text-gray-600" />;
      default: return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'admin': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'member': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'viewer': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'suspended': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const EmptyState: React.FC<{ icon: React.ComponentType<any>; title: string; description: string }> = ({ icon: Icon, title, description }) => (
    <div className="text-center py-12">
      <Icon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400">{description}</p>
    </div>
  );

  const LoadingState: React.FC = () => (
    <div className="text-center py-12">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
      <p className="text-gray-500 dark:text-gray-400">Loading team data...</p>
    </div>
  );

  const ErrorState: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
    <div className="text-center py-12">
      <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Unable to Load Data</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-4">{message}</p>
      <button onClick={onRetry} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        Try Again
      </button>
    </div>
  );

  return (
    <div className="h-full bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-white" />
            <div>
              <h1 className="text-xl font-bold text-white">Team Management</h1>
              <p className="text-purple-100 text-sm">Create, manage & collaborate with teams</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowCreateTeamModal(true)}
              className="inline-flex items-center px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Team
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'teams', label: 'Teams', icon: Users },
            { id: 'members', label: 'Members', icon: User },
            { id: 'invitations', label: 'Invitations', icon: Mail },
            { id: 'activity', label: 'Activity', icon: Activity }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === id
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchTeamData} />
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'teams' && (
              <motion.div
                key="teams"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6 space-y-6"
              >
                {/* Search */}
                <div className="flex items-center justify-between">
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search teams..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Teams Grid */}
                {teams.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teams
                      .filter(team => team.name.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((team) => (
                        <div key={team.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                {team.name}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {team.description}
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                <span>{team.memberCount} members</span>
                                <span>Created {formatDate(team.createdAt)}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(team.status)}`}>
                                {team.status}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                Owner: {team.ownerName}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setShowInviteModal(true)}
                                className="text-sm text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                              >
                                Invite
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Users}
                    title="No Teams Found"
                    description="Create your first team to get started with collaboration."
                  />
                )}
              </motion.div>
            )}

            {activeTab === 'members' && (
              <motion.div
                key="members"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6 space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Team Members</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {teamMembers.length} total members
                    </span>
                  </div>
                </div>

                {teamMembers.length > 0 ? (
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Member
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Joined
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {teamMembers.map((member) => (
                            <tr key={member.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                      <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                      {member.name}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      {member.email}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                  {getRoleIcon(member.role)}
                                  <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(member.role)}`}>
                                    {member.role}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(member.status)}`}>
                                  {member.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {formatDate(member.joinedAt)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <div className="flex items-center space-x-2">
                                  <select
                                    value={member.role}
                                    onChange={(e) => handleUpdateMemberRole(member.id, e.target.value)}
                                    className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                  >
                                    <option value="viewer">Viewer</option>
                                    <option value="member">Member</option>
                                    <option value="admin">Admin</option>
                                  </select>
                                  <button
                                    onClick={() => handleRemoveMember(member.id)}
                                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    icon={User}
                    title="No Members Found"
                    description="No team members are currently available."
                  />
                )}
              </motion.div>
            )}

            {activeTab === 'invitations' && (
              <motion.div
                key="invitations"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6 space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Team Invitations</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {invitations.filter(inv => inv.status === 'pending').length} pending
                    </span>
                  </div>
                </div>

                {invitations.length > 0 ? (
                  <div className="space-y-4">
                    {invitations.map((invitation) => (
                      <div key={invitation.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span className="font-medium text-gray-900 dark:text-white">
                                {invitation.email}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(invitation.role)}`}>
                                {invitation.role}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(invitation.status)}`}>
                                {invitation.status}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Invited by {invitation.invitedBy} on {formatDate(invitation.invitedAt)}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {invitation.status === 'pending' && (
                              <button
                                onClick={() => handleCancelInvitation(invitation.id)}
                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Mail}
                    title="No Invitations"
                    description="No team invitations are currently pending."
                  />
                )}
              </motion.div>
            )}

            {activeTab === 'activity' && (
              <motion.div
                key="activity"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6 space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Team Activity</h3>
                </div>

                <EmptyState
                  icon={Activity}
                  title="Activity Coming Soon"
                  description="Team activity tracking will be available in the next update."
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Create Team Modal */}
      {showCreateTeamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create New Team</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleCreateTeam({
                name: formData.get('name') as string,
                description: formData.get('description') as string
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Team Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateTeamModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Invite Team Member
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleInviteMember({
                teamId: teams[0]?.id || '',
                email: formData.get('email') as string,
                role: formData.get('role') as string
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Role
                  </label>
                  <select
                    name="role"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
