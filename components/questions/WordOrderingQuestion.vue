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
      @drop="onDrop">
      <div v-if="droppedWords.length > 0" :class="$style['sentence']">
        <span 
          v-for="(word, idx) in droppedWords" 
          :key="idx" 
          :class="$style['dropped-word']"
          @click="removeWord(idx)"
          :title="`Click to remove '${word.content}'`">
          {{ word.content }}
        </span>
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
    
    // Try to get words from different possible locations
    let result = [];
    
    if (Array.isArray(items) && items.length > 0) {
      result = items;
    } else if (currentItem.value?.answers) {
      // Convert answers object to words array
      const answers = currentItem.value.answers;
      if (typeof answers === 'object' && answers !== null) {
        result = Object.entries(answers).map(([key, value]) => ({
          content: value,
          targetId: key
        }));
      }
    }
    
    // If still no words, use test data
    if (result.length === 0) {
      result = [
        { content: 'esperan', targetId: '1' },
        { content: 'el', targetId: '2' },
        { content: 'autobús', targetId: '3' },
        { content: 'los', targetId: '4' },
        { content: 'estudiantes', targetId: '5' }
      ];
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
    
    // Fallback: create a prompt from the final sentence
    if (finalSentence.value) {
      return `Arrange the words to form: ${finalSentence.value}`;
    }
    
    // Test prompt if no data available
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

  onMounted(initializeAvailableWords);

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
  }

  /**
   * Handles drop event and updates dropped word
   */
  function onDrop() {
    if (draggedIndex.value !== null &&
      availableWords.value[draggedIndex.value]) {
      const wordToAdd = availableWords.value[draggedIndex.value];
      // Check if word is already in droppedWords
      if (!droppedWords.value.some(word => word.targetId === wordToAdd.targetId)) {
        droppedWords.value.push(wordToAdd);
      }
      draggedIndex.value = null;
    }
  }

  /**
   * Removes a word from the droppedWords array
   * @param {number} index - The index of the word to remove
   */
  function removeWord(index) {
    droppedWords.value.splice(index, 1);
  }

  /**
   * Resets the answer box to its initial state (empty)
   */
  function resetAnswer() {
    droppedWords.value = [];
  }

  /**
   * Submits the selected answer
   */
  function submit() {
    if (droppedWords.value.length > 0) {
      emit('answer-submitted', droppedWords.value.map(word => word.content));
    }
  }
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
  background: #e0f0e0; /* Light green for used words */
  border: 1px solid #a5d6a7;
  opacity: 0.7;
}

.answer-box {
  min-width: 300px;
  min-height: 3em;
  border: 2px dashed #007bff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
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
  gap: 0.5em;
  flex-wrap: wrap;
  justify-content: left;
}

.dropped-word {
  background: #e0e0e0;
  border-radius: 4px;
  padding: 0.3em 0.7em;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #d0d0d0;
  }
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
</style>
