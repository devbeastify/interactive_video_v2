<template>
  <div :class="$style['interstitial-layout']">
    <div :class="$style['interstitial-layout__main']">
      <div :class="$style['l-stack']">
        <h1 :class="$style['page-topic']" v-html="topic"></h1>
        <div :class="$style['page-title']">
          <h2 v-html="title"></h2>
          <h3 v-if="subTopic" v-html="subTopic"></h3>
        </div>
        <div :class="$style['interstitial-controls']">
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
            class="u-mar-top-32"
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

/**
 * Update the autoplay setting in the store when the checkbox changes
 */
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

/**
 * Lifecycle hook to load media when the component is mounted
 */
onMounted(() => {
  loadMedia();
});
</script>

<style lang="scss" module>
@use 'MusicV3/v3/styles/base' as base;

:global(.ns-music-v1) .page-topic {
  font-size: base.rpx(32);
  font-weight: 600;
  padding: 0;
  margin: 0;
}

.interstitial-layout {
  display: grid;
  grid-template-areas: 'main';
  grid-template-columns: 1fr;
  place-items: center;
  gap: base.rpx(16);
  margin: base.rpx(32);
  @include base.viewport-min(sm) {
    gap: base.rpx(16);
    grid-template-areas: 'main';
    grid-template-columns: 1fr;
    margin: 0;
  }
  @include base.viewport-min(md) {
    gap: base.rpx(32);
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
  gap: base.rpx(24);
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

.interstitial-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: base.rpx(16);
}
</style>
