// @ts-check

/**
 * @typedef {Object} AudioPlaybackOptions
 * @property {string} text - Text content (required for TTS, optional for audio-only)
 * @property {string} [audioPath] - Path to audio file (optional)
 * @property {string} [languageCode='en'] - Language code for TTS
 * @property {function(): void} [onStart] - Callback when audio starts
 * @property {function(): void} [onEnd] - Callback when audio ends
 * @property {function(Error): void} [onError] - Callback when audio errors
 */

/**
 * Shared audio service for direction line audio playback
 * Eliminates duplicated audio logic between main_store.js and DirectionLine.vue
 */
export class AudioService {
  static #activeAudioInstances = new Set();

  /**
   * Play direction line audio
   * @param {AudioPlaybackOptions} options - Playback options
   * @return {Promise<void>}
   */
  static async playDL(options) {
    const { text, audioPath, onStart, onEnd, onError } = options;

    if (!text?.trim()) {
      return;
    }

    if (!audioPath) {
      console.warn('No audio path provided');
      return;
    }

    try {
      onStart?.();
      await this.playAudioFile(audioPath, { onStart, onEnd, onError });
    } catch (error) {
      console.error('Audio playback failed:', error);
      const audioError = error instanceof Error ? error : new Error(String(error));
      onError?.(audioError);
      throw audioError;
    }
  }

  /**
   * Play audio file from URL
   * @param {string} audioPath - Path to audio file
   * @param {Partial<AudioPlaybackOptions>} options - Playback options
   * @return {Promise<void>}
   */
  static async playAudioFile(audioPath, options = {}) {
    return new Promise((resolve, reject) => {
      const audio = new Audio(audioPath);

      this.#activeAudioInstances.add(audio);

      const cleanup = () => {
        this.#activeAudioInstances.delete(audio);
      };

      audio.addEventListener('ended', () => {
        cleanup();
        options.onEnd?.();
        resolve();
      }, { once: true });

      audio.addEventListener('error', (event) => {
        cleanup();
        console.error('Audio file error:', event);
        const error = new Error(`Audio playback failed: ${event.type}`);
        options.onError?.(error);
        reject(error);
      }, { once: true });

      const playAudio = () => {
        audio.play()
          .then(() => {
            options.onStart?.();
          })
          .catch(reject);
      };

      if (audio.readyState >= 4) {
        playAudio();
      } else {
        audio.addEventListener('canplaythrough', playAudio, { once: true });
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
   * Stop any ongoing audio playback
   */
  static stopAudio() {
    this.#activeAudioInstances.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
    this.#activeAudioInstances.clear();
  }
}