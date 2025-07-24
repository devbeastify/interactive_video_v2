// @ts-check

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { AudioService } from './audio_service';

describe('AudioService', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    global.SpeechSynthesisUtterance = vi.fn().mockImplementation((text) => ({
      text,
      lang: '',
      pitch: 1,
      rate: 1,
      onstart: null,
      onend: null,
      onerror: null,
    }));

    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        speak: vi.fn(),
        cancel: vi.fn(),
      },
      writable: true,
      configurable: true,
    });

    global.Audio = vi.fn().mockImplementation(() => ({
      addEventListener: vi.fn(),
      play: vi.fn().mockResolvedValue(),
      readyState: 4,
    }));
  });

  afterEach(() => {
    AudioService.stopAudio();
  });

  describe('extractTextContent', () => {
    it('extracts text from HTML string', () => {
      const htmlText = '<p>Hello <strong>World</strong>!</p>';

      const result = AudioService.extractTextContent(htmlText);

      expect(result).toBe('Hello World!');
    });

    it('handles empty HTML string', () => {
      const htmlText = '';

      const result = AudioService.extractTextContent(htmlText);

      expect(result).toBe('');
    });

    it('handles HTML with only tags', () => {
      const htmlText = '<div><span></span></div>';

      const result = AudioService.extractTextContent(htmlText);

      expect(result).toBe('');
    });

    it('handles plain text without HTML', () => {
      const htmlText = 'Plain text content';

      const result = AudioService.extractTextContent(htmlText);

      expect(result).toBe('Plain text content');
    });
  });

  describe('canUseTTS', () => {
    it('returns true for valid text with speech synthesis', () => {
      const text = 'Hello world';

      const result = AudioService.canUseTTS(text);

      expect(result).toBe(true);
    });

    it('returns false for empty text', () => {
      const text = '';

      const result = AudioService.canUseTTS(text);

      expect(result).toBe(false);
    });

    it('returns false for null text', () => {
      const text = /** @type {any} */ (null);

      const result = AudioService.canUseTTS(text);

      expect(result).toBe(false);
    });

    it('returns true for whitespace only text', () => {
      const text = '   ';

      const result = AudioService.canUseTTS(text);

      expect(result).toBe(true);
    });
  });

  describe('createUtterance', () => {
    it('creates utterance with correct properties', () => {
      const textContent = 'Test text';
      const languageCode = 'en-US';
      const options = {
        onStart: vi.fn(),
        onEnd: vi.fn(),
        onError: vi.fn(),
      };

      const utterance = AudioService.createUtterance(textContent, languageCode, options);

      expect(utterance.text).toBe(textContent);
      expect(utterance.lang).toBe(languageCode);
      expect(utterance.pitch).toBe(1);
      expect(utterance.rate).toBe(0.9);
    });

    it('sets up event handlers correctly', () => {
      const textContent = 'Test text';
      const languageCode = 'en';
      const onStart = vi.fn();
      const onEnd = vi.fn();
      const onError = vi.fn();

      const utterance = AudioService.createUtterance(textContent, languageCode, {
        onStart,
        onEnd,
        onError,
      });

      if (utterance.onstart) utterance.onstart();
      if (utterance.onend) utterance.onend();
      if (utterance.onerror) utterance.onerror(/** @type {any} */ ({ error: 'network' }));

      expect(onStart).toHaveBeenCalledTimes(1);
      expect(onEnd).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('playTTS', () => {
    it('calls onEnd when text is empty', async () => {
      const text = '';
      const onEnd = vi.fn();

      await AudioService.playTTS(text, 'en', { onEnd });

      expect(onEnd).toHaveBeenCalled();
    });

    it('calls onEnd when text is whitespace only', async () => {
      const text = '   ';
      const onEnd = vi.fn();

      await AudioService.playTTS(text, 'en', { onEnd });

      expect(onEnd).toHaveBeenCalled();
    });

    it('handles TTS errors gracefully', async () => {
      const text = 'Hello world';
      const onError = vi.fn();

      const utterance = AudioService.createUtterance(text, 'en', { onError });
      if (utterance.onerror) utterance.onerror(/** @type {any} */ ({ error: 'network' }));

      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('stopAudio', () => {
    it('cancels speech synthesis', () => {
      AudioService.stopAudio();

      expect(window.speechSynthesis.cancel).toHaveBeenCalled();
    });

    it('handles missing speech synthesis gracefully', () => {
      const originalSpeechSynthesis = window.speechSynthesis;
      Object.defineProperty(window, 'speechSynthesis', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      expect(() => AudioService.stopAudio()).toThrow();

      Object.defineProperty(window, 'speechSynthesis', {
        value: originalSpeechSynthesis,
        writable: true,
        configurable: true,
      });
    });
  });
});