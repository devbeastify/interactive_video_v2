<template>
  <div v-show="quickCheckStore.isVisible" :class="$style['quick-check']"> 
    <div :class="$style['quick-check-content']">
      <h3>Quick Check</h3>
      <div v-if="quickCheckStore.currentQuickCheck">
        <DirectionLineComponent
          v-if="quickCheckDirectionLine && quickCheckDirectionLine.text"
          :direction-line="quickCheckDirectionLine"
          :step-index="0"
          @play="handleQuickCheckDirectionLinePlay"
          @pause="handleQuickCheckDirectionLinePause"
          @audio-ended="handleQuickCheckDirectionLineAudioEnded" />
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

import { onMounted, onUnmounted, watch, computed, ref } from 'vue';
import { useQuickCheckStore } from '../stores/main/quick_check_store';
import { useDirectionLineStore } from '../stores/main/direction_line_store';
import { mainStore } from '../stores/main/main_store';
import { DirectionLine } from '../stores/main/direction_line';
import MultipleChoiceQuestion from './questions/MultipleChoiceQuestion.vue';
import FillInTheBlanksQuestion from './questions/FillInTheBlanksQuestion.vue';
import PronunciationQuestion from './questions/PronunciationQuestion.vue';
import DragAndDropQuestion from './questions/DragAndDropQuestion.vue';
import DirectionLineComponent from './DirectionLine.vue';

const quickCheckStore = useQuickCheckStore();
const directionLineStore = useDirectionLineStore();
const store = mainStore();

/**
 * Quick check direction line data
 */
const quickCheckDirectionLine = ref(/** @type {DirectionLine|null} */ (null));

/**
 * Initialize quick check direction line
 */
const initializeQuickCheckDirectionLine = () => {
  const currentQC = quickCheckStore.currentQuickCheck;
  if (!currentQC) return;

  // Check if quick check has its own direction line
  if (currentQC.quick_check_content && 
      typeof currentQC.quick_check_content === 'object' && 
      'dl' in currentQC.quick_check_content && 
      currentQC.quick_check_content.dl) {
    
    // Create direction line object for quick check using the DirectionLine class
    const directionLine = new DirectionLine({
      text: /** @type {string} */ (currentQC.quick_check_content.dl),
      languageCode: 'en', // Default language, can be enhanced later
      isNew: true,
      stepId: `quick_check_${currentQC.offset || Date.now()}`,
      stepType: 'quick_check',
      name: 'quick_check'
    });

    // Set the quick check direction line in the store
    directionLineStore.setQuickCheckDirectionLine(directionLine);
    quickCheckDirectionLine.value = directionLine;

    console.log('Quick check direction line initialized:', directionLine);
    
    // Auto-play the direction line audio after a short delay
    setTimeout(() => {
      if (quickCheckDirectionLine.value) {
        directionLineStore.startQuickCheckDirectionLineAudio();
      }
    }, 500);
  } else {
    directionLineStore.clearQuickCheckDirectionLine();
    quickCheckDirectionLine.value = null;
  }
};

/**
 * Handle quick check direction line play event
 */
const handleQuickCheckDirectionLinePlay = () => {
  console.log('Quick check direction line started playing');
  // Pause video if it's playing
  const videoPlayer = document.querySelector('video');
  if (videoPlayer && !videoPlayer.paused) {
    videoPlayer.pause();
  }
};

/**
 * Handle quick check direction line pause event
 */
const handleQuickCheckDirectionLinePause = () => {
  console.log('Quick check direction line paused');
  // Don't resume video - wait for quick check completion
};

/**
 * Handle quick check direction line audio ended event
 */
const handleQuickCheckDirectionLineAudioEnded = () => {
  console.log('Quick check direction line audio ended');
  // Don't resume video - wait for quick check completion
  // Video will only resume after quick check is completed/submitted
};

/**
 * Lifecycle hook: Initialize when component mounts
 */
onMounted(() => {
  // Initialize quick check direction line when component mounts
  initializeQuickCheckDirectionLine();
});

/**
 * Lifecycle hook: Clean up when component unmounts
 */
onUnmounted(() => {
  // Clean up quick check direction line
  directionLineStore.stopQuickCheckDirectionLineAudio();
  directionLineStore.clearQuickCheckDirectionLine();
  quickCheckDirectionLine.value = null;
});

/**
 * Watch for quick check changes and initialize direction line
 */
watch(() => quickCheckStore.currentQuickCheck, () => {
  initializeQuickCheckDirectionLine();
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
  // Stop any playing quick check direction line audio
  directionLineStore.stopQuickCheckDirectionLineAudio();
  
  // Complete the quick check
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
