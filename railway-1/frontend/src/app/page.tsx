'use client';

import React from 'react';
import { useIsAuthenticated } from '@/lib/store';
import { useAuth } from '@/components/auth/AuthProvider';
import { TerminalLoginScreen } from '@/components/auth/TerminalLoginScreen';
import { DesktopView } from '@/components/desktop/DesktopView';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function HomePage() {
  const isAuthenticated = useIsAuthenticated();
  const { isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-white mt-4 text-lg">Initializing AI-BOS...</p>
        </div>
      </div>
    );
  }

  // Show terminal login screen if not authenticated
  if (!isAuthenticated) {
    return <TerminalLoginScreen />;
  }

  // Show desktop if authenticated
  return <DesktopView />;
}
