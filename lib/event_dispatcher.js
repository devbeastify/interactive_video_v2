// @ts-check

/**
 * Simple event dispatcher for DL events
 */
class EventDispatcher {
    constructor() {
      this.listeners = new Map();
    }
  
    /**
     * Add event listener
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
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
     * @param {Function} callback - Callback function
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
      callbacks.forEach(callback => {
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
  
  // Create global instance
  export const eventDispatcher = new EventDispatcher();
  
  // DL-specific event constants
  export const DL_EVENTS = {
    PLAY: 'dl:play',
    PAUSE: 'dl:pause',
    PAUSED: 'dl:paused',
    COMPLETED: 'dl:completed',
    STARTED: 'dl:started',
    ERROR: 'dl:error',
  };