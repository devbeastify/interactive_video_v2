/**
 * Gets the global that should appear within the activity.
 * @return {Promise<Element | null>}
 */
export function getActivityInfo() {
  return Promise.resolve(document.querySelector('.js-program-tutorial'));
}

/**
 * Parses the global that should appear within the activity.
 * @param {Element} activityInfo
 * @return {Promise<ActivityInfo>}
 */
export function parseActivityInfo(activityInfo) {
  const data = JSON.parse(activityInfo.innerHTML);
  return data[0];
}
