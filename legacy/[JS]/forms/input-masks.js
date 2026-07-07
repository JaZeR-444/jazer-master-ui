// Input masking utilities for forms

// Base mask class
class InputMask {
  constructor(input, maskPattern, options = {}) {
    this.input = typeof input === 'string' ? document.querySelector(input) : input;
    this.maskPattern = maskPattern;
    this.options = {
      placeholder: options.placeholder || '_',
      autoUnmask: options.autoUnmask || false,
      onComplete: options.onComplete || null,
      ...options
    };
    
    this.init();
  }
  
  init() {
    this.originalValue = '';
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    this.input.addEventListener('input', this.handleInput.bind(this));
    this.input.addEventListener('keydown', this.handleKeyDown.bind(this));
    this.input.addEventListener('focus', this.handleFocus.bind(this));
    this.input.addEventListener('blur', this.handleBlur.bind(this));
  }
  
  handleInput(e) {
    const cursorPosition = e.target.selectionStart;
    const value = e.target.value;
    
    // Apply mask to the input value
    const maskedValue = this.applyMask(value);
    
    // Update the input value without triggering another input event
    this.input.value = maskedValue;
    
    // Restore cursor position
    this.input.setSelectionRange(cursorPosition, cursorPosition);
  }
  
  handleKeyDown(e) {
    // Handle backspace
    if (e.key === 'Backspace') {
      e.preventDefault();
      const cursorPosition = this.input.selectionStart;
      let value = this.input.value;
      
      // Clear the character at the current position
      if (cursorPosition > 0) {
        value = value.substring(0, cursorPosition - 1) + this.options.placeholder + value.substring(cursorPosition);
        this.input.value = value;
        this.input.setSelectionRange(cursorPosition - 1, cursorPosition - 1);
      }
    }
  }
  
  handleFocus(e) {
    // On focus, show the mask with placeholders
    if (!this.input.value) {
      this.input.value = this.getPlaceholderMask();
    }
  }
  
  handleBlur(e) {
    // On blur, clear the mask if the field is empty
    if (!this.input.value.trim() || this.isValueOnlyPlaceholders()) {
      this.input.value = '';
    }
  }
  
  applyMask(value) {
    let result = '';
    let valueIndex = 0;
    
    for (let i = 0; i < this.maskPattern.length; i++) {
      const maskChar = this.maskPattern[i];
      
      if (maskChar === '0') {
        // Numeric digit
        if (valueIndex < value.length && /\d/.test(value[valueIndex])) {
          result += value[valueIndex];
          valueIndex++;
        } else if (valueIndex >= value.length) {
          result += this.options.placeholder;
        } else {
          result += this.options.placeholder;
        }
      } else if (maskChar === 'A') {
        // Alphabet character
        if (valueIndex < value.length && /[a-zA-Z]/.test(value[valueIndex])) {
          result += value[valueIndex];
          valueIndex++;
        } else if (valueIndex >= value.length) {
          result += this.options.placeholder;
        } else {
          result += this.options.placeholder;
        }
      } else if (maskChar === 'S') {
        // Alphanumeric character
        if (valueIndex < value.length && /[a-zA-Z0-9]/.test(value[valueIndex])) {
          result += value[valueIndex];
          valueIndex++;
        } else if (valueIndex >= value.length) {
          result += this.options.placeholder;
        } else {
          result += this.options.placeholder;
        }
      } else {
        // Literal character
        result += maskChar;
        if (valueIndex < value.length && value[valueIndex] === maskChar) {
          valueIndex++;
        }
      }
    }
    
    return result;
  }
  
  getPlaceholderMask() {
    return this.maskPattern.replace(/[0AS]/g, this.options.placeholder);
  }
  
  isValueOnlyPlaceholders() {
    return this.input.value.split('').every(char => char === this.options.placeholder);
  }
}

// Specific mask implementations
class PhoneMask extends InputMask {
  constructor(input, options = {}) {
    // US phone number format: (123) 456-7890
    super(input, '(000) 000-0000', options);
  }
}

class DateMask extends InputMask {
  constructor(input, options = {}) {
    // Date format: MM/DD/YYYY
    super(input, '00/00/0000', options);
  }
}

class CreditCardMask extends InputMask {
  constructor(input, options = {}) {
    // Credit card format: 1234 5678 9012 3456
    super(input, '0000 0000 0000 0000', options);
  }
}

class SSNMask extends InputMask {
  constructor(input, options = {}) {
    // SSN format: 123-45-6789
    super(input, '000-00-0000', options);
  }
}

class TimeMask extends InputMask {
  constructor(input, options = {}) {
    // Time format: HH:MM (24-hour)
    super(input, '00:00', options);
  }
}

// Custom mask generator
function createCustomMask(input, pattern, options = {}) {
  return new InputMask(input, pattern, options);
}

// Email mask (basic implementation)
class EmailMask {
  constructor(input, options = {}) {
    this.input = typeof input === 'string' ? document.querySelector(input) : input;
    this.options = options;
    
    this.setupValidation();
  }
  
  setupValidation() {
    this.input.addEventListener('blur', () => {
      this.validateEmail();
    });
    
    this.input.addEventListener('input', () => {
      this.validateEmail();
    });
  }
  
  validateEmail() {
    const value = this.input.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(value);
    
    // Add/remove error class
    if (value && !isValid) {
      this.input.classList.add('invalid-email');
    } else {
      this.input.classList.remove('invalid-email');
    }
    
    return isValid;
  }
}

// Export all mask classes
export {
  InputMask,
  PhoneMask,
  DateMask,
  CreditCardMask,
  SSNMask,
  TimeMask,
  createCustomMask,
  EmailMask
};