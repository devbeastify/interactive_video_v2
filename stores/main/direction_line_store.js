// @ts-check

import { defineStore } from 'pinia';
import { DirectionLine } from './direction_line';
import { AudioService } from '../../lib/audio_service';

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
    isPlaying: (state) => state.isDirectionLinePlaying || state.isQuickCheckDirectionLinePlaying,
    currentLine: (state) => state.currentDirectionLine,
    quickCheckLine: (state) => state.quickCheckDirectionLine,
  },

  actions: {
    /**
     * @param {DirectionLine} directionLine
     */
    setCurrentDirectionLine(directionLine) {
      this.currentDirectionLine = directionLine;
    },

    /**
     * @param {DirectionLine} directionLine
     */
    setQuickCheckDirectionLine(directionLine) {
      this.quickCheckDirectionLine = directionLine;
    },

    clearCurrentDirectionLine() {
      this.currentDirectionLine = null;
      this.isDirectionLinePlaying = false;
    },

    clearQuickCheckDirectionLine() {
      this.quickCheckDirectionLine = null;
      this.isQuickCheckDirectionLinePlaying = false;
    },

    startDirectionLineAudio() {
      if (!this.currentDirectionLine) {
        console.warn('No current direction line to start audio');
        return;
      }

      console.log('Starting direction line audio for:', this.currentDirectionLine.text);
      this.isDirectionLinePlaying = true;
      
      // Set up timer for autoplay after 500ms
      this.directionLineTimer = /** @type {number} */ (/** @type {unknown} */ (setTimeout(() => {
        if (this.currentDirectionLine && this.currentDirectionLine.isNew) {
          console.log('Timer triggered, playing direction line audio');
          this.playDirectionLineAudio();
        } else {
          console.warn('Timer triggered but direction line is not new or missing');
        }
      }, 500)));
    },

    startQuickCheckDirectionLineAudio() {
      if (!this.quickCheckDirectionLine) {
        console.warn('No quick check direction line to start audio');
        return;
      }

      console.log('Starting quick check direction line audio for:', this.quickCheckDirectionLine.text);
      this.isQuickCheckDirectionLinePlaying = true;
      
      // Set up timer for autoplay after 500ms
      this.quickCheckDirectionLineTimer = /** @type {number} */ (/** @type {unknown} */ (setTimeout(() => {
        if (this.quickCheckDirectionLine && this.quickCheckDirectionLine.isNew) {
          console.log('Timer triggered, playing quick check direction line audio');
          this.playQuickCheckDirectionLineAudio();
        } else {
          console.warn('Timer triggered but quick check direction line is not new or missing');
        }
      }, 500)));
    },

    async playDirectionLineAudio() {
      if (!this.currentDirectionLine) return;

      console.log('Playing direction line audio for:', this.currentDirectionLine.text);
      
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

    async playQuickCheckDirectionLineAudio() {
      if (!this.quickCheckDirectionLine) return;

      console.log('Playing quick check direction line audio for:', this.quickCheckDirectionLine.text);
      
      try {
        // Try to generate audio if needed
        const audioAvailable = await this.quickCheckDirectionLine.generateAudioIfNeeded();
        
        if (audioAvailable && this.quickCheckDirectionLine.audioPath) {
          // Play audio file
          await this._playQuickCheckAudioFile();
        } else {
          // Fallback to TTS
          await this._playQuickCheckTTS();
        }
      } catch (error) {
        console.error('Error playing quick check direction line audio:', error);
        // Fallback to TTS
        await this._playQuickCheckTTS();
      }
    },

    /**
     * Play audio for a specific direction line (used by component)
     * @param {DirectionLine} directionLine
     */
    async playAudioForDirectionLine(/** @type {DirectionLine} */ directionLine) {
      if (!directionLine) return;

      console.log('Playing audio for direction line:', directionLine.text);
      
      try {
        // Try to generate audio if needed
        const audioAvailable = await directionLine.generateAudioIfNeeded();
        
        if (audioAvailable && directionLine.audioPath) {
          // Play audio file
          await this._playAudioFileForDirectionLine(directionLine);
        } else {
          // Fallback to TTS
          await this._playTTSForDirectionLine(directionLine);
        }
      } catch (error) {
        console.error('Error playing direction line audio:', error);
        // Fallback to TTS
        await this._playTTSForDirectionLine(directionLine);
      }
    },

    async _playAudioFile() {
      if (!this.currentDirectionLine?.audioPath) return;

      console.log('Playing audio file:', this.currentDirectionLine.audioPath);
      
      await AudioService.playAudioFile(this.currentDirectionLine.audioPath, {
        onStart: () => {
          console.log('Audio file started playing');
          this.isDirectionLinePlaying = true;
        },
        onEnd: () => {
          console.log('Audio file finished playing');
          this.isDirectionLinePlaying = false;
        },
        onError: () => {
          console.log('Audio file error');
          this.isDirectionLinePlaying = false;
        },
      });
    },

    async _playTTS() {
      if (!this.currentDirectionLine?.text) {
        console.warn('TTS not available or no text to speak');
        this.isDirectionLinePlaying = false;
        return;
      }

      console.log('Playing TTS for text:', this.currentDirectionLine.text);
      
      await AudioService.playTTS(
        this.currentDirectionLine.text,
        this.currentDirectionLine.languageCode || 'en',
        {
          onStart: () => {
            console.log('TTS started playing');
            this.isDirectionLinePlaying = true;
          },
          onEnd: () => {
            console.log('TTS finished playing');
            this.isDirectionLinePlaying = false;
          },
          onError: () => {
            console.log('TTS error');
            this.isDirectionLinePlaying = false;
          },
        }
      );
    },

    async _playAudioFileForDirectionLine(/** @type {DirectionLine} */ directionLine) {
      if (!directionLine?.audioPath) return;

      console.log('Playing audio file:', directionLine.audioPath);
      
      await AudioService.playAudioFile(directionLine.audioPath, {
        onStart: () => {
          console.log('Audio file started playing');
          this.isDirectionLinePlaying = true;
        },
        onEnd: () => {
          console.log('Audio file finished playing');
          this.isDirectionLinePlaying = false;
        },
        onError: () => {
          console.log('Audio file error');
          this.isDirectionLinePlaying = false;
        },
      });
    },

    async _playTTSForDirectionLine(/** @type {DirectionLine} */ directionLine) {
      if (!directionLine?.text) {
        console.warn('TTS not available or no text to speak');
        this.isDirectionLinePlaying = false;
        return;
      }

      console.log('Playing TTS for text:', directionLine.text);
      
      await AudioService.playTTS(
        directionLine.text,
        directionLine.languageCode || 'en',
        {
          onStart: () => {
            console.log('TTS started playing');
            this.isDirectionLinePlaying = true;
          },
          onEnd: () => {
            console.log('TTS finished playing');
            this.isDirectionLinePlaying = false;
          },
          onError: () => {
            console.log('TTS error');
            this.isDirectionLinePlaying = false;
          },
        }
      );
    },

    async _playQuickCheckAudioFile() {
      if (!this.quickCheckDirectionLine?.audioPath) return;

      console.log('Playing quick check audio file:', this.quickCheckDirectionLine.audioPath);
      
      await AudioService.playAudioFile(this.quickCheckDirectionLine.audioPath, {
        onStart: () => {
          console.log('Quick check audio file started playing');
          this.isQuickCheckDirectionLinePlaying = true;
        },
        onEnd: () => {
          console.log('Quick check audio file finished playing');
          this.isQuickCheckDirectionLinePlaying = false;
        },
        onError: () => {
          console.log('Quick check audio file error');
          this.isQuickCheckDirectionLinePlaying = false;
        },
      });
    },

    async _playQuickCheckTTS() {
      if (!this.quickCheckDirectionLine?.text) {
        console.warn('TTS not available or no text to speak for quick check');
        this.isQuickCheckDirectionLinePlaying = false;
        return;
      }

      console.log('Playing TTS for quick check text:', this.quickCheckDirectionLine.text);
      
      await AudioService.playTTS(
        this.quickCheckDirectionLine.text,
        this.quickCheckDirectionLine.languageCode || 'en',
        {
          onStart: () => {
            console.log('Quick check TTS started playing');
            this.isQuickCheckDirectionLinePlaying = true;
          },
          onEnd: () => {
            console.log('Quick check TTS finished playing');
            this.isQuickCheckDirectionLinePlaying = false;
          },
          onError: () => {
            console.log('Quick check TTS error');
            this.isQuickCheckDirectionLinePlaying = false;
          },
        }
      );
    },

    stopDirectionLineAudio() {
      this.isDirectionLinePlaying = false;
      
      // Clear any existing timer
      if (this.directionLineTimer) {
        clearTimeout(this.directionLineTimer);
        this.directionLineTimer = null;
      }

      // Stop any ongoing speech synthesis
      AudioService.stopAudio();
    },

    stopQuickCheckDirectionLineAudio() {
      this.isQuickCheckDirectionLinePlaying = false;
      
      // Clear any existing timer
      if (this.quickCheckDirectionLineTimer) {
        clearTimeout(this.quickCheckDirectionLineTimer);
        this.quickCheckDirectionLineTimer = null;
      }

      // Stop any ongoing speech synthesis
      AudioService.stopAudio();
    },

    cleanupDirectionLine() {
      this.stopDirectionLineAudio();
      this.stopQuickCheckDirectionLineAudio();
      this.clearCurrentDirectionLine();
      this.clearQuickCheckDirectionLine();
    },

    /**
     * @param {string} stepType
     * @param {string} directionLineText
     * @param {string} languageCode
     */
    initializeDirectionLineForStep(stepType, directionLineText, languageCode = 'en') {
      console.log('Initializing direction line for step:', stepType, 'Text:', directionLineText, 'Language:', languageCode);
      
      if (directionLineText && directionLineText.trim()) {
        const directionLine = new DirectionLine({
          stepId: stepType,
          text: directionLineText,
          languageCode: languageCode,
          stepType: stepType,
          isNew: true,
        });
        
        this.setCurrentDirectionLine(directionLine);
        this.startDirectionLineAudio();
        console.log('Direction line initialized and audio started for:', stepType);
      } else {
        console.warn('No direction line text provided for step:', stepType);
      }
    },
  },
}); 