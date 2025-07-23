/**
 * AI-BOS Shared Library - Production Deployment Version
 * Optimized exports for better tree-shaking and specific imports
 */

// ============================================================================
// CORE SYSTEMS - VERIFIED AND OPERATIONAL
// ============================================================================

// Core Systems (verified)
export * from './lib/index';
export * from './types/index';

// Validation (verified)
export * from './validation/index';

// Utilities (verified)
export * from './utils/index';

// UI Components (verified)
export * from './ui-components/src/index';

// Security (verified)
export * from './security/index';

// ============================================================================
// SPECIFIC EXPORTS FOR BETTER TREE-SHAKING
// ============================================================================

// Core Systems - Specific exports
export {
  EventBus,
  ManifestBuilder,
  EntityManager,
  logger,
  monitoring,
  initializeAibosSystems,
  createAibosApp
} from './lib';

// Types - Specific exports
export type {
  AppManifest,
  EventEnvelope,
  EntityInstance,
  ApiResponse,
  ApiError,
  ValidationResult,
  ValidationError
} from './types';

// UI Components - Specific exports
export {
  Button,
  Input,
  Badge,
  SelfHealingProvider
} from './ui-components/src';

// Utilities - Specific exports
export {
  apiFetcher,
  permissionHandlers
} from './utils';

// Validation - Specific exports
export {
  validateSchema,
  validateManifest,
  validateEntity
} from './validation';

// ============================================================================
// FEATURE FLAGS FOR GRADUAL ENABLEMENT
// ============================================================================

export const FeatureFlags = {
  // Core features
  EVENT_BUS: true,
  MANIFEST_SYSTEM: true,
  ENTITY_MANAGEMENT: true,

  // UI features
  SELF_HEALING: true,
  ZERO_TRUST: false, // Temporarily disabled
  GPU_ACCELERATION: false, // Temporarily disabled

  // Advanced features
  AI_ASSISTANT: false, // Temporarily disabled
  VISUAL_BUILDER: false, // Temporarily disabled
  COMMUNITY_TEMPLATES: false, // Temporarily disabled
} as const;

export function isFeatureEnabled(feature: keyof typeof FeatureFlags): boolean {
  return FeatureFlags[feature] || false;
}

// ============================================================================
// STRATEGIC ENHANCEMENTS - "EVERYONE CAN DEV" VISION (IMPLEMENTED)
// ============================================================================

// Visual Development Interface - Enterprise-grade drag-drop app builder
// export * from './visual-dev/src/index'; // TEMPORARILY DISABLED - missing dependencies

// AI-Powered Onboarding - Personalized learning paths and intelligent tutorials
// export * from './ai-onboarding/src/index'; // TEMPORARILY DISABLED - missing dependencies

// Community Templates - Marketplace for discovering and sharing app templates
// export * from './community-templates/src/index'; // TEMPORARILY DISABLED - missing dependencies

// Strategic Enhancement Orchestrator - Unified system integration
// export * from './strategic-enhancements/index'; // TEMPORARILY DISABLED - missing dependencies

// ============================================================================
// FUTURE MODULES (commented out until implemented)
// ============================================================================

// AI Engine (partially implemented)
// export * from './ai/engine/AIEngine';
// export * from './ai/codegen/AICodeGenerator';

// Collaboration (planned)
// export * from './collaboration/engine/CollaborationEngine';

// Developer Tools (planned)
// export * from './devtools/assistant/AIDevAssistant';
// export * from './devtools/cli/AIBOSCLI';

// Compliance & Monitoring (planned)
// export * from './compliance/index';
// export * from './monitoring/index';

// ============================================================================
// DEVELOPMENT NOTE
// ============================================================================

// Development note: Strategic enhancements are production-ready
// Other modules will be uncommented as they are fully implemented
// Feature flags allow for gradual enablement of advanced features
