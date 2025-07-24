// @ts-check

import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useQuickCheckStore } from './quick_check_store';

/**
 * @description Test suite for quick_check_store
 */
describe('quick_check_store', () => {
  /** @type {ReturnType<typeof useQuickCheckStore>} */
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());

    store = useQuickCheckStore();
  });

  /**
   * @description Tests store initialization
   */
  describe('initialization', () => {
    it('has correct initial state', () => {
      expect(store.quickChecks).toEqual([]);
    });

    it('has empty quickChecks array initially', () => {
      expect(Array.isArray(store.quickChecks)).toBe(true);
    });

    it('has zero length initially', () => {
      expect(store.quickChecks.length).toBe(0);
    });
  });

  /**
   * @description Tests getters
   */
  describe('getters', () => {
    it('returns false when no quick checks are available', () => {
      store.quickChecks = [];

      expect(store.hasQuickChecks).toBe(false);
    });

    it('returns true when quick checks are available', () => {
      store.quickChecks = [
        {
          quick_check_content: {},
          prompt: 'Test question',
          type: 'multiple_choice',
        },
      ];

      expect(store.hasQuickChecks).toBe(true);
    });

    it('returns true when quickChecks has multiple items', () => {
      store.quickChecks = [
        {
          quick_check_content: {},
          prompt: 'Question 1',
          type: 'multiple_choice',
        },
        {
          quick_check_content: {},
          prompt: 'Question 2',
          type: 'fill_in_the_blanks',
        },
      ];

      expect(store.hasQuickChecks).toBe(true);
    });
  });

  /**
   * @description Tests reset functionality
   */
  describe('reset functionality', () => {
    it('resets quickChecks to empty array', () => {
      store.quickChecks = [
        {
          quick_check_content: {},
          prompt: 'Test question',
          type: 'multiple_choice',
        },
      ];

      store.reset();

      expect(store.quickChecks).toEqual([]);
    });

    it('resets quickChecks length to zero', () => {
      store.quickChecks = [
        {
          quick_check_content: {},
          prompt: 'Test question',
          type: 'multiple_choice',
        },
      ];

      store.reset();

      expect(store.quickChecks.length).toBe(0);
    });
  });

  /**
   * @description Tests updateQuickCheckState functionality
   */
  describe('updateQuickCheckState functionality', () => {
    it('updates quickChecks when quickChecks is provided', () => {
      const newQuickChecks = [
        {
          quick_check_content: {},
          prompt: 'New question',
          type: 'multiple_choice',
        },
      ];

      store.updateQuickCheckState({
        quickChecks: newQuickChecks,
      });

      expect(store.quickChecks).toEqual(newQuickChecks);
    });

    it('does not update quickChecks when quickChecks is not provided', () => {
      const originalQuickChecks = [
        {
          quick_check_content: {},
          prompt: 'Original question',
          type: 'multiple_choice',
        },
      ];

      store.quickChecks = originalQuickChecks;

      store.updateQuickCheckState({});

      expect(store.quickChecks).toEqual(originalQuickChecks);
    });

    it('updates quickChecks to empty array', () => {
      store.quickChecks = [
        {
          quick_check_content: {},
          prompt: 'Test question',
          type: 'multiple_choice',
        },
      ];

      store.updateQuickCheckState({
        quickChecks: [],
      });

      expect(store.quickChecks).toEqual([]);
    });
  });

  /**
   * @description Tests edge cases
   */
  describe('edge cases', () => {
    it('handles multiple reset calls', () => {
      store.quickChecks = [
        {
          quick_check_content: {},
          prompt: 'Test question',
          type: 'multiple_choice',
        },
      ];

      store.reset();

      expect(store.quickChecks).toEqual([]);

      store.reset();

      expect(store.quickChecks).toEqual([]);
    });

    it('handles multiple updateQuickCheckState calls', () => {
      const quickChecks1 = [
        {
          quick_check_content: {},
          prompt: 'Question 1',
          type: 'multiple_choice',
        },
      ];

      const quickChecks2 = [
        {
          quick_check_content: {},
          prompt: 'Question 2',
          type: 'fill_in_the_blanks',
        },
      ];

      store.updateQuickCheckState({ quickChecks: quickChecks1 });

      expect(store.quickChecks).toEqual(quickChecks1);

      store.updateQuickCheckState({ quickChecks: quickChecks2 });

      expect(store.quickChecks).toEqual(quickChecks2);
    });

    it('handles empty payload object', () => {
      const originalQuickChecks = [
        {
          quick_check_content: {},
          prompt: 'Test question',
          type: 'multiple_choice',
        },
      ];

      store.quickChecks = originalQuickChecks;

      store.updateQuickCheckState({});

      expect(store.quickChecks).toEqual(originalQuickChecks);
    });
  });

  /**
   * @description Tests data structure validation
   */
  describe('data structure validation', () => {
    it('handles quick check with all required properties', () => {
      const quickCheck = {
        quick_check_content: { some: 'content' },
        prompt: 'Test question',
        type: 'multiple_choice',
      };

      store.updateQuickCheckState({
        quickChecks: [quickCheck],
      });

      expect(store.quickChecks[0]).toEqual(quickCheck);
    });

    it('handles quick check without optional prompt property', () => {
      const quickCheck = {
        quick_check_content: { some: 'content' },
        type: 'multiple_choice',
      };

      store.updateQuickCheckState({
        quickChecks: [quickCheck],
      });

      expect(store.quickChecks[0]).toEqual(quickCheck);
    });

    it('handles quick check with different types', () => {
      const quickChecks = [
        {
          quick_check_content: {},
          prompt: 'Multiple choice question',
          type: 'multiple_choice',
        },
        {
          quick_check_content: {},
          prompt: 'Fill in the blanks question',
          type: 'fill_in_the_blanks',
        },
        {
          quick_check_content: {},
          prompt: 'Pronunciation question',
          type: 'pronunciation',
        },
        {
          quick_check_content: {},
          prompt: 'Drag and drop question',
          type: 'quick_check_drag_and_drop',
        },
      ];

      store.updateQuickCheckState({
        quickChecks,
      });

      expect(store.quickChecks).toEqual(quickChecks);
    });
  });

  /**
   * @description Tests store isolation
   */
  describe('store isolation', () => {
    it('maintains separate state for different store instances', () => {
      const pinia1 = createPinia();
      const pinia2 = createPinia();

      setActivePinia(pinia1);
      const store1 = useQuickCheckStore();

      setActivePinia(pinia2);
      const store2 = useQuickCheckStore();

      const quickChecks1 = [
        {
          quick_check_content: {},
          prompt: 'Store 1 question',
          type: 'multiple_choice',
        },
      ];

      const quickChecks2 = [
        {
          quick_check_content: {},
          prompt: 'Store 2 question',
          type: 'fill_in_the_blanks',
        },
      ];

      setActivePinia(pinia1);
      store1.updateQuickCheckState({ quickChecks: quickChecks1 });

      setActivePinia(pinia2);
      store2.updateQuickCheckState({ quickChecks: quickChecks2 });

      setActivePinia(pinia1);

      expect(store1.quickChecks).toEqual(quickChecks1);

      setActivePinia(pinia2);

      expect(store2.quickChecks).toEqual(quickChecks2);
    });
  });
});