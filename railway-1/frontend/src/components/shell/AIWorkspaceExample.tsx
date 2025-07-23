import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WorkspaceManager, WindowShell, useWorkspaceAI } from './index';

const AIWorkspaceExample: React.FC = () => {
  const [workspaces, setWorkspaces] = useState([
    {
      id: 'ai-workspace-1',
      name: 'AI-Powered Development',
      windows: [
        {
          id: 'code-editor-1',
          title: 'React Component Editor',
          content: 'Building revolutionary AI-powered components',
          position: { x: 50, y: 50 },
          size: { width: 600, height: 400 },
          isActive: true,
          isVisible: true,
          lastActivity: new Date(),
          type: 'development'
        },
        {
          id: 'terminal-1',
          title: 'AI-BOS Terminal',
          content: 'Running AI optimization algorithms',
          position: { x: 700, y: 50 },
          size: { width: 400, height: 300 },
          isActive: false,
          isVisible: true,
          lastActivity: new Date(Date.now() - 300000),
          type: 'development'
        },
        {
          id: 'docs-1',
          title: 'AI Documentation',
          content: 'Advanced AI features and integration patterns',
          position: { x: 50, y: 500 },
          size: { width: 500, height: 350 },
          isActive: false,
          isVisible: true,
          lastActivity: new Date(Date.now() - 600000),
          type: 'research'
        }
      ],
      type: 'work' as const,
      productivity: 85,
      focus: 90,
      lastModified: new Date()
    }
  ]);

  const [currentWorkspace, setCurrentWorkspace] = useState(workspaces[0]);
  const [aiOptimization, setAiOptimization] = useState<any>(null);
  const [showAIInsights, setShowAIInsights] = useState(false);

  const { optimizeWorkspace, getInsights, isProcessing, lastInsights } = useWorkspaceAI();

  // AI Optimization Effect
  useEffect(() => {
    const performAIOptimization = async () => {
      if (currentWorkspace) {
        const optimization = await optimizeWorkspace(currentWorkspace);
        setAiOptimization(optimization);
      }
    };

    performAIOptimization();
  }, [currentWorkspace, optimizeWorkspace]);

  // AI Insights Effect
  useEffect(() => {
    const getAIInsights = async () => {
      if (currentWorkspace) {
        await getInsights(currentWorkspace);
      }
    };

    getAIInsights();
  }, [currentWorkspace, getInsights]);

  const handleWorkspaceChange = (workspaceId: string) => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (workspace) {
      setCurrentWorkspace(workspace);
    }
  };

  const applyAILayout = () => {
    if (aiOptimization?.layout) {
      const optimizedWorkspace = {
        ...currentWorkspace,
        windows: currentWorkspace.windows.map(window => {
          const arrangement = aiOptimization.layout.windowArrangements.find(
            (a: any) => a.windowId === window.id
          );
          if (arrangement) {
            return {
              ...window,
              position: arrangement.suggestedPosition,
              size: arrangement.suggestedSize
            };
          }
          return window;
        })
      };
      setCurrentWorkspace(optimizedWorkspace);
      setWorkspaces(prev => prev.map(w =>
        w.id === optimizedWorkspace.id ? optimizedWorkspace : w
      ));
    }
  };

  return (
    <WorkspaceManager
      onWorkspaceChange={handleWorkspaceChange}
      enableAI={true}
      enableCollaboration={true}
      enableAnalytics={true}
      maxWorkspaces={10}
    >
      <div className="min-h-screen bg-black text-white">
        {/* AI Controls Panel */}
        <div className="fixed top-4 right-4 z-50">
          <motion.div
            className="bg-slate-900/95 backdrop-blur-xl rounded-xl border border-white/20 p-4"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-lg font-semibold mb-3 text-indigo-400">AI Workspace Controls</h3>

            <div className="space-y-3">
              <motion.button
                onClick={applyAILayout}
                disabled={!aiOptimization || isProcessing}
                className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isProcessing ? '🔄 Optimizing...' : '🎯 Apply AI Layout'}
              </motion.button>

              <motion.button
                onClick={() => setShowAIInsights(!showAIInsights)}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                🧠 AI Insights
              </motion.button>
            </div>

            {/* AI Status */}
            {aiOptimization && (
              <div className="mt-4 p-3 bg-white/5 rounded-lg">
                <div className="text-sm text-white/70 mb-2">AI Optimization Status</div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Confidence:</span>
                    <span className="text-green-400">{(aiOptimization.layout.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expected Productivity:</span>
                    <span className="text-blue-400">{aiOptimization.layout.expectedProductivity.toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expected Focus:</span>
                    <span className="text-purple-400">{aiOptimization.layout.expectedFocus.toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* AI Insights Panel */}
        <AnimatePresence>
          {showAIInsights && (
            <motion.div
              className="fixed top-4 left-4 z-50 max-w-md"
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-slate-900/95 backdrop-blur-xl rounded-xl border border-white/20 p-4">
                <h3 className="text-lg font-semibold mb-3 text-purple-400">AI Insights</h3>

                {lastInsights.length > 0 ? (
                  <div className="space-y-2">
                    {lastInsights.map((insight, index) => (
                      <motion.div
                        key={index}
                        className="p-2 bg-white/5 rounded-lg text-sm"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        💡 {insight}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-white/60">No insights available</div>
                )}

                {aiOptimization?.performance && (
                  <div className="mt-4 p-3 bg-white/5 rounded-lg">
                    <div className="text-sm text-white/70 mb-2">Performance Prediction</div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Predicted Productivity:</span>
                        <span className="text-green-400">{aiOptimization.performance.predictedProductivity.toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Predicted Focus:</span>
                        <span className="text-blue-400">{aiOptimization.performance.predictedFocus.toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Workspace Content */}
        <div className="p-8">
          <h1 className="text-4xl font-bold mb-8">AI-Powered Workspace System</h1>

          <div className="mb-8 p-6 bg-white/5 rounded-xl border border-white/20">
            <h2 className="text-2xl font-semibold mb-4 text-indigo-400">Current Workspace: {currentWorkspace.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-green-500/20 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-400">{currentWorkspace.productivity}%</div>
                <div className="text-white/70">Productivity</div>
              </div>
              <div className="bg-blue-500/20 rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-400">{currentWorkspace.focus}%</div>
                <div className="text-white/70">Focus</div>
              </div>
              <div className="bg-purple-500/20 rounded-lg p-3">
                <div className="text-2xl font-bold text-purple-400">{currentWorkspace.windows.length}</div>
                <div className="text-white/70">Windows</div>
              </div>
            </div>
          </div>

          {/* AI-Optimized Windows */}
          <div className="relative">
            {currentWorkspace.windows.map((window) => (
              <WindowShell
                key={window.id}
                windowId={window.id}
                title={window.title}
                theme="ai-adaptive"
                size={window.size}
                position={window.position}
                onAction={(action) => console.log('Window action:', action)}
              >
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-4">{window.title}</h3>
                  <p className="text-white/70 mb-4">{window.content}</p>

                  {/* AI Analysis Display */}
                  {aiOptimization?.layout && (
                    <div className="mt-4 p-3 bg-white/5 rounded-lg">
                      <div className="text-sm text-white/70 mb-2">AI Analysis</div>
                      {(() => {
                        const arrangement = aiOptimization.layout.windowArrangements.find(
                          (a: any) => a.windowId === window.id
                        );
                        return arrangement ? (
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span>Priority:</span>
                              <span className={`${
                                arrangement.priority === 'high' ? 'text-red-400' :
                                arrangement.priority === 'medium' ? 'text-yellow-400' :
                                'text-green-400'
                              }`}>
                                {arrangement.priority.toUpperCase()}
                              </span>
                            </div>
                            <div className="text-white/60">{arrangement.reason}</div>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  )}
                </div>
              </WindowShell>
            ))}
          </div>

          {/* AI Window Groups */}
          {aiOptimization?.groups && (
            <div className="mt-12 p-6 bg-white/5 rounded-xl border border-white/20">
              <h3 className="text-xl font-semibold mb-4 text-purple-400">AI-Detected Window Groups</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiOptimization.groups.map((group: any) => (
                  <motion.div
                    key={group.id}
                    className="p-4 bg-white/5 rounded-lg border border-white/10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h4 className="font-semibold text-white mb-2">{group.name}</h4>
                    <div className="text-sm text-white/70 mb-2">
                      Type: <span className="text-blue-400">{group.type}</span>
                    </div>
                    <div className="text-sm text-white/70 mb-2">
                      Windows: <span className="text-green-400">{group.windows.length}</span>
                    </div>
                    <div className="text-xs text-white/60">{group.reasoning}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-12 p-6 bg-white/5 rounded-xl border border-white/20">
            <h3 className="text-xl font-semibold mb-4">How to Use AI-Powered Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-indigo-400 mb-2">AI Layout Optimization</h4>
                <ul className="space-y-1 text-sm text-white/70">
                  <li>• Click &quot;Apply AI Layout&quot; to optimize window positions</li>
                  <li>• AI analyzes content and user patterns</li>
                  <li>• Windows are arranged by priority and relevance</li>
                  <li>• Performance predictions guide optimization</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-purple-400 mb-2">AI Insights</h4>
                <ul className="space-y-1 text-sm text-white/70">
                  <li>• Click &quot;AI Insights&quot; to view recommendations</li>
                  <li>• Real-time performance predictions</li>
                  <li>• Risk factor identification</li>
                  <li>• Optimization suggestions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </WorkspaceManager>
  );
};

export default AIWorkspaceExample;
