'use client';

import { useState } from 'react';
import { 
  useRealtimeConnection, 
  useRealtimeStats, 
  useRealtimeTest,
  useRealtimeBroadcast 
} from '../hooks/useRealtime';

export default function RealtimeStatus() {
  const { isConnected, status, connect, disconnect } = useRealtimeConnection();
  const { stats, loading, error, refetch } = useRealtimeStats();
  const { sendTestMessage } = useRealtimeTest();
  const { broadcast } = useRealtimeBroadcast();
  
  const [testMessage, setTestMessage] = useState('Hello from realtime!');
  const [broadcastChannel, setBroadcastChannel] = useState('test');
  const [broadcastEvent, setBroadcastEvent] = useState('message');
  const [broadcastPayload, setBroadcastPayload] = useState('{"message": "Broadcast test"}');

  const handleTestMessage = async () => {
    try {
      await sendTestMessage(testMessage);
      alert('Test message sent successfully!');
    } catch (error) {
      alert(`Error sending test message: ${error.message}`);
    }
  };

  const handleBroadcast = async () => {
    try {
      const payload = JSON.parse(broadcastPayload);
      await broadcast(broadcastChannel, broadcastEvent, payload);
      alert('Broadcast sent successfully!');
    } catch (error) {
      alert(`Error broadcasting: ${error.message}`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Realtime Status</h2>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className={`text-sm font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Connection Controls */}
      <div className="flex space-x-2">
        <button
          onClick={connect}
          disabled={isConnected}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Connect
        </button>
        <button
          onClick={disconnect}
          disabled={!isConnected}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Disconnect
        </button>
        <button
          onClick={refetch}
          disabled={loading}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh Stats'}
        </button>
      </div>

      {/* Status Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="font-medium text-gray-700 mb-2">Connection Info</h3>
          <div className="space-y-1 text-sm">
            <div>Client ID: {status.clientId || 'N/A'}</div>
            <div>Tenant ID: {status.tenantId || 'N/A'}</div>
            <div>User ID: {status.userId || 'N/A'}</div>
            <div>Subscriptions: {status.subscriptionCount || 0}</div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded">
          <h3 className="font-medium text-gray-700 mb-2">Server Stats</h3>
          {error ? (
            <div className="text-red-600 text-sm">{error}</div>
          ) : stats ? (
            <div className="space-y-1 text-sm">
              <div>Total Clients: {stats.totalClients}</div>
              <div>Active Tenants: {stats.tenants}</div>
              <div>Your Tenant Clients: {stats.tenantStats?.[status.tenantId] || 0}</div>
            </div>
          ) : (
            <div className="text-gray-500 text-sm">No stats available</div>
          )}
        </div>
      </div>

      {/* Test Message */}
      <div className="border-t pt-4">
        <h3 className="font-medium text-gray-700 mb-3">Test Message</h3>
        <div className="flex space-x-2">
          <input
            type="text"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="Enter test message"
            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleTestMessage}
            disabled={!isConnected}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            Send Test
          </button>
        </div>
      </div>

      {/* Broadcast */}
      <div className="border-t pt-4">
        <h3 className="font-medium text-gray-700 mb-3">Broadcast Message</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={broadcastChannel}
              onChange={(e) => setBroadcastChannel(e.target.value)}
              placeholder="Channel"
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={broadcastEvent}
              onChange={(e) => setBroadcastEvent(e.target.value)}
              placeholder="Event"
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <textarea
            value={broadcastPayload}
            onChange={(e) => setBroadcastPayload(e.target.value)}
            placeholder="JSON payload"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleBroadcast}
            disabled={!isConnected}
            className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
          >
            Broadcast
          </button>
        </div>
      </div>
    </div>
  );
} 