import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wifi, WifiOff, MessageSquare, Users, Bell, BellOff, Activity,
  Loader2, AlertCircle, XCircle, CheckCircle, Plus, Send, MoreHorizontal,
  Search, Filter, Eye, EyeOff, Settings, RefreshCw, Zap, Globe
} from 'lucide-react';
import { useAIBOSStore } from '../../lib/store';

interface WebSocketConnection {
  id: string;
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
  url: string;
  lastConnected: Date;
  reconnectAttempts: number;
  latency: number;
}

interface PresenceUser {
  id: string;
  name: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: Date;
  currentActivity: string;
  avatar?: string;
}

interface RealtimeMessage {
  id: string;
  type: 'message' | 'notification' | 'system' | 'activity';
  sender: string;
  content: string;
  timestamp: Date;
  channel: string;
  metadata?: any;
}

interface RealtimeChannel {
  id: string;
  name: string;
  type: 'public' | 'private' | 'direct';
  participants: string[];
  lastMessage?: RealtimeMessage;
  unreadCount: number;
  isActive: boolean;
}

export const RealtimeDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'messages' | 'presence' | 'channels'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [autoReconnect, setAutoReconnect] = useState(true);
  const { addNotification } = useAIBOSStore();

  const [connection, setConnection] = useState<WebSocketConnection | null>(null);
  const [presenceUsers, setPresenceUsers] = useState<PresenceUser[]>([]);
  const [messages, setMessages] = useState<RealtimeMessage[]>([]);
  const [channels, setChannels] = useState<RealtimeChannel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<RealtimeChannel | null>(null);
  const [newMessage, setNewMessage] = useState('');

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const connectWebSocket = useCallback(() => {
    try {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      setConnection(prev => ({
        id: 'main-connection',
        status: 'connecting',
        url: wsUrl,
        lastConnected: new Date(),
        reconnectAttempts: prev?.reconnectAttempts || 0,
        latency: 0
      }));

      ws.onopen = () => {
        console.log('✅ WebSocket connected');
        setIsConnected(true);
        setConnection(prev => prev ? {
          ...prev,
          status: 'connected',
          lastConnected: new Date(),
          reconnectAttempts: 0
        } : null);

        // Start heartbeat
        heartbeatIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
          }
        }, 30000);

        // Subscribe to channels
        ws.send(JSON.stringify({ type: 'subscribe', channels: ['general', 'system', 'notifications'] }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onclose = () => {
        console.log('❌ WebSocket disconnected');
        setIsConnected(false);
        setConnection(prev => prev ? {
          ...prev,
          status: 'disconnected'
        } : null);

        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
        }

        // Auto-reconnect
        if (autoReconnect) {
          const attempts = (connection?.reconnectAttempts || 0) + 1;
          const delay = Math.min(1000 * Math.pow(2, attempts), 30000);

          reconnectTimeoutRef.current = setTimeout(() => {
            setConnection(prev => prev ? {
              ...prev,
              reconnectAttempts: attempts
            } : null);
            connectWebSocket();
          }, delay);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnection(prev => prev ? {
          ...prev,
          status: 'error'
        } : null);
        setError('WebSocket connection failed');
      };

    } catch (err) {
      console.error('Failed to connect WebSocket:', err);
      setError('Failed to establish WebSocket connection');
    }
  }, [autoReconnect, connection?.reconnectAttempts]);

  const handleWebSocketMessage = useCallback((data: any) => {
    switch (data.type) {
      case 'pong':
        // Update latency
        const latency = Date.now() - data.timestamp;
        setConnection(prev => prev ? { ...prev, latency } : null);
        break;

      case 'presence_update':
        setPresenceUsers(prev => {
          const index = prev.findIndex(user => user.id === data.user.id);
          if (index >= 0) {
            return prev.map((user, i) => i === index ? { ...user, ...data.user } : user);
          } else {
            return [...prev, data.user];
          }
        });
        break;

      case 'message':
        const newMessage: RealtimeMessage = {
          id: data.id,
          type: data.messageType || 'message',
          sender: data.sender,
          content: data.content,
          timestamp: new Date(data.timestamp),
          channel: data.channel,
          metadata: data.metadata
        };
        setMessages(prev => [newMessage, ...prev.slice(0, 99)]); // Keep last 100 messages
        break;

      case 'notification':
        addNotification({
          type: data.notificationType || 'info',
          title: data.title,
          message: data.message,
          isRead: false
        });
        break;

      case 'channel_update':
        setChannels(prev => {
          const index = prev.findIndex(channel => channel.id === data.channel.id);
          if (index >= 0) {
            return prev.map((channel, i) => i === index ? { ...channel, ...data.channel } : channel);
          } else {
            return [...prev, data.channel];
          }
        });
        break;

      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  }, [addNotification]);

  const sendMessage = useCallback((content: string, channelId: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const message = {
        type: 'message',
        content,
        channel: channelId,
        timestamp: Date.now()
      };
      wsRef.current.send(JSON.stringify(message));
      setNewMessage('');
    }
  }, []);

  const joinChannel = useCallback((channelId: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'join_channel',
        channel: channelId
      }));
    }
  }, []);

  const leaveChannel = useCallback((channelId: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'leave_channel',
        channel: channelId
      }));
    }
  }, []);

  const fetchRealtimeData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch initial data from REST API
      const [presenceResponse, channelsResponse] = await Promise.all([
        fetch('/api/realtime/presence'),
        fetch('/api/realtime/channels')
      ]);

      if (presenceResponse.ok) {
        const presenceData = await presenceResponse.json();
        setPresenceUsers(presenceData.data);
      }

      if (channelsResponse.ok) {
        const channelsData = await channelsResponse.json();
        setChannels(channelsData.data);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load realtime data');
      addNotification({
        type: 'error',
        title: 'Realtime Error',
        message: 'Unable to load realtime data.',
        isRead: false
      });
    } finally {
      setIsLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    fetchRealtimeData();
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
    };
  }, [fetchRealtimeData, connectWebSocket]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'connecting': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'disconnected': return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
      case 'error': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <Wifi className="w-4 h-4" />;
      case 'connecting': return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'disconnected': return <WifiOff className="w-4 h-4" />;
      case 'error': return <XCircle className="w-4 h-4" />;
      default: return <WifiOff className="w-4 h-4" />;
    }
  };

  const getPresenceColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString();
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
      <p className="text-gray-500 dark:text-gray-400">Loading realtime data...</p>
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
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Globe className="w-8 h-8 text-white" />
            <div>
              <h1 className="text-xl font-bold text-white">Real-time Communication</h1>
              <p className="text-green-100 text-sm">Live messaging, presence & collaboration</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 text-white">
              {getStatusIcon(connection?.status || 'disconnected')}
              <span className="text-sm">{connection?.status || 'disconnected'}</span>
            </div>
            <label className="flex items-center space-x-2 text-white">
              <input
                type="checkbox"
                checked={autoReconnect}
                onChange={(e) => setAutoReconnect(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Auto-reconnect</span>
            </label>
            <button
              onClick={connectWebSocket}
              className="inline-flex items-center px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reconnect
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'messages', label: 'Messages', icon: MessageSquare },
            { id: 'presence', label: 'Presence', icon: Users },
            { id: 'channels', label: 'Channels', icon: Bell }
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
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchRealtimeData} />
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
                {/* Connection Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Connection</p>
                        <p className={`text-2xl font-bold ${getStatusColor(connection?.status || 'disconnected').split(' ')[0]}`}>
                          {connection?.status || 'disconnected'}
                        </p>
                      </div>
                      {getStatusIcon(connection?.status || 'disconnected')}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Latency</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {connection?.latency || 0}ms
                        </p>
                      </div>
                      <Zap className="w-8 h-8 text-gray-400" />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Online Users</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {presenceUsers.filter(user => user.status === 'online').length}
                        </p>
                      </div>
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Channels</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {channels.filter(channel => channel.isActive).length}
                        </p>
                      </div>
                      <Bell className="w-8 h-8 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Recent Messages */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Messages</h3>
                  </div>
                  <div className="p-6">
                    {messages.length > 0 ? (
                      <div className="space-y-4">
                        {messages.slice(0, 5).map((message) => (
                          <div key={message.id} className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                <MessageSquare className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {message.sender}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {formatTimestamp(message.timestamp)}
                                </span>
                                <span className="text-xs text-gray-400">
                                  #{message.channel}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {message.content}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        icon={MessageSquare}
                        title="No Messages Yet"
                        description="Start a conversation to see messages here."
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'messages' && (
              <motion.div
                key="messages"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6 space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Live Messages</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {messages.length} messages
                    </span>
                  </div>
                </div>

                {messages.length > 0 ? (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div key={message.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                              <MessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {message.sender}
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {formatTimestamp(message.timestamp)}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                message.type === 'message' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                                message.type === 'notification' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                                message.type === 'system' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400' :
                                'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              }`}>
                                {message.type}
                              </span>
                              <span className="text-xs text-gray-400">
                                #{message.channel}
                              </span>
                            </div>
                            <p className="text-gray-900 dark:text-white">
                              {message.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={MessageSquare}
                    title="No Messages"
                    description="No messages have been sent yet."
                  />
                )}
              </motion.div>
            )}

            {activeTab === 'presence' && (
              <motion.div
                key="presence"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6 space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Presence</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {presenceUsers.filter(user => user.status === 'online').length} online
                    </span>
                  </div>
                </div>

                {presenceUsers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {presenceUsers.map((user) => (
                      <div key={user.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                              <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white dark:border-gray-800 ${getPresenceColor(user.status)}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {user.name}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                user.status === 'online' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                                user.status === 'away' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                                user.status === 'busy' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                              }`}>
                                {user.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {user.currentActivity}
                            </p>
                            <p className="text-xs text-gray-400">
                              Last seen: {formatTimestamp(user.lastSeen)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Users}
                    title="No Users Online"
                    description="No users are currently online."
                  />
                )}
              </motion.div>
            )}

            {activeTab === 'channels' && (
              <motion.div
                key="channels"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6 space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Channels</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {channels.filter(channel => channel.isActive).length} active
                    </span>
                  </div>
                </div>

                {channels.length > 0 ? (
                  <div className="space-y-4">
                    {channels.map((channel) => (
                      <div key={channel.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-900 dark:text-white">
                                  #{channel.name}
                                </span>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  channel.type === 'public' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                                  channel.type === 'private' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                                  'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                }`}>
                                  {channel.type}
                                </span>
                                {channel.unreadCount > 0 && (
                                  <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                                    {channel.unreadCount}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {channel.participants.length} participants
                              </p>
                              {channel.lastMessage && (
                                <p className="text-xs text-gray-400">
                                  Last: {channel.lastMessage.content.substring(0, 50)}...
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {channel.isActive ? (
                              <button
                                onClick={() => leaveChannel(channel.id)}
                                className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                              >
                                Leave
                              </button>
                            ) : (
                              <button
                                onClick={() => joinChannel(channel.id)}
                                className="text-sm text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                              >
                                Join
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Bell}
                    title="No Channels"
                    description="No channels are currently available."
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
