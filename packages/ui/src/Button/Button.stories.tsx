import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost', 'gradient'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    fullWidth: { control: 'boolean' },
    disabled: { control: 'boolean' },
    children: { control: 'text' },
  },
  args: { children: 'JaZeR', variant: 'primary', size: 'md' },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Ghost: Story = { args: { variant: 'ghost' } };
export const Gradient: Story = { args: { variant: 'gradient' } };
export const Disabled: Story = { args: { disabled: true } };

export const AllVariants: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
      <Button {...args} variant="primary">
        Primary
      </Button>
      <Button {...args} variant="secondary">
        Secondary
      </Button>
      <Button {...args} variant="ghost">
        Ghost
      </Button>
      <Button {...args} variant="gradient">
        Gradient
      </Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
      <Button {...args} size="sm">
        Small
      </Button>
      <Button {...args} size="md">
        Medium
      </Button>
      <Button {...args} size="lg">
        Large
      </Button>
    </div>
  ),
};
