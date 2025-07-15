import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AudioService } from './audio_service';

describe('AudioService', () => {
  let originalAudio;
  let originalSpeechSynthesis;

  beforeEach(() => {
    originalAudio = global.Audio;
    originalSpeechSynthesis = global.speechSynthesis;
    global.speechSynthesis = {
      speak: vi.fn(),
      cancel: vi.fn(),
    };
  });

  afterEach(() => {
    global.Audio = originalAudio;
    global.speechSynthesis = originalSpeechSynthesis;
    vi.restoreAllMocks();
  });

  describe('extractTextContent', () => {
    it('returns plain text from HTML string', () => {
      const html = '<div>Hello <b>World</b></div>';

      const result = AudioService.extractTextContent(html);

      expect(result).toBe('Hello World');
    });
  });

  describe('canUseTTS', () => {
    it('returns true when text is present and speechSynthesis is available', () => {
      const result = AudioService.canUseTTS('hello');

      expect(result).toBe(true);
    });

    it('returns empty string when text is empty', () => {
      const result = AudioService.canUseTTS('');

      expect(result).toBe('');
    });

    it('returns false when speechSynthesis is not available', () => {
      delete global.speechSynthesis;

      const result = AudioService.canUseTTS('hello');

      expect(result).toBe(false);
    });
  });

  describe('createUtterance', () => {
    it('creates a SpeechSynthesisUtterance with correct properties', () => {
      global.SpeechSynthesisUtterance = function(text) {
        this.text = text;
        this.lang = '';
        this.rate = 1;
        this.pitch = 1;
      };

      const options = {};
      const utterance = AudioService.createUtterance('test', 'en-US', options);

      expect(utterance.text).toBe('test');
      expect(utterance.lang).toBe('en-US');
      expect(utterance.rate).toBe(0.9);
      expect(utterance.pitch).toBe(1);
    });
  });

  describe('playTTS', () => {
    it('resolves immediately if TTS is not available', async () => {
      delete global.speechSynthesis;

      await AudioService.playTTS('hello', 'en');

      expect(true).toBe(true);
    });
  });

  describe('playAudioFile', () => {
    it('resolves when audio ends', async () => {
      const playMock = vi.fn().mockResolvedValue();
      function MockAudio() {
        this.addEventListener = (event, cb) => {
          if (event === 'canplaythrough') cb();
          if (event === 'ended') setTimeout(cb, 0);
        };
        this.play = playMock;
        this.readyState = 4;
      }
      global.Audio = MockAudio;

      await AudioService.playAudioFile('test.mp3');

      expect(playMock).toHaveBeenCalled();
    });

    it('rejects when audio errors', async () => {
      const playMock = vi.fn().mockResolvedValue();
      function MockAudio() {
        this.addEventListener = (event, cb) => {
          if (event === 'error') setTimeout(() => cb(new Error('fail')), 0);
        };
        this.play = playMock;
        this.readyState = 4;
      }
      global.Audio = MockAudio;

      await expect(AudioService.playAudioFile('bad.mp3')).rejects.toBeInstanceOf(Error);
    });
  });

  describe('playAudioWithFallback', () => {
    it('plays audio if audioPath is provided', async () => {
      const playAudioFileSpy = vi.spyOn(AudioService, 'playAudioFile').mockResolvedValue();
      const playTTSSpy = vi.spyOn(AudioService, 'playTTS').mockResolvedValue();

      await AudioService.playAudioWithFallback('audio.mp3', 'text', 'en');

      expect(playAudioFileSpy).toHaveBeenCalled();
      expect(playTTSSpy).not.toHaveBeenCalled();
    });

    it('falls back to TTS if audioPath is missing', async () => {
      const playAudioFileSpy = vi.spyOn(AudioService, 'playAudioFile').mockResolvedValue();
      const playTTSSpy = vi.spyOn(AudioService, 'playTTS').mockResolvedValue();

      await AudioService.playAudioWithFallback('', 'text', 'en');

      expect(playAudioFileSpy).not.toHaveBeenCalled();
      expect(playTTSSpy).toHaveBeenCalled();
    });

    it('falls back to TTS if audio playback fails', async () => {
      const playAudioFileSpy = vi.spyOn(AudioService, 'playAudioFile')
        .mockRejectedValue(new Error('fail'));
      const playTTSSpy = vi.spyOn(AudioService, 'playTTS').mockResolvedValue();

      await AudioService.playAudioWithFallback('bad.mp3', 'text', 'en');

      expect(playAudioFileSpy).toHaveBeenCalled();
      expect(playTTSSpy).toHaveBeenCalled();
    });
  });

  describe('stopAudio', () => {
    it('calls speechSynthesis.cancel if available', () => {
      AudioService.stopAudio();

      expect(global.speechSynthesis.cancel).toHaveBeenCalled();
    });
  });
});
