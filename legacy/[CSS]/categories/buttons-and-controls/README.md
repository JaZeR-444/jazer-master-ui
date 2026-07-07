# Buttons & Controls Components

This directory contains all button and control components for the JaZeR UI library. All CSS files have been organized into the `css/` subdirectory and follow BEM (Block Element Modifier) naming conventions.

## Directory Structure

```
buttons-and-controls/
├── css/              # CSS files for button and control components
├── js/               # JavaScript files for button and control components
├── images/           # Image assets for button and control components
├── index.html        # Category index page
└── README.md         # This documentation
```

## Component Categories

### Button Styles
- Neon & Glow Effects
- Fill & Gradient Effects
- Click & Press Effects
- Magnetic & Interactive

### Toggle & Switch Controls
- Toggles & Switches
- Morph & Transform
- Special Effects

### Action Buttons
- Icon & Special Buttons
- Action Buttons
- Groups & Steppers

### Interactive Elements
- Hover effects
- Click animations
- Pressed states
- Loading indicators

## BEM Naming Convention

All CSS classes follow BEM methodology:
- `.button` (Block)
- `.button__icon` (Element)
- `.button--primary` (Modifier)

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