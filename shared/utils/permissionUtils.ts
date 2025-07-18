import type { UserRole } from '../types/roles/roles.enums';
import type { Permission } from '../types/roles/permissions';
import { rolePermissionsMap } from '../types/roles/rolePermissionsMap';

export function hasPermission(role: UserRole, permission: Permission | Permission[]): boolean {
  const permissions = rolePermissionsMap[role] || [];

  if (Array.isArray(permission)) {
    return permission.every((p) => permissions.includes(p));
  }

  return permissions.includes(permission);
}

export function requirePermission(role: UserRole, permission: Permission | Permission[]): void {
  if (!hasPermission(role, permission)) {
    throw new Error(`Missing required permission: ${permission}`);
  }
}
