<template>
    <div>
      <VideoPlayer 
        v-show="actionStore.isCurrentActionVideo"
        @video-ended="handleVideoEnded"
      />
   
      <QuickCheck 
        v-if="actionStore.isCurrentActionQuickCheck"
        @quick-check-complete="handleQuickCheckComplete"
      />
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
  
  const store = mainStore();
  const actionStore = useActionStore();
  const quickCheckStore = useQuickCheckStore();
  
  /**
   * Lifecycle hook: Initialize quick check state on mount
   * Sets up the quick check state from activity info
   * @return {void}
   */
  onMounted(() => {
    // Reset action store to start from the beginning
    actionStore.reset();
    
    if (store.activityInfo.quick_checks) {
      quickCheckStore.updateQuickCheckState({
        quickChecks: store.activityInfo.quick_checks,
      });
    }
  });
  
  /**
   * Handle quick check completion by advancing to the next action
   */
  function handleQuickCheckComplete() {
    if (actionStore.isAtLastAction) {
      store.sequencer.goToScreen('diagnostic');
    } else {
      actionStore.goToNextAction();
    }
  }
  
  function handleVideoEnded() {
    if (actionStore.isAtLastAction) {
      store.sequencer.goToScreen('diagnostic');
    } else {
      actionStore.goToNextAction();
    }
  }
  </script>
  
  <style lang="scss" module>
  // Styles moved to VideoPlayer component
  </style>
  