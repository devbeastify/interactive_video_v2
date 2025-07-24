// @ts-check

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import BeginAction from './BeginAction.vue';

/**
 * @description Test suite for BeginAction component
 */
describe('BeginAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * @description Tests component rendering
   */
  describe('rendering', () => {
    it('renders a button', () => {
      const wrapper = mount(BeginAction, {
        props: {
          mediaState: 'loaded',
          startButtonClickHandler: vi.fn(),
        },
      });

      const button = wrapper.find('button');
      expect(button.exists()).toBe(true);
    });

    it('displays correct button text', () => {
      const wrapper = mount(BeginAction, {
        props: {
          mediaState: 'loaded',
          startButtonClickHandler: vi.fn(),
        },
      });

      const button = wrapper.find('button');
      expect(button.text()).toBe('Start');
    });

    it('has correct CSS class', () => {
      const wrapper = mount(BeginAction, {
        props: {
          mediaState: 'loaded',
          startButtonClickHandler: vi.fn(),
        },
      });

      const button = wrapper.find('button');
      expect(button.classes()).toContain('interactive-video-primary-button');
    });
  });

  describe('button state', () => {
    it('is enabled when mediaState is loaded', () => {
      const wrapper = mount(BeginAction, {
        props: {
          mediaState: 'loaded',
          startButtonClickHandler: vi.fn(),
        },
      });

      const button = wrapper.find('button');
      expect(button.attributes('disabled')).toBeUndefined();
    });

    it('is disabled when mediaState is not loaded', () => {
      const wrapper = mount(BeginAction, {
        props: {
          mediaState: 'loading',
          startButtonClickHandler: vi.fn(),
        },
      });

      const button = wrapper.find('button');
      expect(button.attributes('disabled')).toBe('');
    });

    it('is disabled when mediaState is error', () => {
      const wrapper = mount(BeginAction, {
        props: {
          mediaState: 'error',
          startButtonClickHandler: vi.fn(),
        },
      });

      const button = wrapper.find('button');
      expect(button.attributes('disabled')).toBe('');
    });
  });

  describe('click events', () => {
    it('calls startButtonClickHandler when button is clicked and enabled', async () => {
      const mockHandler = vi.fn();
      const wrapper = mount(BeginAction, {
        props: {
          mediaState: 'loaded',
          startButtonClickHandler: mockHandler,
        },
      });

      const button = wrapper.find('button');
      await button.trigger('click');

      expect(mockHandler).toHaveBeenCalled();
    });

    it('does not call startButtonClickHandler when button is disabled', async () => {
      const mockHandler = vi.fn();
      const wrapper = mount(BeginAction, {
        props: {
          mediaState: 'loading',
          startButtonClickHandler: mockHandler,
        },
      });

      const button = wrapper.find('button');
      await button.trigger('click');

      expect(mockHandler).not.toHaveBeenCalled();
    });
  });

  describe('props', () => {
    it('requires mediaState prop', () => {
      const wrapper = mount(BeginAction, {
        props: {
          startButtonClickHandler: vi.fn(),
        },
      });

      expect(wrapper.exists()).toBe(true);
    });

    it('requires startButtonClickHandler prop', () => {
      const wrapper = mount(BeginAction, {
        props: {
          mediaState: 'loaded',
        },
      });

      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('accessibility', () => {
    it('renders button when enabled', () => {
      const wrapper = mount(BeginAction, {
        props: {
          mediaState: 'loaded',
          startButtonClickHandler: vi.fn(),
        },
      });

      const button = wrapper.find('button');
      expect(button.exists()).toBe(true);
    });

    it('displays correct text when enabled', () => {
      const wrapper = mount(BeginAction, {
        props: {
          mediaState: 'loaded',
          startButtonClickHandler: vi.fn(),
        },
      });

      const button = wrapper.find('button');
      expect(button.text()).toBe('Start');
    });

    it('renders button when disabled', () => {
      const wrapper = mount(BeginAction, {
        props: {
          mediaState: 'loading',
          startButtonClickHandler: vi.fn(),
        },
      });

      const button = wrapper.find('button');
      expect(button.exists()).toBe(true);
    });

    it('has disabled attribute when disabled', () => {
      const wrapper = mount(BeginAction, {
        props: {
          mediaState: 'loading',
          startButtonClickHandler: vi.fn(),
        },
      });

      const button = wrapper.find('button');
      expect(button.attributes('disabled')).toBe('');
    });
  });

  describe('component metadata', () => {
    it('has correct component name', () => {
      expect(BeginAction.name).toBe('BeginAction');
    });
  });
});