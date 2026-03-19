// ============================================================
// Root Layout — RTL + Dark Mode + Toast + Fonts
// ============================================================

import type { Metadata, Viewport } from 'next';
import { Toaster } from 'react-hot-toast';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'كنيسة الثلاثة فتية القديسين',
  description: 'نظام إدارة الخدمة الإعدادية والثانوية — كنيسة الثلاثة فتية القديسين بأسوان',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon-192x192.png',
    apple: '/icon-192x192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'الثلاثة فتية',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#1e3a8a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        {/* Dark mode init script — prevents flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (theme === 'dark' || (!theme && prefersDark)) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="font-cairo antialiased bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              fontFamily: 'Cairo, sans-serif',
              fontSize: '14px',
              fontWeight: '600',
              direction: 'rtl',
              borderRadius: '12px',
              padding: '12px 16px',
            },
            success: {
              style: { background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' },
              iconTheme: { primary: '#16a34a', secondary: '#fff' },
            },
            error: {
              style: { background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' },
              iconTheme: { primary: '#dc2626', secondary: '#fff' },
            },
          }}
        />
      </body>
    </html>
  );
}
