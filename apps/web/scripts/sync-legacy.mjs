// Mirror the frozen V1 library (/legacy) into apps/web/public/legacy so the ~2,000
// standalone files are served as static assets, and emit a manifest the Foundations
// page reads. Source of truth stays in /legacy; the public copy is generated + gitignored.
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(webRoot, '..', '..');
const legacySrc = path.join(repoRoot, 'legacy');
const legacyDest = path.join(webRoot, 'public', 'legacy');
const manifestPath = path.join(webRoot, 'lib', 'legacy-manifest.json');

async function walk(dir, out) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full, out);
    } else if (entry.name.endsWith('.html')) {
      const rel = path.relative(legacyDest, full).split(path.sep).join('/');
      const parts = rel.split('/');
      const lib = (parts[0] ?? '').replace(/[[\]]/g, ''); // HTML | CSS | JS
      const category = parts.length > 2 ? parts[parts.length - 2] : lib;
      out.push({ lib, category, name: entry.name.replace(/\.html$/, ''), href: '/legacy/' + rel });
    }
  }
}

async function main() {
  try {
    await fs.access(legacySrc);
  } catch {
    console.warn('! /legacy not found — skipping legacy sync');
    await fs.mkdir(path.dirname(manifestPath), { recursive: true });
    await fs.writeFile(manifestPath, '[]');
    return;
  }

  await fs.rm(legacyDest, { recursive: true, force: true });
  await fs.cp(legacySrc, legacyDest, { recursive: true });

  const entries = [];
  await walk(legacyDest, entries);
  entries.sort((a, b) => a.href.localeCompare(b.href));

  await fs.mkdir(path.dirname(manifestPath), { recursive: true });
  await fs.writeFile(manifestPath, JSON.stringify(entries));
  console.log(`✓ legacy synced: ${entries.length} html files -> public/legacy + lib/legacy-manifest.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
