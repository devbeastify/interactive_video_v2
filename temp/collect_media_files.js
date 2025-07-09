// @ts-check

/**
 * @typedef ActivityInfo
 * @property {Array<any>} reference
 * @property {Array<any>} quick_checks
 */

/**
 * Collects all media files from the activity data structure
 * @param {ActivityInfo} activityInfo - The activity information
 * @return {string[]} Array of media file URLs to load
 */
export function collectAllMediaFiles(activityInfo) {
  /** @type {string[]} */
  const mediaFiles = [];

  // Collect video files from reference elements
  if (activityInfo.reference) {
    activityInfo.reference.forEach((/** @type {any} */ reference) => {
      if (reference.video_path) {
        mediaFiles.push(reference.video_path);
      }
    });
  }

  // Collect audio files from quick checks
  if (activityInfo.quick_checks) {
    activityInfo.quick_checks.forEach((/** @type {any} */ quickCheck) => {
      if (quickCheck.quick_check_content) {
        // Handle pronunciation quick checks that contain audio
        if (quickCheck.type === 'quick_check_pronunciation' && quickCheck.quick_check_content.record_and_compare_word) {
          const audioItems = Array.isArray(quickCheck.quick_check_content.record_and_compare_word) 
            ? quickCheck.quick_check_content.record_and_compare_word 
            : [quickCheck.quick_check_content.record_and_compare_word];
          
          audioItems.forEach((/** @type {any} */ audioItem) => {
            if (audioItem.audio && audioItem.audio.src) {
              mediaFiles.push(audioItem.audio.src);
            }
          });
        }
      }
    });
  }

  return mediaFiles;
} 