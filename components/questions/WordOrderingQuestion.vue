<template>
  <div :class="$style['word-ordering-question']">
    <div :class="$style['prompt']">{{ prompt }}</div>
    <div v-if="finalSentence" :class="$style['final-sentence']">
      <strong>Form this sentence:</strong> {{ punctuationBefore }}{{ finalSentence }}{{ punctuationAfter }}
    </div>
    <div :class="$style['options']">
      <span
        v-for="(word, idx) in availableWords"
        :key="idx"
        :draggable="!isWordUsed(word)"
        :class="[
          $style['word'], 
          { 
            [$style['dragged']]: draggedIndex === idx,
            [$style['used']]: isWordUsed(word)
          }
        ]"
        @dragstart="onDragStart(idx)"
        @dragend="onDragEnd">
        {{ word.content }}
      </span>
    </div>
    <div
      :class="$style['answer-box']"
      @dragover.prevent
      @drop="onDropToAnswerBox">
      <div v-if="droppedWords.length > 0" :class="$style['sentence']">
        <!-- Drop zone at the beginning (before the first word) -->
        <div 
          :class="[
            $style['drop-zone'],
            { [$style['active']]: selectedWordIndex !== null }
          ]"
          @dragover.prevent
          @drop="onDropAtPosition(0)"
          @click="moveSelectedWord(0)"
          :title="selectedWordIndex !== null ? `Click or drop to move selected word to the beginning` : `Click a word first, then click here to move it to the beginning`">
        </div>
        
        <template v-for="(word, idx) in droppedWords" :key="idx">
          <span 
            :class="[
              $style['dropped-word'],
              { [$style['selected']]: selectedWordIndex === idx }
            ]"
            :draggable="true"
            @click="selectWord(idx)"
            @dragstart="onDragStartDroppedWord(idx)"
            @dragend="onDragEnd"
            :title="`Click to select or drag '${word.content}'`">
            {{ word.content }}
          </span>
          <!-- Drop zone between words -->
          <div 
            v-if="idx < droppedWords.length - 1"
            :class="[
              $style['drop-zone'],
              { [$style['active']]: selectedWordIndex !== null }
            ]"
            @dragover.prevent
            @drop="onDropAtPosition(idx + 1)"
            @click="moveSelectedWord(idx + 1)"
            :title="selectedWordIndex !== null ? `Click or drop to move selected word here` : `Click a word first, then click here to move it`">
          </div>
        </template>
      </div>
      <span v-else class="placeholder">Drag words here to form the sentence</span>
    </div>
    <div :class="$style['button-group']">
      <button
        :class="$style['reset-btn']"
        :disabled="droppedWords.length === 0"
        @click="resetAnswer">
        Reset
      </button>
      <button
        :class="$style['submit-btn']"
        :disabled="droppedWords.length === 0"
        @click="submit">
        Submit
      </button>
    </div>
  </div>
</template>

<script setup>
// @ts-check
  import { ref, computed, onMounted } from 'vue';

  /**
   * @typedef {Object} Word
   * @property {string} content - The text content of the word
   * @property {string} targetId - The target identifier for the word
   */

  /**
   * @typedef {Object} QuickCheckItem
   * @property {Word[]} words - Array of available words
   * @property {string} question_prompt - The question prompt text
   * @property {string} final_sentence - The final sentence to form
   * @property {string} punctuation_before - Punctuation before the sentence
   * @property {string} punctuation_after - Punctuation after the sentence
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

  const emit = defineEmits(['answer-submitted']);

  /**
   * @type {import('vue').Ref<Word[]>}
   */
  const availableWords = ref([]);
  /**
   * @type {import('vue').Ref<Word[]>}
   */
  const droppedWords = ref([]);
  /**
   * @type {import('vue').Ref<number|null>}
   */
  const draggedIndex = ref(null);
  /**
   * @type {import('vue').Ref<number|null>}
   */
  const selectedWordIndex = ref(null);

  /**
   * @type {import('vue').Ref<number|null>}
   */
  const draggedDroppedWordIndex = ref(null);

  /**
   * Gets the first item from quick_check_content.items
   * @return {QuickCheckItem|null} The current item or null if not found
   */
  const currentItem = computed(() => {
    if (props.question?.quick_check_content?.items?.length > 0) {
      return props.question.quick_check_content.items[0];
    }
    return null;
  });

  /**
   * Gets words from the current item
   * @return {Word[]} Array of available words
   */
  const words = computed(() => {
    const items = currentItem.value?.words || [];
    
    let result = [];
    
    if (Array.isArray(items) && items.length > 0) {
      result = items;
    } else if (currentItem.value?.answers) {
      const answers = currentItem.value.answers;
      if (typeof answers === 'object' && answers !== null) {
        result = Object.entries(answers).map(([key, value]) => ({
          content: value,
          targetId: key
        }));
      }
    }
  
    return result;
  });

  /**
   * Gets question prompt from the current item
   * @return {string} The question prompt
   */
  const questionPrompt = computed(() => {
    return currentItem.value?.question_prompt || '';
  });

  /**
   * Gets final sentence from the current item
   * @return {string} The final sentence to form
   */
  const finalSentence = computed(() => {
    return currentItem.value?.final_sentence || '';
  });

  /**
   * Gets punctuation before from the current item
   * @return {string} Punctuation before the sentence
   */
  const punctuationBefore = computed(() => {
    return currentItem.value?.punctuation_before || '';
  });

  /**
   * Gets punctuation after from the current item
   * @return {string} Punctuation after the sentence
   */
  const punctuationAfter = computed(() => {
    return currentItem.value?.punctuation_after || '';
  });

  /**
   * Creates a prompt from the available data
   * @return {string} The formatted prompt
   */
  const prompt = computed(() => {
    if (questionPrompt.value) {
      return questionPrompt.value;
    }
    
    if (finalSentence.value) {
      return `Arrange the words to form: ${finalSentence.value}`;
    }
    
    return 'Arrange the words to form the question: %1%';
  });

  /**
   * Checks if a word has been used in the droppedWords array
   * @param {Word} word - The word to check
   * @return {boolean} True if the word has been used, false otherwise
   */
  const isWordUsed = (word) => {
    return droppedWords.value.some(droppedWord => droppedWord.targetId === word.targetId);
  };

  /**
   * Initializes available words when component mounts
   */
  function initializeAvailableWords() {
    if (words.value && Array.isArray(words.value)) {
      availableWords.value = [...words.value];
    } else {
      console.warn('No words found in word ordering question');
      availableWords.value = [];
    }
  }


  /**
   * Handles drag start event
   * @param {number} idx - The index of the dragged word
   */
  function onDragStart(idx) {
    draggedIndex.value = idx;
  }

  /**
   * Handles drag end event
   */
  function onDragEnd() {
    draggedIndex.value = null;
    draggedDroppedWordIndex.value = null;
  }

  /**
   * Handles drag start for already dropped words
   * @param {number} idx - The index of the dragged word
   */
  function onDragStartDroppedWord(idx) {
    draggedDroppedWordIndex.value = idx;
  }

  /**
   * Handles drop event at a specific position
   * @param {number} position - The position to insert the word at
   */
  function onDropAtPosition(position) {
    if (draggedIndex.value !== null && availableWords.value[draggedIndex.value]) {
      const wordToAdd = availableWords.value[draggedIndex.value];
      if (!droppedWords.value.some(word => word.targetId === wordToAdd.targetId)) {
        droppedWords.value.splice(position, 0, wordToAdd);
      }
      draggedIndex.value = null;
    } else if (draggedDroppedWordIndex.value !== null) {
      const wordToMove = droppedWords.value[draggedDroppedWordIndex.value];
      
      droppedWords.value.splice(draggedDroppedWordIndex.value, 1);
      
      const adjustedPosition = draggedDroppedWordIndex.value < position ? position - 1 : position;
      droppedWords.value.splice(adjustedPosition, 0, wordToMove);
      
      draggedDroppedWordIndex.value = null;
    }
  }

  /**
   * Handles dropping words directly into the answer box
   */
  function onDropToAnswerBox() {
    if (draggedIndex.value !== null && availableWords.value[draggedIndex.value]) {
      const wordToAdd = availableWords.value[draggedIndex.value];
      if (!droppedWords.value.some(word => word.targetId === wordToAdd.targetId)) {
        droppedWords.value.push(wordToAdd);
      }
      draggedIndex.value = null;
    } else if (draggedDroppedWordIndex.value !== null) {
      const wordToMove = droppedWords.value[draggedDroppedWordIndex.value];
      const dropPosition = droppedWords.value.length;
      
      droppedWords.value.splice(draggedDroppedWordIndex.value, 1);
      
      droppedWords.value.splice(dropPosition, 0, wordToMove);
      
      draggedDroppedWordIndex.value = null;
    }
  }

  /**
   * Resets the answer box to its initial state (empty)
   */
  function resetAnswer() {
    droppedWords.value = [];
    selectedWordIndex.value = null;
  }

  /**
   * Submits the selected answer
   */
  function submit() {
    if (droppedWords.value.length > 0) {
      emit('answer-submitted', droppedWords.value.map(word => word.content));
    }
  }

  /**
   * Selects a word for moving
   * @param {number} idx - The index of the word to select
   */
  function selectWord(idx) {
    if (selectedWordIndex.value === idx) {
      selectedWordIndex.value = null;
    } else {
      selectedWordIndex.value = idx;
    }
  }

  /**
   * Moves the selected word to a new position (click method)
   * @param {number} newPosition - The new position to move the word to
   */
  function moveSelectedWord(newPosition) {
    if (selectedWordIndex.value === null) {
      return;
    }
    
    const selectedWord = droppedWords.value[selectedWordIndex.value];
    
    droppedWords.value.splice(selectedWordIndex.value, 1);
    
    const adjustedPosition = selectedWordIndex.value < newPosition ? newPosition - 1 : newPosition;
    droppedWords.value.splice(adjustedPosition, 0, selectedWord);
    
    selectedWordIndex.value = null;
  }

  onMounted(initializeAvailableWords);
</script>

<style lang="scss" module>
.word-ordering-question {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.prompt {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.final-sentence {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  text-align: center;
  font-size: 1rem;
}

.final-sentence strong {
  color: #495057;
  margin-right: 0.5rem;
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
  transition: background 0.2s;

  &:hover {
    background: #e0e0e0;
  }
}

.word.dragged {
  opacity: 0.5;
}

.word.used {
  visibility: hidden;
}

.answer-box {
  min-width: 500px;
  min-height: 3em;
  border: 2px dashed #007bff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: left;
  margin-bottom: 1rem;
  background: #f8f9fa;
  padding: 1rem;
  text-align: center;
  transition: border-color 0.2s;
}

.answer-box:hover {
  border-color: #0056b3;
}

.sentence {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0;
  padding: 0;
  margin: 0;
}

.dropped-word {
  background: #e0e0e0;
  border-radius: 4px;
  padding: 0.3em 0.7em;
  margin: 0.2rem 0.2rem;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  transition: background 0.2s;
  display: inline-block;
  white-space: nowrap;

  &:hover {
    background: #d0d0d0;
  }
}

.dropped-word.selected {
  background: #007bff;
  color: #fff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.5);
}

.placeholder {
  color: #bbb;
}

.button-group {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.reset-btn {
  padding: 0.5em 1.5em;
  background: #dc3545;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: #c82333;
  }
}

.reset-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.submit-btn {
  padding: 0.5em 2em;
  background: #1f7069;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: #1a5f5a;
  }
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.drop-zone {
  width: 45px; /* Fixed width for consistent spacing */
  height: 30px;
  min-height: 30px;
  cursor: pointer;
  transition: background 0.2s;
  display: inline-block;
  vertical-align: middle;
  position: relative;
  margin: 0;
  padding: 0;
  
  /* Center the drop zone between words */
  margin-left: -10px; /* Half of drop-zone width to center it */
  margin-right: -25px;
}

.drop-zone:first-of-type {
  margin-left: -20px;
}

.drop-zone:hover {
  background: rgba(0, 123, 255, 0.1);
}

.drop-zone.active {
  background: rgba(0, 123, 255, 0.2);
  border: 2px dashed #007bff;
}

.drop-zone.active:hover {
  background: rgba(0, 123, 255, 0.3);
}
</style>
