// @ts-check

import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import BeginAction from './BeginAction.vue';
import { vi } from 'vitest';

/** @typedef {import('@vue/test-utils').VueWrapper} VueWrapper */

/**
 * @typedef {Object} BeginActionWrapperOptions
 * @property {any} [pinia] - Pinia instance
 * @property {Object} [props] - Component props
 */

/**
 * Creates a wrapper for BeginAction component
 * @param {BeginActionWrapperOptions} options - Options for creating the wrapper
 * @return {VueWrapper}
 */
function createBeginActionWrapper(options = {}) {
  const pinia = createPinia();
  setActivePinia(pinia);

  return mount(BeginAction, {
    props: {
      mediaState: 'loaded',
      startButtonClickHandler: vi.fn(),
      ...(options.props || {}),
    },
    global: {
      plugins: [options.pinia || pinia],
    },
    ...options,
  });
}

describe('BeginAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render correctly', () => {
      const wrapper = createBeginActionWrapper();

      expect(wrapper.exists()).toBe(true);
    });

    it('should display begin button', () => {
      const wrapper = createBeginActionWrapper();

      expect(wrapper.text()).toContain('Start');
    });
  });

  describe('user interactions', () => {
    it('should emit start event when clicked', async () => {
      const mockHandler = vi.fn();
      const wrapper = createBeginActionWrapper({
        props: {
          mediaState: 'loaded',
          startButtonClickHandler: mockHandler,
        },
      });

      const button = wrapper.find('button');
      await button.trigger('click');

      expect(mockHandler).toHaveBeenCalled();
    });
  });

  describe('component lifecycle', () => {
    it('should initialize correctly on mount', () => {
      const wrapper = createBeginActionWrapper();

      expect(wrapper.exists()).toBe(true);
    });

    it('should handle unmounting gracefully', () => {
      const wrapper = createBeginActionWrapper();

      wrapper.unmount();

      expect(wrapper.exists()).toBe(false);
    });
  });
});
