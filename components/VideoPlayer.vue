<template>
    <div :class="$style['video-player']">
      <!-- DL Component for video -->
      <DirectionLine 
        v-if="dlStore.hasDL"
        :dl-text="dlStore.currentDLText"
        :is-playing="dlStore.isPlaying" />
      
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
  import { useDLStore } from '../stores/direction_line_store';
  import { useVideoPlayer } from '../composables/use_video_player';
  import { eventDispatcher, DL_EVENTS } from '../lib/event_dispatcher';
  import DirectionLine from './DirectionLine.vue';
  
  const emit = defineEmits(['video-ended']);
  
  /**
   * @typedef {import('../composables/use_video_player').VideoPlayerAPI} VideoPlayerAPI
   */
  
  // Store instances
  const store = mainStore();
  const actionStore = useActionStore();
  const activitySettingsStore = useActivitySettingsStore();
  const dlStore = useDLStore();
  
  // Refs
  const videoContainer = ref(null);
  const showControls = ref(true);
  
  // Video player API
  const onVideoEnded = () => {
    emit('video-ended');
  };
  const {
    videoPlayer,
    isPlaying,
    initializeVideoPlayer,
    cleanupVideoPlayer,
  } = useVideoPlayer(videoContainer, onVideoEnded);
  
  // Computed properties
  const shouldAutoPlay = computed(() => activitySettingsStore.useAutoPlay);
  const isVideoAction = computed(() => 
    /** @type {import('../stores/action_store').Action} */ (actionStore.currentAction)?.type === 'video'
  );
  
  // Video control methods
  const startVideoPlayback = () => {
    console.log('startVideoPlayback');
    console.log('videoPlayer.value', videoPlayer.value);
    console.log('shouldAutoPlay.value', shouldAutoPlay.value);
    if (videoPlayer.value && shouldAutoPlay.value) {
      videoPlayer.value.play();
      isPlaying.value = true;
      console.log('videoPlayer.value', videoPlayer.value);
      console.log('isPlaying.value', isPlaying.value);
    }
  };
  
  const pauseVideo = () => {
    if (videoPlayer.value && isPlaying.value) {
      videoPlayer.value.pause();
      isPlaying.value = false;
    }
  };
  
  const canControlVideo = () => {
    if (!videoPlayer.value) return false;
    if (dlStore.isPlaying) {
      console.log('Cannot control video while DL is playing');
      return false;
    }
    return true;
  };
  
  // Event handlers
  const handleDLCompleted = () => {
    // Only resume video if the current action is a video action
    // This prevents video from resuming during quick check phases
    console.log('VideoPlayer: DL completed, current action type:', actionStore.currentAction?.type);
    if (actionStore.isCurrentActionVideo) {
      console.log('VideoPlayer: Resuming video playback');
      startVideoPlayback();
    } else {
      console.log('VideoPlayer: DL completed but current action is not video, keeping video paused');
    }
  };
  
  const handleDLStarted = () => {
    pauseVideo();
  };
  
  // Event listener management
  const setupEventListeners = () => {
    eventDispatcher.on(DL_EVENTS.COMPLETED, handleDLCompleted);
    eventDispatcher.on(DL_EVENTS.STARTED, handleDLStarted);
    
    if (videoPlayer.value) {
      // videoPlayer.value.on('ended', handleVideoCompleted); // Removed as per edit hint
    }
  };
  
  const cleanupEventListeners = () => {
    eventDispatcher.off(DL_EVENTS.COMPLETED, handleDLCompleted);
    eventDispatcher.off(DL_EVENTS.STARTED, handleDLStarted);
    
    if (videoPlayer.value) {
      // videoPlayer.value.off('ended', handleVideoCompleted); // Removed as per edit hint
    }
  };
  
  // Video system initialization
  const startPlaybackSequence = () => {
    // Only start video playback if the current action is a video action
    if (actionStore.isCurrentActionVideo) {
      if (dlStore.hasDL) {
        pauseVideo();
        dlStore.playDL();
      } else {
        // No DL available, wait for video element to be properly initialized
        console.log('VideoPlayer: No DL available, waiting for video initialization');
        
        const waitForVideoElement = () => {
          if (videoPlayer.value) {
            console.log('VideoPlayer: Video element ready, starting playback');
            startVideoPlayback();
          } else {
            console.log('VideoPlayer: Video element not ready yet, retrying...');
            setTimeout(waitForVideoElement, 100); // Check every 100ms
          }
        };
        
        // Start checking for video element after a short initial delay
        setTimeout(waitForVideoElement, 200);
      }
    } else {
      console.log('VideoPlayer: Current action is not video, skipping video playback');
    }
  };
  
  const initializeVideoSystem = () => {
    if (!isVideoAction.value) return;
    
    dlStore.initializeDLForPhase('video', store.activityInfo);
    startPlaybackSequence();
  };
  
  // User control methods
  const togglePlayPause = () => {
    if (!canControlVideo()) return;
  
    if (isPlaying.value) {
      videoPlayer.value.pause();
      isPlaying.value = false;
    } else {
      videoPlayer.value.play()
        .then(() => {
          isPlaying.value = true;
        })
        .catch((error) => {
          console.error('Failed to play video:', error);
        });
    }
  };
  
  const restart = () => {
    if (!canControlVideo()) return;
  
    if (videoPlayer.value.videojs_player) {
      videoPlayer.value.videojs_player.currentTime(0);
      videoPlayer.value.videojs_player.play();
      isPlaying.value = true;
    } else {
      videoPlayer.value.destroy();
      setTimeout(initializeVideoPlayer, 100);
    }
  };
  
  const goToIntro = () => {
    store.sequencer.goToScreen('intro');
  };
  
  // Watchers
  watch(() => videoPlayer.value, (newVideoPlayer) => {
    if (newVideoPlayer) {
      // newVideoPlayer.on('ended', handleVideoCompleted); // Removed as per edit hint
    }
  });
  
  watch(() => dlStore.isPlaying, (isDLPlaying) => {
    if (isDLPlaying) {
      pauseVideo();
    }
  });
  
  watch(() => actionStore.currentAction, (newAction) => {
    if (newAction?.type === 'video') {
      showControls.value = true;
      
      cleanupVideoPlayer();
      cleanupEventListeners();
      
      setTimeout(() => {
        initializeVideoPlayer();
        initializeVideoSystem();
        setupEventListeners();
      }, 100);
    } else if (newAction?.type === 'quick_check') {
      showControls.value = false;
    }
  });
  
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
  
  // Lifecycle hooks
  onMounted(() => {
    initializeVideoPlayer();
    initializeVideoSystem();
    setupEventListeners();
  });
  
  onUnmounted(() => {
    try {
      cleanupVideoPlayer();
      cleanupEventListeners();
      dlStore.cleanup();
    } catch (error) {
      console.warn('Error during component cleanup:', error);
    }
  });
  </script>
  
  <style lang="scss" module>
  .video-player {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    min-height: 100vh;
    overflow: visible;
  }
  
  .c-interactive-video {
    width: 100%;
    max-width: 800px;
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
    margin: 16px 0;
    justify-content: center;
    flex-wrap: wrap;
    position: relative;
    z-index: 10;
  }
  
  .control-btn {
    padding: 8px 16px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    min-width: 80px;
  
    &:hover {
      background: #0056b3;
    }
  }
  </style> 