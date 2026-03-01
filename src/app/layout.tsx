import type { Metadata, Viewport } from 'next';
import './globals.css';
import PinGate from '@/components/PinGate';
import BottomNav from '@/components/BottomNav';

export const metadata: Metadata = {
  title: 'Manny Tracker',
  description: 'Behavior tracking for Manny',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Manny',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="antialiased bg-gray-50">
        <PinGate>
          <main className="pb-20">{children}</main>
          <BottomNav />
        </PinGate>
      </body>
    </html>
  );
}
