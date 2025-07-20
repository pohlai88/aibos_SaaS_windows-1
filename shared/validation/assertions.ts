import { UserSchema } from './user.schema';
import type { User } from '../types/user/user';

export function assertIsUser(data: unknown): asserts data is User {
  UserSchema.parse(data);
}
