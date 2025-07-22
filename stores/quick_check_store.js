// @ts-check

import { defineStore } from 'pinia';

/**
 * @typedef QuickCheck
 * @property {string} type
 * @property {Object} quick_check_content
 * @property {string} [prompt]
 */

/**
 * @typedef QuickCheckUpdatePayload
 * @property {Array<QuickCheck>} [quickChecks]
 */

export const useQuickCheckStore = defineStore('quickCheck', {
  state: () => ({
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
     * Update quick check state properties
     * @param {QuickCheckUpdatePayload} payload - The state properties to update
     */
    updateQuickCheckState(payload) {
      if (payload.quickChecks !== undefined) this.quickChecks = payload.quickChecks;
    },
    /**
     * Reset all quick check state
     */
    reset() {
      this.$patch({
        quickChecks: [],
      });
    },
  },
});
