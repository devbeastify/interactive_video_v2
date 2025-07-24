// @ts-check

/**
 * @typedef {Object} AudioPlaybackOptions
 * @property {string} audioPath - Path to audio file
 * @property {string} text - Text for TTS fallback
 * @property {string} languageCode - Language code for TTS
 * @property {function(): void} onStart - Callback when audio starts
 * @property {function(): void} onEnd - Callback when audio ends
 * @property {function(Error): void} onError - Callback when audio errors
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

      audio.addEventListener('error', (event) => {
        console.error('Audio file error:', event);
        const error = new Error(`Audio playback failed: ${event.type}`);
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
   * Extract text content from HTML string
   * @param {string} htmlText - HTML text to extract content from
   * @return {string} Extracted text content
   */
  static extractTextContent(htmlText) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlText;
    return tempDiv.textContent || tempDiv.innerText || '';
  }

  /**
   * Check if TTS is available and text is valid
   * @param {string} text - Text to validate
   * @return {boolean} Whether TTS can be used
   */
  static canUseTTS(text) {
    return Boolean(text && 'speechSynthesis' in window);
  }

  /**
   * Create and configure speech synthesis utterance
   * @param {string} textContent - Text to speak
   * @param {string} languageCode - Language code
   * @param {Partial<AudioPlaybackOptions>} options - Playback options
   * @return {SpeechSynthesisUtterance} Configured utterance
   */
  static createUtterance(textContent, languageCode, options) {
    const utterance = new SpeechSynthesisUtterance(textContent);
    utterance.lang = languageCode;
    utterance.pitch = 1;
    utterance.rate = 0.9;

    utterance.onstart = () => {
      options.onStart?.();
    };

    utterance.onend = () => {
      options.onEnd?.();
    };

    utterance.onerror = (event) => {
      const error = new Error(`TTS error: ${event.error}`);
      options.onError?.(error);
    };

    return utterance;
  }

  /**
   * Play audio using TTS
   * @param {string} text - Text to speak
   * @param {string} languageCode - Language code
   * @param {Partial<AudioPlaybackOptions>} options - Playback options
   * @return {Promise<void>}
   */
  static async playTTS(text, languageCode = 'en', options = {}) {
    if (!this.canUseTTS(text)) {
      options.onEnd?.();
      return;
    }

    return new Promise((resolve) => {
      const textContent = this.extractTextContent(text);

      if (!textContent.trim()) {
        options.onEnd?.();
        resolve();
        return;
      }

      const utterance = this.createUtterance(textContent, languageCode, {
        ...options,
        onEnd: () => {
          options.onEnd?.();
          resolve();
        },
        onError: (error) => {
          options.onError?.(error);
          resolve();
        },
      });

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
  static async playAudioWithFallback(audioPath, text, languageCode = 'en',
    options = {}) {
    try {
      if (audioPath) {
        await this.playAudioFile(audioPath, options);
      } else {
        await this.playTTS(text, languageCode, options);
      }
    } catch (error) {
      await this.playTTS(text, languageCode, options);
    }
  }

  /**
   * Stop any ongoing audio playback
   */
  static stopAudio() {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  }
}