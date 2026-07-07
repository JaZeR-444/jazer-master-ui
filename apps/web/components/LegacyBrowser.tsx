'use client';
import { useMemo, useState } from 'react';

export interface LegacyEntry {
  lib: string;
  category: string;
  name: string;
  href: string;
}

const PAGE_SIZE = 120;

export function LegacyBrowser({ items }: { items: LegacyEntry[] }) {
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    const base = s
      ? items.filter((i) => `${i.name} ${i.category} ${i.lib}`.toLowerCase().includes(s))
      : items;
    return base.slice(0, PAGE_SIZE);
  }, [q, items]);

  return (
    <div className="stack">
      <input
        className="cmdk-input"
        style={{ border: '1px solid var(--theme-border)', borderRadius: 'var(--radius-md)' }}
        placeholder={`Filter ${items.length.toLocaleString()} components…`}
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <p className="muted">
        Showing {filtered.length} of {items.length.toLocaleString()}
      </p>
      <ul className="legacy-grid" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {filtered.map((i) => (
          <li key={i.href} className="legacy-card">
            <a href={i.href} target="_blank" rel="noreferrer">
              <strong>{i.name}</strong>
              <span className="cmdk-badge">{i.lib}</span>
              <span className="muted">{i.category}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
