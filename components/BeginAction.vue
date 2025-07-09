<template>
  <!-- @ts-ignore -->
  <button
    class="interactive-video-primary-button"
    :disabled="mediaState !== 'loaded'"
    @click="startButtonClickHandler">
    Start
  </button>
</template>

<script setup>
/**
 * Props for the BeginAction button.
 * @property {string} mediaState - The current state of the media
 *   ("loaded" enables the button).
 * @property {(event: MouseEvent) => void} startButtonClickHandler - The function
 *   to call when the button is clicked.
 */
  defineProps({
    mediaState: {
      type: String,
      required: true,
    },
    startButtonClickHandler: {
      type: Function,
      required: true,
    },
  });
</script>
