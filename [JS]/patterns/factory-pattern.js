/**
 * Factory Pattern Implementation
 * The Factory pattern provides an interface for creating objects without exposing
 * the object creation logic to the client.
 */

class UIFactory {
  /**
   * Creates UI components based on type
   * @param {string} type - Type of component to create
   * @param {Object} options - Configuration options for the component
   * @returns {Object} The created UI component
   */
  static createComponent(type, options = {}) {
    switch (type.toLowerCase()) {
      case 'button':
        return new ButtonComponent(options);
      case 'input':
        return new InputComponent(options);
      case 'modal':
        return new ModalComponent(options);
      case 'card':
        return new CardComponent(options);
      case 'navbar':
        return new NavbarComponent(options);
      case 'form':
        return new FormComponent(options);
      default:
        throw new Error(`Unknown component type: ${type}`);
    }
  }
}

/**
 * Button Component Class
 */
class ButtonComponent {
  constructor(options = {}) {
    this.text = options.text || 'Button';
    this.variant = options.variant || 'primary';
    this.size = options.size || 'medium';
    this.disabled = options.disabled || false;
    this.id = options.id || `button-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.className = options.className || '';
    this.clickHandler = options.clickHandler || (() => {});
  }

  /**
   * Renders the button component
   * @returns {HTMLElement} Button element
   */
  render() {
    const button = document.createElement('button');
    button.id = this.id;
    button.textContent = this.text;
    button.className = `btn btn-${this.variant} btn-${this.size} ${this.className}`;
    button.disabled = this.disabled;
    
    button.addEventListener('click', (e) => {
      this.clickHandler(e);
    });
    
    return button;
  }

  /**
   * Updates the button text
   * @param {string} newText - New text for the button
   */
  setText(newText) {
    this.text = newText;
    const button = document.getElementById(this.id);
    if (button) {
      button.textContent = newText;
    }
  }

  /**
   * Updates the button variant (type)
   * @param {string} newVariant - New variant (primary, secondary, etc.)
   */
  setVariant(newVariant) {
    this.variant = newVariant;
    const button = document.getElementById(this.id);
    if (button) {
      button.className = button.className.replace(/btn-[a-z]+/, `btn-${newVariant}`);
    }
  }
}

/**
 * Input Component Class
 */
class InputComponent {
  constructor(options = {}) {
    this.type = options.type || 'text';
    this.placeholder = options.placeholder || '';
    this.value = options.value || '';
    this.label = options.label || '';
    this.id = options.id || `input-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.className = options.className || '';
    this.onChange = options.onChange || (() => {});
  }

  render() {
    const container = document.createElement('div');
    container.className = 'input-container';
    
    if (this.label) {
      const label = document.createElement('label');
      label.textContent = this.label;
      label.setAttribute('for', this.id);
      container.appendChild(label);
    }
    
    const input = document.createElement('input');
    input.type = this.type;
    input.id = this.id;
    input.placeholder = this.placeholder;
    input.value = this.value;
    input.className = `input ${this.className}`;
    
    input.addEventListener('input', (e) => {
      this.onChange(e.target.value, e);
    });
    
    container.appendChild(input);
    return container;
  }
}

/**
 * Modal Component Class
 */
class ModalComponent {
  constructor(options = {}) {
    this.title = options.title || 'Modal';
    this.content = options.content || '';
    this.showCloseButton = options.showCloseButton !== false;
    this.closable = options.closable !== false;
    this.id = options.id || `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.className = options.className || '';
  }

  render() {
    const modal = document.createElement('div');
    modal.id = this.id;
    modal.className = `modal ${this.className}`;
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    `;

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.style.cssText = `
      background: #0a0a0a;
      border: 1px solid #4facfe;
      border-radius: 8px;
      padding: 20px;
      position: relative;
      min-width: 300px;
      max-width: 500px;
      max-height: 80vh;
      overflow-y: auto;
    `;

    // Add title
    if (this.title) {
      const title = document.createElement('h3');
      title.textContent = this.title;
      title.style.cssText = `
        margin: 0 0 15px 0;
        color: #00f2ea;
      `;
      modalContent.appendChild(title);
    }

    // Add content
    if (typeof this.content === 'string') {
      const content = document.createElement('div');
      content.innerHTML = this.content;
      modalContent.appendChild(content);
    } else if (this.content instanceof HTMLElement) {
      modalContent.appendChild(this.content);
    }

    // Add close button if needed
    if (this.showCloseButton) {
      const closeBtn = document.createElement('button');
      closeBtn.className = 'modal-close';
      closeBtn.innerHTML = '&times;';
      closeBtn.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
      `;
      
      closeBtn.addEventListener('click', () => {
        this.close();
      });
      
      modalContent.appendChild(closeBtn);
    }

    modal.appendChild(modalContent);

    if (this.closable) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.close();
        }
      });
    }

    return modal;
  }

  /**
   * Show the modal
   */
  show() {
    const modal = document.getElementById(this.id);
    if (modal) {
      modal.style.display = 'flex';
    }
  }

  /**
   * Close the modal
   */
  close() {
    const modal = document.getElementById(this.id);
    if (modal) {
      modal.style.display = 'none';
    }
  }
}

/**
 * Card Component Class
 */
class CardComponent {
  constructor(options = {}) {
    this.title = options.title || '';
    this.content = options.content || '';
    this.image = options.image || '';
    this.footer = options.footer || '';
    this.className = options.className || '';
  }

  render() {
    const card = document.createElement('div');
    card.className = `card ${this.className}`;
    card.style.cssText = `
      border: 1px solid #4facfe;
      border-radius: 8px;
      overflow: hidden;
      background: #0a0a0a;
      max-width: 300px;
    `;

    // Add image if provided
    if (this.image) {
      const img = document.createElement('img');
      img.src = this.image;
      img.style.cssText = `
        width: 100%;
        height: auto;
        display: block;
      `;
      card.appendChild(img);
    }

    // Add title
    if (this.title) {
      const title = document.createElement('h3');
      title.className = 'card-title';
      title.textContent = this.title;
      title.style.cssText = `
        padding: 10px;
        margin: 0;
        color: #00f2ea;
      `;
      card.appendChild(title);
    }

    // Add content
    if (this.content) {
      const content = document.createElement('div');
      content.className = 'card-content';
      content.style.cssText = `
        padding: 15px;
      `;
      
      if (typeof this.content === 'string') {
        content.innerHTML = this.content;
      } else if (this.content instanceof HTMLElement) {
        content.appendChild(this.content);
      }
      
      card.appendChild(content);
    }

    // Add footer
    if (this.footer) {
      const footer = document.createElement('div');
      footer.className = 'card-footer';
      footer.textContent = this.footer;
      footer.style.cssText = `
        padding: 10px 15px;
        border-top: 1px solid #222;
        font-size: 0.9rem;
        color: #aaa;
      `;
      card.appendChild(footer);
    }

    return card;
  }
}

/**
 * Navbar Component Class
 */
class NavbarComponent {
  constructor(options = {}) {
    this.links = options.links || [];
    this.brand = options.brand || 'Brand';
    this.fixed = options.fixed || false;
    this.className = options.className || '';
  }

  render() {
    const navbar = document.createElement('nav');
    navbar.className = `navbar ${this.className}`;
    navbar.style.cssText = `
      display: flex;
      align-items: center;
      position: ${this.fixed ? 'fixed' : 'static'};
      top: 0;
      left: 0;
      width: 100%;
      padding: 15px 20px;
      background: #000;
      border-bottom: 1px solid #4facfe;
      z-index: 999;
    `;

    // Add brand
    const brand = document.createElement('div');
    brand.className = 'navbar-brand';
    brand.textContent = this.brand;
    brand.style.cssText = `
      font-weight: bold;
      color: #00f2ea;
      font-size: 1.2rem;
      margin-right: auto;
    `;
    navbar.appendChild(brand);

    // Add links
    if (this.links.length > 0) {
      const navLinks = document.createElement('div');
      navLinks.className = 'navbar-links';
      navLinks.style.cssText = `
        display: flex;
        gap: 20px;
      `;

      this.links.forEach(link => {
        const anchor = document.createElement('a');
        anchor.href = link.url || '#';
        anchor.textContent = link.text || link.name;
        anchor.style.cssText = `
          color: #fff;
          text-decoration: none;
        `;
        
        if (link.clickHandler) {
          anchor.addEventListener('click', (e) => {
            e.preventDefault();
            link.clickHandler(e);
          });
        }
        
        navLinks.appendChild(anchor);
      });

      navbar.appendChild(navLinks);
    }

    return navbar;
  }
}

/**
 * Form Component Class
 */
class FormComponent {
  constructor(options = {}) {
    this.fields = options.fields || [];
    this.submitHandler = options.submitHandler || (() => {});
    this.className = options.className || '';
  }

  render() {
    const form = document.createElement('form');
    form.className = `form ${this.className}`;

    // Add fields
    this.fields.forEach(field => {
      const container = document.createElement('div');
      container.className = 'form-field';
      container.style.cssText = `
        margin-bottom: 15px;
      `;

      if (field.label) {
        const label = document.createElement('label');
        label.textContent = field.label;
        label.setAttribute('for', field.id || field.name);
        label.style.cssText = `
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        `;
        container.appendChild(label);
      }

      let input;
      switch (field.type) {
        case 'textarea':
          input = document.createElement('textarea');
          input.value = field.value || '';
          break;
        case 'select':
          input = document.createElement('select');
          field.options?.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option.value;
            opt.textContent = option.text || option.label;
            if (option.selected) opt.selected = true;
            input.appendChild(opt);
          });
          break;
        case 'checkbox':
        case 'radio':
          input = document.createElement('input');
          input.type = field.type;
          input.checked = field.checked || false;
          break;
        default:
          input = document.createElement('input');
          input.type = field.type || 'text';
          input.value = field.value || '';
      }

      input.id = field.id || field.name;
      input.name = field.name;
      input.placeholder = field.placeholder;
      input.required = field.required;
      input.className = 'form-input';
      input.style.cssText = `
        width: 100%;
        padding: 8px 12px;
        background: #0a0a0a;
        border: 1px solid #4facfe;
        border-radius: 4px;
        color: #fff;
      `;

      container.appendChild(input);
      form.appendChild(container);
    });

    // Add submit button
    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.textContent = 'Submit';
    submitBtn.className = 'btn btn-primary';
    submitBtn.style.cssText = `
      padding: 10px 20px;
      background: #00f2ea;
      color: #000;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    `;

    submitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    form.appendChild(submitBtn);

    return form;
  }

  handleSubmit() {
    const formData = new FormData(this.form);
    const data = Object.fromEntries(formData);
    this.submitHandler(data);
  }
}

/**
 * Abstract Factory for creating themed components
 */
class ThemedUIFactory {
  /**
   * Creates a themed UI component
   * @param {string} type - Type of component to create
   * @param {Object} options - Configuration options
   * @param {string} theme - Theme to apply (light, dark, etc.)
   * @returns {Object} Themed UI component
   */
  static createThemedComponent(type, options, theme = 'dark') {
    const component = UIFactory.createComponent(type, options);
    
    // Apply theme to the component
    component.theme = theme;
    
    // Create a wrapper function that applies the theme after rendering
    const originalRender = component.render.bind(component);
    component.render = function() {
      const element = originalRender();
      
      // Apply theme-based classes
      element.classList.add(`theme-${theme}`);
      element.classList.add(`${type}-theme-${theme}`);
      
      return element;
    };
    
    return component;
  }
}

/**
 * Component Registry for managing factory-created components
 */
class ComponentRegistry {
  constructor() {
    this.components = new Map();
    this.idCounter = 0;
  }

  /**
   * Registers a component instance
   * @param {Object} component - Component instance to register
   * @returns {string} Registration ID
   */
  register(component) {
    const id = `comp-${++this.idCounter}`;
    this.components.set(id, component);
    return id;
  }

  /**
   * Gets a registered component by ID
   * @param {string} id - Registration ID
   * @returns {Object} Component instance
   */
  get(id) {
    return this.components.get(id);
  }

  /**
   * Removes a component from the registry
   * @param {string} id - Registration ID
   * @returns {boolean} Whether the component was successfully removed
   */
  remove(id) {
    return this.components.delete(id);
  }

  /**
   * Gets all registered components
   * @returns {Array} Array of all component instances
   */
  getAll() {
    return Array.from(this.components.values());
  }

  /**
   * Clears all registered components
   */
  clear() {
    return this.components.clear();
  }
}

// Create a default registry instance
const componentRegistry = new ComponentRegistry();

// Export all factory components
module.exports = {
  UIFactory,
  ThemedUIFactory,
  ComponentRegistry,
  componentRegistry,
  ButtonComponent,
  InputComponent,
  ModalComponent,
  CardComponent,
  NavbarComponent,
  FormComponent
};