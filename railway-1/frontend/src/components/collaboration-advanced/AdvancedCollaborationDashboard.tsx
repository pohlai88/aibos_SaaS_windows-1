import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, MessageSquare, FileText, Video, Monitor, Calendar, CheckSquare,
  Share2, Edit, Eye, Download, Upload, Plus, Search, Filter, MoreHorizontal,
  Phone, PhoneOff, Mic, MicOff, Camera, CameraOff, Settings, Bell, Star,
  Clock, UserPlus, UserMinus, Lock, Unlock, Globe, Shield, Activity,
  BarChart3, TrendingUp, Target, Zap, Heart, Wifi, Cloud, Code,
  Loader2, AlertCircle, CheckCircle, X, ChevronRight, ChevronDown
} from 'lucide-react';
import { useAIBOSStore } from '../../lib/store';

interface CollaborationSession {
  id: string;
  name: string;
  type: 'document' | 'video' | 'screen' | 'project';
  status: 'active' | 'paused' | 'ended';
  participants: Participant[];
  documents: Document[];
  createdAt: Date;
  updatedAt: Date;
  duration: number;
  isPublic: boolean;
  permissions: string[];
}

interface Participant {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  role: 'host' | 'participant' | 'viewer';
  joinedAt: Date;
  isMuted: boolean;
  isVideoOn: boolean;
  isScreenSharing: boolean;
}

interface Document {
  id: string;
  name: string;
  type: 'document' | 'spreadsheet' | 'presentation' | 'image' | 'video';
  size: number;
  lastModified: Date;
  isShared: boolean;
  permissions: 'view' | 'edit' | 'admin';
  collaborators: string[];
  version: number;
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'completed' | 'on-hold';
  progress: number;
  dueDate: Date;
  assignees: string[];
  tasks: Task[];
  documents: Document[];
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  assignee: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
}

export const AdvancedCollaborationDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'documents' | 'projects' | 'teams'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useAIBOSStore();

  const [sessions, setSessions] = useState<CollaborationSession[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<CollaborationSession | null>(null);
  const [isInCall, setIsInCall] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const screenShareRef = useRef<HTMLVideoElement>(null);

  const fetchCollaborationData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [sessionsResponse, documentsResponse, projectsResponse, participantsResponse] = await Promise.all([
        fetch('/api/collaboration-advanced/sessions'),
        fetch('/api/collaboration-advanced/documents'),
        fetch('/api/collaboration-advanced/projects'),
        fetch('/api/collaboration-advanced/participants')
      ]);

      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        setSessions(sessionsData.data || []);
      }

      if (documentsResponse.ok) {
        const documentsData = await documentsResponse.json();
        setDocuments(documentsData.data || []);
      }

      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json();
        setProjects(projectsData.data || []);
      }

      if (participantsResponse.ok) {
        const participantsData = await participantsResponse.json();
        setParticipants(participantsData.data || []);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load collaboration data');
      addNotification({
        type: 'error',
        title: 'Collaboration Error',
        message: 'Unable to load collaboration data.',
        isRead: false
      });
    } finally {
      setIsLoading(false);
    }
  }, [addNotification]);

  const handleCreateSession = useCallback(async (sessionData: Partial<CollaborationSession>) => {
    try {
      const response = await fetch('/api/collaboration-advanced/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
      });

      if (response.ok) {
        addNotification({
          type: 'success',
          title: 'Session Created',
          message: 'Collaboration session has been created successfully.',
          isRead: false
        });
        setShowCreateModal(false);
        fetchCollaborationData();
      } else {
        throw new Error('Failed to create session');
      }
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Creation Error',
        message: 'Failed to create collaboration session.',
        isRead: false
      });
    }
  }, [addNotification, fetchCollaborationData]);

  const handleJoinSession = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch(`/api/collaboration-advanced/sessions/${sessionId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'current-user',
          userName: 'Current User',
          userEmail: 'user@aibos.com'
        })
      });

      if (response.ok) {
        addNotification({
          type: 'success',
          title: 'Session Joined',
          message: 'Successfully joined collaboration session.',
          isRead: false
        });
        setSelectedSession(sessions.find(s => s.id === sessionId) || null);
      } else {
        throw new Error('Failed to join session');
      }
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Join Error',
        message: 'Failed to join collaboration session.',
        isRead: false
      });
    }
  }, [addNotification, sessions]);

  const handleStartCall = useCallback(async () => {
    try {
      setIsInCall(true);
      addNotification({
        type: 'success',
        title: 'Call Started',
        message: 'Video call has been initiated.',
        isRead: false
      });
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Call Error',
        message: 'Failed to start video call.',
        isRead: false
      });
    }
  }, [addNotification]);

  const handleEndCall = useCallback(async () => {
    try {
      setIsInCall(false);
      setIsScreenSharing(false);
      addNotification({
        type: 'info',
        title: 'Call Ended',
        message: 'Video call has been ended.',
        isRead: false
      });
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Call Error',
        message: 'Failed to end video call.',
        isRead: false
      });
    }
  }, [addNotification]);

  const handleStartScreenShare = useCallback(async () => {
    try {
      setIsScreenSharing(true);
      addNotification({
        type: 'success',
        title: 'Screen Sharing Started',
        message: 'Screen sharing has been initiated.',
        isRead: false
      });
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Screen Share Error',
        message: 'Failed to start screen sharing.',
        isRead: false
      });
    }
  }, [addNotification]);

  const handleStopScreenShare = useCallback(async () => {
    try {
      setIsScreenSharing(false);
      addNotification({
        type: 'info',
        title: 'Screen Sharing Stopped',
        message: 'Screen sharing has been stopped.',
        isRead: false
      });
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Screen Share Error',
        message: 'Failed to stop screen sharing.',
        isRead: false
      });
    }
  }, [addNotification]);

  const handleToggleMute = useCallback(() => {
    setIsMuted(!isMuted);
    addNotification({
      type: 'info',
      title: isMuted ? 'Microphone Enabled' : 'Microphone Disabled',
      message: isMuted ? 'Your microphone is now active.' : 'Your microphone is now muted.',
      isRead: false
    });
  }, [isMuted, addNotification]);

  const handleToggleVideo = useCallback(() => {
    setIsVideoOn(!isVideoOn);
    addNotification({
      type: 'info',
      title: isVideoOn ? 'Camera Disabled' : 'Camera Enabled',
      message: isVideoOn ? 'Your camera is now off.' : 'Your camera is now on.',
      isRead: false
    });
  }, [isVideoOn, addNotification]);

  useEffect(() => {
    fetchCollaborationData();
  }, [fetchCollaborationData]);

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'screen': return <Monitor className="w-4 h-4" />;
      case 'project': return <CheckSquare className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getSessionStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'paused': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'ended': return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getParticipantStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'offline': return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
      case 'away': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'busy': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'active': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'completed': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20';
      case 'on-hold': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m ${secs}s`;
  };

  const EmptyState: React.FC<{ icon: React.ComponentType<any>; title: string; description: string; action?: React.ReactNode }> = ({ icon: Icon, title, description, action }) => (
    <div className="text-center py-12">
      <Icon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-4">{description}</p>
      {action && action}
    </div>
  );

  const LoadingState: React.FC = () => (
    <div className="text-center py-12">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
      <p className="text-gray-500 dark:text-gray-400">Loading collaboration data...</p>
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
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-white" />
            <div>
              <h1 className="text-xl font-bold text-white">Advanced Collaboration</h1>
              <p className="text-blue-100 text-sm">Document collaboration, video conferencing & project management</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Session
            </button>
            {isInCall && (
              <button
                onClick={handleEndCall}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <PhoneOff className="w-4 h-4 mr-2" />
                End Call
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'sessions', label: 'Sessions', icon: Users },
            { id: 'documents', label: 'Documents', icon: FileText },
            { id: 'projects', label: 'Projects', icon: CheckSquare },
            { id: 'teams', label: 'Teams', icon: Users }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
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
          <ErrorState message={error} onRetry={fetchCollaborationData} />
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6 space-y-6"
              >
                {/* Collaboration Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Sessions</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {sessions.filter(s => s.status === 'active').length}
                        </p>
                      </div>
                      <Users className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Online Participants</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {participants.filter(p => p.status === 'online').length}
                        </p>
                      </div>
                      <Video className="w-8 h-8 text-green-500" />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Shared Documents</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {documents.filter(d => d.isShared).length}
                        </p>
                      </div>
                      <FileText className="w-8 h-8 text-purple-500" />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Projects</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {projects.filter(p => p.status === 'active').length}
                        </p>
                      </div>
                      <CheckSquare className="w-8 h-8 text-orange-500" />
                    </div>
                  </div>
                </div>

                {/* Video Call Interface */}
                {isInCall && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Video Call</h3>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={isScreenSharing ? handleStopScreenShare : handleStartScreenShare}
                          className={`p-2 rounded-lg transition-colors ${
                            isScreenSharing
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : 'bg-gray-600 text-white hover:bg-gray-700'
                          }`}
                        >
                          <Monitor className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleToggleMute}
                          className={`p-2 rounded-lg transition-colors ${
                            isMuted ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-600 text-white hover:bg-gray-700'
                          }`}
                        >
                          {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={handleToggleVideo}
                          className={`p-2 rounded-lg transition-colors ${
                            !isVideoOn ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-600 text-white hover:bg-gray-700'
                          }`}
                        >
                          {!isVideoOn ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
                        </button>
                        <button className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                        <video
                          ref={videoRef}
                          className="w-full h-full object-cover"
                          autoPlay
                          muted
                        />
                        <div className="absolute bottom-4 left-4 text-white text-sm">
                          You (Host)
                        </div>
                      </div>
                      {isScreenSharing && (
                        <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                          <video
                            ref={screenShareRef}
                            className="w-full h-full object-cover"
                            autoPlay
                          />
                          <div className="absolute bottom-4 left-4 text-white text-sm">
                            Screen Share
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Recent Sessions */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Sessions</h3>
                  </div>
                  <div className="p-6">
                    {sessions.length > 0 ? (
                      <div className="space-y-4">
                        {sessions.slice(0, 5).map((session) => (
                          <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-lg ${getSessionStatusColor(session.status)}`}>
                                {getSessionTypeIcon(session.type)}
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">{session.name}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {session.participants.length} participants • {formatDuration(session.duration)}
                                </p>
                                <div className="flex items-center space-x-4 mt-1 text-xs text-gray-400">
                                  <span>{formatDate(session.updatedAt)}</span>
                                  <span>{session.isPublic ? 'Public' : 'Private'}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${getSessionStatusColor(session.status)}`}>
                                {session.status}
                              </span>
                              <button
                                onClick={() => handleJoinSession(session.id)}
                                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                Join
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        icon={Users}
                        title="No Sessions"
                        description="Start your first collaboration session to get started."
                        action={
                          <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Session
                          </button>
                        }
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'sessions' && (
              <motion.div
                key="sessions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6 space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Collaboration Sessions</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {sessions.length} sessions
                    </span>
                  </div>
                </div>

                {sessions.length > 0 ? (
                  <div className="space-y-4">
                    {sessions.map((session) => (
                      <div key={session.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className={`p-3 rounded-lg ${getSessionStatusColor(session.status)}`}>
                              {getSessionTypeIcon(session.type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{session.name}</h4>
                                <span className={`px-2 py-1 text-xs rounded-full ${getSessionStatusColor(session.status)}`}>
                                  {session.status}
                                </span>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  session.isPublic ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                                }`}>
                                  {session.isPublic ? 'Public' : 'Private'}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">Participants:</span>
                                  <p className="font-medium text-gray-900 dark:text-white">{session.participants.length}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">Documents:</span>
                                  <p className="font-medium text-gray-900 dark:text-white">{session.documents.length}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">Duration:</span>
                                  <p className="font-medium text-gray-900 dark:text-white">{formatDuration(session.duration)}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">Created:</span>
                                  <p className="font-medium text-gray-900 dark:text-white">{formatDate(session.createdAt)}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2">
                            <button
                              onClick={() => handleJoinSession(session.id)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            >
                              Join Session
                            </button>
                            <button
                              onClick={() => setSelectedSession(session)}
                              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Users}
                    title="No Sessions Found"
                    description="Create your first collaboration session to start working together."
                    action={
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Session
                      </button>
                    }
                  />
                )}
              </motion.div>
            )}

            {activeTab === 'documents' && (
              <motion.div
                key="documents"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6 space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Shared Documents</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {documents.length} documents
                    </span>
                  </div>
                </div>

                {documents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {documents.map((document) => (
                      <div key={document.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-8 h-8 text-blue-500" />
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white">{document.name}</h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{document.type}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            {document.isShared && <Share2 className="w-4 h-4 text-green-500" />}
                            <MoreHorizontal className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Size:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{formatFileSize(document.size)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Version:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{document.version}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Permissions:</span>
                            <span className="font-medium text-gray-900 dark:text-white capitalize">{document.permissions}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Modified:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{formatDate(document.lastModified)}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {document.collaborators.length} collaborators
                          </div>
                          <div className="flex items-center space-x-2">
                            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={FileText}
                    title="No Documents"
                    description="No shared documents are currently available."
                    action={
                      <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Document
                      </button>
                    }
                  />
                )}
              </motion.div>
            )}

            {activeTab === 'projects' && (
              <motion.div
                key="projects"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6 space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Project Management</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {projects.length} projects
                    </span>
                  </div>
                </div>

                {projects.length > 0 ? (
                  <div className="space-y-4">
                    {projects.map((project) => (
                      <div key={project.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{project.name}</h4>
                              <span className={`px-2 py-1 text-xs rounded-full ${getProjectStatusColor(project.status)}`}>
                                {project.status}
                              </span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">{project.description}</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Progress:</span>
                                <div className="flex items-center space-x-2">
                                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${project.progress}%` }}
                                    />
                                  </div>
                                  <span className="font-medium text-gray-900 dark:text-white">{project.progress}%</span>
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Tasks:</span>
                                <p className="font-medium text-gray-900 dark:text-white">{project.tasks.length}</p>
                              </div>
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Assignees:</span>
                                <p className="font-medium text-gray-900 dark:text-white">{project.assignees.length}</p>
                              </div>
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Due Date:</span>
                                <p className="font-medium text-gray-900 dark:text-white">{formatDate(project.dueDate)}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2">
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                              View Project
                            </button>
                            <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm">
                              Edit Project
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={CheckSquare}
                    title="No Projects"
                    description="Create your first project to start managing collaborative work."
                    action={
                      <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Project
                      </button>
                    }
                  />
                )}
              </motion.div>
            )}

            {activeTab === 'teams' && (
              <motion.div
                key="teams"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6 space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Team Members</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {participants.length} members
                    </span>
                  </div>
                </div>

                {participants.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {participants.map((participant) => (
                      <div key={participant.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {participant.name.charAt(0)}
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getParticipantStatusColor(participant.status).split(' ')[0]}`} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">{participant.name}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{participant.email}</p>
                            <span className={`px-2 py-1 text-xs rounded-full ${getParticipantStatusColor(participant.status)}`}>
                              {participant.role}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Status:</span>
                            <span className="font-medium text-gray-900 dark:text-white capitalize">{participant.status}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Joined:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{formatDate(participant.joinedAt)}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center space-x-2">
                            {participant.isMuted && <MicOff className="w-4 h-4 text-red-500" />}
                            {!participant.isVideoOn && <CameraOff className="w-4 h-4 text-red-500" />}
                            {participant.isScreenSharing && <Monitor className="w-4 h-4 text-green-500" />}
                          </div>
                          <div className="flex items-center space-x-2">
                            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                              <MessageSquare className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                              <Phone className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Users}
                    title="No Team Members"
                    description="Add team members to start collaborating."
                    action={
                      <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Member
                      </button>
                    }
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
