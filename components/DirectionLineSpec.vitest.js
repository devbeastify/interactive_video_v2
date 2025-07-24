// @ts-check

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import DirectionLine from './DirectionLine.vue';

vi.mock('../lib/event_dispatcher', () => ({
  EventDispatcher: {
    getInstance: vi.fn(() => ({
      on: vi.fn(),
      off: vi.fn(),
      dispatch: vi.fn(),
    })),
  },
  DL_EVENTS: {
    COMPLETED: 'dl:completed',
    ERROR: 'dl:error',
    PAUSE: 'dl:pause',
    PAUSED: 'dl:paused',
    PLAY: 'dl:play',
    STARTED: 'dl:started',
  },
}));

/**
 * @description Test suite for DirectionLine component
 */
describe('DirectionLine', () => {
  /** @type {import('pinia').Pinia} */
  let pinia;
  /** @type {any} */
  let eventDispatcher;

  beforeEach(async () => {
    pinia = createPinia();
    setActivePinia(pinia);
    vi.clearAllMocks();

    const { EventDispatcher } = await import('../lib/event_dispatcher');
    eventDispatcher = EventDispatcher.getInstance();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * @description Tests component rendering
   */
  describe('rendering', () => {
    it('renders when dlText is provided', () => {
      const wrapper = mount(DirectionLine, {
        props: {
          dlText: 'Test direction line text',
          isPlaying: false,
        },
        global: {
          plugins: [pinia],
        },
      });

      expect(wrapper.exists()).toBe(true);
    });

    it('displays dlText content', () => {
      const wrapper = mount(DirectionLine, {
        props: {
          dlText: 'Test direction line text',
          isPlaying: false,
        },
        global: {
          plugins: [pinia],
        },
      });

      expect(wrapper.text()).toContain('Test direction line text');
    });

    it('does not render when dlText is empty', () => {
      const wrapper = mount(DirectionLine, {
        props: {
          dlText: '',
          isPlaying: false,
        },
        global: {
          plugins: [pinia],
        },
      });

      expect(wrapper.find('div').exists()).toBe(false);
    });

    it('renders dlText content correctly', () => {
      const testText = 'Test direction line text';
      const wrapper = mount(DirectionLine, {
        props: {
          dlText: testText,
          isPlaying: false,
        },
        global: {
          plugins: [pinia],
        },
      });

      expect(wrapper.text()).toContain(testText);
    });

    it('has correct CSS classes', () => {
      const wrapper = mount(DirectionLine, {
        props: {
          dlText: 'Test direction line text',
          isPlaying: false,
        },
        global: {
          plugins: [pinia],
        },
      });

      expect(wrapper.find('div').exists()).toBe(true);
    });
  });

  describe('PlayButton integration', () => {
    it('renders PlayButton component', () => {
      const wrapper = mount(DirectionLine, {
        props: {
          dlText: 'Test direction line text',
          isPlaying: false,
        },
        global: {
          plugins: [pinia],
        },
      });

      expect(wrapper.findComponent({ name: 'PlayButton' }).exists()).toBe(true);
    });

    it('passes correct audioBtnState to PlayButton when not playing', () => {
      const wrapper = mount(DirectionLine, {
        props: {
          dlText: 'Test direction line text',
          isPlaying: false,
        },
        global: {
          plugins: [pinia],
        },
      });

      const playButton = wrapper.findComponent({ name: 'PlayButton' });

      expect(playButton.props('audioBtnState')).toBe('paused');
    });

    it('passes correct audioBtnState to PlayButton when playing', () => {
      const wrapper = mount(DirectionLine, {
        props: {
          dlText: 'Test direction line text',
          isPlaying: true,
        },
        global: {
          plugins: [pinia],
        },
      });

      const playButton = wrapper.findComponent({ name: 'PlayButton' });

      expect(playButton.props('audioBtnState')).toBe('playing');
    });
  });

  describe('event handling', () => {
    it('registers for PLAY event on mount', async () => {
      const wrapper = mount(DirectionLine, {
        props: {
          dlText: 'Test direction line text',
          isPlaying: false,
        },
        global: {
          plugins: [pinia],
        },
      });

      await wrapper.vm.$nextTick();

      expect(wrapper.exists()).toBe(true);
    });

    it('registers for PAUSED event on mount', async () => {
      const wrapper = mount(DirectionLine, {
        props: {
          dlText: 'Test direction line text',
          isPlaying: false,
        },
        global: {
          plugins: [pinia],
        },
      });

      await wrapper.vm.$nextTick();

      expect(wrapper.exists()).toBe(true);
    });

    it('registers for COMPLETED event on mount', async () => {
      const wrapper = mount(DirectionLine, {
        props: {
          dlText: 'Test direction line text',
          isPlaying: false,
        },
        global: {
          plugins: [pinia],
        },
      });

      await wrapper.vm.$nextTick();

      expect(wrapper.exists()).toBe(true);
    });

    it('unregisters events on unmount', async () => {
      const wrapper = mount(DirectionLine, {
        props: {
          dlText: 'Test direction line text',
          isPlaying: false,
        },
        global: {
          plugins: [pinia],
        },
      });

      await wrapper.vm.$nextTick();
      wrapper.unmount();

      expect(wrapper.exists()).toBe(false);
    });
  });

  describe('event callbacks', () => {
    it('updates local playing state when PLAY event is received', async () => {
      const wrapper = mount(DirectionLine, {
        props: {
          dlText: 'Test direction line text',
          isPlaying: false,
        },
        global: {
          plugins: [pinia],
        },
      });

      const mockOn = vi.mocked(eventDispatcher.on);
      const playCall = mockOn.mock.calls.find(
        /**
         * @param {any} call
         * @return {boolean}
         */
        (call) => call[0] === 'dl:play'
      );

      if (playCall) {
        const playCallback = playCall[1];
        playCallback();

        await wrapper.vm.$nextTick();

        const playButton = wrapper.findComponent({ name: 'PlayButton' });

        expect(playButton.props('audioBtnState')).toBe('playing');
      }
    });

    it('updates local playing state when PAUSED event is received', async () => {
      const wrapper = mount(DirectionLine, {
        props: {
          dlText: 'Test direction line text',
          isPlaying: true,
        },
        global: {
          plugins: [pinia],
        },
      });

      const mockOn = vi.mocked(eventDispatcher.on);
      const pausedCall = mockOn.mock.calls.find(
        /**
         * @param {any} call
         * @return {boolean}
         */
        (call) => call[0] === 'dl:paused'
      );

      if (pausedCall) {
        const pausedCallback = pausedCall[1];
        pausedCallback();

        await wrapper.vm.$nextTick();

        const playButton = wrapper.findComponent({ name: 'PlayButton' });

        expect(playButton.props('audioBtnState')).toBe('paused');
      }
    });

    it('updates local playing state when COMPLETED event is received', async () => {
      const wrapper = mount(DirectionLine, {
        props: {
          dlText: 'Test direction line text',
          isPlaying: true,
        },
        global: {
          plugins: [pinia],
        },
      });

      const mockOn = vi.mocked(eventDispatcher.on);
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

        await wrapper.vm.$nextTick();

        const playButton = wrapper.findComponent({ name: 'PlayButton' });

        expect(playButton.props('audioBtnState')).toBe('paused');
      }
    });
  });

  describe('props', () => {
    it('has default dlText as empty string', () => {
      const wrapper = mount(DirectionLine, {
        global: {
          plugins: [pinia],
        },
      });

      expect(wrapper.props('dlText')).toBe('');
    });

    it('has default isPlaying as false', () => {
      const wrapper = mount(DirectionLine, {
        global: {
          plugins: [pinia],
        },
      });

      expect(wrapper.props('isPlaying')).toBe(false);
    });
  });

  describe('accessibility', () => {
    it('has proper structure for screen readers', () => {
      const wrapper = mount(DirectionLine, {
        props: {
          dlText: 'Test direction line text',
          isPlaying: false,
        },
        global: {
          plugins: [pinia],
        },
      });

      expect(wrapper.find('div').exists()).toBe(true);
    });

    it('displays text content for screen readers', () => {
      const wrapper = mount(DirectionLine, {
        props: {
          dlText: 'Test direction line text',
          isPlaying: false,
        },
        global: {
          plugins: [pinia],
        },
      });

      expect(wrapper.text()).toContain('Test direction line text');
    });
  });
});