export type Platform = 'web' | 'flutter' | 'ios' | 'docs' | 'foundations';

export interface RegistryEntry {
  id: string;
  title: string;
  platform: Platform;
  href: string;
  tags: string[];
}

/**
 * Typed component/page registry that powers the "/" command palette. Replaces the V1
 * approach of scraping HTML for a search index — structured data with platform metadata.
 */
export const REGISTRY: RegistryEntry[] = [
  {
    id: 'button',
    title: 'Button',
    platform: 'web',
    href: '/web#button',
    tags: ['btn', 'action', 'cta', 'component'],
  },
  {
    id: 'card',
    title: 'Card',
    platform: 'web',
    href: '/web#card',
    tags: ['card', 'surface', 'panel', 'content', 'component'],
  },
  {
    id: 'web',
    title: 'Web components',
    platform: 'web',
    href: '/web',
    tags: ['react', 'showcase', 'ui'],
  },
  {
    id: 'foundations',
    title: 'Foundations (legacy library)',
    platform: 'foundations',
    href: '/foundations',
    tags: ['html', 'css', 'js', 'vanilla', 'legacy'],
  },
  {
    id: 'flutter',
    title: 'Flutter pillar',
    platform: 'flutter',
    href: '/mobile#flutter',
    tags: ['dart', 'mobile', 'native'],
  },
  {
    id: 'ios',
    title: 'SwiftUI pillar',
    platform: 'ios',
    href: '/mobile#ios',
    tags: ['swift', 'xcode', 'mobile', 'native'],
  },
  {
    id: 'tokens',
    title: 'Design tokens',
    platform: 'docs',
    href: '/docs#tokens',
    tags: ['tokens', 'theme', 'color', 'style-dictionary'],
  },
  { id: 'docs', title: 'Docs', platform: 'docs', href: '/docs', tags: ['guide', 'usage'] },
];
