'use client';
import { Button, Card, CardTitle, CardBody, CardFooter } from '@jazer/ui';
import { useFavorites } from '@/lib/useFavorites';

const SNIPPET = `import { Button } from '@jazer/ui';

<Button variant="primary" size="lg">Click me</Button>`;

const CARD_SNIPPET = `import { Card, CardTitle, CardBody, CardFooter } from '@jazer/ui';

<Card variant="gradient">
  <CardTitle>Title</CardTitle>
  <CardBody>Body copy.</CardBody>
  <CardFooter><Button size="sm">Action</Button></CardFooter>
</Card>`;

export default function WebPage() {
  const { has, toggle } = useFavorites();

  return (
    <div className="stack" style={{ gap: '2rem' }}>
      <header className="stack">
        <h1>Web components</h1>
        <p className="muted">
          Typed React components from <code>@jazer/ui</code>, styled by the{' '}
          <code>@jazer/styles</code> design system. One token source — switch the theme with the
          toggle above.
        </p>
      </header>

      <section id="button" className="component-card stack">
        <div className="cluster" style={{ justifyContent: 'space-between' }}>
          <h2>Button</h2>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => toggle('button')}
            aria-pressed={has('button')}
          >
            {has('button') ? '★ Favorited' : '☆ Favorite'}
          </button>
        </div>

        <div className="cluster">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="gradient">Gradient</Button>
        </div>

        <div className="cluster">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
          <Button disabled>Disabled</Button>
        </div>

        <pre className="code">
          <code>{SNIPPET}</code>
        </pre>
      </section>

      <section id="card" className="component-card stack">
        <div className="cluster" style={{ justifyContent: 'space-between' }}>
          <h2>Card</h2>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => toggle('card')}
            aria-pressed={has('card')}
          >
            {has('card') ? '★ Favorited' : '☆ Favorite'}
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          }}
        >
          <Card>
            <CardTitle>Default</CardTitle>
            <CardBody>Surface, border, and text straight from the token theme.</CardBody>
          </Card>
          <Card variant="elevated">
            <CardTitle>Elevated</CardTitle>
            <CardBody>Same tokens, plus a shadow.</CardBody>
          </Card>
          <Card variant="gradient">
            <CardTitle>Gradient</CardTitle>
            <CardBody>Brand gradient border from the shared palette.</CardBody>
            <CardFooter>
              <Button size="sm">Action</Button>
              <Button variant="ghost" size="sm">
                Dismiss
              </Button>
            </CardFooter>
          </Card>
        </div>

        <pre className="code">
          <code>{CARD_SNIPPET}</code>
        </pre>
      </section>
    </div>
  );
}
