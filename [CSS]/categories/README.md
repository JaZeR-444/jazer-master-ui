# JaZeR UI Component Library - Categories

This directory contains all the CSS component categories for the JaZeR UI library. Each subdirectory represents a specific category of UI components with standardized organization.

## Directory Structure

Each category follows a consistent structure:

```
category-name/
├── css/              # CSS files for components
├── js/               # JavaScript files for components
├── images/           # Image assets for components
├── index.html        # Category index page
├── README.md         # Category documentation
└── component-files.html # Individual component files
```

## Category Organization

- **Navigation & Menus**: Components for navigation systems, menus, and routing
- **E-commerce & Products**: Components for product displays, shopping carts, and checkout flows
- **Buttons & Controls**: Interactive elements like buttons, toggles, and controls
- **Forms & Inputs**: Form elements and input components
- **Cards & Layouts**: Content containers and layout components
- **Modals & Overlays**: Popup windows, modals, and overlay components
- **Animations & Effects**: Components with special animations and visual effects

## Standards

- All CSS classes follow BEM (Block Element Modifier) naming convention
- Components are organized by function and use case
- Each component is self-contained with minimal dependencies
- Accessibility is prioritized in all components
- Responsive design is implemented by default

## Contributing

When adding new components:
1. Place CSS files in the `css/` subdirectory
2. Follow BEM naming conventions
3. Ensure accessibility standards are met
4. Test responsiveness across devices
5. Update the category's index.html file