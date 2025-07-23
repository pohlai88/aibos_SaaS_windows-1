/**
 * AI-BOS Visual Development Interface Types
 *
 * Comprehensive type definitions for enterprise-grade visual app building
 * with strict TypeScript integration and AI-BOS shared library compatibility.
 */

import type { AppManifest, ManifestEntity, ManifestEvent } from '@aibos/shared/lib';
import type { AICodeGenerator, AIEngine } from '@aibos/shared/ai';
import type { EventBus, EventEnvelope } from '@aibos/shared/lib';

// ============================================================================
// CORE VISUAL COMPONENT TYPES
// ============================================================================

/**
 * Base visual component that can be dragged onto the canvas
 */
export interface VisualComponent {
  readonly id: string;
  readonly type: ComponentType;
  readonly category: ComponentCategory;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  readonly properties: ComponentProperties;
  readonly children?: VisualComponent[];
  readonly parentId?: string;
  readonly position: Position;
  readonly size: Size;
  readonly style: ComponentStyle;
  readonly events: ComponentEvents;
  readonly validation: ComponentValidation;
  readonly metadata: ComponentMetadata;
}

/**
 * Visual element instance on the canvas
 */
export interface VisualElement extends VisualComponent {
  readonly instanceId: string;
  readonly canvasId: string;
  readonly zIndex: number;
  readonly isSelected: boolean;
  readonly isLocked: boolean;
  readonly isVisible: boolean;
  readonly isDragging: boolean;
  readonly isResizing: boolean;
  readonly lastModified: number;
  readonly createdAt: number;
}

/**
 * Component types available in the palette
 */
export type ComponentType =
  | 'text'
  | 'button'
  | 'input'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'textarea'
  | 'image'
  | 'video'
  | 'audio'
  | 'container'
  | 'grid'
  | 'flex'
  | 'table'
  | 'list'
  | 'card'
  | 'modal'
  | 'tabs'
  | 'accordion'
  | 'sidebar'
  | 'header'
  | 'footer'
  | 'navigation'
  | 'breadcrumb'
  | 'pagination'
  | 'chart'
  | 'map'
  | 'calendar'
  | 'custom';

/**
 * Component categories for organization
 */
export type ComponentCategory =
  | 'layout'
  | 'forms'
  | 'data-display'
  | 'navigation'
  | 'feedback'
  | 'media'
  | 'charts'
  | 'advanced'
  | 'custom';

// ============================================================================
// COMPONENT PROPERTIES & CONFIGURATION
// ============================================================================

/**
 * Dynamic component properties
 */
export interface ComponentProperties {
  readonly [key: string]: ComponentProperty;
}

/**
 * Individual component property definition
 */
export interface ComponentProperty {
  readonly name: string;
  readonly type: PropertyType;
  readonly value: PropertyValue;
  readonly defaultValue: PropertyValue;
  readonly required: boolean;
  readonly options?: PropertyOption[];
  readonly validation?: PropertyValidation;
  readonly group: PropertyGroup;
  readonly description: string;
  readonly isAdvanced: boolean;
}

/**
 * Property types supported by the visual builder
 */
export type PropertyType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'color'
  | 'font'
  | 'image'
  | 'url'
  | 'json'
  | 'select'
  | 'multi-select'
  | 'slider'
  | 'date'
  | 'datetime'
  | 'code'
  | 'expression';

/**
 * Property value union type
 */
export type PropertyValue = string | number | boolean | object | null | undefined;

/**
 * Property option for select/multi-select
 */
export interface PropertyOption {
  readonly label: string;
  readonly value: PropertyValue;
  readonly description?: string;
  readonly disabled?: boolean;
}

/**
 * Property validation rules
 */
export interface PropertyValidation {
  readonly min?: number;
  readonly max?: number;
  readonly pattern?: string;
  readonly custom?: (value: PropertyValue) => string | null;
}

/**
 * Property grouping for UI organization
 */
export type PropertyGroup = 'general' | 'style' | 'layout' | 'behavior' | 'data' | 'advanced';

// ============================================================================
// POSITIONING & STYLING
// ============================================================================

/**
 * Component position on canvas
 */
export interface Position {
  readonly x: number;
  readonly y: number;
}

/**
 * Component dimensions
 */
export interface Size {
  readonly width: number;
  readonly height: number;
}

/**
 * Component styling properties
 */
export interface ComponentStyle {
  readonly backgroundColor?: string;
  readonly color?: string;
  readonly fontSize?: string;
  readonly fontFamily?: string;
  readonly fontWeight?: string;
  readonly textAlign?: 'left' | 'center' | 'right' | 'justify';
  readonly border?: string;
  readonly borderRadius?: string;
  readonly padding?: string;
  readonly margin?: string;
  readonly boxShadow?: string;
  readonly opacity?: number;
  readonly transform?: string;
  readonly transition?: string;
  readonly [key: string]: string | number | undefined;
}

// ============================================================================
// EVENTS & INTERACTIONS
// ============================================================================

/**
 * Component event handlers
 */
export interface ComponentEvents {
  readonly onClick?: EventHandler;
  readonly onDoubleClick?: EventHandler;
  readonly onMouseEnter?: EventHandler;
  readonly onMouseLeave?: EventHandler;
  readonly onFocus?: EventHandler;
  readonly onBlur?: EventHandler;
  readonly onChange?: EventHandler;
  readonly onSubmit?: EventHandler;
  readonly [key: string]: EventHandler | undefined;
}

/**
 * Event handler definition
 */
export interface EventHandler {
  readonly type: EventHandlerType;
  readonly action: string;
  readonly parameters: Record<string, PropertyValue>;
  readonly condition?: string;
  readonly preventDefault?: boolean;
  readonly stopPropagation?: boolean;
}

/**
 * Types of event handlers
 */
export type EventHandlerType =
  | 'navigate'
  | 'api-call'
  | 'state-update'
  | 'emit-event'
  | 'custom-function'
  | 'show-modal'
  | 'validation'
  | 'ai-action';

// ============================================================================
// CANVAS & BUILDER STATE
// ============================================================================

/**
 * Canvas state containing all visual elements
 */
export interface CanvasState {
  readonly id: string;
  readonly name: string;
  readonly elements: VisualElement[];
  readonly selectedElementIds: string[];
  readonly clipboard: VisualElement[];
  readonly history: CanvasHistoryEntry[];
  readonly historyIndex: number;
  readonly zoom: number;
  readonly pan: Position;
  readonly gridEnabled: boolean;
  readonly snapToGrid: boolean;
  readonly showRulers: boolean;
  readonly showGuides: boolean;
  readonly previewMode: PreviewMode;
  readonly lastSaved: number;
  readonly isDirty: boolean;
}

/**
 * Canvas history entry for undo/redo
 */
export interface CanvasHistoryEntry {
  readonly id: string;
  readonly action: string;
  readonly timestamp: number;
  readonly elements: VisualElement[];
  readonly description: string;
}

/**
 * Preview modes for the canvas
 */
export type PreviewMode = 'design' | 'preview' | 'mobile' | 'tablet' | 'desktop' | 'fullscreen';

// ============================================================================
// BUILDER CONFIGURATION
// ============================================================================

/**
 * Visual app builder configuration
 */
export interface BuilderConfig {
  readonly aiEngine: AIEngine;
  readonly eventBus: EventBus;
  readonly componentLibrary: ComponentLibrary;
  readonly enableAIAssistance: boolean;
  readonly enableCollaboration: boolean;
  readonly enablePreview: boolean;
  readonly enableCodeGeneration: boolean;
  readonly autoSave: boolean;
  readonly autoSaveInterval: number;
  readonly maxHistoryEntries: number;
  readonly gridSize: number;
  readonly snapThreshold: number;
  readonly theme: BuilderTheme;
}

/**
 * Builder theme configuration
 */
export interface BuilderTheme {
  readonly primary: string;
  readonly secondary: string;
  readonly background: string;
  readonly surface: string;
  readonly text: string;
  readonly border: string;
  readonly success: string;
  readonly warning: string;
  readonly error: string;
}

// ============================================================================
// COMPONENT LIBRARY
// ============================================================================

/**
 * Component library containing available components
 */
export interface ComponentLibrary {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly components: ComponentDefinition[];
  readonly categories: ComponentCategoryDefinition[];
  readonly templates: ComponentTemplate[];
}

/**
 * Component definition in the library
 */
export interface ComponentDefinition {
  readonly id: string;
  readonly type: ComponentType;
  readonly category: ComponentCategory;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  readonly defaultProperties: ComponentProperties;
  readonly allowedChildren?: ComponentType[];
  readonly maxChildren?: number;
  readonly requiredParent?: ComponentType[];
  readonly isContainer: boolean;
  readonly isResizable: boolean;
  readonly isDraggable: boolean;
  readonly previewComponent: string;
  readonly codeTemplate: string;
}

/**
 * Component category definition
 */
export interface ComponentCategoryDefinition {
  readonly id: ComponentCategory;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  readonly order: number;
}

/**
 * Pre-built component template
 */
export interface ComponentTemplate {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly preview: string;
  readonly components: VisualComponent[];
  readonly category: string;
  readonly tags: string[];
}

// ============================================================================
// AI ASSISTANCE TYPES
// ============================================================================

/**
 * AI Assistant configuration
 */
export interface AIAssistantConfig {
  readonly enabled: boolean;
  readonly autoSuggestions: boolean;
  readonly layoutOptimization: boolean;
  readonly codeGeneration: boolean;
  readonly contextAnalysis: boolean;
  readonly suggestionsThreshold: number;
  readonly maxSuggestions: number;
}

/**
 * AI component suggestion
 */
export interface AISuggestion {
  readonly id: string;
  readonly type: AISuggestionType;
  readonly title: string;
  readonly description: string;
  readonly confidence: number;
  readonly action: AISuggestionAction;
  readonly previewUrl?: string;
  readonly reasoning: string;
}

/**
 * Types of AI suggestions
 */
export type AISuggestionType =
  | 'component-addition'
  | 'layout-improvement'
  | 'style-enhancement'
  | 'accessibility-fix'
  | 'performance-optimization'
  | 'ux-improvement'
  | 'content-suggestion';

/**
 * AI suggestion action
 */
export interface AISuggestionAction {
  readonly type: 'add-component' | 'modify-component' | 'apply-style' | 'restructure-layout';
  readonly target?: string;
  readonly changes: Record<string, PropertyValue>;
  readonly newComponents?: VisualComponent[];
}

// ============================================================================
// CODE GENERATION TYPES
// ============================================================================

/**
 * Code generation options
 */
export interface CodeGenerationOptions {
  readonly framework: 'react' | 'vue' | 'angular' | 'svelte' | 'vanilla';
  readonly language: 'typescript' | 'javascript';
  readonly styleFramework: 'tailwind' | 'styled-components' | 'css-modules' | 'emotion';
  readonly includeTests: boolean;
  readonly includeStorybook: boolean;
  readonly includeAccessibility: boolean;
  readonly optimizeForPerformance: boolean;
  readonly generateManifest: boolean;
}

/**
 * Generated code output
 */
export interface GeneratedCode {
  readonly components: GeneratedCodeFile[];
  readonly styles: GeneratedCodeFile[];
  readonly tests: GeneratedCodeFile[];
  readonly stories: GeneratedCodeFile[];
  readonly manifest: AppManifest;
  readonly packageJson: object;
  readonly buildCommand: string;
}

/**
 * Individual generated code file
 */
export interface GeneratedCodeFile {
  readonly path: string;
  readonly content: string;
  readonly type: 'component' | 'style' | 'test' | 'story' | 'config';
  readonly language: string;
}

// ============================================================================
// MANIFEST GENERATION TYPES
// ============================================================================

/**
 * Manifest generation options
 */
export interface ManifestGenerationOptions {
  readonly includeEntities: boolean;
  readonly includeEvents: boolean;
  readonly includePermissions: boolean;
  readonly includeValidation: boolean;
  readonly generateAPI: boolean;
  readonly generateDatabase: boolean;
  readonly optimizeForDeployment: boolean;
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

/**
 * Component validation rules
 */
export interface ComponentValidation {
  readonly required: boolean;
  readonly minChildren?: number;
  readonly maxChildren?: number;
  readonly allowedParents?: ComponentType[];
  readonly customRules?: ValidationRule[];
}

/**
 * Custom validation rule
 */
export interface ValidationRule {
  readonly name: string;
  readonly message: string;
  readonly validator: (component: VisualComponent, context: CanvasState) => boolean;
}

/**
 * Validation result
 */
export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: ValidationError[];
  readonly warnings: ValidationWarning[];
}

/**
 * Validation error
 */
export interface ValidationError {
  readonly componentId: string;
  readonly rule: string;
  readonly message: string;
  readonly severity: 'error' | 'warning' | 'info';
}

/**
 * Validation warning
 */
export interface ValidationWarning {
  readonly componentId: string;
  readonly rule: string;
  readonly message: string;
  readonly suggestion?: string;
}

// ============================================================================
// METADATA & TRACKING
// ============================================================================

/**
 * Component metadata for tracking and analytics
 */
export interface ComponentMetadata {
  readonly createdBy: string;
  readonly createdAt: number;
  readonly lastModifiedBy: string;
  readonly lastModifiedAt: number;
  readonly version: string;
  readonly tags: string[];
  readonly notes: string;
  readonly analytics: ComponentAnalytics;
}

/**
 * Component analytics data
 */
export interface ComponentAnalytics {
  readonly usageCount: number;
  readonly performanceScore: number;
  readonly accessibilityScore: number;
  readonly userRating: number;
  readonly lastUsed: number;
}

// ============================================================================
// VISUAL APP STATE
// ============================================================================

/**
 * Complete visual app state
 */
export interface VisualAppState {
  readonly app: {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly version: string;
    readonly author: string;
  };
  readonly canvas: CanvasState;
  readonly manifest: AppManifest;
  readonly code: GeneratedCode;
  readonly ai: {
    readonly suggestions: AISuggestion[];
    readonly isAnalyzing: boolean;
    readonly lastAnalysis: number;
  };
  readonly collaboration: {
    readonly isEnabled: boolean;
    readonly activeUsers: string[];
    readonly cursors: Record<string, Position>;
  };
  readonly deployment: {
    readonly status: 'draft' | 'building' | 'deployed' | 'error';
    readonly url?: string;
    readonly lastDeployed?: number;
    readonly buildLogs: string[];
  };
}
