import { z } from 'zod';
import { User, UserSchema } from '../user/user';
import { Tenant, TenantSchema } from '../tenant/tenant';

/**
 * Represents an authenticated session in the system.
 */
export const AuthSessionSchema = z.object({
  user: UserSchema,
  tenant: TenantSchema.optional(),
  token: z.string().min(1, 'Token cannot be empty'),
  issuedAt: z.date(),
  expiresAt: z.date(),
  authType: z.enum(['user', 'api_key', 'admin']),
});

export type AuthSession = Readonly<z.infer<typeof AuthSessionSchema>>;
