<template>
  <div :class="$style['diagnostic-layout']">
    <DirectionLine 
      v-if="dlStore.hasDL"
      :dl-text="dlStore.currentDLText"
      :is-playing="dlStore.isPlaying" />
    
    <div :class="$style['diagnostic-content']">
      <h2>Diagnostic</h2>
      <div :class="$style['diagnostic-controls']">
        <button 
          :class="$style['back-btn']"
          @click="goToIntro">
          Back to Intro
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// @ts-check

import { onMounted, onUnmounted } from 'vue';
import { mainStore } from '../stores/main_store';
import { useDLStore } from '../stores/direction_line_store';
import { eventDispatcher, DL_EVENTS } from '../lib/event_dispatcher';
import DirectionLine from '../components/DirectionLine.vue';

/**
 * @typedef {Object} DiagnosticScreenProps
 * @property {ReturnType<typeof mainStore>} store - Main application store
 * @property {ReturnType<typeof useDLStore>} dlStore - Direction line store
 */

const store = mainStore();
const dlStore = useDLStore();

/**
 * Handles direction line completion event
 * @return {void}
 */
const handleDLCompleted = () => {
  console.log('Direction line completed');
};

/**
 * Handles direction line start event
 * @return {void}
 */
const handleDLStarted = () => {
  console.log('Direction line started');
};

/**
 * Sets up event listeners for direction line events
 * @return {void}
 */
const setUpEventListeners = () => {
  eventDispatcher.on(DL_EVENTS.COMPLETED, handleDLCompleted);
  eventDispatcher.on(DL_EVENTS.STARTED, handleDLStarted);
};

/**
 * Cleans up event listeners
 * @return {void}
 */
const cleanupEventListeners = () => {
  eventDispatcher.off(DL_EVENTS.COMPLETED, handleDLCompleted);
  eventDispatcher.off(DL_EVENTS.STARTED, handleDLStarted);
};

/**
 * Navigates back to the intro screen
 * @return {void}
 */
const goToIntro = () => {
  store.sequencer.goToScreen('intro');
};

/**
 * Initializes the diagnostic screen with direction line
 * @return {void}
 */
const initializeDiagnostic = () => {
  const activityInfoForDL = /** @type {import('../stores/direction_line_store').ActivityInfo} */ (store.activityInfo);
  dlStore.initializeDLForPhase('diagnostic', activityInfoForDL);
};

/**
 * Performs cleanup operations for the component
 * @return {void}
 */
const performCleanup = () => {
  try {
    cleanupEventListeners();
    dlStore.cleanup();
  } catch (error) {
    console.warn('Error during DiagnosticScreen component cleanup:', error);
  }
};

onMounted(() => {
  setUpEventListeners();
  initializeDiagnostic();
});

onUnmounted(() => {
  performCleanup();
});
</script>

<style lang="scss" module>
@use 'MusicV3/v3/styles/base' as base;

.diagnostic-layout {
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: base.rpx(32);
}

.diagnostic-content {
  background: white;
  border-radius: base.rpx(12);
  box-shadow: 0 base.rpx(8) base.rpx(32) rgba(0, 0, 0, 0.1);
  max-width: base.rpx(600);
  padding: base.rpx(32);
  text-align: center;
  width: 100%;
}

.diagnostic-content h2 {
  color: var(--global-color-text-primary, #333);
  font-size: base.rpx(28);
  font-weight: 600;
  margin-bottom: base.rpx(16);
}

.diagnostic-content p {
  color: var(--global-color-text-secondary, #666);
  font-size: base.rpx(16);
  line-height: 1.5;
  margin-bottom: base.rpx(32);
}

.diagnostic-controls {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: base.rpx(16);
}

.diagnostic-btn {
  background: #007bff;
  border: none;
  border-radius: base.rpx(8);
  color: white;
  cursor: pointer;
  font-size: base.rpx(18);
  font-weight: 500;
  min-width: base.rpx(200);
  padding: base.rpx(16) base.rpx(32);

  &:hover {
    background: #0056b3;
  }
}

.back-btn {
  background: transparent;
  border: 2px solid #007bff;
  border-radius: base.rpx(6);
  color: #007bff;
  cursor: pointer;
  font-size: base.rpx(16);
  min-width: base.rpx(150);
  padding: base.rpx(12) base.rpx(24);

  &:hover {
    background: #007bff;
    color: white;
  }
}
</style>
