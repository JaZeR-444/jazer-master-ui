import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Mobile' };

export default function MobilePage() {
  return (
    <div className="stack" style={{ gap: '2rem' }}>
      <header className="stack">
        <h1>Mobile pillars</h1>
        <p className="muted">
          The same JaZeR tokens drive native mobile. Each platform consumes a generated theme built
          from the one source — no styles re-authored by hand.
        </p>
      </header>

      <section id="flutter" className="component-card stack">
        <span className="cmdk-badge">Dart · Flutter</span>
        <h2>Flutter</h2>
        <p className="muted">
          Consumes <code>jazer_theme.dart</code> — <code>JazerColors</code> plus{' '}
          <code>JazerTheme.dark</code> / <code>JazerTheme.light</code>. Source in{' '}
          <code>native/flutter</code>.
        </p>
      </section>

      <section id="ios" className="component-card stack">
        <span className="cmdk-badge">Swift · SwiftUI</span>
        <h2>iOS / SwiftUI</h2>
        <p className="muted">
          Consumes <code>JazerTheme.swift</code> — authored on Windows, compiled on a macOS CI
          runner. Source in <code>native/ios-swiftui</code>.
        </p>
      </section>
    </div>
  );
}
