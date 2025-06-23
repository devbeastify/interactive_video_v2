<template>
  <div class="multiple-choice-question">
    <div class="question-prompt" v-html="question.prompt"></div>

    <div class="answer-choices">
      <label
        v-for="(choice, index) in question.choices"
        :key="index"
        class="answer-choice"
      >
        <input
          type="radio"
          :name="`question-${question.id}`"
          :value="index + 1"
          @change="handleChoiceSelected(index + 1)"
        />
        <span class="choice-text" v-html="choice.text"></span>
      </label>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  question: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["answer-selected"]);

const handleChoiceSelected = (choiceIndex) => {
  emit("answer-selected", {
    questionId: props.question.id,
    choiceIndex: choiceIndex,
  });
};
</script>

<style lang="scss" scoped>
.multiple-choice-question {
  margin: 1rem 0;
}

.question-prompt {
  margin-bottom: 1rem;
  font-weight: 600;
}

.answer-choices {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.answer-choice {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #f5f5f5;
  }
}

.choice-text {
  flex: 1;
}
</style>
