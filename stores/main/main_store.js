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
 * @typedef Reference
 * @property {string} id
 * @property {string} title
 * @property {string} url
 */

/**
 * @typedef MixedEntry
 * @property {string} type - Either 'video' or 'quick_check'
 * @property {Object} data - The entry data
 * @property {number} index - The entry index
 */

/**
 * @typedef ActivityInfo
 * @property {string} topic
 * @property {string} sub_topic
 * @property {string} title
 * @property {string} dl
 * @property {Array<Reference>} reference
 * @property {Array<QuickCheck>} quick_checks
 * @property {DiagnosticData} diagnostic
 */

/**
 * @typedef MainStoreState
 * @property {boolean} isInitialized
 * @property {ActivityInfo} activityInfo
 * @property {Sequencer} sequencer
 * @property {Array<MixedEntry>} mixedEntries
 * @property {number} currentEntryIndex
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
    /** @type {Array<MixedEntry>} */
    mixedEntries: [],
    /** @type {number} */
    currentEntryIndex: 0,
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

    /**
     * Get current entry from mixed entries
     * @param {MainStoreState} state - The store state
     * @return {Object|null} Current entry or null if not available
     */
    currentEntry: (state) => {
      return state.mixedEntries[state.currentEntryIndex] || null;
    },

    /**
     * Check if current entry is a video
     * @param {MainStoreState} state - The store state
     * @return {boolean} True if current entry is a video
     */
    isCurrentEntryVideo: (state) => {
      const entry = state.mixedEntries[state.currentEntryIndex];
      return entry && entry.type === 'video';
    },

    /**
     * Check if current entry is a quick check
     * @param {MainStoreState} state - The store state
     * @return {boolean} True if current entry is a quick check
     */
    isCurrentEntryQuickCheck: (state) => {
      const entry = state.mixedEntries[state.currentEntryIndex];
      return entry && entry.type === 'quick_check';
    },

    /**
     * Check if there are more entries after current
     * @param {MainStoreState} state - The store state
     * @return {boolean} True if there are more entries
     */
    hasNextEntry: (state) => {
      return state.currentEntryIndex < state.mixedEntries.length - 1;
    },

    /**
     * Check if we're at the last entry
     * @param {MainStoreState} state - The store state
     * @return {boolean} True if at last entry
     */
    isAtLastEntry: (state) => {
      return state.currentEntryIndex === state.mixedEntries.length - 1;
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
        .then((/** @type {any} */ activityInfo) => {
          // Ensure the activity info has the required structure
          this.activityInfo = {
            topic: activityInfo.topic || '',
            sub_topic: activityInfo.sub_topic || '',
            title: activityInfo.title || '',
            dl: activityInfo.dl || '',
            reference: activityInfo.reference || [],
            quick_checks: activityInfo.quick_checks || [],
            diagnostic: activityInfo.diagnostic || {
              dl: '',
              failure_message: '',
              items: [],
              language: '',
              number_of_questions: '',
              threshold: '',
            },
          };

          // Create mixed entries from activity data
          this.createMixedEntries();

          const screens = buildScreensForActivity(this.activityInfo);
          this.sequencer.addScreen(screens);
          this.sequencer.goToScreen('intro');
        })
        .catch((error) => {
          console.error('Error initializing store:', error);
        });

      const activitySettingsStore = useActivitySettingsStore();
      if (!activitySettingsStore.isInitialized) {
        activitySettingsStore.init();
      }

      this.isInitialized = true;
    },

    /**
     * Create mixed entries from video references and quick checks
     * This creates the sequential flow following the exact order from XML
     * Matches the Ruby backend's mixed_entries behavior
     */
    createMixedEntries() {
      const mixedEntries = [];
      let videoIndex = 0;
      let quickCheckIndex = 0;

      // Get the maximum length to handle cases where there are more videos or quick checks
      const maxLength = Math.max(
        this.activityInfo.reference.length,
        this.activityInfo.quick_checks.length
      );

      // Create mixed entries following the XML order
      // This matches the Ruby backend's each_excluding_nodes behavior
      for (let i = 0; i < maxLength; i++) {
        // Add video if available at this position
        if (this.activityInfo.reference[i]) {
          mixedEntries.push({
            type: 'video',
            data: this.activityInfo.reference[i],
            index: videoIndex++,
          });
        }

        // Add quick check if available at this position
        if (this.activityInfo.quick_checks[i]) {
          mixedEntries.push({
            type: 'quick_check',
            data: this.activityInfo.quick_checks[i],
            index: quickCheckIndex++,
          });
        }
      }

      // Handle additional quick checks beyond the video count
      // This matches the XML structure where there can be extra quick checks
      for (let i = maxLength; i < this.activityInfo.quick_checks.length; i++) {
        mixedEntries.push({
          type: 'quick_check',
          data: this.activityInfo.quick_checks[i],
          index: quickCheckIndex++,
        });
      }

      this.mixedEntries = mixedEntries;
      this.currentEntryIndex = 0;
    },

    /**
     * Go to the next entry in the sequence
     * Point 9: Quick check completion triggers next video
     * Point 10: Video completion triggers next quick check
     */
    goToNextEntry() {
      if (this.hasNextEntry) {
        this.currentEntryIndex++;
        
        // Only go to diagnostic if we've completed the last quick check
        // Don't go to diagnostic just because we reached the last entry
      } else {
        this.sequencer.goToScreen('diagnostic');
      }
    },

    /**
     * Go to a specific entry by index
     * @param {number} index - The entry index to go to
     */
    goToEntry(index) {
      if (index >= 0 && index < this.mixedEntries.length) {
        this.currentEntryIndex = index;
      }
    },

    /**
     * Reset to the first entry
     */
    resetToFirstEntry() {
      this.currentEntryIndex = 0;
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
