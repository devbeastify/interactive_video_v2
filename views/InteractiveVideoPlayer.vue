<template>
  <div :class="$style.interactiveVideoPlayer">
    <div :class="$style.cInteractiveVideo">
      <div :class="$style.cInteractiveVideoVideo">
        <div class="js-tutorial-container" ref="videoContainer"></div>
      </div>
    </div>

    <div :class="$style.videoControls" v-if="showControls">
      <button @click="togglePlayPause" :class="$style.controlBtn">
        {{ isPlaying ? 'Pause' : 'Play' }}
      </button>
      <button @click="restart" :class="$style.controlBtn">Restart</button>
      <button @click="goToIntro" :class="$style.controlBtn">Back to Intro</button>
    </div>

    <QuickCheck />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { mainStore } from '../stores/main/main_store';
import { useQuickCheckStore } from '../stores/main/quick_check_store';
import QuickCheck from '../components/QuickCheck.vue';

const store = mainStore();
const quickCheckStore = useQuickCheckStore();

const videoContainer = ref(null);
const videoPlayer = ref(null);
const isPlaying = ref(false);
const showControls = ref(true);

/**
 * Lifecycle hook: Initialize video player and event listeners on mount
 */
onMounted(() => {
  initializeVideoPlayer();
  setupEventListeners();

  if (store.activityInfo.quick_checks) {
    quickCheckStore.setQuickChecks(store.activityInfo.quick_checks);
  }
});

/**
 * Lifecycle hook: Clean up video player and event listeners on unmount
 */
onUnmounted(() => {
  if (videoPlayer.value) {
    videoPlayer.value.hide_video();
    videoPlayer.value = null;
  }
  cleanupEventListeners();
});

/**
 * Initialize the video player using VHL.Video.File
 */
const initializeVideoPlayer = () => {
  setTimeout(() => {
    if (videoContainer.value && store.activityInfo.reference.length > 0) {
      const videoData = store.activityInfo.reference[0];

      videoPlayer.value = new VHL.Video.File();

      const options = {
        videoContainer: videoContainer.value,
        sourceURL: videoData.video_path,
        fluid: true,
        videoTracks: createCaptionObject(videoData),
      };

      videoPlayer.value.init(options);
      videoPlayer.value.show_controls = true;
      videoPlayer.value.initialize_video();
      videoPlayer.value.show_video();

      if (quickCheckStore.hasQuickChecks) {
        setupCheckpoints();
      }

      setupVideoEvents();

      handleAutoPlay();
    }
  }, 100);
};

/**
 * Handle auto-play based on store setting
 */
const handleAutoPlay = () => {
  if (!videoPlayer.value) return;

  if (store.actionSettings.useAutoPlay) {
    const checkVideoReady = () => {
      if (videoPlayer.value && videoPlayer.value.videojs_player) {
        const player = videoPlayer.value.videojs_player;

        if (player.readyState() >= 1) {
          player
            .play()
            .then(() => {
              isPlaying.value = true;
            })
            .catch((error) => {
              console.warn('Auto-play failed:', error);
              isPlaying.value = false;
            });
        } else {
          setTimeout(checkVideoReady, 100);
        }
      }
    };

    setTimeout(checkVideoReady, 500);
  } else {
    isPlaying.value = false;
  }
};

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
 * Set up interactive checkpoints
 */
const setupCheckpoints = () => {
  if (!videoPlayer.value || !quickCheckStore.hasQuickChecks) return;

  const points = quickCheckStore.quickChecks.map((quickCheck) => ({
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

  videoPlayer.value.tutorialVideoCheckpointsPlugin(pluginSettings);
};

/**
 * Handle checkpoint reached event
 */
const handleCheckpointReached = (offset) => {
  if (videoPlayer.value) {
    videoPlayer.value.pause();
    isPlaying.value = false;
  }

  quickCheckStore.setCurrentOffset(offset);

  const pronunciationToggle = document.querySelector('.js-speech-rec-toggle');
  if (pronunciationToggle) {
    quickCheckStore.setPronunciationToggle(pronunciationToggle);
  }

  quickCheckStore.showQuickCheck();
};

/**
 * Create caption object for video tracks
 */
const createCaptionObject = (videoData) => {
  const arrayCaption = [];

  const enableClosedCaptions = document.getElementById(
    'enableClosedCaptions'
  )?.value;
  const allowForeign = document.getElementById('allowForeign')?.value;
  const allowEnglish = document.getElementById('allowEnglish')?.value;

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
 */
const setupVideoEvents = () => {
  if (!videoPlayer.value) return;

  videoPlayer.value.on('ended', () => {
    isPlaying.value = false;
  });

  videoPlayer.value.on('play', () => {
    isPlaying.value = true;
  });

  videoPlayer.value.on('pause', () => {
    isPlaying.value = false;
  });

  videoPlayer.value.on('loadedmetadata', () => {
    if (store.actionSettings.useAutoPlay && !isPlaying.value) {
      handleAutoPlay();
    }
  });
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
