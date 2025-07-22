/**
 * AI-BOS Unified Type Definitions
 * Centralized type definitions for consistent typing across frontend/backend
 */

import type { AppManifest, EventEnvelope, EntityInstance } from './index';
import type { ApiResponse, ApiError } from './api';
import type { ValidationResult, ValidationError } from '../validation';

// ============================================================================
// CORE TYPE DEFINITIONS
// ============================================================================

/**
 * Unified type definitions for AI-BOS platform
 */
export interface AibosSharedTypes {
  // Core types
  AppManifest: AppManifest;
  EventEnvelope: EventEnvelope;
  EntityInstance: EntityInstance;

  // API types
  ApiResponse: ApiResponse<any>;
  ApiError: ApiError;

  // Validation types
  ValidationResult: ValidationResult;
  ValidationError: ValidationError;

  // UI types
  ComponentProps: ComponentProps;
  ThemeConfig: ThemeConfig;

  // System types
  SystemConfig: SystemConfig;
  FeatureFlags: FeatureFlags;
}

// ============================================================================
// UI TYPE DEFINITIONS
// ============================================================================

export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  error?: string;
  [key: string]: any;
}

export interface ThemeConfig {
  mode: 'light' | 'dark' | 'system';
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  border: string;
  radius: number;
}

// ============================================================================
// SYSTEM TYPE DEFINITIONS
// ============================================================================

export interface SystemConfig {
  environment: 'development' | 'staging' | 'production';
  version: string;
  features: FeatureFlags;
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
  database: {
    type: 'supabase' | 'postgresql' | 'mysql';
    url: string;
    poolSize: number;
  };
  monitoring: {
    enabled: boolean;
    level: 'debug' | 'info' | 'warn' | 'error';
  };
}

export interface FeatureFlags {
  // Core features
  EVENT_BUS: boolean;
  MANIFEST_SYSTEM: boolean;
  ENTITY_MANAGEMENT: boolean;

  // UI features
  SELF_HEALING: boolean;
  ZERO_TRUST: boolean;
  GPU_ACCELERATION: boolean;

  // Advanced features
  AI_ASSISTANT: boolean;
  VISUAL_BUILDER: boolean;
  COMMUNITY_TEMPLATES: boolean;
}

// ============================================================================
// INTEGRATION TYPE DEFINITIONS
// ============================================================================

export interface SharedIntegrationConfig {
  // Frontend integration
  frontend: {
    components: {
      Button: boolean;
      Input: boolean;
      Badge: boolean;
      SelfHealingProvider: boolean;
    };
    utilities: {
      apiFetcher: boolean;
      permissionHandlers: boolean;
    };
  };

  // Backend integration
  backend: {
    systems: {
      EventBus: boolean;
      ManifestBuilder: boolean;
      EntityManager: boolean;
    };
    utilities: {
      logger: boolean;
      monitoring: boolean;
      validation: boolean;
    };
  };
}

// ============================================================================
// VALIDATION TYPE DEFINITIONS
// ============================================================================

export interface ValidationConfig {
  schema: {
    strict: boolean;
    allowUnknown: boolean;
    abortEarly: boolean;
  };
  manifest: {
    validateCompliance: boolean;
    validateSecurity: boolean;
    validatePerformance: boolean;
  };
  entity: {
    validateConstraints: boolean;
    validateRelationships: boolean;
    validatePermissions: boolean;
  };
}

// ============================================================================
// MONITORING TYPE DEFINITIONS
// ============================================================================

export interface MonitoringConfig {
  performance: {
    enabled: boolean;
    threshold: number;
    sampling: number;
  };
  errors: {
    enabled: boolean;
    captureUnhandled: boolean;
    maxErrors: number;
  };
  analytics: {
    enabled: boolean;
    anonymize: boolean;
    retention: number;
  };
}

// ============================================================================
// EXPORT ALL TYPES
// ============================================================================

export type {
  AibosSharedTypes,
  ComponentProps,
  ThemeConfig,
  SystemConfig,
  FeatureFlags,
  SharedIntegrationConfig,
  ValidationConfig,
  MonitoringConfig,
};
