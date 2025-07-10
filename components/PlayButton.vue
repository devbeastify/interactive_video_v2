<template>
    <button
      class="play-button c-no-button"
      :class="buttonStateClass"
      aria-label="Play audio"
      type="button">
      <svg
        v-if="audioBtnState === 'paused'"
        class="speaker-icon"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"
          fill="currentColor"/>
      </svg>
      <svg
        v-else
        class="pause-icon"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="4" width="4" height="16" fill="currentColor"/>
        <rect x="14" y="4" width="4" height="16" fill="currentColor"/>
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
  
  <style lang="scss" scoped>
    .play-button {
      width: 2rem;
      height: 2rem;
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
        outline: 2px solid #1f7069;
        outline-offset: 2px;
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
      width: 1.5rem;
      height: 1.5rem;
    }
  </style> 