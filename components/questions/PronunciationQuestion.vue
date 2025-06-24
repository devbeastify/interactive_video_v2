<template>
  <div class="pronunciation-question">
    <div class="question-prompt" v-html="question.prompt"></div>

    <div class="pronunciation-controls">
      <button @click="playAudio" class="play-btn">Play Audio</button>

      <button
        v-if="pronunciation - toggle && pronunciation - toggle.checked"
        @click="startRecording"
        class="record-btn"
        :class="{ recording: isRecording }"
      >
        {{ isRecording ? 'Stop Recording' : 'Start Recording' }}
      </button>
    </div>

    <div v-if="isRecording" class="recording-indicator">
      Recording... Speak now!
    </div>

    <button @click="handleComplete" class="complete-btn">Complete</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  question: {
    type: Object,
    required: true,
  },
  pronunciationToggle: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['pronunciation-complete']);

const isRecording = ref(false);

const playAudio = () => {
  console.log('Playing audio for pronunciation question');
};

const startRecording = () => {
  isRecording.value = !isRecording.value;

  if (isRecording.value) {
    console.log('Starting pronunciation recording');
  } else {
    console.log('Stopping pronunciation recording');
  }
};

const handleComplete = () => {
  emit('pronunciation-complete', {
    questionId: props.question.id,
    recorded: isRecording.value,
  });
};
</script>

<style lang="scss" scoped>
@use 'MusicV3/v3/styles/base' as base;
.pronunciation-question {
  margin: 1rem 0;
}

.question-prompt {
  margin-bottom: 1rem;
  font-weight: 600;
}

.pronunciation-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.play-btn,
.record-btn,
.complete-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: base.rpx(4);
  cursor: pointer;
  font-size: base.rpx(16);
  font-weight: 600;
}

.play-btn {
  background-color: #4caf50;
  color: white;
}

.record-btn {
  background-color: #f44336;
  color: white;

  &.recording {
    background-color: #ff9800;
  }
}

.complete-btn {
  background-color: var(--global-button-background-primary, #252525);
  color: var(--global-button-text-primary, #fff);
}

.recording-indicator {
  text-align: center;
  color: #f44336;
  font-weight: 600;
  margin: 1rem 0;
}
</style>
