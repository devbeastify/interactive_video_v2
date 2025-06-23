<template>
  <div class="fill-in-blanks-question">
    <div class="question-prompt" v-html="question.prompt"></div>

    <div class="blanks-container">
      <input
        v-for="(blank, index) in question.blanks"
        :key="index"
        type="text"
        :placeholder="`Blank ${index + 1}`"
        v-model="answers[index]"
        class="blank-input"
      />
    </div>

    <button @click="handleSubmit" class="submit-btn">Submit Answers</button>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  question: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["answer-submitted"]);

const answers = ref([]);

const handleSubmit = () => {
  emit("answer-submitted", {
    questionId: props.question.id,
    answers: answers.value,
  });
};
</script>

<style lang="scss" scoped>
.fill-in-blanks-question {
  margin: 1rem 0;
}

.question-prompt {
  margin-bottom: 1rem;
  font-weight: 600;
}

.blanks-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.blank-input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.submit-btn {
  padding: 0.75rem 1.5rem;
  background-color: var(--global-button-background-primary, #252525);
  color: var(--global-button-text-primary, #fff);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
}
</style>
