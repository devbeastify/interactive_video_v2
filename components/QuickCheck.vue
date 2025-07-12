<template>
  <div v-show="quickCheckStore.isVisible" :class="$style['quick-check']">
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

        <div>
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

import { onMounted, onUnmounted, watch } from 'vue';
import { useQuickCheckStore } from '../stores/main/quick_check_store';
import { mainStore } from '../stores/main/main_store';
import MultipleChoiceQuestion from './questions/MultipleChoiceQuestion.vue';
import FillInTheBlanksQuestion from './questions/FillInTheBlanksQuestion.vue';
import PronunciationQuestion from './questions/PronunciationQuestion.vue';
import DragAndDropQuestion from './questions/DragAndDropQuestion.vue';

const quickCheckStore = useQuickCheckStore();
const store = mainStore();

/**
 * Get the appropriate prompt for the current quick check
 * @return {string} The prompt text
 */
const getQuickCheckPrompt = () => {
  const currentQC = quickCheckStore.currentQuickCheck;
  if (!currentQC) return '';

  // Check if the quick check has its own DL in quick_check_content
  if (currentQC.quick_check_content && typeof currentQC.quick_check_content === 'object' && 'dl' in currentQC.quick_check_content) {
    return /** @type {string} */ (currentQC.quick_check_content.dl);
  }

  // Fallback to the main activity DL
  return store.activityInfo.dl || 'Complete this activity to continue.';
};

/**
 * Lifecycle hook: Initialize when component mounts
 */
onMounted(() => {
  // Removed DL initialization as requested
});

/**
 * Lifecycle hook: Clean up when component unmounts
 */
onUnmounted(() => {
  // Removed DL cleanup as requested
});

/**
 * Watch for quick check completion and emit events
 */
watch(() => quickCheckStore.isComplete, (isComplete) => {
  if (isComplete) {
    // Emit custom event for video resumption
    document.dispatchEvent(new CustomEvent('quickCheckCompleted'));
  }
});

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
  margin-top: base.rpx(16);
  padding: base.rpx(12) base.rpx(24);
  background: #007bff;
  color: white;
  border: none;
  border-radius: base.rpx(4);
  cursor: pointer;
  font-size: base.rpx(16);

  &:hover {
    background: #0056b3;
  }
}
</style>
