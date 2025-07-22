// @ts-check

import { defineStore } from 'pinia';
import { Sequencer } from '../lib/sequencer';
import { buildScreensForActivity } from '../lib/screens';
import { useActivitySettingsStore } from './activity_settings_store';
import { useActionStore } from './action_store';

/**
 * @typedef VideoReference
 * @property {string} video_path
 * @property {string|null} english_subtitles_path
 * @property {string|null} foreign_subtitles_path
 * @property {string} foreign_language
 */

/**
 * @typedef QuickCheck
 * @property {string} type
 * @property {Object} quick_check_content
 */

/**
 * @typedef Reference
 * @property {string} id
 * @property {string} title
 * @property {string} url
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
 * @typedef MainStoreState
 * @property {boolean} isInitialized
 * @property {ActivityInfo} activityInfo
 * @property {Sequencer} sequencer
 */

export const mainStore = defineStore('interactive_video_v2', {
  state: () => ({
    isInitialized: false,
    /** @type {ActivityInfo} */
    activityInfo: {
      topic: '',
      sub_topic: '',
      title: '',
      dl: '',
      reference: [],
      quick_checks: [],
      diagnostic: {
        dl: '',
        failure_message: '',
        items: [],
        language: '',
        number_of_questions: '',
        threshold: '',
      },
    },
    sequencer: new Sequencer(),
  }),

  actions: {
    /**
     * Gets the global that should appear within the activity.
     * @return {Promise<Element | null>}
     */
    getActivityInfo() {
      return Promise.resolve(document.querySelector('.js-program-tutorial'));
    },

    /**
     * Parses the global that should appear within the activity.
     * @param {Element} activityInfo
     * @return {Promise<ActivityInfo>}
     */
    async parseActivityInfo(activityInfo) {
      try {
        if (!activityInfo.innerHTML.trim()) {
          throw new Error('Empty innerHTML');
        }
        const data = JSON.parse(activityInfo.innerHTML);
        return data[0];
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to parse activity info: ${errorMessage}`);
      }
    },

    /**
     * Initialize the store with activity information and build screens
     */
    async init() {
      try {
        const activityInfoElement = await this.getActivityInfo();
        if (!activityInfoElement) {
          throw new Error('Activity info element not found');
        }
        
        const parsedActivityInfo = await this.parseActivityInfo(activityInfoElement);
        
        // Ensure the activity info has the required structure
        this.activityInfo = {
          topic: parsedActivityInfo.topic || '',
          sub_topic: parsedActivityInfo.sub_topic || '',
          title: parsedActivityInfo.title || '',
          dl: parsedActivityInfo.dl || '',
          reference: parsedActivityInfo.reference || [],
          quick_checks: parsedActivityInfo.quick_checks || [],
          diagnostic: parsedActivityInfo.diagnostic || {
            dl: '',
            failure_message: '',
            items: [],
            language: '',
            number_of_questions: '',
            threshold: '',
          },
        };

        // Create actions from activity info
        const actionStore = useActionStore();
        actionStore.createActions(this.activityInfo);

        console.log('activityInfo', this.activityInfo);

        // Build screens for the activity
        const screens = buildScreensForActivity(this.activityInfo);
        this.sequencer.addScreen(screens);

        // Initialize activity settings
        const activitySettingsStore = useActivitySettingsStore();
        activitySettingsStore.init();

        // Mark as initialized and go to intro screen
        this.isInitialized = true;
        this.sequencer.goToScreen('intro');

        console.log('Main store initialized successfully');
      } catch (error) {
        console.error('Failed to initialize main store:', error);
        throw error;
      }
    },
  },
});
