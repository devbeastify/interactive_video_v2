// @ts-check

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Sequencer } from './sequencer.js';

describe('Sequencer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('creates sequencer with default state', () => {
      const sequencer = new Sequencer();

      expect(sequencer.screens).toEqual([]);
    });

    it('initializes with empty visibleScreens', () => {
      const sequencer = new Sequencer();

      expect(sequencer.visibleScreens).toEqual([]);
    });

    it('initializes with null currentScreen', () => {
      const sequencer = new Sequencer();

      expect(sequencer.currentScreen).toBeNull();
    });
  });

  describe('addScreen', () => {
    it('adds single screen', () => {
      const sequencer = new Sequencer();
      const screen = { id: 'intro', name: 'Introduction' };

      sequencer.addScreen(screen);

      expect(sequencer.screens).toHaveLength(1);
    });

    it('adds screen to visibleScreens', () => {
      const sequencer = new Sequencer();
      const screen = { id: 'intro', name: 'Introduction' };

      sequencer.addScreen(screen);

      expect(sequencer.visibleScreens).toHaveLength(1);
    });

    it('adds multiple screens', () => {
      const sequencer = new Sequencer();
      const screens = [
        { id: 'intro', name: 'Introduction' },
        { id: 'video', name: 'Video' },
        { id: 'quick_check', name: 'Quick Check' },
      ];

      sequencer.addScreen(screens);

      expect(sequencer.screens).toHaveLength(3);
    });

    it('adds multiple screens to visibleScreens', () => {
      const sequencer = new Sequencer();
      const screens = [
        { id: 'intro', name: 'Introduction' },
        { id: 'video', name: 'Video' },
        { id: 'quick_check', name: 'Quick Check' },
      ];

      sequencer.addScreen(screens);

      expect(sequencer.visibleScreens).toHaveLength(3);
    });

    it('adds screens incrementally', () => {
      const sequencer = new Sequencer();
      const screen1 = { id: 'intro', name: 'Introduction' };
      const screen2 = { id: 'video', name: 'Video' };

      sequencer.addScreen(screen1);
      sequencer.addScreen(screen2);

      expect(sequencer.screens).toHaveLength(2);
    });
  });

  describe('getCurrentScreenIndex', () => {
    it('returns -1 when no current screen', () => {
      const sequencer = new Sequencer();

      const index = sequencer.getCurrentScreenIndex();

      expect(index).toBe(-1);
    });

    it('returns correct index for current screen', () => {
      const sequencer = new Sequencer();
      const screens = [
        { id: 'intro', name: 'Introduction' },
        { id: 'video', name: 'Video' },
        { id: 'quick_check', name: 'Quick Check' },
      ];

      sequencer.addScreen(screens);
      sequencer.currentScreen = screens[1];

      const index = sequencer.getCurrentScreenIndex();

      expect(index).toBe(1);
    });

    it('returns -1 when current screen not in visible list', () => {
      const sequencer = new Sequencer();
      const screen = { id: 'intro', name: 'Introduction' };

      sequencer.currentScreen = screen;

      const index = sequencer.getCurrentScreenIndex();

      expect(index).toBe(-1);
    });
  });

  describe('goToScreen', () => {
    it('navigates to valid screen', () => {
      const sequencer = new Sequencer();
      const screens = [
        { id: 'intro', name: 'Introduction' },
        { id: 'video', name: 'Video' },
      ];

      sequencer.addScreen(screens);

      sequencer.goToScreen('video');

      expect(sequencer.currentScreen).toBe(screens[1]);
    });

    it('does not navigate to invalid screen', () => {
      const sequencer = new Sequencer();
      const screens = [
        { id: 'intro', name: 'Introduction' },
        { id: 'video', name: 'Video' },
      ];

      sequencer.addScreen(screens);
      sequencer.currentScreen = screens[0];

      sequencer.goToScreen('invalid');

      expect(sequencer.currentScreen).toBe(screens[0]);
    });

    it('handles empty screen ID', () => {
      const sequencer = new Sequencer();
      const screens = [
        { id: 'intro', name: 'Introduction' },
        { id: 'video', name: 'Video' },
      ];

      sequencer.addScreen(screens);
      sequencer.currentScreen = screens[0];

      sequencer.goToScreen('');

      expect(sequencer.currentScreen).toBe(screens[0]);
    });
  });

  describe('goToNextScreen', () => {
    it('moves to next screen when available', () => {
      const sequencer = new Sequencer();
      const screens = [
        { id: 'intro', name: 'Introduction' },
        { id: 'video', name: 'Video' },
        { id: 'quick_check', name: 'Quick Check' },
      ];

      sequencer.addScreen(screens);
      sequencer.currentScreen = screens[0];

      sequencer.goToNextScreen();

      expect(sequencer.currentScreen).toBe(screens[1]);
    });

    it('does not move when at last screen', () => {
      const sequencer = new Sequencer();
      const screens = [
        { id: 'intro', name: 'Introduction' },
        { id: 'video', name: 'Video' },
      ];

      sequencer.addScreen(screens);
      sequencer.currentScreen = screens[1];

      sequencer.goToNextScreen();

      expect(sequencer.currentScreen).toBe(screens[1]);
    });

    it('does not move when no current screen', () => {
      const sequencer = new Sequencer();
      const screens = [
        { id: 'intro', name: 'Introduction' },
        { id: 'video', name: 'Video' },
      ];

      sequencer.addScreen(screens);

      sequencer.goToNextScreen();

      expect(sequencer.currentScreen).toBeNull();
    });
  });

  describe('helper methods', () => {
    it('currentScreenExists returns true when screen is set', () => {
      const sequencer = new Sequencer();
      const screen = { id: 'intro', name: 'Introduction' };

      sequencer.currentScreen = screen;

      expect(sequencer.currentScreenExists()).toBe(true);
    });

    it('screenInVisibleList returns true for valid index', () => {
      const sequencer = new Sequencer();
      const screens = [
        { id: 'intro', name: 'Introduction' },
        { id: 'video', name: 'Video' },
      ];

      sequencer.addScreen(screens);
      sequencer.currentScreen = screens[0];

      expect(sequencer.screenInVisibleList(sequencer.getCurrentScreenIndex())).toBe(true);
    });

    it('screenInVisibleList returns false for invalid index', () => {
      const sequencer = new Sequencer();
      const screens = [
        { id: 'intro', name: 'Introduction' },
        { id: 'video', name: 'Video' },
      ];

      sequencer.addScreen(screens);
      sequencer.currentScreen = screens[0];

      expect(sequencer.screenInVisibleList(-1)).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('handles empty screens array', () => {
      const sequencer = new Sequencer();

      sequencer.addScreen([]);

      expect(sequencer.screens).toEqual([]);
    });

    it('handles empty screens array in visibleScreens', () => {
      const sequencer = new Sequencer();

      sequencer.addScreen([]);

      expect(sequencer.visibleScreens).toEqual([]);
    });

    it('handles duplicate screen IDs', () => {
      const sequencer = new Sequencer();
      const screens = [
        { id: 'intro', name: 'Introduction' },
        { id: 'intro', name: 'Introduction 2' },
      ];

      sequencer.addScreen(screens);

      expect(sequencer.screens).toHaveLength(2);
    });

    it('handles screens with missing properties', () => {
      const sequencer = new Sequencer();
      const screen = { id: 'intro', name: 'Introduction' };

      sequencer.addScreen(screen);

      expect(sequencer.screens).toHaveLength(1);
    });
  });

  describe('screen navigation flow', () => {
    it('navigates through all screens in sequence', () => {
      const sequencer = new Sequencer();
      const screens = [
        { id: 'intro', name: 'Introduction' },
        { id: 'video', name: 'Video' },
        { id: 'quick_check', name: 'Quick Check' },
        { id: 'diagnostic', name: 'Diagnostic' },
      ];

      sequencer.addScreen(screens);
      sequencer.currentScreen = screens[0];

      expect(sequencer.currentScreen).toBe(screens[0]);

      sequencer.goToNextScreen();
      expect(sequencer.currentScreen).toBe(screens[1]);

      sequencer.goToNextScreen();
      expect(sequencer.currentScreen).toBe(screens[2]);

      sequencer.goToNextScreen();
      expect(sequencer.currentScreen).toBe(screens[3]);

      sequencer.goToNextScreen();
      expect(sequencer.currentScreen).toBe(screens[3]);
    });

    it('jumps to specific screen', () => {
      const sequencer = new Sequencer();
      const screens = [
        { id: 'intro', name: 'Introduction' },
        { id: 'video', name: 'Video' },
        { id: 'quick_check', name: 'Quick Check' },
      ];

      sequencer.addScreen(screens);
      sequencer.currentScreen = screens[0];

      sequencer.goToScreen('quick_check');

      expect(sequencer.currentScreen).toBe(screens[2]);
    });
  });
});