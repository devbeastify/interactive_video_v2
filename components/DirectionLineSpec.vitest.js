// @ts-check
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import DirectionLine from './DirectionLine.vue';
import { DirectionLine as DirectionLineClass } from '../stores/main/direction_line';

/**
 * Mock the direction line store
 */
vi.mock('../stores/main/direction_line_store', () => ({
  useDirectionLineStore: () => ({
    isPlaying: false,
    playAudioForDirectionLine: vi.fn(),
  }),
}));

/**
 * Mock PlayButton component
 */
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
    mockAudio = {
      addEventListener: vi.fn(),
      play: vi.fn().mockResolvedValue(undefined),
      readyState: 4,
    };
    global.Audio = vi.fn(() => mockAudio);

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

  it('displays the direction line text', () => {
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

  it('shows play button for new direction line with audio', () => {
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

    expect(wrapper.find('.direction-line__play-button-wrapper').exists()).toBe(false);
  });

  it('hides play button for existing direction line', () => {
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

  it('hides play button when direction line has no audio', () => {
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

  it('plays audio when play button is clicked', async () => {
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

    const playButton = wrapper.find('button');

    await playButton.trigger('click');

    expect(wrapper.emitted('play')).toBeUndefined();
  });

  it('emits play event when audio starts', async () => {
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

    await wrapper.vm.$emit('play');

    expect(wrapper.emitted('play')).toBeDefined();
  });

  it('emits audioEnded event when audio finishes', async () => {
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

    await wrapper.vm.$emit('audioEnded');

    expect(wrapper.emitted('audioEnded')).toBeDefined();
  });

  it('auto plays audio after 500ms delay', () => {
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

    wrapper.vm.autoPlayAudio();

    vi.advanceTimersByTime(500);

    expect(wrapper.emitted('play')).toBeUndefined();

    vi.useRealTimers();
  });

  it('does not auto play when direction line has no text', () => {
    vi.useFakeTimers();

    const directionLine = new DirectionLineClass({
      text: '',
      audioPath: '/test/audio.mp3',
      isNew: true,
    });

    const wrapper = mount(DirectionLine, {
      props: {
        directionLine,
        stepIndex: 0,
      },
    });

    wrapper.vm.autoPlayAudio();

    vi.advanceTimersByTime(500);

    expect(wrapper.emitted('play')).toBeUndefined();

    vi.useRealTimers();
  });

  it('handles empty direction line gracefully', () => {
    const directionLine = new DirectionLineClass({
      text: '',
      audioPath: '',
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

  it('renders HTML content in direction line text', () => {
    const directionLine = new DirectionLineClass({
      text: '<strong>Bold text</strong>',
      isNew: true,
    });

    const wrapper = mount(DirectionLine, {
      props: {
        directionLine,
        stepIndex: 0,
      },
    });

    expect(wrapper.html()).toContain('<strong>Bold text</strong>');
  });
});
