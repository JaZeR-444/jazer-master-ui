/**
 * Range Slider Component
 * Advanced dual-handle range slider with customizable styling and features
 * Compatible with jazer-brand.css styling for range slider components
 */

class RangeSlider {
  /**
   * Creates a new range slider instance
   * @param {HTMLElement} container - Container element for the slider
   * @param {Object} options - Configuration options
   */
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      min: 0,
      max: 100,
      step: 1,
      start: 0,  // For single handle
      end: 50,   // For dual handle (when range is true)
      range: false, // Whether to show dual handles
      orientation: 'horizontal', // 'horizontal' or 'vertical'
      showTooltip: true,
      showTicks: false,
      tickFrequency: 10,
      showLabels: true,
      snapToTicks: false,
      animate: true,
      animationDuration: 200,
      formatValue: null, // Function to format value display
      className: 'range-slider',
      ...options
    };

    this.values = {
      start: this.options.start,
      end: this.options.range ? this.options.end : this.options.start
    };
    
    this.dragging = null; // 'start', 'end', or null
    this.slider = null;
    this.track = null;
    this.startHandle = null;
    this.endHandle = null;
    this.tooltip = null;
    this.rangeFill = null;
    
    this.init();
  }

  /**
   * Initializes the range slider
   */
  init() {
    this.createSliderStructure();
    this.bindEvents();
    this.updateSlider();
    this.addDynamicStyles();
  }

  /**
   * Creates the slider structure
   */
  createSliderStructure() {
    // Create main slider element
    this.slider = document.createElement('div');
    this.slider.className = `range-slider ${this.options.className}`;
    this.slider.classList.add(`range-slider-${this.options.orientation}`);
    
    // Add ARIA attributes
    this.slider.setAttribute('role', 'slider');
    this.slider.setAttribute('aria-valuemin', this.options.min);
    this.slider.setAttribute('aria-valuemax', this.options.max);
    this.slider.setAttribute('tabindex', 0);
    
    if (this.options.range) {
      this.slider.setAttribute('aria-valuenow', this.values.start);
      this.slider.setAttribute('aria-valuetext', `Range from ${this.values.start} to ${this.values.end}`);
    } else {
      this.slider.setAttribute('aria-valuenow', this.values.start);
      this.slider.setAttribute('aria-valuetext', `${this.values.start}`);
    }
    
    // Create track
    this.track = document.createElement('div');
    this.track.className = 'range-slider-track';
    
    // Create range fill (for dual handle sliders)
    if (this.options.range) {
      this.rangeFill = document.createElement('div');
      this.rangeFill.className = 'range-slider-range-fill';
      this.track.appendChild(this.rangeFill);
    }
    
    // Create handles
    this.startHandle = document.createElement('div');
    this.startHandle.className = 'range-slider-handle range-slider-handle-start';
    this.startHandle.setAttribute('role', 'slider');
    this.startHandle.setAttribute('aria-valuemin', this.options.min);
    this.startHandle.setAttribute('aria-valuemax', this.options.max);
    this.startHandle.setAttribute('aria-valuenow', this.values.start);
    this.startHandle.setAttribute('tabindex', 0);
    
    if (this.options.showTooltip) {
      this.startTooltip = document.createElement('div');
      this.startTooltip.className = 'range-slider-tooltip range-slider-tooltip-start';
      this.startTooltip.textContent = this.formatValue(this.values.start);
      this.startHandle.appendChild(this.startTooltip);
    }
    
    if (this.options.range) {
      this.endHandle = document.createElement('div');
      this.endHandle.className = 'range-slider-handle range-slider-handle-end';
      this.endHandle.setAttribute('role', 'slider');
      this.endHandle.setAttribute('aria-valuemin', this.options.min);
      this.endHandle.setAttribute('aria-valuemax', this.options.max);
      this.endHandle.setAttribute('aria-valuenow', this.values.end);
      this.endHandle.setAttribute('tabindex', 0);
      
      if (this.options.showTooltip) {
        this.endTooltip = document.createElement('div');
        this.endTooltip.className = 'range-slider-tooltip range-slider-tooltip-end';
        this.endTooltip.textContent = this.formatValue(this.values.end);
        this.endHandle.appendChild(this.endTooltip);
      }
    }
    
    // Add ticks if enabled
    if (this.options.showTicks) {
      this.createTicks();
    }
    
    // Assemble the slider
    this.track.appendChild(this.startHandle);
    if (this.endHandle) {
      this.track.appendChild(this.endHandle);
    }
    this.slider.appendChild(this.track);
    
    // Add to container
    this.container.appendChild(this.slider);
  }

  /**
   * Creates tick marks for the slider
   */
  createTicks() {
    this.ticksContainer = document.createElement('div');
    this.ticksContainer.className = 'range-slider-ticks';
    
    const step = this.options.tickFrequency;
    const range = this.options.max - this.options.min;
    const count = Math.floor(range / step) + 1;
    
    for (let i = 0; i < count; i++) {
      const tick = document.createElement('div');
      tick.className = 'range-slider-tick';
      
      // Position tick based on percentage
      const position = (i * step / range) * 100;
      if (this.options.orientation === 'horizontal') {
        tick.style.left = `${position}%`;
      } else {
        tick.style.bottom = `${position}%`;
      }
      
      this.ticksContainer.appendChild(tick);
    }
    
    this.slider.appendChild(this.ticksContainer);
  }

  /**
   * Binds event listeners for the slider
   */
  bindEvents() {
    // Handle drag events
    this.startHandle.addEventListener('mousedown', (e) => this.startDrag(e, 'start'));
    if (this.endHandle) {
      this.endHandle.addEventListener('mousedown', (e) => this.startDrag(e, 'end'));
    }
    
    // Touch events for mobile
    this.startHandle.addEventListener('touchstart', (e) => this.startDrag(e, 'start'), { passive: true });
    if (this.endHandle) {
      this.endHandle.addEventListener('touchstart', (e) => this.startDrag(e, 'end'), { passive: true });
    }
    
    // Keyboard events for accessibility
    this.slider.addEventListener('keydown', (e) => this.handleKeyDown(e));
    this.startHandle.addEventListener('keydown', (e) => this.handleKeyDown(e, 'start'));
    if (this.endHandle) {
      this.endHandle.addEventListener('keydown', (e) => this.handleKeyDown(e, 'end'));
    }
    
    // Track click event to adjust nearest handle
    this.track.addEventListener('click', (e) => this.handleClick(e));
  }

  /**
   * Starts the drag operation
   * @param {Event} e - Drag start event
   * @param {string} handle - Which handle is being dragged ('start' or 'end')
   */
  startDrag(e, handle) {
    e.preventDefault();
    this.dragging = handle;
    
    // Add dragging class for styling
    this.container.classList.add('range-slider-dragging');
    
    // Bind move and end events
    document.addEventListener('mousemove', this.handleDrag.bind(this));
    document.addEventListener('touchmove', this.handleDrag.bind(this), { passive: false });
    document.addEventListener('mouseup', this.endDrag.bind(this));
    document.addEventListener('touchend', this.endDrag.bind(this), { passive: false });
  }

  /**
   * Handles the drag operation
   * @param {Event} e - Drag event
   */
  handleDrag(e) {
    if (!this.dragging) return;
    
    e.preventDefault();
    
    // Get position relative to track
    const rect = this.track.getBoundingClientRect();
    let position;
    
    if (e.type.includes('touch')) {
      const touch = e.touches[0] || e.changedTouches[0];
      position = this.options.orientation === 'horizontal' 
        ? touch.clientX - rect.left 
        : touch.clientY - rect.top;
    } else {
      position = this.options.orientation === 'horizontal' 
        ? e.clientX - rect.left 
        : e.clientY - rect.top;
    }
    
    // Calculate percentage position
    const percentage = Math.max(0, Math.min(1, position / rect[this.options.orientation === 'horizontal' ? 'width' : 'height']));
    
    // Calculate value based on percentage
    const value = this.options.min + percentage * (this.options.max - this.options.min);
    
    // Snap to step if enabled
    const steppedValue = this.snapToStep(value);
    
    // Update the value
    if (this.dragging === 'start') {
      if (this.options.range) {
        // Prevent crossover
        this.values.start = Math.min(steppedValue, this.values.end);
      } else {
        this.values.start = steppedValue;
      }
    } else if (this.dragging === 'end') {
      this.values.end = Math.max(steppedValue, this.values.start);
    }
    
    // Update slider UI
    this.updateSlider();
    
    // Trigger change event
    this.triggerChangeEvent();
  }

  /**
   * Ends the drag operation
   */
  endDrag() {
    this.dragging = null;
    this.container.classList.remove('range-slider-dragging');
    
    // Remove event listeners
    document.removeEventListener('mousemove', this.handleDrag);
    document.removeEventListener('touchmove', this.handleDrag);
    document.removeEventListener('mouseup', this.endDrag);
    document.removeEventListener('touchend', this.endDrag);
  }

  /**
   * Handles keyboard events for accessibility
   * @param {KeyboardEvent} e - Keyboard event
   * @param {string} handle - Which handle ('start' or 'end', optional for single handle)
   */
  handleKeyDown(e, handle = null) {
    if (!this.dragging) {
      const currentHandle = handle || (this.options.range ? 'start' : null);
      let value = currentHandle === 'end' ? this.values.end : this.values.start;
      
      const step = this.options.step || 1;
      
      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowDown':
          e.preventDefault();
          value = Math.max(this.options.min, value - step);
          break;
        case 'ArrowRight':
        case 'ArrowUp':
          e.preventDefault();
          value = Math.min(this.options.max, value + step);
          break;
        case 'Home':
          e.preventDefault();
          value = this.options.min;
          break;
        case 'End':
          e.preventDefault();
          value = this.options.max;
          break;
        default:
          return; // Don't handle other keys
      }
      
      // Snap to step
      value = this.snapToStep(value);
      
      // Update values
      if (currentHandle === 'end') {
        if (this.options.range) {
          this.values.end = Math.max(value, this.values.start);
        }
      } else {
        if (this.options.range) {
          this.values.start = Math.min(value, this.values.end);
        } else {
          this.values.start = value;
        }
      }
      
      // Update UI
      this.updateSlider();
      
      // Trigger change event
      this.triggerChangeEvent();
    }
  }

  /**
   * Handles click on the track (moves nearest handle)
   * @param {MouseEvent} e - Click event
   */
  handleClick(e) {
    if (this.dragging) return; // Skip if already dragging
    
    const rect = this.track.getBoundingClientRect();
    const position = this.options.orientation === 'horizontal' 
      ? e.clientX - rect.left 
      : e.clientY - rect.top;
    
    // Calculate percentage and value
    const percentage = Math.max(0, Math.min(1, position / rect[this.options.orientation === 'horizontal' ? 'width' : 'height']));
    const value = this.options.min + percentage * (this.options.max - this.options.min);
    const steppedValue = this.snapToStep(value);
    
    if (this.options.range) {
      // Move the handle closest to the clicked position
      const startDistance = Math.abs(this.valueToPosition(this.values.start) - position);
      const endDistance = Math.abs(this.valueToPosition(this.values.end) - position);
      
      if (startDistance < endDistance) {
        this.values.start = Math.min(steppedValue, this.values.end);
      } else {
        this.values.end = Math.max(steppedValue, this.values.start);
      }
    } else {
      this.values.start = steppedValue;
    }
    
    this.updateSlider();
    this.triggerChangeEvent();
  }

  /**
   * Updates the slider UI based on current values
   */
  updateSlider() {
    // Update handle positions
    this.updateHandlePosition(this.startHandle, this.values.start, 'start');
    if (this.endHandle) {
      this.updateHandlePosition(this.endHandle, this.values.end, 'end');
    }
    
    // Update range fill if applicable
    if (this.rangeFill && this.options.range) {
      const startPos = this.valueToPosition(this.values.start);
      const endPos = this.valueToPosition(this.values.end);
      
      if (this.options.orientation === 'horizontal') {
        this.rangeFill.style.left = `${startPos}%`;
        this.rangeFill.style.width = `${endPos - startPos}%`;
      } else {
        this.rangeFill.style.bottom = `${startPos}%`;
        this.rangeFill.style.height = `${endPos - startPos}%`;
      }
    }
    
    // Update tooltips if enabled
    if (this.options.showTooltip) {
      this.startTooltip.textContent = this.formatValue(this.values.start);
      if (this.endTooltip) {
        this.endTooltip.textContent = this.formatValue(this.values.end);
      }
    }
    
    // Update ARIA attributes
    if (this.options.range) {
      this.slider.setAttribute('aria-valuetext', `Range from ${this.values.start} to ${this.values.end}`);
    } else {
      this.slider.setAttribute('aria-valuenow', this.values.start);
      this.slider.setAttribute('aria-valuetext', `${this.formatValue(this.values.start)}`);
    }
  }

  /**
   * Updates the position of a handle
   * @param {HTMLElement} handle - Handle element to update
   * @param {number} value - Value to position the handle at
   * @param {string} type - Handle type ('start' or 'end')
   */
  updateHandlePosition(handle, value, type) {
    const position = this.valueToPosition(value);
    
    if (this.options.orientation === 'horizontal') {
      handle.style.left = `${position}%`;
    } else {
      handle.style.bottom = `${position}%`;
    }
    
    // Update ARIA value
    handle.setAttribute('aria-valuenow', value);
    
    // Add active class for styling
    if (this.dragging === type) {
      handle.classList.add('range-slider-handle-active');
    } else {
      handle.classList.remove('range-slider-handle-active');
    }
  }

  /**
   * Converts a value to a position percentage
   * @param {number} value - Value to convert
   * @returns {number} Position percentage (0-100)
   */
  valueToPosition(value) {
    const percentage = (value - this.options.min) / (this.options.max - this.options.min);
    return Math.max(0, Math.min(100, percentage * 100));
  }

  /**
   * Converts a position percentage to a value
   * @param {number} position - Position percentage (0-100)
   * @returns {number} Converted value
   */
  positionToValue(position) {
    const value = this.options.min + (position / 100) * (this.options.max - this.options.min);
    return this.snapToStep(value);
  }

  /**
   * Snaps a value to the nearest step
   * @param {number} value - Value to snap
   * @returns {number} Snapped value
   */
  snapToStep(value) {
    if (this.options.snapToTicks) {
      // Snap to nearest tick
      const tickFreq = this.options.tickFrequency || this.options.step;
      return Math.round(value / tickFreq) * tickFreq;
    } else if (this.options.step) {
      // Snap to nearest step
      return Math.round(value / this.options.step) * this.options.step;
    }
    return value;
  }

  /**
   * Formats a value for display
   * @param {number} value - Value to format
   * @returns {string} Formatted value
   */
  formatValue(value) {
    if (this.options.formatValue && typeof this.options.formatValue === 'function') {
      return this.options.formatValue(value);
    }
    return value.toString();
  }

  /**
   * Triggers a change event
   */
  triggerChangeEvent() {
    // Create a custom event
    const event = new CustomEvent('rangesliderchange', {
      detail: {
        start: this.values.start,
        end: this.values.end,
        range: this.options.range
      }
    });
    
    this.slider.dispatchEvent(event);
  }

  /**
   * Sets the slider value(s)
   * @param {number|Array} value - Single value for single slider, array [start, end] for range slider
   * @param {boolean} triggerEvent - Whether to trigger change event
   */
  setValue(value, triggerEvent = true) {
    if (Array.isArray(value) && this.options.range) {
      // Range slider
      this.values.start = Math.max(this.options.min, Math.min(value[0], this.options.max));
      this.values.end = Math.max(this.options.min, Math.min(value[1], this.options.max));
      
      // Ensure start <= end
      if (this.values.start > this.values.end) {
        [this.values.start, this.values.end] = [this.values.end, this.values.start];
      }
    } else if (!Array.isArray(value) && !this.options.range) {
      // Single slider
      this.values.start = Math.max(this.options.min, Math.min(value, this.options.max));
    } else {
      throw new Error('Invalid value for current slider configuration');
    }
    
    // Update UI
    this.updateSlider();
    
    // Trigger event if requested
    if (triggerEvent) {
      this.triggerChangeEvent();
    }
  }

  /**
   * Gets the current slider value(s)
   * @returns {number|Array} Single value for single slider, array [start, end] for range slider
   */
  getValue() {
    if (this.options.range) {
      return [this.values.start, this.values.end];
    } else {
      return this.values.start;
    }
  }

  /**
   * Sets the minimum value
   * @param {number} min - New minimum value
   */
  setMin(min) {
    this.options.min = min;
    
    // Ensure current values stay within new bounds
    this.values.start = Math.max(min, Math.min(this.values.start, this.options.max));
    if (this.options.range) {
      this.values.end = Math.max(min, Math.min(this.values.end, this.options.max));
    }
    
    // Update UI
    this.updateSlider();
  }

  /**
   * Sets the maximum value
   * @param {number} max - New maximum value
   */
  setMax(max) {
    this.options.max = max;
    
    // Ensure current values stay within new bounds
    this.values.start = Math.max(this.options.min, Math.min(this.values.start, max));
    if (this.options.range) {
      this.values.end = Math.max(this.options.min, Math.min(this.values.end, max));
    }
    
    // Update UI
    this.updateSlider();
  }

  /**
   * Sets the step value
   * @param {number} step - New step value
   */
  setStep(step) {
    this.options.step = step;
  }

  /**
   * Sets the orientation
   * @param {string} orientation - New orientation ('horizontal' or 'vertical')
   */
  setOrientation(orientation) {
    if (['horizontal', 'vertical'].includes(orientation)) {
      // Remove old orientation class
      this.slider.classList.remove('range-slider-horizontal', 'range-slider-vertical');
      
      // Add new orientation class
      this.options.orientation = orientation;
      this.slider.classList.add(`range-slider-${orientation}`);
      
      // Update UI
      this.updateSlider();
    }
  }

  /**
   * Enables or disables the range slider
   * @param {boolean} enabled - Whether slider should be enabled
   */
  setEnabled(enabled) {
    this.slider.classList.toggle('range-slider-disabled', !enabled);
    
    if (enabled) {
      this.slider.removeAttribute('aria-disabled');
    } else {
      this.slider.setAttribute('aria-disabled', 'true');
    }
  }

  /**
   * Adds dynamic styles for the range slider
   */
  addDynamicStyles() {
    if (document.getElementById('range-slider-styles')) return;

    const style = document.createElement('style');
    style.id = 'range-slider-styles';
    style.textContent = `
      .range-slider {
        position: relative;
        width: 100%;
        height: 40px;
        display: flex;
        align-items: center;
      }

      .range-slider-horizontal {
        height: 40px;
      }

      .range-slider-vertical {
        width: 40px;
        height: 200px;
        flex-direction: column;
      }

      .range-slider-track {
        position: relative;
        width: 100%;
        height: 6px;
        background: var(--bg-darker, #111);
        border-radius: 3px;
        cursor: pointer;
      }

      .range-slider-vertical .range-slider-track {
        width: 6px;
        height: 100%;
        margin: 0 auto;
      }

      .range-slider-range-fill {
        position: absolute;
        height: 100%;
        background: var(--jazer-cyan, #00f2ea);
        border-radius: 3px;
      }

      .range-slider-vertical .range-slider-range-fill {
        width: 100%;
        height: auto;
        bottom: 0;
      }

      .range-slider-handle {
        position: absolute;
        width: 20px;
        height: 20px;
        background: var(--bg-lightest, #fff);
        border: 2px solid var(--border-default, #4facfe);
        border-radius: 50%;
        cursor: grab;
        transform: translate(-50%, -50%);
        z-index: 3;
        transition: all 0.2s ease;
      }

      .range-slider-handle:hover {
        background: var(--bg-lighter, #f0f0f0);
        transform: translate(-50%, -50%) scale(1.1);
      }

      .range-slider-handle:active, .range-slider-handle-active {
        cursor: grabbing;
        transform: translate(-50%, -50%) scale(1.2);
        box-shadow: 0 0 10px rgba(0, 242, 234, 0.5);
      }

      .range-slider-handle-start {
        top: 50%;
      }

      .range-slider-handle-end {
        top: 50%;
      }

      .range-slider-vertical .range-slider-handle {
        left: 50%;
        top: auto;
        transform: translate(-50%, 50%);
      }

      .range-slider-vertical .range-slider-handle:active,
      .range-slider-vertical .range-slider-handle-active {
        transform: translate(-50%, 50%) scale(1.2);
      }

      .range-slider-tooltip {
        position: absolute;
        top: -30px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--bg-darker, #111);
        color: var(--text-light, #fff);
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.8rem;
        white-space: nowrap;
        opacity: 0;
        transition: opacity 0.2s ease;
        pointer-events: none;
      }

      .range-slider-handle:hover .range-slider-tooltip {
        opacity: 1;
      }

      .range-slider-vertical .range-slider-tooltip {
        top: auto;
        left: 30px;
        bottom: 50%;
        transform: translateY(50%);
      }

      .range-slider-ticks {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }

      .range-slider-tick {
        position: absolute;
        width: 2px;
        height: 5px;
        background: var(--border-lighter, #222);
      }

      .range-slider-vertical .range-slider-tick {
        width: 5px;
        height: 2px;
        left: auto;
        right: 0;
      }

      .range-slider-disabled {
        opacity: 0.6;
        pointer-events: none;
      }

      .range-slider:focus {
        outline: none;
      }

      .range-slider-handle:focus {
        outline: 2px solid var(--jazer-cyan, #00f2ea);
        outline-offset: 2px;
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Destroys the range slider instance and cleans up
   */
  destroy() {
    // Remove event listeners
    this.startHandle.removeEventListener('mousedown', this.handleDrag);
    if (this.endHandle) {
      this.endHandle.removeEventListener('mousedown', this.handleDrag);
    }
    
    // Remove from DOM
    if (this.slider && this.slider.parentNode) {
      this.slider.parentNode.removeChild(this.slider);
    }
    
    // Remove styles if no other sliders exist
    if (document.querySelectorAll('.range-slider').length === 0) {
      const styleElement = document.getElementById('range-slider-styles');
      if (styleElement) {
        styleElement.parentNode.removeChild(styleElement);
      }
    }
  }
}

/**
 * Initializes all range sliders on the page
 * @param {HTMLElement|Document} container - Container to search for range sliders
 * @returns {Array<RangeSlider>} Array of initialized range slider instances
 */
function initRangeSliders(container = document) {
  const sliderElements = container.querySelectorAll('.range-slider, [data-range-slider]');
  const instances = [];

  sliderElements.forEach(element => {
    if (!element.hasAttribute('data-range-slider-initialized')) {
      element.setAttribute('data-range-slider-initialized', 'true');

      // Get options from data attributes
      const options = {
        min: parseFloat(element.dataset.min) || 0,
        max: parseFloat(element.dataset.max) || 100,
        step: parseFloat(element.dataset.step) || 1,
        start: parseFloat(element.dataset.start) || 0,
        end: parseFloat(element.dataset.end) || null,
        range: element.dataset.range === 'true',
        orientation: element.dataset.orientation || 'horizontal',
        showTooltip: element.dataset.showTooltip !== 'false',
        showTicks: element.dataset.showTicks === 'true',
        tickFrequency: parseFloat(element.dataset.tickFrequency) || 10,
        snapToTicks: element.dataset.snapToTicks === 'true',
        animate: element.dataset.animate !== 'false',
        ...JSON.parse(element.dataset.options || '{}')
      };

      // Set default end value for range sliders if not specified
      if (options.range && options.end === null) {
        options.end = options.max / 2;
      }

      const instance = new RangeSlider(element, options);
      instances.push(instance);
    }
  });

  return instances;
}

/**
 * Auto-initialize range sliders when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initRangeSliders();
  }, 0);
});

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { RangeSlider, initRangeSliders };
}

// Make available globally
window.RangeSlider = RangeSlider;
window.initRangeSliders = initRangeSliders;