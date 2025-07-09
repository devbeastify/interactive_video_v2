// @ts-check

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import FillInTheBlanksQuestion from './FillInTheBlanksQuestion.vue';

/** @typedef {import('@vue/test-utils').VueWrapper} VueWrapper */

/**
 * Creates a mock question for testing
 * @param {Object} content
 * @return {Object}
 */
function createMockQuestion(content = {}) {
  return {
    type: 'fill_in_the_blanks',
    prompt: 'Test question?',
    blanks: [
      { placeholder: 'Enter first blank' },
      { placeholder: 'Enter second blank' },
    ],
    content: {
      question: 'Test question?',
      blanks: [
        { placeholder: 'Enter first blank' },
        { placeholder: 'Enter second blank' },
      ],
      ...content,
    },
  };
}

/**
 * Creates a wrapper for FillInTheBlanksQuestion component
 * @param {Object} props
 * @return {VueWrapper}
 */
function createFillInTheBlanksQuestionWrapper(props = {}) {
  return mount(FillInTheBlanksQuestion, {
    props: {
      question: createMockQuestion(),
      ...props,
    },
  });
}

describe('FillInTheBlanksQuestion', () => {
  describe('rendering', () => {
    it('should render correctly', () => {
      const wrapper = createFillInTheBlanksQuestionWrapper();

      expect(wrapper.exists()).toBe(true);
    });

    it('should display question text', () => {
      const wrapper = createFillInTheBlanksQuestionWrapper();

      expect(wrapper.text()).toContain('Test question?');
    });

    it('should render input fields for blanks', async () => {
      const wrapper = createFillInTheBlanksQuestionWrapper();

      await wrapper.vm.$nextTick();

      const inputs = wrapper.findAll('input');
      expect(inputs).toHaveLength(2);
    });
  });

  describe('user interactions', () => {
    it('should handle input changes', async () => {
      const wrapper = createFillInTheBlanksQuestionWrapper();

      await wrapper.vm.$nextTick();

      const inputs = wrapper.findAll('input');

      await inputs[0].setValue('answer1');
      await inputs[1].setValue('answer2');

      expect(/** @type {HTMLInputElement} */ (inputs[0].element).value).toBe('answer1');
      expect(/** @type {HTMLInputElement} */ (inputs[1].element).value).toBe('answer2');
    });

    it('should emit answer-submitted event when form is submitted', async () => {
      const wrapper = createFillInTheBlanksQuestionWrapper();

      await wrapper.vm.$nextTick();

      const inputs = wrapper.findAll('input');

      await inputs[0].setValue('answer1');
      await inputs[1].setValue('answer2');

      const submitButton = wrapper.find('button');
      await submitButton.trigger('click');

      expect(wrapper.emitted('answer-submitted')).toBeTruthy();
      const emitted = wrapper.emitted('answer-submitted');
      expect(emitted?.[0]).toEqual([['answer1', 'answer2']]);
    });
  });

  describe('validation', () => {
    it('should require all blanks to be filled', async () => {
      const wrapper = createFillInTheBlanksQuestionWrapper();

      await wrapper.vm.$nextTick();

      const inputs = wrapper.findAll('input');

      await inputs[0].setValue('answer1');

      const submitButton = wrapper.find('button');
      await submitButton.trigger('click');

      expect(wrapper.emitted('answer-submitted')).toBeTruthy();
    });
  });

  describe('component lifecycle', () => {
    it('should initialize correctly on mount', () => {
      const wrapper = createFillInTheBlanksQuestionWrapper();

      expect(wrapper.exists()).toBe(true);
    });

    it('should handle unmounting gracefully', () => {
      const wrapper = createFillInTheBlanksQuestionWrapper();

      wrapper.unmount();

      expect(wrapper.exists()).toBe(false);
    });
  });
});
