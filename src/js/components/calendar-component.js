/**
 * Calendar Component
 * Interactive calendar with event management and various view modes
 * Compatible with jazer-brand.css styling for calendar components
 */

class CalendarComponent {
  /**
   * Creates a new calendar component instance
   * @param {HTMLElement} container - Container element for the calendar
   * @param {Object} options - Configuration options
   */
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      // View options
      initialView: 'month', // 'month', 'week', 'day', 'agenda'
      initialDate: new Date(),
      locale: 'en-US',
      firstDayOfWeek: 0, // 0 = Sunday, 1 = Monday
      
      // Display options
      showWeekNumbers: false,
      showTodayButton: true,
      showWeekends: true,
      showHeader: true,
      showNavigation: true,
      
      // Behavior options
      selectable: true,
      editable: true,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      
      // Event options
      events: [],
      eventStartHour: 8,
      eventEndHour: 20,
      eventHeight: 30,
      
      // Callbacks
      onDateSelect: null,
      onEventClick: null,
      onEventDrop: null,
      onEventResize: null,
      onViewChange: null,
      
      // Customization
      theme: 'default', // 'default', 'dark', 'light'
      ...options
    };

    this.currentDate = new Date(this.options.initialDate);
    this.currentView = this.options.initialView;
    this.events = this.options.events;
    this.selectedDate = null;
    this.selectedRange = null;
    this.calendarHeader = null;
    this.calendarBody = null;
    this.eventListeners = [];

    this.init();
  }

  /**
   * Initializes the calendar component
   */
  init() {
    // Add calendar classes
    this.container.classList.add('calendar-component');
    this.container.classList.add(`calendar-${this.options.theme}`);
    
    // Create the calendar structure
    this.createCalendarStructure();
    
    // Bind events
    this.bindEvents();
    
    // Render initial view
    this.render();
    
    // Add dynamic styles
    this.addDynamicStyles();
  }

  /**
   * Creates the calendar structure
   */
  createCalendarStructure() {
    // Clear container
    this.container.innerHTML = '';

    // Create header if enabled
    if (this.options.showHeader) {
      this.createHeader();
    }

    // Create main calendar body
    this.calendarBody = document.createElement('div');
    this.calendarBody.classList.add('calendar-body');
    this.container.appendChild(this.calendarBody);

    // Create navigation if enabled
    if (this.options.showNavigation) {
      this.createNavigation();
    }
  }

  /**
   * Creates the calendar header with controls
   */
  createHeader() {
    this.calendarHeader = document.createElement('div');
    this.calendarHeader.classList.add('calendar-header');

    // Create view selector if multiple views enabled
    const viewSelector = document.createElement('div');
    viewSelector.classList.add('view-selector');
    
    ['month', 'week', 'day', 'agenda'].forEach(view => {
      const button = document.createElement('button');
      button.classList.add('view-button');
      button.textContent = view.charAt(0).toUpperCase() + view.slice(1);
      button.dataset.view = view;
      
      if (view === this.currentView) {
        button.classList.add('active');
      }
      
      button.addEventListener('click', () => {
        this.setView(view);
      });
      
      viewSelector.appendChild(button);
    });

    this.calendarHeader.appendChild(viewSelector);

    // Create date display
    this.dateDisplay = document.createElement('div');
    this.dateDisplay.classList.add('calendar-date-display');
    this.updateDateDisplay();
    this.calendarHeader.appendChild(this.dateDisplay);

    // Create today button if enabled
    if (this.options.showTodayButton) {
      this.todayButton = document.createElement('button');
      this.todayButton.classList.add('today-button');
      this.todayButton.textContent = 'Today';
      
      this.todayButton.addEventListener('click', () => {
        this.goToToday();
      });
      
      this.calendarHeader.appendChild(this.todayButton);
    }

    this.container.insertBefore(this.calendarHeader, this.calendarBody);
  }

  /**
   * Creates navigation controls
   */
  createNavigation() {
    this.navControls = document.createElement('div');
    this.navControls.classList.add('calendar-navigation');
    
    // Previous button
    this.prevButton = document.createElement('button');
    this.prevButton.classList.add('nav-button', 'prev');
    this.prevButton.innerHTML = '&lt;';
    this.prevButton.setAttribute('aria-label', 'Previous');
    this.prevButton.addEventListener('click', () => {
      this.previousPeriod();
    });
    
    // Next button
    this.nextButton = document.createElement('button');
    this.nextButton.classList.add('nav-button', 'next');
    this.nextButton.innerHTML = '&gt;';
    this.nextButton.setAttribute('aria-label', 'Next');
    this.nextButton.addEventListener('click', () => {
      this.nextPeriod();
    });
    
    this.navControls.appendChild(this.prevButton);
    this.navControls.appendChild(this.nextButton);
    
    // Add to header if it exists, otherwise add to container
    if (this.calendarHeader) {
      this.calendarHeader.appendChild(this.navControls);
    } else {
      this.container.appendChild(this.navControls);
    }
  }

  /**
   * Binds calendar events
   */
  bindEvents() {
    // Date selection event
    if (this.options.selectable) {
      this.container.addEventListener('click', (e) => {
        if (e.target.classList.contains('calendar-day') || e.target.closest('.calendar-day')) {
          const dayElement = e.target.classList.contains('calendar-day') ? 
            e.target : e.target.closest('.calendar-day');
          const date = new Date(dayElement.dataset.date);
          this.selectDate(date, e);
        }
      });
    }

    // Event listeners for drag and drop if editable
    if (this.options.editable) {
      this.bindDragEvents();
    }

    // Window resize event to handle responsive adjustments
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  /**
   * Binds drag events for event manipulation
   */
  bindDragEvents() {
    // For simplicity in this implementation, we'll define drag-related functions
    // A full implementation would involve more complex drag-and-drop logic
  }

  /**
   * Renders the calendar based on the current view
   */
  render() {
    // Clear the calendar body
    this.calendarBody.innerHTML = '';

    // Render based on the current view
    switch (this.currentView) {
      case 'month':
        this.renderMonthView();
        break;
      case 'week':
        this.renderWeekView();
        break;
      case 'day':
        this.renderDayView();
        break;
      case 'agenda':
        this.renderAgendaView();
        break;
    }
  }

  /**
   * Renders the month view
   */
  renderMonthView() {
    const monthStart = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
    const monthEnd = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
    const startDate = new Date(monthStart);
    
    // Adjust to first day of week
    startDate.setDate(startDate.getDate() - startDate.getDay() + this.options.firstDayOfWeek);
    
    // Create month grid
    const grid = document.createElement('div');
    grid.classList.add('calendar-grid');
    grid.classList.add('calendar-month-grid');
    
    // Create day headers
    if (this.options.showWeekNumbers) {
      // Add empty cell for week numbers header
      const emptyHeader = document.createElement('div');
      emptyHeader.classList.add('calendar-header-cell');
      grid.appendChild(emptyHeader);
    }
    
    this.getDayNames().forEach((dayName, index) => {
      const headerCell = document.createElement('div');
      headerCell.classList.add('calendar-header-cell');
      headerCell.textContent = dayName;
      grid.appendChild(headerCell);
    });
    
    // Create day cells
    const currentDate = new Date(startDate);
    for (let i = 0; i < 42; i++) { // 6 rows x 7 days
      const dayElement = this.createDayElement(currentDate);
      grid.appendChild(dayElement);
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    this.calendarBody.appendChild(grid);
  }

  /**
   * Creates a day element
   * @param {Date} date - Date for the day
   * @returns {HTMLElement} Day element
   */
  createDayElement(date) {
    const dayElement = document.createElement('div');
    dayElement.classList.add('calendar-day');
    dayElement.dataset.date = date.toISOString().split('T')[0];
    
    // Check if day is in current month
    const isCurrentMonth = date.getMonth() === this.currentDate.getMonth();
    if (!isCurrentMonth) {
      dayElement.classList.add('other-month');
    }
    
    // Check if day is weekend
    const dayOfWeek = date.getDay();
    if ((dayOfWeek === 0 || dayOfWeek === 6) && !this.options.showWeekends) {
      dayElement.classList.add('weekend');
    }
    
    // Check if day is today
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      dayElement.classList.add('today');
    }
    
    // Format day number
    const dayNum = document.createElement('div');
    dayNum.classList.add('day-number');
    dayNum.textContent = date.getDate();
    dayElement.appendChild(dayNum);
    
    // Add events for this day
    const eventsForDay = this.getEventsForDate(date);
    const eventsContainer = document.createElement('div');
    eventsContainer.classList.add('day-events');
    
    eventsForDay.forEach(event => {
      const eventElement = this.createEventElement(event);
      eventsContainer.appendChild(eventElement);
    });
    
    dayElement.appendChild(eventsContainer);
    
    return dayElement;
  }

  /**
   * Creates an event element
   * @param {Object} event - Event object
   * @returns {HTMLElement} Event element
   */
  createEventElement(event) {
    const eventElement = document.createElement('div');
    eventElement.classList.add('calendar-event');
    eventElement.dataset.eventId = event.id;
    
    // Use event title or fallback to a default
    eventElement.textContent = event.title || 'Untitled Event';
    
    // Add color if specified
    if (event.color) {
      eventElement.style.backgroundColor = event.color;
    }
    
    // Add click handler
    eventElement.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.options.onEventClick) {
        this.options.onEventClick(event, e);
      }
    });
    
    return eventElement;
  }

  /**
   * Renders the week view
   */
  renderWeekView() {
    const weekStart = this.getWeekStart(this.currentDate);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const grid = document.createElement('div');
    grid.classList.add('calendar-grid');
    grid.classList.add('calendar-week-grid');
    
    // Create time slots grid
    const timeSlots = document.createElement('div');
    timeSlots.classList.add('time-slots');
    
    // Create time labels
    for (let hour = this.options.eventStartHour; hour < this.options.eventEndHour; hour++) {
      const timeLabel = document.createElement('div');
      timeLabel.classList.add('time-label');
      timeLabel.textContent = this.formatHour(hour);
      timeSlots.appendChild(timeLabel);
    }
    
    // Create day columns
    const daysContainer = document.createElement('div');
    daysContainer.classList.add('week-days-container');
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      
      const dayCol = document.createElement('div');
      dayCol.classList.add('week-day-column');
      dayCol.dataset.date = date.toISOString().split('T')[0];
      
      // Add day header
      const dayHeader = document.createElement('div');
      dayHeader.classList.add('day-header');
      dayHeader.textContent = `${this.getDayNames()[date.getDay()]}, ${date.getDate()}`;
      dayCol.appendChild(dayHeader);
      
      // Add time slots for each hour
      for (let hour = this.options.eventStartHour; hour < this.options.eventEndHour; hour++) {
        const slot = document.createElement('div');
        slot.classList.add('time-slot');
        slot.dataset.hour = hour;
        slot.dataset.date = date.toISOString().split('T')[0];
        
        dayCol.appendChild(slot);
      }
      
      daysContainer.appendChild(dayCol);
    }
    
    grid.appendChild(timeSlots);
    grid.appendChild(daysContainer);
    
    // Add events to the week view
    this.renderWeekEvents(grid, weekStart, weekEnd);
    
    this.calendarBody.appendChild(grid);
  }

  /**
   * Renders events in the week view
   * @param {HTMLElement} container - Container to render events in
   * @param {Date} weekStart - Start of the week
   * @param {Date} weekEnd - End of the week
   */
  renderWeekEvents(container, weekStart, weekEnd) {
    // Find all events that fall within the week
    const weekEvents = this.events.filter(event => {
      const eventStart = new Date(event.start);
      return eventStart >= weekStart && eventStart <= weekEnd;
    });
    
    // For each event, calculate its position and size
    weekEvents.forEach(event => {
      const start = new Date(event.start);
      const end = new Date(event.end || new Date(start.getTime() + 60 * 60 * 1000)); // Default 1 hour event
      
      const dayIndex = (start.getDay() - this.options.firstDayOfWeek + 7) % 7;
      const startHour = start.getHours() + start.getMinutes() / 60;
      const duration = (end - start) / (1000 * 60 * 60); // Duration in hours
      
      // Calculate position within the grid
      const top = (startHour - this.options.eventStartHour) * this.options.eventHeight;
      const height = duration * this.options.eventHeight;
      
      const eventElement = this.createEventElement(event);
      eventElement.style.position = 'absolute';
      eventElement.style.top = `${top}px`;
      eventElement.style.height = `${height}px`;
      eventElement.style.width = `calc(100% / 7 - 2px)`;
      eventElement.style.left = `calc(${dayIndex * 100 / 7}%)`;
      
      container.appendChild(eventElement);
    });
  }

  /**
   * Renders the day view
   */
  renderDayView() {
    const grid = document.createElement('div');
    grid.classList.add('calendar-grid');
    grid.classList.add('calendar-day-grid');
    
    // Create time slots for the day
    const timeSlots = document.createElement('div');
    timeSlots.classList.add('time-slots');
    
    for (let hour = this.options.eventStartHour; hour < this.options.eventEndHour; hour++) {
      const timeLabel = document.createElement('div');
      timeLabel.classList.add('time-label');
      timeLabel.textContent = this.formatHour(hour);
      timeSlots.appendChild(timeLabel);
    }
    
    // Create day column
    const dayContainer = document.createElement('div');
    dayContainer.classList.add('day-container');
    dayContainer.dataset.date = this.currentDate.toISOString().split('T')[0];
    
    // Add time slots
    for (let hour = this.options.eventStartHour; hour < this.options.eventEndHour; hour++) {
      const slot = document.createElement('div');
      slot.classList.add('time-slot');
      slot.dataset.hour = hour;
      slot.dataset.date = this.currentDate.toISOString().split('T')[0];
      
      dayContainer.appendChild(slot);
    }
    
    grid.appendChild(timeSlots);
    grid.appendChild(dayContainer);
    
    // Render events for the day
    this.renderDayEvents(dayContainer);
    
    this.calendarBody.appendChild(grid);
  }

  /**
   * Renders events in the day view
   * @param {HTMLElement} container - Container to render events in
   */
  renderDayEvents(container) {
    const dateEvents = this.getEventsForDate(this.currentDate);
    
    dateEvents.forEach(event => {
      const start = new Date(event.start);
      const end = new Date(event.end || new Date(start.getTime() + 60 * 60 * 1000)); // Default 1 hour event
      
      const startHour = start.getHours() + start.getMinutes() / 60;
      const duration = (end - start) / (1000 * 60 * 60); // Duration in hours
      
      const top = (startHour - this.options.eventStartHour) * this.options.eventHeight;
      const height = duration * this.options.eventHeight;
      
      const eventElement = this.createEventElement(event);
      eventElement.style.position = 'absolute';
      eventElement.style.top = `${top}px`;
      eventElement.style.height = `${height}px`;
      eventElement.style.width = 'calc(100% - 2px)';
      
      container.appendChild(eventElement);
    });
  }

  /**
   * Renders the agenda view
   */
  renderAgendaView() {
    const agendaContainer = document.createElement('div');
    agendaContainer.classList.add('agenda-view');
    
    // Get events for the next few days
    const endDate = new Date(this.currentDate);
    endDate.setDate(endDate.getDate() + 7); // Show next 7 days
    
    const events = this.getEventsInDateRange(this.currentDate, endDate);
    
    // Group events by date
    const eventsByDate = {};
    events.forEach(event => {
      const eventDate = new Date(event.start).toDateString();
      if (!eventsByDate[eventDate]) {
        eventsByDate[eventDate] = [];
      }
      eventsByDate[eventDate].push(event);
    });
    
    // Render events grouped by date
    Object.entries(eventsByDate).forEach(([dateStr, dateEvents]) => {
      const dateHeader = document.createElement('div');
      dateHeader.classList.add('agenda-date-header');
      
      const date = new Date(dateStr);
      dateHeader.textContent = date.toLocaleDateString(this.options.locale, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      agendaContainer.appendChild(dateHeader);
      
      const eventsList = document.createElement('div');
      eventsList.classList.add('agenda-events-list');
      
      dateEvents.forEach(event => {
        const eventElement = this.createAgendaEventElement(event);
        eventsList.appendChild(eventElement);
      });
      
      agendaContainer.appendChild(eventsList);
    });
    
    this.calendarBody.appendChild(agendaContainer);
  }

  /**
   * Creates an agenda event element
   * @param {Object} event - Event object
   * @returns {HTMLElement} Agenda event element
   */
  createAgendaEventElement(event) {
    const eventElement = document.createElement('div');
    eventElement.classList.add('agenda-event');
    eventElement.dataset.eventId = event.id;
    
    const startTime = new Date(event.start).toLocaleTimeString(this.options.locale, {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const eventTime = document.createElement('span');
    eventTime.classList.add('event-time');
    eventTime.textContent = startTime;
    
    const eventTitle = document.createElement('span');
    eventTitle.classList.add('event-title');
    eventTitle.textContent = event.title || 'Untitled Event';
    
    if (event.location) {
      const eventLocation = document.createElement('div');
      eventLocation.classList.add('event-location');
      eventLocation.textContent = event.location;
    }
    
    eventElement.appendChild(eventTime);
    eventElement.appendChild(eventTitle);
    if (event.location) {
      eventElement.appendChild(eventLocation);
    }
    
    eventElement.addEventListener('click', (e) => {
      if (this.options.onEventClick) {
        this.options.onEventClick(event, e);
      }
    });
    
    return eventElement;
  }

  /**
   * Formats an hour for display
   * @param {number} hour - Hour to format (0-23)
   * @returns {string} Formatted hour string
   */
  formatHour(hour) {
    const hour12 = hour % 12 || 12;
    const period = hour < 12 ? 'AM' : 'PM';
    return `${hour12} ${period}`;
  }

  /**
   * Gets the start of the week for a given date
   * @param {Date} date - Date to get week start for
   * @returns {Date} Start of the week
   */
  getWeekStart(date) {
    const day = date.getDay();
    const diff = (day - this.options.firstDayOfWeek + 7) % 7;
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - diff);
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  }

  /**
   * Gets day names based on locale and first day of week
   * @returns {Array} Array of day names
   */
  getDayNames() {
    const formatter = new Intl.DateTimeFormat(this.options.locale, { weekday: 'short' });
    const days = [];
    
    // Start with first day of week
    const date = new Date();
    date.setDate(date.getDate() - date.getDay() + this.options.firstDayOfWeek);
    
    for (let i = 0; i < 7; i++) {
      days.push(formatter.format(date));
      date.setDate(date.getDate() + 1);
    }
    
    return days;
  }

  /**
   * Gets events for a specific date
   * @param {Date} date - Date to get events for
   * @returns {Array} Array of events for the date
   */
  getEventsForDate(date) {
    const dateStr = date.toISOString().split('T')[0];
    
    return this.events.filter(event => {
      const eventDate = new Date(event.start).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
  }

  /**
   * Gets events in a date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Array} Array of events in the range
   */
  getEventsInDateRange(startDate, endDate) {
    return this.events.filter(event => {
      const eventStart = new Date(event.start);
      return eventStart >= startDate && eventStart <= endDate;
    });
  }

  /**
   * Navigates to the previous time period
   */
  previousPeriod() {
    const newDate = new Date(this.currentDate);
    
    switch (this.currentView) {
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'day':
        newDate.setDate(newDate.getDate() - 1);
        break;
      case 'agenda':
        newDate.setDate(newDate.getDate() - 7);
        break;
    }
    
    this.currentDate = newDate;
    this.updateDateDisplay();
    this.render();
  }

  /**
   * Navigates to the next time period
   */
  nextPeriod() {
    const newDate = new Date(this.currentDate);
    
    switch (this.currentView) {
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'day':
        newDate.setDate(newDate.getDate() + 1);
        break;
      case 'agenda':
        newDate.setDate(newDate.getDate() + 7);
        break;
    }
    
    this.currentDate = newDate;
    this.updateDateDisplay();
    this.render();
  }

  /**
   * Goes to today's date
   */
  goToToday() {
    this.currentDate = new Date();
    this.updateDateDisplay();
    this.render();
  }

  /**
   * Sets the calendar view
   * @param {string} view - View to set ('month', 'week', 'day', 'agenda')
   */
  setView(view) {
    if (['month', 'week', 'day', 'agenda'].includes(view)) {
      this.currentView = view;
      
      // Update active view button
      if (this.calendarHeader) {
        const viewButtons = this.calendarHeader.querySelectorAll('.view-button');
        viewButtons.forEach(button => {
          button.classList.toggle('active', button.dataset.view === view);
        });
      }
      
      this.render();
      
      // Trigger callback
      if (this.options.onViewChange) {
        this.options.onViewChange(view);
      }
    }
  }

  /**
   * Updates the date display in the header
   */
  updateDateDisplay() {
    if (!this.dateDisplay) return;
    
    let displayText = '';
    
    switch (this.currentView) {
      case 'month':
        displayText = this.currentDate.toLocaleDateString(this.options.locale, {
          month: 'long',
          year: 'numeric'
        });
        break;
      case 'week':
        const weekStart = this.getWeekStart(this.currentDate);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        const startFormatted = weekStart.toLocaleDateString(this.options.locale, {
          month: 'short',
          day: 'numeric'
        });
        const endFormatted = weekEnd.toLocaleDateString(this.options.locale, {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
        
        displayText = `${startFormatted} - ${endFormatted}`;
        break;
      case 'day':
        displayText = this.currentDate.toLocaleDateString(this.options.locale, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        break;
      case 'agenda':
        displayText = `Agenda: ${this.currentDate.toLocaleDateString(this.options.locale, {
          month: 'long',
          year: 'numeric'
        })}`;
        break;
    }
    
    this.dateDisplay.textContent = displayText;
  }

  /**
   * Selects a date
   * @param {Date} date - Date to select
   * @param {Event} event - Original event that triggered the selection
   */
  selectDate(date, event) {
    this.selectedDate = date;
    
    // Update UI to show selection
    this.updateSelectionDisplay();
    
    // Trigger callback
    if (this.options.onDateSelect) {
      this.options.onDateSelect(date, event);
    }
  }

  /**
   * Updates the selection display
   */
  updateSelectionDisplay() {
    // Remove previous selection highlights
    const previousSelected = this.container.querySelectorAll('.calendar-day.selected');
    previousSelected.forEach(day => day.classList.remove('selected'));
    
    // Highlight the selected date
    if (this.selectedDate) {
      const dateStr = this.selectedDate.toISOString().split('T')[0];
      const selectedDay = this.container.querySelector(`.calendar-day[data-date="${dateStr}"]`);
      if (selectedDay) {
        selectedDay.classList.add('selected');
      }
    }
  }

  /**
   * Adds an event to the calendar
   * @param {Object} event - Event object to add
   */
  addEvent(event) {
    if (!event.id) {
      event.id = this.generateEventId();
    }
    
    this.events.push(event);
    this.render();
  }

  /**
   * Updates an event in the calendar
   * @param {string} eventId - ID of the event to update
   * @param {Object} eventData - New event data
   * @returns {boolean} Whether the event was found and updated
   */
  updateEvent(eventId, eventData) {
    const eventIndex = this.events.findIndex(event => event.id === eventId);
    if (eventIndex !== -1) {
      this.events[eventIndex] = { ...this.events[eventIndex], ...eventData };
      this.render();
      return true;
    }
    return false;
  }

  /**
   * Removes an event from the calendar
   * @param {string} eventId - ID of the event to remove
   * @returns {boolean} Whether the event was found and removed
   */
  removeEvent(eventId) {
    const initialLength = this.events.length;
    this.events = this.events.filter(event => event.id !== eventId);
    const removed = this.events.length !== initialLength;
    
    if (removed) {
      this.render();
    }
    
    return removed;
  }

  /**
   * Clears all events from the calendar
   */
  clearEvents() {
    this.events = [];
    this.render();
  }

  /**
   * Gets a formatted date string
   * @param {Date} date - Date to format
   * @param {string} format - Format type ('iso', 'locale', 'display')
   * @returns {string} Formatted date string
   */
  formatDate(date, format = 'locale') {
    switch (format) {
      case 'iso':
        return date.toISOString().split('T')[0];
      case 'display':
        return date.toLocaleDateString(this.options.locale);
      case 'time':
        return date.toLocaleTimeString(this.options.locale);
      case 'datetime':
        return date.toLocaleString(this.options.locale);
      default: // locale
        return date.toLocaleDateString(this.options.locale);
    }
  }

  /**
   * Changes the calendar to a specific date
   * @param {Date} date - Date to navigate to
   */
  setDate(date) {
    this.currentDate = new Date(date);
    this.updateDateDisplay();
    this.render();
  }

  /**
   * Gets the current date
   * @returns {Date} Current date
   */
  getDate() {
    return new Date(this.currentDate);
  }

  /**
   * Gets the current view
   * @returns {string} Current view
   */
  getView() {
    return this.currentView;
  }

  /**
   * Sets the locale for the calendar
   * @param {string} locale - Locale string
   */
  setLocale(locale) {
    this.options.locale = locale;
    this.render();
  }

  /**
   * Gets the current locale
   * @returns {string} Current locale
   */
  getLocale() {
    return this.options.locale;
  }

  /**
   * Sets the timezone for the calendar
   * @param {string} timezone - Timezone string
   */
  setTimezone(timezone) {
    this.options.timezone = timezone;
  }

  /**
   * Gets the current timezone
   * @returns {string} Current timezone
   */
  getTimezone() {
    return this.options.timezone;
  }

  /**
   * Handles window resize to adjust calendar layout
   */
  handleResize() {
    // Adjust calendar for responsive behavior if needed
    // In a real implementation, this would handle layout changes based on viewport size
  }

  /**
   * Generates a unique event ID
   * @returns {string} Unique event ID
   */
  generateEventId() {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Gets events for a specific date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Array} Array of events in the range
   */
  getEventsInRange(startDate, endDate) {
    return this.events.filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end || eventStart.getTime() + 3600000); // Default 1 hour
      
      // Check if event overlaps with the given range
      return eventStart <= endDate && eventEnd >= startDate;
    });
  }

  /**
   * Adds dynamic styles for the calendar
   */
  addDynamicStyles() {
    if (document.getElementById('calendar-styles')) return;

    const style = document.createElement('style');
    style.id = 'calendar-styles';
    style.textContent = `
      .calendar-component {
        width: 100%;
        max-width: 100%;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        border: 1px solid var(--border-default, #4facfe);
        border-radius: 8px;
        overflow: hidden;
        background: var(--bg-darker, #111);
        color: var(--text-light, #fff);
      }
      
      .calendar-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        border-bottom: 1px solid var(--border-lighter, #222);
        background: var(--bg-dark, #0a0a0a);
      }
      
      .view-selector {
        display: flex;
        gap: 8px;
      }
      
      .view-button {
        padding: 8px 16px;
        background: var(--bg-darker, #111);
        border: 1px solid var(--border-default, #4facfe);
        color: var(--text-light, #fff);
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .view-button:hover {
        background: var(--bg-dark, #0a0a0a);
      }
      
      .view-button.active {
        background: var(--jazer-cyan, #00f2ea);
        color: var(--text-dark, #000);
        border-color: var(--jazer-cyan, #00f2ea);
      }
      
      .calendar-date-display {
        font-size: 1.2rem;
        font-weight: bold;
        flex: 1;
        text-align: center;
      }
      
      .today-button {
        padding: 8px 16px;
        background: var(--jazer-cyan, #00f2ea);
        color: var(--text-dark, #000);
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: bold;
      }
      
      .calendar-navigation {
        display: flex;
        gap: 8px;
      }
      
      .nav-button {
        width: 36px;
        height: 36px;
        border: 1px solid var(--border-default, #4facfe);
        background: var(--bg-darker, #111);
        color: var(--text-light, #fff);
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .nav-button:hover {
        background: var(--bg-dark, #0a0a0a);
        border-color: var(--jazer-cyan, #00f2ea);
      }
      
      .calendar-body {
        position: relative;
      }
      
      .calendar-grid {
        display: grid;
        width: 100%;
      }
      
      .calendar-month-grid {
        grid-template-columns: repeat(7, 1fr);
      }
      
      .calendar-week-grid {
        display: flex;
        height: 600px;
      }
      
      .time-slots {
        display: flex;
        flex-direction: column;
        width: 50px;
        border-right: 1px solid var(--border-lighter, #222);
      }
      
      .time-label {
        height: 60px;
        display: flex;
        align-items: flex-start;
        justify-content: flex-end;
        padding: 4px 8px 0 0;
        font-size: 0.8rem;
        color: var(--text-gray, #aaa);
      }
      
      .week-days-container {
        flex: 1;
        display: flex;
      }
      
      .week-day-column {
        flex: 1;
        position: relative;
      }
      
      .day-header {
        padding: 8px;
        border-bottom: 1px solid var(--border-lighter, #222);
        font-weight: bold;
        text-align: center;
      }
      
      .time-slot {
        height: 60px;
        border-bottom: 1px solid var(--border-lighter, #222);
      }
      
      .calendar-header-cell {
        padding: 12px;
        text-align: center;
        font-weight: bold;
        background: var(--bg-darker, #111);
        border-bottom: 1px solid var(--border-lighter, #222);
      }
      
      .calendar-day {
        position: relative;
        aspect-ratio: 1/1;
        border-right: 1px solid var(--border-lighter, #222);
        border-bottom: 1px solid var(--border-lighter, #222);
        cursor: pointer;
        transition: background-color 0.2s ease;
      }
      
      .calendar-day:hover {
        background-color: var(--bg-dark, #0a0a0a);
      }
      
      .calendar-day.other-month {
        background-color: var(--bg-darkest, #000);
        color: var(--text-gray, #666);
      }
      
      .calendar-day.today {
        background-color: var(--bg-today, #1a2a3a);
      }
      
      .calendar-day.selected {
        background-color: var(--jazer-cyan, #00f2ea);
        color: var(--text-dark, #000);
      }
      
      .day-number {
        position: absolute;
        top: 5px;
        right: 5px;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        font-size: 0.9rem;
      }
      
      .calendar-day.today .day-number {
        background: var(--jazer-cyan, #00f2ea);
        color: var(--text-dark, #000);
        font-weight: bold;
      }
      
      .day-events {
        position: absolute;
        top: 35px;
        left: 5px;
        right: 5px;
        bottom: 5px;
        overflow-y: auto;
      }
      
      .calendar-event {
        padding: 4px 6px;
        margin-bottom: 2px;
        background: var(--bg-accent, #007acc);
        border-radius: 4px;
        font-size: 0.8rem;
        cursor: pointer;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .calendar-event:hover {
        opacity: 0.9;
      }
      
      .agenda-view {
        padding: 20px;
      }
      
      .agenda-date-header {
        font-size: 1.2rem;
        margin: 15px 0 10px 0;
        padding-bottom: 5px;
        border-bottom: 2px solid var(--border-default, #4facfe);
      }
      
      .agenda-events-list {
        margin-bottom: 20px;
      }
      
      .agenda-event {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        margin-bottom: 5px;
        background: var(--bg-darker, #111);
        border-left: 3px solid var(--jazer-cyan, #00f2ea);
        border-radius: 4px;
        transition: background-color 0.2s ease;
      }
      
      .agenda-event:hover {
        background: var(--bg-dark, #0a0a0a);
      }
      
      .event-time {
        font-weight: bold;
        min-width: 60px;
        color: var(--jazer-cyan, #00f2ea);
      }
      
      .event-title {
        flex: 1;
        margin: 0 10px;
      }
      
      .event-location {
        font-size: 0.8rem;
        color: var(--text-gray, #aaa);
      }
      
      /* Responsive adjustments */
      @media (max-width: 768px) {
        .calendar-header {
          flex-direction: column;
          gap: 15px;
        }
        
        .view-selector {
          flex-wrap: wrap;
          justify-content: center;
        }
        
        .calendar-month-grid {
          grid-template-columns: repeat(7, 1fr);
        }
        
        .calendar-day {
          aspect-ratio: 1/1.2;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Destroys the calendar instance and cleans up
   */
  destroy() {
    // Remove event listeners
    window.removeEventListener('resize', this.handleResize);
    
    // Clear container
    this.container.innerHTML = '';
    this.container.classList.remove('calendar-component');
  }
}

/**
 * Initializes all calendar components on the page
 * @param {HTMLElement|Document} container - Container to search for calendars
 * @returns {Array} Array of initialized calendar instances
 */
function initCalendars(container = document) {
  const calendarElements = container.querySelectorAll('.calendar-component, [data-calendar]');
  const instances = [];

  calendarElements.forEach(calendarElement => {
    if (!calendarElement.hasAttribute('data-calendar-initialized')) {
      calendarElement.setAttribute('data-calendar-initialized', 'true');

      // Get options from data attributes
      const options = {
        initialView: calendarElement.dataset.initialView || 'month',
        showTodayButton: calendarElement.dataset.showTodayButton !== 'false',
        showWeekNumbers: calendarElement.dataset.showWeekNumbers === 'true',
        showWeekends: calendarElement.dataset.showWeekends !== 'false',
        locale: calendarElement.dataset.locale || 'en-US',
        firstDayOfWeek: parseInt(calendarElement.dataset.firstDayOfWeek) || 0,
        timezone: calendarElement.dataset.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        ...JSON.parse(calendarElement.dataset.options || '{}')
      };

      // Get events from data attribute if available
      let events = [];
      if (calendarElement.dataset.events) {
        try {
          events = JSON.parse(calendarElement.dataset.events);
        } catch (e) {
          console.warn('Invalid events data:', e);
        }
      }

      const instance = new CalendarComponent(calendarElement, { ...options, events });
      instances.push(instance);
    }
  });

  return instances;
}

/**
 * Auto-initialize calendars when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initCalendars();
  }, 0);
});

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CalendarComponent, initCalendars };
}

// Make available globally
window.CalendarComponent = CalendarComponent;
window.initCalendars = initCalendars;