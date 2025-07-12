// @ts-check

import { defineStore } from 'pinia';
import { DirectionLine } from './direction_line';
import { AudioService } from '../../lib/audio_service';

export const useDirectionLineStore = defineStore('directionLine', {
  state: () => ({
    /** @type {DirectionLine|null} */
    currentDirectionLine: null,
    isDirectionLinePlaying: false,
    /** @type {number|null} */
    directionLineTimer: null,
  }),

  getters: {
    isPlaying: (state) => state.isDirectionLinePlaying,
    currentLine: (state) => state.currentDirectionLine,
  },

  actions: {
    /**
     * @param {DirectionLine} directionLine
     */
    setCurrentDirectionLine(directionLine) {
      this.currentDirectionLine = directionLine;
    },

    clearCurrentDirectionLine() {
      this.currentDirectionLine = null;
      this.isDirectionLinePlaying = false;
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

    cleanupDirectionLine() {
      this.stopDirectionLineAudio();
      this.clearCurrentDirectionLine();
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