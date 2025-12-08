/**
 * Timeline Component
 * Visual timeline for events with multiple layout options
 * Compatible with jazer-brand.css styling
 */

class Timeline {
  /**
   * Creates a new timeline component
   * @param {HTMLElement} timelineElement - The timeline container element
   * @param {Array} events - Array of event objects
   * @param {Object} options - Configuration options
   */
  constructor(timelineElement, events, options = {}) {
    this.timeline = timelineElement;
    this.events = events || [];
    this.options = {
      layout: 'vertical', // 'vertical', 'horizontal', 'alternating'
      markerType: 'dot', // 'dot', 'number', 'icon'
      markerSize: 'medium', // 'small', 'medium', 'large'
      showTimelineLine: true,
      autoPlay: false,
      autoPlayInterval: 5000,
      showNavigation: true,
      animationDuration: 300,
      theme: 'primary', // 'primary', 'success', 'warning', 'danger', 'info'
      ...options
    };

    this.currentEventIndex = 0;
    this.isPlaying = false;
    this.autoPlayInterval = null;

    this.init();
  }

  /**
   * Initializes the timeline
   */
  init() {
    // Validate events
    if (!this.events || this.events.length === 0) {
      console.warn('Timeline created with no events');
    }

    // Set up the timeline structure
    this.setupTimeline();

    // Bind events
    this.bindEvents();

    // Initialize auto-play if enabled
    if (this.options.autoPlay) {
      this.startAutoPlay();
    }
  }

  /**
   * Sets up the timeline structure
   */
  setupTimeline() {
    // Add timeline classes
    this.timeline.classList.add('timeline');
    this.timeline.classList.add(`timeline-${this.options.layout}`);
    this.timeline.classList.add(`timeline-${this.options.theme}`);
    
    // Create timeline container
    this.timelineContainer = document.createElement('div');
    this.timelineContainer.classList.add('timeline-container');

    // Add timeline line if enabled
    if (this.options.showTimelineLine) {
      this.timelineLine = document.createElement('div');
      this.timelineLine.classList.add('timeline-line');
      this.timelineContainer.appendChild(this.timelineLine);
    }

    // Create timeline events
    this.events.forEach((event, index) => {
      const timelineEvent = this.createTimelineEvent(event, index);
      this.timelineContainer.appendChild(timelineEvent);
    });

    this.timeline.appendChild(this.timelineContainer);

    // Create navigation if enabled
    if (this.options.showNavigation && this.events.length > 1) {
      this.createNavigation();
    }
  }

  /**
   * Creates a timeline event element
   * @param {Object} event - Event object
   * @param {number} index - Index of the event
   * @returns {HTMLElement} Timeline event element
   */
  createTimelineEvent(event, index) {
    const eventElement = document.createElement('div');
    eventElement.classList.add('timeline-event');
    eventElement.setAttribute('data-event-index', index);
    
    // Add alternating class for alternating layout
    if (this.options.layout === 'alternating' && index % 2 === 1) {
      eventElement.classList.add('timeline-event-right');
    }

    // Create event marker
    const marker = document.createElement('div');
    marker.classList.add('timeline-marker');
    marker.classList.add(`timeline-marker-${this.options.markerType}`);
    marker.classList.add(`timeline-marker-${this.options.markerSize}`);
    
    // Set marker content based on type
    switch (this.options.markerType) {
      case 'number':
        marker.textContent = index + 1;
        break;
      case 'icon':
        marker.innerHTML = event.icon || '•';
        break;
      default: // dot
        marker.innerHTML = '•';
    }
    
    // Add marker to event
    eventElement.appendChild(marker);

    // Create event content
    const content = document.createElement('div');
    content.classList.add('timeline-content');
    
    // Add event title
    if (event.title) {
      const title = document.createElement('h3');
      title.classList.add('timeline-title');
      title.textContent = event.title;
      content.appendChild(title);
    }
    
    // Add event date
    if (event.date) {
      const date = document.createElement('div');
      date.classList.add('timeline-date');
      date.textContent = event.date;
      content.appendChild(date);
    }
    
    // Add event description
    if (event.description) {
      const description = document.createElement('p');
      description.classList.add('timeline-description');
      description.textContent = event.description;
      content.appendChild(description);
    }
    
    // Add event content (HTML)
    if (event.content) {
      const eventContent = document.createElement('div');
      eventContent.classList.add('timeline-event-content');
      if (typeof event.content === 'string') {
        eventContent.innerHTML = event.content;
      } else if (event.content instanceof HTMLElement) {
        eventContent.appendChild(event.content.cloneNode(true));
      }
      content.appendChild(eventContent);
    }
    
    // Add content to event
    eventElement.appendChild(content);

    // Add ARIA attributes
    eventElement.setAttribute('role', 'listitem');
    eventElement.setAttribute('aria-label', `Timeline event: ${event.title || `Event ${index + 1}`}`);

    return eventElement;
  }

  /**
   * Creates navigation controls
   */
  createNavigation() {
    this.navigation = document.createElement('div');
    this.navigation.classList.add('timeline-navigation');
    
    // Previous button
    this.prevButton = document.createElement('button');
    this.prevButton.classList.add('btn', 'btn-outline', 'timeline-prev');
    this.prevButton.innerHTML = '&lt;';
    this.prevButton.setAttribute('aria-label', 'Previous event');
    this.prevButton.disabled = true; // Initially disabled
    
    // Next button
    this.nextButton = document.createElement('button');
    this.nextButton.classList.add('btn', 'timeline-next');
    this.nextButton.innerHTML = '&gt;';
    this.nextButton.setAttribute('aria-label', 'Next event');
    
    // Add buttons to navigation
    this.navigation.appendChild(this.prevButton);
    this.navigation.appendChild(this.nextButton);
    
    this.timeline.appendChild(this.navigation);
  }

  /**
   * Binds event listeners for the timeline
   */
  bindEvents() {
    // Navigation buttons
    if (this.prevButton) {
      this.prevButton.addEventListener('click', () => {
        this.prevEvent();
      });
    }

    if (this.nextButton) {
      this.nextButton.addEventListener('click', () => {
        this.nextEvent();
      });
    }

    // Keyboard navigation
    this.timeline.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          this.prevEvent();
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.nextEvent();
          break;
        case 'Home':
          e.preventDefault();
          this.goToEvent(0);
          break;
        case 'End':
          e.preventDefault();
          this.goToEvent(this.events.length - 1);
          break;
      }
    });

    // Mouse events for auto-play
    if (this.options.autoPlay) {
      this.timeline.addEventListener('mouseenter', () => {
        this.pauseAutoPlay();
      });

      this.timeline.addEventListener('mouseleave', () => {
        this.startAutoPlay();
      });
    }
  }

  /**
   * Goes to the next event
   */
  nextEvent() {
    if (this.hasNextEvent()) {
      this.goToEvent(this.currentEventIndex + 1);
    }
  }

  /**
   * Goes to the previous event
   */
  prevEvent() {
    if (this.hasPrevEvent()) {
      this.goToEvent(this.currentEventIndex - 1);
    }
  }

  /**
   * Goes to a specific event
   * @param {number} eventIndex - Index of the event to go to
   */
  goToEvent(eventIndex) {
    if (eventIndex < 0 || eventIndex >= this.events.length) {
      return;
    }

    const oldIndex = this.currentEventIndex;
    this.currentEventIndex = eventIndex;

    // Update visual state
    this.updateEventStates();

    // Update navigation buttons
    if (this.prevButton) {
      this.prevButton.disabled = !this.hasPrevEvent();
    }

    if (this.nextButton) {
      this.nextButton.disabled = !this.hasNextEvent();
    }

    // Reset auto-play timer if active
    if (this.isPlaying) {
      this.resetAutoPlay();
    }

    // Trigger custom event
    this.timeline.dispatchEvent(new CustomEvent('timelineeventchange', {
      detail: { 
        oldIndex: oldIndex, 
        newIndex: eventIndex,
        event: this.events[eventIndex]
      }
    }));
  }

  /**
   * Updates the state of all events
   */
  updateEventStates() {
    const eventElements = this.timeline.querySelectorAll('.timeline-event');
    
    eventElements.forEach((eventEl, index) => {
      // Reset classes
      eventEl.classList.remove('timeline-event-active');
      
      // Add active class to current event
      if (index === this.currentEventIndex) {
        eventEl.classList.add('timeline-event-active');
      }
    });
  }

  /**
   * Checks if there's a next event
   * @returns {boolean} True if there's a next event
   */
  hasNextEvent() {
    return this.currentEventIndex < this.events.length - 1;
  }

  /**
   * Checks if there's a previous event
   * @returns {boolean} True if there's a previous event
   */
  hasPrevEvent() {
    return this.currentEventIndex > 0;
  }

  /**
   * Starts auto-play functionality
   */
  startAutoPlay() {
    if (!this.options.autoPlay || this.isPlaying || this.events.length <= 1) return;

    this.isPlaying = true;
    this.autoPlayInterval = setInterval(() => {
      if (this.hasNextEvent()) {
        this.nextEvent();
      } else {
        // Loop back to the beginning
        this.goToEvent(0);
      }
    }, this.options.autoPlayInterval);
  }

  /**
   * Pauses auto-play functionality
   */
  pauseAutoPlay() {
    if (!this.isPlaying) return;

    clearInterval(this.autoPlayInterval);
    this.isPlaying = false;
  }

  /**
   * Resets auto-play timer
   */
  resetAutoPlay() {
    this.pauseAutoPlay();
    this.startAutoPlay();
  }

  /**
   * Adds an event to the timeline
   * @param {Object} event - Event object to add
   * @param {number} index - Index to insert the event (optional)
   */
  addEvent(event, index) {
    if (index === undefined || index < 0 || index > this.events.length) {
      // Add to the end
      index = this.events.length;
    }

    this.events.splice(index, 0, event);

    // Create and insert the event element
    const timelineEvent = this.createTimelineEvent(event, index);
    
    // Update indices of subsequent events
    const eventElements = this.timeline.querySelectorAll('.timeline-event');
    if (index < eventElements.length) {
      this.timelineContainer.insertBefore(timelineEvent, eventElements[index]);
      
      // Update data attributes for subsequent events
      for (let i = index + 1; i < eventElements.length + 1; i++) {
        eventElements[i - 1].setAttribute('data-event-index', i);
      }
    } else {
      this.timelineContainer.appendChild(timelineEvent);
    }

    // Update navigation buttons if needed
    if (this.navigation && this.events.length === 2) {
      this.navigation.style.display = 'flex';
    }
  }

  /**
   * Removes an event from the timeline
   * @param {number} index - Index of the event to remove
   */
  removeEvent(index) {
    if (index < 0 || index >= this.events.length) {
      return;
    }

    // Remove from array
    this.events.splice(index, 1);

    // Remove from DOM
    const eventElement = this.timeline.querySelector(`.timeline-event[data-event-index="${index}"]`);
    if (eventElement) {
      eventElement.parentNode.removeChild(eventElement);
    }

    // Update indices of subsequent events
    const eventElements = this.timeline.querySelectorAll('.timeline-event');
    for (let i = index; i < eventElements.length; i++) {
      const currentIndex = parseInt(eventElements[i].getAttribute('data-event-index'));
      eventElements[i].setAttribute('data-event-index', i);
    }

    // Adjust current event index if necessary
    if (this.currentEventIndex >= index && this.currentEventIndex > 0) {
      this.currentEventIndex = Math.max(0, this.currentEventIndex - 1);
    }

    // Update states
    this.updateEventStates();

    // Hide navigation if only one event left
    if (this.navigation && this.events.length <= 1) {
      this.navigation.style.display = 'none';
    }
  }

  /**
   * Updates an existing event
   * @param {number} index - Index of the event to update
   * @param {Object} event - New event object
   */
  updateEvent(index, event) {
    if (index < 0 || index >= this.events.length) {
      return;
    }

    // Update the event in the array
    this.events[index] = { ...this.events[index], ...event };

    // Update the DOM element
    const eventElement = this.timeline.querySelector(`.timeline-event[data-event-index="${index}"]`);
    if (eventElement) {
      // Remove old content
      const contentElement = eventElement.querySelector('.timeline-content');
      if (contentElement) {
        contentElement.innerHTML = '';

        // Add updated content
        if (event.title) {
          const title = document.createElement('h3');
          title.classList.add('timeline-title');
          title.textContent = event.title;
          contentElement.appendChild(title);
        }

        if (event.date) {
          const date = document.createElement('div');
          date.classList.add('timeline-date');
          date.textContent = event.date;
          contentElement.appendChild(date);
        }

        if (event.description) {
          const description = document.createElement('p');
          description.classList.add('timeline-description');
          description.textContent = event.description;
          contentElement.appendChild(description);
        }

        if (event.content) {
          const eventContent = document.createElement('div');
          eventContent.classList.add('timeline-event-content');
          if (typeof event.content === 'string') {
            eventContent.innerHTML = event.content;
          } else if (event.content instanceof HTMLElement) {
            eventContent.appendChild(event.content.cloneNode(true));
          }
          contentElement.appendChild(eventContent);
        }
      }
    }
  }

  /**
   * Gets the current event index
   * @returns {number} Current event index
   */
  getCurrentEventIndex() {
    return this.currentEventIndex;
  }

  /**
   * Gets an event by index
   * @param {number} index - Index of the event
   * @returns {Object} Event object
   */
  getEvent(index) {
    if (index < 0 || index >= this.events.length) {
      return null;
    }
    return this.events[index];
  }

  /**
   * Gets all events
   * @returns {Array} Array of all event objects
   */
  getEvents() {
    return [...this.events];
  }

  /**
   * Sets the theme of the timeline
   * @param {string} theme - New theme (primary, success, warning, danger, info)
   */
  setTheme(theme) {
    // Remove old theme class
    this.timeline.classList.remove(`timeline-${this.options.theme}`);
    
    // Update theme option
    this.options.theme = theme;
    
    // Add new theme class
    this.timeline.classList.add(`timeline-${theme}`);
  }

  /**
   * Sets the layout of the timeline
   * @param {string} layout - New layout (vertical, horizontal, alternating)
   */
  setLayout(layout) {
    // Remove old layout class
    this.timeline.classList.remove(`timeline-${this.options.layout}`);
    
    // Update layout option
    this.options.layout = layout;
    
    // Add new layout class
    this.timeline.classList.add(`timeline-${layout}`);
    
    // Rebuild the timeline to apply new layout
    this.rebuildTimeline();
  }

  /**
   * Rebuilds the timeline with current events and options
   */
  rebuildTimeline() {
    // Clear the timeline container
    this.timelineContainer.innerHTML = '';

    // Add timeline line if enabled
    if (this.options.showTimelineLine && !this.timelineLine) {
      this.timelineLine = document.createElement('div');
      this.timelineLine.classList.add('timeline-line');
      this.timelineContainer.appendChild(this.timelineLine);
    }

    // Add events back to the timeline
    this.events.forEach((event, index) => {
      const timelineEvent = this.createTimelineEvent(event, index);
      this.timelineContainer.appendChild(timelineEvent);
    });

    // Reset current event index
    this.currentEventIndex = Math.min(this.currentEventIndex, this.events.length - 1);
    if (this.currentEventIndex < 0 && this.events.length > 0) {
      this.currentEventIndex = 0;
    }

    // Update states
    this.updateEventStates();
  }

  /**
   * Destroys the timeline and cleans up
   */
  destroy() {
    // Pause auto-play if active
    this.pauseAutoPlay();

    // Remove event listeners would normally be done here
    // For simplicity in this implementation, we'll just remove the element

    if (this.timeline.parentNode) {
      this.timeline.parentNode.removeChild(this.timeline);
    }
  }
}

/**
 * Initializes all timelines on the page
 * @param {HTMLElement|Document} container - Container to search for timelines
 * @returns {Array<Timeline>} Array of initialized timeline instances
 */
function initTimelines(container = document) {
  const timelines = container.querySelectorAll('.timeline, [data-timeline]');
  const instances = [];

  timelines.forEach(timeline => {
    if (!timeline.hasAttribute('data-timeline-initialized')) {
      timeline.setAttribute('data-timeline-initialized', 'true');

      // Get options from data attributes
      const options = {
        layout: timeline.dataset.layout || 'vertical',
        markerType: timeline.dataset.markerType || 'dot',
        markerSize: timeline.dataset.markerSize || 'medium',
        showTimelineLine: timeline.dataset.showTimelineLine !== 'false',
        autoPlay: timeline.dataset.autoPlay === 'true',
        autoPlayInterval: parseInt(timeline.dataset.autoPlayInterval) || 5000,
        showNavigation: timeline.dataset.showNavigation !== 'false',
        animationDuration: parseInt(timeline.dataset.animationDuration) || 300,
        theme: timeline.dataset.theme || 'primary'
      };

      // Try to get events from data attribute (JSON string)
      let events = [];
      if (timeline.dataset.events) {
        try {
          events = JSON.parse(timeline.dataset.events);
        } catch (e) {
          console.error('Invalid events data:', e);
        }
      }

      // If no events from data attribute, try to get them from child elements
      if (events.length === 0) {
        const eventElements = timeline.querySelectorAll('.timeline-event-data');
        if (eventElements.length > 0) {
          events = Array.from(eventElements).map(el => ({
            title: el.dataset.title || '',
            date: el.dataset.date || '',
            description: el.dataset.description || '',
            content: el.innerHTML,
            icon: el.dataset.icon || ''
          }));
        }
      }

      const instance = new Timeline(timeline, events, options);
      instances.push(instance);
    }
  });

  return instances;
}

/**
 * Auto-initialize timelines when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initTimelines();
  }, 0);
});

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Timeline, initTimelines };
}

// Also make it available globally
window.Timeline = Timeline;
window.initTimelines = initTimelines;