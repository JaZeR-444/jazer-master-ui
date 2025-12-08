# JaZeR Component Library

## Project Overview

The JaZeR Component Library is a comprehensive JavaScript component library that provides reusable UI components and utilities for web development. It includes a wide range of accessible, styled components with enhanced functionality and a complete theming system. The project is structured as an organized collection of components, modules, and utilities with corresponding HTML documentation pages.

### Key Technologies & Architecture

- **JavaScript (ES6)**: All components are implemented using ES6 classes with modern JavaScript features
- **CSS Framework**: Uses the `jazer-brand.css` stylesheet as the main source of truth for styling
- **Component Architecture**: Each component is implemented as a reusable class with initialization methods
- **Accessibility**: All components include proper ARIA attributes and keyboard navigation support
- **Modular Design**: Components can be imported individually and used as modules or globally
- **Auto-initialization**: Components auto-initialize when the DOM is ready

### Project Structure

```
[JS]/
├── add-copy-buttons.js          # Script to add copy functionality to HTML files
├── add-favorites.js             # Script to add favorites features to HTML files  
├── add-immediate-theme.js       # Script to add immediate theming to HTML files
├── add-theme-toggle.js          # Script to add theme toggle to HTML files
├── fix-download-simple.js       # Script to fix download functionality in HTML files
├── fix-theme-toggle-click.js    # Script to fix theme toggle click behavior
├── move-theme-toggle-inline.js  # Script to move theme toggle inline
├── update-copy-code.js          # Script to update copy code functionality
├── update-to-download.js        # Script to update to download functionality
├── components/                  # Reusable UI components
│   ├── accordion.js             # Accessible accordion component
│   ├── autocomplete.js          # Autocomplete input component
│   ├── button-behaviors.js      # Enhanced button interactions
│   ├── data-table.js            # Data table with sorting and filtering
│   ├── date-picker.js           # Date picker component
│   ├── dropdown-menu.js         # Dropdown menu component
│   ├── image-gallery.js         # Image gallery component
│   ├── modal-dialog.js          # Modal dialog system
│   ├── slider.js                # Slider component
│   ├── tab-navigator.js         # Tab navigation component
│   ├── tabs.js                  # Tabs component
│   ├── toast-notification.js    # Toast notification system
│   └── tooltip.js               # Tooltip component
├── modules/                     # JavaScript modules
│   └── modules.html             # HTML page listing modules
├── utils/                       # Utility functions and components
│   ├── utility-components.js    # Utility functions
│   └── utils.html               # HTML page listing utilities
└── QWEN.md                      # This documentation file
```

### Components

The library includes several categories of components:

1. **Interactive Components**:
   - Accordion: Expandable/collapsible sections
   - Modal Dialog: Reusable modal system with various options
   - Tabs: Tabbed interface with keyboard navigation
   - Date Picker: Date selection component
   - Autocomplete: Input with suggest functionality
   - Dropdown Menu: Accessible dropdown menus

2. **UI Elements**:
   - Button Behaviors: Enhanced button interactions with loading states, toggles, and animations
   - Tooltip: Dynamic tooltips for elements
   - Toast Notification: Notification messages with different types
   - Image Gallery: Gallery with navigation controls

3. **Data Presentation**:
   - Data Table: Table with sorting, filtering, and pagination
   - Slider: Range selection component

### Modules

The modules section contains utility modules for specific functionality:
- API Client Module: HTTP client with request/response handling
- State Manager Module: Centralized state management
- Router Module: Client-side routing
- Auth Service Module: Authentication system
- Local Storage Wrapper: Enhanced storage API
- Event Emitter: Pub/sub pattern for events
- Cache Manager: Caching utilities
- Formatter Utils: Formatting functions

### Utilities

The utilities section provides helper functions:
- Copy to Clipboard: Function to copy text to clipboard
- Debounce Function: Optimization function for repeated calls
- Email Validation: Email validation with regex
- Format Number: Add commas to numbers
- Notification Utilities: Show toast notifications
- Spinner Overlay: Loading indicators
- Tooltip System: Dynamic tooltips
- Confirmation Dialog: Modal for confirming actions

### Development Conventions

1. **Class Structure**: All components use ES6 classes with consistent constructor patterns
2. **Auto-initialization**: Components automatically initialize when DOM is ready
3. **Data Attributes**: Components can be initialized using data attributes
4. **Accessibility**: All components include proper ARIA attributes and keyboard navigation
5. **Animation**: Components include smooth animations for better user experience
6. **Error Handling**: Components include appropriate error handling and fallbacks
7. **Export Patterns**: Components support both module and global usage

### Building and Running

The project doesn't appear to have a traditional build system. Instead, it relies on:

1. **Direct Script Usage**: Components can be included directly in HTML pages
2. **Auto-initialization**: Components automatically initialize when DOM is ready
3. **Script Utilities**: Various utility scripts to add functionality to HTML files

To use the components in your project:

1. Link to the `jazer-brand.css` stylesheet
2. Include the component JavaScript file
3. Either use the component with data attributes or initialize it programmatically

Example:
```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="path/to/jazer-brand.css">
</head>
<body>
  <div class="accordion" data-accordion>
    <div class="accordion-item">
      <div class="accordion-header">Section 1</div>
      <div class="accordion-content">Content for section 1</div>
    </div>
  </div>

  <script src="path/to/components/accordion.js"></script>
</body>
</html>
```

### Script Utilities

The project includes several Node.js scripts for managing HTML files:
- `add-theme-toggle.js`: Adds theme toggle functionality to HTML files
- `add-copy-buttons.js`: Adds copy functionality to HTML files
- Various fix scripts to improve functionality in generated HTML files

The library uses a consistent theming system with support for light/dark modes, with theme preferences stored in localStorage.