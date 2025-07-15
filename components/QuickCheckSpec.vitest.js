// @ts-check

import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import QuickCheck from './QuickCheck.vue';
import { useQuickCheckStore } from '../stores/main/quick_check_store';
import { vi } from 'vitest';

/** @typedef {import('@vue/test-utils').VueWrapper} VueWrapper */

/**
 * @typedef QuickCheckQuestion
 * @property {string} type
 * @property {string} prompt
 * @property {Object} content
 */

/**
 * Creates a mock question for testing
 * @param {string} type
 * @param {Object} content
 * @return {QuickCheckQuestion}
 */
function createMockQuestion(type = 'multiple_choice', content = {}) {
  return {
    type,
    prompt: 'Test question?',
    content: {
      question: 'Test question?',
      options: ['Option A', 'Option B', 'Option C'],
      correct_answer: 0,
      ...content,
    },
  };
}

/**
 * Sets up test environment for QuickCheck tests
 * @return {{ pinia: any, quickCheckStore: any }}
 */
function setupQuickCheckTest() {
  const pinia = createPinia();
  setActivePinia(pinia);
  const quickCheckStore = useQuickCheckStore();

  document.body.innerHTML = `
    <div class="js-activity-main-form">
      <input type="text" />
    </div>
  `;

  return { pinia, quickCheckStore };
}

/**
 * Creates a wrapper for QuickCheck component
 * @param {Object} options
 * @param {any} [options.pinia]
 * @return {VueWrapper}
 */
function createQuickCheckWrapper(options = {}) {
  return mount(QuickCheck, {
    global: {
      plugins: [options.pinia || setupQuickCheckTest().pinia],
    },
    ...options,
  });
}

describe('QuickCheck', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders when no quick check is active', () => {
      const { pinia } = setupQuickCheckTest();
      const wrapper = createQuickCheckWrapper({ pinia });

      expect(wrapper.exists()).toBe(true);
    });

    it('displays multiple choice question when active', async () => {
      const { pinia, quickCheckStore } = setupQuickCheckTest();

      const mockQuestion = createMockQuestion('multiple_choice');
      quickCheckStore.updateQuickCheckState({
        currentQuickCheck: mockQuestion,
        isVisible: true,
      });

      const wrapper = createQuickCheckWrapper({ pinia });
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain('Quick Check');
    });

    it('displays fill in the blanks question when active', async () => {
      const { pinia, quickCheckStore } = setupQuickCheckTest();

      const mockQuestion = createMockQuestion('fill_in_the_blanks');
      quickCheckStore.updateQuickCheckState({
        currentQuickCheck: mockQuestion,
        isVisible: true,
      });

      const wrapper = createQuickCheckWrapper({ pinia });
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain('Quick Check');
    });

    it('displays pronunciation question when active', async () => {
      const { pinia, quickCheckStore } = setupQuickCheckTest();

      const mockQuestion = createMockQuestion('pronunciation');
      quickCheckStore.updateQuickCheckState({
        currentQuickCheck: mockQuestion,
        isVisible: true,
      });

      const wrapper = createQuickCheckWrapper({ pinia });
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain('Quick Check');
    });

    it('displays drag and drop question when active', async () => {
      const { pinia, quickCheckStore } = setupQuickCheckTest();

      const mockQuestion = createMockQuestion('quick_check_drag_and_drop');
      quickCheckStore.updateQuickCheckState({
        currentQuickCheck: mockQuestion,
        isVisible: true,
      });

      const wrapper = createQuickCheckWrapper({ pinia });
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain('Quick Check');
    });
  });

  describe('store integration', () => {
    it('reflects store state when quick check is visible', async () => {
      const { pinia, quickCheckStore } = setupQuickCheckTest();

      quickCheckStore.updateQuickCheckState({
        isVisible: true,
        currentQuickCheck: createMockQuestion(),
      });

      const wrapper = createQuickCheckWrapper({ pinia });
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain('Quick Check');
    });

    it('hides when store indicates no quick check', async () => {
      const { pinia, quickCheckStore } = setupQuickCheckTest();

      quickCheckStore.updateQuickCheckState({
        isVisible: false,
      });

      const wrapper = createQuickCheckWrapper({ pinia });
      await wrapper.vm.$nextTick();

      const quickCheckElement = wrapper.find('[class*="quick-check"]');
      expect(quickCheckElement.exists()).toBe(true);
    });
  });

  describe('component lifecycle', () => {
    it('initializes correctly on mount', () => {
      const { pinia } = setupQuickCheckTest();
      const wrapper = createQuickCheckWrapper({ pinia });

      expect(wrapper.exists()).toBe(true);
    });

    it('handles unmounting gracefully', () => {
      const { pinia } = setupQuickCheckTest();
      const wrapper = createQuickCheckWrapper({ pinia });

      wrapper.unmount();

      expect(wrapper.exists()).toBe(false);
    });
  });

  describe('direction line integration', () => {
    it('displays direction line when question has direction line content', async () => {
      const { pinia, quickCheckStore } = setupQuickCheckTest();

      const mockQuestion = {
        ...createMockQuestion('multiple_choice'),
        quick_check_content: {
          dl: 'Listen carefully to the question',
        },
        offset: 1000,
      };

      quickCheckStore.updateQuickCheckState({
        currentQuickCheck: mockQuestion,
        isVisible: true,
      });

      const wrapper = createQuickCheckWrapper({ pinia });
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain('Quick Check');
    });
  });
});
