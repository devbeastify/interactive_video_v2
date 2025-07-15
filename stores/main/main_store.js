// @ts-check

import { defineStore } from 'pinia';
import { Sequencer } from '../../lib/sequencer';
import { buildScreensForActivity } from '../../lib/screens';
import { getActivityInfo, parseActivityInfo } from './activity_info';
import { useDirectionLineStore } from './direction_line_store';
import { useActivitySettingsStore } from './activity_settings_store';

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
 * @typedef DiagnosticData
 * @property {string} dl - Direction line text
 * @property {string} failure_message
 * @property {Array<Object>} items
 * @property {string} language
 * @property {string} number_of_questions
 * @property {string} threshold
 */

/**
 * @typedef ReferenceItem
 * @property {string} type
 * @property {string} value
 * @property {Object} metadata
 */

/**
 * @typedef QuickCheckItem
 * @property {string} type
 * @property {Object} content
 * @property {Object} configuration
 */

/**
 * @typedef ActivityInfo
 * @property {string} topic
 * @property {string} sub_topic
 * @property {string} title
 * @property {string} dl - Main direction line
 * @property {Array<ReferenceItem>} reference
 * @property {Array<QuickCheckItem>} quick_checks
 * @property {DiagnosticData} diagnostic
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

  getters: {
    /**
     * Get direction line text for a specific step type
     * @param {MainStoreState} state - The store state
     * @return {function(string): string} Function that takes stepType and returns
     * direction line text
     */
    getDirectionLineForStep: (state) => (stepType) => {
      switch (stepType) {
      case 'intro':
        return state.activityInfo.dl || '';
      case 'player':
        return state.activityInfo.dl || '';
      case 'quick_check':
        return '';
      case 'diagnostic': {
        const diagnosticDL = state.activityInfo.diagnostic?.dl || '';
        return diagnosticDL;
      }
      default:
        return state.activityInfo.dl || '';
      }
    },

    /**
     * Check if direction lines are available for any step
     * @param {MainStoreState} state - The store state
     * @return {boolean} True if direction lines are available
     */
    hasDirectionLines: (state) => {
      return Boolean(
        state.activityInfo.dl ||
        state.activityInfo.diagnostic?.dl
      );
    },
  },

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
        .then((/** @type {ActivityInfo} */ activityInfo) => {
          this.activityInfo = activityInfo;
          const screens = buildScreensForActivity(activityInfo);
          this.sequencer.addScreen(screens);
          this.sequencer.goToScreen('intro');
        })
        .catch((error) => console.error(error));

      const activitySettingsStore = useActivitySettingsStore();
      if (!activitySettingsStore.isInitialized) {
        activitySettingsStore.init();
      }

      this.isInitialized = true;
    },

    /**
     * Initialize direction line for a specific step type
     * @param {string} stepType - The step type to initialize direction line for
     */
    initializeDirectionLineForStep(stepType) {
      const directionLineStore = useDirectionLineStore();
      const directionLineText = this.getDirectionLineForStep(stepType);
      const languageCode = this._getLanguageCodeForStep(stepType);

      directionLineStore.initializeDirectionLineForStep(
        stepType,
        directionLineText,
        languageCode
      );
    },

    /**
     * Get language code for a specific step type
     * @private
     * @param {string} stepType - The step type
     * @return {string} Language code
     */
    _getLanguageCodeForStep(stepType) {
      switch (stepType) {
      case 'diagnostic':
        return this.activityInfo.diagnostic?.language || 'en';
      case 'quick_check':
        return 'en';
      default:
        return 'en';
      }
    },
  },
});
