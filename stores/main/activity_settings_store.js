// @ts-check

import { defineStore } from 'pinia';
import { browserIsSafari } from '../../lib/safari_browser_check';

/**
 * @typedef ActionSettings
 * @property {boolean} useAutoPlay
 */

/**
 * @typedef StoreState
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
     * Initialize the autoplay setting based on browser type and stored
     * preference
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
     * Update the autoplay setting and persist to localStorage
     * @param {boolean} useAutoPlay - Whether to enable autoplay
     */
    updateAutoPlaySetting(useAutoPlay) {
      this.actionSettings.useAutoPlay = useAutoPlay;
      localStorage.setItem(
        'interactive_video_autoplay',
        useAutoPlay.toString()
      );
    },

    /**
     * Reset the autoplay setting to enabled and persist to localStorage
     * Called when InteractiveVideoIntro component is mounted
     */
    resetAutoPlayToEnabled() {
      this.actionSettings.useAutoPlay = true;
      localStorage.setItem('interactive_video_autoplay', 'true');
    },

    /**
     * Initialize the settings store
     * @return {void}
     */
    init() {
      this.initializeAutoPlaySetting();
      this.isInitialized = true;
    },
  },
});
