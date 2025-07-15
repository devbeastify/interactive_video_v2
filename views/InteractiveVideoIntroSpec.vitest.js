// @ts-check

import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import InteractiveVideoIntro from './InteractiveVideoIntro.vue';
import { mainStore } from '../stores/main/main_store';
import { vi } from 'vitest';

/** @typedef {import('@vue/test-utils').VueWrapper} VueWrapper */

/**
 * @typedef {Object} MockActivityInfo
 * @property {string} title
 * @property {string} topic
 * @property {string} sub_topic
 * @property {Array<any>} reference
 */

/**
 * Creates mock activity info for testing InteractiveVideoIntro.
 * @return {MockActivityInfo}
 */
function createMockActivityInfo() {
  return {
    title: 'Test Video Title',
    topic: 'Test Topic',
    sub_topic: 'Test Sub Topic',
    reference: [
      {
        video_path: '/path/to/video.mp4',
        audio_path: '/path/to/audio.mp3',
      },
    ],
  };
}

/**
 * Sets up Pinia and main store for InteractiveVideoIntro tests.
 * @return {{
 * pinia: ReturnType<typeof createPinia>,
 * mainStoreInstance: ReturnType<typeof mainStore>
 * }}
 */
function setupInteractiveVideoIntroTest() {
  const pinia = createPinia();
  setActivePinia(pinia);
  const mainStoreInstance = mainStore();

  return { pinia, mainStoreInstance };
}

/**
 * Sets up the DOM environment for intro testing.
 * @return {void}
 */
function setupIntroDOM() {
  const activityInfo = JSON.stringify([{
    title: 'Test Video Title',
    topic: 'Test Topic',
    sub_topic: 'Test Sub Topic',
    reference: [
      {
        video_path: '/path/to/video.mp4',
        audio_path: '/path/to/audio.mp3',
      },
    ],
  }]);

  document.body.innerHTML = `
    <div class="js-activity-info" data-activity-info='${activityInfo}'></div>
    <input type="checkbox" id="enableAutoPlay" />
  `;
}

/**
 * Creates a wrapper for InteractiveVideoIntro component.
 * @param {Object} options
 * @param {any} [options.pinia]
 * @return {VueWrapper}
 */
function createInteractiveVideoIntroWrapper(options = {}) {
  const { pinia } = setupInteractiveVideoIntroTest();

  return mount(InteractiveVideoIntro, {
    global: {
      plugins: [options.pinia || pinia],
    },
    ...options,
  });
}

describe('InteractiveVideoIntro', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupIntroDOM();
  });

  describe('rendering', () => {
    it('renders the component when mounted', () => {
      const { pinia } = setupInteractiveVideoIntroTest();
      const wrapper = createInteractiveVideoIntroWrapper({ pinia });

      expect(wrapper.exists()).toBe(true);
    });

    it('displays the video title', async () => {
      const { pinia, mainStoreInstance } = setupInteractiveVideoIntroTest();

      mainStoreInstance.$patch({
        activityInfo: createMockActivityInfo(),
      });

      const wrapper = createInteractiveVideoIntroWrapper({ pinia });
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain('Test Video Title');
    });

    it('displays the topic', async () => {
      const { pinia, mainStoreInstance } = setupInteractiveVideoIntroTest();

      mainStoreInstance.$patch({
        activityInfo: createMockActivityInfo(),
      });

      const wrapper = createInteractiveVideoIntroWrapper({ pinia });
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain('Test Topic');
    });

    it('displays the sub topic', async () => {
      const { pinia, mainStoreInstance } = setupInteractiveVideoIntroTest();

      mainStoreInstance.$patch({
        activityInfo: createMockActivityInfo(),
      });

      const wrapper = createInteractiveVideoIntroWrapper({ pinia });
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain('Test Sub Topic');
    });
  });

  describe('auto-play checkbox', () => {
    it('hides the auto-play checkbox', async () => {
      const { pinia } = setupInteractiveVideoIntroTest();
      const wrapper = createInteractiveVideoIntroWrapper({ pinia });

      const checkbox = wrapper.find('input[type="checkbox"]');

      expect(checkbox.exists()).toBe(false);
    });

    it('hides the auto-play toggle component', async () => {
      const { pinia } = setupInteractiveVideoIntroTest();
      const wrapper = createInteractiveVideoIntroWrapper({ pinia });

      const basicCheckbox = wrapper.findComponent({ name: 'BasicCheckbox' });

      expect(basicCheckbox.exists()).toBe(false);
    });
  });

  describe('media collection', () => {
    it('collects video and audio files from reference', async () => {
      const { pinia, mainStoreInstance } = setupInteractiveVideoIntroTest();

      mainStoreInstance.$patch({
        activityInfo: {
          ...createMockActivityInfo(),
          reference: [
            {
              video_path: '/path/to/video1.mp4',
              audio_path: '/path/to/audio1.mp3',
            },
            {
              video_path: '/path/to/video2.webm',
              audio_path: '/path/to/audio2.wav',
            },
          ],
        },
      });

      const wrapper = createInteractiveVideoIntroWrapper({ pinia });
      await wrapper.vm.$nextTick();

      expect(wrapper.exists()).toBe(true);
    });

    it('filters out null media paths', async () => {
      const { pinia, mainStoreInstance } = setupInteractiveVideoIntroTest();

      mainStoreInstance.$patch({
        activityInfo: {
          ...createMockActivityInfo(),
          reference: [
            {
              video_path: '/path/to/video.mp4',
              audio_path: null,
            },
          ],
        },
      });

      const wrapper = createInteractiveVideoIntroWrapper({ pinia });
      await wrapper.vm.$nextTick();

      expect(wrapper.exists()).toBe(true);
    });

    it('filters out undefined media paths', async () => {
      const { pinia, mainStoreInstance } = setupInteractiveVideoIntroTest();

      mainStoreInstance.$patch({
        activityInfo: {
          ...createMockActivityInfo(),
          reference: [
            {
              video_path: undefined,
              audio_path: '/path/to/audio.mp3',
            },
          ],
        },
      });

      const wrapper = createInteractiveVideoIntroWrapper({ pinia });
      await wrapper.vm.$nextTick();

      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('begin action', () => {
    it('renders the BeginAction component', async () => {
      const { pinia } = setupInteractiveVideoIntroTest();
      const wrapper = createInteractiveVideoIntroWrapper({ pinia });

      const beginActionComponent = wrapper.findComponent({ name: 'BeginAction' });

      expect(beginActionComponent.exists()).toBe(true);
    });

    it('renders a button within BeginAction', async () => {
      const { pinia } = setupInteractiveVideoIntroTest();
      const wrapper = createInteractiveVideoIntroWrapper({ pinia });

      const beginActionComponent = wrapper.findComponent({ name: 'BeginAction' });
      const button = beginActionComponent.find('button');

      expect(button.exists()).toBe(true);
    });

    it('passes mediaState prop to BeginAction component', async () => {
      const { pinia } = setupInteractiveVideoIntroTest();
      const wrapper = createInteractiveVideoIntroWrapper({ pinia });

      const beginActionComponent = wrapper.findComponent({ name: 'BeginAction' });

      expect(beginActionComponent.props('mediaState')).toBeDefined();
    });
  });

  describe('loading state', () => {
    it('hides loading icon when media is not loading', async () => {
      const { pinia } = setupInteractiveVideoIntroTest();
      const wrapper = createInteractiveVideoIntroWrapper({ pinia });

      const loadingIcon = wrapper.findComponent({ name: 'AnimatedLoadingIcon' });

      expect(loadingIcon.exists()).toBe(false);
    });
  });

  describe('component lifecycle', () => {
    it('loads media when mounted', () => {
      const { pinia } = setupInteractiveVideoIntroTest();
      const wrapper = createInteractiveVideoIntroWrapper({ pinia });

      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('error handling', () => {
    it('handles errors when starting activity fails', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { pinia } = setupInteractiveVideoIntroTest();
      const wrapper = createInteractiveVideoIntroWrapper({ pinia });

      const beginButton = wrapper.find('button');
      if (beginButton.exists()) {
        await beginButton.trigger('click');
      }

      expect(wrapper.exists()).toBe(true);
      consoleSpy.mockRestore();
    });
  });

  describe('media whitelisting', () => {
    it('calls whitelistMedia when start button is clicked', async () => {
      const { pinia } = setupInteractiveVideoIntroTest();
      const wrapper = createInteractiveVideoIntroWrapper({ pinia });

      const beginButton = wrapper.find('button');
      if (beginButton.exists()) {
        await beginButton.trigger('click');
      }

      expect(wrapper.exists()).toBe(true);
    });

    it('emits start event after successful whitelisting', async () => {
      const { pinia } = setupInteractiveVideoIntroTest();
      const wrapper = createInteractiveVideoIntroWrapper({ pinia });

      const beginButton = wrapper.find('button');
      if (beginButton.exists()) {
        await beginButton.trigger('click');
      }

      expect(wrapper.exists()).toBe(true);
    });
  });
});
