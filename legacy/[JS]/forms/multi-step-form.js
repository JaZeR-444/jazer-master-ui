// Multi-step form utility

class MultiStepForm {
  constructor(formContainer, options = {}) {
    this.container = typeof formContainer === 'string' ? document.querySelector(formContainer) : formContainer;
    this.options = {
      showProgress: options.showProgress || true,
      showStepNumbers: options.showStepNumbers || true,
      validateOnStepChange: options.validateOnStepChange || false,
      validateOnSubmit: options.validateOnSubmit || true,
      animation: options.animation || false,
      ...options
    };
    
    this.steps = [];
    this.currentStep = 0;
    this.formData = {};
    
    this.init();
  }
  
  init() {
    // Create navigation elements if needed
    if (this.options.showProgress) {
      this.createProgressBar();
    }
    
    // Store original form content
    this.originalContent = this.container.innerHTML;
    
    // Wait for steps to be added before rendering
  }
  
  createProgressBar() {
    this.progressBar = document.createElement('div');
    this.progressBar.className = 'multistep-progress';
    
    if (this.options.showStepNumbers) {
      this.progressBar.classList.add('with-step-numbers');
    }
    
    this.container.insertBefore(this.progressBar, this.container.firstChild);
  }
  
  updateProgressBar() {
    if (!this.options.showProgress) return;
    
    this.progressBar.innerHTML = '';
    
    this.steps.forEach((step, index) => {
      const stepElement = document.createElement('div');
      stepElement.className = `step ${index === this.currentStep ? 'active' : index < this.currentStep ? 'completed' : ''}`;
      
      if (this.options.showStepNumbers) {
        const stepNumber = document.createElement('span');
        stepNumber.className = 'step-number';
        stepNumber.textContent = index + 1;
        stepElement.appendChild(stepNumber);
      }
      
      const stepLabel = document.createElement('span');
      stepLabel.className = 'step-label';
      stepLabel.textContent = step.title || `Step ${index + 1}`;
      stepElement.appendChild(stepLabel);
      
      this.progressBar.appendChild(stepElement);
    });
  }
  
  addStep(title, content, validationFn = null) {
    this.steps.push({
      title,
      content: typeof content === 'function' ? content() : content,
      validationFn: validationFn
    });
    
    return this;
  }
  
  render() {
    // Clear container except progress bar
    if (this.progressBar) {
      this.container.innerHTML = '';
      this.container.appendChild(this.progressBar);
    } else {
      this.container.innerHTML = '';
    }
    
    // Create form wrapper
    this.formWrapper = document.createElement('div');
    this.formWrapper.className = 'multistep-form-wrapper';
    this.container.appendChild(this.formWrapper);
    
    // Add current step content
    this.showCurrentStep();
    
    // Update progress bar
    this.updateProgressBar();
    
    // Add navigation
    this.addNavigation();
  }
  
  showCurrentStep() {
    // Add the current step's content
    const stepContent = document.createElement('div');
    stepContent.className = 'step-content';
    stepContent.innerHTML = this.steps[this.currentStep].content;
    
    this.formWrapper.appendChild(stepContent);
    this.currentStepContent = stepContent;
  }
  
  addNavigation() {
    const navContainer = document.createElement('div');
    navContainer.className = 'multistep-navigation';
    
    // Previous button
    if (this.currentStep > 0) {
      const prevBtn = document.createElement('button');
      prevBtn.type = 'button';
      prevBtn.textContent = this.options.prevButtonText || 'Previous';
      prevBtn.className = 'btn-prev';
      prevBtn.addEventListener('click', () => this.previousStep());
      navContainer.appendChild(prevBtn);
    }
    
    // Next/Submit button
    const nextBtn = document.createElement('button');
      nextBtn.type = 'button';
      nextBtn.textContent = 
        this.currentStep === this.steps.length - 1 ? 
        (this.options.submitButtonText || 'Submit') : 
        (this.options.nextButtonText || 'Next');
      nextBtn.className = this.currentStep === this.steps.length - 1 ? 'btn-submit' : 'btn-next';
      nextBtn.addEventListener('click', () => {
        if (this.currentStep === this.steps.length - 1) {
          this.submitForm();
        } else {
          this.nextStep();
        }
      });
    
    navContainer.appendChild(nextBtn);
    
    this.formWrapper.appendChild(navContainer);
  }
  
  async nextStep() {
    if (this.options.validateOnStepChange) {
      const isValid = await this.validateCurrentStep();
      if (!isValid) return;
    }
    
    if (this.currentStep < this.steps.length - 1) {
      this.collectStepData();
      this.currentStep++;
      this.updateView();
    }
  }
  
  previousStep() {
    if (this.currentStep > 0) {
      this.collectStepData();
      this.currentStep--;
      this.updateView();
    }
  }
  
  async validateCurrentStep() {
    const currentStepData = this.steps[this.currentStep];
    if (currentStepData.validationFn) {
      return await currentStepData.validationFn(this.getStepFormData());
    }
    return true;
  }
  
  collectStepData() {
    if (!this.currentStepContent) return;
    
    const stepInputs = this.currentStepContent.querySelectorAll('input, select, textarea');
    stepInputs.forEach(input => {
      if (input.name) {
        if (input.type === 'checkbox') {
          if (!this.formData[input.name]) this.formData[input.name] = [];
          if (input.checked) {
            this.formData[input.name].push(input.value);
          }
        } else if (input.type === 'radio') {
          if (input.checked) {
            this.formData[input.name] = input.value;
          }
        } else {
          this.formData[input.name] = input.value;
        }
      }
    });
  }
  
  getStepFormData() {
    // Get only the form data for the current step
    const stepInputs = this.currentStepContent.querySelectorAll('input, select, textarea');
    const stepData = {};
    
    stepInputs.forEach(input => {
      if (input.name) {
        if (input.type === 'checkbox') {
          if (!stepData[input.name]) stepData[input.name] = [];
          if (input.checked) {
            stepData[input.name].push(input.value);
          }
        } else if (input.type === 'radio') {
          if (input.checked) {
            stepData[input.name] = input.value;
          }
        } else {
          stepData[input.name] = input.value;
        }
      }
    });
    
    return stepData;
  }
  
  updateView() {
    // Clear current content (except progress bar)
    while (this.formWrapper.children.length > (this.progressBar ? 1 : 0)) {
      this.formWrapper.removeChild(this.formWrapper.lastChild);
    }
    
    // Show current step
    this.showCurrentStep();
    
    // Update progress bar
    this.updateProgressBar();
    
    // Add navigation
    this.addNavigation();
  }
  
  async submitForm() {
    this.collectStepData();
    
    if (this.options.validateOnSubmit) {
      const isLastStepValid = await this.validateCurrentStep();
      if (!isLastStepValid) return;
    }
    
    // Trigger submit event
    const submitEvent = new CustomEvent('multistep-submit', {
      detail: { formData: this.getAllFormData() },
      bubbles: true
    });
    
    this.container.dispatchEvent(submitEvent);
    
    // Call the submit callback if provided
    if (this.options.onSubmit) {
      this.options.onSubmit(this.getAllFormData());
    }
  }
  
  getAllFormData() {
    // Collect data from all steps
    this.collectStepData();
    return { ...this.formData };
  }
  
  reset() {
    this.currentStep = 0;
    this.formData = {};
    this.updateView();
  }
  
  goToStep(stepNumber) {
    if (stepNumber >= 0 && stepNumber < this.steps.length) {
      this.collectStepData();
      this.currentStep = stepNumber;
      this.updateView();
    }
  }
}

// Export the MultiStepForm class
export default MultiStepForm;