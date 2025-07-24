// @ts-check

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useDLStore } from './direction_line_store';

/**
 * @description Mock for AudioService
 */
vi.mock('../lib/audio_service.js', () => ({
  AudioService: {
    stopAudio: vi.fn(),
    playTTS: vi.fn(),
  },
}));

/**
 * @description Mock for eventDispatcher
 */
vi.mock('../lib/event_dispatcher.js', () => ({
  eventDispatcher: {
    on: vi.fn(),
    off: vi.fn(),
    dispatch: vi.fn(),
  },
  DL_EVENTS: {
    PLAY: 'play',
    PAUSE: 'pause',
    STARTED: 'started',
    PAUSED: 'paused',
    COMPLETED: 'completed',
    ERROR: 'error',
  },
}));

/**
 * @description Mock for action_store
 */
vi.mock('./action_store', () => ({
  useActionStore: vi.fn(() => ({
    currentAction: null,
  })),
}));

/**
 * @description Test suite for direction_line_store
 */
describe('direction_line_store', () => {
  /** @type {ReturnType<typeof useDLStore>} */
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useDLStore();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  /**
   * @description Tests store initialization
   */
  describe('initialization', () => {
    it('has empty currentDLText initially', () => {
      expect(store.currentDLText).toBe('');
    });

    it('has empty currentAudioPath initially', () => {
      expect(store.currentAudioPath).toBe('');
    });

    it('has en as currentLanguage initially', () => {
      expect(store.currentLanguage).toBe('en');
    });

    it('has isPlaying as false initially', () => {
      expect(store.isPlaying).toBe(false);
    });

    it('has isAutoPlay as true initially', () => {
      expect(store.isAutoPlay).toBe(true);
    });

    it('has isInitialized as false initially', () => {
      expect(store.isInitialized).toBe(false);
    });

    it('has null activityInfo initially', () => {
      expect(store.activityInfo).toBe(null);
    });
  });

  /**
   * @description Tests getters
   */
  describe('getters', () => {
    it('returns false when no DL text is available', () => {
      store.currentDLText = '';

      expect(store.hasDL).toBe(false);
    });

    it('returns false when DL text is only whitespace', () => {
      store.currentDLText = '   ';

      expect(store.hasDL).toBe(false);
    });

    it('returns true when DL text is available', () => {
      store.currentDLText = 'Test direction line';

      expect(store.hasDL).toBe(true);
    });
  });

  /**
   * @description Tests DL initialization for different phases
   */
  describe('initializeDLForPhase', () => {
    const mockActivityInfo = {
      topic: 'Test Topic',
      sub_topic: 'Test Sub Topic',
      title: 'Test Title',
      dl: 'Main direction line',
      reference: [],
      quick_checks: [],
      diagnostic: {
        dl: 'Diagnostic direction line',
        language: 'en',
      },
    };

    it('sets isInitialized to true for intro phase', () => {
      store.initializeDLForPhase('intro', mockActivityInfo);

      expect(store.isInitialized).toBe(true);
    });

    it('sets activityInfo for intro phase', () => {
      store.initializeDLForPhase('intro', mockActivityInfo);

      expect(store.activityInfo).toStrictEqual(mockActivityInfo);
    });

    it('sets currentDLText for intro phase', () => {
      store.initializeDLForPhase('intro', mockActivityInfo);

      expect(store.currentDLText).toBe('Main direction line');
    });

    it('sets currentLanguage for intro phase', () => {
      store.initializeDLForPhase('intro', mockActivityInfo);

      expect(store.currentLanguage).toBe('en');
    });

    it('sets isInitialized to true for diagnostic phase', () => {
      store.initializeDLForPhase('diagnostic', mockActivityInfo);

      expect(store.isInitialized).toBe(true);
    });

    it('sets currentDLText for diagnostic phase', () => {
      store.initializeDLForPhase('diagnostic', mockActivityInfo);

      expect(store.currentDLText).toBe('Diagnostic direction line');
    });

    it('sets currentLanguage for diagnostic phase', () => {
      store.initializeDLForPhase('diagnostic', mockActivityInfo);

      expect(store.currentLanguage).toBe('en');
    });

    it('handles activity info without DL text', () => {
      const activityInfoWithoutDL = {
        ...mockActivityInfo,
        dl: '',
        diagnostic: { dl: '' },
      };

      store.initializeDLForPhase('intro', activityInfoWithoutDL);

      expect(store.currentDLText).toBe('');
    });
  });

  /**
   * @description Tests reset functionality
   */
  describe('reset', () => {
    it('resets currentDLText to empty string', () => {
      store.currentDLText = 'Test DL';

      store.reset();

      expect(store.currentDLText).toBe('');
    });

    it('resets currentAudioPath to empty string', () => {
      store.currentAudioPath = '/test/audio.mp3';

      store.reset();

      expect(store.currentAudioPath).toBe('');
    });

    it('resets currentLanguage to en', () => {
      store.currentLanguage = 'es';

      store.reset();

      expect(store.currentLanguage).toBe('en');
    });

    it('resets isPlaying to false', () => {
      store.isPlaying = true;

      store.reset();

      expect(store.isPlaying).toBe(false);
    });
  });

  /**
   * @description Tests cleanup functionality
   */
  describe('cleanup', () => {
    it('resets currentDLText during cleanup', () => {
      store.currentDLText = 'Test DL';

      store.cleanup();

      expect(store.currentDLText).toBe('');
    });

    it('resets isPlaying during cleanup', () => {
      store.isPlaying = true;

      store.cleanup();

      expect(store.isPlaying).toBe(false);
    });

    it('resets isInitialized during cleanup', () => {
      store.isInitialized = true;

      store.cleanup();

      expect(store.isInitialized).toBe(false);
    });

    it('resets activityInfo to null during cleanup', () => {
      store.activityInfo = {
        topic: 'test',
        sub_topic: 'test sub',
        title: 'test title',
        reference: [],
        quick_checks: [],
        diagnostic: { dl: '', language: 'en' },
      };

      store.cleanup();

      expect(store.activityInfo).toBe(null);
    });
  });

  /**
   * @description Tests pause functionality
   */
  describe('pauseDL', () => {
    it('sets isPlaying to false', async () => {
      store.isPlaying = true;

      store.pauseDL();

      expect(store.isPlaying).toBe(false);
    });

    it('calls AudioService.stopAudio', async () => {
      const { AudioService } = await import('../lib/audio_service.js');

      store.pauseDL();

      expect(AudioService.stopAudio).toHaveBeenCalled();
    });

    it('dispatches pause event', async () => {
      const { eventDispatcher, DL_EVENTS } = await import('../lib/event_dispatcher.js');

      store.pauseDL();

      expect(eventDispatcher.dispatch).toHaveBeenCalledWith(DL_EVENTS.PAUSED);
    });
  });
});