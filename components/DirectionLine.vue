<template>
  <div class="direction-line">
    <div v-if="showPlayButton()" class="direction-line__play-button-wrapper">
      <PlayButton
        :audioBtnState="playButtonState"
        @click="play" />
    </div>
    <div class="direction-line__text">
      {{ directionLine.text }}
    </div>
  </div>
</template>

<script setup>
  import { defineExpose, ref, onMounted } from 'vue';
  import PlayButton from './PlayButton.vue';
  import { mainStore } from '../stores/main/main_store';

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
  const store = mainStore();
  const playButtonState = ref('paused');
  const audioElement = ref(null);

  /**
   * Determines if the play button should be shown.
   * @return {boolean} True if the play button should be shown, false otherwise.
   */
  function showPlayButton() {
    const hasAudio = props.directionLine.audioPath && props.directionLine.audioPath.length > 0;
    const isNew = props.directionLine.isNew;
    return hasAudio && isNew;
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
    return new Promise((resolve, reject) => {
      const audio = new Audio(props.directionLine.audioPath);

      audio.addEventListener('ended', () => {
        playButtonState.value = 'paused';
        emit('audioEnded');
        resolve();
      }, { once: true });

      audio.addEventListener('error', (error) => {
        console.error('Audio file error:', error);
        reject(error);
      }, { once: true });

      if (audio.readyState >= 4) {
        audio.play()
          .then(() => {
            playButtonState.value = 'playing';
            emit('play');
          })
          .catch(reject);
      } else {
        audio.addEventListener('canplaythrough', () => {
          audio.play()
            .then(() => {
              playButtonState.value = 'playing';
              emit('play');
            })
            .catch(reject);
        }, { once: true });
      }
    });
  }

  /**
   * Play audio using TTS
   * @private
   */
  async function playTTS() {
    if (!props.directionLine.text || !('speechSynthesis' in window)) {
      emit('audioEnded');
      return;
    }

    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(props.directionLine.text);
      utterance.lang = props.directionLine.languageCode || 'en';
      utterance.rate = 0.9;
      utterance.pitch = 1;

      utterance.onstart = () => {
        playButtonState.value = 'playing';
        emit('play');
      };

      utterance.onend = () => {
        playButtonState.value = 'paused';
        emit('audioEnded');
        resolve();
      };

      utterance.onerror = (event) => {
        console.error('TTS error:', event.error);
        playButtonState.value = 'paused';
        emit('audioEnded');
        resolve();
      };

      speechSynthesis.speak(utterance);
    });
  }

  /**
   * Plays the audio automatically after a short delay.
   */
  function autoPlayAudio() {
    const halfSecond = 500;
    setTimeout(() => play(), halfSecond);
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