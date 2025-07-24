<template>
  <div :class="$style['quick-check']">
    <div :class="$style['quick-check-layout']">
      <div :class="$style['dl-section']">
        <DirectionLine
          v-if="dlStore.hasDL"
          :dlText="dlStore.currentDLText"
          :isPlaying="dlStore.isPlaying" />
      </div>

      <div :class="$style['quick-check-content']">
        <h3>Quick Check</h3>
        <div v-if="currentQuickCheckActionData">
          <div v-if="isMultipleChoiceQuestion">
            <MultipleChoiceQuestion
              :question="currentQuickCheckActionData"
              @answer-selected="handleAnswerSelected" />
          </div>

          <div v-else-if="isFillInTheBlanksQuestion">
            <FillInTheBlanksQuestion
              :question="currentQuickCheckActionData"
              @answer-submitted="handleAnswerSubmitted" />
          </div>

          <div v-else-if="isPronunciationQuestion">
            <PronunciationQuestion
              :question="currentQuickCheckActionData"
              @pronunciation-complete="handlePronunciationComplete" />
          </div>

          <div v-else-if="isDragAndDropQuestion">
            <DragAndDropQuestion
              :question="currentQuickCheckActionData"
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
  </div>
</template>

<script setup>
// @ts-check

  import { computed, onMounted, onUnmounted, watch } from 'vue';
  import { useActionStore } from '../stores/action_store';
  import { useDLStore } from '../stores/direction_line_store';
  import { mainStore } from '../stores/main_store';
  import { eventDispatcher, DL_EVENTS } from '../lib/event_dispatcher.js';
  import MultipleChoiceQuestion from './questions/MultipleChoiceQuestion.vue';
  import FillInTheBlanksQuestion from './questions/FillInTheBlanksQuestion.vue';
  import PronunciationQuestion from './questions/PronunciationQuestion.vue';
  import DragAndDropQuestion from './questions/DragAndDropQuestion.vue';
  import DirectionLine from './DirectionLine.vue';

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

  /**
   * @typedef {Object} QuickCheckAction
   * @property {string} type - The action type
   * @property {Object} data - The action data
   */

  const emit = defineEmits(['quick-check-complete']);

  /**
   * Props for the component
   */
  const props = defineProps({
    preventInitialization: {
      type: Boolean,
      default: false,
    },
  });

  const actionStore = useActionStore();
  const dlStore = useDLStore();
  const store = mainStore();

  /**
   * Computed property for current quick check data from action store
   * @return {QuickCheckAction | null} Current quick check action data
   */
  const currentQuickCheckActionData = computed(() => {
    const currentAction = /** @type {QuickCheckAction} */ (actionStore.currentAction);
    return currentAction && currentAction.type === 'quick_check' ?
      currentAction.data :
      null;
  });

  /**
   * Computed properties for question type checking
   */
  const isMultipleChoiceQuestion = computed(() =>
    currentQuickCheckActionData.value?.type === 'multiple_choice'
  );

  const isFillInTheBlanksQuestion = computed(() =>
    currentQuickCheckActionData.value?.type === 'fill_in_the_blanks'
  );

  const isPronunciationQuestion = computed(() =>
    currentQuickCheckActionData.value?.type === 'pronunciation'
  );

  const isDragAndDropQuestion = computed(() =>
    currentQuickCheckActionData.value?.type === 'quick_check_drag_and_drop'
  );

  /**
   * Initializes DL for quick check phase
   */
  const initializeDLForQuickCheck = () => {
    const activityInfoForDL = /** @type {import('../stores/direction_line_store').ActivityInfo} */ (
      store.activityInfo
    );
    dlStore.initializeDLForPhase('quick_check', activityInfoForDL);

    if (dlStore.hasDL) {
      dlStore.playDL();
    }
  };

  /**
   * Handles DL completion event
   */
  const handleDLCompleted = () => {
    console.log('DL completed');
  };

  /**
   * Handles DL start event
   */
  const handleDLStarted = () => {
    console.log('DL started');
  };

  /**
   * Sets up event listeners for DL
   */
  const setUpEventListeners = () => {
    eventDispatcher.on(DL_EVENTS.COMPLETED, handleDLCompleted);
    eventDispatcher.on(DL_EVENTS.STARTED, handleDLStarted);
  };

  /**
   * Cleans up event listeners
   */
  const cleanupEventListeners = () => {
    eventDispatcher.off(DL_EVENTS.COMPLETED, handleDLCompleted);
    eventDispatcher.off(DL_EVENTS.STARTED, handleDLStarted);
  };

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
   * Emits quick check complete event
   */
  const handleComplete = () => {
    document.dispatchEvent(
      new CustomEvent(
        'progressBarElementEnabled',
        { detail: { elementIndex: actionStore.currentActionIndex }}
      )
    );
    emit('quick-check-complete');
  };

  /**
   * Watches for action changes and initializes quick check
   */
  watch(() => actionStore.currentAction, (newAction) => {
    if (newAction?.type === 'quick_check' && !props.preventInitialization) {
      pauseVideoIfPlaying();
      initializeDLForQuickCheck();
    }
  });

  onMounted(() => {
    setUpEventListeners();

    if (actionStore.currentAction?.type === 'quick_check') {
      initializeDLForQuickCheck();
    }
  });

  onUnmounted(() => {
    try {
      cleanupEventListeners();
      dlStore.cleanup();
    } catch (error) {
      console.warn('Error during QuickCheck component cleanup:', error);
    }
  });
</script>

<style lang="scss" module>
@use 'MusicV3/v3/styles/base' as base;

.quick-check {
  align-items: center;
  display: flex;
  justify-content: center;
  padding: base.rpx(16);
}

.quick-check-layout {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: base.rpx(24);
  max-width: base.rpx(800);
  width: 100%;
}

.dl-section {
  margin-bottom: base.rpx(16);
  max-width: base.rpx(600);
  width: 100%;
}

.quick-check-content {
  background: white;
  border-radius: base.rpx(8);
  box-shadow: 0 base.rpx(4) base.rpx(12) rgba(0, 0, 0, 0.1);
  max-width: base.rpx(600);
  overflow-y: auto;
  padding: base.rpx(32);
  width: 100%;
}

.quick-check-complete-btn {
  background: #007bff;
  border: none;
  border-radius: base.rpx(4);
  color: white;
  cursor: pointer;
  font-size: base.rpx(16);
  margin-top: base.rpx(16);
  padding: base.rpx(12) base.rpx(24);

  &:hover {
    background: #0056b3;
  }
}
</style>
