<template>
  <div :class="$style['interactive-video-player']">
    <div :class="$style['c-interactive-video']">
      <div :class="$style['c-interactive-video-video']">
        <div class="js-tutorial-container" ref="videoContainer"></div>
      </div>
    </div>

    <div :class="$style['video-controls']" v-if="showControls">
      <button @click="togglePlayPause" :class="$style['control-btn']">
        {{ isPlaying ? 'Pause' : 'Play' }}
      </button>
      <button @click="restart" :class="$style['control-btn']">Restart</button>
      <button @click="goToIntro" :class="$style['control-btn']">Back to Intro</button>
    </div>

    <QuickCheck />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { mainStore } from '../stores/main/main_store';
import { useQuickCheckStore } from '../stores/main/quick_check_store';
import { useVideoPlayer } from '../composables/use_video_player';
import QuickCheck from '../components/QuickCheck.vue';

const store = mainStore();
const quickCheckStore = useQuickCheckStore();

const videoContainer = ref(null);
const showControls = ref(true);

const {
  videoPlayer,
  isPlaying,
  initializeVideoPlayer,
  cleanupVideoPlayer,
  handleAutoPlay,
  setupCheckpoints,
  setupVideoEvents,
} = useVideoPlayer(store, quickCheckStore, videoContainer);

/**
 * Lifecycle hook: Initialize video player and event listeners on mount
 */
onMounted(() => {
  initializeVideoPlayer();
  setupEventListeners();

  if (store.activityInfo.quick_checks) {
    quickCheckStore.updateQuickCheckState({ quickChecks: store.activityInfo.quick_checks });
  }
});

/**
 * Lifecycle hook: Clean up video player and event listeners on unmount
 */
onUnmounted(() => {
  cleanupVideoPlayer();
  cleanupEventListeners();
});

/**
 * Watch for changes in auto-play setting
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
 * Toggle play/pause
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
 * Restart video
 */
const restart = () => {
  if (!videoPlayer.value) return;

  videoPlayer.value.currentTime(0);
  videoPlayer.value.play();
  isPlaying.value = true;
};

/**
 * Go back to the intro screen using the sequencer
 */
const goToIntro = () => {
  store.sequencer.goToScreen('intro');
};

/**
 * Set up global event listeners
 */
const setupEventListeners = () => {
  document.addEventListener('finishCheckpoint', handleFinishCheckpoint);
};

/**
 * Clean up event listeners
 */
const cleanupEventListeners = () => {
  document.removeEventListener('finishCheckpoint', handleFinishCheckpoint);
};

/**
 * Handle finish checkpoint event
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
