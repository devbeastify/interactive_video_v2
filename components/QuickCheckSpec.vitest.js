// @ts-check

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import QuickCheck from './QuickCheck.vue';

vi.mock('../stores/action_store', () => ({
  useActionStore: vi.fn(() => ({
    currentAction: null,
    currentActionIndex: 0,
  })),
}));

vi.mock('../stores/direction_line_store', () => ({
  useDLStore: vi.fn(() => ({
    hasDL: false,
    currentDLText: '',
    isPlaying: false,
    initializeDLForPhase: vi.fn(),
    playDL: vi.fn(),
    cleanup: vi.fn(),
  })),
}));

vi.mock('../stores/main_store', () => ({
  mainStore: vi.fn(() => ({
    activityInfo: {},
  })),
}));

vi.mock('../lib/event_dispatcher.js', () => ({
  eventDispatcher: {
    on: vi.fn(),
    off: vi.fn(),
  },
  DL_EVENTS: {
    COMPLETED: 'dl:completed',
    STARTED: 'dl:started',
  },
}));

vi.mock('./questions/MultipleChoiceQuestion.vue', () => ({
  default: {
    name: 'MultipleChoiceQuestion',
    template: '<div class="multiple-choice-question">Multiple Choice</div>',
    emits: ['answer-selected'],
  },
}));

vi.mock('./questions/FillInTheBlanksQuestion.vue', () => ({
  default: {
    name: 'FillInTheBlanksQuestion',
    template: '<div class="fill-in-the-blanks-question">' +
      'Fill in the Blanks</div>',
    emits: ['answer-submitted'],
  },
}));

vi.mock('./questions/PronunciationQuestion.vue', () => ({
  default: {
    name: 'PronunciationQuestion',
    template: '<div class="pronunciation-question">Pronunciation</div>',
    emits: ['pronunciation-complete'],
  },
}));

vi.mock('./questions/DragAndDropQuestion.vue', () => ({
  default: {
    name: 'DragAndDropQuestion',
    template: '<div class="drag-and-drop-question">Drag and Drop</div>',
    emits: ['answer-submitted'],
  },
}));

vi.mock('./DirectionLine.vue', () => ({
  default: {
    name: 'DirectionLine',
    template: '<div class="direction-line">Direction Line</div>',
  },
}));

describe('QuickCheck', () => {
  /** @type {import('pinia').Pinia} */
  let pinia;
  /** @type {any} */
  let useActionStore;
  /** @type {any} */
  let useDLStore;

  beforeEach(async () => {
    pinia = createPinia();
    setActivePinia(pinia);
    vi.clearAllMocks();

    const actionStoreModule = await import('../stores/action_store');
    const dlStoreModule = await import('../stores/direction_line_store');
    useActionStore = actionStoreModule.useActionStore;
    useDLStore = dlStoreModule.useDLStore;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('rendering', () => {
    it('displays quick check title', () => {
      const wrapper = mount(QuickCheck, {
        global: {
          plugins: [pinia],
        },
      });

      expect(wrapper.text()).toContain('Quick Check');
    });

    it('shows complete button when action data is available', () => {
      useActionStore.mockReturnValue({
        currentAction: {
          type: 'quick_check',
          data: {
            type: 'multiple_choice',
            quick_check_content: {},
          },
        },
        currentActionIndex: 0,
      });

      const wrapper = mount(QuickCheck, {
        global: {
          plugins: [pinia],
        },
      });

      const completeButton = wrapper.find('button');

      expect(completeButton.exists()).toBe(true);
    });

    it('displays correct button text', () => {
      useActionStore.mockReturnValue({
        currentAction: {
          type: 'quick_check',
          data: {
            type: 'multiple_choice',
            quick_check_content: {},
          },
        },
        currentActionIndex: 0,
      });

      const wrapper = mount(QuickCheck, {
        global: {
          plugins: [pinia],
        },
      });

      const completeButton = wrapper.find('button');

      expect(completeButton.text()).toBe('Complete');
    });

    it('hides complete button when no action data is available', () => {
      useActionStore.mockReturnValue({
        currentAction: null,
        currentActionIndex: 0,
      });

      const wrapper = mount(QuickCheck, {
        global: {
          plugins: [pinia],
        },
      });

      const completeButton = wrapper.find('button');

      expect(completeButton.exists()).toBe(false);
    });
  });

  describe('question type rendering', () => {
    it('renders multiple choice question', () => {
      useActionStore.mockReturnValue({
        currentAction: {
          type: 'quick_check',
          data: {
            type: 'multiple_choice',
            quick_check_content: {},
          },
        },
        currentActionIndex: 0,
      });

      const wrapper = mount(QuickCheck, {
        global: {
          plugins: [pinia],
        },
      });

      expect(wrapper.find('.multiple-choice-question').exists()).toBe(true);
    });

    it('renders fill in the blanks question', () => {
      useActionStore.mockReturnValue({
        currentAction: {
          type: 'quick_check',
          data: {
            type: 'fill_in_the_blanks',
            quick_check_content: {},
          },
        },
        currentActionIndex: 0,
      });

      const wrapper = mount(QuickCheck, {
        global: {
          plugins: [pinia],
        },
      });

      expect(wrapper.find('.fill-in-the-blanks-question').exists()).toBe(true);
    });

    it('renders pronunciation question', () => {
      useActionStore.mockReturnValue({
        currentAction: {
          type: 'quick_check',
          data: {
            type: 'pronunciation',
            quick_check_content: {},
          },
        },
        currentActionIndex: 0,
      });

      const wrapper = mount(QuickCheck, {
        global: {
          plugins: [pinia],
        },
      });

      expect(wrapper.find('.pronunciation-question').exists()).toBe(true);
    });

    it('renders drag and drop question', () => {
      useActionStore.mockReturnValue({
        currentAction: {
          type: 'quick_check',
          data: {
            type: 'quick_check_drag_and_drop',
            quick_check_content: {},
          },
        },
        currentActionIndex: 0,
      });

      const wrapper = mount(QuickCheck, {
        global: {
          plugins: [pinia],
        },
      });

      expect(wrapper.find('.drag-and-drop-question').exists()).toBe(true);
    });
  });

  describe('direction line rendering', () => {
    it('shows direction line when hasDL is true', () => {
      useDLStore.mockReturnValue({
        hasDL: true,
        currentDLText: 'Test direction line',
        isPlaying: false,
        initializeDLForPhase: vi.fn(),
        playDL: vi.fn(),
        cleanup: vi.fn(),
      });

      const wrapper = mount(QuickCheck, {
        global: {
          plugins: [pinia],
        },
      });

      expect(wrapper.find('.direction-line').exists()).toBe(true);
    });

    it('hides direction line when hasDL is false', () => {
      useDLStore.mockReturnValue({
        hasDL: false,
        currentDLText: '',
        isPlaying: false,
        initializeDLForPhase: vi.fn(),
        playDL: vi.fn(),
        cleanup: vi.fn(),
      });

      const wrapper = mount(QuickCheck, {
        global: {
          plugins: [pinia],
        },
      });

      expect(wrapper.find('.direction-line').exists()).toBe(false);
    });
  });

  describe('user interactions', () => {
    it('emits quick-check-complete when complete button is clicked',
      async () => {
        useActionStore.mockReturnValue({
          currentAction: {
            type: 'quick_check',
            data: {
              type: 'multiple_choice',
              quick_check_content: {},
            },
          },
          currentActionIndex: 0,
        });

        const wrapper = mount(QuickCheck, {
          global: {
            plugins: [pinia],
          },
        });

        const completeButton = wrapper.find('button');
        await completeButton.trigger('click');

        expect(wrapper.emitted('quick-check-complete')).toBeTruthy();
      });

    it('emits quick-check-complete when multiple choice answer is selected',
      () => {
        useActionStore.mockReturnValue({
          currentAction: {
            type: 'quick_check',
            data: {
              type: 'multiple_choice',
              quick_check_content: {},
            },
          },
          currentActionIndex: 0,
        });

        const wrapper = mount(QuickCheck, {
          global: {
            plugins: [pinia],
          },
        });

        const multipleChoiceQuestion = wrapper.findComponent({
          name: 'MultipleChoiceQuestion',
        });
        multipleChoiceQuestion.vm.$emit('answer-selected', {
          id: '1',
          text: 'Answer',
          isCorrect: true,
        });

        expect(wrapper.emitted('quick-check-complete')).toBeTruthy();
      });

    it('emits quick-check-complete when fill in the blanks answer is submitted', () => {
      useActionStore.mockReturnValue({
        currentAction: {
          type: 'quick_check',
          data: {
            type: 'fill_in_the_blanks',
            quick_check_content: {},
          },
        },
        currentActionIndex: 0,
      });

      const wrapper = mount(QuickCheck, {
        global: {
          plugins: [pinia],
        },
      });

      const fillInTheBlanksQuestion = wrapper.findComponent({
        name: 'FillInTheBlanksQuestion',
      });
      fillInTheBlanksQuestion.vm.$emit('answer-submitted',
        ['answer1', 'answer2']);

      expect(wrapper.emitted('quick-check-complete')).toBeTruthy();
    });

    it('emits quick-check-complete when pronunciation is completed', () => {
      useActionStore.mockReturnValue({
        currentAction: {
          type: 'quick_check',
          data: {
            type: 'pronunciation',
            quick_check_content: {},
          },
        },
        currentActionIndex: 0,
      });

      const wrapper = mount(QuickCheck, {
        global: {
          plugins: [pinia],
        },
      });

      const pronunciationQuestion = wrapper.findComponent({
        name: 'PronunciationQuestion',
      });
      pronunciationQuestion.vm.$emit('pronunciation-complete', {
        isCorrect: true,
        score: 85,
        feedback: 'Good',
      });

      expect(wrapper.emitted('quick-check-complete')).toBeTruthy();
    });

    it('emits quick-check-complete when drag and drop answer is submitted',
      () => {
        useActionStore.mockReturnValue({
          currentAction: {
            type: 'quick_check',
            data: {
              type: 'quick_check_drag_and_drop',
              quick_check_content: {},
            },
          },
          currentActionIndex: 0,
        });

        const wrapper = mount(QuickCheck, {
          global: {
            plugins: [pinia],
          },
        });

        const dragAndDropQuestion = wrapper.findComponent({
          name: 'DragAndDropQuestion',
        });
        dragAndDropQuestion.vm.$emit('answer-submitted', ['word1', 'word2']);

        expect(wrapper.emitted('quick-check-complete')).toBeTruthy();
      });
  });

  describe('component lifecycle', () => {
    it('initializes DL for quick check on mount when action is available',
      () => {
        useActionStore.mockReturnValue({
          currentAction: {
            type: 'quick_check',
            data: {
              type: 'multiple_choice',
              quick_check_content: {},
            },
          },
          currentActionIndex: 0,
        });

        const mockInitializeDLForPhase = vi.fn();
        useDLStore.mockReturnValue({
          hasDL: false,
          currentDLText: '',
          isPlaying: false,
          initializeDLForPhase: mockInitializeDLForPhase,
          playDL: vi.fn(),
          cleanup: vi.fn(),
        });

        mount(QuickCheck, {
          global: {
            plugins: [pinia],
          },
        });

        expect(mockInitializeDLForPhase).toHaveBeenCalledWith('quick_check');
      });

    it('does not initialize DL on mount when action is not available',
      () => {
        useActionStore.mockReturnValue({
          currentAction: null,
          currentActionIndex: 0,
        });

        const mockInitializeDLForPhase = vi.fn();
        useDLStore.mockReturnValue({
          hasDL: false,
          currentDLText: '',
          isPlaying: false,
          initializeDLForPhase: mockInitializeDLForPhase,
          playDL: vi.fn(),
          cleanup: vi.fn(),
        });

        mount(QuickCheck, {
          global: {
            plugins: [pinia],
          },
        });

        expect(mockInitializeDLForPhase).not.toHaveBeenCalled();
      });

    it('calls dlStore cleanup on unmount', () => {
      const mockCleanup = vi.fn();
      useDLStore.mockReturnValue({
        hasDL: false,
        currentDLText: '',
        isPlaying: false,
        initializeDLForPhase: vi.fn(),
        playDL: vi.fn(),
        cleanup: mockCleanup,
      });

      const wrapper = mount(QuickCheck, {
        global: {
          plugins: [pinia],
        },
      });

      wrapper.unmount();

      expect(mockCleanup).toHaveBeenCalled();
    });

    it('handles cleanup errors gracefully on unmount', () => {
      const mockCleanup = vi.fn().mockImplementation(() => {
        throw new Error('Cleanup error');
      });
      useDLStore.mockReturnValue({
        hasDL: false,
        currentDLText: '',
        isPlaying: false,
        initializeDLForPhase: vi.fn(),
        playDL: vi.fn(),
        cleanup: mockCleanup,
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const wrapper = mount(QuickCheck, {
        global: {
          plugins: [pinia],
        },
      });

      wrapper.unmount();

      expect(mockCleanup).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error during QuickCheck component cleanup:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('custom event dispatch', () => {
    it('dispatches progressBarElementEnabled event when complete button is clicked', async () => {
      useActionStore.mockReturnValue({
        currentAction: {
          type: 'quick_check',
          data: {
            type: 'multiple_choice',
            quick_check_content: {},
          },
        },
        currentActionIndex: 5,
      });

      const dispatchEventSpy = vi.spyOn(document, 'dispatchEvent');
      const wrapper = mount(QuickCheck, {
        global: {
          plugins: [pinia],
        },
      });

      const completeButton = wrapper.find('button');
      await completeButton.trigger('click');

      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'progressBarElementEnabled',
          detail: { elementIndex: 5 },
        })
      );

      dispatchEventSpy.mockRestore();
    });

    it('dispatches progressBarElementEnabled event when answer is selected',
      () => {
        useActionStore.mockReturnValue({
          currentAction: {
            type: 'quick_check',
            data: {
              type: 'multiple_choice',
              quick_check_content: {},
            },
          },
          currentActionIndex: 3,
        });

        const dispatchEventSpy = vi.spyOn(document, 'dispatchEvent');
        const wrapper = mount(QuickCheck, {
          global: {
            plugins: [pinia],
          },
        });

        const multipleChoiceQuestion = wrapper.findComponent({
          name: 'MultipleChoiceQuestion',
        });
        multipleChoiceQuestion.vm.$emit('answer-selected', {
          id: '1',
          text: 'Answer',
          isCorrect: true,
        });

        expect(dispatchEventSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'progressBarElementEnabled',
            detail: { elementIndex: 3 },
          })
        );

        dispatchEventSpy.mockRestore();
      });
  });

  describe('edge cases', () => {
    it('handles null currentAction gracefully - multiple choice', () => {
      useActionStore.mockReturnValue({
        currentAction: null,
        currentActionIndex: 0,
      });

      const wrapper = mount(QuickCheck, {
        global: {
          plugins: [pinia],
        },
      });

      expect(wrapper.find('.multiple-choice-question').exists()).toBe(false);
    });

    it('handles null currentAction gracefully - fill in the blanks', () => {
      useActionStore.mockReturnValue({
        currentAction: null,
        currentActionIndex: 0,
      });

      const wrapper = mount(QuickCheck, {
        global: {
          plugins: [pinia],
        },
      });

      expect(wrapper.find('.fill-in-the-blanks-question').exists()).toBe(false);
    });

    it('handles null currentAction gracefully - pronunciation', () => {
      useActionStore.mockReturnValue({
        currentAction: null,
        currentActionIndex: 0,
      });

      const wrapper = mount(QuickCheck, {
        global: {
          plugins: [pinia],
        },
      });

      expect(wrapper.find('.pronunciation-question').exists()).toBe(false);
    });

    it('handles null currentAction gracefully - drag and drop', () => {
      useActionStore.mockReturnValue({
        currentAction: null,
        currentActionIndex: 0,
      });

      const wrapper = mount(QuickCheck, {
        global: {
          plugins: [pinia],
        },
      });

      expect(wrapper.find('.drag-and-drop-question').exists()).toBe(false);
    });

    it('handles non-quick_check action type gracefully - multiple choice',
      () => {
        useActionStore.mockReturnValue({
          currentAction: {
            type: 'video',
            data: {},
          },
          currentActionIndex: 0,
        });

        const wrapper = mount(QuickCheck, {
          global: {
            plugins: [pinia],
          },
        });

        expect(wrapper.find('.multiple-choice-question').exists()).toBe(false);
      });

    it('handles non-quick_check action type gracefully - fill in the blanks',
      () => {
        useActionStore.mockReturnValue({
          currentAction: {
            type: 'video',
            data: {},
          },
          currentActionIndex: 0,
        });

        const wrapper = mount(QuickCheck, {
          global: {
            plugins: [pinia],
          },
        });

        expect(wrapper.find('.fill-in-the-blanks-question').exists()).toBe(false);
      });

    it('handles non-quick_check action type gracefully - pronunciation',
      () => {
        useActionStore.mockReturnValue({
          currentAction: {
            type: 'video',
            data: {},
          },
          currentActionIndex: 0,
        });

        const wrapper = mount(QuickCheck, {
          global: {
            plugins: [pinia],
          },
        });

        expect(wrapper.find('.pronunciation-question').exists()).toBe(false);
      });

    it('handles non-quick_check action type gracefully - drag and drop',
      () => {
        useActionStore.mockReturnValue({
          currentAction: {
            type: 'video',
            data: {},
          },
          currentActionIndex: 0,
        });

        const wrapper = mount(QuickCheck, {
          global: {
            plugins: [pinia],
          },
        });

        expect(wrapper.find('.drag-and-drop-question').exists()).toBe(false);
      });
  });
});