// @ts-check

import { ref } from 'vue';

/**
 * @typedef {Object} MediaErrorInfo
 * @property {string} file - The media file that failed
 * @property {number} index - The index of the failed file
 * @property {Error|Event|unknown} error - The error that occurred
 */

/**
 * @typedef {'idle' | 'loading' | 'loaded' | 'error'} MediaState
 */

/**
 * @typedef {Object} MediaElementConfig
 * @property {string} src - The media source URL
 * @property {string} preload - The preload attribute value
 */

/**
 * Create appropriate media element based on file extension.
 * @param {string} file - The media file URL
 * @return {HTMLVideoElement|HTMLAudioElement} The created media element
 */
function createMediaElement(file) {
  const extension = file.split('.').pop()?.toLowerCase() || '';
  const audioExtensions = ['mp3', 'wav', 'ogg', 'aac', 'm4a'];
  const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi'];

  if (audioExtensions.includes(extension)) {
    const audio = document.createElement('audio');
    audio.src = file;
    audio.preload = 'auto';
    return audio;
  } else if (videoExtensions.includes(extension)) {
    const video = document.createElement('video');
    video.src = file;
    video.preload = 'auto';
    return video;
  } else {
    const video = document.createElement('video');
    video.src = file;
    video.preload = 'auto';
    return video;
  }
}

/**
 * Create error info object for consistent error handling.
 * @param {string} file - The media file that failed
 * @param {number} index - The index of the failed file
 * @param {Error|Event|unknown} error - The error that occurred
 * @return {MediaErrorInfo} The error info object
 */
function createErrorInfo(file, index, error) {
  return {
    file: file,
    index: index,
    error: error,
  };
}

/**
 * Handle media element event listeners with proper cleanup.
 * @param {HTMLVideoElement|HTMLAudioElement} element - The media element
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 */
function setupMediaElementListeners(element, onSuccess, onError) {
  const handleSuccess = () => {
    element.removeEventListener('canplaythrough', handleSuccess);
    element.removeEventListener('error', handleError);
    onSuccess();
  };

  const handleError = (error) => {
    element.removeEventListener('canplaythrough', handleSuccess);
    element.removeEventListener('error', handleError);
    onError(error);
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

      setupMediaElementListeners(
        element,
        () => resolve(),
        (error) => {
          const errorInfo = createErrorInfo(mediaFile, index, error);
          errors.push(errorInfo);
          reject(new Error(`Failed to load media: ${mediaFile}`));
        }
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
    } catch (error) {
      const errorInfo = createErrorInfo(mediaFile, index, error);
      errors.push(errorInfo);
      reject(new Error(`Failed to create media element for: ${mediaFile}`));
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

      setupMediaElementListeners(
        element,
        () => {
          element.pause();
          resolve();
        },
        (error) => {
          const errorInfo = createErrorInfo(mediaFile, index, error);
          errors.push(errorInfo);
          reject(new Error(`Failed to whitelist media: ${mediaFile}`));
        }
      );

      const playPromise = element.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            element.pause();
            resolve();
          })
          .catch((error) => {
            console.warn(`Autoplay rejected for ${mediaFile}:`, error);
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
    } catch (error) {
      const errorInfo = createErrorInfo(mediaFile, index, error);
      errors.push(errorInfo);
      reject(new Error(`Failed to create media element for whitelisting: ${mediaFile}`));
    }
  });
}

/**
 * Log media errors for debugging purposes.
 * @param {string} operation - The operation that failed
 * @param {Error} error - The main error
 * @param {MediaErrorInfo[]} errors - Array of detailed errors
 */
function logMediaErrors(operation, error, errors) {
  console.error(`Error ${operation} media:`, error);
  console.error(`Failed ${operation} files:`, errors);

  errors.forEach((errorInfo) => {
    console.error(`Media ${operation} failed for ${errorInfo.file}:`, errorInfo.error);
  });
}

/**
 * Composable to manage media loading and whitelisting for interactive video.
 *
 * @param {string[]} mediaFiles - Array of media file URLs to manage (video and audio)
 * @return {{
 *   mediaState: import('vue').Ref<MediaState>,
 *   loadMedia: () => Promise<void>,
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
        const loadPromise = createLoadPromise(mediaFile, index, errors, 30000);
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
   * @param {Event} event - The user event triggering whitelisting (e.g., click)
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
        const whitelistPromise = createWhitelistPromise(mediaFile, index, errors, 15000);
        whitelistPromises.push(whitelistPromise);
      });

      await Promise.all(whitelistPromises);
      return Promise.resolve();
    } catch (error) {
      logMediaErrors('whitelisting', error, errors);
      return Promise.reject(error);
    }
  };

  return { mediaState, loadMedia, whitelistMedia };
}
