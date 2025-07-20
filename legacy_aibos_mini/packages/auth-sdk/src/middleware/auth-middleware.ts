import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export interface AuthMiddlewareConfig {
  supabaseUrl: string;
  supabaseKey: string;
}

export class AuthMiddleware {
  private supabase: any;

  constructor(config: AuthMiddlewareConfig) {
    this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
  }

  async authenticate(request: NextRequest): Promise<{ user: any; error: any }> {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { user: null, error: { message: 'No authorization header' } };
    }

    const token = authHeader.substring(7);
    
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser(token);
      return { user, error };
    } catch (error) {
      return { user: null, error };
    }
  }

  async requireAuth(request: NextRequest): Promise<NextResponse | null> {
    const { user, error } = await this.authenticate(request);
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return null; // Continue to the next middleware/handler
  }
} 