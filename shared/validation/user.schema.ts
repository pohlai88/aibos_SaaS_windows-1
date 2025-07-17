import { z } from 'zod';
import { UserRole } from '../types/user/user.enums';
import { User } from '../types/user/user';
import { ISODate } from '../types/primitives';

const EmailSchema = z
  .string()
  .email()
  .transform((val) => val.toLowerCase().trim());

export const UserSchema = z.object({
  user_id: z.string().uuid(),
  email: EmailSchema,
  name: z.string().min(1).max(100),
  role: z.nativeEnum(UserRole),
  permissions: z.array(z.string().min(1)),
  created_at: z
    .string()
    .regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$/)
    .optional(),
}) satisfies z.ZodType<User>;

export type UserInput = z.input<typeof UserSchema>;
