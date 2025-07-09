// @ts-check

import { defineStore } from 'pinia';
import { browserIsSafari } from '../../lib/safari_browser_check';
import { Sequencer } from '../../lib/sequencer';
import { buildScreensForActivity } from '../../lib/screens';
import { getActivityInfo, parseActivityInfo } from './activity_info';

/**
 * @typedef ActionSettings
 * @property {boolean} useAutoPlay
 */

/**
 * @typedef VideoReference
 * @property {string} video_path
 * @property {string|null} english_subtitles_path
 * @property {string|null} foreign_subtitles_path
 * @property {string} foreign_language
 */

/**
 * @typedef QuickCheck
 * @property {number} offset
 * @property {number} gap
 * @property {string} type
 * @property {Object} quick_check_content
 */

/**
 * @typedef ActivityInfo
 * @property {string} topic
 * @property {string} sub_topic
 * @property {string} title
 * @property {Array<any>} reference
 * @property {Array<any>} quick_checks
 */

/**
 * @typedef MainStoreState
 * @property {ActionSettings} actionSettings
 * @property {boolean} isInitialized
 * @property {ActivityInfo} activityInfo
 */

export const mainStore = defineStore('interactive_video_v2', {
  state: () => ({
    actionSettings: {
      useAutoPlay: false,
    },
    isInitialized: false,
    /** @type {ActivityInfo} */
    activityInfo: {
      topic: '',
      sub_topic: '',
      title: '',
      reference: [],
      quick_checks: [],
    },
    sequencer: new Sequencer(),
  }),
  actions: {
    /**
     * Initialize the store with activity information and build screens
     */
    init() {
      getActivityInfo()
        .then((activityInfo) => {
          if (!activityInfo) {
            throw new Error('Activity info element not found');
          }
          return parseActivityInfo(activityInfo);
        })
        .then((activityInfo) => {
          this.activityInfo = activityInfo;
          const screens = buildScreensForActivity(activityInfo);
          this.sequencer.addScreen(screens);
          this.sequencer.goToScreen('intro');
        })
        .catch((error) => console.error(error));

      this.initializeAutoPlaySetting();
      this.isInitialized = true;
    },

    /**
     * Initialize the autoplay setting based on browser type and stored preference
     */
    initializeAutoPlaySetting() {
      const storedAutoPlay = localStorage.getItem('interactive_video_autoplay');

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
     * Reset the autoplay setting to true (enabled) and persist to localStorage
     * Called when InteractiveVideoIntro component is mounted
     */
    resetIndex() {
      this.actionSettings.useAutoPlay = true;
      localStorage.setItem('interactive_video_autoplay', 'true');
    },
  },
});
