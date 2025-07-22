import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { AppProvider } from '@/components/providers/AppProvider';
import { RealtimeProvider } from '@/components/providers/RealtimeProvider';

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
        <AuthProvider>
          <RealtimeProvider>
            <AppProvider>
              {children}
            </AppProvider>
          </RealtimeProvider>
        </AuthProvider>
      </body>
    </html>
  );
} 