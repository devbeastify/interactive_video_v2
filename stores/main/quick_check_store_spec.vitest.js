// @ts-check

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useQuickCheckStore } from './quick_check_store';

/**
 * Sets up test environment for quick check store tests
 * @return {any}
 */
function setupQuickCheckStoreTest() {
  const pinia = createPinia();
  setActivePinia(pinia);
  return useQuickCheckStore();
}

describe('useQuickCheckStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should create store with default state', () => {
      const store = setupQuickCheckStoreTest();

      expect(store.currentOffset).toBeNull();
      expect(store.content).toBeNull();
      expect(store.isComplete).toBe(false);
      expect(store.pronunciationToggle).toBeNull();
      expect(store.isVisible).toBe(false);
      expect(store.quickChecks).toEqual([]);
    });

    it('should initialize with empty quick checks array', () => {
      const store = setupQuickCheckStoreTest();

      expect(store.quickChecks).toEqual([]);
      expect(store.hasQuickChecks).toBe(false);
    });
  });

  describe('quick check management', () => {
    it('should show quick check', () => {
      const store = setupQuickCheckStoreTest();

      store.showQuickCheck();

      expect(store.isVisible).toBe(true);
    });

    it('should hide quick check', () => {
      const store = setupQuickCheckStoreTest();

      store.showQuickCheck();
      expect(store.isVisible).toBe(true);

      store.hideQuickCheck();
      expect(store.isVisible).toBe(false);
    });

    it('should update quick check state', () => {
      const store = setupQuickCheckStoreTest();

      store.updateQuickCheckState({ isVisible: true });

      expect(store.isVisible).toBe(true);
    });
  });

  describe('quick check display', () => {
    it('should show quick check when called', () => {
      const store = setupQuickCheckStoreTest();

      store.showQuickCheck();

      expect(store.isVisible).toBe(true);
    });

    it('should hide quick check when called', () => {
      const store = setupQuickCheckStoreTest();

      store.showQuickCheck();
      expect(store.isVisible).toBe(true);

      store.hideQuickCheck();
      expect(store.isVisible).toBe(false);
    });
  });

  describe('store reset', () => {
    it('should reset store to initial state', () => {
      const store = setupQuickCheckStoreTest();

      store.showQuickCheck();
      expect(store.isVisible).toBe(true);

      store.reset();

      expect(store.isVisible).toBe(false);
      expect(store.currentOffset).toBeNull();
      expect(store.content).toBeNull();
      expect(store.isComplete).toBe(false);
      expect(store.pronunciationToggle).toBeNull();
      expect(store.quickChecks).toEqual([]);
    });
  });
});
