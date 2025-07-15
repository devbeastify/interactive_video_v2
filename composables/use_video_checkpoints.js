// @ts-check

import { ref } from 'vue';

/**
 * @typedef {Object} Checkpoint
 * @property {number} offset - Time offset in seconds
 * @property {number} gap - Gap duration in seconds
 * @property {boolean} stop - Whether to stop playback at this point
 */

/**
 * @typedef {Object} VideoPlayer
 * @property {Function} tutorialVideoCheckpointsPlugin - Plugin for interactive checkpoints
 * @property {Function} play - Start video playback
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
 * @typedef {Object} VideoCheckpointsAPI
 * @property {import('vue').Ref<Checkpoint[]>} checkpoints - Array of checkpoints
 * @property {import('vue').Ref<Checkpoint|null>} currentCheckpoint - Current active checkpoint
 * @property {Function} setupCheckpoints - Set up interactive checkpoints
 * @property {Function} handleCheckpointReached - Handle checkpoint reached events
 * @property {Function} resumeVideo - Resume video playback
 */

/**
 * Composable to manage interactive video checkpoints.
 * Provides functionality for setting up and managing interactive checkpoints
 * during video playback.
 *
 * @return {VideoCheckpointsAPI} Video checkpoints API object
 */
export function useVideoCheckpoints() {
  /** @type {import('vue').Ref<Checkpoint[]>} */
  const checkpoints = ref([]);
  /** @type {import('vue').Ref<Checkpoint|null>} */
  const currentCheckpoint = ref(null);

  /**
   * Set up interactive checkpoints for the video
   * @param {VideoPlayer} videoPlayer - The video player instance
   * @param {Array<QuickCheck>} quickChecksData - Array of quick check data
   * @return {void}
   */
  const setupCheckpoints = (videoPlayer, quickChecksData) => {
    if (!videoPlayer || !quickChecksData) return;

    /** @type {Array<CheckpointPoint>} */
    const points = quickChecksData.map(/**
     * @param {QuickCheck} quickCheck - The quick check data
     * @return {CheckpointPoint} The checkpoint point object
     */ (quickCheck) => ({
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

    videoPlayer.tutorialVideoCheckpointsPlugin(pluginSettings);
  };

  /**
   * Handle checkpoint reached event
   * @param {number} offset - The offset of the reached checkpoint in seconds
   * @return {void}
   */
  const handleCheckpointReached = (offset) => {
    const checkpoint = checkpoints.value.find((cp) => cp.offset === offset);
    if (checkpoint) {
      currentCheckpoint.value = checkpoint;
    }
  };

  /**
   * Resume video after checkpoint and clear current checkpoint state
   * @param {VideoPlayer} videoPlayer - The video player instance
   * @return {void}
   */
  const resumeVideo = (videoPlayer) => {
    if (videoPlayer) {
      videoPlayer.play();
    }
    clearCurrentCheckpoint();
  };

  /**
   * Clear the current checkpoint state regardless of video player availability
   * @return {void}
   */
  const clearCurrentCheckpoint = () => {
    currentCheckpoint.value = null;
  };

  return {
    checkpoints,
    currentCheckpoint,
    setupCheckpoints,
    handleCheckpointReached,
    resumeVideo,
  };
}
