// Conditional logic for forms

class ConditionalLogic {
  constructor(form) {
    this.form = typeof form === 'string' ? document.querySelector(form) : form;
    this.rules = [];
    this.init();
  }
  
  init() {
    // Set up event listeners for all form elements
    const inputs = this.form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.addEventListener('change', this.evaluateRules.bind(this));
      input.addEventListener('input', this.evaluateRules.bind(this)); // For real-time feedback
    });
    
    // Evaluate rules on initialization
    this.evaluateRules();
  }
  
  // Add a rule
  addRule(condition, action) {
    this.rules.push({ condition, action });
    return this;
  }
  
  // Add a rule for showing/hiding elements
  addVisibilityRule(conditionalField, value, targetElement, showIfMatch = true) {
    const rule = {
      condition: () => {
        const field = this.form.querySelector(`[name="${conditionalField}"]`);
        if (!field) return false;
        
        if (field.type === 'checkbox' || field.type === 'radio') {
          if (Array.isArray(value)) {
            return value.includes(field.value) === showIfMatch && field.checked;
          }
          return (field.value === value) === showIfMatch && field.checked;
        } else {
          if (Array.isArray(value)) {
            return value.includes(field.value) === showIfMatch;
          }
          return (field.value === value) === showIfMatch;
        }
      },
      action: (isMet) => {
        const target = typeof targetElement === 'string' ? 
          this.form.querySelector(targetElement) : targetElement;
        if (target) {
          target.style.display = isMet ? 'block' : 'none';
        }
      }
    };
    
    this.rules.push(rule);
    return this;
  }
  
  // Add a rule for enabling/disabling elements
  addEnableRule(conditionalField, value, targetElement, enableIfMatch = true) {
    const rule = {
      condition: () => {
        const field = this.form.querySelector(`[name="${conditionalField}"]`);
        if (!field) return false;
        
        if (field.type === 'checkbox' || field.type === 'radio') {
          if (Array.isArray(value)) {
            return value.includes(field.value) === enableIfMatch && field.checked;
          }
          return (field.value === value) === enableIfMatch && field.checked;
        } else {
          if (Array.isArray(value)) {
            return value.includes(field.value) === enableIfMatch;
          }
          return (field.value === value) === enableIfMatch;
        }
      },
      action: (isMet) => {
        const targets = typeof targetElement === 'string' ? 
          this.form.querySelectorAll(targetElement) : [targetElement];
          
        targets.forEach(target => {
          target.disabled = !(isMet === enableIfMatch);
        });
      }
    };
    
    this.rules.push(rule);
    return this;
  }
  
  // Add a rule for setting values
  addSetValueRule(conditionalField, conditionValue, targetField, valueToSet) {
    const rule = {
      condition: () => {
        const field = this.form.querySelector(`[name="${conditionalField}"]`);
        if (!field) return false;
        
        if (Array.isArray(conditionValue)) {
          return conditionValue.includes(field.value);
        }
        return field.value === conditionValue;
      },
      action: (isMet) => {
        const target = this.form.querySelector(`[name="${targetField}"]`);
        if (target && isMet) {
          target.value = valueToSet;
          // Trigger change event to ensure any dependent logic runs
          target.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    };
    
    this.rules.push(rule);
    return this;
  }
  
  // Add a rule for validation
  addValidationRule(conditionalField, value, targetField, validator, message) {
    const rule = {
      condition: () => {
        const field = this.form.querySelector(`[name="${conditionalField}"]`);
        if (!field) return false;
        
        if (Array.isArray(value)) {
          return value.includes(field.value);
        }
        return field.value === value;
      },
      action: (isMet) => {
        const target = this.form.querySelector(`[name="${targetField}"]`);
        if (target) {
          if (isMet) {
            target.setAttribute('data-conditional-validation', JSON.stringify({
              validator: validator.toString(),
              message: message
            }));
            
            // Add event listener for validation
            if (!target._conditionalValidationListener) {
              target._conditionalValidationListener = (e) => {
                if (!validator(target.value)) {
                  target.setCustomValidity(message);
                } else {
                  target.setCustomValidity('');
                }
              };
              target.addEventListener('input', target._conditionalValidationListener);
            }
          } else {
            // Remove conditional validation
            target.removeAttribute('data-conditional-validation');
            if (target._conditionalValidationListener) {
              target.removeEventListener('input', target._conditionalValidationListener);
              target._conditionalValidationListener = null;
            }
            target.setCustomValidity('');
          }
        }
      }
    };
    
    this.rules.push(rule);
    return this;
  }
  
  // Evaluate all rules
  evaluateRules() {
    this.rules.forEach(rule => {
      const isConditionMet = rule.condition();
      rule.action(isConditionMet);
    });
  }
  
  // Remove a rule by index
  removeRule(index) {
    this.rules.splice(index, 1);
    return this;
  }
  
  // Clear all rules
  clearRules() {
    this.rules = [];
    return this;
  }
}

// Helper function to create a conditional logic instance
function setupConditionalLogic(form, rules = []) {
  const logic = new ConditionalLogic(form);
  
  rules.forEach(rule => {
    if (rule.type === 'visibility') {
      logic.addVisibilityRule(
        rule.conditionalField, 
        rule.value, 
        rule.targetElement, 
        rule.showIfMatch
      );
    } else if (rule.type === 'enable') {
      logic.addEnableRule(
        rule.conditionalField, 
        rule.value, 
        rule.targetElement, 
        rule.enableIfMatch
      );
    } else if (rule.type === 'setvalue') {
      logic.addSetValueRule(
        rule.conditionalField, 
        rule.conditionValue, 
        rule.targetField, 
        rule.valueToSet
      );
    } else if (rule.type === 'validation') {
      logic.addValidationRule(
        rule.conditionalField, 
        rule.value, 
        rule.targetField, 
        rule.validator, 
        rule.message
      );
    }
  });
  
  return logic;
}

// Export the class and helper function
export { ConditionalLogic, setupConditionalLogic };