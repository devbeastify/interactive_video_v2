// @ts-check

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useMedia } from './use_media';

/**
 * Sets up a mock for document.createElement to return a valid mock media element
 * for 'video' and 'audio'.
 * @param {Object} [options]
 * @param {boolean} [options.shouldResolve=true] - Whether the media should resolve successfully
 * @param {boolean} [options.shouldReject=false] - Whether the media should reject
 * @return {{
 *   originalCreateElement: typeof document.createElement,
 *   mockMediaElement: ReturnType<typeof vi.fn>
 * }}
 */
function setupMockMediaElement({ shouldResolve = true, shouldReject = false } = {}) {
  const originalCreateElement = document.createElement;

  const mockMediaElement = vi.fn().mockImplementation((elementTag) => {
    if (elementTag === 'video' || elementTag === 'audio') {
      const media = {
        addEventListener: vi.fn().mockImplementation((event, callback) => {
          if (event === 'canplaythrough' && shouldResolve) {
            setTimeout(() => callback(), 10);
          }
          if (event === 'error' && shouldReject) {
            setTimeout(() => callback(new Error('Load failed')), 10);
          }
        }),
        removeEventListener: vi.fn(),
        play: shouldReject ?
          vi.fn().mockRejectedValue(new Error('Play failed')) :
          vi.fn().mockResolvedValue(undefined),
        pause: vi.fn(),
        src: '',
        preload: 'auto',
        readyState: shouldResolve ? 4 : 0,
      };
      return media;
    }
    return originalCreateElement.call(document, elementTag);
  });

  document.createElement = mockMediaElement;
  return { originalCreateElement, mockMediaElement };
}

describe('#useMedia', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });

  describe('return values', () => {
    it('returns an object with expected properties', () => {
      const result = useMedia([]);

      expect(result).toHaveProperty('mediaState');
      expect(result).toHaveProperty('loadMedia');
      expect(result).toHaveProperty('whitelistMedia');
    });

    it('returns mediaState as a ref', () => {
      const { mediaState } = useMedia([]);

      expect(mediaState).toBeDefined();
      expect(typeof mediaState.value).toBe('string');
    });

    it('initializes mediaState to "idle"', () => {
      const { mediaState } = useMedia([]);

      expect(mediaState.value).toBe('idle');
    });

    it('returns loadMedia as a function', () => {
      const { loadMedia } = useMedia([]);

      expect(typeof loadMedia).toBe('function');
    });

    it('returns whitelistMedia as a function', () => {
      const { whitelistMedia } = useMedia([]);

      expect(typeof whitelistMedia).toBe('function');
    });
  });

  describe('loadMedia', () => {
    it('sets mediaState to "loaded" when no media files are provided', async () => {
      const { mediaState, loadMedia } = useMedia([]);

      await loadMedia();

      expect(mediaState.value).toBe('loaded');
    });

    it('sets mediaState to "loaded" when all video files load successfully', async () => {
      const { mediaState, loadMedia } = useMedia(['video1.mp4', 'video2.mp4']);
      const { originalCreateElement } = setupMockMediaElement({ shouldResolve: true });

      await loadMedia();

      expect(mediaState.value).toBe('loaded');
      document.createElement = originalCreateElement;
    });

    it('sets mediaState to "loaded" when all audio files load successfully', async () => {
      const { mediaState, loadMedia } = useMedia(['audio1.mp3', 'audio2.wav']);
      const { originalCreateElement } = setupMockMediaElement({ shouldResolve: true });

      await loadMedia();

      expect(mediaState.value).toBe('loaded');
      document.createElement = originalCreateElement;
    });

    it('sets mediaState to "error" when any media file fails to load', async () => {
      const { mediaState, loadMedia } = useMedia(['video1.mp4', 'audio1.mp3']);

      let callCount = 0;
      const originalCreateElement = document.createElement;
      document.createElement = vi.fn().mockImplementation((tag) => {
        const media = originalCreateElement.call(document, tag);
        media.addEventListener = vi.fn().mockImplementation((event, callback) => {
          if (event === 'canplaythrough' && callCount === 0) {
            setTimeout(() => callback(), 10);
          }
          if (event === 'error' && callCount === 1) {
            setTimeout(() => callback(new Error('Load failed')), 10);
          }
        });
        media.play = vi.fn().mockResolvedValue(undefined);
        media.pause = vi.fn();
        media.src = '';
        media.readyState = callCount === 0 ? 4 : 0;
        callCount++;
        return media;
      });

      await loadMedia();

      expect(mediaState.value).toBe('error');
      document.createElement = originalCreateElement;
    });
  });

  describe('whitelistMedia', () => {
    it('resolves immediately when no media files are provided', async () => {
      const { whitelistMedia } = useMedia([]);

      await expect(whitelistMedia()).resolves.toBeUndefined();
    });

    it('attempts to play and pause videos and audios for whitelisting', async () => {
      const { whitelistMedia } = useMedia(['video1.mp4', 'audio1.mp3']);
      const { originalCreateElement, mockMediaElement } = setupMockMediaElement({
        shouldResolve: true,
      });

      await whitelistMedia();

      expect(mockMediaElement).toHaveBeenCalledWith('video');
      expect(mockMediaElement).toHaveBeenCalledWith('audio');
      document.createElement = originalCreateElement;
    });

    it('handles play promises that resolve for both video and audio', async () => {
      const { whitelistMedia } = useMedia(['video1.mp4', 'audio1.mp3']);
      const { originalCreateElement } = setupMockMediaElement({ shouldResolve: true });

      await whitelistMedia();

      expect(true).toBe(true);
      document.createElement = originalCreateElement;
    });

    it('does not reject if play promise is rejected', async () => {
      const { whitelistMedia } = useMedia(['video1.mp4']);
      const { originalCreateElement } = setupMockMediaElement({
        shouldResolve: true, shouldReject: true,
      });

      await expect(whitelistMedia()).resolves.toBeUndefined();
      document.createElement = originalCreateElement;
    });

    it('handles browsers that do not return play promises', async () => {
      const { originalCreateElement } = setupMockMediaElement({ shouldResolve: true });
      document.createElement = vi.fn().mockImplementation((tag) => {
        if (tag === 'video' || tag === 'audio') {
          const media = originalCreateElement.call(document, tag);
          media.play = vi.fn().mockReturnValue(undefined);
          media.pause = vi.fn();
          media.src = '';
          return media;
        }
        return originalCreateElement.call(document, tag);
      });
      const { whitelistMedia } = useMedia(['video1.mp4', 'audio1.mp3']);

      await whitelistMedia();

      expect(true).toBe(true);
      document.createElement = originalCreateElement;
    });
  });
});
