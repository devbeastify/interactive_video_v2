<template>
  <div :class="$style['interstitial-layout']">
    <div :class="$style['dl-container']">
      <DirectionLine
        v-if="dlStore.hasDL"
        :dlText="dlStore.currentDLText"
        :isPlaying="dlStore.isPlaying" />
    </div>

    <div :class="$style['interstitial-layout__main']">
      <div :class="$style['l-stack']">
        <h1 :class="$style['page-topic']" v-html="topic" />
        <div :class="$style['page-title']">
          <h2 v-html="title" />
          <h3 v-if="subTopic" v-html="subTopic" />
        </div>
        <div :class="$style['interstitial-controls']">
          <BasicCheckbox
            v-if="!browserIsSafari()"
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
  import { onMounted, onUnmounted } from 'vue';
  import AnimatedLoadingIcon from '../components/AnimatedLoadingIcon.vue';
  import BeginAction from '../components/BeginAction.vue';
  import DirectionLine from '../components/DirectionLine.vue';
  import { useActivitySettingsStore } from '../stores/activity_settings_store';
  import { useActionStore } from '../stores/action_store';
  import { useDLStore } from '../stores/direction_line_store';
  import { mainStore } from '../stores/main_store';
  import { useMedia } from '../composables/use_media';
  import { browserIsSafari } from '../lib/safari_browser_check';
  // @ts-expect-error - Music doesn't have types, tsconfig needs new path aliases
  import BasicCheckbox from 'MusicV3/components/basic_checkbox/v2.0/BasicCheckbox.vue';

  /**
   * @typedef {Object} ActionData
   * @property {string} video_path - Path to the video file
   */

  /**
   * @typedef {Object} Action
   * @property {string} type - Type of action
   * @property {ActionData} data - Action data
   */

  /**
   * @typedef {Object} ReferenceItem
   * @property {string} audio_path - Path to the audio file
   * @property {string} video_path - Path to the video file
   */

  /**
   * @typedef {Object} ActivityInfo
   * @property {string} topic - Activity topic
   * @property {string} sub_topic - Activity sub-topic
   * @property {string} title - Activity title
   * @property {ReferenceItem[]} reference - Reference items
   */

  const emit = defineEmits(['start']);

  const store = mainStore();
  const actionStore = useActionStore();
  const activitySettingsStore = useActivitySettingsStore();
  const dlStore = useDLStore();

  const topic = store.activityInfo.topic;
  const subTopic = store.activityInfo.sub_topic;
  const title = store.activityInfo.title;

  /**
   * Checks if a file is a subtitle file based on its extension
   * @param {string} filePath - The file path to check
   * @return {boolean} Whether the file is a subtitle
   */
  function isSubtitleFile(filePath) {
    const extension = filePath.split('.').pop()?.toLowerCase() || '';
    return ['vtt', 'srt', 'ass', 'ssa'].includes(extension);
  }

  /**
   * Extracts video paths from action data
   * @param {ActionData} videoData - The video action data
   * @return {string[]} Array of valid video paths
   */
  function extractVideoPathsFromAction(videoData) {
    const sources = [];
    if (videoData.video_path && !isSubtitleFile(videoData.video_path)) {
      sources.push(videoData.video_path);
    }
    return sources;
  }

  /**
   * Extracts media paths from reference items
   * @param {ReferenceItem} reference - The reference item
   * @return {string[]} Array of valid media paths
   */
  function extractMediaPathsFromReference(reference) {
    const sources = [];
    if (reference.video_path && !isSubtitleFile(reference.video_path)) {
      sources.push(reference.video_path);
    }
    if (reference.audio_path && !isSubtitleFile(reference.audio_path)) {
      sources.push(reference.audio_path);
    }
    return sources;
  }

  /**
   * Gets all media sources from actions or fallback to references
   * @return {string[]} Array of all media sources
   */
  function getAllMediaSources() {
    const sources = [];

    if (actionStore.actions && actionStore.actions.length > 0) {
      actionStore.actions.forEach((action) => {
        if (action.type === 'video' && action.data) {
          const videoPaths = extractVideoPathsFromAction(action.data);
          sources.push(...videoPaths);
        }
      });
    } else {
      store.activityInfo.reference.forEach((reference) => {
        const mediaPaths = extractMediaPathsFromReference(reference);
        sources.push(...mediaPaths);
      });
    }

    return sources;
  }

  const allMediaSources = getAllMediaSources();

  const { mediaState, loadMedia, whitelistMedia } = useMedia(allMediaSources);

  /**
   * Updates the autoplay setting in the store
   * @param {Event} evt - The change event from the checkbox
   * @return {void}
   */
  function updateSettings(evt) {
    const target = evt.target;
    const useAutoPlay = target.checked;
    activitySettingsStore.updateAutoPlaySetting(useAutoPlay);
  }

  /**
   * Starts the activity by moving to the player screen
   * @param {Event} e - The event that triggered the start action
   * @return {Promise<void>}
   */
  async function startActivity(e) {
    try {
      await whitelistMedia(e);
      emit('start');
    } catch (error) {
      console.error('Failed to start activity:', error);
    }
  }

  /**
   * Initializes the component when mounted
   * @return {void}
   */
  function initializeComponent() {
    activitySettingsStore.resetAutoPlayToEnabled();
    loadMedia();
    dlStore.initializeDLForPhase('intro', store.activityInfo);
  }

  onMounted(initializeComponent);

  onUnmounted(() => {
    dlStore.cleanup();
  });
</script>

<style lang="scss" module>
@use 'MusicV3/v3/styles/base' as base;

:global(.ns-music-v1) .page-topic {
  font-size: base.rpx(32);
  font-weight: 600;
  margin: 0;
  padding: 0;
}

.dl-container {
  align-items: flex-start;
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  padding-top: base.rpx(16);
  width: 100%;
}

.interstitial-controls {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: base.rpx(16);
}

.interstitial-layout {
  display: flex;
  flex-direction: column;
  gap: base.rpx(16);
  margin: base.rpx(32);
  @include base.viewport-min(sm) {
    gap: base.rpx(16);
    margin: 0;
  }
  @include base.viewport-min(md) {
    gap: base.rpx(32);
  }
}

.interstitial-layout__main {
  align-items: center;
  display: flex;
  flex: 1;
  justify-content: center;
}

.l-stack {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: base.rpx(24);
}

.page-title {
  background-color: var(--global-color-background-primary, #1f7069);
  border-radius: base.rpx(42);
  padding: base.rpx(16) base.rpx(36);
  text-align: center;
}

.page-title h2 {
  color: var(--global-color-text-primary, #fff) !important;
  font-size: base.rpx(24);
  font-weight: 600;
  margin: 0;
  padding: 0;
}

.page-title h3 {
  color: var(--global-color-text-primary, #fff) !important;
  font-size: base.rpx(16);
  font-weight: 400;
  margin: 0;
  padding: 0;
}
</style>
