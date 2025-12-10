# JaZeR Component Library

## Project Overview

The JaZeR Component Library is a comprehensive, copy-paste-ready reference library of vanilla HTML, CSS, and JavaScript components and patterns. It provides a unified component library system with 1,280+ components across three core libraries: HTML, CSS, and JavaScript.

The library features:
- 100% Vanilla components with no frameworks or dependencies
- Copy-paste ready code that is self-contained and complete
- Fully responsive, mobile-first design that adapts to all screen sizes
- Accessibility features including ARIA labels, semantic HTML, and keyboard navigation
- Modern CSS using Flexbox, Grid, and CSS custom properties
- Global search functionality across all components
- Favorites system to save components for quick access
- Dark/light theme support persisted across sessions

## Project Structure

```
/
|- index.html                    # Hub page with global search
|- [HTML]/                       # HTML components library
|  |- Directories/
|  |  |- ALL-IN-ONE-HOME.html    # HTML library home page
|- [CSS]/                        # CSS components library
|  |- categories/
|  |  |- MASTER-INDEX.html       # CSS library home page
|  |  |- buttons-and-controls/
|  |  |- forms-status-and-micro-ux/
|  |  |- navigation-and-menus/
|  |  '- ... (17 categories, 900+ CSS components)
|- [JS]/                         # JavaScript modules library
|  |- all-components.html        # JS library home page
|  |- animations/
|  |- charts/
|  |- components/                # Interactive JS components
|  |- forms/
|  |- hooks/
|  |- icons/
|  |- modules/
|  |- patterns/
|  |- templates/
|  |- themes/
|  '- utils/                     # 133+ JS modules and utilities
|- jazer-brand.css               # Main stylesheet with brand styling
|- scripts/                      # Build and generation scripts
|  |- generate-subdirectory-indexes.js
|  |- build-search-index.js
|  |- update-component-counts.js
|  '- ... (additional build scripts)
'- assets/                       # Asset files
```

## Library Statistics

| Library | Type | Count |
|---------|------|-------|
| **HTML** | Components | 247+ |
| **CSS** | Styles | 900+ |
| **JavaScript** | Modules | 133+ |
| **Total** | | **1,280+** |

## Building and Running

### Prerequisites
- Node.js >= 20.11.0

### Installation
```bash
npm install
```

### Development Commands
```bash
# Start development server
npm run dev

# Build the project
npm run build

# Run linting for all files
npm run lint

# Run JavaScript linting
npm run lint:js

# Run CSS linting
npm run lint:css

# Run HTML linting
npm run lint:html

# Run formatting
npm run format

# Run tests
npm run test

# Run tests in CI mode
npm run test:ci

# Create a new component
npm run create
```

### Serving the Library
To serve the built library:
```bash
npm run start
```
This will serve the contents of the `dist` directory on port 5173.

## Development Conventions

### Component Structure
- Each HTML component file is self-contained with all necessary HTML, CSS, and JS
- CSS components use modern techniques (Flexbox, Grid, CSS variables)
- JavaScript components are implemented as ES6 classes with consistent constructor patterns
- All components include proper ARIA attributes and keyboard navigation support
- Components follow a mobile-first responsive design approach

### Theming
- The library supports both dark and light themes
- Themes are managed through CSS custom properties in `jazer-brand.css`
- Theme preference is stored in localStorage and persists across sessions
- The theme system uses `data-theme` attributes to manage light/dark modes

### JavaScript Architecture
- Components use ES6 classes with consistent constructor patterns
- Auto-initialization happens when DOM is ready using data attributes
- Components can be initialized programmatically or automatically via `data-*` attributes
- Public APIs are exposed for both module and global usage
- Components include proper cleanup methods to prevent memory leaks

### CSS Architecture
- CSS variables are defined in `jazer-brand.css` for consistent theming
- The library uses a cyberpunk-inspired color palette with gradients and animations
- Components are designed with a focus on visual aesthetics and modern UI patterns
- CSS includes responsive breakpoints for all screen sizes

## Adding New Components

To add new components:

1. Create a new `.html` file in the appropriate directory within `[HTML]/`, `[CSS]/categories/` or `[JS]/`
2. Follow the existing naming conventions:
   - HTML: `CATEGORY-component-name.html`
   - CSS: `component-name.html` within category subdirectories
   - JS: `component-name.js` within component directories
3. Make the file self-contained (include all HTML, CSS, JS if applicable)
4. Add clear comments explaining how the component works
5. Run the regeneration scripts to update indexes:

```bash
# Regenerate all subdirectory index pages (with favorites)
npm run build

# Or run specific scripts
node scripts/generate-subdirectory-indexes.js
node scripts/update-component-counts.js
node scripts/build-search-index.js
```

## Key Features

### Favorites System
- Click the heart icon on any component to save it to your favorites
- Favorites persist across sessions using localStorage
- Click the "Favorites" button to filter and show only favorites
- Separate favorites for HTML, CSS, and JS libraries

### Global Search
- Search across all 3 libraries simultaneously from the hub page
- Matches by title, filename, category, and keywords
- Shows up to 15 results at a time
- Color-coded badges indicate the library type

### Responsive Design
- All components use a mobile-first approach
- Fluid layouts that adapt to any screen size
- Touch-friendly interactive elements
- Optimized for both desktop and mobile viewing

### Accessibility
- All components include proper ARIA attributes
- Keyboard navigation support for all interactive elements
- Semantic HTML structure
- Proper focus management and focus trapping where needed

## File Organization

JavaScript components are organized into several categories:
- **Components**: Interactive UI components (carousel, modal, etc.)
- **Modules**: Core functionality modules (validation, formatter, etc.)
- **Utils**: Utility functions for common tasks (DOM manipulation, etc.)
- **Animations**: Animation utilities and helpers
- **Forms**: Form-related functionality
- **Themes**: Theme management utilities

CSS components are organized by category in the `[CSS]/categories/` directory with over 17 categories containing 900+ styles.

HTML components are organized by type in subdirectories under `[HTML]/` with 247+ structural components.

## Styling System

The `jazer-brand.css` file serves as the main stylesheet and includes:
- CSS variables for colors, fonts, spacing, and theming
- Predefined animations and transitions
- Typography styles and link styling
- Button styles with hover effects
- Card and layout components
- Responsive breakpoints
- Light/dark mode overrides
- Accessibility enhancements

The styling uses a vibrant cyberpunk-inspired color palette with gradients, neon effects, and glass morphism patterns.
