<template>
  <div :class="$style['multiple-choice-question']">
    <div :class="$style['question-prompt']" v-html="question.prompt" />

    <div :class="$style['answer-choices']">
      <label
        v-for="(choice, index) in question.choices"
        :key="index"
        :class="$style['answer-choice']">
        <input
          type="radio"
          :name="`question-${question.id}`"
          :value="index + 1"
          @change="handleChoiceSelected(index + 1)">
        <span :class="$style['choice-text']" v-html="choice.text" />
      </label>
    </div>
  </div>
</template>

<script setup>
/**
 * Props for the multiple choice question.
 * @property {Object} question - The question object, must have `prompt` and `choices`.
 */
  const props = defineProps({
    question: {
      type: Object,
      required: true,
    },
  });

  /**
   * Emits the selected answer to the parent component.
   */
  const emit = defineEmits(['answer-selected']);

  /**
   * Handles when a user selects a choice.
   * @param {number} choiceIndex - The index of the selected choice (1-based).
   */
  const handleChoiceSelected = (choiceIndex) => {
    emit('answer-selected', {
      questionId: props.question.id,
      choiceIndex: choiceIndex,
    });
  };
</script>

<style lang="scss" module>
@use 'MusicV3/v3/styles/base' as base;

.multiple-choice-question {
  margin: base.rpx(16) 0;
}

.question-prompt {
  margin-bottom: base.rpx(16);
  font-weight: 600;
}

.answer-choices {
  display: flex;
  flex-direction: column;
  gap: base.rpx(8);
}

.answer-choice {
  display: flex;
  align-items: center;
  gap: base.rpx(8);
  padding: base.rpx(8);
  border: base.rpx(1) solid #ddd;
  border-radius: base.rpx(4);
  cursor: pointer;

  &:hover {
    background-color: #f5f5f5;
  }
}

.choice-text {
  flex: 1;
}
</style>
