<template>
  <div v-show="quickCheckStore.isVisible" :class="$style['quick-check']">
    <div :class="$style['quick-check-content']">
      <h3>Quick Check</h3>
      <div v-if="quickCheckStore.currentQuickCheck">
        <DirectionLineComponent
          v-if="quickCheckDirectionLine && quickCheckDirectionLine.text"
          :directionLine="quickCheckDirectionLine"
          :stepIndex="0"
          @play="handleQuickCheckDirectionLinePlay"
          @pause="handleQuickCheckDirectionLinePause"
          @audio-ended="handleQuickCheckDirectionLineAudioEnded" />

        <div v-if="isMultipleChoiceQuestion">
          <MultipleChoiceQuestion
            :question="quickCheckStore.currentQuickCheck"
            @answer-selected="handleAnswerSelected" />
        </div>

        <div v-else-if="isFillInTheBlanksQuestion">
          <FillInTheBlanksQuestion
            :question="quickCheckStore.currentQuickCheck"
            @answer-submitted="handleAnswerSubmitted" />
        </div>

        <div v-else-if="isPronunciationQuestion">
          <PronunciationQuestion
            :question="quickCheckStore.currentQuickCheck"
            :pronunciationToggle="pronunciationToggle"
            @pronunciation-complete="handlePronunciationComplete" />
        </div>

        <div v-else-if="isDragAndDropQuestion">
          <DragAndDropQuestion
            :question="quickCheckStore.currentQuickCheck"
            @answer-submitted="handleAnswerSubmitted" />
        </div>

        <div>
          <button
            :class="$style['quick-check-complete-btn']"
            @click="handleComplete">
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
  import { DirectionLine } from '../stores/main/direction_line';
  import MultipleChoiceQuestion from './questions/MultipleChoiceQuestion.vue';
  import FillInTheBlanksQuestion from './questions/FillInTheBlanksQuestion.vue';
  import PronunciationQuestion from './questions/PronunciationQuestion.vue';
  import DragAndDropQuestion from './questions/DragAndDropQuestion.vue';
  import DirectionLineComponent from './DirectionLine.vue';

  /**
   * @typedef {Object} AnswerObject
   * @property {string} id - The answer identifier
   * @property {string} text - The answer text
   * @property {boolean} isCorrect - Whether the answer is correct
   */

  /**
   * @typedef {Object} PronunciationResult
   * @property {boolean} isCorrect - Whether pronunciation was correct
   * @property {number} score - Pronunciation score
   * @property {string} feedback - User feedback
   */

  const quickCheckStore = useQuickCheckStore();
  const directionLineStore = useDirectionLineStore();

  /**
   * Quick check direction line data
   */
  const quickCheckDirectionLine = ref(/** @type {DirectionLine|null} */ (null));

  /**
   * Computed property for pronunciation toggle
   */
  const pronunciationToggle = computed(() =>
    quickCheckStore.pronunciationToggle || undefined
  );

  /**
   * Computed properties for question type checking
   */
  const isMultipleChoiceQuestion = computed(() =>
    quickCheckStore.currentQuickCheck?.type === 'multiple_choice'
  );

  const isFillInTheBlanksQuestion = computed(() =>
    quickCheckStore.currentQuickCheck?.type === 'fill_in_the_blanks'
  );

  const isPronunciationQuestion = computed(() =>
    quickCheckStore.currentQuickCheck?.type === 'pronunciation'
  );

  const isDragAndDropQuestion = computed(() =>
    quickCheckStore.currentQuickCheck?.type === 'quick_check_drag_and_drop'
  );

  /**
   * Checks if quick check has direction line content
   * @param {Object} quickCheckContent - The quick check content object
   * @return {boolean} Whether direction line exists
   */
  const hasDirectionLineContent = (quickCheckContent) => {
    return quickCheckContent &&
      typeof quickCheckContent === 'object' &&
      'dl' in quickCheckContent &&
      quickCheckContent.dl;
  };

  /**
   * Creates direction line configuration for quick check
   * @param {string} directionLineText - The direction line text
   * @param {number|string} offset - The quick check offset
   * @return {Object} Direction line configuration
   */
  const createDirectionLineConfig = (directionLineText, offset) => ({
    text: directionLineText,
    languageCode: 'en',
    isNew: true,
    stepId: `quick_check_${offset || Date.now()}`,
    stepType: 'quick_check',
    name: 'quick_check',
  });

  /**
   * Pauses video player if currently playing
   */
  const pauseVideoIfPlaying = () => {
    const videoPlayer = document.querySelector('video');
    if (videoPlayer && !videoPlayer.paused) {
      videoPlayer.pause();
    }
  };

  /**
   * Initializes quick check direction line
   */
  const initializeQuickCheckDirectionLine = () => {
    const currentQC = quickCheckStore.currentQuickCheck;
    if (!currentQC) return;

    if (hasDirectionLineContent(currentQC.quick_check_content)) {
      const directionLineConfig = createDirectionLineConfig(
        currentQC.quick_check_content.dl,
        currentQC.offset
      );

      const directionLine = new DirectionLine(directionLineConfig);

      directionLineStore.setQuickCheckDirectionLine(directionLine);
      quickCheckDirectionLine.value = directionLine;

      console.log('Quick check direction line initialized:', directionLine);

      scheduleDirectionLineAudioPlay();
    } else {
      clearQuickCheckDirectionLine();
    }
  };

  /**
   * Schedules direction line audio to play after delay
   */
  const scheduleDirectionLineAudioPlay = () => {
    setTimeout(() => {
      if (quickCheckDirectionLine.value) {
        directionLineStore.startQuickCheckDirectionLineAudio();
      }
    }, 500);
  };

  /**
   * Clears quick check direction line
   */
  const clearQuickCheckDirectionLine = () => {
    directionLineStore.clearQuickCheckDirectionLine();
    quickCheckDirectionLine.value = null;
  };

  /**
   * Handles quick check direction line play event
   */
  const handleQuickCheckDirectionLinePlay = () => {
    console.log('Quick check direction line started playing');
    pauseVideoIfPlaying();
  };

  /**
   * Handles quick check direction line pause event
   */
  const handleQuickCheckDirectionLinePause = () => {
    console.log('Quick check direction line paused');
  };

  /**
   * Handles quick check direction line audio ended event
   */
  const handleQuickCheckDirectionLineAudioEnded = () => {
    console.log('Quick check direction line audio ended');
  };

  /**
   * Handles multiple choice answer selection
   * @param {AnswerObject} answer - The selected answer object
   */
  const handleAnswerSelected = (answer) => {
    handleComplete();
  };

  /**
   * Handles fill-in-the-blanks answer submission
   * @param {Array<string>} answers - The submitted answers
   */
  const handleAnswerSubmitted = (answers) => {
    handleComplete();
  };

  /**
   * Handles pronunciation question completion
   * @param {PronunciationResult} result - The pronunciation result
   */
  const handlePronunciationComplete = (result) => {
    handleComplete();
  };

  /**
   * Marks current quick check as complete
   */
  const handleComplete = () => {
    directionLineStore.stopQuickCheckDirectionLineAudio();
    quickCheckStore.completeQuickCheck();
  };

  /**
   * Emits quick check completion event
   */
  const emitQuickCheckCompletion = () => {
    document.dispatchEvent(new CustomEvent('quickCheckCompleted'));
  };

  /**
   * Lifecycle hook: Initialize when component mounts
   */
  onMounted(() => {
    initializeQuickCheckDirectionLine();
  });

  /**
   * Lifecycle hook: Clean up when component unmounts
   */
  onUnmounted(() => {
    directionLineStore.stopQuickCheckDirectionLineAudio();
    clearQuickCheckDirectionLine();
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
      emitQuickCheckCompletion();
    }
  });
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
