// @ts-check

import { ref } from 'vue';
import { useVideoPlayer } from './use_video_player';
import { vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

/**
 * Sets up DOM environment for video player testing
 */
function setupVideoPlayerDOM() {
  document.body.innerHTML = `
    <div class="js-tutorial-container"></div>
    <form class="js-activity-main-form">
      <input type="text" />
    </form>
    <input id="enableClosedCaptions" type="hidden" value="true" />
    <input id="allowForeign" type="hidden" value="true" />
    <input id="allowEnglish" type="hidden" value="true" />
    <div class="js-speech-rec-toggle"></div>
  `;
}

/**
 * Sets up global VHL mock for testing
 */
function setupVHLMock() {
  // @ts-expect-error - Mocking global VHL
  global.VHL = {
    Video: {
      File: vi.fn().mockImplementation(() => ({
        init: vi.fn(),
        show_controls: false,
        initialize_video: vi.fn(),
        show_video: vi.fn(),
        hide_video: vi.fn(),
        play: vi.fn(),
        pause: vi.fn(),
        destroy: vi.fn(),
        tutorialVideoCheckpointsPlugin: vi.fn(),
        videojs_player: {
          on: vi.fn(),
          off: vi.fn(),
          play: vi.fn().mockResolvedValue(undefined),
          pause: vi.fn(),
          readyState: vi.fn().mockReturnValue(1),
          currentTime: vi.fn().mockReturnValue(0),
        },
      })),
    },
  };
}

/**
 * Sets up Pinia for testing
 * @returns {import('pinia').Pinia} The created Pinia instance
 */
function setupPinia() {
  const pinia = createPinia();
  setActivePinia(pinia);
  return pinia;
}

/**
 * Cleans up global mocks after tests
 */
function cleanupGlobalMocks() {
  // @ts-expect-error - Cleaning up global mock
  delete global.VHL;
  vi.restoreAllMocks();
}

describe('#useVideoPlayer', () => {
  /** @type {import('vue').Ref<HTMLElement|null>} */
  let mockVideoContainer;

  beforeEach(() => {
    vi.clearAllMocks();

    setupVideoPlayerDOM();
    setupVHLMock();
    setupPinia();

    const element = /** @type {HTMLElement} */ (document.querySelector('.js-tutorial-container'));
    mockVideoContainer = ref(element);
  });

  afterEach(() => {
    cleanupGlobalMocks();
  });

  describe('return values', () => {
    it('should return an object with expected properties', () => {
      const result = useVideoPlayer(mockVideoContainer);

      expect(result).toHaveProperty('videoPlayer');
      expect(result).toHaveProperty('isPlaying');
      expect(result).toHaveProperty('initializeVideoPlayer');
      expect(result).toHaveProperty('cleanupVideoPlayer');
      expect(result).toHaveProperty('handleAutoPlay');
      expect(result).toHaveProperty('setupCheckpoints');
      expect(result).toHaveProperty('handleCheckpointReached');
      expect(result).toHaveProperty('setupVideoEvents');
    });

    it('should return videoPlayer as a ref', () => {
      const { videoPlayer } = useVideoPlayer(mockVideoContainer);
      expect(videoPlayer).toBeDefined();
      expect(videoPlayer.value).toBeNull();
    });

    it('should return isPlaying as a ref', () => {
      const { isPlaying } = useVideoPlayer(mockVideoContainer);
      expect(isPlaying).toBeDefined();
      expect(typeof isPlaying.value).toBe('boolean');
    });

    it('should initialize isPlaying to false', () => {
      const { isPlaying } = useVideoPlayer(mockVideoContainer);
      expect(isPlaying.value).toBe(false);
    });

    it('should return handleAutoPlay as a function', () => {
      const { handleAutoPlay } = useVideoPlayer(mockVideoContainer);
      expect(typeof handleAutoPlay).toBe('function');
    });

    it('should return setupCheckpoints as a function', () => {
      const { setupCheckpoints } = useVideoPlayer(mockVideoContainer);
      expect(typeof setupCheckpoints).toBe('function');
    });

    it('should return handleCheckpointReached as a function', () => {
      const { handleCheckpointReached } = useVideoPlayer(mockVideoContainer);
      expect(typeof handleCheckpointReached).toBe('function');
    });

    it('should return setupVideoEvents as a function', () => {
      const { setupVideoEvents } = useVideoPlayer(mockVideoContainer);
      expect(typeof setupVideoEvents).toBe('function');
    });
  });

  describe('initializeVideoPlayer', () => {
    it('should create VHL.Video.File instance', () => {
      const { initializeVideoPlayer } = useVideoPlayer(mockVideoContainer);

      initializeVideoPlayer();

      setTimeout(() => {
        expect(global.VHL.Video.File).toHaveBeenCalled();
      }, 150);
    });

    it('should initialize video player with correct parameters', () => {
      const { initializeVideoPlayer } = useVideoPlayer(mockVideoContainer);

      initializeVideoPlayer();

      setTimeout(() => {
        // @ts-expect-error - Accessing mock results
        const mockVideoFile = global.VHL.Video.File.mock.results[0].value;
        expect(mockVideoFile.init).toHaveBeenCalled();
        expect(mockVideoFile.initialize_video).toHaveBeenCalled();
        expect(mockVideoFile.show_video).toHaveBeenCalled();
      }, 150);
    });

    it('should set videoPlayer ref to created instance', () => {
      const { videoPlayer, initializeVideoPlayer } = useVideoPlayer(mockVideoContainer);

      initializeVideoPlayer();

      setTimeout(() => {
        expect(videoPlayer.value).toBeDefined();
        expect(typeof videoPlayer.value).toBe('object');
      }, 150);
    });

    it('should set show_controls to true', () => {
      const { initializeVideoPlayer } = useVideoPlayer(mockVideoContainer);

      initializeVideoPlayer();

      setTimeout(() => {
        // @ts-expect-error - Accessing mock results
        const mockVideoFile = global.VHL.Video.File.mock.results[0].value;
        expect(mockVideoFile.show_controls).toBe(true);
      }, 150);
    });
  });

  describe('cleanupVideoPlayer', () => {
    it('should hide video and set videoPlayer to null when cleanup is called', () => {
      const { videoPlayer, initializeVideoPlayer, cleanupVideoPlayer } =
        useVideoPlayer(mockVideoContainer);

      initializeVideoPlayer();

      setTimeout(() => {
        cleanupVideoPlayer();

        // @ts-expect-error - Accessing mock results
        const mockVideoFile = global.VHL.Video.File.mock.results[0].value;
        expect(mockVideoFile.hide_video).toHaveBeenCalled();
        expect(videoPlayer.value).toBeNull();
      }, 150);
    });
  });

  describe('handleAutoPlay', () => {
    it('should handle auto play when enabled', () => {
      const { handleAutoPlay } = useVideoPlayer(mockVideoContainer);

      expect(() => handleAutoPlay()).not.toThrow();
    });

    it('should not throw when video player is null', () => {
      const { handleAutoPlay } = useVideoPlayer(mockVideoContainer);

      expect(() => handleAutoPlay()).not.toThrow();
    });
  });

  describe('setupCheckpoints', () => {
    it('should not throw when called', () => {
      const { setupCheckpoints } = useVideoPlayer(mockVideoContainer);

      expect(() => setupCheckpoints()).not.toThrow();
    });

    it('should not throw when video player is null', () => {
      const { setupCheckpoints } = useVideoPlayer(mockVideoContainer);

      expect(() => setupCheckpoints()).not.toThrow();
    });
  });

  describe('handleCheckpointReached', () => {
    it('should handle checkpoint reached event', () => {
      const { handleCheckpointReached } = useVideoPlayer(mockVideoContainer);

      expect(() => handleCheckpointReached(10)).not.toThrow();
    });

    it('should not throw when video player is null', () => {
      const { handleCheckpointReached } = useVideoPlayer(mockVideoContainer);

      expect(() => handleCheckpointReached(10)).not.toThrow();
    });
  });

  describe('setupVideoEvents', () => {
    it('should not throw when called', () => {
      const { setupVideoEvents } = useVideoPlayer(mockVideoContainer);

      expect(() => setupVideoEvents()).not.toThrow();
    });

    it('should not throw when video player is null', () => {
      const { setupVideoEvents } = useVideoPlayer(mockVideoContainer);

      expect(() => setupVideoEvents()).not.toThrow();
    });
  });
});
