'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiBuilderSDK, PromptRequest, PromptResponse } from '../../ai/AIBuilderSDK';
import { AppContainer } from '../../runtime/AppContainer';
import { AppManifest } from '../../runtime/ManifestLoader';

// ==================== PHASE 2 DEMO COMPONENT ====================
// **"Everyone becomes a creator"** - The 1984 Macintosh moment for app creation

export const Phase2Demo: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<PromptResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedApp, setSelectedApp] = useState<AppManifest | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // ==================== EXAMPLE PROMPTS ====================
  const examplePrompts = [
    "Create a form to collect customer contact information",
    "Build a dashboard showing sales analytics with charts",
    "Make a list view to manage product inventory",
    "Create a workflow to process customer orders",
    "Build a form to onboard new employees",
  ];

  // ==================== HANDLERS ====================

  const handlePromptSubmit = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);

    try {
      const request: PromptRequest = {
        prompt: prompt.trim(),
        context: {
          userRole: 'business_user',
          businessDomain: 'general',
          preferences: {
            theme: 'auto',
            complexity: 'moderate',
            style: 'modern',
          },
        },
      };

      const result = await aiBuilderSDK.generateFromPrompt(request);
      setResponse(result);

      if (result.success && result.manifest) {
        setSelectedApp(result.manifest);
      }

    } catch (error) {
      console.error('Error generating app:', error);
      setResponse({
        success: false,
        error: 'Failed to generate app',
        confidence: 0,
        reasoning: 'An error occurred during generation',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExampleClick = (examplePrompt: string) => {
    setPrompt(examplePrompt);
  };

  const handlePreviewApp = () => {
    if (selectedApp) {
      setShowPreview(true);
    }
  };

  // ==================== RENDER ====================

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1
            className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            🚀 AI-BOS Phase 2 Demo
          </motion.h1>
          <motion.p
            className="text-xl text-gray-600 dark:text-gray-300"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <strong>&quot;Everyone becomes a creator&quot;</strong> - The 1984 Macintosh moment for app creation
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Left Panel - AI Builder */}
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              🤖 AI App Builder
            </h2>

            {/* Prompt Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Describe the app you want to create:
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Create a form to collect customer contact information"
                className="w-full h-24 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Example Prompts */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Try these examples:
              </h3>
              <div className="flex flex-wrap gap-2">
                {examplePrompts.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleClick(example)}
                    className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handlePromptSubmit}
              disabled={isGenerating || !prompt.trim()}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isGenerating ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Generating App...
                </div>
              ) : (
                '🚀 Generate App'
              )}
            </button>
          </motion.div>

          {/* Right Panel - Results */}
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              📋 Generated App
            </h2>

            <AnimatePresence>
              {response && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {response.success ? (
                    <div className="space-y-4">
                      {/* Success Message */}
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                        <div className="flex items-center">
                          <span className="text-green-600 dark:text-green-400 text-lg mr-2">✅</span>
                          <span className="text-green-800 dark:text-green-200 font-medium">
                            App generated successfully!
                          </span>
                        </div>
                      </div>

                      {/* App Details */}
                      {response.manifest && (
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                            {response.manifest.name}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                            {response.manifest.description}
                          </p>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Type:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">
                                {response.manifest.metadata?.category}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Version:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">
                                {response.manifest.version}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Permissions:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">
                                {response.manifest.permissions.length}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Confidence:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">
                                {Math.round(response.confidence * 100)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Suggestions */}
                      {response.suggestions && response.suggestions.length > 0 && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                            💡 Suggestions for improvement:
                          </h4>
                          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                            {response.suggestions.map((suggestion, index) => (
                              <li key={index}>• {suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Preview Button */}
                      {selectedApp && (
                        <button
                          onClick={handlePreviewApp}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          👀 Preview App
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <div className="flex items-center">
                        <span className="text-red-600 dark:text-red-400 text-lg mr-2">❌</span>
                        <span className="text-red-800 dark:text-red-200 font-medium">
                          Generation failed
                        </span>
                      </div>
                      <p className="text-red-700 dark:text-red-300 text-sm mt-2">
                        {response.error}
                      </p>
                    </div>
                  )}

                  {/* Reasoning */}
                  <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      🤔 AI Reasoning:
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {response.reasoning}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* App Preview Modal */}
        <AnimatePresence>
          {showPreview && selectedApp && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">App Preview</h2>
                      <p className="text-blue-100">{selectedApp.name}</p>
                    </div>
                    <button
                      onClick={() => setShowPreview(false)}
                      className="text-white/80 hover:text-white transition-colors text-2xl"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* App Container */}
                <div className="h-96">
                  <AppContainer
                    manifest={selectedApp}
                    onMount={() => console.log('App mounted')}
                    onError={(error) => console.error('App error:', error)}
                    onDestroy={() => console.log('App destroyed')}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
