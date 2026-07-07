// Form validation utilities

class FormValidator {
  constructor(formElement) {
    this.form = formElement;
    this.rules = {};
  }

  addRule(fieldName, rule, message) {
    if (!this.rules[fieldName]) {
      this.rules[fieldName] = [];
    }
    this.rules[fieldName].push({ rule, message });
  }

  validate() {
    let isValid = true;
    const errors = {};

    for (const fieldName in this.rules) {
      const field = this.form.querySelector(`[name="${fieldName}"]`);
      if (field) {
        for (const { rule, message } of this.rules[fieldName]) {
          if (!rule(field.value)) {
            isValid = false;
            if (!errors[fieldName]) {
              errors[fieldName] = [];
            }
            errors[fieldName].push(message);
          }
        }
      }
    }

    return { isValid, errors };
  }

  static required(value) {
    return value && value.trim().length > 0;
  }

  static email(value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return FormValidator.required(value) && emailRegex.test(value);
  }

  static minLength(length) {
    return (value) => FormValidator.required(value) && value.length >= length;
  }

  static maxLength(length) {
    return (value) => value.length <= length;
  }

  static matchesPattern(pattern) {
    return (value) => FormValidator.required(value) && pattern.test(value);
  }
}

export default FormValidator;