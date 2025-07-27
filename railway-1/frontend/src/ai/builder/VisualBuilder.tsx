'use client';

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DndContext, DragOverlay, useDraggable, useDroppable } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import {
  Play, Save, Undo, Redo, Eye, Code, Sparkles, Settings, Grid, Smartphone, Tablet, Monitor,
  Download, Users, History, Palette, Zap, Shield, BarChart3, Layers, Type, Image, Video,
  Database, Globe, Lock, Unlock, EyeOff, RotateCcw, Maximize, Minimize
} from 'lucide-react';

// AI-BOS Integration
import { AppManifest, manifestLoader } from '../../runtime/ManifestLoader';
import { getAIBuilderSDK, PromptRequest } from '../sdk/AIBuilderSDK';
import { AppContainer } from '../../runtime/AppContainer';

// ==================== TYPES ====================
interface VisualBuilderProps {
  tenantId?: string;
  userId?: string;
  enableAI?: boolean;
  enableCollaboration?: boolean;
  enableRealTimePreview?: boolean;
  onSave?: (manifest: AppManifest) => Promise<void>;
  onDeploy?: (manifest: AppManifest) => Promise<void>;
  onExport?: (code: string, manifest: AppManifest) => Promise<void>;
}

interface BuilderComponent {
  id: string;
  type: 'button' | 'input' | 'card' | 'grid' | 'chart' | 'form' | 'table' | 'modal' | 'navigation' | 'custom';
  position: { x: number; y: number };
  size: { width: number; height: number };
  props: Record<string, any>;
  children?: BuilderComponent[];
  metadata?: {
    aiGenerated?: boolean;
    confidence?: number;
    suggestions?: string[];
    performance?: 'excellent' | 'good' | 'warning' | 'critical';
  };
}

interface CanvasState {
  components: BuilderComponent[];
  selectedComponent: string | null;
  zoom: number;
  pan: { x: number; y: number };
  grid: boolean;
  snapToGrid: boolean;
  gridSize: number;
}

interface BuilderState {
  canvas: CanvasState;
  manifest: AppManifest | null;
  isDirty: boolean;
  canUndo: boolean;
  canRedo: boolean;
  history: CanvasState[];
  historyIndex: number;
  previewMode: 'desktop' | 'tablet' | 'mobile' | 'fullscreen';
  aiSuggestions: string[];
  collaboration: {
    activeUsers: Array<{ id: string; name: string; color: string; cursor: { x: number; y: number } }>;
    isEnabled: boolean;
  };
  performance: {
    renderTime: number;
    memoryUsage: number;
    componentCount: number;
    optimizationScore: number;
  };
}

// ==================== COMPONENT PALETTE ====================
const COMPONENT_PALETTE = [
  {
    type: 'button',
    label: 'Button',
    icon: '🔘',
    category: 'actions',
    description: 'Interactive button component',
    defaultProps: { text: 'Click Me', variant: 'primary', size: 'medium' },
    aiPrompts: ['Add a submit button', 'Create a call-to-action button', 'Add a navigation button']
  },
  {
    type: 'input',
    label: 'Input Field',
    icon: '📝',
    category: 'forms',
    description: 'Text input component',
    defaultProps: { placeholder: 'Enter text...', type: 'text', required: false },
    aiPrompts: ['Add a text input', 'Create a form field', 'Add a search input']
  },
  {
    type: 'card',
    label: 'Card',
    icon: '🃏',
    category: 'layout',
    description: 'Content container card',
    defaultProps: { title: 'Card Title', content: 'Card content...', shadow: 'medium' },
    aiPrompts: ['Add a content card', 'Create a product card', 'Add an info card']
  },
  {
    type: 'grid',
    label: 'Data Grid',
    icon: '📊',
    category: 'data',
    description: 'Tabular data display',
    defaultProps: { columns: 3, rows: 5, sortable: true, filterable: true },
    aiPrompts: ['Add a data table', 'Create a product grid', 'Add a user list']
  },
  {
    type: 'chart',
    label: 'Chart',
    icon: '📈',
    category: 'data',
    description: 'Data visualization',
    defaultProps: { type: 'line', data: [], title: 'Chart Title' },
    aiPrompts: ['Add a sales chart', 'Create a performance graph', 'Add an analytics chart']
  },
  {
    type: 'form',
    label: 'Form',
    icon: '📋',
    category: 'forms',
    description: 'Multi-field form',
    defaultProps: { fields: [], submitText: 'Submit', resetText: 'Reset' },
    aiPrompts: ['Create a contact form', 'Add a registration form', 'Create a settings form']
  },
  {
    type: 'modal',
    label: 'Modal',
    icon: '🪟',
    category: 'overlays',
    description: 'Overlay dialog',
    defaultProps: { title: 'Modal Title', content: 'Modal content...', closable: true },
    aiPrompts: ['Add a confirmation dialog', 'Create a settings modal', 'Add a help modal']
  },
  {
    type: 'navigation',
    label: 'Navigation',
    icon: '🧭',
    category: 'navigation',
    description: 'Navigation menu',
    defaultProps: { items: [], orientation: 'horizontal', style: 'default' },
    aiPrompts: ['Add a main menu', 'Create a sidebar navigation', 'Add a breadcrumb']
  }
];

// ==================== VISUAL BUILDER COMPONENT ====================
export const VisualBuilder: React.FC<VisualBuilderProps> = ({
  tenantId = 'default',
  userId = 'user-1',
  enableAI = true,
  enableCollaboration = true,
  enableRealTimePreview = true,
  onSave,
  onDeploy,
  onExport
}) => {
  // ==================== STATE MANAGEMENT ====================
  const [state, setState] = useState<BuilderState>({
    canvas: {
      components: [],
      selectedComponent: null,
      zoom: 1,
      pan: { x: 0, y: 0 },
      grid: true,
      snapToGrid: true,
      gridSize: 20
    },
    manifest: null,
    isDirty: false,
    canUndo: false,
    canRedo: false,
    history: [],
    historyIndex: -1,
    previewMode: 'desktop',
    aiSuggestions: [],
    collaboration: {
      activeUsers: [],
      isEnabled: enableCollaboration
    },
    performance: {
      renderTime: 0,
      memoryUsage: 0,
      componentCount: 0,
      optimizationScore: 100
    }
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showPerformancePanel, setShowPerformancePanel] = useState(false);
  const [showCollaborationPanel, setShowCollaborationPanel] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const performanceRef = useRef<{ startTime: number }>({ startTime: 0 });

  // ==================== PERFORMANCE MONITORING ====================
  useEffect(() => {
    performanceRef.current.startTime = performance.now();

    return () => {
      const renderTime = performance.now() - performanceRef.current.startTime;
      setState(prev => ({
        ...prev,
        performance: {
          ...prev.performance,
          renderTime,
          componentCount: prev.canvas.components.length,
          optimizationScore: Math.max(0, 100 - (renderTime / 10))
        }
      }));
    };
  });

  // ==================== AI INTEGRATION ====================
  const generateWithAI = useCallback(async (prompt: string) => {
    if (!enableAI) return;

    setIsGenerating(true);
    try {
      const request: PromptRequest = {
        prompt,
        context: {
          userRole: 'developer',
          businessDomain: 'general',
          existingApps: [],
          preferences: {
            theme: 'auto',
            complexity: 'moderate',
            style: 'modern'
          }
        }
      };

      const response = await getAIBuilderSDK().generateFromPrompt(request, {
        llmCallback: (stage, data) => {
          console.log(`AI Stage: ${stage}`, data);
        },
        tenantId,
        enableStreaming: true
      });

      if (response.success && response.manifest) {
        // Convert AI response to canvas components
        const newComponents = convertManifestToComponents(response.manifest);
        addComponentsToCanvas(newComponents);

        setState(prev => ({
          ...prev,
          manifest: response.manifest || null,
          aiSuggestions: response.suggestions || []
        }));
      }
    } catch (error) {
      console.error('AI generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [enableAI, tenantId]);

  // ==================== CANVAS OPERATIONS ====================
  const addComponent = useCallback((componentType: string, position?: { x: number; y: number }) => {
    const paletteItem = COMPONENT_PALETTE.find(item => item.type === componentType);
    if (!paletteItem) return;

    const newComponent: BuilderComponent = {
      id: `component-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: componentType as any,
      position: position || { x: 100, y: 100 },
      size: { width: 200, height: 100 },
      props: { ...paletteItem.defaultProps },
      metadata: {
        aiGenerated: false,
        confidence: 1.0,
        suggestions: [],
        performance: 'excellent'
      }
    };

    setState(prev => {
      const newCanvas = {
        ...prev.canvas,
        components: [...prev.canvas.components, newComponent],
        selectedComponent: newComponent.id
      };

      return {
        ...prev,
        canvas: newCanvas,
        isDirty: true,
        history: [...prev.history.slice(0, prev.historyIndex + 1), newCanvas],
        historyIndex: prev.historyIndex + 1,
        canUndo: true,
        canRedo: false
      };
    });
  }, []);

  const updateComponent = useCallback((componentId: string, updates: Partial<BuilderComponent>) => {
    setState(prev => {
      const newComponents = prev.canvas.components.map(comp =>
        comp.id === componentId ? { ...comp, ...updates } : comp
      );

      const newCanvas = {
        ...prev.canvas,
        components: newComponents
      };

      return {
        ...prev,
        canvas: newCanvas,
        isDirty: true,
        history: [...prev.history.slice(0, prev.historyIndex + 1), newCanvas],
        historyIndex: prev.historyIndex + 1,
        canUndo: true,
        canRedo: false
      };
    });
  }, []);

  const deleteComponent = useCallback((componentId: string) => {
    setState(prev => {
      const newComponents = prev.canvas.components.filter(comp => comp.id !== componentId);
      const newCanvas = {
        ...prev.canvas,
        components: newComponents,
        selectedComponent: prev.canvas.selectedComponent === componentId ? null : prev.canvas.selectedComponent
      };

      return {
        ...prev,
        canvas: newCanvas,
        isDirty: true,
        history: [...prev.history.slice(0, prev.historyIndex + 1), newCanvas],
        historyIndex: prev.historyIndex + 1,
        canUndo: true,
        canRedo: false
      };
    });
  }, []);

  const addComponentsToCanvas = useCallback((components: BuilderComponent[]) => {
    setState(prev => {
      const newCanvas = {
        ...prev.canvas,
        components: [...prev.canvas.components, ...components]
      };

      return {
        ...prev,
        canvas: newCanvas,
        isDirty: true,
        history: [...prev.history.slice(0, prev.historyIndex + 1), newCanvas],
        historyIndex: prev.historyIndex + 1,
        canUndo: true,
        canRedo: false
      };
    });
  }, []);

  // ==================== HISTORY MANAGEMENT ====================
  const undo = useCallback(() => {
    setState(prev => {
      if (prev.historyIndex > 0 && prev.history.length > 0) {
        const newIndex = prev.historyIndex - 1;
        if (newIndex >= 0 && newIndex < prev.history.length) {
          return {
            ...prev,
            canvas: prev.history[newIndex]!,
            historyIndex: newIndex,
            canUndo: newIndex > 0,
            canRedo: true
          };
        }
      }
      return prev;
    });
  }, []);

  const redo = useCallback(() => {
    setState(prev => {
      if (prev.historyIndex < prev.history.length - 1) {
        const newIndex = prev.historyIndex + 1;
        if (newIndex >= 0 && newIndex < prev.history.length) {
          return {
            ...prev,
            canvas: prev.history[newIndex]!,
            historyIndex: newIndex,
            canUndo: true,
            canRedo: newIndex < prev.history.length - 1
          };
        }
      }
      return prev;
    });
  }, []);

  // ==================== MANIFEST GENERATION ====================
  const generateManifest = useCallback(async (): Promise<AppManifest> => {
    const manifest: AppManifest = {
      manifest_version: 1,
      app_id: `app-${tenantId}-${Date.now()}`,
      name: 'AI-Generated App',
      version: '1.0.0',
      description: 'App generated with AI-BOS Visual Builder',
      author: userId,
      ui: 'components/App',
      permissions: ['ui.modal', 'ui.toast'],
      theme: 'auto',
      entry: 'App.tsx',
      dependencies: ['@aibos/ui-components'],
      metadata: {
        category: 'GENERAL',
        tags: ['ai-generated', 'visual-builder'],
        icon: '/icons/app.svg'
      },
      lifecycle: {
        onMount: 'initializeApp',
        onError: 'handleError',
        onDestroy: 'cleanup'
      },
      security: {
        sandboxed: true,
        allowedDomains: ['api.aibos.com'],
        maxMemory: 50,
        timeout: 5000
      }
    };

    setState(prev => ({ ...prev, manifest }));
    return manifest;
  }, [tenantId, userId]);

  // ==================== UTILITY FUNCTIONS ====================
  const convertManifestToComponents = useCallback((manifest: AppManifest): BuilderComponent[] => {
    // Convert manifest to canvas components
    return [
      {
        id: 'main-container',
        type: 'card',
        position: { x: 50, y: 50 },
        size: { width: 400, height: 300 },
        props: { title: manifest.name, content: manifest.description || '' },
        metadata: { aiGenerated: true, confidence: 0.9, performance: 'excellent' }
      }
    ];
  }, []);

  // ==================== RENDER ====================
  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* ==================== TOOLBAR ==================== */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI-BOS Visual Builder</h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={undo}
              disabled={!state.canUndo}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={redo}
              disabled={!state.canRedo}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* AI Assistant */}
          {enableAI && (
            <button
              onClick={() => setShowAIPanel(!showAIPanel)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Assistant</span>
            </button>
          )}

          {/* Performance Panel */}
          <button
            onClick={() => setShowPerformancePanel(!showPerformancePanel)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Performance</span>
          </button>

          {/* Collaboration */}
          {enableCollaboration && (
            <button
              onClick={() => setShowCollaborationPanel(!showCollaborationPanel)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Users className="w-4 h-4" />
              <span>Collaboration</span>
            </button>
          )}

          {/* Preview Mode */}
          <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setState(prev => ({ ...prev, previewMode: 'desktop' }))}
              className={`p-2 rounded ${state.previewMode === 'desktop' ? 'bg-white dark:bg-gray-600' : ''}`}
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setState(prev => ({ ...prev, previewMode: 'tablet' }))}
              className={`p-2 rounded ${state.previewMode === 'tablet' ? 'bg-white dark:bg-gray-600' : ''}`}
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setState(prev => ({ ...prev, previewMode: 'mobile' }))}
              className={`p-2 rounded ${state.previewMode === 'mobile' ? 'bg-white dark:bg-gray-600' : ''}`}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          {/* Save/Deploy */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onSave?.(state.manifest!)}
              disabled={!state.isDirty}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </button>
            <button
              onClick={() => onDeploy?.(state.manifest!)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Play className="w-4 h-4 mr-2" />
              Deploy
            </button>
          </div>
        </div>
      </div>

      {/* ==================== MAIN CONTENT ==================== */}
      <div className="flex-1 flex">
        {/* ==================== SIDEBAR ==================== */}
        <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Component Palette */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Components</h3>
            <div className="grid grid-cols-2 gap-2">
              {COMPONENT_PALETTE.map((item) => (
                <button
                  key={item.type}
                  onClick={() => addComponent(item.type)}
                  className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
                >
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{item.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Properties Panel */}
          <div className="flex-1 p-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Properties</h3>
            {state.canvas.selectedComponent && (
              <ComponentProperties
                component={state.canvas.components.find(c => c.id === state.canvas.selectedComponent)!}
                onUpdate={(updates) => updateComponent(state.canvas.selectedComponent!, updates)}
                onDelete={() => deleteComponent(state.canvas.selectedComponent!)}
              />
            )}
          </div>
        </div>

        {/* ==================== CANVAS ==================== */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 relative overflow-hidden">
            <div
              ref={canvasRef}
              className="w-full h-full relative bg-gray-100 dark:bg-gray-900"
              style={{
                backgroundImage: state.canvas.grid ? 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)' : 'none',
                backgroundSize: `${state.canvas.gridSize}px ${state.canvas.gridSize}px`
              }}
            >
              <DndContext
                onDragEnd={(event) => {
                  // Handle drag end
                }}
                modifiers={[restrictToWindowEdges]}
              >
                {state.canvas.components.map((component) => (
                  <CanvasComponent
                    key={component.id}
                    component={component}
                    isSelected={component.id === state.canvas.selectedComponent}
                    onSelect={() => setState(prev => ({
                      ...prev,
                      canvas: { ...prev.canvas, selectedComponent: component.id }
                    }))}
                    onUpdate={(updates) => updateComponent(component.id, updates)}
                  />
                ))}
              </DndContext>
            </div>
          </div>
        </div>

        {/* ==================== PREVIEW PANEL ==================== */}
        {enableRealTimePreview && (
          <div className="w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Live Preview</h3>
            </div>
            <div className="p-4">
              {state.manifest ? (
                <AppContainer
                  manifest={state.manifest}
                  options={{
                    enableDevtools: true,
                    timeout: 10000
                  }}
                />
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Generate a manifest to see live preview</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ==================== AI PANEL ==================== */}
      <AnimatePresence>
        {showAIPanel && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 z-50"
          >
            <AIPanel
              prompt={aiPrompt}
              onPromptChange={setAiPrompt}
              onGenerate={generateWithAI}
              isGenerating={isGenerating}
              suggestions={state.aiSuggestions}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== PERFORMANCE PANEL ==================== */}
      <AnimatePresence>
        {showPerformancePanel && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="fixed bottom-0 left-0 right-0 h-64 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50"
          >
            <PerformancePanel performance={state.performance} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== COLLABORATION PANEL ==================== */}
      <AnimatePresence>
        {showCollaborationPanel && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            className="fixed left-0 top-0 h-full w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50"
          >
            <CollaborationPanel
              users={state.collaboration.activeUsers}
              isEnabled={state.collaboration.isEnabled}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==================== SUB-COMPONENTS ====================

// Component Properties Panel
const ComponentProperties: React.FC<{
  component: BuilderComponent;
  onUpdate: (updates: Partial<BuilderComponent>) => void;
  onDelete: () => void;
}> = ({ component, onUpdate, onDelete }) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Component Type
        </label>
        <div className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-2 rounded">
          {component.type}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Position
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            value={component.position.x}
            onChange={(e) => onUpdate({ position: { ...component.position, x: parseInt(e.target.value) } })}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
            placeholder="X"
          />
          <input
            type="number"
            value={component.position.y}
            onChange={(e) => onUpdate({ position: { ...component.position, y: parseInt(e.target.value) } })}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
            placeholder="Y"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Size
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            value={component.size.width}
            onChange={(e) => onUpdate({ size: { ...component.size, width: parseInt(e.target.value) } })}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
            placeholder="Width"
          />
          <input
            type="number"
            value={component.size.height}
            onChange={(e) => onUpdate({ size: { ...component.size, height: parseInt(e.target.value) } })}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
            placeholder="Height"
          />
        </div>
      </div>

      <button
        onClick={onDelete}
        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
      >
        Delete Component
      </button>
    </div>
  );
};

// Canvas Component
const CanvasComponent: React.FC<{
  component: BuilderComponent;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<BuilderComponent>) => void;
}> = ({ component, isSelected, onSelect, onUpdate }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: component.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={{
        position: 'absolute',
        left: component.position.x,
        top: component.position.y,
        width: component.size.width,
        height: component.size.height,
        ...style
      }}
      className={`border-2 rounded-lg cursor-move ${
        isSelected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
      }`}
      onClick={onSelect}
      {...attributes}
      {...listeners}
    >
      <div className="p-2 text-sm">
        <div className="font-medium">{component.type}</div>
        <div className="text-xs text-gray-500">
          {component.size.width} × {component.size.height}
        </div>
      </div>
    </div>
  );
};

// AI Panel
const AIPanel: React.FC<{
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
  suggestions: string[];
}> = ({ prompt, onPromptChange, onGenerate, isGenerating, suggestions }) => {
  return (
    <div className="p-4 h-full flex flex-col">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">AI Assistant</h3>

      <div className="flex-1 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Describe what you want to build
          </label>
          <textarea
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none"
            placeholder="e.g., Create a contact form with name, email, and phone fields..."
          />
        </div>

        <button
          onClick={() => onGenerate(prompt)}
          disabled={!prompt.trim() || isGenerating}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isGenerating ? 'Generating...' : 'Generate with AI'}
        </button>

        {suggestions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Suggestions</h4>
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => onPromptChange(suggestion)}
                  className="w-full text-left p-2 text-sm bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Performance Panel
const PerformancePanel: React.FC<{ performance: BuilderState['performance'] }> = ({ performance }) => {
  return (
    <div className="p-4 h-full">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Performance</h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
          <div className="text-sm text-gray-500 dark:text-gray-400">Render Time</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {performance.renderTime.toFixed(2)}ms
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
          <div className="text-sm text-gray-500 dark:text-gray-400">Components</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {performance.componentCount}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
          <div className="text-sm text-gray-500 dark:text-gray-400">Memory Usage</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {performance.memoryUsage}MB
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
          <div className="text-sm text-gray-500 dark:text-gray-400">Optimization Score</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {performance.optimizationScore}%
          </div>
        </div>
      </div>
    </div>
  );
};

// Collaboration Panel
const CollaborationPanel: React.FC<{
  users: BuilderState['collaboration']['activeUsers'];
  isEnabled: boolean;
}> = ({ users, isEnabled }) => {
  return (
    <div className="p-4 h-full">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Collaboration</h3>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isEnabled ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {isEnabled ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Active Users</h4>
          <div className="space-y-2">
            {users.map((user) => (
              <div key={user.id} className="flex items-center space-x-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: user.color }}
                />
                <span className="text-sm text-gray-900 dark:text-white">{user.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualBuilder;
