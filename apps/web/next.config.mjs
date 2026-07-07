import { fileURLToPath } from 'node:url';
import path from 'node:path';

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Compile the workspace design-system packages (they ship modern ESM / CSS).
  transpilePackages: ['@jazer/ui', '@jazer/styles'],
  // Pin the monorepo root so file-tracing is correct on Vercel (avoids picking a stray
  // lockfile elsewhere on the machine).
  outputFileTracingRoot: repoRoot,
  // Monorepo lint is wired up in M6 (CI). Keep type-checking on; skip lint during build.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
