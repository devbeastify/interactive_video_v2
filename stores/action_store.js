// @ts-check

import { defineStore } from 'pinia';

/**
 * @typedef Reference
 * @property {string} id
 * @property {string} title
 * @property {string} url
 */

/**
 * @typedef QuickCheck
 * @property {Object} quick_check_content
 * @property {string} [prompt]
 * @property {string} type
 */

/**
 * @typedef ActivityInfo
 * @property {Object} diagnostic
 * @property {Array<QuickCheck>} quick_checks
 * @property {Array<Reference>} reference
 * @property {string} sub_topic
 * @property {string} title
 * @property {string} topic
 */

/**
 * @typedef Action
 * @property {Object} data - The action data
 * @property {number} index - The action index
 * @property {string} type - Either 'video' or 'quick_check'
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
     * Check if current action is a quick check
     * @param {ActionStoreState} state - The store state
     * @return {boolean} True if current action is a quick check
     */
    currentActionIsQuickCheck: (state) => {
      const action = state.actions[state.currentActionIndex];
      return action ? action.type === 'quick_check' : false;
    },

    /**
     * Check if current action is a video
     * @param {ActionStoreState} state - The store state
     * @return {boolean} True if current action is a video
     */
    currentActionIsVideo: (state) => {
      const action = state.actions[state.currentActionIndex];
      return action ? action.type === 'video' : false;
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
      return state.actions.length === 0 || state.currentActionIndex === state.actions.length - 1;
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

      const maxLength = Math.max(
        activityInfo.reference.length,
        activityInfo.quick_checks.length
      );

      for (let i = 0; i < maxLength; i++) {
        if (activityInfo.reference[i]) {
          actions.push({
            data: activityInfo.reference[i],
            index: actions.length,
            type: 'video',
          });
        }

        if (activityInfo.quick_checks[i]) {
          actions.push({
            data: activityInfo.quick_checks[i],
            index: actions.length,
            type: 'quick_check',
          });
        }
      }

      for (let i = maxLength; i < activityInfo.quick_checks.length; i++) {
        actions.push({
          data: activityInfo.quick_checks[i],
          index: actions.length,
          type: 'quick_check',
        });
      }

      this.actions = actions;
      this.currentActionIndex = 0;
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
     * Go to the next action in the sequence
     * Quick check completion triggers next video
     * Video completion triggers next quick check
     */
    goToNextAction() {
      if (this.hasNextAction) {
        this.currentActionIndex++;
      }
    },

    /**
     * Reset the action store to initial state
     */
    reset() {
      this.currentActionIndex = 0;
    },

    /**
     * Reset to the first action
     */
    resetToFirstAction() {
      this.currentActionIndex = 0;
    },
  },
});