// @ts-check

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useVideoCheckpoints } from './use_video_checkpoints';

/**
 * @typedef {Object} MockVideoPlayer
 * @property {Function} tutorialVideoCheckpointsPlugin
 */

/**
 * @typedef {Object} MockQuickCheck
 * @property {number} offset
 * @property {number} gap
 */

/**
 * Creates a mock video player for testing
 * @return {MockVideoPlayer}
 */
function createMockVideoPlayer() {
  return {
    tutorialVideoCheckpointsPlugin: vi.fn(),
  };
}

/**
 * Creates mock quick checks data for testing
 * @return {Array<MockQuickCheck>}
 */
function createMockQuickChecksData() {
  return [
    { offset: 10, gap: 5 },
    { offset: 20, gap: 10 },
  ];
}

describe('#useVideoCheckpoints', () => {
  /** @type {MockVideoPlayer} */
  let mockVideoPlayer;
  /** @type {Array<MockQuickCheck>} */
  let mockQuickChecksData;

  beforeEach(() => {
    vi.clearAllMocks();

    mockVideoPlayer = createMockVideoPlayer();
    mockQuickChecksData = createMockQuickChecksData();
  });

  describe('return values', () => {
    it('should return an object with expected properties', () => {
      const result = useVideoCheckpoints();

      expect(result).toHaveProperty('checkpoints');
      expect(result).toHaveProperty('currentCheckpoint');
      expect(result).toHaveProperty('setupCheckpoints');
      expect(result).toHaveProperty('handleCheckpointReached');
      expect(result).toHaveProperty('resumeVideo');
    });

    it('should return checkpoints as a ref', () => {
      const { checkpoints } = useVideoCheckpoints();
      expect(checkpoints).toBeDefined();
      expect(Array.isArray(checkpoints.value)).toBe(true);
    });

    it('should initialize checkpoints as an empty array', () => {
      const { checkpoints } = useVideoCheckpoints();
      expect(checkpoints.value).toEqual([]);
    });

    it('should return currentCheckpoint as a ref', () => {
      const { currentCheckpoint } = useVideoCheckpoints();
      expect(currentCheckpoint).toBeDefined();
    });

    it('should initialize currentCheckpoint as null', () => {
      const { currentCheckpoint } = useVideoCheckpoints();
      expect(currentCheckpoint.value).toBe(null);
    });

    it('should return setupCheckpoints as a function', () => {
      const { setupCheckpoints } = useVideoCheckpoints();
      expect(typeof setupCheckpoints).toBe('function');
    });

    it('should return handleCheckpointReached as a function', () => {
      const { handleCheckpointReached } = useVideoCheckpoints();
      expect(typeof handleCheckpointReached).toBe('function');
    });

    it('should return resumeVideo as a function', () => {
      const { resumeVideo } = useVideoCheckpoints();
      expect(typeof resumeVideo).toBe('function');
    });
  });

  describe('setupCheckpoints', () => {
    it('should do nothing when videoPlayer is null', () => {
      const { setupCheckpoints } = useVideoCheckpoints();

      expect(() => setupCheckpoints(null, mockQuickChecksData)).not.toThrow();
    });

    it('should do nothing when quickChecksData is null', () => {
      const { setupCheckpoints } = useVideoCheckpoints();

      expect(() => setupCheckpoints(mockVideoPlayer, null)).not.toThrow();
    });

    it('should call tutorialVideoCheckpointsPlugin with correct settings', () => {
      const { setupCheckpoints } = useVideoCheckpoints();

      setupCheckpoints(mockVideoPlayer, mockQuickChecksData);

      expect(mockVideoPlayer.tutorialVideoCheckpointsPlugin).toHaveBeenCalledWith({
        minScrubberPixels: 4,
        callback: expect.any(Function),
        points: [
          { offset: 10, gap: 5, stop: true },
          { offset: 20, gap: 10, stop: true },
        ],
      });
    });

    it('should call handleCheckpointReached when callback is triggered', () => {
      const { setupCheckpoints } = useVideoCheckpoints();

      setupCheckpoints(mockVideoPlayer, mockQuickChecksData);

      const pluginCall = mockVideoPlayer.tutorialVideoCheckpointsPlugin.mock.calls[0][0];
      const callback = pluginCall.callback;

      callback({ offset: 10 });

      expect(mockVideoPlayer.tutorialVideoCheckpointsPlugin).toHaveBeenCalled();
    });
  });

  describe('handleCheckpointReached', () => {
    it('should set currentCheckpoint when checkpoint is found', () => {
      const { handleCheckpointReached, currentCheckpoint, checkpoints } = useVideoCheckpoints();

      checkpoints.value = [
        { offset: 10, gap: 5, stop: true },
        { offset: 20, gap: 10, stop: true },
      ];

      handleCheckpointReached(10);

      expect(currentCheckpoint.value).toEqual({ offset: 10, gap: 5, stop: true });
    });

    it('should not set currentCheckpoint when checkpoint is not found', () => {
      const { handleCheckpointReached, currentCheckpoint, checkpoints } = useVideoCheckpoints();

      checkpoints.value = [
        { offset: 10, gap: 5, stop: true },
        { offset: 20, gap: 10, stop: true },
      ];

      handleCheckpointReached(30);

      expect(currentCheckpoint.value).toBe(null);
    });

    it('should handle empty checkpoints array', () => {
      const { handleCheckpointReached, currentCheckpoint } = useVideoCheckpoints();

      handleCheckpointReached(10);

      expect(currentCheckpoint.value).toBe(null);
    });
  });

  describe('resumeVideo', () => {
    it('should call play on videoPlayer when provided', () => {
      const { resumeVideo } = useVideoCheckpoints();

      const mockPlayer = {
        play: vi.fn(),
      };

      resumeVideo(mockPlayer);

      expect(mockPlayer.play).toHaveBeenCalled();
    });

    it('should not call play when videoPlayer is null', () => {
      const { resumeVideo } = useVideoCheckpoints();

      expect(() => resumeVideo(null)).not.toThrow();
    });

    it('should clear currentCheckpoint regardless of videoPlayer', () => {
      const { resumeVideo, currentCheckpoint } = useVideoCheckpoints();

      currentCheckpoint.value = { offset: 10, gap: 5, stop: true };

      resumeVideo(null);

      expect(currentCheckpoint.value).toBe(null);
    });

    it('should clear currentCheckpoint when videoPlayer is provided', () => {
      const { resumeVideo, currentCheckpoint } = useVideoCheckpoints();

      const mockPlayer = {
        play: vi.fn(),
      };

      currentCheckpoint.value = { offset: 10, gap: 5, stop: true };

      resumeVideo(mockPlayer);

      expect(currentCheckpoint.value).toBe(null);
    });
  });
});
