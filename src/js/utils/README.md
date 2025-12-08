# Utilities

This directory contains JavaScript utility functions for common operations and tasks.

## Files

- `animation-utilities.js` - Utilities for handling animations
- `array-utilities.js` - Utilities for array operations
- `color-utilities.js` - Utilities for color manipulation
- `date-utilities.js` - Utilities for date operations
- `debounce-throttle-utilities.js` - Utilities for debounce and throttle
- `dom-utilities.js` - Utilities for DOM manipulation
- `focus-trap-utilities.js` - Utilities for managing focus traps
- `keyboard-shortcut-utilities.js` - Utilities for handling keyboard shortcuts
- `object-utilities.js` - Utilities for object operations
- `scroll-utilities.js` - Utilities for scroll handling
- `storage-utilities.js` - Utilities for local/session storage
- `string-utilities.js` - Utilities for string operations
- `utility-components.js` - Reusable utility components
- `utils.html` - HTML file demonstrating utility usage
- `validation-utilities.js` - Utilities for data validation

## Usage

To use these utilities, import the specific module you need:

```javascript
import { debounce } from './utils/debounce-throttle-utilities.js';

const debouncedFunction = debounce(myFunction, 300);
```