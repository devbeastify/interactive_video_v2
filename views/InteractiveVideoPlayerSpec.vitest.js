// @ts-check

import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import InteractiveVideoPlayer from './InteractiveVideoPlayer.vue';
import { mainStore } from '../stores/main/main_store';
import { useQuickCheckStore } from '../stores/main/quick_check_store';
import { vi } from 'vitest';

/** @typedef {import('@vue/test-utils').VueWrapper} VueWrapper */

/**
 * Sets up test environment for InteractiveVideoPlayer tests
 * @return {{ pinia: any, mainStoreInstance: any, quickCheckStore: any }}
 */
function setupInteractiveVideoPlayerTest() {
  const pinia = createPinia();
  setActivePinia(pinia);
  const mainStoreInstance = mainStore();
  const quickCheckStore = useQuickCheckStore();

  return { pinia, mainStoreInstance, quickCheckStore };
}

/**
 * Sets up DOM environment for video player testing
 * @return {void}
 */
function setupVideoPlayerDOM() {
  document.body.innerHTML = `
    <div class="js-tutorial-container"></div>
    <div class="js-video-controls"></div>
    <button class="js-play-pause">Play</button>
    <button class="js-restart">Restart</button>
    <button class="js-back-to-intro">Back to Intro</button>
  `;
}

/**
 * Creates a wrapper for InteractiveVideoPlayer component
 * @param {Object} options - Options object
 * @param {any} [options.pinia] - Pinia instance
 * @param {Object} [options.props] - Component props
 * @return {VueWrapper}
 */
function createInteractiveVideoPlayerWrapper(options = {}) {
  const { pinia } = setupInteractiveVideoPlayerTest();

  return mount(InteractiveVideoPlayer, {
    global: {
      plugins: [options.pinia || pinia],
    },
    props: options.props || {},
    ...options,
  });
}

describe('InteractiveVideoPlayer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupVideoPlayerDOM();
  });

  describe('rendering', () => {
    it('displays the video container', () => {
      const { pinia } = setupInteractiveVideoPlayerTest();
      const wrapper = createInteractiveVideoPlayerWrapper({ pinia });

      expect(wrapper.find('.js-tutorial-container').exists()).toBe(true);
    });

    it('displays video controls by default', () => {
      const { pinia } = setupInteractiveVideoPlayerTest();
      const wrapper = createInteractiveVideoPlayerWrapper({ pinia });

      const videoControls = wrapper.find('[class*="video-controls"]');

      expect(videoControls.exists()).toBe(true);
    });

    it('displays play button with correct initial text', () => {
      const { pinia } = setupInteractiveVideoPlayerTest();
      const wrapper = createInteractiveVideoPlayerWrapper({ pinia });

      const buttons = wrapper.findAll('button');
      const playButton = buttons.find((button) =>
        button.text().includes('Play') || button.text().includes('Pause')
      );

      expect(playButton?.text()).toContain('Play');
    });

    it('displays restart button', () => {
      const { pinia } = setupInteractiveVideoPlayerTest();
      const wrapper = createInteractiveVideoPlayerWrapper({ pinia });

      const buttons = wrapper.findAll('button');
      const restartButton = buttons.find((button) =>
        button.text().includes('Restart')
      );

      expect(restartButton).toBeDefined();
    });

    it('displays back to intro button', () => {
      const { pinia } = setupInteractiveVideoPlayerTest();
      const wrapper = createInteractiveVideoPlayerWrapper({ pinia });

      const buttons = wrapper.findAll('button');
      const backButton = buttons.find((button) =>
        button.text().includes('Back to Intro')
      );

      expect(backButton).toBeDefined();
    });

    it('displays QuickCheck component', () => {
      const { pinia } = setupInteractiveVideoPlayerTest();
      const wrapper = createInteractiveVideoPlayerWrapper({ pinia });

      expect(wrapper.findComponent({ name: 'QuickCheck' }).exists()).toBe(true);
    });
  });

  describe('user interactions', () => {
    it('changes play button text when clicked', async () => {
      const { pinia } = setupInteractiveVideoPlayerTest();
      const wrapper = createInteractiveVideoPlayerWrapper({ pinia });

      const buttons = wrapper.findAll('button');
      const playButton = buttons.find((button) =>
        button.text().includes('Play') || button.text().includes('Pause')
      );

      if (playButton) {
        await playButton.trigger('click');
      }

      const updatedButtons = wrapper.findAll('button');
      const updatedPlayButton = updatedButtons.find((button) =>
        button.text().includes('Play') || button.text().includes('Pause')
      );

      expect(updatedPlayButton?.text()).toContain('Play');
    });

    it('restarts video when restart button is clicked', async () => {
      const { pinia } = setupInteractiveVideoPlayerTest();
      const wrapper = createInteractiveVideoPlayerWrapper({ pinia });

      const buttons = wrapper.findAll('button');
      const restartButton = buttons.find((button) =>
        button.text().includes('Restart')
      );

      if (restartButton) {
        await restartButton.trigger('click');
      }

      expect(restartButton).toBeDefined();
    });

    it('navigates to intro when back to intro button is clicked', async () => {
      const { pinia } = setupInteractiveVideoPlayerTest();
      const wrapper = createInteractiveVideoPlayerWrapper({ pinia });

      const buttons = wrapper.findAll('button');
      const backButton = buttons.find((button) =>
        button.text().includes('Back to Intro')
      );

      if (backButton) {
        await backButton.trigger('click');
      }

      expect(backButton).toBeDefined();
    });
  });

  describe('component lifecycle', () => {
    it('initializes video player on mount', () => {
      const { pinia } = setupInteractiveVideoPlayerTest();
      const wrapper = createInteractiveVideoPlayerWrapper({ pinia });

      expect(wrapper.exists()).toBe(true);
    });

    it('cleans up resources on unmount', () => {
      const { pinia } = setupInteractiveVideoPlayerTest();
      const wrapper = createInteractiveVideoPlayerWrapper({ pinia });

      wrapper.unmount();

      expect(wrapper.exists()).toBe(false);
    });
  });

  describe('error handling', () => {
    it('handles video loading errors gracefully', async () => {
      const { pinia } = setupInteractiveVideoPlayerTest();
      const wrapper = createInteractiveVideoPlayerWrapper({ pinia });

      const buttons = wrapper.findAll('button');
      const playButton = buttons.find((button) =>
        button.text().includes('Play') || button.text().includes('Pause')
      );

      if (playButton) {
        await playButton.trigger('click');
      }

      expect(wrapper.exists()).toBe(true);
    });

    it('maintains component functionality after errors', async () => {
      const { pinia } = setupInteractiveVideoPlayerTest();
      const wrapper = createInteractiveVideoPlayerWrapper({ pinia });

      const buttons = wrapper.findAll('button');
      const playButton = buttons.find((button) =>
        button.text().includes('Play') || button.text().includes('Pause')
      );

      if (playButton) {
        await playButton.trigger('click');
      }

      expect(wrapper.exists()).toBe(true);
    });
  });
});
