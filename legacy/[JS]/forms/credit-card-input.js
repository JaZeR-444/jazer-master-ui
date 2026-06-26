// Enhanced credit card input form with validation and formatting

class CreditCardInput {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.options = {
      cardholderNameRequired: options.cardholderNameRequired !== false,
      cardNumberRequired: options.cardNumberRequired !== false,
      expiryRequired: options.expiryRequired !== false,
      cvcRequired: options.cvcRequired !== false,
      supportedCards: options.supportedCards || ['visa', 'mastercard', 'amex', 'discover'],
      ...options
    };
    
    this.cardType = null;
    this.cardholders = {
      visa: '^4',
      mastercard: '^5[1-5]|^2',
      amex: '^3[47]',
      discover: '^6',
      diners: '^3[0689]',
      jcb: '^35',
      unionpay: '^62'
    };
    
    this.init();
  }
  
  init() {
    this.createForm();
    this.setupEventListeners();
  }
  
  createForm() {
    // Create the form container
    this.form = document.createElement('form');
    this.form.className = 'credit-card-form';
    
    // Create input groups
    if (this.options.cardholderNameRequired) {
      this.createCardholderNameField();
    }
    
    if (this.options.cardNumberRequired) {
      this.createCardNumberField();
    }
    
    if (this.options.expiryRequired || this.options.cvcRequired) {
      const dateCvcGroup = document.createElement('div');
      dateCvcGroup.className = 'date-cvc-group';
      
      if (this.options.expiryRequired) {
        this.createExpiryField();
        dateCvcGroup.appendChild(this.expiryContainer);
      }
      
      if (this.options.cvcRequired) {
        this.createCvcField();
        dateCvcGroup.appendChild(this.cvcContainer);
      }
      
      if (this.expiryContainer || this.cvcContainer) {
        this.form.appendChild(dateCvcGroup);
      }
    }
    
    // Add card type indicator
    this.cardTypeIndicator = document.createElement('div');
    this.cardTypeIndicator.className = 'card-type-indicator';
    this.form.appendChild(this.cardTypeIndicator);
    
    // Add the form to the container
    this.container.appendChild(this.form);
  }
  
  createCardholderNameField() {
    this.cardholderContainer = document.createElement('div');
    this.cardholderContainer.className = 'form-group cardholder-name';
    
    const label = document.createElement('label');
    label.textContent = 'Cardholder Name';
    label.setAttribute('for', 'cardholder-name');
    
    this.cardholderInput = document.createElement('input');
    this.cardholderInput.type = 'text';
    this.cardholderInput.id = 'cardholder-name';
    this.cardholderInput.name = 'cardholderName';
    this.cardholderInput.placeholder = 'Full name as on card';
    this.cardholderInput.required = this.options.cardholderNameRequired;
    
    this.cardholderContainer.appendChild(label);
    this.cardholderContainer.appendChild(this.cardholderInput);
    this.form.appendChild(this.cardholderContainer);
  }
  
  createCardNumberField() {
    this.cardNumberContainer = document.createElement('div');
    this.cardNumberContainer.className = 'form-group card-number';
    
    const label = document.createElement('label');
    label.textContent = 'Card Number';
    label.setAttribute('for', 'card-number');
    
    this.cardNumberInput = document.createElement('input');
    this.cardNumberInput.type = 'text';
    this.cardNumberInput.id = 'card-number';
    this.cardNumberInput.name = 'cardNumber';
    this.cardNumberInput.placeholder = '0000 0000 0000 0000';
    this.cardNumberInput.required = this.options.cardNumberRequired;
    this.cardNumberInput.setAttribute('maxlength', '19');
    this.cardNumberInput.setAttribute('inputmode', 'numeric');
    
    // Add card brand icon
    this.cardBrandIcon = document.createElement('span');
    this.cardBrandIcon.className = 'card-brand-icon';
    this.cardBrandIcon.textContent = '💳';
    
    this.cardNumberContainer.appendChild(label);
    this.cardNumberContainer.appendChild(this.cardNumberInput);
    this.cardNumberContainer.appendChild(this.cardBrandIcon);
    this.form.appendChild(this.cardNumberContainer);
  }
  
  createExpiryField() {
    this.expiryContainer = document.createElement('div');
    this.expiryContainer.className = 'form-group expiry-date';
    
    const label = document.createElement('label');
    label.textContent = 'Expiry Date';
    label.setAttribute('for', 'expiry-date');
    
    this.expiryInput = document.createElement('input');
    this.expiryInput.type = 'text';
    this.expiryInput.id = 'expiry-date';
    this.expiryInput.name = 'expiryDate';
    this.expiryInput.placeholder = 'MM/YY';
    this.expiryInput.required = this.options.expiryRequired;
    this.expiryInput.setAttribute('maxlength', '5');
    
    this.expiryContainer.appendChild(label);
    this.expiryContainer.appendChild(this.expiryInput);
  }
  
  createCvcField() {
    this.cvcContainer = document.createElement('div');
    this.cvcContainer.className = 'form-group cvc';
    
    const label = document.createElement('label');
    label.textContent = 'CVC';
    label.setAttribute('for', 'cvc');
    
    this.cvcInput = document.createElement('input');
    this.cvcInput.type = 'text';
    this.cvcInput.id = 'cvc';
    this.cvcInput.name = 'cvc';
    this.cvcInput.placeholder = 'CVC';
    this.cvcInput.required = this.options.cvcRequired;
    this.cvcInput.setAttribute('maxlength', '4');
    this.cvcInput.setAttribute('inputmode', 'numeric');
    
    this.cvcContainer.appendChild(label);
    this.cvcContainer.appendChild(this.cvcInput);
  }
  
  setupEventListeners() {
    if (this.cardNumberInput) {
      this.cardNumberInput.addEventListener('input', this.handleCardNumberInput.bind(this));
      this.cardNumberInput.addEventListener('keypress', this.handleCardNumberKeyPress.bind(this));
    }
    
    if (this.expiryInput) {
      this.expiryInput.addEventListener('input', this.handleExpiryInput.bind(this));
      this.expiryInput.addEventListener('keypress', this.handleExpiryKeyPress.bind(this));
    }
    
    if (this.cvcInput) {
      this.cvcInput.addEventListener('keypress', this.handleCvcKeyPress.bind(this));
      this.cvcInput.addEventListener('input', this.handleCvcInput.bind(this));
    }
    
    // Form validation
    this.form.addEventListener('submit', this.handleSubmit.bind(this));
  }
  
  handleCardNumberInput(e) {
    let value = e.target.value.replace(/\D/g, '');
    let formattedValue = '';
    
    // Determine card type and format accordingly
    this.cardType = this.getCardType(value);
    this.updateCardBrandIcon();
    
    // Format for different card types
    if (this.cardType === 'amex') {
      // Amex has a format of XXXX XXXXXX XXXX
      for (let i = 0; i < value.length; i++) {
        if (i === 4 || i === 10) formattedValue += ' ';
        formattedValue += value[i];
      }
    } else {
      // Most other cards have a format of XXXX XXXX XXXX XXXX
      for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) formattedValue += ' ';
        formattedValue += value[i];
      }
    }
    
    e.target.value = formattedValue;
    
    // Validate and update UI
    this.validateCardNumber();
  }
  
  handleCardNumberKeyPress(e) {
    // Only allow numeric characters
    if (!/[\d\s]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
      e.preventDefault();
    }
  }
  
  handleExpiryInput(e) {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length >= 2) {
      // Format as MM/YY
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    
    e.target.value = value;
    
    // Validate and update UI
    this.validateExpiry();
  }
  
  handleExpiryKeyPress(e) {
    // Only allow numeric characters and forward slash
    if (!/\d/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== '/' && e.key !== 'Tab') {
      e.preventDefault();
    }
  }
  
  handleCvcKeyPress(e) {
    // Only allow numeric characters
    if (!/\d/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
      e.preventDefault();
    }
  }
  
  handleCvcInput(e) {
    const maxLength = this.cardType === 'amex' ? 4 : 3;
    e.target.value = e.target.value.replace(/\D/g, '').substring(0, maxLength);
    
    // Validate and update UI
    this.validateCvc();
  }
  
  handleSubmit(e) {
    e.preventDefault();
    
    const isValid = this.validateForm();
    
    if (isValid) {
      // Trigger success event
      this.form.dispatchEvent(new CustomEvent('card-valid', {
        detail: this.getFormData()
      }));
    } else {
      // Trigger error event
      this.form.dispatchEvent(new CustomEvent('card-invalid', {
        detail: this.getValidationErrors()
      }));
    }
  }
  
  getCardType(number) {
    number = number.replace(/\s/g, '');
    
    for (const [card, pattern] of Object.entries(this.cardholders)) {
      if (number.match(new RegExp(pattern))) {
        // Check if the card is in the supported cards list
        if (this.options.supportedCards.includes(card)) {
          return card;
        }
      }
    }
    
    return 'unknown';
  }
  
  updateCardBrandIcon() {
    if (this.cardBrandIcon) {
      switch (this.cardType) {
        case 'visa':
          this.cardBrandIcon.textContent = '𝑉';
          break;
        case 'mastercard':
          this.cardBrandIcon.textContent = '𝑀';
          break;
        case 'amex':
          this.cardBrandIcon.textContent = '𝐴';
          break;
        case 'discover':
          this.cardBrandIcon.textContent = '𝐷';
          break;
        default:
          this.cardBrandIcon.textContent = '💳';
      }
    }
  }
  
  validateCardNumber() {
    if (!this.cardNumberInput) return true;
    
    const value = this.cardNumberInput.value.replace(/\s/g, '');
    const isValid = this.luhnCheck(value) && this.cardType !== 'unknown';
    
    // Update UI based on validation
    this.cardNumberInput.classList.toggle('valid', isValid);
    this.cardNumberInput.classList.toggle('invalid', !isValid);
    
    return isValid;
  }
  
  validateExpiry() {
    if (!this.expiryInput) return true;
    
    const value = this.expiryInput.value;
    const [month, year] = value.split('/');
    
    if (!month || !year || month.length !== 2 || year.length !== 2) {
      this.expiryInput.classList.remove('valid', 'invalid');
      return false;
    }
    
    const expiryMonth = parseInt(month, 10);
    const expiryYear = parseInt('20' + year, 10);
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    const isValid = !(
      isNaN(expiryMonth) || expiryMonth < 1 || expiryMonth > 12 ||
      isNaN(expiryYear) || 
      (expiryYear === currentYear && expiryMonth < currentMonth) || 
      expiryYear < currentYear
    );
    
    // Update UI based on validation
    this.expiryInput.classList.toggle('valid', isValid);
    this.expiryInput.classList.toggle('invalid', !isValid);
    
    return isValid;
  }
  
  validateCvc() {
    if (!this.cvcInput) return true;
    
    const value = this.cvcInput.value;
    const maxLength = this.cardType === 'amex' ? 4 : 3;
    const isValid = /^\d+$/.test(value) && value.length === maxLength;
    
    // Update UI based on validation
    this.cvcInput.classList.toggle('valid', isValid);
    this.cvcInput.classList.toggle('invalid', !isValid);
    
    return isValid;
  }
  
  luhnCheck(cardNumber) {
    // Perform Luhn algorithm validation
    if (!cardNumber.match(/^\d+$/)) return false;
    
    let nCheck = 0;
    let nDigit = 0;
    let bEven = false;
    
    for (let n = cardNumber.length - 1; n >= 0; n--) {
      nDigit = parseInt(cardNumber.charAt(n), 10);
      
      if (bEven) {
        if ((nDigit *= 2) > 9) {
          nDigit -= 9;
        }
      }
      
      nCheck += nDigit;
      bEven = !bEven;
    }
    
    return (nCheck % 10) === 0;
  }
  
  validateForm() {
    let isValid = true;
    
    if (this.cardNumberInput) {
      isValid = this.validateCardNumber() && isValid;
    }
    
    if (this.expiryInput) {
      isValid = this.validateExpiry() && isValid;
    }
    
    if (this.cvcInput) {
      isValid = this.validateCvc() && isValid;
    }
    
    return isValid;
  }
  
  getFormData() {
    const data = {};
    
    if (this.cardholderInput) {
      data.cardholderName = this.cardholderInput.value;
    }
    
    if (this.cardNumberInput) {
      data.cardNumber = this.cardNumberInput.value.replace(/\s/g, '');
    }
    
    if (this.expiryInput) {
      data.expiryDate = this.expiryInput.value;
    }
    
    if (this.cvcInput) {
      data.cvc = this.cvcInput.value;
    }
    
    data.cardType = this.cardType;
    
    return data;
  }
  
  getValidationErrors() {
    const errors = {};
    
    if (this.cardNumberInput) {
      if (!this.validateCardNumber()) {
        errors.cardNumber = 'Invalid card number';
      }
    }
    
    if (this.expiryInput) {
      if (!this.validateExpiry()) {
        errors.expiryDate = 'Invalid expiry date';
      }
    }
    
    if (this.cvcInput) {
      if (!this.validateCvc()) {
        errors.cvc = 'Invalid CVC';
      }
    }
    
    return errors;
  }
}

// Export the CreditCardInput class
export default CreditCardInput;