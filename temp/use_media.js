// @ts-check

import { ref } from 'vue';

/**
 * Composable to manage media loading and whitelisting for interactive video
 * @param {string[]} mediaFiles - Array of media file URLs to manage
 * @return {Object} Object containing mediaState, loadMedia, and whitelistMedia
 */
export function useMedia(mediaFiles) {
  const mediaState = ref('idle');
  /** @type {import('vue').Ref<string[]>} */
  const loadedMedia = ref([]);
  /** @type {import('vue').Ref<string[]>} */
  const failedMedia = ref([]);

  /**
   * Determine if a file is audio based on its extension
   * @param {string} filePath - The file path to check
   * @return {boolean} True if the file is audio
   */
  function isAudioFile(filePath) {
    const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.aac'];
    return audioExtensions.some(ext => filePath.toLowerCase().includes(ext));
  }

  /**
   * Load all media files and update media state accordingly
   */
  const loadMedia = async () => {
    if (!mediaFiles.length) {
      mediaState.value = 'loaded';
      return;
    }

    mediaState.value = 'loading';
    loadedMedia.value = [];
    failedMedia.value = [];

    try {
      const loadPromises = mediaFiles.map(
        (mediaFile) =>
          /** @type {Promise<void>} */ (new Promise((resolve) => {
            const isAudio = isAudioFile(mediaFile);
            const element = document.createElement(isAudio ? 'audio' : 'video');
            element.src = mediaFile;
            element.preload = 'auto';
            element.addEventListener('canplaythrough', () => {
              loadedMedia.value.push(mediaFile);
              resolve();
            }, { once: true });
            element.addEventListener('error', () => {
              failedMedia.value.push(mediaFile);
              console.error(`Failed to load ${isAudio ? 'audio' : 'video'}: ${mediaFile}`);
              resolve(); // Don't reject, just log error and continue
            }, { once: true });
          }))
      );

      await Promise.all(loadPromises);
      mediaState.value = 'loaded';
    } catch (error) {
      console.error('Error loading media:', error);
      mediaState.value = 'error';
    }
  };

  /**
   * Attempt to play and pause all successfully loaded media files to whitelist them for autoplay
   * Excludes failed media from whitelisting operation as specified in the ticket
   */
  const whitelistMedia = async () => {
    if (!loadedMedia.value.length) {
      return Promise.resolve();
    }

    try {
      await Promise.all(
        loadedMedia.value.map(
          (mediaFile) =>
            /** @type {Promise<void>} */ (new Promise((resolve) => {
              const isAudio = isAudioFile(mediaFile);
              const element = document.createElement(isAudio ? 'audio' : 'video');
              element.src = mediaFile;
              const playPromise = element.play();
              if (playPromise !== undefined) {
                playPromise
                  .then(() => {
                    element.pause();
                    resolve();
                  })
                  .catch((error) => {
                    console.warn(`Failed to whitelist ${isAudio ? 'audio' : 'video'}: ${mediaFile}`, error);
                    resolve(); // Don't reject, just log warning and continue
                  });
              } else {
                resolve();
              }
            }))
        )
      );
      return Promise.resolve();
    } catch (error) {
      console.error('Error whitelisting media:', error);
      return Promise.reject(error);
    }
  };

  return {
    mediaState,
    loadMedia,
    whitelistMedia,
    loadedMedia,
    failedMedia,
  };
}
