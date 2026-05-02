import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from 'sonner';
import dynamic from 'next/dynamic';

const CustomCursor  = dynamic(() => import('@/components/shared/CustomCursor'),  { ssr: false });
const GlobalEffects = dynamic(() => import('@/components/shared/GlobalEffects'), { ssr: false });

export const metadata: Metadata = {
  title: "Exponent: AI-Powered Indian Stock Market Platform",
  description: "Track Indian stocks, manage your portfolio, and get AI-powered insights with real-time NSE/BSE market data.",
  keywords: "indian stocks, portfolio tracker, NSE, BSE, stock screener, market data",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{
          __html: `
            try {
              const theme = localStorage.getItem('Exponent-theme') || 'dark';
              document.documentElement.classList.add(theme);
              if (theme === 'dark') document.documentElement.classList.remove('light');
              else document.documentElement.classList.remove('dark');
            } catch(e) {}
          `,
        }} />
      </head>
      <body className="antialiased">
        <CustomCursor />
        <GlobalEffects />
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(10,10,18,0.95)',
              border: '1px solid rgba(255,255,255,0.06)',
              color: '#e4e4e7',
              borderRadius: '12px',
              fontSize: '13px',
            },
          }}
        />
      </body>
    </html>
  );
}
