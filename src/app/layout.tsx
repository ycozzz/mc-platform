import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = { title: 'MC Practice' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <nav className="bg-white shadow p-4 mb-6">
          <div className="max-w-3xl mx-auto flex gap-4">
            <a href="/" className="font-bold text-blue-600">MC Practice</a>
            <a href="/history" className="text-gray-600 hover:text-blue-600">History</a>
          </div>
        </nav>
        <main className="max-w-3xl mx-auto px-4">{children}</main>
      </body>
    </html>
  );
}
