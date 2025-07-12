// @ts-check

/**
 * @typedef AudioPlaybackOptions
 * @property {string} audioPath - Path to audio file
 * @property {string} text - Text for TTS fallback
 * @property {string} languageCode - Language code for TTS
 * @property {function} onStart - Callback when audio starts
 * @property {function} onEnd - Callback when audio ends
 * @property {function} onError - Callback when audio errors
 */

/**
 * Shared audio service for direction line audio playback
 * Eliminates duplicated audio logic between main_store.js and DirectionLine.vue
 */
export class AudioService {
    /**
     * Play audio file from URL
     * @param {string} audioPath - Path to audio file
     * @param {Partial<AudioPlaybackOptions>} options - Playback options
     * @return {Promise<void>}
     */
    static async playAudioFile(audioPath, options = {}) {
      return new Promise((resolve, reject) => {
        const audio = new Audio(audioPath);
  
        audio.addEventListener('ended', () => {
          options.onEnd?.();
          resolve();
        }, { once: true });
  
        audio.addEventListener('error', (error) => {
          console.error('Audio file error:', error);
          options.onError?.(error);
          reject(error);
        }, { once: true });
  
        if (audio.readyState >= 4) {
          audio.play()
            .then(() => {
              options.onStart?.();
            })
            .catch(reject);
        } else {
          audio.addEventListener('canplaythrough', () => {
            audio.play()
              .then(() => {
                options.onStart?.();
              })
              .catch(reject);
          }, { once: true });
        }
      });
    }
  
    /**
     * Play audio using TTS
     * @param {string} text - Text to speak
     * @param {string} languageCode - Language code
     * @param {Partial<AudioPlaybackOptions>} options - Playback options
     * @return {Promise<void>}
     */
    static async playTTS(text, languageCode = 'en', options = {}) {
      if (!text || !('speechSynthesis' in window)) {
        console.warn('TTS not available or no text to speak');
        options.onEnd?.();
        return;
      }
  
      return new Promise((resolve) => {
        // Extract text content from HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = text;
        const textContent = tempDiv.textContent || tempDiv.innerText || '';
  
        if (!textContent.trim()) {
          console.warn('No text content to speak');
          options.onEnd?.();
          resolve();
          return;
        }
  
        console.log('Using TTS to speak:', textContent);
  
        const utterance = new SpeechSynthesisUtterance(textContent);
        utterance.lang = languageCode;
        utterance.rate = 0.9;
        utterance.pitch = 1;
  
        utterance.onstart = () => {
          console.log('TTS started');
          options.onStart?.();
        };
  
        utterance.onend = () => {
          console.log('TTS ended');
          options.onEnd?.();
          resolve();
        };
  
        utterance.onerror = (event) => {
          console.error('TTS error:', event.error);
          options.onError?.(event.error);
          resolve();
        };
  
        // Cancel any existing speech before starting new one
        speechSynthesis.cancel();
        speechSynthesis.speak(utterance);
      });
    }
  
    /**
     * Play audio with fallback to TTS
     * @param {string} audioPath - Path to audio file
     * @param {string} text - Text for TTS fallback
     * @param {string} languageCode - Language code
     * @param {Partial<AudioPlaybackOptions>} options - Playback options
     * @return {Promise<void>}
     */
    static async playAudioWithFallback(audioPath, text, languageCode = 'en', options = {}) {
      try {
        if (audioPath) {
          await this.playAudioFile(audioPath, options);
        } else {
          await this.playTTS(text, languageCode, options);
        }
      } catch (error) {
        console.error('Audio playback failed, falling back to TTS:', error);
        await this.playTTS(text, languageCode, options);
      }
    }
  
    /**
     * Stop any ongoing audio playback
     */
    static stopAudio() {
      // Stop any ongoing speech synthesis
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
    }
  } 