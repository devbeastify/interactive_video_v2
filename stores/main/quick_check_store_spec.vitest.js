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
    it('creates store with default state', () => {
      const store = setupQuickCheckStoreTest();

      expect(store.currentOffset).toBeNull();
    });

    it('initializes content as null', () => {
      const store = setupQuickCheckStoreTest();

      expect(store.content).toBeNull();
    });

    it('initializes isComplete as false', () => {
      const store = setupQuickCheckStoreTest();

      expect(store.isComplete).toBe(false);
    });

    it('initializes pronunciationToggle as null', () => {
      const store = setupQuickCheckStoreTest();

      expect(store.pronunciationToggle).toBeNull();
    });

    it('initializes isVisible as false', () => {
      const store = setupQuickCheckStoreTest();

      expect(store.isVisible).toBe(false);
    });

    it('initializes with empty quick checks array', () => {
      const store = setupQuickCheckStoreTest();

      expect(store.quickChecks).toEqual([]);
    });

    it('returns false for hasQuickChecks when no quick checks exist', () => {
      const store = setupQuickCheckStoreTest();

      expect(store.hasQuickChecks).toBe(false);
    });
  });

  describe('quick check visibility', () => {
    it('shows quick check', () => {
      const store = setupQuickCheckStoreTest();

      store.showQuickCheck();

      expect(store.isVisible).toBe(true);
    });

    it('hides quick check', () => {
      const store = setupQuickCheckStoreTest();

      store.showQuickCheck();
      store.hideQuickCheck();

      expect(store.isVisible).toBe(false);
    });
  });

  describe('state updates', () => {
    it('updates isVisible state', () => {
      const store = setupQuickCheckStoreTest();

      store.updateQuickCheckState({ isVisible: true });

      expect(store.isVisible).toBe(true);
    });

    it('updates currentOffset state', () => {
      const store = setupQuickCheckStoreTest();

      store.updateQuickCheckState({ currentOffset: 100 });

      expect(store.currentOffset).toBe(100);
    });

    it('updates content state', () => {
      const store = setupQuickCheckStoreTest();
      const testContent = { question: 'Test question' };

      store.updateQuickCheckState({ content: testContent });

      expect(store.content).toEqual(testContent);
    });

    it('updates isComplete state', () => {
      const store = setupQuickCheckStoreTest();

      store.updateQuickCheckState({ isComplete: true });

      expect(store.isComplete).toBe(true);
    });

    it('updates pronunciationToggle state', () => {
      const store = setupQuickCheckStoreTest();
      const mockToggle = document.createElement('input');

      store.updateQuickCheckState({ pronunciationToggle: mockToggle });

      expect(store.pronunciationToggle).toBe(mockToggle);
    });
  });

  describe('quick check completion', () => {
    it('completes quick check and resets state', () => {
      const store = setupQuickCheckStoreTest();
      store.showQuickCheck();
      store.updateQuickCheckState({ currentOffset: 100 });

      store.completeQuickCheck();

      expect(store.isComplete).toBe(false);
    });

    it('hides quick check after completion', () => {
      const store = setupQuickCheckStoreTest();
      store.showQuickCheck();

      store.completeQuickCheck();

      expect(store.isVisible).toBe(false);
    });
  });

  describe('store reset', () => {
    it('resets isVisible to false', () => {
      const store = setupQuickCheckStoreTest();
      store.showQuickCheck();

      store.reset();

      expect(store.isVisible).toBe(false);
    });

    it('resets currentOffset to null', () => {
      const store = setupQuickCheckStoreTest();
      store.updateQuickCheckState({ currentOffset: 100 });

      store.reset();

      expect(store.currentOffset).toBeNull();
    });

    it('resets content to null', () => {
      const store = setupQuickCheckStoreTest();
      store.updateQuickCheckState({ content: { test: 'data' }});

      store.reset();

      expect(store.content).toBeNull();
    });

    it('resets isComplete to false', () => {
      const store = setupQuickCheckStoreTest();
      store.updateQuickCheckState({ isComplete: true });

      store.reset();

      expect(store.isComplete).toBe(false);
    });

    it('resets pronunciationToggle to null', () => {
      const store = setupQuickCheckStoreTest();
      const mockToggle = document.createElement('input');
      store.updateQuickCheckState({ pronunciationToggle: mockToggle });

      store.reset();

      expect(store.pronunciationToggle).toBeNull();
    });

    it('maintains empty quick checks array after reset', () => {
      const store = setupQuickCheckStoreTest();

      store.reset();

      expect(store.quickChecks).toEqual([]);
    });
  });

  describe('getters', () => {
    it('returns undefined for currentQuickCheck when no offset set', () => {
      const store = setupQuickCheckStoreTest();

      expect(store.currentQuickCheck).toBeUndefined();
    });

    it('returns undefined for currentQuickCheck when no quick checks exist', () => {
      const store = setupQuickCheckStoreTest();
      store.updateQuickCheckState({ currentOffset: 100 });

      expect(store.currentQuickCheck).toBeUndefined();
    });

    it('returns true for hasQuickChecks when quick checks exist', () => {
      const store = setupQuickCheckStoreTest();
      store.quickChecks = [{
        offset: 100,
        gap: 10,
        type: 'test',
        quick_check_content: {},
        prompt: 'test',
      }];

      expect(store.hasQuickChecks).toBe(true);
    });
  });
});
