// @ts-check

import { defineStore } from 'pinia';
import { Sequencer } from '../lib/sequencer';
import { buildScreensForActivity } from '../lib/screens';
import { useActivitySettingsStore } from './activity_settings_store';
import { useActionStore } from './action_store';

/**
 * @typedef {Object} Diagnostic
 * @property {string} dl
 * @property {string} failure_message
 * @property {Array<Object>} items
 * @property {string} language
 * @property {string} number_of_questions
 * @property {string} threshold
 */

/**
 * @typedef {Object} QuickCheck
 * @property {Object} quick_check_content
 * @property {string} type
 */

/**
 * @typedef {Object} Reference
 * @property {string} id
 * @property {string} title
 * @property {string} url
 */

/**
 * @typedef {Object} VideoReference
 * @property {string} video_path
 * @property {string|null} english_subtitles_path
 * @property {string|null} foreign_subtitles_path
 * @property {string} foreign_language
 */

/**
 * @typedef {Object} ActivityInfo
 * @property {string} topic
 * @property {string} sub_topic
 * @property {string} title
 * @property {string} dl
 * @property {Array<Reference>} reference
 * @property {Array<QuickCheck>} quick_checks
 * @property {Diagnostic} diagnostic
 */

/**
 * @typedef {Object} MainStoreState
 * @property {boolean} isInitialized
 * @property {ActivityInfo} activityInfo
 * @property {Sequencer} sequencer
 */

export const mainStore = defineStore('interactive_video_v2', {
  state: () => ({
    /** @type {ActivityInfo} */
    activityInfo: {
      dl: '',
      diagnostic: {
        dl: '',
        failure_message: '',
        items: [],
        language: '',
        number_of_questions: '',
        threshold: '',
      },
      quick_checks: [],
      reference: [],
      sub_topic: '',
      title: '',
      topic: '',
    },
    isInitialized: false,
    sequencer: new Sequencer(),
  }),

  actions: {
    /**
     * Gets the global element that should appear within the activity
     * @return {Promise<Element | null>}
     */
    getActivityInfo() {
      return Promise.resolve(document.querySelector('.js-program-tutorial'));
    },

    /**
     * Parses the global element that should appear within the activity
     * @param {Element} activityInfo - The DOM element containing activity data
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
     * Creates the default diagnostic configuration
     * @return {Diagnostic}
     */
    createDefaultDiagnostic() {
      return {
        dl: '',
        failure_message: '',
        items: [],
        language: '',
        number_of_questions: '',
        threshold: '',
      };
    },

    /**
     * Merges parsed activity info with defaults to ensure complete structure
     * @param {ActivityInfo} parsedActivityInfo - The parsed activity information
     * @return {ActivityInfo}
     */
    mergeActivityInfoWithDefaults(parsedActivityInfo) {
      return {
        dl: parsedActivityInfo.dl || '',
        diagnostic: parsedActivityInfo.diagnostic || this.createDefaultDiagnostic(),
        quick_checks: parsedActivityInfo.quick_checks || [],
        reference: parsedActivityInfo.reference || [],
        sub_topic: parsedActivityInfo.sub_topic || '',
        title: parsedActivityInfo.title || '',
        topic: parsedActivityInfo.topic || '',
      };
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
        this.activityInfo = this.mergeActivityInfoWithDefaults(parsedActivityInfo);

        const actionStore = useActionStore();
        actionStore.createActions(this.activityInfo);

        const screens = buildScreensForActivity(this.activityInfo);
        this.sequencer.addScreen(screens);

        const activitySettingsStore = useActivitySettingsStore();
        activitySettingsStore.init();

        this.isInitialized = true;
        this.sequencer.goToScreen('intro');
      } catch (error) {
        throw error;
      }
    },
  },
});
