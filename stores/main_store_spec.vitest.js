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
          dl: '',
          direction_line_audio: '',
          failure_message: '',
          items: [],
          language: '',
          number_of_questions: '',
          threshold: '',
        },
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

  describe('initialize', () => {
    it('initializes store with activity info', async () => {
      const mockElement = document.createElement('div');
      const activityData = {
        topic: 'Spanish Grammar',
        sub_topic: 'Present Tense',
        title: 'Basic Conjugation',
        reference: [],
        quick_checks: [],
        diagnostic: {
          dl: '',
          direction_line_audio: '',
          failure_message: '',
          items: [],
          language: '',
          number_of_questions: '',
          threshold: '',
        },
      };
      mockElement.innerHTML = JSON.stringify([activityData]);

      vi.spyOn(store, 'getActivityInfo').mockResolvedValue(mockElement);
      vi.spyOn(store, 'parseActivityInfo').mockResolvedValue(activityData);

      await store.initialize();

      expect(store.isInitialized).toBe(true);
    });

    it('sets activityInfo topic when initializing', async () => {
      const mockElement = document.createElement('div');
      const activityData = {
        topic: 'Spanish Grammar',
        sub_topic: 'Present Tense',
        title: 'Basic Conjugation',
        reference: [],
        quick_checks: [],
        diagnostic: {
          dl: '',
          direction_line_audio: '',
          failure_message: '',
          items: [],
          language: '',
          number_of_questions: '',
          threshold: '',
        },
      };
      mockElement.innerHTML = JSON.stringify([activityData]);

      vi.spyOn(store, 'getActivityInfo').mockResolvedValue(mockElement);
      vi.spyOn(store, 'parseActivityInfo').mockResolvedValue(activityData);

      await store.initialize();

      expect(store.activityInfo.topic).toBe('Spanish Grammar');
    });

    it('sets activityInfo title when initializing', async () => {
      const mockElement = document.createElement('div');
      const activityData = {
        topic: 'Spanish Grammar',
        sub_topic: 'Present Tense',
        title: 'Basic Conjugation',
        reference: [],
        quick_checks: [],
        diagnostic: {
          dl: '',
          direction_line_audio: '',
          failure_message: '',
          items: [],
          language: '',
          number_of_questions: '',
          threshold: '',
        },
      };
      mockElement.innerHTML = JSON.stringify([activityData]);

      vi.spyOn(store, 'getActivityInfo').mockResolvedValue(mockElement);
      vi.spyOn(store, 'parseActivityInfo').mockResolvedValue(activityData);

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
        dl: 'Test your knowledge',
        direction_line_audio: '',
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
        reference: [],
        quick_checks: [],
        diagnostic: {
          dl: '',
          direction_line_audio: '',
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
        reference: [],
        quick_checks: [],
        diagnostic: {
          dl: '',
          direction_line_audio: '',
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
        reference: [],
        quick_checks: [],
        diagnostic: {
          dl: '',
          direction_line_audio: '',
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
        reference: [],
        quick_checks: [],
        diagnostic: {
          dl: '',
          direction_line_audio: '',
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
  });
});