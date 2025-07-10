// @ts-check

import { ref } from 'vue';

/**
 * @typedef {Object} MediaErrorInfo
 * @property {string} file - The media file that failed
 * @property {number} index - The index of the failed file
 * @property {Error|Event|unknown} error - The error that occurred
 */

/**
 * Composable to manage media loading and whitelisting for interactive video.
 *
 * @param {string[]} mediaFiles - Array of media file URLs to manage (video and audio)
 * @returns {{
 *   mediaState: import('vue').Ref<string>,
 *   loadMedia: () => Promise<void>,
 *   whitelistMedia: (e: Event) => Promise<void>
 * }} Object containing mediaState, loadMedia, and whitelistMedia
 */
export function useMedia(mediaFiles) {
  /**
   * The current state of media loading.
   * @type {import('vue').Ref<string>}
   */
  const mediaState = ref('idle');

  /**
   * Create appropriate media element based on file extension.
   * @param {string} file - The media file URL
   * @return {HTMLVideoElement|HTMLAudioElement} The created media element
   */
  const createMediaElement = (file) => {
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
  };

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
        const loadPromise = new Promise((resolve, reject) => {
          try {
            const element = createMediaElement(mediaFile);

            const handleLoad = () => {
              element.removeEventListener('canplaythrough', handleLoad);
              element.removeEventListener('error', handleError);
              resolve();
            };

            const handleError = (error) => {
              element.removeEventListener('canplaythrough', handleLoad);
              element.removeEventListener('error', handleError);
              const errorInfo = {
                file: mediaFile,
                index: index,
                error: error,
              };
              errors.push(errorInfo);
              reject(new Error(`Failed to load media: ${mediaFile}`));
            };

            element.addEventListener('canplaythrough', handleLoad, { once: true });
            element.addEventListener('error', handleError, { once: true });

            setTimeout(() => {
              if (element.readyState === 0) {
                handleError(new Error('Media loading timeout'));
              }
            }, 30000);
          } catch (error) {
            const errorInfo = {
              file: mediaFile,
              index: index,
              error: error,
            };
            errors.push(errorInfo);
            reject(new Error(`Failed to create media element for: ${mediaFile}`));
          }
        });

        loadPromises.push(loadPromise);
      });

      await Promise.all(loadPromises);
      mediaState.value = 'loaded';
    } catch (error) {
      console.error('Error loading media:', error);
      console.error('Failed media files:', errors);

      mediaState.value = 'error';

      errors.forEach((errorInfo) => {
        console.error(`Media loading failed for ${errorInfo.file}:`, errorInfo.error);
      });
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
        const whitelistPromise = new Promise((resolve, reject) => {
          try {
            const element = createMediaElement(mediaFile);

            const handleWhitelistSuccess = () => {
              element.removeEventListener('canplaythrough', handleWhitelistSuccess);
              element.removeEventListener('error', handleWhitelistError);
              element.pause();
              resolve();
            };

            const handleWhitelistError = (error) => {
              element.removeEventListener('canplaythrough', handleWhitelistSuccess);
              element.removeEventListener('error', handleWhitelistError);
              const errorInfo = {
                file: mediaFile,
                index: index,
                error: error,
              };
              errors.push(errorInfo);
              reject(new Error(`Failed to whitelist media: ${mediaFile}`));
            };

            element.addEventListener('canplaythrough', handleWhitelistSuccess, { once: true });
            element.addEventListener('error', handleWhitelistError, { once: true });

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
                handleWhitelistError(new Error('Media whitelisting timeout'));
              }
            }, 15000);
          } catch (error) {
            const errorInfo = {
              file: mediaFile,
              index: index,
              error: error,
            };
            errors.push(errorInfo);
            reject(new Error(`Failed to create media element for whitelisting: ${mediaFile}`));
          }
        });

        whitelistPromises.push(whitelistPromise);
      });

      await Promise.all(whitelistPromises);
      return Promise.resolve();
    } catch (error) {
      console.error('Error whitelisting media:', error);
      console.error('Failed whitelist files:', errors);

      errors.forEach((errorInfo) => {
        console.error(`Media whitelisting failed for ${errorInfo.file}:`, errorInfo.error);
      });

      return Promise.reject(error);
    }
  };

  return { mediaState, loadMedia, whitelistMedia };
}
