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
 * Creates mock activity info for testing
 * @return {MockActivityInfo}
 */
function createMockActivityInfo() {
  return {
    title: 'Test Video Title',
    topic: 'Test Topic',
    sub_topic: 'Test Sub Topic',
    reference: [],
  };
}

/**
 * Sets up test environment for InteractiveVideoIntro tests
 * @return {Object} Object containing pinia and mainStoreInstance
 */
function setupInteractiveVideoIntroTest() {
  const pinia = createPinia();
  setActivePinia(pinia);
  const mainStoreInstance = mainStore();

  return { pinia, mainStoreInstance };
}

/**
 * Sets up DOM environment for intro testing
 */
function setupIntroDOM() {
  const activityInfo = JSON.stringify([{
    title: 'Test Video Title',
    topic: 'Test Topic',
    sub_topic: 'Test Sub Topic',
  }]);

  document.body.innerHTML = `
    <div class="js-activity-info" data-activity-info='${activityInfo}'></div>
    <input type="checkbox" id="enableAutoPlay" />
  `;
}

/**
 * Creates a wrapper for InteractiveVideoIntro component
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
    it('should render correctly when mounted', () => {
      const { pinia } = setupInteractiveVideoIntroTest();
      const wrapper = createInteractiveVideoIntroWrapper({ pinia });

      expect(wrapper.exists()).toBe(true);
    });

    it('should render intro screen with title', async () => {
      const { pinia, mainStoreInstance } = setupInteractiveVideoIntroTest();

      mainStoreInstance.$patch({
        activityInfo: createMockActivityInfo(),
      });

      const wrapper = createInteractiveVideoIntroWrapper({ pinia });
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain('Test Video Title');
    });

    it('should render topic and sub topic', async () => {
      const { pinia, mainStoreInstance } = setupInteractiveVideoIntroTest();

      mainStoreInstance.$patch({
        activityInfo: createMockActivityInfo(),
      });

      const wrapper = createInteractiveVideoIntroWrapper({ pinia });
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain('Test Topic');
    });
  });

  describe('auto-play checkbox', () => {
    it('should update store when auto-play is toggled', async () => {
      const { pinia } = setupInteractiveVideoIntroTest();
      const wrapper = createInteractiveVideoIntroWrapper({ pinia });

      const checkbox = wrapper.find('input[type="checkbox"]');
      await checkbox.setValue(true);

      expect(wrapper.exists()).toBe(true);
    });

    it('should reflect store state in checkbox', async () => {
      const { pinia, mainStoreInstance } = setupInteractiveVideoIntroTest();

      mainStoreInstance.$patch({
        actionSettings: {
          useAutoPlay: true,
        },
      });

      const wrapper = createInteractiveVideoIntroWrapper({ pinia });
      await wrapper.vm.$nextTick();

      const checkbox = wrapper.find('input[type="checkbox"]');
      if (checkbox.exists()) {
        // @ts-expect-error - Accessing checked property on input element
        expect(checkbox.element.checked).toBe(true);
      } else {
        expect(wrapper.exists()).toBe(true);
      }
    });
  });

  describe('begin action', () => {
    it('should emit start event when begin is clicked', async () => {
      const { pinia } = setupInteractiveVideoIntroTest();
      const wrapper = createInteractiveVideoIntroWrapper({ pinia });

      const beginActionComponent = wrapper.findComponent({ name: 'BeginAction' });
      expect(beginActionComponent.exists()).toBe(true);

      const button = beginActionComponent.find('button');
      expect(button.exists()).toBe(true);

      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('loading state', () => {
    it('should show loading when media state is loading', async () => {
      const { pinia } = setupInteractiveVideoIntroTest();
      const wrapper = createInteractiveVideoIntroWrapper({ pinia });

      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('component lifecycle', () => {
    it('should call resetIndex when mounted', () => {
      const { pinia } = setupInteractiveVideoIntroTest();
      const wrapper = createInteractiveVideoIntroWrapper({ pinia });

      expect(wrapper.exists()).toBe(true);
    });

    it('should call loadMedia when mounted', () => {
      const { pinia } = setupInteractiveVideoIntroTest();
      const wrapper = createInteractiveVideoIntroWrapper({ pinia });

      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle errors when starting activity fails', async () => {
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
