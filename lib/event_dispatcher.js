// @ts-check

/**
 * @typedef {Function} EventCallback
 * @param {any} data - Event data passed to the callback
 */

/**
 * @typedef {Object.<string, EventCallback[]>} EventListeners
 */

/**
 * Simple event dispatcher for DL events
 */
class EventDispatcher {
  /**
   * @type {EventListeners}
   */
  constructor() {
    this.listeners = new Map();
  }

  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {EventCallback} callback - Callback function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {EventCallback} callback - Callback function
   */
  off(event, callback) {
    if (!this.listeners.has(event)) return;
    
    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  /**
   * Dispatch event
   * @param {string} event - Event name
   * @param {any} data - Event data
   */
  dispatch(event, data = null) {
    if (!this.listeners.has(event)) return;
    
    const callbacks = this.listeners.get(event);
    callbacks.forEach((/** @type {EventCallback} */ callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  /**
   * Clear all listeners
   */
  clear() {
    this.listeners.clear();
  }
}

export const eventDispatcher = new EventDispatcher();

export const DL_EVENTS = {
  COMPLETED: 'dl:completed',
  ERROR: 'dl:error',
  PAUSE: 'dl:pause',
  PAUSED: 'dl:paused',
  PLAY: 'dl:play',
  STARTED: 'dl:started',
};