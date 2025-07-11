import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import PlayButton from './PlayButton.vue';

describe('PlayButton', () => {
  it('renders with paused state by default', () => {
    const wrapper = mount(PlayButton);

    expect(wrapper.find('.play-button').exists()).toBe(true);
    expect(wrapper.find('.speaker-icon').exists()).toBe(true);
    expect(wrapper.find('.pause-icon').exists()).toBe(false);
    expect(wrapper.classes()).toContain('is-paused');
  });

  it('renders with playing state', () => {
    const wrapper = mount(PlayButton, {
      props: {
        audioBtnState: 'playing',
      },
    });

    expect(wrapper.find('.play-button').exists()).toBe(true);
    expect(wrapper.find('.speaker-icon').exists()).toBe(false);
    expect(wrapper.find('.pause-icon').exists()).toBe(true);
    expect(wrapper.classes()).toContain('is-playing');
  });

  it('renders with paused state', () => {
    const wrapper = mount(PlayButton, {
      props: {
        audioBtnState: 'paused',
      },
    });

    expect(wrapper.find('.play-button').exists()).toBe(true);
    expect(wrapper.find('.speaker-icon').exists()).toBe(true);
    expect(wrapper.find('.pause-icon').exists()).toBe(false);
    expect(wrapper.classes()).toContain('is-paused');
  });

  it('emits click event when button is clicked', async () => {
    const wrapper = mount(PlayButton);

    await wrapper.find('.play-button').trigger('click');

    expect(wrapper.emitted('click')).toBeTruthy();
  });

  it('has correct accessibility attributes', () => {
    const wrapper = mount(PlayButton);

    const button = wrapper.find('.play-button');
    expect(button.attributes('aria-label')).toBe('Play audio');
    expect(button.attributes('type')).toBe('button');
  });

  it('applies correct CSS classes based on state', () => {
    const wrapper = mount(PlayButton, {
      props: {
        audioBtnState: 'playing',
      },
    });

    expect(wrapper.classes()).toContain('is-playing');
    expect(wrapper.classes()).not.toContain('is-paused');
  });

  it('validates audioBtnState prop', () => {
    const validator = PlayButton.props.audioBtnState.validator;

    expect(validator('playing')).toBe(true);
    expect(validator('paused')).toBe(true);
    expect(validator('')).toBe(true);
    expect(validator('invalid')).toBe(false);
  });
}); 