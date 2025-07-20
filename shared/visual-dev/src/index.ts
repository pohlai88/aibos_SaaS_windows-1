/**
 * AI-BOS Visual Development Interface
 *
 * Enterprise-grade visual app builder with drag-drop interface,
 * real-time preview, AI assistance, and seamless manifest generation.
 */

// ============================================================================
// CORE VISUAL BUILDER
// ============================================================================

export { VisualAppBuilder } from './builder/VisualAppBuilder';
export { DragDropCanvas } from './canvas/DragDropCanvas';
export { ComponentPalette } from './palette/ComponentPalette';
export { PropertyPanel } from './properties/PropertyPanel';

// ============================================================================
// REAL-TIME PREVIEW
// ============================================================================

export { LivePreview } from './preview/LivePreview';
export { PreviewFrame } from './preview/PreviewFrame';
export { PreviewControls } from './preview/PreviewControls';

// ============================================================================
// AI ASSISTANCE
// ============================================================================

export { AIVisualAssistant } from './ai-assistant/AIVisualAssistant';
export { AIComponentSuggestions } from './ai-assistant/AIComponentSuggestions';
export { AILayoutOptimizer } from './ai-assistant/AILayoutOptimizer';

// ============================================================================
// MANIFEST INTEGRATION
// ============================================================================

export { VisualManifestBuilder } from './manifest/VisualManifestBuilder';
export { ManifestPreview } from './manifest/ManifestPreview';
export { CodeGenerator } from './codegen/CodeGenerator';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type {
  VisualComponent,
  VisualElement,
  CanvasState,
  BuilderConfig,
  PreviewMode,
  AIAssistantConfig,
  ComponentLibrary,
  VisualAppState,
  CodeGenerationOptions,
  ManifestGenerationOptions,
} from './types';

// ============================================================================
// HOOKS & UTILITIES
// ============================================================================

export { useVisualBuilder } from './hooks/useVisualBuilder';
export { useCanvasState } from './hooks/useCanvasState';
export { useAIAssistant } from './hooks/useAIAssistant';
export { usePreview } from './hooks/usePreview';

// ============================================================================
// VALIDATION & SCHEMAS
// ============================================================================

export { visualComponentSchema, canvasStateSchema } from './validation/schemas';
export { validateVisualApp, validateComponent } from './validation/validators';

// ============================================================================
// CONSTANTS & DEFAULTS
// ============================================================================

export {
  DEFAULT_BUILDER_CONFIG,
  COMPONENT_CATEGORIES,
  LAYOUT_TEMPLATES,
  AI_SUGGESTIONS_CONFIG,
} from './constants';

// ============================================================================
// VERSION INFO
// ============================================================================

export const VISUAL_DEV_VERSION = '1.0.0';
export const VISUAL_DEV_INFO = {
  name: 'AI-BOS Visual Development Interface',
  version: VISUAL_DEV_VERSION,
  description: 'Enterprise-grade visual app builder with AI assistance',
  features: [
    'Drag & Drop Interface',
    'Real-time Preview',
    'AI-Powered Assistance',
    'Manifest Generation',
    'Code Generation',
    'Component Library',
    'Layout Templates',
    'Live Collaboration',
  ],
};
