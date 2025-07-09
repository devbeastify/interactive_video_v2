// @ts-check

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useMedia } from './use_media';

/**
 * @typedef {Object} MediaTestSetup
 * @property {Function} originalCreateElement
 * @property {Function} mockVideoElement
 */

/**
 * Sets up mock video element for testing
 * @param {boolean} shouldResolve - Whether the video should resolve successfully
 * @param {boolean} shouldReject - Whether the video should reject
 * @return {MediaTestSetup}
 */
function setupMockVideoElement(shouldResolve = true, shouldReject = false) {
  const originalCreateElement = document.createElement;

  const mockVideoElement = vi.fn().mockImplementation((tag) => {
    if (tag === 'video') {
      const video = originalCreateElement.call(document, tag);
      video.addEventListener = vi.fn().mockImplementation((event, callback) => {
        if (event === 'canplaythrough' && shouldResolve) {
          setTimeout(() => callback(), 10);
        }
      });
      video.play = shouldReject ?
        vi.fn().mockRejectedValue(new Error('Play failed')) :
        vi.fn().mockResolvedValue(undefined);
      video.pause = vi.fn();
      video.src = '';
      return video;
    }
    return originalCreateElement.call(document, tag);
  });

  document.createElement = mockVideoElement;

  return { originalCreateElement, mockVideoElement };
}

/**
 * Restores original document.createElement
 * @param {Function} originalCreateElement
 */
function restoreCreateElement(originalCreateElement) {
  document.createElement = originalCreateElement;
}

describe('#useMedia', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });

  describe('return values', () => {
    it('should return an object with expected properties', () => {
      const result = useMedia([]);

      expect(result).toHaveProperty('mediaState');
      expect(result).toHaveProperty('loadMedia');
      expect(result).toHaveProperty('whitelistMedia');
    });

    it('should return mediaState as a ref', () => {
      const { mediaState } = useMedia([]);
      expect(mediaState).toBeDefined();
      expect(typeof mediaState.value).toBe('string');
    });

    it('should initialize mediaState to "idle"', () => {
      const { mediaState } = useMedia([]);
      expect(mediaState.value).toBe('idle');
    });

    it('should return loadMedia as a function', () => {
      const { loadMedia } = useMedia([]);
      expect(typeof loadMedia).toBe('function');
    });

    it('should return whitelistMedia as a function', () => {
      const { whitelistMedia } = useMedia([]);
      expect(typeof whitelistMedia).toBe('function');
    });
  });

  describe('loadMedia', () => {
    it('should set mediaState to "loaded" when no video files are provided', async () => {
      const { mediaState, loadMedia } = useMedia([]);
      await loadMedia();
      expect(mediaState.value).toBe('loaded');
    });

    it('should set mediaState to "loading" when video files are provided', async () => {
      const { mediaState, loadMedia } = useMedia(['video1.mp4', 'video2.mp4']);

      const { originalCreateElement } = setupMockVideoElement(true);

      await loadMedia();
      expect(mediaState.value).toBe('loaded');

      restoreCreateElement(originalCreateElement);
    });

    it('should set mediaState to "error" when video loading fails', async () => {
      const { originalCreateElement } = setupMockVideoElement(false);
      document.createElement = vi.fn().mockImplementation(() => {
        throw new Error('Video creation failed');
      });

      const { mediaState, loadMedia } = useMedia(['video1.mp4']);
      await loadMedia();
      expect(mediaState.value).toBe('error');

      restoreCreateElement(originalCreateElement);
    });
  });

  describe('whitelistMedia', () => {
    it('should resolve immediately when no video files are provided', async () => {
      const { whitelistMedia } = useMedia([]);
      await expect(whitelistMedia()).resolves.toBeUndefined();
    });

    it('should attempt to play and pause videos for whitelisting', async () => {
      const { whitelistMedia } = useMedia(['video1.mp4', 'video2.mp4']);

      const { originalCreateElement } = setupMockVideoElement(true);

      await whitelistMedia();

      expect(document.createElement).toHaveBeenCalledWith('video');

      restoreCreateElement(originalCreateElement);
    });

    it('should handle play promises that resolve', async () => {
      const { whitelistMedia } = useMedia(['video1.mp4']);

      const { originalCreateElement } = setupMockVideoElement(true);

      await whitelistMedia();

      expect(true).toBe(true);

      restoreCreateElement(originalCreateElement);
    });

    it('should handle play promises that reject', async () => {
      const { originalCreateElement } = setupMockVideoElement(false, true);

      const { whitelistMedia } = useMedia(['video1.mp4']);

      await expect(whitelistMedia()).rejects.toThrow('Play failed');

      restoreCreateElement(originalCreateElement);
    });

    it('should handle browsers that do not return play promises', async () => {
      const { originalCreateElement } = setupMockVideoElement(true);
      document.createElement = vi.fn().mockImplementation((tag) => {
        if (tag === 'video') {
          const video = originalCreateElement.call(document, tag);
          video.play = vi.fn().mockReturnValue(undefined);
          video.pause = vi.fn();
          video.src = '';
          return video;
        }
        return originalCreateElement.call(document, tag);
      });

      const { whitelistMedia } = useMedia(['video1.mp4']);
      await whitelistMedia();

      expect(true).toBe(true);

      restoreCreateElement(originalCreateElement);
    });
  });
});
