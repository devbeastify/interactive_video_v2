<template>
  <div class="player-screen">
    <VideoPlayer 
      v-show="stores.action.currentActionIsVideo"
      @video-ended="handleVideoEnded" 
    />
    <QuickCheck 
      v-if="stores.action.currentActionIsQuickCheck"
      @quick-check-complete="handleQuickCheckComplete" 
    />
    <DirectionLine />
  </div>
</template>

<script setup>
// @ts-check

import { onMounted } from 'vue';
import { useActionStore } from '../stores/action_store';
import { useQuickCheckStore } from '../stores/quick_check_store';
import { mainStore } from '../stores/main_store';
import VideoPlayer from '../components/VideoPlayer.vue';
import QuickCheck from '../components/QuickCheck.vue';

/**
 * @typedef {Object} StoreInstances
 * @property {ReturnType<typeof mainStore>} main
 * @property {ReturnType<typeof useActionStore>} action
 * @property {ReturnType<typeof useQuickCheckStore>} quickCheck
 */

/**
 * Initialize store instances
 * @type {StoreInstances}
 */
const stores = {
  action: useActionStore(),
  main: mainStore(),
  quickCheck: useQuickCheckStore(),
};

/**
 * Initialize quick check state from activity info
 * Sets up the quick check state if quick checks are available
 * @return {void}
 */
function initializeQuickCheckState() {
  const { activityInfo } = stores.main;
  
  if (activityInfo.quick_checks) {
    stores.quickCheck.updateQuickCheckState({
      quickChecks: activityInfo.quick_checks,
    });
  }
}

/**
 * Navigate to the next screen or action based on current state
 * @return {void}
 */
function navigateToNext() {
  if (stores.action.isAtLastAction) {
    stores.main.sequencer.goToScreen('diagnostic');
  } else {
    stores.action.goToNextAction();
  }
}

/**
 * Handle quick check completion by advancing to the next action
 * @return {void}
 */
function handleQuickCheckComplete() {
  navigateToNext();
}

/**
 * Handle video completion by advancing to the next action
 * @return {void}
 */
function handleVideoEnded() {
  navigateToNext();
}

/**
 * Lifecycle hook: Initialize component state on mount
 * Resets action store and sets up quick check state
 * @return {void}
 */
onMounted(() => {
  stores.action.reset();
  
  initializeQuickCheckState();
});
</script>

<style lang="scss" module>

</style>
