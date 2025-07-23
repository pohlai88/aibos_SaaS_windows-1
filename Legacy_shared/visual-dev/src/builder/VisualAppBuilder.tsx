/**
 * AI-BOS Visual App Builder
 *
 * Enterprise-grade visual development interface with drag-drop canvas,
 * AI assistance, real-time preview, and automatic manifest generation.
 */

'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Save,
  Undo,
  Redo,
  Eye,
  Code,
  Sparkles,
  Settings,
  Grid,
  Smartphone,
  Tablet,
  Monitor,
  Download,
} from 'lucide-react';

// AI-BOS Shared Library Integration
import {
  initializeAibosSystems,
  EventBus,
  ManifestBuilder,
  createManifest,
  logger,
  monitoring,
} from '@aibos/shared/lib';
import { AIEngine } from '@aibos/shared/ai';

// Visual Dev Components
import { DragDropCanvas } from '../canvas/DragDropCanvas';
import { ComponentPalette } from '../palette/ComponentPalette';
import { PropertyPanel } from '../properties/PropertyPanel';
import { LivePreview } from '../preview/LivePreview';
import { AIVisualAssistant } from '../ai-assistant/AIVisualAssistant';
import { VisualManifestBuilder } from '../manifest/VisualManifestBuilder';
import { CodeGenerator } from '../codegen/CodeGenerator';

// Types
import type {
  VisualAppState,
  CanvasState,
  VisualElement,
  BuilderConfig,
  PreviewMode,
  AISuggestion,
  CodeGenerationOptions,
  ComponentLibrary,
} from '../types';

// Hooks
import { useVisualBuilder } from '../hooks/useVisualBuilder';
import { useCanvasState } from '../hooks/useCanvasState';
import { useAIAssistant } from '../hooks/useAIAssistant';

// Default component library
import { DEFAULT_COMPONENT_LIBRARY } from '../constants/componentLibrary';

// ============================================================================
// VISUAL APP BUILDER COMPONENT
// ============================================================================

export interface VisualAppBuilderProps {
  /** Initial app state */
  initialState?: Partial<VisualAppState>;
  /** Builder configuration */
  config?: Partial<BuilderConfig>;
  /** Event handlers */
  onSave?: (state: VisualAppState) => Promise<void>;
  onDeploy?: (state: VisualAppState) => Promise<void>;
  onExport?: (code: string, manifest: object) => Promise<void>;
  /** Theme */
  theme?: 'light' | 'dark' | 'auto';
  /** Enable collaboration */
  enableCollaboration?: boolean;
  /** Custom component library */
  componentLibrary?: ComponentLibrary;
}

/**
 * Main Visual App Builder Component
 * Provides complete visual development environment with AI assistance
 */
export const VisualAppBuilder: React.FC<VisualAppBuilderProps> = ({
  initialState,
  config,
  onSave,
  onDeploy,
  onExport,
  theme = 'light',
  enableCollaboration = false,
  componentLibrary = DEFAULT_COMPONENT_LIBRARY,
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  // Initialize AI-BOS systems
  const aibosSystems = useMemo(() => {
    const systems = initializeAibosSystems({
      events: { enablePersistence: true, enableMetrics: true, enableAudit: true },
      manifests: { enableValidation: true, enableCompliance: true, enableSecurity: true },
      entities: { enableCaching: true, enableAudit: true, enableValidation: true },
    });

    logger.info('Visual App Builder initialized', {
      hasInitialState: !!initialState,
      enableCollaboration,
      componentLibraryVersion: componentLibrary.version,
    });

    return systems;
  }, [initialState, enableCollaboration, componentLibrary]);

  // Builder state management
  const {
    appState,
    updateAppState,
    isLoading,
    isDirty,
    canUndo,
    canRedo,
    undo,
    redo,
    save,
    deploy,
    exportApp,
  } = useVisualBuilder({
    initialState,
    eventBus: aibosSystems.eventBus,
    manifestProcessor: aibosSystems.manifestProcessor,
    onSave,
    onDeploy,
    onExport,
  });

  // Canvas state management
  const {
    canvasState,
    selectedElements,
    updateCanvasState,
    addElement,
    removeElement,
    updateElement,
    selectElement,
    clearSelection,
    duplicateElement,
    setPreviewMode,
    setZoom,
    setPan,
  } = useCanvasState({
    initialCanvas: appState.canvas,
    eventBus: aibosSystems.eventBus,
    maxHistoryEntries: config?.maxHistoryEntries || 50,
  });

  // AI Assistant integration
  const {
    suggestions,
    isAnalyzing,
    generateSuggestions,
    applySuggestion,
    dismissSuggestion,
    optimizeLayout,
    generateComponent,
    analyzeAccessibility,
  } = useAIAssistant({
    aiEngine: config?.aiEngine,
    eventBus: aibosSystems.eventBus,
    canvasState,
    enabled: config?.enableAIAssistance !== false,
  });

  // UI State
  const [activePanel, setActivePanel] = useState<'components' | 'properties' | 'ai' | 'code'>(
    'components',
  );
  const [showPreview, setShowPreview] = useState(false);
  const [previewMode, setInternalPreviewMode] = useState<PreviewMode>('design');
  const [showGrid, setShowGrid] = useState(true);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  /**
   * Handle drag start event
   */
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      logger.debug('Drag started', { elementId: active.id });

      // Emit event for collaboration
      aibosSystems.eventBus.emit('canvas:drag-start', {
        elementId: active.id,
        timestamp: Date.now(),
      });
    },
    [aibosSystems.eventBus],
  );

  /**
   * Handle drag end event
   */
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over, delta } = event;

      if (over) {
        const activeElement = canvasState.elements.find((el) => el.instanceId === active.id);

        if (activeElement) {
          // Update element position
          updateElement(activeElement.instanceId, {
            position: {
              x: activeElement.position.x + delta.x,
              y: activeElement.position.y + delta.y,
            },
          });

          logger.debug('Element moved', {
            elementId: active.id,
            newPosition: activeElement.position,
          });

          // Emit event for collaboration
          aibosSystems.eventBus.emit('canvas:element-moved', {
            elementId: active.id,
            newPosition: activeElement.position,
            timestamp: Date.now(),
          });
        }
      }
    },
    [canvasState.elements, updateElement, aibosSystems.eventBus],
  );

  /**
   * Handle component drop from palette
   */
  const handleComponentDrop = useCallback(
    (componentType: string, position: { x: number; y: number }) => {
      const componentDef = componentLibrary.components.find((c) => c.type === componentType);

      if (componentDef) {
        const newElement: Partial<VisualElement> = {
          type: componentDef.type as any,
          category: componentDef.category,
          name: componentDef.name,
          description: componentDef.description,
          icon: componentDef.icon,
          position,
          size: { width: 200, height: 100 },
          properties: componentDef.defaultProperties,
          style: {},
          events: {},
          validation: { required: false },
          metadata: {
            createdBy: 'current-user', // TODO: Get from auth context
            createdAt: Date.now(),
            lastModifiedBy: 'current-user',
            lastModifiedAt: Date.now(),
            version: '1.0.0',
            tags: [],
            notes: '',
            analytics: {
              usageCount: 0,
              performanceScore: 100,
              accessibilityScore: 100,
              userRating: 5,
              lastUsed: Date.now(),
            },
          },
        };

        addElement(newElement);

        logger.info('Component added to canvas', {
          componentType,
          position,
          elementId: newElement.id,
        });

        // Auto-generate AI suggestions for the new component
        if (config?.enableAIAssistance !== false) {
          generateSuggestions();
        }
      }
    },
    [componentLibrary.components, addElement, generateSuggestions, config?.enableAIAssistance],
  );

  /**
   * Handle preview mode change
   */
  const handlePreviewModeChange = useCallback(
    (mode: PreviewMode) => {
      setInternalPreviewMode(mode);
      setPreviewMode(mode);

      logger.debug('Preview mode changed', { mode });

      // Emit event
      aibosSystems.eventBus.emit('canvas:preview-mode-changed', {
        mode,
        timestamp: Date.now(),
      });
    },
    [setPreviewMode, aibosSystems.eventBus],
  );

  /**
   * Handle code generation
   */
  const handleGenerateCode = useCallback(
    async (options: CodeGenerationOptions) => {
      setIsGeneratingCode(true);

      try {
        const codeGenerator = new CodeGenerator({
          aiEngine: config?.aiEngine,
          eventBus: aibosSystems.eventBus,
        });

        const generatedCode = await codeGenerator.generateFromCanvas(canvasState, options);

        // Update app state with generated code
        updateAppState({
          code: generatedCode,
        });

        logger.info('Code generated successfully', {
          framework: options.framework,
          filesGenerated: generatedCode.components.length,
        });

        // Emit success event
        aibosSystems.eventBus.emit('code:generated', {
          options,
          filesCount: generatedCode.components.length,
          timestamp: Date.now(),
        });
      } catch (error) {
        logger.error('Code generation failed', { error });

        // Emit error event
        aibosSystems.eventBus.emit('code:generation-failed', {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: Date.now(),
        });
      } finally {
        setIsGeneratingCode(false);
      }
    },
    [canvasState, config?.aiEngine, aibosSystems.eventBus, updateAppState],
  );

  /**
   * Handle save operation
   */
  const handleSave = useCallback(async () => {
    try {
      await save();

      logger.info('App saved successfully', { appId: appState.app.id });

      // Show success notification
      aibosSystems.eventBus.emit('app:saved', {
        appId: appState.app.id,
        timestamp: Date.now(),
      });
    } catch (error) {
      logger.error('Save failed', { error });

      // Show error notification
      aibosSystems.eventBus.emit('app:save-failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      });
    }
  }, [save, appState.app.id, aibosSystems.eventBus]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * Auto-save functionality
   */
  useEffect(() => {
    if (config?.autoSave && isDirty) {
      const autoSaveTimer = setTimeout(() => {
        handleSave();
      }, config.autoSaveInterval || 30000); // 30 seconds default

      return () => clearTimeout(autoSaveTimer);
    }
  }, [config?.autoSave, config?.autoSaveInterval, isDirty, handleSave]);

  /**
   * Monitor performance
   */
  useEffect(() => {
    const performanceTimer = setInterval(() => {
      monitoring.track('canvas:performance', {
        elementsCount: canvasState.elements.length,
        selectedCount: selectedElements.length,
        canvasSize: canvasState.elements.length,
        memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
      });
    }, 10000); // Every 10 seconds

    return () => clearInterval(performanceTimer);
  }, [canvasState.elements.length, selectedElements.length]);

  // ============================================================================
  // RENDER
  // ============================================================================

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading Visual App Builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col bg-gray-50 ${theme}`}>
      {/* ============================================================================ */}
      {/* TOP TOOLBAR */}
      {/* ============================================================================ */}
      <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
        {/* Left: App Info & Actions */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-gray-900">{appState.app.name}</h1>
              <p className="text-xs text-gray-500">v{appState.app.version}</p>
            </div>
          </div>

          {isDirty && (
            <div className="w-2 h-2 bg-orange-400 rounded-full" title="Unsaved changes" />
          )}
        </div>

        {/* Center: Mode Controls */}
        <div className="flex items-center space-x-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => handlePreviewModeChange('design')}
              className={`px-3 py-1 text-xs font-medium rounded ${
                previewMode === 'design'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Design
            </button>
            <button
              onClick={() => handlePreviewModeChange('preview')}
              className={`px-3 py-1 text-xs font-medium rounded ${
                previewMode === 'preview'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Preview
            </button>
          </div>

          <div className="w-px h-6 bg-gray-300" />

          {/* Device Preview Buttons */}
          <div className="flex space-x-1">
            <button
              onClick={() => handlePreviewModeChange('mobile')}
              className={`p-2 rounded ${
                previewMode === 'mobile'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Mobile Preview"
            >
              <Smartphone className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePreviewModeChange('tablet')}
              className={`p-2 rounded ${
                previewMode === 'tablet'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Tablet Preview"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePreviewModeChange('desktop')}
              className={`p-2 rounded ${
                previewMode === 'desktop'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Desktop Preview"
            >
              <Monitor className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-300" />

          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-2 rounded ${
              showGrid ? 'bg-gray-100 text-gray-700' : 'text-gray-500 hover:text-gray-700'
            }`}
            title="Toggle Grid"
          >
            <Grid className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`p-2 rounded ${
              showPreview ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
            title="Live Preview"
          >
            <Eye className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-300" />

          <button
            onClick={handleSave}
            disabled={!isDirty}
            className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4 inline mr-1" />
            Save
          </button>

          <button
            onClick={() =>
              handleGenerateCode({
                framework: 'react',
                language: 'typescript',
                styleFramework: 'tailwind',
                includeTests: true,
                includeStorybook: false,
                includeAccessibility: true,
                optimizeForPerformance: true,
                generateManifest: true,
              })
            }
            disabled={isGeneratingCode}
            className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
            title="Generate Code"
          >
            {isGeneratingCode ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline mr-1" />
            ) : (
              <Code className="w-4 h-4 inline mr-1" />
            )}
            Export
          </button>
        </div>
      </div>

      {/* ============================================================================ */}
      {/* MAIN CONTENT AREA */}
      {/* ============================================================================ */}
      <div className="flex-1 flex">
        {/* Left Sidebar: Component Palette & AI Assistant */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Sidebar Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActivePanel('components')}
              className={`flex-1 px-4 py-3 text-sm font-medium ${
                activePanel === 'components'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Components
            </button>
            <button
              onClick={() => setActivePanel('ai')}
              className={`flex-1 px-4 py-3 text-sm font-medium ${
                activePanel === 'ai'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              AI Assistant
              {suggestions.length > 0 && (
                <span className="ml-2 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                  {suggestions.length}
                </span>
              )}
            </button>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              {activePanel === 'components' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full"
                >
                  <ComponentPalette
                    componentLibrary={componentLibrary}
                    onComponentDrop={handleComponentDrop}
                  />
                </motion.div>
              )}

              {activePanel === 'ai' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full"
                >
                  <AIVisualAssistant
                    suggestions={suggestions}
                    isAnalyzing={isAnalyzing}
                    onApplySuggestion={applySuggestion}
                    onDismissSuggestion={dismissSuggestion}
                    onGenerateSuggestions={generateSuggestions}
                    onOptimizeLayout={optimizeLayout}
                    onGenerateComponent={generateComponent}
                    onAnalyzeAccessibility={analyzeAccessibility}
                    canvasState={canvasState}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Center: Canvas */}
        <div className="flex-1 relative">
          <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <DragDropCanvas
              canvasState={canvasState}
              selectedElements={selectedElements}
              onElementSelect={selectElement}
              onElementUpdate={updateElement}
              onElementRemove={removeElement}
              onElementDuplicate={duplicateElement}
              onCanvasUpdate={updateCanvasState}
              showGrid={showGrid}
              previewMode={previewMode}
              onZoomChange={setZoom}
              onPanChange={setPan}
            />

            {/* Drag Overlay */}
            <DragOverlay>{/* Render dragging element preview */}</DragOverlay>
          </DndContext>

          {/* Live Preview Overlay */}
          <AnimatePresence>
            {showPreview && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-4 bg-white rounded-lg shadow-2xl border border-gray-200 z-50"
              >
                <div className="h-full flex flex-col">
                  <div className="h-12 bg-gray-50 border-b border-gray-200 flex items-center justify-between px-4">
                    <h3 className="text-sm font-medium text-gray-900">Live Preview</h3>
                    <button
                      onClick={() => setShowPreview(false)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>
                  <div className="flex-1">
                    <LivePreview
                      canvasState={canvasState}
                      previewMode={previewMode}
                      componentLibrary={componentLibrary}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Sidebar: Properties Panel */}
        {selectedElements.length > 0 && (
          <div className="w-80 bg-white border-l border-gray-200">
            <PropertyPanel
              selectedElements={selectedElements}
              onElementUpdate={updateElement}
              componentLibrary={componentLibrary}
            />
          </div>
        )}
      </div>
    </div>
  );
};
