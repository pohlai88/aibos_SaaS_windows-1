import { z } from 'zod';

// User validation schemas
export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  role: z.enum(['admin', 'user', 'viewer']).optional(),
  organization_id: z.string().uuid().optional(),
});

export const updateUserSchema = z.object({
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
  role: z.enum(['admin', 'user', 'viewer']).optional(),
  is_active: z.boolean().optional(),
});

// Organization validation schemas
export const createOrganizationSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  plan: z.enum(['free', 'pro', 'enterprise']).default('free'),
  settings: z.record(z.any()).optional(),
});

export const updateOrganizationSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  plan: z.enum(['free', 'pro', 'enterprise']).optional(),
  settings: z.record(z.any()).optional(),
});

// Permission validation schemas
export const createPermissionSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  resource: z.string().min(1),
  action: z.enum(['create', 'read', 'update', 'delete', 'manage']),
});

export const assignPermissionSchema = z.object({
  user_id: z.string().uuid(),
  permission_id: z.string().uuid(),
  organization_id: z.string().uuid(),
});

// Auth validation schemas
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
});

export const changePasswordSchema = z.object({
  current_password: z.string().min(1),
  new_password: z.string().min(8),
  confirm_password: z.string().min(8),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
}); 