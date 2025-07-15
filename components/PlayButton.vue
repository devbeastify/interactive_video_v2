<template>
  <button
    :class="[$style['play-button'], $style['c-no-button'], $style[buttonStateClass]]"
    aria-label="Play audio"
    type="button">
    <svg
      v-if="audioBtnState === 'paused'"
      :class="$style['speaker-icon']"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"
        fill="currentColor" />
    </svg>
    <svg
      v-else
      :class="$style['pause-icon']"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <rect
        x="6"
        y="4"
        width="4"
        height="16"
        fill="currentColor" />
      <rect
        x="14"
        y="4"
        width="4"
        height="16"
        fill="currentColor" />
    </svg>
  </button>
</template>

<script setup>
  import { computed } from 'vue';

  const props = defineProps({
    audioBtnState: {
      type: String,
      default: 'paused',
      validator(val) {
        return ['', 'playing', 'paused'].includes(val.toLowerCase());
      },
    },
  });

  const buttonStateClass = computed(() => {
    return `is-${props.audioBtnState}`;
  });
</script>

<style lang="scss" module>
  @use 'MusicV3/v3/styles/base' as base;

  .play-button {
    width: base.rpx(32);
    height: base.rpx(32);
    border: none;
    border-radius: 50%;
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;

    &:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }

    &:focus {
      outline: base.rpx(2) solid #1f7069;
      outline-offset: base.rpx(2);
    }
  }

  .is-playing {
    color: #e74c3c;
  }

  .is-paused {
    color: #3498db;
  }

  .speaker-icon,
  .pause-icon {
    width: base.rpx(24);
    height: base.rpx(24);
  }
</style>
