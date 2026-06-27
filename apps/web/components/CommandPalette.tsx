'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { REGISTRY } from '@/lib/registry';

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName ?? '';
      const typing = tag === 'INPUT' || tag === 'TEXTAREA';
      if (e.key === '/' && !open && !typing) {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return REGISTRY.slice(0, 8);
    return REGISTRY.filter((r) =>
      `${r.title} ${r.tags.join(' ')} ${r.platform}`.toLowerCase().includes(s),
    ).slice(0, 12);
  }, [q]);

  function go(href: string) {
    setOpen(false);
    setQ('');
    router.push(href);
  }

  return (
    <>
      <button
        type="button"
        className="btn btn--secondary btn--sm"
        onClick={() => setOpen(true)}
        aria-keyshortcuts="/"
      >
        Search <kbd>/</kbd>
      </button>
      {open && (
        <div
          className="cmdk-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Search"
          onClick={() => setOpen(false)}
        >
          {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
          <div className="cmdk" onClick={(e) => e.stopPropagation()}>
            <input
              autoFocus
              className="cmdk-input"
              placeholder="Search components & pages…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && results[0]) go(results[0].href);
              }}
            />
            <ul className="cmdk-list">
              {results.map((r) => (
                <li key={r.id}>
                  <button type="button" className="cmdk-item" onClick={() => go(r.href)}>
                    <span>{r.title}</span>
                    <span className="cmdk-badge">{r.platform}</span>
                  </button>
                </li>
              ))}
              {results.length === 0 && <li className="cmdk-empty">No matches</li>}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
