# Templates

This directory contains JavaScript utilities for generating HTML templates and scaffolding.

## Files

- `component-template.js` - Template for creating reusable components
- `form-template.js` - Template for creating forms
- `modal-template.js` - Template for creating modal dialogs
- `page-templates.js` - Templates for complete HTML pages
- `utility-templates.js` - Various utility templates (components, APIs, tests)

## Usage

To use these templates, import the specific template you need:

```javascript
import { createPageTemplate } from './templates/page-templates.js';

const html = createPageTemplate('My Page', '<h1>Hello World</h1>', {
  cssFiles: ['styles.css'],
  jsFiles: ['script.js']
});
```