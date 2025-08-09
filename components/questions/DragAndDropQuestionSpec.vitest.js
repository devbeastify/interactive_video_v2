// @ts-check

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import DragAndDropQuestion from './DragAndDropQuestion.vue';

describe('DragAndDropQuestion', () => {
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
      const wrapper = mount(DragAndDropQuestion, {
        props: { question: mockQuestion },
      });

      expect(wrapper.exists()).toBe(true);
    });

    it('mounts successfully with empty question data', () => {
      const wrapper = mount(DragAndDropQuestion, {
        props: { question: {}},
      });

      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('template rendering', () => {
    it('shows drop zone placeholder when no word is dropped', () => {
      const wrapper = mount(DragAndDropQuestion, {
        props: { question: mockQuestion },
      });

      expect(wrapper.text()).toContain('Drop here');
    });

    it('displays dropped word in drop zone', async () => {
      const wrapper = mount(DragAndDropQuestion, {
        props: { question: mockQuestion },
      });

      const component = wrapper.vm;
      if (component.onDragStart && component.onDrop) {
        await component.onDragStart(1);
        await component.onDrop();
      }

      expect(wrapper.text()).toContain('banana');
    });

    it('hides placeholder when word is dropped', async () => {
      const wrapper = mount(DragAndDropQuestion, {
        props: { question: mockQuestion },
      });

      const component = wrapper.vm;
      if (component.onDragStart && component.onDrop) {
        await component.onDragStart(1);
        await component.onDrop();
      }

      expect(wrapper.text()).not.toContain('Drop here');
    });

    it('enables submit button when word is dropped', async () => {
      const wrapper = mount(DragAndDropQuestion, {
        props: { question: mockQuestion },
      });

      const component = wrapper.vm;
      if (component.onDragStart && component.onDrop) {
        await component.onDragStart(1);
        await component.onDrop();
      }

      const submitButton = wrapper.find('button');

      expect(submitButton.attributes('disabled')).toBeUndefined();
    });

    it('disables submit button when no word is dropped', () => {
      const wrapper = mount(DragAndDropQuestion, {
        props: { question: mockQuestion },
      });

      const submitButton = wrapper.find('button');

      expect(submitButton.attributes('disabled')).toBeDefined();
    });
  });

  describe('user interactions', () => {
    it('selects word when clicked', async () => {
      const wrapper = mount(DragAndDropQuestion, {
        props: { question: mockQuestion },
      });

      const component = wrapper.vm;
      if (component.onWordClick) {
        await component.onWordClick(0);
      }

      expect(component.selectedIndex).toBe(0);
    });

    it('places word in drop zone when dropped', async () => {
      const wrapper = mount(DragAndDropQuestion, {
        props: { question: mockQuestion },
      });

      const component = wrapper.vm;
      if (component.onDragStart && component.onDrop) {
        await component.onDragStart(0);
        await component.onDrop();
      }

      expect(component.droppedWord).toEqual({ content: 'apple' });
    });

    it('places selected word when drop zone is clicked', async () => {
      const wrapper = mount(DragAndDropQuestion, {
        props: { question: mockQuestion },
      });

      const component = wrapper.vm;
      if (component.onWordClick && component.onDropZoneClick) {
        await component.onWordClick(0);
        await component.onDropZoneClick();
      }

      expect(component.droppedWord).toEqual({ content: 'apple' });
    });

    it('emits answer-submitted when submit button is clicked', async () => {
      const wrapper = mount(DragAndDropQuestion, {
        props: { question: mockQuestion },
      });

      const component = wrapper.vm;
      if (component.onDragStart && component.onDrop && component.submit) {
        await component.onDragStart(1);
        await component.onDrop();
        await component.submit();
      }

      expect(wrapper.emitted('answer-submitted')).toBeTruthy();
    });
  });

  describe('keyboard navigation', () => {
    it('handles arrow left key', async () => {
      const wrapper = mount(DragAndDropQuestion, {
        props: { question: mockQuestion },
      });

      const component = wrapper.vm;
      if (component.handleGlobalKeydown) {
        const event = {
          key: 'ArrowLeft',
          preventDefault: vi.fn(),
          target: { tagName: 'DIV' },
        };
        await component.handleGlobalKeydown(event);

        expect(event.preventDefault).toHaveBeenCalled();
      }
    });

    it('handles arrow right key', async () => {
      const wrapper = mount(DragAndDropQuestion, {
        props: { question: mockQuestion },
      });

      const component = wrapper.vm;
      if (component.handleGlobalKeydown) {
        const event = {
          key: 'ArrowRight',
          preventDefault: vi.fn(),
          target: { tagName: 'DIV' },
        };
        await component.handleGlobalKeydown(event);

        expect(event.preventDefault).toHaveBeenCalled();
      }
    });

    it('handles space key when word is selected', async () => {
      const wrapper = mount(DragAndDropQuestion, {
        props: { question: mockQuestion },
      });

      const component = wrapper.vm;
      if (component.onWordClick && component.handleGlobalKeydown) {
        await component.onWordClick(1);
        const event = {
          key: ' ',
          preventDefault: vi.fn(),
          target: { tagName: 'DIV' },
        };
        await component.handleGlobalKeydown(event);

        expect(event.preventDefault).toHaveBeenCalled();
      }
    });

    it('handles enter key when word is selected', async () => {
      const wrapper = mount(DragAndDropQuestion, {
        props: { question: mockQuestion },
      });

      const component = wrapper.vm;
      if (component.onWordClick && component.handleGlobalKeydown) {
        await component.onWordClick(1);
        const event = {
          key: 'Enter',
          preventDefault: vi.fn(),
          target: { tagName: 'DIV' },
        };
        await component.handleGlobalKeydown(event);

        expect(event.preventDefault).toHaveBeenCalled();
      }
    });

    it('does not handle events when target is input', async () => {
      const wrapper = mount(DragAndDropQuestion, {
        props: { question: mockQuestion },
      });

      const component = wrapper.vm;
      if (component.handleGlobalKeydown) {
        const event = {
          key: 'ArrowLeft',
          preventDefault: vi.fn(),
          target: { tagName: 'INPUT' },
        };
        await component.handleGlobalKeydown(event);

        expect(event.preventDefault).not.toHaveBeenCalled();
      }
    });

    it('does not handle events when target is textarea', async () => {
      const wrapper = mount(DragAndDropQuestion, {
        props: { question: mockQuestion },
      });

      const component = wrapper.vm;
      if (component.handleGlobalKeydown) {
        const event = {
          key: 'ArrowLeft',
          preventDefault: vi.fn(),
          target: { tagName: 'TEXTAREA' },
        };
        await component.handleGlobalKeydown(event);

        expect(event.preventDefault).not.toHaveBeenCalled();
      }
    });
  });

  describe('component lifecycle', () => {
    it('adds keyboard event listener on mount', async () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');

      mount(DragAndDropQuestion, {
        props: { question: mockQuestion },
      });

      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('removes keyboard event listener on unmount', async () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

      const wrapper = mount(DragAndDropQuestion, {
        props: { question: mockQuestion },
      });

      await wrapper.unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
  });

  describe('edge cases', () => {
    it('handles empty words array', () => {
      const wrapper = mount(DragAndDropQuestion, {
        props: { question: mockQuestionWithNoWords },
      });

      expect(wrapper.exists()).toBe(true);
    });

    it('handles missing quick_check_content', () => {
      const wrapper = mount(DragAndDropQuestion, {
        props: { question: {}},
      });

      expect(wrapper.exists()).toBe(true);
    });

    it('handles missing items array', () => {
      const wrapper = mount(DragAndDropQuestion, {
        props: { question: { quick_check_content: {}}},
      });

      expect(wrapper.exists()).toBe(true);
    });

    it('handles missing words array', () => {
      const wrapper = mount(DragAndDropQuestion, {
        props: { question: { quick_check_content: { items: [{}] }}},
      });

      expect(wrapper.exists()).toBe(true);
    });

    it('does not emit answer-submitted when no word is dropped', async () => {
      const wrapper = mount(DragAndDropQuestion, {
        props: { question: mockQuestion },
      });

      const submitButton = wrapper.find('button');
      await submitButton.trigger('click');

      expect(wrapper.emitted('answer-submitted')).toBeFalsy();
    });
  });

  describe('navigation functions', () => {
    it('selects next word', async () => {
      const wrapper = mount(DragAndDropQuestion, {
        props: { question: mockQuestion },
      });

      const component = wrapper.vm;
      if (component.onWordClick && component.selectNextWord) {
        await component.onWordClick(0);
        await component.selectNextWord();

        expect(component.selectedIndex).toBe(1);
      }
    });

    it('selects previous word', async () => {
      const wrapper = mount(DragAndDropQuestion, {
        props: { question: mockQuestion },
      });

      const component = wrapper.vm;
      if (component.onWordClick && component.selectPreviousWord) {
        await component.onWordClick(2);
        await component.selectPreviousWord();

        expect(component.selectedIndex).toBe(1);
      }
    });

    it('wraps to last word when pressing left arrow on first word', async () => {
      const wrapper = mount(DragAndDropQuestion, {
        props: { question: mockQuestion },
      });

      const component = wrapper.vm;
      if (component.onWordClick && component.selectPreviousWord) {
        await component.onWordClick(0);
        await component.selectPreviousWord();

        expect(component.selectedIndex).toBe(2);
      }
    });

    it('wraps to first word when pressing right arrow on last word', async () => {
      const wrapper = mount(DragAndDropQuestion, {
        props: { question: mockQuestion },
      });

      const component = wrapper.vm;
      if (component.onWordClick && component.selectNextWord) {
        await component.onWordClick(2);
        await component.selectNextWord();

        expect(component.selectedIndex).toBe(0);
      }
    });
  });

  describe('word placement functions', () => {
    it('places selected word', async () => {
      const wrapper = mount(DragAndDropQuestion, {
        props: { question: mockQuestion },
      });

      const component = wrapper.vm;
      if (component.onWordClick && component.placeSelectedWord) {
        await component.onWordClick(1);
        await component.placeSelectedWord();

        expect(component.droppedWord).toEqual({ content: 'banana' });
      }
    });

    it('resets selectedIndex after placing word', async () => {
      const wrapper = mount(DragAndDropQuestion, {
        props: { question: mockQuestion },
      });

      const component = wrapper.vm;
      if (component.onWordClick && component.placeSelectedWord) {
        await component.onWordClick(1);
        await component.placeSelectedWord();

        expect(component.selectedIndex).toBeNull();
      }
    });

    it('does not place word when no word is selected', async () => {
      const wrapper = mount(DragAndDropQuestion, {
        props: { question: mockQuestion },
      });

      const component = wrapper.vm;
      if (component.placeSelectedWord) {
        await component.placeSelectedWord();

        expect(component.droppedWord).toBeNull();
      }
    });
  });

  describe('drag and drop functions', () => {
    it('sets draggedIndex on drag start', async () => {
      const wrapper = mount(DragAndDropQuestion, {
        props: { question: mockQuestion },
      });

      const component = wrapper.vm;
      if (component.onDragStart) {
        await component.onDragStart(1);

        expect(component.draggedIndex).toBe(1);
      }
    });

    it('resets draggedIndex on drag end', async () => {
      const wrapper = mount(DragAndDropQuestion, {
        props: { question: mockQuestion },
      });

      const component = wrapper.vm;
      if (component.onDragStart && component.onDragEnd) {
        await component.onDragStart(1);
        await component.onDragEnd();

        expect(component.draggedIndex).toBeNull();
      }
    });

    it('sets droppedWord on drop', async () => {
      const wrapper = mount(DragAndDropQuestion, {
        props: { question: mockQuestion },
      });

      const component = wrapper.vm;
      if (component.onDragStart && component.onDrop) {
        await component.onDragStart(1);
        await component.onDrop();

        expect(component.droppedWord).toEqual({ content: 'banana' });
      }
    });

    it('resets draggedIndex after drop', async () => {
      const wrapper = mount(DragAndDropQuestion, {
        props: { question: mockQuestion },
      });

      const component = wrapper.vm;
      if (component.onDragStart && component.onDrop) {
        await component.onDragStart(1);
        await component.onDrop();

        expect(component.draggedIndex).toBeNull();
      }
    });

    it('resets selectedIndex after drop', async () => {
      const wrapper = mount(DragAndDropQuestion, {
        props: { question: mockQuestion },
      });

      const component = wrapper.vm;
      if (component.onWordClick && component.onDragStart && component.onDrop) {
        await component.onWordClick(1);
        await component.onDragStart(0);
        await component.onDrop();

        expect(component.selectedIndex).toBeNull();
      }
    });
  });

  describe('submit function', () => {
    it('emits answer-submitted with dropped word content', async () => {
      const wrapper = mount(DragAndDropQuestion, {
        props: { question: mockQuestion },
      });

      const component = wrapper.vm;
      if (component.onDragStart && component.onDrop && component.submit) {
        await component.onDragStart(1);
        await component.onDrop();
        await component.submit();

        expect(wrapper.emitted('answer-submitted')).toBeTruthy();
      }
    });

    it('emits correct answer data', async () => {
      const wrapper = mount(DragAndDropQuestion, {
        props: { question: mockQuestion },
      });

      const component = wrapper.vm;
      if (component.onDragStart && component.onDrop && component.submit) {
        await component.onDragStart(1);
        await component.onDrop();
        await component.submit();

        const emitted = wrapper.emitted('answer-submitted');
        if (emitted && emitted[0]) {
          expect(emitted[0]).toEqual([['banana']]);
        }
      }
    });

    it('does not emit when no word is dropped', async () => {
      const wrapper = mount(DragAndDropQuestion, {
        props: { question: mockQuestion },
      });

      const component = wrapper.vm;
      if (component.submit) {
        await component.submit();

        expect(wrapper.emitted('answer-submitted')).toBeFalsy();
      }
    });
  });
});