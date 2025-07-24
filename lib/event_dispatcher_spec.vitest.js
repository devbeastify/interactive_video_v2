// @ts-check

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventDispatcher, DL_EVENTS } from './event_dispatcher';

describe('EventDispatcher', () => {
  /** @type {EventDispatcher} */
  let eventDispatcher;

  beforeEach(() => {
    eventDispatcher = new EventDispatcher();
  });

  describe('on', () => {
    it('adds event listener', () => {
      const callback = vi.fn();
      const event = 'test:event';

      eventDispatcher.on(event, callback);

      expect(eventDispatcher.listeners.has(event)).toBe(true);
    });

    it('adds callback to event listeners', () => {
      const callback = vi.fn();
      const event = 'test:event';

      eventDispatcher.on(event, callback);

      expect(eventDispatcher.listeners.get(event)).toContain(callback);
    });

    it('adds multiple listeners to same event', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const event = 'test:event';

      eventDispatcher.on(event, callback1);
      eventDispatcher.on(event, callback2);

      expect(eventDispatcher.listeners.get(event)).toHaveLength(2);
    });

    it('handles duplicate listener registration', () => {
      const callback = vi.fn();
      const event = 'test:event';

      eventDispatcher.on(event, callback);
      eventDispatcher.on(event, callback);

      expect(eventDispatcher.listeners.get(event)).toHaveLength(2);
    });
  });

  describe('off', () => {
    it('removes specific listener', () => {
      const callback = vi.fn();
      const event = 'test:event';

      eventDispatcher.on(event, callback);
      eventDispatcher.off(event, callback);

      expect(eventDispatcher.listeners.get(event)).toHaveLength(0);
    });

    it('removes only specified listener', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const event = 'test:event';

      eventDispatcher.on(event, callback1);
      eventDispatcher.on(event, callback2);
      eventDispatcher.off(event, callback1);

      expect(eventDispatcher.listeners.get(event)).toHaveLength(1);
    });

    it('handles removing non-existent listener', () => {
      const callback = vi.fn();
      const event = 'test:event';

      eventDispatcher.off(event, callback);

      expect(eventDispatcher.listeners.has(event)).toBe(false);
    });

    it('handles removing from non-existent event', () => {
      const callback = vi.fn();
      const event = 'nonexistent:event';

      eventDispatcher.off(event, callback);

      expect(eventDispatcher.listeners.has(event)).toBe(false);
    });
  });

  describe('dispatch', () => {
    it('calls registered listeners', () => {
      const callback = vi.fn();
      const event = 'test:event';
      const data = { message: 'test' };

      eventDispatcher.on(event, callback);
      eventDispatcher.dispatch(event, data);

      expect(callback).toHaveBeenCalledWith(data);
    });

    it('calls multiple listeners', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const event = 'test:event';
      const data = { message: 'test' };

      eventDispatcher.on(event, callback1);
      eventDispatcher.on(event, callback2);
      eventDispatcher.dispatch(event, data);

      expect(callback1).toHaveBeenCalledWith(data);
    });

    it('calls second listener', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const event = 'test:event';
      const data = { message: 'test' };

      eventDispatcher.on(event, callback1);
      eventDispatcher.on(event, callback2);
      eventDispatcher.dispatch(event, data);

      expect(callback2).toHaveBeenCalledWith(data);
    });

    it('handles dispatch without data', () => {
      const callback = vi.fn();
      const event = 'test:event';

      eventDispatcher.on(event, callback);
      eventDispatcher.dispatch(event);

      expect(callback).toHaveBeenCalledWith(null);
    });

    it('handles dispatch to non-existent event gracefully', () => {
      const event = 'nonexistent:event';

      expect(() => {
        eventDispatcher.dispatch(event);
      }).not.toThrow();
    });

    it('handles callback errors gracefully', () => {
      const errorCallback = vi.fn(() => {
        throw new Error('Test error');
      });
      const normalCallback = vi.fn();
      const event = 'test:event';
      const data = { message: 'test data' };

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      eventDispatcher.on(event, errorCallback);
      eventDispatcher.on(event, normalCallback);
      eventDispatcher.dispatch(event, data);

      expect(errorCallback).toHaveBeenCalledWith(data);
      expect(normalCallback).toHaveBeenCalledWith(data);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error in event listener for test:event:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('clears all listeners', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      eventDispatcher.on('event1', callback1);
      eventDispatcher.on('event2', callback2);

      expect(eventDispatcher.listeners.size).toBe(2);

      eventDispatcher.clear();

      expect(eventDispatcher.listeners.size).toBe(0);
    });
  });

  describe('DL_EVENTS', () => {
    it('exports COMPLETED event constant', () => {
      expect(DL_EVENTS.COMPLETED).toBe('dl:completed');
    });

    it('exports ERROR event constant', () => {
      expect(DL_EVENTS.ERROR).toBe('dl:error');
    });

    it('exports PAUSE event constant', () => {
      expect(DL_EVENTS.PAUSE).toBe('dl:pause');
    });

    it('exports PAUSED event constant', () => {
      expect(DL_EVENTS.PAUSED).toBe('dl:paused');
    });

    it('exports PLAY event constant', () => {
      expect(DL_EVENTS.PLAY).toBe('dl:play');
    });

    it('exports STARTED event constant', () => {
      expect(DL_EVENTS.STARTED).toBe('dl:started');
    });

    it('has correct event names format', () => {
      Object.values(DL_EVENTS).forEach((eventName) => {
        expect(eventName).toMatch(/^dl:/);
      });
    });
  });

  describe('event lifecycle', () => {
    it('handles complete event lifecycle', () => {
      const callback = vi.fn();
      const event = 'test:event';
      const data = { message: 'test' };

      eventDispatcher.on(event, callback);
      eventDispatcher.dispatch(event, data);
      eventDispatcher.off(event, callback);

      expect(callback).toHaveBeenCalledWith(data);
      expect(eventDispatcher.listeners.get(event)).toHaveLength(0);
    });

    it('handles multiple event types', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const event1 = 'event1';
      const event2 = 'event2';

      eventDispatcher.on(event1, callback1);
      eventDispatcher.on(event2, callback2);

      eventDispatcher.dispatch(event1, 'data1');
      eventDispatcher.dispatch(event2, 'data2');

      expect(callback1).toHaveBeenCalledWith('data1');
      expect(callback2).toHaveBeenCalledWith('data2');
    });
  });
});