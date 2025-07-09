// @ts-check

import { defineStore } from 'pinia';

/**
 * @typedef QuickCheck
 * @property {number} offset
 * @property {number} gap
 * @property {string} type
 * @property {Object} quick_check_content
 * @property {string} prompt
 */

/**
 * @typedef QuickCheckState
 * @property {number|null} currentOffset
 * @property {Object|null} content
 * @property {boolean} isComplete
 * @property {HTMLInputElement|null} pronunciationToggle
 * @property {boolean} isVisible
 * @property {Array<QuickCheck>} quickChecks
 */

export const useQuickCheckStore = defineStore('quickCheck', {
  state: () => ({
    currentOffset: null,
    content: null,
    isComplete: false,
    pronunciationToggle: null,
    isVisible: false,
    /** @type {Array<QuickCheck>} */
    quickChecks: [],
  }),

  getters: {
    /**
     * Get the current quick check based on offset
     * @param {QuickCheckState} state - The current state
     * @return {QuickCheck|undefined} The current quick check or undefined if not found
     */
    currentQuickCheck: (state) => {
      if (!state.currentOffset || !state.quickChecks) {
        return undefined;
      }

      const found = state.quickChecks.find((qc) => qc.offset === state.currentOffset);
      return found || undefined;
    },

    /**
     * Check if there are any quick checks available
     * @param {QuickCheckState} state - The current state
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
     */
    completeQuickCheck() {
      this.isComplete = true;

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

      document.dispatchEvent(new CustomEvent('finishCheckpoint'));

      this.hideQuickCheck();
      this.reset();
    },

    /**
     * Reset all quick check state
     */
    reset() {
      this.$patch({
        currentOffset: null,
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
      this.$patch(payload);
    },
  },
});
