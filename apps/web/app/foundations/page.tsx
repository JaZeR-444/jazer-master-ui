import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import { LegacyBrowser, type LegacyEntry } from '@/components/LegacyBrowser';

export const metadata: Metadata = { title: 'Foundations' };

async function getManifest(): Promise<LegacyEntry[]> {
  try {
    const file = path.join(process.cwd(), 'lib', 'legacy-manifest.json');
    return JSON.parse(await fs.readFile(file, 'utf8')) as LegacyEntry[];
  } catch {
    return [];
  }
}

export default async function FoundationsPage() {
  const items = await getManifest();
  return (
    <div className="stack" style={{ gap: '2rem' }}>
      <header className="stack">
        <h1>Foundations</h1>
        <p className="muted">
          The original JaZeR vanilla library — {items.length.toLocaleString()} standalone
          HTML/CSS/JS components, preserved and served verbatim. The framework-based design system
          grows from here; nothing was thrown away.
        </p>
      </header>
      {items.length > 0 ? (
        <LegacyBrowser items={items} />
      ) : (
        <p className="muted">
          Run <code>node scripts/sync-legacy.mjs</code> to mirror the legacy library.
        </p>
      )}
    </div>
  );
}
