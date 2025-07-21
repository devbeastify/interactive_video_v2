// @ts-check

import { ref } from 'vue';
import { mainStore } from '../stores/main/main_store';
import { useActivitySettingsStore } from '../stores/main/activity_settings_store';
import { attachVideo } from '../utils/use_attach_video';

/**
 * @typedef {Object} VideoPlayerAPI
 * @property {import('vue').Ref<any|null>} videoPlayer - Video player instance
 * @property {import('vue').Ref<boolean>} isPlaying - Current playing state
 * @property {Function} initializeVideoPlayer - Initialize the video player
 * @property {Function} cleanupVideoPlayer - Clean up video player resources
 */

/**
 * Simplified video player composable using functional video pattern.
 * Removes redundant complexity and uses direct video initialization.
 *
 * @param {import('vue').Ref<HTMLElement|null>} videoContainer - The video container ref
 * @return {VideoPlayerAPI} Video player API object
 */
export function useVideoPlayer(videoContainer) {
  /** @type {import('vue').Ref<any|null>} */
  const videoPlayer = ref(null);
  /** @type {import('vue').Ref<boolean>} */
  const isPlaying = ref(false);

  /**
   * Initialize video player using functional video pattern
   * @return {void}
   */
  const initializeVideoPlayer = () => {
    try {
      if (!videoContainer.value) {
        return;
      }

      const store = mainStore();
      const currentEntry = /** @type {any} */ (store.currentEntry);
      
      if (!currentEntry || currentEntry.type !== 'video') {
        return;
      }

      // Use functional video pattern directly
      const entryIndex = store.currentEntryIndex + 1;
      const selector = `.js-interactive-video-v2-segment-${entryIndex}-video`;
      
      const videoPlayerInstance = attachVideo(selector, videoContainer.value);
      
      if (videoPlayerInstance) {
        videoPlayer.value = videoPlayerInstance;
        
        // Set up essential events directly
        if (videoPlayerInstance.videojs_player) {
          const player = videoPlayerInstance.videojs_player;
          
          player.on('play', () => {
            isPlaying.value = true;
          });
          
          player.on('pause', () => {
            isPlaying.value = false;
          });
          
          player.on('ended', () => {
            isPlaying.value = false;
            // Video completion triggers next quick check
            store.goToNextEntry();
          });
          
          // Auto-play if enabled
          if (useActivitySettingsStore().useAutoPlay) {
            player.play().catch((/** @type {Error} */ error) => {
              console.warn('Auto-play failed:', error);
            });
          }
        }
      }
    } catch (error) {
      console.error('Error initializing video player:', error);
      videoPlayer.value = null;
      isPlaying.value = false;
    }
  };

  /**
   * Clean up video player resources
   * @return {void}
   */
  const cleanupVideoPlayer = () => {
    if (videoPlayer.value) {
      try {
        if (videoPlayer.value.destroy) {
          videoPlayer.value.destroy();
        } else if (videoPlayer.value.videojs_player?.dispose) {
          videoPlayer.value.videojs_player.dispose();
        }
      } catch (error) {
        console.warn('Error destroying video player:', error);
      }
      videoPlayer.value = null;
      isPlaying.value = false;
    }
  };

  return {
    videoPlayer,
    isPlaying,
    initializeVideoPlayer,
    cleanupVideoPlayer,
  };
}
