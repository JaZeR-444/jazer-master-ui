/**
 * Component Template
 * A reusable template for creating consistent UI components
 */

class ComponentTemplate {
  /**
   * Creates a new component template
   * @param {Object} config - Component configuration
   */
  constructor(config) {
    this.config = {
      // Basic component properties
      tagName: 'div',
      className: '',
      id: `component-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      
      // Lifecycle callbacks
      onCreate: null,
      onMount: null,
      onUpdate: null,
      onDestroy: null,
      
      // Event handling
      events: {},
      eventDelegation: true,
      
      // Rendering options
      template: null,
      renderFunction: null,
      shadowDOM: false,
      
      // State management
      initialState: {},
      state: {},
      
      // Props and attributes
      props: {},
      
      // Children elements
      children: [],
      ...config
    };

    // Initialize state
    this.state = { ...this.config.initialState, ...this.config.state };
    
    // Create the component element
    this.element = this.createElement();
    
    // Store component in registry
    this.registerComponent();
  }

  /**
   * Creates the component's root element
   * @returns {HTMLElement} Root element
   */
  createElement() {
    const element = document.createElement(this.config.tagName);
    
    // Set ID and class
    element.id = this.config.id;
    element.className = this.config.className;
    
    // Set attributes from props
    for (const [key, value] of Object.entries(this.config.props)) {
      if (key.startsWith('data-') || key.startsWith('aria-') || key === 'role') {
        element.setAttribute(key, value);
      }
    }
    
    // Execute create callback
    if (this.config.onCreate && typeof this.config.onCreate === 'function') {
      this.config.onCreate.call(this, element);
    }
    
    return element;
  }

  /**
   * Renders the component content
   * @param {Object} data - Data to render with
   * @returns {HTMLElement} The rendered component
   */
  render(data = {}) {
    // Clear current content
    this.element.innerHTML = '';
    
    // Use custom render function if provided
    if (this.config.renderFunction && typeof this.config.renderFunction === 'function') {
      const content = this.config.renderFunction.call(this, this.state, data);
      if (content instanceof HTMLElement) {
        this.element.appendChild(content);
      } else if (typeof content === 'string') {
        this.element.innerHTML = content;
      }
    } 
    // Use template if provided
    else if (this.config.template && typeof this.config.template === 'string') {
      // Replace placeholders in template with data/state
      let templateString = this.config.template;
      
      // Replace state placeholders
      for (const [key, value] of Object.entries(this.state)) {
        templateString = templateString.replace(new RegExp(`{{${key}}}`, 'g'), value);
      }
      
      // Replace data placeholders
      for (const [key, value] of Object.entries(data)) {
        templateString = templateString.replace(new RegExp(`{{${key}}}`, 'g'), value);
      }
      
      this.element.innerHTML = templateString;
    } 
    // Use default rendering
    else {
      this.renderDefault(data);
    }
    
    // Add children if specified
    this.config.children.forEach(child => {
      if (typeof child === 'string') {
        this.element.appendChild(document.createTextNode(child));
      } else if (child instanceof HTMLElement) {
        this.element.appendChild(child);
      } else if (child instanceof ComponentTemplate) {
        this.element.appendChild(child.element);
      } else if (typeof child === 'object' && child.type) {
        // Handle JSX-like elements
        this.element.appendChild(this.createElementFromConfig(child));
      }
    });
    
    // Bind events
    this.bindEvents();
    
    // Execute update callback after rendering
    if (this.config.onUpdate && typeof this.config.onUpdate === 'function') {
      this.config.onUpdate.call(this, this.element, { ...data });
    }
    
    return this.element;
  }

  /**
   * Default rendering method when no template is provided
   * @param {Object} data - Data to render with
   * @returns {HTMLElement} The rendered content
   */
  renderDefault(data = {}) {
    const container = document.createElement('div');
    container.className = 'component-content';
    
    // For default rendering, we'll just show a placeholder
    const content = document.createElement('div');
    content.className = 'component-default-content';
    content.innerHTML = `
      <h3>Default Component Template</h3>
      <p>Component ID: ${this.config.id}</p>
      <p>State: ${JSON.stringify(this.state)}</p>
      <p>Data: ${JSON.stringify(data)}</p>
    `;
    
    container.appendChild(content);
    this.element.appendChild(container);
    
    return container;
  }

  /**
   * Creates an element from a configuration object (JSX-like)
   * @param {Object} config - Element configuration
   * @returns {HTMLElement} Created element
   */
  createElementFromConfig(config) {
    const element = document.createElement(config.type);
    
    // Set attributes
    for (const [key, value] of Object.entries(config.props || {})) {
      if (key.startsWith('on') && typeof value === 'function') {
        // Event handlers
        const event = key.substring(2).toLowerCase();
        element.addEventListener(event, value);
      } else if (key === 'className') {
        element.className = value;
      } else if (key === 'style' && typeof value === 'object') {
        Object.assign(element.style, value);
      } else {
        element.setAttribute(key, value);
      }
    }
    
    // Add children
    for (const child of config.children || []) {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else if (child instanceof HTMLElement) {
        element.appendChild(child);
      } else if (typeof child === 'object' && child.type) {
        element.appendChild(this.createElementFromConfig(child));
      }
    }
    
    return element;
  }

  /**
   * Binds events to the component
   */
  bindEvents() {
    // Handle direct event listeners
    for (const [event, handler] of Object.entries(this.config.events)) {
      if (typeof handler === 'function') {
        this.element.addEventListener(event, (e) => handler.call(this, e, this.state));
      }
    }
    
    // Handle event delegation if enabled
    if (this.config.eventDelegation) {
      const events = this.config.delegatedEvents || {};
      
      for (const [event, selectors] of Object.entries(events)) {
        for (const [selector, handler] of Object.entries(selectors)) {
          if (typeof handler === 'function') {
            this.element.addEventListener(event, (e) => {
              if (e.target.matches(selector)) {
                handler.call(this, e, this.state);
              }
            });
          }
        }
      }
    }
  }

  /**
   * Mounts the component to a target element
   * @param {HTMLElement|string} target - Element or selector to mount to
   * @returns {ComponentTemplate} Current instance
   */
  mount(target) {
    const targetElement = typeof target === 'string' 
      ? document.querySelector(target) 
      : target;
    
    if (!targetElement) {
      console.error(`Target element not found: ${target}`);
      return this;
    }
    
    // Render component
    this.render();
    
    // Append to target
    targetElement.appendChild(this.element);
    
    // Execute mount callback
    if (this.config.onMount && typeof this.config.onMount === 'function') {
      this.config.onMount.call(this, this.element);
    }
    
    return this;
  }

  /**
   * Updates the component's state
   * @param {Object} newState - New state to merge
   * @returns {ComponentTemplate} Current instance
   */
  setState(newState) {
    if (typeof newState === 'function') {
      newState = newState(this.state);
    }
    
    this.state = { ...this.state, ...newState };
    
    // Re-render if auto-update is enabled
    if (this.config.autoUpdate !== false) {
      this.render();
    }
    
    return this;
  }

  /**
   * Gets the component's current state
   * @returns {Object} Current state
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Updates the component's props
   * @param {Object} newProps - New props to merge
   * @returns {ComponentTemplate} Current instance
   */
  setProps(newProps) {
    this.config.props = { ...this.config.props, ...newProps };
    
    // Update attributes on the element
    for (const [key, value] of Object.entries(newProps)) {
      if (key.startsWith('data-') || key.startsWith('aria-') || key === 'role') {
        this.element.setAttribute(key, value);
      }
    }
    
    return this;
  }

  /**
   * Gets the component's props
   * @returns {Object} Current props
   */
  getProps() {
    return { ...this.config.props };
  }

  /**
   * Registers the component in the global registry
   */
  registerComponent() {
    if (typeof window !== 'undefined') {
      if (!window.__COMPONENT_REGISTRY__) {
        window.__COMPONENT_REGISTRY__ = new Map();
      }
      
      window.__COMPONENT_REGISTRY__.set(this.config.id, this);
    }
  }

  /**
   * Removes the component from the DOM and registry
   * @returns {boolean} Whether the removal was successful
   */
  destroy() {
    // Execute destroy callback
    if (this.config.onDestroy && typeof this.config.onDestroy === 'function') {
      this.config.onDestroy.call(this, this.element);
    }
    
    // Remove from parent
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    
    // Remove from registry
    if (typeof window !== 'undefined' && window.__COMPONENT_REGISTRY__) {
      window.__COMPONENT_REGISTRY__.delete(this.config.id);
    }
    
    return true;
  }

  /**
   * Gets an instance of a component by ID
   * @param {string} id - Component ID
   * @returns {ComponentTemplate|null} Component instance or null
   */
  static getInstance(id) {
    if (typeof window !== 'undefined' && window.__COMPONENT_REGISTRY__) {
      return window.__COMPONENT_REGISTRY__.get(id) || null;
    }
    return null;
  }

  /**
   * Creates a component with a shadow DOM
   * @param {Object} config - Component configuration
   * @returns {ComponentTemplate} New component instance
   */
  static createWithShadowDOM(config) {
    const component = new ComponentTemplate({
      ...config,
      shadowDOM: true
    });
    
    // Create shadow root
    if (component.config.shadowDOM) {
      component.shadowRoot = component.element.attachShadow({ mode: 'open' });
      
      // Render to shadow root instead of element
      component.render = function(data = {}) {
        // Clear current content
        if (this.shadowRoot) {
          this.shadowRoot.innerHTML = '';
        }
        
        // Use custom render function if provided
        if (this.config.renderFunction && typeof this.config.renderFunction === 'function') {
          const content = this.config.renderFunction.call(this, this.state, data);
          if (content instanceof HTMLElement) {
            this.shadowRoot.appendChild(content);
          } else if (typeof content === 'string') {
            this.shadowRoot.innerHTML = content;
          }
        } 
        // Use template if provided
        else if (this.config.template && typeof this.config.template === 'string') {
          // Replace placeholders in template with data/state
          let templateString = this.config.template;
          
          // Replace state placeholders
          for (const [key, value] of Object.entries(this.state)) {
            templateString = templateString.replace(new RegExp(`{{${key}}}`, 'g'), value);
          }
          
          // Replace data placeholders
          for (const [key, value] of Object.entries(data)) {
            templateString = templateString.replace(new RegExp(`{{${key}}}`, 'g'), value);
          }
          
          this.shadowRoot.innerHTML = templateString;
        }
        
        // Execute update callback after rendering
        if (this.config.onUpdate && typeof this.config.onUpdate === 'function') {
          this.config.onUpdate.call(this, this.shadowRoot, { ...data });
        }
        
        return this.element;
      };
    }
    
    return component;
  }

  /**
   * Creates a functional component using the template
   * @param {Function} functionalComponent - Function that returns component config
   * @param {Object} props - Props to pass to the component
   * @returns {ComponentTemplate} Component instance
   */
  static createFunctional(functionalComponent, props = {}) {
    const config = functionalComponent(props);
    return new ComponentTemplate(config);
  }
}

/**
 * Template for a typical UI component
 */
class UITemplate extends ComponentTemplate {
  constructor(config) {
    const defaultConfig = {
      className: 'ui-component',
      shadowDOM: false,
      autoUpdate: true,
      ...config
    };
    
    super(defaultConfig);
    
    // Add default UI behavior
    this.addDefaultUIBehavior();
  }
  
  /**
   * Adds default UI behavior like hover effects, focus management, etc.
   */
  addDefaultUIBehavior() {
    // Add resize observer for responsive behavior
    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(() => {
        this.handleResize();
      });
      this.resizeObserver.observe(this.element);
    }
    
    // Add focus trap for modal-like components
    if (this.config.focusable) {
      this.setupFocusManagement();
    }
  }
  
  /**
   * Sets up focus management for the component
   */
  setupFocusManagement() {
    this.element.setAttribute('tabindex', '0');
    
    // Focus management for accessibility
    this.element.addEventListener('focus', (e) => {
      this.onFocus(e);
    });
    
    this.element.addEventListener('blur', (e) => {
      this.onBlur(e);
    });
  }
  
  handleResize() {
    // Override in subclasses
  }
  
  onFocus(e) {
    this.element.classList.add('focused');
    if (this.config.onFocus) {
      this.config.onFocus.call(this, e);
    }
  }
  
  onBlur(e) {
    this.element.classList.remove('focused');
    if (this.config.onBlur) {
      this.config.onBlur.call(this, e);
    }
  }
}

/**
 * Template for form components
 */
class FormTemplate extends ComponentTemplate {
  constructor(config) {
    const formConfig = {
      tagName: 'form',
      className: 'form-component',
      validateOnInput: true,
      validateOnSubmit: true,
      ...config
    };
    
    super(formConfig);
    
    // Add form-specific behavior
    this.setupFormValidation();
    this.setupFormDataHandling();
  }
  
  /**
   * Sets up form validation
   */
  setupFormValidation() {
    if (this.config.fields) {
      this.validators = {};
      
      this.config.fields.forEach(field => {
        if (field.validation) {
          this.validators[field.name] = field.validation;
        }
      });
    }
  }
  
  /**
   * Sets up form data handling
   */
  setupFormDataHandling() {
    this.element.addEventListener('submit', (e) => {
      e.preventDefault();
      
      if (this.config.validateOnSubmit && !this.validateForm()) {
        return false;
      }
      
      const formData = new FormData(this.element);
      const data = Object.fromEntries(formData);
      
      if (this.config.onSubmit) {
        this.config.onSubmit.call(this, data, e);
      }
      
      return true;
    });
    
    if (this.config.validateOnInput) {
      this.element.addEventListener('input', (e) => {
        const field = e.target.getAttribute('name');
        if (field && this.validators[field]) {
          this.validateField(field, e.target.value);
        }
      });
    }
  }
  
  /**
   * Validates the entire form
   * @returns {boolean} Whether the form is valid
   */
  validateForm() {
    let isValid = true;
    
    Object.keys(this.validators).forEach(fieldName => {
      const field = this.element.querySelector(`[name="${fieldName}"]`);
      if (field) {
        const isFieldValid = this.validateField(fieldName, field.value);
        if (!isFieldValid) isValid = false;
      }
    });
    
    return isValid;
  }
  
  /**
   * Validates a specific field
   * @param {string} fieldName - Field name to validate
   * @param {string} value - Value to validate
   * @returns {boolean} Whether the field is valid
   */
  validateField(fieldName, value) {
    const validator = this.validators[fieldName];
    if (!validator) return true;
    
    let isValid = true;
    const field = this.element.querySelector(`[name="${fieldName}"]`);
    
    // Run all validation checks
    if (validator.required && !value) {
      isValid = false;
    }
    
    if (validator.pattern && !new RegExp(validator.pattern).test(value)) {
      isValid = false;
    }
    
    if (validator.minLength && value.length < validator.minLength) {
      isValid = false;
    }
    
    if (validator.maxLength && value.length > validator.maxLength) {
      isValid = false;
    }
    
    // Update field UI based on validity
    if (field) {
      field.classList.toggle('invalid', !isValid);
      field.classList.toggle('valid', isValid);
    }
    
    return isValid;
  }
}

/**
 * Template for modal components
 */
class ModalTemplate extends ComponentTemplate {
  constructor(config) {
    const modalConfig = {
      tagName: 'div',
      className: 'modal-component',
      closeOnEscape: true,
      closeOnOutsideClick: true,
      backdrop: true,
      ...config
    };
    
    super(modalConfig);
    
    // Add modal-specific behavior
    this.setupModalBehavior();
  }
  
  setupModalBehavior() {
    // Create backdrop if needed
    if (this.config.backdrop) {
      this.backdrop = document.createElement('div');
      this.backdrop.className = 'modal-backdrop';
      this.backdrop.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        z-index: 9998;
        display: none;
      `;
    }
    
    // Handle escape key
    if (this.config.closeOnEscape) {
      this.escapeHandler = (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      };
      document.addEventListener('keydown', this.escapeHandler);
    }
    
    // Handle outside click
    if (this.config.closeOnOutsideClick) {
      this.outsideClickHandler = (e) => {
        if (this.isOpen && e.target === this.backdrop) {
          this.close();
        }
      };
    }
  }
  
  open() {
    if (this.backdrop) {
      document.body.appendChild(this.backdrop);
      this.backdrop.style.display = 'block';
    }
    
    document.body.appendChild(this.element);
    this.element.style.display = 'block';
    this.element.style.position = 'fixed';
    this.element.style.zIndex = '9999';
    this.element.setAttribute('aria-modal', 'true');
    
    this.isOpen = true;
    
    // Focus first focusable element
    const firstFocusable = this.element.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) {
      firstFocusable.focus();
    }
    
    if (this.config.onOpen) {
      this.config.onOpen.call(this);
    }
  }
  
  close() {
    if (this.backdrop && this.backdrop.parentNode) {
      this.backdrop.parentNode.removeChild(this.backdrop);
    }
    
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    
    this.element.style.display = 'none';
    this.element.removeAttribute('aria-modal');
    
    this.isOpen = false;
    
    if (this.config.onClose) {
      this.config.onClose.call(this);
    }
  }
}

// Export the templates
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ComponentTemplate,
    UITemplate,
    FormTemplate,
    ModalTemplate
  };
}

window.ComponentTemplate = ComponentTemplate;
window.UITemplate = UITemplate;
window.FormTemplate = FormTemplate;
window.ModalTemplate = ModalTemplate;