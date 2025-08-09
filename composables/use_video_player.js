// @ts-check

import { ref } from 'vue';
import { useActionStore } from '../stores/action_store';
import { useActivitySettingsStore } from '../stores/activity_settings_store';
import { useDLStore } from '../stores/direction_line_store';
import { attachVideo } from './use_attach_video';

// Global videojs variable declaration
/* global videojs */

/**
 * @typedef {Object} VideoJSPlayer
 * @property {Function} [dispose] - Optional dispose method
 * @property {Object} el_ - Video element with dataset
 * @property {Function} on - Event listener method
 * @property {Function} [pause] - Optional pause method
 * @property {Function} [play] - Optional play method that returns a Promise
 * @property {Function} [controlBar] - Control bar access method
 * @property {Function} [playbackRate] - Playback rate method
 * @property {Function} [requestFullscreen] - Fullscreen request method
 * @property {Function} [exitFullscreen] - Fullscreen exit method
 * @property {Function} [isFullscreen] - Fullscreen check method
 * @property {Function} [ready] - Ready method for player initialization
 */

/**
 * @typedef {Object} VideoJSControlBar
 * @property {Function} addChild - Add child component method
 * @property {Function} getChild - Get child component method
 * @property {Function} children - Get all children method
 */

/**
 * @typedef {Object} VHLVideoFile
 * @property {Function} [destroy] - Optional cleanup function
 * @property {Function} [init] - Initialize method
 * @property {Function} [initialize_video] - Initialize video method
 * @property {Function} [pause] - Optional pause method
 * @property {Function} [play] - Optional play method
 * @property {boolean} show_controls - Whether to show controls
 * @property {Object} video - Video object
 * @property {VideoJSPlayer} videojs_player - VideoJS player instance
 */

/**
 * @typedef {Object} VideoPlayerAPI
 * @property {Function} cleanupVideoPlayer - Clean up video player resources
 * @property {Function} initializeVideoPlayer - Initialize the video player
 * @property {import('vue').Ref<boolean>} isPlaying - Current playing state
 * @property {import('vue').Ref<Object|null>} videoPlayer - Video player instance
 */

/**
 * Simplified video player composable using functional video pattern.
 * Removes redundant complexity and uses direct video initialization.
 *
 * @param {import('vue').Ref<HTMLElement|null>} videoContainer - The video container ref
 * @param {Function} onEnded - Callback function when video ends
 * @return {Object} Video player API object
 */
export function useVideoPlayer(videoContainer, onEnded) {
  /** @type {import('vue').Ref<VHLVideoFile|null>} */
  const videoPlayer = ref(null);
  /** @type {import('vue').Ref<boolean>} */
  const isPlaying = ref(false);

  /**
   * Configures VideoJS control bar with fullscreen and playback rate controls
   * @param {VideoJSPlayer} player - The VideoJS player instance
   */
  const configureVideoJSControls = (player) => {
    if (!player || typeof player.ready !== 'function') return;

    player.ready(() => {
      try {
        const controlBar = /** @type {VideoJSControlBar} */ (player.controlBar);
        if (!isValidControlBar(controlBar)) return;

        addPlaybackRateControl(controlBar, player);
        addFullscreenControl(controlBar, player);

        console.log('VideoJS control bar configured with fullscreen and playback rate controls');
      } catch (error) {
        console.warn('Error configuring VideoJS controls:', error);
      }
    });
  };

  /**
   * Validates if the control bar is available and has required methods
   * @param {VideoJSControlBar} controlBar - The VideoJS control bar
   * @return {boolean} Whether the control bar is valid
   */
  const isValidControlBar = (controlBar) => {
    if (!controlBar || typeof controlBar.addChild !== 'function') {
      console.warn('VideoJS control bar not available');
      return false;
    }
    return true;
  };

  /**
   * Adds playback rate control to the control bar
   * @param {VideoJSControlBar} controlBar - The VideoJS control bar
   * @param {VideoJSPlayer} player - The VideoJS player instance
   */
  const addPlaybackRateControl = (controlBar, player) => {
    const PlaybackRateMenuButton = (videojs.getComponent('PlaybackRateMenuButton'));
    if (!PlaybackRateMenuButton) return;

    const playbackRateMenu = new PlaybackRateMenuButton(player, {
      playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
    });

    const volumeControl = controlBar.getChild('VolumeControl');
    if (volumeControl) {
      const volumeIndex = controlBar.children().indexOf(volumeControl);
      controlBar.addChild(playbackRateMenu, {}, volumeIndex + 1);
    } else {
      controlBar.addChild(playbackRateMenu);
    }
  };

  /**
   * Adds fullscreen control to the control bar
   * @param {VideoJSControlBar} controlBar - The VideoJS control bar
   * @param {VideoJSPlayer} player - The VideoJS player instance
   */
  const addFullscreenControl = (controlBar, player) => {
    const FullscreenToggle = (videojs.getComponent('FullscreenToggle'));
    if (!FullscreenToggle) return;

    let fullscreenToggle = controlBar.getChild('FullscreenToggle');
    if (!fullscreenToggle) {
      fullscreenToggle = new FullscreenToggle(player);
      controlBar.addChild(fullscreenToggle);
    } else {
      fullscreenToggle.show();
    }
  };

  /**
   * Attempts to start autoplay if enabled
   * @param {VHLVideoFile} playerInstance - The video player instance
   */
  const attemptAutoPlay = (playerInstance) => {
    if (!useActivitySettingsStore().useAutoPlay) return;

    const dlStore = useDLStore();
    if (dlStore.isPlaying) return;

    if (playerInstance.videojs_player &&
        typeof playerInstance.videojs_player.play === 'function') {
      const playResult = playerInstance.videojs_player.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch((/** @type {Error} */ error) => {
          console.warn('Auto-play failed:', error);
        });
      }
    } else if (typeof playerInstance.play === 'function') {
      try {
        playerInstance.play();
      } catch (error) {
        console.warn('Auto-play failed:', error);
      }
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

  /**
   * Initialize video player using functional video pattern
   * @return {void}
   */
  const initializeVideoPlayer = () => {
    try {
      if (!videoContainer.value) {
        return;
      }

      const actionStore = useActionStore();
      const currentAction = actionStore.currentAction;

      if (!currentAction || currentAction.type !== 'video') {
        return;
      }

      const actionIndex = actionStore.currentActionIndex + 1;
      const selector = `.js-interactive-video-v2-segment-${actionIndex}-video`;

      const videoPlayerInstance = attachVideo(selector, videoContainer.value);

      if (videoPlayerInstance) {
        videoPlayer.value = /** @type {VHLVideoFile} */ (
          /** @type {unknown} */ (videoPlayerInstance)
        );

        setUpPlayerEvents(videoPlayerInstance);
        configureVideoJSControls(videoPlayerInstance.videojs_player);
        attemptAutoPlay(videoPlayerInstance);
      }
    } catch (error) {
      console.error('Error initializing video player:', error);
      videoPlayer.value = null;
      isPlaying.value = false;
    }
  };

  /**
   * Sets up video player event listeners
   * @param {VHLVideoFile} playerInstance - The video player instance
   */
  const setUpPlayerEvents = (playerInstance) => {
    if (!playerInstance.videojs_player) return;

    const player = playerInstance.videojs_player;

    if (typeof player.on === 'function') {
      player.on('ended', () => {
        isPlaying.value = false;
        if (typeof onEnded === 'function') {
          onEnded();
        }
      });

      player.on('pause', () => {
        isPlaying.value = false;
      });

      player.on('play', () => {
        isPlaying.value = true;
      });

      player.on('ratechange', () => {
        if (typeof player.playbackRate === 'function') {
          console.log('Playback rate changed to:', player.playbackRate());
        }
      });

      player.on('fullscreenchange', () => {
        if (typeof player.isFullscreen === 'function') {
          console.log('Fullscreen state changed:', player.isFullscreen());
        }
      });
    }
  };

  return {
    cleanupVideoPlayer,
    initializeVideoPlayer,
    isPlaying,
    videoPlayer,
  };
}