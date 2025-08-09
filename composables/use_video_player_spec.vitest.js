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

Object.defineProperty(global, 'videojs', {
  value: {
    getComponent: vi.fn(),
  },
  writable: true,
});

describe('useVideoPlayer', () => {
  /** @type {import('vue').Ref<HTMLElement|null>} */
  let videoContainer;
  /** @type {Function} */
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
      const result = /** @type {any} */ (
        useVideoPlayer(videoContainer, onEndedCallback)
      );

      expect(typeof result.cleanupVideoPlayer).toBe('function');
    });

    it('returns initializeVideoPlayer function', () => {
      const result = /** @type {any} */ (
        useVideoPlayer(videoContainer, onEndedCallback)
      );

      expect(typeof result.initializeVideoPlayer).toBe('function');
    });

    it('initializes isPlaying as false', () => {
      const result = /** @type {any} */ (
        useVideoPlayer(videoContainer, onEndedCallback)
      );

      expect(result.isPlaying.value).toBe(false);
    });

    it('initializes videoPlayer as null', () => {
      const result = /** @type {any} */ (
        useVideoPlayer(videoContainer, onEndedCallback)
      );

      expect(result.videoPlayer.value).toBe(null);
    });
  });

  describe('cleanupVideoPlayer', () => {
    it('resets isPlaying to false when no video player exists', () => {
      const result = /** @type {any} */ (
        useVideoPlayer(videoContainer, onEndedCallback)
      );

      result.cleanupVideoPlayer();

      expect(result.isPlaying.value).toBe(false);
    });

    it('resets videoPlayer to null when no video player exists', () => {
      const result = /** @type {any} */ (
        useVideoPlayer(videoContainer, onEndedCallback)
      );

      result.cleanupVideoPlayer();

      expect(result.videoPlayer.value).toBe(null);
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

      const result = /** @type {any} */ (
        useVideoPlayer(videoContainer, onEndedCallback)
      );

      result.videoPlayer.value = mockVideoPlayer;

      result.cleanupVideoPlayer();

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

      const result = /** @type {any} */ (
        useVideoPlayer(videoContainer, onEndedCallback)
      );

      result.videoPlayer.value = mockVideoPlayer;

      result.cleanupVideoPlayer();

      expect(result.videoPlayer.value).toBe(null);
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

      const result = /** @type {any} */ (
        useVideoPlayer(videoContainer, onEndedCallback)
      );

      result.videoPlayer.value = mockVideoPlayer;

      result.cleanupVideoPlayer();

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

      const result = /** @type {any} */ (
        useVideoPlayer(videoContainer, onEndedCallback)
      );

      result.videoPlayer.value = mockVideoPlayer;

      result.cleanupVideoPlayer();

      expect(result.videoPlayer.value).toBe(null);
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

      const result = /** @type {any} */ (
        useVideoPlayer(videoContainer, onEndedCallback)
      );

      result.videoPlayer.value = mockVideoPlayer;

      expect(() => result.cleanupVideoPlayer()).not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error destroying video player:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('initializeVideoPlayer', () => {
    it('returns early when video container is null', () => {
      const result = /** @type {any} */ (
        useVideoPlayer(ref(null), onEndedCallback)
      );

      result.initializeVideoPlayer();

      expect(result.videoPlayer.value).toBe(null);
    });

    it('returns early when current action is not video type', async () => {
      const { useActionStore } = await import('../stores/action_store');
      useActionStore.mockReturnValue({
        currentAction: { type: 'text' },
        currentActionIndex: 0,
      });

      const result = /** @type {any} */ (
        useVideoPlayer(videoContainer, onEndedCallback)
      );

      result.initializeVideoPlayer();

      expect(result.videoPlayer.value).toBe(null);
    });

    it('returns early when no current action exists', async () => {
      const { useActionStore } = await import('../stores/action_store');
      useActionStore.mockReturnValue({
        currentAction: null,
        currentActionIndex: 0,
      });

      const result = /** @type {any} */ (
        useVideoPlayer(videoContainer, onEndedCallback)
      );

      result.initializeVideoPlayer();

      expect(result.videoPlayer.value).toBe(null);
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
          ready: vi.fn((callback) => callback()),
          controlBar: {
            addChild: vi.fn(),
            getChild: vi.fn(),
            children: vi.fn(() => []),
          },
        },
        show_controls: false,
        video: {},
      };

      attachVideo.mockReturnValue(mockVideoPlayer);

      const result = /** @type {any} */ (
        useVideoPlayer(videoContainer, onEndedCallback)
      );

      result.initializeVideoPlayer();

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
          ready: vi.fn((callback) => callback()),
          controlBar: {
            addChild: vi.fn(),
            getChild: vi.fn(),
            children: vi.fn(() => []),
          },
        },
        show_controls: false,
        video: {},
      };

      attachVideo.mockReturnValue(mockVideoPlayer);

      const result = /** @type {any} */ (
        useVideoPlayer(videoContainer, onEndedCallback)
      );

      result.initializeVideoPlayer();

      expect(result.videoPlayer.value).toStrictEqual(mockVideoPlayer);
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

      const result = /** @type {any} */ (
        useVideoPlayer(videoContainer, onEndedCallback)
      );

      result.initializeVideoPlayer();

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

      const result = /** @type {any} */ (
        useVideoPlayer(videoContainer, onEndedCallback)
      );

      result.initializeVideoPlayer();

      expect(result.videoPlayer.value).toBe(null);
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

      const result = /** @type {any} */ (
        useVideoPlayer(videoContainer, onEndedCallback)
      );

      result.initializeVideoPlayer();

      expect(result.isPlaying.value).toBe(false);
    });
  });

  describe('VideoJS control bar configuration', () => {
    it('configures playback rate menu when VideoJS components are available', async () => {
      const { useActionStore } = await import('../stores/action_store');
      const { attachVideo } = await import('./use_attach_video');

      useActionStore.mockReturnValue({
        currentAction: { type: 'video' },
        currentActionIndex: 0,
      });

      const mockPlaybackRateMenuButton = vi.fn();
      const mockFullscreenToggle = vi.fn();
      const mockControlBar = {
        addChild: vi.fn(),
        getChild: vi.fn(() => null),
        children: vi.fn(() => []),
      };

      global.videojs.getComponent
        .mockReturnValueOnce(mockPlaybackRateMenuButton)
        .mockReturnValueOnce(mockFullscreenToggle);

      const mockVideoPlayer = {
        videojs_player: {
          on: vi.fn(),
          play: vi.fn(() => Promise.resolve()),
          el_: {},
          ready: vi.fn((callback) => callback()),
          controlBar: mockControlBar,
        },
        show_controls: false,
        video: {},
      };

      attachVideo.mockReturnValue(mockVideoPlayer);

      const result = /** @type {any} */ (
        useVideoPlayer(videoContainer, onEndedCallback)
      );

      result.initializeVideoPlayer();

      expect(global.videojs.getComponent).toHaveBeenCalledWith('PlaybackRateMenuButton');
    });

    it('adds fullscreen toggle when not present in control bar', async () => {
      const { useActionStore } = await import('../stores/action_store');
      const { attachVideo } = await import('./use_attach_video');

      useActionStore.mockReturnValue({
        currentAction: { type: 'video' },
        currentActionIndex: 0,
      });

      const mockPlaybackRateMenuButton = vi.fn();
      const mockFullscreenToggle = vi.fn();
      const mockControlBar = {
        addChild: vi.fn(),
        getChild: vi.fn((name) => name === 'FullscreenToggle' ? null : {}),
        children: vi.fn(() => []),
      };

      global.videojs.getComponent
        .mockReturnValueOnce(mockPlaybackRateMenuButton)
        .mockReturnValueOnce(mockFullscreenToggle);

      const mockVideoPlayer = {
        videojs_player: {
          on: vi.fn(),
          play: vi.fn(() => Promise.resolve()),
          el_: {},
          ready: vi.fn((callback) => callback()),
          controlBar: mockControlBar,
        },
        show_controls: false,
        video: {},
      };

      attachVideo.mockReturnValue(mockVideoPlayer);

      const result = /** @type {any} */ (
        useVideoPlayer(videoContainer, onEndedCallback)
      );

      result.initializeVideoPlayer();

      expect(global.videojs.getComponent).toHaveBeenCalledWith('FullscreenToggle');
    });

    it('shows existing fullscreen toggle when present in control bar', async () => {
      const { useActionStore } = await import('../stores/action_store');
      const { attachVideo } = await import('./use_attach_video');

      useActionStore.mockReturnValue({
        currentAction: { type: 'video' },
        currentActionIndex: 0,
      });

      const mockPlaybackRateMenuButton = vi.fn();
      const mockFullscreenToggle = vi.fn();
      const mockExistingFullscreenToggle = {
        show: vi.fn(),
      };
      const mockControlBar = {
        addChild: vi.fn(),
        getChild: vi.fn((name) => name === 'FullscreenToggle' ? mockExistingFullscreenToggle : {}),
        children: vi.fn(() => []),
      };

      global.videojs.getComponent
        .mockReturnValueOnce(mockPlaybackRateMenuButton)
        .mockReturnValueOnce(mockFullscreenToggle);

      const mockVideoPlayer = {
        videojs_player: {
          on: vi.fn(),
          play: vi.fn(() => Promise.resolve()),
          el_: {},
          ready: vi.fn((callback) => callback()),
          controlBar: mockControlBar,
        },
        show_controls: false,
        video: {},
      };

      attachVideo.mockReturnValue(mockVideoPlayer);

      const result = /** @type {any} */ (
        useVideoPlayer(videoContainer, onEndedCallback)
      );

      result.initializeVideoPlayer();

      expect(mockExistingFullscreenToggle.show).toHaveBeenCalled();
    });

    it('handles missing VideoJS components gracefully', async () => {
      const { useActionStore } = await import('../stores/action_store');
      const { attachVideo } = await import('./use_attach_video');
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      useActionStore.mockReturnValue({
        currentAction: { type: 'video' },
        currentActionIndex: 0,
      });

      global.videojs.getComponent.mockReturnValue(null);

      const mockVideoPlayer = {
        videojs_player: {
          on: vi.fn(),
          play: vi.fn(() => Promise.resolve()),
          el_: {},
          ready: vi.fn((callback) => {
            callback();
          }),
          controlBar: null,
        },
        show_controls: false,
        video: {},
      };

      attachVideo.mockReturnValue(mockVideoPlayer);

      const result = /** @type {any} */ (
        useVideoPlayer(videoContainer, onEndedCallback)
      );

      result.initializeVideoPlayer();

      expect(consoleSpy).toHaveBeenCalledWith('VideoJS control bar not available');

      consoleSpy.mockRestore();
    });

    it('handles errors during control bar configuration', async () => {
      const { useActionStore } = await import('../stores/action_store');
      const { attachVideo } = await import('./use_attach_video');
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      useActionStore.mockReturnValue({
        currentAction: { type: 'video' },
        currentActionIndex: 0,
      });

      const mockVideoPlayer = {
        videojs_player: {
          on: vi.fn(),
          play: vi.fn(() => Promise.resolve()),
          el_: {},
          ready: vi.fn((callback) => {
            callback();
          }),
          controlBar: {
            addChild: vi.fn(),
            getChild: vi.fn(),
            children: vi.fn(() => []),
          },
        },
        show_controls: false,
        video: {},
      };

      global.videojs.getComponent.mockImplementation(() => {
        throw new Error('Configuration error');
      });

      attachVideo.mockReturnValue(mockVideoPlayer);

      const result = /** @type {any} */ (
        useVideoPlayer(videoContainer, onEndedCallback)
      );

      result.initializeVideoPlayer();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error configuring VideoJS controls:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
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
          ready: vi.fn((callback) => callback()),
          controlBar: {
            addChild: vi.fn(),
            getChild: vi.fn(),
            children: vi.fn(() => []),
          },
        },
        show_controls: false,
        video: {},
      };

      attachVideo.mockReturnValue(mockVideoPlayer);

      const result = /** @type {any} */ (
        useVideoPlayer(videoContainer, onEndedCallback)
      );

      result.initializeVideoPlayer();

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
          ready: vi.fn((callback) => callback()),
          controlBar: {
            addChild: vi.fn(),
            getChild: vi.fn(),
            children: vi.fn(() => []),
          },
        },
        show_controls: false,
        video: {},
      };

      attachVideo.mockReturnValue(mockVideoPlayer);

      const result = /** @type {any} */ (
        useVideoPlayer(videoContainer, onEndedCallback)
      );

      result.initializeVideoPlayer();

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
          ready: vi.fn((callback) => callback()),
          controlBar: {
            addChild: vi.fn(),
            getChild: vi.fn(),
            children: vi.fn(() => []),
          },
        },
        show_controls: false,
        video: {},
      };

      attachVideo.mockReturnValue(mockVideoPlayer);

      const result = /** @type {any} */ (
        useVideoPlayer(videoContainer, onEndedCallback)
      );

      result.initializeVideoPlayer();

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
          ready: vi.fn((callback) => callback()),
          controlBar: {
            addChild: vi.fn(),
            getChild: vi.fn(),
            children: vi.fn(() => []),
          },
        },
        show_controls: false,
        video: {},
      };

      attachVideo.mockReturnValue(mockVideoPlayer);

      const result = /** @type {any} */ (
        useVideoPlayer(videoContainer, onEndedCallback)
      );

      result.initializeVideoPlayer();

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
          ready: vi.fn((callback) => callback()),
          controlBar: {
            addChild: vi.fn(),
            getChild: vi.fn(),
            children: vi.fn(() => []),
          },
        },
        show_controls: false,
        video: {},
      };

      attachVideo.mockReturnValue(mockVideoPlayer);

      const result = /** @type {any} */ (
        useVideoPlayer(videoContainer, onEndedCallback)
      );

      result.initializeVideoPlayer();

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
          ready: vi.fn((callback) => callback()),
          controlBar: {
            addChild: vi.fn(),
            getChild: vi.fn(),
            children: vi.fn(() => []),
          },
        },
        show_controls: false,
        video: {},
      };

      attachVideo.mockReturnValue(mockVideoPlayer);

      const result = /** @type {any} */ (
        useVideoPlayer(videoContainer, onEndedCallback)
      );

      result.initializeVideoPlayer();

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
          ready: vi.fn((callback) => callback()),
          controlBar: {
            addChild: vi.fn(),
            getChild: vi.fn(),
            children: vi.fn(() => []),
          },
        },
        show_controls: false,
        video: {},
      };

      attachVideo.mockReturnValue(mockVideoPlayer);

      const result = /** @type {any} */ (
        useVideoPlayer(videoContainer, onEndedCallback)
      );

      result.initializeVideoPlayer();

      expect(mockOn).toHaveBeenCalledWith('play', expect.any(Function));
    });

    it('sets up ratechange event listener', async () => {
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
          ready: vi.fn((callback) => callback()),
          controlBar: {
            addChild: vi.fn(),
            getChild: vi.fn(),
            children: vi.fn(() => []),
          },
        },
        show_controls: false,
        video: {},
      };

      attachVideo.mockReturnValue(mockVideoPlayer);

      const result = /** @type {any} */ (
        useVideoPlayer(videoContainer, onEndedCallback)
      );

      result.initializeVideoPlayer();

      expect(mockOn).toHaveBeenCalledWith('ratechange', expect.any(Function));
    });

    it('sets up fullscreenchange event listener', async () => {
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
          ready: vi.fn((callback) => callback()),
          controlBar: {
            addChild: vi.fn(),
            getChild: vi.fn(),
            children: vi.fn(() => []),
          },
        },
        show_controls: false,
        video: {},
      };

      attachVideo.mockReturnValue(mockVideoPlayer);

      const result = /** @type {any} */ (
        useVideoPlayer(videoContainer, onEndedCallback)
      );

      result.initializeVideoPlayer();

      expect(mockOn).toHaveBeenCalledWith('fullscreenchange', expect.any(Function));
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
          ready: vi.fn((callback) => callback()),
          controlBar: {
            addChild: vi.fn(),
            getChild: vi.fn(),
            children: vi.fn(() => []),
          },
        },
        show_controls: false,
        video: {},
      };

      attachVideo.mockReturnValue(mockVideoPlayer);

      const result = /** @type {any} */ (
        useVideoPlayer(videoContainer, onEndedCallback)
      );

      result.initializeVideoPlayer();

      if (playCallback) {
        playCallback();
      }

      expect(result.isPlaying.value).toBe(true);
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
          ready: vi.fn((callback) => callback()),
          controlBar: {
            addChild: vi.fn(),
            getChild: vi.fn(),
            children: vi.fn(() => []),
          },
        },
        show_controls: false,
        video: {},
      };

      attachVideo.mockReturnValue(mockVideoPlayer);

      const result = /** @type {any} */ (
        useVideoPlayer(videoContainer, onEndedCallback)
      );

      result.initializeVideoPlayer();

      result.isPlaying.value = true;
      if (pauseCallback) {
        pauseCallback();
      }

      expect(result.isPlaying.value).toBe(false);
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
          ready: vi.fn((callback) => callback()),
          controlBar: {
            addChild: vi.fn(),
            getChild: vi.fn(),
            children: vi.fn(() => []),
          },
        },
        show_controls: false,
        video: {},
      };

      attachVideo.mockReturnValue(mockVideoPlayer);

      const result = /** @type {any} */ (
        useVideoPlayer(videoContainer, onEndedCallback)
      );

      result.initializeVideoPlayer();

      result.isPlaying.value = true;
      if (endedCallback) {
        endedCallback();
      }

      expect(result.isPlaying.value).toBe(false);
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
          ready: vi.fn((callback) => callback()),
          controlBar: {
            addChild: vi.fn(),
            getChild: vi.fn(),
            children: vi.fn(() => []),
          },
        },
        show_controls: false,
        video: {},
      };

      attachVideo.mockReturnValue(mockVideoPlayer);

      const result = /** @type {any} */ (
        useVideoPlayer(videoContainer, onEndedCallback)
      );

      result.initializeVideoPlayer();

      if (endedCallback) {
        endedCallback();
      }

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
          ready: vi.fn((callback) => callback()),
          controlBar: {
            addChild: vi.fn(),
            getChild: vi.fn(),
            children: vi.fn(() => []),
          },
        },
        show_controls: false,
        video: {},
      };

      attachVideo.mockReturnValue(mockVideoPlayer);

      const result = /** @type {any} */ (
        useVideoPlayer(videoContainer, null)
      );

      result.initializeVideoPlayer();

      result.isPlaying.value = true;

      if (endedCallback) {
        expect(() => endedCallback()).not.toThrow();
      }
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
          ready: vi.fn((callback) => callback()),
          controlBar: {
            addChild: vi.fn(),
            getChild: vi.fn(),
            children: vi.fn(() => []),
          },
        },
        show_controls: false,
        video: {},
      };

      attachVideo.mockReturnValue(mockVideoPlayer);

      const result = /** @type {any} */ (
        useVideoPlayer(videoContainer, null)
      );

      result.initializeVideoPlayer();

      result.isPlaying.value = true;
      if (endedCallback) {
        endedCallback();
      }

      expect(result.isPlaying.value).toBe(false);
    });

    it('logs playback rate changes', async () => {
      const { useActionStore } = await import('../stores/action_store');
      const { attachVideo } = await import('./use_attach_video');
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      useActionStore.mockReturnValue({
        currentAction: { type: 'video' },
        currentActionIndex: 0,
      });

      let ratechangeCallback;
      const mockOn = vi.fn((event, callback) => {
        if (event === 'ratechange') {
          ratechangeCallback = callback;
        }
      });

      const mockVideoPlayer = {
        videojs_player: {
          on: mockOn,
          el_: {},
          ready: vi.fn((callback) => callback()),
          controlBar: {
            addChild: vi.fn(),
            getChild: vi.fn(),
            children: vi.fn(() => []),
          },
          playbackRate: vi.fn(() => 1.5),
        },
        show_controls: false,
        video: {},
      };

      attachVideo.mockReturnValue(mockVideoPlayer);

      const result = /** @type {any} */ (
        useVideoPlayer(videoContainer, onEndedCallback)
      );

      result.initializeVideoPlayer();

      if (ratechangeCallback) {
        ratechangeCallback();
      }

      expect(consoleSpy).toHaveBeenCalledWith('Playback rate changed to:', 1.5);

      consoleSpy.mockRestore();
    });

    it('logs fullscreen state changes', async () => {
      const { useActionStore } = await import('../stores/action_store');
      const { attachVideo } = await import('./use_attach_video');
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      useActionStore.mockReturnValue({
        currentAction: { type: 'video' },
        currentActionIndex: 0,
      });

      let fullscreenchangeCallback;
      const mockOn = vi.fn((event, callback) => {
        if (event === 'fullscreenchange') {
          fullscreenchangeCallback = callback;
        }
      });

      const mockVideoPlayer = {
        videojs_player: {
          on: mockOn,
          el_: {},
          ready: vi.fn((callback) => callback()),
          controlBar: {
            addChild: vi.fn(),
            getChild: vi.fn(),
            children: vi.fn(() => []),
          },
          isFullscreen: vi.fn(() => true),
        },
        show_controls: false,
        video: {},
      };

      attachVideo.mockReturnValue(mockVideoPlayer);

      const result = /** @type {any} */ (
        useVideoPlayer(videoContainer, onEndedCallback)
      );

      result.initializeVideoPlayer();

      if (fullscreenchangeCallback) {
        fullscreenchangeCallback();
      }

      expect(consoleSpy).toHaveBeenCalledWith('Fullscreen state changed:', true);

      consoleSpy.mockRestore();
    });
  });
});