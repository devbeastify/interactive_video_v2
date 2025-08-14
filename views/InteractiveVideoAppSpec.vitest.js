// @ts-check

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import InteractiveVideoApp from './InteractiveVideoApp.vue';

vi.mock('../stores/main_store', () => ({
  mainStore: vi.fn(() => ({
    activityInfo: {
      topic: 'Test Topic',
      sub_topic: 'Test Sub Topic',
      title: 'Test Title',
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
    },
    sequencer: {
      currentScreen: { name: 'intro' },
      goToScreen: vi.fn(),
    },
    init: vi.fn(),
  })),
}));

vi.mock('../stores/action_store', () => ({
  useActionStore: vi.fn(() => ({
    actions: [
      { type: 'video', data: { dl: 'Test video' }, index: 0 },
      { type: 'quick_check', data: { question: 'Test question' }, index: 1 },
    ],
    currentActionIndex: 0,
    goToAction: vi.fn(),
  })),
}));

vi.mock('./IntroScreen.vue', () => ({
  default: {
    name: 'IntroScreen',
    template: '<div class="intro-screen">Intro Screen</div>',
    emits: ['start'],
  },
}));

vi.mock('./PlayerScreen.vue', () => ({
  default: {
    name: 'PlayerScreen',
    template: '<div class="player-screen">Player Screen</div>',
    props: ['preventInitialization'],
  },
}));

vi.mock('./DiagnosticScreen.vue', () => ({
  default: {
    name: 'DiagnosticScreen',
    template: '<div class="diagnostic-screen">Diagnostic Screen</div>',
  },
}));

/**
 * @description Test suite for InteractiveVideoApp component
 */
describe('InteractiveVideoApp', () => {
  /** @type {import('pinia').Pinia} */
  let pinia;

  beforeEach(async () => {
    pinia = createPinia();
    setActivePinia(pinia);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * @description Tests component initialization
   */
  describe('initialization', () => {
    it('adds progress bar button click event listener on mount', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');

      mount(InteractiveVideoApp, {
        global: {
          plugins: [pinia],
        },
      });

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'progressBarButtonClick',
        expect.any(Function)
      );
    });

    it('adds progress bar element enabled event listener on mount', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');

      mount(InteractiveVideoApp, {
        global: {
          plugins: [pinia],
        },
      });

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'progressBarElementEnabled',
        expect.any(Function)
      );
    });

    it('removes progress bar button click event listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

      const wrapper = mount(InteractiveVideoApp, {
        global: {
          plugins: [pinia],
        },
      });

      wrapper.unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'progressBarButtonClick',
        expect.any(Function)
      );
    });

    it('removes progress bar element enabled event listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

      const wrapper = mount(InteractiveVideoApp, {
        global: {
          plugins: [pinia],
        },
      });

      wrapper.unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'progressBarElementEnabled',
        expect.any(Function)
      );
    });
  });

  /**
   * @description Tests screen rendering based on current screen
   */
  describe('screen rendering', () => {
    it('renders IntroScreen when current screen is intro', () => {
      const wrapper = mount(InteractiveVideoApp, {
        global: {
          plugins: [pinia],
        },
      });

      const introScreen = wrapper.findComponent({ name: 'IntroScreen' });

      expect(introScreen.exists()).toBe(true);
    });
  });

  /**
   * @description Tests progress bar event handling
   */
  describe('progress bar events', () => {
    it('logs message when progress bar element enabled event occurs', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      mount(InteractiveVideoApp, {
        global: {
          plugins: [pinia],
        },
      });

      const event = new CustomEvent('progressBarElementEnabled', {
        detail: { elementIndex: 2 },
      });

      document.dispatchEvent(event);

      expect(consoleSpy).toHaveBeenCalledWith('Progress bar element 2 enabled.');

      consoleSpy.mockRestore();
    });
  });
});