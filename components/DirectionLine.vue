<template>
    <div :class="$style['dl-container']" v-if="dlText">
      <div :class="$style['dl-content']">
        <div :class="$style['dl-controls']">
          <PlayButton 
            :audioBtnState="localIsPlaying ? 'playing' : 'paused'"
            @click="handlePlayButtonClick" />
        </div>
        <div :class="$style['dl-text']" v-html="dlText" />
      </div>
    </div>
  </template>
  
  <script setup>
  // @ts-check
  
  import { onMounted, onUnmounted, ref } from 'vue';
  import { eventDispatcher, DL_EVENTS } from '../lib/event_dispatcher';
  import { useActionStore } from '../stores/action_store';
  import { useDLStore } from '../stores/direction_line_store';
  import { mainStore } from '../stores/main_store';
  import PlayButton from './PlayButton.vue';
  
  /**
   * Props for the DL component
   */
  const props = defineProps({
    /** @type {string} */
    dlText: {
      type: String,
      default: '',
    },
    /** @type {boolean} */
    isPlaying: {
      type: Boolean,
      default: false,
    },
  });
  
  // Store instances
  const actionStore = useActionStore();
  const dlStore = useDLStore();
  const store = mainStore();
  
  /**
   * Local playing state
   */
  const localIsPlaying = ref(false);
  
  /**
   * Handle play button click
   */
  const handlePlayButtonClick = () => {
    if (localIsPlaying.value) {
      eventDispatcher.dispatch(DL_EVENTS.PAUSE);
    } else {
      eventDispatcher.dispatch(DL_EVENTS.PLAY);
    }
  };
  
  /**
   * Update local playing state
   */
  const updatePlayingState = (isPlaying) => {
    localIsPlaying.value = isPlaying;
  };
  
  /**
   * Auto-play DL when component is mounted
   */
  onMounted(() => {
    if (props.dlText && props.dlText.trim()) {
      // Small delay to ensure component is fully rendered
      setTimeout(() => {
        eventDispatcher.dispatch(DL_EVENTS.PLAY);
      }, 100);
    }
  
    // Listen for state changes
    eventDispatcher.on(DL_EVENTS.STARTED, () => {
      updatePlayingState(true);
    });
  
    eventDispatcher.on(DL_EVENTS.PAUSED, () => {
      updatePlayingState(false);
    });
  
    eventDispatcher.on(DL_EVENTS.COMPLETED, () => {
      updatePlayingState(false);
    });
  });
  
  /**
   * Cleanup event listeners on unmount
   */
  onUnmounted(() => {
    eventDispatcher.off(DL_EVENTS.STARTED, updatePlayingState);
    eventDispatcher.off(DL_EVENTS.PAUSED, updatePlayingState);
    eventDispatcher.off(DL_EVENTS.COMPLETED, updatePlayingState);
  });
  </script>
  
  <style lang="scss" module>
  @use 'MusicV3/v3/styles/base' as base;
  
  .dl-container {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .dl-content {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    background-color: var(--global-color-background-primary, #fff);
    border-radius: base.rpx(12);
    padding: base.rpx(24);
    max-width: base.rpx(600);
    width: 100%;
    text-align: center;
  }
  
  .dl-text {
    font-size: base.rpx(18);
    line-height: base.rpx(18);
    margin-left: base.rpx(16);
    color: var(--global-color-text-primary, #333);
  }
  
  .dl-controls {
    display: flex;
    justify-content: center;
    gap: base.rpx(16);
  }
  </style>