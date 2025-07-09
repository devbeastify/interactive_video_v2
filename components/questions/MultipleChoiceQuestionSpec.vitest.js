// @ts-check

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import MultipleChoiceQuestion from './MultipleChoiceQuestion.vue';

describe('MultipleChoiceQuestion', () => {
  const mockQuestion = {
    id: 'mc-1',
    prompt: 'What is the capital of France?',
    choices: [
      { text: 'London' },
      { text: 'Berlin' },
      { text: 'Paris' },
      { text: 'Madrid' },
    ],
  };

  describe('rendering', () => {
    it('should render question prompt', () => {
      const wrapper = mount(MultipleChoiceQuestion, {
        props: { question: mockQuestion },
      });

      expect(wrapper.text()).toContain('What is the capital of France?');
    });

    it('should render all answer choices', () => {
      const wrapper = mount(MultipleChoiceQuestion, {
        props: { question: mockQuestion },
      });

      const choices = wrapper.findAll('label');
      expect(choices).toHaveLength(4);
      expect(choices[0].text()).toContain('London');
      expect(choices[1].text()).toContain('Berlin');
      expect(choices[2].text()).toContain('Paris');
      expect(choices[3].text()).toContain('Madrid');
    });

    it('should render radio inputs for each choice', () => {
      const wrapper = mount(MultipleChoiceQuestion, {
        props: { question: mockQuestion },
      });

      const radioInputs = wrapper.findAll('input[type="radio"]');
      expect(radioInputs).toHaveLength(4);
    });

    it('should have correct radio input attributes', () => {
      const wrapper = mount(MultipleChoiceQuestion, {
        props: { question: mockQuestion },
      });

      const radioInputs = wrapper.findAll('input[type="radio"]');

      expect(radioInputs[0].attributes('name')).toBe('question-mc-1');
      expect(radioInputs[0].attributes('value')).toBe('1');
      expect(radioInputs[1].attributes('value')).toBe('2');
      expect(radioInputs[2].attributes('value')).toBe('3');
      expect(radioInputs[3].attributes('value')).toBe('4');
    });
  });

  describe('choice selection', () => {
    it('should emit answer-selected event when first choice is selected', async () => {
      const wrapper = mount(MultipleChoiceQuestion, {
        props: { question: mockQuestion },
      });

      const firstRadio = wrapper.find('input[value="1"]');
      await firstRadio.trigger('change');

      const emitted = wrapper.emitted('answer-selected');
      expect(emitted).toBeTruthy();
      expect(emitted?.[0]).toEqual([
        {
          questionId: 'mc-1',
          choiceIndex: 1,
        },
      ]);
    });

    it('should emit answer-selected event when second choice is selected', async () => {
      const wrapper = mount(MultipleChoiceQuestion, {
        props: { question: mockQuestion },
      });

      const secondRadio = wrapper.find('input[value="2"]');
      await secondRadio.trigger('change');

      const emitted = wrapper.emitted('answer-selected');
      expect(emitted).toBeTruthy();
      expect(emitted?.[0]).toEqual([
        {
          questionId: 'mc-1',
          choiceIndex: 2,
        },
      ]);
    });

    it('should emit answer-selected event when third choice is selected', async () => {
      const wrapper = mount(MultipleChoiceQuestion, {
        props: { question: mockQuestion },
      });

      const thirdRadio = wrapper.find('input[value="3"]');
      await thirdRadio.trigger('change');

      const emitted = wrapper.emitted('answer-selected');
      expect(emitted).toBeTruthy();
      expect(emitted?.[0]).toEqual([
        {
          questionId: 'mc-1',
          choiceIndex: 3,
        },
      ]);
    });

    it('should emit answer-selected event when fourth choice is selected', async () => {
      const wrapper = mount(MultipleChoiceQuestion, {
        props: { question: mockQuestion },
      });

      const fourthRadio = wrapper.find('input[value="4"]');
      await fourthRadio.trigger('change');

      const emitted = wrapper.emitted('answer-selected');
      expect(emitted).toBeTruthy();
      expect(emitted?.[0]).toEqual([
        {
          questionId: 'mc-1',
          choiceIndex: 4,
        },
      ]);
    });
  });

  describe('different questions', () => {
    it('should work with different question data', () => {
      const differentQuestion = {
        id: 'mc-2',
        prompt: 'Which planet is closest to the sun?',
        choices: [
          { text: 'Mercury' },
          { text: 'Venus' },
          { text: 'Earth' },
        ],
      };

      const wrapper = mount(MultipleChoiceQuestion, {
        props: { question: differentQuestion },
      });

      expect(wrapper.text()).toContain('Which planet is closest to the sun?');

      const choices = wrapper.findAll('label');
      expect(choices).toHaveLength(3);
      expect(choices[0].text()).toContain('Mercury');
      expect(choices[1].text()).toContain('Venus');
      expect(choices[2].text()).toContain('Earth');
    });
  });
});
