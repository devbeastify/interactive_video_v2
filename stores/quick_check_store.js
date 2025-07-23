// @ts-check

import { defineStore } from 'pinia';

/**
 * @typedef {Object} QuickCheck
 * @property {Object} quick_check_content
 * @property {string} [prompt]
 * @property {string} type
 */

/**
 * @typedef {Object} QuickCheckUpdatePayload
 * @property {Array<QuickCheck>} [quickChecks]
 */

/**
 * @typedef {Object} QuickCheckState
 * @property {Array<QuickCheck>} quickChecks
 */

export const useQuickCheckStore = defineStore('quickCheck', {
  state: () => ({
    /** @type {Array<QuickCheck>} */
    quickChecks: [],
  }),

  getters: {
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
     * Reset all quick check state
     */
    reset() {
      this.$patch({
        quickChecks: [],
      });
    },

    /**
     * Update quick check state properties
     * @param {QuickCheckUpdatePayload} payload - The state properties to update
     */
    updateQuickCheckState(payload) {
      if (payload.quickChecks !== undefined) {
        this.quickChecks = payload.quickChecks;
      }
    },
  },
});
