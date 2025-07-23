// @ts-check

import { ref } from 'vue';

/**
 * @typedef {Object} MediaErrorInfo
 * @property {Error|Event|unknown} error - The error that occurred
 * @property {string} file - The media file that failed
 * @property {number} index - The index of the failed file
 */

/**
 * @typedef {'error' | 'idle' | 'loaded' | 'loading'} MediaState
 */

/**
 * @typedef {Object} MediaElementConfig
 * @property {string} preload - The preload attribute value
 * @property {string} src - The media source URL
 */

/**
 * Create appropriate media element based on file extension.
 * @param {string} file - The media file URL
 * @return {HTMLVideoElement|HTMLAudioElement} The created media element
 */
function createMediaElement(file) {
  const extension = file.split('.').pop()?.toLowerCase() || '';
  const audioExtensions = ['aac', 'm4a', 'mp3', 'ogg', 'wav'];
  const subtitleExtensions = ['ass', 'srt', 'ssa', 'vtt'];
  const videoExtensions = ['avi', 'mov', 'mp4', 'ogg', 'webm'];

  if (subtitleExtensions.includes(extension)) {
    throw new Error(
      `Subtitle files cannot be loaded as media elements: ${file}`
    );
  }

  if (audioExtensions.includes(extension)) {
    const audio = document.createElement('audio');
    audio.preload = 'auto';
    audio.src = file;
    return audio;
  } else if (videoExtensions.includes(extension)) {
    const video = document.createElement('video');
    video.preload = 'auto';
    video.src = file;
    return video;
  } else {
    const video = document.createElement('video');
    video.preload = 'auto';
    video.src = file;
    return video;
  }
}

/**
 * Create error info object for consistent error handling.
 * @param {string} file - The media file that failed
 * @param {number} index - The index of the failed file
 * @param {unknown} error - The error that occurred
 * @return {MediaErrorInfo} The error info object
 */
function createErrorInfo(file, index, error) {
  return {
    error: error,
    file: file,
    index: index,
  };
}

/**
 * Handle media element event listeners with proper cleanup.
 * @param {HTMLVideoElement|HTMLAudioElement} element - The media element
 * @param {Function} onError - Error callback
 * @param {Function} onSuccess - Success callback
 */
function setUpMediaElementListeners(element, onError, onSuccess) {
  const handleError = (/** @type {Event} */ error) => {
    element.removeEventListener('canplaythrough', handleSuccess);
    element.removeEventListener('error', handleError);
    onError(error);
  };

  const handleSuccess = () => {
    element.removeEventListener('canplaythrough', handleSuccess);
    element.removeEventListener('error', handleError);
    onSuccess();
  };

  element.addEventListener('canplaythrough', handleSuccess, { once: true });
  element.addEventListener('error', handleError, { once: true });
}

/**
 * Create a promise for loading a single media file.
 * @param {string} mediaFile - The media file URL
 * @param {number} index - The index of the file
 * @param {MediaErrorInfo[]} errors - Array to collect errors
 * @param {number} timeout - Timeout in milliseconds
 * @return {Promise<void>} Promise that resolves when media is loaded
 */
function createLoadPromise(mediaFile, index, errors, timeout) {
  return new Promise((resolve, reject) => {
    try {
      const element = createMediaElement(mediaFile);

      setUpMediaElementListeners(
        element,
        (/** @type {Event} */ error) => {
          const errorInfo = createErrorInfo(mediaFile, index, error);
          errors.push(errorInfo);
          reject(new Error(`Failed to load media: ${mediaFile}`));
        },
        () => resolve()
      );

      setTimeout(() => {
        if (element.readyState === 0) {
          const errorInfo = createErrorInfo(
            mediaFile,
            index,
            new Error('Media loading timeout')
          );
          errors.push(errorInfo);
          reject(new Error('Media loading timeout'));
        }
      }, timeout);
    } catch (/** @type {unknown} */ error) {
      const errorInfo = createErrorInfo(mediaFile, index, error);
      errors.push(errorInfo);
      reject(
        new Error(`Failed to create media element for: ${mediaFile}`)
      );
    }
  });
}

/**
 * Create a promise for whitelisting a single media file.
 * @param {string} mediaFile - The media file URL
 * @param {number} index - The index of the file
 * @param {MediaErrorInfo[]} errors - Array to collect errors
 * @param {number} timeout - Timeout in milliseconds
 * @return {Promise<void>} Promise that resolves when media is whitelisted
 */
function createWhitelistPromise(mediaFile, index, errors, timeout) {
  return new Promise((resolve, reject) => {
    try {
      const element = createMediaElement(mediaFile);

      setUpMediaElementListeners(
        element,
        (/** @type {Event} */ error) => {
          const errorInfo = createErrorInfo(mediaFile, index, error);
          errors.push(errorInfo);
          reject(new Error(`Failed to whitelist media: ${mediaFile}`));
        },
        () => {
          element.pause();
          resolve();
        }
      );

      const playPromise = element.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            element.pause();
            resolve();
          })
          .catch((/** @type {Error} */ error) => {
            resolve();
          });
      } else {
        resolve();
      }

      setTimeout(() => {
        if (element.readyState === 0) {
          const errorInfo = createErrorInfo(
            mediaFile,
            index,
            new Error('Media whitelisting timeout')
          );
          errors.push(errorInfo);
          reject(new Error('Media whitelisting timeout'));
        }
      }, timeout);
    } catch (/** @type {unknown} */ error) {
      const errorInfo = createErrorInfo(mediaFile, index, error);
      errors.push(errorInfo);
      reject(
        new Error(
          `Failed to create media element for whitelisting: ${mediaFile}`
        )
      );
    }
  });
}

/**
 * Log media errors for debugging purposes.
 * @param {string} operation - The operation that failed
 * @param {unknown} error - The main error
 * @param {MediaErrorInfo[]} errors - Array of detailed errors
 */
function logMediaErrors(operation, error, errors) {
  errors.forEach((errorInfo) => {
    console.error(
      `Media ${operation} failed for ${errorInfo.file}:`,
      errorInfo.error
    );
  });
}

/**
 * Composable to manage media loading and whitelisting for interactive video.
 *
 * @param {string[]} mediaFiles - Array of media file URLs to manage
 * @return {{
 *   loadMedia: () => Promise<void>,
 *   mediaState: import('vue').Ref<MediaState>,
 *   whitelistMedia: (e: Event) => Promise<void>
 * }} Object containing mediaState, loadMedia, and whitelistMedia
 */
export function useMedia(mediaFiles) {
  /**
   * The current state of media loading.
   * @type {import('vue').Ref<MediaState>}
   */
  const mediaState = ref('idle');

  /**
   * Load all media files and update media state accordingly.
   * Enhanced with comprehensive error handling.
   * @return {Promise<void>}
   */
  const loadMedia = async () => {
    if (!mediaFiles.length) {
      mediaState.value = 'loaded';
      return;
    }

    mediaState.value = 'loading';
    /** @type {Promise<void>[]} */
    const loadPromises = [];
    /** @type {MediaErrorInfo[]} */
    const errors = [];

    try {
      mediaFiles.forEach((mediaFile, index) => {
        const loadPromise = createLoadPromise(
          mediaFile,
          index,
          errors,
          30000
        );
        loadPromises.push(loadPromise);
      });

      await Promise.all(loadPromises);
      mediaState.value = 'loaded';
    } catch (error) {
      logMediaErrors('loading', error, errors);
      mediaState.value = 'error';
    }
  };

  /**
   * Attempt to play and pause all media files to whitelist them for autoplay.
   * Enhanced with comprehensive error handling.
   * @param {Event} event - The user event triggering whitelisting
   * @return {Promise<void>}
   */
  const whitelistMedia = async (event) => {
    if (!mediaFiles.length) {
      return Promise.resolve();
    }

    /** @type {Promise<void>[]} */
    const whitelistPromises = [];
    /** @type {MediaErrorInfo[]} */
    const errors = [];

    try {
      mediaFiles.forEach((mediaFile, index) => {
        const whitelistPromise = createWhitelistPromise(
          mediaFile,
          index,
          errors,
          15000
        );
        whitelistPromises.push(whitelistPromise);
      });

      await Promise.all(whitelistPromises);
      return Promise.resolve();
    } catch (error) {
      logMediaErrors('whitelisting', error, errors);
      return Promise.reject(error);
    }
  };

  return { loadMedia, mediaState, whitelistMedia };
}
