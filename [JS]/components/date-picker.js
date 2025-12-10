/**
 * Date Picker Component
 * Accessible date picker with calendar interface
 * Compatible with jazer-brand.css styling
 */

class DatePicker {
  /**
   * Creates a new date picker component
   * @param {HTMLElement} inputElement - Input element to attach date picker to
   * @param {Object} options - Configuration options for the date picker
   */
  constructor(inputElement, options = {}) {
    this.input = inputElement;
    this.options = {
      format: 'YYYY-MM-DD',
      minDate: null,
      maxDate: null,
      defaultDate: null,
      firstDayOfWeek: 0, // 0 = Sunday, 1 = Monday
      animationDuration: 200,
      ...options
    };
    
    this.calendar = null;
    this.currentDate = new Date();
    this.selectedDate = null;
    this.isVisible = false;
    
    this.init();
  }

  /**
   * Initializes the date picker component
   */
  init() {
    // Set up input field
    this.input.setAttribute('role', 'combobox');
    this.input.setAttribute('aria-autocomplete', 'none');
    this.input.setAttribute('aria-haspopup', 'dialog');
    this.input.setAttribute('aria-expanded', 'false');
    this.input.setAttribute('readonly', 'readonly');
    
    // Setup initial value if exists
    if (this.input.value) {
      this.selectedDate = new Date(this.input.value);
      this.currentDate = new Date(this.selectedDate);
    }
    
    // Create calendar element
    this.createCalendar();
    
    // Bind events
    this.bindEvents();
  }

  /**
   * Creates the calendar element
   */
  createCalendar() {
    this.calendar = document.createElement('div');
    this.calendar.className = 'calendar-picker';
    this.calendar.setAttribute('role', 'dialog');
    this.calendar.setAttribute('aria-modal', 'true');
    this.calendar.style.cssText = `
      position: absolute;
      background: var(--bg-dark);
      border: 2px solid var(--border-default);
      border-radius: var(--radius-lg);
      padding: 1rem;
      z-index: 1000;
      display: none;
      min-width: 300px;
      box-shadow: var(--shadow-card);
      backdrop-filter: blur(10px);
    `;
    
    // Calendar header
    const header = document.createElement('div');
    header.className = 'calendar-header';
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    `;

    const monthYearDisplay = document.createElement('div');
    monthYearDisplay.className = 'month-year-display';
    monthYearDisplay.textContent = this.formatMonthYear(this.currentDate);
    monthYearDisplay.style.cssText = `
      font-weight: bold;
      font-size: 1.2rem;
      color: var(--jazer-cyan);
    `;

    const prevButton = document.createElement('button');
    prevButton.innerHTML = '‹';
    prevButton.className = 'btn btn-outline';
    prevButton.style.cssText = `
      width: 36px;
      height: 36px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    prevButton.setAttribute('aria-label', 'Previous month');

    const nextButton = document.createElement('button');
    nextButton.innerHTML = '›';
    nextButton.className = 'btn btn-outline';
    nextButton.style.cssText = `
      width: 36px;
      height: 36px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    nextButton.setAttribute('aria-label', 'Next month');

    header.appendChild(prevButton);
    header.appendChild(monthYearDisplay);
    header.appendChild(nextButton);

    // Day headers
    const dayHeaders = document.createElement('div');
    dayHeaders.className = 'day-headers';
    dayHeaders.style.cssText = `
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 0.25rem;
      margin-bottom: 0.5rem;
    `;

    const dayNames = this.options.firstDayOfWeek === 1 ?
      ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'] :
      ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    dayNames.forEach(name => {
      const dayHeader = document.createElement('div');
      dayHeader.textContent = name;
      dayHeader.style.cssText = `
        text-align: center;
        font-weight: bold;
        color: var(--text-muted);
        padding: 0.5rem 0;
        font-size: 0.8rem;
      `;
      dayHeaders.appendChild(dayHeader);
    });

    // Calendar body
    const calendarBodyEl = document.createElement('div');
    calendarBodyEl.className = 'calendar-body';
    calendarBodyEl.style.cssText = `
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 0.25rem;
    `;

    // Assemble calendar
    this.calendar.appendChild(header);
    this.calendar.appendChild(dayHeaders);
    this.calendar.appendChild(calendarBodyEl);

    // Add to document
    document.body.appendChild(this.calendar);

    // Bind navigation events
    prevButton.addEventListener('click', () => {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
      this.render();
    });

    nextButton.addEventListener('click', () => {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
      this.render();
    });

    // Render initial calendar
    this.render();
  }

  /**
   * Renders the calendar for the current month
   */
  render() {
    const calendarBodyEl = this.calendar.querySelector('.calendar-body');
    calendarBodyEl.innerHTML = ''; // Clear existing days

    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    // Update month/year display
    const monthYearDisplay = this.calendar.querySelector('.month-year-display');
    monthYearDisplay.textContent = this.formatMonthYear(this.currentDate);

    // Get first day of month and days in month
    const firstDay = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Determine starting day (considering first day of week)
    const startDay = firstDay - this.options.firstDayOfWeek;
    const adjustedStartDay = startDay < 0 ? startDay + 7 : startDay;

    // Add empty cells for days before the first of the month
    for (let i = 0; i < adjustedStartDay; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.style.cssText = `
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
      `;
      calendarBodyEl.appendChild(emptyCell);
    }

    // Add day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const dayElement = document.createElement('button');
      dayElement.textContent = day;
      dayElement.className = 'btn btn-outline day-button';
      dayElement.style.cssText = `
        height: 36px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0;
        border-radius: 50%;
      `;

      // Format the date for comparison
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dateObj = new Date(dateStr);

      // Check if this is the selected date
      if (this.selectedDate &&
          this.selectedDate.getFullYear() === year &&
          this.selectedDate.getMonth() === month &&
          this.selectedDate.getDate() === day) {
        dayElement.classList.add('btn', 'active');
        dayElement.style.background = 'var(--gradient-primary)';
        dayElement.style.color = 'var(--text-dark)';
      }

      // Check if this is today
      const today = new Date();
      if (today.getFullYear() === year &&
          today.getMonth() === month &&
          today.getDate() === day) {
        dayElement.classList.add('today');
        dayElement.setAttribute('aria-current', 'date');
      }

      // Disable dates outside min/max range
      if ((this.options.minDate && dateObj < new Date(this.options.minDate)) ||
          (this.options.maxDate && dateObj > new Date(this.options.maxDate))) {
        dayElement.disabled = true;
        dayElement.classList.add('disabled');
        dayElement.style.opacity = '0.5';
        dayElement.style.cursor = 'not-allowed';
        dayElement.setAttribute('aria-disabled', 'true');
      }

      // Day click event
      dayElement.addEventListener('click', () => {
        this.selectDate(dateObj);
      });

      calendarBodyEl.appendChild(dayElement);
    }
  }

  /**
   * Selects a date and updates the input field
   * @param {Date} date - Date to select
   */
  selectDate(date) {
    this.selectedDate = new Date(date);
    this.input.value = this.formatDate(this.selectedDate, this.options.format);
    this.hide();
    
    // Trigger change event
    const changeEvent = new Event('change', { bubbles: true });
    this.input.dispatchEvent(changeEvent);
  }

  /**
   * Shows the calendar
   */
  show() {
    if (this.isVisible) return;
    
    // Position the calendar near the input
    const inputRect = this.input.getBoundingClientRect();
    this.calendar.style.top = `${inputRect.bottom + window.scrollY}px`;
    this.calendar.style.left = `${inputRect.left + window.scrollX}px`;
    
    // Show with animation
    this.calendar.style.display = 'block';
    this.calendar.style.opacity = '0';
    this.calendar.style.transform = 'scaleY(0.8) translateY(-10px)';
    
    // Trigger reflow
    this.calendar.offsetHeight;
    
    // Animate in
    this.calendar.style.transition = `opacity ${this.options.animationDuration}ms ease, transform ${this.options.animationDuration}ms ease`;
    this.calendar.style.opacity = '1';
    this.calendar.style.transform = 'scaleY(1) translateY(0)';
    
    this.isVisible = true;
    this.input.setAttribute('aria-expanded', 'true');
  }

  /**
   * Hides the calendar
   */
  hide() {
    if (!this.isVisible) return;
    
    // Animate out
    this.calendar.style.opacity = '0';
    this.calendar.style.transform = 'scaleY(0.8) translateY(-10px)';
    
    setTimeout(() => {
      this.calendar.style.display = 'none';
    }, this.options.animationDuration);
    
    this.isVisible = false;
    this.input.setAttribute('aria-expanded', 'false');
  }

  /**
   * Toggles the calendar visibility
   */
  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Formats a date according to the specified format
   * @param {Date} date - Date to format
   * @param {string} format - Format string
   * @returns {string} Formatted date string
   */
  formatDate(date, format) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day);
  }

  /**
   * Formats month and year for the header
   * @param {Date} date - Date to format
   * @returns {string} Month and year string
   */
  formatMonthYear(date) {
    return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  }

  /**
   * Binds event listeners
   */
  bindEvents() {
    // Input click to toggle calendar
    this.input.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggle();
    });
    
    // Input focus to show calendar
    this.input.addEventListener('focus', () => {
      this.show();
    });
    
    // Document click to hide calendar
    document.addEventListener('click', (e) => {
      if (!this.input.contains(e.target) && !this.calendar.contains(e.target)) {
        this.hide();
      }
    });
    
    // Keyboard navigation
    this.input.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          this.toggle();
          break;
        case 'Escape':
          this.hide();
          break;
      }
    });
  }
}

/**
 * Initializes all date pickers on the page
 * @param {HTMLElement|Document} container - Container to search for date inputs
 * @returns {Array<DatePicker>} Array of initialized date picker instances
 */
function initDatePickers(container = document) {
  const dateInputs = container.querySelectorAll('input[type="date"], input[data-datepicker], input.date-picker');
  const instances = [];
  
  dateInputs.forEach(input => {
    // Skip if already initialized
    if (input.hasAttribute('data-datepicker-initialized')) return;
    
    input.setAttribute('data-datepicker-initialized', 'true');
    
    // Get options from data attributes
    const options = {
      format: input.dataset.dateFormat || input.getAttribute('data-date-format') || 'YYYY-MM-DD',
      minDate: input.dataset.minDate || input.getAttribute('data-min-date'),
      maxDate: input.dataset.maxDate || input.getAttribute('data-max-date'),
      firstDayOfWeek: parseInt(input.dataset.firstDayOfWeek) || parseInt(input.getAttribute('data-first-day-of-week')) || 0,
      animationDuration: parseInt(input.dataset.animationDuration) || parseInt(input.getAttribute('data-animation-duration')) || 200
    };
    
    const instance = new DatePicker(input, options);
    instances.push(instance);
  });
  
  return instances;
}

/**
 * Auto-initialize date pickers when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initDatePickers();
  }, 0);
});

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DatePicker, initDatePickers };
}

// Also make it available globally
window.DatePicker = DatePicker;
window.initDatePickers = initDatePickers;