// @ts-check

/**
 * @typedef {Object} Reference
 * @property {string} id
 * @property {string} title
 * @property {string} url
 */

/**
 * @typedef {Object} QuickCheck
 * @property {string} type
 * @property {Object} quick_check_content
 */

/**
 * @typedef {Object} ActivityInfo
 * @property {string} topic
 * @property {string} sub_topic
 * @property {string} title
 * @property {string} dl
 * @property {Array<Reference>} reference
 * @property {Array<QuickCheck>} quick_checks
 * @property {Object} diagnostic
 */

/**
 * @typedef {Object} Screen
 * @property {string} id
 * @property {string} name
 */

/**
 * Build the list of screens for a given activity
 * @param {ActivityInfo} activityInfo - The activity information
 * @return {Screen[]} Array of screen objects
 */
export function buildScreensForActivity(activityInfo) {
    return [
      { id: 'intro', name: 'intro' },
      { id: 'player', name: 'player' },
      { id: 'diagnostic', name: 'diagnostic' },
    ];
  }
  