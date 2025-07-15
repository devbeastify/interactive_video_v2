// @ts-check

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { mainStore } from './main_store';

/**
 * @typedef {Object} MockActivityInfo
 * @property {string} topic
 * @property {string} sub_topic
 * @property {string} title
 * @property {string} dl
 * @property {Array<any>} reference
 * @property {Array<any>} quick_checks
 * @property {Object} diagnostic
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
    dl: 'Test Direction Line',
    reference: [],
    quick_checks: [],
    diagnostic: {
      dl: 'Test Diagnostic Direction Line',
      failure_message: '',
      items: [],
      language: 'en',
      number_of_questions: '',
      threshold: '',
    },
  };
}

/**
 * Sets up test environment for main store tests
 * @return {{ pinia: any }}
 */
function setupMainStoreTest() {
  const pinia = createPinia();
  setActivePinia(pinia);

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
    it('creates store with default state', () => {
      setupMainStoreTest();
      const store = mainStore();

      expect(store.isInitialized).toBe(false);
    });

    it('initializes with empty activity info', () => {
      setupMainStoreTest();
      const store = mainStore();

      expect(store.activityInfo).toEqual({
        topic: '',
        sub_topic: '',
        title: '',
        dl: '',
        reference: [],
        quick_checks: [],
        diagnostic: {
          dl: '',
          failure_message: '',
          items: [],
          language: '',
          number_of_questions: '',
          threshold: '',
        },
      });
    });

    it('has sequencer instance', () => {
      setupMainStoreTest();
      const store = mainStore();

      expect(store.sequencer).toBeDefined();
    });
  });

  describe('store initialization', () => {
    it('sets isInitialized to true when init is called', () => {
      setupMainStoreTest();
      const store = mainStore();

      store.init();

      expect(store.isInitialized).toBe(true);
    });
  });

  describe('store reset', () => {
    it('resets store to initial state', () => {
      setupMainStoreTest();
      const store = mainStore();

      store.isInitialized = true;

      store.$reset();

      expect(store.isInitialized).toBe(false);
    });
  });

  describe('direction line getters', () => {
    it('returns main direction line for intro step', () => {
      setupMainStoreTest();
      const store = mainStore();
      store.activityInfo.dl = 'Main Direction Line';

      const directionLine = store.getDirectionLineForStep('intro');

      expect(directionLine).toBe('Main Direction Line');
    });

    it('returns main direction line for player step', () => {
      setupMainStoreTest();
      const store = mainStore();
      store.activityInfo.dl = 'Main Direction Line';

      const directionLine = store.getDirectionLineForStep('player');

      expect(directionLine).toBe('Main Direction Line');
    });

    it('returns empty string for quick_check step', () => {
      setupMainStoreTest();
      const store = mainStore();

      const directionLine = store.getDirectionLineForStep('quick_check');

      expect(directionLine).toBe('');
    });

    it('returns diagnostic direction line for diagnostic step', () => {
      setupMainStoreTest();
      const store = mainStore();
      store.activityInfo.diagnostic.dl = 'Diagnostic Direction Line';

      const directionLine = store.getDirectionLineForStep('diagnostic');

      expect(directionLine).toBe('Diagnostic Direction Line');
    });

    it('returns main direction line for unknown step', () => {
      setupMainStoreTest();
      const store = mainStore();
      store.activityInfo.dl = 'Main Direction Line';

      const directionLine = store.getDirectionLineForStep('unknown');

      expect(directionLine).toBe('Main Direction Line');
    });
  });

  describe('direction line availability', () => {
    it('returns true when main direction line exists', () => {
      setupMainStoreTest();
      const store = mainStore();
      store.activityInfo.dl = 'Main Direction Line';

      const hasDirectionLines = store.hasDirectionLines;

      expect(hasDirectionLines).toBe(true);
    });

    it('returns true when diagnostic direction line exists', () => {
      setupMainStoreTest();
      const store = mainStore();
      store.activityInfo.diagnostic.dl = 'Diagnostic Direction Line';

      const hasDirectionLines = store.hasDirectionLines;

      expect(hasDirectionLines).toBe(true);
    });

    it('returns false when no direction lines exist', () => {
      setupMainStoreTest();
      const store = mainStore();

      const hasDirectionLines = store.hasDirectionLines;

      expect(hasDirectionLines).toBe(false);
    });
  });

  describe('language code for step', () => {
    it('returns diagnostic language for diagnostic step', () => {
      setupMainStoreTest();
      const store = mainStore();
      store.activityInfo.diagnostic.language = 'es';

      const languageCode = store._getLanguageCodeForStep('diagnostic');

      expect(languageCode).toBe('es');
    });

    it('returns default language for non-diagnostic steps', () => {
      setupMainStoreTest();
      const store = mainStore();

      const languageCode = store._getLanguageCodeForStep('intro');

      expect(languageCode).toBe('en');
    });
  });
});
