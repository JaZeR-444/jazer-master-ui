# Forms

This directory contains JavaScript utilities for handling form validation, processing, and management.

## Files

- `form-validator.js` - Form validation utilities with common validation rules
- `form-helpers.js` - Helper functions for form serialization, population, and management
- `form-processor.js` - Form submission processor with success/error handling

## Usage

To use these form utilities, import the specific module you need:

```javascript
import FormValidator from './forms/form-validator.js';

const form = document.getElementById('my-form');
const validator = new FormValidator(form);

validator.addRule('email', FormValidator.email, 'Please enter a valid email');
validator.addRule('password', FormValidator.minLength(8), 'Password must be at least 8 characters');

const { isValid, errors } = validator.validate();
```