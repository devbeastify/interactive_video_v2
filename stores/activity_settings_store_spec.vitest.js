// @ts-check

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useActivitySettingsStore } from './activity_settings_store';

vi.mock('../lib/safari_browser_check', () => ({
  browserIsSafari: vi.fn(() => false),
}));

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn(),
  key: vi.fn(),
  length: 0,
};

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

/**
 * @description Test suite for activity_settings_store
 */
describe('activity_settings_store', () => {
  /** @type {ReturnType<typeof useActivitySettingsStore>} */
  let store;
  /** @type {any} */
  let mockBrowserIsSafari;

  beforeEach(async () => {
    setActivePinia(createPinia());

    localStorageMock.clear();
    vi.clearAllMocks();

    store = useActivitySettingsStore();

    const { browserIsSafari } = await import('../lib/safari_browser_check');
    mockBrowserIsSafari = vi.mocked(browserIsSafari);
  });

  afterEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  /**
   * @description Tests store initialization
   */
  describe('initialization', () => {
    it('has correct initial autoplay setting', () => {
      expect(store.actionSettings.useAutoPlay).toBe(false);
    });

    it('has correct initial isInitialized state', () => {
      expect(store.isInitialized).toBe(false);
    });

    it('initializes store when init is called', () => {
      store.init();

      expect(store.isInitialized).toBe(true);
    });

    it('calls initializeAutoPlaySetting when init is called', () => {
      const initSpy = vi.spyOn(store, 'initializeAutoPlaySetting');

      store.init();

      expect(initSpy).toHaveBeenCalled();
    });
  });

  /**
   * @description Tests autoplay setting initialization
   */
  describe('autoplay setting initialization', () => {
    it('uses stored autoplay setting when available', () => {
      localStorageMock.getItem.mockReturnValue('true');

      store.initializeAutoPlaySetting();

      expect(store.actionSettings.useAutoPlay).toBe(true);
    });

    it('uses stored autoplay setting when false', () => {
      localStorageMock.getItem.mockReturnValue('false');

      store.initializeAutoPlaySetting();

      expect(store.actionSettings.useAutoPlay).toBe(false);
    });

    it('uses browser check when no stored setting is available', () => {
      localStorageMock.getItem.mockReturnValue(null);

      store.initializeAutoPlaySetting();

      expect(mockBrowserIsSafari).toHaveBeenCalled();
    });

    it('disables autoplay for Safari when no stored setting is available', () => {
      localStorageMock.getItem.mockReturnValue(null);
      mockBrowserIsSafari.mockReturnValue(true);

      store.initializeAutoPlaySetting();

      expect(store.actionSettings.useAutoPlay).toBe(false);
    });

    it('handles empty stored value', () => {
      localStorageMock.getItem.mockReturnValue('');

      store.initializeAutoPlaySetting();

      expect(store.actionSettings.useAutoPlay).toBe(false);
    });
  });

  /**
   * @description Tests autoplay setting updates
   */
  describe('autoplay setting updates', () => {
    it('updates autoplay setting to true', () => {
      store.updateAutoPlaySetting(true);

      expect(store.actionSettings.useAutoPlay).toBe(true);
    });

    it('persists autoplay setting to localStorage when enabled', () => {
      store.updateAutoPlaySetting(true);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'interactive_video_autoplay',
        'true'
      );
    });

    it('updates autoplay setting to false', () => {
      store.updateAutoPlaySetting(false);

      expect(store.actionSettings.useAutoPlay).toBe(false);
    });

    it('persists autoplay setting to localStorage when disabled', () => {
      store.updateAutoPlaySetting(false);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'interactive_video_autoplay',
        'false'
      );
    });

    it('overrides existing localStorage value', () => {
      localStorageMock.setItem.mockClear();

      store.updateAutoPlaySetting(true);
      store.updateAutoPlaySetting(false);

      expect(localStorageMock.setItem).toHaveBeenCalledTimes(2);
    });
  });

  /**
   * @description Tests autoplay reset functionality
   */
  describe('autoplay reset functionality', () => {
    it('resets autoplay to enabled', () => {
      store.resetAutoPlayToEnabled();

      expect(store.actionSettings.useAutoPlay).toBe(true);
    });

    it('persists reset autoplay setting to localStorage', () => {
      store.resetAutoPlayToEnabled();

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'interactive_video_autoplay',
        'true'
      );
    });

    it('overrides existing localStorage value when resetting', () => {
      localStorageMock.setItem.mockClear();

      store.resetAutoPlayToEnabled();

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'interactive_video_autoplay',
        'true'
      );
    });
  });

  /**
   * @description Tests getters
   */
  describe('getters', () => {
    it('returns current autoplay setting', () => {
      store.actionSettings.useAutoPlay = true;

      expect(store.useAutoPlay).toBe(true);
    });

    it('returns false when autoplay is disabled', () => {
      store.actionSettings.useAutoPlay = false;

      expect(store.useAutoPlay).toBe(false);
    });
  });
});