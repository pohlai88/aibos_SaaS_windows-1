'use client';

import { useState, useEffect } from 'react';
import {
  useRealtimeConnection,
  useRealtimeSubscription,
  useDatabaseChanges,
  useRealtimeAuth
} from '../../hooks/useRealtime';

export default function RealtimeDemo() {
  const { isConnected, status, connect, disconnect } = useRealtimeConnection();
  const { authenticate } = useRealtimeAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [databaseEvents, setDatabaseEvents] = useState([]);
  const [appEvents, setAppEvents] = useState([]);

  // Subscribe to test messages
  useRealtimeSubscription('test', 'message', (data) => {
    setMessages(prev => [...prev, { ...data, timestamp: new Date().toISOString() }]);
  });

  // Subscribe to database changes
  useDatabaseChanges('events', (data) => {
    setDatabaseEvents(prev => [...prev, { ...data, timestamp: new Date().toISOString() }]);
  });

  useDatabaseChanges('apps', (data) => {
    setDatabaseEvents(prev => [...prev, { ...data, timestamp: new Date().toISOString() }]);
  });

  // Subscribe to app events
  useRealtimeSubscription('app', 'demo', (data) => {
    setAppEvents(prev => [...prev, { ...data, timestamp: new Date().toISOString() }]);
  });

  // Authenticate when connected
  useEffect(() => {
    if (isConnected && status.tenantId && status.userId) {
      authenticate(status.tenantId, status.userId);
    }
  }, [isConnected, status.tenantId, status.userId, authenticate]);

  const { publish: publishMessage } = useRealtimeSubscription('test', 'message');
  const { publish: publishAppEvent } = useRealtimeSubscription('app', 'demo');

  const sendMessage = () => {
    if (newMessage.trim()) {
      // Publish to the test channel
      publishMessage({ message: newMessage, sender: status.userId });
      setNewMessage('');
    }
  };

  const sendAppEvent = () => {
    publishAppEvent({
      action: 'demo_action',
      data: { timestamp: new Date().toISOString() },
      sender: status.userId
    });
  };

  const clearMessages = () => setMessages([]);
  const clearDatabaseEvents = () => setDatabaseEvents([]);
  const clearAppEvents = () => setAppEvents([]);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Realtime Demo</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <button
              onClick={isConnected ? disconnect : connect}
              className={`px-4 py-2 rounded text-white text-sm ${
                isConnected
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {isConnected ? 'Disconnect' : 'Connect'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-6 p-6">
        {/* Test Messages */}
        <div className="flex-1 bg-white rounded-lg shadow-md">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Test Messages</h2>
              <button
                onClick={clearMessages}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Clear
              </button>
            </div>
          </div>
          <div className="p-4">
            <div className="flex space-x-2 mb-4">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={sendMessage}
                disabled={!isConnected}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                Send
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {messages.map((msg, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded">
                  <div className="text-sm text-gray-600">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                  <div className="font-medium">{msg.message}</div>
                  {msg.sender && (
                    <div className="text-xs text-gray-500">From: {msg.sender}</div>
                  )}
                </div>
              ))}
              {messages.length === 0 && (
                <div className="text-gray-500 text-center py-8">
                  No messages yet. Send a test message!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Database Events */}
        <div className="flex-1 bg-white rounded-lg shadow-md">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Database Events</h2>
              <button
                onClick={clearDatabaseEvents}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Clear
              </button>
            </div>
          </div>
          <div className="p-4">
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {databaseEvents.map((event, index) => (
                <div key={index} className="p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                  <div className="text-sm text-gray-600">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </div>
                  <div className="font-medium text-blue-800">
                    {event.table} - {event.event}
                  </div>
                  <div className="text-xs text-gray-600">
                    {JSON.stringify(event.data, null, 2)}
                  </div>
                </div>
              ))}
              {databaseEvents.length === 0 && (
                <div className="text-gray-500 text-center py-8">
                  No database events yet. Try creating/updating data!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* App Events */}
        <div className="flex-1 bg-white rounded-lg shadow-md">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">App Events</h2>
              <div className="flex space-x-2">
                <button
                  onClick={sendAppEvent}
                  disabled={!isConnected}
                  className="text-sm bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 disabled:opacity-50"
                >
                  Send Event
                </button>
                <button
                  onClick={clearAppEvents}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {appEvents.map((event, index) => (
                <div key={index} className="p-3 bg-green-50 rounded border-l-4 border-green-500">
                  <div className="text-sm text-gray-600">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </div>
                  <div className="font-medium text-green-800">
                    {event.action || 'App Event'}
                  </div>
                  <div className="text-xs text-gray-600">
                    {JSON.stringify(event.data, null, 2)}
                  </div>
                </div>
              ))}
              {appEvents.length === 0 && (
                <div className="text-gray-500 text-center py-8">
                  No app events yet. Click &quot;Send Event&quot; to test!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-white border-t px-6 py-3">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            Client ID: {status.clientId || 'N/A'} |
            Tenant: {status.tenantId || 'N/A'} |
            User: {status.userId || 'N/A'}
          </div>
          <div>
            Messages: {messages.length} |
            DB Events: {databaseEvents.length} |
            App Events: {appEvents.length}
          </div>
        </div>
      </div>
    </div>
  );
}
