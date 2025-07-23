import { expectType, expectError } from 'tsd';
import { DeviceType, isActiveSession, isExpiredToken } from '../../types/auth/auth';
import type {
  AuthSession,
  TokenPayload,
  DeviceInfo,
  GeoLocation,
  SessionId,
  DeviceId,
  TokenId,
} from '../../types/auth/auth';
import type { User } from '../../types/user/user';
import type { Tenant } from '../../types/tenant/tenant';
import { AuthType, TokenType } from '../../types/auth/auth.enums';

// Test AuthSession type
expectType<AuthSession>({
  user: {} as User,
  tenant: {} as Tenant,
  token: 'valid-jwt-token',
  refreshToken: 'refresh-token',
  issuedAt: new Date(),
  expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
  authType: AuthType.JWT,
  deviceId: 'device-123',
  deviceInfo: {} as DeviceInfo,
  lastActivity: new Date(),
  isActive: true,
  sessionId: 'session-123',
  loginMethod: 'password',
});

// Test TokenPayload type
expectType<TokenPayload>({
  sub: 'user-123',
  tenantId: 'tenant-456',
  authType: AuthType.JWT,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600,
  jti: 'jwt-id-123',
  tokenType: TokenType.ACCESS,
  aud: 'api.example.com',
  iss: 'auth.example.com',
  deviceId: 'device-123',
  sessionId: 'session-123',
});

// Test DeviceInfo type
expectType<DeviceInfo>({
  id: 'device-123',
  name: 'MacBook Pro',
  type: DeviceType.DESKTOP,
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
  location: {} as GeoLocation,
  os: 'macOS',
  browser: 'Chrome',
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  fingerprint: 'device-fingerprint',
  lastSeen: new Date(),
});

// Test GeoLocation type
expectType<GeoLocation>({
  country: 'US',
  region: 'CA',
  city: 'San Francisco',
  latitude: 37.7749,
  longitude: -122.4194,
  timezone: 'America/Los_Angeles',
});

// Test utility types
expectType<SessionId>('session-123');
expectType<DeviceId>('device-123');
expectType<TokenId>('token-123');

// Test type guards
expectType<boolean>(isActiveSession({} as AuthSession));
expectType<boolean>(isExpiredToken({} as TokenPayload));

// Test error cases - should fail type checking
expectError<AuthSession>({
  // Missing required fields
  user: {} as User,
  // Missing tenant, token, issuedAt, expiresAt, authType, sessionId, isActive
});

expectError<TokenPayload>({
  // Missing required fields
  sub: 'user-123',
  // Missing authType, iat, exp, jti, tokenType
});

// Test enum values
expectType<DeviceType>(DeviceType.DESKTOP);
expectType<DeviceType>(DeviceType.MOBILE);
expectType<DeviceType>(DeviceType.TABLET);
expectType<DeviceType>(DeviceType.UNKNOWN);

// Test that invalid enum values are rejected
expectError<DeviceType>('invalid-device-type');
