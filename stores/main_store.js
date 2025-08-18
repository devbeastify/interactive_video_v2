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
 * @property {string} type
 * @property {string} url
 */

/**
 * @typedef {Object} VideoReference
 * @property {string} video_path
 * @property {string|null} english_subtitles_path
 * @property {string|null} foreign_subtitles_path
 * @property {string} foreign_language
 */

/** @typedef {QuickCheck | Reference} MixedEntry */

/**
 * @typedef {Object} ActivityJson
 * @property {string} topic
 * @property {string} sub_topic
 * @property {string} title
 * @property {string} dl
 * @property {string} direction_line_audio
 * @property {Diagnostic} diagnostic
 * @property {Array<MixedEntry>} mixed_entries
 */

/**
 * @typedef {Object} ActivityInfo
 * @property {string} topic
 * @property {string} sub_topic
 * @property {string} title
 * @property {string} dl
 * @property {string} direction_line_audio
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
      dl: '',
      direction_line_audio: '',
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
      reference: [],
      sub_topic: '',
      title: '',
      topic: '',
    },
    isInitialized: false,
    sequencer: new Sequencer(),
  }),

  getters: {
    /**
     * Returns the topic from activityInfo
     * @return {string}
     */
    topic() {
      return this.activityInfo.topic;
    },

    /**
     * Returns the sub_topic from activityInfo
     * @return {string}
     */
    sub_topic() {
      return this.activityInfo.sub_topic;
    },

    /**
     * Returns the title from activityInfo
     * @return {string}
     */
    title() {
      return this.activityInfo.title;
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
     * @return {Promise<ActivityJson>}
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
     * @param {ActivityJson} parsedActivityInfo - The parsed activity information
     * @return {ActivityInfo}
     */
    mergeActivityInfoWithDefaults(parsedActivityInfo) {
      const globalIntroData = this.parseGlobalIntroData();
      const sortedEntries = sortMixedEntries(parsedActivityInfo.mixed_entries);
      return {
        dl: parsedActivityInfo.dl || '',
        direction_line_audio: parsedActivityInfo.direction_line_audio || '',
        diagnostic: parsedActivityInfo.diagnostic || this.createDefaultDiagnostic(),
        quick_checks: sortedEntries.quickChecks,
        reference: sortedEntries.references,
        sub_topic: parsedActivityInfo.sub_topic || globalIntroData.sub_topic,
        title: parsedActivityInfo.title,
        topic: parsedActivityInfo.topic || globalIntroData.topic,
      };
    },

    /**
     * Parses the global intro data from the DOM, this is pulled from a
     * different element than the activity info.  If the global info cannot be
     * found, the activity's default values will be returned.
     * @return {GlobalIntroData}
     */
    parseGlobalIntroData() {
    const globalIntroElement = document.querySelector('.js-program-global');
      /** @type {GlobalIntroData} */
      const globalIntroData = {
        topic: this.activityInfo.topic,
        sub_topic: this.activityInfo.sub_topic,
      };
      if (globalIntroElement instanceof HTMLTemplateElement) {
        const content = globalIntroElement.content?.textContent ?? '';
        const parsedGlobalIntroData = JSON.parse(content);
        globalIntroData.topic = parsedGlobalIntroData.topic;
        globalIntroData.sub_topic = parsedGlobalIntroData.sub_topic;
      }
      return globalIntroData;
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
        dl: '',
        direction_line_audio: '',
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
        reference: [],
        sub_topic: '',
        title: '',
        topic: '',
      };
      this.sequencer = new Sequencer();
    },
  },
});

/**
 * @typedef {Object} SortedEntries
 * @property {Array<Reference>} references
 * @property {Array<QuickCheck>} quickChecks
 */

/**
 * Sorts the mixed entries into references and quick checks
 * @param {Array<MixedEntry>} mixedEntries - The mixed entries to sort
 * @return {SortedEntries}
 */
function sortMixedEntries(mixedEntries) {
  /** @type {Array<Reference>} */
  const references = [];
  /** @type {Array<QuickCheck>} */
  const quickChecks = [];
  mixedEntries.forEach((entry) => {
    if (entry.type.startsWith('quick_check')) {
      quickChecks.push(/** @type {QuickCheck} */(entry));
    } else if (entry.type.startsWith('video')) {
      references.push(/** @type{Reference} */(entry));
    }
  });
  console.log('quickChecks', quickChecks);
  return {
    references,
    quickChecks,
  };
}
