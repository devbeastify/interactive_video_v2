// @ts-check

import { defineStore } from 'pinia';

/**
 * @typedef Reference
 * @property {string} id
 * @property {string} title
 * @property {string} url
 * @property {string} [dl]
 */

/**
 * @typedef QuickCheck
 * @property {string} type
 * @property {Object} quick_check_content
 * @property {string} [prompt]
 */

/**
 * @typedef ActivityInfo
 * @property {string} topic
 * @property {string} sub_topic
 * @property {string} title
 * @property {string} dl
 * @property {Array<Reference>} reference
 * @property {Array<QuickCheck>} quick_checks
 * @property {Object} diagnostic
 */

/**
 * @typedef Action
 * @property {string} type - Either 'video' or 'quick_check'
 * @property {Object} data - The action data
 * @property {number} index - The action index
 */

/**
 * @typedef ActionStoreState
 * @property {Array<Action>} actions
 * @property {number} currentActionIndex
 */

export const useActionStore = defineStore('action', {
  state: () => ({
    /** @type {Array<Action>} */
    actions: [],
    /** @type {number} */
    currentActionIndex: 0,
  }),

  getters: {
    /**
     * Get current action from actions
     * @param {ActionStoreState} state - The store state
     * @return {Action|null} Current action or null if not available
     */
    currentAction: (state) => {
      return state.actions[state.currentActionIndex] || null;
    },

    /**
     * Check if current action is a video
     * @param {ActionStoreState} state - The store state
     * @return {boolean} True if current action is a video
     */
    isCurrentActionVideo: (state) => {
      const action = state.actions[state.currentActionIndex];
      return action && action.type === 'video';
    },

    /**
     * Check if current action is a quick check
     * @param {ActionStoreState} state - The store state
     * @return {boolean} True if current action is a quick check
     */
    isCurrentActionQuickCheck: (state) => {
      const action = state.actions[state.currentActionIndex];
      return action && action.type === 'quick_check';
    },

    /**
     * Check if there are more actions after current
     * @param {ActionStoreState} state - The store state
     * @return {boolean} True if there are more actions
     */
    hasNextAction: (state) => {
      return state.currentActionIndex < state.actions.length - 1;
    },

    /**
     * Check if we're at the last action
     * @param {ActionStoreState} state - The store state
     * @return {boolean} True if at last action
     */
    isAtLastAction: (state) => {
      return state.currentActionIndex === state.actions.length - 1;
    },
  },

  actions: {
    /**
     * Create actions from video references and quick checks
     * This creates the sequential flow following the exact order from XML
     * Matches the Ruby backend's mixed_entries behavior
     * @param {ActivityInfo} activityInfo - The activity information
     */
    createActions(activityInfo) {
      const actions = [];

      // Get the maximum length to handle cases where there are more videos or quick checks
      const maxLength = Math.max(
        activityInfo.reference.length,
        activityInfo.quick_checks.length
      );

      // Create actions following the XML order
      // This matches the Ruby backend's each_excluding_nodes behavior
      for (let i = 0; i < maxLength; i++) {
        // Add video if available at this position
        if (activityInfo.reference[i]) {
          actions.push({
            type: 'video',
            data: activityInfo.reference[i],
            index: actions.length,
          });
        }

        // Add quick check if available at this position
        if (activityInfo.quick_checks[i]) {
          actions.push({
            type: 'quick_check',
            data: activityInfo.quick_checks[i],
            index: actions.length,
          });
        }
      }

      // Handle additional quick checks beyond the video count
      // This matches the XML structure where there can be extra quick checks
      for (let i = maxLength; i < activityInfo.quick_checks.length; i++) {
        actions.push({
          type: 'quick_check',
          data: activityInfo.quick_checks[i],
          index: actions.length,
        });
      }

      this.actions = actions;
      this.currentActionIndex = 0;
    },

    /**
     * Reset the action store to initial state
     */
    reset() {
      this.currentActionIndex = 0;
    },

    /**
     * Go to the next action in the sequence
     * Point 9: Quick check completion triggers next video
     * Point 10: Video completion triggers next quick check
     */
    goToNextAction() {
      if (this.hasNextAction) {
        this.currentActionIndex++;
        
        // Only go to diagnostic if we've completed the last quick check
        // Don't go to diagnostic just because we reached the last action
      }
    },

    /**
     * Go to a specific action by index
     * @param {number} index - The action index to go to
     */
    goToAction(index) {
      if (index >= 0 && index < this.actions.length) {
        this.currentActionIndex = index;
      }
    },

    /**
     * Reset to the first action
     */
    resetToFirstAction() {
      this.currentActionIndex = 0;
    },
  },
}); 