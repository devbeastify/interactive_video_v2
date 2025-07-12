<template>
  <div v-show="currentDirectionLine && !isQuickCheckVisible"
    :class="$style['interactive-video-player']">
    <!-- Direction Line for current step -->
    <DirectionLineComponent
      v-if="currentDirectionLine"
      :direction-line="currentDirectionLine"
      :step-index="currentStepIndex"
      @play="handleDirectionLinePlay"
      @pause="handleDirectionLinePause"
      @audio-ended="handleDirectionLineAudioEnded" />

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
  <QuickCheck />
</template>

<script setup>
// @ts-check

  import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
  import { mainStore } from '../stores/main/main_store';
  import { useQuickCheckStore } from '../stores/main/quick_check_store';
  import { useVideoPlayer } from '../composables/use_video_player';
  import { DirectionLine } from '../stores/main/direction_line';
  import QuickCheck from '../components/QuickCheck.vue';
  import DirectionLineComponent from '../components/DirectionLine.vue';

  /**
   * @typedef {import('../composables/use_video_player').VideoPlayer} VideoPlayer
   * @typedef {import('../composables/use_video_player').VideoPlayerAPI} VideoPlayerAPI
   */

  /**
   * @typedef {Object} StepData
   * @property {string} id
   * @property {string} type
   * @property {string} directionLine
   * @property {boolean} isNew
   * @property {string} languageCode
   */

  const store = mainStore();
  const quickCheckStore = useQuickCheckStore();

  /** @type {import('vue').Ref<HTMLElement|null>} */
  const videoContainer = ref(null);
  /** @type {import('vue').Ref<boolean>} */
  const showControls = ref(true);

  /**
   * Video player API from the useVideoPlayer composable
   * @type {VideoPlayerAPI}
   */
  const {
    videoPlayer,
    isPlaying,
    initializeVideoPlayer,
    cleanupVideoPlayer,
    handleAutoPlay,
    setupCheckpoints,
    setupVideoEvents,
    handleCheckpointReached,
  } = useVideoPlayer(videoContainer);

  /**
   * Current step information for direction line
   */
  const currentStepIndex = ref(0);

  /**
   * Computed property for current direction line from store
   */
  const currentDirectionLine = computed(() => store.currentDirectionLine);

  /**
   * Computed property to check if QuickCheck is visible
   * Used to conditionally hide other sections when QuickCheck is shown
   */
  const isQuickCheckVisible = computed(() => quickCheckStore.isVisible);

  /**
   * Lifecycle hook: Initialize video player and event listeners on mount
   * Sets up the video player, event listeners, and quick check state
   * @return {void}
   */
  onMounted(() => {
    initializeVideoPlayer();
    setupEventListeners();

    if (store.activityInfo.quick_checks) {
      quickCheckStore.updateQuickCheckState({ quickChecks: store.activityInfo.quick_checks });
    }

    // Initialize direction line for current step
    initializeDirectionLine();
  });

  /**
   * Lifecycle hook: Clean up video player and event listeners on unmount
   * Ensures proper cleanup of resources to prevent memory leaks
   * @return {void}
   */
  onUnmounted(() => {
    cleanupVideoPlayer();
    cleanupEventListeners();
    store.cleanupDirectionLine();
  });

  /**
   * Initialize direction line for the current step
   */
  const initializeDirectionLine = () => {
    // Use centralized DL logic from store
    store.initializeDirectionLineForStep('player');
  };

  /**
   * Handle direction line play event
   */
  const handleDirectionLinePlay = () => {
    // Pause video when direction line audio starts
    if (videoPlayer.value && isPlaying.value) {
      videoPlayer.value.pause();
      isPlaying.value = false;
    }
  };

  /**
   * Handle direction line pause event
   */
  const handleDirectionLinePause = () => {
    // Resume video if autoplay is enabled
    if (videoPlayer.value && store.actionSettings.useAutoPlay) {
      videoPlayer.value.play();
      isPlaying.value = true;
    }
  };

  /**
   * Handle direction line audio ended event
   */
  const handleDirectionLineAudioEnded = () => {
    // Resume video if autoplay is enabled
    if (videoPlayer.value && store.actionSettings.useAutoPlay) {
      videoPlayer.value.play();
      isPlaying.value = true;
    }
  };

  /**
   * Watch for changes in auto-play setting and handle accordingly
   * Automatically plays or pauses video based on the auto-play setting
   * @return {void}
   */
  watch(
    () => store.actionSettings.useAutoPlay,
    (newValue) => {
      if (videoPlayer.value) {
        if (newValue && !isPlaying.value) {
          handleAutoPlay();
        } else if (!newValue && isPlaying.value) {
          videoPlayer.value.pause();
          isPlaying.value = false;
        }
      }
    }
  );

  /**
   * Toggle between play and pause states
   * Handles the play/pause button click functionality
   * @return {void}
   */
  const togglePlayPause = () => {
    if (!videoPlayer.value) return;

    if (isPlaying.value) {
      videoPlayer.value.pause();
    } else {
      videoPlayer.value.play();
    }
  };

  /**
   * Restart video playback from the beginning
   * Uses the underlying videojs_player if available for more precise control
   * @return {void}
   */
  const restart = () => {
    if (!videoPlayer.value) return;

    if (hasVideoJsPlayer()) {
      restartWithVideoJsPlayer();
    }
  };

  /**
   * Check if the video player has an underlying videojs_player available
   * @return {boolean} True if videojs_player is available and functional
   */
  const hasVideoJsPlayer = () => {
    return videoPlayer.value?.videojs_player &&
      typeof videoPlayer.value.videojs_player.currentTime === 'function';
  };

  /**
   * Restart video using the videojs_player's currentTime method
   * Provides more precise control over video playback position
   * @return {void}
   */
  const restartWithVideoJsPlayer = () => {
    if (!videoPlayer.value?.videojs_player) return;

    videoPlayer.value.videojs_player.currentTime(0);
    videoPlayer.value.videojs_player.play();
    isPlaying.value = true;
  };

  /**
   * Navigate back to the intro screen using the sequencer
   * Allows users to return to the beginning of the interactive experience
   * @return {void}
   */
  const goToIntro = () => {
    store.sequencer.goToScreen('intro');
  };

  /**
   * Set up global event listeners for video player interactions
   * Listens for custom events like checkpoint completion
   * @return {void}
   */
  const setupEventListeners = () => {
    document.addEventListener('finishCheckpoint', handleFinishCheckpoint);
  };

  /**
   * Clean up global event listeners to prevent memory leaks
   * Removes all event listeners added by this component
   * @return {void}
   */
  const cleanupEventListeners = () => {
    document.removeEventListener('finishCheckpoint', handleFinishCheckpoint);
  };

  /**
   * Handle finish checkpoint event from QuickCheck component
   * Resumes video playback if auto-play is enabled after checkpoint completion
   * @return {void}
   */
  const handleFinishCheckpoint = () => {
    if (videoPlayer.value && store.actionSettings.useAutoPlay) {
      videoPlayer.value.play();
      isPlaying.value = true;
    }
  };
</script>

<style lang="scss" module>
@use 'MusicV3/v3/styles/base' as base;

.interactive-video-player {
  width: 100%;
  max-width: base.rpx(1200);
  margin: 0 auto;
  padding: base.rpx(16);
}

.c-interactive-video {
  position: relative;
  width: 100%;
}

.c-interactive-video-video {
  position: relative;
  width: 100%;
}

.js-tutorial-container {
  width: 100%;
  min-height: base.rpx(400);
  background: #000;
}

.video-controls {
  display: flex;
  gap: base.rpx(16);
  justify-content: center;
  margin-top: base.rpx(16);
}

.control-btn {
  padding: base.rpx(8) base.rpx(24);
  border: none;
  border-radius: base.rpx(4);
  font-size: base.rpx(16);
  font-weight: 600;
  cursor: pointer;
  background-color: var(--global-button-background-primary, #252525);
  color: var(--global-button-text-primary, #fff);
  transition: background-color 0.3s ease;

  &:hover:not(:disabled) {
    background-color: var(--global-button-background-primary-hover, #1f7069);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}
</style>
