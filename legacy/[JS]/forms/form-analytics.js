// Form analytics and tracking utilities

class FormAnalytics {
  constructor(form, options = {}) {
    this.form = typeof form === 'string' ? document.querySelector(form) : form;
    this.options = {
      trackFieldFocus: options.trackFieldFocus !== false,
      trackFieldChange: options.trackFieldChange !== false,
      trackCompletion: options.trackCompletion !== false,
      trackAbandonment: options.trackAbandonment !== false,
      submitDelay: options.submitDelay || 3000, // milliseconds to wait before considering form abandoned
      autoTrack: options.autoTrack !== false,
      onFieldFocus: options.onFieldFocus || null,
      onFieldChange: options.onFieldChange || null,
      onFormSubmit: options.onFormSubmit || null,
      onFormAbandon: options.onFormAbandon || null,
      ...options
    };
    
    this.fieldStartTime = new Map();
    this.fieldInteractionCount = new Map();
    this.formData = {};
    this.submitStartTime = null;
    this.isFormAbandoned = false;
    
    if (this.options.autoTrack) {
      this.init();
    }
  }
  
  init() {
    // Track all form fields
    this.trackFormFields();
    
    // Track form submission
    this.form.addEventListener('submit', this.handleFormSubmit.bind(this));
    
    // Track form abandonment
    this.setupAbandonmentTracking();
  }
  
  trackFormFields() {
    const fields = this.form.querySelectorAll('input, textarea, select');
    
    fields.forEach(field => {
      // Track when user focuses on a field
      if (this.options.trackFieldFocus) {
        field.addEventListener('focus', (e) => {
          this.recordFieldFocus(e.target);
        });
      }
      
      // Track when user changes a field
      if (this.options.trackFieldChange) {
        field.addEventListener('change', (e) => {
          this.recordFieldChange(e.target);
        });
        
        field.addEventListener('input', (e) => {
          // Throttle input events to avoid too many tracking calls
          if (!this.fieldInputThrottle) {
            this.fieldInputThrottle = setTimeout(() => {
              this.recordFieldChange(e.target, 'input');
              this.fieldInputThrottle = null;
            }, 500);
          }
        });
      }
    });
  }
  
  recordFieldFocus(field) {
    // Record the time when the user first interacted with this field
    if (!this.fieldStartTime.has(field.name)) {
      this.fieldStartTime.set(field.name, Date.now());
    }
    
    // Increment interaction count
    const currentCount = this.fieldInteractionCount.get(field.name) || 0;
    this.fieldInteractionCount.set(field.name, currentCount + 1);
    
    // Update form data
    this.updateFormData(field);
    
    // Call the focus callback if provided
    if (this.options.onFieldFocus) {
      this.options.onFieldFocus({
        field: field.name,
        fieldType: field.type,
        timestamp: Date.now()
      });
    }
  }
  
  recordFieldChange(field, eventType = 'change') {
    // Update form data
    this.updateFormData(field);
    
    // Calculate time spent on this field
    let timeSpent = 0;
    if (this.fieldStartTime.has(field.name)) {
      timeSpent = Date.now() - this.fieldStartTime.get(field.name);
    }
    
    // Get interaction count
    const interactionCount = this.fieldInteractionCount.get(field.name) || 0;
    
    // Call the change callback if provided
    if (this.options.onFieldChange) {
      this.options.onFieldChange({
        field: field.name,
        fieldType: field.type,
        value: this.getSanitizedValue(field),
        eventType,
        timeSpent,
        interactionCount,
        timestamp: Date.now()
      });
    }
  }
  
  updateFormData(field) {
    if (field.type === 'checkbox' || field.type === 'radio') {
      if (field.checked) {
        if (Array.isArray(this.formData[field.name])) {
          this.formData[field.name].push(field.value);
        } else if (field.type === 'radio') {
          this.formData[field.name] = field.value;
        } else {
          this.formData[field.name] = [field.value];
        }
      }
    } else {
      this.formData[field.name] = field.value;
    }
  }
  
  getSanitizedValue(field) {
    // Sanitize the value to remove potentially sensitive information
    // In a real implementation, you'd want to be more granular about what to sanitize
    if (field.type === 'password' || field.name.toLowerCase().includes('password')) {
      return '[PASSWORD]';
    } else if (field.type === 'tel' || field.name.toLowerCase().includes('phone')) {
      // Partially mask phone numbers
      const value = field.value;
      if (value.length > 4) {
        return value.substring(0, value.length - 4) + 'XXXX';
      }
      return value;
    } else if (field.type === 'email') {
      // Partially mask emails
      const parts = field.value.split('@');
      if (parts.length === 2) {
        const localPart = parts[0];
        if (localPart.length > 2) {
          return localPart.substring(0, 1) + '***@' + parts[1];
        }
      }
      return field.value;
    }
    return field.value;
  }
  
  handleFormSubmit(e) {
    this.submitStartTime = Date.now();
    this.isFormAbandoned = false;
    
    // Record that the form was submitted
    const formData = this.getFormData();
    
    // Call the submit callback if provided
    if (this.options.onFormSubmit) {
      this.options.onFormSubmit({
        formData,
        timestamp: Date.now(),
        fieldsCount: Object.keys(formData).length
      });
    }
  }
  
  setupAbandonmentTracking() {
    // Track when the user leaves the page
    window.addEventListener('beforeunload', () => {
      this.checkForAbandonment();
    });
    
    // Track when the user navigates away
    window.addEventListener('pagehide', () => {
      this.checkForAbandonment();
    });
    
    // Set up a timer to detect if the form is abandoned after submission
    setInterval(() => {
      if (this.submitStartTime && 
          (Date.now() - this.submitStartTime) > this.options.submitDelay && 
          !this.isFormAbandoned) {
        this.handleFormAbandon();
      }
    }, 1000);
  }
  
  checkForAbandonment() {
    if (!this.submitStartTime || (Date.now() - this.submitStartTime) > this.options.submitDelay) {
      this.handleFormAbandon();
    }
  }
  
  handleFormAbandon() {
    if (this.isFormAbandoned) return;
    
    this.isFormAbandoned = true;
    
    // Calculate form completion rate
    const totalFields = this.form.querySelectorAll('input, textarea, select, [required]').length;
    const filledFields = Object.keys(this.formData).filter(key => this.formData[key] !== '').length;
    const completionRate = totalFields > 0 ? (filledFields / totalFields) * 100 : 0;
    
    // Call the abandonment callback if provided
    if (this.options.onFormAbandon) {
      this.options.onFormAbandon({
        formData: this.getFormData(),
        completionRate,
        totalFields,
        filledFields,
        timestamp: Date.now()
      });
    }
  }
  
  getFormData() {
    // Return a copy of the form data
    return { ...this.formData };
  }
  
  getAnalyticsData() {
    // Compile all tracked data
    const totalInteractions = Array.from(this.fieldInteractionCount.values())
      .reduce((sum, count) => sum + count, 0);
    
    const totalFields = this.form.querySelectorAll('input, textarea, select').length;
    const filledFields = Object.keys(this.formData)
      .filter(key => this.formData[key] !== '' && this.formData[key] !== null && this.formData[key] !== undefined)
      .length;
    const completionRate = totalFields > 0 ? (filledFields / totalFields) * 100 : 0;
    
    return {
      formData: this.getFormData(),
      completionRate,
      fieldAnalytics: {
        totalFields,
        filledFields,
        totalInteractions,
        fieldTimes: Object.fromEntries(
          Array.from(this.fieldStartTime.entries()).map(([name, startTime]) => [
            name, 
            Date.now() - startTime
          ])
        ),
        fieldInteractions: Object.fromEntries(this.fieldInteractionCount)
      },
      timestamps: {
        formStartTime: this.fieldStartTime.size > 0 
          ? Math.min(...Array.from(this.fieldStartTime.values())) 
          : null,
        lastInteraction: this.fieldStartTime.size > 0 
          ? Math.max(...Array.from(this.fieldStartTime.values())) 
          : null
      }
    };
  }
  
  reset() {
    this.fieldStartTime.clear();
    this.fieldInteractionCount.clear();
    this.formData = {};
    this.submitStartTime = null;
    this.isFormAbandoned = false;
    this.fieldInputThrottle = null;
  }
}

// Utility functions for common analytics needs
function trackFormCompletion(form, callback) {
  const formAnalytics = new FormAnalytics(form, {
    trackCompletion: true,
    onFormSubmit: callback
  });
  
  return formAnalytics;
}

function trackFormAbandonment(form, callback) {
  const formAnalytics = new FormAnalytics(form, {
    trackAbandonment: true,
    onFormAbandon: callback,
    submitDelay: 5000 // 5 seconds
  });
  
  return formAnalytics;
}

function trackFormFieldUsage(form, callback) {
  const formAnalytics = new FormAnalytics(form, {
    trackFieldFocus: true,
    trackFieldChange: true,
    onFieldFocus: (data) => {
      callback({ ...data, eventType: 'focus' });
    },
    onFieldChange: (data) => {
      callback({ ...data, eventType: data.eventType });
    }
  });
  
  return formAnalytics;
}

// Export the FormAnalytics class and utility functions
export { 
  FormAnalytics, 
  trackFormCompletion, 
  trackFormAbandonment, 
  trackFormFieldUsage 
};