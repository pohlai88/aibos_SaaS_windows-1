/**
 * AI-BOS Enterprise UI Components - Core Types
 * ISO27001, GDPR, SOC2, HIPAA compliant React components
 *
 * @author AI-BOS Team
 * @version 1.0.0
 * @license MIT
 */

// ============================================================================
// ENTERPRISE COMPLIANCE TYPES
// ============================================================================

/**
 * ISO27001 Information Security Management System
 */
export interface ISO27001Compliance {
  informationSecurity: boolean;
  riskAssessment: boolean;
  accessControl: boolean;
  assetManagement: boolean;
  incidentManagement: boolean;
  businessContinuity: boolean;
  supplierRelationships: boolean
}

/**
 * GDPR Data Protection Compliance
 */
export interface GDPRCompliance {
  dataProtection: boolean;
  userConsent: boolean;
  dataPortability: boolean;
  rightToErasure: boolean;
  dataMinimization: boolean;
  purposeLimitation: boolean;
  accountability: boolean
}

/**
 * SOC2 Trust Service Criteria
 */
export interface SOC2Compliance {
  security: boolean;
  availability: boolean;
  processingIntegrity: boolean;
  confidentiality: boolean;
  privacy: boolean
}

/**
 * HIPAA Healthcare Compliance
 */
export interface HIPAACompliance {
  privacyRule: boolean;
  securityRule: boolean;
  breachNotification: boolean;
  administrativeSafeguards: boolean;
  physicalSafeguards: boolean;
  technicalSafeguards: boolean
}

/**
 * Complete Enterprise Compliance Framework
 */
export interface EnterpriseCompliance {
  iso27001: ISO27001Compliance;
  gdpr: GDPRCompliance;
  soc2: SOC2Compliance;
  hipaa: HIPAACompliance
}

// ============================================================================
// SECURITY TYPES
// ============================================================================

/**
 * Zero-Trust Security Configuration
 */
export interface SecurityConfig {
  encryptionLevel: 'none' | 'standard' | 'high' | 'military';
  auditTrail: boolean;
  accessControl: 'role-based' | 'attribute-based' | 'policy-based';
  dataClassification: 'public' | 'internal' | 'confidential' | 'restricted';
  sessionManagement: boolean;
  inputValidation: boolean;
  outputEncoding: boolean
}

/**
 * Access Control Levels
 */
export type AccessLevel =
  | 'public'
  | 'authenticated'
  | 'authorized'
  | 'admin'
  | 'super-admin';

/**
 * Data Classification Levels
 */
export type DataClassification =
  | 'public'
  | 'internal'
  | 'confidential'
  | 'restricted';

// ============================================================================
// PERFORMANCE TYPES
// ============================================================================

/**
 * Component Performance Profile
 */
export interface PerformanceProfile {
  renderPriority: 'critical' | 'high' | 'medium' | 'low';
  hydrationStrategy: 'eager' | 'lazy' | 'static';
  memoryFootprint: number; // KB
  virtualization: boolean;
  memoization: boolean;
  lazyLoading: boolean;
  codeSplitting: boolean;
  bundleOptimization: boolean
}

/**
 * Performance Metrics
 */
export interface PerformanceMetrics {
  renderTime: number; // ms
  memoryUsage: number; // KB
  bundleSize: number; // KB
  interactionLatency: number; // ms
  accessibilityScore: number; // 0-100
  complianceScore: number; // 0-100
}

// ============================================================================
// ACCESSIBILITY TYPES
// ============================================================================

/**
 * WCAG 2.1 AA Compliance
 */
export interface AccessibilityConfig {
  wcag21AA: boolean;
  screenReaderSupport: boolean;
  keyboardNavigation: boolean;
  colorContrast: boolean;
  focusManagement: boolean;
  semanticHTML: boolean;
  ariaLabels: boolean;
  motionReduction: boolean
}

/**
 * Accessibility Features
 */
export interface AccessibilityFeatures {
  role: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  ariaLabelledBy?: string;
  tabIndex?: number;
  focusable: boolean;
  keyboardShortcuts?: string[]
}

// ============================================================================
// PURPOSE-DRIVEN ARCHITECTURE
// ============================================================================

/**
 * UI Component Purpose Classification
 */
export type UIComponentPurpose =
  | 'data-display'
  | 'data-input'
  | 'action'
  | 'navigation'
  | 'feedback'
  | 'layout'
  | 'ai-powered'
  | 'analytics'
  | 'compliance'
  | 'security';

/**
 * Component Purpose Configuration
 */
export interface PurposeConfig {
  purpose: UIComponentPurpose;
  optimizationStrategy: 'performance' | 'accessibility' | 'security' | 'compliance';
  targetAudience: 'end-user' | 'admin' | 'developer' | 'auditor';
  useCase: string[];
  complexity: 'simple' | 'moderate' | 'complex'
}

// ============================================================================
// CORE ENTERPRISE COMPONENT INTERFACE
// ============================================================================

/**
 * Enterprise Component Metadata
 */
export interface ComponentMetadata {
  id: string;
  name: string;
  version: string;
  author: string;
  contributors: string[];
  description: string;
  keywords: string[];
  lastModified: Date;
  dependencies: string[];
  peerDependencies: string[]
}

/**
 * Testing Configuration
 */
export interface TestingConfig {
  unitTests: boolean;
  integrationTests: boolean;
  e2eTests: boolean;
  accessibilityTests: boolean;
  performanceTests: boolean;
  securityTests: boolean;
  complianceTests: boolean;
  coverageThreshold: number; // 0-100
}

/**
 * Documentation Configuration
 */
export interface DocumentationConfig {
  apiDocs: boolean;
  usageExamples: boolean;
  accessibilityGuide: boolean;
  complianceGuide: boolean;
  performanceGuide: boolean;
  securityGuide: boolean;
  migrationGuide: boolean
}

/**
 * Main Enterprise Component Interface
 */
export interface EnterpriseComponent<P = {}> {
  // Component Identity
  metadata: ComponentMetadata;

  // Purpose-Driven Design
  purpose: PurposeConfig;
  performanceProfile: PerformanceProfile;

  // Enterprise Compliance
  compliance: EnterpriseCompliance;
  security: SecurityConfig;
  accessibility: AccessibilityConfig;

  // Quality Assurance
  testing: TestingConfig;
  documentation: DocumentationConfig;

  // Props Interface
  props: P
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Component Variant Configuration
 */
export interface ComponentVariants {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'primary' | 'secondary' | 'danger' | 'warning' | 'success';
  state?: 'default' | 'hover' | 'focus' | 'active' | 'disabled' | 'loading'
}

/**
 * Event Handler Types
 */
export interface EventHandlers {
  onClick?: (event: React.MouseEvent) => void;
  onChange?: (event: React.ChangeEvent) => void;
  onSubmit?: (event: React.FormEvent) => void;
  onFocus?: (event: React.FocusEvent) => void;
  onBlur?: (event: React.FocusEvent) => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  onKeyUp?: (event: React.KeyboardEvent) => void
}

/**
 * Common Props Interface
 */
export interface CommonProps extends ComponentVariants, EventHandlers {
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  'data-testid'?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  disabled?: boolean;
  loading?: boolean;
  children?: React.ReactNode
}

// ============================================================================
// COMPLIANCE VALIDATION TYPES
// ============================================================================

/**
 * Compliance Validation Result
 */
export interface ComplianceValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
  score: number; // 0-100
}

/**
 * Security Validation Result
 */
export interface SecurityValidation {
  isSecure: boolean;
  vulnerabilities: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  score: number; // 0-100
}

/**
 * Accessibility Validation Result
 */
export interface AccessibilityValidation {
  isAccessible: boolean;
  violations: string[];
  warnings: string[];
  recommendations: string[];
  score: number; // 0-100
}

// ============================================================================
// EXPORT ALL TYPES
// ============================================================================

// All types are already exported above
