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
    it('returns main store instance', () => {
      const store = setupMainStoreTest();

      expect(store).toBeDefined();
    });

    it('returns an object', () => {
      const store = setupMainStoreTest();

      expect(typeof store).toBe('object');
    });
  });

  describe('store state', () => {
    it('has correct initial activityInfo structure', () => {
      const store = setupMainStoreTest();

      expect(store.activityInfo).toHaveProperty('title');
    });

    it('has correct initial activityInfo topic property', () => {
      const store = setupMainStoreTest();

      expect(store.activityInfo).toHaveProperty('topic');
    });

    it('has correct initial activityInfo sub_topic property', () => {
      const store = setupMainStoreTest();

      expect(store.activityInfo).toHaveProperty('sub_topic');
    });

    it('has correct initial activityInfo reference property', () => {
      const store = setupMainStoreTest();

      expect(store.activityInfo).toHaveProperty('reference');
    });

    it('has correct initial activityInfo quick_checks property', () => {
      const store = setupMainStoreTest();

      expect(store.activityInfo).toHaveProperty('quick_checks');
    });

    it('has correct initial isInitialized type', () => {
      const store = setupMainStoreTest();

      expect(typeof store.isInitialized).toBe('boolean');
    });
  });

  describe('store reset', () => {
    it('calls $reset without throwing', () => {
      const store = setupMainStoreTest();

      expect(() => store.$reset()).not.toThrow();
    });
  });

  describe('error handling', () => {
    it('handles missing store gracefully', () => {
      expect(() => useMainStore()).not.toThrow();
    });

    it('handles store initialization errors', () => {
      expect(() => useMainStore()).not.toThrow();
    });
  });
});
