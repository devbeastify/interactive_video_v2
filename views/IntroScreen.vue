<template>
    <div :class="$style['interstitial-layout']">
      <!-- DL Component positioned at top -->
      <div :class="$style['dl-container']">
        <DirectionLine 
          v-if="dlStore.hasDL"
          :dl-text="dlStore.currentDLText"
          :is-playing="dlStore.isPlaying" />
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
  
  import { onMounted, onUnmounted } from 'vue';
  import { mainStore } from '../stores/main_store';
  import { useActionStore } from '../stores/action_store';
  import { useActivitySettingsStore } from '../stores/activity_settings_store';
  import { useDLStore } from '../stores/direction_line_store';
  // @ts-expect-error - Music doesn't have types, tsconfig needs new path aliases
  import BasicCheckbox from 'MusicV3/components/basic_checkbox/v2.0/BasicCheckbox.vue';
  import BeginAction from '../components/BeginAction.vue';
  import DirectionLine from '../components/DirectionLine.vue';
  import { useMedia } from '../composables/use_media';
  import AnimatedLoadingIcon from '../components/AnimatedLoadingIcon.vue';
  import { eventDispatcher, DL_EVENTS } from '../lib/event_dispatcher';
  
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
   * The action store instance.
   * @type {ReturnType<typeof useActionStore>}
   */
  const actionStore = useActionStore();
  
  /**
   * The activity settings store instance.
   * @type {ReturnType<typeof useActivitySettingsStore>}
   */
  const activitySettingsStore = useActivitySettingsStore();
  
  /**
   * The DL store instance.
   * @type {ReturnType<typeof useDLStore>}
   */
  const dlStore = useDLStore();
  
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
   * This includes all videos from the actions sequence.
   * Excludes subtitle files (.vtt, .srt) as they cannot be loaded as media elements.
   * @type {string[]}
   */
  const allMediaSources = (() => {
    /** @type {string[]} */
    const sources = [];
    
    // Helper function to check if a file is a subtitle
    const isSubtitleFile = (/** @type {string} */ filePath) => {
      const extension = filePath.split('.').pop()?.toLowerCase() || '';
      return ['vtt', 'srt', 'ass', 'ssa'].includes(extension);
    };
    
    // Get all video references from actions
    if (actionStore.actions && actionStore.actions.length > 0) {
      actionStore.actions.forEach((action) => {
        if (action.type === 'video' && action.data) {
          const videoData = /** @type {any} */ (action.data);
          if (videoData.video_path && !isSubtitleFile(videoData.video_path)) {
            sources.push(videoData.video_path);
          }
        }
      });
    } else {
      // Fallback to original logic if actions not available
      store.activityInfo.reference.forEach((reference) => {
        const refData = /** @type {any} */ (reference);
        if (refData.video_path && !isSubtitleFile(refData.video_path)) {
          sources.push(refData.video_path);
        }
        if (refData.audio_path && !isSubtitleFile(refData.audio_path)) {
          sources.push(refData.audio_path);
        }
      });
    }
    
    return sources;
  })();
  
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
   * @param {Event} e - The event that triggered the start action
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
   * Lifecycle hook to load media and initialize DL when the component is mounted.
   * @return {void}
   */
  onMounted(() => {
    activitySettingsStore.resetAutoPlayToEnabled();
    loadMedia();
    
    // Initialize DL for intro phase
    dlStore.initializeDLForPhase('intro', store.activityInfo);
  });
  
  /**
   * Lifecycle hook to cleanup when component is unmounted.
   * @return {void}
   */
  onUnmounted(() => {
    dlStore.cleanup();
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
  
  .dl-container {
    flex-shrink: 0;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding-top: base.rpx(16);
  }
  
  .interstitial-layout__main {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
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
  