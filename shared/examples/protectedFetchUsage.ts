import { protectedFetch, protectedApi, setUserContext } from '../utils/protectedFetch';
import { Permission } from '../types/roles/permissions';
import { User } from '../types/user/user';
import { UserRole } from '../types/roles/roles.enums';

// Example user context implementation
class ExampleUserContext {
  private currentUser: User | null = null;

  setUser(user: User | null): void {
    this.currentUser = user;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }
}

// Example user
const exampleUser: User = {
  id: 'user-123',
  email: 'user@example.com',
  role: UserRole.ADMIN,
  isActive: true,
  emailVerified: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  mfaEnabled: false,
};

// Set up user context
const userContext = new ExampleUserContext();
userContext.setUser(exampleUser);
setUserContext(userContext);

/**
 * Example 1: Basic protected fetch usage
 */
export async function exampleBasicProtectedFetch() {
  console.log('=== Basic Protected Fetch ===');

  try {
    // Fetch user data with USER_READ permission
    const userData = await protectedFetch('/api/users', Permission.USER_READ);
    console.log('User data fetched:', userData);
  } catch (error) {
    console.error('Protected fetch failed:', error);
  }
}

/**
 * Example 2: Using convenience methods
 */
export async function exampleConvenienceMethods() {
  console.log('=== Convenience Methods ===');

  try {
    // GET request
    const users = await protectedApi.get('/api/users', Permission.USER_READ);
    console.log('Users fetched:', users);

    // POST request
    const newUser = await protectedApi.post(
      '/api/users',
      [Permission.USER_CREATE, Permission.USER_READ], // Multiple permissions
      { email: 'newuser@example.com', name: 'New User' },
    );
    console.log('New user created:', newUser);

    // PUT request
    const updatedUser = await protectedApi.put('/api/users/123', Permission.USER_UPDATE, {
      name: 'Updated Name',
    });
    console.log('User updated:', updatedUser);

    // DELETE request
    await protectedApi.delete('/api/users/123', Permission.USER_DELETE);
    console.log('User deleted');
  } catch (error) {
    console.error('API call failed:', error);
  }
}

/**
 * Example 3: Error handling
 */
export async function exampleErrorHandling() {
  console.log('=== Error Handling ===');

  // Set user with insufficient permissions
  const lowPrivilegeUser: User = {
    ...exampleUser,
    role: UserRole.GUEST,
  };
  userContext.setUser(lowPrivilegeUser);

  try {
    // This should fail due to insufficient permissions
    await protectedFetch('/api/users', Permission.USER_CREATE);
  } catch (error) {
    if (error instanceof Error) {
      console.log('Expected error caught:', error.message);
    }
  }

  // Restore original user
  userContext.setUser(exampleUser);
}

/**
 * Example 4: Multiple permission requirements
 */
export async function exampleMultiplePermissions() {
  console.log('=== Multiple Permissions ===');

  try {
    // Require both USER_READ and CONTENT_READ permissions
    const data = await protectedFetch('/api/dashboard', [
      Permission.USER_READ,
      Permission.CONTENT_READ,
    ]);
    console.log('Dashboard data fetched:', data);
  } catch (error) {
    console.error('Multiple permission check failed:', error);
  }
}

/**
 * Example 5: Custom fetch options
 */
export async function exampleCustomOptions() {
  console.log('=== Custom Options ===');

  try {
    const data = await protectedFetch(
      '/api/users',
      Permission.USER_READ,
      {
        headers: {
          'X-Custom-Header': 'custom-value',
        },
      },
      {
        timeout: 5000,
        retries: 2,
      },
    );
    console.log('Data with custom options:', data);
  } catch (error) {
    console.error('Custom options failed:', error);
  }
}

// Run examples
export async function runAllExamples() {
  await exampleBasicProtectedFetch();
  await exampleConvenienceMethods();
  await exampleErrorHandling();
  await exampleMultiplePermissions();
  await exampleCustomOptions();
}
