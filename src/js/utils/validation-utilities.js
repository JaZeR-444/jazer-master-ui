/**
 * Validation Utilities Module
 * Comprehensive validation utilities for forms, data, and more
 * Compatible with jazer-brand.css styling for validation-related utilities
 */

class ValidationUtils {
  /**
   * Creates a new validation utilities instance
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      showErrors: true,
      errorClass: 'validation-error',
      successClass: 'validation-success',
      errorElementClass: 'validation-message',
      validateOnBlur: true,
      validateOnChange: true,
      validateOnSubmit: true,
      ...options
    };

    this.validators = new Map(); // Store custom validators
    this.fieldValidators = new Map(); // Store field-specfic validators
    
    this.init();
  }

  /**
   * Initializes the validation utilities
   */
  init() {
    // Register default validation rules
    this.registerDefaults();
  }

  /**
   * Registers default validation rules
   */
  registerDefaults() {
    // Required validator
    this.addValidator('required', (value) => {
      if (value === null || value === undefined) return false;
      if (typeof value === 'string') return value.trim().length > 0;
      if (Array.isArray(value)) return value.length > 0;
      return true;
    }, 'This field is required');

    // Email validator
    this.addValidator('email', (value) => {
      if (!value) return true; // Allow empty values unless required
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    }, 'Please enter a valid email address');

    // Minimum length validator
    this.addValidator('minLength', (value, length) => {
      if (!value) return true;
      return String(value).length >= length;
    }, 'Value is too short');

    // Maximum length validator
    this.addValidator('maxLength', (value, length) => {
      if (!value) return true;
      return String(value).length <= length;
    }, 'Value is too long');

    // Minimum value validator
    this.addValidator('min', (value, min) => {
      if (value === null || value === undefined || value === '') return true;
      return Number(value) >= min;
    }, 'Value is too small');

    // Maximum value validator
    this.addValidator('max', (value, max) => {
      if (value === null || value === undefined || value === '') return true;
      return Number(value) <= max;
    }, 'Value is too large');

    // Pattern validator
    this.addValidator('pattern', (value, pattern) => {
      if (!value) return true;
      const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
      return regex.test(String(value));
    }, 'Value does not match required pattern');

    // Numeric validator
    this.addValidator('numeric', (value) => {
      if (!value) return true;
      return !isNaN(parseFloat(value)) && isFinite(value);
    }, 'Value must be a number');

    // Integer validator
    this.addValidator('integer', (value) => {
      if (!value) return true;
      const num = Number(value);
      return Number.isInteger(num);
    }, 'Value must be an integer');

    // URL validator
    this.addValidator('url', (value) => {
      if (!value) return true;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    }, 'Please enter a valid URL');

    // Phone validator
    this.addValidator('phone', (value) => {
      if (!value) return true;
      const phoneRegex = /^[\+]?[1-9][\d\s\-\(\)]{7,15}$/;
      return phoneRegex.test(value);
    }, 'Please enter a valid phone number');

    // Credit card validator
    this.addValidator('creditCard', (value) => {
      if (!value) return true;
      // Remove non-digits
      const digits = String(value).replace(/\D/g, '');
      
      // Basic format check (13-19 digits)
      if (digits.length < 13 || digits.length > 19) return false;
      
      // Luhn algorithm
      let sum = 0;
      let isEven = false;
      
      for (let i = digits.length - 1; i >= 0; i--) {
        let digit = parseInt(digits.charAt(i));
        
        if (isEven) {
          digit *= 2;
          if (digit > 9) {
            digit -= 9;
          }
        }
        
        sum += digit;
        isEven = !isEven;
      }
      
      return sum % 10 === 0;
    }, 'Please enter a valid credit card number');

    // Equals validator
    this.addValidator('equals', (value, otherValue) => {
      return value === otherValue;
    }, 'Values do not match');
  }

  /**
   * Adds a custom validator function
   * @param {string} name - Name of the validator
   * @param {Function} validator - Validator function
   * @param {string} defaultMessage - Default error message
   * @returns {void}
   */
  addValidator(name, validator, defaultMessage) {
    if (typeof validator !== 'function') {
      throw new TypeError('Validator must be a function');
    }
    
    this.validators.set(name, validator);
    this.messages.set(name, defaultMessage || 'Validation failed');
  }

  /**
   * Validates a single value with specified rules
   * @param {*} value - Value to validate
   * @param {Array|Object} rules - Validation rules
   * @returns {Object} Validation result with valid property and errors array
   */
  validate(value, rules) {
    const result = {
      valid: true,
      errors: []
    };

    // Convert rules to array if it's an object
    const rulesArray = Array.isArray(rules) ? 
      rules : 
      Object.entries(rules).map(([ruleName, ruleValue]) => ({ [ruleName]: ruleValue }));

    for (const rule of rulesArray) {
      const ruleName = Object.keys(rule)[0];
      const ruleValue = rule[ruleName];
      
      // Check if validator exists
      if (!this.validators.has(ruleName)) {
        result.valid = false;
        result.errors.push(`Unknown validator: ${ruleName}`);
        continue;
      }

      const validator = this.validators.get(ruleName);
      const isValid = ruleValue !== null ? validator(value, ruleValue) : validator(value);

      if (!isValid) {
        result.valid = false;
        const message = this.messages.get(ruleName) || `Validation failed for ${ruleName}`;
        result.errors.push(typeof ruleValue !== 'string' && ruleValue?.message 
          ? ruleValue.message 
          : message);
      }
    }

    return result;
  }

  /**
   * Validates an object against a schema
   * @param {Object} data - Data object to validate
   * @param {Object} schema - Validation schema
   * @returns {Object} Validation result with valid property and fieldErrors object
   */
  validateSchema(data, schema) {
    const result = {
      valid: true,
      fieldErrors: {}
    };

    for (const field in schema) {
      const fieldValue = data[field];
      const fieldRules = schema[field];
      const fieldResult = this.validate(fieldValue, fieldRules);

      if (!fieldResult.valid) {
        result.valid = false;
        result.fieldErrors[field] = fieldResult.errors;
      }
    }

    return result;
  }

  /**
   * Validates an HTML form element
   * @param {HTMLFormElement} form - Form element to validate
   * @returns {Object} Validation result
   */
  validateForm(form) {
    if (!form || !(form instanceof HTMLFormElement)) {
      return { valid: false, fieldErrors: { form: 'Not a valid form element' } };
    }

    const formData = new FormData(form);
    const result = {
      valid: true,
      fieldErrors: {}
    };

    // Get all input elements in the form
    const inputs = form.querySelectorAll('input, select, textarea');
    
    for (const input of inputs) {
      if (!input.name) continue; // Skip inputs without name attribute
      
      // Get validation rules from data attributes
      const rules = this.getRulesFromElement(input);
      if (!rules || rules.length === 0) continue; // Skip if no rules specified

      const value = input.type === 'checkbox' ? input.checked : 
                   input.type === 'radio' ? this.getSelectedRadioValue(form, input.name) :
                   Array.from(formData.getAll(input.name)).length === 1 ? formData.get(input.name) :
                   formData.getAll(input.name);
      
      const fieldResult = this.validate(value, rules);

      if (!fieldResult.valid) {
        result.valid = false;
        result.fieldErrors[input.name] = fieldResult.errors;
      }

      // Show/hide error messages if enabled
      if (this.options.showErrors) {
        this.showFieldErrors(input, fieldResult.errors);
      }
    }

    return result;
  }

  /**
   * Gets selected value from a radio group
   * @param {HTMLFormElement} form - Form element
   * @param {string} name - Name of the radio group
   * @returns {*} Selected radio value or undefined
   */
  getSelectedRadioValue(form, name) {
    const radios = form.querySelectorAll(`input[type="radio"][name="${name}"]`);
    const selectedRadio = Array.from(radios).find(radio => radio.checked);
    return selectedRadio ? selectedRadio.value : undefined;
  }

  /**
   * Gets validation rules from an HTML element's data attributes
   * @param {HTMLElement} element - Form element to extract rules from
   * @returns {Array|null} Array of validation rules or null if no rules
   */
  getRulesFromElement(element) {
    const rules = [];

    // Check for required attribute
    if (element.hasAttribute('required')) {
      rules.push('required');
    }

    // Check for pattern attribute
    if (element.pattern) {
      rules.push({ pattern: element.pattern });
    }

    // Check for type-specific validation
    if (element.type === 'email') {
      rules.push('email');
    } else if (element.type === 'url') {
      rules.push('url');
    } else if (element.type === 'number') {
      if (element.min) rules.push({ min: parseFloat(element.min) });
      if (element.max) rules.push({ max: parseFloat(element.max) });
    }

    // Check for min/max length
    if (element.minLength) {
      rules.push({ minLength: parseInt(element.minLength) });
    }
    if (element.maxLength) {
      rules.push({ maxLength: parseInt(element.maxLength) });
    }

    // Check for custom validation rules from data attribute
    if (element.dataset.validation) {
      try {
        const customRules = JSON.parse(element.dataset.validation);
        if (Array.isArray(customRules)) {
          rules.push(...customRules);
        } else {
          rules.push(customRules);
        }
      } catch (e) {
        console.warn('Invalid validation data attribute:', e);
      }
    }

    return rules.length > 0 ? rules : null;
  }

  /**
   * Shows error messages for a form field
   * @param {HTMLElement} element - Form element to show errors for
   * @param {Array} errors - Array of error messages
   * @returns {void}
   */
  showFieldErrors(element, errors) {
    // Remove existing error elements
    const existingError = element.parentNode.querySelector(`.${this.options.errorElementClass}`);
    if (existingError) {
      existingError.remove();
    }

    // Set element validation classes
    element.classList.remove(this.options.errorClass, this.options.successClass);
    
    if (errors && errors.length > 0) {
      element.classList.add(this.options.errorClass);
      
      // Create error message element
      const errorElement = document.createElement('div');
      errorElement.className = this.options.errorElementClass;
      errorElement.textContent = errors.join(', ');
      
      // Position the error element
      element.parentNode.insertBefore(errorElement, element.nextSibling);
    } else {
      element.classList.add(this.options.successClass);
    }
  }

  /**
   * Sets up automatic validation for form elements
   * @param {HTMLFormElement} form - Form to set up validation for
   * @param {Object} options - Validation options
   * @returns {Function} Function to remove form validation
   */
  setupFormValidation(form, options = {}) {
    const opts = { ...this.options, ...options };
    const handlers = new Map();

    // Set up event handlers based on options
    if (opts.validateOnChange) {
      const inputs = form.querySelectorAll('input, select, textarea');
      inputs.forEach(input => {
        const handleChange = () => this.validateField(input);
        input.addEventListener('input', handleChange);
        handlers.set(input, { input: handleChange });
      });
    }

    if (opts.validateOnBlur) {
      const inputs = form.querySelectorAll('input, select, textarea');
      inputs.forEach(input => {
        const handleBlur = () => this.validateField(input);
        input.addEventListener('blur', handleBlur);
        handlers.set(input, { ...(handlers.get(input) || {}), blur: handleBlur });
      });
    }

    if (opts.validateOnSubmit) {
      const handleSubmit = (e) => {
        const result = this.validateForm(form);
        if (!result.valid) {
          e.preventDefault();
          console.warn('Form validation failed', result.fieldErrors);
          return false;
        }
        return true;
      };
      
      form.addEventListener('submit', handleSubmit);
      handlers.set(form, { submit: handleSubmit });
    }

    // Return function to remove validation
    return () => {
      for (const [element, elementHandlers] of handlers) {
        for (const [eventType, handler] of Object.entries(elementHandlers)) {
          if (eventType !== 'submit') {
            element.removeEventListener(eventType, handler);
          } else {
            element.removeEventListener('submit', handler);
          }
        }
      }
    };
  }

  /**
   * Validates a single form field
   * @param {HTMLInputElement} field - Form field to validate
   * @returns {Object} Validation result
   */
  validateField(field) {
    const rules = this.getRulesFromElement(field);
    if (!rules) {
      return { valid: true, errors: [] };
    }

    const value = field.type === 'checkbox' ? field.checked : 
                 field.type === 'radio' ? this.getSelectedRadioValue(field.form, field.name) :
                 field.value;
    
    const result = this.validate(value, rules);
    
    if (this.options.showErrors) {
      this.showFieldErrors(field, result.errors);
    }

    return result;
  }

  /**
   * Creates a validation schema builder
   * @returns {Object} Validation schema builder instance
   */
  createSchemaBuilder() {
    const validators = this;
    
    return {
      schema: {},
      
      field: function(name, rules) {
        this.schema[name] = Array.isArray(rules) ? rules : [rules];
        return this;
      },
      
      required: function(name) {
        if (!this.schema[name]) this.schema[name] = [];
        this.schema[name].push('required');
        return this;
      },
      
      email: function(name) {
        if (!this.schema[name]) this.schema[name] = [];
        this.schema[name].push('email');
        return this;
      },
      
      minLength: function(name, length) {
        if (!this.schema[name]) this.schema[name] = [];
        this.schema[name].push({ minLength: length });
        return this;
      },
      
      maxLength: function(name, length) {
        if (!this.schema[name]) this.schema[name] = [];
        this.schema[name].push({ maxLength: length });
        return this;
      },
      
      min: function(name, value) {
        if (!this.schema[name]) this.schema[name] = [];
        this.schema[name].push({ min: value });
        return this;
      },
      
      max: function(name, value) {
        if (!this.schema[name]) this.schema[name] = [];
        this.schema[name].push({ max: value });
        return this;
      },
      
      pattern: function(name, pattern) {
        if (!this.schema[name]) this.schema[name] = [];
        this.schema[name].push({ pattern: pattern });
        return this;
      },
      
      numeric: function(name) {
        if (!this.schema[name]) this.schema[name] = [];
        this.schema[name].push('numeric');
        return this;
      },
      
      integer: function(name) {
        if (!this.schema[name]) this.schema[name] = [];
        this.schema[name].push('integer');
        return this;
      },
      
      custom: function(name, validatorName, validatorValue) {
        if (!this.schema[name]) this.schema[name] = [];
        this.schema[name].push({ [validatorName]: validatorValue });
        return this;
      },
      
      build: function() {
        return { ...this.schema };
      }
    };
  }

  /**
   * Creates a validation middleware function
   * @param {Object} schema - Validation schema
   * @param {Function} successCallback - Function to call when validation passes
   * @param {Function} errorCallback - Function to call when validation fails
   * @returns {Function} Middleware function
   */
  createMiddleware(schema, successCallback, errorCallback) {
    return async (req, res, next) => {
      const validationResult = this.validateSchema(req.body || req.params || req.query, schema);
      
      if (validationResult.valid) {
        if (successCallback) {
          await successCallback(req, res, validationResult);
        }
        next();
      } else {
        if (errorCallback) {
          await errorCallback(req, res, validationResult);
        } else {
          res.status(400).json({ 
            success: false, 
            errors: validationResult.fieldErrors 
          });
        }
      }
    };
  }

  /**
   * Validates an array of items against a rule
   * @param {Array} arr - Array to validate
   * @param {Function|Object} rule - Validation rule for each item
   * @returns {Object} Validation result
   */
  validateArray(arr, rule) {
    if (!Array.isArray(arr)) {
      return { valid: false, errors: ['Value is not an array'] };
    }

    const result = {
      valid: true,
      errors: [],
      itemErrors: []
    };

    for (let i = 0; i < arr.length; i++) {
      const item = arr[i];
      const itemResult = typeof rule === 'function' 
        ? { valid: rule(item) } 
        : this.validate(item, rule);

      if (!itemResult.valid) {
        result.valid = false;
        result.itemErrors[i] = itemResult.errors || ['Item validation failed'];
      }
    }

    if (!result.valid) {
      result.errors.push(`Array validation failed for ${result.itemErrors.filter(e => e).length} items`);
    }

    return result;
  }

  /**
   * Validates a string against a wordlist for profanity or restricted terms
   * @param {string} text - Text to validate
   * @param {Array} wordlist - Array of restricted words
   * @returns {Object} Validation result
   */
  validateProfanity(text, wordlist) {
    if (!Array.isArray(wordlist) || typeof text !== 'string') {
      return { valid: true, errors: [] };
    }
    
    const errors = [];
    const lowerText = text.toLowerCase();
    
    for (const word of wordlist) {
      if (lowerText.includes(word.toLowerCase())) {
        errors.push(`Text contains restricted term: ${word}`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates a password based on complexity requirements
   * @param {string} password - Password to validate
   * @param {Object} requirements - Password requirements
   * @returns {Object} Validation result
   */
  validatePassword(password, requirements = {}) {
    const {
      minLength = 8,
      requireUppercase = true,
      requireLowercase = true,
      requireNumbers = true,
      requireSpecialChars = false,
      allowedSpecialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?',
      customValidator = null
    } = requirements;

    const errors = [];

    // Check length
    if (password.length < minLength) {
      errors.push(`Password must be at least ${minLength} characters long`);
    }

    // Check for uppercase
    if (requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    // Check for lowercase
    if (requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    // Check for numbers
    if (requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    // Check for special characters
    if (requireSpecialChars && !new RegExp(`[${allowedSpecialChars.replace(/[^\w\s]/g, '\\$&')}]`).test(password)) {
      errors.push(`Password must contain at least one special character from: ${allowedSpecialChars}`);
    }

    // Run custom validator if provided
    if (customValidator && typeof customValidator === 'function') {
      const customResult = customValidator(password);
      if (customResult && !customResult.valid) {
        errors.push(customResult.error || 'Custom password validation failed');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      strength: this.calculatePasswordStrength(password)
    };
  }

  /**
   * Calculates password strength on a scale of 0-100
   * @param {string} password - Password to evaluate
   * @returns {number} Password strength score (0-100)
   */
  calculatePasswordStrength(password) {
    let score = 0;

    // Length contributes up to 40 points
    score += Math.min(40, password.length * 2);

    // Character diversity contributes up to 60 points
    if (/[A-Z]/.test(password)) score += 10;
    if (/[a-z]/.test(password)) score += 10;
    if (/[0-9]/.test(password)) score += 10;
    if (/[^A-Za-z0-9]/.test(password)) score += 20;

    // Additional bonuses for longer passwords with diverse characters
    if (password.length > 8) score += 10;
    if (password.length > 12) score += 10;

    return Math.min(100, score);
  }

  /**
   * Validates credit card number using Luhn algorithm
   * @param {string|number} cardNumber - Credit card number to validate
   * @returns {Object} Validation result
   */
  validateCreditCard(cardNumber) {
    const digits = String(cardNumber).replace(/\D/g, '');
    
    if (digits.length < 13 || digits.length > 19) {
      return { valid: false, errors: ['Invalid card number length'] };
    }

    let sum = 0;
    let isEven = false;

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits.charAt(i));

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    const valid = sum % 10 === 0;
    
    return {
      valid,
      errors: valid ? [] : ['Invalid credit card number']
    };
  }

  /**
   * Validates date string format
   * @param {string} dateString - Date string to validate
   * @param {string} format - Expected date format (ISO, MM/DD/YYYY, etc.)
   * @returns {Object} Validation result
   */
  validateDate(dateString, format = 'ISO') {
    if (!dateString) {
      return { valid: false, errors: ['Date is required'] };
    }

    try {
      let date;
      
      if (format === 'ISO') {
        date = new Date(dateString);
      } else if (format === 'MM/DD/YYYY') {
        const [month, day, year] = dateString.split('/');
        date = new Date(year, month - 1, day);
      } else if (format === 'DD/MM/YYYY') {
        const [day, month, year] = dateString.split('/');
        date = new Date(year, month - 1, day);
      } else {
        date = new Date(dateString);
      }

      const isValid = date instanceof Date && !isNaN(date) && !isNaN(date.getTime());
      
      if (!isValid) {
        return { valid: false, errors: ['Invalid date format'] };
      }
      
      return { valid: true, errors: [] };
    } catch (error) {
      return { valid: false, errors: ['Date format error'] };
    }
  }

  /**
   * Validates URL format
   * @param {string} url - URL to validate
   * @returns {Object} Validation result
   */
  validateUrl(url) {
    if (!url) {
      return { valid: false, errors: ['URL is required'] };
    }
    
    try {
      new URL(url);
      return { valid: true, errors: [] };
    } catch (error) {
      return { valid: false, errors: ['Invalid URL format'] };
    }
  }

  /**
   * Validates file based on type and size
   * @param {File} file - File to validate
   * @param {Object} requirements - File requirements
   * @returns {Object} Validation result
   */
  validateFile(file, requirements = {}) {
    const {
      maxSize = 10 * 1024 * 1024, // 10MB default
      allowedTypes = [],
      allowedExtensions = [],
      required = true
    } = requirements;

    if (!file) {
      if (required) {
        return { valid: false, errors: ['File is required'] };
      } else {
        return { valid: true, errors: [] };
      }
    }

    const errors = [];

    // Check size
    if (file.size > maxSize) {
      errors.push(`File size exceeds maximum of ${maxSize / (1024 * 1024)}MB`);
    }

    // Check type
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed`);
    }

    // Check extension
    if (allowedExtensions.length > 0) {
      const ext = file.name.toLowerCase().split('.').pop();
      if (!allowedExtensions.includes(ext)) {
        errors.push(`File extension .${ext} is not allowed`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates an IP address (IPv4 or IPv6)
   * @param {string} ip - IP address to validate
   * @returns {Object} Validation result
   */
  validateIP(ip) {
    if (!ip) {
      return { valid: false, errors: ['IP address is required'] };
    }

    // IPv4 validation
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (ipv4Regex.test(ip)) {
      return { valid: true, errors: [] };
    }

    // IPv6 validation (simplified)
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;
    if (ipv6Regex.test(ip)) {
      return { valid: true, errors: [] };
    }

    return { valid: false, errors: ['Invalid IP address format'] };
  }

  /**
   * Validates a US ZIP code
   * @param {string} zip - ZIP code to validate
   * @returns {Object} Validation result
   */
  validateZipCode(zip) {
    if (!zip) {
      return { valid: false, errors: ['ZIP code is required'] };
    }

    const zipRegex = /^\d{5}(-\d{4})?$/;
    return {
      valid: zipRegex.test(zip),
      errors: zipRegex.test(zip) ? [] : ['Invalid ZIP code format']
    };
  }

  /**
   * Validates a phone number
   * @param {string} phone - Phone number to validate
   * @param {string} country - Country code (default: 'US')
   * @returns {Object} Validation result
   */
  validatePhone(phone, country = 'US') {
    if (!phone) {
      return { valid: false, errors: ['Phone number is required'] };
    }

    // Remove non-digits
    const digits = phone.replace(/\D/g, '');

    if (country === 'US') {
      // US format: 10 digits (+ optional country code)
      if (digits.length === 11 && digits[0] === '1') {
        // Valid US number with country code
        return { valid: true, errors: [] };
      } else if (digits.length === 10) {
        // Valid US number without country code
        return { valid: true, errors: [] };
      }
      
      return { valid: false, errors: ['Invalid US phone number format'] };
    } else {
      // General international format: 7-15 digits
      if (digits.length >= 7 && digits.length <= 15) {
        return { valid: true, errors: [] };
      }
      
      return { valid: false, errors: ['Invalid international phone number format'] };
    }
  }

  /**
   * Validates a US Social Security Number
   * @param {string} ssn - SSN to validate
   * @returns {Object} Validation result
   */
  validateSSN(ssn) {
    if (!ssn) {
      return { valid: false, errors: ['SSN is required'] };
    }

    // Remove non-digits
    const digits = ssn.replace(/\D/g, '');

    // Basic format check
    if (digits.length !== 9) {
      return { valid: false, errors: ['SSN must contain exactly 9 digits'] };
    }

    // SSN format: XXX-XX-XXXX
    const ssnRegex = /^(?!000|666)[0-8][0-9]{2}-(?!00)[0-9]{2}-(?!0000)[0-9]{4}$/;
    const formattedSSN = `${digits.substring(0, 3)}-${digits.substring(3, 5)}-${digits.substring(5)}`;

    if (!ssnRegex.test(formattedSSN)) {
      return { valid: false, errors: ['Invalid SSN format'] };
    }

    return { valid: true, errors: [] };
  }

  /**
   * Creates a validator for conditional fields
   * @param {Object} conditions - Conditions that must be met
   * @param {Object} dependentSchema - Schema that applies when conditions are met
   * @returns {Function} Conditional validation function
   */
  createConditionalValidator(conditions, dependentSchema) {
    return (data) => {
      // Check if all conditions are met
      let conditionsMet = true;
      
      for (const [field, expectedValue] of Object.entries(conditions)) {
        if (data[field] !== expectedValue) {
          conditionsMet = false;
          break;
        }
      }
      
      if (!conditionsMet) {
        return { valid: true, errors: [] };
      }
      
      // Validate against dependent schema
      return this.validateSchema(data, dependentSchema);
    };
  }

  /**
   * Validates multiple schemas against the same data
   * @param {Object} data - Data to validate
   * @param {Array} schemas - Array of schemas to validate against
   * @returns {Object} Combined validation result
   */
  validateMultipleSchemas(data, schemas) {
    const results = {
      valid: true,
      errors: {},
      schemaResults: []
    };

    for (let i = 0; i < schemas.length; i++) {
      const schema = schemas[i];
      const schemaResult = this.validateSchema(data, schema);
      
      results.schemaResults.push({
        index: i,
        result: schemaResult
      });
      
      if (!schemaResult.valid) {
        results.valid = false;
        // Merge errors from this schema
        Object.assign(results.errors, schemaResult.fieldErrors);
      }
    }

    return results;
  }

  /**
   * Performs validation with custom options
   * @param {*} value - Value to validate
   * @param {Array|Object} rules - Validation rules
   * @param {Object} options - Validation options
   * @returns {Object} Validation result
   */
  validateWithOptions(value, rules, options = {}) {
    const {
      throwOnInvalid = false,
      customMessages = {},
      transformValue = null
    } = options;

    // Transform value if needed
    if (transformValue && typeof transformValue === 'function') {
      try {
        value = transformValue(value);
      } catch (e) {
        if (throwOnInvalid) {
          throw new Error(`Value transformation failed: ${e.message}`);
        }
        return {
          valid: false,
          errors: [`Value transformation failed: ${e.message}`]
        };
      }
    }

    const result = this.validate(value, rules);

    // Override messages if custom ones provided
    if (Object.keys(customMessages).length > 0) {
      for (let i = 0; i < result.errors.length; i++) {
        const error = result.errors[i];
        // Use custom message if available
        const customKey = Object.keys(customMessages).find(key => error.includes(key));
        if (customKey) {
          result.errors[i] = customMessages[customKey];
        }
      }
    }

    if (!result.valid && throwOnInvalid) {
      throw new Error(result.errors.join(', '));
    }

    return result;
  }

  /**
   * Validates a nested object against a schema
   * @param {Object} data - Data to validate
   * @param {Object} schema - Nested validation schema
   * @returns {Object} Validation result
   */
  validateNestedSchema(data, schema) {
    const result = {
      valid: true,
      errors: {}
    };

    const validateNested = (obj, schema, path = '') => {
      for (const [field, rules] of Object.entries(schema)) {
        const currentPath = path ? `${path}.${field}` : field;
        const fieldValue = obj[field];
        
        if (typeof rules === 'object' && !Array.isArray(rules) && rules !== null) {
          // Nested schema
          if (typeof fieldValue === 'object' && fieldValue !== null) {
            validateNested(fieldValue, rules, currentPath);
          } else if (rules._required) {
            result.valid = false;
            result.errors[currentPath] = ['Field is required'];
          }
        } else {
          // Regular validation
          const fieldResult = this.validate(fieldValue, rules);
          if (!fieldResult.valid) {
            result.valid = false;
            result.errors[currentPath] = fieldResult.errors;
          }
        }
      }
    };

    validateNested(data, schema);
    return result;
  }

  /**
   * Validates using multiple validators with AND logic
   * @param {*} value - Value to validate
   * @param {Array} validators - Array of validator functions
   * @returns {Object} Validation result
   */
  validateWithAll(value, validators) {
    if (!Array.isArray(validators)) {
      return { valid: false, errors: ['Validators must be an array'] };
    }

    const result = {
      valid: true,
      errors: []
    };

    for (let i = 0; i < validators.length; i++) {
      const validator = validators[i];
      const validatorResult = typeof validator === 'string' ? 
        this.validate(value, [validator]) : 
        { valid: validator(value), errors: validator(value) === false ? [`Validator ${i} failed`] : [] };

      if (!validatorResult.valid) {
        result.valid = false;
        result.errors.push(...validatorResult.errors);
      }
    }

    return result;
  }

  /**
   * Validates using multiple validators with OR logic
   * @param {*} value - Value to validate
   * @param {Array} validators - Array of validator functions
   * @returns {Object} Validation result
   */
  validateWithAny(value, validators) {
    if (!Array.isArray(validators)) {
      return { valid: false, errors: ['Validators must be an array'] };
    }

    if (validators.length === 0) {
      return { valid: true, errors: [] };
    }

    for (const validator of validators) {
      const validatorResult = typeof validator === 'string' ? 
        this.validate(value, [validator]) : 
        { valid: validator(value), errors: [] };

      if (validatorResult.valid) {
        return { valid: true, errors: [] };
      }
    }

    return {
      valid: false,
      errors: ['All validators failed']
    };
  }

  /**
   * Creates a validator function that caches its results
   * @param {Function} validator - Validation function to cache
   * @param {number} ttl - Time to live in milliseconds
   * @returns {Function} Cached validator function
   */
  createCachedValidator(validator, ttl = 5 * 60 * 1000) { // 5 minutes default
    const cache = new Map();
    
    return (value) => {
      const cacheKey = JSON.stringify(value);
      const cachedResult = cache.get(cacheKey);
      
      if (cachedResult) {
        // Check if cache is expired (simple implementation)
        if (Date.now() - cachedResult.timestamp < ttl) {
          return cachedResult.result;
        } else {
          cache.delete(cacheKey);
        }
      }
      
      const result = validator(value);
      cache.set(cacheKey, {
        result,
        timestamp: Date.now()
      });
      
      return result;
    };
  }

  /**
   * Adds dynamic styles for validation utilities
   */
  addDynamicStyles() {
    if (document.getElementById('validation-utilities-styles')) return;

    const style = document.createElement('style');
    style.id = 'validation-utilities-styles';
    style.textContent = `
      /* Validation utility related styles */
      .validation-error {
        border-color: #ff4444 !important;
        box-shadow: 0 0 0 3px rgba(255, 68, 68, 0.2) !important;
      }

      .validation-success {
        border-color: #00ff88 !important;
        box-shadow: 0 0 0 3px rgba(0, 255, 136, 0.2) !important;
      }

      .validation-message {
        color: #ff4444;
        font-size: 0.85rem;
        margin-top: 0.25rem;
        display: block;
      }

      .validation-success-message {
        color: #00ff88;
      }

      .validation-error-field {
        animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
      }

      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
      }

      .password-strength-meter {
        height: 5px;
        background: #333;
        border-radius: 3px;
        margin: 10px 0;
        overflow: hidden;
      }

      .password-strength-meter .strength-fill {
        height: 100%;
        width: 0%;
        transition: width 0.3s ease, background-color 0.3s ease;
      }

      .strength-weak { background: #ff4444; }
      .strength-fair { background: #ffcc00; }
      .strength-good { background: #4facfe; }
      .strength-strong { background: #00f2ea; }

      .validation-summary {
        padding: 12px;
        border-radius: 6px;
        margin: 10px 0;
        border-left: 4px solid;
      }

      .validation-summary.error {
        background: #2d0a0a;
        border-left-color: #ff4444;
        color: #ff6b6b;
      }

      .validation-summary.success {
        background: #0a2d16;
        border-left-color: #00ff88;
        color: #00ff88;
      }

      .validation-badge {
        display: inline-block;
        padding: 3px 8px;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: bold;
      }

      .validation-badge.error {
        background: #ff4444;
        color: white;
      }

      .validation-badge.success {
        background: #00ff88;
        color: black;
      }

      .validation-badge.warning {
        background: #ffcc00;
        color: black;
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Creates a visual validation summary element
   * @param {Object} validationResult - Result from validation
   * @param {Object} options - Display options
   * @returns {HTMLElement} Validation summary element
   */
  createValidationSummary(validationResult, options = {}) {
    const {
      showSuccess = true,
      showError = true,
      includeDetails = true,
      className = 'validation-summary'
    } = options;

    const summaryElement = document.createElement('div');
    summaryElement.className = className;
    summaryElement.classList.add(validationResult.valid ? 'success' : 'error');

    // Add summary message
    const summaryText = validationResult.valid 
      ? 'All fields are valid!'
      : `${Object.keys(validationResult.fieldErrors || {}).length} field(s) have errors`;
    
    summaryElement.innerHTML = `
      <div class="validation-summary-header">
        <strong>${summaryText}</strong>
      </div>
    `;

    // Add details if requested
    if (includeDetails && (validationResult.fieldErrors || validationResult.errors)) {
      const detailsList = document.createElement('ul');
      detailsList.style.margin = '5px 0 0 0';
      detailsList.style.paddingLeft = '20px';
      
      const errors = validationResult.fieldErrors || validationResult.errors || {};
      
      for (const [field, fieldErrors] of Object.entries(errors)) {
        const errorListItem = document.createElement('li');
        errorListItem.style.color = validationResult.valid ? '#00ff88' : '#ff4444';
        errorListItem.textContent = `${field}: ${Array.isArray(fieldErrors) ? fieldErrors.join(', ') : fieldErrors}`;
        detailsList.appendChild(errorListItem);
      }
      
      if (detailsList.children.length > 0) {
        summaryElement.appendChild(detailsList);
      }
    }

    return summaryElement;
  }

  /**
   * Creates a password strength indicator
   * @param {string} password - Password to check
   * @param {Object} options - Display options
   * @returns {HTMLElement} Password strength indicator element
   */
  createPasswordStrengthIndicator(password, options = {}) {
    const strength = this.calculatePasswordStrength(password);
    const {
      showMeter = true,
      showText = true,
      className = 'password-strength'
    } = options;

    const strengthElement = document.createElement('div');
    strengthElement.className = className;

    if (showMeter) {
      const meter = document.createElement('div');
      meter.className = 'password-strength-meter';
      
      const fill = document.createElement('div');
      fill.className = 'strength-fill';
      fill.style.width = `${strength}%`;
      
      // Add appropriate class based on strength
      if (strength < 30) fill.classList.add('strength-weak');
      else if (strength < 60) fill.classList.add('strength-fair');
      else if (strength < 85) fill.classList.add('strength-good');
      else fill.classList.add('strength-strong');
      
      meter.appendChild(fill);
      strengthElement.appendChild(meter);
    }

    if (showText) {
      let strengthText, strengthClass;
      
      if (strength < 30) {
        strengthText = 'Weak';
        strengthClass = 'strength-weak';
      } else if (strength < 60) {
        strengthText = 'Fair';
        strengthClass = 'strength-fair';
      } else if (strength < 85) {
        strengthText = 'Good';
        strengthClass = 'strength-good';
      } else {
        strengthText = 'Strong';
        strengthClass = 'strength-strong';
      }

      const textElement = document.createElement('div');
      textElement.className = `password-strength-text ${strengthClass}`;
      textElement.textContent = `${strengthText} (${strength}%)`;
      
      strengthElement.appendChild(textElement);
    }

    return strengthElement;
  }

  /**
   * Destroys the validation utilities instance and cleans up
   */
  destroy() {
    // Clear all registered validators
    this.validators.clear();
    this.fieldValidators.clear();
    this.activeContext = null;
    this.contextStack = [];
    this.combinationBuffer = [];
  }
}

/**
 * Creates a new validation utilities instance
 * @param {Object} options - Configuration options
 * @returns {ValidationUtils} New validation utilities instance
 */
function createValidationUtils(options = {}) {
  return new ValidationUtils(options);
}

// Create default instance
const validationUtils = new ValidationUtils();

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ValidationUtils,
    createValidationUtils,
    validationUtils
  };
}

// Make available globally
if (typeof window !== 'undefined') {
  window.ValidationUtils = ValidationUtils;
  window.createValidationUtils = createValidationUtils;
  window.validationUtils = validationUtils;
}