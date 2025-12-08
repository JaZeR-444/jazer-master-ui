# Icons

This directory contains JavaScript utilities for creating and managing SVG icons.

## Files

- `icon-utils.js` - Basic icon utilities and common icon components
- `icon-sets.js` - Collections of specialized icons (social, file types, etc.)
- `animated-icons.js` - Animated icons with CSS animation capabilities

## Usage

To use these icon utilities, import the specific module you need:

```javascript
import { createIcon, renderIcon } from './icons/icon-utils.js';

const container = document.getElementById('icon-container');
renderIcon(container, 'home', 'nav-icon', 32);
```