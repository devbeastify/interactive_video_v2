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
      console.warn('TTS not available or no text to speak');
      emit('audioEnded');
      return;
    }

    return new Promise((resolve) => {
      // Extract text content from HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = props.directionLine.text;
      const textContent = tempDiv.textContent || tempDiv.innerText || '';

      if (!textContent.trim()) {
        console.warn('No text content to speak');
        emit('audioEnded');
        resolve();
        return;
      }

      console.log('Using TTS to speak:', textContent);

      const utterance = new SpeechSynthesisUtterance(textContent);
      utterance.lang = props.directionLine.languageCode || 'en';
      utterance.rate = 0.9;
      utterance.pitch = 1;

      utterance.onstart = () => {
        console.log('TTS started');
        playButtonState.value = 'playing';
        emit('play');
      };

      utterance.onend = () => {
        console.log('TTS ended');
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

      // Cancel any existing speech before starting new one
      speechSynthesis.cancel();
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