import { UserRole } from './roles.enums';
import { PermissionRegistry } from './permissions';
import { Permission } from './permissions';

export const rolePermissionsMap: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: Object.values(Permission),
  [UserRole.ADMIN]: [
    Permission.USER_CREATE,
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.CONTENT_CREATE,
    // ... other admin permissions
  ],
  // ... other roles
};

/**
 * Role metadata for better understanding and UI display
 */
export interface RoleMeta {
  label: string;
  description: string;
  level: number; // Hierarchy level (higher = more permissions)
  dangerous?: boolean;
  defaultPermissions?: Permission[];
}

/**
 * Role metadata registry
 */
export const RoleMetaRegistry: Record<UserRole, RoleMeta> = {
  [UserRole.SUPER_ADMIN]: {
    label: 'Super Administrator',
    description: 'Full system access with all permissions. Can perform any action in the system.',
    level: 100,
    dangerous: true,
  },
  [UserRole.ADMIN]: {
    label: 'Administrator',
    description:
      'Full system access except super admin functions. Can manage users, tenants, billing, and system settings.',
    level: 90,
    dangerous: true,
  },
  [UserRole.MANAGER]: {
    label: 'Manager',
    description:
      'Team and project management. Can manage team members, view analytics, and handle content.',
    level: 70,
  },
  [UserRole.USER]: {
    label: 'User',
    description:
      'Standard user access. Can view and edit own data, create content, and access basic features.',
    level: 50,
  },
  [UserRole.GUEST]: {
    label: 'Guest',
    description: 'Minimal access. Can view public content and create support tickets.',
    level: 10,
  },
};

export function getPermissionsForRole(role: UserRole): Permission[] {
  return [...(rolePermissionsMap[role] || [])];
}

/**
 * Validates if a role has a specific permission
 */
export function roleHasPermission(role: UserRole, permission: Permission): boolean {
  return rolePermissionsMap[role]?.includes(permission) ?? false;
}

/**
 * Utility to check if a role has all required permissions
 */
export function roleHasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every((p) => roleHasPermission(role, p));
}

/**
 * Utility to check if a role has any of the required permissions
 */
export function roleHasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some((p) => roleHasPermission(role, p));
}

/**
 * Get role metadata
 */
export function getRoleMeta(role: UserRole): RoleMeta {
  return RoleMetaRegistry[role];
}

/**
 * Get roles by hierarchy level
 */
export function getRolesByLevel(minLevel: number): UserRole[] {
  return Object.entries(RoleMetaRegistry)
    .filter(([_, meta]) => meta.level >= minLevel)
    .map(([role]) => role as UserRole);
}

/**
 * Check if a role is at or above a certain level
 */
export function isRoleAtOrAbove(role: UserRole, minLevel: number): boolean {
  return RoleMetaRegistry[role]?.level >= minLevel;
}

/**
 * Get roles that have a specific permission
 */
export function getRolesWithPermission(permission: Permission): UserRole[] {
  return Object.entries(rolePermissionsMap)
    .filter(([_, permissions]) => permissions.includes(permission))
    .map(([role]) => role as UserRole);
}

/**
 * Get dangerous roles (roles with dangerous permissions)
 */
export function getDangerousRoles(): UserRole[] {
  return Object.entries(RoleMetaRegistry)
    .filter(([_, meta]) => meta.dangerous)
    .map(([role]) => role as UserRole);
}

/**
 * Compare role hierarchy levels
 */
export function compareRoleLevels(role1: UserRole, role2: UserRole): number {
  const level1 = RoleMetaRegistry[role1]?.level ?? 0;
  const level2 = RoleMetaRegistry[role2]?.level ?? 0;
  return level1 - level2;
}

/**
 * Check if a role can manage another role
 */
export function canManageRole(managerRole: UserRole, targetRole: UserRole): boolean {
  const managerLevel = RoleMetaRegistry[managerRole]?.level ?? 0;
  const targetLevel = RoleMetaRegistry[targetRole]?.level ?? 0;
  return managerLevel > targetLevel;
}

/**
 * Get the minimum role required for a specific permission
 */
export function getMinimumRoleForPermission(permission: Permission): UserRole | null {
  const permissionMeta = Object.entries(PermissionRegistry).find(
    ([perm]) => perm === permission,
  )?.[1];

  return permissionMeta?.minRole ?? null;
}

// Validation function to ensure all permissions are properly mapped
(function validateRolePermissions() {
  const allPermissions = Object.values(Permission);
  const mappedPermissions = new Set(Object.values(rolePermissionsMap).flat());

  const unmappedPermissions = allPermissions.filter((p) => !mappedPermissions.has(p));

  if (unmappedPermissions.length > 0) {
    // Log unmapped permissions for development (remove in production)
    // console.warn('Unmapped permissions:', unmappedPermissions);
  }
})();
