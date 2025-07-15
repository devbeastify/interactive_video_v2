<template>
  <div :class="$style['direction-line']">
    <div
      v-if="showPlayButton()"
      :class="$style['direction-line__play-button-wrapper']">
      <PlayButton
        :audioBtnState="playButtonState"
        @click="play" />
    </div>
    <div :class="$style['direction-line__text']">
      <span v-html="directionLine.text" />
    </div>
  </div>
</template>

<script setup>
  import { defineExpose, ref, onMounted, watch } from 'vue';
  import PlayButton from './PlayButton.vue';
  import { useDirectionLineStore } from '../stores/main/direction_line_store';

  /**
   * @typedef {Object} DirectionLine
   * @property {string} text - The direction text content
   * @property {string} audioPath - Path to the audio file
   * @property {boolean} isNew - Whether this is a new direction line
   * @property {Function} generateAudioIfNeeded - Function to generate audio if needed
   */

  /**
   * @typedef {'playing' | 'paused'} PlayButtonState
   */

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
  const directionLineStore = useDirectionLineStore();

  /**
   * Checks if the direction line has audio content
   * @param {DirectionLine} directionLine - The direction line object
   * @return {boolean} True if audio is available, false otherwise
   */
  function hasAudioContent(directionLine) {
    return directionLine.audioPath && directionLine.audioPath.length > 0;
  }

  /**
   * Checks if the direction line has text content
   * @param {DirectionLine} directionLine - The direction line object
   * @return {boolean} True if text is available, false otherwise
   */
  function hasTextContent(directionLine) {
    return directionLine.text && directionLine.text.length > 0;
  }

  /**
   * Checks if text-to-speech is available in the browser
   * @return {boolean} True if TTS is available, false otherwise
   */
  function hasTextToSpeech() {
    return 'speechSynthesis' in window;
  }

  /**
   * Determines if the play button should be shown.
   * @return {boolean} True if the play button should be shown, false otherwise
   */
  function showPlayButton() {
    const hasAudio = hasAudioContent(props.directionLine);
    const hasText = hasTextContent(props.directionLine);
    const isNew = props.directionLine.isNew;
    const hasTTS = hasTextToSpeech();

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
   * Watch for direction line store playing state changes
   */
  watch(() => directionLineStore.isPlaying, (isPlaying) => {
    playButtonState.value = isPlaying ? 'playing' : 'paused';

    if (isPlaying) {
      emit('play');
    } else {
      emit('audioEnded');
    }
  });

  /**
   * Plays the audio using the store's logic.
   */
  async function play() {
    try {
      await directionLineStore.playAudioForDirectionLine(props.directionLine);
    } catch (error) {
      console.error('Error playing direction line audio:', error);
    }
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

<style lang="scss" module>
@use 'MusicV3/v3/styles/base' as base;

.direction-line {
  align-items: center;
  display: flex;
  justify-content: center;
  margin-bottom: base.rpx(16);

  &__play-button-wrapper {
    margin-right: base.rpx(16);
    transform: translateY(base.rpx(4));
  }

  &__text {
    flex-grow: 1;
    font-size: base.rpx(18);
    font-weight: 500;
    text-align: center;
  }
}
</style>
