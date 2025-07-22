<template>
    <div :class="$style['quick-check']">
      <div :class="$style['quick-check-layout']">
        <!-- DL Component for quick check - now positioned vertically -->
        <div :class="$style['dl-section']">
          <DirectionLine 
            v-if="dlStore.hasDL"
            :dl-text="dlStore.currentDLText"
            :is-playing="dlStore.isPlaying" />
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
  import { eventDispatcher, DL_EVENTS } from '../lib/event_dispatcher';
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
  
  const emit = defineEmits(['quick-check-complete']);
  
  // Store instances
  const actionStore = useActionStore();
  const dlStore = useDLStore();
  const store = mainStore();
  
  /**
   * Computed property for current quick check data from action store
   */
  const currentQuickCheckActionData = computed(() => {
    const currentAction = /** @type {any} */ (actionStore.currentAction);
    return currentAction && currentAction.type === 'quick_check' ? currentAction.data : null;
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
   * Initialize DL for quick check phase
   */
  const initializeDLForQuickCheck = () => {
    // Cast activityInfo to the expected type for DL store
    const activityInfoForDL = /** @type {import('../stores/direction_line_store').ActivityInfo} */ (store.activityInfo);
    dlStore.initializeDLForPhase('quick_check', activityInfoForDL);
    
    // Start DL playback if available
    if (dlStore.hasDL) {
      dlStore.playDL();
    }
  };
  
  /**
   * Event handlers for DL
   */
  const handleDLCompleted = () => {
    // DL completed for quick check - video should remain paused
    // The VideoPlayer component will check actionStore.isCurrentActionVideo
    // and won't resume video since we're in quick_check mode
    console.log('DL completed for quick check - video remains paused');
  };
  
  const handleDLStarted = () => {
    // DL started playing
    console.log('DL started for quick check');
  };
  
  /**
   * Set up event listeners for DL
   */
  const setupEventListeners = () => {
    eventDispatcher.on(DL_EVENTS.COMPLETED, handleDLCompleted);
    eventDispatcher.on(DL_EVENTS.STARTED, handleDLStarted);
  };
  
  /**
   * Clean up event listeners
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
    emit('quick-check-complete');
  };
  
  // Watchers
  watch(() => actionStore.currentAction, (newAction) => {
    if (newAction?.type === 'quick_check') {
      // Pause video if playing
      pauseVideoIfPlaying();
      
      // Initialize DL for quick check
      initializeDLForQuickCheck();
    }
  });
  
  // Lifecycle hooks
  onMounted(() => {
    setupEventListeners();
    
    // Initialize DL if we're already on a quick check
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
    display: flex;
    align-items: center;
    justify-content: center;
    padding: base.rpx(16);
    min-height: 100vh;
  }
  
  .quick-check-layout {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: base.rpx(24);
    width: 100%;
    max-width: base.rpx(800);
  }
  
  .dl-section {
    width: 100%;
    max-width: base.rpx(600);
    margin-bottom: base.rpx(16);
  }
  
  .quick-check-content {
    background: white;
    padding: base.rpx(32);
    border-radius: base.rpx(8);
    max-width: base.rpx(600);
    width: 100%;
    max-height: 60vh;
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
  