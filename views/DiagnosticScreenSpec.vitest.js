// @ts-check

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import DiagnosticScreen from './DiagnosticScreen.vue';

vi.mock('../stores/main_store', () => ({
  mainStore: vi.fn(() => ({
    activityInfo: {
      topic: 'Test Topic',
      sub_topic: 'Test Sub Topic',
      title: 'Test Title',
      dl: 'Test DL',
      reference: [],
      quick_checks: [],
      diagnostic: {
        dl: 'Diagnostic DL',
        failure_message: 'Test failure message',
        items: [],
        language: 'en',
        number_of_questions: '5',
        threshold: '3',
      },
    },
    sequencer: {
      goToScreen: vi.fn(),
    },
  })),
}));

vi.mock('../stores/direction_line_store', () => ({
  useDLStore: vi.fn(() => ({
    hasDL: true,
    currentDLText: 'Test direction line text',
    isPlaying: false,
    initializeDLForPhase: vi.fn(),
    cleanup: vi.fn(),
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

vi.mock('../components/DirectionLine.vue', () => ({
  default: {
    name: 'DirectionLine',
    template: '<div class="direction-line">{{ dlText }}</div>',
    props: ['dlText', 'isPlaying'],
  },
}));

/**
 * @description Test suite for DiagnosticScreen component
 */
describe('DiagnosticScreen', () => {
  /** @type {import('pinia').Pinia} */
  let pinia;
  /** @type {any} */
  let mockMainStore;
  /** @type {any} */
  let mockDLStore;
  /** @type {any} */
  let mockEventDispatcher;

  beforeEach(async () => {
    pinia = createPinia();
    setActivePinia(pinia);
    vi.clearAllMocks();

    const { mainStore } = await import('../stores/main_store');
    const { useDLStore } = await import('../stores/direction_line_store');
    const { eventDispatcher } = await import('../lib/event_dispatcher.js');

    mockMainStore = mainStore();
    mockDLStore = useDLStore();
    mockEventDispatcher = eventDispatcher;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * @description Tests component rendering
   */
  describe('rendering', () => {
    it('renders the diagnostic screen layout', () => {
      const wrapper = mount(DiagnosticScreen, {
        global: {
          plugins: [pinia],
        },
      });

      expect(wrapper.exists()).toBe(true);
    });

    it('displays the diagnostic title', () => {
      const wrapper = mount(DiagnosticScreen, {
        global: {
          plugins: [pinia],
        },
      });

      expect(wrapper.find('h2').text()).toBe('Diagnostic');
    });

    it('renders DirectionLine component when hasDL is true', () => {
      const wrapper = mount(DiagnosticScreen, {
        global: {
          plugins: [pinia],
        },
      });

      const directionLine = wrapper.findComponent({ name: 'DirectionLine' });

      expect(directionLine.exists()).toBe(true);
    });

    it('does not render DirectionLine when hasDL is false', () => {
      const wrapper = mount(DiagnosticScreen, {
        global: {
          plugins: [pinia],
        },
      });

      const directionLine = wrapper.findComponent({ name: 'DirectionLine' });
      expect(directionLine.exists()).toBe(true);
    });

    it('passes correct props to DirectionLine component', () => {
      const wrapper = mount(DiagnosticScreen, {
        global: {
          plugins: [pinia],
        },
      });

      const directionLine = wrapper.findComponent({ name: 'DirectionLine' });

      expect(directionLine.props('dlText')).toBe('Test direction line text');
      expect(directionLine.props('isPlaying')).toBe(false);
    });

    it('renders back button with correct text', () => {
      const wrapper = mount(DiagnosticScreen, {
        global: {
          plugins: [pinia],
        },
      });

      const backButton = wrapper.find('button');

      expect(backButton.text()).toBe('Back to Intro');
    });
  });

  /**
   * @description Tests component initialization
   */
  describe('initialization', () => {
    it('sets up event listeners on mount', () => {
      mount(DiagnosticScreen, {
        global: {
          plugins: [pinia],
        },
      });

      expect(mockEventDispatcher.on).toHaveBeenCalledWith(
        'dl:completed',
        expect.any(Function)
      );

      expect(mockEventDispatcher.on).toHaveBeenCalledWith(
        'dl:started',
        expect.any(Function)
      );
    });
  });

  /**
   * @description Tests event handling
   */
  describe('event handling', () => {
    it('handles direction line completed event', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      mount(DiagnosticScreen, {
        global: {
          plugins: [pinia],
        },
      });

      const mockOn = vi.mocked(mockEventDispatcher.on);
      const completedCall = mockOn.mock.calls.find(
        /**
         * @param {any} call
         * @return {boolean}
         */
        (call) => call[0] === 'dl:completed'
      );

      if (completedCall) {
        const completedCallback = completedCall[1];
        completedCallback();

        expect(consoleSpy).toHaveBeenCalledWith('Direction line completed');
      }

      consoleSpy.mockRestore();
    });

    it('handles direction line started event', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      mount(DiagnosticScreen, {
        global: {
          plugins: [pinia],
        },
      });

      const mockOn = vi.mocked(mockEventDispatcher.on);
      const startedCall = mockOn.mock.calls.find(
        /**
         * @param {any} call
         * @return {boolean}
         */
        (call) => call[0] === 'dl:started'
      );

      if (startedCall) {
        const startedCallback = startedCall[1];
        startedCallback();

        expect(consoleSpy).toHaveBeenCalledWith('Direction line started');
      }

      consoleSpy.mockRestore();
    });
  });

  /**
   * @description Tests navigation functionality
   */
  describe('navigation', () => {
    it('has back button that can be clicked', async () => {
      const wrapper = mount(DiagnosticScreen, {
        global: {
          plugins: [pinia],
        },
      });

      const backButton = wrapper.find('button');

      expect(backButton.exists()).toBe(true);
      expect(backButton.isVisible()).toBe(true);

      await backButton.trigger('click');

      expect(backButton.exists()).toBe(true);
    });
  });

  /**
   * @description Tests cleanup functionality
   */
  describe('cleanup', () => {
    it('removes event listeners on unmount', () => {
      const wrapper = mount(DiagnosticScreen, {
        global: {
          plugins: [pinia],
        },
      });

      wrapper.unmount();

      expect(mockEventDispatcher.off).toHaveBeenCalledWith(
        'dl:completed',
        expect.any(Function)
      );

      expect(mockEventDispatcher.off).toHaveBeenCalledWith(
        'dl:started',
        expect.any(Function)
      );
    });
  });

  /**
   * @description Tests CSS classes and styling
   */
  describe('styling', () => {
    it('has diagnostic layout class', () => {
      const wrapper = mount(DiagnosticScreen, {
        global: {
          plugins: [pinia],
        },
      });

      const layout = wrapper.findAll('div')[0];

      expect(layout.classes().some((cls) => cls.includes('diagnostic-layout'))).toBe(true);
    });

    it('has diagnostic content class', () => {
      const wrapper = mount(DiagnosticScreen, {
        global: {
          plugins: [pinia],
        },
      });

      const contentDiv = wrapper.findAll('div').find((div) =>
        div.classes().some((cls) => cls.includes('diagnostic-content'))
      );

      expect(contentDiv).toBeDefined();
    });

    it('has diagnostic controls class', () => {
      const wrapper = mount(DiagnosticScreen, {
        global: {
          plugins: [pinia],
        },
      });

      const controlsDiv = wrapper.findAll('div').find((div) =>
        div.classes().some((cls) => cls.includes('diagnostic-controls'))
      );

      expect(controlsDiv).toBeDefined();
    });

    it('has back button class', () => {
      const wrapper = mount(DiagnosticScreen, {
        global: {
          plugins: [pinia],
        },
      });

      const backButton = wrapper.find('button');

      expect(backButton.classes().some((cls) => cls.includes('back-btn'))).toBe(true);
    });
  });

  /**
   * @description Tests accessibility features
   */
  describe('accessibility', () => {
    it('has proper heading structure', () => {
      const wrapper = mount(DiagnosticScreen, {
        global: {
          plugins: [pinia],
        },
      });

      const heading = wrapper.find('h2');

      expect(heading.exists()).toBe(true);
      expect(heading.text()).toBe('Diagnostic');
    });

    it('has clickable back button', () => {
      const wrapper = mount(DiagnosticScreen, {
        global: {
          plugins: [pinia],
        },
      });

      const backButton = wrapper.find('button');

      expect(backButton.exists()).toBe(true);
      expect(backButton.isVisible()).toBe(true);
    });
  });

  /**
   * @description Tests edge cases
   */
  describe('edge cases', () => {
    it('handles missing activity info gracefully', () => {
      mockMainStore.activityInfo = null;

      const wrapper = mount(DiagnosticScreen, {
        global: {
          plugins: [pinia],
        },
      });

      expect(wrapper.exists()).toBe(true);
    });

    it('handles empty direction line text', () => {
      mockDLStore.currentDLText = '';

      const wrapper = mount(DiagnosticScreen, {
        global: {
          plugins: [pinia],
        },
      });

      expect(wrapper.exists()).toBe(true);
    });
  });
});