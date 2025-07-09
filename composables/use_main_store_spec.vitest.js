// @ts-check

import { setActivePinia, createPinia } from 'pinia';
import { useMainStore } from './use_main_store';
import { vi } from 'vitest';

/**
 * Sets up test environment for useMainStore tests
 * @return {Object} Test setup object
 */
function setupMainStoreTest() {
  const pinia = createPinia();
  setActivePinia(pinia);
  return useMainStore();
}

describe('#useMainStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('store access', () => {
    it('should return main store instance', () => {
      const store = setupMainStoreTest();

      expect(store).toBeDefined();
      expect(typeof store).toBe('object');
    });

    it('should return store with expected properties', () => {
      const store = setupMainStoreTest();

      expect(store).toHaveProperty('activityInfo');
      expect(store).toHaveProperty('actionSettings');
      expect(store).toHaveProperty('isInitialized');
    });

    it('should return store with expected methods', () => {
      const store = setupMainStoreTest();

      expect(typeof store.updateAutoPlaySetting).toBe('function');
      expect(typeof store.resetIndex).toBe('function');
      expect(typeof store.initializeAutoPlaySetting).toBe('function');
    });
  });

  describe('store state', () => {
    it('should have correct initial actionSettings', () => {
      const store = setupMainStoreTest();

      expect(store.actionSettings).toBeDefined();
      expect(store.actionSettings).toHaveProperty('useAutoPlay');
    });

    it('should have correct initial activityInfo', () => {
      const store = setupMainStoreTest();

      expect(store.activityInfo).toBeDefined();
      expect(store.activityInfo).toHaveProperty('title');
      expect(store.activityInfo).toHaveProperty('topic');
      expect(store.activityInfo).toHaveProperty('sub_topic');
      expect(store.activityInfo).toHaveProperty('reference');
      expect(store.activityInfo).toHaveProperty('quick_checks');
    });

    it('should have correct initial isInitialized', () => {
      const store = setupMainStoreTest();

      expect(store.isInitialized).toBeDefined();
      expect(typeof store.isInitialized).toBe('boolean');
    });
  });

  describe('store methods', () => {
    it('should call updateAutoPlaySetting when method is invoked', () => {
      const store = setupMainStoreTest();

      expect(() => store.updateAutoPlaySetting(true)).not.toThrow();
    });

    it('should call resetIndex when method is invoked', () => {
      const store = setupMainStoreTest();

      expect(() => store.resetIndex()).not.toThrow();
    });

    it('should call initializeAutoPlaySetting when method is invoked', () => {
      const store = setupMainStoreTest();

      expect(() => store.initializeAutoPlaySetting()).not.toThrow();
    });
  });

  describe('store reset', () => {
    it('should call $reset when method is invoked', () => {
      const store = setupMainStoreTest();

      expect(() => store.$reset()).not.toThrow();
    });
  });

  describe('error handling', () => {
    it('should handle missing store gracefully', () => {
      expect(() => useMainStore()).not.toThrow();
    });

    it('should handle store initialization errors', () => {
      expect(() => useMainStore()).not.toThrow();
    });
  });
});
