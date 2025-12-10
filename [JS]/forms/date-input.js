// Enhanced date input component with calendar picker

class DateInput {
  constructor(input, options = {}) {
    this.input = typeof input === 'string' ? document.querySelector(input) : input;
    this.options = {
      format: options.format || 'YYYY-MM-DD',
      minDate: options.minDate || null,
      maxDate: options.maxDate || null,
      showCalendar: options.showCalendar !== false,
      locale: options.locale || 'en-US',
      ...options
    };
    
    this.isCalendarVisible = false;
    this.currentDate = new Date();
    
    this.init();
  }
  
  init() {
    // Add necessary attributes and classes
    this.input.setAttribute('readonly', true);
    this.input.classList.add('date-input');
    
    // Create calendar icon
    this.createCalendarIcon();
    
    // Setup event listeners
    this.input.addEventListener('click', this.toggleCalendar.bind(this));
    this.input.addEventListener('focus', this.showCalendar.bind(this));
    
    // Add global click listener to close calendar when clicking elsewhere
    document.addEventListener('click', this.handleGlobalClick.bind(this));
  }
  
  createCalendarIcon() {
    // Create a wrapper for the input to properly position the calendar icon
    const wrapper = document.createElement('div');
    wrapper.className = 'date-input-wrapper';
    
    // Move the input inside the wrapper
    this.input.parentNode.insertBefore(wrapper, this.input);
    wrapper.appendChild(this.input);
    
    // Create calendar icon
    this.calendarIcon = document.createElement('span');
    this.calendarIcon.className = 'date-input-icon';
    this.calendarIcon.innerHTML = '📅';
    this.calendarIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleCalendar();
    });
    
    wrapper.appendChild(this.calendarIcon);
  }
  
  toggleCalendar() {
    if (this.isCalendarVisible) {
      this.hideCalendar();
    } else {
      this.showCalendar();
    }
  }
  
  showCalendar() {
    if (!this.options.showCalendar) return;
    
    // If calendar already exists, just show it
    if (this.calendar) {
      this.calendar.style.display = 'block';
      this.isCalendarVisible = true;
      return;
    }
    
    // Create calendar element
    this.calendar = document.createElement('div');
    this.calendar.className = 'date-calendar';
    
    // Position the calendar below the input
    const rect = this.input.getBoundingClientRect();
    this.calendar.style.top = `${rect.bottom + window.scrollY}px`;
    this.calendar.style.left = `${rect.left + window.scrollX}px`;
    
    // Generate calendar content
    this.renderCalendar();
    
    // Add calendar to document
    document.body.appendChild(this.calendar);
    this.isCalendarVisible = true;
  }
  
  hideCalendar() {
    if (this.calendar) {
      this.calendar.style.display = 'none';
      this.isCalendarVisible = false;
    }
  }
  
  renderCalendar() {
    // Clear calendar content
    this.calendar.innerHTML = '';
    
    // Create header with navigation
    const header = document.createElement('div');
    header.className = 'calendar-header';
    
    // Previous month button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'calendar-nav';
    prevBtn.textContent = '<';
    prevBtn.addEventListener('click', () => this.previousMonth());
    
    // Month/year display
    const monthYear = document.createElement('div');
    monthYear.className = 'calendar-month-year';
    monthYear.textContent = this.currentDate.toLocaleDateString(this.options.locale, { 
      month: 'long', 
      year: 'numeric' 
    });
    
    // Next month button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'calendar-nav';
    nextBtn.textContent = '>';
    nextBtn.addEventListener('click', () => this.nextMonth());
    
    header.appendChild(prevBtn);
    header.appendChild(monthYear);
    header.appendChild(nextBtn);
    this.calendar.appendChild(header);
    
    // Create day names header
    const dayNames = document.createElement('div');
    dayNames.className = 'calendar-day-names';
    
    // Get day names based on locale
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    days.forEach(day => {
      const dayElement = document.createElement('div');
      dayElement.className = 'calendar-day-name';
      dayElement.textContent = day;
      dayNames.appendChild(dayElement);
    });
    
    this.calendar.appendChild(dayNames);
    
    // Create calendar grid
    const grid = document.createElement('div');
    grid.className = 'calendar-grid';
    
    // Get the first day of the month and the number of days
    const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
    const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Add empty cells for days before the first day of the month
    const startDay = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    for (let i = 0; i < startDay; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.className = 'calendar-day empty';
      grid.appendChild(emptyCell);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayElement = document.createElement('div');
      dayElement.className = 'calendar-day';
      dayElement.textContent = day;
      
      // Check if this day is the selected date
      const selectedDate = this.input.value ? new Date(this.input.value) : null;
      if (selectedDate && 
          selectedDate.getFullYear() === this.currentDate.getFullYear() &&
          selectedDate.getMonth() === this.currentDate.getMonth() &&
          selectedDate.getDate() === day) {
        dayElement.classList.add('selected');
      }
      
      // Check if this day is today
      const today = new Date();
      if (today.getFullYear() === this.currentDate.getFullYear() &&
          today.getMonth() === this.currentDate.getMonth() &&
          today.getDate() === day) {
        dayElement.classList.add('today');
      }
      
      // Check if the date is valid (within min/max range)
      const dateToCheck = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);
      const isValidDate = this.isDateValid(dateToCheck);
      
      if (!isValidDate) {
        dayElement.classList.add('disabled');
      } else {
        // Add click event to select the date
        dayElement.addEventListener('click', () => {
          this.selectDate(day);
        });
      }
      
      grid.appendChild(dayElement);
    }
    
    this.calendar.appendChild(grid);
  }
  
  selectDate(day) {
    const selectedDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);
    
    // Format the date based on the specified format
    const formattedDate = this.formatDate(selectedDate);
    this.input.value = formattedDate;
    
    // Hide the calendar
    this.hideCalendar();
    
    // Trigger change event
    this.input.dispatchEvent(new Event('change', { bubbles: true }));
  }
  
  previousMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.renderCalendar();
  }
  
  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.renderCalendar();
  }
  
  isDateValid(date) {
    if (this.options.minDate && date < new Date(this.options.minDate)) {
      return false;
    }
    if (this.options.maxDate && date > new Date(this.options.maxDate)) {
      return false;
    }
    return true;
  }
  
  formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    return this.options.format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day);
  }
  
  handleGlobalClick(e) {
    if (!this.input.contains(e.target) && 
        !this.calendar.contains(e.target) &&
        e.target !== this.calendarIcon) {
      this.hideCalendar();
    }
  }
  
  // Method to set the date programmatically
  setDate(date) {
    if (date instanceof Date) {
      this.input.value = this.formatDate(date);
      this.currentDate = new Date(date);
    } else if (typeof date === 'string') {
      this.input.value = date;
      this.currentDate = new Date(date);
    }
    
    // Trigger change event
    this.input.dispatchEvent(new Event('change', { bubbles: true }));
  }
  
  // Method to get the selected date
  getDate() {
    if (!this.input.value) return null;
    return new Date(this.input.value);
  }
  
  // Clean up method
  destroy() {
    if (this.calendar) {
      document.body.removeChild(this.calendar);
    }
    
    document.removeEventListener('click', this.handleGlobalClick);
  }
}

// Time input component
class TimeInput {
  constructor(input, options = {}) {
    this.input = typeof input === 'string' ? document.querySelector(input) : input;
    this.options = {
      format: options.format || 'HH:mm',
      minTime: options.minTime || '00:00',
      maxTime: options.maxTime || '23:59',
      step: options.step || 1, // Minute step
      ...options
    };
    
    this.init();
  }
  
  init() {
    this.input.setAttribute('readonly', true);
    this.input.classList.add('time-input');
    
    // Create clock icon
    this.createClockIcon();
    
    // Setup event listeners
    this.input.addEventListener('click', this.showTimePicker.bind(this));
    this.input.addEventListener('focus', this.showTimePicker.bind(this));
    
    // Add global click listener to close picker when clicking elsewhere
    document.addEventListener('click', this.handleGlobalClick.bind(this));
  }
  
  createClockIcon() {
    // Create a wrapper for proper positioning
    const wrapper = document.createElement('div');
    wrapper.className = 'time-input-wrapper';
    
    this.input.parentNode.insertBefore(wrapper, this.input);
    wrapper.appendChild(this.input);
    
    // Create clock icon
    this.clockIcon = document.createElement('span');
    this.clockIcon.className = 'time-input-icon';
    this.clockIcon.innerHTML = '⏰';
    this.clockIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      this.showTimePicker();
    });
    
    wrapper.appendChild(this.clockIcon);
  }
  
  showTimePicker() {
    // Create time picker element
    this.timePicker = document.createElement('div');
    this.timePicker.className = 'time-picker';
    
    // Position the picker below the input
    const rect = this.input.getBoundingClientRect();
    this.timePicker.style.top = `${rect.bottom + window.scrollY}px`;
    this.timePicker.style.left = `${rect.left + window.scrollX}px`;
    
    // Generate time options
    this.renderTimePicker();
    
    document.body.appendChild(this.timePicker);
    
    // Add global click listener to close picker
    document.addEventListener('click', this.handleTimePickerClick.bind(this));
  }
  
  renderTimePicker() {
    // Create hour and minute selectors
    const timeContainer = document.createElement('div');
    timeContainer.className = 'time-selector-container';
    
    // Hours
    const hourContainer = document.createElement('div');
    hourContainer.className = 'time-selector';
    
    for (let h = 0; h < 24; h++) {
      const hourOption = document.createElement('div');
      hourOption.className = 'time-option';
      hourOption.textContent = h.toString().padStart(2, '0');
      hourOption.addEventListener('click', () => this.selectHour(h));
      hourContainer.appendChild(hourOption);
    }
    
    // Minutes
    const minuteContainer = document.createElement('div');
    minuteContainer.className = 'time-selector';
    
    for (let m = 0; m < 60; m += this.options.step) {
      const minuteOption = document.createElement('div');
      minuteOption.className = 'time-option';
      minuteOption.textContent = m.toString().padStart(2, '0');
      minuteOption.addEventListener('click', () => this.selectMinute(m));
      minuteContainer.appendChild(minuteOption);
    }
    
    timeContainer.appendChild(hourContainer);
    timeContainer.appendChild(minuteContainer);
    this.timePicker.appendChild(timeContainer);
  }
  
  selectHour(hour) {
    const minute = this.input.value.split(':')[1] || '00';
    this.input.value = `${hour.toString().padStart(2, '0')}:${minute}`;
    this.hideTimePicker();
  }
  
  selectMinute(minute) {
    const hour = this.input.value.split(':')[0] || '00';
    this.input.value = `${hour}:${minute.toString().padStart(2, '0')}`;
    this.hideTimePicker();
  }
  
  hideTimePicker() {
    if (this.timePicker && document.body.contains(this.timePicker)) {
      document.body.removeChild(this.timePicker);
      document.removeEventListener('click', this.handleTimePickerClick);
    }
  }
  
  handleTimePickerClick(e) {
    if (!this.timePicker.contains(e.target) && !this.input.contains(e.target)) {
      this.hideTimePicker();
    }
  }
  
  handleGlobalClick(e) {
    if (!this.input.contains(e.target) && 
        this.timePicker && !this.timePicker.contains(e.target) &&
        e.target !== this.clockIcon) {
      this.hideTimePicker();
    }
  }
}

// Export the classes
export { DateInput, TimeInput };