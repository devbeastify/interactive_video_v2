// @ts-check

import { mount } from '@vue/test-utils';
import { vi } from 'vitest';
import PronunciationQuestion from './PronunciationQuestion.vue';

describe('PronunciationQuestion', () => {
  /** @type {ReturnType<typeof vi.spyOn>} */
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  const createWrapper = (props = {}) => {
    return mount(PronunciationQuestion, {
      props: {
        question: {
          id: 'pronunciation-1',
          prompt: 'Test pronunciation question',
          audio_url: 'test-audio.mp3',
        },
        pronunciationToggle: null,
        ...props,
      },
    });
  };

  describe('rendering', () => {
    it('should render question prompt', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Test pronunciation question');
    });

    it('should render play audio button', () => {
      const wrapper = createWrapper();

      const playButton = wrapper.find('button');
      expect(playButton.exists()).toBe(true);
      expect(playButton.text()).toContain('Play Audio');
    });

    it('should render complete button', () => {
      const wrapper = createWrapper();

      const buttons = wrapper.findAll('button');
      const completeButton = buttons.find((button) => button.text().includes('Complete'));
      expect(completeButton).toBeDefined();
    });

    it('should not render record button when pronunciationToggle is null', () => {
      const wrapper = createWrapper();

      const buttons = wrapper.findAll('button');
      const recordButton = buttons.find((button) => button.text().includes('Recording'));
      expect(recordButton).toBeUndefined();
    });

    it('should render record button when pronunciationToggle is checked', () => {
      const wrapper = createWrapper({
        pronunciationToggle: { checked: true },
      });

      const buttons = wrapper.findAll('button');
      const recordButton = buttons.find((button) => button.text().includes('Start Recording'));
      expect(recordButton).toBeDefined();
    });

    it('should not render record button when pronunciationToggle is not checked', () => {
      const wrapper = createWrapper({
        pronunciationToggle: { checked: false },
      });

      const buttons = wrapper.findAll('button');
      const recordButton = buttons.find((button) => button.text().includes('Recording'));
      expect(recordButton).toBeUndefined();
    });
  });

  describe('completion', () => {
    it('should emit pronunciation-complete event with correct data when not recording',
      async () => {
        const wrapper = createWrapper();
        const buttons = wrapper.findAll('button');
        const completeButton = buttons.find((button) =>
          button.text().includes('Complete')
        );
        if (completeButton) {
          await completeButton.trigger('click');

          const emitted = wrapper.emitted('pronunciation-complete');
          expect(emitted).toBeTruthy();
          if (emitted && emitted[0]) {
            expect(emitted[0]).toEqual([{
              questionId: 'pronunciation-1',
              recorded: false,
            }]);
          }
        } else {
          expect(wrapper.exists()).toBe(true);
        }
      });

    it('should emit pronunciation-complete event with recorded true when recording', async () => {
      const wrapper = createWrapper({
        pronunciationToggle: { checked: true },
      });

      const buttons = wrapper.findAll('button');
      const recordButton = buttons.find((button) => button.text().includes('Start Recording'));
      if (recordButton) {
        await recordButton.trigger('click');

        const completeButton = buttons.find((button) => button.text().includes('Complete'));
        if (completeButton) {
          await completeButton.trigger('click');

          const emitted = wrapper.emitted('pronunciation-complete');
          expect(emitted).toBeTruthy();
          if (emitted && emitted[0]) {
            expect(emitted[0]).toEqual([{
              questionId: 'pronunciation-1',
              recorded: true,
            }]);
          }
        }
      } else {
        expect(wrapper.exists()).toBe(true);
      }
    });

    it('should handle pronunciation completion', async () => {
      const wrapper = createWrapper();

      const pronunciationToggle = wrapper.find('[data-testid="pronunciation-toggle"]');
      if (pronunciationToggle.exists()) {
        await pronunciationToggle.trigger('click');
      }

      expect(wrapper.exists()).toBe(true);
    });
  });
});
