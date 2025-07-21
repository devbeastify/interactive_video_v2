<template>
  <div>
    <!-- Video Step -->
    <div
      v-show="store.isCurrentEntryVideo && !isQuickCheckVisible"
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

    <!-- Quick Check Step -->
    <div
      v-show="store.isCurrentEntryQuickCheck"
      :class="$style['quick-check-step']">
      <div :class="$style['quick-check-header']">
        Activity {{ /** @type {any} */ (store.currentEntry)?.index + 1 }}
      </div>
      <div :class="$style['quick-check-content']">
        <!-- Quick check content will be rendered here -->
        <div v-if="/** @type {any} */ (store.currentEntry)?.data?.quick_check_content" v-html="/** @type {any} */ (store.currentEntry).data.quick_check_content"></div>
      </div>
      <button
        type="button"
        :class="$style['continue-button']"
        @click="completeQuickCheck">
        Continue
      </button>
    </div>

    <!-- Original QuickCheck component for compatibility -->
    <QuickCheck v-show="false" />
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
    initializeVideoPlayer();

    if (store.activityInfo.quick_checks) {
      quickCheckStore.updateQuickCheckState({
        quickChecks: store.activityInfo.quick_checks,
      });
    }

    initializeDirectionLine();
    document.addEventListener('quickCheckCompleted', handleQuickCheckCompleted);
  });

  /**
   * Watch for changes in current entry and reinitialize video player
   * This ensures proper sequential flow when advancing through entries
   */
  watch(() => store.currentEntry, (newEntry, oldEntry) => {
    if (newEntry && /** @type {any} */ (newEntry).type === 'video') {
      // Show video controls for video entries
      showControls.value = true;
      
      // Clean up previous video player
      cleanupVideoPlayer();
      
      // Initialize new video player for current entry
      setTimeout(() => {
        initializeVideoPlayer();
      }, 100);
    } else if (newEntry && /** @type {any} */ (newEntry).type === 'quick_check') {
      // Hide video controls for quick check entries
      showControls.value = false;
    }
  }, { immediate: false });

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
    // The functional video pattern handles video progression internally
    // Original logic is preserved - quick check completion doesn't automatically resume video
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
        videoPlayer.value.play();
        isPlaying.value = true;
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
      // The functional video pattern handles video progression internally
      // Original logic is preserved - quick check completion doesn't automatically resume video
    }
  });

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

  /**
   * Complete the quick check step
   * @return {void}
   */
  const completeQuickCheck = () => {
    quickCheckStore.completeQuickCheck();
    // The completeQuickCheck method already handles advancing to the next entry
  };
</script>

<style lang="scss" module>
.interactive-video-player {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start; /* Changed from center to flex-start */
  //padding: 16px;
  min-height: 100vh; /* Ensure full height */
  overflow: visible; /* Ensure controls are not cut off */
}

.c-interactive-video {
  width: 100%;
  max-width: 800px;
  //margin: 16px 0;
}

.c-interactive-video-video {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 56.25%;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}

.video-controls {
  display: flex;
  gap: 16px;
  margin-top: 16px;
  margin-bottom: 16px; /* Added bottom margin */
  justify-content: center; /* Center the controls */
  flex-wrap: wrap; /* Allow wrapping on small screens */
  position: relative; /* Ensure controls stay in view */
  z-index: 10; /* Ensure controls are above other elements */
}

.control-btn {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  min-width: 80px; /* Ensure minimum button width */

  &:hover {
    background: #0056b3;
  }
}

.quick-check-step {
  width: 100%;
  max-width: 800px;
  margin: 16px 0;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.1);
}

.quick-check-header {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 16px;
  text-align: center;
}

.quick-check-content {
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 24px;
  text-align: justify;
}

.continue-button {
  display: block;
  margin: 0 auto;
  padding: 12px 24px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;

  &:hover {
    background: #218838;
  }
}
</style>
