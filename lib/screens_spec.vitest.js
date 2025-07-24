// @ts-check

import { describe, it, expect } from 'vitest';
import { buildScreensForActivity } from './screens';

describe('screens', () => {
  describe('buildScreensForActivity', () => {
    it('returns intro and player screens for basic activity', () => {
      const activityInfo = {
        topic: 'Spanish Grammar',
        sub_topic: 'Present Tense',
        title: 'Interactive Grammar Tutorial',
        dl: 'Welcome to the lesson',
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
      };

      const screens = buildScreensForActivity(activityInfo);

      expect(screens).toEqual([
        { id: 'intro', name: 'intro' },
        { id: 'player', name: 'player' },
        { id: 'diagnostic', name: 'diagnostic' },
      ]);
    });

    it('includes diagnostic screen when diagnostic data is present', () => {
      const activityInfo = {
        topic: 'Spanish Grammar',
        sub_topic: 'Present Tense',
        title: 'Interactive Grammar Tutorial',
        dl: 'Welcome to the lesson',
        reference: [],
        quick_checks: [],
        diagnostic: {
          dl: 'Complete the diagnostic test',
          failure_message: 'You need more practice',
          items: [
            {
              question: 'What is the correct form of "to be"?',
              answer: 'es',
            },
          ],
          language: 'es',
          number_of_questions: '1',
          threshold: '80',
        },
      };

      const screens = buildScreensForActivity(activityInfo);

      expect(screens).toEqual([
        { id: 'intro', name: 'intro' },
        { id: 'player', name: 'player' },
        { id: 'diagnostic', name: 'diagnostic' },
      ]);
    });

    it('excludes diagnostic screen when diagnostic is empty object', () => {
      const activityInfo = {
        topic: 'Spanish Grammar',
        sub_topic: 'Present Tense',
        title: 'Interactive Grammar Tutorial',
        dl: 'Welcome to the lesson',
        reference: [],
        quick_checks: [],
        diagnostic: {},
      };

      const screens = buildScreensForActivity(activityInfo);

      expect(screens).toEqual([
        { id: 'intro', name: 'intro' },
        { id: 'player', name: 'player' },
      ]);
    });

    it('excludes diagnostic screen when diagnostic is null', () => {
      const activityInfo = {
        topic: 'Spanish Grammar',
        sub_topic: 'Present Tense',
        title: 'Interactive Grammar Tutorial',
        dl: 'Welcome to the lesson',
        reference: [],
        quick_checks: [],
        diagnostic: undefined,
      };

      const screens = buildScreensForActivity(activityInfo);

      expect(screens).toEqual([
        { id: 'intro', name: 'intro' },
        { id: 'player', name: 'player' },
      ]);
    });

    it('excludes diagnostic screen when diagnostic is undefined', () => {
      const activityInfo = {
        topic: 'Spanish Grammar',
        sub_topic: 'Present Tense',
        title: 'Interactive Grammar Tutorial',
        dl: 'Welcome to the lesson',
        reference: [],
        quick_checks: [],
      };

      const screens = buildScreensForActivity(activityInfo);

      expect(screens).toEqual([
        { id: 'intro', name: 'intro' },
        { id: 'player', name: 'player' },
      ]);
    });

    it('handles activity with minimal required fields', () => {
      const activityInfo = {
        topic: 'Spanish Grammar',
        sub_topic: 'Present Tense',
        title: 'Interactive Grammar Tutorial',
        dl: 'Welcome to the lesson',
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
      };

      const screens = buildScreensForActivity(activityInfo);

      expect(screens).toEqual([
        { id: 'intro', name: 'intro' },
        { id: 'player', name: 'player' },
        { id: 'diagnostic', name: 'diagnostic' },
      ]);
    });

    it('includes diagnostic screen when diagnostic has any properties', () => {
      const activityInfo = {
        topic: 'Spanish Grammar',
        sub_topic: 'Present Tense',
        title: 'Interactive Grammar Tutorial',
        dl: 'Welcome to the lesson',
        reference: [],
        quick_checks: [],
        diagnostic: {
          dl: 'Test diagnostic',
          failure_message: '',
          items: [],
          language: '',
          number_of_questions: '',
          threshold: '',
        },
      };

      const screens = buildScreensForActivity(activityInfo);

      expect(screens).toEqual([
        { id: 'intro', name: 'intro' },
        { id: 'player', name: 'player' },
        { id: 'diagnostic', name: 'diagnostic' },
      ]);
    });
  });
});