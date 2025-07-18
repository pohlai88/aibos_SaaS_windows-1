import type { User } from '../user/user';
import type { Tenant } from '../tenant/tenant';
import type { AuthType, TokenType  } from './auth.enums';

/**
 * Core authentication types for the AI-BOS platform
 *
 * @example
 * ```typescript
 * const session: AuthSession = {
 *   user: authenticatedUser,
 *   tenant: userTenant,
 *   token: 'jwt-token',
 *   issuedAt: new Date(),
 *   expiresAt: new Date(Date.now() + 3600000),
 *   authType: AuthType.JWT,
 *   sessionId: 'session-123',
 *   isActive: true
 * };
 * ```
 */

/**
 * Represents an active authentication session for a user
 *
 * @property user - The authenticated user
 * @property tenant - The tenant context for the session
 * @property token - JWT or session token
 * @property refreshToken - Optional refresh token for token renewal
 * @property issuedAt - When the session was created
 * @property expiresAt - When the session expires
 * @property authType - Type of authentication used
 * @property deviceId - Optional device identifier
 * @property deviceInfo - Optional device information
 * @property lastActivity - Last user activity timestamp
 * @property isActive - Whether the session is currently active
 * @property sessionId - Unique session identifier
 * @property loginMethod - Method used for login (e.g., 'password', 'oauth')
 */
export interface AuthSession {
  readonly user: User;
  readonly tenant: Tenant;
  readonly token: string;
  readonly refreshToken?: string;
  readonly issuedAt: Date;
  readonly expiresAt: Date;
  readonly authType: AuthType;
  readonly deviceId?: string;
  readonly deviceInfo?: DeviceInfo;
  readonly lastActivity?: Date;
  readonly isActive: boolean;
  readonly sessionId: string;
  readonly loginMethod?: string;
}

/**
 * JWT token payload structure
 *
 * @example
 * ```typescript
 * const payload: TokenPayload = {
 *   sub: 'user-123',
 *   tenantId: 'tenant-456',
 *   authType: AuthType.JWT,
 *   iat: Math.floor(Date.now() / 1000),
 *   exp: Math.floor(Date.now() / 1000) + 3600,
 *   jti: 'jwt-id-123',
 *   tokenType: TokenType.ACCESS
 * };
 * ```
 */
export interface TokenPayload {
  readonly sub: string; // User ID
  readonly tenantId?: string;
  readonly authType: AuthType;
  readonly iat: number; // Issued at (Unix timestamp)
  readonly exp: number; // Expires at (Unix timestamp)
  readonly jti: string; // JWT ID
  readonly tokenType: TokenType;
  readonly aud?: string; // Audience
  readonly iss?: string; // Issuer
  readonly deviceId?: string;
  readonly sessionId?: string;
}

/**
 * Device information for security and analytics
 *
 * @example
 * ```typescript
 * const deviceInfo: DeviceInfo = {
 *   id: 'device-123',
 *   name: 'MacBook Pro',
 *   type: DeviceType.DESKTOP,
 *   ipAddress: '192.168.1.1',
 *   userAgent: 'Mozilla/5.0...',
 *   os: 'macOS',
 *   browser: 'Chrome',
 *   isDesktop: true
 * };
 * ```
 */
export interface DeviceInfo {
  readonly id: string;
  readonly name?: string;
  readonly type?: DeviceType;
  readonly ipAddress?: string;
  readonly userAgent?: string;
  readonly location?: GeoLocation;
  readonly os?: string;
  readonly browser?: string;
  readonly isMobile?: boolean;
  readonly isTablet?: boolean;
  readonly isDesktop?: boolean;
  readonly fingerprint?: string;
  readonly lastSeen?: Date;
}

/**
 * Geographic location information
 *
 * @example
 * ```typescript
 * const location: GeoLocation = {
 *   country: 'US',
 *   region: 'CA',
 *   city: 'San Francisco',
 *   latitude: 37.7749,
 *   longitude: -122.4194,
 *   timezone: 'America/Los_Angeles'
 * };
 * ```
 */
export interface GeoLocation {
  readonly country?: string;
  readonly region?: string;
  readonly city?: string;
  readonly latitude?: number;
  readonly longitude?: number;
  readonly timezone?: string;
}

/**
 * Device type enumeration
 */
export enum DeviceType {
  DESKTOP = 'desktop',
  MOBILE = 'mobile',
  TABLET = 'tablet',
  UNKNOWN = 'unknown',
}

/**
 * Utility types for better type safety
 */
export type SessionId = string & { readonly __brand: 'SessionId' };
export type DeviceId = string & { readonly __brand: 'DeviceId' };
export type TokenId = string & { readonly __brand: 'TokenId' };

/**
 * Type predicates for runtime validation
 */

/**
 * Checks if a session is currently active
 *
 * @param session - The session to check
 * @returns true if the session is active and not expired
 *
 * @example
 * ```typescript
 * if (isActiveSession(session)) {
 *   // Session is valid
 * }
 * ```
 */
export const isActiveSession = (session: AuthSession): boolean => {
  return session.isActive && session.expiresAt > new Date();
};

/**
 * Checks if a token payload has expired
 *
 * @param payload - The token payload to check
 * @returns true if the token has expired
 *
 * @example
 * ```typescript
 * if (isExpiredToken(payload)) {
 *   // Token needs refresh
 * }
 * ```
 */
export const isExpiredToken = (payload: TokenPayload): boolean => {
  return payload.exp * 1000 < Date.now();
};

/**
 * Type guard for AuthSession
 *
 * @param value - Value to check
 * @returns true if value is a valid AuthSession
 */
export const isAuthSession = (value: unknown): value is AuthSession => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'user' in value &&
    'tenant' in value &&
    'token' in value &&
    'issuedAt' in value &&
    'expiresAt' in value &&
    'authType' in value &&
    'sessionId' in value &&
    'isActive' in value
  );
};

/**
 * Type guard for TokenPayload
 *
 * @param value - Value to check
 * @returns true if value is a valid TokenPayload
 */
export const isTokenPayload = (value: unknown): value is TokenPayload => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'sub' in value &&
    'authType' in value &&
    'iat' in value &&
    'exp' in value &&
    'jti' in value &&
    'tokenType' in value
  );
};
