import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { WorkspaceManager, WindowShell } from './index';

const WorkspaceExample: React.FC = () => {
  const [activeWorkspace, setActiveWorkspace] = useState('default');

  const handleWorkspaceChange = (workspaceId: string) => {
    setActiveWorkspace(workspaceId);
    console.log('Switched to workspace:', workspaceId);
  };

  const handleWorkspaceCreate = (workspace: any) => {
    console.log('Created new workspace:', workspace);
  };

  const handleWorkspaceDelete = (workspaceId: string) => {
    console.log('Deleted workspace:', workspaceId);
  };

  return (
    <WorkspaceManager
      onWorkspaceChange={handleWorkspaceChange}
      onWorkspaceCreate={handleWorkspaceCreate}
      onWorkspaceDelete={handleWorkspaceDelete}
      enableAI={true}
      enableCollaboration={true}
      enableAnalytics={true}
      maxWorkspaces={10}
    >
      <div className="min-h-screen bg-black text-white">
        {/* Workspace Content */}
        <div className="p-8">
          <h1 className="text-4xl font-bold mb-8">AI-BOS Workspace System</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Example Windows for Different Workspaces */}
            <WindowShell
              windowId="code-editor"
              title="Code Editor"
              theme="ai-adaptive"
              size="large"
              position={{ x: 50, y: 50 }}
              onAction={(action) => console.log('Window action:', action)}
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Code Editor</h2>
                <p className="text-white/70 mb-4">
                  This is an example code editor window. It demonstrates the AI-powered workspace system.
                </p>
                <div className="bg-slate-800 rounded-lg p-4 font-mono text-sm">
                  <div className="text-green-400">function</div>
                  <div className="text-blue-400">createRevolutionaryApp</div>
                  <div className="text-white">() {`{`}</div>
                  <div className="text-yellow-400 ml-4">return</div>
                  <div className="text-purple-400 ml-4">&quot;Beyond Sir Steve!&quot;</div>
                  <div className="text-white">{`}`}</div>
                </div>
              </div>
            </WindowShell>

            <WindowShell
              windowId="design-tool"
              title="Design Tool"
              theme="custom"
              size="medium"
              position={{ x: 400, y: 100 }}
              onAction={(action) => console.log('Window action:', action)}
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Design Tool</h2>
                <p className="text-white/70 mb-4">
                  Creative workspace for design and visual work.
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {['🎨', '🎭', '🎪', '🎯', '🎲', '🎸'].map((emoji, i) => (
                    <div
                      key={i}
                      className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center text-2xl hover:bg-white/20 transition-colors cursor-pointer"
                    >
                      {emoji}
                    </div>
                  ))}
                </div>
              </div>
            </WindowShell>

            <WindowShell
              windowId="research-docs"
              title="Research Docs"
              theme="macos"
              size="medium"
              position={{ x: 200, y: 300 }}
              onAction={(action) => console.log('Window action:', action)}
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Research Documents</h2>
                <p className="text-white/70 mb-4">
                  Research and documentation workspace.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    <span>AI-Powered Workspace Management</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    <span>Multi-Modal Interaction Systems</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                    <span>Collaborative Workspace Features</span>
                  </div>
                </div>
              </div>
            </WindowShell>

            <WindowShell
              windowId="chat-app"
              title="Team Chat"
              theme="windows"
              size="small"
              position={{ x: 600, y: 200 }}
              onAction={(action) => console.log('Window action:', action)}
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Team Chat</h2>
                <p className="text-white/70 mb-4">
                  Communication workspace for team collaboration.
                </p>
                <div className="space-y-2">
                  <div className="bg-blue-500/20 rounded-lg p-2 text-sm">
                    <span className="font-semibold">Alice:</span> Great work on the workspace system!
                  </div>
                  <div className="bg-green-500/20 rounded-lg p-2 text-sm">
                    <span className="font-semibold">Bob:</span> The AI features are incredible!
                  </div>
                </div>
              </div>
            </WindowShell>

            <WindowShell
              windowId="analytics-dashboard"
              title="Analytics Dashboard"
              theme="ai-adaptive"
              size="large"
              position={{ x: 100, y: 500 }}
              onAction={(action) => console.log('Window action:', action)}
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Analytics Dashboard</h2>
                <p className="text-white/70 mb-4">
                  Real-time workspace analytics and insights.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-500/20 rounded-lg p-3">
                    <div className="text-2xl font-bold text-green-400">85%</div>
                    <div className="text-sm text-white/70">Productivity</div>
                  </div>
                  <div className="bg-blue-500/20 rounded-lg p-3">
                    <div className="text-2xl font-bold text-blue-400">92%</div>
                    <div className="text-sm text-white/70">Focus</div>
                  </div>
                  <div className="bg-purple-500/20 rounded-lg p-3">
                    <div className="text-2xl font-bold text-purple-400">4</div>
                    <div className="text-sm text-white/70">Active Workspaces</div>
                  </div>
                  <div className="bg-orange-500/20 rounded-lg p-3">
                    <div className="text-2xl font-bold text-orange-400">12</div>
                    <div className="text-sm text-white/70">Windows</div>
                  </div>
                </div>
              </div>
            </WindowShell>

            <WindowShell
              windowId="music-player"
              title="Music Player"
              theme="custom"
              size="small"
              position={{ x: 800, y: 400 }}
              onAction={(action) => console.log('Window action:', action)}
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Music Player</h2>
                <p className="text-white/70 mb-4">
                  Personal workspace for entertainment.
                </p>
                <div className="text-center">
                  <div className="text-4xl mb-2">🎵</div>
                  <div className="text-sm text-white/70">Now Playing</div>
                  <div className="font-semibold">&quot;Beyond Sir Steve&quot;</div>
                  <div className="text-xs text-white/50">AI-BOS Orchestra</div>
                </div>
              </div>
            </WindowShell>
          </div>

          {/* Instructions */}
          <div className="mt-12 p-6 bg-white/5 rounded-xl border border-white/20">
            <h3 className="text-xl font-semibold mb-4">How to Use the Workspace System</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-400 mb-2">Keyboard Shortcuts</h4>
                <ul className="space-y-1 text-sm text-white/70">
                  <li>• <kbd className="bg-white/10 px-2 py-1 rounded">Ctrl+`</kbd> - Toggle workspace switcher</li>
                  <li>• <kbd className="bg-white/10 px-2 py-1 rounded">Ctrl+1-9</kbd> - Switch to workspace</li>
                  <li>• <kbd className="bg-white/10 px-2 py-1 rounded">Ctrl+Shift+N</kbd> - Create new workspace</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-blue-400 mb-2">AI Features</h4>
                <ul className="space-y-1 text-sm text-white/70">
                  <li>• Automatic workspace suggestions</li>
                  <li>• Productivity and focus tracking</li>
                  <li>• Smart workspace organization</li>
                  <li>• Context-aware recommendations</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </WorkspaceManager>
  );
};

export default WorkspaceExample;
