<template>
  <div v-if="dlText" :class="$style['dl-container']">
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

  import { onMounted, onUnmounted, ref, watch } from 'vue';
  import { EventDispatcher, DL_EVENTS } from '../lib/event_dispatcher.js';
  import PlayButton from './PlayButton.vue';

  /**
   * @typedef {Object} DirectionLineProps
   * @property {string} dlText - The direction line text content
   * @property {boolean} isPlaying - Whether the direction line is currently playing
   */

  /**
   * Props for the DirectionLine component
   */
  const props = defineProps({
    dlText: {
      type: String,
      default: '',
    },
    isPlaying: {
      type: Boolean,
      default: false,
    },
  });

  /**
   * Get the event dispatcher instance
   */
  const eventDispatcher = EventDispatcher.getInstance();

  /**
   * Local playing state for the direction line
   */
  const localIsPlaying = ref(false);

  /**
   * Watch for changes to the isPlaying prop and update local state
   */
  watch(() => props.isPlaying, (newIsPlaying) => {
    localIsPlaying.value = newIsPlaying;
  }, { immediate: true });

  /**
   * Handles play button click events
   * Dispatches appropriate events based on current playing state
   */
  const handlePlayButtonClick = () => {
    const event = localIsPlaying.value ? DL_EVENTS.PAUSE : DL_EVENTS.PLAY;
    eventDispatcher.dispatch(event);
  };

  /**
   * Updates the local playing state
   * @param {boolean} isPlaying - The new playing state
   */
  const updatePlayingState = (isPlaying) => {
    localIsPlaying.value = isPlaying;
  };

  /**
   * Sets up event listeners for direction line state changes
   */
  const setUpEventListeners = () => {
    eventDispatcher.on(DL_EVENTS.PLAY, () => {
      updatePlayingState(true);
    });

    eventDispatcher.on(DL_EVENTS.PAUSED, () => {
      updatePlayingState(false);
    });

    eventDispatcher.on(DL_EVENTS.COMPLETED, () => {
      updatePlayingState(false);
    });
  };

  /**
   * Cleans up event listeners to prevent memory leaks
   */
  const cleanupEventListeners = () => {
    eventDispatcher.off(DL_EVENTS.PLAY, updatePlayingState);
    eventDispatcher.off(DL_EVENTS.PAUSED, updatePlayingState);
    eventDispatcher.off(DL_EVENTS.COMPLETED, updatePlayingState);
  };

  /**
   * Auto-plays direction line when component is mounted if text is available
   */
  const autoPlayDirectionLine = () => {
    if (props.dlText && props.dlText.trim()) {
      setTimeout(() => {
        eventDispatcher.dispatch(DL_EVENTS.PLAY);
      }, 100);
    }
  };

  onMounted(() => {
    autoPlayDirectionLine();
    setUpEventListeners();
  });

  onUnmounted(() => {
    cleanupEventListeners();
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
  max-width: base.rpx(600);
  padding: base.rpx(24);
  text-align: center;
  width: 100%;
}

.dl-text {
  color: var(--global-color-text-primary, #333);
  font-size: base.rpx(18);
  line-height: base.rpx(18);
  margin-left: base.rpx(16);
}

.dl-controls {
  display: flex;
  gap: base.rpx(16);
  justify-content: center;
}
</style>