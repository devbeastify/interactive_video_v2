// @ts-check

import { beforeEach, describe, it, expect, vi, afterEach } from 'vitest';
import { DirectionLine } from './direction_line';

describe('DirectionLine', () => {
  let directionLine;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('initializes with default options', () => {
      directionLine = new DirectionLine();

      expect(directionLine.audioPath).toBe('');
      expect(directionLine.isNew).toBe(false);
      expect(directionLine.text).toBe('');
      expect(directionLine.stepId).toBe('');
      expect(directionLine.languageCode).toBe('en');
      expect(directionLine.stepType).toBe('');
      expect(directionLine.audioGenerated).toBe(false);
    });

    it('initializes with custom options', () => {
      const options = {
        audioPath: '/test/audio.mp3',
        isNew: true,
        name: 'test_step',
        text: 'Custom direction text',
        stepId: 'step_123',
        languageCode: 'es',
        stepType: 'quick_check',
      };

      directionLine = new DirectionLine(options);

      expect(directionLine.audioPath).toBe('/test/audio.mp3');
      expect(directionLine.isNew).toBe(true);
      expect(directionLine.text).toBe('Custom direction text');
      expect(directionLine.stepId).toBe('step_123');
      expect(directionLine.languageCode).toBe('es');
      expect(directionLine.stepType).toBe('quick_check');
    });

    it('generates audio path when not provided', () => {
      const options = {
        stepId: 'test_step_123',
        languageCode: 'fr',
      };

      directionLine = new DirectionLine(options);

      expect(directionLine.audioPath).toBe('/audio/direction-lines/test_step_123/fr.mp3');
    });

    it('resolves text from custom direction line', () => {
      const options = {
        name: 'quick_check',
        text: 'Custom direction text',
      };

      directionLine = new DirectionLine(options);

      expect(directionLine.text).toBe('Custom direction text');
    });

    it('uses default text when no custom text provided', () => {
      const options = {
        name: 'quick_check',
      };

      directionLine = new DirectionLine(options);

      expect(directionLine.text).toBe('Complete the interactive activity.');
    });

    it('uses default text for diagnostic step', () => {
      const options = {
        name: 'diagnostic',
      };

      directionLine = new DirectionLine(options);

      expect(directionLine.text).toBe('Answer the questions to test your understanding.');
    });

    it('uses default text for player step', () => {
      const options = {
        name: 'player',
      };

      directionLine = new DirectionLine(options);

      expect(directionLine.text).toBe('Complete the interactive activity.');
    });

    it('uses empty string for unknown step type', () => {
      const options = {
        name: 'unknown_step_type',
      };
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation();

      directionLine = new DirectionLine(options);

      expect(directionLine.text).toBe('');
      expect(consoleSpy).toHaveBeenCalledWith(
        'No default direction line for Step with name: unknown_step_type could be found, ' +
        'using empty string.'
      );
    });

    it('ignores invalid direction line text', () => {
      const options = {
        name: 'quick_check',
        text: '',
      };

      directionLine = new DirectionLine(options);

      expect(directionLine.text).toBe('Complete the interactive activity.');
    });
  });

  describe('audio availability', () => {
    beforeEach(() => {
      global.fetch = vi.fn();
    });

    it('returns false when no audio path exists', async () => {
      directionLine = new DirectionLine();

      const result = await directionLine.checkAudioAvailability();

      expect(result).toBe(false);
    });

    it('returns true when audio file exists', async () => {
      directionLine = new DirectionLine({
        audioPath: '/test/audio.mp3',
      });
      global.fetch.mockResolvedValue({ ok: true });

      const result = await directionLine.checkAudioAvailability();

      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalledWith('/test/audio.mp3', { method: 'HEAD' });
    });

    it('returns false when audio file does not exist', async () => {
      directionLine = new DirectionLine({
        audioPath: '/test/audio.mp3',
      });
      global.fetch.mockResolvedValue({ ok: false });

      const result = await directionLine.checkAudioAvailability();

      expect(result).toBe(false);
    });

    it('returns false when fetch throws error', async () => {
      directionLine = new DirectionLine({
        audioPath: '/test/audio.mp3',
      });
      global.fetch.mockRejectedValue(new Error('Network error'));
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation();

      const result = await directionLine.checkAudioAvailability();

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Audio file not available: /test/audio.mp3',
        expect.any(Error)
      );
    });
  });

  describe('audio generation', () => {
    it('returns true when audio is already generated', async () => {
      directionLine = new DirectionLine();
      directionLine.audioGenerated = true;

      const result = await directionLine.generateAudioIfNeeded();

      expect(result).toBe(true);
    });

    it('returns true when audio file is available', async () => {
      directionLine = new DirectionLine({
        audioPath: '/test/audio.mp3',
      });
      vi.spyOn(directionLine, 'checkAudioAvailability').mockResolvedValue(true);

      const result = await directionLine.generateAudioIfNeeded();

      expect(result).toBe(true);
      expect(directionLine.audioGenerated).toBe(true);
    });

    it('returns false when audio file is not available', async () => {
      directionLine = new DirectionLine({
        audioPath: '/test/audio.mp3',
      });
      vi.spyOn(directionLine, 'checkAudioAvailability').mockResolvedValue(false);
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation();

      const result = await directionLine.generateAudioIfNeeded();

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Audio file not available, TTS will be used as fallback'
      );
    });
  });

  describe('TTS audio generation', () => {
    beforeEach(() => {
      global.speechSynthesis = {
        speak: vi.fn(),
      };
      global.SpeechSynthesisUtterance = vi.fn().mockImplementation(() => ({
        lang: '',
        rate: 1,
        pitch: 1,
        onend: null,
        onerror: null,
      }));
    });

    it('does not generate TTS when no text exists', async () => {
      directionLine = new DirectionLine();

      await directionLine._generateTTSAudio();

      expect(speechSynthesis.speak).not.toHaveBeenCalled();
    });

    it('generates TTS for plain text', async () => {
      directionLine = new DirectionLine({
        text: 'Test direction text',
        languageCode: 'es',
      });
      const mockUtterance = {
        lang: '',
        rate: 1,
        pitch: 1,
        onend: null,
        onerror: null,
      };
      global.SpeechSynthesisUtterance.mockReturnValue(mockUtterance);

      const promise = directionLine._generateTTSAudio();
      mockUtterance.onend();

      await promise;

      expect(SpeechSynthesisUtterance).toHaveBeenCalledWith('Test direction text');
      expect(mockUtterance.lang).toBe('es');
      expect(mockUtterance.rate).toBe(0.9);
      expect(mockUtterance.pitch).toBe(1);
      expect(speechSynthesis.speak).toHaveBeenCalledWith(mockUtterance);
    });

    it('generates TTS for HTML text', async () => {
      directionLine = new DirectionLine({
        text: '<p>Test <strong>direction</strong> text</p>',
        languageCode: 'fr',
      });
      const mockUtterance = {
        lang: '',
        rate: 1,
        pitch: 1,
        onend: null,
        onerror: null,
      };
      global.SpeechSynthesisUtterance.mockReturnValue(mockUtterance);

      const promise = directionLine._generateTTSAudio();
      mockUtterance.onend();

      await promise;

      expect(SpeechSynthesisUtterance).toHaveBeenCalledWith('Test direction text');
      expect(mockUtterance.lang).toBe('fr');
    });

    it('handles TTS error', async () => {
      directionLine = new DirectionLine({
        text: 'Test direction text',
      });
      const mockUtterance = {
        lang: '',
        rate: 1,
        pitch: 1,
        onend: null,
        onerror: null,
      };
      global.SpeechSynthesisUtterance.mockReturnValue(mockUtterance);

      const promise = directionLine._generateTTSAudio();
      mockUtterance.onerror({ error: 'test error' });

      await expect(promise).rejects.toThrow('TTS error: test error');
    });

    it('handles empty text content after HTML extraction', async () => {
      directionLine = new DirectionLine({
        text: '<p></p>',
      });
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation();

      await directionLine._generateTTSAudio();

      expect(consoleSpy).toHaveBeenCalledWith('No text content to speak');
      expect(speechSynthesis.speak).not.toHaveBeenCalled();
    });

    it('handles missing speechSynthesis API', async () => {
      delete global.speechSynthesis;
      directionLine = new DirectionLine({
        text: 'Test direction text',
      });

      await directionLine._generateTTSAudio();

      expect(SpeechSynthesisUtterance).not.toHaveBeenCalled();
    });
  });

  describe('text content extraction', () => {
    it('extracts text from HTML content', () => {
      directionLine = new DirectionLine({
        text: '<p>Hello <strong>world</strong>!</p>',
      });

      const result = directionLine._extractTextContent();

      expect(result).toBe('Hello world!');
    });

    it('handles empty HTML content', () => {
      directionLine = new DirectionLine({
        text: '<p></p>',
      });

      const result = directionLine._extractTextContent();

      expect(result).toBe('');
    });

    it('handles plain text content', () => {
      directionLine = new DirectionLine({
        text: 'Plain text content',
      });

      const result = directionLine._extractTextContent();

      expect(result).toBe('Plain text content');
    });
  });

  describe('text validation', () => {
    it('validates non-empty text', () => {
      directionLine = new DirectionLine();

      const result = directionLine._isValidDirectionLineText('Valid text');

      expect(result).toBe(true);
    });

    it('invalidates empty text', () => {
      directionLine = new DirectionLine();

      const result = directionLine._isValidDirectionLineText('');

      expect(result).toBe(false);
    });

    it('invalidates whitespace-only text', () => {
      directionLine = new DirectionLine();

      const result = directionLine._isValidDirectionLineText('   ');

      expect(result).toBe(false);
    });
  });
});
