// @ts-check

/**
 * @typedef {Object} ActivityInfo
 * @property {Object} diagnostic
 * @property {Array<QuickCheck>} quick_checks
 * @property {Array<Reference>} reference
 * @property {string} sub_topic
 * @property {string} title
 * @property {string} topic
 */

/**
 * @typedef {Object} QuickCheck
 * @property {Object} quick_check_content
 * @property {string} type
 */

/**
 * @typedef {Object} Reference
 * @property {string} id
 * @property {string} title
 * @property {string} url
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
  const screens = [
    { id: 'intro', name: 'intro' },
    { id: 'player', name: 'player' },
  ];

  if (activityInfo.diagnostic && Object.keys(activityInfo.diagnostic).length > 0) {
    screens.push({ id: 'diagnostic', name: 'diagnostic' });
  }

  return screens;
}
