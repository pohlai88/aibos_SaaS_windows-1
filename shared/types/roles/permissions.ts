import { UserRole } from './roles.enums';

/**
 * Core system permissions
 * Simple, focused permission system
 */
export const Permission = {
  // User permissions
  USER_CREATE: 'USER_CREATE',
  USER_READ: 'USER_READ',
  USER_UPDATE: 'USER_UPDATE',
  USER_DELETE: 'USER_DELETE',
  
  // Content permissions
  CONTENT_CREATE: 'CONTENT_CREATE',
  CONTENT_READ: 'CONTENT_READ',
  CONTENT_UPDATE: 'CONTENT_UPDATE',
  CONTENT_DELETE: 'CONTENT_DELETE',
  
  // System permissions
  SYSTEM_SETTINGS_UPDATE: 'SYSTEM_SETTINGS_UPDATE'
} as const;

export type Permission = typeof Permission[keyof typeof Permission];

/**
 * Permission metadata including display information and category
 */
export interface PermissionMeta {
  label: string;
  description: string;
  category: string;
  minRole?: UserRole;
}

/**
 * Permission registry with metadata
 */
export const PermissionRegistry: Record<Permission, PermissionMeta> = {
  [Permission.USER_CREATE]: {
    label: 'Create Users',
    description: 'Can register new user accounts',
    category: 'User Management',
    minRole: UserRole.ADMIN
  },
  [Permission.USER_READ]: {
    label: 'Read Users',
    description: 'Can view user information',
    category: 'User Management',
    minRole: UserRole.USER
  },
  [Permission.USER_UPDATE]: {
    label: 'Update Users',
    description: 'Can modify user information',
    category: 'User Management',
    minRole: UserRole.ADMIN
  },
  [Permission.USER_DELETE]: {
    label: 'Delete Users',
    description: 'Can permanently delete user accounts',
    category: 'User Management',
    minRole: UserRole.ADMIN
  },
  [Permission.CONTENT_CREATE]: {
    label: 'Create Content',
    description: 'Can create new content',
    category: 'Content Management',
    minRole: UserRole.USER
  },
  [Permission.CONTENT_READ]: {
    label: 'Read Content',
    description: 'Can view content',
    category: 'Content Management',
    minRole: UserRole.GUEST
  },
  [Permission.CONTENT_UPDATE]: {
    label: 'Update Content',
    description: 'Can modify existing content',
    category: 'Content Management',
    minRole: UserRole.USER
  },
  [Permission.CONTENT_DELETE]: {
    label: 'Delete Content',
    description: 'Can delete content',
    category: 'Content Management',
    minRole: UserRole.ADMIN
  },
  [Permission.SYSTEM_SETTINGS_UPDATE]: {
    label: 'Update System Settings',
    description: 'Can modify system configuration',
    category: 'System Administration',
    minRole: UserRole.SUPER_ADMIN
  }
};

/**
 * Helper types for permission checking
 */
export type PermissionCheck = 
  | Permission 
  | Permission[]
  | { any: Permission[] } 
  | { all: Permission[] };

/**
 * Utility functions for permission management
 */

/**
 * Check if user has a specific permission
 */
export function hasPermission(
  userPermissions: Permission[],
  check: PermissionCheck
): boolean {
  // Handle simple string permission
  if (typeof check === "string") {
    return userPermissions.includes(check);
  }

  // Handle array of permissions (requires all)
  if (Array.isArray(check)) {
    return check.every(p => userPermissions.includes(p));
  }

  // Handle { any: [...] } permission check
  if ("any" in check) {
    return check.any.some(p => userPermissions.includes(p));
  }

  // Handle { all: [...] } permission check
  if ("all" in check) {
    return check.all.every(p => userPermissions.includes(p));
  }

  return false;
}

/**
 * Get permission metadata
 */
export function getPermissionMeta(permission: Permission): PermissionMeta {
  return PermissionRegistry[permission];
}

/**
 * Check if a permission string is valid
 */
export function isValidPermission(permission: string): permission is Permission {
  return Object.values(Permission).includes(permission as Permission);
}

/**
 * Get all permissions for a specific role
 */
export function getPermissionsForRole(role: UserRole): Permission[] {
  return Object.entries(PermissionRegistry)
    .filter(([_, meta]) => !meta.minRole || meta.minRole === role || isRoleAtOrAbove(role, meta.minRole))
    .map(([permission]) => permission as Permission);
}

/**
 * Check if a role is at or above a certain level
 */
function isRoleAtOrAbove(role: UserRole, minRole: UserRole): boolean {
  const roleLevels = {
    [UserRole.GUEST]: 0,
    [UserRole.USER]: 1,
    [UserRole.MANAGER]: 2,
    [UserRole.ADMIN]: 3,
    [UserRole.SUPER_ADMIN]: 4
  };
  
  return roleLevels[role] >= roleLevels[minRole];
} 