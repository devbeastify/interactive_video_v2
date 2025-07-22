<template>
    <IntroScreen
      v-if="store.sequencer.currentScreen?.name === 'intro'"
      @start="goToPlayer" />
    <PlayerScreen
      v-else-if="store.sequencer.currentScreen?.name === 'player'" />
    <DiagnosticScreen
      v-else-if="store.sequencer.currentScreen?.name === 'diagnostic'" />
  </template>
  
  <script setup>
  // @ts-check
  
    import { mainStore } from '../stores/main_store';
    import IntroScreen from './IntroScreen.vue';
    import PlayerScreen from './PlayerScreen.vue';
    import DiagnosticScreen from './DiagnosticScreen.vue';
  
    const store = mainStore();
  
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
  