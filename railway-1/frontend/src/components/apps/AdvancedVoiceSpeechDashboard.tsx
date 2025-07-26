'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, Volume2, Languages, Brain, BarChart3, Plus, Settings, Activity,
  CheckCircle, AlertTriangle, Clock, TrendingUp, Star, Code, Globe, Lock,
  Zap, Shield, Target, Smartphone, Monitor, Camera, MicOff, Play, Pause
} from 'lucide-react';

import {
  advancedVoiceSpeech,
  LanguageCode,
  VoiceModel,
  SpeechStatus,
  EmotionType,
  SentimentType,
  VoiceSession,
  VoiceCommand,
  VoiceBiometrics,
  SpeechToText,
  TextToSpeech,
  VoiceTranslation,
  VoiceMetrics
} from '@/lib/advanced-voice-speech';

interface AdvancedVoiceSpeechDashboardProps {
  className?: string;
}

export default function AdvancedVoiceSpeechDashboard({ className = '' }: AdvancedVoiceSpeechDashboardProps) {
  const [voiceMetrics, setVoiceMetrics] = useState<VoiceMetrics | null>(null);
  const [sessions, setSessions] = useState<VoiceSession[]>([]);
  const [commands, setCommands] = useState<VoiceCommand[]>([]);
  const [biometrics, setBiometrics] = useState<VoiceBiometrics[]>([]);
  const [sttResults, setSttResults] = useState<SpeechToText[]>([]);
  const [ttsResults, setTtsResults] = useState<TextToSpeech[]>([]);
  const [translations, setTranslations] = useState<VoiceTranslation[]>([]);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'sessions' | 'commands' | 'biometrics' | 'translation' | 'create'>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(10000);
  const [isRecording, setIsRecording] = useState(false);

  const [sessionForm, setSessionForm] = useState({
    userId: 'user-001',
    language: 'en' as LanguageCode,
    model: 'neural' as VoiceModel,
    aiEnhanced: true,
    quantumOptimized: false
  });

  const [ttsForm, setTtsForm] = useState({
    text: '',
    language: 'en' as LanguageCode,
    aiOptimized: true,
    quantumOptimized: false
  });

  useEffect(() => {
    initializeVoiceData();
    const interval = setInterval(() => {
      if (autoRefresh) refreshVoiceData();
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const initializeVoiceData = useCallback(async () => {
    setIsLoading(true);
    try {
      await refreshVoiceData();
    } catch (err) {
      console.error('Init error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshVoiceData = useCallback(async () => {
    try {
      // Real API call to backend voice endpoint
      const response = await fetch('/api/advanced-voice-speech/metrics', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Voice API error: ${response.status}`);
      }

      const data = await response.json();
      setVoiceMetrics(data.metrics);
      setSessions(data.sessions || []);
      setCommands(data.commands || []);
      setBiometrics(data.biometrics || []);
      setSttResults(data.sttResults || []);
      setTtsResults(data.ttsResults || []);
      setTranslations(data.translations || []);
    } catch (err) {
      console.error('Voice API error:', err);
      // Set empty state on error
      setVoiceMetrics(null);
      setSessions([]);
      setCommands([]);
      setBiometrics([]);
      setSttResults([]);
      setTtsResults([]);
      setTranslations([]);
    }
  }, []);

  const createVoiceSession = useCallback(async () => {
    setIsLoading(true);
    try {
      // Real API call to create voice session
      const response = await fetch('/api/advanced-voice-speech/sessions', {
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
      await refreshVoiceData();
    } catch (err) {
      console.error('Create session API error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [sessionForm, refreshVoiceData]);

  const processTextToSpeech = useCallback(async () => {
    if (!ttsForm.text) return;
    setIsLoading(true);
    try {
      // Real API call to process text-to-speech
      const response = await fetch('/api/advanced-voice-speech/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ttsForm),
      });

      if (!response.ok) {
        throw new Error(`TTS API error: ${response.status}`);
      }

      const ttsResult = await response.json();
      setTtsResults(prev => [...prev, ttsResult]);
      setTtsForm({ text: '', language: 'en', aiOptimized: true, quantumOptimized: false });
      await refreshVoiceData();
    } catch (err) {
      console.error('TTS API error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [ttsForm, refreshVoiceData]);

  const startRecording = useCallback(() => {
    setIsRecording(true);
    // Simulate recording process
    setTimeout(() => {
      setIsRecording(false);
    }, 3000);
  }, []);

  const renderOverview = () => {
    if (!voiceMetrics) {
      return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-gray-900 p-12 rounded-lg border border-gray-700 text-center">
            <Mic className="w-16 h-16 mx-auto mb-4 text-gray-500" />
            <h3 className="text-xl text-white mb-2">No Voice Data Available</h3>
            <p className="text-gray-400 mb-6">Start by creating your first voice session to enable natural language processing and voice-controlled AI operations.</p>
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
          <MetricCard title="Total Sessions" value={voiceMetrics.totalSessions} icon={Mic} color="blue" />
          <MetricCard title="Active Users" value={voiceMetrics.activeUsers} icon={Volume2} color="green" />
          <MetricCard title="AI Enhancement" value={`${(voiceMetrics.aiEnhancementRate * 100).toFixed(1)}%`} icon={Star} color="purple" />
          <MetricCard title="Transcriptions" value={voiceMetrics.totalTranscriptions.toLocaleString()} icon={Languages} color="orange" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg text-white mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Voice Recognition Metrics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Translations</span>
                <span className="text-blue-400 font-semibold">{voiceMetrics.totalTranslations}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Average Accuracy</span>
                <span className="text-green-400 font-semibold">{(voiceMetrics.averageAccuracy * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Quantum Optimization</span>
                <span className="text-purple-400 font-semibold">{(voiceMetrics.quantumOptimizationRate * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Last Updated</span>
                <span className="text-orange-400 font-semibold">{voiceMetrics.lastUpdated.toLocaleTimeString()}</span>
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
                Create Voice Session
              </button>
              <button
                onClick={startRecording}
                className={`w-full px-4 py-2 rounded flex items-center justify-center ${
                  isRecording
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
                disabled={isLoading}
              >
                {isRecording ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Recording...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start Recording
                  </>
                )}
              </button>
              <button
                onClick={() => setSelectedTab('translation')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
              >
                Voice Translation
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderSessions = () => {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg text-white mb-4">Voice Sessions</h3>
          {sessions.length === 0 ? (
            <div className="text-center py-8">
              <Mic className="w-12 h-12 mx-auto mb-3 text-gray-500" />
              <p className="text-gray-400 mb-4">No voice sessions yet</p>
              <p className="text-sm text-gray-500">Create voice sessions to start speech recognition and analysis.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map(session => (
                <div key={session.id} className="bg-gray-800 p-4 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-white font-semibold">Session {session.id.slice(0, 8)}...</h4>
                      <p className="text-gray-400 text-sm">User: {session.userId} | Language: {session.language}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {session.aiEnhanced && <span className="text-blue-400 text-xs">AI</span>}
                      {session.quantumOptimized && <span className="text-purple-400 text-xs">Quantum</span>}
                      <span className={`px-2 py-1 rounded text-xs ${
                        session.status === 'recognized' ? 'bg-green-600 text-white' :
                        session.status === 'listening' ? 'bg-blue-600 text-white' :
                        session.status === 'processing' ? 'bg-yellow-600 text-white' :
                        'bg-red-600 text-white'
                      }`}>
                        {session.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center mt-3 space-x-2">
                    <span className="text-sm text-gray-500">Model: {session.model}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">Confidence: {(session.transcription.confidence * 100).toFixed(1)}%</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{session.createdAt.toLocaleDateString()}</span>
                  </div>
                  {session.transcription.text && (
                    <div className="mt-3 p-3 bg-gray-700 rounded">
                      <p className="text-sm text-gray-300">&quot;{session.transcription.text}&quot;</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const renderCommands = () => {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg text-white mb-4">Voice Commands</h3>
          {commands.length === 0 ? (
            <div className="text-center py-8">
              <Brain className="w-12 h-12 mx-auto mb-3 text-gray-500" />
              <p className="text-gray-400 mb-4">No voice commands yet</p>
              <p className="text-sm text-gray-500">Voice commands will appear here when users interact with voice-controlled AI operations.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {commands.map(command => (
                <div key={command.id} className="bg-gray-800 p-4 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-white font-semibold">Command: {command.command}</h4>
                      <p className="text-gray-400 text-sm">Intent: {command.intent}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {command.aiOptimized && <span className="text-blue-400 text-xs">AI</span>}
                      {command.quantumOptimized && <span className="text-purple-400 text-xs">Quantum</span>}
                      <span className={`px-2 py-1 rounded text-xs ${
                        command.execution.status === 'completed' ? 'bg-green-600 text-white' :
                        command.execution.status === 'executing' ? 'bg-yellow-600 text-white' :
                        command.execution.status === 'pending' ? 'bg-blue-600 text-white' :
                        'bg-red-600 text-white'
                      }`}>
                        {command.execution.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center mt-3 space-x-2">
                    <span className="text-sm text-gray-500">Execution Time: {command.execution.executionTime}ms</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{command.createdAt.toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const renderBiometrics = () => {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg text-white mb-4">Voice Biometrics</h3>
          {biometrics.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 mx-auto mb-3 text-gray-500" />
              <p className="text-gray-400 mb-4">No voice biometrics yet</p>
              <p className="text-sm text-gray-500">Voice biometrics will appear here for user authentication and security.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {biometrics.map(biometric => (
                <div key={biometric.id} className="bg-gray-800 p-4 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-white font-semibold">Biometrics for {biometric.userId}</h4>
                      <p className="text-gray-400 text-sm">Quality: {(biometric.voiceprint.quality * 100).toFixed(1)}%</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {biometric.aiEnhanced && <span className="text-blue-400 text-xs">AI</span>}
                      {biometric.quantumOptimized && <span className="text-purple-400 text-xs">Quantum</span>}
                      <span className={`px-2 py-1 rounded text-xs ${
                        biometric.authentication.enabled ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                      }`}>
                        {biometric.authentication.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center mt-3 space-x-2">
                    <span className="text-sm text-gray-500">Success Rate: {(biometric.authentication.successRate * 100).toFixed(1)}%</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">Attempts: {biometric.authentication.attempts}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{biometric.createdAt.toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const renderTranslation = () => {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg text-white mb-4">Voice Translation</h3>
          {translations.length === 0 ? (
            <div className="text-center py-8">
              <Languages className="w-12 h-12 mx-auto mb-3 text-gray-500" />
              <p className="text-gray-400 mb-4">No translations yet</p>
              <p className="text-sm text-gray-500">Voice translations will appear here for multi-language support.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {translations.map(translation => (
                <div key={translation.id} className="bg-gray-800 p-4 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-white font-semibold">{translation.sourceLanguage} → {translation.targetLanguage}</h4>
                      <p className="text-gray-400 text-sm">Accuracy: {(translation.performance.accuracy * 100).toFixed(1)}%</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {translation.aiOptimized && <span className="text-blue-400 text-xs">AI</span>}
                      {translation.quantumOptimized && <span className="text-purple-400 text-xs">Quantum</span>}
                      <span className="text-sm text-gray-300">Completed</span>
                    </div>
                  </div>
                  <div className="flex items-center mt-3 space-x-2">
                    <span className="text-sm text-gray-500">Speed: {translation.performance.speed}x</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">Latency: {translation.performance.latency}s</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{translation.createdAt.toLocaleDateString()}</span>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg text-white mb-4">Create Voice Session</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">User ID</label>
              <input
                className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
                placeholder="Enter user ID"
                value={sessionForm.userId}
                onChange={e => setSessionForm({ ...sessionForm, userId: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Language</label>
              <select
                className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
                value={sessionForm.language}
                onChange={e => setSessionForm({ ...sessionForm, language: e.target.value as LanguageCode })}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
                <option value="pt">Portuguese</option>
                <option value="ru">Russian</option>
                <option value="zh">Chinese</option>
                <option value="ja">Japanese</option>
                <option value="ko">Korean</option>
                <option value="ar">Arabic</option>
                <option value="hi">Hindi</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Voice Model</label>
              <select
                className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
                value={sessionForm.model}
                onChange={e => setSessionForm({ ...sessionForm, model: e.target.value as VoiceModel })}
              >
                <option value="standard">Standard</option>
                <option value="neural">Neural</option>
                <option value="quantum">Quantum</option>
                <option value="custom">Custom</option>
              </select>
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
                  checked={sessionForm.quantumOptimized}
                  onChange={e => setSessionForm({ ...sessionForm, quantumOptimized: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-300">Quantum Optimized</span>
              </label>
            </div>
            <button
              onClick={createVoiceSession}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Session'}
            </button>
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg text-white mb-4">Text-to-Speech</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Text</label>
              <textarea
                className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
                rows={4}
                placeholder="Enter text to convert to speech"
                value={ttsForm.text}
                onChange={e => setTtsForm({ ...ttsForm, text: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Language</label>
              <select
                className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
                value={ttsForm.language}
                onChange={e => setTtsForm({ ...ttsForm, language: e.target.value as LanguageCode })}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
                <option value="pt">Portuguese</option>
                <option value="ru">Russian</option>
                <option value="zh">Chinese</option>
                <option value="ja">Japanese</option>
                <option value="ko">Korean</option>
                <option value="ar">Arabic</option>
                <option value="hi">Hindi</option>
              </select>
            </div>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={ttsForm.aiOptimized}
                  onChange={e => setTtsForm({ ...ttsForm, aiOptimized: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-300">AI Optimized</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={ttsForm.quantumOptimized}
                  onChange={e => setTtsForm({ ...ttsForm, quantumOptimized: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-300">Quantum Optimized</span>
              </label>
            </div>
            <button
              onClick={processTextToSpeech}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
              disabled={isLoading || !ttsForm.text}
            >
              {isLoading ? 'Processing...' : 'Convert to Speech'}
            </button>
          </div>
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
              <Mic className="w-8 h-8 mr-3 text-blue-400" />
              Advanced Voice & Speech Recognition
            </h1>
            <button onClick={refreshVoiceData} className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded">
              <Activity className="w-4 h-4 inline-block mr-1" /> Refresh
            </button>
          </div>
        </motion.div>

        <div className="mb-6">
          <div className="flex space-x-1 overflow-x-auto">
            {['overview', 'sessions', 'commands', 'biometrics', 'translation', 'create'].map(tab => (
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
          {selectedTab === 'sessions' && renderSessions()}
          {selectedTab === 'commands' && renderCommands()}
          {selectedTab === 'biometrics' && renderBiometrics()}
          {selectedTab === 'translation' && renderTranslation()}
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
