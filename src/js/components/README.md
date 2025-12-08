# Components

This directory contains reusable JavaScript UI components for web applications.

## Files

- `accordion.js` - Accordion component with collapsible sections
- `autocomplete.js` - Autocomplete input component
- `button-behaviors.js` - Enhanced button behaviors and effects
- `calendar-component.js` - Calendar UI component
- `carousel.js` - Image/content carousel component
- `color-picker.js` - Color selection component
- `data-table.js` - Data table with sorting and filtering
- `date-picker.js` - Date selection component
- `dropdown-menu.js` - Dropdown menu component
- `file-uploader.js` - File upload component with drag and drop
- `image-gallery.js` - Image gallery with lightbox
- `modal-dialog.js` - Modal dialog component
- `multi-select.js` - Multi-select dropdown component
- `notification-center.js` - Notification display component
- `off-canvas-menu.js` - Off-canvas navigation menu
- `progress-bar.js` - Progress indicator component
- `range-slider.js` - Range selection slider
- `rating-system.js` - Rating component with stars
- `responsive-grid.js` - Responsive grid layout component
- `rich-text-editor.js` - Rich text editor component
- `search-bar.js` - Search input component
- `sidebar-navigation.js` - Sidebar navigation component
- `slider.js` - Slider component
- `stepper.js` - Step-by-step workflow component
- `sticky-header.js` - Sticky header component
- `tab-navigator.js` - Tab navigation component
- `tabs.js` - Tab panel component
- `tag-input.js` - Tag input component
- `timeline.js` - Timeline display component
- `toast-notification.js` - Toast notification component
- `tooltip.js` - Tooltip component
- `tree-view.js` - Tree view component

## Usage

To use these components, import the specific component you need:

```javascript
import { createModal } from './components/modal-dialog.js';

const modal = createModal({
  title: 'My Modal',
  content: '<p>Modal content</p>',
  buttons: ['OK', 'Cancel']
});
```