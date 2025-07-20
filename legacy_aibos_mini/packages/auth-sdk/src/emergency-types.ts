// Emergency type declarations for auth-sdk
// Temporary types to prevent build failures

declare global {
  interface AuthUser {
    id: string;
    orgId: string;
    email: string;
    roles: string[];
    permissions: string[];
    isActive: boolean;
    lastLogin: Date;
  }

  interface AuthSession {
    sessionId: string;
    userId: string;
    organizationId: string;
    roles: string[];
    permissions: string[];
    isActive: boolean;
    lastActivity: Date;
    ipAddress?: string;
    userAgent?: string;
  }

  interface DecodedToken {
    sub: string;
    org: string;
    roles: string[];
    exp: number;
    iat: number;
    iss: string;
    aud: string;
    // Legacy compatibility
    user_id?: string;
    organization_id?: string;
  }

  interface AuthToken {
    accessToken: string;
    refreshToken?: string;
    expiresIn: number;
    tokenType: 'Bearer';
    scope?: string;
  }

  interface LoginCredentials {
    username: string;
    password: string;
    organizationId?: string;
    rememberMe?: boolean;
    mfaToken?: string;
  }

  interface AuthResult {
    success: boolean;
    user?: AuthUser;
    token?: AuthToken;
    session?: AuthSession;
    errors?: string[];
    warnings?: string[];
  }

  interface PermissionCheck {
    resource: string;
    action: string;
    userId: string;
    organizationId: string;
  }

  interface PermissionResult {
    allowed: boolean;
    reason?: string;
    conditions?: Record<string, any>;
  }
}

export {}; 