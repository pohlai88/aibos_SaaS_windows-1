// Authentication types used across multiple packages

export interface JwtPayload {
  sub: string;
  org: string;
  roles: string[];
  // Legacy compatibility
  user_id?: string;
  organization_id?: string;
  exp?: number;
  iat?: number;
  iss?: string;
  aud?: string;
}

export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  tokenType: 'Bearer';
  scope?: string;
}

export interface AuthSession {
  userId: string;
  organizationId: string;
  roles: string[];
  permissions: string[];
  isActive: boolean;
  lastActivity: Date;
  ipAddress?: string;
  userAgent?: string;
  sessionId: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
  organizationId?: string;
  rememberMe?: boolean;
  mfaToken?: string;
}

export interface AuthResponse {
  success: boolean;
  token?: AuthToken;
  session?: AuthSession;
  user?: AuthUser;
  error?: string;
  errorCode?: string;
  requiresMfa?: boolean;
  mfaType?: 'sms' | 'email' | 'totp' | 'push';
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  roles: string[];
  permissions: string[];
  isActive: boolean;
  lastLogin?: Date;
  mfaEnabled: boolean;
  mfaType?: 'sms' | 'email' | 'totp' | 'push';
  profile?: UserProfile;
}

export interface UserProfile {
  avatar?: string;
  phone?: string;
  department?: string;
  position?: string;
  timezone?: string;
  language?: string;
  preferences?: Record<string, any>;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MfaChallenge {
  id: string;
  userId: string;
  type: 'sms' | 'email' | 'totp' | 'push';
  code?: string;
  expiresAt: Date;
  attempts: number;
  maxAttempts: number;
  isUsed: boolean;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  preventCommonPasswords: boolean;
  maxAge: number; // days
  preventReuse: number; // number of previous passwords
}

export interface AuthConfig {
  jwtSecret: string;
  jwtExpiresIn: number;
  refreshTokenExpiresIn: number;
  sessionTimeout: number;
  maxLoginAttempts: number;
  lockoutDuration: number;
  passwordPolicy: PasswordPolicy;
  mfaRequired: boolean;
  allowedOrigins: string[];
} 