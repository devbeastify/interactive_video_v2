// @ts-check

import { defineStore } from 'pinia';

/**
 * @typedef QuickCheck
 * @property {number} offset
 * @property {number} gap
 * @property {string} type
 * @property {Object} quick_check_content
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
    quickChecks: [],
  }),

  getters: {
    /**
     * Get the current quick check based on offset
     */
    currentQuickCheck: (state) => {
      if (!state.currentOffset || !state.quickChecks) {
        return null;
      }

      return state.quickChecks.find((qc) => qc.offset === state.currentOffset);
    },

    /**
     * Check if there are any quick checks available
     */
    hasQuickChecks: (state) => {
      return state.quickChecks && state.quickChecks.length > 0;
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
        console.warn('No .js-activity-main-form found. Skipping form submit event.');
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
     */
    updateQuickCheckState(payload) {
      this.$patch(payload);
    },
  },
});
