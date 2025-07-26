import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Users, FileText, Send, MoreHorizontal,
  Search, Filter, Plus, Edit, Trash2, Eye, EyeOff,
  Loader2, AlertCircle, CheckCircle, XCircle, Clock,
  User, UserCheck, UserX, Settings, Bell, BellOff
} from 'lucide-react';
import { useAIBOSStore } from '../../lib/store';

// ==================== MANIFESTOR INTEGRATION ====================
import { useManifestor, usePermission, useModuleConfig, useModuleEnabled } from '@/hooks/useManifestor';

// ==================== TYPES ====================

interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: Date;
  type: 'text' | 'file' | 'system';
  status: 'sent' | 'delivered' | 'read';
  reactions: Reaction[];
  threadId?: string;
}

interface Reaction {
  id: string;
  emoji: string;
  userId: string;
  userName: string;
}

interface Thread {
  id: string;
  title: string;
  messages: Message[];
  participants: string[];
  lastActivity: Date;
  unreadCount: number;
}

interface Document {
  id: string;
  title: string;
  content: string;
  type: 'document' | 'spreadsheet' | 'presentation';
  collaborators: string[];
  lastModified: Date;
  version: number;
  status: 'draft' | 'published' | 'archived';
}

interface Workspace {
  id: string;
  name: string;
  description?: string;
  members: string[];
  documents: Document[];
  threads: Thread[];
  settings: {
    allowGuestAccess: boolean;
    requireApproval: boolean;
    maxMembers: number;
  };
}

// ==================== COLLABORATION DASHBOARD ====================

export const CollaborationDashboard: React.FC = () => {
  // ==================== MANIFESTOR INTEGRATION ====================
  const { can, getConfig, isEnabled, health, loading: manifestLoading, error: manifestError } = useManifestor();
  const moduleConfig = useModuleConfig('collaboration');
  const isModuleEnabled = useModuleEnabled('collaboration');

  // Check permissions for current user
  const currentUser = { id: 'current-user', role: 'user', permissions: [] };
  const canView = usePermission('collaboration', 'view', currentUser);
  const canCreate = usePermission('collaboration', 'create', currentUser);
  const canEdit = usePermission('collaboration', 'edit', currentUser);
  const canShare = usePermission('collaboration', 'share', currentUser);
  const canComment = usePermission('collaboration', 'comment', currentUser);

  // Get configuration from manifest
  const collaborationConfig = moduleConfig.components?.CollaborationDashboard;
  const features = moduleConfig.features;
  const security = moduleConfig.security;
  const performance = moduleConfig.performance;

  const [activeTab, setActiveTab] = useState<'messages' | 'documents' | 'workspaces' | 'activity'>('messages');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { addNotification } = useAIBOSStore();

  const [threads, setThreads] = useState<Thread[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showNewThreadModal, setShowNewThreadModal] = useState(false);
  const [showNewDocumentModal, setShowNewDocumentModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ==================== MANIFESTOR PERMISSION CHECKS ====================
  if (manifestLoading) {
    return <div className="animate-pulse bg-gray-200 rounded-lg h-96 w-full" />;
  }

  if (manifestError) {
    return <div className="text-red-600 p-4">Collaboration Error</div>;
  }

  if (!isModuleEnabled) {
    return <div className="text-gray-600 p-4">Collaboration Disabled</div>;
  }

  if (!canView) {
    return <div className="text-gray-600 p-4">Access Denied</div>;
  }

  // Check if collaboration features are enabled
  const projectOverviewEnabled = collaborationConfig?.features?.project_overview;
  const teamActivityEnabled = collaborationConfig?.features?.team_activity;
  const recentFilesEnabled = collaborationConfig?.features?.recent_files;
  const quickActionsEnabled = collaborationConfig?.features?.quick_actions;
  const notificationsEnabled = collaborationConfig?.features?.notifications;
  const searchEnabled = collaborationConfig?.features?.search;

  const fetchCollaborationData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch threads from our AI-governed database
      const threadsResponse = await fetch('/api/collaboration/threads');
      if (threadsResponse.ok) {
        const threadsData = await threadsResponse.json();
        setThreads(threadsData.data);
      }

      // Fetch documents
      const documentsResponse = await fetch('/api/collaboration/documents');
      if (documentsResponse.ok) {
        const documentsData = await documentsResponse.json();
        setDocuments(documentsData.data);
      }

      // Fetch workspaces
      const workspacesResponse = await fetch('/api/collaboration/workspaces');
      if (workspacesResponse.ok) {
        const workspacesData = await workspacesResponse.json();
        setWorkspaces(workspacesData.data);
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

  const handleSendMessage = useCallback(async (threadId: string, content: string) => {
    try {
      const response = await fetch('/api/collaboration/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId, content })
      });

      if (response.ok) {
        const result = await response.json();
        setThreads(prev => prev.map(thread =>
          thread.id === threadId
            ? { ...thread, messages: [...thread.messages, result.data] }
            : thread
        ));
        setNewMessage('');

        // Scroll to bottom
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      } else {
        throw new Error('Failed to send message');
      }
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Message Failed',
        message: 'Failed to send message.',
        isRead: false
      });
    }
  }, [addNotification]);

  const handleCreateThread = useCallback(async (threadData: { title: string; participants: string[] }) => {
    try {
      const response = await fetch('/api/collaboration/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(threadData)
      });

      if (response.ok) {
        const result = await response.json();
        setThreads(prev => [...prev, result.data]);
        setShowNewThreadModal(false);
        addNotification({
          type: 'success',
          title: 'Thread Created',
          message: 'New conversation thread created successfully.',
          isRead: false
        });
      } else {
        throw new Error('Failed to create thread');
      }
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Creation Failed',
        message: 'Failed to create thread.',
        isRead: false
      });
    }
  }, [addNotification]);

  const handleCreateDocument = useCallback(async (documentData: { title: string; type: string }) => {
    try {
      const response = await fetch('/api/collaboration/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(documentData)
      });

      if (response.ok) {
        const result = await response.json();
        setDocuments(prev => [...prev, result.data]);
        setShowNewDocumentModal(false);
        addNotification({
          type: 'success',
          title: 'Document Created',
          message: 'New document created successfully.',
          isRead: false
        });
      } else {
        throw new Error('Failed to create document');
      }
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Creation Failed',
        message: 'Failed to create document.',
        isRead: false
      });
    }
  }, [addNotification]);

  useEffect(() => {
    fetchCollaborationData();
  }, [fetchCollaborationData]);

  // ==================== FILTERED DATA ====================

  const filteredThreads = threads.filter(thread =>
    thread.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    thread.messages.some(msg => msg.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ==================== UTILITY FUNCTIONS ====================

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="w-4 h-4" />;
      case 'spreadsheet': return <FileText className="w-4 h-4" />;
      case 'presentation': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // ==================== EMPTY STATES ====================

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
      <div className="bg-gradient-to-r from-green-600 to-teal-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-8 h-8 text-white" />
            <div>
              <h1 className="text-xl font-bold text-white">Collaboration Hub</h1>
              <p className="text-green-100 text-sm">Real-time messaging, documents & team workspaces</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowNewThreadModal(true)}
              className="inline-flex items-center px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Thread
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'messages', label: 'Messages', icon: MessageSquare },
            { id: 'documents', label: 'Documents', icon: FileText },
            { id: 'workspaces', label: 'Workspaces', icon: Users },
            { id: 'activity', label: 'Activity', icon: Clock }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === id
                  ? 'border-green-500 text-green-600 dark:text-green-400'
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
      <div className="flex h-[calc(100%-200px)]">
        {/* Sidebar */}
        <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="p-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {activeTab === 'messages' && (
              <div className="space-y-2">
                {filteredThreads.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">No conversations found</p>
                ) : (
                  filteredThreads.map((thread) => (
                    <div
                      key={thread.id}
                      onClick={() => setSelectedThread(thread)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedThread?.id === thread.id
                          ? 'bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {thread.title}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {thread.messages[thread.messages.length - 1]?.content || 'No messages yet'}
                          </p>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <span className="text-xs text-gray-400">
                            {formatTimestamp(thread.lastActivity)}
                          </span>
                          {thread.unreadCount > 0 && (
                            <span className="bg-green-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                              {thread.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-2">
                {filteredDocuments.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">No documents found</p>
                ) : (
                  filteredDocuments.map((document) => (
                    <div
                      key={document.id}
                      onClick={() => setSelectedDocument(document)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedDocument?.id === document.id
                          ? 'bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {getDocumentIcon(document.type)}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {document.title}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {document.collaborators.length} collaborators
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {isLoading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error} onRetry={fetchCollaborationData} />
          ) : (
            <AnimatePresence mode="wait">
              {activeTab === 'messages' && (
                <motion.div
                  key="messages"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex-1 flex flex-col"
                >
                  {selectedThread ? (
                    <>
                      {/* Thread Header */}
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {selectedThread.title}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {selectedThread.participants.length} participants
                            </span>
                            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {selectedThread.messages.map((message) => (
                          <div key={message.id} className="flex space-x-3">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                  {message.sender.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {message.sender.name}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatTimestamp(message.timestamp)}
                                </span>
                              </div>
                              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                                <p className="text-sm text-gray-900 dark:text-white">
                                  {message.content}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Message Input */}
                      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex space-x-3">
                          <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(selectedThread.id, newMessage)}
                            placeholder="Type a message..."
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                          <button
                            onClick={() => handleSendMessage(selectedThread.id, newMessage)}
                            disabled={!newMessage.trim()}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <EmptyState
                      icon={MessageSquare}
                      title="Select a Conversation"
                      description="Choose a conversation from the sidebar to start messaging."
                    />
                  )}
                </motion.div>
              )}

              {activeTab === 'documents' && (
                <motion.div
                  key="documents"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex-1 p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Documents</h3>
                    <button
                      onClick={() => setShowNewDocumentModal(true)}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      New Document
                    </button>
                  </div>

                  {documents.length === 0 ? (
                    <EmptyState
                      icon={FileText}
                      title="No Documents Yet"
                      description="Create your first document to start collaborating."
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {documents.map((document) => (
                        <div
                          key={document.id}
                          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow cursor-pointer"
                        >
                          <div className="flex items-center space-x-3 mb-3">
                            {getDocumentIcon(document.type)}
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {document.title}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {document.type}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                            <span>{document.collaborators.length} collaborators</span>
                            <span>{formatTimestamp(document.lastModified)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'workspaces' && (
                <motion.div
                  key="workspaces"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex-1 p-6"
                >
                  <EmptyState
                    icon={Users}
                    title="Workspace Management Coming Soon"
                    description="Team workspace creation and management features will be implemented here."
                  />
                </motion.div>
              )}

              {activeTab === 'activity' && (
                <motion.div
                  key="activity"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex-1 p-6"
                >
                  <EmptyState
                    icon={Clock}
                    title="Activity Feed Coming Soon"
                    description="Real-time activity tracking and collaboration insights will be implemented here."
                  />
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* New Thread Modal */}
      {showNewThreadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">New Conversation</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  placeholder="Enter conversation title"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Participants</label>
                <input
                  type="text"
                  placeholder="Enter email addresses"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNewThreadModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCreateThread({ title: 'New Thread', participants: [] })}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Create Thread
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Document Modal */}
      {showNewDocumentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">New Document</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  placeholder="Enter document title"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="document">Document</option>
                  <option value="spreadsheet">Spreadsheet</option>
                  <option value="presentation">Presentation</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNewDocumentModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCreateDocument({ title: 'New Document', type: 'document' })}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Create Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
