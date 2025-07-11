// @ts-check

/**
 * @typedef {Object} ActivityInfo
 * @property {string} topic
 * @property {string} sub_topic
 * @property {string} title
 * @property {Array<Object>} reference
 * @property {Array<Object>} quick_checks
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
