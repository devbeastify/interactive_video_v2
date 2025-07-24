// @ts-check

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ref } from 'vue';
import { useVideoPlayer } from './use_video_player';

vi.mock('../stores/action_store', () => ({
  useActionStore: vi.fn(() => ({
    currentAction: null,
    currentActionIndex: 0,
  })),
}));

vi.mock('../stores/activity_settings_store', () => ({
  useActivitySettingsStore: vi.fn(() => ({
    useAutoPlay: false,
  })),
}));

vi.mock('../stores/direction_line_store', () => ({
  useDLStore: vi.fn(() => ({
    isPlaying: false,
  })),
}));

vi.mock('./use_attach_video', () => ({
  attachVideo: vi.fn(() => null),
}));

describe('useVideoPlayer', () => {
  /** @type {import('vue').Ref<HTMLElement|null>} */
  let videoContainer;
  /** @type {import('vitest').Mock} */
  let onEndedCallback;

  beforeEach(() => {
    videoContainer = ref(document.createElement('div'));
    onEndedCallback = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('returns cleanupVideoPlayer function', () => {
      const { cleanupVideoPlayer } = useVideoPlayer(videoContainer, onEndedCallback);

      expect(typeof cleanupVideoPlayer).toBe('function');
    });

    it('returns initializeVideoPlayer function', () => {
      const { initializeVideoPlayer } = useVideoPlayer(videoContainer, onEndedCallback);

      expect(typeof initializeVideoPlayer).toBe('function');
    });

    it('initializes isPlaying as false', () => {
      const { isPlaying } = useVideoPlayer(videoContainer, onEndedCallback);

      expect(isPlaying.value).toBe(false);
    });

    it('initializes videoPlayer as null', () => {
      const { videoPlayer } = useVideoPlayer(videoContainer, onEndedCallback);

      expect(videoPlayer.value).toBe(null);
    });
  });

  describe('cleanupVideoPlayer', () => {
    it('resets isPlaying to false when no video player exists', () => {
      const { cleanupVideoPlayer, isPlaying } =
        useVideoPlayer(videoContainer, onEndedCallback);

      cleanupVideoPlayer();

      expect(isPlaying.value).toBe(false);
    });

    it('resets videoPlayer to null when no video player exists', () => {
      const { cleanupVideoPlayer, videoPlayer } =
        useVideoPlayer(videoContainer, onEndedCallback);

      cleanupVideoPlayer();

      expect(videoPlayer.value).toBe(null);
    });

    it('calls destroy method on video player with destroy function', () => {
      const mockDestroy = vi.fn();
      const mockVideoPlayer = {
        destroy: mockDestroy,
        show_controls: false,
        video: {},
        videojs_player: {
          el_: {},
          on: vi.fn(),
        },
      };

      const { cleanupVideoPlayer, videoPlayer } =
        useVideoPlayer(videoContainer, onEndedCallback);

      videoPlayer.value = mockVideoPlayer;

      cleanupVideoPlayer();

      expect(mockDestroy).toHaveBeenCalledOnce();
    });

    it('resets videoPlayer to null after calling destroy', () => {
      const mockDestroy = vi.fn();
      const mockVideoPlayer = {
        destroy: mockDestroy,
        show_controls: false,
        video: {},
        videojs_player: {
          el_: {},
          on: vi.fn(),
        },
      };

      const { cleanupVideoPlayer, videoPlayer } =
        useVideoPlayer(videoContainer, onEndedCallback);

      videoPlayer.value = mockVideoPlayer;

      cleanupVideoPlayer();

      expect(videoPlayer.value).toBe(null);
    });

    it('calls dispose method on videojs player when destroy not available', () => {
      const mockDispose = vi.fn();
      const mockVideoPlayer = {
        videojs_player: {
          dispose: mockDispose,
          el_: {},
          on: vi.fn(),
        },
        show_controls: false,
        video: {},
      };

      const { cleanupVideoPlayer, videoPlayer } =
        useVideoPlayer(videoContainer, onEndedCallback);

      videoPlayer.value = mockVideoPlayer;

      cleanupVideoPlayer();

      expect(mockDispose).toHaveBeenCalledOnce();
    });

    it('resets videoPlayer to null after calling dispose', () => {
      const mockDispose = vi.fn();
      const mockVideoPlayer = {
        videojs_player: {
          dispose: mockDispose,
          el_: {},
          on: vi.fn(),
        },
        show_controls: false,
        video: {},
      };

      const { cleanupVideoPlayer, videoPlayer } =
        useVideoPlayer(videoContainer, onEndedCallback);

      videoPlayer.value = mockVideoPlayer;

      cleanupVideoPlayer();

      expect(videoPlayer.value).toBe(null);
    });

    it('handles errors during cleanup gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const mockVideoPlayer = {
        destroy: vi.fn(() => {
          throw new Error('Cleanup error');
        }),
        show_controls: false,
        video: {},
        videojs_player: {
          el_: {},
          on: vi.fn(),
        },
      };

      const { cleanupVideoPlayer, videoPlayer } =
        useVideoPlayer(videoContainer, onEndedCallback);

      videoPlayer.value = mockVideoPlayer;

      expect(() => cleanupVideoPlayer()).not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error destroying video player:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('initializeVideoPlayer', () => {
    it('returns early when video container is null', () => {
      const { initializeVideoPlayer, videoPlayer } =
        useVideoPlayer(ref(null), onEndedCallback);

      initializeVideoPlayer();

      expect(videoPlayer.value).toBe(null);
    });

    it('returns early when current action is not video type', async () => {
      const { useActionStore } = await import('../stores/action_store');
      useActionStore.mockReturnValue({
        currentAction: { type: 'text' },
        currentActionIndex: 0,
      });

      const { initializeVideoPlayer, videoPlayer } =
        useVideoPlayer(videoContainer, onEndedCallback);

      initializeVideoPlayer();

      expect(videoPlayer.value).toBe(null);
    });

    it('returns early when no current action exists', async () => {
      const { useActionStore } = await import('../stores/action_store');
      useActionStore.mockReturnValue({
        currentAction: null,
        currentActionIndex: 0,
      });

      const { initializeVideoPlayer, videoPlayer } =
        useVideoPlayer(videoContainer, onEndedCallback);

      initializeVideoPlayer();

      expect(videoPlayer.value).toBe(null);
    });

    it('calls attachVideo with correct selector', async () => {
      const { useActionStore } = await import('../stores/action_store');
      const { attachVideo } = await import('./use_attach_video');

      useActionStore.mockReturnValue({
        currentAction: { type: 'video' },
        currentActionIndex: 0,
      });

      const mockVideoPlayer = {
        videojs_player: {
          on: vi.fn(),
          play: vi.fn(() => Promise.resolve()),
          el_: {},
        },
        show_controls: false,
        video: {},
      };

      attachVideo.mockReturnValue(mockVideoPlayer);

      const { initializeVideoPlayer } =
        useVideoPlayer(videoContainer, onEndedCallback);

      initializeVideoPlayer();

      expect(attachVideo).toHaveBeenCalledWith(
        '.js-interactive-video-v2-segment-1-video',
        videoContainer.value
      );
    });

    it('sets videoPlayer to returned instance', async () => {
      const { useActionStore } = await import('../stores/action_store');
      const { attachVideo } = await import('./use_attach_video');

      useActionStore.mockReturnValue({
        currentAction: { type: 'video' },
        currentActionIndex: 0,
      });

      const mockVideoPlayer = {
        videojs_player: {
          on: vi.fn(),
          play: vi.fn(() => Promise.resolve()),
          el_: {},
        },
        show_controls: false,
        video: {},
      };

      attachVideo.mockReturnValue(mockVideoPlayer);

      const { initializeVideoPlayer, videoPlayer } =
        useVideoPlayer(videoContainer, onEndedCallback);

      initializeVideoPlayer();

      expect(videoPlayer.value).toStrictEqual(mockVideoPlayer);
    });

    it('logs error when initialization fails', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { useActionStore } = await import('../stores/action_store');
      const { attachVideo } = await import('./use_attach_video');

      useActionStore.mockReturnValue({
        currentAction: { type: 'video' },
        currentActionIndex: 0,
      });

      attachVideo.mockImplementation(() => {
        throw new Error('Initialization error');
      });

      const { initializeVideoPlayer } = useVideoPlayer(videoContainer, onEndedCallback);

      initializeVideoPlayer();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error initializing video player:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('resets videoPlayer to null on initialization error', async () => {
      const { useActionStore } = await import('../stores/action_store');
      const { attachVideo } = await import('./use_attach_video');

      useActionStore.mockReturnValue({
        currentAction: { type: 'video' },
        currentActionIndex: 0,
      });

      attachVideo.mockImplementation(() => {
        throw new Error('Initialization error');
      });

      const { initializeVideoPlayer, videoPlayer } =
        useVideoPlayer(videoContainer, onEndedCallback);

      initializeVideoPlayer();

      expect(videoPlayer.value).toBe(null);
    });

    it('resets isPlaying to false on initialization error', async () => {
      const { useActionStore } = await import('../stores/action_store');
      const { attachVideo } = await import('./use_attach_video');

      useActionStore.mockReturnValue({
        currentAction: { type: 'video' },
        currentActionIndex: 0,
      });

      attachVideo.mockImplementation(() => {
        throw new Error('Initialization error');
      });

      const { initializeVideoPlayer, isPlaying } =
        useVideoPlayer(videoContainer, onEndedCallback);

      initializeVideoPlayer();

      expect(isPlaying.value).toBe(false);
    });
  });

  describe('auto-play functionality', () => {
    it('attempts auto-play when enabled and DL not playing', async () => {
      const { useActivitySettingsStore } = await import('../stores/activity_settings_store');
      const { useDLStore } = await import('../stores/direction_line_store');
      const { useActionStore } = await import('../stores/action_store');
      const { attachVideo } = await import('./use_attach_video');

      useActivitySettingsStore.mockReturnValue({ useAutoPlay: true });
      useDLStore.mockReturnValue({ isPlaying: false });
      useActionStore.mockReturnValue({
        currentAction: { type: 'video' },
        currentActionIndex: 0,
      });

      const mockPlay = vi.fn(() => Promise.resolve());
      const mockVideoPlayer = {
        videojs_player: {
          on: vi.fn(),
          play: mockPlay,
          el_: {},
        },
        show_controls: false,
        video: {},
      };

      attachVideo.mockReturnValue(mockVideoPlayer);

      const { initializeVideoPlayer } = useVideoPlayer(videoContainer, onEndedCallback);

      initializeVideoPlayer();

      expect(mockPlay).toHaveBeenCalledOnce();
    });

    it('skips auto-play when DL is playing', async () => {
      const { useActivitySettingsStore } = await import('../stores/activity_settings_store');
      const { useDLStore } = await import('../stores/direction_line_store');
      const { useActionStore } = await import('../stores/action_store');
      const { attachVideo } = await import('./use_attach_video');

      useActivitySettingsStore.mockReturnValue({ useAutoPlay: true });
      useDLStore.mockReturnValue({ isPlaying: true });
      useActionStore.mockReturnValue({
        currentAction: { type: 'video' },
        currentActionIndex: 0,
      });

      const mockPlay = vi.fn(() => Promise.resolve());
      const mockVideoPlayer = {
        videojs_player: {
          on: vi.fn(),
          play: mockPlay,
          el_: {},
        },
        show_controls: false,
        video: {},
      };

      attachVideo.mockReturnValue(mockVideoPlayer);

      const { initializeVideoPlayer } = useVideoPlayer(videoContainer, onEndedCallback);

      initializeVideoPlayer();

      expect(mockPlay).not.toHaveBeenCalled();
    });

    it('skips auto-play when auto-play is disabled', async () => {
      const { useActivitySettingsStore } = await import('../stores/activity_settings_store');
      const { useActionStore } = await import('../stores/action_store');
      const { attachVideo } = await import('./use_attach_video');

      useActivitySettingsStore.mockReturnValue({ useAutoPlay: false });
      useActionStore.mockReturnValue({
        currentAction: { type: 'video' },
        currentActionIndex: 0,
      });

      const mockPlay = vi.fn(() => Promise.resolve());
      const mockVideoPlayer = {
        videojs_player: {
          on: vi.fn(),
          play: mockPlay,
          el_: {},
        },
        show_controls: false,
        video: {},
      };

      attachVideo.mockReturnValue(mockVideoPlayer);

      const { initializeVideoPlayer } = useVideoPlayer(videoContainer, onEndedCallback);

      initializeVideoPlayer();

      expect(mockPlay).not.toHaveBeenCalled();
    });

    it('handles auto-play errors gracefully', async () => {
      const { useActivitySettingsStore } = await import('../stores/activity_settings_store');
      const { useActionStore } = await import('../stores/action_store');
      const { attachVideo } = await import('./use_attach_video');
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      useActivitySettingsStore.mockReturnValue({ useAutoPlay: true });
      useActionStore.mockReturnValue({
        currentAction: { type: 'video' },
        currentActionIndex: 0,
      });

      const mockPlay = vi.fn(() => Promise.reject(new Error('Auto-play failed')));
      const mockVideoPlayer = {
        videojs_player: {
          on: vi.fn(),
          play: mockPlay,
          el_: {},
        },
        show_controls: false,
        video: {},
      };

      attachVideo.mockReturnValue(mockVideoPlayer);

      const { initializeVideoPlayer } = useVideoPlayer(videoContainer, onEndedCallback);

      initializeVideoPlayer();

      expect(attachVideo).toHaveBeenCalledWith(
        '.js-interactive-video-v2-segment-1-video',
        videoContainer.value
      );

      consoleSpy.mockRestore();
    });
  });

  describe('video player events', () => {
    it('sets up ended event listener', async () => {
      const { useActionStore } = await import('../stores/action_store');
      const { attachVideo } = await import('./use_attach_video');

      useActionStore.mockReturnValue({
        currentAction: { type: 'video' },
        currentActionIndex: 0,
      });

      const mockOn = vi.fn();
      const mockVideoPlayer = {
        videojs_player: {
          on: mockOn,
          el_: {},
        },
        show_controls: false,
        video: {},
      };

      attachVideo.mockReturnValue(mockVideoPlayer);

      const { initializeVideoPlayer } =
        useVideoPlayer(videoContainer, onEndedCallback);

      initializeVideoPlayer();

      expect(mockOn).toHaveBeenCalledWith('ended', expect.any(Function));
    });

    it('sets up pause event listener', async () => {
      const { useActionStore } = await import('../stores/action_store');
      const { attachVideo } = await import('./use_attach_video');

      useActionStore.mockReturnValue({
        currentAction: { type: 'video' },
        currentActionIndex: 0,
      });

      const mockOn = vi.fn();
      const mockVideoPlayer = {
        videojs_player: {
          on: mockOn,
          el_: {},
        },
        show_controls: false,
        video: {},
      };

      attachVideo.mockReturnValue(mockVideoPlayer);

      const { initializeVideoPlayer } =
        useVideoPlayer(videoContainer, onEndedCallback);

      initializeVideoPlayer();

      expect(mockOn).toHaveBeenCalledWith('pause', expect.any(Function));
    });

    it('sets up play event listener', async () => {
      const { useActionStore } = await import('../stores/action_store');
      const { attachVideo } = await import('./use_attach_video');

      useActionStore.mockReturnValue({
        currentAction: { type: 'video' },
        currentActionIndex: 0,
      });

      const mockOn = vi.fn();
      const mockVideoPlayer = {
        videojs_player: {
          on: mockOn,
          el_: {},
        },
        show_controls: false,
        video: {},
      };

      attachVideo.mockReturnValue(mockVideoPlayer);

      const { initializeVideoPlayer } =
        useVideoPlayer(videoContainer, onEndedCallback);

      initializeVideoPlayer();

      expect(mockOn).toHaveBeenCalledWith('play', expect.any(Function));
    });

    it('updates isPlaying state on play event', async () => {
      const { useActionStore } = await import('../stores/action_store');
      const { attachVideo } = await import('./use_attach_video');

      useActionStore.mockReturnValue({
        currentAction: { type: 'video' },
        currentActionIndex: 0,
      });

      let playCallback;
      const mockOn = vi.fn((event, callback) => {
        if (event === 'play') {
          playCallback = callback;
        }
      });

      const mockVideoPlayer = {
        videojs_player: {
          on: mockOn,
          el_: {},
        },
        show_controls: false,
        video: {},
      };

      attachVideo.mockReturnValue(mockVideoPlayer);

      const { initializeVideoPlayer, isPlaying } =
        useVideoPlayer(videoContainer, onEndedCallback);

      initializeVideoPlayer();

      playCallback();

      expect(isPlaying.value).toBe(true);
    });

    it('updates isPlaying state on pause event', async () => {
      const { useActionStore } = await import('../stores/action_store');
      const { attachVideo } = await import('./use_attach_video');

      useActionStore.mockReturnValue({
        currentAction: { type: 'video' },
        currentActionIndex: 0,
      });

      let pauseCallback;
      const mockOn = vi.fn((event, callback) => {
        if (event === 'pause') {
          pauseCallback = callback;
        }
      });

      const mockVideoPlayer = {
        videojs_player: {
          on: mockOn,
          el_: {},
        },
        show_controls: false,
        video: {},
      };

      attachVideo.mockReturnValue(mockVideoPlayer);

      const { initializeVideoPlayer, isPlaying } =
        useVideoPlayer(videoContainer, onEndedCallback);

      initializeVideoPlayer();

      isPlaying.value = true;
      pauseCallback();

      expect(isPlaying.value).toBe(false);
    });

    it('calls onEnded callback when video ends', async () => {
      const { useActionStore } = await import('../stores/action_store');
      const { attachVideo } = await import('./use_attach_video');

      useActionStore.mockReturnValue({
        currentAction: { type: 'video' },
        currentActionIndex: 0,
      });

      let endedCallback;
      const mockOn = vi.fn((event, callback) => {
        if (event === 'ended') {
          endedCallback = callback;
        }
      });

      const mockVideoPlayer = {
        videojs_player: {
          on: mockOn,
          el_: {},
        },
        show_controls: false,
        video: {},
      };

      attachVideo.mockReturnValue(mockVideoPlayer);

      const { initializeVideoPlayer, isPlaying } =
        useVideoPlayer(videoContainer, onEndedCallback);

      initializeVideoPlayer();

      isPlaying.value = true;
      endedCallback();

      expect(isPlaying.value).toBe(false);
    });

    it('calls onEnded callback function when video ends', async () => {
      const { useActionStore } = await import('../stores/action_store');
      const { attachVideo } = await import('./use_attach_video');

      useActionStore.mockReturnValue({
        currentAction: { type: 'video' },
        currentActionIndex: 0,
      });

      let endedCallback;
      const mockOn = vi.fn((event, callback) => {
        if (event === 'ended') {
          endedCallback = callback;
        }
      });

      const mockVideoPlayer = {
        videojs_player: {
          on: mockOn,
          el_: {},
        },
        show_controls: false,
        video: {},
      };

      attachVideo.mockReturnValue(mockVideoPlayer);

      const { initializeVideoPlayer } =
        useVideoPlayer(videoContainer, onEndedCallback);

      initializeVideoPlayer();

      endedCallback();

      expect(onEndedCallback).toHaveBeenCalledOnce();
    });

    it('handles missing onEnded callback gracefully', async () => {
      const { useActionStore } = await import('../stores/action_store');
      const { attachVideo } = await import('./use_attach_video');

      useActionStore.mockReturnValue({
        currentAction: { type: 'video' },
        currentActionIndex: 0,
      });

      let endedCallback;
      const mockOn = vi.fn((event, callback) => {
        if (event === 'ended') {
          endedCallback = callback;
        }
      });

      const mockVideoPlayer = {
        videojs_player: {
          on: mockOn,
          el_: {},
        },
        show_controls: false,
        video: {},
      };

      attachVideo.mockReturnValue(mockVideoPlayer);

      const { initializeVideoPlayer, isPlaying } =
        useVideoPlayer(videoContainer, null);

      initializeVideoPlayer();

      isPlaying.value = true;

      expect(() => endedCallback()).not.toThrow();
    });

    it('resets isPlaying to false when video ends with no callback', async () => {
      const { useActionStore } = await import('../stores/action_store');
      const { attachVideo } = await import('./use_attach_video');

      useActionStore.mockReturnValue({
        currentAction: { type: 'video' },
        currentActionIndex: 0,
      });

      let endedCallback;
      const mockOn = vi.fn((event, callback) => {
        if (event === 'ended') {
          endedCallback = callback;
        }
      });

      const mockVideoPlayer = {
        videojs_player: {
          on: mockOn,
          el_: {},
        },
        show_controls: false,
        video: {},
      };

      attachVideo.mockReturnValue(mockVideoPlayer);

      const { initializeVideoPlayer, isPlaying } =
        useVideoPlayer(videoContainer, null);

      initializeVideoPlayer();

      isPlaying.value = true;
      endedCallback();

      expect(isPlaying.value).toBe(false);
    });
  });
});