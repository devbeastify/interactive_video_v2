<template>
  <div v-show="quickCheckStore.isVisible" :class="$style['quick-check']">
    <!-- Direction Line for QuickCheck -->
    <DirectionLineComponent
      v-if="currentDirectionLine"
      :direction-line="currentDirectionLine"
      :step-index="currentStepIndex"
      @play="handleDirectionLinePlay"
      @pause="handleDirectionLinePause"
      @audio-ended="handleDirectionLineAudioEnded" />

    <div :class="$style['quick-check-content']">
      <h3>Quick Check</h3>
      <div v-if="quickCheckStore.currentQuickCheck">
        <p>
          {{
            getQuickCheckPrompt() ||
              'Complete this activity to continue.'
          }}
        </p>

        <!-- Render different question types based on quick check type -->
        <div
          v-if="quickCheckStore.currentQuickCheck.type === 'multiple_choice'">
          <MultipleChoiceQuestion
            :question="quickCheckStore.currentQuickCheck"
            @answer-selected="handleAnswerSelected" />
        </div>

        <div
          v-else-if="quickCheckStore.currentQuickCheck.type === 'fill_in_the_blanks'">
          <FillInTheBlanksQuestion
            :question="quickCheckStore.currentQuickCheck"
            @answer-submitted="handleAnswerSubmitted" />
        </div>

        <div
          v-else-if="quickCheckStore.currentQuickCheck.type === 'pronunciation'">
          <PronunciationQuestion
            :question="quickCheckStore.currentQuickCheck"
            :pronunciationToggle="quickCheckStore.pronunciationToggle || undefined"
            @pronunciation-complete="handlePronunciationComplete" />
        </div>

        <div
          v-else-if="quickCheckStore.currentQuickCheck.type === 'quick_check_drag_and_drop'">
          <DragAndDropQuestion
            :question="quickCheckStore.currentQuickCheck"
            @answer-submitted="handleAnswerSubmitted" />
        </div>

        <div v-else>
          <button :class="$style['quick-check-complete-btn']" @click="handleComplete">
            Complete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// @ts-check

import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useQuickCheckStore } from '../stores/main/quick_check_store';
import { mainStore } from '../stores/main/main_store';
import { DirectionLine } from '../stores/main/direction_line';
import MultipleChoiceQuestion from './questions/MultipleChoiceQuestion.vue';
import FillInTheBlanksQuestion from './questions/FillInTheBlanksQuestion.vue';
import PronunciationQuestion from './questions/PronunciationQuestion.vue';
import DragAndDropQuestion from './questions/DragAndDropQuestion.vue';
import DirectionLineComponent from './DirectionLine.vue';

const quickCheckStore = useQuickCheckStore();
const store = mainStore();

/**
 * Current step information for direction line
 */
const currentStepIndex = ref(0);

/**
 * Computed property for current direction line from store
 */
const currentDirectionLine = computed(() => store.currentDirectionLine);

/**
 * Get the appropriate prompt for the current quick check
 * @return {string} The prompt text
 */
const getQuickCheckPrompt = () => {
  const currentQC = quickCheckStore.currentQuickCheck;
  if (!currentQC) return '';

  // Check if the quick check has its own DL in quick_check_content
  if (currentQC.quick_check_content?.dl) {
    return currentQC.quick_check_content.dl;
  }

  // Fallback to the main activity DL
  return store.activityInfo.dl || 'Complete this activity to continue.';
};

/**
 * Lifecycle hook: Initialize direction line when component mounts
 */
onMounted(() => {
  initializeDirectionLine();
});

/**
 * Lifecycle hook: Clean up direction line when component unmounts
 */
onUnmounted(() => {
  store.cleanupDirectionLine();
});

/**
 * Initialize direction line for QuickCheck step
 */
const initializeDirectionLine = () => {
  // Use centralized DL logic from store
  store.initializeDirectionLineForStep('quick_check');
};

/**
 * Handle direction line play event
 */
const handleDirectionLinePlay = () => {
  // Pause any ongoing audio/video when direction line starts
  console.log('QuickCheck direction line started playing');
};

/**
 * Handle direction line pause event
 */
const handleDirectionLinePause = () => {
  console.log('QuickCheck direction line paused');
};

/**
 * Handle direction line audio ended event
 */
const handleDirectionLineAudioEnded = () => {
  console.log('QuickCheck direction line audio ended');
};

/**
 * Handles the event when a multiple choice answer is selected.
 * @param {Object} answer - The selected answer object.
 */
const handleAnswerSelected = (answer) => {
  handleComplete();
};

/**
 * Handles the event when fill-in-the-blanks answers are submitted.
 * @param {Array<string>} answers - The submitted answers.
 */
const handleAnswerSubmitted = (answers) => {
  handleComplete();
};

/**
 * Handles the event when a pronunciation question is completed.
 * @param {Object} result - The result of the pronunciation check.
 */
const handlePronunciationComplete = (result) => {
  handleComplete();
};

/**
 * Marks the current quick check as complete.
 */
const handleComplete = () => {
  quickCheckStore.completeQuickCheck();
};
</script>

<style lang="scss" module>
@use 'MusicV3/v3/styles/base' as base;

.quick-check {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: base.rpx(16);
}

.quick-check-content {
  background: white;
  padding: base.rpx(32);
  border-radius: base.rpx(8);
  max-width: base.rpx(600);
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 base.rpx(4) base.rpx(12) rgba(0, 0, 0, 0.1);
}

.quick-check-complete-btn {
  padding: base.rpx(12) base.rpx(32);
  background-color: var(--global-button-background-primary, #252525);
  color: var(--global-button-text-primary, #fff);
  border: none;
  border-radius: base.rpx(4);
  cursor: pointer;
  font-size: base.rpx(16);
  font-weight: 600;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: var(--global-button-background-primary-hover, #1f7069);
  }
}
</style>
