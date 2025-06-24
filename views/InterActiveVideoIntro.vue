<template>
  <div aria-automic="true" class="interstitial-layout">
    <div class="interstitial-layout__main">
      <div class="l-stack">
        <h1 class="page-topic" v-html="topic"></h1>
        <div class="page-title">
          <h2 v-html="title"></h2>
          <h3 v-if="subTopic" v-html="subTopic"></h3>
        </div>
        <div class="interstitial-controls">
          <BasicCheckbox
            v-if="!browserIsSafari()"
            id="autoplay-media"
            :modelValue="store.actionSettings.useAutoPlay"
            size="lg"
            @change="updateSettings"
          >
            Auto Play Video
          </BasicCheckbox>
          <AnimatedLoadingIcon v-if="mediaState === 'loading'" />
          <BeginAction
            class="begin-action"
            :mediaState="mediaState"
            :startButtonClickHandler="startActivity"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { mainStore } from '../stores/main/main_store';
import { browserIsSafari } from '../lib/safari_browser_check';
// @ts-expect-error - Music doesn't have types, tsconfig needs new path aliases
import BasicCheckbox from 'MusicV3/components/basic_checkbox/v2.0/BasicCheckbox.vue';
import BeginAction from '../components/BeginAction.vue';
import { useMedia } from '../composables/use_media';
import AnimatedLoadingIcon from '../components/AnimatedLoadingIcon.vue';

const emit = defineEmits(['start']);

const store = mainStore();
const topic = store.activityInfo.topic;
const subTopic = store.activityInfo.sub_topic;
const title = store.activityInfo.title;

const videoSources = store.activityInfo.reference.map(
  (reference) => reference.video_path
);

const { mediaState, loadMedia, whitelistMedia } = useMedia(videoSources);

const updateSettings = function (evt) {
  const useAutoPlay = evt.target.checked;
  store.updateAutoPlaySetting(useAutoPlay);
};

/**
 * Starts the activity by moving to the player screen.
 * @param {Event} e
 */
const startActivity = async (e) => {
  try {
    await whitelistMedia(e);
    emit('start');
  } catch (error) {
    console.error('Failed to start activity:', error);
  }
};

onMounted(() => {
  loadMedia();
  // emit('resetindex'); // Only needed if you have a reset logic
});
</script>

<style lang="scss" scoped>
@use 'MusicV3/v3/styles/base' as base;

.page-topic {
  font-size: base.rpx(30);
  font-weight: 600;
  padding: 0;
  margin: 0;
}

.interstitial-layout {
  display: grid;
  grid-template-areas: 'main';
  grid-template-columns: 1fr;
  place-items: center;
  gap: 1rem;
  margin: 2rem;
  @include base.viewport-min(sm) {
    gap: 1rem;
    grid-template-areas: 'main';
    grid-template-columns: 1fr;
    margin: 0;
  }
  @include base.viewport-min(md) {
    gap: 2rem;
    grid-template-columns: 1fr;
  }
}

.interstitial-layout__main {
  grid-area: main;
}

.l-stack {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.page-title {
  text-align: center;
  background-color: var(--global-color-background-primary, #1f7069);
  padding: base.rpx(16) base.rpx(36);
  border-radius: base.rpx(42);
}

.page-title h2 {
  font-size: base.rpx(24);
  font-weight: 600;
  padding: 0;
  margin: 0;
  color: var(--global-color-text-primary, #fff) !important;
}

.page-title h3 {
  font-size: base.rpx(16);
  font-weight: 400;
  padding: 0;
  margin: 0;
  color: var(--global-color-text-primary, #fff) !important;
}

:deep(.u-mar-top-32) {
  min-width: base.rpx(200);
  background-color: var(--global-button-background-primary, #252525);
  color: var(--global-button-text-primary, #fff);
  border: none;
  border-radius: base.rpx(24);
  padding: base.rpx(16) base.rpx(24);
  font-size: base.rpx(16);
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

:deep(.u-mar-top-32:hover:not(:disabled)) {
  background-color: var(--global-button-background-primary-hover, #1f7069);
}

:deep(.u-mar-top-32:disabled) {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
