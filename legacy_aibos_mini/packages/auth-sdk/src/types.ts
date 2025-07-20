import { UserContext } from '@aibos/core-types';

// Auth SDK Types
// Multi-tenant authentication and authorization

import { 
  User, 
  Organization, 
  OrganizationUser 
} from '@aibos/database';

// User Roles
export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  ACCOUNTANT = 'accountant',
  USER = 'user',
  VIEWER = 'viewer'
}

// Permission Types
export enum PermissionType {
  READ = 'read',
  WRITE = 'write',
  DELETE = 'delete',
  ADMIN = 'admin'
}

// Resource Types
export enum ResourceType {
  ORGANIZATION = 'organization',
  CHART_OF_ACCOUNTS = 'chart_of_accounts',
  JOURNAL_ENTRIES = 'journal_entries',
  GENERAL_LEDGER = 'general_ledger',
  CUSTOMERS = 'customers',
  VENDORS = 'vendors',
  INVOICES = 'invoices',
  BILLS = 'bills',
  PAYMENTS = 'payments',
  REPORTS = 'reports',
  USERS = 'users',
  SETTINGS = 'settings'
}

// Authentication Status
export enum AuthStatus {
  AUTHENTICATED = 'authenticated',
  UNAUTHENTICATED = 'unauthenticated',
  LOADING = 'loading'
}

// Session Information
export interface Session {
  id: string;
  userId: string;
  organizationId: string;
  role: UserRole;
  permissions: Permission[];
  expiresAt: Date;
  createdAt: Date;
}

// Permission Definition
export interface Permission {
  resource: ResourceType;
  action: PermissionType;
  conditions?: Record<string, any>;
}

// User Context

// Organization Context
export interface OrganizationContext {
  organization: Organization;
  users: OrganizationUser[];
  settings: OrganizationSettings;
  permissions: Permission[];
}

// Organization Settings
export interface OrganizationSettings {
  features: {
    multiCurrency: boolean;
    multiLocation: boolean;
    advancedReporting: boolean;
    workflowAutomation: boolean;
    auditLogging: boolean;
  };
  security: {
    passwordPolicy: PasswordPolicy;
    sessionTimeout: number;
    mfaRequired: boolean;
    ipWhitelist?: string[];
  };
  accounting: {
    fiscalYearStart: string;
    baseCurrency: string;
    decimalPlaces: number;
    autoNumbering: boolean;
  };
}

// Password Policy
export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxAge: number; // days
}

// Authentication Request
export interface AuthRequest {
  email: string;
  password: string;
  organizationId?: string;
  rememberMe?: boolean;
}

// Registration Request
export interface RegistrationRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationName: string;
  organizationSettings?: Partial<OrganizationSettings>;
}

// Password Reset Request
export interface PasswordResetRequest {
  email: string;
  organizationId?: string;
}

// Password Change Request
export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Organization Invitation
export interface OrganizationInvitation {
  id: string;
  organizationId: string;
  email: string;
  role: UserRole;
  invitedBy: string;
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'expired';
  createdAt: Date;
}

// Audit Log Entry
export interface AuthAuditLog {
  id: string;
  userId: string;
  organizationId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

// SSO Configuration
export interface SSOConfig {
  provider: 'google' | 'microsoft' | 'saml' | 'oidc';
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  scopes: string[];
  metadata?: Record<string, any>;
}

// MFA Configuration
export interface MFAConfig {
  enabled: boolean;
  method: 'totp' | 'sms' | 'email';
  backupCodes: string[];
  lastUsed?: Date;
}

// API Key
export interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: Permission[];
  expiresAt?: Date;
  lastUsed?: Date;
  createdAt: Date;
}

// Authentication Error
export interface AuthError {
  code: string;
  message: string;
  field?: string;
  severity: 'error' | 'warning' | 'info';
}

// Validation Result
export interface AuthValidationResult {
  isValid: boolean;
  errors: AuthError[];
  warnings: AuthError[];
}

// Login Result
export interface LoginResult {
  success: boolean;
  session?: Session;
  user?: User;
  organization?: Organization;
  errors: AuthError[];
  warnings: AuthError[];
}

// Registration Result
export interface RegistrationResult {
  success: boolean;
  user?: User;
  organization?: Organization;
  session?: Session;
  errors: AuthError[];
  warnings: AuthError[];
}

// Permission Check Result
export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
  conditions?: Record<string, any>;
}

// Organization Switch Result
export interface OrganizationSwitchResult {
  success: boolean;
  organization?: Organization;
  role?: UserRole;
  permissions?: Permission[];
  errors: AuthError[];
}

// User Profile Update
export interface UserProfileUpdate {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
  timezone?: string;
  language?: string;
}

// Organization Update
export interface OrganizationUpdate {
  name?: string;
  legalName?: string;
  taxId?: string;
  address?: Record<string, any>;
  contactInfo?: Record<string, any>;
  settings?: Partial<OrganizationSettings>;
}

// Role Assignment
export interface RoleAssignment {
  userId: string;
  organizationId: string;
  role: UserRole;
  permissions?: Permission[];
  assignedBy: string;
  assignedAt: Date;
}

// Session Management
export interface SessionManagement {
  activeSessions: Session[];
  maxSessions: number;
  sessionTimeout: number;
}

// Security Settings
export interface SecuritySettings {
  passwordPolicy: PasswordPolicy;
  sessionTimeout: number;
  mfaRequired: boolean;
  ipWhitelist?: string[];
  auditLogging: boolean;
  ssoEnabled: boolean;
  ssoConfig?: SSOConfig;
}

// Authentication Methods
export enum AuthMethod {
  EMAIL_PASSWORD = 'email_password',
  SSO_GOOGLE = 'sso_google',
  SSO_MICROSOFT = 'sso_microsoft',
  SSO_SAML = 'sso_saml',
  API_KEY = 'api_key',
  MFA_TOTP = 'mfa_totp',
  MFA_SMS = 'mfa_sms'
}

// Authentication Flow
export interface AuthFlow {
  id: string;
  method: AuthMethod;
  status: 'pending' | 'completed' | 'failed' | 'expired';
  userId?: string;
  organizationId?: string;
  metadata: Record<string, any>;
  expiresAt: Date;
  createdAt: Date;
}

// Multi-factor Authentication
export interface MFAChallenge {
  id: string;
  userId: string;
  method: 'totp' | 'sms' | 'email';
  code?: string;
  expiresAt: Date;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
}

// OAuth State
export interface OAuthState {
  state: string;
  organizationId?: string;
  redirectUrl?: string;
  metadata: Record<string, any>;
  expiresAt: Date;
  createdAt: Date;
} 