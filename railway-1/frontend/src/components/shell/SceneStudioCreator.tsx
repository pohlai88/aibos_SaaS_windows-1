'use client';

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';

// ==================== TYPES ====================
interface SceneElement {
  id: string;
  type: 'emoji' | 'color' | 'overlay' | 'sound' | 'ai-behavior';
  value: string;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  rotation?: number;
  opacity?: number;
}

interface CustomScene {
  id: string;
  name: string;
  description: string;
  elements: SceneElement[];
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  ambientSound?: string;
  aiBehavior: 'cheerful' | 'laser-focus' | 'zen' | 'energetic' | 'calm';
  isActive: boolean;
  createdAt: Date;
  lastModified: Date;
}

// ==================== SCENE ELEMENTS DATA ====================
const EMOJI_THEMES = [
  { id: 'nature', name: 'Nature', emojis: ['🌲', '🌊', '🌅', '🌸', '🍃', '🌙', '☀️', '🌈'] },
  { id: 'tech', name: 'Technology', emojis: ['💻', '🚀', '⚡', '🔮', '🧠', '🌐', '📱', '🎮'] },
  { id: 'creative', name: 'Creative', emojis: ['🎨', '🎭', '🎪', '🎯', '🎲', '🎸', '🎬', '📷'] },
  { id: 'work', name: 'Work', emojis: ['💼', '📊', '📈', '🎯', '⚡', '🔧', '📋', '✅'] },
  { id: 'relax', name: 'Relaxation', emojis: ['🧘', '🕯️', '☕', '📖', '🎵', '🌿', '🕊️', '✨'] }
];

const COLOR_PALETTES = [
  { id: 'ocean', name: 'Ocean Blue', colors: ['#1E3A8A', '#3B82F6', '#60A5FA', '#93C5FD'] },
  { id: 'sunset', name: 'Sunset', colors: ['#DC2626', '#EA580C', '#F59E0B', '#FCD34D'] },
  { id: 'forest', name: 'Forest', colors: ['#166534', '#16A34A', '#22C55E', '#4ADE80'] },
  { id: 'lavender', name: 'Lavender', colors: ['#581C87', '#7C3AED', '#A78BFA', '#C4B5FD'] },
  { id: 'monochrome', name: 'Monochrome', colors: ['#111827', '#374151', '#6B7280', '#9CA3AF'] }
];

const OVERLAY_EFFECTS = [
  { id: 'gradient', name: 'Gradient', icon: '🌈' },
  { id: 'particles', name: 'Particles', icon: '✨' },
  { id: 'waves', name: 'Waves', icon: '🌊' },
  { id: 'stars', name: 'Stars', icon: '⭐' },
  { id: 'smoke', name: 'Smoke', icon: '💨' }
];

const AMBIENT_SOUNDS = [
  { id: 'rain', name: 'Rain Sounds', icon: '🌧️', description: 'Gentle rain for focus' },
  { id: 'ocean', name: 'Ocean Waves', icon: '🌊', description: 'Calming ocean waves' },
  { id: 'forest', name: 'Forest Ambience', icon: '🌲', description: 'Nature sounds' },
  { id: 'cafe', name: 'Cafe Sounds', icon: '☕', description: 'Background cafe noise' },
  { id: 'silence', name: 'Silence', icon: '🔇', description: 'No ambient sound' }
];

const AI_BEHAVIORS = [
  { id: 'cheerful', name: 'Cheerful', icon: '😊', description: 'Positive and encouraging' },
  { id: 'laser-focus', name: 'Laser Focus', icon: '🎯', description: 'Highly focused and direct' },
  { id: 'zen', name: 'Zen', icon: '🧘', description: 'Calm and peaceful' },
  { id: 'energetic', name: 'Energetic', icon: '⚡', description: 'High energy and dynamic' },
  { id: 'calm', name: 'Calm', icon: '😌', description: 'Gentle and soothing' }
];

// ==================== REACT COMPONENT ====================
interface SceneStudioCreatorProps {
  onSceneCreate: (scene: CustomScene) => void;
  onSceneUpdate: (scene: CustomScene) => void;
  onCancel: () => void;
  initialScene?: CustomScene;
  className?: string;
}

export const SceneStudioCreator: React.FC<SceneStudioCreatorProps> = ({
  onSceneCreate,
  onSceneUpdate,
  onCancel,
  initialScene,
  className = ''
}) => {
  const [scene, setScene] = useState<CustomScene>(
    initialScene || {
      id: `scene-${Date.now()}`,
      name: 'New Scene',
      description: 'Create your perfect workspace mood',
      elements: [],
      colorScheme: {
        primary: '#3B82F6',
        secondary: '#10B981',
        accent: '#F59E0B',
        background: '#F8FAFC'
      },
      aiBehavior: 'cheerful',
      isActive: false,
      createdAt: new Date(),
      lastModified: new Date()
    }
  );

  const [activeTab, setActiveTab] = useState<'elements' | 'preview' | 'settings'>('elements');
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Add element to scene
  const addElement = useCallback((element: Omit<SceneElement, 'id'>) => {
    const newElement: SceneElement = {
      ...element,
      id: `element-${Date.now()}-${Math.random()}`,
      position: { x: 50, y: 50 },
      size: { width: 100, height: 100 },
      rotation: 0,
      opacity: 1
    };

    setScene(prev => ({
      ...prev,
      elements: [...prev.elements, newElement],
      lastModified: new Date()
    }));
  }, []);

  // Update element
  const updateElement = useCallback((elementId: string, updates: Partial<SceneElement>) => {
    setScene(prev => ({
      ...prev,
      elements: prev.elements.map(el =>
        el.id === elementId ? { ...el, ...updates } : el
      ),
      lastModified: new Date()
    }));
  }, []);

  // Remove element
  const removeElement = useCallback((elementId: string) => {
    setScene(prev => ({
      ...prev,
      elements: prev.elements.filter(el => el.id !== elementId),
      lastModified: new Date()
    }));
    setSelectedElement(null);
  }, []);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const data = e.dataTransfer.getData('text/plain');
    const elementData = JSON.parse(data);

    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      addElement({
        ...elementData,
        position: { x, y }
      });
    }
  }, [addElement]);

  // Save scene
  const handleSave = useCallback(() => {
    if (initialScene) {
      onSceneUpdate(scene);
    } else {
      onSceneCreate(scene);
    }
  }, [scene, initialScene, onSceneCreate, onSceneUpdate]);

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white">
            🎨
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Scene Studio</h2>
            <p className="text-sm text-white/70">Create your perfect workspace mood</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={scene.name}
            onChange={(e) => setScene(prev => ({ ...prev, name: e.target.value }))}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:border-white/40"
            placeholder="Scene name..."
          />
          <motion.button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Save Scene
          </motion.button>
          <motion.button
            onClick={onCancel}
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Cancel
          </motion.button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-white/20">
        {[
          { id: 'elements', name: 'Elements', icon: '🧩' },
          { id: 'preview', name: 'Preview', icon: '👁️' },
          { id: 'settings', name: 'Settings', icon: '⚙️' }
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

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Elements Library */}
        {activeTab === 'elements' && (
          <div className="w-80 border-r border-white/20 overflow-y-auto">
            <div className="p-4 space-y-6">
              {/* Emoji Themes */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <span className="mr-2">😊</span>
                  Emoji Themes
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {EMOJI_THEMES.map(theme => (
                    <div key={theme.id} className="space-y-2">
                      <h4 className="text-sm font-medium text-white/80">{theme.name}</h4>
                      <div className="grid grid-cols-4 gap-1">
                        {theme.emojis.map((emoji, index) => (
                          <div
                            key={index}
                            draggable
                            onDragStart={(e: React.DragEvent) => {
                              e.dataTransfer.setData('text/plain', JSON.stringify({
                                type: 'emoji',
                                value: emoji
                              }));
                            }}
                            className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-lg cursor-move hover:bg-white/20 transition-colors hover:scale-110 active:scale-90"
                          >
                            {emoji}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Color Palettes */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <span className="mr-2">🎨</span>
                  Color Palettes
                </h3>
                <div className="space-y-3">
                  {COLOR_PALETTES.map(palette => (
                    <motion.div
                      key={palette.id}
                      onClick={() => {
                        setScene(prev => ({
                          ...prev,
                          colorScheme: {
                            primary: palette.colors[0],
                            secondary: palette.colors[1],
                            accent: palette.colors[2],
                            background: palette.colors[3]
                          }
                        }));
                      }}
                      className="p-3 bg-white/5 rounded-lg border border-white/20 cursor-pointer hover:bg-white/10 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <h4 className="text-sm font-medium text-white mb-2">{palette.name}</h4>
                      <div className="flex space-x-1">
                        {palette.colors.map((color, index) => (
                          <div
                            key={index}
                            className="w-6 h-6 rounded border border-white/20"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Overlay Effects */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <span className="mr-2">✨</span>
                  Overlay Effects
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {OVERLAY_EFFECTS.map(effect => (
                    <div
                      key={effect.id}
                      draggable
                      onDragStart={(e: React.DragEvent) => {
                        e.dataTransfer.setData('text/plain', JSON.stringify({
                          type: 'overlay',
                          value: effect.id
                        }));
                      }}
                      className="p-3 bg-white/5 rounded-lg border border-white/20 cursor-move hover:bg-white/10 transition-colors text-center hover:scale-105 active:scale-95"
                    >
                      <div className="text-2xl mb-1">{effect.icon}</div>
                      <div className="text-xs text-white/80">{effect.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Center - Canvas */}
        <div className="flex-1 relative">
          <div
            ref={canvasRef}
            className={`w-full h-full relative overflow-hidden transition-colors ${
              dragOver ? 'bg-blue-500/20' : 'bg-white/5'
            }`}
            style={{ backgroundColor: scene.colorScheme.background }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Scene Elements */}
            <AnimatePresence>
              {scene.elements.map((element) => (
                <motion.div
                  key={element.id}
                  className={`absolute cursor-move ${
                    selectedElement === element.id ? 'ring-2 ring-blue-400' : ''
                  }`}
                  style={{
                    left: element.position?.x || 0,
                    top: element.position?.y || 0,
                    width: element.size?.width || 100,
                    height: element.size?.height || 100,
                    transform: `rotate(${element.rotation || 0}deg)`,
                    opacity: element.opacity || 1
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  onClick={() => setSelectedElement(element.id)}
                  drag
                  dragMomentum={false}
                  onDragEnd={(e, info) => {
                    updateElement(element.id, {
                      position: { x: info.point.x, y: info.point.y }
                    });
                  }}
                >
                  {element.type === 'emoji' && (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      {element.value}
                    </div>
                  )}
                  {element.type === 'overlay' && (
                    <div className="w-full h-full flex items-center justify-center text-2xl text-white/50">
                      {element.value === 'gradient' && '🌈'}
                      {element.value === 'particles' && '✨'}
                      {element.value === 'waves' && '🌊'}
                      {element.value === 'stars' && '⭐'}
                      {element.value === 'smoke' && '💨'}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Drop Zone Indicator */}
            {dragOver && (
              <motion.div
                className="absolute inset-0 border-2 border-dashed border-blue-400 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="text-blue-400 text-lg">Drop element here</div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Right Panel - Properties */}
        {activeTab === 'elements' && (
          <div className="w-80 border-l border-white/20 overflow-y-auto">
            <div className="p-4 space-y-6">
              {/* Selected Element Properties */}
              {selectedElement && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Element Properties</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-white/70">Size</label>
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          value={scene.elements.find(el => el.id === selectedElement)?.size?.width || 100}
                          onChange={(e) => updateElement(selectedElement, {
                            size: {
                              width: parseInt(e.target.value),
                              height: scene.elements.find(el => el.id === selectedElement)?.size?.height || 100
                            }
                          })}
                          className="flex-1 bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm"
                        />
                        <input
                          type="number"
                          value={scene.elements.find(el => el.id === selectedElement)?.size?.height || 100}
                          onChange={(e) => updateElement(selectedElement, {
                            size: {
                              width: scene.elements.find(el => el.id === selectedElement)?.size?.width || 100,
                              height: parseInt(e.target.value)
                            }
                          })}
                          className="flex-1 bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-white/70">Rotation</label>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={scene.elements.find(el => el.id === selectedElement)?.rotation || 0}
                        onChange={(e) => updateElement(selectedElement, { rotation: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-white/70">Opacity</label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={scene.elements.find(el => el.id === selectedElement)?.opacity || 1}
                        onChange={(e) => updateElement(selectedElement, { opacity: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                    </div>

                    <motion.button
                      onClick={() => removeElement(selectedElement)}
                      className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-2 rounded-lg text-sm transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Remove Element
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Scene Properties */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Scene Properties</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-white/70">Description</label>
                    <textarea
                      value={scene.description}
                      onChange={(e) => setScene(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm resize-none"
                      rows={3}
                      placeholder="Describe your scene..."
                    />
                  </div>

                  <div>
                    <label className="text-sm text-white/70">Ambient Sound</label>
                    <select
                      value={scene.ambientSound || 'silence'}
                      onChange={(e) => setScene(prev => ({ ...prev, ambientSound: e.target.value }))}
                      className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
                    >
                      {AMBIENT_SOUNDS.map(sound => (
                        <option key={sound.id} value={sound.id}>
                          {sound.icon} {sound.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm text-white/70">AI Behavior</label>
                    <select
                      value={scene.aiBehavior}
                      onChange={(e) => setScene(prev => ({ ...prev, aiBehavior: e.target.value as any }))}
                      className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
                    >
                      {AI_BEHAVIORS.map(behavior => (
                        <option key={behavior.id} value={behavior.id}>
                          {behavior.icon} {behavior.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preview Tab */}
        {activeTab === 'preview' && (
          <div className="flex-1 p-6">
            <div className="h-full bg-white/5 rounded-lg border border-white/20 overflow-hidden">
              <div
                className="w-full h-full relative"
                style={{ backgroundColor: scene.colorScheme.background }}
              >
                {/* Preview of scene elements */}
                {scene.elements.map((element) => (
                  <div
                    key={element.id}
                    className="absolute"
                    style={{
                      left: element.position?.x || 0,
                      top: element.position?.y || 0,
                      width: element.size?.width || 100,
                      height: element.size?.height || 100,
                      transform: `rotate(${element.rotation || 0}deg)`,
                      opacity: element.opacity || 1
                    }}
                  >
                    {element.type === 'emoji' && (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        {element.value}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="flex-1 p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Scene Settings</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-white/70">Auto-save</label>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm text-white">Save changes automatically</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-white/70">Preview quality</label>
                    <select className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm">
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
