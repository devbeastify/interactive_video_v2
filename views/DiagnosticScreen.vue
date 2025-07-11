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
import { onMounted, onUnmounted, ref, computed } from 'vue';
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

/**
 * Computed property for current direction line from store
 */
const currentDirectionLine = computed(() => store.currentDirectionLine);

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
  // Use centralized DL logic from store
  store.initializeDirectionLineForStep('diagnostic');
};
</script> 