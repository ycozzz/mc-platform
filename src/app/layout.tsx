import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = { 
  title: 'MC Practice Platform',
  description: 'Multiple Choice Practice Platform with AI-powered search'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-HK">
      <body className="bg-gray-50 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
