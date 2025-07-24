// @ts-check

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import InteractiveVideoApp from './InteractiveVideoApp.vue';

vi.mock('./IntroScreen.vue', () => ({
  default: {
    name: 'IntroScreen',
    template: '<div class="intro-screen"><button @click="$emit(\'start\')">Start</button></div>',
    emits: ['start'],
  },
}));

vi.mock('./PlayerScreen.vue', () => ({
  default: {
    name: 'PlayerScreen',
    template: '<div class="player-screen">Player Screen</div>',
  },
}));

vi.mock('./DiagnosticScreen.vue', () => ({
  default: {
    name: 'DiagnosticScreen',
    template: '<div class="diagnostic-screen">Diagnostic Screen</div>',
  },
}));

const mockInit = vi.fn();
const mockGoToScreen = vi.fn();

vi.mock('../stores/main_store', () => ({
  mainStore: vi.fn(() => ({
    init: mockInit,
    sequencer: {
      currentScreen: { id: 'intro', name: 'intro' },
      goToScreen: mockGoToScreen,
    },
  })),
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
    it('initializes the application on mount', () => {
      mount(InteractiveVideoApp);

      expect(mockInit).toHaveBeenCalled();
    });
  });

  /**
   * @description Tests default screen rendering
   */
  describe('default screen rendering', () => {
    it('renders intro screen by default', () => {
      const wrapper = mount(InteractiveVideoApp);

      expect(wrapper.find('.intro-screen').exists()).toBe(true);
    });

    it('does not render player screen by default', () => {
      const wrapper = mount(InteractiveVideoApp);

      expect(wrapper.find('.player-screen').exists()).toBe(false);
    });

    it('does not render diagnostic screen by default', () => {
      const wrapper = mount(InteractiveVideoApp);

      expect(wrapper.find('.diagnostic-screen').exists()).toBe(false);
    });
  });

  /**
   * @description Tests screen navigation functionality
   */
  describe('screen navigation', () => {
    it('navigates to player screen when intro screen emits start event', async () => {
      const wrapper = mount(InteractiveVideoApp);

      const startButton = wrapper.find('.intro-screen button');
      await startButton.trigger('click');

      expect(mockGoToScreen).toHaveBeenCalledWith('player');
    });
  });

  /**
   * @description Tests component structure
   */
  describe('component structure', () => {
    it('renders a single screen component at a time', () => {
      const wrapper = mount(InteractiveVideoApp);

      const introScreen = wrapper.find('.intro-screen');
      const playerScreen = wrapper.find('.player-screen');
      const diagnosticScreen = wrapper.find('.diagnostic-screen');

      const renderedScreens = [
        introScreen.exists(),
        playerScreen.exists(),
        diagnosticScreen.exists(),
      ];
      const trueCount = renderedScreens.filter(Boolean).length;

      expect(trueCount).toBe(1);
    });

    it('has proper component structure', () => {
      const wrapper = mount(InteractiveVideoApp);

      expect(wrapper.exists()).toBe(true);
    });

    it('has a valid component instance', () => {
      const wrapper = mount(InteractiveVideoApp);

      expect(wrapper.vm).toBeDefined();
    });
  });

  /**
   * @description Tests edge cases and error handling
   */
  describe('edge cases', () => {
    it('handles missing store gracefully', () => {
      vi.doMock('../stores/main_store', () => ({
        mainStore: vi.fn(() => null),
      }));

      expect(() => mount(InteractiveVideoApp)).not.toThrow();
    });

    it('handles missing sequencer gracefully', () => {
      vi.doMock('../stores/main_store', () => ({
        mainStore: vi.fn(() => ({
          init: mockInit,
          sequencer: null,
        })),
      }));

      expect(() => mount(InteractiveVideoApp)).not.toThrow();
    });
  });
});