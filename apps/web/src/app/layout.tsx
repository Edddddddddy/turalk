import type { Metadata } from 'next';

import { SiteHeader } from '../components/site-header';
import { AuthProvider } from '../features/auth';
import './globals.css';

export const metadata: Metadata = {
  description: 'A privacy-conscious community for anime game players.',
  title: {
    default: 'Turalk',
    template: '%s | Turalk',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <AuthProvider>
          <SiteHeader />
          <main className="page-shell">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
