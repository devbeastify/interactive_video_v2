// @ts-check

import { setActivePinia, createPinia } from 'pinia';
import { beforeEach, describe, it, expect, vi, afterEach } from 'vitest';
import { useDirectionLineStore } from './direction_line_store';
import { DirectionLine } from './direction_line';
import { AudioService } from '../../lib/audio_service';

vi.mock('../../lib/audio_service');

describe('DirectionLineStore', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useDirectionLineStore();
    vi.clearAllMocks();
  });

  afterEach(() => {
    store.cleanupDirectionLine();
  });

  describe('state management', () => {
    it('initializes with default state', () => {
      expect(store.currentDirectionLine).toBeNull();
      expect(store.quickCheckDirectionLine).toBeNull();
      expect(store.isDirectionLinePlaying).toBe(false);
      expect(store.isQuickCheckDirectionLinePlaying).toBe(false);
      expect(store.directionLineTimer).toBeNull();
      expect(store.quickCheckDirectionLineTimer).toBeNull();
    });

    it('sets current direction line', () => {
      const directionLine = new DirectionLine({ text: 'Test direction' });

      store.setCurrentDirectionLine(directionLine);

      expect(store.currentDirectionLine).toStrictEqual(directionLine);
    });

    it('sets quick check direction line', () => {
      const directionLine = new DirectionLine({ text: 'Quick check' });

      store.setQuickCheckDirectionLine(directionLine);

      expect(store.quickCheckDirectionLine).toStrictEqual(directionLine);
    });

    it('clears current direction line', () => {
      const directionLine = new DirectionLine({ text: 'Test direction' });
      store.setCurrentDirectionLine(directionLine);
      store.isDirectionLinePlaying = true;

      store.clearCurrentDirectionLine();

      expect(store.currentDirectionLine).toBeNull();
      expect(store.isDirectionLinePlaying).toBe(false);
    });

    it('clears quick check direction line', () => {
      const directionLine = new DirectionLine({ text: 'Quick check' });
      store.setQuickCheckDirectionLine(directionLine);
      store.isQuickCheckDirectionLinePlaying = true;

      store.clearQuickCheckDirectionLine();

      expect(store.quickCheckDirectionLine).toBeNull();
      expect(store.isQuickCheckDirectionLinePlaying).toBe(false);
    });
  });

  describe('getters', () => {
    it('returns true when direction line is playing', () => {
      store.isDirectionLinePlaying = true;

      expect(store.isPlaying).toBe(true);
    });

    it('returns true when quick check direction line is playing', () => {
      store.isQuickCheckDirectionLinePlaying = true;

      expect(store.isPlaying).toBe(true);
    });

    it('returns false when no audio is playing', () => {
      expect(store.isPlaying).toBe(false);
    });

    it('returns current line', () => {
      const directionLine = new DirectionLine({ text: 'Test' });
      store.setCurrentDirectionLine(directionLine);

      expect(store.currentLine).toStrictEqual(directionLine);
    });

    it('returns quick check line', () => {
      const directionLine = new DirectionLine({ text: 'Quick check' });
      store.setQuickCheckDirectionLine(directionLine);

      expect(store.quickCheckLine).toStrictEqual(directionLine);
    });
  });

  describe('audio playback', () => {
    it('starts direction line audio with timer', () => {
      const directionLine = new DirectionLine({
        text: 'Test direction',
        isNew: true,
      });
      store.setCurrentDirectionLine(directionLine);
      vi.spyOn(global, 'setTimeout').mockReturnValue(123);

      store.startDirectionLineAudio();

      expect(store.isDirectionLinePlaying).toBe(true);
      expect(store.directionLineTimer).toBe(123);
      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 500);
    });

    it('does not start audio when no direction line exists', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation();

      store.startDirectionLineAudio();

      expect(store.isDirectionLinePlaying).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        'No current direction line to start audio'
      );
    });

    it('starts quick check direction line audio with timer', () => {
      const directionLine = new DirectionLine({
        text: 'Quick check',
        isNew: true,
      });
      store.setQuickCheckDirectionLine(directionLine);
      vi.spyOn(global, 'setTimeout').mockReturnValue(456);

      store.startQuickCheckDirectionLineAudio();

      expect(store.isQuickCheckDirectionLinePlaying).toBe(true);
      expect(store.quickCheckDirectionLineTimer).toBe(456);
      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 500);
    });

    it('does not start quick check audio when no direction line exists', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation();

      store.startQuickCheckDirectionLineAudio();

      expect(store.isQuickCheckDirectionLinePlaying).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        'No quick check direction line to start audio'
      );
    });

    it('handles direction line timer callback for new direction line', async () => {
      const directionLine = new DirectionLine({
        text: 'Test direction',
        isNew: true,
      });
      store.setCurrentDirectionLine(directionLine);
      store.isDirectionLinePlaying = true;
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation();
      vi.spyOn(store, 'playDirectionLineAudio').mockResolvedValue();

      store._handleDirectionLineTimer();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Timer triggered, playing direction line audio'
      );
      expect(store.playDirectionLineAudio).toHaveBeenCalled();
    });

    it('handles direction line timer callback for non-new direction line', () => {
      const directionLine = new DirectionLine({
        text: 'Test direction',
        isNew: false,
      });
      store.setCurrentDirectionLine(directionLine);
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation();

      store._handleDirectionLineTimer();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Timer triggered but direction line is not new or missing'
      );
    });

    it('handles quick check direction line timer callback for new direction line',
      async () => {
        const directionLine = new DirectionLine({
          text: 'Quick check',
          isNew: true,
        });
        store.setQuickCheckDirectionLine(directionLine);
        store.isQuickCheckDirectionLinePlaying = true;
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation();
        vi.spyOn(store, 'playQuickCheckDirectionLineAudio').mockResolvedValue();

        store._handleQuickCheckDirectionLineTimer();

        expect(consoleSpy).toHaveBeenCalledWith(
          'Timer triggered, playing quick check direction line audio'
        );
        expect(store.playQuickCheckDirectionLineAudio).toHaveBeenCalled();
      });

    it('handles quick check timer callback for non-new direction line', () => {
      const directionLine = new DirectionLine({
        text: 'Quick check',
        isNew: false,
      });
      store.setQuickCheckDirectionLine(directionLine);
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation();

      store._handleQuickCheckDirectionLineTimer();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Timer triggered but quick check direction line is not new or missing'
      );
    });

    it('plays direction line audio', async () => {
      const directionLine = new DirectionLine({ text: 'Test direction' });
      store.setCurrentDirectionLine(directionLine);
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation();
      vi.spyOn(store, '_playAudioForDirectionLine').mockResolvedValue();

      await store.playDirectionLineAudio();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Playing direction line audio for:',
        'Test direction'
      );
      expect(store._playAudioForDirectionLine).toHaveBeenCalledWith(
        directionLine,
        false
      );
    });

    it('does not play direction line audio when no direction line exists',
      async () => {
        await store.playDirectionLineAudio();

        expect(store.currentDirectionLine).toBeNull();
      });

    it('plays quick check direction line audio', async () => {
      const directionLine = new DirectionLine({ text: 'Quick check' });
      store.setQuickCheckDirectionLine(directionLine);
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation();
      vi.spyOn(store, '_playAudioForDirectionLine').mockResolvedValue();

      await store.playQuickCheckDirectionLineAudio();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Playing quick check direction line audio for:',
        'Quick check'
      );
      expect(store._playAudioForDirectionLine).toHaveBeenCalledWith(
        directionLine,
        true
      );
    });

    it('does not play quick check audio when no direction line exists',
      async () => {
        await store.playQuickCheckDirectionLineAudio();

        expect(store.quickCheckDirectionLine).toBeNull();
      });

    it('plays audio for specific direction line', async () => {
      const directionLine = new DirectionLine({ text: 'Custom direction' });
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation();
      vi.spyOn(store, '_playAudioForDirectionLine').mockResolvedValue();

      await store.playAudioForDirectionLine(directionLine);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Playing audio for direction line:',
        'Custom direction'
      );
      expect(store._playAudioForDirectionLine).toHaveBeenCalledWith(
        directionLine,
        false
      );
    });

    it('does not play audio for null direction line', async () => {
      vi.spyOn(store, '_playAudioForDirectionLine').mockResolvedValue();

      await store.playAudioForDirectionLine(null);

      expect(store._playAudioForDirectionLine).not.toHaveBeenCalled();
    });
  });

  describe('audio file playback', () => {
    it('plays audio file when available', async () => {
      const directionLine = new DirectionLine({
        text: 'Test direction',
        audioPath: '/audio/test.mp3',
      });
      directionLine.generateAudioIfNeeded = vi.fn().mockResolvedValue(true);
      AudioService.playAudioFile = vi.fn().mockResolvedValue();

      await store._playAudioForDirectionLine(directionLine);

      expect(directionLine.generateAudioIfNeeded).toHaveBeenCalled();
      expect(AudioService.playAudioFile).toHaveBeenCalledWith(
        '/audio/test.mp3',
        expect.objectContaining({
          onStart: expect.any(Function),
          onEnd: expect.any(Function),
          onError: expect.any(Function),
        })
      );
    });

    it('falls back to TTS when audio file is not available', async () => {
      const directionLine = new DirectionLine({ text: 'Test direction' });
      directionLine.generateAudioIfNeeded = vi.fn().mockResolvedValue(false);
      AudioService.playTTS = vi.fn().mockResolvedValue();

      await store._playAudioForDirectionLine(directionLine);

      expect(AudioService.playTTS).toHaveBeenCalledWith(
        'Test direction',
        'en',
        expect.objectContaining({
          onStart: expect.any(Function),
          onEnd: expect.any(Function),
          onError: expect.any(Function),
        })
      );
    });

    it('handles errors and falls back to TTS', async () => {
      const directionLine = new DirectionLine({ text: 'Test direction' });
      directionLine.generateAudioIfNeeded = vi.fn().mockRejectedValue(
        new Error('Audio generation failed')
      );
      AudioService.playTTS = vi.fn().mockResolvedValue();
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation();

      await store._playAudioForDirectionLine(directionLine);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error playing direction line audio:',
        expect.any(Error)
      );
      expect(AudioService.playTTS).toHaveBeenCalled();
    });

    it('plays audio file with correct callbacks', async () => {
      const directionLine = new DirectionLine({
        text: 'Test direction',
        audioPath: '/audio/test.mp3',
      });
      AudioService.playAudioFile = vi.fn().mockResolvedValue();

      await store._playAudioFile(directionLine, false);

      expect(AudioService.playAudioFile).toHaveBeenCalledWith(
        '/audio/test.mp3',
        expect.objectContaining({
          onStart: expect.any(Function),
          onEnd: expect.any(Function),
          onError: expect.any(Function),
        })
      );
    });

    it('does not play audio file when no audio path exists', async () => {
      const directionLine = new DirectionLine({ text: 'Test direction' });

      await store._playAudioFile(directionLine);

      expect(AudioService.playAudioFile).not.toHaveBeenCalled();
    });

    it('plays TTS with correct parameters', async () => {
      const directionLine = new DirectionLine({
        text: 'Test direction',
        languageCode: 'es',
      });
      AudioService.playTTS = vi.fn().mockResolvedValue();

      await store._playTTS(directionLine, true);

      expect(AudioService.playTTS).toHaveBeenCalledWith(
        'Test direction',
        'es',
        expect.objectContaining({
          onStart: expect.any(Function),
          onEnd: expect.any(Function),
          onError: expect.any(Function),
        })
      );
    });

    it('handles TTS when no text is available', async () => {
      const directionLine = new DirectionLine({ text: '' });
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation();

      await store._playTTS(directionLine);

      expect(consoleSpy).toHaveBeenCalledWith(
        'TTS not available or no text to speak'
      );
      expect(store.isQuickCheckDirectionLinePlaying).toBe(false);
    });
  });

  describe('audio callbacks', () => {
    it('creates callbacks for regular direction line', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation();

      const callbacks = store._createAudioCallbacks(false);

      expect(callbacks).toHaveProperty('onStart');
      expect(callbacks).toHaveProperty('onEnd');
      expect(callbacks).toHaveProperty('onError');

      callbacks.onStart();
      expect(consoleSpy).toHaveBeenCalledWith('audio started playing');
      expect(store.isDirectionLinePlaying).toBe(true);

      callbacks.onEnd();
      expect(consoleSpy).toHaveBeenCalledWith('audio finished playing');
      expect(store.isDirectionLinePlaying).toBe(false);

      callbacks.onError();
      expect(consoleSpy).toHaveBeenCalledWith('audio error');
      expect(store.isDirectionLinePlaying).toBe(false);
    });

    it('creates callbacks for quick check direction line', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation();

      const callbacks = store._createAudioCallbacks(true);

      callbacks.onStart();
      expect(consoleSpy).toHaveBeenCalledWith('Quick check audio started playing');
      expect(store.isQuickCheckDirectionLinePlaying).toBe(true);

      callbacks.onEnd();
      expect(consoleSpy).toHaveBeenCalledWith('Quick check audio finished playing');
      expect(store.isQuickCheckDirectionLinePlaying).toBe(false);

      callbacks.onError();
      expect(consoleSpy).toHaveBeenCalledWith('Quick check audio error');
      expect(store.isQuickCheckDirectionLinePlaying).toBe(false);
    });
  });

  describe('audio stopping', () => {
    it('stops direction line audio', () => {
      store.isDirectionLinePlaying = true;
      store.directionLineTimer = 123;
      vi.spyOn(global, 'clearTimeout').mockImplementation();
      AudioService.stopAudio = vi.fn();

      store.stopDirectionLineAudio();

      expect(store.isDirectionLinePlaying).toBe(false);
      expect(clearTimeout).toHaveBeenCalledWith(123);
      expect(AudioService.stopAudio).toHaveBeenCalled();
    });

    it('stops quick check direction line audio', () => {
      store.isQuickCheckDirectionLinePlaying = true;
      store.quickCheckDirectionLineTimer = 456;
      vi.spyOn(global, 'clearTimeout').mockImplementation();
      AudioService.stopAudio = vi.fn();

      store.stopQuickCheckDirectionLineAudio();

      expect(store.isQuickCheckDirectionLinePlaying).toBe(false);
      expect(clearTimeout).toHaveBeenCalledWith(456);
      expect(AudioService.stopAudio).toHaveBeenCalled();
    });

    it('clears timer when timer exists', () => {
      store.directionLineTimer = 123;
      vi.spyOn(global, 'clearTimeout').mockImplementation();

      store._clearTimer('directionLineTimer');

      expect(clearTimeout).toHaveBeenCalledWith(123);
      expect(store.directionLineTimer).toBeNull();
    });

    it('does not clear timer when timer does not exist', () => {
      store.directionLineTimer = null;
      vi.spyOn(global, 'clearTimeout').mockImplementation();

      store._clearTimer('directionLineTimer');

      expect(clearTimeout).not.toHaveBeenCalled();
    });
  });

  describe('cleanup', () => {
    it('cleans up all direction line state', () => {
      const directionLine = new DirectionLine({ text: 'Test' });
      const quickCheckLine = new DirectionLine({ text: 'Quick check' });
      store.setCurrentDirectionLine(directionLine);
      store.setQuickCheckDirectionLine(quickCheckLine);
      store.isDirectionLinePlaying = true;
      store.isQuickCheckDirectionLinePlaying = true;
      vi.spyOn(store, 'stopDirectionLineAudio').mockImplementation();
      vi.spyOn(store, 'stopQuickCheckDirectionLineAudio').mockImplementation();
      vi.spyOn(store, 'clearCurrentDirectionLine').mockImplementation();
      vi.spyOn(store, 'clearQuickCheckDirectionLine').mockImplementation();

      store.cleanupDirectionLine();

      expect(store.stopDirectionLineAudio).toHaveBeenCalled();
      expect(store.stopQuickCheckDirectionLineAudio).toHaveBeenCalled();
      expect(store.clearCurrentDirectionLine).toHaveBeenCalled();
      expect(store.clearQuickCheckDirectionLine).toHaveBeenCalled();
    });
  });

  describe('initialization', () => {
    it('initializes direction line for step with valid text', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation();
      vi.spyOn(store, 'setCurrentDirectionLine').mockImplementation();
      vi.spyOn(store, 'startDirectionLineAudio').mockImplementation();

      store.initializeDirectionLineForStep('quick_check', 'Test direction', 'en');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Initializing direction line for step:',
        'quick_check',
        'Text:',
        'Test direction',
        'Language:',
        'en'
      );
      expect(store.setCurrentDirectionLine).toHaveBeenCalledWith(
        expect.objectContaining({
          stepId: 'quick_check',
          text: 'Test direction',
          languageCode: 'en',
          stepType: 'quick_check',
          isNew: true,
        })
      );
      expect(store.startDirectionLineAudio).toHaveBeenCalled();
    });

    it('does not initialize direction line with empty text', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation();
      vi.spyOn(store, 'setCurrentDirectionLine').mockImplementation();

      store.initializeDirectionLineForStep('quick_check', '', 'en');

      expect(consoleSpy).toHaveBeenCalledWith(
        'No direction line text provided for step:',
        'quick_check'
      );
      expect(store.setCurrentDirectionLine).not.toHaveBeenCalled();
    });

    it('does not initialize direction line with whitespace text', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation();
      vi.spyOn(store, 'setCurrentDirectionLine').mockImplementation();

      store.initializeDirectionLineForStep('quick_check', '   ', 'en');

      expect(consoleSpy).toHaveBeenCalledWith(
        'No direction line text provided for step:',
        'quick_check'
      );
      expect(store.setCurrentDirectionLine).not.toHaveBeenCalled();
    });

    it('validates direction line text correctly', () => {
      expect(store._isValidDirectionLineText('Valid text')).toBe(true);
      expect(store._isValidDirectionLineText('')).toBe(false);
      expect(store._isValidDirectionLineText('   ')).toBe(false);
      expect(store._isValidDirectionLineText(null)).toBe(false);
      expect(store._isValidDirectionLineText(undefined)).toBe(false);
    });

    it('creates direction line with correct parameters', () => {
      const directionLine = store._createDirectionLine(
        'diagnostic',
        'Answer the questions',
        'es'
      );

      expect(directionLine).toBeInstanceOf(DirectionLine);
      expect(directionLine.stepId).toBe('diagnostic');
      expect(directionLine.text).toBe('Answer the questions');
      expect(directionLine.languageCode).toBe('es');
      expect(directionLine.stepType).toBe('diagnostic');
      expect(directionLine.isNew).toBe(true);
    });
  });
});
