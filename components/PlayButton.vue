<template>
  <button
    :class="[$style['play-button'], $style['c-no-button'], $style[buttonStateClass]]"
    aria-label="Play audio"
    type="button">
    <svg
      v-if="audioBtnState === 'paused'"
      :class="$style['speaker-icon']"
      height="24"
      viewBox="0 0 24 24"
      width="24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"
        fill="currentColor" />
    </svg>
    <svg
      v-else
      :class="$style['pause-icon']"
      height="24"
      viewBox="0 0 24 24"
      width="24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <rect
        height="16"
        width="4"
        x="6"
        y="4"
        fill="currentColor" />
      <rect
        height="16"
        width="4"
        x="14"
        y="4"
        fill="currentColor" />
    </svg>
  </button>
</template>

<script setup>
// @ts-check

  import { computed } from 'vue';

  /**
   * @typedef {'playing' | 'paused'} AudioButtonState
   */

  /**
   * Props for the PlayButton component
   * @typedef {Object} PlayButtonProps
   * @property {AudioButtonState} audioBtnState - The current state of the audio button
   */

  const props = defineProps({
    audioBtnState: {
      default: 'paused',
      type: String,
      validator(val) {
        return ['', 'playing', 'paused'].includes(val.toLowerCase());
      },
    },
  });

  /**
   * Computed class name based on the current audio button state
   * @return {string} The CSS class name for the current state
   */
  const buttonStateClass = computed(() => {
    return `is-${props.audioBtnState}`;
  });
</script>

<style lang="scss" module>
@use 'MusicV3/v3/styles/base' as base;

.c-no-button {
  background: transparent;
  border: none;
  cursor: pointer;
}

.is-paused {
  color: #3498db;
}

.is-playing {
  color: #e74c3c;
}

.pause-icon,
.speaker-icon {
  height: base.rpx(24);
  width: base.rpx(24);
}

.play-button {
  align-items: center;
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  height: base.rpx(32);
  justify-content: center;
  transition: all 0.3s ease;
  width: base.rpx(32);

  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }

  &:focus {
    outline: base.rpx(2) solid #1f7069;
    outline-offset: base.rpx(2);
  }
}
</style>