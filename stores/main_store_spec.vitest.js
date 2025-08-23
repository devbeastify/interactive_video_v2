// @ts-check

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { mainStore } from './main_store';

/**
 * @description Test suite for main_store
 */
describe('main_store', () => {
  /** @type {ReturnType<typeof mainStore>} */
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = mainStore();
  });

  describe('initialization', () => {
    it('initializes with isInitialized as false', () => {
      expect(store.isInitialized).toBe(false);
    });

    it('initializes with default activityInfo', () => {
      expect(store.activityInfo).toEqual({
        diagnostic: {
          direction_line_audio: '',
          dl: '',
          failure_message: '',
          items: [],
          language: '',
          number_of_questions: '',
          threshold: '',
        },
        direction_line_audio: '',
        dl: '',
        mixedEntries: [],
        quick_checks: [],
        reference: [],
        sub_topic: '',
        title: '',
        topic: '',
      });
    });

    it('initializes with sequencer defined', () => {
      expect(store.sequencer).toBeDefined();
    });
  });

  describe('getActivityInfo', () => {
    it('returns the activity info element', async () => {
      const mockElement = document.createElement('div');
      mockElement.className = 'js-program-tutorial';
      mockElement.innerHTML = JSON.stringify({
        topic: 'Test Topic',
        title: 'Test Title',
      });
      document.body.appendChild(mockElement);

      const result = await store.getActivityInfo();

      expect(result).toBe(mockElement);
      document.body.removeChild(mockElement);
    });

    it('returns null when element not found', async () => {
      const result = await store.getActivityInfo();

      expect(result).toBeNull();
    });
  });

  describe('parseActivityInfo', () => {
    it('parses valid activity info', async () => {
      const mockElement = document.createElement('div');
      const activityData = {
        topic: 'Spanish Grammar',
        sub_topic: 'Present Tense',
        title: 'Basic Conjugation',
        reference: [
          {
            id: '1',
            title: 'Video 1',
            url: '/video1.mp4',
          },
        ],
        quick_checks: [
          {
            type: 'multiple_choice',
            quick_check_content: {
              dl: 'Choose the correct form',
            },
          },
        ],
        diagnostic: {
          dl: 'Test your knowledge',
          direction_line_audio: '',
          failure_message: 'You need more practice',
          items: [
            {
              question: 'What is the correct form?',
              options: ['hablo', 'hablas', 'habla'],
              correct: 0,
            },
          ],
          language: 'en',
          number_of_questions: '5',
          threshold: '3',
        },
      };

      mockElement.innerHTML = JSON.stringify([activityData]);

      const result = await store.parseActivityInfo(mockElement);

      expect(result).toEqual(activityData);
    });

    it('throws error for empty innerHTML', async () => {
      const mockElement = document.createElement('div');
      mockElement.innerHTML = '';

      await expect(store.parseActivityInfo(mockElement)).rejects.toThrow();
    });

    it('throws error for invalid JSON', async () => {
      const mockElement = document.createElement('div');
      mockElement.innerHTML = 'invalid json';

      await expect(store.parseActivityInfo(mockElement)).rejects.toThrow();
    });
  });

  describe('parseGlobalIntroData', () => {
    /** @type {typeof document.querySelector} */
    const originalQuerySelector = document.querySelector;

    beforeEach(() => {
      store.activityInfo.topic = 'Initial Topic';
      store.activityInfo.sub_topic = 'Initial Sub Topic';
    });

    afterEach(() => {
      document.querySelector = originalQuerySelector;
    });

    it('returns default values when global intro element is not found', () => {
      document.querySelector = vi.fn().mockReturnValue(null);

      const result = store.parseGlobalIntroData();

      expect(result).toEqual({
        topic: 'Initial Topic',
        sub_topic: 'Initial Sub Topic',
      });
    });

    it('parses global intro data from DOM element when found', () => {
      const globalIntroElement = document.createElement('template');
      globalIntroElement.className = 'js-program-global';
      const globalIntroData = {
        topic: 'Global Topic',
        sub_topic: 'Global Sub Topic',
      };
      const textNode = document.createTextNode(JSON.stringify(globalIntroData));
      globalIntroElement.content.appendChild(textNode);

      document.querySelector = vi.fn().mockReturnValue(globalIntroElement);

      const result = store.parseGlobalIntroData();

      expect(result).toEqual({
        topic: 'Global Topic',
        sub_topic: 'Global Sub Topic',
      });
    });

    it('handles global intro element with empty content', () => {
      const globalIntroElement = document.createElement('template');
      globalIntroElement.className = 'js-program-global';
      Object.defineProperty(globalIntroElement.content, 'textContent', {
        value: '',
        writable: true,
      });

      document.querySelector = vi.fn().mockReturnValue(globalIntroElement);

      expect(() => store.parseGlobalIntroData()).toThrow();
    });

    it('handles global intro element with invalid JSON', () => {
      const globalIntroElement = document.createElement('template');
      globalIntroElement.className = 'js-program-global';
      const textNode = document.createTextNode('invalid json');
      globalIntroElement.content.appendChild(textNode);

      document.querySelector = vi.fn().mockReturnValue(globalIntroElement);

      expect(() => store.parseGlobalIntroData()).toThrow();
    });

    it('overrides store values with global intro data when available', () => {
      store.activityInfo.title = 'Store Title';
      store.activityInfo.topic = 'Store Topic';
      store.activityInfo.sub_topic = 'Store Sub Topic';

      const globalIntroElement = document.createElement('template');
      globalIntroElement.className = 'js-program-global';
      const globalIntroData = {
        topic: 'Global Topic Override',
        sub_topic: 'Global Sub Topic Override',
      };
      const textNode = document.createTextNode(JSON.stringify(globalIntroData));
      globalIntroElement.content.appendChild(textNode);

      document.querySelector = vi.fn().mockReturnValue(globalIntroElement);

      const result = store.parseGlobalIntroData();

      expect(result).toEqual({
        topic: 'Global Topic Override',
        sub_topic: 'Global Sub Topic Override',
      });
    });
  });

  describe('initialize', () => {
    it('initializes store with activity info', async () => {
      const mockElement = document.createElement('div');
      const activityData = {
        topic: 'Spanish Grammar',
        sub_topic: 'Present Tense',
        title: 'Basic Conjugation',
        direction_line_audio: '',
        dl: 'Learn the present tense',
        diagnostic: {
          direction_line_audio: '',
          dl: '',
          failure_message: '',
          items: [],
          language: '',
          number_of_questions: '',
          threshold: '',
        },
        mixed_entries: [],
      };
      mockElement.innerHTML = JSON.stringify([activityData]);

      vi.spyOn(store, 'getActivityInfo').mockResolvedValue(mockElement);
      vi.spyOn(store, 'parseActivityInfo').mockResolvedValue(activityData);
      vi.spyOn(store, 'parseGlobalIntroData').mockReturnValue({
        topic: 'Default Topic',
        sub_topic: 'Default Sub Topic',
      });

      await store.initialize();

      expect(store.isInitialized).toBe(true);
    });

    it('sets activityInfo topic when initializing', async () => {
      const mockElement = document.createElement('div');
      const activityData = {
        topic: 'Spanish Grammar',
        sub_topic: 'Present Tense',
        title: 'Basic Conjugation',
        direction_line_audio: '',
        dl: 'Learn the present tense',
        diagnostic: {
          direction_line_audio: '',
          dl: '',
          failure_message: '',
          items: [],
          language: '',
          number_of_questions: '',
          threshold: '',
        },
        mixed_entries: [],
      };
      mockElement.innerHTML = JSON.stringify([activityData]);

      vi.spyOn(store, 'getActivityInfo').mockResolvedValue(mockElement);
      vi.spyOn(store, 'parseActivityInfo').mockResolvedValue(activityData);
      vi.spyOn(store, 'parseGlobalIntroData').mockReturnValue({
        topic: 'Default Topic',
        sub_topic: 'Default Sub Topic',
      });

      await store.initialize();

      expect(store.activityInfo.topic).toBe('Spanish Grammar');
    });

    it('sets activityInfo title when initializing', async () => {
      const mockElement = document.createElement('div');
      const activityData = {
        topic: 'Spanish Grammar',
        sub_topic: 'Present Tense',
        title: 'Basic Conjugation',
        direction_line_audio: '',
        dl: 'Learn the present tense',
        diagnostic: {
          direction_line_audio: '',
          dl: '',
          failure_message: '',
          items: [],
          language: '',
          number_of_questions: '',
          threshold: '',
        },
        mixed_entries: [],
      };
      mockElement.innerHTML = JSON.stringify([activityData]);

      vi.spyOn(store, 'getActivityInfo').mockResolvedValue(mockElement);
      vi.spyOn(store, 'parseActivityInfo').mockResolvedValue(activityData);
      vi.spyOn(store, 'parseGlobalIntroData').mockReturnValue({
        topic: 'Default Topic',
        sub_topic: 'Default Sub Topic',
      });

      await store.initialize();

      expect(store.activityInfo.title).toBe('Basic Conjugation');
    });

    it('handles initialization failure gracefully', async () => {
      vi.spyOn(store, 'getActivityInfo').mockResolvedValue(null);

      await store.initialize();

      expect(store.isInitialized).toBe(false);
    });

    it('handles parsing failure gracefully', async () => {
      const mockElement = document.createElement('div');
      mockElement.innerHTML = 'invalid json';

      vi.spyOn(store, 'getActivityInfo').mockResolvedValue(mockElement);
      vi.spyOn(store, 'parseActivityInfo').mockRejectedValue(
        new Error('Parse error')
      );

      await store.initialize();

      expect(store.isInitialized).toBe(false);
    });
  });

  describe('getters', () => {
    it('returns topic from activityInfo', () => {
      store.activityInfo.topic = 'Spanish Grammar';

      expect(store.topic).toBe('Spanish Grammar');
    });

    it('returns sub_topic from activityInfo', () => {
      store.activityInfo.sub_topic = 'Present Tense';

      expect(store.sub_topic).toBe('Present Tense');
    });

    it('returns title from activityInfo', () => {
      store.activityInfo.title = 'Basic Conjugation';

      expect(store.title).toBe('Basic Conjugation');
    });

    it('returns reference from activityInfo', () => {
      const reference = [
        {
          id: '1',
          title: 'Video 1',
          type: 'video',
          url: '/video1.mp4',
        },
      ];
      store.activityInfo.reference = reference;

      expect(store.reference).toEqual(reference);
    });

    it('returns quickChecks from activityInfo', () => {
      const quickChecks = [
        {
          type: 'multiple_choice',
          quick_check_content: {
            dl: 'Choose the correct form',
          },
        },
      ];
      store.activityInfo.quick_checks = quickChecks;

      expect(store.quick_checks).toEqual(quickChecks);
    });

    it('returns diagnostic from activityInfo', () => {
      const diagnostic = {
        direction_line_audio: '',
        dl: 'Test your knowledge',
        failure_message: 'You need more practice',
        items: [],
        language: 'en',
        number_of_questions: '5',
        threshold: '3',
      };
      store.activityInfo.diagnostic = diagnostic;

      expect(store.diagnostic).toEqual(diagnostic);
    });
  });

  describe('reset', () => {
    it('resets store to initial state', () => {
      store.isInitialized = true;
      store.activityInfo = {
        topic: 'Test',
        sub_topic: 'Test',
        title: 'Test',
        direction_line_audio: '',
        dl: 'Test',
        reference: [],
        quick_checks: [],
        mixedEntries: [],
        diagnostic: {
          direction_line_audio: '',
          dl: '',
          failure_message: '',
          items: [],
          language: '',
          number_of_questions: '',
          threshold: '',
        },
      };

      store.reset();

      expect(store.isInitialized).toBe(false);
    });

    it('resets activityInfo topic to default', () => {
      store.isInitialized = true;
      store.activityInfo = {
        topic: 'Test',
        sub_topic: 'Test',
        title: 'Test',
        direction_line_audio: '',
        dl: 'Test',
        reference: [],
        quick_checks: [],
        mixedEntries: [],
        diagnostic: {
          direction_line_audio: '',
          dl: '',
          failure_message: '',
          items: [],
          language: '',
          number_of_questions: '',
          threshold: '',
        },
      };

      store.reset();

      expect(store.activityInfo.topic).toBe('');
    });

    it('resets activityInfo sub_topic to default', () => {
      store.isInitialized = true;
      store.activityInfo = {
        topic: 'Test',
        sub_topic: 'Test',
        title: 'Test',
        direction_line_audio: '',
        dl: 'Test',
        reference: [],
        quick_checks: [],
        mixedEntries: [],
        diagnostic: {
          direction_line_audio: '',
          dl: '',
          failure_message: '',
          items: [],
          language: '',
          number_of_questions: '',
          threshold: '',
        },
      };

      store.reset();

      expect(store.activityInfo.sub_topic).toBe('');
    });

    it('resets activityInfo title to default', () => {
      store.isInitialized = true;
      store.activityInfo = {
        topic: 'Test',
        sub_topic: 'Test',
        title: 'Test',
        direction_line_audio: '',
        dl: 'Test',
        reference: [],
        quick_checks: [],
        mixedEntries: [],
        diagnostic: {
          direction_line_audio: '',
          dl: '',
          failure_message: '',
          items: [],
          language: '',
          number_of_questions: '',
          threshold: '',
        },
      };

      store.reset();

      expect(store.activityInfo.title).toBe('');
    });

    it('resets activityInfo dl to default', () => {
      store.isInitialized = true;
      store.activityInfo = {
        topic: 'Test',
        sub_topic: 'Test',
        title: 'Test',
        direction_line_audio: '',
        dl: 'Test',
        reference: [],
        quick_checks: [],
        mixedEntries: [],
        diagnostic: {
          direction_line_audio: '',
          dl: '',
          failure_message: '',
          items: [],
          language: '',
          number_of_questions: '',
          threshold: '',
        },
      };

      store.reset();

      expect(store.activityInfo.dl).toBe('');
    });
  });
});
