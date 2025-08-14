<template>
  <IntroScreen
    v-if="store.sequencer.currentScreen?.name === 'intro'"
    @start="goToPlayer" />
  <PlayerScreen
    v-else-if="store.sequencer.currentScreen?.name === 'player'"
    :preventInitialization="isNavigatingViaProgressBar"
    @goToActionFromOtherScreen="goToActionFromOtherScreen" />
  <DiagnosticScreen
    v-else-if="store.sequencer.currentScreen?.name === 'diagnostic'" />
</template>

<script setup>
// @ts-check

  import { onMounted, onUnmounted, ref } from 'vue';
  import DiagnosticScreen from './DiagnosticScreen.vue';
  import IntroScreen from './IntroScreen.vue';
  import PlayerScreen from './PlayerScreen.vue';
  import { mainStore } from '../stores/main_store';
  import { useActionStore } from '../stores/action_store';

  const store = mainStore();
  const actionStore = useActionStore();
  const isNavigatingViaProgressBar = ref(false);
  const elementIndex = ref(0);
  /**
   * Initialize the application by calling the store's init method
   * @return {void}
   */
  function initializeApp() {
    store.init();
  }

  /**
   * Switch to the player screen when intro is finished
   * @return {void}
   */
  function goToPlayer() {
    store.sequencer.goToScreen('player');
  }

  /**
   * Handle progress bar button click events for navigation
   * @param {Event} event - The progress bar click event
   */
  function handleProgressBarButtonClick(event) {
    const customEvent = /** @type {CustomEvent} */ (event);
    elementIndex.value = Number(customEvent.detail.elementIndex);

    if (store.sequencer.currentScreen?.name !== 'player') {
      isNavigatingViaProgressBar.value = true;
      store.sequencer.goToScreen('player');
    } else {
      if (elementIndex.value >= 0 && elementIndex.value < actionStore.actions.length) {
        actionStore.goToAction(elementIndex.value);
      }
    }
  }

  function goToActionFromOtherScreen() {
    console.log('goToActionFromOtherScreen');
    if (elementIndex.value >= 0 && elementIndex.value < actionStore.actions.length) {
      isNavigatingViaProgressBar.value = false;
      actionStore.goToAction(elementIndex.value);
    }
  }

  /**
   * Handle progress bar element enabled events
   * @param {Event} event - The progress bar element enabled event
   */
  function handleProgressBarElementEnabled(event) {
    const customEvent = /** @type {CustomEvent} */ (event);
    const elementIndex = Number(customEvent.detail.elementIndex);
    console.log(`Progress bar element ${elementIndex} enabled.`);
  }

  /**
   * Set up event listeners for progress bar navigation
   */
  function setupProgressBarEventListeners() {
    document.addEventListener('progressBarButtonClick', handleProgressBarButtonClick);
    document.addEventListener('progressBarElementEnabled', handleProgressBarElementEnabled);
  }

  /**
   * Clean up event listeners
   */
  function cleanupProgressBarEventListeners() {
    document.removeEventListener('progressBarButtonClick', handleProgressBarButtonClick);
    document.removeEventListener('progressBarElementEnabled', handleProgressBarElementEnabled);
  }

  onMounted(() => {
    setupProgressBarEventListeners();
  });

  onUnmounted(() => {
    cleanupProgressBarEventListeners();
  });

  initializeApp();
</script>