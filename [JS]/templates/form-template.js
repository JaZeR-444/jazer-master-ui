/**
 * Form Template
 * Reusable form template with validation and submission handling
 * Compatible with jazer-brand.css styling for form elements
 */

class FormTemplate {
  /**
   * Creates a new form template instance
   * @param {Object} config - Form configuration
   */
  constructor(config) {
    this.config = {
      // Basic form properties
      id: `form-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      className: 'form-template',
      method: 'POST',
      action: '#',
      
      // Fields configuration
      fields: [],
      
      // Validation options
      validateOnSubmit: true,
      validateOnChange: false,
      validateOnBlur: true,
      showValidationErrors: true,
      
      // Submission options
      onSubmit: null,
      onSuccess: null,
      onError: null,
      
      // Styling options
      theme: 'dark', // 'dark', 'light', 'auto'
      layout: 'vertical', // 'vertical', 'horizontal', 'inline'
      
      // Advanced options
      enableProgressiveEnhancement: true,
      enableFieldTracking: false,
      autoComplete: 'on',
      ...config
    };

    this.fields = new Map();
    this.fieldValues = {};
    this.errors = {};
    this.isValid = true;
    this.isSubmitting = false;
    
    this.element = this.createForm();
    this.setupFormValidation();
  }

  /**
   * Creates the form element with all fields
   * @returns {HTMLElement} The created form element
   */
  createForm() {
    // Create form element
    const form = document.createElement('form');
    form.id = this.config.id;
    form.className = `form-template form-${this.config.layout} theme-${this.config.theme}`;
    form.method = this.config.method;
    form.action = this.config.action;
    form.autocomplete = this.config.autoComplete;

    // Add ARIA label if provided
    if (this.config.label) {
      form.setAttribute('aria-label', this.config.label);
    }

    // Create form header if provided
    if (this.config.header) {
      const header = document.createElement('header');
      header.className = 'form-header';
      header.innerHTML = typeof this.config.header === 'string' ? 
        this.config.header : 
        this.config.header.content || '';
      
      if (this.config.header.className) {
        header.className = `${header.className} ${this.config.header.className}`;
      }
      
      form.appendChild(header);
    }

    // Add form fields
    this.config.fields.forEach(fieldConfig => {
      const fieldElement = this.createField(fieldConfig);
      this.fields.set(fieldConfig.name, fieldElement);
      form.appendChild(fieldElement.container);
    });

    // Create form footer if provided (with submit button)
    if (this.config.footer !== false) {
      const footer = document.createElement('footer');
      footer.className = 'form-footer';

      // Add submit button
      const submitButton = document.createElement('button');
      submitButton.type = 'submit';
      submitButton.textContent = this.config.submitButtonText || 'Submit';
      submitButton.className = 'btn btn-primary form-submit-btn';
      
      if (this.config.submitButtonClass) {
        submitButton.className += ` ${this.config.submitButtonClass}`;
      }

      footer.appendChild(submitButton);

      // Add cancel button if needed
      if (this.config.showCancelButton) {
        const cancelButton = document.createElement('button');
        cancelButton.type = 'button';
        cancelButton.textContent = this.config.cancelButtonText || 'Cancel';
        cancelButton.className = 'btn btn-outline form-cancel-btn';
        cancelButton.addEventListener('click', () => {
          if (this.config.onCancel) {
            this.config.onCancel(this);
          }
        });
        footer.appendChild(cancelButton);
      }

      form.appendChild(footer);
    }

    // Add event listeners
    this.bindFormEvents(form);

    return form;
  }

  /**
   * Creates a form field based on configuration
   * @param {Object} config - Field configuration
   * @returns {Object} Field container and input elements
   */
  createField(config) {
    // Create container for the field
    const container = document.createElement('div');
    container.className = `form-field field-type-${config.type || 'text'}`;
    
    // Add field name as attribute
    container.setAttribute('data-field-name', config.name);

    // Create label if needed
    if (config.label) {
      const label = document.createElement('label');
      label.textContent = config.label;
      label.setAttribute('for', config.name || `field-${Date.now()}`);
      label.className = 'form-label';
      
      if (config.required) {
        label.classList.add('required');
        label.innerHTML += '<span class="required-indicator">*</span>';
      }
      
      container.appendChild(label);
    }

    // Create input element based on field type
    let input;
    
    switch (config.type) {
      case 'textarea':
        input = document.createElement('textarea');
        if (config.rows) input.rows = config.rows;
        if (config.cols) input.cols = config.cols;
        break;
        
      case 'select':
        input = document.createElement('select');
        
        if (config.options) {
          config.options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.text || option.label || option.value;
            if (option.selected) optionElement.selected = true;
            if (option.disabled) optionElement.disabled = true;
            input.appendChild(optionElement);
          });
        }
        break;
        
      case 'checkbox':
        input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = config.checked || false;
        
        // For checkboxes, we may also need a hidden input to represent unchecked state
        if (config.includeHiddenInput) {
          const hiddenInput = document.createElement('input');
          hiddenInput.type = 'hidden';
          hiddenInput.name = config.name;
          hiddenInput.value = config.value || 'off';
          container.appendChild(hiddenInput);
        }
        break;
        
      case 'radio':
        // For radio buttons, we need to create multiple inputs
        input = this.createRadioGroup(config);
        break;
        
      case 'file':
        input = document.createElement('input');
        input.type = 'file';
        if (config.accept) input.accept = config.accept;
        if (config.multiple) input.multiple = true;
        break;
        
      case 'range':
        input = document.createElement('input');
        input.type = 'range';
        if (config.min !== undefined) input.min = config.min;
        if (config.max !== undefined) input.max = config.max;
        if (config.step !== undefined) input.step = config.step;
        break;
        
      default: // Includes text, email, password, etc.
        input = document.createElement('input');
        input.type = config.type || 'text';
        input.placeholder = config.placeholder || '';
    }

    // Set common attributes
    input.name = config.name;
    input.id = config.id || config.name || `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    input.className = 'form-input';
    
    if (config.className) {
      input.className += ` ${config.className}`;
    }
    
    if (config.required) input.required = true;
    if (config.disabled) input.disabled = true;
    if (config.readOnly) input.readOnly = true;
    if (config.value !== undefined) input.value = config.value;
    if (config.min !== undefined) input.min = config.min;
    if (config.max !== undefined) input.max = config.max;
    if (config.minLength !== undefined) input.minLength = config.minLength;
    if (config.maxLength !== undefined) input.maxLength = config.maxLength;
    if (config.pattern) input.pattern = config.pattern;

    // Add aria attributes
    if (config.description) {
      const descId = `${input.id}-description`;
      const descElement = document.createElement('div');
      descElement.id = descId;
      descElement.className = 'form-field-description';
      descElement.textContent = config.description;
      container.appendChild(descElement);
      input.setAttribute('aria-describedby', descId);
    }

    // Add the input to the container
    if (config.type !== 'radio') {
      container.appendChild(input);
    }

    // Add validation message container
    if (this.config.showValidationErrors) {
      const validationContainer = document.createElement('div');
      validationContainer.className = 'form-validation-message';
      validationContainer.setAttribute('aria-live', 'polite');
      container.appendChild(validationContainer);
    }

    // Store field configuration
    const fieldObj = {
      config: config,
      container: container,
      input: input,
      validation: config.validation || {},
      originalValue: input.value
    };

    return fieldObj;
  }

  /**
   * Creates a radio button group
   * @param {Object} config - Radio group configuration
   * @returns {HTMLElement} Container for radio buttons
   */
  createRadioGroup(config) {
    // Create container for radio buttons
    const container = document.createElement('div');
    container.className = 'form-radio-group';

    if (config.options) {
      config.options.forEach((option, index) => {
        const radioContainer = document.createElement('div');
        radioContainer.className = 'form-radio-option';

        const input = document.createElement('input');
        input.type = 'radio';
        input.name = config.name;
        input.id = `${config.name}-${index}`;
        input.value = option.value;
        input.checked = option.selected || option.checked || false;
        
        if (option.disabled) input.disabled = true;

        const label = document.createElement('label');
        label.setAttribute('for', input.id);
        label.textContent = option.text || option.label || option.value;

        radioContainer.appendChild(input);
        radioContainer.appendChild(label);
        container.appendChild(radioContainer);
      });
    }

    return container;
  }

  /**
   * Binds form events
   * @param {HTMLElement} form - Form element
   */
  bindFormEvents(form) {
    // Submit event
    form.addEventListener('submit', this.handleFormSubmit.bind(this));

    // Input change events if validation is enabled
    if (this.config.validateOnChange) {
      form.addEventListener('input', this.handleFieldChange.bind(this));
    }

    // Input blur events if validation is enabled
    if (this.config.validateOnBlur) {
      form.addEventListener('blur', this.handleFieldBlur.bind(this), true);
    }
  }

  /**
   * Handles form submission
   * @param {Event} e - Submit event
   */
  async handleFormSubmit(e) {
    e.preventDefault();

    // Run validation if enabled
    if (this.config.validateOnSubmit) {
      const isValid = await this.validateForm();
      if (!isValid) {
        return false;
      }
    }

    // Show submitting state
    this.isSubmitting = true;
    this.setSubmittingState(true);

    try {
      // Collect form data
      const formData = this.getFormData();

      // Execute submit callback
      if (this.config.onSubmit && typeof this.config.onSubmit === 'function') {
        const result = await this.config.onSubmit(formData, this);
        
        // Execute success callback if provided
        if (result && this.config.onSuccess && typeof this.config.onSuccess === 'function') {
          this.config.onSuccess(result, this);
        }
      }

      return true;
    } catch (error) {
      // Execute error callback if provided
      if (this.config.onError && typeof this.config.onError === 'function') {
        this.config.onError(error, this);
      }
      
      console.error('Form submission error:', error);
      return false;
    } finally {
      this.isSubmitting = false;
      this.setSubmittingState(false);
    }
  }

  /**
   * Handles field change events
   * @param {Event} e - Input event
   */
  handleFieldChange(e) {
    const fieldName = e.target.name;
    if (!fieldName) return;

    // Update field value in internal storage
    this.fieldValues[fieldName] = e.target.value;

    // Validate field if enabled
    if (this.config.validateOnChange) {
      this.validateField(fieldName);
    }
  }

  /**
   * Handles field blur events
   * @param {Event} e - Blur event
   */
  handleFieldBlur(e) {
    const fieldName = e.target.name;
    if (!fieldName) return;

    // Validate field if enabled
    if (this.config.validateOnBlur) {
      this.validateField(fieldName);
    }
  }

  /**
   * Sets up form validation
   */
  setupFormValidation() {
    if (this.config.validateOnSubmit || this.config.validateOnChange || this.config.validateOnBlur) {
      // Initialize validation rules
      this.validationRules = {};
      
      this.config.fields.forEach(field => {
        if (field.validation) {
          this.validationRules[field.name] = field.validation;
        }
      });

      // Import or create validation utilities if not already available
      if (typeof ValidationUtils === 'undefined') {
        this.validator = new (require('./validation-utilities').ValidationUtils)();
      } else {
        this.validator = window.ValidationUtils;
      }
    }
  }

  /**
   * Validates the entire form
   * @returns {boolean} Whether the form is valid
   */
  async validateForm() {
    let isFormValid = true;

    // Validate each field
    for (const fieldConfig of this.config.fields) {
      const fieldValid = await this.validateField(fieldConfig.name);
      if (!fieldValid) {
        isFormValid = false;
      }
    }

    // Update form validity state
    this.isValid = isFormValid;

    // Execute form validation callback
    if (this.config.onFormValidation) {
      this.config.onFormValidation(isFormValid, this);
    }

    return isFormValid;
  }

  /**
   * Validates a single field
   * @param {string} fieldName - Name of the field to validate
   * @returns {boolean} Whether the field is valid
   */
  async validateField(fieldName) {
    const fieldConfig = this.config.fields.find(f => f.name === fieldName);
    if (!fieldConfig || !fieldConfig.validation) return true;

    const input = this.element.querySelector(`[name="${fieldName}"]`);
    if (!input) return true;

    const value = input.value;
    const rules = fieldConfig.validation;

    // Clear previous errors
    this.clearFieldError(fieldName);

    // Validate against each rule
    let isValid = true;
    const errorMessages = [];

    for (const [ruleName, ruleConfig] of Object.entries(rules)) {
      let result = false;

      switch (ruleName) {
        case 'required':
          if (ruleConfig) {
            result = value.trim() !== '';
            if (!result) {
              errorMessages.push(ruleConfig.message || 'This field is required');
            }
          } else {
            result = true;
          }
          break;

        case 'minLength':
          if (ruleConfig !== false) {
            result = value.length >= ruleConfig.value;
            if (!result) {
              errorMessages.push(ruleConfig.message || `Minimum length is ${ruleConfig.value} characters`);
            }
          } else {
            result = true;
          }
          break;

        case 'maxLength':
          if (ruleConfig !== false) {
            result = value.length <= ruleConfig.value;
            if (!result) {
              errorMessages.push(ruleConfig.message || `Maximum length is ${ruleConfig.value} characters`);
            }
          } else {
            result = true;
          }
          break;

        case 'email':
          if (ruleConfig) {
            result = this.validator.validateEmail(value);
            if (!result) {
              errorMessages.push(ruleConfig.message || 'Please enter a valid email address');
            }
          } else {
            result = true;
          }
          break;

        case 'pattern':
          if (ruleConfig) {
            const regex = new RegExp(ruleConfig.value);
            result = regex.test(value);
            if (!result) {
              errorMessages.push(ruleConfig.message || `Does not match required pattern`);
            }
          } else {
            result = true;
          }
          break;

        case 'custom':
          if (typeof ruleConfig === 'function') {
            result = await Promise.resolve(ruleConfig(value));
            if (result !== true) {
              errorMessages.push(typeof result === 'string' ? result : 'Invalid value');
            }
          } else if (typeof ruleConfig === 'object' && ruleConfig.validator) {
            result = await Promise.resolve(ruleConfig.validator(value));
            if (result !== true) {
              errorMessages.push(ruleConfig.message || 'Invalid value');
            }
          } else {
            result = true;
          }
          break;

        default:
          // For custom validation rules
          if (typeof this.validationRules[fieldName][ruleName] === 'function') {
            result = await Promise.resolve(this.validationRules[fieldName][ruleName](value));
            if (!result) {
              errorMessages.push(`Validation failed for ${ruleName}`);
            }
          } else {
            result = true;
          }
          break;
      }

      if (!result) {
        isValid = false;
        break; // Stop on first validation failure
      }
    }

    // Show errors if validation failed
    if (!isValid && errorMessages.length > 0) {
      this.showFieldError(fieldName, errorMessages.join(', '));
    }

    // Update field validity state
    input.setAttribute('aria-invalid', !isValid);
    if (input.nextElementSibling && input.nextElementSibling.classList.contains('form-validation-message')) {
      input.nextElementSibling.setAttribute('aria-invalid', !isValid);
    }

    return isValid;
  }

  /**
   * Shows an error for a field
   * @param {string} fieldName - Name of the field
   * @param {string} errorMessage - Error message to show
   */
  showFieldError(fieldName, errorMessage) {
    const fieldContainer = this.element.querySelector(`[data-field-name="${fieldName}"]`);
    if (fieldContainer) {
      fieldContainer.classList.add('form-field-error');
      
      const errorContainer = fieldContainer.querySelector('.form-validation-message');
      if (errorContainer) {
        errorContainer.textContent = errorMessage;
        errorContainer.className = 'form-validation-message error';
      }
    }

    // Store error
    this.errors[fieldName] = errorMessage;
  }

  /**
   * Clears error for a field
   * @param {string} fieldName - Name of the field
   */
  clearFieldError(fieldName) {
    const fieldContainer = this.element.querySelector(`[data-field-name="${fieldName}"]`);
    if (fieldContainer) {
      fieldContainer.classList.remove('form-field-error');
      
      const errorContainer = fieldContainer.querySelector('.form-validation-message');
      if (errorContainer) {
        errorContainer.textContent = '';
        errorContainer.className = 'form-validation-message';
      }
    }

    // Remove error
    delete this.errors[fieldName];
  }

  /**
   * Gets form data as an object
   * @returns {Object} Form data
   */
  getFormData() {
    const formData = {};
    
    for (const field of this.config.fields) {
      const input = this.element.querySelector(`[name="${field.name}"]`);
      
      if (input) {
        // Handle different input types
        if (input.type === 'checkbox') {
          formData[field.name] = input.checked;
        } else if (input.type === 'radio') {
          const checkedRadio = this.element.querySelector(`input[name="${field.name}"]:checked`);
          formData[field.name] = checkedRadio ? checkedRadio.value : null;
        } else if (input.type === 'file') {
          formData[field.name] = input.files;
        } else if (input.type === 'select-multiple') {
          formData[field.name] = Array.from(input.selectedOptions).map(option => option.value);
        } else {
          formData[field.name] = input.value;
        }
      }
    }
    
    return formData;
  }

  /**
   * Sets form field values
   * @param {Object} data - Data object with field names as keys
   * @returns {FormTemplate} Current instance
   */
  setFormData(data) {
    for (const [fieldName, value] of Object.entries(data)) {
      const input = this.element.querySelector(`[name="${fieldName}"]`);
      
      if (input) {
        if (input.type === 'checkbox') {
          input.checked = Boolean(value);
        } else if (input.type === 'radio') {
          const radioOption = this.element.querySelector(`input[name="${fieldName}"][value="${value}"]`);
          if (radioOption) radioOption.checked = true;
        } else if (input.type === 'file') {
          // File inputs can't be programmatically set for security reasons
          console.warn('Cannot set file input value programmatically');
        } else {
          input.value = value;
        }
        
        // Store value internally
        this.fieldValues[fieldName] = value;
      }
    }
    
    return this;
  }

  /**
   * Resets the form to initial state
   * @returns {FormTemplate} Current instance
   */
  reset() {
    // Reset all inputs to initial values
    for (const field of this.config.fields) {
      const input = this.element.querySelector(`[name="${field.name}"]`);
      
      if (input) {
        if (input.type === 'checkbox' || input.type === 'radio') {
          input.checked = field.value === input.value;
        } else {
          input.value = field.value || '';
        }
      }
    }
    
    // Clear all validation errors
    this.clearValidationErrors();
    
    // Reset internal state
    this.fieldValues = {};
    this.errors = {};
    this.isValid = true;
    
    return this;
  }

  /**
   * Clears all validation errors
   * @returns {FormTemplate} Current instance
   */
  clearValidationErrors() {
    // Remove error classes from all fields
    const errorFields = this.element.querySelectorAll('.form-field-error');
    errorFields.forEach(fieldContainer => {
      fieldContainer.classList.remove('form-field-error');
      
      const errorContainer = fieldContainer.querySelector('.form-validation-message');
      if (errorContainer) {
        errorContainer.textContent = '';
        errorContainer.className = 'form-validation-message';
      }
    });
    
    // Clear errors object
    this.errors = {};
    
    return this;
  }

  /**
   * Sets the submitting state
   * @param {boolean} isSubmitting - Whether the form is submitting
   */
  setSubmittingState(isSubmitting) {
    const submitBtn = this.element.querySelector('.form-submit-btn');
    if (submitBtn) {
      submitBtn.disabled = isSubmitting;
      
      if (isSubmitting) {
        submitBtn.classList.add('loading');
        submitBtn.textContent = this.config.submittingText || 'Submitting...';
      } else {
        submitBtn.classList.remove('loading');
        submitBtn.textContent = this.config.submitButtonText || 'Submit';
      }
    }
  }

  /**
   * Adds a new field to the form
   * @param {Object} fieldConfig - Field configuration
   * @returns {FormTemplate} Current instance
   */
  addField(fieldConfig) {
    const fieldElement = this.createField(fieldConfig);
    this.fields.set(fieldConfig.name, fieldElement);
    
    // Add to form
    const footer = this.element.querySelector('.form-footer');
    if (footer) {
      this.element.insertBefore(fieldElement.container, footer);
    } else {
      this.element.appendChild(fieldElement.container);
    }
    
    // Update internal config
    this.config.fields.push(fieldConfig);
    
    return this;
  }

  /**
   * Removes a field from the form
   * @param {string} fieldName - Name of the field to remove
   * @returns {FormTemplate} Current instance
   */
  removeField(fieldName) {
    const fieldContainer = this.element.querySelector(`[data-field-name="${fieldName}"]`);
    if (fieldContainer) {
      fieldContainer.parentNode.removeChild(fieldContainer);
      
      // Remove from internal storage
      this.fields.delete(fieldName);
      delete this.fieldValues[fieldName];
      
      // Remove from config
      this.config.fields = this.config.fields.filter(field => field.name !== fieldName);
    }
    
    return this;
  }

  /**
   * Gets a field by name
   * @param {string} fieldName - Name of the field
   * @returns {Object} Field object or null
   */
  getField(fieldName) {
    return this.fields.get(fieldName) || null;
  }

  /**
   * Validates and renders the form
   * @returns {HTMLElement} The form element
   */
  render() {
    // If form is already rendered, return the existing element
    if (this.element) {
      return this.element;
    }
    
    // Otherwise create a new form element
    this.element = this.createForm();
    return this.element;
  }

  /**
   * Mounts the form to a target element
   * @param {HTMLElement|string} target - Element or selector to mount to
   * @returns {FormTemplate} Current instance
   */
  mount(target) {
    const targetElement = typeof target === 'string' 
      ? document.querySelector(target) 
      : target;
    
    if (!targetElement) {
      console.error(`Target element not found: ${target}`);
      return this;
    }
    
    // Clear target element and add form
    targetElement.innerHTML = '';
    targetElement.appendChild(this.render());
    
    // Execute mount callback if provided
    if (this.config.onMount && typeof this.config.onMount === 'function') {
      this.config.onMount(this);
    }
    
    return this;
  }

  /**
   * Destroys the form and cleans up
   * @returns {void}
   */
  destroy() {
    // Remove form from DOM if attached
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    
    // Clear internal storage
    this.fields.clear();
    this.fieldValues = {};
    this.errors = {};
    
    // Execute destruction callback if provided
    if (this.config.onDestroy && typeof this.config.onDestroy === 'function') {
      this.config.onDestroy(this);
    }
  }

  /**
   * Updates the form configuration
   * @param {Object} newConfig - New configuration
   * @returns {FormTemplate} Current instance
   */
  updateConfig(newConfig) {
    // Merge new configuration with existing
    this.config = { ...this.config, ...newConfig };
    
    // If we need to re-render the entire form due to major changes
    if (newConfig.fields) {
      // Store current values
      const currentValues = this.getFormData();
      
      // Rebuild form
      this.element = this.createForm();
      
      // Restore values
      this.setFormData(currentValues);
    }
    
    return this;
  }

  /**
   * Adds dynamic styles for form elements
   */
  addDynamicStyles() {
    if (document.getElementById('form-template-styles')) return;

    const style = document.createElement('style');
    style.id = 'form-template-styles';
    style.textContent = `
      .form-template {
        background: var(--bg-darker, #111);
        border: 1px solid var(--border-default, #4facfe);
        border-radius: 8px;
        padding: 25px;
        width: 100%;
        max-width: 600px;
        margin: 0 auto;
      }

      .form-header {
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 1px solid var(--border-lighter, #222);
      }

      .form-field {
        margin-bottom: 20px;
      }

      .form-label {
        display: block;
        margin-bottom: 8px;
        color: var(--text-light, #fff);
        font-weight: 500;
      }

      .required-indicator {
        color: var(--error-color, #ff4444);
        margin-left: 4px;
      }

      .form-input {
        width: 100%;
        padding: 12px 16px;
        background: var(--bg-dark, #0a0a0a);
        border: 1px solid var(--border-default, #4facfe);
        border-radius: 6px;
        color: var(--text-light, #fff);
        font-size: 1rem;
      }

      .form-input:focus {
        outline: none;
        border-color: var(--jazer-cyan, #00f2ea);
        box-shadow: 0 0 0 2px rgba(0, 242, 234, 0.2);
      }

      .form-input:invalid {
        border-color: var(--error-color, #ff4444);
      }

      .form-field-error .form-input {
        border-color: var(--error-color, #ff4444);
      }

      .form-validation-message {
        margin-top: 5px;
        font-size: 0.85rem;
        color: var(--error-color, #ff4444);
        min-height: 20px;
      }

      .form-field-description {
        margin-top: 5px;
        font-size: 0.8rem;
        color: var(--text-gray, #aaa);
      }

      .form-footer {
        margin-top: 25px;
        padding-top: 15px;
        border-top: 1px solid var(--border-lighter, #222);
        display: flex;
        gap: 10px;
        justify-content: flex-end;
      }

      .form-submit-btn {
        padding: 12px 24px;
        background: var(--jazer-cyan, #00f2ea);
        color: var(--text-dark, #000);
        border: none;
        border-radius: 6px;
        font-weight: bold;
        cursor: pointer;
      }

      .form-submit-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .form-submit-btn.loading {
        position: relative;
      }

      .form-submit-btn.loading::after {
        content: '';
        position: absolute;
        width: 16px;
        height: 16px;
        margin: auto;
        border: 2px solid transparent;
        border-top: 2px solid var(--text-dark, #000);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .form-radio-group .form-radio-option {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
      }

      .form-radio-group .form-radio-option label {
        margin: 0 0 0 8px;
        font-weight: normal;
      }

      .form-template .btn {
        padding: 8px 16px;
        border: 1px solid var(--border-default, #4facfe);
        border-radius: 4px;
        background: var(--bg-darker, #111);
        color: var(--text-light, #fff);
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .form-template .btn:hover {
        background: var(--bg-dark, #0a0a0a);
      }

      .form-template .btn-primary {
        background: var(--jazer-cyan, #00f2ea);
        color: var(--text-dark, #000);
        border-color: var(--jazer-cyan, #00f2ea);
      }
    `;

    document.head.appendChild(style);
  }
}

/**
 * Creates a form template with common field types
 * @param {Object} config - Form configuration
 * @returns {FormTemplate} New form template instance
 */
function createFormTemplate(config) {
  return new FormTemplate(config);
}

/**
 * Predefined form templates for common use cases
 */
const FormTemplates = {
  /**
   * Creates a login form template
   * @param {Object} options - Login form options
   * @returns {FormTemplate} Login form instance
   */
  createLoginTemplate(options = {}) {
    const defaultOptions = {
      fields: [
        {
          name: 'username',
          type: 'text',
          label: 'Username',
          placeholder: 'Enter your username',
          required: true,
          validation: {
            required: { value: true, message: 'Username is required' },
            minLength: { value: 3, message: 'Username must be at least 3 characters' }
          }
        },
        {
          name: 'password',
          type: 'password',
          label: 'Password',
          placeholder: 'Enter your password',
          required: true,
          validation: {
            required: { value: true, message: 'Password is required' },
            minLength: { value: 6, message: 'Password must be at least 6 characters' }
          }
        }
      ],
      submitButtonText: 'Sign In',
      header: '<h2>Login to Your Account</h2>',
      ...options
    };
    
    return new FormTemplate(defaultOptions);
  },

  /**
   * Creates a signup form template
   * @param {Object} options - Signup form options
   * @returns {FormTemplate} Signup form instance
   */
  createSignupTemplate(options = {}) {
    const defaultOptions = {
      fields: [
        {
          name: 'firstName',
          type: 'text',
          label: 'First Name',
          placeholder: 'Enter your first name',
          required: true
        },
        {
          name: 'lastName',
          type: 'text',
          label: 'Last Name',
          placeholder: 'Enter your last name',
          required: true
        },
        {
          name: 'email',
          type: 'email',
          label: 'Email',
          placeholder: 'Enter your email',
          required: true,
          validation: {
            required: { value: true, message: 'Email is required' },
            email: { value: true, message: 'Please enter a valid email' }
          }
        },
        {
          name: 'password',
          type: 'password',
          label: 'Password',
          placeholder: 'Create a password',
          required: true,
          validation: {
            required: { value: true, message: 'Password is required' },
            minLength: { value: 8, message: 'Password must be at least 8 characters' }
          }
        },
        {
          name: 'confirmPassword',
          type: 'password',
          label: 'Confirm Password',
          placeholder: 'Confirm your password',
          required: true,
          validation: {
            custom: {
              validator: (value) => {
                const password = document.querySelector('input[name="password"]').value;
                return value === password || 'Passwords do not match';
              }
            }
          }
        }
      ],
      submitButtonText: 'Create Account',
      header: '<h2>Create Your Account</h2>',
      ...options
    };
    
    return new FormTemplate(defaultOptions);
  },

  /**
   * Creates a contact form template
   * @param {Object} options - Contact form options
   * @returns {FormTemplate} Contact form instance
   */
  createContactTemplate(options = {}) {
    const defaultOptions = {
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Your Name',
          placeholder: 'Enter your full name',
          required: true
        },
        {
          name: 'email',
          type: 'email',
          label: 'Your Email',
          placeholder: 'Enter your email address',
          required: true,
          validation: {
            required: { value: true, message: 'Email is required' },
            email: { value: true, message: 'Please enter a valid email' }
          }
        },
        {
          name: 'subject',
          type: 'text',
          label: 'Subject',
          placeholder: 'What is this regarding?',
          required: true
        },
        {
          name: 'message',
          type: 'textarea',
          label: 'Message',
          placeholder: 'Enter your message here...',
          rows: 5,
          required: true,
          validation: {
            required: { value: true, message: 'Message is required' },
            minLength: { value: 10, message: 'Message must be at least 10 characters' }
          }
        }
      ],
      submitButtonText: 'Send Message',
      header: '<h2>Contact Us</h2>',
      ...options
    };
    
    return new FormTemplate(defaultOptions);
  }
};

// Initialize dynamic styles
const formStyler = new FormTemplate({ header: '<h2>Form Styler</h2>' });
formStyler.addDynamicStyles();

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    FormTemplate,
    createFormTemplate,
    FormTemplates
  };
}

// Make available globally
window.FormTemplate = FormTemplate;
window.createFormTemplate = createFormTemplate;
window.FormTemplates = FormTemplates;