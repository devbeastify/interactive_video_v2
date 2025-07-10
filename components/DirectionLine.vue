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
    import { defineExpose, ref } from 'vue';
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
     * Plays the audio.
     */
    function play() {
      const audio = new Audio(props.directionLine.audioPath);
  
      audio.addEventListener('ended', () => {
        playButtonState.value = 'paused';
        emit('audioEnded');
      }, { once: true });
  
      if (audio.readyState >= 4) {
        audio.play()
          .then(() => {
            playButtonState.value = 'playing';
            emit('play');
          })
          .catch(handleAudioPlayError);
      } else {
        audio.addEventListener('canplaythrough', play, { once: true });
      }
    }
  
    /**
     * Handles errors that may occur when attempting to play audio.
     * @param {Error} error - The error that occurred.
     */
    function handleAudioPlayError(error) {
      console.error('Error playing direction line audio:', error);
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