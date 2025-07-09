// @ts-check

import { ref } from 'vue';

/**
 * Composable to manage media loading and whitelisting for interactive video
 * @param {string[]} videoFiles - Array of video file URLs to manage
 * @return {Object} Object containing mediaState, loadMedia, and whitelistMedia
 */
export function useMedia(videoFiles) {
  const mediaState = ref('idle');

  /**
   * Load all video files and update media state accordingly
   */
  const loadMedia = async () => {
    if (!videoFiles.length) {
      mediaState.value = 'loaded';
      return;
    }

    mediaState.value = 'loading';
    try {
      await Promise.all(
        videoFiles.map(
          (videoFile) =>
            /** @type {Promise<void>} */ (new Promise((resolve, reject) => {
              const video = document.createElement('video');
              video.src = videoFile;
              video.preload = 'auto';
              video.addEventListener('canplaythrough', () => resolve(), { once: true });
              video.addEventListener('error', reject, { once: true });
            }))
        )
      );
      mediaState.value = 'loaded';
    } catch (error) {
      console.error('Error loading video:', error);
      mediaState.value = 'error';
    }
  };

  /**
   * Attempt to play and pause all video files to whitelist them for autoplay
   */
  const whitelistMedia = async () => {
    if (!videoFiles.length) {
      return Promise.resolve();
    }

    try {
      await Promise.all(
        videoFiles.map(
          (videoFile) =>
            /** @type {Promise<void>} */ (new Promise((resolve, reject) => {
              const video = document.createElement('video');
              video.src = videoFile;
              const playPromise = video.play();
              if (playPromise !== undefined) {
                playPromise
                  .then(() => {
                    video.pause();
                    resolve();
                  })
                  .catch(reject);
              } else {
                resolve();
              }
            }))
        )
      );
      return Promise.resolve();
    } catch (error) {
      console.error('Error whitelisting video:', error);
      return Promise.reject(error);
    }
  };

  return {
    mediaState,
    loadMedia,
    whitelistMedia,
  };
}
