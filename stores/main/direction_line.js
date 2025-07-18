// @ts-check

/**
 * @typedef {Object} DirectionLineOptions
 * @property {string} audioPath - Path to the audio file to play when the
 * direction line is displayed.
 * @property {boolean} isNew - If, from the user's perspective, this direction
 * line is new. In such cases, the direction line's audio might be played to
 * the user.
 * @property {string} name - The name of the step to which this
 * DirectionLine applies.
 * @property {string} text - The text to display as the direction line. This
 * will be substituted for the default direction line if provided.
 * @property {string} stepId - Unique identifier for the step
 * @property {string} languageCode - Language code for audio generation
 * @property {string} stepType - Type of step (quick_check, diagnostic, etc.)
 */

/** @type {DirectionLineOptions} */
export const DEFAULT_DIRECTION_LINE_OPTIONS = {
  audioPath: '',
  isNew: false,
  name: 'unknown',
  text: '',
  stepId: '',
  languageCode: 'en',
  stepType: '',
};

/**
 * Represents a direction line as used by a Step in Interactive Video v2.
 */
export class DirectionLine {
  /** @type {string} */
  audioPath = '';

  /** @type {boolean} */
  isNew = false;

  /** @type {string} */
  text = '';

  /** @type {string} */
  stepId = '';

  /** @type {string} */
  languageCode = 'en';

  /** @type {string} */
  stepType = '';

  /** @type {boolean} */
  audioGenerated = false;

  /**
   * @param {Partial<DirectionLineOptions>} [options]
   */
  constructor(options = {}) {
    /** @type {DirectionLineOptions} */
    const opts = { ...DEFAULT_DIRECTION_LINE_OPTIONS, ...options };
    this.audioPath = opts.audioPath;
    this.isNew = opts.isNew;
    this.stepId = opts.stepId;
    this.languageCode = opts.languageCode;
    this.stepType = opts.stepType;
    this.text = this._resolveText(opts.name, opts.text);

    this._initializeAudioPath();
  }

  /**
   * Initialize audio path if not provided
   * @private
   * @return {void}
   */
  _initializeAudioPath() {
    if (!this.audioPath && this.stepId) {
      this.audioPath = this._generateAudioPath();
    }
  }

  /**
   * Generate dynamic audio path based on step ID and language
   * @private
   * @return {string}
   */
  _generateAudioPath() {
    return `/audio/direction-lines/${this.stepId}/${this.languageCode}.mp3`;
  }

  /**
   * Check if audio file exists and is accessible
   * @return {Promise<boolean>}
   */
  async checkAudioAvailability() {
    if (!this.audioPath) return false;

    try {
      const response = await fetch(this.audioPath, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.warn(`Audio file not available: ${this.audioPath}`, error);
      return false;
    }
  }

  /**
   * Generate audio file using TTS if not available
   * @return {Promise<boolean>}
   */
  async generateAudioIfNeeded() {
    if (this.audioGenerated) return true;

    const audioAvailable = await this.checkAudioAvailability();
    if (audioAvailable) {
      this.audioGenerated = true;
      return true;
    }

    console.log('Audio file not available, TTS will be used as fallback');
    return false;
  }

  /**
   * Generate TTS audio for the direction line text
   * @private
   * @return {Promise<void>}
   */
  async _generateTTSAudio() {
    if (!this.text) return;

    try {
      if ('speechSynthesis' in window) {
        const textContent = this._extractTextContent();

        if (!textContent.trim()) {
          console.warn('No text content to speak');
          return;
        }

        const utterance = this._createSpeechUtterance(textContent);

        return new Promise((resolve, reject) => {
          utterance.onend = () => resolve();
          utterance.onerror = (event) =>
            reject(new Error(`TTS error: ${event.error}`));
          speechSynthesis.speak(utterance);
        });
      }
    } catch (error) {
      console.error('TTS generation failed:', error);
      throw error;
    }
  }

  /**
   * Extract text content from HTML
   * @private
   * @return {string}
   */
  _extractTextContent() {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = this.text;
    return tempDiv.textContent || tempDiv.innerText || '';
  }

  /**
   * Create speech synthesis utterance with proper configuration
   * @private
   * @param {string} textContent - The text to speak
   * @return {SpeechSynthesisUtterance}
   */
  _createSpeechUtterance(textContent) {
    const utterance = new SpeechSynthesisUtterance(textContent);
    utterance.lang = this.languageCode;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    return utterance;
  }

  /**
   * If no valid direction line was supplied to the Step, returns a default
   * direction line value based on the step name.
   * @private
   * @param {string} name
   * @param {string | undefined} directionLine
   * @return {string}
   */
  _resolveText(name, directionLine) {
    if (directionLine && this._isValidDirectionLineText(directionLine)) {
      return directionLine;
    }

    return this._getDefaultDirectionLine(name);
  }

  /**
   * Get default direction line text based on step name
   * @private
   * @param {string} name - The step name
   * @return {string}
   */
  _getDefaultDirectionLine(name) {
    /** @type {Record<string, string>} */
    const defaultMessages = {
      quick_check: 'Complete the interactive activity.',
      diagnostic: 'Answer the questions to test your understanding.',
      player: 'Complete the interactive activity.',
    };

    const message = defaultMessages[name];
    if (message) {
      return message;
    }

    console.warn(
      `No default direction line for Step with name: ${name} could be found, ` +
      'using empty string.'
    );
    return '';
  }

  /**
   * @private
   * @param {string} text
   * @return {boolean}
   */
  _isValidDirectionLineText(text) {
    return Boolean(text && text.trim().length > 0);
  }
}
