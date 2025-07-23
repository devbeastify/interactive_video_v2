<template>
  <button
    class="interactive-video-primary-button"
    :disabled="mediaState !== 'loaded'"
    @click="startButtonClickHandler">
    Start
  </button>
</template>

<script>
// @ts-check

/**
 * BeginAction component for starting interactive video content.
 * 
 * @typedef {Object} BeginActionProps
 * @property {string} mediaState - The current state of the media ("loaded" enables the button)
 * @property {(event: MouseEvent) => void} startButtonClickHandler - Function to call when button is clicked
 */

export default {
  name: 'BeginAction',
  
  /**
   * Component props for BeginAction
   * @type {BeginActionProps}
   */
  props: {
    mediaState: {
      type: String,
      required: true,
    },
    startButtonClickHandler: {
      type: Function,
      required: true,
    },
  },
};
</script>
