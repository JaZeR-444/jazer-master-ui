'use client';
import { useCallback, useEffect, useState } from 'react';

const KEY = 'jazer-favorites';

/** Favorites persisted to localStorage (carried over from the V1 Hub). */
export function useFavorites() {
  const [favs, setFavs] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setFavs(JSON.parse(raw) as string[]);
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback((id: string) => {
    setFavs((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const has = useCallback((id: string) => favs.includes(id), [favs]);

  return { favs, toggle, has };
}
