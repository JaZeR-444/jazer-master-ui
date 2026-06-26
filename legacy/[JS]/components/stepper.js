/**
 * Stepper Component
 * Multi-step process indicator with navigation controls
 * Compatible with jazer-brand.css styling
 */

class Stepper {
  /**
   * Creates a new stepper component
   * @param {HTMLElement} stepperElement - The stepper container element
   * @param {Object} steps - Configuration for steps
   * @param {Object} options - Configuration options
   */
  constructor(stepperElement, steps, options = {}) {
    this.stepper = stepperElement;
    this.steps = steps;
    this.options = {
      initialStep: 0,
      linear: true, // If true, user can only go to next step if previous is completed
      showStepNumbers: true,
      showNavigation: true,
      enableNavigationClick: true,
      animationDuration: 300,
      ...options
    };

    this.currentStep = this.options.initialStep;
    this.completedSteps = new Set();
    
    // Mark initial steps as completed if specified
    for (let i = 0; i < this.options.initialStep; i++) {
      this.completedSteps.add(i);
    }

    this.init();
  }

  /**
   * Initializes the stepper
   */
  init() {
    // Validate steps
    if (!this.steps || this.steps.length === 0) {
      console.error('Stepper requires at least one step');
      return;
    }

    // Set up the stepper structure
    this.setupStepper();

    // Bind events
    this.bindEvents();
  }

  /**
   * Sets up the stepper structure
   */
  setupStepper() {
    // Add stepper classes
    this.stepper.classList.add('stepper');
    
    // Create stepper header with step indicators
    this.header = document.createElement('div');
    this.header.classList.add('stepper-header');
    
    // Create step indicators
    this.steps.forEach((step, index) => {
      const stepIndicator = document.createElement('div');
      stepIndicator.classList.add('step-indicator');
      stepIndicator.setAttribute('data-step-index', index);
      stepIndicator.setAttribute('role', 'button');
      stepIndicator.setAttribute('tabindex', this.options.enableNavigationClick ? '0' : '-1');
      stepIndicator.setAttribute('aria-label', `Step ${index + 1}: ${step.title}`);
      
      if (this.options.showStepNumbers) {
        const stepNumber = document.createElement('div');
        stepNumber.classList.add('step-number');
        stepNumber.textContent = index + 1;
        stepIndicator.appendChild(stepNumber);
      }
      
      const stepTitle = document.createElement('div');
      stepTitle.classList.add('step-title');
      stepTitle.textContent = step.title;
      stepIndicator.appendChild(stepTitle);
      
      // Add to header
      this.header.appendChild(stepIndicator);
    });
    
    this.stepper.appendChild(this.header);
    
    // Create content area for step content
    this.contentArea = document.createElement('div');
    this.contentArea.classList.add('stepper-content');
    
    // Create step content containers
    this.steps.forEach((step, index) => {
      const stepContent = document.createElement('div');
      stepContent.classList.add('step-content');
      stepContent.setAttribute('data-step-index', index);
      stepContent.style.display = index === this.currentStep ? 'block' : 'none';
      
      // Set content based on type
      if (typeof step.content === 'string') {
        stepContent.innerHTML = step.content;
      } else if (step.content instanceof HTMLElement) {
        stepContent.appendChild(step.content.cloneNode(true));
      } else if (typeof step.content === 'function') {
        stepContent.innerHTML = step.content();
      } else {
        stepContent.innerHTML = step.content || `<p>Content for ${step.title}</p>`;
      }
      
      this.contentArea.appendChild(stepContent);
    });
    
    this.stepper.appendChild(this.contentArea);
    
    // Create navigation if enabled
    if (this.options.showNavigation) {
      this.createNavigation();
    }
    
    // Update step states
    this.updateStepStates();
  }

  /**
   * Creates navigation controls
   */
  createNavigation() {
    this.navigation = document.createElement('div');
    this.navigation.classList.add('stepper-navigation');
    
    // Previous button
    this.prevButton = document.createElement('button');
    this.prevButton.classList.add('btn', 'btn-outline', 'stepper-prev');
    this.prevButton.textContent = 'Previous';
    this.prevButton.setAttribute('aria-label', 'Go to previous step');
    this.prevButton.disabled = true; // Initially disabled
    
    // Next button
    this.nextButton = document.createElement('button');
    this.nextButton.classList.add('btn', 'stepper-next');
    this.nextButton.textContent = this.isLastStep() ? 'Finish' : 'Next';
    this.nextButton.setAttribute('aria-label', 'Go to next step');
    
    // Add buttons to navigation
    this.navigation.appendChild(this.prevButton);
    this.navigation.appendChild(this.nextButton);
    
    this.stepper.appendChild(this.navigation);
  }

  /**
   * Binds event listeners for the stepper
   */
  bindEvents() {
    // Step indicator clicks
    if (this.options.enableNavigationClick) {
      const stepIndicators = this.stepper.querySelectorAll('.step-indicator');
      stepIndicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
          this.goToStep(index);
        });
        
        // Keyboard events for step indicators
        indicator.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.goToStep(index);
          }
        });
      });
    }

    // Next button click
    if (this.nextButton) {
      this.nextButton.addEventListener('click', () => {
        this.nextStep();
      });
    }

    // Previous button click
    if (this.prevButton) {
      this.prevButton.addEventListener('click', () => {
        this.prevStep();
      });
    }

    // Keyboard navigation
    this.stepper.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          if (e.target.closest('.step-indicator')) {
            e.preventDefault();
            this.prevStep();
          }
          break;
        case 'ArrowRight':
          if (e.target.closest('.step-indicator')) {
            e.preventDefault();
            this.nextStep();
          }
          break;
      }
    });
  }

  /**
   * Goes to the next step
   */
  nextStep() {
    if (this.hasNextStep()) {
      // Validate current step if validation function provided
      if (this.steps[this.currentStep].validate && !this.steps[this.currentStep].validate()) {
        return; // Don't proceed if validation fails
      }
      
      // Mark current step as completed
      this.completedSteps.add(this.currentStep);
      
      this.goToStep(this.currentStep + 1);
    }
  }

  /**
   * Goes to the previous step
   */
  prevStep() {
    if (this.hasPrevStep()) {
      this.goToStep(this.currentStep - 1);
    }
  }

  /**
   * Goes to a specific step
   * @param {number} stepIndex - Index of the step to go to
   */
  goToStep(stepIndex) {
    // Validate bounds
    if (stepIndex < 0 || stepIndex >= this.steps.length) {
      return;
    }
    
    // Check if step can be navigated to based on linear option
    if (this.options.linear && stepIndex > this.currentStep && !this.isStepCompleted(this.currentStep)) {
      this.showNotification('Please complete the current step first', 'warning');
      return;
    }
    
    // Check if user is trying to go forward past their progress
    if (this.options.linear && stepIndex > this.currentStep && !this.isStepCompleted(stepIndex - 1)) {
      this.showNotification(`Please complete step ${stepIndex} first`, 'warning');
      return;
    }
    
    const oldStep = this.currentStep;
    this.currentStep = stepIndex;
    
    // Update display
    this.updateDisplay();
    
    // Update step states
    this.updateStepStates();
    
    // Trigger custom event
    this.stepper.dispatchEvent(new CustomEvent('stepchange', {
      detail: { 
        oldStep: oldStep, 
        newStep: stepIndex,
        step: this.steps[stepIndex]
      }
    }));
  }

  /**
   * Updates the display to show the current step
   */
  updateDisplay() {
    // Hide all step content
    const stepContents = this.stepper.querySelectorAll('.step-content');
    stepContents.forEach((content, index) => {
      content.style.display = index === this.currentStep ? 'block' : 'none';
    });
    
    // Update navigation buttons
    if (this.prevButton) {
      this.prevButton.disabled = !this.hasPrevStep();
    }
    
    if (this.nextButton) {
      this.nextButton.textContent = this.isLastStep() ? 'Finish' : 'Next';
    }
  }

  /**
   * Updates the state of step indicators
   */
  updateStepStates() {
    const stepIndicators = this.stepper.querySelectorAll('.step-indicator');
    
    stepIndicators.forEach((indicator, index) => {
      // Reset classes
      indicator.classList.remove(
        'step-active', 
        'step-completed', 
        'step-pending', 
        'step-disabled'
      );
      
      // Add appropriate class based on state
      if (index === this.currentStep) {
        indicator.classList.add('step-active');
      } else if (this.isStepCompleted(index)) {
        indicator.classList.add('step-completed');
      } else if (index < this.currentStep) {
        indicator.classList.add('step-completed');
      } else {
        indicator.classList.add('step-pending');
      }
      
      // Disable future steps if navigation is restricted
      if (this.options.linear && index > this.currentStep && !this.isStepCompleted(index - 1)) {
        indicator.classList.add('step-disabled');
      }
    });
  }

  /**
   * Checks if there's a next step
   * @returns {boolean} True if there's a next step
   */
  hasNextStep() {
    return this.currentStep < this.steps.length - 1;
  }

  /**
   * Checks if there's a previous step
   * @returns {boolean} True if there's a previous step
   */
  hasPrevStep() {
    return this.currentStep > 0;
  }

  /**
   * Checks if it's the last step
   * @returns {boolean} True if it's the last step
   */
  isLastStep() {
    return this.currentStep === this.steps.length - 1;
  }

  /**
   * Checks if a step is completed
   * @param {number} stepIndex - Index of the step
   * @returns {boolean} True if the step is completed
   */
  isStepCompleted(stepIndex) {
    return this.completedSteps.has(stepIndex);
  }

  /**
   * Marks a step as completed
   * @param {number} stepIndex - Index of the step to mark as completed
   */
  markStepCompleted(stepIndex) {
    if (stepIndex >= 0 && stepIndex < this.steps.length) {
      this.completedSteps.add(stepIndex);
      this.updateStepStates();
    }
  }

  /**
   * Marks a step as uncompleted
   * @param {number} stepIndex - Index of the step to mark as uncompleted
   */
  markStepUncompleted(stepIndex) {
    this.completedSteps.delete(stepIndex);
    this.updateStepStates();
  }

  /**
   * Gets the current step index
   * @returns {number} Current step index
   */
  getCurrentStep() {
    return this.currentStep;
  }

  /**
   * Gets the total number of steps
   * @returns {number} Total number of steps
   */
  getStepCount() {
    return this.steps.length;
  }

  /**
   * Shows a notification
   * @param {string} message - Notification message
   * @param {string} type - Notification type
   */
  showNotification(message, type = 'info') {
    // For simplicity, using browser alert - in a real implementation this would use the notification system
    console.log(`[${type.toUpperCase()}] Stepper: ${message}`);
  }

  /**
   * Completes the stepper process
   */
  complete() {
    // Mark all steps as completed
    for (let i = 0; i < this.steps.length; i++) {
      this.completedSteps.add(i);
    }
    
    // Update UI
    this.updateStepStates();
    
    // Trigger completion event
    this.stepper.dispatchEvent(new CustomEvent('steppercomplete', {
      detail: { steps: this.steps }
    }));
  }

  /**
   * Resets the stepper to the initial state
   * @param {number} stepIndex - Step index to reset to (default: initial step)
   */
  reset(stepIndex = this.options.initialStep) {
    this.currentStep = stepIndex;
    this.completedSteps.clear();
    
    // Mark initial steps as completed if specified
    for (let i = 0; i < stepIndex; i++) {
      this.completedSteps.add(i);
    }
    
    // Update display and states
    this.updateDisplay();
    this.updateStepStates();
    
    // Trigger reset event
    this.stepper.dispatchEvent(new CustomEvent('stepperreset', {
      detail: { step: stepIndex }
    }));
  }

  /**
   * Navigates to a specific step with validation
   * @param {number} stepIndex - Index of the step to navigate to
   * @param {boolean} validate - Whether to validate the transition
   */
  navigateToStep(stepIndex, validate = true) {
    if (validate && this.options.linear) {
      // Check if we can navigate to the requested step
      if (stepIndex > this.currentStep) {
        // For forward navigation, validate that previous steps are completed
        for (let i = this.currentStep; i < stepIndex; i++) {
          if (!this.isStepCompleted(i)) {
            this.showNotification(`Please complete step ${i + 1} first`, 'warning');
            return false;
          }
        }
      }
    }
    
    this.goToStep(stepIndex);
    return true;
  }

  /**
   * Updates the content of a step
   * @param {number} stepIndex - Index of the step to update
   * @param {string|HTMLElement|Function} content - New content
   */
  updateStepContent(stepIndex, content) {
    if (stepIndex < 0 || stepIndex >= this.steps.length) {
      return;
    }
    
    // Update internal step data
    this.steps[stepIndex].content = content;
    
    // Update the DOM element
    const stepContentElement = this.stepper.querySelector(`.step-content[data-step-index="${stepIndex}"]`);
    if (stepContentElement) {
      if (typeof content === 'string') {
        stepContentElement.innerHTML = content;
      } else if (content instanceof HTMLElement) {
        stepContentElement.innerHTML = '';
        stepContentElement.appendChild(content.cloneNode(true));
      } else if (typeof content === 'function') {
        stepContentElement.innerHTML = content();
      }
    }
  }
}

/**
 * Initializes all steppers on the page
 * @param {HTMLElement|Document} container - Container to search for steppers
 * @returns {Array<Stepper>} Array of initialized stepper instances
 */
function initSteppers(container = document) {
  const steppers = container.querySelectorAll('.stepper, [data-stepper]');
  const instances = [];

  steppers.forEach(stepper => {
    if (!stepper.hasAttribute('data-stepper-initialized')) {
      stepper.setAttribute('data-stepper-initialized', 'true');

      // Get options from data attributes
      const options = {
        initialStep: parseInt(stepper.dataset.initialStep) || 0,
        linear: stepper.dataset.linear !== 'false',
        showStepNumbers: stepper.dataset.showStepNumbers !== 'false',
        showNavigation: stepper.dataset.showNavigation !== 'false',
        enableNavigationClick: stepper.dataset.enableNavigationClick !== 'false',
        animationDuration: parseInt(stepper.dataset.animationDuration) || 300
      };

      // Try to get steps from data attribute (JSON string)
      let steps = [];
      if (stepper.dataset.steps) {
        try {
          steps = JSON.parse(stepper.dataset.steps);
        } catch (e) {
          console.error('Invalid steps data:', e);
        }
      }

      // If no steps from data attribute, try to get them from child elements
      if (steps.length === 0) {
        const stepElements = stepper.querySelectorAll('.step-definition');
        if (stepElements.length > 0) {
          steps = Array.from(stepElements).map((el, index) => ({
            title: el.dataset.title || `Step ${index + 1}`,
            content: el.innerHTML
          }));
        }
      }

      // If still no steps, create a default single step
      if (steps.length === 0) {
        steps = [{ title: 'Step 1', content: stepper.innerHTML }];
      }

      const instance = new Stepper(stepper, steps, options);
      instances.push(instance);
    }
  });

  return instances;
}

/**
 * Auto-initialize steppers when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initSteppers();
  }, 0);
});

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Stepper, initSteppers };
}

// Also make it available globally
window.Stepper = Stepper;
window.initSteppers = initSteppers;