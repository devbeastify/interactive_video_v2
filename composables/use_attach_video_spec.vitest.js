// @ts-check

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { attachVideo } from './use_attach_video.js';

describe('attachVideo', () => {
  /** @type {HTMLElement} */
  let mockTargetElm;
  /** @type {HTMLTemplateElement} */
  let mockTemplateElm;
  /** @type {HTMLElement} */
  let mockVideoReference;
  /** @type {HTMLElement} */
  let mockVideoElement;
  /** @type {ReturnType<typeof vi.fn>} */
  let mockInitVideoPlayer;

  beforeEach(() => {
    mockTargetElm = document.createElement('div');
    mockTemplateElm = document.createElement('template');
    mockVideoReference = document.createElement('div');
    mockVideoElement = document.createElement('div');
    mockInitVideoPlayer = vi.fn().mockImplementation((videoId) => {
      return videoId && videoId.trim() ? { player: 'mock-player' } : undefined;
    });

    mockVideoElement.id = 'test-video';
    mockVideoElement.className = 'js-video-reference';
    mockVideoReference.appendChild(mockVideoElement);

    const fragment = document.createDocumentFragment();
    fragment.appendChild(mockVideoReference);
    Object.defineProperty(mockTemplateElm, 'content', {
      value: fragment,
      writable: true,
    });

    document.body.appendChild(mockTargetElm);
    document.body.appendChild(mockTemplateElm);

    // @ts-ignore
    global.window.initVideoPlayer = mockInitVideoPlayer;
  });

  it('attaches video from template to target element', () => {
    const templateSelector = 'template';

    const result = attachVideo(templateSelector, mockTargetElm);

    expect(mockTargetElm.querySelector('.js-video-reference')).toBeTruthy();
    expect(mockInitVideoPlayer).toHaveBeenCalledWith('test-video');
    expect(result).toBeDefined();
  });

  it('cleans up existing videos before attaching new one', () => {
    const existingVideo = document.createElement('div');
    existingVideo.className = 'js-video-reference';
    mockTargetElm.appendChild(existingVideo);

    const templateSelector = 'template';

    attachVideo(templateSelector, mockTargetElm);

    const videos = mockTargetElm.querySelectorAll('.js-video-reference');
    expect(videos).toHaveLength(1);
  });

  it('returns undefined when template is not found', () => {
    const templateSelector = 'non-existent-template';

    const result = attachVideo(templateSelector, mockTargetElm);

    expect(result).toBeUndefined();
  });

  it('returns undefined when template has no content', () => {
    const emptyTemplate = document.createElement('template');
    document.body.appendChild(emptyTemplate);

    const templateSelector = 'template:last-child';

    const result = attachVideo(templateSelector, mockTargetElm);

    expect(result).toBeUndefined();
  });

  it('returns undefined when template has no video reference', () => {
    const templateWithoutVideo = document.createElement('template');
    const emptyDiv = document.createElement('div');
    const fragment = document.createDocumentFragment();
    fragment.appendChild(emptyDiv);
    Object.defineProperty(templateWithoutVideo, 'content', {
      value: fragment,
      writable: true,
    });
    document.body.appendChild(templateWithoutVideo);

    const templateSelector = 'template:last-child';

    const result = attachVideo(templateSelector, mockTargetElm);

    expect(result).toBeUndefined();
  });

  it('returns undefined when initVideoPlayer is not available', () => {
    // @ts-ignore
    delete global.window.initVideoPlayer;

    const templateSelector = 'template';

    const result = attachVideo(templateSelector, mockTargetElm);

    expect(result).toBeUndefined();
  });

  it('returns undefined when video element has no id', () => {
    const templateWithoutId = document.createElement('template');
    const videoRefWithoutId = document.createElement('div');
    const videoElementWithoutId = document.createElement('div');

    videoElementWithoutId.className = 'js-video-reference';
    videoRefWithoutId.appendChild(videoElementWithoutId);

    const fragment = document.createDocumentFragment();
    fragment.appendChild(videoRefWithoutId);
    Object.defineProperty(templateWithoutId, 'content', {
      value: fragment,
      writable: true,
    });
    document.body.appendChild(templateWithoutId);

    const templateSelector = 'template:last-child';

    const result = attachVideo(templateSelector, mockTargetElm);

    expect(result).toBeUndefined();
  });
});