/**
 * User role enumeration
 * Defines all possible user roles in the system
 */
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  USER = 'USER',
  GUEST = 'GUEST',
}

export type UserRoleType = keyof typeof UserRole;

/**
 * Role hierarchy levels for permission management
 */
export enum RoleLevel {
  SUPER_ADMIN = 100,
  ADMIN = 80,
  MANAGER = 60,
  USER = 40,
  GUEST = 0,
}

/**
 * Role categories for organization
 */
export enum RoleCategory {
  SYSTEM = 'system',
  ADMINISTRATIVE = 'administrative',
  OPERATIONAL = 'operational',
  LIMITED = 'limited',
}
