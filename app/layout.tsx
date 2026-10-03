import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Rysie 2026 – Oficjalny Panel Liczenia Głosów',
  description: 'Aplikacja do zliczania głosów w plebiscycie nauczycielskim Rysie 2026. Złoty zwycięzca i srebrni nominowani w 6 kategoriach filmowych.',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" className="dark" suppressHydrationWarning>
      <head>
        {/* Prevent theme flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('rysie_theme') || 'dark';
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen transition-colors duration-200 antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
