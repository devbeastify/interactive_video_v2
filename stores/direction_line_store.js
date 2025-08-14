// @ts-check

import { defineStore } from 'pinia';
import { AudioService } from '../lib/audio_service.js';
import { eventDispatcher, DL_EVENTS } from '../lib/event_dispatcher.js';
import { useActionStore } from './action_store';
import { mainStore } from './main_store';
/**
 * @typedef DLItem
 * @property {string} dl - Direction line text
 * @property {string} [audio_path] - Path to audio file
 * @property {string} [language] - Language code
 */

/**
 * @typedef ReferenceItem
 * @property {string} [dl] - Direction line text (optional)
 * @property {string} [audio_path] - Path to audio file (optional)
 * @property {string} [language] - Language code (optional)
 * @property {string} [video_path] - Path to video file (optional)
 */

/**
 * @typedef QuickCheckItem
 * @property {string} [dl] - Direction line text (optional)
 * @property {string} type - Type of quick check
 */

/**
 * @typedef DiagnosticItem
 * @property {string} [dl] - Direction line text (optional)
 * @property {string} [language] - Language code (optional)
 */

/**
 * @typedef DLState
 * @property {string} currentDLText - Current DL text
 * @property {string} currentAudioPath - Current audio path
 * @property {string} currentLanguage - Current language code
 * @property {boolean} isPlaying - Whether DL is currently playing
 * @property {boolean} isAutoPlay - Whether DL should auto-play
 * @property {boolean} isInitialized - Whether DL system is initialized
 */

/**
 * @typedef VideoActionData
 * @property {string} dl - Direction line text
 * @property {string} [audio_path] - Path to audio file
 * @property {string} [language] - Language code
 */

/**
 * @typedef QuickCheckActionData
 * @property {Object} quick_check_content - Quick check content
 * @property {string} quick_check_content.dl - Direction line text
 * @property {string} [quick_check_content.direction_line_audio] - Path to audio file
 */

/**
 * @typedef Action
 * @property {string} type - Either 'video' or 'quick_check'
 * @property {Object} data - The action data
 * @property {number} index - The action index
 */

export const useDLStore = defineStore('dl', {
  state: () => ({
    /** @type {string} */
    currentDLText: '',
    /** @type {string} */
    currentAudioPath: '',
    /** @type {string} */
    currentLanguage: 'en',
    /** @type {boolean} */
    isPlaying: false,
    /** @type {boolean} */
    isAutoPlay: true,
    /** @type {boolean} */
    isInitialized: false,
    /** @type {string} */
    currentPhase: '',
  }),

  getters: {
    /**
     * Check if there's a DL available
     * @param {DLState} state - The store state
     * @return {boolean} True if DL is available
     */
    hasDL: (state) => {
      return Boolean(state.currentDLText && state.currentDLText.trim());
    },

    /**
     * Get the main store instance
     * @return {ReturnType<typeof mainStore>} The main store instance
     */
    mainStore: () => mainStore(),
  },

  actions: {
    /**
     * Initialize DL for a specific phase
     * @param {string} phaseType - The phase type (quick_check, diagnostic)
     */
    initializeDLForPhase(phaseType) {
      this.currentPhase = phaseType;
      this.isInitialized = true;

      this._removeEventListeners();

      const dlItem = this._getDLsForPhase(phaseType);
      this._setCurrentDL(dlItem);
      this._setUpEventListeners();
    },

    /**
     * Set up event listeners for dispatch events
     */
    _setUpEventListeners() {
      eventDispatcher.on(DL_EVENTS.PLAY, () => {
        this.playDL();
      });

      eventDispatcher.on(DL_EVENTS.PAUSE, () => {
        this.pauseDL();
      });
    },

    /**
     * Remove event listeners
     */
    _removeEventListeners() {
      eventDispatcher.off(DL_EVENTS.PLAY, this.playDL);
      eventDispatcher.off(DL_EVENTS.PAUSE, this.pauseDL);
    },

    /**
     * Get DLs for a specific phase based on the algorithm
     * @param {string} phaseType - The phase type
     * @return {DLItem|null} DL item or null if not found
     */
    _getDLsForPhase(phaseType) {
      const actionStore = useActionStore();
      const currentAction = actionStore.currentAction;

      switch (phaseType) {
      case 'quick_check':
        return this._getQuickCheckDL(currentAction);

      case 'diagnostic':
        return this._getDiagnosticDL();

      default:
        return null;
      }
    },

    /**
     * Get quick check DL
     * @param {Action|null} currentAction - The current action
     * @return {DLItem|null} DL item or null if not found
     */
    _getQuickCheckDL(currentAction) {
      if (currentAction && currentAction.type === 'quick_check') {
        const currentQC = /** @type {QuickCheckActionData} */ (currentAction.data);
        if (currentQC && currentQC.quick_check_content.dl &&
            currentQC.quick_check_content.dl.trim()) {
          return {
            dl: currentQC.quick_check_content.dl,
            audio_path: currentQC.quick_check_content.direction_line_audio || '',
            language: 'en',
          };
        }
      }
      return null;
    },

    /**
     * Get diagnostic DL
     * @return {DLItem|null} DL item or null if not found
     */
    _getDiagnosticDL() {
      if (this.mainStore.activityInfo.diagnostic && this.mainStore.activityInfo.diagnostic.dl &&
          this.mainStore.activityInfo.diagnostic.dl.trim()) {
        return {
          dl: this.mainStore.activityInfo.diagnostic.dl,
          audio_path: this.mainStore.activityInfo.diagnostic.direction_line_audio || '',
          language: this.mainStore.activityInfo.diagnostic.language || 'en',
        };
      }
      return null;
    },

    /**
     * Set current DL
     * @param {DLItem|null} dlItem - The DL item to set
     */
    _setCurrentDL(dlItem) {
      if (dlItem) {
        this.currentDLText = dlItem.dl;
        this.currentAudioPath = dlItem.audio_path || '';
        this.currentLanguage = dlItem.language || 'en';
      } else {
        this.currentDLText = '';
        this.currentAudioPath = '';
        this.currentLanguage = 'en';
      }
    },

    /**
     * Play DL audio using AudioService
     * @return {Promise<void>}
     */
    async playDL() {
      if (!this.hasDL || this.isPlaying) {
        return;
      }

      this.isPlaying = true;
      eventDispatcher.dispatch(DL_EVENTS.STARTED);

      try {
        await AudioService.playDL({
          text: this.currentDLText,
          audioPath: this.currentAudioPath,
          languageCode: this.currentLanguage,
          onStart: () => {
            this.isPlaying = true;
          },
          onEnd: () => {
            this.isPlaying = false;
            eventDispatcher.dispatch(DL_EVENTS.COMPLETED);
          },
          onError: (error) => {
            this.isPlaying = false;
            eventDispatcher.dispatch(DL_EVENTS.ERROR, error);
          },
        });
      } catch (error) {
        this.isPlaying = false;
        eventDispatcher.dispatch(DL_EVENTS.ERROR, error);
      }
    },

    /**
     * Pause DL audio
     */
    pauseDL() {
      this.isPlaying = false;
      AudioService.stopAudio();
      eventDispatcher.dispatch(DL_EVENTS.PAUSED);
    },

    /**
     * Reset DL state
     */
    reset() {
      this.currentDLText = '';
      this.currentAudioPath = '';
      this.currentLanguage = 'en';
      this.isPlaying = false;
    },

    /**
     * Cleanup DL resources
     */
    cleanup() {
      this.pauseDL();
      this.reset();
      this.isInitialized = false;
      this._removeEventListeners();
    },
  },
});