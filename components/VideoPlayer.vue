<template>
  <div
    :class="[
      $style['video-player'],
      testClass('initialized')
    ]">
    <div :class="$style['c-interactive-video']">
      <div :class="$style['c-interactive-video-video']">
        <div ref="videoContainer" class="js-tutorial-container" />
      </div>
    </div>

    <div v-if="showControls" :class="$style['video-controls']">
      <button :class="$style['control-btn']" @click="togglePlayPause">
        {{ isPlaying ? 'Pause' : 'Play' }}
      </button>
      <button :class="$style['control-btn']" @click="restart">
        Restart
      </button>
      <button :class="$style['control-btn']" @click="goToIntro">
        Back to Intro
      </button>
    </div>
  </div>
</template>

<script setup>
// @ts-check

  import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
  import { mainStore } from '../stores/main_store';
  import { useActionStore } from '../stores/action_store';
  import { useActivitySettingsStore } from '../stores/activity_settings_store';
  import { useVideoPlayer } from '../composables/use_video_player';
  import { testClass } from 'music';

  /**
   * @typedef {import('../composables/use_video_player').VideoPlayerAPI} VideoPlayerAPI
   * @typedef {import('../stores/action_store').Action} Action
   */

  const emit = defineEmits(['video-ended']);

  /**
   * Props for the component
   */
  const props = defineProps({
    preventInitialization: {
      type: Boolean,
      default: false,
    },
  });

  const store = mainStore();
  const actionStore = useActionStore();
  const activitySettingsStore = useActivitySettingsStore();

  const videoContainer = ref(null);
  const showControls = ref(true);

  /**
   * Handles video ended event
   */
  const onVideoEnded = () => {
    document.dispatchEvent(
      new CustomEvent(
        'progressBarElementEnabled',
        { detail: { elementIndex: actionStore.currentActionIndex }}
      )
    );
    emit('video-ended');
  };

  const {
    videoPlayer,
    isPlaying,
    initializeVideoPlayer,
    cleanupVideoPlayer,
  } = /** @type {VideoPlayerAPI} */ (useVideoPlayer(videoContainer, onVideoEnded));

  const shouldAutoPlay = computed(() => activitySettingsStore.useAutoPlay);
  const isVideoAction = computed(() =>
    /** @type {import('../stores/action_store').Action} */
    (actionStore.currentAction)?.type === 'video'
  );

  /**
   * Checks if video can be controlled
   * @return {boolean} Whether video controls are available
   */
  const canControlVideo = () => {
    if (!videoPlayer.value) return false;
    return true;
  };

  /**
   * Plays video using videojs player if available, otherwise falls back to direct play
   * @param {boolean} shouldSetPlayingState - Whether to update the playing state
   */
  const playVideo = (shouldSetPlayingState = true) => {
    if (!videoPlayer.value) return;
    if ('videojs_player' in videoPlayer.value) {
      const player =
        /** @type {{ play: () => Promise<void> }} */
        (videoPlayer.value.videojs_player);
      player.play()
        .then(() => {
          if (shouldSetPlayingState) {
            isPlaying.value = true;
          }
        })
        .catch((error) => {
          console.error('Failed to play video:', error);
        });
    } else {
      try {
        const player = /** @type {{ play: () => Promise<void> }} */ (videoPlayer.value);
        player.play()
          .then(() => {
            if (shouldSetPlayingState) {
              isPlaying.value = true;
            }
          })
          .catch((error) => {
            throw error;
          });
      } catch (error) {
        console.error('Failed to play video:', error);
      }
    }
  };

  /**
   * Pauses video using videojs player if available, otherwise falls back to direct pause
   * @param {boolean} shouldSetPlayingState - Whether to update the playing state
   */
  const pauseVideo = (shouldSetPlayingState = true) => {
    if (!videoPlayer.value) return;
    if ('videojs_player' in videoPlayer.value) {
      const player = /** @type {{ videojs_player: { pause: () => void } }} */ (videoPlayer.value);
      player.videojs_player.pause();
    } else {
      const player = /** @type {{ pause: () => void }} */ (videoPlayer.value);
      player.pause();
    }

    if (shouldSetPlayingState) {
      isPlaying.value = false;
    }
  };

  /**
   * Starts video playback if autoplay is enabled
   */
  const startVideoPlayback = () => {
    if (videoPlayer.value && shouldAutoPlay.value) {
      playVideo();
    }
  };

  /**
   * Waits for video element to be ready and starts playback
   */
  const waitForVideoElement = () => {
    if (videoPlayer.value) {
      startVideoPlayback();
    } else {
      setTimeout(waitForVideoElement, 100);
    }
  };

  /**
   * Starts the playback sequence based on current action and DL availability
   */
  const startPlaybackSequence = () => {
    if (!actionStore.currentActionIsVideo) return;

    setTimeout(waitForVideoElement, 200);
  };

  /**
   * Initializes the video system for the current action
   */
  const initializeVideoSystem = () => {
    if (!isVideoAction.value) return;

    startPlaybackSequence();
  };

  /**
   * Toggles video play/pause state
   */
  const togglePlayPause = () => {
    if (!canControlVideo()) return;

    if (isPlaying.value) {
      pauseVideo();
    } else {
      playVideo();
    }
  };

  /**
   * Restarts video playback
   */
  const restart = () => {
    if (!canControlVideo()) return;

    if (videoPlayer.value && 'videojs_player' in videoPlayer.value) {
      videoPlayer.value.videojs_player.currentTime(0);
      videoPlayer.value.videojs_player.play();
      isPlaying.value = true;
    } else if (videoPlayer.value && 'destroy' in videoPlayer.value) {
      videoPlayer.value.destroy();
      setTimeout(initializeVideoPlayer, 100);
    }
  };

  /**
   * Navigates back to intro screen
   */
  const goToIntro = () => {
    store.sequencer.goToScreen('intro');
  };

  /**
   * Handles action changes and reinitializes video system
   * @param {Action|null} newAction - The new action object
   */
  const handleActionChange = (newAction) => {
    if (newAction?.type === 'video') {
      showControls.value = true;

      cleanupVideoPlayer();

      setTimeout(() => {
        initializeVideoPlayer();
        initializeVideoSystem();
      }, 100);
    } else if (newAction?.type === 'quick_check') {
      showControls.value = false;
    }
  };

  /**
   * Handles autoplay setting changes
   * @param {boolean} newValue - The new autoplay value
   */
  const handleAutoPlayChange = (newValue) => {
    if (!videoPlayer.value) return;

    if (newValue) {
      playVideo();
    } else {
      pauseVideo();
    }
  };

  watch(() => actionStore.currentAction, handleActionChange);
  watch(() => activitySettingsStore.useAutoPlay, handleAutoPlayChange);
  watch(() => !actionStore.currentActionIsVideo, () => {
    cleanupVideoPlayer();
  });

  onMounted(() => {
    if (!props.preventInitialization) {
      initializeVideoPlayer();
      initializeVideoSystem();
    }
  });

  onUnmounted(() => {
    try {
      cleanupVideoPlayer();
    } catch (error) {
      console.warn('Error during component cleanup:', error);
    }
  });
</script>

<style lang="scss" module>
.video-player {
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  min-height: 100vh;
  overflow: visible;
}

.c-interactive-video {
  max-width: 800px;
  width: 100%;
}

.c-interactive-video-video {
  background: #000;
  border-radius: 8px;
  height: 0;
  overflow: hidden;
  padding-bottom: 56.25%;
  position: relative;
  width: 100%;
}

.video-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
  margin: 16px 0;
  position: relative;
  z-index: 10;
}

.control-btn {
  background: #007bff;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  font-size: 14px;
  min-width: 80px;
  padding: 8px 16px;

  &:hover {
    background: #0056b3;
  }
}
</style>