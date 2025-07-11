import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import DirectionLine from './DirectionLine.vue';
import { mainStore } from '../stores/main/main_store';
import { DirectionLine as DirectionLineClass } from '../stores/main/direction_line';

// Mock the store
vi.mock('../stores/main/main_store', () => ({
  mainStore: vi.fn(() => ({
    actionSettings: {
      useAutoPlay: true,
    },
  })),
}));

// Mock Audio constructor
global.Audio = vi.fn(() => ({
  addEventListener: vi.fn(),
  play: vi.fn().mockResolvedValue(undefined),
  readyState: 4,
}));

// Mock fetch for audio availability check
global.fetch = vi.fn();

// Mock speech synthesis
global.speechSynthesis = {
  speak: vi.fn(),
  cancel: vi.fn(),
};

global.SpeechSynthesisUtterance = vi.fn(() => ({
  lang: 'en',
  rate: 1,
  pitch: 1,
  onstart: null,
  onend: null,
  onerror: null,
}));

describe('DirectionLine', () => {
  let wrapper;
  let mockDirectionLine;

  beforeEach(() => {
    mockDirectionLine = new DirectionLineClass({
      audioPath: '/audio/direction-lines/step-1/en.mp3',
      isNew: true,
      name: 'test_step',
      text: 'Test direction line text',
      stepId: 'step-1',
      languageCode: 'en',
    });

    // Mock fetch to return success
    global.fetch.mockResolvedValue({
      ok: true,
    });
  });

  it('renders direction line text', () => {
    wrapper = mount(DirectionLine, {
      props: {
        directionLine: mockDirectionLine,
        stepIndex: 0,
      },
    });

    expect(wrapper.text()).toContain('Test direction line text');
  });

  it('shows play button when audio is available and step is new', () => {
    wrapper = mount(DirectionLine, {
      props: {
        directionLine: mockDirectionLine,
        stepIndex: 0,
      },
    });

    const playButton = wrapper.find('.play-button');
    expect(playButton.exists()).toBe(true);
  });

  it('does not show play button when step is not new', () => {
    const notNewDirectionLine = new DirectionLineClass({
      audioPath: '/audio/direction-lines/step-1/en.mp3',
      isNew: false,
      name: 'test_step',
      text: 'Test direction line text',
      stepId: 'step-1',
      languageCode: 'en',
    });

    wrapper = mount(DirectionLine, {
      props: {
        directionLine: notNewDirectionLine,
        stepIndex: 0,
      },
    });

    const playButton = wrapper.find('.play-button');
    expect(playButton.exists()).toBe(false);
  });

  it('does not show play button when no audio path', () => {
    const noAudioDirectionLine = new DirectionLineClass({
      audioPath: '',
      isNew: true,
      name: 'test_step',
      text: 'Test direction line text',
      stepId: 'step-1',
      languageCode: 'en',
    });

    wrapper = mount(DirectionLine, {
      props: {
        directionLine: noAudioDirectionLine,
        stepIndex: 0,
      },
    });

    const playButton = wrapper.find('.play-button');
    expect(playButton.exists()).toBe(false);
  });

  it('generates dynamic audio path when stepId is provided', () => {
    const dynamicDirectionLine = new DirectionLineClass({
      isNew: true,
      name: 'test_step',
      text: 'Test direction line text',
      stepId: 'step-2',
      languageCode: 'es',
    });

    expect(dynamicDirectionLine.audioPath).toBe('/audio/direction-lines/step-2/es.mp3');
  });

  it('checks audio availability correctly', async () => {
    const result = await mockDirectionLine.checkAudioAvailability();
    expect(result).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith('/audio/direction-lines/step-1/en.mp3', { method: 'HEAD' });
  });

  it('handles audio availability check failure', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
    });

    const result = await mockDirectionLine.checkAudioAvailability();
    expect(result).toBe(false);
  });

  it('emits audio-ended event when audio finishes', async () => {
    const mockAudio = {
      addEventListener: vi.fn(),
      play: vi.fn().mockResolvedValue(undefined),
      readyState: 4,
    };
    global.Audio = vi.fn(() => mockAudio);

    wrapper = mount(DirectionLine, {
      props: {
        directionLine: mockDirectionLine,
        stepIndex: 0,
      },
    });

    const playButton = wrapper.find('.play-button');
    await playButton.trigger('click');

    // Simulate audio ended event
    const endedCallback = mockAudio.addEventListener.mock.calls.find(
      call => call[0] === 'ended'
    )?.[1];
    
    if (endedCallback) {
      endedCallback();
    }

    expect(wrapper.emitted('audioEnded')).toBeTruthy();
  });

  it('falls back to TTS when audio file is not available', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
    });

    const mockUtterance = {
      lang: 'en',
      rate: 0.9,
      pitch: 1,
      onstart: null,
      onend: null,
      onerror: null,
    };

    global.SpeechSynthesisUtterance = vi.fn(() => mockUtterance);

    wrapper = mount(DirectionLine, {
      props: {
        directionLine: mockDirectionLine,
        stepIndex: 0,
      },
    });

    const playButton = wrapper.find('.play-button');
    await playButton.trigger('click');

    // Simulate TTS end
    if (mockUtterance.onend) {
      mockUtterance.onend();
    }

    expect(wrapper.emitted('audioEnded')).toBeTruthy();
  });

  it('exposes autoPlayAudio method', () => {
    wrapper = mount(DirectionLine, {
      props: {
        directionLine: mockDirectionLine,
        stepIndex: 0,
      },
    });

    expect(wrapper.vm.autoPlayAudio).toBeDefined();
    expect(typeof wrapper.vm.autoPlayAudio).toBe('function');
  });
}); 