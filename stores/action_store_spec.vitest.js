// @ts-check

import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useActionStore } from './action_store';

/**
 * @description Test suite for useActionStore
 */
describe('useActionStore', () => {
  /** @type {ReturnType<typeof useActionStore>} */
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useActionStore();
  });

  describe('initialization', () => {
    it('initializes with empty actions array', () => {
      expect(store.actions).toEqual([]);
    });

    it('initializes with currentActionIndex as 0', () => {
      expect(store.currentActionIndex).toBe(0);
    });
  });

  describe('currentAction getter', () => {
    it('returns current action when actions exist', () => {
      const mockAction = {
        type: 'video',
        data: { dl: 'Test video' },
        index: 0,
      };
      store.actions = [mockAction];

      expect(store.currentAction).toStrictEqual(mockAction);
    });

    it('returns null when no actions exist', () => {
      store.actions = [];

      expect(store.currentAction).toBeNull();
    });

    it('returns null when currentActionIndex is out of bounds', () => {
      const mockAction = {
        type: 'video',
        data: { dl: 'Test video' },
        index: 0,
      };
      store.actions = [mockAction];
      store.currentActionIndex = 5;

      expect(store.currentAction).toBeNull();
    });
  });

  describe('currentActionIsVideo getter', () => {
    it('returns true for video action', () => {
      const mockAction = {
        type: 'video',
        data: { dl: 'Test video' },
        index: 0,
      };
      store.actions = [mockAction];

      expect(store.currentActionIsVideo).toBe(true);
    });

    it('returns false for non-video action', () => {
      const mockAction = {
        type: 'quick_check',
        data: { quick_check_content: { dl: 'Test question' }},
        index: 0,
      };
      store.actions = [mockAction];

      expect(store.currentActionIsVideo).toBe(false);
    });

    it('returns false when no current action', () => {
      store.actions = [];

      expect(store.currentActionIsVideo).toBe(false);
    });
  });

  describe('currentActionIsQuickCheck getter', () => {
    it('returns true for quick check action', () => {
      const mockAction = {
        type: 'quick_check',
        data: { quick_check_content: { dl: 'Test question' }},
        index: 0,
      };
      store.actions = [mockAction];

      expect(store.currentActionIsQuickCheck).toBe(true);
    });

    it('returns false for non-quick check action', () => {
      const mockAction = {
        type: 'video',
        data: { dl: 'Test video' },
        index: 0,
      };
      store.actions = [mockAction];

      expect(store.currentActionIsQuickCheck).toBe(false);
    });

    it('returns false when no current action', () => {
      store.actions = [];

      expect(store.currentActionIsQuickCheck).toBe(false);
    });
  });

  describe('hasNextAction getter', () => {
    it('returns true when next action exists', () => {
      const mockActions = [
        { type: 'video', data: { dl: 'Video 1' }, index: 0 },
        { type: 'quick_check', data: { quick_check_content: { dl: 'Question 1' }}, index: 1 },
      ];
      store.actions = mockActions;
      store.currentActionIndex = 0;

      expect(store.hasNextAction).toBe(true);
    });

    it('returns false when at last action', () => {
      const mockActions = [
        { type: 'video', data: { dl: 'Video 1' }, index: 0 },
        { type: 'quick_check', data: { quick_check_content: { dl: 'Question 1' }}, index: 1 },
      ];
      store.actions = mockActions;
      store.currentActionIndex = 1;

      expect(store.hasNextAction).toBe(false);
    });

    it('returns false when no actions exist', () => {
      store.actions = [];

      expect(store.hasNextAction).toBe(false);
    });
  });

  describe('isAtLastAction getter', () => {
    it('returns true when at last action', () => {
      const mockActions = [
        { type: 'video', data: { dl: 'Video 1' }, index: 0 },
        { type: 'quick_check', data: { quick_check_content: { dl: 'Question 1' }}, index: 1 },
      ];
      store.actions = mockActions;
      store.currentActionIndex = 1;

      expect(store.isAtLastAction).toBe(true);
    });

    it('returns false when not at last action', () => {
      const mockActions = [
        { type: 'video', data: { dl: 'Video 1' }, index: 0 },
        { type: 'quick_check', data: { quick_check_content: { dl: 'Question 1' }}, index: 1 },
      ];
      store.actions = mockActions;
      store.currentActionIndex = 0;

      expect(store.isAtLastAction).toBe(false);
    });

    it('returns true when no actions exist', () => {
      store.actions = [];

      expect(store.isAtLastAction).toBe(true);
    });
  });

  describe('createActions', () => {
    it('creates actions from activity info', () => {
      const activityInfo = {
        topic: 'Spanish Grammar',
        sub_topic: 'Present Tense',
        title: 'Test Activity',
        dl: 'Welcome to the lesson',
        reference: [
          {
            dl: 'Watch this video',
            id: 'ref1',
            title: 'Video 1',
            url: '/video1.mp4',
          },
        ],
        quick_checks: [
          {
            type: 'multiple_choice',
            quick_check_content: {
              prompt: 'What is the correct form?',
            },
          },
        ],
        diagnostic: {
          dl: 'Take the diagnostic test',
        },
      };

      store.createActions(activityInfo);

      expect(store.actions).toHaveLength(2);
    });

    it('creates video action correctly', () => {
      const activityInfo = {
        topic: 'Spanish Grammar',
        sub_topic: 'Present Tense',
        title: 'Test Activity',
        dl: 'Welcome to the lesson',
        reference: [
          {
            dl: 'Watch this video',
            id: 'ref1',
            title: 'Video 1',
            url: '/video1.mp4',
          },
        ],
        quick_checks: [
          {
            type: 'multiple_choice',
            quick_check_content: {
              prompt: 'What is the correct form?',
            },
          },
        ],
        diagnostic: {
          dl: 'Take the diagnostic test',
        },
      };

      store.createActions(activityInfo);

      expect(store.actions[0].type).toBe('video');
    });

    it('creates quick check action correctly', () => {
      const activityInfo = {
        topic: 'Spanish Grammar',
        sub_topic: 'Present Tense',
        title: 'Test Activity',
        dl: 'Welcome to the lesson',
        reference: [
          {
            dl: 'Watch this video',
            id: 'ref1',
            title: 'Video 1',
            url: '/video1.mp4',
          },
        ],
        quick_checks: [
          {
            type: 'multiple_choice',
            quick_check_content: {
              prompt: 'What is the correct form?',
            },
          },
        ],
        diagnostic: {
          dl: 'Take the diagnostic test',
        },
      };

      store.createActions(activityInfo);

      expect(store.actions[1].type).toBe('quick_check');
    });

    it('resets currentActionIndex to 0', () => {
      const activityInfo = {
        topic: 'Spanish Grammar',
        sub_topic: 'Present Tense',
        title: 'Test Activity',
        dl: 'Welcome to the lesson',
        reference: [
          {
            dl: 'Watch this video',
            id: 'ref1',
            title: 'Video 1',
            url: '/video1.mp4',
          },
        ],
        quick_checks: [
          {
            type: 'multiple_choice',
            quick_check_content: {
              prompt: 'What is the correct form?',
            },
          },
        ],
        diagnostic: {
          dl: 'Take the diagnostic test',
        },
      };

      store.createActions(activityInfo);

      expect(store.currentActionIndex).toBe(0);
    });

    it('handles empty activity info', () => {
      const activityInfo = {
        topic: 'Test',
        sub_topic: '',
        title: '',
        dl: '',
        reference: [],
        quick_checks: [],
        diagnostic: {
          dl: '',
        },
      };

      store.createActions(activityInfo);

      expect(store.actions).toEqual([]);
    });

    it('resets currentActionIndex for empty activity info', () => {
      const activityInfo = {
        topic: 'Test',
        sub_topic: '',
        title: '',
        dl: '',
        reference: [],
        quick_checks: [],
        diagnostic: {
          dl: '',
        },
      };

      store.createActions(activityInfo);

      expect(store.currentActionIndex).toBe(0);
    });
  });

  describe('goToAction', () => {
    it('goes to valid action index', () => {
      const mockActions = [
        { type: 'video', data: { dl: 'Video 1' }, index: 0 },
        { type: 'quick_check', data: { quick_check_content: { dl: 'Question 1' }}, index: 1 },
      ];
      store.actions = mockActions;

      store.goToAction(1);

      expect(store.currentActionIndex).toBe(1);
    });

    it('does not go to invalid action index', () => {
      const mockActions = [
        { type: 'video', data: { dl: 'Video 1' }, index: 0 },
        { type: 'quick_check', data: { quick_check_content: { dl: 'Question 1' }}, index: 1 },
      ];
      store.actions = mockActions;
      store.currentActionIndex = 0;

      store.goToAction(5);

      expect(store.currentActionIndex).toBe(0);
    });

    it('handles negative index', () => {
      const mockActions = [
        { type: 'video', data: { dl: 'Video 1' }, index: 0 },
      ];
      store.actions = mockActions;
      store.currentActionIndex = 0;

      store.goToAction(-1);

      expect(store.currentActionIndex).toBe(0);
    });
  });

  describe('goToNextAction', () => {
    it('goes to next action when available', () => {
      const mockActions = [
        { type: 'video', data: { dl: 'Video 1' }, index: 0 },
        { type: 'quick_check', data: { quick_check_content: { dl: 'Question 1' }}, index: 1 },
      ];
      store.actions = mockActions;
      store.currentActionIndex = 0;

      store.goToNextAction();

      expect(store.currentActionIndex).toBe(1);
    });

    it('does not go to next when at last action', () => {
      const mockActions = [
        { type: 'video', data: { dl: 'Video 1' }, index: 0 },
        { type: 'quick_check', data: { quick_check_content: { dl: 'Question 1' }}, index: 1 },
      ];
      store.actions = mockActions;
      store.currentActionIndex = 1;

      store.goToNextAction();

      expect(store.currentActionIndex).toBe(1);
    });

    it('does not go to next when no actions exist', () => {
      store.actions = [];
      store.currentActionIndex = 0;

      store.goToNextAction();

      expect(store.currentActionIndex).toBe(0);
    });
  });

  describe('reset', () => {
    it('resets action index to 0', () => {
      store.currentActionIndex = 5;

      store.reset();

      expect(store.currentActionIndex).toBe(0);
    });

    it('keeps actions unchanged', () => {
      const mockActions = [
        { type: 'video', data: { dl: 'Video 1' }, index: 0 },
      ];
      store.actions = mockActions;
      store.currentActionIndex = 5;

      store.reset();

      expect(store.actions).toEqual(mockActions);
    });
  });

  describe('resetToFirstAction', () => {
    it('resets action index to 0', () => {
      store.currentActionIndex = 5;

      store.resetToFirstAction();

      expect(store.currentActionIndex).toBe(0);
    });

    it('keeps actions unchanged', () => {
      const mockActions = [
        { type: 'video', data: { dl: 'Video 1' }, index: 0 },
      ];
      store.actions = mockActions;
      store.currentActionIndex = 5;

      store.resetToFirstAction();

      expect(store.actions).toEqual(mockActions);
    });
  });
});