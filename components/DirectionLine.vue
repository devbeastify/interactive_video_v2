<template>
  <div class="direction-line">
    <div v-if="showPlayButton()" class="direction-line__play-button-wrapper">
      <PlayButton
        :audioBtnState="playButtonState"
        @click="play" />
    </div>
    <div class="direction-line__text">
      <span v-html="directionLine.text"></span>
    </div>
  </div>
</template>

<script setup>
  import { defineExpose, ref, onMounted } from 'vue';
  import PlayButton from './PlayButton.vue';
  import { AudioService } from '../lib/audio_service';

  const props = defineProps({
    directionLine: {
      type: Object,
      required: true,
    },
    stepIndex: {
      type: Number,
      required: true,
    },
  });

  const emit = defineEmits(['play', 'pause', 'audioEnded']);
  const playButtonState = ref('paused');

  /**
   * Determines if the play button should be shown.
   * @return {boolean} True if the play button should be shown, false otherwise.
   */
  function showPlayButton() {
    const hasAudio = props.directionLine.audioPath && props.directionLine.audioPath.length > 0;
    const hasText = props.directionLine.text && props.directionLine.text.length > 0;
    const isNew = props.directionLine.isNew;
    const hasTTS = 'speechSynthesis' in window;
    
    // Show button if we have audio file OR if we have text and TTS is available
    return isNew && (hasAudio || (hasText && hasTTS));
  }

  /**
   * Initialize audio when component mounts
   */
  onMounted(async () => {
    if (props.directionLine && props.directionLine.generateAudioIfNeeded) {
      try {
        await props.directionLine.generateAudioIfNeeded();
      } catch (error) {
        console.warn('Failed to generate audio for direction line:', error);
      }
    }
  });

  /**
   * Plays the audio with dynamic generation support.
   */
  async function play() {
    try {
      // Try to generate audio if needed
      if (props.directionLine.generateAudioIfNeeded) {
        const audioAvailable = await props.directionLine.generateAudioIfNeeded();
        if (!audioAvailable) {
          // Fallback to TTS
          await playTTS();
          return;
        }
      }

      // Play audio file
      if (props.directionLine.audioPath) {
        await playAudioFile();
      } else {
        // Fallback to TTS
        await playTTS();
      }
    } catch (error) {
      console.error('Error playing direction line audio:', error);
      // Fallback to TTS
      await playTTS();
    }
  }

  /**
   * Play audio file from URL
   * @private
   */
  async function playAudioFile() {
    await AudioService.playAudioFile(props.directionLine.audioPath, {
      onStart: () => {
        playButtonState.value = 'playing';
        emit('play');
      },
      onEnd: () => {
        playButtonState.value = 'paused';
        emit('audioEnded');
      },
      onError: () => {
        playButtonState.value = 'paused';
        emit('audioEnded');
      },
    });
  }

  /**
   * Play audio using TTS
   * @private
   */
  async function playTTS() {
    await AudioService.playTTS(
      props.directionLine.text,
      props.directionLine.languageCode || 'en',
      {
        onStart: () => {
          playButtonState.value = 'playing';
          emit('play');
        },
        onEnd: () => {
          playButtonState.value = 'paused';
          emit('audioEnded');
        },
        onError: () => {
          playButtonState.value = 'paused';
          emit('audioEnded');
        },
      }
    );
  }

  /**
   * Plays the audio automatically after a short delay.
   */
  function autoPlayAudio() {
    console.log('Auto-playing direction line audio');
    const halfSecond = 500;
    setTimeout(() => {
      if (props.directionLine && props.directionLine.text) {
        play();
      } else {
        console.warn('No direction line text available for auto-play');
      }
    }, halfSecond);
  }

  defineExpose({
    autoPlayAudio,
  });
</script>

<style lang="scss" scoped>
.direction-line {
  align-items: center;
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;

  &__play-button-wrapper {
    margin-right: 1rem;
    // Visually centers the button graphic with the text.
    transform: translateY(0.25rem);
  }

  &__text {
    flex-grow: 1;
    font-size: 1.1rem;
    font-weight: 500;
    text-align: center;
  }
}
</style> 