<template>
  <button @click="goToIntro">Back to Intro</button>
  <!-- Direction Line for current step -->
  <DirectionLineComponent
      v-if="currentDirectionLine"
      :direction-line="currentDirectionLine"
      :step-index="currentStepIndex" />
</template>

<script setup>
// @ts-check
import { onMounted, ref, computed } from 'vue';
import { mainStore } from '../stores/main/main_store';
import { DirectionLine } from '../stores/main/direction_line';
import DirectionLineComponent from '../components/DirectionLine.vue';

/**
 * @typedef {Object} StepData
 * @property {string} id
 * @property {string} type
 * @property {string} directionLine
 * @property {boolean} isNew
 * @property {string} languageCode
 */

const store = mainStore();

/**
 * Current step information for direction line
 */
  const currentStepIndex = ref(0);
/** @type {import('vue').Ref<StepData|null>} */
const currentStepData = ref(null);

/**
 * Computed property for current direction line
 */
const currentDirectionLine = computed(() => {
  if (!currentStepData.value) return null;

  const stepInfo = currentStepData.value;
  return new DirectionLine({
    stepId: stepInfo.id || `step_${currentStepIndex.value}`,
    name: stepInfo.type || 'diagnostic',
    text: stepInfo.directionLine || '',
    isNew: stepInfo.isNew !== false,
    languageCode: stepInfo.languageCode || 'en',
    stepType: stepInfo.type || 'diagnostic',
  });
});

onMounted(() => {
  // Initialize direction line for current step
  initializeDirectionLine();
});

onUnmounted(() => {
  store.cleanupDirectionLine();
});

function goToIntro() {
  store.sequencer.goToScreen('intro');
}

/**
 * Initialize direction line for the current step
 */
const initializeDirectionLine = () => {
  // Get current step data from sequencer or activity info
  const currentScreen = store.sequencer.currentScreen;
  if (currentScreen && currentScreen.type === 'diagnostic') {
    currentStepData.value = {
      id: currentScreen.id || `step_${currentStepIndex.value}`,
      type: currentScreen.type || 'diagnostic',
      directionLine: currentScreen.directionLine || '',
      isNew: currentScreen.isNew !== false,
      languageCode: 'en',
    };

    // Set direction line in store
    if (currentDirectionLine.value) {
      store.setCurrentDirectionLine(currentDirectionLine.value);
      store.startDirectionLineAudio();
    }
  }
};
</script> 