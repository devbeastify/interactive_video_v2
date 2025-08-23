<template>
  <div :class="$style['drag-and-drop-question']">
    <p>Drag and Drop the best option</p>
    
    <!-- Progress indicator -->
    <div :class="$style['progress-indicator']">
      Question {{ currentItemIndex + 1 }} of {{ totalItems }}
    </div>
    
    <!-- Correct Answer Feedback -->
    <div 
      v-if="showCorrectFeedback" 
      :class="$style['feedback-message']"
    >
      <div :class="$style['feedback-success']">
        <span :class="$style['feedback-icon']">✓</span>
        <span :class="$style['feedback-text']">Correct!</span>
      </div>
    </div>

    <div :class="$style['prompt']">
      <div v-html="cleanPrompt || ''" />
      <div
        :class="[
          $style['drop-zone'],
          { 
            [$style['drop-zone-focused']]: isDropZoneFocused,
            [$style['drop-zone-incorrect']]: isIncorrectAttempt,
            [$style['drop-zone-correct']]: isCorrectAnswer
          }
        ]"
        @dragover.prevent
        @drop="onDrop"
        @click="onDropZoneClick">
        <span v-if="droppedWord">{{ droppedWord.content }}</span>
        <span v-else class="placeholder"></span>
      </div>
    </div>
    
    <div :class="$style['options']">
      <span
        v-for="(word, idx) in availableWords"
        :key="idx"
        :draggable="!isCorrectAnswer"
        :class="[
          $style['word'],
          {
            [$style['dragged']]: draggedIndex === idx,
            [$style['selected']]: selectedIndex === idx,
            [$style['word-correct']]: isCorrectAnswer && droppedWord && word.content === droppedWord.content,
            [$style['word-disabled']]: isCorrectAnswer
          }
        ]"
        @dragstart="onDragStart(idx)"
        @dragend="onDragEnd"
        @click="onWordClick(idx)">
        {{ word.content }}
      </span>
    </div>
    
    <button
      v-if="isCorrectAnswer"
      :class="[$style['submit-btn'], $style['submit-btn--success']]"
      @click="handleItemCompletion">
      {{ isLastItem ? 'Complete' : 'Next' }}
    </button>
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

/** @type {import('vue').Ref<Word[]>} */
const availableWords = ref([]);
/** @type {import('vue').Ref<Word|null>} */
const droppedWord = ref(null);
/** @type {import('vue').Ref<number|null>} */
const draggedIndex = ref(null);
/** @type {import('vue').Ref<number|null>} */
const selectedIndex = ref(null);
/** @type {import('vue').Ref<boolean>} */
const isDropZoneFocused = ref(false);
/** @type {import('vue').Ref<boolean>} */
const isIncorrectAttempt = ref(false);
/** @type {import('vue').Ref<boolean>} */
const isCorrectAnswer = ref(false);
/** @type {import('vue').Ref<boolean>} */
const showCorrectFeedback = ref(false);
/** @type {import('vue').Ref<number>} */
const currentItemIndex = ref(0);

/**
 * Gets all items from quick_check_content.items
 * @return {QuickCheckItem[]} Array of all items
 */
const allItems = computed(() => {
  return props.question?.quick_check_content?.items || [];
});

/**
 * Gets the current item based on currentItemIndex
 * @return {QuickCheckItem|null} The current item or null if not found
 */
const currentItem = computed(() => {
  if (allItems.value.length > 0 && currentItemIndex.value < allItems.value.length) {
    return allItems.value[currentItemIndex.value];
  }
  return null;
});

/**
 * Gets the total number of items
 * @return {number} Total number of items
 */
const totalItems = computed(() => {
  return allItems.value.length;
});

/**
 * Checks if the current item is the last one
 * @return {boolean} True if this is the last item
 */
const isLastItem = computed(() => {
  return currentItemIndex.value === totalItems.value - 1;
});

/**
 * Gets words from the current item
 * @return {Word[]} Array of available words
 */
const words = computed(() => {
  return currentItem.value?.words || [];
});

const cleanPrompt = computed(() => {
  if (currentItem.value?.prompt) {
    // Remove all %n% placeholders from the prompt
    return currentItem.value.prompt.replace(/%\d+%/g, '');
  }
  return '';
});

/**
 * Shows correct answer feedback
 */
function showCorrectAnswerFeedback() {
  showCorrectFeedback.value = true;
}

/**
 * Resets the component state for a new item
 */
function resetForNewItem() {
  droppedWord.value = null;
  draggedIndex.value = null;
  selectedIndex.value = null;
  isDropZoneFocused.value = false;
  isIncorrectAttempt.value = false;
  isCorrectAnswer.value = false;
  showCorrectFeedback.value = false;
}

/**
 * Moves to the next item
 */
function moveToNextItem() {
  if (currentItemIndex.value < totalItems.value - 1) {
    currentItemIndex.value++;
    resetForNewItem();
    initializeAvailableWords();
  }
}

/**
 * Initializes available words when component mounts or item changes
 */
function initializeAvailableWords() {
  if (words.value && Array.isArray(words.value)) {
    availableWords.value = [...words.value];
  } else {
    console.warn('No words found in drag and drop question');
    availableWords.value = [];
  }
}

/**
 * Watches for changes in the words computed property and updates availableWords
 */
watch(words, (newWords) => {
  if (newWords && Array.isArray(newWords)) {
    availableWords.value = [...newWords];
  } else {
    availableWords.value = [];
  }
}, { immediate: true });

/**
 * Handles global keyboard navigation and actions
 * @param {KeyboardEvent} event - The keyboard event
 */
function handleGlobalKeydown(event) {
  if (availableWords.value.length === 0 ||
    (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)) {
    return;
  }

  switch (event.key) {
  case 'ArrowLeft':
    event.preventDefault();
    selectPreviousWord();
    break;
  case 'ArrowRight':
    event.preventDefault();
    selectNextWord();
    break;
  case ' ':
    event.preventDefault();
    if (selectedIndex.value !== null) {
      placeSelectedWord();
    }
    break;
  case 'Enter':
    event.preventDefault();
    if (selectedIndex.value !== null) {
      placeSelectedWord();
    }
    break;
  }
}

/**
 * Selects the previous word in the list
 */
function selectPreviousWord() {
  if (availableWords.value.length === 0) return;

  if (selectedIndex.value === null) {
    selectedIndex.value = availableWords.value.length - 1;
  } else if (selectedIndex.value <= 0) {
    selectedIndex.value = availableWords.value.length - 1;
  } else {
    selectedIndex.value--;
  }
}

/**
 * Selects the next word in the list
 */
function selectNextWord() {
  if (availableWords.value.length === 0) return;

  if (selectedIndex.value === null) {
    selectedIndex.value = 0;
  } else if (selectedIndex.value >= availableWords.value.length - 1) {
    selectedIndex.value = 0;
  } else {
    selectedIndex.value++;
  }
}

/**
 * Places the currently selected word in the drop zone
 */
function placeSelectedWord() {
  if (selectedIndex.value !== null && availableWords.value[selectedIndex.value]) {
    const selectedWordObj = availableWords.value[selectedIndex.value];
    
    if (selectedWordObj.targetId !== null && selectedWordObj.targetId !== undefined && selectedWordObj.targetId !== '') {
      // Correct answer - place it in dropzone
      droppedWord.value = selectedWordObj;
      isCorrectAnswer.value = true;
      showCorrectAnswerFeedback();
    } else {
      // Incorrect answer - show wiggle effect, word stays in pool
      isIncorrectAttempt.value = true;
      
      // Reset wiggle effect after animation
      setTimeout(() => {
        isIncorrectAttempt.value = false;
      }, 600);
    }
    
    selectedIndex.value = null;
  }
}

/**
 * Handles clicking on a word to select it
 * @param {number} idx - The index of the clicked word
 */
function onWordClick(idx) {
  if (!isCorrectAnswer.value) {
    selectedIndex.value = idx;
  }
}

/**
 * Handles clicking on the drop zone to place selected word
 */
function onDropZoneClick() {
  if (selectedIndex.value !== null && !isCorrectAnswer.value) {
    placeSelectedWord();
  }
}

/**
 * Handles drag start event
 * @param {number} idx - The index of the dragged word
 */
function onDragStart(idx) {
  if (!isCorrectAnswer.value) {
    draggedIndex.value = idx;
  }
}

/**
 * Handles drag end event
 */
function onDragEnd() {
  draggedIndex.value = null;
}

/**
 * Handles drop event and validates the answer
 */
function onDrop() {
  if (draggedIndex.value !== null && availableWords.value[draggedIndex.value] && !isCorrectAnswer.value) {
    const droppedWordObj = availableWords.value[draggedIndex.value];
    
    if (droppedWordObj.targetId !== null && droppedWordObj.targetId !== undefined && droppedWordObj.targetId !== '') {
      // Correct answer - place it in dropzone
      droppedWord.value = droppedWordObj;
      isCorrectAnswer.value = true;
      showCorrectAnswerFeedback();
    } else {
      // Incorrect answer - show wiggle effect, word returns to pool
      isIncorrectAttempt.value = true;
      
      // Reset wiggle effect after animation
      setTimeout(() => {
        isIncorrectAttempt.value = false;
      }, 600);
    }
    
    draggedIndex.value = null;
    selectedIndex.value = null;
  }
}

/**
 * Handles item completion and progression
 */
function handleItemCompletion() {
  if (droppedWord.value && isCorrectAnswer.value) {
    // Emit item completed event
    emit('item-completed', {
      itemIndex: currentItemIndex.value,
      answer: droppedWord.value.content,
      isLastItem: isLastItem.value
    });
    
    if (isLastItem.value) {
      // This was the last item, emit final submission
      emit('answer-submitted', [droppedWord.value.content]);
    } else {
      // Move to next item
      moveToNextItem();
    }
  }
}

/**
 * Sets up global keyboard event listener
 */
onMounted(() => {
  initializeAvailableWords();
  console.log('allItems.value', allItems.value);
  console.log('currentItem.value', currentItem.value);
  
  document.addEventListener('keydown', handleGlobalKeydown);
});

/**
 * Cleans up global keyboard event listener
 */
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
  animation: fadeIn 0.3s ease-in-out;
  background-color: #d4edda;
  color: #155724;
  border: 2px solid #c3e6cb;
}

.feedback-success {
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
  
  &.word-correct {
    background: #d4edda;
    color: #155724;
    border-color: #28a745;
    cursor: default;
    transform: scale(1.05);
  }
  
  &.word-disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
}

.word.dragged {
  opacity: 0.5;
}

.word.selected {
  background: #1f7069;
  color: white;
  border-color: #1f7069;
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
}

.drop-zone-focused {
  border-color: #1f7069;
  background: #f0f8f7;
}

.drop-zone-incorrect {
  border-color: #dc3545;
  background: #f8d7da;
  animation: wiggle 0.6s ease-in-out;
}

.drop-zone-correct {
  border-color: #28a745;
  background: #d4edda;
  animation: correctPulse 0.5s ease-in-out;
}

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

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.placeholder {
  color: #bbb;
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

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}
</style>
  