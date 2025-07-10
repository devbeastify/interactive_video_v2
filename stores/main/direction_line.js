// @ts-check

/**
 * @typedef {Object} DirectionLineOptions
 * @property {string} audioPath - Path to the audio file to play when the
 * direction line is displayed.
 * @property {boolean} isNew - If, from the user's perspective, this direction
 * line is new.  In such cases, the direction line's audio might be played to
 * the user.
 * @property {string} name - The name of the step to which this
 * DirectionLine applies.
 * @property {string} text - The text to display as the direction line.  This
 * will be substituted for the default direction line if provided.
 */

/** @type {DirectionLineOptions} */
export const DEFAULT_DIRECTION_LINE_OPTIONS = {
    audioPath: '',
    isNew: false,
    name: 'unknown',
    text: '',
  };
  
  /**
   * Represents a direction line as used by a Step.
   */
  export class DirectionLine {
    /** @type {string} */
    audioPath = '';
  
    /** @type {boolean} */
    isNew = false;
  
    /** @type {string} */
    text = '';
  
    /**
     * @param {Partial<DirectionLineOptions>} [options]
     */
    constructor(options = {}) {
      /** @type {DirectionLineOptions} */
      const opts = { ...DEFAULT_DIRECTION_LINE_OPTIONS, ...options };
      this.audioPath = opts.audioPath;
      this.isNew = opts.isNew;
      this.text = this._resolveText(opts.name, opts.text);
    }
  
    /**
     * @private
     * If no valid direction line was supplied to the Step, returns a default direction line value
     * based on the step name.
     * @param {string} name
     * @param {string | undefined} directionLine
     * @return {string}
     */
    _resolveText(name, directionLine) {
      if (directionLine && this._isValidDirectionLineText(directionLine)) {
        return directionLine;
      }
  
      switch (name) {
      case 'video_step':
        return 'Watch the video and follow along.';
      case 'interactive_step':
        return 'Complete the interactive activity.';
      case 'quiz_step':
        return 'Answer the questions.';
      default:
        console.warn(
          `No default direction line for Step with name: ${name} could be found,` +
          'using empty string.'
        );
        return '';
      }
    }
  
    /**
     * @private
     * @param {string} text
     * @return {boolean}
     */
    _isValidDirectionLineText(text) {
      return text.length > 0;
    }
  } 