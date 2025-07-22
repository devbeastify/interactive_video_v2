<template>
    <div :class="$style['diagnostic-layout']">
      <!-- DL Component for diagnostic -->
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
  
  const store = mainStore();
  const dlStore = useDLStore();
  
  /**
   * Event handlers for DL
   */
  const handleDLCompleted = () => {
    // DL completed, can proceed with diagnostic
    console.log('DL completed for diagnostic');
  };
  
  const handleDLStarted = () => {
    // DL started playing
    console.log('DL started for diagnostic');
  };
  
  /**
   * Set up event listeners for DL
   */
  const setupEventListeners = () => {
    eventDispatcher.on(DL_EVENTS.COMPLETED, handleDLCompleted);
    eventDispatcher.on(DL_EVENTS.STARTED, handleDLStarted);
  };
  
  /**
   * Clean up event listeners
   */
  const cleanupEventListeners = () => {
    eventDispatcher.off(DL_EVENTS.COMPLETED, handleDLCompleted);
    eventDispatcher.off(DL_EVENTS.STARTED, handleDLStarted);
  };
  
  /**
   * Navigate back to the intro screen
   * @return {void}
   */
  const goToIntro = () => {
    store.sequencer.goToScreen('intro');
  };
  
  // Lifecycle hooks
  onMounted(() => {
    setupEventListeners();
    
    // Initialize DL for diagnostic phase
    const activityInfoForDL = /** @type {import('../stores/direction_line_store').ActivityInfo} */ (store.activityInfo);
    dlStore.initializeDLForPhase('diagnostic', activityInfoForDL);
  });
  
  onUnmounted(() => {
    try {
      cleanupEventListeners();
      dlStore.cleanup();
    } catch (error) {
      console.warn('Error during DiagnosticScreen component cleanup:', error);
    }
  });
  </script>
  
  <style lang="scss" module>
  @use 'MusicV3/v3/styles/base' as base;
  
  .diagnostic-layout {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: base.rpx(32);
  }
  
  .diagnostic-content {
    background: white;
    padding: base.rpx(32);
    border-radius: base.rpx(12);
    max-width: base.rpx(600);
    width: 100%;
    text-align: center;
    box-shadow: 0 base.rpx(8) base.rpx(32) rgba(0, 0, 0, 0.1);
  }
  
  .diagnostic-content h2 {
    font-size: base.rpx(28);
    font-weight: 600;
    margin-bottom: base.rpx(16);
    color: var(--global-color-text-primary, #333);
  }
  
  .diagnostic-content p {
    font-size: base.rpx(16);
    line-height: 1.5;
    margin-bottom: base.rpx(32);
    color: var(--global-color-text-secondary, #666);
  }
  
  .diagnostic-controls {
    display: flex;
    flex-direction: column;
    gap: base.rpx(16);
    align-items: center;
  }
  
  .diagnostic-btn {
    padding: base.rpx(16) base.rpx(32);
    background: #007bff;
    color: white;
    border: none;
    border-radius: base.rpx(8);
    cursor: pointer;
    font-size: base.rpx(18);
    font-weight: 500;
    min-width: base.rpx(200);
  
    &:hover {
      background: #0056b3;
    }
  }
  
  .back-btn {
    padding: base.rpx(12) base.rpx(24);
    background: transparent;
    color: #007bff;
    border: 2px solid #007bff;
    border-radius: base.rpx(6);
    cursor: pointer;
    font-size: base.rpx(16);
    min-width: base.rpx(150);
  
    &:hover {
      background: #007bff;
      color: white;
    }
  }
  </style>
  