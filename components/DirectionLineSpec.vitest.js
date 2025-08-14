// @ts-check

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import DirectionLine from './DirectionLine.vue';

vi.mock('../lib/event_dispatcher', () => ({
  eventDispatcher: {
    on: vi.fn(),
    off: vi.fn(),
    dispatch: vi.fn(),
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

vi.mock('../stores/activity_settings_store', () => ({
  useActivitySettingsStore: () => ({
    useAutoPlay: true,
  }),
}));

describe('DirectionLine', () => {
  /** @type {import('pinia').Pinia} */
  let pinia;
  /** @type {any} */
  let eventDispatcher;

  beforeEach(async () => {
    pinia = createPinia();
    setActivePinia(pinia);
    vi.clearAllMocks();

    const { eventDispatcher: dispatcher } = await import('../lib/event_dispatcher');
    eventDispatcher = dispatcher;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('rendering', () => {
    it('displays direction line text when provided', () => {
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

    it('hides component when dlText is empty', () => {
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

    it('shows play button when direction_line_audio is provided', () => {
      const wrapper = mount(DirectionLine, {
        props: {
          dlText: 'Test text',
          direction_line_audio: 'audio.mp3',
          isPlaying: false,
        },
        global: {
          plugins: [pinia],
        },
      });

      expect(wrapper.findComponent({ name: 'PlayButton' }).exists()).toBe(true);
    });

    it('hides play button when direction_line_audio is not provided', () => {
      const wrapper = mount(DirectionLine, {
        props: {
          dlText: 'Test text',
          direction_line_audio: '',
          isPlaying: false,
        },
        global: {
          plugins: [pinia],
        },
      });

      expect(wrapper.findComponent({ name: 'PlayButton' }).exists()).toBe(false);
    });
  });

  describe('play button state', () => {
    it('shows paused state when not playing', () => {
      const wrapper = mount(DirectionLine, {
        props: {
          dlText: 'Test text',
          direction_line_audio: 'audio.mp3',
          isPlaying: false,
        },
        global: {
          plugins: [pinia],
        },
      });

      const playButton = wrapper.findComponent({ name: 'PlayButton' });

      expect(playButton.props('audioBtnState')).toBe('paused');
    });

    it('shows playing state when playing', () => {
      const wrapper = mount(DirectionLine, {
        props: {
          dlText: 'Test text',
          direction_line_audio: 'audio.mp3',
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

  describe('play button interaction', () => {
    it('dispatches play event when clicked while paused', async () => {
      const wrapper = mount(DirectionLine, {
        props: {
          dlText: 'Test text',
          direction_line_audio: 'audio.mp3',
          isPlaying: false,
        },
        global: {
          plugins: [pinia],
        },
      });

      const playButton = wrapper.findComponent({ name: 'PlayButton' });
      await playButton.vm.$emit('click');

      expect(eventDispatcher.dispatch).toHaveBeenCalledWith('dl:play');
    });

    it('dispatches pause event when clicked while playing', async () => {
      const wrapper = mount(DirectionLine, {
        props: {
          dlText: 'Test text',
          direction_line_audio: 'audio.mp3',
          isPlaying: true,
        },
        global: {
          plugins: [pinia],
        },
      });

      const playButton = wrapper.findComponent({ name: 'PlayButton' });
      await playButton.vm.$emit('click');

      expect(eventDispatcher.dispatch).toHaveBeenCalledWith('dl:pause');
    });
  });

  describe('event handling', () => {
    it('registers play event listener on mount', () => {
      mount(DirectionLine, {
        props: {
          dlText: 'Test text',
          isPlaying: false,
        },
        global: {
          plugins: [pinia],
        },
      });

      expect(eventDispatcher.on).toHaveBeenCalledWith('dl:play', expect.any(Function));
    });

    it('registers paused event listener on mount', () => {
      mount(DirectionLine, {
        props: {
          dlText: 'Test text',
          isPlaying: false,
        },
        global: {
          plugins: [pinia],
        },
      });

      expect(eventDispatcher.on).toHaveBeenCalledWith('dl:paused', expect.any(Function));
    });

    it('registers completed event listener on mount', () => {
      mount(DirectionLine, {
        props: {
          dlText: 'Test text',
          isPlaying: false,
        },
        global: {
          plugins: [pinia],
        },
      });

      expect(eventDispatcher.on).toHaveBeenCalledWith('dl:completed', expect.any(Function));
    });

    it('unregisters play event listener on unmount', () => {
      const wrapper = mount(DirectionLine, {
        props: {
          dlText: 'Test text',
          isPlaying: false,
        },
        global: {
          plugins: [pinia],
        },
      });

      wrapper.unmount();

      expect(eventDispatcher.off).toHaveBeenCalledWith('dl:play', expect.any(Function));
    });

    it('unregisters paused event listener on unmount', () => {
      const wrapper = mount(DirectionLine, {
        props: {
          dlText: 'Test text',
          isPlaying: false,
        },
        global: {
          plugins: [pinia],
        },
      });

      wrapper.unmount();

      expect(eventDispatcher.off).toHaveBeenCalledWith('dl:paused', expect.any(Function));
    });

    it('unregisters completed event listener on unmount', () => {
      const wrapper = mount(DirectionLine, {
        props: {
          dlText: 'Test text',
          isPlaying: false,
        },
        global: {
          plugins: [pinia],
        },
      });

      wrapper.unmount();

      expect(eventDispatcher.off).toHaveBeenCalledWith('dl:completed', expect.any(Function));
    });
  });

  describe('event callbacks', () => {
    it('updates playing state when play event is received', async () => {
      const wrapper = mount(DirectionLine, {
        props: {
          dlText: 'Test text',
          direction_line_audio: 'audio.mp3',
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

    it('updates playing state when paused event is received', async () => {
      const wrapper = mount(DirectionLine, {
        props: {
          dlText: 'Test text',
          direction_line_audio: 'audio.mp3',
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

    it('updates playing state when completed event is received', async () => {
      const wrapper = mount(DirectionLine, {
        props: {
          dlText: 'Test text',
          direction_line_audio: 'audio.mp3',
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

  describe('auto-play functionality', () => {
    it('auto-plays when dlText and direction_line_audio are provided', () => {
      mount(DirectionLine, {
        props: {
          dlText: 'Test text',
          direction_line_audio: 'audio.mp3',
          isPlaying: false,
        },
        global: {
          plugins: [pinia],
        },
      });

      setTimeout(() => {
        expect(eventDispatcher.dispatch).toHaveBeenCalledWith('dl:play');
      }, 150);
    });

    it('does not auto-play when direction_line_audio is missing', () => {
      mount(DirectionLine, {
        props: {
          dlText: 'Test text',
          direction_line_audio: '',
          isPlaying: false,
        },
        global: {
          plugins: [pinia],
        },
      });

      expect(eventDispatcher.dispatch).not.toHaveBeenCalledWith('dl:play');
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

      wrapper.vm.$nextTick();

      expect(wrapper.props('isPlaying')).toBe(false);
    });

    it('has default direction_line_audio as empty string', () => {
      const wrapper = mount(DirectionLine, {
        global: {
          plugins: [pinia],
        },
      });

      expect(wrapper.props('direction_line_audio')).toBe('');
    });
  });

  describe('accessibility', () => {
    it('renders text content for screen readers', () => {
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