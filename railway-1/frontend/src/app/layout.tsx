import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ManifestorProvider } from '@/providers/ManifestorProvider';
import { ConsciousnessProvider } from '@/components/consciousness/ConsciousnessEngine';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { ModalProvider } from '@/components/ui/Modal';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import KeyboardShortcuts from '@/components/ui/KeyboardShortcuts';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI-BOS - Digital Consciousness',
  description: 'A living, breathing digital consciousness system with enterprise-grade applications',
  keywords: ['AI', 'consciousness', 'digital workspace', 'productivity', 'enterprise'],
  authors: [{ name: 'AI-BOS Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'AI-BOS - Digital Consciousness',
    description: 'A living, breathing digital consciousness system',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI-BOS - Digital Consciousness',
    description: 'A living, breathing digital consciousness system',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full antialiased`}>
        <ErrorBoundary>
          <ManifestorProvider>
            <ConsciousnessProvider>
              <AuthProvider>
                <ModalProvider>
                  {children}
                  <KeyboardShortcuts />
                </ModalProvider>
              </AuthProvider>
            </ConsciousnessProvider>
          </ManifestorProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
