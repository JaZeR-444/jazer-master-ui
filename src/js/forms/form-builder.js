// Form builder utility for dynamically creating forms

class FormBuilder {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.options = options;
    this.fields = [];
    this.form = null;
  }

  // Add a field to the form
  addField(type, name, options = {}) {
    const field = {
      type,
      name,
      label: options.label || name.charAt(0).toUpperCase() + name.slice(1),
      placeholder: options.placeholder || '',
      required: options.required || false,
      validation: options.validation || [],
      options: options.options || [], // For select, radio, checkbox
      defaultValue: options.defaultValue || '',
      attributes: options.attributes || {}
    };

    this.fields.push(field);
    return this;
  }

  // Build the form
  build() {
    // Clear container
    this.container.innerHTML = '';

    // Create form element
    this.form = document.createElement('form');
    this.form.className = 'dynamic-form';
    if (this.options.className) {
      this.form.classList.add(this.options.className);
    }

    // Add fields to form
    this.fields.forEach(field => {
      const fieldContainer = this.createField(field);
      this.form.appendChild(fieldContainer);
    });

    // Add submit button if not explicitly disabled
    if (this.options.submitButton !== false) {
      const submitBtn = document.createElement('button');
      submitBtn.type = 'submit';
      submitBtn.textContent = this.options.submitText || 'Submit';
      submitBtn.className = 'form-submit-btn';
      this.form.appendChild(submitBtn);
    }

    // Append form to container
    this.container.appendChild(this.form);

    // Add event listeners if provided
    if (this.options.onSubmit) {
      this.form.addEventListener('submit', this.options.onSubmit);
    }

    return this.form;
  }

  // Create a field based on its type
  createField(field) {
    const fieldContainer = document.createElement('div');
    fieldContainer.className = `form-field field-${field.type}`;
    
    // Add label
    if (field.label) {
      const label = document.createElement('label');
      label.textContent = field.label;
      label.setAttribute('for', field.name);
      fieldContainer.appendChild(label);
    }

    let inputElement;
    
    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'number':
      case 'tel':
      case 'url':
        inputElement = document.createElement('input');
        inputElement.type = field.type;
        inputElement.name = field.name;
        inputElement.placeholder = field.placeholder;
        inputElement.value = field.defaultValue;
        inputElement.required = field.required;
        break;
        
      case 'textarea':
        inputElement = document.createElement('textarea');
        inputElement.name = field.name;
        inputElement.placeholder = field.placeholder;
        inputElement.value = field.defaultValue;
        inputElement.required = field.required;
        if (field.attributes.rows) {
          inputElement.rows = field.attributes.rows;
        }
        break;
        
      case 'select':
        inputElement = document.createElement('select');
        inputElement.name = field.name;
        inputElement.required = field.required;
        
        // Add options
        field.options.forEach(option => {
          const optionElement = document.createElement('option');
          optionElement.value = option.value || option;
          optionElement.textContent = option.text || option;
          if (option.value === field.defaultValue) {
            optionElement.selected = true;
          }
          inputElement.appendChild(optionElement);
        });
        break;
        
      case 'checkbox':
        // For checkbox groups
        fieldContainer.className += ' checkbox-group';
        field.options.forEach((option, index) => {
          const checkboxContainer = document.createElement('div');
          checkboxContainer.className = 'checkbox-item';
          
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.name = field.name;
          checkbox.value = option.value || option;
          checkbox.id = `${field.name}-${index}`;
          
          const label = document.createElement('label');
          label.textContent = option.text || option;
          label.setAttribute('for', `${field.name}-${index}`);
          
          checkboxContainer.appendChild(checkbox);
          checkboxContainer.appendChild(label);
          fieldContainer.appendChild(checkboxContainer);
        });
        return fieldContainer; // Return early for checkbox groups
        
      case 'radio':
        // For radio button groups
        fieldContainer.className += ' radio-group';
        field.options.forEach((option, index) => {
          const radioContainer = document.createElement('div');
          radioContainer.className = 'radio-item';
          
          const radio = document.createElement('input');
          radio.type = 'radio';
          radio.name = field.name;
          radio.value = option.value || option;
          radio.id = `${field.name}-${index}`;
          if (option.value === field.defaultValue) {
            radio.checked = true;
          }
          
          const label = document.createElement('label');
          label.textContent = option.text || option;
          label.setAttribute('for', `${field.name}-${index}`);
          
          radioContainer.appendChild(radio);
          radioContainer.appendChild(label);
          fieldContainer.appendChild(radioContainer);
        });
        return fieldContainer; // Return early for radio groups
        
      case 'date':
      case 'time':
      case 'datetime-local':
      case 'color':
      case 'range':
        inputElement = document.createElement('input');
        inputElement.type = field.type;
        inputElement.name = field.name;
        inputElement.required = field.required;
        inputElement.value = field.defaultValue;
        break;
        
      default:
        inputElement = document.createElement('input');
        inputElement.type = 'text';
        inputElement.name = field.name;
        inputElement.placeholder = field.placeholder;
        inputElement.value = field.defaultValue;
        inputElement.required = field.required;
    }

    // Add custom attributes
    Object.entries(field.attributes).forEach(([key, value]) => {
      inputElement.setAttribute(key, value);
    });

    // Add required attribute if needed
    if (field.required) {
      inputElement.setAttribute('required', '');
    }

    fieldContainer.appendChild(inputElement);
    
    return fieldContainer;
  }

  // Get form data
  getFormData() {
    if (!this.form) {
      throw new Error('Form not built yet. Call build() first.');
    }
    
    const formData = new FormData(this.form);
    const data = {};
    
    for (const [key, value] of formData.entries()) {
      if (data[key]) {
        // Handle multiple values (like checkboxes)
        if (Array.isArray(data[key])) {
          data[key].push(value);
        } else {
          data[key] = [data[key], value];
        }
      } else {
        data[key] = value;
      }
    }
    
    return data;
  }

  // Validate form
  validate() {
    if (!this.form) {
      throw new Error('Form not built yet. Call build() first.');
    }
    
    let isValid = true;
    const errors = {};

    this.fields.forEach(field => {
      const fieldElement = this.form.querySelector(`[name="${field.name}"]`);
      
      // Check required fields
      if (field.required && !fieldElement.value) {
        isValid = false;
        if (!errors[field.name]) errors[field.name] = [];
        errors[field.name].push(`${field.label} is required.`);
      }

      // Run custom validations
      field.validation.forEach(validator => {
        if (!validator.test(fieldElement.value)) {
          isValid = false;
          if (!errors[field.name]) errors[field.name] = [];
          errors[field.name].push(validator.message);
        }
      });
    });

    return { isValid, errors };
  }
}

// Export the class
export default FormBuilder;