<template>
  <div>
    <button @click="goToIntro">
      Back to Intro
    </button>
    <DirectionLineComponent
      v-if="currentDirectionLine"
      ref="directionLineComponent"
      :directionLine="currentDirectionLine"
      :stepIndex="currentStepIndex" />
  </div>
</template>

<script setup>
// @ts-check
  import { onMounted, onUnmounted, ref, computed, nextTick } from 'vue';
  import { mainStore } from '../stores/main/main_store';
  import { useDirectionLineStore } from '../stores/main/direction_line_store';
  import DirectionLineComponent from '../components/DirectionLine.vue';

  /**
   * @typedef {Object} StepData
   * @property {string} id
   * @property {string} type
   * @property {string} directionLine
   * @property {boolean} isNew
   * @property {string} languageCode
   */

  /**
   * @typedef {Object} DirectionLineComponentRef
   * @property {Function} autoPlayAudio - Method to auto-play direction line audio
   */

  const store = mainStore();
  const directionLineStore = useDirectionLineStore();

  /**
   * Current step information for direction line
   */
  const currentStepIndex = ref(0);

  /**
   * Reference to the direction line component
   */
  const directionLineComponent = ref(/** @type {DirectionLineComponentRef | null} */ (null));

  /**
   * Computed property for current direction line from store
   */
  const currentDirectionLine = computed(() => directionLineStore.currentLine);

  /**
   * Initialize direction line for the current step
   */
  const initializeDirectionLine = () => {
    store.initializeDirectionLineForStep('diagnostic');
  };

  /**
   * Attempts to auto-play direction line audio if component and data are available
   */
  const attemptAutoPlayAudio = async () => {
    await nextTick();

    if (directionLineComponent.value && currentDirectionLine.value) {
      directionLineComponent.value.autoPlayAudio();
    }
  };

  /**
   * Handles the component mounting process
   */
  const handleComponentMount = async () => {
    console.log('DiagnosticScreen mounted');
    initializeDirectionLine();
    await attemptAutoPlayAudio();
  };

  /**
   * Navigates back to the intro screen
   */
  function goToIntro() {
    store.sequencer.goToScreen('intro');
  }

  onMounted(handleComponentMount);

  onUnmounted(() => {
    directionLineStore.cleanupDirectionLine();
  });
</script>
