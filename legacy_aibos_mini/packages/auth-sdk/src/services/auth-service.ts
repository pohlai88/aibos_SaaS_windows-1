import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { loginSchema, resetPasswordSchema, changePasswordSchema } from '../validation';

export interface AuthServiceConfig {
  supabaseUrl: string;
  supabaseKey: string;
}

export class AuthService {
  private supabase: SupabaseClient;

  constructor(config: AuthServiceConfig) {
    this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
  }

  // Sign up a new user
  async signUp(email: string, password: string, userData?: any): Promise<{ user: User | null; error: AuthError | null }> {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });

    return { user: data.user, error };
  }

  // Sign in a user
  async signIn(email: string, password: string): Promise<{ session: Session | null; error: AuthError | null }> {
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      return { session: null, error: { message: 'Invalid email or password' } as AuthError };
    }

    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { session: data.session, error };
  }

  // Sign out the current user
  async signOut(): Promise<{ error: AuthError | null }> {
    const { error } = await this.supabase.auth.signOut();
    return { error };
  }

  // Get the current session
  async getSession(): Promise<{ session: Session | null; error: AuthError | null }> {
    const { data, error } = await this.supabase.auth.getSession();
    return { session: data.session, error };
  }

  // Get the current user
  async getUser(): Promise<{ user: User | null; error: AuthError | null }> {
    const { data, error } = await this.supabase.auth.getUser();
    return { user: data.user, error };
  }

  // Reset password
  async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    const validation = resetPasswordSchema.safeParse({ email });
    if (!validation.success) {
      return { error: { message: 'Invalid email' } as AuthError };
    }

    const { error } = await this.supabase.auth.resetPasswordForEmail(email);
    return { error };
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<{ error: AuthError | null }> {
    const validation = changePasswordSchema.safeParse({
      current_password: currentPassword,
      new_password: newPassword,
      confirm_password: newPassword,
    });

    if (!validation.success) {
      return { error: { message: 'Invalid password data' } as AuthError };
    }

    const { error } = await this.supabase.auth.updateUser({
      password: newPassword,
    });

    return { error };
  }

  // Refresh session
  async refreshSession(): Promise<{ session: Session | null; error: AuthError | null }> {
    const { data, error } = await this.supabase.auth.refreshSession();
    return { session: data.session, error };
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }
} 