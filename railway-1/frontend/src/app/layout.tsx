import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { AppProvider } from '@/components/providers/AppProvider';
import { RealtimeProvider } from '@/components/providers/RealtimeProvider';
import { SystemCoreProvider } from '@/components/shell/SystemCore';
import { StateManagerProvider } from '@/components/shell/StateManager';
import ToastProvider from '@/components/ui/Toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'AI-BOS Platform',
  description: 'The Windows OS for SaaS - Unified platform for micro-apps',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SystemCoreProvider
          config={{
            features: {
              ai: true,
              realtime: true,
              analytics: true,
              telemetry: true
            }
          }}
        >
          <StateManagerProvider>
            <AuthProvider>
              <RealtimeProvider>
                <AppProvider>
                  <ToastProvider>
                    {children}
                  </ToastProvider>
                </AppProvider>
              </RealtimeProvider>
            </AuthProvider>
          </StateManagerProvider>
        </SystemCoreProvider>
      </body>
    </html>
  );
}
