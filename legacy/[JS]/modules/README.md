# Modules

This directory contains functional JavaScript modules that provide specific features and utilities.

## Files

- `cache-manager.js` - Module for managing client-side caching
- `data-validator.js` - Module for validating data structures
- `drag-and-drop-module.js` - Module for implementing drag and drop functionality
- `formatter-module.js` - Module for formatting data (dates, numbers, etc.)
- `modules.html` - HTML file demonstrating module usage
- `offline-sync-module.js` - Module for syncing data when offline
- `pagination-module.js` - Module for handling data pagination
- `request-interceptor.js` - Module for intercepting and handling HTTP requests
- `virtual-scroll-module.js` - Module for efficiently rendering large lists
- `websocket-manager.js` - Module for managing WebSocket connections

## Usage

To use these modules, import the specific module you need:

```javascript
import CacheManager from './modules/cache-manager.js';

const cache = new CacheManager({ maxSize: 100 });
cache.set('key', 'value');
const value = cache.get('key');
```