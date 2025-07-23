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

import DiagnosticScreen from './DiagnosticScreen.vue';
import IntroScreen from './IntroScreen.vue';
import PlayerScreen from './PlayerScreen.vue';
import { mainStore } from '../stores/main_store';

const store = mainStore();

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

initializeApp();
</script>
