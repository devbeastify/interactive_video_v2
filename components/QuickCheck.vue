<template>
  <div v-show="quickCheckStore.isVisible" :class="$style['quick-check']">
    <div :class="$style['quick-check-content']">
      <h3>Quick Check</h3>
      <div v-if="quickCheckStore.currentQuickCheck">
        <p>
          {{
            quickCheckStore.currentQuickCheck.prompt ||
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
            :pronunciationToggle="quickCheckStore.pronunciationToggle"
            @pronunciation-complete="handlePronunciationComplete" />
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
  import { useQuickCheckStore } from '../stores/main/quick_check_store';
  import MultipleChoiceQuestion from './questions/MultipleChoiceQuestion.vue';
  import FillInTheBlanksQuestion from './questions/FillInTheBlanksQuestion.vue';
  import PronunciationQuestion from './questions/PronunciationQuestion.vue';

  const quickCheckStore = useQuickCheckStore();

  /**
   * Handles the event when a multiple choice answer is selected.
   * @param {Object} answer - The selected answer object.
   */
  const handleAnswerSelected = (answer) => {
    handleComplete();
  };

  /**
   * Handles the event when fill-in-the-blanks answers are submitted.
   * @param {Array} answers - The submitted answers.
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
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.quick-check-content {
  background: white;
  padding: base.rpx(32);
  border-radius: base.rpx(8);
  max-width: base.rpx(500);
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
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
