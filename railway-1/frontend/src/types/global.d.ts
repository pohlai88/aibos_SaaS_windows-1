// Global type declarations for AI-BOS Frontend

// Google Analytics gtag
declare global {
  interface Window {
    gtag?: (
      command: 'event' | 'config' | 'set',
      targetId: string,
      config?: Record<string, any>
    ) => void;
  }
}

// Vitest globals
declare global {
  const beforeEach: (fn: () => void) => void;
  const afterEach: (fn: () => void) => void;
  const describe: (name: string, fn: () => void) => void;
  const it: (name: string, fn: () => void) => void;
  const expect: any;
  const vi: any;
}

export {};
