<template>
  <div :class="$style['drag-and-drop-question']">
    <div :class="$style['prompt']" v-html="promptWithDropZone" />
    <div :class="$style['options']">
      <span
        v-for="(word, idx) in availableWords"
        :key="idx"
        :draggable="true"
        :class="[$style['word'], { [$style['dragged']]: draggedIndex === idx }]"
        @dragstart="onDragStart(idx)"
        @dragend="onDragEnd">
        {{ word.content }}
      </span>
    </div>
    <div
      :class="$style['drop-zone']"
      @dragover.prevent
      @drop="onDrop">
      <span v-if="droppedWord">{{ droppedWord.content }}</span>
      <span v-else class="placeholder">Drop here</span>
    </div>
    <button
      :class="$style['submit-btn']"
      :disabled="!droppedWord"
      @click="submit">
      Submit
    </button>
  </div>
</template>

<script setup>
// @ts-check
  import { ref, computed, onMounted } from 'vue';

  /**
   * @typedef {Object} Word
   * @property {string} content - The text content of the word
   */

  /**
   * @typedef {Object} QuickCheckItem
   * @property {Word[]} words - Array of available words
   * @property {string} prompt - The question prompt text
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

  const availableWords = ref([]);
  const droppedWord = ref(null);
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
    return currentItem.value?.words || [];
  });

  /**
   * Gets prompt from the current item
   * @return {string} The question prompt
   */
  const prompt = computed(() => {
    return currentItem.value?.prompt || '';
  });

  /**
   * Initializes available words when component mounts
   */
  function initializeAvailableWords() {
    if (words.value && Array.isArray(words.value)) {
      availableWords.value = [...words.value];
    } else {
      console.warn('No words found in drag and drop question');
      availableWords.value = [];
    }
  }

  onMounted(initializeAvailableWords);

  /**
   * Replaces %1% in prompt with a drop zone placeholder
   * @return {string} The prompt with drop zone placeholder
   */
  const promptWithDropZone = computed(() => {
    if (!prompt.value) return '';

    const placeholder = droppedWord.value ?
      droppedWord.value.content :
      '_____';

    return prompt.value.replace(
      '%1%',
      `<span class="drop-placeholder">${placeholder}</span>`
    );
  });

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
      droppedWord.value = availableWords.value[draggedIndex.value];
      draggedIndex.value = null;
    }
  }

  /**
   * Submits the selected answer
   */
  function submit() {
    if (droppedWord.value) {
      emit('answer-submitted', [droppedWord.value.content]);
    }
  }
</script>

<style lang="scss" module>
.drag-and-drop-question {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.prompt {
  font-size: 1.1rem;
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
  transition: background 0.2s;

  &:hover {
    background: #e0e0e0;
  }
}

.word.dragged {
  opacity: 0.5;
}

.drop-zone {
  min-width: 100px;
  min-height: 2em;
  border: 2px dashed #aaa;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  background: #fafafa;
  padding: 0.5em;
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
