import { User } from "../user/user";
import { Tenant } from "../tenant/tenant";
import { AuthType, TokenType } from "./auth.enums";

/**
 * Core authentication types
 */

export interface AuthSession {
  user: User;
  tenant: Tenant;
  token: string;
  refreshToken?: string;
  issuedAt: Date;
  expiresAt: Date;
  authType: AuthType;
  deviceId?: string;
  deviceInfo?: DeviceInfo;
  // Security metadata
  lastActivity?: Date;
  isActive: boolean;
  // Session metadata
  sessionId: string;
  loginMethod?: string;
}

export interface TokenPayload {
  sub: string; // User ID
  tenantId?: string;
  authType: AuthType;
  iat: number;
  exp: number;
  jti: string;
  tokenType: TokenType;
  // Additional security claims
  aud?: string; // Audience
  iss?: string; // Issuer
  // Custom claims
  deviceId?: string;
  sessionId?: string;
}

export interface DeviceInfo {
  id: string;
  name?: string;
  type?: DeviceType;
  ipAddress?: string;
  userAgent?: string;
  location?: GeoLocation;
  // Additional device metadata
  os?: string;
  browser?: string;
  isMobile?: boolean;
  isTablet?: boolean;
  isDesktop?: boolean;
  // Security info
  fingerprint?: string;
  lastSeen?: Date;
}

export interface GeoLocation {
  country?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

export enum DeviceType {
  DESKTOP = "desktop",
  MOBILE = "mobile",
  TABLET = "tablet",
  UNKNOWN = "unknown"
}

// Utility types for better type safety
export type SessionId = string;
export type DeviceId = string;
export type TokenId = string;

// Type guards
export const isActiveSession = (session: AuthSession): boolean => {
  return session.isActive && session.expiresAt > new Date();
};

export const isExpiredToken = (payload: TokenPayload): boolean => {
  return payload.exp * 1000 < Date.now();
}; 