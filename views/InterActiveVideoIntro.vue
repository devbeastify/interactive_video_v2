<template>
  <div :class="$style['interstitial-layout']">
    <div :class="$style['interstitial-layout__main']">
      <div :class="$style['l-stack']">
        <h1 :class="$style['page-topic']" v-html="topic" />
        <div :class="$style['page-title']">
          <h2 v-html="title" />
          <h3 v-if="subTopic" v-html="subTopic" />
        </div>
        <div :class="$style['interstitial-controls']">
          <BasicCheckbox
            v-if="false"
            id="autoplay-media"
            :modelValue="activitySettingsStore.useAutoPlay"
            size="lg"
            @change="updateSettings">
            Auto Play Video
          </BasicCheckbox>
          <AnimatedLoadingIcon v-if="mediaState === 'loading'" />
          <BeginAction
            class="interactive-video-primary-button"
            :mediaState="mediaState"
            :startButtonClickHandler="startActivity" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// @ts-check

  import { onMounted } from 'vue';
  import { mainStore } from '../stores/main/main_store';
  import { useActivitySettingsStore } from '../stores/main/activity_settings_store';
  import { browserIsSafari } from '../lib/safari_browser_check';
  // @ts-expect-error - Music doesn't have types, tsconfig needs new path aliases
  import BasicCheckbox from 'MusicV3/components/basic_checkbox/v2.0/BasicCheckbox.vue';
  import BeginAction from '../components/BeginAction.vue';
  import { useMedia } from '../composables/use_media';
  import AnimatedLoadingIcon from '../components/AnimatedLoadingIcon.vue';

  /**
   * Emits the 'start' event when the activity should begin.
   * @type {(event: 'start') => void}
   */
  const emit = defineEmits(['start']);

  /**
   * The main Pinia store instance for activity and settings.
   * @type {ReturnType<typeof mainStore>}
   */
  const store = mainStore();

  /**
   * The activity settings store instance.
   * @type {ReturnType<typeof useActivitySettingsStore>}
   */
  const activitySettingsStore = useActivitySettingsStore();

  /**
   * The topic of the current activity.
   * @type {string}
   */
  const topic = store.activityInfo.topic;

  /**
   * The sub-topic of the current activity.
   * @type {string}
   */
  const subTopic = store.activityInfo.sub_topic;

  /**
   * The title of the current activity.
   * @type {string}
   */
  const title = store.activityInfo.title;

  /**
   * All media sources (video and audio) for the activity.
   * @type {string[]}
   */
  const allMediaSources = store.activityInfo.reference.flatMap(
    /**
     * @param {{ video_path?: string, audio_path?: string }} reference
     * @returns {string[]}
     */
    (reference) => {
      const sources = [];
      if (reference.video_path) sources.push(reference.video_path);
      if (reference.audio_path) sources.push(reference.audio_path);
      return sources;
    }
  );

  /**
   * Media composable state and actions for the intro screen.
   * @type {{
   *   mediaState: import('vue').Ref<string>,
   *   loadMedia: () => Promise<void>,
   *   whitelistMedia: (e: Event) => Promise<void>
   * }}
   */
  const { mediaState, loadMedia, whitelistMedia } = useMedia(allMediaSources);

  /**
   * Update the autoplay setting in the store when the checkbox changes.
   * @param {Event} evt - The change event from the checkbox
   * @return {void}
   */
  const updateSettings = function(evt) {
    const target = /** @type {HTMLInputElement} */ (evt.target);
    const useAutoPlay = target.checked;
    activitySettingsStore.updateAutoPlaySetting(useAutoPlay);
  };

  /**
   * Starts the activity by moving to the player screen.
   * @param {Event} e
   * @return {Promise<void>}
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
   * Lifecycle hook to load media when the component is mounted.
   * @returns {void}
   */
  onMounted(() => {
    activitySettingsStore.resetIndex();
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
