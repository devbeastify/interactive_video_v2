// @ts-check

import { defineStore } from 'pinia';
import { DirectionLine } from './direction_line';
import { AudioService } from '../../lib/audio_service';

/**
 * @typedef {Object} AudioCallbacks
 * @property {() => void} onStart
 * @property {() => void} onEnd
 * @property {() => void} onError
 */

export const useDirectionLineStore = defineStore('directionLine', {
  state: () => ({
    /** @type {DirectionLine|null} */
    currentDirectionLine: null,
    /** @type {DirectionLine|null} */
    quickCheckDirectionLine: null,
    isDirectionLinePlaying: false,
    isQuickCheckDirectionLinePlaying: false,
    /** @type {number|null} */
    directionLineTimer: null,
    /** @type {number|null} */
    quickCheckDirectionLineTimer: null,
  }),

  getters: {
    isPlaying: (state) =>
      state.isDirectionLinePlaying || state.isQuickCheckDirectionLinePlaying,
    currentLine: (state) => state.currentDirectionLine,
    quickCheckLine: (state) => state.quickCheckDirectionLine,
  },

  actions: {
    /**
     * Sets the current direction line
     * @param {DirectionLine} directionLine
     */
    setCurrentDirectionLine(directionLine) {
      this.currentDirectionLine = directionLine;
    },

    /**
     * Sets the quick check direction line
     * @param {DirectionLine} directionLine
     */
    setQuickCheckDirectionLine(directionLine) {
      this.quickCheckDirectionLine = directionLine;
    },

    /**
     * Clears the current direction line and stops audio
     */
    clearCurrentDirectionLine() {
      this.currentDirectionLine = null;
      this.isDirectionLinePlaying = false;
    },

    /**
     * Clears the quick check direction line and stops audio
     */
    clearQuickCheckDirectionLine() {
      this.quickCheckDirectionLine = null;
      this.isQuickCheckDirectionLinePlaying = false;
    },

    /**
     * Starts audio for the current direction line with a delay
     */
    startDirectionLineAudio() {
      if (!this.currentDirectionLine) {
        console.warn('No current direction line to start audio');
        return;
      }

      console.log('Starting direction line audio for:',
        this.currentDirectionLine.text);
      this.isDirectionLinePlaying = true;

      this.directionLineTimer = setTimeout(() => {
        this._handleDirectionLineTimer();
      }, 500);
    },

    /**
     * Starts audio for the quick check direction line with a delay
     */
    startQuickCheckDirectionLineAudio() {
      if (!this.quickCheckDirectionLine) {
        console.warn('No quick check direction line to start audio');
        return;
      }

      console.log('Starting quick check direction line audio for:',
        this.quickCheckDirectionLine.text);
      this.isQuickCheckDirectionLinePlaying = true;

      this.quickCheckDirectionLineTimer = setTimeout(() => {
        this._handleQuickCheckDirectionLineTimer();
      }, 500);
    },

    /**
     * Handles timer callback for direction line audio
     */
    _handleDirectionLineTimer() {
      if (this.currentDirectionLine && this.currentDirectionLine.isNew) {
        console.log('Timer triggered, playing direction line audio');
        this.playDirectionLineAudio();
      } else {
        console.warn('Timer triggered but direction line is not new or missing');
      }
    },

    /**
     * Handles timer callback for quick check direction line audio
     */
    _handleQuickCheckDirectionLineTimer() {
      if (this.quickCheckDirectionLine && this.quickCheckDirectionLine.isNew) {
        console.log('Timer triggered, playing quick check direction line audio');
        this.playQuickCheckDirectionLineAudio();
      } else {
        console.warn('Timer triggered but quick check direction line is not new or missing');
      }
    },

    /**
     * Plays audio for the current direction line
     */
    async playDirectionLineAudio() {
      if (!this.currentDirectionLine) return;

      console.log('Playing direction line audio for:',
        this.currentDirectionLine.text);

      await this._playAudioForDirectionLine(this.currentDirectionLine, false);
    },

    /**
     * Plays audio for the quick check direction line
     */
    async playQuickCheckDirectionLineAudio() {
      if (!this.quickCheckDirectionLine) return;

      console.log('Playing quick check direction line audio for:',
        this.quickCheckDirectionLine.text);

      await this._playAudioForDirectionLine(this.quickCheckDirectionLine, true);
    },

    /**
     * Play audio for a specific direction line (used by component)
     * @param {DirectionLine} directionLine
     */
    async playAudioForDirectionLine(directionLine) {
      if (!directionLine) return;

      console.log('Playing audio for direction line:', directionLine.text);

      await this._playAudioForDirectionLine(directionLine, false);
    },

    /**
     * Generic method to play audio for any direction line
     * @param {DirectionLine} directionLine
     * @param {boolean} isQuickCheck
     */
    async _playAudioForDirectionLine(directionLine, isQuickCheck = false) {
      try {
        const audioAvailable = await directionLine.generateAudioIfNeeded();

        if (audioAvailable && directionLine.audioPath) {
          await this._playAudioFile(directionLine, isQuickCheck);
        } else {
          await this._playTTS(directionLine, isQuickCheck);
        }
      } catch (error) {
        console.error('Error playing direction line audio:', error);
        await this._playTTS(directionLine, isQuickCheck);
      }
    },

    /**
     * Plays audio file for a direction line
     * @param {DirectionLine} directionLine
     * @param {boolean} isQuickCheck
     */
    async _playAudioFile(directionLine, isQuickCheck = false) {
      if (!directionLine?.audioPath) return;

      console.log('Playing audio file:', directionLine.audioPath);

      const callbacks = this._createAudioCallbacks(isQuickCheck);
      await AudioService.playAudioFile(directionLine.audioPath, callbacks);
    },

    /**
     * Plays TTS for a direction line
     * @param {DirectionLine} directionLine
     * @param {boolean} isQuickCheck
     */
    async _playTTS(directionLine, isQuickCheck = false) {
      if (!directionLine?.text) {
        console.warn('TTS not available or no text to speak');
        this._setPlayingState(false, isQuickCheck);
        return;
      }

      console.log('Playing TTS for text:', directionLine.text);

      const callbacks = this._createAudioCallbacks(isQuickCheck);
      await AudioService.playTTS(
        directionLine.text,
        directionLine.languageCode || 'en',
        callbacks
      );
    },

    /**
     * Creates audio callbacks for playing state management
     * @param {boolean} isQuickCheck
     * @return {AudioCallbacks}
     */
    _createAudioCallbacks(isQuickCheck) {
      const prefix = isQuickCheck ? 'Quick check ' : '';

      return {
        onStart: () => {
          console.log(`${prefix}audio started playing`);
          this._setPlayingState(true, isQuickCheck);
        },
        onEnd: () => {
          console.log(`${prefix}audio finished playing`);
          this._setPlayingState(false, isQuickCheck);
        },
        onError: () => {
          console.log(`${prefix}audio error`);
          this._setPlayingState(false, isQuickCheck);
        },
      };
    },

    /**
     * Sets the playing state for the appropriate direction line type
     * @param {boolean} isPlaying
     * @param {boolean} isQuickCheck
     */
    _setPlayingState(isPlaying, isQuickCheck) {
      if (isQuickCheck) {
        this.isQuickCheckDirectionLinePlaying = isPlaying;
      } else {
        this.isDirectionLinePlaying = isPlaying;
      }
    },

    /**
     * Stops direction line audio and clears timer
     */
    stopDirectionLineAudio() {
      this.isDirectionLinePlaying = false;
      this._clearTimer('directionLineTimer');
      AudioService.stopAudio();
    },

    /**
     * Stops quick check direction line audio and clears timer
     */
    stopQuickCheckDirectionLineAudio() {
      this.isQuickCheckDirectionLinePlaying = false;
      this._clearTimer('quickCheckDirectionLineTimer');
      AudioService.stopAudio();
    },

    /**
     * Clears a timer by property name
     * @param {string} timerProperty
     */
    _clearTimer(timerProperty) {
      if (this[timerProperty]) {
        clearTimeout(this[timerProperty]);
        this[timerProperty] = null;
      }
    },

    /**
     * Cleans up all direction line audio and state
     */
    cleanupDirectionLine() {
      this.stopDirectionLineAudio();
      this.stopQuickCheckDirectionLineAudio();
      this.clearCurrentDirectionLine();
      this.clearQuickCheckDirectionLine();
    },

    /**
     * Initializes a direction line for a specific step
     * @param {string} stepType
     * @param {string} directionLineText
     * @param {string} languageCode
     */
    initializeDirectionLineForStep(stepType, directionLineText,
      languageCode = 'en') {
      console.log('Initializing direction line for step:', stepType,
        'Text:', directionLineText, 'Language:', languageCode);

      if (this._isValidDirectionLineText(directionLineText)) {
        const directionLine = this._createDirectionLine(stepType,
          directionLineText, languageCode);

        this.setCurrentDirectionLine(directionLine);
        this.startDirectionLineAudio();
        console.log('Direction line initialized and audio started for:', stepType);
      } else {
        console.warn('No direction line text provided for step:', stepType);
      }
    },

    /**
     * Validates direction line text
     * @param {string} text
     * @return {boolean}
     */
    _isValidDirectionLineText(text) {
      return typeof text === 'string' && text.trim().length > 0;
    },

    /**
     * Creates a new direction line instance
     * @param {string} stepType
     * @param {string} directionLineText
     * @param {string} languageCode
     * @return {DirectionLine}
     */
    _createDirectionLine(stepType, directionLineText, languageCode) {
      return new DirectionLine({
        stepId: stepType,
        text: directionLineText,
        languageCode: languageCode,
        stepType: stepType,
        isNew: true,
      });
    },
  },
});
