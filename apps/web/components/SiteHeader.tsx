import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { CommandPalette } from './CommandPalette';

const NAV = [
  { href: '/web', label: 'Web' },
  { href: '/foundations', label: 'Foundations' },
  { href: '/mobile', label: 'Mobile' },
  { href: '/docs', label: 'Docs' },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container cluster">
        <Link href="/" className="site-brand u-text-gradient">
          JaZeR
        </Link>
        <nav className="cluster" aria-label="Primary">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="cluster">
          <CommandPalette />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
