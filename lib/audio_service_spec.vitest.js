// @ts-check

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AudioService } from './audio_service';

describe('AudioService', () => {
  beforeEach(() => {
    // No complex mocking needed for these simple tests
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

    it('handles HTML with special characters', () => {
      const htmlText = '<p>Text with &amp; &lt; &gt; symbols</p>';

      const result = AudioService.extractTextContent(htmlText);

      expect(result).toBe('Text with & < > symbols');
    });
  });

  describe('playDL', () => {
    it('returns early when text is empty', async () => {
      const options = { text: '', audioPath: '/test.mp3' };

      const result = await AudioService.playDL(options);

      expect(result).toBeUndefined();
    });

    it('returns early when text is whitespace only', async () => {
      const options = { text: '   ', audioPath: '/test.mp3' };

      const result = await AudioService.playDL(options);

      expect(result).toBeUndefined();
    });

    it('returns early when no audio path is provided', async () => {
      const options = { text: 'Hello world' };

      const result = await AudioService.playDL(options);

      expect(result).toBeUndefined();
    });

    it('returns early when text is null', async () => {
      const options = { text: /** @type {any} */ (null), audioPath: '/test.mp3' };

      const result = await AudioService.playDL(options);

      expect(result).toBeUndefined();
    });
  });

  describe('stopAudio', () => {
    it('can be called without errors', () => {
      expect(() => AudioService.stopAudio()).not.toThrow();
    });

    it('can be called multiple times safely', () => {
      AudioService.stopAudio();
      AudioService.stopAudio();
      AudioService.stopAudio();

      expect(() => AudioService.stopAudio()).not.toThrow();
    });
  });
});