import { User } from '@supabase/supabase-js';

export function isAuthenticated(user: User | null): boolean {
  return user !== null && user.id !== undefined;
}

export function getUserRole(user: User | null): string {
  return user?.user_metadata?.role || 'user';
}

export function hasPermission(user: User | null, requiredRole: string): boolean {
  if (!user) return false;
  
  const userRole = getUserRole(user);
  const roleHierarchy = {
    'admin': 3,
    'user': 2,
    'viewer': 1
  };
  
  return (roleHierarchy[userRole as keyof typeof roleHierarchy] || 0) >= 
         (roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0);
}

export function formatUserName(user: User | null): string {
  if (!user) return 'Unknown User';
  
  const firstName = user.user_metadata?.first_name || '';
  const lastName = user.user_metadata?.last_name || '';
  
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }
  
  return user.email || 'Unknown User';
} 