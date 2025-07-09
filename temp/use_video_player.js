// @ts-check

import { ref } from 'vue';
import { mainStore } from '../stores/main/main_store';
import { useQuickCheckStore } from '../stores/main/quick_check_store';

/**
 * @typedef {Object} VideoJSPlayer
 * @property {Function} on - Add event listener
 * @property {Function} off - Remove event listener
 * @property {Function} play - Start video playback
 * @property {Function} pause - Pause video playback
 * @property {Function} readyState - Get current ready state
 * @property {Function} currentTime - Get or set current playback time
 */

/**
 * @typedef {Object} VideoPlayer
 * @property {Function} init - Initialize the video player
 * @property {boolean} show_controls - Whether to show video controls
 * @property {Function} initialize_video - Initialize video component
 * @property {Function} show_video - Display the video element
 * @property {Function} hide_video - Hide the video element
 * @property {Function} play - Start video playback
 * @property {Function} pause - Pause video playback
 * @property {Function} destroy - Clean up video player resources
 * @property {VideoJSPlayer} videojs_player - Underlying VideoJS player instance
 * @property {Function} tutorialVideoCheckpointsPlugin - Plugin for interactive checkpoints
 */

/**
 * @typedef {Object} VideoData
 * @property {string} video_path - Path to the video file
 * @property {string|null} english_subtitles_path - Path to English subtitle file
 * @property {string|null} foreign_subtitles_path - Path to foreign language subtitle file
 * @property {string} foreign_language - Code for the foreign language
 */

/**
 * @typedef {Object} CaptionTrack
 * @property {string} src - Source URL for the caption track
 * @property {string} kind - Type of track (e.g., 'captions', 'subtitles')
 * @property {string} srclang - Source language code
 * @property {string} label - Display label for the track
 */

/**
 * @typedef {Object} VideoOptions
 * @property {HTMLElement} videoContainer - Container element for the video
 * @property {string} sourceURL - URL of the video source
 * @property {boolean} fluid - Whether the video should be fluid/responsive
 * @property {Array<CaptionTrack>} videoTracks - Array of caption tracks
 */

/**
 * @typedef {Object} CheckpointPoint
 * @property {number} offset - Time offset in seconds
 * @property {number} gap - Gap duration in seconds
 * @property {boolean} stop - Whether to stop playback at this point
 */

/**
 * @typedef {Object} PluginSettings
 * @property {number} minScrubberPixels - Minimum pixels for scrubber functionality
 * @property {Function} callback - Callback function for checkpoint events
 * @property {Array<CheckpointPoint>} points - Array of checkpoint points
 */

/**
 * @typedef {Object} CheckpointEvent
 * @property {number} offset - Time offset of the reached checkpoint
 */

/**
 * @typedef {Object} QuickCheck
 * @property {number} offset - Time offset in seconds
 * @property {number} gap - Gap duration in seconds
 */

/**
 * @typedef {Object} VideoPlayerAPI
 * @property {import('vue').Ref<VideoPlayer|null>} videoPlayer - Video player instance
 * @property {import('vue').Ref<boolean>} isPlaying - Current playing state
 * @property {Function} initializeVideoPlayer - Initialize the video player
 * @property {Function} cleanupVideoPlayer - Clean up video player resources
 * @property {Function} handleAutoPlay - Handle auto-play functionality
 * @property {Function} setupCheckpoints - Set up interactive checkpoints
 * @property {Function} handleCheckpointReached - Handle checkpoint reached events
 * @property {Function} setupVideoEvents - Set up video event listeners
 */

/**
 * useVideoPlayer composable for managing video player logic.
 * Provides functionality for initializing, controlling, and managing video playback
 * with interactive checkpoints and caption support.
 *
 * @param {import('vue').Ref<HTMLElement|null>} videoContainer - The video container ref
 * @return {VideoPlayerAPI} Video player API object
 */
export function useVideoPlayer(videoContainer) {
  /** @type {import('vue').Ref<VideoPlayer|null>} */
  const videoPlayer = ref(null);
  /** @type {import('vue').Ref<boolean>} */
  const isPlaying = ref(false);

  /**
   * Initialize the video player using VHL.Video.File
   * @return {void}
   */
  const initializeVideoPlayer = () => {
    setTimeout(() => {
      if (videoContainer.value && mainStore().activityInfo.reference.length > 0) {
        /** @type {VideoData} */
        const videoData = mainStore().activityInfo.reference[0];

        try {
          // @ts-expect-error - VHL.Video.File constructor returns a different type
          videoPlayer.value = new VHL.Video.File();

          /** @type {VideoOptions} */
          const options = {
            videoContainer: videoContainer.value,
            sourceURL: videoData.video_path,
            fluid: true,
            videoTracks: createCaptionObject(videoData),
          };

          if (videoPlayer.value) {
            videoPlayer.value.init(options);
            videoPlayer.value.show_controls = true;
            videoPlayer.value.initialize_video();
            
            // Add error handling for show_video
            try {
              videoPlayer.value.show_video();
            } catch (error) {
              console.warn('Failed to show video:', error);
            }
          }

          if (useQuickCheckStore().hasQuickChecks) {
            setupCheckpoints();
          }

          setupVideoEvents();

          handleAutoPlay();
        } catch (error) {
          console.error('Failed to initialize video player:', error);
        }
      }
    }, 100);
  };

  /**
   * Handle auto-play based on browser support
   * @return {void}
   */
  const handleAutoPlay = () => {
    if (!videoPlayer.value) return;

    const checkVideoReady = () => {
      if (videoPlayer.value && videoPlayer.value.videojs_player) {
        /** @type {VideoJSPlayer} */
        const player = videoPlayer.value.videojs_player;

        if (player.readyState() >= 1) {
          player
            .play()
            .then(() => {
              isPlaying.value = true;
            })
            .catch(/** @param {Error} error */ (error) => {
              console.warn('Auto-play failed:', error);
              isPlaying.value = false;
            });
        } else {
          setTimeout(checkVideoReady, 100);
        }
      }
    };

    setTimeout(checkVideoReady, 500);
  };

  /**
   * Set up interactive checkpoints
   * @return {void}
   */
  const setupCheckpoints = () => {
    if (!videoPlayer.value || !useQuickCheckStore().hasQuickChecks) return;

    /** @type {Array<CheckpointPoint>} */
    const points = useQuickCheckStore().quickChecks
      .map(/** @param {QuickCheck} quickCheck */ (quickCheck) => ({
        offset: quickCheck.offset,
        gap: quickCheck.gap,
        stop: true,
      }));

    /** @type {PluginSettings} */
    const pluginSettings = {
      minScrubberPixels: 4,
      callback: /** @param {CheckpointEvent} event */ (event) => {
        handleCheckpointReached(event.offset);
      },
      points: points,
    };

    if (videoPlayer.value) {
      videoPlayer.value.tutorialVideoCheckpointsPlugin(pluginSettings);
    }
  };

  /**
   * Handle checkpoint reached event
   * @param {number} offset - The offset of the reached checkpoint in seconds
   * @return {void}
   */
  const handleCheckpointReached = (offset) => {
    if (videoPlayer.value) {
      videoPlayer.value.pause();
      isPlaying.value = false;
    }

    const quickCheckStore = useQuickCheckStore();
    // @ts-expect-error - currentOffset can be number in practice
    quickCheckStore.currentOffset = offset;

    const pronunciationToggle = document.querySelector('.js-speech-rec-toggle');
    if (pronunciationToggle) {
      // @ts-expect-error - pronunciationToggle can be Element in practice
      quickCheckStore.pronunciationToggle = pronunciationToggle;
    }

    quickCheckStore.showQuickCheck();
  };

  /**
   * Create caption object for video tracks
   * @param {VideoData} videoData - The video data object
   * @return {Array<CaptionTrack>} Array of caption tracks
   */
  const createCaptionObject = (videoData) => {
    /** @type {Array<CaptionTrack>} */
    const arrayCaption = [];

    const enableClosedCaptions = /** @type {HTMLInputElement|null} */ (document.getElementById(
      'enableClosedCaptions'
    ))?.value;
    const allowForeign = /** @type {HTMLInputElement|null} */
      (document.getElementById('allowForeign'))?.value;
    const allowEnglish = /** @type {HTMLInputElement|null} */
      (document.getElementById('allowEnglish'))?.value;

    if (enableClosedCaptions === 'true') {
      if (videoData.english_subtitles_path && allowEnglish === 'true') {
        arrayCaption.push({
          src: videoData.english_subtitles_path,
          kind: 'captions',
          srclang: 'en',
          label: 'English',
        });
      }

      if (videoData.foreign_subtitles_path && allowForeign === 'true') {
        arrayCaption.push({
          src: videoData.foreign_subtitles_path,
          kind: 'captions',
          srclang: videoData.foreign_language,
          label: 'Foreign',
        });
      }
    }

    return arrayCaption;
  };

  /**
   * Set up video event listeners
   * @return {void}
   */
  const setupVideoEvents = () => {
    if (!videoPlayer.value || !videoPlayer.value.videojs_player) return;

    /** @type {VideoJSPlayer} */
    const player = videoPlayer.value.videojs_player;

    player.on('ended', () => {
      isPlaying.value = false;
    });

    player.on('play', () => {
      isPlaying.value = true;
    });

    player.on('pause', () => {
      isPlaying.value = false;
    });
  };

  /**
   * Clean up video player resources
   * @return {void}
   */
  const cleanupVideoPlayer = () => {
    if (videoPlayer.value) {
      videoPlayer.value.hide_video();
      videoPlayer.value = null;
    }
  };

  return {
    videoPlayer,
    isPlaying,
    initializeVideoPlayer,
    cleanupVideoPlayer,
    handleAutoPlay,
    setupCheckpoints,
    handleCheckpointReached,
    setupVideoEvents,
  };
}
