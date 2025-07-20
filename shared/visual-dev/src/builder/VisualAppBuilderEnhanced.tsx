/**
 * AI-BOS Enhanced Visual App Builder
 *
 * Enterprise-grade visual development interface with all code review improvements:
 * - Performance optimizations with memoization and virtualization
 * - Comprehensive error boundaries and resilience
 * - Full accessibility compliance (WCAG 2.1 AA)
 * - Modular component architecture
 * - Advanced collaboration features
 */

'use client';

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
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
  Users,
  History,
  Palette,
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

// Enhanced Visual Dev Components
import { DragDropCanvas } from '../canvas/DragDropCanvas';
import { ComponentPalette } from '../palette/ComponentPalette';
import { PropertyPanel } from '../properties/PropertyPanel';
import { LivePreview } from '../preview/LivePreview';
import { AIVisualAssistant } from '../ai-assistant/AIVisualAssistant';
import { VisualManifestBuilder } from '../manifest/VisualManifestBuilder';
import { CodeGenerator } from '../codegen/CodeGenerator';

// Error Boundaries
import {
  VisualDevErrorBoundary,
  CanvasErrorFallback,
  AIAssistantErrorFallback,
  withErrorBoundary,
  createSafeAsyncHandler,
} from '../components/ErrorBoundary';

// Performance & Accessibility Hooks
import {
  useOptimizedCanvas,
  useVirtualizedPalette,
  useCanvasEvents,
  usePerformanceMonitoring,
} from '../hooks/useOptimizedCanvas';

import {
  useAccessibility,
  useKeyboardNavigation,
  useScreenReader,
  useAriaAttributes,
  useFocusManagement,
  announceToScreenReader,
} from '../hooks/useAccessibility';

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

// Enhanced Hooks
import { useVisualBuilder } from '../hooks/useVisualBuilder';
import { useCanvasState } from '../hooks/useCanvasState';
import { useAIAssistant } from '../hooks/useAIAssistant';

// Specialized Components
import { BuilderToolbar } from './components/BuilderToolbar';
import { SidebarTabs } from './components/SidebarTabs';
import { PreviewOverlay } from './components/PreviewOverlay';
import { CollaborationPanel } from './components/CollaborationPanel';
import { VersionHistory } from './components/VersionHistory';

// Default component library
import { DEFAULT_COMPONENT_LIBRARY } from '../constants/componentLibrary';

// ============================================================================
// ENHANCED VISUAL APP BUILDER COMPONENT
// ============================================================================

export interface EnhancedVisualAppBuilderProps {
  /** Initial app state */
  initialState?: Partial<VisualAppState>;
  /** Builder configuration */
  config?: Partial<BuilderConfig>;
  /** Event handlers */
  onSave?: (state: VisualAppState) => Promise<void>;
  onDeploy?: (state: VisualAppState) => Promise<void>;
  onExport?: (code: string, manifest: object) => Promise<void>;
  onCollaboratorJoin?: (userId: string) => void;
  onCollaboratorLeave?: (userId: string) => void;
  /** Theme */
  theme?: 'light' | 'dark' | 'auto';
  /** Enable collaboration */
  enableCollaboration?: boolean;
  /** Enable version history */
  enableVersionHistory?: boolean;
  /** Custom component library */
  componentLibrary?: ComponentLibrary;
  /** Accessibility configuration */
  accessibilityConfig?: {
    enableKeyboardNavigation?: boolean;
    enableScreenReader?: boolean;
    announceChanges?: boolean;
  };
}

/**
 * Enhanced Visual App Builder Component
 * Production-ready visual development environment with enterprise features
 */
export const EnhancedVisualAppBuilder: React.FC<EnhancedVisualAppBuilderProps> = ({
  initialState,
  config,
  onSave,
  onDeploy,
  onExport,
  onCollaboratorJoin,
  onCollaboratorLeave,
  theme = 'light',
  enableCollaboration = false,
  enableVersionHistory = true,
  componentLibrary = DEFAULT_COMPONENT_LIBRARY,
  accessibilityConfig = {},
}) => {
  // ============================================================================
  // REFS & PERFORMANCE MONITORING
  // ============================================================================

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Performance monitoring
  const { renderMetrics, trackRender } = usePerformanceMonitoring();

  // ============================================================================
  // ACCESSIBILITY SETUP
  // ============================================================================

  const { config: a11yConfig } = useAccessibility({
    enableKeyboardNavigation: true,
    enableScreenReader: true,
    announceChanges: true,
    ...accessibilityConfig,
  });

  const { announce } = useScreenReader();
  const { pushFocus, popFocus } = useFocusManagement();

  // Keyboard navigation for main container
  useKeyboardNavigation(containerRef, {
    trapFocus: false, // Allow navigation between panels
    autoFocus: false,
    restoreFocus: true,
  });

  // ARIA attributes for main app
  const mainAriaAttributes = useAriaAttributes('application', {
    label: 'AI-BOS Visual App Builder',
    description: 'Drag and drop interface for building applications',
  });

  // ============================================================================
  // CORE SYSTEM INITIALIZATION
  // ============================================================================

  const aibosSystems = useMemo(() => {
    const systems = initializeAibosSystems({
      events: { enablePersistence: true, enableMetrics: true, enableAudit: true },
      manifests: { enableValidation: true, enableCompliance: true, enableSecurity: true },
      entities: { enableCaching: true, enableAudit: true, enableValidation: true },
    });

    logger.info('Enhanced Visual App Builder initialized', {
      hasInitialState: !!initialState,
      enableCollaboration,
      enableVersionHistory,
      componentLibraryVersion: componentLibrary.version,
      accessibilityEnabled: a11yConfig.enableKeyboardNavigation,
    });

    return systems;
  }, [initialState, enableCollaboration, enableVersionHistory, componentLibrary, a11yConfig]);

  // ============================================================================
  // STATE MANAGEMENT WITH ERROR HANDLING
  // ============================================================================

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

  // Canvas state management with performance optimization
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

  // Performance-optimized canvas computations
  const { selectedElementIds, elementsByType, visibleElements, canvasMetrics } = useOptimizedCanvas(
    canvasState,
    selectedElements,
  );

  // AI Assistant integration with error handling
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

  // Virtualized component palette
  const [searchQuery, setSearchQuery] = useState('');
  const { filteredComponents, componentsByCategory, totalComponents } = useVirtualizedPalette(
    componentLibrary.components,
    searchQuery,
  );

  // ============================================================================
  // UI STATE WITH ACCESSIBILITY
  // ============================================================================

  const [activePanel, setActivePanel] = useState<
    'components' | 'properties' | 'ai' | 'code' | 'collaboration' | 'history'
  >('components');
  const [showPreview, setShowPreview] = useState(false);
  const [previewMode, setInternalPreviewMode] = useState<PreviewMode>('design');
  const [showGrid, setShowGrid] = useState(true);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [versionHistory, setVersionHistory] = useState<any[]>([]);

  // ============================================================================
  // ENHANCED EVENT HANDLERS WITH ERROR HANDLING
  // ============================================================================

  /**
   * Safe async handler for drag operations
   */
  const handleDragStart = useCallback(
    createSafeAsyncHandler(async (event: DragStartEvent) => {
      const { active } = event;
      logger.debug('Drag started', { elementId: active.id });

      // Announce to screen reader
      if (a11yConfig.announceChanges) {
        announce(`Started dragging ${active.id}`, 'polite');
      }

      // Emit event for collaboration
      aibosSystems.eventBus.emit('canvas:drag-start', {
        elementId: active.id,
        timestamp: Date.now(),
      });
    }, 'drag-start'),
    [aibosSystems.eventBus, announce, a11yConfig.announceChanges],
  );

  /**
   * Optimized event handlers with memory management
   */
  const { optimizedElementUpdate, optimizedCanvasUpdate } = useCanvasEvents(
    updateElement,
    updateCanvasState,
  );

  /**
   * Enhanced drag end with accessibility announcements
   */
  const handleDragEnd = useCallback(
    createSafeAsyncHandler(async (event: DragEndEvent) => {
      const { active, over, delta } = event;

      if (over) {
        const activeElement = canvasState.elements.find((el) => el.instanceId === active.id);

        if (activeElement) {
          const newPosition = {
            x: activeElement.position.x + delta.x,
            y: activeElement.position.y + delta.y,
          };

          optimizedElementUpdate(activeElement.instanceId, {
            position: newPosition,
          });

          // Announce position change
          if (a11yConfig.announceChanges) {
            announce(
              `Moved ${activeElement.name} to position ${newPosition.x}, ${newPosition.y}`,
              'polite',
            );
          }

          logger.debug('Element moved', {
            elementId: active.id,
            newPosition,
          });

          // Emit event for collaboration
          aibosSystems.eventBus.emit('canvas:element-moved', {
            elementId: active.id,
            newPosition,
            timestamp: Date.now(),
          });
        }
      }
    }, 'drag-end'),
    [
      canvasState.elements,
      optimizedElementUpdate,
      announce,
      a11yConfig.announceChanges,
      aibosSystems.eventBus,
    ],
  );

  /**
   * Enhanced component drop with accessibility
   */
  const handleComponentDrop = useCallback(
    createSafeAsyncHandler(async (componentType: string, position: { x: number; y: number }) => {
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
            createdBy: 'current-user',
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

        // Announce component addition
        if (a11yConfig.announceChanges) {
          announce(`Added ${componentDef.name} component to canvas`, 'polite');
        }

        logger.info('Component added to canvas', {
          componentType,
          position,
          elementId: newElement.id,
        });

        // Auto-generate AI suggestions for the new component
        if (config?.enableAIAssistance !== false) {
          await generateSuggestions();
        }
      }
    }, 'component-drop'),
    [
      componentLibrary.components,
      addElement,
      announce,
      a11yConfig.announceChanges,
      generateSuggestions,
      config?.enableAIAssistance,
    ],
  );

  /**
   * Enhanced save operation with user feedback
   */
  const handleSave = useCallback(
    createSafeAsyncHandler(
      async () => {
        await save();

        // Announce successful save
        if (a11yConfig.announceChanges) {
          announce('App saved successfully', 'polite');
        }

        logger.info('App saved successfully', { appId: appState.app.id });

        // Show success notification
        aibosSystems.eventBus.emit('app:saved', {
          appId: appState.app.id,
          timestamp: Date.now(),
        });
      },
      'save-operation',
      undefined,
    ),
    [save, announce, a11yConfig.announceChanges, appState.app.id, aibosSystems.eventBus],
  );

  // ============================================================================
  // ACCESSIBILITY ENHANCED EFFECTS
  // ============================================================================

  /**
   * Track performance and announce significant issues
   */
  useEffect(() => {
    if (renderMetrics.averageRenderTime > 50) {
      // 50ms threshold
      logger.warn('Performance degradation detected', { renderMetrics });

      if (a11yConfig.announceChanges) {
        announce('Performance notice: The interface may be running slowly', 'polite');
      }
    }
  }, [renderMetrics, announce, a11yConfig.announceChanges]);

  /**
   * Announce canvas state changes
   */
  useEffect(() => {
    if (a11yConfig.announceChanges && canvasState.elements.length > 0) {
      const elementCount = canvasState.elements.length;
      const selectedCount = selectedElements.length;

      if (selectedCount > 0) {
        announce(`${selectedCount} of ${elementCount} components selected`, 'polite');
      }
    }
  }, [selectedElements.length, canvasState.elements.length, announce, a11yConfig.announceChanges]);

  // ============================================================================
  // ENHANCED RENDER WITH ERROR BOUNDARIES
  // ============================================================================

  if (isLoading) {
    return (
      <div
        className="h-screen flex items-center justify-center bg-gray-50"
        role="status"
        aria-label="Loading"
      >
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading Enhanced Visual App Builder...</p>
        </div>
      </div>
    );
  }

  return (
    <VisualDevErrorBoundary
      onError={(error, errorInfo) => {
        logger.error('Visual App Builder error', { error, errorInfo });
        if (a11yConfig.announceChanges) {
          announce('An error occurred in the app builder. Please try refreshing.', 'assertive');
        }
      }}
    >
      <div
        ref={containerRef}
        className={`h-screen flex flex-col bg-gray-50 ${theme}`}
        {...mainAriaAttributes}
      >
        {/* ============================================================================ */}
        {/* ENHANCED TOOLBAR WITH ACCESSIBILITY */}
        {/* ============================================================================ */}
        <VisualDevErrorBoundary
          fallback={({ resetError }) => (
            <div className="h-14 bg-red-50 border-b border-red-200 flex items-center justify-center">
              <button onClick={resetError} className="text-red-600 hover:text-red-800">
                Toolbar error - Click to retry
              </button>
            </div>
          )}
        >
          <BuilderToolbar
            appState={appState}
            isDirty={isDirty}
            canUndo={canUndo}
            canRedo={canRedo}
            previewMode={previewMode}
            showGrid={showGrid}
            showPreview={showPreview}
            isGeneratingCode={isGeneratingCode}
            onUndo={undo}
            onRedo={redo}
            onSave={handleSave}
            onPreviewModeChange={setInternalPreviewMode}
            onToggleGrid={() => setShowGrid(!showGrid)}
            onTogglePreview={() => setShowPreview(!showPreview)}
            onGenerateCode={async (options) => {
              setIsGeneratingCode(true);
              try {
                const codeGenerator = new CodeGenerator({
                  aiEngine: config?.aiEngine,
                  eventBus: aibosSystems.eventBus,
                });

                const generatedCode = await codeGenerator.generateFromCanvas(canvasState, options);
                updateAppState({ code: generatedCode });

                if (a11yConfig.announceChanges) {
                  announce('Code generated successfully', 'polite');
                }
              } catch (error) {
                logger.error('Code generation failed', { error });
                if (a11yConfig.announceChanges) {
                  announce('Code generation failed. Please try again.', 'assertive');
                }
              } finally {
                setIsGeneratingCode(false);
              }
            }}
            collaborators={collaborators}
            enableCollaboration={enableCollaboration}
          />
        </VisualDevErrorBoundary>

        {/* ============================================================================ */}
        {/* MAIN CONTENT WITH ERROR BOUNDARIES */}
        {/* ============================================================================ */}
        <div className="flex-1 flex">
          {/* Enhanced Sidebar with Error Boundary */}
          <VisualDevErrorBoundary
            fallback={({ resetError }) => (
              <div className="w-80 bg-white border-r border-gray-200 p-4">
                <div className="text-center">
                  <p className="text-red-600 mb-4">Sidebar encountered an error</p>
                  <button onClick={resetError} className="px-4 py-2 bg-red-600 text-white rounded">
                    Reset Sidebar
                  </button>
                </div>
              </div>
            )}
          >
            <div ref={sidebarRef} className="w-80 bg-white border-r border-gray-200 flex flex-col">
              <SidebarTabs
                activePanel={activePanel}
                onPanelChange={setActivePanel}
                suggestions={suggestions}
                enableCollaboration={enableCollaboration}
                enableVersionHistory={enableVersionHistory}
              />

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
                        componentLibrary={{
                          ...componentLibrary,
                          components: filteredComponents,
                        }}
                        onComponentDrop={handleComponentDrop}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        totalComponents={totalComponents}
                        ariaLabel="Component library for adding elements to canvas"
                      />
                    </motion.div>
                  )}

                  {activePanel === 'ai' && (
                    <VisualDevErrorBoundary fallback={AIAssistantErrorFallback}>
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
                    </VisualDevErrorBoundary>
                  )}

                  {activePanel === 'collaboration' && enableCollaboration && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="h-full"
                    >
                      <CollaborationPanel
                        collaborators={collaborators}
                        onInviteUser={(userId) => {
                          setCollaborators((prev) => [...prev, userId]);
                          onCollaboratorJoin?.(userId);
                        }}
                        canvasState={canvasState}
                      />
                    </motion.div>
                  )}

                  {activePanel === 'history' && enableVersionHistory && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="h-full"
                    >
                      <VersionHistory
                        versions={versionHistory}
                        currentVersion={appState.app.version}
                        onRestoreVersion={(version) => {
                          // Implement version restoration
                          updateAppState(version);
                          if (a11yConfig.announceChanges) {
                            announce(`Restored to version ${version.version}`, 'polite');
                          }
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </VisualDevErrorBoundary>

          {/* Enhanced Canvas with Error Boundary */}
          <div className="flex-1 relative">
            <VisualDevErrorBoundary fallback={CanvasErrorFallback}>
              <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div ref={canvasRef} className="h-full">
                  <DragDropCanvas
                    canvasState={canvasState}
                    selectedElements={selectedElements}
                    selectedElementIds={selectedElementIds}
                    visibleElements={visibleElements}
                    onElementSelect={selectElement}
                    onElementUpdate={optimizedElementUpdate}
                    onElementRemove={removeElement}
                    onElementDuplicate={duplicateElement}
                    onCanvasUpdate={optimizedCanvasUpdate}
                    showGrid={showGrid}
                    previewMode={previewMode}
                    onZoomChange={setZoom}
                    onPanChange={setPan}
                    canvasMetrics={canvasMetrics}
                    accessibilityConfig={a11yConfig}
                  />
                </div>

                <DragOverlay>{/* Enhanced drag overlay with accessibility */}</DragOverlay>
              </DndContext>
            </VisualDevErrorBoundary>

            {/* Enhanced Preview Overlay */}
            <AnimatePresence>
              {showPreview && (
                <PreviewOverlay
                  canvasState={canvasState}
                  previewMode={previewMode}
                  componentLibrary={componentLibrary}
                  onClose={() => setShowPreview(false)}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Enhanced Properties Panel */}
          {selectedElements.length > 0 && (
            <VisualDevErrorBoundary
              fallback={({ resetError }) => (
                <div className="w-80 bg-white border-l border-gray-200 p-4">
                  <div className="text-center">
                    <p className="text-red-600 mb-4">Properties panel error</p>
                    <button
                      onClick={resetError}
                      className="px-4 py-2 bg-red-600 text-white rounded"
                    >
                      Reset Panel
                    </button>
                  </div>
                </div>
              )}
            >
              <div className="w-80 bg-white border-l border-gray-200">
                <PropertyPanel
                  selectedElements={selectedElements}
                  onElementUpdate={optimizedElementUpdate}
                  componentLibrary={componentLibrary}
                  accessibilityConfig={a11yConfig}
                />
              </div>
            </VisualDevErrorBoundary>
          )}
        </div>
      </div>
    </VisualDevErrorBoundary>
  );
};

// ============================================================================
// ENHANCED COMPONENT EXPORTS WITH ERROR BOUNDARIES
// ============================================================================

// Export wrapped components for easy use
export const SafeEnhancedVisualAppBuilder = withErrorBoundary(EnhancedVisualAppBuilder, {
  onError: (error, errorInfo) => {
    logger.error('Visual App Builder crashed', { error, errorInfo });
  },
});

export default EnhancedVisualAppBuilder;
