// @ts-check
import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import WordOrdering from './WordOrdering.vue';

describe('WordOrdering', () => {
  /** @type {import('@vue/test-utils').VueWrapper} */
  let wrapper;
  const mockQuestion = {
    quick_check_content: {
      items: [{
        words: [
          { content: 'The', targetId: 'word1' },
          { content: 'cat', targetId: 'word2' },
          { content: 'is', targetId: 'word3' },
          { content: 'sleeping', targetId: 'word4' }
        ],
        question_prompt: 'Arrange the words to form a sentence',
        final_sentence: 'The cat is sleeping',
        punctuation_before: '',
        punctuation_after: '.'
      }]
    }
  };

  beforeEach(() => {
    wrapper = mount(WordOrdering, {
      props: { question: mockQuestion }
    });
  });

  it('displays the question prompt', () => {
    expect(wrapper.text()).toContain('Arrange the words to form a sentence');
  });

  it('shows all available words initially', () => {
    expect(wrapper.vm.availableWords).toHaveLength(4);
  });

  it('displays the final sentence when provided', () => {
    expect(wrapper.text()).toContain('Form this sentence: The cat is sleeping.');
  });

  it('shows placeholder text when no words are dropped', () => {
    const placeholder = wrapper.find('.placeholder');
    
    expect(placeholder.text()).toBe('Drag words here to form the sentence');
  });

  it('disables submit button initially', () => {
    const submitBtn = wrapper.find('[class*="submit-btn"]');
    
    expect(submitBtn.attributes('disabled')).toBeDefined();
  });

  it('enables submit button when words are dropped', async () => {
    await wrapper.vm.droppedWords.push(mockQuestion.quick_check_content.items[0].words[0]);
    
    const submitBtn = wrapper.find('[class*="submit-btn"]');
    
    expect(submitBtn.attributes('disabled')).toBeUndefined();
  });

  it('disables reset button initially', () => {
    const resetBtn = wrapper.find('[class*="reset-btn"]');
    
    expect(resetBtn.attributes('disabled')).toBeDefined();
  });

  it('enables reset button when words are dropped', async () => {
    await wrapper.vm.droppedWords.push(mockQuestion.quick_check_content.items[0].words[0]);
    
    const resetBtn = wrapper.find('[class*="reset-btn"]');
    
    expect(resetBtn.attributes('disabled')).toBeUndefined();
  });

  it('hides used words from available options', async () => {
    const firstWord = mockQuestion.quick_check_content.items[0].words[0];
    await wrapper.vm.droppedWords.push(firstWord);
    
    const usedWord = wrapper.find('[class*="word"][class*="used"]');
    
    expect(usedWord.exists()).toBe(true);
  });

  it('emits answer-submitted event on submit', async () => {
    const words = mockQuestion.quick_check_content.items[0].words.slice(0, 3);
    await wrapper.vm.droppedWords.push(...words);
    
    await wrapper.vm.submit();
    
    expect(wrapper.emitted('answer-submitted')).toBeTruthy();
  });

  it('emits correct word contents in answer-submitted event', async () => {
    const words = mockQuestion.quick_check_content.items[0].words.slice(0, 3);
    await wrapper.vm.droppedWords.push(...words);
    
    await wrapper.vm.submit();
    
    expect(wrapper.emitted('answer-submitted')?.[0]?.[0]).toEqual(['The', 'cat', 'is']);
  });

  it('clears dropped words on reset', async () => {
    const words = mockQuestion.quick_check_content.items[0].words.slice(0, 2);
    await wrapper.vm.droppedWords.push(...words);
    
    await wrapper.vm.resetAnswer();
    
    expect(wrapper.vm.droppedWords).toHaveLength(0);
  });

  it('selects word when clicked', async () => {
    const words = mockQuestion.quick_check_content.items[0].words.slice(0, 2);
    await wrapper.vm.droppedWords.push(...words);
    
    await wrapper.vm.selectWord(0);
    
    expect(wrapper.vm.selectedWordIndex).toBe(0);
  });

  it('deselects word when clicked again', async () => {
    const words = mockQuestion.quick_check_content.items[0].words.slice(0, 2);
    await wrapper.vm.droppedWords.push(...words);
    await wrapper.vm.selectWord(0);
    
    await wrapper.vm.selectWord(0);
    
    expect(wrapper.vm.selectedWordIndex).toBeNull();
  });

  it('moves selected word to new position', async () => {
    const words = mockQuestion.quick_check_content.items[0].words.slice(0, 3);
    await wrapper.vm.droppedWords.push(...words);
    await wrapper.vm.selectWord(0);
    
    await wrapper.vm.moveSelectedWord(2);
    
    expect(wrapper.vm.droppedWords[1].content).toBe('The');
  });

  it('creates prompt from question_prompt when available', () => {
    expect(wrapper.vm.prompt).toBe('Arrange the words to form a sentence');
  });

  it('creates prompt from final_sentence when question_prompt not available', async () => {
    const questionWithoutPrompt = {
      quick_check_content: {
        items: [{
          words: mockQuestion.quick_check_content.items[0].words,
          final_sentence: 'The cat is sleeping'
        }]
      }
    };
    
    const wrapperWithoutPrompt = mount(WordOrdering, {
      props: { question: questionWithoutPrompt }
    });
    
    expect(wrapperWithoutPrompt.vm.prompt).toBe('Arrange the words to form: The cat is sleeping');
  });

  it('creates default prompt when no prompt data available', async () => {
    const questionWithoutData = {
      quick_check_content: {
        items: [{
          words: mockQuestion.quick_check_content.items[0].words
        }]
      }
    };
    
    const wrapperWithoutData = mount(WordOrdering, {
      props: { question: questionWithoutData }
    });
    
    expect(wrapperWithoutData.vm.prompt).toBe('Arrange the words to form the question: %1%');
  });

  it('handles words from answers property when words not available', async () => {
    const questionWithAnswers = {
      quick_check_content: {
        items: [{
          answers: {
            word1: 'The',
            word2: 'cat'
          }
        }]
      }
    };
    
    const wrapperWithAnswers = mount(WordOrdering, {
      props: { question: questionWithAnswers }
    });
    
    expect(wrapperWithAnswers.vm.words).toHaveLength(2);
  });

  it('creates correct word objects from answers property', async () => {
    const questionWithAnswers = {
      quick_check_content: {
        items: [{
          answers: {
            word1: 'The',
            word2: 'cat'
          }
        }]
      }
    };
    
    const wrapperWithAnswers = mount(WordOrdering, {
      props: { question: questionWithAnswers }
    });
    
    expect(wrapperWithAnswers.vm.words[0].content).toBe('The');
  });

  it('prevents duplicate words from being added', async () => {
    const firstWord = mockQuestion.quick_check_content.items[0].words[0];
    await wrapper.vm.droppedWords.push(firstWord);
    
    const initialLength = wrapper.vm.droppedWords.length;
    await wrapper.vm.onDropToAnswerBox();
    
    expect(wrapper.vm.droppedWords).toHaveLength(initialLength);
  });

  it('sets dragged index on drag start', async () => {
    await wrapper.vm.onDragStart(0);
    
    expect(wrapper.vm.draggedIndex).toBe(0);
  });

  it('clears dragged index on drag end', async () => {
    await wrapper.vm.onDragStart(0);
    await wrapper.vm.onDragEnd();
    
    expect(wrapper.vm.draggedIndex).toBeNull();
  });

  it('clears selected word index on reset', async () => {
    const words = mockQuestion.quick_check_content.items[0].words.slice(0, 2);
    await wrapper.vm.droppedWords.push(...words);
    await wrapper.vm.selectWord(0);
    
    await wrapper.vm.resetAnswer();
    
    expect(wrapper.vm.selectedWordIndex).toBeNull();
  });
});
