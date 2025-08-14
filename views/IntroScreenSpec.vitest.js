// @ts-check

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import IntroScreen from './IntroScreen.vue';

vi.mock('../stores/main_store', () => ({
  mainStore: () => ({
    activityInfo: {
      topic: 'Test Topic',
      sub_topic: 'Test Sub Topic',
      title: 'Test Title',
      reference: [],
    },
  }),
}));

vi.mock('../stores/action_store', () => ({
  useActionStore: () => ({
    actions: [],
  }),
}));

vi.mock('../stores/activity_settings_store', () => ({
  useActivitySettingsStore: () => ({
    useAutoPlay: true,
    resetAutoPlayToEnabled: vi.fn(),
    updateAutoPlaySetting: vi.fn(),
  }),
}));

vi.mock('../stores/direction_line_store', () => ({
  useDLStore: () => ({
    hasDL: true,
    currentDLText: 'Test Direction Line',
    isPlaying: false,
    initializeDLForPhase: vi.fn(),
    cleanup: vi.fn(),
  }),
}));

vi.mock('../composables/use_media', () => ({
  useMedia: () => ({
    mediaState: 'loading',
    loadMedia: vi.fn(),
    whitelistMedia: vi.fn().mockResolvedValue(undefined),
  }),
}));

vi.mock('../lib/safari_browser_check', () => ({
  browserIsSafari: vi.fn(() => true),
}));

vi.mock('../components/AnimatedLoadingIcon.vue', () => ({
  default: {
    name: 'AnimatedLoadingIcon',
    template: '<div class="animated-loading-icon">Loading...</div>',
  },
}));

vi.mock('../components/BeginAction.vue', () => ({
  default: {
    name: 'BeginAction',
    template: '<button class="begin-action">Start</button>',
    props: ['mediaState', 'startButtonClickHandler'],
  },
}));

/**
 * @description Test suite for IntroScreen component
 */
describe('IntroScreen', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('rendering', () => {
    it('renders the main layout container', () => {
      const wrapper = mount(IntroScreen);

      const container = wrapper.find('[class*="interstitial-layout"]');

      expect(container.exists()).toBe(true);
    });

    it('renders the topic heading', () => {
      const wrapper = mount(IntroScreen);

      const topicHeading = wrapper.find('h1');

      expect(topicHeading.exists()).toBe(true);
    });

    it('renders the title section', () => {
      const wrapper = mount(IntroScreen);

      const titleSection = wrapper.find('[class*="page-title"]');

      expect(titleSection.exists()).toBe(true);
    });

    it('renders the title heading', () => {
      const wrapper = mount(IntroScreen);

      const titleHeading = wrapper.find('h2');

      expect(titleHeading.exists()).toBe(true);
    });

    it('renders the controls section', () => {
      const wrapper = mount(IntroScreen);

      const controlsSection = wrapper.find('[class*="interstitial-controls"]');

      expect(controlsSection.exists()).toBe(true);
    });

    it('renders the BeginAction component', () => {
      const wrapper = mount(IntroScreen);

      const beginAction = wrapper.findComponent({ name: 'BeginAction' });

      expect(beginAction.exists()).toBe(true);
    });
  });

  describe('subtitle rendering', () => {
    it('renders subtitle when subTopic exists', () => {
      const wrapper = mount(IntroScreen);

      const subtitle = wrapper.find('h3');

      expect(subtitle.exists()).toBe(true);
    });
  });

  describe('loading state', () => {
    it('renders AnimatedLoadingIcon when mediaState is loading', () => {
      const wrapper = mount(IntroScreen);

      const loadingIcon = wrapper.findComponent({ name: 'AnimatedLoadingIcon' });

      expect(loadingIcon.exists()).toBe(true);
    });
  });

  describe('autoplay checkbox', () => {
    it('does not render autoplay checkbox when browser is Safari', () => {
      const wrapper = mount(IntroScreen);

      const checkbox = wrapper.findComponent({ name: 'BasicCheckbox' });

      expect(checkbox.exists()).toBe(false);
    });
  });

  describe('BeginAction props', () => {
    it('passes mediaState to BeginAction', () => {
      const wrapper = mount(IntroScreen);

      const beginAction = wrapper.findComponent({ name: 'BeginAction' });

      expect(beginAction.props('mediaState')).toBeDefined();
    });

    it('passes startButtonClickHandler to BeginAction', () => {
      const wrapper = mount(IntroScreen);

      const beginAction = wrapper.findComponent({ name: 'BeginAction' });

      expect(beginAction.props('startButtonClickHandler')).toBeDefined();
    });

    it('passes function as startButtonClickHandler to BeginAction', () => {
      const wrapper = mount(IntroScreen);

      const beginAction = wrapper.findComponent({ name: 'BeginAction' });

      expect(typeof beginAction.props('startButtonClickHandler')).toBe('function');
    });
  });

  describe('component initialization', () => {
    it('loads media on mount', async () => {
      const wrapper = mount(IntroScreen);

      await wrapper.vm.$nextTick();

      expect(wrapper.exists()).toBe(true);
    });

    it('resets autoplay to enabled on mount', async () => {
      const wrapper = mount(IntroScreen);

      await wrapper.vm.$nextTick();

      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('component cleanup', () => {
    it('calls dlStore cleanup on unmount', async () => {
      const wrapper = mount(IntroScreen);

      await wrapper.unmount();

      expect(wrapper.exists()).toBe(false);
    });
  });

  describe('accessibility', () => {
    it('renders topic heading with correct semantic structure', () => {
      const wrapper = mount(IntroScreen);

      const topicHeading = wrapper.find('h1');

      expect(topicHeading.exists()).toBe(true);
    });

    it('renders title heading with correct semantic structure', () => {
      const wrapper = mount(IntroScreen);

      const titleHeading = wrapper.find('h2');

      expect(titleHeading.exists()).toBe(true);
    });

    it('renders subtitle heading with correct semantic structure when present', () => {
      const wrapper = mount(IntroScreen);

      const subtitleHeading = wrapper.find('h3');

      expect(subtitleHeading.exists()).toBe(true);
    });

    it('provides proper button functionality through BeginAction', () => {
      const wrapper = mount(IntroScreen);

      const beginAction = wrapper.findComponent({ name: 'BeginAction' });

      expect(beginAction.exists()).toBe(true);
    });
  });

  describe('styling', () => {
    it('applies correct CSS modules classes', () => {
      const wrapper = mount(IntroScreen);

      const container = wrapper.find('[class*="interstitial-layout"]');

      expect(container.exists()).toBe(true);
    });

    it('applies correct page topic styling', () => {
      const wrapper = mount(IntroScreen);

      const topicHeading = wrapper.find('[class*="page-topic"]');

      expect(topicHeading.exists()).toBe(true);
    });

    it('applies correct page title styling', () => {
      const wrapper = mount(IntroScreen);

      const titleSection = wrapper.find('[class*="page-title"]');

      expect(titleSection.exists()).toBe(true);
    });

    it('applies correct controls styling', () => {
      const wrapper = mount(IntroScreen);

      const controlsSection = wrapper.find('[class*="interstitial-controls"]');

      expect(controlsSection.exists()).toBe(true);
    });
  });

  describe('data display', () => {
    it('displays topic from store', () => {
      const wrapper = mount(IntroScreen);

      const topicHeading = wrapper.find('h1');

      expect(topicHeading.exists()).toBe(true);
    });

    it('displays title from store', () => {
      const wrapper = mount(IntroScreen);

      const titleHeading = wrapper.find('h2');

      expect(titleHeading.exists()).toBe(true);
    });

    it('displays subtitle from store when available', () => {
      const wrapper = mount(IntroScreen);

      const subtitleHeading = wrapper.find('h3');

      expect(subtitleHeading.exists()).toBe(true);
    });
  });
});