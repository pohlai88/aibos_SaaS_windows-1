'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystemCore } from './SystemCore';

// ==================== TYPES ====================
interface Scene {
  id: string;
  name: string;
  description: string;
  mood: 'focused' | 'creative' | 'relaxed' | 'energetic' | 'professional' | 'cozy';
  wallpaper: string;
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  weather?: 'sunny' | 'cloudy' | 'rainy' | 'snowy';
  activity?: 'work' | 'meeting' | 'break' | 'deep-work' | 'creative' | 'relaxation';
  isActive: boolean;
  isCustom: boolean;
  metadata: {
    created: Date;
    lastUsed: Date;
    usageCount: number;
    rating: number;
  };
}

interface PersonalizedScenesProps {
  className?: string;
  onSceneChange?: (scene: Scene) => void;
  onCustomSceneCreate?: (scene: Scene) => void;
}

// ==================== CONSTANTS ====================
const DEFAULT_SCENES: Scene[] = [
  {
    id: 'morning-focus',
    name: 'Morning Focus',
    description: 'Clean and bright to start your day with clarity',
    mood: 'focused',
    wallpaper: '/scenes/morning-focus.svg',
    colorScheme: {
      primary: '#3B82F6',
      secondary: '#10B981',
      accent: '#F59E0B',
      background: '#F8FAFC'
    },
    timeOfDay: 'morning',
    activity: 'work',
    isActive: false,
    isCustom: false,
    metadata: {
      created: new Date(),
      lastUsed: new Date(),
      usageCount: 0,
      rating: 4.8
    }
  },
  {
    id: 'creative-flow',
    name: 'Creative Flow',
    description: 'Inspirational colors to spark your imagination',
    mood: 'creative',
    wallpaper: '/scenes/creative-flow.svg',
    colorScheme: {
      primary: '#8B5CF6',
      secondary: '#EC4899',
      accent: '#F97316',
      background: '#FDF4FF'
    },
    activity: 'creative',
    isActive: false,
    isCustom: false,
    metadata: {
      created: new Date(),
      lastUsed: new Date(),
      usageCount: 0,
      rating: 4.9
    }
  },
  {
    id: 'deep-work',
    name: 'Deep Work',
    description: 'Minimal and distraction-free for intense focus',
    mood: 'focused',
    wallpaper: '/scenes/deep-work.svg',
    colorScheme: {
      primary: '#1F2937',
      secondary: '#374151',
      accent: '#6B7280',
      background: '#111827'
    },
    activity: 'deep-work',
    isActive: false,
    isCustom: false,
    metadata: {
      created: new Date(),
      lastUsed: new Date(),
      usageCount: 0,
      rating: 4.7
    }
  },
  {
    id: 'cozy-evening',
    name: 'Cozy Evening',
    description: 'Warm and comfortable for evening relaxation',
    mood: 'cozy',
    wallpaper: '/scenes/cozy-evening.svg',
    colorScheme: {
      primary: '#DC2626',
      secondary: '#EA580C',
      accent: '#D97706',
      background: '#FEF2F2'
    },
    timeOfDay: 'evening',
    activity: 'relaxation',
    isActive: false,
    isCustom: false,
    metadata: {
      created: new Date(),
      lastUsed: new Date(),
      usageCount: 0,
      rating: 4.6
    }
  },
  {
    id: 'energetic-morning',
    name: 'Energetic Morning',
    description: 'Vibrant and motivating to boost your energy',
    mood: 'energetic',
    wallpaper: '/scenes/energetic-morning.svg',
    colorScheme: {
      primary: '#059669',
      secondary: '#10B981',
      accent: '#F59E0B',
      background: '#ECFDF5'
    },
    timeOfDay: 'morning',
    activity: 'work',
    isActive: false,
    isCustom: false,
    metadata: {
      created: new Date(),
      lastUsed: new Date(),
      usageCount: 0,
      rating: 4.5
    }
  },
  {
    id: 'professional-meeting',
    name: 'Professional Meeting',
    description: 'Clean and professional for important meetings',
    mood: 'professional',
    wallpaper: '/scenes/professional-meeting.svg',
    colorScheme: {
      primary: '#1E40AF',
      secondary: '#3B82F6',
      accent: '#6B7280',
      background: '#F8FAFC'
    },
    activity: 'meeting',
    isActive: false,
    isCustom: false,
    metadata: {
      created: new Date(),
      lastUsed: new Date(),
      usageCount: 0,
      rating: 4.4
    }
  }
];

const MOOD_EMOJIS = {
  focused: '🎯',
  creative: '🎨',
  relaxed: '😌',
  energetic: '⚡',
  professional: '💼',
  cozy: '🛋️'
};

const MOOD_COLORS = {
  focused: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  creative: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  relaxed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  energetic: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  professional: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  cozy: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

// ==================== COMPONENTS ====================
interface SceneCardProps {
  scene: Scene;
  onSelect: (scene: Scene) => void;
  isActive: boolean;
}

const SceneCard: React.FC<SceneCardProps> = ({
  scene,
  onSelect,
  isActive
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={`relative bg-white dark:bg-gray-800 rounded-xl border-2 overflow-hidden cursor-pointer ${
        isActive
          ? 'border-blue-500 shadow-lg'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(scene)}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Wallpaper Preview */}
      <div
        className="h-32 bg-cover bg-center relative"
        style={{
          backgroundImage: `linear-gradient(45deg, ${scene.colorScheme.primary}20, ${scene.colorScheme.secondary}20), url(${scene.wallpaper})`
        }}
      >
        {/* Mood Badge */}
        <div className="absolute top-2 left-2">
          <span className={`text-xs px-2 py-1 rounded-full ${MOOD_COLORS[scene.mood]}`}>
            {MOOD_EMOJIS[scene.mood]} {scene.mood}
          </span>
        </div>

        {/* Active Indicator */}
        {isActive && (
          <motion.div
            className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-white text-xs">✓</span>
          </motion.div>
        )}

        {/* Hover Overlay */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="absolute inset-0 bg-black/50 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <span className="text-white font-medium">Apply Scene</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scene Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {scene.name}
          </h3>
          <div className="flex items-center space-x-1">
            <span className="text-yellow-400 text-sm">⭐</span>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {scene.metadata.rating}
            </span>
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          {scene.description}
        </p>

        {/* Scene Tags */}
        <div className="flex flex-wrap gap-1">
          {scene.timeOfDay && (
            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
              {scene.timeOfDay}
            </span>
          )}
          {scene.activity && (
            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
              {scene.activity}
            </span>
          )}
          {scene.isCustom && (
            <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
              Custom
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ==================== MAIN COMPONENT ====================
export const PersonalizedScenes: React.FC<PersonalizedScenesProps> = ({
  className = '',
  onSceneChange,
  onCustomSceneCreate
}) => {
  const { trackEvent } = useSystemCore();
  const [scenes, setScenes] = useState<Scene[]>(DEFAULT_SCENES);
  const [activeScene, setActiveScene] = useState<Scene | null>(null);
  const [selectedMood, setSelectedMood] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Load saved scenes from localStorage
  useEffect(() => {
    const savedScenes = localStorage.getItem('aibos-personalized-scenes');
    const savedActiveScene = localStorage.getItem('aibos-active-scene');

    if (savedScenes) {
      try {
        const parsedScenes = JSON.parse(savedScenes);
        setScenes(prev => [...prev, ...parsedScenes.filter((s: Scene) => s.isCustom)]);
      } catch (error) {
        console.warn('Failed to load saved scenes:', error);
      }
    }

    if (savedActiveScene) {
      try {
        const parsedActiveScene = JSON.parse(savedActiveScene);
        setActiveScene(parsedActiveScene);
        // Apply the scene
        applyScene(parsedActiveScene);
      } catch (error) {
        console.warn('Failed to load active scene:', error);
      }
    }
  }, []);

  // Save scenes to localStorage
  useEffect(() => {
    const customScenes = scenes.filter(scene => scene.isCustom);
    localStorage.setItem('aibos-personalized-scenes', JSON.stringify(customScenes));
  }, [scenes]);

  const applyScene = useCallback((scene: Scene) => {
    // Apply color scheme to CSS custom properties
    const root = document.documentElement;
    root.style.setProperty('--primary-color', scene.colorScheme.primary);
    root.style.setProperty('--secondary-color', scene.colorScheme.secondary);
    root.style.setProperty('--accent-color', scene.colorScheme.accent);
    root.style.setProperty('--background-color', scene.colorScheme.background);

    // Update scene usage
    setScenes(prev => prev.map(s =>
      s.id === scene.id
        ? {
            ...s,
            metadata: {
              ...s.metadata,
              lastUsed: new Date(),
              usageCount: s.metadata.usageCount + 1
            }
          }
        : s
    ));

    // Save active scene
    localStorage.setItem('aibos-active-scene', JSON.stringify(scene));

    trackEvent('scene_applied', {
      sceneId: scene.id,
      sceneName: scene.name,
      mood: scene.mood
    });
  }, [trackEvent]);

  const handleSceneSelect = useCallback((scene: Scene) => {
    setActiveScene(scene);
    applyScene(scene);
    onSceneChange?.(scene);
  }, [applyScene, onSceneChange]);

  const handleCreateCustomScene = useCallback((sceneData: Partial<Scene>) => {
    const newScene: Scene = {
      id: `custom-${Date.now()}`,
      name: sceneData.name || 'Custom Scene',
      description: sceneData.description || 'Your personalized scene',
      mood: sceneData.mood || 'focused',
      wallpaper: sceneData.wallpaper || '/scenes/default.jpg',
      colorScheme: sceneData.colorScheme || {
        primary: '#3B82F6',
        secondary: '#10B981',
        accent: '#F59E0B',
        background: '#F8FAFC'
      },
      isActive: false,
      isCustom: true,
      metadata: {
        created: new Date(),
        lastUsed: new Date(),
        usageCount: 0,
        rating: 5.0
      }
    };

    setScenes(prev => [...prev, newScene]);
    onCustomSceneCreate?.(newScene);
    setShowCreateModal(false);

    trackEvent('custom_scene_created', {
      sceneId: newScene.id,
      sceneName: newScene.name
    });
  }, [onCustomSceneCreate, trackEvent]);

  const filteredScenes = selectedMood === 'all'
    ? scenes
    : scenes.filter(scene => scene.mood === selectedMood);

  const getMoodStats = () => {
    const stats = scenes.reduce((acc, scene) => {
      acc[scene.mood] = (acc[scene.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return stats;
  };

  const moodStats = getMoodStats();

  return (
    <div className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 max-h-full overflow-hidden flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Personalized Scenes</h2>
          <p className="text-white/80 text-sm">Choose a mood that matches your current vibe</p>
        </div>

        <motion.button
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex-shrink-0"
          onClick={() => setShowCreateModal(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ✨ Create Custom
        </motion.button>
      </div>

      {/* Mood Filter */}
      <div className="flex items-center space-x-2 mb-6 overflow-x-auto pb-2 flex-shrink-0">
        <button
          onClick={() => setSelectedMood('all')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors flex-shrink-0 ${
            selectedMood === 'all'
              ? 'bg-white text-gray-900'
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          All ({scenes.length})
        </button>

        {Object.entries(moodStats).map(([mood, count]) => (
          <button
            key={mood}
            onClick={() => setSelectedMood(mood)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center space-x-1 flex-shrink-0 ${
              selectedMood === mood
                ? 'bg-white text-gray-900'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <span>{MOOD_EMOJIS[mood as keyof typeof MOOD_EMOJIS]}</span>
            <span className="capitalize">{mood}</span>
            <span className="text-xs opacity-80">({count})</span>
          </button>
        ))}
      </div>

      {/* Active Scene */}
      {activeScene && (
        <div className="mb-6 p-4 bg-white/10 rounded-lg border border-white/20 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <span className="text-lg">{MOOD_EMOJIS[activeScene.mood]}</span>
            <div>
              <h3 className="font-semibold text-white">Currently Active</h3>
              <p className="text-white/80 text-sm">{activeScene.name}</p>
            </div>
          </div>
        </div>
      )}

      {/* Scenes Grid - Scrollable Container */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
          <AnimatePresence>
            {filteredScenes.map((scene, index) => (
              <motion.div
                key={scene.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <SceneCard
                  scene={scene}
                  onSelect={handleSceneSelect}
                  isActive={activeScene?.id === scene.id}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Create Custom Scene Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h3 className="text-lg font-semibold mb-4">Create Custom Scene</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Scene Name</label>
                  <input
                    type="text"
                    placeholder="My Awesome Scene"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Mood</label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                    {Object.entries(MOOD_EMOJIS).map(([mood, emoji]) => (
                      <option key={mood} value={mood}>
                        {emoji} {mood.charAt(0).toUpperCase() + mood.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    placeholder="Describe your scene..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleCreateCustomScene({
                    name: 'My Custom Scene',
                    description: 'A personalized scene just for you',
                    mood: 'focused'
                  })}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                >
                  Create Scene
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
