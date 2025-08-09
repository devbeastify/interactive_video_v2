<template>
  <div :class="$style['drag-and-drop-question']">
    <div :class="$style['prompt']" v-html="promptWithDropZone" />
    <div :class="$style['options']">
      <span
        v-for="(word, idx) in availableWords"
        :key="idx"
        :draggable="true"
        :class="[
          $style['word'],
          {
            [$style['dragged']]: draggedIndex === idx,
            [$style['selected']]: selectedIndex === idx
          }
        ]"
        @dragstart="onDragStart(idx)"
        @dragend="onDragEnd"
        @click="onWordClick(idx)">
        {{ word.content }}
      </span>
    </div>
    <div
      :class="[
        $style['drop-zone'],
        { [$style['drop-zone-focused']]: isDropZoneFocused }
      ]"
      @dragover.prevent
      @drop="onDrop"
      @click="onDropZoneClick">
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
  import { ref, computed, onMounted, onUnmounted } from 'vue';

  /**
   * @typedef {Object} Word
   * @property {string} content - The text content of the word
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

  const emit = defineEmits(['answer-submitted']);

  const availableWords = ref([]);
  const droppedWord = ref(null);
  const draggedIndex = ref(null);
  const selectedIndex = ref(null);
  const isDropZoneFocused = ref(false);

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

  /**
   * Handles global keyboard navigation and actions
   * @param {KeyboardEvent} event - The keyboard event
   */
  function handleGlobalKeydown(event) {
    if (availableWords.value.length === 0 ||
      event.target.tagName === 'INPUT' ||
      event.target.tagName === 'TEXTAREA') {
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
    if (selectedIndex.value === null || selectedIndex.value <= 0) {
      selectedIndex.value = availableWords.value.length - 1;
    } else {
      selectedIndex.value--;
    }
  }

  /**
   * Selects the next word in the list
   */
  function selectNextWord() {
    if (selectedIndex.value === null || selectedIndex.value >= availableWords.value.length - 1) {
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
      droppedWord.value = availableWords.value[selectedIndex.value];
      selectedIndex.value = null;
    }
  }

  /**
   * Handles clicking on a word to select it
   * @param {number} idx - The index of the clicked word
   */
  function onWordClick(idx) {
    selectedIndex.value = idx;
  }

  /**
   * Handles clicking on the drop zone to place selected word
   */
  function onDropZoneClick() {
    if (selectedIndex.value !== null) {
      placeSelectedWord();
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
  }

  /**
   * Handles drop event and updates dropped word
   */
  function onDrop() {
    if (draggedIndex.value !== null &&
      availableWords.value[draggedIndex.value]) {
      droppedWord.value = availableWords.value[draggedIndex.value];
      draggedIndex.value = null;
      selectedIndex.value = null;
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

  /**
   * Sets up global keyboard event listener
   */
  onMounted(() => {
    initializeAvailableWords();
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
  border: 2px solid transparent;

  &:hover {
    background: #e0e0e0;
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
  min-height: 2em;
  border: 2px dashed #aaa;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  background: #fafafa;
  padding: 0.5em;
  cursor: pointer;
  transition: border-color 0.2s;

  &:hover {
    border-color: #1f7069;
  }
}

.drop-zone-focused {
  border-color: #1f7069;
  background: #f0f8f7;
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