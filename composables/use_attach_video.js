// @ts-check

/**
 * @typedef {Object} VideoPlayerConfig
 * @property {string} templateSelector - Selector for template containing video reference
 * @property {HTMLElement} targetElm - Element to append the video reference to
 */

/**
 * @typedef {Object} VideoElement
 * @property {string} id - The video element ID
 * @property {HTMLElement} element - The video element
 */

/**
 * @typedef {Object} VideoJSPlayer
 * @property {Function} dispose - Method to dispose the video player
 */

/**
 * @typedef {Object} VideoJSElement
 * @property {VideoJSPlayer} player - The video.js player instance
 */

/**
 * Extends the Window interface to include the initVideoPlayer function
 * @typedef {Object} CustomWindow
 * @property {Function} initVideoPlayer - Function to initialize video player
 */

/**
 * Cleans up existing video elements in the target container
 * @param {HTMLElement} targetElm - The target container element
 */
function cleanupExistingVideos(targetElm) {
  const existingVideos = targetElm.querySelectorAll(
    '.js-video-reference, .reference_model'
  );

  existingVideos.forEach((video) => {
    try {
      const videojsPlayer = video.querySelector('.video-js');
      if (videojsPlayer && videojsPlayer.player) {
        /** @type {any} */ (videojsPlayer).player.dispose();
      }
      video.remove();
    } catch (error) {
      console.warn('Error cleaning up existing video:', error);
      video.remove();
    }
  });
}

/**
 * Finds and validates the template element
 * @param {string} templateSelector - Selector for the template
 * @return {HTMLElement | null} The template content element or null if not found
 */
function findTemplateElement(templateSelector) {
  const templateElm = document.querySelector(templateSelector);
  if (!templateElm || !templateElm.content) {
    console.warn(`Template not found for selector: ${templateSelector}`);
    return null;
  }
  return /** @type {HTMLElement} */ (templateElm.content);
}

/**
 * Extracts the video reference element from the template
 * @param {HTMLElement} templateElm - The template content element
 * @param {string} templateSelector - The template selector for error messages
 * @return {HTMLElement | null} The video reference element or null if not found
 */
function extractVideoReference(templateElm, templateSelector) {
  const referenceElm = templateElm.firstElementChild;
  if (!referenceElm) {
    console.warn(`No video reference found in template: ${templateSelector}`);
    return null;
  }
  return /** @type {HTMLElement} */ (referenceElm);
}

/**
 * Clones and appends the video reference to the target element
 * @param {HTMLElement} referenceElm - The video reference element
 * @param {HTMLElement} targetElm - The target container element
 * @return {HTMLElement} The cloned reference element
 */
function cloneAndAppendVideo(referenceElm, targetElm) {
  const clonedReferenceElm = referenceElm.cloneNode(true);
  targetElm.appendChild(clonedReferenceElm);
  return /** @type {HTMLElement} */ (clonedReferenceElm);
}

/**
 * Initializes the video player if the initialization function is available
 * @param {HTMLElement} referenceElm - The video reference element
 * @param {string} templateSelector - The template selector for error messages
 * @return {VHL.Video.File | undefined} The initialized video player instance
 */
function initializeVideoPlayer(referenceElm, templateSelector) {
  if (typeof /** @type {any} */ (window).initVideoPlayer !== 'function') {
    console.warn('window.initVideoPlayer is not available');
    return;
  }

  const videoElm = referenceElm.querySelector('.js-video-reference');
  if (!videoElm) {
    console.warn(`No video element found in template: ${templateSelector}`);
    return;
  }

  const videoId = videoElm.id;
  return /** @type {any} */ (window).initVideoPlayer(videoId);
}

/**
 * Finds the template matching the specified selector, detaches the
 * video reference element from the template, and appends it to the
 * specified container element.
 * @param {string} templateSelector - Selector for template containing the
 * video reference
 * @param {HTMLElement} targetElm - Element to append the video reference to
 * @return {VHL.Video.File | undefined} The initialized video player instance
 */
export function attachVideo(templateSelector, targetElm) {
  cleanupExistingVideos(targetElm);

  const templateElm = findTemplateElement(templateSelector);
  if (!templateElm) {
    return;
  }

  const referenceElm = extractVideoReference(templateElm, templateSelector);
  if (!referenceElm) {
    return;
  }

  cloneAndAppendVideo(referenceElm, targetElm);

  return initializeVideoPlayer(referenceElm, templateSelector);
}