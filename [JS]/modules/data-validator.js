/**
 * Data Validator Module
 * Comprehensive data validation utilities with customizable rules
 * Compatible with jazer-brand.css styling for validation messages
 */

class DataValidator {
  /**
   * Creates a new data validator instance
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      showMessages: true,
      messageElementClass: 'validation-message',
      errorClass: 'validation-error',
      successClass: 'validation-success',
      ...options
    };
    
    this.rules = new Map();
    this.messages = new Map();
    this.customValidators = new Map();
    
    this.initDefaultRules();
  }

  /**
   * Initializes default validation rules
   */
  initDefaultRules() {
    // Required validation
    this.addRule('required', (value) => {
      if (value === null || value === undefined) return false;
      if (typeof value === 'string') return value.trim().length > 0;
      if (Array.isArray(value)) return value.length > 0;
      return true;
    }, 'This field is required');

    // Email validation
    this.addRule('email', (value) => {
      if (!value) return true; // Allow empty values unless required
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    }, 'Please enter a valid email address');

    // Minimum length validation
    this.addRule('minLength', (value, minLength) => {
      if (!value) return true;
      return value.length >= minLength;
    }, 'Value is too short');

    // Maximum length validation
    this.addRule('maxLength', (value, maxLength) => {
      if (!value) return true;
      return value.length <= maxLength;
    }, 'Value is too long');

    // Minimum value validation
    this.addRule('min', (value, min) => {
      if (value === null || value === undefined || value === '') return true;
      return Number(value) >= min;
    }, 'Value is too small');

    // Maximum value validation
    this.addRule('max', (value, max) => {
      if (value === null || value === undefined || value === '') return true;
      return Number(value) <= max;
    }, 'Value is too large');

    // Pattern validation
    this.addRule('pattern', (value, pattern) => {
      if (!value) return true;
      const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
      return regex.test(value);
    }, 'Value does not match required pattern');

    // Numeric validation
    this.addRule('numeric', (value) => {
      if (!value) return true;
      return !isNaN(parseFloat(value)) && isFinite(value);
    }, 'Value must be a number');

    // Integer validation
    this.addRule('integer', (value) => {
      if (!value) return true;
      const num = Number(value);
      return Number.isInteger(num);
    }, 'Value must be an integer');

    // URL validation
    this.addRule('url', (value) => {
      if (!value) return true;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    }, 'Please enter a valid URL');

    // Phone validation
    this.addRule('phone', (value) => {
      if (!value) return true;
      const phoneRegex = /^[+]?[\s./0-9)*#\w-]{6,20}$/;
      return phoneRegex.test(value);
    }, 'Please enter a valid phone number');

    // Credit card validation (Luhn algorithm)
    this.addRule('creditCard', (value) => {
      if (!value) return true;
      const sanitized = value.replace(/[\s-]/g, '');
      if (!/^\d{13,19}$/.test(sanitized)) return false;

      let sum = 0;
      let shouldDouble = false;
      
      for (let i = sanitized.length - 1; i >= 0; i--) {
        let digit = parseInt(sanitized.charAt(i), 10);
        
        if (shouldDouble) {
          digit *= 2;
          if (digit > 9) digit -= 9;
        }
        
        sum += digit;
        shouldDouble = !shouldDouble;
      }
      
      return sum % 10 === 0;
    }, 'Please enter a valid credit card number');
  }

  /**
   * Adds a validation rule
   * @param {string} name - Rule name
   * @param {Function} validator - Validation function
   * @param {string} message - Default error message
   */
  addRule(name, validator, message) {
    this.rules.set(name, validator);
    this.messages.set(name, message);
  }

  /**
   * Adds a custom validator function
   * @param {string} name - Validator name
   * @param {Function} validator - Validation function
   */
  addCustomValidator(name, validator) {
    this.customValidators.set(name, validator);
  }

  /**
   * Validates a single value against rules
   * @param {*} value - Value to validate
   * @param {Array|Object} rules - Validation rules
   * @returns {Object} Validation result
   */
  validate(value, rules) {
    const result = {
      isValid: true,
      errors: []
    };

    // Convert rules to array if it's an object
    const rulesArray = Array.isArray(rules) ? rules : this.rulesToObjectArray(rules);

    for (const rule of rulesArray) {
      let ruleName, ruleParams;

      if (typeof rule === 'string') {
        ruleName = rule;
        ruleParams = null;
      } else if (typeof rule === 'object') {
        ruleName = Object.keys(rule)[0];
        ruleParams = rule[ruleName];
      } else {
        continue;
      }

      // Check if it's a default rule
      if (this.rules.has(ruleName)) {
        const validator = this.rules.get(ruleName);
        const isValid = ruleParams !== null ? validator(value, ruleParams) : validator(value);

        if (!isValid) {
          result.isValid = false;
          result.errors.push(this.messages.get(ruleName) || `Validation failed for ${ruleName}`);
        }
      } 
      // Check if it's a custom validator
      else if (this.customValidators.has(ruleName)) {
        const validator = this.customValidators.get(ruleName);
        const customResult = validator(value, ruleParams);
        const isValid = typeof customResult === 'boolean' ? customResult : customResult.isValid;

        if (!isValid) {
          result.isValid = false;
          const message = typeof customResult === 'object' && customResult.message 
            ? customResult.message 
            : `Custom validation failed for ${ruleName}`;
          result.errors.push(message);
        }
      }
    }

    return result;
  }

  /**
   * Converts rules object to array format
   * @param {Object} rulesObj - Rules object
   * @returns {Array} Rules array
   */
  rulesToObjectArray(rulesObj) {
    return Object.keys(rulesObj).map(key => ({
      [key]: rulesObj[key]
    }));
  }

  /**
   * Validates multiple fields at once
   * @param {Object} data - Data object to validate
   * @param {Object} fieldRules - Rules for each field
   * @returns {Object} Validation results
   */
  validateMultiple(data, fieldRules) {
    const results = {
      isValid: true,
      fieldResults: {}
    };

    for (const field in fieldRules) {
      const value = data[field];
      const rules = fieldRules[field];
      const fieldResult = this.validate(value, rules);

      results.fieldResults[field] = fieldResult;

      if (!fieldResult.isValid) {
        results.isValid = false;
      }
    }

    return results;
  }

  /**
   * Validates an HTML form
   * @param {HTMLFormElement} form - Form element to validate
   * @returns {Object} Validation results
   */
  validateForm(form) {
    const results = {
      isValid: true,
      fieldResults: {}
    };

    const formData = new FormData(form);
    const inputs = form.querySelectorAll('input, select, textarea');

    inputs.forEach(input => {
      // Get validation rules from data attributes
      const rules = this.getRulesFromElement(input);
      if (!rules || rules.length === 0) return;

      const value = formData.get(input.name) || input.value;
      const fieldResult = this.validate(value, rules);

      // Add validation classes and messages
      if (this.options.showMessages) {
        this.displayValidationResult(input, fieldResult);
      }

      results.fieldResults[input.name || input.id] = fieldResult;

      if (!fieldResult.isValid) {
        results.isValid = false;
      }
    });

    return results;
  }

  /**
   * Gets validation rules from an HTML element's data attributes
   * @param {HTMLElement} element - Form element
   * @returns {Array} Array of validation rules
   */
  getRulesFromElement(element) {
    const rules = [];

    // Check for required
    if (element.hasAttribute('required') || element.dataset.required) {
      rules.push('required');
    }

    // Check for email
    if (element.type === 'email' || element.dataset.email) {
      rules.push('email');
    }

    // Check for minimum length
    if (element.minLength !== undefined && element.minLength > 0) {
      rules.push({ minLength: element.minLength });
    }

    // Check for maximum length
    if (element.maxLength !== undefined && element.maxLength > 0) {
      rules.push({ maxLength: element.maxLength });
    }

    // Check for minimum value
    if (element.min !== undefined && element.min !== '') {
      rules.push({ min: parseFloat(element.min) });
    }

    // Check for maximum value
    if (element.max !== undefined && element.max !== '') {
      rules.push({ max: parseFloat(element.max) });
    }

    // Check for pattern
    if (element.pattern) {
      rules.push({ pattern: element.pattern });
    }

    // Check for custom rules
    if (element.dataset.validate) {
      try {
        const customRules = JSON.parse(element.dataset.validate);
        if (Array.isArray(customRules)) {
          rules.push(...customRules);
        } else {
          rules.push(customRules);
        }
      } catch (e) {
        console.warn('Invalid validation data:', e);
      }
    }

    return rules;
  }

  /**
   * Displays validation result for a form field
   * @param {HTMLElement} element - Form element
   * @param {Object} result - Validation result
   */
  displayValidationResult(element, result) {
    // Remove existing validation classes
    element.classList.remove(this.options.errorClass, this.options.successClass);

    // Find existing message element
    const existingMessage = element.parentNode.querySelector(`.${this.options.messageElementClass}`);
    if (existingMessage) {
      existingMessage.parentNode.removeChild(existingMessage);
    }

    if (!result.isValid) {
      element.classList.add(this.options.errorClass);
      
      // Create and display error message
      const messageElement = document.createElement('div');
      messageElement.className = this.options.messageElementClass;
      messageElement.style.color = '#dc3545';
      messageElement.style.fontSize = '0.8rem';
      messageElement.style.marginTop = '0.25rem';
      messageElement.textContent = result.errors[0] || 'Invalid input';
      
      element.parentNode.appendChild(messageElement);
    } else {
      element.classList.add(this.options.successClass);
    }
  }

  /**
   * Creates a validation schema
   * @param {Object} schemaDefinition - Schema definition
   * @returns {Function} Validation function
   */
  createSchema(schemaDefinition) {
    return (data) => {
      return this.validateMultiple(data, schemaDefinition);
    };
  }

  /**
   * Validates using a schema
   * @param {Object} data - Data to validate
   * @param {Object} schema - Validation schema
   * @returns {Object} Validation results
   */
  validateWithSchema(data, schema) {
    return this.validateMultiple(data, schema);
  }

  /**
   * Adds a conditional rule based on other field values
   * @param {string} field - Field to validate
   * @param {Object} condition - Condition object
   * @param {Array} rules - Rules to apply when condition is met
   * @returns {Function} Conditional validation function
   */
  addConditionalRule(field, condition, rules) {
    return (data) => {
      const conditionField = condition.field;
      const conditionValue = condition.value;
      const conditionOperator = condition.operator || 'equals';

      let conditionMet = false;

      switch (conditionOperator) {
        case 'equals':
          conditionMet = data[conditionField] === conditionValue;
          break;
        case 'notEquals':
          conditionMet = data[conditionField] !== conditionValue;
          break;
        case 'contains':
          conditionMet = data[conditionField] && data[conditionField].includes(conditionValue);
          break;
        case 'greaterThan':
          conditionMet = Number(data[conditionField]) > Number(conditionValue);
          break;
        case 'lessThan':
          conditionMet = Number(data[conditionField]) < Number(conditionValue);
          break;
        default:
          conditionMet = data[conditionField] === conditionValue;
      }

      if (conditionMet) {
        return this.validate(data[field], rules);
      }

      return { isValid: true, errors: [] };
    };
  }

  /**
   * Sanitizes input data according to rules
   * @param {Object} data - Data to sanitize
   * @param {Object} sanitizationRules - Sanitization rules
   * @returns {Object} Sanitized data
   */
  sanitize(data, sanitizationRules) {
    const sanitizedData = { ...data };

    for (const field in sanitizationRules) {
      if (data[field] === undefined) continue;

      const rules = sanitizationRules[field];
      let value = data[field];

      for (const rule of rules) {
        if (typeof rule === 'function') {
          value = rule(value);
        } else if (typeof rule === 'string') {
          switch (rule) {
            case 'trim':
              value = typeof value === 'string' ? value.trim() : value;
              break;
            case 'toLowerCase':
              value = typeof value === 'string' ? value.toLowerCase() : value;
              break;
            case 'toUpperCase':
              value = typeof value === 'string' ? value.toUpperCase() : value;
              break;
            case 'escapeHTML':
              value = this.escapeHtml(value);
              break;
          }
        }
      }

      sanitizedData[field] = value;
    }

    return sanitizedData;
  }

  /**
   * Escapes HTML in a string
   * @param {string} str - String to escape
   * @returns {string} Escaped string
   */
  escapeHtml(str) {
    if (typeof str !== 'string') return str;
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  /**
   * Validates and sanitizes data in one operation
   * @param {Object} data - Data to validate and sanitize
   * @param {Object} validationSchema - Validation rules
   * @param {Object} sanitizationSchema - Sanitization rules
   * @returns {Object} Validation and sanitization result
   */
  validateAndSanitize(data, validationSchema, sanitizationSchema = {}) {
    // First sanitize the data
    const sanitizedData = this.sanitize(data, sanitizationSchema);

    // Then validate the sanitized data
    const validation = this.validateMultiple(sanitizedData, validationSchema);

    return {
      isValid: validation.isValid,
      errors: validation,
      data: sanitizedData
    };
  }
}

/**
 * Creates a new validator instance
 * @param {Object} options - Validator options
 * @returns {DataValidator} New validator instance
 */
function createValidator(options = {}) {
  return new DataValidator(options);
}

/**
 * Default validator instance
 */
const defaultValidator = new DataValidator();

/**
 * Validates a value with default settings
 * @param {*} value - Value to validate
 * @param {Array|Object} rules - Validation rules
 * @returns {Object} Validation result
 */
function validate(value, rules) {
  return defaultValidator.validate(value, rules);
}

/**
 * Validates multiple fields with default settings
 * @param {Object} data - Data object to validate
 * @param {Object} fieldRules - Rules for each field
 * @returns {Object} Validation results
 */
function validateMultiple(data, fieldRules) {
  return defaultValidator.validateMultiple(data, fieldRules);
}

/**
 * Validates an HTML form with default settings
 * @param {HTMLFormElement} form - Form element to validate
 * @returns {Object} Validation results
 */
function validateForm(form) {
  return defaultValidator.validateForm(form);
}

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DataValidator,
    createValidator,
    validate,
    validateMultiple,
    validateForm
  };
}

// Also make it available globally
window.DataValidator = DataValidator;
window.createValidator = createValidator;
window.validate = validate;
window.validateMultiple = validateMultiple;
window.validateForm = validateForm;