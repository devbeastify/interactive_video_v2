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
export async function parseActivityInfo(activityInfo) {
  try {
    if (!activityInfo.innerHTML.trim()) {
      throw new Error('Empty innerHTML');
    }
    const data = JSON.parse(activityInfo.innerHTML);
    return data[0];
  } catch (error) {
    throw new Error(`Failed to parse activity info: ${error.message}`);
  }
}
