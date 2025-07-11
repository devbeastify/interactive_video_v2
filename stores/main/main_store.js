// @ts-check

import { defineStore } from 'pinia';
import { browserIsSafari } from '../../lib/safari_browser_check';
import { Sequencer } from '../../lib/sequencer';
import { buildScreensForActivity } from '../../lib/screens';
import { getActivityInfo, parseActivityInfo } from './activity_info';
import { DirectionLine } from './direction_line';

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
 * @property {DirectionLine|null} currentDirectionLine
 * @property {boolean} isDirectionLinePlaying
 * @property {number|null} directionLineTimer
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
    /** @type {DirectionLine|null} */
    currentDirectionLine: null,
    isDirectionLinePlaying: false,
    /** @type {number|null} */
    directionLineTimer: null,
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

    /**
     * Set the current direction line for the active step
     * @param {DirectionLine} directionLine
     */
    setCurrentDirectionLine(directionLine) {
      this.currentDirectionLine = directionLine;
    },

    /**
     * Clear the current direction line
     */
    clearCurrentDirectionLine() {
      this.currentDirectionLine = null;
      this.isDirectionLinePlaying = false;
    },

    /**
     * Start direction line audio playback
     */
    startDirectionLineAudio() {
      if (!this.currentDirectionLine) return;

      this.isDirectionLinePlaying = true;
      
      // Set up timer for autoplay after 500ms
      this.directionLineTimer = /** @type {number} */ (/** @type {unknown} */ (setTimeout(() => {
        if (this.currentDirectionLine && this.currentDirectionLine.isNew) {
          this.playDirectionLineAudio();
        }
      }, 500)));
    },

    /**
     * Play direction line audio
     */
    async playDirectionLineAudio() {
      if (!this.currentDirectionLine) return;

      try {
        // Try to generate audio if needed
        const audioAvailable = await this.currentDirectionLine.generateAudioIfNeeded();
        
        if (audioAvailable && this.currentDirectionLine.audioPath) {
          // Play audio file
          await this._playAudioFile();
        } else {
          // Fallback to TTS
          await this._playTTS();
        }
      } catch (error) {
        console.error('Error playing direction line audio:', error);
        // Fallback to TTS
        await this._playTTS();
      }
    },

    /**
     * Play audio file from URL
     * @private
     * @return {Promise<void>}
     */
    async _playAudioFile() {
      if (!this.currentDirectionLine?.audioPath) return;

      return new Promise((resolve, reject) => {
        const audio = new Audio(this.currentDirectionLine.audioPath);

        audio.addEventListener('ended', () => {
          this.isDirectionLinePlaying = false;
          resolve();
        }, { once: true });

        audio.addEventListener('error', (error) => {
          console.error('Audio file error:', error);
          this.isDirectionLinePlaying = false;
          reject(error);
        }, { once: true });

        if (audio.readyState >= 4) {
          audio.play()
            .then(() => {
              this.isDirectionLinePlaying = true;
            })
            .catch(reject);
        } else {
          audio.addEventListener('canplaythrough', () => {
            audio.play()
              .then(() => {
                this.isDirectionLinePlaying = true;
              })
              .catch(reject);
          }, { once: true });
        }
      });
    },

    /**
     * Play audio using TTS
     * @private
     * @return {Promise<void>}
     */
    async _playTTS() {
      if (!this.currentDirectionLine?.text || !('speechSynthesis' in window)) {
        console.warn('TTS not available or no text to speak');
        this.isDirectionLinePlaying = false;
        return;
      }

      return new Promise((resolve) => {
        // Extract text content from HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = this.currentDirectionLine.text;
        const textContent = tempDiv.textContent || tempDiv.innerText || '';

        if (!textContent.trim()) {
          console.warn('No text content to speak');
          this.isDirectionLinePlaying = false;
          resolve();
          return;
        }

        console.log('Using TTS to speak:', textContent);

        const utterance = new SpeechSynthesisUtterance(textContent);
        utterance.lang = this.currentDirectionLine.languageCode || 'en';
        utterance.rate = 0.9;
        utterance.pitch = 1;

        utterance.onstart = () => {
          console.log('TTS started');
          this.isDirectionLinePlaying = true;
        };

        utterance.onend = () => {
          console.log('TTS ended');
          this.isDirectionLinePlaying = false;
          resolve();
        };

        utterance.onerror = (event) => {
          console.error('TTS error:', event.error);
          this.isDirectionLinePlaying = false;
          resolve();
        };

        // Cancel any existing speech before starting new one
        speechSynthesis.cancel();
        speechSynthesis.speak(utterance);
      });
    },

    /**
     * Stop direction line audio playback
     */
    stopDirectionLineAudio() {
      this.isDirectionLinePlaying = false;
      
      // Clear any existing timer
      if (this.directionLineTimer) {
        clearTimeout(this.directionLineTimer);
        this.directionLineTimer = null;
      }

      // Stop any ongoing speech synthesis
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
    },

    /**
     * Clean up direction line resources when navigating away
     */
    cleanupDirectionLine() {
      this.stopDirectionLineAudio();
      this.clearCurrentDirectionLine();
    },
  },
});
