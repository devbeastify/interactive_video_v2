import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import PlayButton from './PlayButton.vue';

describe('PlayButton', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(PlayButton, {
      props: {
        audioBtnState: 'paused',
      },
    });
  });

  it('renders with correct aria-label', () => {
    expect(wrapper.attributes('aria-label')).toBe('Play audio');
  });

  it('has correct button type', () => {
    expect(wrapper.attributes('type')).toBe('button');
  });

  it('shows speaker icon when state is paused', () => {
    wrapper = mount(PlayButton, {
      props: {
        audioBtnState: 'paused',
      },
    });

    const speakerIcon = wrapper.find('.speaker-icon');
    const pauseIcon = wrapper.find('.pause-icon');
    
    expect(speakerIcon.exists()).toBe(true);
    expect(pauseIcon.exists()).toBe(false);
  });

  it('shows pause icon when state is playing', () => {
    wrapper = mount(PlayButton, {
      props: {
        audioBtnState: 'playing',
      },
    });

    const speakerIcon = wrapper.find('.speaker-icon');
    const pauseIcon = wrapper.find('.pause-icon');
    
    expect(speakerIcon.exists()).toBe(false);
    expect(pauseIcon.exists()).toBe(true);
  });

  it('applies correct CSS class based on state', () => {
    wrapper = mount(PlayButton, {
      props: {
        audioBtnState: 'playing',
      },
    });

    expect(wrapper.classes()).toContain('is-playing');
  });

  it('applies paused class when state is paused', () => {
    wrapper = mount(PlayButton, {
      props: {
        audioBtnState: 'paused',
      },
    });

    expect(wrapper.classes()).toContain('is-paused');
  });

  it('emits click event when clicked', async () => {
    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeTruthy();
  });

  it('validates audioBtnState prop correctly', () => {
    const validator = PlayButton.props.audioBtnState.validator;

    expect(validator('playing')).toBe(true);
    expect(validator('paused')).toBe(true);
    expect(validator('')).toBe(true);
    expect(validator('invalid')).toBe(false);
    expect(validator('PLAYING')).toBe(false);
  });
}); 