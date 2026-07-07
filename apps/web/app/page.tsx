import Link from 'next/link';

const PILLARS = [
  {
    href: '/web',
    title: 'Web',
    desc: 'Typed React components on the SCSS design system.',
    tag: 'React · Next.js',
  },
  {
    href: '/foundations',
    title: 'Foundations',
    desc: 'The original ~2,000 vanilla components, preserved.',
    tag: 'HTML · CSS · JS',
  },
  {
    href: '/mobile',
    title: 'Mobile',
    desc: 'Flutter & SwiftUI generated from the same tokens.',
    tag: 'Dart · Swift',
  },
  { href: '/docs', title: 'Docs', desc: 'Tokens, theming, and usage.', tag: 'Guide' },
];

export default function HomePage() {
  return (
    <div className="stack" style={{ gap: '3rem' }}>
      <section className="hero stack">
        <h1 className="u-text-gradient hero-title">
          One design language.
          <br />
          Every platform.
        </h1>
        <p className="hero-sub">
          A polyglot design system — web, Flutter, and SwiftUI generated from a single design-token
          source. Press <kbd>/</kbd> to search.
        </p>
        <div className="cluster">
          <Link className="btn btn--primary btn--lg" href="/web">
            Explore web
          </Link>
          <Link className="btn btn--secondary btn--lg" href="/foundations">
            Browse foundations
          </Link>
        </div>
      </section>

      <section className="pillar-grid">
        {PILLARS.map((p) => (
          <Link key={p.href} href={p.href} className="pillar-card stack">
            <span className="cmdk-badge">{p.tag}</span>
            <h2>{p.title}</h2>
            <p className="muted">{p.desc}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
