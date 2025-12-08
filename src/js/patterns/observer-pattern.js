/**
 * Observer Pattern Implementation
 * The Observer pattern defines a one-to-many dependency between objects
 * so that when one object changes state, all dependents are notified automatically.
 */

class Observer {
  constructor() {
    this.observers = [];
  }

  /**
   * Subscribe an observer function
   * @param {Function} fn - Observer function to add
   * @returns {Function} Function to remove the observer
   */
  subscribe(fn) {
    this.observers.push(fn);
    
    // Return function to unsubscribe
    return () => {
      this.observers = this.observers.filter(observer => observer !== fn);
    };
  }

  /**
   * Notify all observers with provided data
   * @param {*} data - Data to pass to observers
   */
  notify(data) {
    this.observers.forEach(observer => observer(data));
  }

  /**
   * Unsubscribe an observer function
   * @param {Function} fn - Observer function to remove
   * @returns {boolean} Whether the observer was successfully removed
   */
  unsubscribe(fn) {
    const index = this.observers.indexOf(fn);
    if (index !== -1) {
      this.observers.splice(index, 1);
      return true;
    }
    return false;
  }
}

/**
 * Subject class that can be observed
 */
class Subject {
  constructor() {
    this.observers = new Observer();
  }

  /**
   * Subscribe to this subject
   * @param {Function} fn - Observer function
   * @returns {Function} Function to unsubscribe
   */
  subscribe(fn) {
    return this.observers.subscribe(fn);
  }

  /**
   * Notify all subscribers
   * @param {*} data - Data to notify observers with
   */
  emit(data) {
    this.observers.notify(data);
  }
}

/**
 * Example usage:
 * 
 * const newsFeed = new Subject();
 * 
 * const observer1 = newsFeed.subscribe((news) => {
 *   console.log('Subscriber 1 received news:', news);
 * });
 * 
 * const observer2 = newsFeed.subscribe((news) => {
 *   console.log('Subscriber 2 received news:', news);
 * });
 * 
 * newsFeed.emit('Breaking: New JS pattern discovered!');
 * 
 * // Later, unsubscribe if needed
 * observer1();
 */

module.exports = { Observer, Subject };