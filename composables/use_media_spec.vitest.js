// @ts-check

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useMedia } from './use_media.js';

describe('useMedia', () => {
  /** @type {import('vitest').Mock} */
  let mockCreateElement;
  /** @type {any} */
  let mockAudioElement;
  /** @type {any} */
  let mockVideoElement;

  beforeEach(() => {
    mockAudioElement = {
      preload: '',
      src: '',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      pause: vi.fn(),
      play: vi.fn(),
      readyState: 0,
    };

    mockVideoElement = {
      preload: '',
      src: '',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      pause: vi.fn(),
      play: vi.fn(),
      readyState: 0,
    };

    mockCreateElement = vi.fn((tag) => {
      if (tag === 'audio') return mockAudioElement;
      if (tag === 'video') return mockVideoElement;
      return null;
    });

    document.createElement = mockCreateElement;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('loadMedia', () => {
    it('sets mediaState to loaded when no media files provided', async () => {
      const { loadMedia, mediaState } = useMedia([]);

      await loadMedia();

      expect(mediaState.value).toBe('loaded');
    });

    it('sets mediaState to loading during media loading', async () => {
      const { loadMedia, mediaState } = useMedia(['test.mp4']);

      mockVideoElement.addEventListener.mockImplementation(
        (/** @type {string} */ event, /** @type {Function} */ callback) => {
          if (event === 'canplaythrough') {
            setTimeout(callback, 0);
          }
        }
      );

      const loadPromise = loadMedia();

      expect(mediaState.value).toBe('loading');

      await loadPromise;
    });

    it('creates video element for video file extensions', async () => {
      const { loadMedia } = useMedia(['test.mp4']);

      mockVideoElement.addEventListener.mockImplementation(
        (/** @type {string} */ event, /** @type {Function} */ callback) => {
          if (event === 'canplaythrough') {
            setTimeout(callback, 0);
          }
        }
      );

      await loadMedia();

      expect(mockCreateElement).toHaveBeenCalledWith('video');
      expect(mockVideoElement.preload).toBe('auto');
      expect(mockVideoElement.src).toBe('test.mp4');
    });

    it('creates audio element for audio file extensions', async () => {
      const { loadMedia } = useMedia(['test.mp3']);

      mockAudioElement.addEventListener.mockImplementation(
        (/** @type {string} */ event, /** @type {Function} */ callback) => {
          if (event === 'canplaythrough') {
            setTimeout(callback, 0);
          }
        }
      );

      await loadMedia();

      expect(mockCreateElement).toHaveBeenCalledWith('audio');
      expect(mockAudioElement.preload).toBe('auto');
      expect(mockAudioElement.src).toBe('test.mp3');
    });

    it('sets mediaState to error when media loading fails', async () => {
      const { loadMedia, mediaState } = useMedia(['invalid.mp4']);

      mockVideoElement.addEventListener.mockImplementation(
        (/** @type {string} */ event, /** @type {Function} */ callback) => {
          if (event === 'error') {
            setTimeout(callback, 0);
          }
        }
      );

      await loadMedia();

      expect(mediaState.value).toBe('error');
    });

    it('handles multiple media files concurrently', async () => {
      const { loadMedia, mediaState } = useMedia(['video.mp4', 'audio.mp3']);

      mockVideoElement.addEventListener.mockImplementation(
        (/** @type {string} */ event, /** @type {Function} */ callback) => {
          if (event === 'canplaythrough') {
            setTimeout(callback, 0);
          }
        }
      );

      mockAudioElement.addEventListener.mockImplementation(
        (/** @type {string} */ event, /** @type {Function} */ callback) => {
          if (event === 'canplaythrough') {
            setTimeout(callback, 0);
          }
        }
      );

      await loadMedia();

      expect(mediaState.value).toBe('loaded');
      expect(mockCreateElement).toHaveBeenCalledTimes(2);
    });
  });

  describe('whitelistMedia', () => {
    it('resolves immediately when no media files provided', async () => {
      const { whitelistMedia } = useMedia([]);
      const mockEvent = new Event('click');

      await expect(whitelistMedia(mockEvent)).resolves.toBeUndefined();
    });

    it('attempts to play and pause media for whitelisting', async () => {
      const { whitelistMedia } = useMedia(['test.mp4']);
      const mockEvent = new Event('click');

      mockVideoElement.addEventListener.mockImplementation(
        (/** @type {string} */ event, /** @type {Function} */ callback) => {
          if (event === 'canplaythrough') {
            setTimeout(callback, 0);
          }
        }
      );

      mockVideoElement.play.mockResolvedValue();

      await whitelistMedia(mockEvent);

      expect(mockVideoElement.play).toHaveBeenCalled();
      expect(mockVideoElement.pause).toHaveBeenCalled();
    });

    it('handles play promise rejection gracefully', async () => {
      const { whitelistMedia } = useMedia(['test.mp4']);
      const mockEvent = new Event('click');

      mockVideoElement.addEventListener.mockImplementation(
        (/** @type {string} */ event, /** @type {Function} */ callback) => {
          if (event === 'canplaythrough') {
            setTimeout(callback, 0);
          }
        }
      );

      mockVideoElement.play.mockRejectedValue(new Error('Autoplay blocked'));

      await expect(whitelistMedia(mockEvent)).resolves.toBeUndefined();
    });
  });

  describe('mediaState', () => {
    it('starts in idle state', () => {
      const { mediaState } = useMedia([]);

      expect(mediaState.value).toBe('idle');
    });

    it('transitions through states during loading process', async () => {
      const { loadMedia, mediaState } = useMedia(['test.mp4']);

      expect(mediaState.value).toBe('idle');

      mockVideoElement.addEventListener.mockImplementation(
        (/** @type {string} */ event, /** @type {Function} */ callback) => {
          if (event === 'canplaythrough') {
            setTimeout(callback, 0);
          }
        }
      );

      const loadPromise = loadMedia();

      expect(mediaState.value).toBe('loading');

      await loadPromise;

      expect(mediaState.value).toBe('loaded');
    });
  });

  describe('error handling', () => {
    it('sets mediaState to error for subtitle files', async () => {
      const { loadMedia, mediaState } = useMedia(['subtitle.srt']);

      await loadMedia();

      expect(mediaState.value).toBe('error');
    });
  });
});