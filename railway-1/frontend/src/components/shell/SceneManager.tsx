'use client';

import React, { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SceneOrb } from './SceneOrb';
import { PersonalizedScenes } from './PersonalizedScenes';
import { AIMoodEngine } from './AIMoodEngine';
import { SceneStudioCreator } from './SceneStudioCreator';
import { AISceneOrchestrator } from './AISceneOrchestrator';

// Import the Scene type from PersonalizedScenes to maintain compatibility
interface Scene {
  id: string;
  name: string;
  description: string;
  mood: 'focused' | 'creative' | 'relaxed' | 'energetic' | 'professional' | 'cozy' | 'zen' | 'productive';
  wallpaper?: string;
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  weather?: 'sunny' | 'cloudy' | 'rainy' | 'snowy';
  activity?: 'work' | 'meeting' | 'break' | 'deep-work' | 'creative' | 'relaxation';
  ambientSound?: string;
  aiBehavior?: 'cheerful' | 'laser-focus' | 'zen' | 'energetic' | 'calm';
  isActive: boolean;
  isCustom: boolean;
  metadata: {
    created: Date;
    lastUsed: Date;
    usageCount: number;
    rating: number;
  };
}

interface SceneManagerProps {
  onSceneChange?: (scene: Scene) => void;
  onCustomSceneCreate?: (scene: Scene) => void;
}

export const SceneManager: React.FC<SceneManagerProps> = ({
  onSceneChange,
  onCustomSceneCreate
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'scenes' | 'ai-suggestions' | 'studio'>('scenes');
  const [currentScene, setCurrentScene] = useState<Scene | null>(null);
  const [showOrchestrator, setShowOrchestrator] = useState(false);

  // Handle scene change
  const handleSceneChange = useCallback((scene: Scene) => {
    setCurrentScene(scene);
    onSceneChange?.(scene);
    setIsOpen(false);
  }, [onSceneChange]);

  // Handle AI suggestion selection
  const handleAISuggestionSelect = useCallback((suggestion: any) => {
    const scene: Scene = {
      id: suggestion.id,
      name: suggestion.name,
      description: suggestion.description,
      mood: suggestion.mood,
      colorScheme: suggestion.colorScheme,
      ambientSound: suggestion.ambientSound,
      aiBehavior: suggestion.aiBehavior,
      isActive: true,
      isCustom: false,
      metadata: {
        created: new Date(),
        lastUsed: new Date(),
        usageCount: 1,
        rating: 4.5
      }
    };
    handleSceneChange(scene);
  }, [handleSceneChange]);

  // Handle AI auto-switch
  const handleAIAutoSwitch = useCallback((suggestion: any) => {
    console.log('AI auto-switching to:', suggestion.name);
    handleAISuggestionSelect(suggestion);
  }, [handleAISuggestionSelect]);

  // Convert CustomScene to Scene
  const convertCustomSceneToScene = useCallback((customScene: any): Scene => {
    return {
      id: customScene.id,
      name: customScene.name,
      description: customScene.description,
      mood: 'creative', // Default mood for custom scenes
      colorScheme: customScene.colorScheme,
      ambientSound: customScene.ambientSound,
      aiBehavior: customScene.aiBehavior,
      isActive: true,
      isCustom: true,
      metadata: {
        created: customScene.createdAt || new Date(),
        lastUsed: new Date(),
        usageCount: 1,
        rating: 5.0
      }
    };
  }, []);

  // Convert Scene to CustomScene
  const convertSceneToCustomScene = useCallback((scene: Scene): any => {
    return {
      id: scene.id,
      name: scene.name,
      description: scene.description,
      elements: [], // Custom scenes start with empty elements
      colorScheme: scene.colorScheme,
      ambientSound: scene.ambientSound,
      aiBehavior: scene.aiBehavior || 'cheerful',
      isActive: scene.isActive,
      createdAt: scene.metadata.created,
      lastModified: scene.metadata.lastUsed
    };
  }, []);

  // Handle custom scene creation
  const handleCustomSceneCreate = useCallback((customScene: any) => {
    const scene = convertCustomSceneToScene(customScene);
    onCustomSceneCreate?.(scene);
    handleSceneChange(scene);
  }, [onCustomSceneCreate, handleSceneChange, convertCustomSceneToScene]);

  // Handle scene orchestration
  const handleSceneOrchestration = useCallback((sceneId: string, message?: string) => {
    console.log('Orchestration switching to:', sceneId, message);
    // This would integrate with the actual scene system
    // For now, we'll just show a notification
    if (message) {
      // Could show a toast notification here
      console.log('AI Message:', message);
    }
  }, []);

  return (
    <AISceneOrchestrator onSceneSwitch={handleSceneOrchestration}>
      <div className="relative">
        {/* Scene Orb - The Jobsian entry point */}
        <SceneOrb onClick={() => setIsOpen(true)} />

        {/* Full Screen Scene Studio Modal */}
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                className="fixed inset-0 z-40 backdrop-blur-md bg-black/40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
              />

              {/* Modal */}
              <motion.div
                className="fixed inset-4 z-50"
                initial={{
                  opacity: 0,
                  scale: 0.8,
                  y: 50
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0
                }}
                exit={{
                  opacity: 0,
                  scale: 0.8,
                  y: 50
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  duration: 0.5
                }}
              >
                <div className="relative w-full h-full bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
                  {/* Header */}
                  <div className="absolute top-0 left-0 right-0 z-10 p-6 bg-gradient-to-b from-black/20 to-transparent">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <motion.div
                          className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-xl"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          🧠
                        </motion.div>
                        <div>
                          <h2 className="text-2xl font-bold text-white">AI Scene Studio</h2>
                          <p className="text-white/70 text-sm">
                            {currentScene ? `Current: ${currentScene.name}` : 'Choose your perfect workspace mood'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <motion.button
                          onClick={() => setShowOrchestrator(!showOrchestrator)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            showOrchestrator
                              ? 'bg-blue-500/30 border border-blue-400/50 text-blue-300'
                              : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          🎭 Orchestrator
                        </motion.button>

                        <motion.button
                          onClick={() => setIsOpen(false)}
                          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          ✕
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  {/* Tab Navigation */}
                  <div className="absolute top-20 left-0 right-0 z-10 px-6">
                    <div className="flex border-b border-white/20">
                      {[
                        { id: 'scenes', name: 'Scenes', icon: '🎨' },
                        { id: 'ai-suggestions', name: 'AI Suggestions', icon: '🧠' },
                        { id: 'studio', name: 'Studio', icon: '🎭' }
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id as any)}
                          className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors ${
                            activeTab === tab.id
                              ? 'text-blue-400 border-b-2 border-blue-400'
                              : 'text-white/70 hover:text-white'
                          }`}
                        >
                          <span>{tab.icon}</span>
                          <span>{tab.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="pt-32 h-full">
                    <AnimatePresence mode="wait">
                      {activeTab === 'scenes' && (
                        <motion.div
                          key="scenes"
                          className="h-full"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <PersonalizedScenes
                            onSceneChange={handleSceneChange}
                            onCustomSceneCreate={handleCustomSceneCreate}
                            className="h-full"
                          />
                        </motion.div>
                      )}

                      {activeTab === 'ai-suggestions' && (
                        <motion.div
                          key="ai-suggestions"
                          className="h-full p-6 overflow-y-auto"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <AIMoodEngine
                            onSuggestionSelect={handleAISuggestionSelect}
                            onAutoSwitch={handleAIAutoSwitch}
                            className="h-full"
                          />
                        </motion.div>
                      )}

                      {activeTab === 'studio' && (
                        <motion.div
                          key="studio"
                          className="h-full"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <SceneStudioCreator
                            onSceneCreate={handleCustomSceneCreate}
                            onSceneUpdate={(customScene: any) => {
                              const scene = convertCustomSceneToScene(customScene);
                              handleSceneChange(scene);
                            }}
                            onCancel={() => setActiveTab('scenes')}
                            className="h-full"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </AISceneOrchestrator>
  );
};
