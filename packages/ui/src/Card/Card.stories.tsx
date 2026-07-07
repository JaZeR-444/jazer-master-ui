import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardTitle, CardBody, CardFooter } from './Card';
import { Button } from '../Button/Button';

const meta = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    variant: { control: 'select', options: ['default', 'elevated', 'gradient'] },
    interactive: { control: 'boolean' },
    compact: { control: 'boolean' },
  },
  args: { variant: 'default', interactive: false, compact: false },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

const Sample = () => (
  <>
    <CardTitle>Cyberpunk surface</CardTitle>
    <CardBody>
      One token source themes this card across web, Flutter, and SwiftUI — flip the theme and it
      follows.
    </CardBody>
    <CardFooter>
      <Button size="sm">Action</Button>
      <Button variant="ghost" size="sm">
        Dismiss
      </Button>
    </CardFooter>
  </>
);

export const Default: Story = {
  render: (args) => (
    <Card {...args} style={{ maxWidth: 360 }}>
      <Sample />
    </Card>
  ),
};

export const Elevated: Story = { ...Default, args: { variant: 'elevated' } };
export const Gradient: Story = { ...Default, args: { variant: 'gradient' } };

export const Interactive: Story = {
  args: { interactive: true },
  render: (args) => (
    <Card {...args} tabIndex={0} style={{ maxWidth: 360 }}>
      <CardTitle>Interactive card</CardTitle>
      <CardBody>
        Hover or focus me — lift, accent border, and a focus ring from the tokens.
      </CardBody>
    </Card>
  ),
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(2, 260px)' }}>
      <Card variant="default">
        <CardTitle>Default</CardTitle>
        <CardBody>Surface + border.</CardBody>
      </Card>
      <Card variant="elevated">
        <CardTitle>Elevated</CardTitle>
        <CardBody>Adds a shadow.</CardBody>
      </Card>
      <Card variant="gradient">
        <CardTitle>Gradient</CardTitle>
        <CardBody>Brand gradient border.</CardBody>
      </Card>
      <Card variant="default" compact>
        <CardTitle>Compact</CardTitle>
        <CardBody>Tighter padding.</CardBody>
      </Card>
    </div>
  ),
};
