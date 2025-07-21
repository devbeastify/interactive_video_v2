<template>
  <InteractiveVideoIntro
    v-if="store.sequencer.currentScreen?.name === 'intro'"
    @start="goToPlayer" />
  <InteractiveVideoPlayer
    v-else-if="store.sequencer.currentScreen?.name === 'player'" />
  <DiagnosticScreen
    v-else-if="store.sequencer.currentScreen?.name === 'diagnostic'" />
</template>

<script setup>
// @ts-check

  import { useMainStore } from '../composables/use_main_store';
  import InteractiveVideoIntro from './InteractiveVideoIntro.vue';
  import InteractiveVideoPlayer from './InteractiveVideoPlayer.vue';
  import DiagnosticScreen from './DiagnosticScreen.vue';

  const store = useMainStore();

  /**
   * Switch to the player screen when intro is finished
   * @return {void}
   */
  function goToPlayer() {
    store.sequencer.goToScreen('player');
  }

  /**
   * Initialize the application
   * @return {void}
   */
  function initializeApp() {
    store.init();
  }

  initializeApp();
</script>
