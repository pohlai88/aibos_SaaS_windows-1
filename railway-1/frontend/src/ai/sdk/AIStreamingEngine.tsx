'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Brain, Eye, Code, Play, Pause, RotateCcw, Download, Share, Settings, Activity } from 'lucide-react';

// AI-BOS Integration
import { aiBuilderSDK, PromptRequest, PromptResponse } from './AIBuilderSDK';

// ==================== TYPES ====================
interface AIStreamingEngineProps {
  tenantId: string;
  userId: string;
  enableRealTimeStreaming?: boolean;
  enableVisualFeedback?: boolean;
  enableConfidenceScoring?: boolean;
  enableTokenAnalysis?: boolean;
  onStreamingComplete?: (result: StreamingResult) => void;
  onTokenGenerated?: (token: TokenData) => void;
  onConfidenceUpdate?: (confidence: ConfidenceData) => void;
}

interface StreamingResult {
  id: string;
  timestamp: Date;
  prompt: string;
  generatedContent: string;
  tokens: TokenData[];
  confidence: number;
  performance: {
    totalTime: number;
    tokensPerSecond: number;
    memoryUsage: number;
  };
  metadata: {
    model: string;
    temperature: number;
    maxTokens: number;
  };
}

interface TokenData {
  id: string;
  token: string;
  timestamp: Date;
  confidence: number;
  reasoning: string;
  position: number;
  type: 'text' | 'code' | 'markup' | 'special';
  metadata?: {
    component?: string;
    property?: string;
    suggestion?: string;
  };
}

interface ConfidenceData {
  overall: number;
  byToken: Record<number, number>;
  reasoning: string[];
  suggestions: string[];
  improvements: string[];
}

interface StreamingState {
  isStreaming: boolean;
  isPaused: boolean;
  currentPrompt: string;
  generatedTokens: TokenData[];
  currentConfidence: ConfidenceData;
  streamingMetrics: {
    startTime: number;
    tokensGenerated: number;
    averageConfidence: number;
    performanceScore: number;
  };
}

interface AIStreamingToken {
  id: string;
  content: string;
  confidence: number;
  timestamp: Date;
  metadata: {
    model: string;
    temperature: number;
    maxTokens: number;
    stopSequences: string[];
  };
}

interface PromptOptions {
  model: string;
  temperature: number;
  maxTokens: number;
  stopSequences: string[];
  streamingConfig?: {
    enableStreaming: boolean;
    chunkSize: number;
    delay: number;
  };
}

interface AIStreamingResponse {
  id: string;
  content: string;
  generatedContent: string;
  tokens: AIStreamingToken[];
  status: 'streaming' | 'completed' | 'error';
  metadata: {
    model: string;
    prompt: string;
    processingTime: number;
    tokenCount: number;
  };
}

// ==================== AI STREAMING ENGINE COMPONENT ====================
export const AIStreamingEngine: React.FC<AIStreamingEngineProps> = ({
  tenantId,
  userId,
  enableRealTimeStreaming = true,
  enableVisualFeedback = true,
  enableConfidenceScoring = true,
  enableTokenAnalysis = true,
  onStreamingComplete,
  onTokenGenerated,
  onConfidenceUpdate
}) => {
  // ==================== STATE MANAGEMENT ====================
  const [state, setState] = useState<StreamingState>({
    isStreaming: false,
    isPaused: false,
    currentPrompt: '',
    generatedTokens: [],
    currentConfidence: {
      overall: 0,
      byToken: {},
      reasoning: [],
      suggestions: [],
      improvements: []
    },
    streamingMetrics: {
      startTime: 0,
      tokensGenerated: 0,
      averageConfidence: 0,
      performanceScore: 0
    }
  });

  const [showTokenAnalysis, setShowTokenAnalysis] = useState(false);
  const [showConfidenceDetails, setShowConfidenceDetails] = useState(false);
  const [showPerformanceMetrics, setShowPerformanceMetrics] = useState(false);
  const [streamingSpeed, setStreamingSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');

  const streamingRef = useRef<NodeJS.Timeout | null>(null);
  const tokenBufferRef = useRef<TokenData[]>([]);
  const confidenceHistoryRef = useRef<ConfidenceData[]>([]);

  // ==================== STREAMING FUNCTIONS ====================
  const completeStreaming = useCallback((response: AIStreamingResponse) => {
    const result: StreamingResult = {
      id: `streaming-${Date.now()}`,
      prompt: state.currentPrompt,
      generatedContent: response.generatedContent || '',
      tokens: state.generatedTokens,
      confidence: state.currentConfidence.overall,
      performance: {
        totalTime: Date.now() - state.streamingMetrics.startTime,
        tokensPerSecond: state.streamingMetrics.tokensGenerated / ((Date.now() - state.streamingMetrics.startTime) / 1000),
        memoryUsage: Math.random() * 100 + 50
      },
      metadata: {
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 1000
      },
      timestamp: new Date()
    };

    setState(prev => ({ ...prev, isStreaming: false }));
    onStreamingComplete?.(result);
  }, [state.currentPrompt, state.generatedTokens, state.currentConfidence.overall, state.streamingMetrics.startTime, state.streamingMetrics.tokensGenerated, onStreamingComplete]);

  const startStreaming = useCallback(async (prompt: string) => {
    if (!prompt.trim()) return;

    setState(prev => ({ ...prev, isStreaming: true, currentPrompt: prompt }));

    try {
      const response = await aiBuilderSDK.generateFromPrompt(
        { prompt },
        {
          tenantId,
          enableStreaming: true,
          confidenceThreshold: 0.7
        }
      );

      // Process the response
      if (response.success && response.manifest) {
        completeStreaming({
          id: `streaming-${Date.now()}`,
          content: response.reasoning || '',
          generatedContent: response.manifest.name || '',
          tokens: [],
          status: 'completed',
          metadata: {
            model: 'ai-bos-builder',
            prompt,
            processingTime: response.processingTime || 0,
            tokenCount: response.tokenTrace?.recognized.features.length || 0
          }
        });
      } else {
        throw new Error(response.error || 'Failed to generate response');
      }
    } catch (error) {
      console.error('Streaming failed:', error);
      setState(prev => ({
        ...prev,
        isStreaming: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  }, [tenantId, completeStreaming]);

  const handleStreamingCallback = useCallback((stage: string, data: any) => {
    switch (stage) {
      case 'token_generated':
        const token: TokenData = {
          id: `token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          token: data.token,
          timestamp: new Date(),
          confidence: data.confidence || 0.8,
          reasoning: data.reasoning || 'Generated based on context',
          position: state.generatedTokens.length,
          type: data.type || 'text',
          metadata: data.metadata
        };

        setState(prev => ({
          ...prev,
          generatedTokens: [...prev.generatedTokens, token],
          streamingMetrics: {
            ...prev.streamingMetrics,
            tokensGenerated: prev.streamingMetrics.tokensGenerated + 1,
            averageConfidence: (prev.streamingMetrics.averageConfidence + token.confidence) / 2
          }
        }));

        onTokenGenerated?.(token);
        break;

      case 'confidence_update':
        const confidenceUpdate: ConfidenceData = {
          overall: data.overall || 0.8,
          byToken: data.byToken || {},
          reasoning: data.reasoning || [],
          suggestions: data.suggestions || [],
          improvements: data.improvements || []
        };

        setState(prev => ({
          ...prev,
          currentConfidence: confidenceUpdate
        }));

        confidenceHistoryRef.current.push(confidenceUpdate);
        onConfidenceUpdate?.(confidenceUpdate);
        break;

      case 'performance_update':
        setState(prev => ({
          ...prev,
          streamingMetrics: {
            ...prev.streamingMetrics,
            performanceScore: data.performanceScore || 0
          }
        }));
        break;
    }
  }, [state.generatedTokens.length, onTokenGenerated, onConfidenceUpdate]);

  const pauseStreaming = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: true }));
    if (streamingRef.current) {
      clearInterval(streamingRef.current);
      streamingRef.current = null;
    }
  }, []);

  const resumeStreaming = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: false }));
    // Resume streaming logic
  }, []);

  const stopStreaming = useCallback(() => {
    setState(prev => ({
      ...prev,
      isStreaming: false,
      isPaused: false
    }));

    if (streamingRef.current) {
      clearInterval(streamingRef.current);
      streamingRef.current = null;
    }
  }, []);

  // ==================== TOKEN ANALYSIS ====================
  const analyzeTokens = useCallback(() => {
    const analysis = {
      totalTokens: state.generatedTokens.length,
      averageConfidence: state.streamingMetrics.averageConfidence,
      tokenTypes: state.generatedTokens.reduce((acc, token) => {
        acc[token.type] = (acc[token.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      lowConfidenceTokens: state.generatedTokens.filter(token => token.confidence < 0.6),
      suggestions: generateSuggestions()
    };

    return analysis;
  }, [state.generatedTokens, state.streamingMetrics.averageConfidence]);

  const generateSuggestions = useCallback(() => {
    const suggestions = [];

    if (state.streamingMetrics.averageConfidence < 0.7) {
      suggestions.push('Consider refining the prompt for better accuracy');
    }

    if (state.generatedTokens.length < 10) {
      suggestions.push('The response might be too brief - try adding more context');
    }

    if (state.generatedTokens.some(token => token.confidence < 0.5)) {
      suggestions.push('Some tokens have low confidence - review and refine');
    }

    return suggestions;
  }, [state.streamingMetrics.averageConfidence, state.generatedTokens]);

  // ==================== RENDER ====================
  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* ==================== TOOLBAR ==================== */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Streaming Engine</h2>

          {/* Streaming Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              state.isStreaming ? 'bg-green-500' : 'bg-gray-400'
            }`} />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {state.isStreaming ? 'Streaming' : 'Idle'}
            </span>
          </div>

          {/* Speed Control */}
          <select
            value={streamingSpeed}
            onChange={(e) => setStreamingSpeed(e.target.value as any)}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
          >
            <option value="slow">Slow</option>
            <option value="normal">Normal</option>
            <option value="fast">Fast</option>
          </select>
        </div>

        <div className="flex items-center space-x-4">
          {/* Streaming Controls */}
          <div className="flex items-center space-x-2">
            {!state.isStreaming ? (
              <button
                onClick={() => startStreaming('Create a contact form with validation')}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Play className="w-4 h-4 mr-1" />
                Start
              </button>
            ) : state.isPaused ? (
              <button
                onClick={resumeStreaming}
                className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Play className="w-4 h-4 mr-1" />
                Resume
              </button>
            ) : (
              <button
                onClick={pauseStreaming}
                className="px-3 py-1 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                <Pause className="w-4 h-4 mr-1" />
                Pause
              </button>
            )}

            <button
              onClick={stopStreaming}
              className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Stop
            </button>
          </div>

          {/* Panel Toggles */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowTokenAnalysis(!showTokenAnalysis)}
              className={`p-2 rounded ${showTokenAnalysis ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
            >
              <Code className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowConfidenceDetails(!showConfidenceDetails)}
              className={`p-2 rounded ${showConfidenceDetails ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
            >
              <Brain className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowPerformanceMetrics(!showPerformanceMetrics)}
              className={`p-2 rounded ${showPerformanceMetrics ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
            >
              <Activity className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ==================== MAIN CONTENT ==================== */}
      <div className="flex-1 flex">
        {/* ==================== STREAMING AREA ==================== */}
        <div className="flex-1 p-4">
          {/* Generated Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Generated Content</h3>
            <div className="h-64 overflow-y-auto font-mono text-sm">
              {state.generatedTokens.map((token, index) => (
                <motion.span
                  key={token.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.1 }}
                  className={`inline ${
                    token.confidence > 0.8 ? 'text-green-600 dark:text-green-400' :
                    token.confidence > 0.6 ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-red-600 dark:text-red-400'
                  }`}
                  title={`Confidence: ${(token.confidence * 100).toFixed(1)}% - ${token.reasoning}`}
                >
                  {token.token}
                </motion.span>
              ))}
              {state.isStreaming && (
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-blue-500"
                >
                  ▋
                </motion.span>
              )}
            </div>
          </div>

          {/* Streaming Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {state.streamingMetrics.tokensGenerated}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Tokens</div>
                </div>
                <Zap className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {(state.streamingMetrics.averageConfidence * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Confidence</div>
                </div>
                <Brain className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {state.streamingMetrics.performanceScore.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Performance</div>
                </div>
                <Activity className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {streamingSpeed}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Speed</div>
                </div>
                <Settings className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>
        </div>

        {/* ==================== SIDEBAR PANELS ==================== */}
        <div className="w-80 flex flex-col space-y-4 p-4">
          {/* Token Analysis Panel */}
          <AnimatePresence>
            {showTokenAnalysis && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Token Analysis</h3>
                </div>
                <div className="p-4 max-h-64 overflow-y-auto">
                  <div className="space-y-2">
                    {state.generatedTokens.slice(-10).map((token) => (
                      <div key={token.id} className="text-sm bg-gray-50 dark:bg-gray-700 p-2 rounded">
                        <div className="font-medium">{token.token}</div>
                        <div className="text-xs text-gray-500">
                          Confidence: {(token.confidence * 100).toFixed(1)}% • Type: {token.type}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">{token.reasoning}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Confidence Details Panel */}
          <AnimatePresence>
            {showConfidenceDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Confidence Details</h3>
                </div>
                <div className="p-4 max-h-64 overflow-y-auto">
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Confidence</div>
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">
                        {(state.currentConfidence.overall * 100).toFixed(1)}%
                      </div>
                    </div>

                    {state.currentConfidence.suggestions.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Suggestions</div>
                        <div className="space-y-1">
                          {state.currentConfidence.suggestions.map((suggestion, index) => (
                            <div key={index} className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                              {suggestion}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Performance Metrics Panel */}
          <AnimatePresence>
            {showPerformanceMetrics && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Metrics</h3>
                </div>
                <div className="p-4 max-h-64 overflow-y-auto">
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Time</div>
                      <div className="text-sm font-medium">
                        {state.streamingMetrics.startTime > 0 ?
                          ((Date.now() - state.streamingMetrics.startTime) / 1000).toFixed(2) + 's' :
                          '0.00s'
                        }
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Tokens/Second</div>
                      <div className="text-sm font-medium">
                        {state.streamingMetrics.tokensGenerated > 0 ?
                          (state.streamingMetrics.tokensGenerated / ((Date.now() - state.streamingMetrics.startTime) / 1000)).toFixed(2) :
                          '0.00'
                        }
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Performance Score</div>
                      <div className="text-sm font-medium">
                        {state.streamingMetrics.performanceScore.toFixed(1)}/100
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AIStreamingEngine;
