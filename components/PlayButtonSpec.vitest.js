import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import PlayButton from './PlayButton.vue';

describe('PlayButton', () => {
  it('displays play icon when audio is paused', () => {
    const wrapper = mount(PlayButton);

    expect(wrapper.find('svg').attributes('class')).toContain('speaker-icon');
  });

  it('displays pause icon when audio is playing', () => {
    const wrapper = mount(PlayButton, {
      props: {
        audioBtnState: 'playing',
      },
    });

    expect(wrapper.find('svg').attributes('class')).toContain('pause-icon');
  });

  it('emits click event when button is clicked', async () => {
    const wrapper = mount(PlayButton);

    await wrapper.find('button').trigger('click');

    expect(wrapper.emitted('click')).toBeTruthy();
  });

  it('has accessible button attributes', () => {
    const wrapper = mount(PlayButton);

    const button = wrapper.find('button');

    expect(button.attributes('aria-label')).toBe('Play audio');
  });

  it('has correct button type', () => {
    const wrapper = mount(PlayButton);

    const button = wrapper.find('button');

    expect(button.attributes('type')).toBe('button');
  });

  it('accepts valid audio button states', () => {
    const wrapper = mount(PlayButton, {
      props: {
        audioBtnState: 'playing',
      },
    });

    expect(wrapper.props('audioBtnState')).toBe('playing');
  });

  it('accepts paused state as valid', () => {
    const wrapper = mount(PlayButton, {
      props: {
        audioBtnState: 'paused',
      },
    });

    expect(wrapper.props('audioBtnState')).toBe('paused');
  });

  it('accepts empty string as valid state', () => {
    const wrapper = mount(PlayButton, {
      props: {
        audioBtnState: '',
      },
    });

    expect(wrapper.props('audioBtnState')).toBe('');
  });
});
