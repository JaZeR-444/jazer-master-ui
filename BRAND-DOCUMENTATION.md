# JaZeR Brand CSS - Usage Guide

This document explains how to use the JaZeR brand CSS as the main source of truth for styling across all directories.

## Overview

The `jazer-brand.css` file is the central stylesheet that defines all brand styling, variables, components, and utilities. All HTML files should reference this file to maintain consistent theming.

## CSS Architecture

### 1. jazer-brand.css (Main Source of Truth)
- Contains all CSS variables for colors, fonts, spacing, etc.
- Defines base component styles (buttons, cards, forms, etc.)
- Includes utility classes for common styling needs
- Provides responsive and accessibility features

### 2. component-extensions.css (Optional)
- For component-specific styles that extend the base theme
- Should only include styles that build upon the base brand
- Avoid duplicating styles already in jazer-brand.css

## File Inclusion Pattern

All HTML files should include the brand CSS as follows:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Component</title>
    <!-- JaZeR Brand Stylesheet - Main source of truth -->
    <link rel="stylesheet" href="../jazer-brand.css">
    <!-- Optional: Component-specific extensions -->
    <!-- <link rel="stylesheet" href="component-extensions.css"> -->
</head>
<body>
    <!-- Your content -->
</body>
</html>
```

## CSS Variables

The brand CSS defines the following CSS variables:

### Colors
- `--jazer-cyan`: #00f2ea
- `--jazer-pink`: #ff006e
- `--jazer-purple`: #9333ea
- `--jazer-blue-light`: #00f2fe
- `--jazer-yellow`: #ffbe0b
- And more...

### Gradients
- `--gradient-primary`: linear-gradient(135deg, #00f2ea 0%, #ff006e 50%, #9333ea 100%)
- `--gradient-accent`: linear-gradient(135deg, #ff006e 0%, #9333ea 100%)
- And more...

### Spacing
- `--spacing-xs`: 0.25rem
- `--spacing-sm`: 0.5rem
- `--spacing-md`: 1rem
- `--spacing-lg`: 1.5rem
- And more...

### Typography
- `--font-primary`: 'Nunito', sans-serif
- `--font-secondary`: 'Outfit', sans-serif
- `--font-body`: 'DM Sans', sans-serif

## Components

The brand CSS includes pre-styled components:

- Buttons: `.btn`, `.btn-outline`, `.btn-ghost`
- Cards: `.card`
- Forms: Inputs, textareas, selects are styled by default
- Badges: `.badge`, `.badge-cyan`, `.badge-purple`, `.badge-pink`
- And many more...

## Utilities

The brand CSS provides utility classes for common styling patterns:

- Positioning: `.relative`, `.absolute`, `.fixed`
- Flexbox: `.flex`, `.flex-col`, `.items-center`, `.justify-center`
- Spacing: `.m-1`, `.p-2`, `.mt-3`, `.pb-4`
- Typography: `.text-center`, `.font-bold`, `.text-lg`
- And many more...

## Responsive Design

The brand CSS includes responsive design considerations with breakpoints at:
- Mobile: <= 480px
- Tablet: <= 768px
- Desktop: <= 1024px

## Accessibility

The brand CSS includes accessibility features:
- Focus states for interactive elements
- Sufficient color contrast
- Semantic HTML support

## Maintenance

To maintain consistency across all directories:

1. When creating new components, use the existing CSS variables
2. Add new variables to `jazer-brand.css` rather than hardcoding values
3. Use utility classes where possible instead of creating new CSS rules
4. Test all components at different screen sizes
5. Ensure all components are accessible