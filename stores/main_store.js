// @ts-check

import { defineStore } from 'pinia';
import { Sequencer } from '../lib/sequencer.js';
import { buildScreensForActivity } from '../lib/screens.js';
import { useActivitySettingsStore } from './activity_settings_store';
import { useActionStore } from './action_store';

/**
 * @typedef {Object} Diagnostic
 * @property {string} dl
 * @property {string} direction_line_audio
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
 * @typedef {Object} ActivityInfo
 * @property {GlobalIntroData} global_intro
 * @property {Array<Reference>} reference
 * @property {Array<QuickCheck>} quick_checks
 * @property {Diagnostic} diagnostic
 */

/**
 * @typedef {Object} GlobalIntroData
 * @property {string} topic
 * @property {string} sub_topic
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
      global_intro: {
        topic: '',
        sub_topic: '',
      },
      diagnostic: {
        dl: '',
        direction_line_audio: '',
        failure_message: '',
        items: [],
        language: '',
        number_of_questions: '',
        threshold: '',
      },
      quick_checks: [],
      reference: [],  // Video references are now stored here
    },
    isInitialized: false,
    sequencer: new Sequencer(),
  }),

  getters: {
    /**
     * Returns the topic from global_intro
     * @return {string}
     */
    topic() {
      return this.activityInfo.global_intro.topic;
    },

    /**
     * Returns the sub_topic from global_intro
     * @return {string}
     */
    sub_topic() {
      return this.activityInfo.global_intro.sub_topic;
    },

    /**
     * Returns the title from activityInfo
     * @return {string}
     */
    title() {
      return this.activityInfo.global_intro.title || '';  // Can fall back to title if present in global_intro
    },

    /**
     * Returns the reference from activityInfo
     * @return {Array<Reference>}
     */
    reference() {
      return this.activityInfo.reference;
    },

    /**
     * Returns the quick_checks from activityInfo
     * @return {Array<QuickCheck>}
     */
    quick_checks() {
      return this.activityInfo.quick_checks;
    },

    /**
     * Returns the diagnostic from activityInfo
     * @return {Diagnostic}
     */
    diagnostic() {
      return this.activityInfo.diagnostic;
    },
  },

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
        direction_line_audio: '',
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
        global_intro: parsedActivityInfo.global_intro || {
          topic: '',
          sub_topic: '',
        },
        diagnostic: parsedActivityInfo.diagnostic || this.createDefaultDiagnostic(),
        quick_checks: parsedActivityInfo.quick_checks || [],
        reference: parsedActivityInfo.reference || [],  // Store video and other references here
      };
    },

    /**
     * Initialize the store with activity information and build screens
     */
    async initialize() {
      try {
        const activityInfoElement = await this.getActivityInfo();
        if (!activityInfoElement) {
          return;
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
        console.error('Failed to initialize store:', error);
      }
    },

    /**
     * Initialize the store with activity information and build screens
     */
    async init() {
      return this.initialize();
    },

    /**
     * Reset the store to its initial state
     */
    reset() {
      this.isInitialized = false;
      this.activityInfo = {
        global_intro: {
          topic: '',
          sub_topic: '',
        },
        diagnostic: {
          dl: '',
          direction_line_audio: '',
          failure_message: '',
          items: [],
          language: '',
          number_of_questions: '',
          threshold: '',
        },
        quick_checks: [],
        reference: [],  // Video references are now here
      };
      this.sequencer = new Sequencer();
    },
  },
});
