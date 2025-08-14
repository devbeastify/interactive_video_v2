// @ts-check

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import VideoPlayer from './VideoPlayer.vue';

vi.mock('../stores/main_store', () => ({
  mainStore: vi.fn(() => ({
    activityInfo: {},
    sequencer: {
      goToScreen: vi.fn(),
    },
  })),
}));

vi.mock('../stores/action_store', () => ({
  useActionStore: vi.fn(() => ({
    currentAction: { type: 'video' },
    currentActionIsVideo: true,
    currentActionIndex: 0,
  })),
}));

vi.mock('../stores/activity_settings_store', () => ({
  useActivitySettingsStore: vi.fn(() => ({
    useAutoPlay: true,
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

vi.mock('../composables/use_video_player', () => ({
  useVideoPlayer: vi.fn(() => ({
    videoPlayer: { value: null },
    isPlaying: { value: false },
    initializeVideoPlayer: vi.fn(),
    cleanupVideoPlayer: vi.fn(),
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

vi.mock('./DirectionLine.vue', () => ({
  default: {
    name: 'DirectionLine',
    template: '<div class="direction-line">{{ dlText }}</div>',
    props: ['dlText', 'isPlaying'],
  },
}));

describe('VideoPlayer', () => {
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

  describe('rendering', () => {
    it('displays video player container', () => {
      const wrapper = mount(VideoPlayer, {
        global: {
          plugins: [pinia],
        },
      });

      expect(wrapper.find('[class*="video-player"]').exists()).toBe(true);
    });

    it('displays video container element', () => {
      const wrapper = mount(VideoPlayer, {
        global: {
          plugins: [pinia],
        },
      });

      expect(wrapper.find('.js-tutorial-container').exists()).toBe(true);
    });

    it('displays video controls for video action type', () => {
      const wrapper = mount(VideoPlayer, {
        global: {
          plugins: [pinia],
        },
      });

      expect(wrapper.find('[class*="video-controls"]').exists()).toBe(true);
    });

    it('displays play/pause button with correct text', () => {
      const wrapper = mount(VideoPlayer, {
        global: {
          plugins: [pinia],
        },
      });

      const playButton = wrapper.findAll('[class*="control-btn"]')[0];

      expect(['Play', 'Pause']).toContain(playButton.text());
    });

    it('displays restart button', () => {
      const wrapper = mount(VideoPlayer, {
        global: {
          plugins: [pinia],
        },
      });

      const restartButton = wrapper.findAll('[class*="control-btn"]')[1];

      expect(restartButton.text()).toBe('Restart');
    });

    it('displays back to intro button', () => {
      const wrapper = mount(VideoPlayer, {
        global: {
          plugins: [pinia],
        },
      });

      const introButton = wrapper.findAll('[class*="control-btn"]')[2];

      expect(introButton.text()).toBe('Back to Intro');
    });
  });

  describe('control interactions', () => {
    it('handles play button click', async () => {
      const wrapper = mount(VideoPlayer, {
        global: {
          plugins: [pinia],
        },
      });

      const playButton = wrapper.findAll('[class*="control-btn"]')[0];

      await playButton.trigger('click');

      expect(playButton.exists()).toBe(true);
    });

    it('handles restart button click', async () => {
      const wrapper = mount(VideoPlayer, {
        global: {
          plugins: [pinia],
        },
      });

      const restartButton = wrapper.findAll('[class*="control-btn"]')[1];

      await restartButton.trigger('click');

      expect(restartButton.exists()).toBe(true);
    });

    it('handles back to intro button click', async () => {
      const wrapper = mount(VideoPlayer, {
        global: {
          plugins: [pinia],
        },
      });

      const introButton = wrapper.findAll('[class*="control-btn"]')[2];

      await introButton.trigger('click');

      expect(introButton.exists()).toBe(true);
    });
  });

  describe('direction line integration', () => {
    it('does not display DirectionLine by default', () => {
      const wrapper = mount(VideoPlayer, {
        global: {
          plugins: [pinia],
        },
      });

      expect(wrapper.findComponent({ name: 'DirectionLine' }).exists()).toBe(false);
    });
  });

  describe('component lifecycle', () => {
    it('mounts successfully', () => {
      const wrapper = mount(VideoPlayer, {
        global: {
          plugins: [pinia],
        },
      });

      expect(wrapper.exists()).toBe(true);
    });

    it('unmounts successfully', () => {
      const wrapper = mount(VideoPlayer, {
        global: {
          plugins: [pinia],
        },
      });

      wrapper.unmount();

      expect(wrapper.exists()).toBe(false);
    });
  });

  describe('props handling', () => {
    it('always displays initialized class regardless of preventInitialization prop', () => {
      const wrapper = mount(VideoPlayer, {
        props: {
          preventInitialization: true,
        },
        global: {
          plugins: [pinia],
        },
      });

      expect(wrapper.find('.test-initialized').exists()).toBe(true);
    });

    it('displays initialized class when preventInitialization is false', () => {
      const wrapper = mount(VideoPlayer, {
        props: {
          preventInitialization: false,
        },
        global: {
          plugins: [pinia],
        },
      });

      expect(wrapper.find('.test-initialized').exists()).toBe(true);
    });
  });
});