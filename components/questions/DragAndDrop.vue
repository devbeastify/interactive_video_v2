<template>
  <div :class="$style['drag-and-drop-question']">
    <p>Drag and Drop the best option</p>
    
    <!-- Progress indicator -->
    <div :class="$style['progress-indicator']">
      Question {{ state.currentItemIndex + 1 }} of {{ totalItems }}
    </div>
    
    <!-- Correct Answer Feedback -->
    <Transition name="fade">
      <div 
        v-if="state.showCorrectFeedback" 
        :class="$style['feedback-message']"
      >
        <span :class="$style['feedback-icon']">✓</span>
        <span :class="$style['feedback-text']">Correct!</span>
      </div>
    </Transition>

    <div :class="$style['prompt']">
      <div v-html="cleanPrompt || ''" />
      <div
        :class="[
          $style['drop-zone'],
          $style[`drop-zone--${dropZoneState}`]
        ]"
        @dragover.prevent
        @drop="onDrop"
        @click="onDropZoneClick">
        <span v-if="state.droppedWord">{{ state.droppedWord.content }}</span>
        <span v-else class="placeholder"></span>
      </div>
    </div>
    
    <div :class="$style['options']">
      <span
        v-for="(word, idx) in state.availableWords"
        :key="`word-${state.currentItemIndex}-${idx}`"
        :draggable="!state.isCorrectAnswer"
        :class="[
          $style['word'],
          {
            [$style['word--dragged']]: state.draggedIndex === idx,
            [$style['word--selected']]: state.selectedIndex === idx,
            [$style['word--correct']]: state.isCorrectAnswer && state.droppedWord && word.content === state.droppedWord.content,
            [$style['word--disabled']]: state.isCorrectAnswer
          }
        ]"
        @dragstart="onDragStart(idx)"
        @dragend="onDragEnd"
        @click="onWordClick(idx)">
        {{ word.content }}
      </span>
    </div>
    
    <Transition name="fade">
      <button
        v-if="state.isCorrectAnswer"
        :class="[$style['submit-btn'], $style['submit-btn--success']]"
        @click="handleItemCompletion">
        {{ isLastItem ? 'Complete' : 'Next' }}
      </button>
    </Transition>
  </div>
</template>

<script setup>
// @ts-check
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

/**
 * @typedef {Object} Word
 * @property {string} content - The text content of the word
 * @property {string|null} targetId - The target ID to determine if answer is correct
 */

/**
 * @typedef {Object} QuickCheckItem
 * @property {Word[]} words - Array of available words
 * @property {string} prompt - The prompt text
 */

/**
 * @typedef {Object} Question
 * @property {Object} quick_check_content
 * @property {QuickCheckItem[]} quick_check_content.items
 */

const props = defineProps({
  question: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['answer-submitted', 'item-completed']);

// State management with proper typing
const state = ref({
  availableWords: /** @type {Word[]} */ ([]),
  droppedWord: /** @type {Word|null} */ (null),
  draggedIndex: /** @type {number|null} */ (null),
  selectedIndex: /** @type {number|null} */ (null),
  isDropZoneFocused: false,
  isIncorrectAttempt: false,
  isCorrectAnswer: false,
  showCorrectFeedback: false,
  currentItemIndex: 0
});

// Computed properties
const allItems = computed(() => 
  props.question?.quick_check_content?.items || []
);

const totalItems = computed(() => allItems.value.length);

const currentItem = computed(() => 
  allItems.value[state.value.currentItemIndex] || null
);

const words = computed(() => currentItem.value?.words || []);

const isLastItem = computed(() => 
  state.value.currentItemIndex === totalItems.value - 1
);

const cleanPrompt = computed(() => 
  currentItem.value?.prompt?.replace(/%\d+%/g, '') || ''
);

const dropZoneState = computed(() => {
  if (state.value.isCorrectAnswer) return 'correct';
  if (state.value.isIncorrectAttempt) return 'incorrect';
  if (state.value.isDropZoneFocused) return 'focused';
  return 'default';
});

// Methods
const showCorrectAnswerFeedback = () => {
  state.value.showCorrectFeedback = true;
};

const resetForNewItem = () => {
  Object.assign(state.value, {
    droppedWord: null,
    draggedIndex: null,
    selectedIndex: null,
    isDropZoneFocused: false,
    isIncorrectAttempt: false,
    isCorrectAnswer: false,
    showCorrectFeedback: false
  });
};

const moveToNextItem = () => {
  if (state.value.currentItemIndex < totalItems.value - 1) {
    state.value.currentItemIndex++;
    resetForNewItem();
    initializeAvailableWords();
  }
};

const initializeAvailableWords = () => {
  if (words.value && Array.isArray(words.value)) {
    state.value.availableWords = [...words.value];
    console.log('Available words initialized:', state.value.availableWords);
  } else {
    console.warn('No words found in drag and drop question');
    state.value.availableWords = [];
  }
};

const handleWordSelection = (/** @type {Word} */ wordObj) => {
  if (wordObj.targetId) {
    // Correct answer
    state.value.droppedWord = wordObj;
    state.value.isCorrectAnswer = true;
    showCorrectAnswerFeedback();
  } else {
    // Incorrect answer - show wiggle effect
    state.value.isIncorrectAttempt = true;
    setTimeout(() => {
      state.value.isIncorrectAttempt = false;
    }, 600);
  }
};

const placeSelectedWord = () => {
  const selectedWordObj = state.value.selectedIndex !== null && 
    state.value.availableWords[state.value.selectedIndex];
  
  if (selectedWordObj) {
    handleWordSelection(selectedWordObj);
    state.value.selectedIndex = null;
  }
};

const onDrop = () => {
  const droppedWordObj = state.value.draggedIndex !== null && 
    state.value.availableWords[state.value.draggedIndex];
  
  if (droppedWordObj && !state.value.isCorrectAnswer) {
    handleWordSelection(droppedWordObj);
    state.value.draggedIndex = null;
    state.value.selectedIndex = null; // Reset keyboard/tap selection
  }
};

const handleItemCompletion = () => {
  if (state.value.droppedWord && state.value.isCorrectAnswer) {
    emit('item-completed', {
      itemIndex: state.value.currentItemIndex,
      answer: state.value.droppedWord.content,
      isLastItem: isLastItem.value
    });
    
    if (isLastItem.value) {
      emit('answer-submitted', [state.value.droppedWord.content]);
    } else {
      moveToNextItem();
    }
  }
};

// Event handlers
const onWordClick = (/** @type {number} */ idx) => {
  if (!state.value.isCorrectAnswer) {
    state.value.selectedIndex = idx;
  }
};

const onDropZoneClick = () => {
  if (state.value.selectedIndex !== null && !state.value.isCorrectAnswer) {
    placeSelectedWord();
  }
};

const onDragStart = (/** @type {number} */ idx) => {
  if (!state.value.isCorrectAnswer) {
    state.value.draggedIndex = idx;
    state.value.selectedIndex = null; // Reset keyboard/tap selection when dragging starts
  }
};

const onDragEnd = () => {
  state.value.draggedIndex = null;
};

// Keyboard navigation
const handleGlobalKeydown = (/** @type {KeyboardEvent} */ event) => {
  if (state.value.availableWords.length === 0 ||
    event.target instanceof HTMLInputElement || 
    event.target instanceof HTMLTextAreaElement) {
    return;
  }

  const keyActions = {
    ArrowLeft: () => {
      event.preventDefault();
      if (state.value.selectedIndex === null) {
        state.value.selectedIndex = state.value.availableWords.length - 1;
      } else {
        state.value.selectedIndex = Math.max(0, state.value.selectedIndex - 1);
      }
    },
    ArrowRight: () => {
      event.preventDefault();
      if (state.value.selectedIndex === null) {
        state.value.selectedIndex = 0;
      } else {
        state.value.selectedIndex = Math.min(
          state.value.availableWords.length - 1, 
          state.value.selectedIndex + 1
        );
      }
    },
    ' ': () => {
      event.preventDefault();
      if (state.value.selectedIndex !== null) {
        placeSelectedWord();
      }
    },
    Enter: () => {
      event.preventDefault();
      if (state.value.selectedIndex !== null) {
        placeSelectedWord();
      }
    }
  };

  const action = keyActions[event.key];
  if (action) action();
};

// Watchers
watch(words, initializeAvailableWords, { immediate: true });

// Lifecycle
onMounted(() => {
  initializeAvailableWords();
  console.log('Component mounted, allItems:', allItems.value);
  console.log('Current item:', currentItem.value);
  console.log('Words:', words.value);
  console.log('State availableWords:', state.value.availableWords);
  document.addEventListener('keydown', handleGlobalKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown);
});
</script>

<style lang="scss" module>
.drag-and-drop-question {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.progress-indicator {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
  padding: 0.5rem 1rem;
  background: #f8f9fa;
  border-radius: 20px;
  border: 1px solid #e9ecef;
}

.feedback-message {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1.1rem;
  text-align: center;
  min-width: 200px;
  background-color: #d4edda;
  color: #155724;
  border: 2px solid #c3e6cb;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.feedback-icon {
  font-size: 1.2rem;
  font-weight: bold;
}

.feedback-text {
  font-weight: 600;
}

.prompt {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.options {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.word {
  background: #f0f0f0;
  border-radius: 4px;
  padding: 0.5em 1em;
  cursor: grab;
  user-select: none;
  transition: all 0.2s ease;
  border: 2px solid transparent;

  &:hover {
    background: #e0e0e0;
  }
  
  &--correct {
    background: #d4edda;
    color: #155724;
    border-color: #28a745;
    cursor: default;
    transform: scale(1.05);
  }
  
  &--disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
  
  &--dragged {
    opacity: 0.5;
  }
  
  &--selected {
    background: #1f7069 !important;
    color: white !important;
    border-color: #1f7069 !important;
    transform: scale(1.02);
  }
}

.drop-zone {
  min-width: 100px;
  min-height: 2rem;
  border: 2px dashed #aaa;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  padding: 0 6px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #1f7069;
  }
  
  &--focused {
    border-color: #1f7069;
    background: #f0f8f7;
  }
  
  &--incorrect {
    border-color: #dc3545;
    background: #f8d7da;
    animation: wiggle 0.6s ease-in-out;
  }
  
  &--correct {
    border-color: #28a745;
    background: #d4edda;
    animation: correctPulse 0.5s ease-in-out;
  }
}

.submit-btn {
  padding: 0.5em 2em;
  background: #1f7069;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #1a5f5a;
    transform: translateY(-1px);
  }
  
  &--success {
    background: #28a745;
    
    &:hover {
      background: #218838;
    }
  }
}

.placeholder {
  color: #bbb;
}

// Animations
@keyframes wiggle {
  0%, 100% { transform: translateX(0) rotate(0deg); }
  10% { transform: translateX(-8px) rotate(-2deg); }
  20% { transform: translateX(8px) rotate(2deg); }
  30% { transform: translateX(-8px) rotate(-2deg); }
  40% { transform: translateX(8px) rotate(2deg); }
  50% { transform: translateX(-6px) rotate(-1deg); }
  60% { transform: translateX(6px) rotate(1deg); }
  70% { transform: translateX(-4px) rotate(-0.5deg); }
  80% { transform: translateX(4px) rotate(0.5deg); }
  90% { transform: translateX(-2px) rotate(-0.25deg); }
}

@keyframes correctPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

// Transitions
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
  