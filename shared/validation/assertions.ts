import { UserSchema } from './user.schema';
import type { User } from '@shared/types/user';

export function assertIsUser(data: unknown): asserts data is User {
  UserSchema.parse(data);
} 