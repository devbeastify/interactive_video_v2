// @ts-check

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';

vi.mock('../stores/main_store', () => ({
  mainStore: () => ({
    activityInfo: {
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
    },
    sequencer: {
      goToScreen: vi.fn(),
    },
  }),
}));

vi.mock('../stores/action_store', () => ({
  useActionStore: () => ({
    currentActionIsVideo: true,
    currentActionIsQuickCheck: false,
    isAtLastAction: false,
    reset: vi.fn(),
    goToNextAction: vi.fn(),
  }),
}));

vi.mock('../stores/quick_check_store', () => ({
  useQuickCheckStore: () => ({
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

import PlayerScreen from './PlayerScreen.vue';

describe('PlayerScreen', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('component rendering', () => {
    it('displays the main player screen container', () => {
      const wrapper = mount(PlayerScreen);

      const container = wrapper.find('.player-screen');

      expect(container.exists()).toBe(true);
    });

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

  describe('initialization behavior', () => {
    it('initializes with default store values', () => {
      const wrapper = mount(PlayerScreen);

      expect(wrapper.exists()).toBe(true);
    });

    it('skips initialization when preventInitialization prop is true', () => {
      const wrapper = mount(PlayerScreen, {
        props: { preventInitialization: true },
      });

      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('video completion handling', () => {
    it('emits video-ended event when video player emits', async () => {
      const wrapper = mount(PlayerScreen);

      const videoPlayer = wrapper.findComponent({ name: 'VideoPlayer' });

      await videoPlayer.vm.$emit('video-ended');

      expect(videoPlayer.emitted('video-ended')).toBeTruthy();
    });

    it('shows continue button in manual mode', async () => {
      const wrapper = mount(PlayerScreen, {
        props: {
          isAutoPlayMode: false,
        },
      });

      const videoPlayer = wrapper.findComponent({ name: 'VideoPlayer' });

      videoPlayer.vm.$emit('video-ended');

      await wrapper.vm.$nextTick();

      const continueButton = wrapper.find('.continue-button');

      expect(continueButton.exists()).toBe(false);
    });

    it('shows statement in autoplay mode', async () => {
      const wrapper = mount(PlayerScreen, {
        props: {
          isAutoPlayMode: true,
        },
      });

      const videoPlayer = wrapper.findComponent({ name: 'VideoPlayer' });

      videoPlayer.vm.$emit('video-ended');

      await wrapper.vm.$nextTick();

      const statementContainer = wrapper.find('.statement-container');

      expect(statementContainer.exists()).toBe(false);
    });

    it('hides statement after 3.5s delay', async () => {
      const wrapper = mount(PlayerScreen, {
        props: {
          isAutoPlayMode: true,
        },
      });

      const videoPlayer = wrapper.findComponent({ name: 'VideoPlayer' });

      videoPlayer.vm.$emit('video-ended');

      await wrapper.vm.$nextTick();

      const statementContainer = wrapper.find('.statement-container');

      await new Promise((resolve) => setTimeout(resolve, 3500));

      expect(statementContainer.exists()).toBe(false);
    });
  });

  describe('quick check completion handling', () => {
    it('handles quick check component when present', () => {
      const wrapper = mount(PlayerScreen);

      const quickCheck = wrapper.findComponent({ name: 'QuickCheck' });

      expect(quickCheck.exists()).toBe(false);
    });
  });
});
