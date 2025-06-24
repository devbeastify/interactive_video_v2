<template>
  <button
    class="u-mar-top-32"
    :disabled="mediaState !== 'loaded'"
    @click="startButtonClickHandler">
    Start
  </button>
</template>

<script setup>
/**
 * Props for the BeginAction button.
 * @property {string} mediaState - The current state of the media ("loaded" enables the button).
 * @property {Function} startButtonClickHandler - The function to call when the button is clicked.
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
