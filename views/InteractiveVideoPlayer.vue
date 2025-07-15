<template>
  <div>
    <div
      v-show="currentDirectionLine && !isQuickCheckVisible"
      :class="$style['interactive-video-player']">
      <DirectionLineComponent
        v-if="currentDirectionLine"
        :directionLine="currentDirectionLine"
        :stepIndex="currentStepIndex"
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
  </div>
</template>

<script setup>
// @ts-check

  import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
  import { mainStore } from '../stores/main/main_store';
  import { useQuickCheckStore } from '../stores/main/quick_check_store';
  import { useDirectionLineStore } from '../stores/main/direction_line_store';
  import { useActivitySettingsStore } from '../stores/main/activity_settings_store';
  import { useVideoPlayer } from '../composables/use_video_player';
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
  const directionLineStore = useDirectionLineStore();
  const activitySettingsStore = useActivitySettingsStore();

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
    resumeVideoAfterCheckpoint,
  } = useVideoPlayer(videoContainer);

  /**
   * Current step information for direction line
   */
  const currentStepIndex = ref(0);

  /**
   * Computed property for current direction line from store
   */
  const currentDirectionLine = computed(() => directionLineStore.currentLine);

  /**
   * Computed property to check if QuickCheck is visible
   * Used to conditionally hide other sections when QuickCheck is shown
   */
  const isQuickCheckVisible = computed(() => quickCheckStore.isVisible);

  /**
   * Determines if video should resume based on current state
   * @return {boolean} Whether video should resume
   */
  const shouldResumeVideo = () => {
    return activitySettingsStore.useAutoPlay &&
      !isQuickCheckVisible.value &&
      !directionLineStore.isPlaying;
  };

  /**
   * Resumes video playback if conditions are met
   * @return {void}
   */
  const resumeVideoIfConditionsMet = () => {
    if (videoPlayer.value && shouldResumeVideo()) {
      videoPlayer.value.play();
      isPlaying.value = true;
    }
  };

  /**
   * Lifecycle hook: Initialize video player and event listeners on mount
   * Sets up the video player, event listeners, and quick check state
   * @return {void}
   */
  onMounted(() => {
    console.log('InteractiveVideoPlayer mounted');
    initializeVideoPlayer();
    setupEventListeners();

    if (store.activityInfo.quick_checks) {
      quickCheckStore.updateQuickCheckState({
        quickChecks: store.activityInfo.quick_checks,
      });
    }

    initializeDirectionLine();
    document.addEventListener('quickCheckCompleted', handleQuickCheckCompleted);
  });

  /**
   * Lifecycle hook: Clean up video player and event listeners on unmount
   * Ensures proper cleanup of resources to prevent memory leaks
   * @return {void}
   */
  onUnmounted(() => {
    try {
      cleanupVideoPlayer();
      directionLineStore.cleanupDirectionLine();
      document.removeEventListener('quickCheckCompleted', handleQuickCheckCompleted);
    } catch (error) {
      console.warn('Error during component cleanup:', error);
    }
  });

  /**
   * Handle quick check completion
   * @return {void}
   */
  const handleQuickCheckCompleted = () => {
    resumeVideoAfterCheckpoint();
  };

  /**
   * Initialize direction line for the current step
   * @return {void}
   */
  const initializeDirectionLine = () => {
    store.initializeDirectionLineForStep('player');
  };

  /**
   * Handle direction line play event
   * @return {void}
   */
  const handleDirectionLinePlay = () => {
    console.log('Main direction line started playing, pausing video');
    if (videoPlayer.value && isPlaying.value) {
      videoPlayer.value.pause();
      isPlaying.value = false;
    }
  };

  /**
   * Handle direction line pause event
   * @return {void}
   */
  const handleDirectionLinePause = () => {
    console.log('Main direction line paused');
    resumeVideoIfConditionsMet();
  };

  /**
   * Handle direction line audio ended event
   * @return {void}
   */
  const handleDirectionLineAudioEnded = () => {
    console.log('Main direction line audio ended, resuming video');
    resumeVideoIfConditionsMet();
  };

  /**
   * Watch for changes in auto-play setting and handle accordingly
   * Automatically plays or pauses video based on the auto-play setting
   * @return {void}
   */
  watch(() => activitySettingsStore.useAutoPlay, (newValue) => {
    if (videoPlayer.value) {
      if (newValue) {
        handleAutoPlay();
      } else {
        videoPlayer.value.pause();
        isPlaying.value = false;
      }
    }
  });

  /**
   * Watch for quick check completion and resume video
   * @return {void}
   */
  watch(() => quickCheckStore.isVisible, (isVisible) => {
    if (!isVisible && quickCheckStore.isComplete) {
      resumeVideoAfterCheckpoint();
    }
  });

  /**
   * Set up event listeners for video player
   * @return {void}
   */
  const setupEventListeners = () => {
    if (videoPlayer.value) {
      setupVideoEvents();
      setupCheckpoints();
    }
  };

  /**
   * Toggle play/pause state of the video
   * @return {void}
   */
  const togglePlayPause = () => {
    if (!videoPlayer.value) return;

    if (isPlaying.value) {
      videoPlayer.value.pause();
      isPlaying.value = false;
    } else {
      videoPlayer.value.play()
        .then(() => {
          isPlaying.value = true;
        })
        .catch((/** @type {Error} */ error) => {
          console.error('Failed to play video:', error);
        });
    }
  };

  /**
   * Restart the video from the beginning
   * @return {void}
   */
  const restart = () => {
    if (!videoPlayer.value) return;

    if (videoPlayer.value.videojs_player) {
      videoPlayer.value.videojs_player.currentTime(0);
      videoPlayer.value.videojs_player.play();
      isPlaying.value = true;
    } else {
      videoPlayer.value.destroy();
      setTimeout(() => {
        initializeVideoPlayer();
      }, 100);
    }
  };

  /**
   * Navigate back to the intro screen
   * @return {void}
   */
  const goToIntro = () => {
    store.sequencer.goToScreen('intro');
  };
</script>

<style lang="scss" module>
@use 'MusicV3/v3/styles/base' as base;

.interactive-video-player {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: base.rpx(16);
}

.c-interactive-video {
  width: 100%;
  max-width: base.rpx(800);
  margin: base.rpx(16) 0;
}

.c-interactive-video-video {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 56.25%;
  background: #000;
  border-radius: base.rpx(8);
  overflow: hidden;
}

.video-controls {
  display: flex;
  gap: base.rpx(16);
  margin-top: base.rpx(16);
}

.control-btn {
  padding: base.rpx(8) base.rpx(16);
  background: #007bff;
  color: white;
  border: none;
  border-radius: base.rpx(4);
  cursor: pointer;
  font-size: base.rpx(14);

  &:hover {
    background: #0056b3;
  }
}
</style>
