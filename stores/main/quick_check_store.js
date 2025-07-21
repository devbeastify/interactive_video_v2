// @ts-check

import { defineStore } from 'pinia';
import { mainStore } from './main_store';

/**
 * @typedef QuickCheck
 * @property {string} type
 * @property {Object} quick_check_content
 * @property {string} prompt
 */

/**
 * @typedef QuickCheckUpdatePayload
 * @property {any|null} [content]
 * @property {boolean} [isComplete]
 * @property {HTMLInputElement|null} [pronunciationToggle]
 * @property {boolean} [isVisible]
 * @property {Array<QuickCheck>} [quickChecks]
 */

export const useQuickCheckStore = defineStore('quickCheck', {
  state: () => ({
    content: null,
    isComplete: false,
    pronunciationToggle: null,
    isVisible: false,
    /** @type {Array<QuickCheck>} */
    quickChecks: [],
  }),

  getters: {
    /**
     * Check if there are any quick checks available
     * @param {any} state - The current state
     * @return {boolean} True if there are quick checks available
     */
    hasQuickChecks: (state) => {
      return Boolean(state.quickChecks && state.quickChecks.length > 0);
    },
  },

  actions: {
    /**
     * Show quick check
     */
    showQuickCheck() {
      this.isVisible = true;
    },

    /**
     * Hide quick check
     */
    hideQuickCheck() {
      this.isVisible = false;
    },

    /**
     * Complete current quick check
     * Point 9: Quick check completion triggers next video
     */
    completeQuickCheck() {
      this.isComplete = true;

      // Safely dispatch form submit event
      try {
        const form = document.querySelector('.js-activity-main-form');
        if (form) {
          const submitEvent = new Event('submit', {
            bubbles: true,
            cancelable: true,
          });
          form.dispatchEvent(submitEvent);
        } else {
          console.warn(
            'No .js-activity-main-form found. Skipping form submit event.'
          );
        }
      } catch (error) {
        console.warn('Error dispatching form submit event:', error);
      }

      // Safely dispatch custom events
      try {
        document.dispatchEvent(new CustomEvent('finishCheckpoint'));
        document.dispatchEvent(new CustomEvent('quickCheckCompleted'));
      } catch (error) {
        console.warn('Error dispatching custom events:', error);
      }

      // Point 9: Quick check completion triggers next video
      const store = mainStore();
      const currentEntry = /** @type {any} */ (store.currentEntry);
      
      // Check if this is the last quick check
      if (store.isAtLastEntry) {
        store.sequencer.goToScreen('diagnostic');
      } else {
        store.goToNextEntry();
      }

      this.hideQuickCheck();
      this.reset();
    },

    /**
     * Reset all quick check state
     */
    reset() {
      this.$patch({
        content: null,
        isComplete: false,
        pronunciationToggle: null,
        isVisible: false,
      });
    },

    /**
     * Update multiple quick check state properties at once
     * @param {any} payload - The state properties to update
     */
    updateQuickCheckState(payload) {
      if (payload.content !== undefined) this.content = payload.content;
      if (payload.isComplete !== undefined) this.isComplete = payload.isComplete;
      if (payload.pronunciationToggle !== undefined) this.pronunciationToggle = payload.pronunciationToggle;
      if (payload.isVisible !== undefined) this.isVisible = payload.isVisible;
      if (payload.quickChecks !== undefined) this.quickChecks = payload.quickChecks;
    },
  },
});
