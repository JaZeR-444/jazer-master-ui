# Hooks

This directory contains JavaScript utilities that mimic React-like hooks for state management and side effects in vanilla JavaScript.

## Files

- `useClickOutside.js` - Hook to detect clicks outside an element
- `useDebounce.js` - Hook for debouncing function calls
- `useIntersectionObserver.js` - Hook for observing element visibility
- `useLocalStorage.js` - Hook for managing state in localStorage
- `state-hooks.js` - Additional hooks for state management
- `dom-hooks.js` - Additional hooks for DOM interactions

## Usage

To use these hooks, import the specific hook you need:

```javascript
import { useState } from './hooks/state-hooks.js';

const [getValue, setValue, subscribe] = useState('initial value');
console.log(getValue()); // 'initial value'

setValue('new value');
console.log(getValue()); // 'new value'
```