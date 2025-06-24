<template>
  <InteractiveVideoIntro
    v-if="store.sequencer.currentScreen?.name === 'intro'"
    @start="goToPlayer" />
  <InteractiveVideoPlayer
    v-else-if="store.sequencer.currentScreen?.name === 'player'" />
</template>

<script setup>
  import { useMainStore } from '../composables/use_main_store';
  import InteractiveVideoIntro from './InteractiveVideoIntro.vue';
  import InteractiveVideoPlayer from './InteractiveVideoPlayer.vue';

  const store = useMainStore();

  /**
   * Switch to the player screen when intro is finished
   */
  function goToPlayer() {
    store.sequencer.goToScreen('player');
  }

  store.init();
</script>
