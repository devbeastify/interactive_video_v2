<template>
  <button @click="goToIntro">Back to Intro</button>
  <!-- Direction Line for current step -->
  <DirectionLineComponent
      v-if="currentDirectionLine"
      :direction-line="currentDirectionLine"
      :step-index="currentStepIndex"
      ref="directionLineComponent" />
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

const store = mainStore();
const directionLineStore = useDirectionLineStore();

/**
 * Current step information for direction line
 */
const currentStepIndex = ref(0);

/**
 * Reference to the direction line component
 */
const directionLineComponent = ref(/** @type {any} */ (null));

/**
 * Computed property for current direction line from store
 */
const currentDirectionLine = computed(() => directionLineStore.currentLine);

onMounted(async () => {
  console.log('DiagnosticScreen mounted');
  // Initialize direction line for current step
  initializeDirectionLine();
  
  // Wait for the component to be rendered and then auto-play
  await nextTick();
  console.log('Direction line component ref:', directionLineComponent.value);
  console.log('Current direction line:', currentDirectionLine.value);
  if (directionLineComponent.value && currentDirectionLine.value) {
    console.log('Auto-playing direction line audio');
    // Auto-play the direction line audio
    directionLineComponent.value.autoPlayAudio();
  } else {
    console.warn('Cannot auto-play: missing component ref or direction line');
  }
});

onUnmounted(() => {
  directionLineStore.cleanupDirectionLine();
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