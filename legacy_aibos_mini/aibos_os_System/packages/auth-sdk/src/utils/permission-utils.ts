export interface PermissionResource {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
}

export interface UserPermission {
  user_id: string;
  permission_id: string;
  organization_id: string;
  granted_at: string;
}

export function checkResourcePermission(
  userPermissions: PermissionResource[],
  resource: string,
  action: string
): boolean {
  return userPermissions.some(
    permission => 
      permission.resource === resource && 
      (permission.action === action || permission.action === 'manage')
  );
}

export function hasAnyPermission(
  userPermissions: PermissionResource[],
  resource: string
): boolean {
  return userPermissions.some(permission => permission.resource === resource);
}

export function getResourcePermissions(
  userPermissions: PermissionResource[],
  resource: string
): PermissionResource[] {
  return userPermissions.filter(permission => permission.resource === resource);
}

export function canCreate(userPermissions: PermissionResource[], resource: string): boolean {
  return checkResourcePermission(userPermissions, resource, 'create');
}

export function canRead(userPermissions: PermissionResource[], resource: string): boolean {
  return checkResourcePermission(userPermissions, resource, 'read');
}

export function canUpdate(userPermissions: PermissionResource[], resource: string): boolean {
  return checkResourcePermission(userPermissions, resource, 'update');
}

export function canDelete(userPermissions: PermissionResource[], resource: string): boolean {
  return checkResourcePermission(userPermissions, resource, 'delete');
}

export function canManage(userPermissions: PermissionResource[], resource: string): boolean {
  return checkResourcePermission(userPermissions, resource, 'manage');
} 