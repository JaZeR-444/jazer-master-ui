# Animations

This directory contains JavaScript utilities for creating animations and transitions on web pages.

## Files

- `fade-animation.js` - Functions for fading elements in and out
- `slide-animation.js` - Functions for sliding elements up, down, and toggling
- `bounce-animation.js` - Functions for bounce animations

## Usage

To use these animations, import the specific function you need:

```javascript
import { fadeIn, fadeOut } from './animations/fade-animation.js';

const element = document.getElementById('my-element');
fadeIn(element);
```