// @ts-check

import { getActivityInfo, parseActivityInfo } from './activity_info';
import { vi } from 'vitest';

/**
 * Sets up DOM environment for activity info testing
 * @param {any} data - The activity info data to set
 */
function setupActivityInfoDOM(data) {
  document.body.innerHTML = `
    <div class="js-program-tutorial">${data ? JSON.stringify([data]) : ''}</div>
  `;
}

/**
 * Creates mock activity info data
 * @return {any} Mock activity info data
 */
function createMockActivityInfo() {
  return {
    title: 'Test Activity',
    topic: 'Test Topic',
    sub_topic: 'Test Sub Topic',
    reference: [
      {
        video_path: 'test-video.mp4',
        english_subtitles_path: 'test-english.srt',
        foreign_subtitles_path: 'test-foreign.srt',
        foreign_language: 'es',
      },
    ],
    quick_checks: [
      {
        offset: 10,
        gap: 5,
        type: 'multiple_choice',
        prompt: 'Test question?',
      },
    ],
  };
}

describe('getActivityInfo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('data extraction', () => {
    it('should extract activity info from DOM element', async () => {
      const mockData = createMockActivityInfo();
      setupActivityInfoDOM(mockData);

      const element = await getActivityInfo();
      expect(element).toBeDefined();

      if (element) {
        const result = await parseActivityInfo(element);
        expect(result.title).toBe('Test Activity');
        expect(result.topic).toBe('Test Topic');
        expect(result.sub_topic).toBe('Test Sub Topic');
      }
    });

    it('should parse reference data correctly', async () => {
      const mockData = createMockActivityInfo();
      setupActivityInfoDOM(mockData);

      const element = await getActivityInfo();
      expect(element).toBeDefined();

      if (element) {
        const result = await parseActivityInfo(element);
        expect(result.reference).toBeDefined();
        expect(Array.isArray(result.reference)).toBe(true);
        expect(result.reference[0]).toHaveProperty('video_path');
        expect(result.reference[0]).toHaveProperty('foreign_language');
      }
    });

    it('should parse quick checks data correctly', async () => {
      const mockData = createMockActivityInfo();
      setupActivityInfoDOM(mockData);

      const element = await getActivityInfo();
      expect(element).toBeDefined();

      if (element) {
        const result = await parseActivityInfo(element);
        expect(result.quick_checks).toBeDefined();
        expect(Array.isArray(result.quick_checks)).toBe(true);
        expect(result.quick_checks[0]).toHaveProperty('offset');
        expect(result.quick_checks[0]).toHaveProperty('type');
      }
    });
  });

  describe('error handling', () => {
    it('should handle missing activity info element', async () => {
      document.body.innerHTML = '';

      const result = await getActivityInfo();

      expect(result).toBeNull();
    });

    it('should handle invalid JSON data', async () => {
      document.body.innerHTML = `
        <div class="js-program-tutorial">invalid json</div>
      `;

      const element = await getActivityInfo();
      expect(element).toBeDefined();

      if (element) {
        await expect(parseActivityInfo(element)).rejects.toThrow();
      }
    });

    it('should handle empty activity info', async () => {
      setupActivityInfoDOM({});

      const element = await getActivityInfo();
      expect(element).toBeDefined();

      if (element) {
        const result = await parseActivityInfo(element);
        expect(result.title).toBeUndefined();
        expect(result.topic).toBeUndefined();
      }
    });
  });

  describe('data structure validation', () => {
    it('should handle missing optional fields', async () => {
      const mockData = {
        title: 'Test Activity',
      };
      setupActivityInfoDOM(mockData);

      const element = await getActivityInfo();
      expect(element).toBeDefined();

      if (element) {
        const result = await parseActivityInfo(element);
        expect(result.title).toBe('Test Activity');
        expect(result.topic).toBeUndefined();
      }
    });

    it('should handle empty arrays', async () => {
      const mockData = {
        title: 'Test Activity',
        reference: [],
        quick_checks: [],
      };
      setupActivityInfoDOM(mockData);

      const element = await getActivityInfo();
      expect(element).toBeDefined();

      if (element) {
        const result = await parseActivityInfo(element);
        expect(Array.isArray(result.reference)).toBe(true);
        expect(result.reference).toHaveLength(0);
        expect(Array.isArray(result.quick_checks)).toBe(true);
        expect(result.quick_checks).toHaveLength(0);
      }
    });
  });

  describe('DOM interaction', () => {
    it('should find activity info element by class', async () => {
      const mockData = createMockActivityInfo();
      setupActivityInfoDOM(mockData);

      const element = await getActivityInfo();
      expect(element).toBeDefined();
      expect(element).toHaveClass('js-program-tutorial');
    });

    it('should read data from innerHTML', async () => {
      const mockData = createMockActivityInfo();
      setupActivityInfoDOM(mockData);

      const element = await getActivityInfo();
      expect(element).toBeDefined();

      if (element) {
        const result = await parseActivityInfo(element);
        expect(result.title).toBe('Test Activity');
      }
    });
  });
});
