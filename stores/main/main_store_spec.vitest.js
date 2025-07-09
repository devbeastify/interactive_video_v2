// @ts-check

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { mainStore } from './main_store';

/**
 * @typedef {Object} MockActivityInfo
 * @property {string} topic
 * @property {string} sub_topic
 * @property {string} title
 * @property {Array<any>} reference
 * @property {Array<any>} quick_checks
 */

/**
 * Creates mock activity info for testing
 * @return {MockActivityInfo}
 */
function createMockActivityInfo() {
  return {
    topic: 'Test Topic',
    sub_topic: 'Test Sub Topic',
    title: 'Test Title',
    reference: [],
    quick_checks: [],
  };
}

/**
 * Sets up test environment for main store tests
 * @return {{ pinia: any }}
 */
function setupMainStoreTest() {
  const pinia = createPinia();
  setActivePinia(pinia);

  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    },
    writable: true,
  });

  vi.mock('../../lib/safari_browser_check', () => ({
    browserIsSafari: vi.fn().mockReturnValue(false),
  }));

  vi.mock('./activity_info', () => ({
    getActivityInfo: vi.fn().mockResolvedValue(document.createElement('div')),
    parseActivityInfo: vi.fn().mockResolvedValue(createMockActivityInfo()),
  }));

  vi.mock('../../lib/screens', () => ({
    buildScreensForActivity: vi.fn().mockReturnValue([
      { id: 'intro', name: 'intro' },
      { id: 'player', name: 'player' },
    ]),
  }));

  return { pinia };
}

describe('mainStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should create store with default state', () => {
      setupMainStoreTest();
      const store = mainStore();

      expect(store).toBeDefined();
      expect(store.actionSettings).toBeDefined();
      expect(store.activityInfo).toBeDefined();
      expect(store.sequencer).toBeDefined();
      expect(store.isInitialized).toBe(false);
    });

    it('should initialize with correct default values', () => {
      setupMainStoreTest();
      const store = mainStore();

      expect(store.actionSettings.useAutoPlay).toBe(false);
      expect(store.activityInfo).toEqual({
        topic: '',
        sub_topic: '',
        title: '',
        reference: [],
        quick_checks: [],
      });
    });
  });

  describe('action settings', () => {
    it('should update auto play setting', () => {
      setupMainStoreTest();
      const store = mainStore();

      store.updateAutoPlaySetting(true);

      expect(store.actionSettings.useAutoPlay).toBe(true);
    });

    it('should persist auto play setting to localStorage', () => {
      setupMainStoreTest();
      const store = mainStore();

      store.updateAutoPlaySetting(true);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'interactive_video_autoplay',
        'true'
      );
    });

    it('should reset auto play setting', () => {
      setupMainStoreTest();
      const store = mainStore();

      store.resetIndex();

      expect(store.actionSettings.useAutoPlay).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'interactive_video_autoplay',
        'true'
      );
    });
  });

  describe('store initialization', () => {
    it('should initialize store when init is called', () => {
      setupMainStoreTest();
      const store = mainStore();

      store.init();

      expect(store.isInitialized).toBe(true);
    });

    it('should initialize auto play setting', () => {
      setupMainStoreTest();
      const store = mainStore();

      store.initializeAutoPlaySetting();

      expect(store.actionSettings.useAutoPlay).toBeDefined();
    });
  });

  describe('store reset', () => {
    it('should reset store to initial state', () => {
      setupMainStoreTest();
      const store = mainStore();

      store.updateAutoPlaySetting(true);
      store.isInitialized = true;

      store.$reset();

      expect(store.actionSettings.useAutoPlay).toBe(false);
      expect(store.isInitialized).toBe(false);
    });
  });

  describe('sequencer integration', () => {
    it('should have sequencer instance', () => {
      setupMainStoreTest();
      const store = mainStore();

      expect(store.sequencer).toBeDefined();
      expect(typeof store.sequencer.addScreen).toBe('function');
      expect(typeof store.sequencer.goToScreen).toBe('function');
    });
  });
});
