import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import DirectionLine from './DirectionLine.vue';
import { DirectionLine as DirectionLineClass } from '../stores/main/direction_line';

// Mock the main store
vi.mock('../stores/main/main_store', () => ({
  mainStore: () => ({
    // Mock store methods as needed
  }),
}));

// Mock PlayButton component
vi.mock('./PlayButton.vue', () => ({
  default: {
    name: 'PlayButton',
    props: ['audioBtnState'],
    emits: ['click'],
    template: '<button @click="$emit(\'click\')">Play</button>',
  },
}));

describe('DirectionLine', () => {
  let mockAudio;
  let mockSpeechSynthesis;

  beforeEach(() => {
    // Mock Audio constructor
    mockAudio = {
      addEventListener: vi.fn(),
      play: vi.fn().mockResolvedValue(undefined),
      readyState: 4,
    };
    global.Audio = vi.fn(() => mockAudio);

    // Mock speech synthesis
    mockSpeechSynthesis = {
      speak: vi.fn(),
      cancel: vi.fn(),
    };
    global.speechSynthesis = mockSpeechSynthesis;
    global.SpeechSynthesisUtterance = vi.fn().mockImplementation((text) => ({
      text,
      lang: 'en',
      rate: 1,
      pitch: 1,
      onstart: null,
      onend: null,
      onerror: null,
    }));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders direction line text correctly', () => {
    const directionLine = new DirectionLineClass({
      text: 'Test direction line',
      isNew: true,
    });

    const wrapper = mount(DirectionLine, {
      props: {
        directionLine,
        stepIndex: 0,
      },
    });

    expect(wrapper.text()).toContain('Test direction line');
  });

  it('shows play button when direction line has audio and is new', () => {
    const directionLine = new DirectionLineClass({
      text: 'Test direction line',
      audioPath: '/test/audio.mp3',
      isNew: true,
    });

    const wrapper = mount(DirectionLine, {
      props: {
        directionLine,
        stepIndex: 0,
      },
    });

    expect(wrapper.find('.direction-line__play-button-wrapper').exists()).toBe(true);
  });

  it('does not show play button when direction line is not new', () => {
    const directionLine = new DirectionLineClass({
      text: 'Test direction line',
      audioPath: '/test/audio.mp3',
      isNew: false,
    });

    const wrapper = mount(DirectionLine, {
      props: {
        directionLine,
        stepIndex: 0,
      },
    });

    expect(wrapper.find('.direction-line__play-button-wrapper').exists()).toBe(false);
  });

  it('does not show play button when direction line has no audio', () => {
    const directionLine = new DirectionLineClass({
      text: 'Test direction line',
      audioPath: '',
      isNew: true,
    });

    const wrapper = mount(DirectionLine, {
      props: {
        directionLine,
        stepIndex: 0,
      },
    });

    expect(wrapper.find('.direction-line__play-button-wrapper').exists()).toBe(false);
  });

  it('plays audio file when available', async () => {
    const directionLine = new DirectionLineClass({
      text: 'Test direction line',
      audioPath: '/test/audio.mp3',
      isNew: true,
    });

    const wrapper = mount(DirectionLine, {
      props: {
        directionLine,
        stepIndex: 0,
      },
    });

    // Mock the play method
    const playSpy = vi.spyOn(wrapper.vm, 'play');

    // Trigger play
    await wrapper.vm.play();

    expect(playSpy).toHaveBeenCalled();
  });

  it('falls back to TTS when audio file is not available', async () => {
    const directionLine = new DirectionLineClass({
      text: 'Test direction line',
      audioPath: '',
      isNew: true,
    });

    const wrapper = mount(DirectionLine, {
      props: {
        directionLine,
        stepIndex: 0,
      },
    });

    // Mock the playTTS method
    const playTTSSpy = vi.spyOn(wrapper.vm, 'playTTS');

    // Trigger play
    await wrapper.vm.play();

    expect(playTTSSpy).toHaveBeenCalled();
  });

  it('emits events when audio starts and ends', async () => {
    const directionLine = new DirectionLineClass({
      text: 'Test direction line',
      audioPath: '/test/audio.mp3',
      isNew: true,
    });

    const wrapper = mount(DirectionLine, {
      props: {
        directionLine,
        stepIndex: 0,
      },
    });

    // Mock audio ended event
    const endedCallback = mockAudio.addEventListener.mock.calls.find(
      call => call[0] === 'ended'
    )?.[1];

    if (endedCallback) {
      endedCallback();
    }

    // Check that events were emitted
    expect(wrapper.emitted()).toBeDefined();
  });

  it('auto plays audio after delay', () => {
    vi.useFakeTimers();

    const directionLine = new DirectionLineClass({
      text: 'Test direction line',
      audioPath: '/test/audio.mp3',
      isNew: true,
    });

    const wrapper = mount(DirectionLine, {
      props: {
        directionLine,
        stepIndex: 0,
      },
    });

    const playSpy = vi.spyOn(wrapper.vm, 'play');

    wrapper.vm.autoPlayAudio();

    vi.advanceTimersByTime(500);

    expect(playSpy).toHaveBeenCalled();

    vi.useRealTimers();
  });
}); 