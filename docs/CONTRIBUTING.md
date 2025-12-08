# Contributing to JaZeR UI

Thank you for your interest in contributing to the JaZeR UI component library! This document outlines the guidelines for contributing to this project.

## File Organization

When adding new components, please follow the existing directory structure:

- **HTML files** should be placed in the appropriate subdirectory under `[HTML]/`:
  - `[HTML]/components/` - UI components (buttons, cards, modals, etc.)
  - `[HTML]/forms/` - Form templates and input components
  - `[HTML]/layouts/` - Page layout templates
  - `[HTML]/navigation/` - Navigation elements and menus
  - `[HTML]/media/` - Media components (images, videos, galleries)
  - `[HTML]/utilities/` - Utility components and helpers
  - `[HTML]/patterns/` - Complete page patterns

- **CSS files** should be placed under `[CSS]/`:
  - `[CSS]/base/` - Base styles and resets
  - `[CSS]/components/` - Component-specific styles
  - `[CSS]/categories/` - Category-based CSS examples

- **JavaScript files** should be placed under `[JS]/`:
  - `[JS]/components/` - JavaScript for components
  - `[JS]/utils/` - Utility functions
  - `[JS]/modules/` - Reusable modules

## Naming Conventions

- Use descriptive names for files and directories
- Use kebab-case for file names (e.g., `button-primary.html`, `form-contact.html`)
- Group related files with similar prefixes when appropriate

## Adding New Components

1. Create your HTML file in the appropriate directory
2. If needed, add corresponding CSS in the [CSS]/components/ directory
3. If needed, add corresponding JavaScript in the [JS]/components/ directory
4. Update the README.md if necessary to document the new component
5. Test the component in different browsers to ensure compatibility

## Code Standards

- Follow consistent indentation (use either 2 or 4 spaces consistently)
- Write semantic HTML that is accessible
- Use CSS classes that are descriptive and follow BEM methodology when appropriate
- Write JavaScript that is compatible with modern browsers
- Include appropriate comments for complex code sections

## Pull Request Process

1. Fork the repository
2. Create a new branch for your feature or bug fix
3. Make your changes following the guidelines above
4. Submit a pull request with a clear description of your changes