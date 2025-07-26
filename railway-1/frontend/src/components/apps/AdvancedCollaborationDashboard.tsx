'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, MessageSquare, Video, FileText, Calendar, CheckCircle, Clock,
  Brain, Zap, Target, BarChart3, Plus, Settings, Activity, Mic,
  Share2, Edit3, Users2, TrendingUp, Star
} from 'lucide-react';

import {
  advancedCollaboration,
  CollaborationType,
  MeetingStatus,
  DocumentStatus,
  ProjectStatus,
  CollaborationSession,
  MeetingSession,
  DocumentSession,
  ProjectSession,
  CollaborationMetrics
} from '@/lib/advanced-collaboration';

interface AdvancedCollaborationDashboardProps {
  className?: string;
}

export default function AdvancedCollaborationDashboard({ className = '' }: AdvancedCollaborationDashboardProps) {
  const [collaborationMetrics, setCollaborationMetrics] = useState<CollaborationMetrics | null>(null);
  const [sessions, setSessions] = useState<CollaborationSession[]>([]);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'meetings' | 'documents' | 'projects' | 'create'>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(10000);

  const [sessionForm, setSessionForm] = useState({
    type: 'meeting' as CollaborationType,
    title: '',
    description: '',
    aiEnhanced: true,
    quantumEnhanced: false
  });

  useEffect(() => {
    initializeCollaborationData();
    const interval = setInterval(() => {
      if (autoRefresh) refreshCollaborationData();
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const initializeCollaborationData = useCallback(async () => {
    setIsLoading(true);
    try {
      await refreshCollaborationData();
    } catch (err) {
      console.error('Init error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshCollaborationData = useCallback(async () => {
    try {
      // Real API call to backend collaboration endpoint
      const response = await fetch('/api/advanced-collaboration/metrics', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Collaboration API error: ${response.status}`);
      }

      const data = await response.json();
      setCollaborationMetrics(data.metrics);
      setSessions(data.sessions || []);
    } catch (err) {
      console.error('Collaboration API error:', err);
      // Set empty state on error
      setCollaborationMetrics(null);
      setSessions([]);
    }
  }, []);

  const createSession = useCallback(async () => {
    if (!sessionForm.title || !sessionForm.description) return;
    setIsLoading(true);
    try {
      // Real API call to create collaboration session
      const response = await fetch('/api/advanced-collaboration/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionForm),
      });

      if (!response.ok) {
        throw new Error(`Create session API error: ${response.status}`);
      }

      const session = await response.json();
      setSessions(prev => [...prev, session]);
      setSessionForm({ type: 'meeting', title: '', description: '', aiEnhanced: true, quantumEnhanced: false });
      await refreshCollaborationData();
    } catch (err) {
      console.error('Create session API error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [sessionForm, refreshCollaborationData]);

  const startMeeting = useCallback(async (meetingId: string) => {
    setIsLoading(true);
    try {
      // Real API call to start meeting
      const response = await fetch(`/api/advanced-collaboration/meetings/${meetingId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Start meeting API error: ${response.status}`);
      }

      const meeting = await response.json();
      setSessions(prev => prev.map(s => s.id === meetingId ? meeting : s));
      await refreshCollaborationData();
    } catch (err) {
      console.error('Start meeting API error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [refreshCollaborationData]);

  const renderOverview = () => {
    if (!collaborationMetrics) {
      return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-gray-900 p-12 rounded-lg border border-gray-700 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-500" />
            <h3 className="text-xl text-white mb-2">No Collaboration Data Available</h3>
            <p className="text-gray-400 mb-6">Start by creating your first AI-enhanced collaboration session.</p>
            <button
              onClick={() => setSelectedTab('create')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
            >
              Create Session
            </button>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Total Sessions" value={collaborationMetrics.totalSessions} icon={Users} color="blue" />
          <MetricCard title="Active Sessions" value={collaborationMetrics.activeSessions} icon={Activity} color="green" />
          <MetricCard title="AI Enhancement" value={`${(collaborationMetrics.aiEnhancementRate * 100).toFixed(1)}%`} icon={Brain} color="purple" />
          <MetricCard title="Productivity Score" value={`${collaborationMetrics.productivityScore}%`} icon={TrendingUp} color="orange" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg text-white mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Collaboration Metrics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Participants</span>
                <span className="text-blue-400 font-semibold">{collaborationMetrics.participants}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">AI Assistants</span>
                <span className="text-purple-400 font-semibold">{collaborationMetrics.aiAssistants}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Engagement Rate</span>
                <span className="text-green-400 font-semibold">{collaborationMetrics.engagementRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Decision Accuracy</span>
                <span className="text-orange-400 font-semibold">{collaborationMetrics.decisionAccuracy}%</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg text-white mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => setSelectedTab('create')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Create New Session
              </button>
              <button
                onClick={() => setSelectedTab('meetings')}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Join Meeting
              </button>
              <button
                onClick={() => setSelectedTab('documents')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
              >
                Open Document
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderMeetings = () => {
    const meetings = sessions.filter(s => s.type === 'meeting') as MeetingSession[];

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg text-white mb-4">AI-Enhanced Meetings</h3>
          {meetings.length === 0 ? (
            <div className="text-center py-8">
              <Video className="w-12 h-12 mx-auto mb-3 text-gray-500" />
              <p className="text-gray-400 mb-4">No meetings scheduled yet</p>
              <p className="text-sm text-gray-500">Create your first AI-enhanced meeting to start collaborating.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {meetings.map(meeting => (
                <div key={meeting.id} className="bg-gray-800 p-4 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-white font-semibold">{meeting.title}</h4>
                      <p className="text-gray-400 text-sm">{meeting.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {meeting.aiEnhanced && <span className="text-blue-400 text-xs">AI</span>}
                      {meeting.quantumEnhanced && <span className="text-purple-400 text-xs">Quantum</span>}
                      <span className={`px-2 py-1 rounded text-xs ${
                        meeting.status === 'active' ? 'bg-green-600 text-white' :
                        meeting.status === 'scheduled' ? 'bg-blue-600 text-white' :
                        meeting.status === 'completed' ? 'bg-gray-600 text-white' :
                        'bg-red-600 text-white'
                      }`}>
                        {meeting.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center mt-3 space-x-2">
                    <span className="text-sm text-gray-500">Participants: {meeting.participants.length}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">AI Assistants: {meeting.aiAssistants.length}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{meeting.updatedAt.toLocaleDateString()}</span>
                    {meeting.status === 'scheduled' && (
                      <>
                        <span className="text-sm text-gray-500">•</span>
                        <button
                          onClick={() => startMeeting(meeting.id)}
                          className="text-green-400 hover:text-green-300 text-sm"
                          disabled={isLoading}
                        >
                          {isLoading ? 'Starting...' : 'Start Meeting'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const renderDocuments = () => {
    const documents = sessions.filter(s => s.type === 'document') as DocumentSession[];

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg text-white mb-4">Collaborative Documents</h3>
          {documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-500" />
              <p className="text-gray-400 mb-4">No documents created yet</p>
              <p className="text-sm text-gray-500">Create your first collaborative document to start working together.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map(doc => (
                <div key={doc.id} className="bg-gray-800 p-4 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-white font-semibold">{doc.title}</h4>
                      <p className="text-gray-400 text-sm">{doc.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {doc.aiEnhanced && <span className="text-blue-400 text-xs">AI</span>}
                      {doc.quantumEnhanced && <span className="text-purple-400 text-xs">Quantum</span>}
                      <span className={`px-2 py-1 rounded text-xs ${
                        doc.status === 'draft' ? 'bg-yellow-600 text-black' :
                        doc.status === 'review' ? 'bg-blue-600 text-white' :
                        doc.status === 'approved' ? 'bg-green-600 text-white' :
                        'bg-gray-600 text-white'
                      }`}>
                        {doc.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center mt-3 space-x-2">
                    <span className="text-sm text-gray-500">Type: {doc.content.type}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">Version: {doc.version}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">Collaborators: {doc.collaborators.length}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{doc.updatedAt.toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const renderProjects = () => {
    const projects = sessions.filter(s => s.type === 'project') as ProjectSession[];

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg text-white mb-4">AI-Managed Projects</h3>
          {projects.length === 0 ? (
            <div className="text-center py-8">
              <Target className="w-12 h-12 mx-auto mb-3 text-gray-500" />
              <p className="text-gray-400 mb-4">No projects created yet</p>
              <p className="text-sm text-gray-500">Create your first AI-managed project to start coordinating tasks.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map(project => (
                <div key={project.id} className="bg-gray-800 p-4 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-white font-semibold">{project.title}</h4>
                      <p className="text-gray-400 text-sm">{project.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {project.aiEnhanced && <span className="text-blue-400 text-xs">AI</span>}
                      {project.quantumEnhanced && <span className="text-purple-400 text-xs">Quantum</span>}
                      <span className={`px-2 py-1 rounded text-xs ${
                        project.status === 'active' ? 'bg-green-600 text-white' :
                        project.status === 'planning' ? 'bg-blue-600 text-white' :
                        project.status === 'completed' ? 'bg-gray-600 text-white' :
                        'bg-orange-600 text-white'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center mt-3 space-x-2">
                    <span className="text-sm text-gray-500">Tasks: {project.tasks.length}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">Milestones: {project.milestones.length}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">Resources: {project.resources.length}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{project.updatedAt.toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const renderCreate = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
        <h3 className="text-lg text-white mb-4">Create AI-Enhanced Collaboration Session</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">Session Type</label>
            <select
              className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
              value={sessionForm.type}
              onChange={e => setSessionForm({ ...sessionForm, type: e.target.value as CollaborationType })}
            >
              <option value="meeting">Meeting</option>
              <option value="document">Document</option>
              <option value="project">Project</option>
              <option value="brainstorming">Brainstorming</option>
              <option value="decision">Decision Making</option>
              <option value="workshop">Workshop</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-2">Title</label>
            <input
              className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
              placeholder="Enter session title"
              value={sessionForm.title}
              onChange={e => setSessionForm({ ...sessionForm, title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-2">Description</label>
            <textarea
              className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
              placeholder="Describe the session purpose"
              rows={3}
              value={sessionForm.description}
              onChange={e => setSessionForm({ ...sessionForm, description: e.target.value })}
            />
          </div>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={sessionForm.aiEnhanced}
                onChange={e => setSessionForm({ ...sessionForm, aiEnhanced: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-300">AI Enhanced</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={sessionForm.quantumEnhanced}
                onChange={e => setSessionForm({ ...sessionForm, quantumEnhanced: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-300">Quantum Enhanced</span>
            </label>
          </div>
          <button
            onClick={createSession}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
            disabled={isLoading || !sessionForm.title || !sessionForm.description}
          >
            {isLoading ? 'Creating...' : 'Create Session'}
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className={`min-h-screen bg-gray-950 text-white p-6 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold flex items-center">
              <Users className="w-8 h-8 mr-3 text-blue-400" />
              Advanced Collaboration
            </h1>
            <button onClick={refreshCollaborationData} className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded">
              <Activity className="w-4 h-4 inline-block mr-1" /> Refresh
            </button>
          </div>
        </motion.div>

        <div className="mb-6">
          <div className="flex space-x-1 overflow-x-auto">
            {['overview', 'meetings', 'documents', 'projects', 'create'].map(tab => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab as any)}
                className={`px-4 py-2 rounded whitespace-nowrap ${
                  selectedTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {selectedTab === 'overview' && renderOverview()}
          {selectedTab === 'meetings' && renderMeetings()}
          {selectedTab === 'documents' && renderDocuments()}
          {selectedTab === 'projects' && renderProjects()}
          {selectedTab === 'create' && renderCreate()}
        </AnimatePresence>
      </div>
    </div>
  );
}

const MetricCard = ({ title, value, icon: Icon, color }: { title: string; value: React.ReactNode; icon: any; color: string }) => (
  <div className={`bg-${color}-500/20 p-4 border border-${color}-500/30 rounded-lg`}>
    <div className="flex justify-between items-center">
      <div>
        <p className={`text-sm text-${color}-300`}>{title}</p>
        <p className={`text-2xl font-bold text-${color}-100`}>{value}</p>
      </div>
      <Icon className={`w-8 h-8 text-${color}-400`} />
    </div>
  </div>
);
