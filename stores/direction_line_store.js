// @ts-check

import { defineStore } from 'pinia';
import { AudioService } from '../lib/audio_service.js';
import { eventDispatcher, DL_EVENTS } from '../lib/event_dispatcher.js';
import { useActionStore } from './action_store';

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
 * @typedef ActivityInfo
 * @property {string} topic
 * @property {string} sub_topic
 * @property {string} title
 * @property {string} [dl] - Main direction line text (optional)
 * @property {Array<ReferenceItem>} reference - Video references
 * @property {Array<QuickCheckItem>} quick_checks - Quick check items
 * @property {DiagnosticItem} diagnostic - Diagnostic data
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
    /** @type {ActivityInfo|null} */
    activityInfo: null,
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
  },

  actions: {
    /**
     * Initialize DL for a specific phase
     * @param {string} phaseType - The phase type (intro, video, quick_check, diagnostic)
     * @param {ActivityInfo} activityInfo - The activity information
     */
    initializeDLForPhase(phaseType, activityInfo) {
      this.activityInfo = activityInfo;
      this.isInitialized = true;

      const dlItem = this._getDLsForPhase(phaseType, activityInfo);
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
     * @param {ActivityInfo} activityInfo - The activity information
     * @return {DLItem|null} DL item or null if not found
     */
    _getDLsForPhase(phaseType, activityInfo) {
      const actionStore = useActionStore();
      const currentAction = actionStore.currentAction;

      switch (phaseType) {
      case 'intro':
        return this._getIntroDL(activityInfo);

      case 'video':
        return this._getVideoDL(currentAction);

      case 'quick_check':
        return this._getQuickCheckDL(currentAction);

      case 'diagnostic':
        return this._getDiagnosticDL(activityInfo);

      default:
        return null;
      }
    },

    /**
     * Get intro DL
     * @param {ActivityInfo} activityInfo - The activity information
     * @return {DLItem|null} DL item or null if not found
     */
    _getIntroDL(activityInfo) {
      if (activityInfo.dl && activityInfo.dl.trim()) {
        return {
          dl: activityInfo.dl,
          language: 'en',
        };
      }
      return null;
    },

    /**
     * Get video DL
     * @param {Action|null} currentAction - The current action
     * @return {DLItem|null} DL item or null if not found
     */
    _getVideoDL(currentAction) {
      if (currentAction && currentAction.type === 'video') {
        const currentRef = /** @type {VideoActionData} */ (currentAction.data);
        if (currentRef && currentRef.dl && currentRef.dl.trim()) {
          return {
            dl: currentRef.dl,
            audio_path: currentRef.audio_path,
            language: currentRef.language || 'en',
          };
        }
      }
      return null;
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
            language: 'en',
          };
        }
      }
      return null;
    },

    /**
     * Get diagnostic DL
     * @param {ActivityInfo} activityInfo - The activity information
     * @return {DLItem|null} DL item or null if not found
     */
    _getDiagnosticDL(activityInfo) {
      if (activityInfo.diagnostic && activityInfo.diagnostic.dl &&
          activityInfo.diagnostic.dl.trim()) {
        return {
          dl: activityInfo.diagnostic.dl,
          language: activityInfo.diagnostic.language || 'en',
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
     * Play DL audio
     * @return {Promise<void>}
     */
    async playDL() {
      if (!this.hasDL) {
        return;
      }

      this.isPlaying = true;
      eventDispatcher.dispatch(DL_EVENTS.STARTED);

      try {
        if (this.currentAudioPath) {
          await this._playAudioFile();
        } else {
          await this._playTTS();
        }
      } catch (error) {
        console.warn('DL playback failed, trying TTS fallback:', error);
        try {
          await this._playTTS();
        } catch (ttsError) {
          console.error('TTS fallback also failed:', ttsError);
          this.isPlaying = false;
          eventDispatcher.dispatch(DL_EVENTS.ERROR, ttsError);
        }
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
     * Play audio file
     * @return {Promise<void>}
     */
    async _playAudioFile() {
      return new Promise((resolve, reject) => {
        const audio = new Audio(this.currentAudioPath);

        audio.addEventListener('ended', () => {
          this.isPlaying = false;
          eventDispatcher.dispatch(DL_EVENTS.COMPLETED);
          resolve();
        }, { once: true });

        audio.addEventListener('error', (error) => {
          this.isPlaying = false;
          eventDispatcher.dispatch(DL_EVENTS.ERROR, error);
          reject(error);
        }, { once: true });

        audio.play().catch((playError) => {
          this.isPlaying = false;
          eventDispatcher.dispatch(DL_EVENTS.ERROR, playError);
          reject(playError);
        });
      });
    },

    /**
     * Play TTS
     * @return {Promise<void>}
     */
    async _playTTS() {
      return new Promise((resolve, reject) => {
        this.isPlaying = true;

        AudioService.playTTS(
          this.currentDLText,
          this.currentLanguage,
          {
            onStart: () => {
              this.isPlaying = true;
            },
            onEnd: () => {
              this.isPlaying = false;
              eventDispatcher.dispatch(DL_EVENTS.COMPLETED);
              resolve();
            },
            onError: (error) => {
              this.isPlaying = false;
              eventDispatcher.dispatch(DL_EVENTS.ERROR, error);
              reject(error);
            },
          }
        );
      });
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
      this.activityInfo = null;
      this._removeEventListeners();
    },
  },
});