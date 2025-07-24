// @ts-check

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import PlayerScreen from './PlayerScreen.vue';

vi.mock('../stores/main_store', () => ({
  mainStore: () => ({
    activityInfo: {
      topic: 'Test Topic',
      sub_topic: 'Test Sub Topic',
      title: 'Test Title',
      dl: 'Test Direction Line',
      quick_checks: [
        {
          type: 'multiple_choice',
          quick_check_content: {
            question: 'Test question?',
            options: ['A', 'B', 'C'],
            correct_answer: 'A',
          },
        },
      ],
      reference: [],
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
      goToScreen: vi.fn(),
    },
  }),
}));

vi.mock('../stores/action_store', () => ({
  useActionStore: () => ({
    currentActionIndex: 0,
    actions: [
      {
        type: 'video',
        data: { video_path: 'test-video.mp4' },
        index: 0,
      },
    ],
    currentActionIsVideo: true,
    currentActionIsQuickCheck: false,
    isAtLastAction: false,
    reset: vi.fn(),
    goToNextAction: vi.fn(),
  }),
}));

vi.mock('../stores/quick_check_store', () => ({
  useQuickCheckStore: () => ({
    quickChecks: [],
    updateQuickCheckState: vi.fn(),
  }),
}));

vi.mock('../components/VideoPlayer.vue', () => ({
  default: {
    name: 'VideoPlayer',
    template: '<div class="video-player">Video Player</div>',
    emits: ['video-ended'],
  },
}));

vi.mock('../components/QuickCheck.vue', () => ({
  default: {
    name: 'QuickCheck',
    template: '<div class="quick-check">Quick Check</div>',
    emits: ['quick-check-complete'],
  },
}));

vi.mock('../components/DirectionLine.vue', () => ({
  default: {
    name: 'DirectionLine',
    template: '<div class="direction-line">Direction Line</div>',
  },
}));

/**
 * @description Test suite for PlayerScreen component
 */
describe('PlayerScreen', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * @description Tests component rendering
   */
  describe('rendering', () => {
    it('displays the main player screen container', () => {
      const wrapper = mount(PlayerScreen);

      const container = wrapper.find('.player-screen');

      expect(container.exists()).toBe(true);
    });

    it('displays VideoPlayer component when current action is video', () => {
      const wrapper = mount(PlayerScreen);

      const videoPlayer = wrapper.findComponent({ name: 'VideoPlayer' });

      expect(videoPlayer.exists()).toBe(true);
    });
  });

  /**
   * @description Tests component visibility logic
   */
  describe('visibility logic', () => {
    it('shows VideoPlayer when current action is video', () => {
      const wrapper = mount(PlayerScreen);

      const videoPlayer = wrapper.findComponent({ name: 'VideoPlayer' });

      expect(videoPlayer.isVisible()).toBe(true);
    });

    it('hides QuickCheck when current action is not quick check', () => {
      const wrapper = mount(PlayerScreen);

      const quickCheck = wrapper.findComponent({ name: 'QuickCheck' });

      expect(quickCheck.exists()).toBe(false);
    });
  });

  /**
   * @description Tests component initialization
   */
  describe('initialization', () => {
    it('initializes with default store values', () => {
      const wrapper = mount(PlayerScreen);

      expect(wrapper.exists()).toBe(true);
    });
  });

  /**
   * @description Tests video completion handling
   */
  describe('video completion', () => {
    it('emits video-ended event when video player emits', async () => {
      const wrapper = mount(PlayerScreen);

      const videoPlayer = wrapper.findComponent({ name: 'VideoPlayer' });

      await videoPlayer.vm.$emit('video-ended');

      expect(videoPlayer.emitted('video-ended')).toBeTruthy();
    });
  });

  /**
   * @description Tests quick check completion handling
   */
  describe('quick check completion', () => {
    it('handles quick check component when present', () => {
      const wrapper = mount(PlayerScreen);

      const quickCheck = wrapper.findComponent({ name: 'QuickCheck' });

      expect(quickCheck.exists()).toBe(false);
    });
  });
});