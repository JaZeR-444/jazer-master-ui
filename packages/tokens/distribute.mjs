// Copy the generated native theme files into their native projects. This is the
// "commit into the consumer" contract: the native apps build from plain committed
// files and never run the Node token pipeline. copyFile is deterministic, so the
// copies stay byte-identical to packages/tokens/generated for the CI drift check.
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const pkgRoot = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(pkgRoot, '..', '..');

const targets = [
  {
    from: 'generated/flutter/jazer_theme.dart',
    to: 'native/flutter/lib/generated/jazer_theme.dart',
  },
  {
    from: 'generated/ios/JazerTheme.swift',
    to: 'native/ios-swiftui/Sources/JazerShowcase/Generated/JazerTheme.swift',
  },
];

for (const t of targets) {
  const dest = path.join(repoRoot, t.to);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.copyFile(path.join(pkgRoot, t.from), dest);
  console.log(`✓ distributed ${t.to}`);
}
