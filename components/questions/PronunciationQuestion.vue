<template>
  <div :class="$style.pronunciationQuestion">
    <div :class="$style.questionPrompt" v-html="question.prompt"></div>

    <div :class="$style.pronunciationControls">
      <button @click="playAudio" :class="$style.playBtn">Play Audio</button>

      <button
        v-if="pronunciationToggle && pronunciationToggle.checked"
        @click="startRecording"
        :class="[$style.recordBtn, { [$style.recording]: isRecording }]"
      >
        {{ isRecording ? 'Stop Recording' : 'Start Recording' }}
      </button>
    </div>

    <div v-if="isRecording" :class="$style.recordingIndicator">
      Recording... Speak now!
    </div>

    <button @click="handleComplete" :class="$style.completeBtn">Complete</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

/**
 * Props for the pronunciation question.
 * @property {Object} question - The question object, must have `prompt`.
 * @property {Object|null} pronunciationToggle - Optional toggle object for enabling recording.
 */
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

/**
 * Emits the pronunciation completion event to the parent component.
 */
const emit = defineEmits(['pronunciation-complete']);

/**
 * Tracks whether the user is currently recording.
 */
const isRecording = ref(false);

/**
 * Handles playing the audio for the pronunciation question.
 */
const playAudio = () => {
  console.log('Playing audio for pronunciation question');
};

/**
 * Starts or stops the recording for the pronunciation question.
 */
const startRecording = () => {
  isRecording.value = !isRecording.value;

  if (isRecording.value) {
    console.log('Starting pronunciation recording');
  } else {
    console.log('Stopping pronunciation recording');
  }
};

/**
 * Emits the completion event with the recording state.
 */
const handleComplete = () => {
  emit('pronunciation-complete', {
    questionId: props.question.id,
    recorded: isRecording.value,
  });
};
</script>

<style lang="scss" module>
@use 'MusicV3/v3/styles/base' as base;

.pronunciation-question {
  margin: base.rpx(16) 0;
}

.question-prompt {
  margin-bottom: base.rpx(16);
  font-weight: 600;
}

.pronunciation-controls {
  display: flex;
  gap: base.rpx(16);
  margin-bottom: base.rpx(16);
}

.play-btn,
.record-btn,
.complete-btn {
  padding: base.rpx(8) base.rpx(24);
  border: none;
  border-radius: base.rpx(4);
  font-size: base.rpx(16);
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.play-btn {
  background-color: #0079c1;
  color: #fff;
}

.record-btn {
  background-color: #252525;
  color: #fff;
}

.record-btn.recording {
  background-color: #e74c3c;
}

.complete-btn {
  background-color: var(--global-button-background-primary, #252525);
  color: var(--global-button-text-primary, #fff);
  margin-top: base.rpx(16);
}

.complete-btn:hover {
  background-color: var(--global-button-background-primary-hover, #1f7069);
}

.recording-indicator {
  margin-bottom: base.rpx(16);
  color: #e74c3c;
  font-weight: 600;
}
</style>
