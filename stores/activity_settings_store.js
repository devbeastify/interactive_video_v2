// @ts-check

import { defineStore } from 'pinia';
import { browserIsSafari } from '../lib/safari_browser_check.js';

/**
 * @typedef {Object} ActionSettings
 * @property {boolean} useAutoPlay
 */

/**
 * @typedef {Object} StoreState
 * @property {ActionSettings} actionSettings
 * @property {boolean} isInitialized
 */

export const useActivitySettingsStore = defineStore('activitySettings', {
  state: () => ({
    /** @type {ActionSettings} */
    actionSettings: {
      useAutoPlay: false,
    },
    isInitialized: false,
  }),

  getters: {
    /**
     * Get the current autoplay setting
     * @param {StoreState} state - The store state
     * @return {boolean} Current autoplay setting
     */
    useAutoPlay: (state) => state.actionSettings.useAutoPlay,
  },

  actions: {
    /**
     * Initialize the settings store
     * @return {void}
     */
    init() {
      this.initializeAutoPlaySetting();
      this.isInitialized = true;
    },

    /**
     * Initialize the autoplay setting based on browser type and stored
     * preference
     * @return {void}
     */
    initializeAutoPlaySetting() {
      const storedAutoPlay = localStorage.getItem(
        'interactive_video_autoplay'
      );

      if (storedAutoPlay !== null) {
        this.actionSettings.useAutoPlay = storedAutoPlay === 'true';
      } else {
        this.actionSettings.useAutoPlay = !browserIsSafari();
      }
    },

    /**
     * Reset the autoplay setting to enabled and persist to localStorage
     * Called when IntroScreen component is mounted
     * @return {void}
     */
    resetAutoPlayToEnabled() {
      this.actionSettings.useAutoPlay = true;
      localStorage.setItem('interactive_video_autoplay', 'true');
    },

    /**
     * Update the autoplay setting and persist to localStorage
     * @param {boolean} useAutoPlay - Whether to enable autoplay
     * @return {void}
     */
    updateAutoPlaySetting(useAutoPlay) {
      this.actionSettings.useAutoPlay = useAutoPlay;
      localStorage.setItem(
        'interactive_video_autoplay',
        useAutoPlay.toString()
      );
    },
  },
});