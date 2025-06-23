<template>
  <div class="quick-check" v-show="quickCheckStore.isVisible">
    <div class="quick-check__content">
      <h3>Quick Check</h3>
      <div v-if="quickCheckStore.currentQuickCheck">
        <p>
          {{
            quickCheckStore.currentQuickCheck.prompt ||
            "Complete this activity to continue."
          }}
        </p>

        <!-- Render different question types based on quick check type -->
        <div
          v-if="quickCheckStore.currentQuickCheck.type === 'multiple_choice'"
        >
          <MultipleChoiceQuestion
            :question="quickCheckStore.currentQuickCheck"
            @answer-selected="handleAnswerSelected"
          />
        </div>

        <div
          v-else-if="
            quickCheckStore.currentQuickCheck.type === 'fill_in_the_blanks'
          "
        >
          <FillInTheBlanksQuestion
            :question="quickCheckStore.currentQuickCheck"
            @answer-submitted="handleAnswerSubmitted"
          />
        </div>

        <div
          v-else-if="quickCheckStore.currentQuickCheck.type === 'pronunciation'"
        >
          <PronunciationQuestion
            :question="quickCheckStore.currentQuickCheck"
            :pronunciation-toggle="quickCheckStore.pronunciationToggle"
            @pronunciation-complete="handlePronunciationComplete"
          />
        </div>

        <div v-else>
          <button @click="handleComplete" class="quick-check__complete-btn">
            Complete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useQuickCheckStore } from "../stores/main/quick_check_store";
import MultipleChoiceQuestion from "./questions/MultipleChoiceQuestion.vue";
import FillInTheBlanksQuestion from "./questions/FillInTheBlanksQuestion.vue";
import PronunciationQuestion from "./questions/PronunciationQuestion.vue";

const quickCheckStore = useQuickCheckStore();

const handleAnswerSelected = (answer) => {
  console.log("Answer selected:", answer);
  handleComplete();
};

const handleAnswerSubmitted = (answers) => {
  console.log("Answers submitted:", answers);
  handleComplete();
};

const handlePronunciationComplete = (result) => {
  console.log("Pronunciation complete:", result);
  handleComplete();
};

const handleComplete = () => {
  quickCheckStore.completeQuickCheck();
};
</script>

<style lang="scss" scoped>
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

.quick-check__content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.quick-check__complete-btn {
  padding: 0.75rem 1.5rem;
  background-color: var(--global-button-background-primary, #252525);
  color: var(--global-button-text-primary, #fff);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: var(--global-button-background-primary-hover, #1f7069);
  }
}
</style>
