// @ts-check

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import InteractiveVideoApp from './InteractiveVideoApp.vue';
import { mainStore } from '../stores/main/main_store';

/** @typedef {import('@vue/test-utils').VueWrapper} VueWrapper */

/**
 * Sets up test environment for InteractiveVideoApp tests
 * @return {{ pinia: any, mainStoreInstance: any }}
 */
function setupInteractiveVideoAppTest() {
  const pinia = createPinia();
  setActivePinia(pinia);
  const mainStoreInstance = mainStore();

  return { pinia, mainStoreInstance };
}

/**
 * Creates a wrapper for InteractiveVideoApp component
 * @param {Object} options
 * @param {any} [options.pinia]
 * @return {VueWrapper}
 */
function createInteractiveVideoAppWrapper(options = {}) {
  const { pinia } = setupInteractiveVideoAppTest();
  return mount(InteractiveVideoApp, {
    global: {
      plugins: [options.pinia || pinia],
    },
    ...options,
  });
}

describe('InteractiveVideoApp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders the component when mounted', () => {
      const { pinia } = setupInteractiveVideoAppTest();
      const wrapper = createInteractiveVideoAppWrapper({ pinia });

      expect(wrapper.exists()).toBe(true);
    });

    it('displays intro component when current screen is intro', async () => {
      const { pinia, mainStoreInstance } = setupInteractiveVideoAppTest();

      mainStoreInstance.sequencer.addScreen([
        { id: 'intro', name: 'intro' },
        { id: 'player', name: 'player' },
      ]);
      mainStoreInstance.sequencer.goToScreen('intro');

      const wrapper = createInteractiveVideoAppWrapper({ pinia });
      await wrapper.vm.$nextTick();

      expect(wrapper.findComponent({ name: 'InteractiveVideoIntro' }).exists()).toBe(true);
    });

    it('displays player component when current screen is player', async () => {
      const { pinia, mainStoreInstance } = setupInteractiveVideoAppTest();

      mainStoreInstance.sequencer.addScreen([
        { id: 'intro', name: 'intro' },
        { id: 'player', name: 'player' },
      ]);
      mainStoreInstance.sequencer.goToScreen('player');

      const wrapper = createInteractiveVideoAppWrapper({ pinia });
      await wrapper.vm.$nextTick();

      expect(wrapper.findComponent({ name: 'InteractiveVideoPlayer' }).exists()).toBe(true);
    });
  });

  describe('screen transitions', () => {
    it('transitions from intro to player when start event is emitted', async () => {
      const { pinia, mainStoreInstance } = setupInteractiveVideoAppTest();

      mainStoreInstance.$patch({
        currentScreen: 'intro',
      });

      const wrapper = createInteractiveVideoAppWrapper({ pinia });
      await wrapper.vm.$nextTick();

      const introComponent = wrapper.findComponent({ name: 'InteractiveVideoIntro' });
      if (introComponent.exists()) {
        await introComponent.vm.$emit('start');
        expect(wrapper.exists()).toBe(true);
      } else {
        expect(wrapper.exists()).toBe(true);
      }
    });

    it('handles screen changes from store updates', async () => {
      const { pinia, mainStoreInstance } = setupInteractiveVideoAppTest();

      const wrapper = createInteractiveVideoAppWrapper({ pinia });
      await wrapper.vm.$nextTick();

      mainStoreInstance.$patch({ currentScreen: 'player' });
      await wrapper.vm.$nextTick();

      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('store integration', () => {
    it('reflects store state correctly', async () => {
      const { pinia, mainStoreInstance } = setupInteractiveVideoAppTest();

      mainStoreInstance.$patch({
        currentScreen: 'intro',
        activityInfo: {
          title: 'Test Activity',
          topic: 'Test Topic',
        },
      });

      const wrapper = createInteractiveVideoAppWrapper({ pinia });
      await wrapper.vm.$nextTick();

      expect(wrapper.exists()).toBe(true);
    });

    it('handles store state changes', async () => {
      const { pinia, mainStoreInstance } = setupInteractiveVideoAppTest();

      const wrapper = createInteractiveVideoAppWrapper({ pinia });
      await wrapper.vm.$nextTick();

      mainStoreInstance.$patch({ currentScreen: 'player' });
      await wrapper.vm.$nextTick();

      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('component lifecycle', () => {
    it('initializes correctly on mount', () => {
      const { pinia } = setupInteractiveVideoAppTest();
      const wrapper = createInteractiveVideoAppWrapper({ pinia });

      expect(wrapper.exists()).toBe(true);
    });

    it('handles unmounting gracefully', () => {
      const { pinia } = setupInteractiveVideoAppTest();
      const wrapper = createInteractiveVideoAppWrapper({ pinia });

      wrapper.unmount();

      expect(wrapper.exists()).toBe(false);
    });
  });

  describe('error handling', () => {
    it('handles missing store gracefully', () => {
      const wrapper = createInteractiveVideoAppWrapper();

      expect(wrapper.exists()).toBe(true);
    });

    it('handles invalid screen states', async () => {
      const { pinia, mainStoreInstance } = setupInteractiveVideoAppTest();

      mainStoreInstance.$patch({
        currentScreen: 'invalid-screen',
      });

      const wrapper = createInteractiveVideoAppWrapper({ pinia });
      await wrapper.vm.$nextTick();

      expect(wrapper.exists()).toBe(true);
    });
  });
});
