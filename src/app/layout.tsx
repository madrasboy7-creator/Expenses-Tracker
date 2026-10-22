import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { ThemeProvider } from '@/lib/context/ThemeContext';

export const metadata: Metadata = {
  title: 'Lucifer Tracker — Personal Monthly Expense Tracker',
  description:
    'A private, secure, and lightweight personal monthly expense tracker built with Next.js, Supabase, and Tailwind CSS.',
  keywords: ['lucifer tracker', 'expense tracker', 'personal finance', 'monthly spending', 'INR expense manager'],
  authors: [{ name: 'Lucifer Tracker' }],
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#090d16' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 antialiased selection:bg-emerald-500 selection:text-white">
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
