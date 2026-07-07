# Navigation & Menus Components

This directory contains all navigation and menu components for the JaZeR UI library. All CSS files have been organized into the `css/` subdirectory and follow BEM (Block Element Modifier) naming conventions.

## Directory Structure

```
navigation-and-menus/
├── css/              # CSS files for navigation components
│   ├── dropdown-menus.css
│   ├── hamburger-menu.css
│   ├── tab-navigation.css
│   ├── off-canvas-menu.css
│   ├── sticky-navigation.css
│   ├── mega-menu.css
│   ├── breadcrumb-navigation.css
│   ├── mobile-navigation.css
│   ├── sidebar-navigation.css
│   └── top-navigation.css
├── js/               # JavaScript files for navigation components
├── images/           # Image assets for navigation components
├── index.html        # Category index page
└── README.md         # This documentation
```

## Component Categories

### Navigation Bars
- Top navigation bars
- Auto-hide on scroll
- Sticky navigation
- Split dual-bar navigation

### Sidebars & Vertical Navigation
- Side rail navigation
- Elastic sidebar
- Icon-only dock navigation
- Vertical accordion menu

### Tabs & Tab Bars
- Neon tabs
- Pill-style tabs
- Underline-style tabs
- Tab switcher controls

### Breadcrumbs & Trails
- Standard breadcrumbs
- Fade-in effects
- Collapsing ellipsis for long paths

### Dropdown & Mega Menus
- Slide and fade dropdowns
- Curtain drop mega menus
- Context right-click menus

### Mobile & Overlay Menus
- Slide-in panels
- Fullscreen overlays
- Hamburger icon morphing
- Gesture swipe navigation

### Circular & Radial Menus
- Flyout circular menus
- Radial menu layouts
- Floating action button menus

## BEM Naming Convention

All CSS classes follow BEM methodology:
- `.navigation-menu` (Block)
- `.navigation-menu__item` (Element)
- `.navigation-menu__item--active` (Modifier)

## Usage

To use any component:
1. Include the relevant CSS file from the `css/` directory
2. Implement the HTML structure as shown in the component file
3. Add any necessary JavaScript from the `js/` directory if required

## Standards

- All components are responsive by default
- Accessibility standards are implemented
- CSS follows BEM naming convention
- Components have minimal dependencies
- Cross-browser compatibility is maintained