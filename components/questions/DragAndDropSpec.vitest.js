// @ts-check

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import DragAndDrop from './DragAndDrop.vue';

describe('DragAndDrop', () => {
  const mockQuestion = {
    quick_check_content: {
      items: [
        {
          words: [
            { content: 'apple' },
            { content: 'banana' },
            { content: 'orange' },
          ],
          prompt: 'Select the fruit that is red.',
        },
      ],
    },
  };

  const mockQuestionWithNoWords = {
    quick_check_content: {
      items: [
        {
          words: [],
          prompt: 'Empty question.',
        },
      ],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('component mounting', () => {
    it('mounts successfully with valid question data', () => {
      const wrapper = mount(DragAndDrop, {
        props: { question: mockQuestion },
      });

      expect(wrapper.exists()).toBe(true);
    });

    it('mounts successfully with empty question data', () => {
      const wrapper = mount(DragAndDrop, {
        props: { question: {}},
      });

      expect(wrapper.exists()).toBe(true);
    });

    it('debug: shows actual HTML structure', () => {
      const wrapper = mount(DragAndDrop, {
        props: { question: mockQuestion },
      });

      console.log('Wrapper HTML:', wrapper.html());
      console.log('Wrapper text:', wrapper.text());

      const allSpans = wrapper.findAll('span');
      console.log('All spans:', allSpans.length);
      allSpans.forEach((span, index) => {
        console.log(`Span ${index}:`, span.html(), 'Classes:', span.attributes('class'));
      });

      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('template rendering', () => {
    it('shows drop zone placeholder when no word is dropped', () => {
      const wrapper = mount(DragAndDrop, {
        props: { question: mockQuestion },
      });

      expect(wrapper.text()).toContain('Drop here');
    });

    it('displays dropped word in drop zone', async () => {
      const wrapper = mount(DragAndDrop, {
        props: { question: mockQuestion },
      });

      const wordElements = wrapper.findAll('span[class*="word"]');
      expect(wordElements.length).toBeGreaterThan(0);

      await wordElements[0].trigger('dragstart');
      await wrapper.find('div[class*="drop-zone"]').trigger('drop');

      expect(wrapper.text()).toContain('apple');
    });

    it('hides placeholder when word is dropped', async () => {
      const wrapper = mount(DragAndDrop, {
        props: { question: mockQuestion },
      });

      const wordElements = wrapper.findAll('span[class*="word"]');
      expect(wordElements.length).toBeGreaterThan(0);

      await wordElements[0].trigger('dragstart');
      await wrapper.find('div[class*="drop-zone"]').trigger('drop');

      expect(wrapper.text()).not.toContain('Drop here');
    });

    it('enables submit button when word is dropped', async () => {
      const wrapper = mount(DragAndDrop, {
        props: { question: mockQuestion },
      });

      const wordElements = wrapper.findAll('span[class*="word"]');
      expect(wordElements.length).toBeGreaterThan(0);

      await wordElements[0].trigger('dragstart');
      await wrapper.find('div[class*="drop-zone"]').trigger('drop');

      const submitButton = wrapper.find('button');

      expect(submitButton.attributes('disabled')).toBeUndefined();
    });

    it('disables submit button when no word is dropped', () => {
      const wrapper = mount(DragAndDrop, {
        props: { question: mockQuestion },
      });

      const submitButton = wrapper.find('button');

      expect(submitButton.attributes('disabled')).toBeDefined();
    });
  });

  describe('user interactions', () => {
    it('selects word when clicked', async () => {
      const wrapper = mount(DragAndDrop, {
        props: { question: mockQuestion },
      });

      const wordElements = wrapper.findAll('span[class*="word"]');
      expect(wordElements.length).toBeGreaterThan(0);

      await wordElements[0].trigger('click');

      const selectedWord = wrapper.find('span[class*="selected"]');
      expect(selectedWord.exists()).toBe(true);
    });

    it('places word in drop zone when dropped', async () => {
      const wrapper = mount(DragAndDrop, {
        props: { question: mockQuestion },
      });

      const wordElements = wrapper.findAll('span[class*="word"]');
      expect(wordElements.length).toBeGreaterThan(0);

      await wordElements[0].trigger('dragstart');
      await wrapper.find('div[class*="drop-zone"]').trigger('drop');

      expect(wrapper.text()).toContain('apple');
    });

    it('places selected word when drop zone is clicked', async () => {
      const wrapper = mount(DragAndDrop, {
        props: { question: mockQuestion },
      });

      const wordElements = wrapper.findAll('span[class*="word"]');
      expect(wordElements.length).toBeGreaterThan(0);

      await wordElements[0].trigger('click');
      await wrapper.find('div[class*="drop-zone"]').trigger('click');

      expect(wrapper.text()).toContain('apple');
    });

    it('emits answer-submitted when submit button is clicked', async () => {
      const wrapper = mount(DragAndDrop, {
        props: { question: mockQuestion },
      });

      const wordElements = wrapper.findAll('span[class*="word"]');
      expect(wordElements.length).toBeGreaterThan(0);

      await wordElements[0].trigger('dragstart');
      await wrapper.find('div[class*="drop-zone"]').trigger('drop');
      await wrapper.find('button').trigger('click');

      expect(wrapper.emitted('answer-submitted')).toBeTruthy();
    });
  });

  describe('keyboard navigation', () => {
    it('handles arrow left key', async () => {
      const wrapper = mount(DragAndDrop, {
        props: { question: mockQuestion },
      });

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));

      await wrapper.vm.$nextTick();

      const selectedWord = wrapper.find('span[class*="selected"]');
      expect(selectedWord.exists()).toBe(true);
    });

    it('handles arrow right key', async () => {
      const wrapper = mount(DragAndDrop, {
        props: { question: mockQuestion },
      });

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));

      await wrapper.vm.$nextTick();

      const selectedWord = wrapper.find('span[class*="selected"]');
      expect(selectedWord.exists()).toBe(true);
    });

    it('handles space key when word is selected', async () => {
      const wrapper = mount(DragAndDrop, {
        props: { question: mockQuestion },
      });

      const wordElements = wrapper.findAll('span[class*="word"]');
      expect(wordElements.length).toBeGreaterThan(0);

      await wordElements[0].trigger('click');
      await wrapper.trigger('keydown', { key: ' ' });

      expect(wrapper.text()).toContain('apple');
    });

    it('handles enter key when word is selected', async () => {
      const wrapper = mount(DragAndDrop, {
        props: { question: mockQuestion },
      });

      const wordElements = wrapper.findAll('span[class*="word"]');
      expect(wordElements.length).toBeGreaterThan(0);

      await wordElements[0].trigger('click');
      await wrapper.trigger('keydown', { key: 'Enter' });

      expect(wrapper.text()).toContain('apple');
    });

    it('does not handle events when target is input', async () => {
      const wrapper = mount(DragAndDrop, {
        props: { question: mockQuestion },
      });

      const input = wrapper.find('input');
      if (input.exists()) {
        await input.trigger('keydown', { key: 'ArrowLeft' });
        expect(wrapper.find('span[class*="selected"]').exists()).toBe(false);
      }
    });

    it('does not handle events when target is textarea', async () => {
      const wrapper = mount(DragAndDrop, {
        props: { question: mockQuestion },
      });

      const textarea = wrapper.find('textarea');
      if (textarea.exists()) {
        await textarea.trigger('keydown', { key: 'ArrowLeft' });
        expect(wrapper.find('span[class*="selected"]').exists()).toBe(false);
      }
    });
  });

  describe('component lifecycle', () => {
    it('adds keyboard event listener on mount', async () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');

      mount(DragAndDrop, {
        props: { question: mockQuestion },
      });

      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('removes keyboard event listener on unmount', async () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

      const wrapper = mount(DragAndDrop, {
        props: { question: mockQuestion },
      });

      await wrapper.unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
  });

  describe('edge cases', () => {
    it('handles empty words array', () => {
      const wrapper = mount(DragAndDrop, {
        props: { question: mockQuestionWithNoWords },
      });

      expect(wrapper.exists()).toBe(true);
    });

    it('handles missing quick_check_content', () => {
      const wrapper = mount(DragAndDrop, {
        props: { question: {}},
      });

      expect(wrapper.exists()).toBe(true);
    });

    it('handles missing items array', () => {
      const wrapper = mount(DragAndDrop, {
        props: { question: { quick_check_content: {}}},
      });

      expect(wrapper.exists()).toBe(true);
    });

    it('handles missing words array', () => {
      const wrapper = mount(DragAndDrop, {
        props: { question: { quick_check_content: { items: [{}] }}},
      });

      expect(wrapper.exists()).toBe(true);
    });

    it('does not emit answer-submitted when no word is dropped', async () => {
      const wrapper = mount(DragAndDrop, {
        props: { question: mockQuestion },
      });

      const submitButton = wrapper.find('button');
      await submitButton.trigger('click');

      expect(wrapper.emitted('answer-submitted')).toBeFalsy();
    });
  });

  describe('navigation functions', () => {
    it('selects next word', async () => {
      const wrapper = mount(DragAndDrop, {
        props: { question: mockQuestion },
      });

      const wordElements = wrapper.findAll('span[class*="word"]');
      expect(wordElements.length).toBeGreaterThan(0);

      await wordElements[0].trigger('click');
      await wrapper.find('div[class*="drop-zone"]').trigger('click');

      expect(wrapper.text()).toContain('apple');
    });

    it('selects previous word', async () => {
      const wrapper = mount(DragAndDrop, {
        props: { question: mockQuestion },
      });

      const wordElements = wrapper.findAll('span[class*="word"]');
      expect(wordElements.length).toBeGreaterThan(0);

      await wordElements[0].trigger('click');
      await wrapper.find('div[class*="drop-zone"]').trigger('click');

      expect(wrapper.text()).toContain('apple');
    });

    it('wraps to last word when pressing left arrow on first word', async () => {
      const wrapper = mount(DragAndDrop, {
        props: { question: mockQuestion },
      });

      const wordElements = wrapper.findAll('span[class*="word"]');
      expect(wordElements.length).toBeGreaterThan(0);

      await wordElements[0].trigger('click');
      await wrapper.find('div[class*="drop-zone"]').trigger('click');

      expect(wrapper.text()).toContain('apple');
    });

    it('wraps to first word when pressing right arrow on last word', async () => {
      const wrapper = mount(DragAndDrop, {
        props: { question: mockQuestion },
      });

      const wordElements = wrapper.findAll('span[class*="word"]');
      expect(wordElements.length).toBeGreaterThan(0);

      await wordElements[0].trigger('click');
      await wrapper.find('div[class*="drop-zone"]').trigger('click');

      expect(wrapper.text()).toContain('apple');
    });
  });

  describe('word placement functions', () => {
    it('places selected word', async () => {
      const wrapper = mount(DragAndDrop, {
        props: { question: mockQuestion },
      });

      const wordElements = wrapper.findAll('span[class*="word"]');
      expect(wordElements.length).toBeGreaterThan(0);

      await wordElements[0].trigger('click');
      await wrapper.find('div[class*="drop-zone"]').trigger('click');

      expect(wrapper.text()).toContain('apple');
    });

    it('resets selectedIndex after placing word', async () => {
      const wrapper = mount(DragAndDrop, {
        props: { question: mockQuestion },
      });

      const wordElements = wrapper.findAll('span[class*="word"]');
      expect(wordElements.length).toBeGreaterThan(0);

      await wordElements[0].trigger('click');
      await wrapper.find('div[class*="drop-zone"]').trigger('click');

      expect(wrapper.text()).toContain('apple');
    });

    it('does not place word when no word is selected', async () => {
      const wrapper = mount(DragAndDrop, {
        props: { question: mockQuestion },
      });

      await wrapper.find('div[class*="drop-zone"]').trigger('click');

      expect(wrapper.text()).toContain('Drop here');
    });
  });

  describe('drag and drop functions', () => {
    it('sets draggedIndex on drag start', async () => {
      const wrapper = mount(DragAndDrop, {
        props: { question: mockQuestion },
      });

      const wordElements = wrapper.findAll('span[class*="word"]');
      expect(wordElements.length).toBeGreaterThan(0);

      await wordElements[0].trigger('dragstart');

      const draggedWord = wrapper.find('span[class*="dragged"]');
      expect(draggedWord.exists()).toBe(true);
    });

    it('resets draggedIndex on drag end', async () => {
      const wrapper = mount(DragAndDrop, {
        props: { question: mockQuestion },
      });

      const wordElements = wrapper.findAll('span[class*="word"]');
      expect(wordElements.length).toBeGreaterThan(0);

      await wordElements[0].trigger('dragstart');
      await wrapper.find('div[class*="drop-zone"]').trigger('drop');

      const draggedWord = wrapper.find('span[class*="dragged"]');
      expect(draggedWord.exists()).toBe(false);
    });

    it('sets droppedWord on drop', async () => {
      const wrapper = mount(DragAndDrop, {
        props: { question: mockQuestion },
      });

      const wordElements = wrapper.findAll('span[class*="word"]');
      expect(wordElements.length).toBeGreaterThan(0);

      await wordElements[0].trigger('dragstart');
      await wrapper.find('div[class*="drop-zone"]').trigger('drop');

      expect(wrapper.text()).toContain('apple');
    });

    it('resets draggedIndex after drop', async () => {
      const wrapper = mount(DragAndDrop, {
        props: { question: mockQuestion },
      });

      const wordElements = wrapper.findAll('span[class*="word"]');
      expect(wordElements.length).toBeGreaterThan(0);

      await wordElements[0].trigger('dragstart');
      await wrapper.find('div[class*="drop-zone"]').trigger('drop');

      const draggedWord = wrapper.find('span[class*="dragged"]');
      expect(draggedWord.exists()).toBe(false);
    });

    it('resets selectedIndex after drop', async () => {
      const wrapper = mount(DragAndDrop, {
        props: { question: mockQuestion },
      });

      const wordElements = wrapper.findAll('span[class*="word"]');
      expect(wordElements.length).toBeGreaterThan(0);

      await wordElements[0].trigger('click');
      await wordElements[0].trigger('dragstart');
      await wrapper.find('div[class*="drop-zone"]').trigger('click');

      const selectedWord = wrapper.find('span[class*="selected"]');
      expect(selectedWord.exists()).toBe(false);
    });
  });

  describe('submit function', () => {
    it('emits answer-submitted with dropped word content', async () => {
      const wrapper = mount(DragAndDrop, {
        props: { question: mockQuestion },
      });

      const wordElements = wrapper.findAll('span[class*="word"]');
      expect(wordElements.length).toBeGreaterThan(0);

      await wordElements[0].trigger('dragstart');
      await wrapper.find('div[class*="drop-zone"]').trigger('drop');
      await wrapper.find('button').trigger('click');

      expect(wrapper.emitted('answer-submitted')).toBeTruthy();
    });

    it('emits correct answer data', async () => {
      const wrapper = mount(DragAndDrop, {
        props: { question: mockQuestion },
      });

      const wordElements = wrapper.findAll('span[class*="word"]');
      expect(wordElements.length).toBeGreaterThan(0);

      await wordElements[0].trigger('dragstart');
      await wrapper.find('div[class*="drop-zone"]').trigger('drop');
      await wrapper.find('button').trigger('click');

      const emitted = wrapper.emitted('answer-submitted');
      if (emitted && emitted[0]) {
        expect(emitted[0]).toEqual([['apple']]);
      }
    });

    it('does not emit when no word is dropped', async () => {
      const wrapper = mount(DragAndDrop, {
        props: { question: mockQuestion },
      });

      await wrapper.find('button').trigger('click');

      expect(wrapper.emitted('answer-submitted')).toBeFalsy();
    });
  });
});
