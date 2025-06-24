<template>
  <InterActiveVideoIntro
    v-if="store.sequencer.currentScreen?.name === 'intro'"
    @start="goToPlayer"
  />
  <InteractiveVideoPlayer
    v-else-if="store.sequencer.currentScreen?.name === 'player'"
  />
</template>

<script setup>
import { useMainStore } from '../composables/use_main_store';
import InterActiveVideoIntro from './InterActiveVideoIntro.vue';
import InteractiveVideoPlayer from './InteractiveVideoPlayer.vue';

const store = useMainStore();

function goToPlayer() {
  store.sequencer.goToScreen('player');
}

store.init();
</script>
