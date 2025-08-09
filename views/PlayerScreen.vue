<template>
  <div class="player-screen">
    <VideoPlayer
      v-show="stores.action.currentActionIsVideo"
      ref="videoPlayerRef"
      :preventInitialization="preventInitialization"
      @video-ended="handleVideoEnded" />
    <QuickCheck
      v-if="stores.action.currentActionIsQuickCheck"
      :preventInitialization="preventInitialization"
      @quick-check-complete="handleQuickCheckComplete" />

    <div v-if="showContinueButton" :class="$style['continue-overlay']">
      <div :class="$style['continue-container']">
        <h3>Video Complete</h3>
        <p v-if="!isAutoPlayMode">
          Click continue to proceed to the Quick Check.
        </p>
        <div v-else :class="$style['statement-container']">
          <p>Wait for Quick Check...</p>
          <div :class="$style['loading-spinner']" />
        </div>
        <button
          v-if="!isAutoPlayMode"
          :class="$style['continue-button']"
          @click="handleContinueClick">
          Continue
        </button>
      </div>
    </div>

    <DirectionLine />
  </div>
</template>

<script setup>
// @ts-check

  import { onMounted, onUnmounted, ref, computed } from 'vue';
  import { useActionStore } from '../stores/action_store';
  import { useQuickCheckStore } from '../stores/quick_check_store';
  import { useActivitySettingsStore } from '../stores/activity_settings_store';
  import { mainStore } from '../stores/main_store';
  import VideoPlayer from '../components/VideoPlayer.vue';
  import QuickCheck from '../components/QuickCheck.vue';

  const props = defineProps({
    preventInitialization: {
      type: Boolean,
      default: false,
    },
  });

  /**
   * @typedef {Object} StoreInstances
   * @property {ReturnType<typeof mainStore>} main
   * @property {ReturnType<typeof useActionStore>} action
   * @property {ReturnType<typeof useQuickCheckStore>} quickCheck
   * @property {ReturnType<typeof useActivitySettingsStore>} activitySettings
   */

  /**
   * Initialize store instances
   * @type {StoreInstances}
   */
  const stores = {
    action: useActionStore(),
    main: mainStore(),
    quickCheck: useQuickCheckStore(),
    activitySettings: useActivitySettingsStore(),
  };

  /**
   * Reactive state for continue button visibility
   * @type {import('vue').Ref<boolean>}
   */
  const showContinueButton = ref(false);

  /**
   * Timeout reference for autoplay functionality
   * @type {import('vue').Ref<number | null>}
   */
  const autoPlayTimeout = ref(null);

  /**
   * Reference to the video player component
   * @type {import('vue').Ref<null>}
   */
  const videoPlayerRef = ref(null);

  /**
   * Computed property indicating whether autoplay mode is enabled
   * @type {import('vue').ComputedRef<boolean>}
   */
  const isAutoPlayMode = computed(() => stores.activitySettings.useAutoPlay);

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
   * Handle continue button click
   * @return {void}
   */
  function handleContinueClick() {
    showContinueButton.value = false;
    navigateToNext();
  }

  /**
   * Handle autoplay timeout
   * @return {void}
   */
  function handleAutoPlayTimeout() {
    showContinueButton.value = false;
    navigateToNext();
  }

  /**
   * Handle quick check completion by advancing to the next action
   * @return {void}
   */
  function handleQuickCheckComplete() {
    navigateToNext();
  }

  /**
   * Handle video completion by showing continue button or auto-proceeding
   * @return {void}
   */
  function handleVideoEnded() {
    showContinueButton.value = true;

    if (isAutoPlayMode.value) {
      autoPlayTimeout.value = window.setTimeout(() => {
        handleAutoPlayTimeout();
      }, 3500);
    }
  }

  /**
   * Clean up timeout on component unmount
   */
  function cleanupAutoPlayTimeout() {
    if (autoPlayTimeout.value) {
      window.clearTimeout(autoPlayTimeout.value);
      autoPlayTimeout.value = null;
    }
  }

  onMounted(() => {
    if (!props.preventInitialization) {
      stores.action.reset();
      initializeQuickCheckState();
    }
  });

  onUnmounted(() => {
    cleanupAutoPlayTimeout();
  });
</script>

<style lang="scss" module>
.continue-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.continue-container {
  background: url('') center/cover no-repeat;
  border-radius: 8px;
  padding: 32px;
  text-align: center;
  max-width: 600px;
  width: 90%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  color: white;
}

.continue-container h3 {
  margin: 0 0 16px 0;
  color: white;
  font-size: 24px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
}

.continue-container p {
  margin: 0 0 24px 0;
  color: white;
  font-size: 16px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
}

.continue-button {
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: #0056b3;
  }

  &:active {
    background: #004085;
  }
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.button-container {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 16px;
}

.replay-button {
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: #5a6268;
  }

  &:active {
    background: #495057;
  }
}
</style>