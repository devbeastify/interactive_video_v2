<template>
  <button
    class="u-mar-top-32"
    :disabled="mediaState !== 'loaded'"
    @click="startButtonClickHandler"
  >
    Start
  </button>
</template>

<script setup>
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
