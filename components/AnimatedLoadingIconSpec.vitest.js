// @ts-check

import { mount } from '@vue/test-utils';
import AnimatedLoadingIcon from './AnimatedLoadingIcon.vue';

/** @typedef {import('@vue/test-utils').VueWrapper} VueWrapper */

/**
 * @param {Object} options
 * @return {VueWrapper}
 */
function getWrapper(options = {}) {
  return mount(AnimatedLoadingIcon, options);
}

describe('AnimatedLoadingIcon', () => {
  it('Renders an SVG element.', () => {
    const wrapper = getWrapper();
    const svg = wrapper.find('svg');

    expect(svg.exists()).toBe(true);
  });

  it('Has correct SVG attributes.', () => {
    const wrapper = getWrapper();
    const svg = wrapper.find('svg');

    expect(svg.attributes('viewBox')).toBe('0 0 100 100');
    expect(svg.attributes('preserveAspectRatio')).toBe('xMidYMid');
    expect(svg.attributes('width')).toBe('50');
    expect(svg.attributes('height')).toBe('50');
  });

  it('Has correct styling attributes.', () => {
    const wrapper = getWrapper();
    const svg = wrapper.find('svg');

    expect(svg.attributes('style')).toContain('shape-rendering: auto');
    expect(svg.attributes('style')).toContain('display: block');
    expect(svg.attributes('style')).toContain('background: rgb(255, 255, 255)');
  });

  it('Renders a circle element.', () => {
    const wrapper = getWrapper();
    const circle = wrapper.find('circle');

    expect(circle.exists()).toBe(true);
  });

  it('Has correct circle attributes.', () => {
    const wrapper = getWrapper();
    const circle = wrapper.find('circle');

    expect(circle.attributes('stroke-dasharray')).toBe('164.93361431346415 56.97787143782138');
    expect(circle.attributes('r')).toBe('35');
    expect(circle.attributes('stroke-width')).toBe('10');
    expect(circle.attributes('stroke')).toBe('#0079c1');
    expect(circle.attributes('fill')).toBe('none');
    expect(circle.attributes('cy')).toBe('50');
    expect(circle.attributes('cx')).toBe('50');
  });

  it('Renders an animateTransform element.', () => {
    const wrapper = getWrapper();
    const animate = wrapper.find('animateTransform');

    expect(animate.exists()).toBe(true);
  });

  it('Has correct animation attributes.', () => {
    const wrapper = getWrapper();
    const animate = wrapper.find('animateTransform');

    expect(animate.attributes('keyTimes')).toBe('0;1');
    expect(animate.attributes('values')).toBe('0 50 50;360 50 50');
    expect(animate.attributes('dur')).toBe('1s');
    expect(animate.attributes('repeatCount')).toBe('indefinite');
    expect(animate.attributes('type')).toBe('rotate');
    expect(animate.attributes('attributeName')).toBe('transform');
  });
});
