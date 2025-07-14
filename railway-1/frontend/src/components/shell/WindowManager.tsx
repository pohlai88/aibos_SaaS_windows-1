'use client';

import { ReactNode } from 'react';

interface WindowManagerProps {
  children: ReactNode;
}

export function WindowManager({ children }: WindowManagerProps) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {children}
    </div>
  );
} 