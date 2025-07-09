// @ts-check

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { browserIsSafari } from './safari_browser_check';

describe('safari_browser_check', () => {
  /** @type {string} */
  let originalUserAgent;

  beforeEach(() => {
    originalUserAgent = navigator.userAgent;
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'userAgent', {
      value: originalUserAgent,
      writable: true,
    });
  });

  describe('browserIsSafari', () => {
    it('should return true for Safari on macOS', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 ' +
          '(KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
        writable: true,
      });

      expect(browserIsSafari()).toBe(true);
    });

    it('should return true for Safari on iOS', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 ' +
          '(KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
        writable: true,
      });

      expect(browserIsSafari()).toBe(true);
    });

    it('should return false for Chrome on macOS', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        writable: true,
      });

      expect(browserIsSafari()).toBe(false);
    });

    it('should return false for Firefox on macOS', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:89.0) Gecko/20100101 Firefox/89.0',
        writable: true,
      });

      expect(browserIsSafari()).toBe(false);
    });

    it('should return false for Edge on Windows', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59',
        writable: true,
      });

      expect(browserIsSafari()).toBe(false);
    });
  });
});
