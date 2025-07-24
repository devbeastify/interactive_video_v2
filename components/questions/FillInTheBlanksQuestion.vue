<template>
  <div :class="$style['fill-blanks']">
    <div :class="$style['prompt']" v-html="question.prompt" />
    <div :class="$style['inputs']">
      <input
        v-for="(blank, idx) in question.blanks"
        :key="idx"
        v-model="answers[idx]"
        :class="$style['blank-input']"
        :placeholder="blank.placeholder"
        @input="onInput(idx, $event)">
    </div>
    <button :class="$style['submit-btn']" @click="submit">
      Submit
    </button>
  </div>
</template>

<script setup>
// @ts-check

  import { ref, watch, onMounted } from 'vue';

  const props = defineProps({
    question: {
      type: Object,
      required: true,
    },
  });

  const emit = defineEmits(['answer-submitted']);

  /**
   * Holds the user's answers for each blank.
   * Initialized to empty strings for each blank.
   * @type {import('vue').Ref<string[]>}
   */
  const answers = ref([]);

  /**
   * Initialize answers array when component mounts.
   */
  onMounted(() => {
    answers.value = props.question.blanks.map(() => '');
  });

  /**
   * Watch for changes to the question prop and reset answers accordingly.
   */
  watch(
    () => props.question,
    (newQ) => {
      answers.value = newQ.blanks.map(() => '');
    }
  );

  /**
   * Updates the answer for a specific blank when the user types.
   * @param {number} idx - The index of the blank being edited.
   * @param {Event} event - The input event.
   */
  function onInput(idx, event) {
    const target = /** @type {HTMLInputElement} */ (event.target);
    answers.value[idx] = target.value;
  }

  /**
   * Emits the user's answers to the parent component.
   */
  function submit() {
    emit('answer-submitted', answers.value);
  }
</script>

<style lang="scss" module>
@use 'MusicV3/v3/styles/base' as base;

.fill-blanks {
  margin: base.rpx(16) 0;
}
.prompt {
  margin-bottom: base.rpx(16);
  font-weight: 600;
}
.inputs {
  display: flex;
  gap: base.rpx(8);
  margin-bottom: base.rpx(16);
}
.blank-input {
  padding: base.rpx(8);
  border: base.rpx(1) solid #ddd;
  border-radius: base.rpx(4);
  min-width: base.rpx(60);
}
.submit-btn {
  padding: base.rpx(8) base.rpx(24);
  background-color: var(--global-button-background-primary, #252525);
  color: var(--global-button-text-primary, #fff);
  border: none;
  border-radius: base.rpx(4);
  cursor: pointer;
  font-size: base.rpx(16);
  font-weight: 600;
  transition: background-color 0.3s ease;
}
.submit-btn:hover {
  background-color: var(--global-button-background-primary-hover, #1f7069);
}
</style>