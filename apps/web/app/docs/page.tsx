import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Docs' };

export default function DocsPage() {
  return (
    <div className="stack" style={{ gap: '2rem' }}>
      <header className="stack">
        <h1>Docs</h1>
        <p className="muted">How the JaZeR design system fits together.</p>
      </header>

      <section id="tokens" className="stack">
        <h2>Design tokens</h2>
        <p className="muted">
          A single tiered token source in <code>@jazer/tokens</code> (primitives → semantic →
          dark/light themes) is compiled by Style Dictionary into SCSS, CSS custom properties,{' '}
          <code>JazerTheme.swift</code>, and <code>jazer_theme.dart</code>. Semantic theme tokens
          switch at runtime via the <code>[data-theme]</code> attribute.
        </p>
      </section>

      <section id="styles" className="stack">
        <h2>Styling</h2>
        <p className="muted">
          <code>@jazer/styles</code> is a global BEM bundle built with CSS cascade layers
          (<code>reset · base · layout · components · utilities</code>) for a predictable cascade.{' '}
          <code>@jazer/ui</code> wraps the BEM classes in typed React components.
        </p>
      </section>
    </div>
  );
}
