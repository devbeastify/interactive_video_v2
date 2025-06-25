import { ref } from 'vue';

// Composable to manage interactive video checkpoints
export function useVideoCheckpoints() {
  const checkpoints = ref([]);
  const currentCheckpoint = ref(null);

  /**
   * Set up interactive checkpoints for the video
   */
  const setupCheckpoints = (videoPlayer, quickChecksData) => {
    if (!videoPlayer || !quickChecksData) return;

    const points = quickChecksData.map((quickCheck) => ({
      offset: quickCheck.offset,
      gap: quickCheck.gap,
      stop: true,
    }));

    const pluginSettings = {
      minScrubberPixels: 4,
      callback: (event) => {
        handleCheckpointReached(event.offset);
      },
      points: points,
    };

    videoPlayer.tutorialVideoCheckpointsPlugin(pluginSettings);
  };

  /**
   * Handle checkpoint reached event
   */
  const handleCheckpointReached = (offset) => {
    const checkpoint = checkpoints.value.find((cp) => cp.offset === offset);
    if (checkpoint) {
      currentCheckpoint.value = checkpoint;
    }
  };

  /**
   * Resume video after checkpoint
   */
  const resumeVideo = (videoPlayer) => {
    if (videoPlayer) {
      videoPlayer.play();
    }
    // Always clear currentCheckpoint regardless of videoPlayer
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
