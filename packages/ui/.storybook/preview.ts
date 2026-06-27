import type { Preview } from '@storybook/react';

// The compiled design system. Requires `pnpm --filter @jazer/styles build` first
// (Turbo handles this ordering for build-storybook via the ^build dependency).
import '@jazer/styles/css';

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    backgrounds: { disable: true }, // the design system owns the background via [data-theme]
    a11y: { test: 'error' },
  },
  globalTypes: {
    theme: {
      description: 'JaZeR theme',
      defaultValue: 'dark',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          { value: 'dark', title: 'Dark' },
          { value: 'light', title: 'Light' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', String(context.globals.theme ?? 'dark'));
      }
      return Story();
    },
  ],
};

export default preview;
