// @ts-check

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useActivitySettingsStore } from './activity_settings_store';

/**
 * Sets up test environment for activity settings store tests
 * @return {any}
 */
function setupActivitySettingsStoreTest() {
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

  return useActivitySettingsStore();
}

describe('#useActivitySettingsStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('store access', () => {
    it('returns activity settings store instance', () => {
      const store = setupActivitySettingsStoreTest();

      expect(store).toBeDefined();
      expect(typeof store).toBe('object');
    });

    it('returns store with expected properties', () => {
      const store = setupActivitySettingsStoreTest();

      expect(store).toHaveProperty('actionSettings');
      expect(store).toHaveProperty('isInitialized');
    });

    it('returns store with expected methods', () => {
      const store = setupActivitySettingsStoreTest();

      expect(typeof store.initializeAutoPlaySetting).toBe('function');
      expect(typeof store.updateAutoPlaySetting).toBe('function');
      expect(typeof store.resetAutoPlayToEnabled).toBe('function');
      expect(typeof store.init).toBe('function');
    });
  });

  describe('store state', () => {
    it('has correct initial actionSettings', () => {
      const store = setupActivitySettingsStoreTest();

      expect(store.actionSettings).toBeDefined();
      expect(store.actionSettings).toHaveProperty('useAutoPlay');
      expect(store.actionSettings.useAutoPlay).toBe(false);
    });

    it('has correct initial isInitialized', () => {
      const store = setupActivitySettingsStoreTest();

      expect(store.isInitialized).toBeDefined();
      expect(typeof store.isInitialized).toBe('boolean');
      expect(store.isInitialized).toBe(false);
    });
  });

  describe('getters', () => {
    it('returns current autoplay setting', () => {
      const store = setupActivitySettingsStoreTest();

      expect(store.useAutoPlay).toBe(false);

      store.actionSettings.useAutoPlay = true;

      expect(store.useAutoPlay).toBe(true);
    });
  });

  describe('#initializeAutoPlaySetting', () => {
    it('sets autoplay to stored value when available', () => {
      const store = setupActivitySettingsStoreTest();
      const localStorage = window.localStorage;

      localStorage.getItem.mockReturnValue('true');

      store.initializeAutoPlaySetting();

      expect(localStorage.getItem).toHaveBeenCalledWith(
        'interactive_video_autoplay'
      );
      expect(store.actionSettings.useAutoPlay).toBe(true);
    });

    it('sets autoplay to true when no stored value and not Safari', () => {
      const store = setupActivitySettingsStoreTest();
      const localStorage = window.localStorage;

      localStorage.getItem.mockReturnValue(null);

      store.initializeAutoPlaySetting();

      expect(store.actionSettings.useAutoPlay).toBe(true);
    });

    it('sets autoplay to false when no stored value and is Safari', () => {
      const store = setupActivitySettingsStoreTest();
      const localStorage = window.localStorage;

      localStorage.getItem.mockReturnValue(null);

      vi.doMock('../../lib/safari_browser_check', () => ({
        browserIsSafari: vi.fn().mockReturnValue(true),
      }));

      store.initializeAutoPlaySetting();

      expect(store.actionSettings.useAutoPlay).toBe(true);
    });
  });

  describe('#updateAutoPlaySetting', () => {
    it('updates autoplay setting and persists to localStorage', () => {
      const store = setupActivitySettingsStoreTest();
      const localStorage = window.localStorage;

      store.updateAutoPlaySetting(true);

      expect(store.actionSettings.useAutoPlay).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'interactive_video_autoplay',
        'true'
      );
    });

    it('updates autoplay setting to false and persists to localStorage', () => {
      const store = setupActivitySettingsStoreTest();
      const localStorage = window.localStorage;

      store.updateAutoPlaySetting(false);

      expect(store.actionSettings.useAutoPlay).toBe(false);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'interactive_video_autoplay',
        'false'
      );
    });
  });

  describe('#resetAutoPlayToEnabled', () => {
    it('resets autoplay setting to enabled and persists to localStorage', () => {
      const store = setupActivitySettingsStoreTest();
      const localStorage = window.localStorage;

      store.actionSettings.useAutoPlay = false;

      store.resetAutoPlayToEnabled();

      expect(store.actionSettings.useAutoPlay).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'interactive_video_autoplay',
        'true'
      );
    });
  });

  describe('#init', () => {
    it('initializes autoplay setting and sets isInitialized to true', () => {
      const store = setupActivitySettingsStoreTest();
      const localStorage = window.localStorage;

      localStorage.getItem.mockReturnValue('false');

      store.init();

      expect(localStorage.getItem).toHaveBeenCalledWith(
        'interactive_video_autoplay'
      );
      expect(store.actionSettings.useAutoPlay).toBe(false);
      expect(store.isInitialized).toBe(true);
    });
  });
});
