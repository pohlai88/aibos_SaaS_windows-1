import { z } from 'zod';
import { UserRole } from '../types/roles/roles.enums';
import { Permission } from '../types/roles/permissions';

export const RoleSchema = z.nativeEnum(UserRole);
export const PermissionSchema = z.nativeEnum(Permission);
export const PermissionsArraySchema = z.array(PermissionSchema).min(1);

export const RoleUpdateSchema = z.object({
  role: RoleSchema,
  permissions: PermissionsArraySchema
}); 