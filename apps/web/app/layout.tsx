import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '@jazer/styles/css';
import './app.css';
import { SiteHeader } from '@/components/SiteHeader';

export const metadata: Metadata = {
  title: {
    default: 'JaZeR — Multi-Platform Design System',
    template: '%s · JaZeR',
  },
  description:
    'A polyglot design system: web (React), Flutter, and SwiftUI generated from a single design-token source.',
};

// Set the persisted theme before first paint to avoid a flash of the wrong theme.
const noFlashTheme = `(function(){try{var t=localStorage.getItem('jazer-theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: noFlashTheme }} />
        <SiteHeader />
        <main className="site-main container">{children}</main>
        <footer className="site-footer container">
          <p className="muted">JaZeR Design System — one token source, every platform.</p>
        </footer>
      </body>
    </html>
  );
}
